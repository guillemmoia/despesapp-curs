import React from 'react';
import PropTypes from 'prop-types';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const EliminarUsuari = ({ userId }) => {
    const eliminarUsuari = async () => {
        try {
            const db = getFirestore();
            const userRef = doc(db, 'usuaris', userId); // Identificador únic de Firebase
            await deleteDoc(userRef);

            // Eliminar l'usuari de l'autenticació de Firebase
            const auth = getAuth();
            const user = auth.currentUser;
            if (user && user.uid === userId) {
                await user.delete();
            }

            alert('Usuari eliminat correctament!');
            window.location.reload(); // Recarrega la pàgina per actualitzar la taula
        } catch (error) {
            console.error('Error eliminant l\'usuari:', error);
            alert('Hi ha hagut un error eliminant l\'usuari.');
        }
    };

    return (
        <button
            className="btn btn-danger"
            onClick={() => {
                if (window.confirm('Estàs segur que vols eliminar aquest usuari?')) {
                    eliminarUsuari();
                }
            }}
        >
            Eliminar
        </button>
    );
};
EliminarUsuari.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default EliminarUsuari;