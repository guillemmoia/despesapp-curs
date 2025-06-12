import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import {
    collection,
    getDocs,
    doc,
    deleteDoc
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function HomePage() {
    const [projects, setProjects] = useState([]);

    const fetchProjects = async () => {
        const snap = await getDocs(collection(db, 'projects'));
        const arr = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setProjects(arr);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const eliminarProjecte = async (projectId) => {
        const confirmat = window.confirm('Segur que vols eliminar aquest projecte?');
        if (!confirmat) return;

        // Elimina totes les despeses relacionades
        const despesesSnap = await getDocs(collection(db, 'projects', projectId, 'despeses'));
        for (const despesaDoc of despesesSnap.docs) {
            await deleteDoc(despesaDoc.ref);
        }

        // Elimina el projecte
        await deleteDoc(doc(db, 'projects', projectId));
        fetchProjects(); // Refresca la llista
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <center>
                <h1>Benvinguts a la pàgina d'inici</h1>
                <p>Només els usuaris autenticats poden veure'n el contingut.</p>
            </center>
            <hr />
            <center><h1>Els meus projectes</h1></center>
            {projects.length === 0 ? (
                <p>No tens cap projecte.</p>
            ) : (
                <table className="table table-striped table-hover table-bordered" style={{ width: '90%', marginTop: '1rem' }}>
                <thead className="table-primary">
                    <tr>
                    <th>Nom del projecte</th>
                    <th style={{ width: '200px' }}>Accions</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((p) => (
                    <tr key={p.id}>
                        <td>
                        <Link to={`/projecte/${p.id}`} style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                            {p.nom}
                        </Link>
                        </td>
                        <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link
                            to={`/editar-projecte/${p.id}`}
                            className="btn btn-secondary btn-sm"
                            >
                            Edita
                            </Link>
                            <button
                            className="btn btn-danger btn-sm"
                            onClick={() => eliminarProjecte(p.id)}
                            >
                            Elimina
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                            )}
                <Footer />
        </div>
    );
}
