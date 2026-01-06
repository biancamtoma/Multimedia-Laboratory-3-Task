import React, { useState, useEffect, useRef } from 'react';

const WORD_LIST = ['table', 'chair', 'piano', 'mouse', 'house', 'plant', 'brain', 'cloud', 'beach', 'fruit', 'media', 'earth', 'water', 'phone', 'light'];

const WordleGame = () => {
  const [word, setWord] = useState('');
  const [guess, setGuess] = useState('');
  const [tries, setTries] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(5).fill({ letter: '', color: '' })));
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    initializeGame();
    const savedStats = localStorage.getItem('wordleStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const initializeGame = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setWord(randomWord);
    setGuess('');
    setTries(0);
    setGameOver(false);
    setWon(false);
    setBoard(Array(6).fill(null).map(() => Array(5).fill({ letter: '', color: '' })));
    setError('');
  };

  const checkGuess = (guessWord) => {
    const newBoard = [...board];
    const wordArray = word.split('');
    const guessArray = guessWord.split('');
    const colors = Array(5).fill('');
    const letterCount = {};

    // Count letters in target word
    wordArray.forEach(letter => {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    });

    // First pass: mark green (correct position)
    guessArray.forEach((letter, i) => {
      if (letter === wordArray[i]) {
        colors[i] = 'green';
        letterCount[letter]--;
      }
    });

    // Second pass: mark yellow (wrong position) or red (not in word)
    guessArray.forEach((letter, i) => {
      if (colors[i] === '') {
        if (letterCount[letter] > 0) {
          colors[i] = 'yellow';
          letterCount[letter]--;
        } else {
          colors[i] = 'red';
        }
      }
    });

    // Update board with letters and colors
    for (let i = 0; i < 5; i++) {
      newBoard[tries][i] = { letter: guessArray[i], color: colors[i] };
    }

    setBoard(newBoard);
    return guessWord === word;
  };

  const handleGuess = () => {
    if (gameOver) {
      setError('Game is already over');
      return;
    }

    if (guess.length !== 5) {
      setError('Please enter exactly 5 letters');
      return;
    }

    if (!/^[a-zA-Z]+$/.test(guess)) {
      setError('Please enter only letters');
      return;
    }

    setError('');

    const isCorrect = checkGuess(guess.toLowerCase());

    if (isCorrect) {
      setWon(true);
      setGameOver(true);
      const newStats = {
        played: stats.played + 1,
        won: stats.won + 1,
        streak: stats.streak + 1
      };
      setStats(newStats);
      localStorage.setItem('wordleStats', JSON.stringify(newStats));
      setTimeout(() => alert('Congratulations! You won!'), 100);
    } else if (tries === 5) {
      setGameOver(true);
      const newStats = {
        played: stats.played + 1,
        won: stats.won,
        streak: 0
      };
      setStats(newStats);
      localStorage.setItem('wordleStats', JSON.stringify(newStats));
      setTimeout(() => alert(`You lost! The word was: ${word.toUpperCase()}`), 100);
    } else {
      setTries(tries + 1);
    }

    setGuess('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const handleNewGame = () => {
    initializeGame();
    inputRef.current?.focus();
  };

  const winPercentage = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold text-center mb-2 text-white tracking-tight">
          WORDLE
        </h1>
        <p className="text-center text-slate-400 mb-6">Guess the 5-letter word in 6 tries</p>

        {/* Statistics */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 mb-6 border border-slate-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{stats.played}</div>
              <div className="text-xs text-slate-400">Played</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{winPercentage}%</div>
              <div className="text-xs text-slate-400">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.streak}</div>
              <div className="text-xs text-slate-400">Streak</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-4 text-center text-sm animate-pulse">
            {error}
          </div>
        )}

        {/* Game Board */}
        <div className="bg-slate-800/30 backdrop-blur rounded-2xl p-6 mb-6 shadow-2xl border border-slate-700">
          <div className="space-y-2">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`
                      w-14 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold uppercase
                      transition-all duration-500 transform
                      ${cell.color === 'green' ? 'bg-green-600 border-green-600 text-white scale-105' : ''}
                      ${cell.color === 'yellow' ? 'bg-yellow-500 border-yellow-500 text-white scale-105' : ''}
                      ${cell.color === 'red' ? 'bg-slate-600 border-slate-600 text-white' : ''}
                      ${!cell.color ? 'bg-slate-800/50 border-slate-600' : ''}
                      ${cell.letter ? 'shadow-lg' : ''}
                    `}
                  >
                    {cell.letter}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value.toLowerCase())}
            onKeyPress={handleKeyPress}
            maxLength={5}
            disabled={gameOver}
            placeholder="Enter your guess"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-600 text-white text-center text-lg uppercase tracking-widest focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleGuess}
              disabled={gameOver}
              className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              Guess
            </button>
            
            {gameOver && (
              <button
                onClick={handleNewGame}
                className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                New Game
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Press <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">Enter</kbd> to submit
        </p>
      </div>
    </div>
  );
};

export default WordleGame;