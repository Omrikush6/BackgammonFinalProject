import React, { useEffect, useState } from 'react';
import './Login.css';

function Login() {
    const [username, setUserName] = useState(''); // State for name input
    const [email, setEmail] = useState(''); // State for email input
    const [password, setPassword] = useState(''); // State for password input
    const [isSignIn, setIsSignIn] = useState(true); // State to toggle between sign-in and sign-up

    useEffect(() => {
        const signUpButton = document.getElementById('signUp');
        const signInButton = document.getElementById('signIn');
        const container = document.getElementById('container');

        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
            setIsSignIn(false); // Set to sign-up mode
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
            setIsSignIn(true); // Set to sign-in mode
        });

        return () => {
            signUpButton.removeEventListener('click', () => { });
            signInButton.removeEventListener('click', () => { });
        };
    }, []);

    const handleSignUp = async (e) => { // Handle sign-up form submission
        e.preventDefault();
        try {
            const response = await fetch('https://localhost:7027/api/Auth/signup', { // Change the URL to match your API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }) // Send name, email, and password to the API
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Sign Up Success:', data);
                // Optionally, redirect to login or home page
            } else {
                console.error('Sign Up Failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during Sign Up:', error);
        }
    };

    const handleLognIn = async (e) => { // Handle sign-in form submission
        e.preventDefault();
        const emailInput = e.target.email.value; // Get email input from the form
        const passwordInput = e.target.password.value; // Get password input from the form

        try {
            const response = await fetch('https://localhost:7027/api/Auth/login', { // Change the URL to match your API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: emailInput, password: passwordInput }) // Send email and password to the API
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Sign In Success:', data);
                // Optionally, save token and redirect to home page
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
                        <input type="email" name="email" placeholder="Email" required /> {/* Added name attribute for email */}
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
