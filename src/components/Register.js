import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { db } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (passwordRef.current.value !== confirmPasswordRef.current.value) {
            return setError('Les contrasenyes no coincideixen');
        }
        try {
            setError('');
            const userCredential = await signup(emailRef.current.value, passwordRef.current.value);
            const userId = userCredential.user.uid;

            // Add or overwrite user in Firestore
            await setDoc(doc(db, 'usuaris', userId), {
                name: nameRef.current.value,
                email: emailRef.current.value,
            }, { merge: true }); // Use merge to allow overwriting or reusing deleted user data

            navigate('/');
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                setError("Aquest email ja està registrat.");
            } else if (error.code === "auth/invalid-email") {
                setError("Email no vàlid.");   
            } else {
                setError("Error en crear el compte");
            }
            console.error(error);
        }
    }

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                <input className="input-field" type="text" ref={nameRef} required placeholder="Nom" />
                <input className="input-field" type="email" ref={emailRef} required placeholder="Email" />
                <input className="input-field" type="password" ref={passwordRef} required placeholder="Contrasenya" />
                <input className="input-field" type="password" ref={confirmPasswordRef} required placeholder="Confirmar Contrasenya" />
                <button className="submit-button" type="submit">Registrar</button>
            </form>
        </div>
    );
}