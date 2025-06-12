// src/pages/MeusProjectesPage.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../index.css'; // Assuming you have some styles in index.css
import Footer from '../components/Footer';

export default function MeusProjectesPage() {
    const { currentUser } = useAuth();
    const [projectes, setProjectes] = useState([]);

    useEffect(() => {
        const carregarProjectes = async () => {
        const q = query(
            collection(db, 'projects'),
            where('participants', 'array-contains', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        setProjectes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        carregarProjectes();
    }, [currentUser]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <center><h1>Els meus projectes</h1></center>
            {projectes.length === 0 ? (
                <p>No tens cap projecte.</p>
            ) : (
                <ul className="list-group" style={{ width: '90%' }}>
                    {projectes.map((p) => (
                        <li key={p.id} className="list-group-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link to={`/projecte/${p.id}`}>{p.nom}</Link>
                            <button
                                onClick={async () => {
                                    const confirmat = window.confirm(`Segur que vols eliminar el projecte "${p.nom}"?`);
                                    if (!confirmat) return;

                                    try {
                                    const projectRef = doc(db, 'projects', p.id);
                                    await deleteDoc(projectRef);
                                    setProjectes((prev) => prev.filter((proj) => proj.id !== p.id));
                                    } catch (error) {
                                    console.error('Error eliminant el projecte:', error);
                                    alert('Hi ha hagut un error en eliminar el projecte.');
                                    }
                                }}
                                style={{
                                    marginLeft: '10px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    cursor: 'pointer'
                                }}
                                >
                                Elimina
                                </button>

                        </li>
                    ))}
                </ul>
            )}
            <Footer />
        </div>
    );
}
