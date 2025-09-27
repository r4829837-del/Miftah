import React from 'react';

// Version simplifiée de l'App pour tester
const AppTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test de l'application</h1>
      <p>Si vous voyez ce message, l'application fonctionne !</p>
      <p>Version: {import.meta.env.MODE}</p>
      <p>Base URL: {import.meta.env.BASE_URL}</p>
    </div>
  );
};

export default AppTest;