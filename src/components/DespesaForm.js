import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

export default function DespesaForm({ projectId, onSaved, initialData = null, editId = null }) {
  const { currentUser } = useAuth();

  const [fields, set] = useState({
    concepte: '',
    quantia: '',
    pagatPer: '',
    divideix: [],
  });
  const [totsSeleccionats, setTotsSeleccionats] = useState(true);
  const [participantsList, setParticipantsList] = useState([]); // to display in form
  const [nouParticipantNom, setNouParticipantNom] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      // Determine uids: if editing an existing expense, use its divideix array;
      // otherwise use project participants
      let uids = [];
      if (initialData) {
        uids = initialData.divideix;
      } else {
        // fetch project participants from project document
        const projSnap = await getDoc(doc(db, 'projects', projectId));
        const projData = projSnap.exists() ? projSnap.data() : {};
        uids = projData.participants || [];
      }
      // fetch user details for each uid
      const snaps = await Promise.all(
        uids.map(uid => getDoc(doc(db, 'usuaris', uid)))
      );
      const users = snaps
        .filter(snap => snap.exists())
        .map(snap => ({ uid: snap.id, ...snap.data() }));
      setParticipantsList(users);

      // Initialize form fields
      if (initialData) {
        set({
          concepte: initialData.concepte,
          quantia: initialData.quantia,
          pagatPer: initialData.pagatPer,
          divideix: initialData.divideix,
        });
        setTotsSeleccionats(initialData.divideix.length === users.length);
      } else {
        set({
          concepte: '',
          quantia: '',
          pagatPer: currentUser.uid,
          divideix: users.map(u => u.uid),
        });
        setTotsSeleccionats(true);
      }
    };
    fetchParticipants();
  }, [initialData, currentUser, projectId]);

  const handleChange = e =>
    set(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggle = uid =>
    set(f => ({
      ...f,
      divideix: f.divideix.includes(uid)
        ? f.divideix.filter(x => x !== uid)
        : [...f.divideix, uid],
    }));

  const toggleTots = () => {
    const uids = participantsList.map(p => p.uid);
    set(f => ({
      ...f,
      divideix: totsSeleccionats ? [] : uids,
    }));
    setTotsSeleccionats(!totsSeleccionats);
  };

  const afegirParticipant = async () => {
    if (!nouParticipantNom.trim()) return;
    const email = `${nouParticipantNom.toLowerCase().replace(/\s/g, '')}@manual.local`;
    const userRef = await addDoc(collection(db, 'usuaris'), {
      name: nouParticipantNom.trim(),
      email,
      manual: true,
    });
    // also add to project participants
    const projectRef = doc(db, 'projects', projectId);
    const projSnap = await getDoc(projectRef);
    const projData = projSnap.exists() ? projSnap.data() : {};
    const updatedProjParticipants = [...new Set([...(projData.participants || []), userRef.id])];
    await updateDoc(projectRef, { participants: updatedProjParticipants });
    // fetch new user
    const snap = await getDoc(doc(db, 'usuaris', userRef.id));
    const newUser = { uid: snap.id, ...snap.data() };
    setParticipantsList(prev => [...prev, newUser]);
    set(fields => ({ ...fields, divideix: [...fields.divideix, newUser.uid] }));
    setNouParticipantNom('');
  };

  const eliminarParticipant = async uid => {
    const user = participantsList.find(p => p.uid === uid);
    if (!user?.manual) return;
    if (!window.confirm(`Segur que vols eliminar l'usuari ${user.name}?`)) return;
    // remove from users collection
    await deleteDoc(doc(db, 'usuaris', uid));
    // update project participants
    const projectRef = doc(db, 'projects', projectId);
    const projSnap = await getDoc(projectRef);
    const projData = projSnap.exists() ? projSnap.data() : {};
    const updatedProj = (projData.participants || []).filter(id => id !== uid);
    await updateDoc(projectRef, { participants: updatedProj });
    // update local state
    setParticipantsList(prev => prev.filter(p => p.uid !== uid));
    set(fields => ({
      ...fields,
      divideix: fields.divideix.filter(id => id !== uid),
      pagatPer: fields.pagatPer === uid ? '' : fields.pagatPer,
    }));
  };

  const submit = async e => {
    e.preventDefault();
    const data = {
      ...fields,
      quantia: parseFloat(fields.quantia),
      divideix: fields.divideix,
      createdAt: serverTimestamp(),
    };
    if (editId) {
      await updateDoc(doc(db, 'projects', projectId, 'despeses', editId), data);
    } else {
      await addDoc(collection(db, 'projects', projectId, 'despeses'), data);
    }
    onSaved();
  };

  return (
    <form className="register-form" onSubmit={submit}>
      {/* Concepte */}
      <div className="form-group">
        <label className="form-label">
          Concepte
          <input
            className="form-control"
            name="concepte"
            value={fields.concepte}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      {/* Quantia */}
      <div className="form-group">
        <label className="form-label">
          Quantia
          <input
            className="form-control"
            name="quantia"
            type="number"
            value={fields.quantia}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      {/* Pagat per */}
      <div className="form-group">
  <label className="form-label">
    Pagat per
    <select
      className="form-control"
      name="pagatPer"
      value={fields.pagatPer}
      onChange={handleChange}
      required
    >
      {participantsList.map(p => (
        <option key={p.uid} value={p.uid}>
          {p.name}  {/* I aquí, p.name */}
        </option>
      ))}
    </select>
  </label>
</div>

      {/* Dividir entre */}
      <fieldset className="form-group">
  <legend className="form-label">Dividir entre</legend>
  <button
    type="button"
    className="btn btn-primary mb-2"
    onClick={toggleTots}
  >
    {totsSeleccionats ? 'Deselecciona tots' : 'Selecciona tots'}
  </button>
  <hr />
  {participantsList.map(p => (
    <div
      key={p.uid}
      className="form-label d-flex align-items-center justify-content-between"
      style={{ gap: '1rem' }}
    >
      <label style={{ flex: 1 }}>
        <input
          type="checkbox"
          checked={fields.divideix.includes(p.uid)}
          onChange={() => toggle(p.uid)}
          style={{ marginRight: '0.5rem' }}
        />
        {p.name}  {/* Aquí mostrem sempre el name */}
      </label>
      {p.manual && (
        <button
          type="button"
          onClick={() => eliminarParticipant(p.uid)}
          style={{
            background: 'transparent',
            color: 'red',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}
          title="Elimina participant"
        >
          ❌
        </button>
      )}
    </div>
  ))}
</fieldset>

      {/* Afegeix participant */}
      <div className="form-group mt-3">
        <label className="form-label">
          Afegeix participant:
          <input
            type="text"
            value={nouParticipantNom}
            onChange={e => setNouParticipantNom(e.target.value)}
            placeholder="Nom del participant"
            className="form-control"
            style={{ display: 'inline-block', width: 'auto', marginRight: '0.5rem' }}
          />
          <button type="button" onClick={afegirParticipant} className="btn btn-secondary btn-sm">Afegeix</button>
        </label>
      </div>
      {/* Submit */}
      <div className="form-group mt-4 text-center">
        <button className="btn btn-success me-2" type="submit">{editId ? 'Actualitzar' : 'Desar'}</button>&nbsp;&nbsp;
        {editId && <button type="button" className="btn btn-danger" onClick={() => window.location.reload()}>Cancel·lar</button>}
      </div>
    </form>
  );
}
