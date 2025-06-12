import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebase';
import {
    doc,
    getDoc,
    collection,
    getDocs,
    deleteDoc,
    onSnapshot,
} from 'firebase/firestore';
import DespesaForm from '../components/DespesaForm';
import Footer from '../components/Footer';

export default function ProjectePage() {
    const [editantDespesa, setEditantDespesa] = useState(null);
    const { projectId } = useParams();
    const [projecte, setProjecte] = useState(null);
    const [despeses, setDespeses] = useState([]);
    const [usuaris, setUsuaris] = useState([]);

    // Carrega dades del projecte i tots els usuaris
    useEffect(() => {
        const fetchData = async () => {
            // Obtenir projecte
            const docRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return;
            const dadesProjecte = docSnap.data();
            setProjecte({ id: docSnap.id, ...dadesProjecte });

            // Obtenir tots els usuaris
            const usuarisSnap = await getDocs(collection(db, 'usuaris'));
            const tots = usuarisSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            setUsuaris(tots);
        };

        fetchData();
    }, [projectId]);

    // Escolta despeses
    useEffect(() => {
        const despesesRef = collection(db, 'projects', projectId, 'despeses');
        const unsubscribe = onSnapshot(despesesRef, (snapshot) => {
            const dades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDespeses(dades);
        });

        return () => unsubscribe();
    }, [projectId]);

    const eliminarDespesa = async (id) => {
        await deleteDoc(doc(db, 'projects', projectId, 'despeses', id));
    };

    if (!projecte) return <p>Carregant projecte...</p>;

    // Convertim uids a noms per mostrar correctament
    const nomUsuari = (uid) => {
        const usuari = usuaris.find(u => u.uid === uid);
        return usuari ? usuari.name : '';
    };

    return (
        <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <center>
                <h2 className="mt-5">Llista de despeses</h2>
            </center>
            {despeses.length === 0 && <p className="text-center mt-3">No hi ha despeses encara.</p>}
            {despeses.length > 0 && (
                <div className="table-responsive mt-3">
                    <table className="table table-bordered table-striped">
                        <thead className="thead-dark">
                            <tr>
                                <th>Concepte</th>
                                <th>Quantia</th>
                                <th>Pagat per</th>
                                <th>Participants</th>
                                <th>Accions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {despeses.map(d => (
                                <tr key={d.id}>
                                    <td>{d.concepte}</td>
                                    <td>{parseFloat(d.quantia).toFixed(2)}</td>
                                    <td>{nomUsuari(d.pagatPer)}</td>
                                    <td>
                                        {d.divideix.map(uid => {
                                            const nom = nomUsuari(uid);
                                            const quantitatPerPersona = (d.quantia / d.divideix.length).toFixed(2);
                                            return (
                                                <span key={uid}>
                                                    {nom} ({quantitatPerPersona} €)<br />
                                                </span>
                                            );
                                        })}
                                    </td>
                                    <td>
                                        <center>
                                            <button
                                                className="btn btn-secondary btn-sm me-1"
                                                onClick={() => setEditantDespesa(d)}
                                            >
                                                Edita
                                            </button>&nbsp;&nbsp;&nbsp;
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => eliminarDespesa(d.id)}
                                            >
                                                Elimina
                                            </button>
                                        </center>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <center>
                <h1 className="mb-4">Projecte: {projecte.nom}</h1>
                <h2>{editantDespesa ? 'Actualitza despesa' : 'Nova despesa'}</h2>
            </center>
            <DespesaForm
                projectId={projectId}
                participants={usuaris}
                onSaved={() => setEditantDespesa(null)}
                initialData={editantDespesa}
                editId={editantDespesa?.id}
            />
            <div style={{ height: '100px' }}></div>
            <Footer />           
        </div>
    );
}
