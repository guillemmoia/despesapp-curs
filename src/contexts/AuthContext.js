import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function signup(email, password) { return createUserWithEmailAndPassword(auth, email, password); }
    function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
    function logout() { return signOut(auth); }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
        setCurrentUser(user);
        setLoading(false);
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
        {!loading && children}
        </AuthContext.Provider>
    );
}

export async function crearUsuari(user) {
    const docRef = await addDoc(collection(db, "usuaris"), {
        nom: user.nom,
        email: user.email,
        contrasenya: user.contrasenya
    });
    return docRef.id;
}

export async function loginUsuari(email, contrasenya) {
    const querySnapshot = await collection(db, "usuaris").where("email", "==", email).where("contrasenya", "==", contrasenya).get();
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data(); // Return user data if found
    } else {
        throw new Error("Usuari no trobat o contrasenya incorrecta");
    }
}