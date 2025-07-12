import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import './TypeFighter.css';

// Efeitos sonoros
const sounds = {
  hit: new Howl({ 
    src: [process.env.PUBLIC_URL + '/sounds/hit.mp3'],
    volume: 0.5
  }),
  victory: new Howl({ 
    src: [process.env.PUBLIC_URL + '/sounds/victory.mp3'],
    volume: 0.7
  }),
  defeat: new Howl({ 
    src: [process.env.PUBLIC_URL + '/sounds/defeat.mp3'],
    volume: 0.7
  })
};

// Frases de ataque
const phrases = [
  "Hadouken!", 
  "Shoryuken!", 
  "Tatsumaki!", 
  "K.O!", 
  "Roundhouse Kick!",
  "Flamethrower!",
  "Dragon Punch!"
];

const TypeFighter = () => {
  // Estados do jogo
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [input, setInput] = useState("");
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [gameStatus, setGameStatus] = useState("playing");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [speed, setSpeed] = useState(1);
  
  const enemyHealthBarRef = useRef<HTMLDivElement>(null);

  // Gera nova frase aleatória
  const getNewPhrase = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    setCurrentPhrase(phrases[randomIndex]);
  }, []);

  // Inicializa o jogo
  useEffect(() => {
    getNewPhrase();
  }, [getNewPhrase]);

  // Verifica vitória/derrota
  useEffect(() => {
    if (enemyHealth <= 0) {
      sounds.victory.play();
      setGameStatus("won");
      setScore(prev => prev + 500 + (combo * 20)); // Bônus por combo
    } else if (playerHealth <= 0) {
      sounds.defeat.play();
      setGameStatus("lost");
    }
  }, [playerHealth, enemyHealth, combo]);

  // Animação de dano
  const triggerShake = useCallback(() => {
    if (enemyHealthBarRef.current) {
      enemyHealthBarRef.current.classList.add("shake");
      setTimeout(() => {
        enemyHealthBarRef.current?.classList.remove("shake");
      }, 300);
    }
  }, []);

  // Lógica de digitação
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value === currentPhrase) {
      // Acerto
      sounds.hit.play();
      triggerShake();
      
      setEnemyHealth(prev => Math.max(prev - 10 * speed, 0));
      setScore(prev => prev + 100 + (combo * 10));
      setCombo(prev => prev + 1);
      
      // Aumenta dificuldade
      if (combo > 0 && combo % 3 === 0) {
        setSpeed(prev => Math.min(prev * 1.1, 2.5)); // Limite de 2.5x
      }
      
      setInput("");
      getNewPhrase();
    } else if (value.length > currentPhrase.length) {
      // Erro
      setPlayerHealth(prev => Math.max(prev - 5, 0));
      setCombo(0);
      setInput("");
    }
  };

  // Reinicia o jogo
  const resetGame = () => {
    setPlayerHealth(100);
    setEnemyHealth(100);
    setGameStatus("playing");
    setScore(0);
    setCombo(0);
    setSpeed(1);
    setInput("");
    getNewPhrase();
  };

  // Tela de vitória
  if (gameStatus === "won") return (
    <div className="result-screen">
      <h2>Você Venceu! 🎉</h2>
      <p>Pontuação: {score}</p>
      <p>Combo Máximo: x{combo}</p>
      <button onClick={resetGame}>Jogar Novamente</button>
    </div>
  );

  // Tela de derrota
  if (gameStatus === "lost") return (
    <div className="result-screen">
      <h2>Game Over! 😵</h2>
      <p>Pontuação: {score}</p>
      <button onClick={resetGame}>Tentar Novamente</button>
    </div>
  );

  // Jogo principal
  return (
    <div className="game-container">
      {/* Cabeçalho */}
      <div className="game-header">
        <h1>Type Fighter <span>🔥</span></h1>
        <div className="game-stats">
          <span>Score: {score}</span>
          <span>Combo: x{combo}</span>
          <span>Speed: {speed.toFixed(1)}x</span>
        </div>
      </div>

      {/* Barras de vida */}
      <div className="health-bars">
        <div className="health-bar player">
          <div 
            className="health-fill" 
            style={{ width: `${playerHealth}%` }}
          />
          <span>Player: {playerHealth}%</span>
        </div>
        <div 
          className="health-bar enemy shake" 
          ref={enemyHealthBarRef}
        >
          <div 
            className="health-fill" 
            style={{ width: `${enemyHealth}%` }}
          />
          <span>Enemy: {enemyHealth}%</span>
        </div>
      </div>

      {/* Área de digitação */}
      <div className="phrase-display">
        <p>Digite rápido:</p>
        <h2 
  className={
    input.length > 0 && input.length >= currentPhrase.length - 2 
      ? "almost-complete pixel-font" 
      : "pixel-font"
  }
  style={{ fontFamily: '"Press Start 2P", monospace' }}
>
  {currentPhrase}
</h2>
      </div>

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        autoFocus
        placeholder="Comece a digitar..."
        style={{ 
          fontSize: `${16 * speed}px`,
          fontFamily: '"Press Start 2P", cursive' 
        }}
      />

      {/* Dica visual (opcional) */}
      <p style={{ marginTop: '1rem', opacity: 0.7 }}>
        Dica: Complete as frases para atacar!
      </p>
    </div>
  );
};

export default TypeFighter;