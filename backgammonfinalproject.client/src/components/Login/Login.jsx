import React, { useEffect, useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';


function Login() {
    const navigate = useNavigate();
    const [username, setUserName] = useState(''); 
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    

    useEffect(() => {
        const signUpButton = document.getElementById('signUp');
        const signInButton = document.getElementById('signIn');
        const container = document.getElementById('container');

        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
           
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
            
        });

        return () => {
            signUpButton.removeEventListener('click', () => { });
            signInButton.removeEventListener('click', () => { });
        };
    }, []);

    const handleSignUp = async (e) => { 
        e.preventDefault();
        try {
            const response = await fetch('https://localhost:7027/api/Auth/signup', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }) 
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Sign Up Success:', data);
                
            } else {
                console.error('Sign Up Failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during Sign Up:', error);
        }
    };

    const handleLognIn = async (e) => { 
        e.preventDefault();

        const usernameInput = e.target.username.value; 
        const passwordInput = e.target.password.value; 

        try {
            const response = await fetch('https://localhost:7027/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Sign In Success:', data);
                navigate('/lobby');
                
            } else {
                console.error('Sign In Failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during Sign In:', error);
        }
    };

    return (
        <>
            <div className="container" id="container">
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignUp}> {/* Call handleSignUp on form submission */}
                        <h1>Create Account!</h1>
                        <span>or use your email for registration</span>
                        <input type="text" placeholder="Name" value={username} onChange={(e) => setUserName(e.target.value)} />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLognIn}> {/* Call handleSignIn on form submission */}
                        <h1>Sign in</h1>
                        <span>or use your account</span>
                        <input type="text" name="username" placeholder="username" required /> {/* Added name attribute for email */}
                        <input type="password" name="password" placeholder="Password" required /> {/* Added name attribute for password */}
                        <a href="#">Forgot your password?</a>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost" id="signIn">Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Lets`s play!</h1>
                            <p>Enter your personal details and start your journey with us</p>
                            <button className="ghost" id="signUp">Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
