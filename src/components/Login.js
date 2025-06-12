import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
        setError('');
        await login(emailRef.current.value, passwordRef.current.value);
        navigate('/');
        } catch {
        setError('Error en iniciar sessió');
        }
    }

    return (
    <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            <input className="input-field" type="email" ref={emailRef} required placeholder="Email" />
            <input className="input-field" type="password" ref={passwordRef} required placeholder="Password" />
            <button className="submit-button" type="submit">Iniciar sessió</button>
        </form>
    </div>
);
}