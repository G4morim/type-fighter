import React from 'react';
import './App.css';
import TypeFighter from './components/TypeFighter';

function App() {
  return (
    <div className="app-container">
      <header className="game-header">
        <h1>Type Fighter <span role="img" aria-label="joystick">🎮</span></h1>
        <p>Digite rápido para derrotar o inimigo!</p>
      </header>
      <main className="game-area">
        <TypeFighter />
      </main>
    </div>
  );
}

export default App;