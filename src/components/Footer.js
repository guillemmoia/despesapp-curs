import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#a6fb61',
      color: 'white',
      padding: '1rem',
      textAlign: 'center',
      fontSize: '0.9rem',
      position: 'fixed',
      bottom: 0,
      width: '100%',
      left: 0,
      zIndex: 1000
    }}>
      © {new Date().getFullYear()} Desenvolupat per Guillem Moià
    </footer>
  );
}
