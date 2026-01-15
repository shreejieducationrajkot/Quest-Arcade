import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { GameModeType, GameState, StudentProfile, GameResult, Question } from '../../types';
import GameLobby from './GameLobby';
import PreGameSetup from './PreGameSetup';
import ResultsView from './ResultsView';

// Standard Game Imports
import RaceToTop from '../RaceToTop';
import TowerDefense from '../TowerDefense';
import BossBattle from '../BossBattle';
import ArcherAdventure from '../ArcherAdventure';
import BubblePop from '../BubblePop';
import TargetShooter from '../TargetShooter';
import MemoryMatch from '../MemoryMatch';
import Catcher from '../Catcher';
import TimerRace from '../TimerRace';
import PenaltyKick from '../PenaltyKick';

// New Game Imports
import NinjaSlice from '../NinjaSlice';
import TreasureDiver from '../TreasureDiver';
import RocketLaunch from '../RocketLaunch';
import DragonTrainer from '../DragonTrainer';
import MazeEscape from '../MazeEscape';
import ZooBuilder from '../ZooBuilder';
import GhostHunting from '../GhostHunting';
import RaceTrack from '../RaceTrack';
import { GardenGame, CookingGame, JigsawGame, DetectiveGame, MonsterGame } from '../SimpleGames';

import { getQuestionsForGrade } from '../../QuestionBank';

// --- Error Boundary to prevent White Screen of Death ---
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRITICAL APP ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-8 text-center font-sans text-red-900">
          <div className="max-w-xl">
            <h1 className="text-4xl font-black mb-4">⚠️ System Failure</h1>
            <p className="text-lg font-bold mb-6">The arcade machine encountered a critical error.</p>
            <div className="bg-white p-4 rounded-xl border-2 border-red-200 text-left overflow-auto max-h-64 shadow-sm mb-6">
              <code className="text-xs font-mono break-all text-red-600">
                {this.state.error?.toString()}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              RESTART SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  // Debug Log to verify mounting in Console
  React.useEffect(() => {
    console.log("App Component Mounted Successfully");
  }, []);

  const [view, setView] = useState<'lobby' | 'setup' | 'game' | 'results'>('lobby');
  const [selectedGame, setSelectedGame] = useState<GameModeType | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);

  const handleGameSelect = (mode: GameModeType) => {
    console.log("Game Selected:", mode);
    setSelectedGame(mode);
    setView('setup');
  };

  const handleSetupComplete = (profile: StudentProfile, customQ?: Question[] | null) => {
    console.log("Setup Complete for:", profile.name);
    setStudent(profile);
    setCustomQuestions(customQ || null);
    setView('game');
  };

  const handleGameOver = (result: GameState) => {
    console.log("Game Over. Score:", result.score);
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

    // Unified Props Object
    const commonProps = {
      student: student,
      onGameOver: handleGameOver,
      onExit: handleHome,
      onBack: handleHome,
      customQuestions: customQuestions,
    };

    switch (selectedGame) {
      // --- NEW GAMES ---
      case 'RACE_TRACK': return <RaceTrack {...commonProps} />;
      case 'NINJA_SLICE': return <NinjaSlice {...commonProps} />;
      case 'MAZE_ESCAPE': return <MazeEscape {...commonProps} />;
      case 'TREASURE_DIVER': return <TreasureDiver {...commonProps} />;
      case 'ROCKET_LAUNCH': return <RocketLaunch {...commonProps} />;
      case 'DRAGON_TRAINER': return <DragonTrainer {...commonProps} />;
      case 'ZOO_BUILDER': return <ZooBuilder {...commonProps} />;
      case 'GHOST_HUNT': return <GhostHunting {...commonProps} />;
      
      // --- SIMPLE GAMES COLLECTION ---
      case 'GARDEN_GROWER': return <GardenGame {...commonProps} />;
      case 'COOKING_MASTER': return <CookingGame {...commonProps} />;
      case 'JIGSAW_REVEAL': return <JigsawGame {...commonProps} />;
      case 'DETECTIVE_CASE': return <DetectiveGame {...commonProps} />;
      case 'MONSTER_ALBUM': return <MonsterGame {...commonProps} />;

      // --- ORIGINAL GAMES ---
      case 'RACE': return <RaceToTop {...commonProps} />;
      case 'TOWER': return <TowerDefense {...commonProps} />;
      case 'BATTLE': return <BossBattle {...commonProps} />;
      case 'BUBBLE': return <BubblePop {...commonProps} />;
      case 'TARGET': return <TargetShooter {...commonProps} />;
      case 'PENALTY': return <PenaltyKick {...commonProps} />;
      case 'MEMORY': return <MemoryMatch {...commonProps} />;
      case 'CATCHER': return <Catcher {...commonProps} />;
      case 'TIMER': return <TimerRace {...commonProps} />;
      
      // Archer has a slightly different prop structure for profile
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

      default: return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center">
          <div className="text-8xl">🏗️</div>
          <h1 className="text-3xl font-black">Mission Under Construction</h1>
          <p className="text-slate-500">This mission is currently being deployed by the engineering team.</p>
          <button onClick={handleHome} className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">Back to Lobby</button>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
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

        {view === 'game' && renderGame()}

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
    </ErrorBoundary>
  );
};

export default App;