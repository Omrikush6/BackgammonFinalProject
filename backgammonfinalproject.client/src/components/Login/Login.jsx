import React, { useState, useEffect, useContext } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App';

function Login() {
    const navigate = useNavigate();
    const {login} = useContext(UserContext)
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const signUpButton = document.getElementById('signUp');
        const signInButton = document.getElementById('signIn');
        const container = document.getElementById('container');

        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
            setIsSignUp(true);
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
            setIsSignUp(false);
        });

        return () => {
            signUpButton.removeEventListener('click', () => {});
            signInButton.removeEventListener('click', () => {});
        };
    }, []);

    const togglePasswordVisibility = (toggle) => {
        setShowPassword(toggle);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const url = isSignUp 
            ? 'https://localhost:7027/api/Auth/signup'
            : 'https://localhost:7027/api/Auth/login';

        const body = isSignUp
            ? JSON.stringify({ username, email, password })
            : JSON.stringify({ username, password });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body
            });

            if (response.ok) {
                const data = await response.json();
                console.log(isSignUp ? 'Sign Up Success:' : 'Sign In Success:', data);
                login(data.token)
                navigate('/lobby')
            } else {
                const errorData = await response.json();
                setError(errorData.message || `${isSignUp ? 'Sign Up' : 'Sign In'} Failed. Please try again.`);
            }
        } catch (error) {
            console.error(`Error during ${isSignUp ? 'Sign Up' : 'Sign In'}:`, error);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <>
            <div className="container" id="container">
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSubmit}>
                        <h1>Create Account!</h1>
                        <span>or use your email for registration</span>
                        <input type="text" placeholder="Name" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <div className="password-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}/>
                            <button
                                type="button"
                                className="show-password-button"
                                onMouseDown={() => togglePasswordVisibility(true)}
                                onMouseUp={() => togglePasswordVisibility(false)}
                                onMouseLeave={() => togglePasswordVisibility(false)}
                            >
                                👁️
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in-container">
                    <form onSubmit={handleSubmit}>
                        <h1>Sign in</h1>
                        <span>or use your account</span>
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <div className="password-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required/>
                            <button
                                type="button"
                                className="show-password-button"
                                onMouseDown={() => togglePasswordVisibility(true)}
                                onMouseUp={() => togglePasswordVisibility(false)}
                                onMouseLeave={() => togglePasswordVisibility(false)}
                            >
                                👁️
                            </button>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <a href="#">Forgot your password?</a>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                        <h1>Hello, Let&#39;s play!</h1>
                        <p>Enter your personal details and start your journey with us</p>
                        <a>Already have an account? 👇 click below to sign in</a>
                            <button className="ghost" id="signIn">Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <a>Don&#39;t have an account yet? 👇 click here to create one!</a>
                        
                            <button className="ghost" id="signUp">Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;