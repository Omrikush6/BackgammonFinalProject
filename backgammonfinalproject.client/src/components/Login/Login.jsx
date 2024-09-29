import React, { useEffect, useState } from 'react';
import './Login.css';

function Login() {
    const [name, setName] = useState('');
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
            signUpButton.removeEventListener('click', () => {});
            signInButton.removeEventListener('click', () => {});
        };
    }, []); 

    const handleSignUp = (e) => {
        e.preventDefault();
        console.log({ name, email, password });
    };



    return (
        <>
            <div className="container" id="container">
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignUp}>
                        <h1>Create Account!!!!!</h1>
                       
                        <span>or use your email for registration</span>
                        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in-container">
                    <form>
                        <h1>Sign in</h1>
                      
                        <span>or use your account</span>
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <a href="#">Forgot your password?</a>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost" id="signIn" >Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Let's play!</h1>
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