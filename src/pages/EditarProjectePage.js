import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

export default function EditarProjectePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [participants, setParticipants] = useState([]);
  const [usuaris, setUsuaris] = useState([]);

  useEffect(() => {
    const carregarProjecte = async () => {
      const docRef = doc(db, 'projects', projectId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setNom(data.nom);
        setParticipants(data.participants || []);
      }

      const usuarisSnap = await getDocs(collection(db, 'usuaris'));
      const tots = usuarisSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setUsuaris(tots);
    };

    carregarProjecte();
  }, [projectId]);

  const toggleParticipant = (uid) => {
    setParticipants(prev =>
      prev.includes(uid)
        ? prev.filter(p => p !== uid)
        : [...prev, uid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ref = doc(db, 'projects', projectId);
    await updateDoc(ref, {
      nom,
      participants,
    });
    navigate('/');
  };

return (
    <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
            <h1 className="form-title">Edita projecte</h1>
            <div className="form-group">
                <label className="form-label">
                    Nom del projecte:
                    <input
                        type="text"
                        className="form-control"
                        value={nom}
                        onChange={e => setNom(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div className="form-group">
  <strong>Participants:</strong>
  {usuaris.map(u => (
    <label
      key={u.uid}
      className="form-label"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        fontWeight: 'normal',
      }}
    >
      <input
        type="checkbox"
        checked={participants.includes(u.uid)}
        onChange={() => toggleParticipant(u.uid)}
        style={{ margin: 0 }}
      />
      {u.name}
    </label>
  ))}
</div>

            <button type="submit" className="submit-button">Actualitzar</button>
        </form>
    </div>
);
}
