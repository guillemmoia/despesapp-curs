import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function CrearProjectePage() {
  const { currentUser } = useAuth();
  const [nom, setNom] = useState('');
  const [usuaris, setUsuaris] = useState([]);
  const [participants, setParticipants] = useState([]);
  const navigate = useNavigate();

  // Carrega tots els usuaris de la base de dades
  useEffect(() => {
    const carregarUsuaris = async () => {
      const snapshot = await getDocs(collection(db, 'usuaris'));
      const usuarisList = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      }));

      setUsuaris(usuarisList);

      // Afegeix l’usuari actual com a participant per defecte
      setParticipants([currentUser.uid]);
    };

    carregarUsuaris();
  }, [currentUser]);

  // Afegeix o elimina un participant
  const toggleParticipant = (uid) => {
    if (uid === currentUser.uid) return; // no permet desmarcar-se a si mateix
    setParticipants(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const docRef = await addDoc(collection(db, 'projects'), {
      nom,
      creatPer: currentUser.uid,
      createdAt: serverTimestamp(),
      participants: participants,
    });

    navigate(`/projecte/${docRef.id}`);
  };

return (
    <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
            <h1 className="form-title">Crear Projecte</h1>
            <div className="form-group">
                <label className="form-label">
                    Nom del projecte:
                    <input
                        type="text"
                        className="form-control"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required
                    />
                </label>
            </div>

            <div className="form-group">
                <strong>Participants:</strong>
                <div style={{ marginLeft: '1rem' }}>
                    {usuaris.map((usuari) => (
                        <label key={usuari.uid} style={{ display: 'block' }}>
                            <input
                                type="checkbox"
                                className="input-field"
                                checked={participants.includes(usuari.uid)}
                                disabled={usuari.uid === currentUser.uid}
                                onChange={() => toggleParticipant(usuari.uid)}
                            />
                            {usuari.name} {usuari.uid === currentUser.uid && '(Tu)'}
                        </label>
                    ))}
                </div>
            </div>

            <button type="submit" className="submit-button">
                Crear projecte
            </button>
        </form>
        <Footer />
    </div>
);
}
