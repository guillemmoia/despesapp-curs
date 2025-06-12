
import React, { useState } from 'react';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';

export default function EditarUsuari({ usuari, onCancel, onSaved }) {
    const db = getFirestore();
    const [form, setForm] = useState({
        name: usuari.name || '',
        email: usuari.email || '',
        password: '', // Add password field
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ref = doc(db, 'usuaris', usuari.id);
        const updateData = {
            name: form.name,
            email: form.email,
        };
        if (form.password) {
            updateData.password = form.password; // Include password if provided
        }
        await updateDoc(ref, updateData);

        // Update password in Firebase Authentication
        if (form.password) {
            if (form.password.length < 6) {
            alert('La contrasenya ha de tenir un mínim de 6 caràcters.');
            return;
            }
            const user = await import('firebase/auth').then(({ getAuth }) => {
            const auth = getAuth();
            return auth.currentUser;
            });
            if (user) {
            await import('firebase/auth').then(({ updatePassword }) => updatePassword(user, form.password));
            }
        }

        onSaved();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
            <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Nom"
            />
            <input
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Email"
                type="email"
                readOnly
                style={{ backgroundColor: '#eee', border:'0px' }} // Set text color to gray
                onMouseDown={(e) => e.preventDefault()} // Disable onblur with mouse
            />
            <input
                name="password"
                value={form.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Contrasenya"
                type="password"
            />
            <button type="submit" className="btn btn-success btn-sm" disabled>Desar</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel·la</button>
        </form>
    );
}
