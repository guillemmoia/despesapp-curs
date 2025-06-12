import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './NavBar.css';
import './Register.css';

export default function NavBar() {
    const { currentUser, logout } = useAuth();
    const [nomUsuari, setNomUsuari] = useState('');

    useEffect(() => {
        const fetchNomUsuari = async () => {
            if (currentUser) {
                const db = getFirestore();
                const usuariRef = doc(db, 'usuaris', currentUser.uid);
                const usuariSnap = await getDoc(usuariRef);
                if (usuariSnap.exists()) {
                    setNomUsuari(usuariSnap.data().name);
                }
            }
        };
        fetchNomUsuari();
    }, [currentUser]);

    async function handleLogout() {
        try {
            await logout();
        } catch {
            console.error('Error logout');
        }
    }

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-link">Home</Link>
            {!currentUser ? (
                <>
                    
                    <Link to="/register" className="navbar-link">Register</Link>
                    <Link to="/login" className="navbar-link">Login</Link>
                </>
            ) : (
                <>
                    <Link to="/meus-projectes" className="navbar-link">Projectes</Link>
                    <Link to="/crear-projecte" className="navbar-link">Nou projecte</Link>
                    <Link to="/usuaris" className="navbar-link">Usuaris</Link>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                    <span className="navbar-username">Hola, <b>{nomUsuari || currentUser.email}</b></span>
                </>
            )}
        </nav>
    );
}
