import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore'; // elimina 'doc'
import EliminarUsuari from './EliminarUsuari';
import './TaulaUsuaris.css';
import EditarUsuari from './EditarUsuari';

const TaulaUsuaris = () => {
    const [usuaris, setUsuaris] = useState([]);
    const db = getFirestore();
    const [usuariEditant, setUsuariEditant] = useState(null);

    useEffect(() => {
        const fetchUsuaris = async () => {
            const usuarisCollection = collection(db, 'usuaris');
            const usuarisSnapshot = await getDocs(usuarisCollection);
            const usuarisList = usuarisSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsuaris(usuarisList);
        };

        fetchUsuaris();
    }, [db]);

    return (
        <div>
            <table className="table table-striped table-hover table-bordered">
                <thead className="table-primary">
                    <tr>
                        <th>#</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Tipus</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {usuaris.map((usuari, index) => (
                        <tr key={usuari.id}>
                            {usuariEditant?.id === usuari.id ? (
                                <td colSpan={5}>
                                    <EditarUsuari
                                        usuari={usuari}
                                        onCancel={() => setUsuariEditant(null)}
                                        onSaved={() => {
                                            setUsuariEditant(null);
                                            // refresca la llista
                                            const fetchUsuaris = async () => {
                                                const usuarisCollection = collection(db, 'usuaris');
                                                const usuarisSnapshot = await getDocs(usuarisCollection);
                                                const usuarisList = usuarisSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                                                setUsuaris(usuarisList);
                                            };
                                            fetchUsuaris();
                                        }}
                                    />
                                </td>
                            ) : (
                                <>
                                    <td>{index + 1}</td> {/* correcció: era 'itdex', ha de ser 'index' */}
                                    <td><b>{usuari.name}</b></td>
                                    <td>{usuari.email}</td>
                                    <td>{usuari.manual ? 'Participant' : 'Usuari'}</td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm me-1" onClick={() => setUsuariEditant(usuari)}>
                                            Edita
                                        </button>&nbsp;&nbsp;&nbsp;
                                        <EliminarUsuari userId={usuari.id} />
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TaulaUsuaris;
