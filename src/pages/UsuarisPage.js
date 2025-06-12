import React from 'react';
import TaulaUsuaris from '../components/TaulaUsuaris';
import Footer from '../components/Footer';

export default function UsuarisPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '80px', minHeight: '100vh' }}>
      <center>
        <h1>Llistat d'usuaris</h1>
      </center>
      <TaulaUsuaris />
      <Footer />
    </div>
  );
}
