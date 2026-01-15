
import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { GameModeType, GameState, StudentProfile, GameResult, Question } from '../../types';
import GameLobby from './GameLobby';
import PreGameSetup from './PreGameSetup';
import ResultsView from './ResultsView';

// Original Game Imports
import RaceToTop from '../../games/RaceToTop';
import TowerDefense from '../../games/TowerDefense';
import BossBattle from '../../games/BossBattle';
import ArcherAdventure from '../../games/ArcherAdventure';
import BubblePop from '../../games/BubblePop';
import TargetShooter from '../../games/TargetShooter';
import MemoryMatch from '../../games/MemoryMatch';
import Catcher from '../../games/Catcher';
import TimerRace from '../../games/TimerRace';
import PenaltyKick from '../../games/PenaltyKick';

// Corrected Paths (Changed from ../../NewGames to ../../games)
import NinjaSlice from '../../games/NinjaSlice';
import TreasureDiver from '../../games/TreasureDiver';
import RocketLaunch from '../../games/RocketLaunch';
import DragonTrainer from '../../games/DragonTrainer';
import MazeEscape from '../../games/MazeEscape';
import ZooBuilder from '../../games/ZooBuilder';
import GhostHunting from '../../games/GhostHunting';
import RaceTrack from '../../games/RaceTrack';
import { GardenGame, CookingGame, JigsawGame, DetectiveGame, MonsterGame } from '../../games/SimpleGames';

import { getQuestionsForGrade } from '../../QuestionBank';

// --- Error Boundary for Production Stability ---
class ErrorBoundary extends Component<{ children: ReactNode, onReset: () => void }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode, onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GAME CRASH DETECTED:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center font-sans text-white">
          <div className="max-w-xl bg-slate-800 p-8 rounded-3xl border-4 border-red-500 shadow-2xl">
            <div className="text-6xl mb-4">👾</div>
            <h1 className="text-3xl font-black mb-4 text-red-400">Mission Aborted</h1>
            <p className="text-lg font-bold mb-6 text-slate-300">
              The game encountered a critical error.
            </p>
            <div className="bg-black/50 p-4 rounded-xl text-left overflow-auto max-h-32 mb-6 font-mono text-xs text-red-300">
              {this.state.error?.toString() || "Unknown Error"}
            </div>
            <button 
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onReset();
              }} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 w-full"
            >
              RETURN TO BASE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<'lobby' | 'setup' | 'game' | 'results'>('lobby');
  const [selectedGame, setSelectedGame] = useState<GameModeType | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);

  const handleGameSelect = (mode: GameModeType) => {
    setSelectedGame(mode);
    setView('setup');
  };

  const handleSetupComplete = (profile: StudentProfile, customQ?: Question[] | null) => {
    setStudent(profile);
    setCustomQuestions(customQ || null);
    setView('game');
  };

  const handleGameOver = (result: GameState) => {
    setGameResult({
      ...result,
      history: [] 
    });
    setView('results');
  };

  const handleHome = () => {
    setStudent(null);
    setGameResult(null);
    setSelectedGame(null);
    setCustomQuestions(null);
    setView('lobby');
  };

  const handleReplay = () => {
    setView('game');
  };

  const renderGame = () => {
    if (!student || !selectedGame) return null;

    const commonProps = {
      student: student,
      onGameOver: handleGameOver,
      onExit: handleHome, // Ensure consistent prop name
      customQuestions: customQuestions,
    };

    switch (selectedGame) {
      case 'RACE_TRACK': return <RaceTrack {...commonProps} />;
      case 'NINJA_SLICE': return <NinjaSlice {...commonProps} />;
      case 'MAZE_ESCAPE': return <MazeEscape {...commonProps} />;
      case 'TREASURE_DIVER': return <TreasureDiver {...commonProps} />;
      case 'ROCKET_LAUNCH': return <RocketLaunch {...commonProps} />;
      case 'DRAGON_TRAINER': return <DragonTrainer {...commonProps} />;
      case 'ZOO_BUILDER': return <ZooBuilder {...commonProps} />;
      case 'GHOST_HUNT': return <GhostHunting {...commonProps} />;
      case 'GARDEN_GROWER': return <GardenGame {...commonProps} />;
      case 'COOKING_MASTER': return <CookingGame {...commonProps} />;
      case 'JIGSAW_REVEAL': return <JigsawGame {...commonProps} />;
      case 'DETECTIVE_CASE': return <DetectiveGame {...commonProps} />;
      case 'MONSTER_ALBUM': return <MonsterGame {...commonProps} />;
      case 'RACE': return <RaceToTop {...commonProps} />;
      case 'TOWER': return <TowerDefense {...commonProps} />;
      case 'BATTLE': return <BossBattle {...commonProps} />;
      case 'ARCHER': {
        const questions = customQuestions || getQuestionsForGrade(student.grade);
        return (
            <ArcherAdventure 
               profile={{ 
                 name: student.name,
                 grade: student.grade,
                 subject: 'All', 
                 chapter: '1', 
                 difficulty: 'Normal', 
                 questionsCount: questions.length,
                 avatar: student.avatar
               }} 
               questions={questions}
               onComplete={(res) => handleGameOver({
                   score: res.score,
                   streak: 0,
                   questionsAnswered: res.totalQuestions,
                   correctAnswers: res.correctAnswers,
                   timeElapsed: res.timeTaken,
                   level: 1
               })}
               onExit={handleHome}
            />
        );
      }
      case 'BUBBLE': return <BubblePop {...commonProps} />;
      case 'TARGET': return <TargetShooter {...commonProps} />;
      case 'PENALTY': return <PenaltyKick {...commonProps} />;
      case 'MEMORY': return <MemoryMatch {...commonProps} />;
      case 'CATCHER': return <Catcher {...commonProps} />;
      case 'TIMER': return <TimerRace {...commonProps} />;
      default: return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center">
          <div className="text-8xl">🏗️</div>
          <h1 className="text-3xl font-black">Mission Under Construction</h1>
          <button onClick={handleHome} className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">Back to Lobby</button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {view === 'lobby' && <GameLobby onSelectGame={handleGameSelect} />}
      
      {view === 'setup' && selectedGame && (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
           <PreGameSetup 
              onComplete={handleSetupComplete} 
              gameTitle={selectedGame}
           />
        </div>
      )}

      {view === 'game' && (
        <ErrorBoundary onReset={handleHome}>
          {renderGame()}
        </ErrorBoundary>
      )}

      {view === 'results' && gameResult && student && (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
          <ResultsView 
            result={gameResult} 
            student={student} 
            onReset={handleReplay} 
            onHome={handleHome} 
          />
        </div>
      )}
    </div>
  );
};

export default App;
