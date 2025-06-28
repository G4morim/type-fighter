import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import './TypeFighter.css';



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

const phrases = ["Hadouken!", "Shoryuken!", "Tatsumaki!", "K.O!", "Roundhouse Kick!"];

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

  // useCallback para memorizar a função
  const getNewPhrase = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    setCurrentPhrase(phrases[randomIndex]);
  }, []);

  // Efeitos ao montar o componente
  useEffect(() => {
    getNewPhrase();
  }, [getNewPhrase]);

  // Verifica vitória/derrota
  useEffect(() => {
    if (enemyHealth <= 0) {
      sounds.victory.play();
      setGameStatus("won");
      setScore(prev => prev + 500);
    } else if (playerHealth <= 0) {
      sounds.defeat.play();
      setGameStatus("lost");
    }
  }, [playerHealth, enemyHealth]);

  // Animação de dano
  const triggerShake = useCallback(() => {
    if (enemyHealthBarRef.current) {
      enemyHealthBarRef.current.classList.add("shake");
      setTimeout(() => {
        enemyHealthBarRef.current?.classList.remove("shake");
      }, 300);
    }
  }, []);

  // Lógica principal de digitação
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value === currentPhrase) {
      sounds.hit.play();
      triggerShake();
      
      setEnemyHealth(prev => Math.max(prev - 10 * speed, 0));
      setScore(prev => prev + 100 + (combo * 10));
      setCombo(prev => prev + 1);
      
      if (combo > 0 && combo % 3 === 0) {
        setSpeed(prev => prev * 1.1);
      }
      
      setInput("");
      getNewPhrase();
    } else if (value.length > currentPhrase.length) {
      setPlayerHealth(prev => Math.max(prev - 5, 0));
      setCombo(0);
      setInput("");
    }
  };

  // Reiniciar jogo
  const resetGame = () => {
    setPlayerHealth(100);
    setEnemyHealth(100);
    setGameStatus("playing");
    setScore(0);
    setCombo(0);
    setSpeed(1);
    getNewPhrase();
  };

  // Renderização condicional
  if (gameStatus === "won") return (
    <div className="result-screen">
      <h2>Você Venceu! 🎉</h2>
      <p>Pontuação: {score}</p>
      <button onClick={resetGame}>Jogar Novamente</button>
    </div>
  );

  if (gameStatus === "lost") return (
    <div className="result-screen">
      <h2>Game Over! 😵</h2>
      <p>Pontuação: {score}</p>
      <button onClick={resetGame}>Tentar Novamente</button>
    </div>
  );

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Type Fighter <span>🔥</span></h1>
        <div className="game-stats">
          <span>Score: {score}</span>
          <span>Combo: x{combo}</span>
          <span>Speed: {speed.toFixed(1)}x</span>
        </div>
      </div>

      <div className="health-bars">
        <div className="health-bar player">
          <div 
            className="health-fill" 
            style={{ width: `${playerHealth}%` }}
          ></div>
          <span>Player: {playerHealth}%</span>
        </div>
        <div 
          className="health-bar enemy" 
          ref={enemyHealthBarRef}
        >
          <div 
            className="health-fill" 
            style={{ width: `${enemyHealth}%` }}
          ></div>
          <span>Enemy: {enemyHealth}%</span>
        </div>
      </div>

      <div className="phrase-display">
        <p>Digite rápido:</p>
        <h2 className={
          input.length > 0 && input.length >= currentPhrase.length - 2 
            ? "almost-complete" 
            : ""
        }>
          {currentPhrase}
        </h2>
      </div>

      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        autoFocus
        placeholder="Comece a digitar..."
        style={{ fontSize: `${16 * speed}px` }}
      />
    </div>
  );
};

export default TypeFighter;