import React, { useState } from 'react';
import { GameModeType, GameState, StudentProfile, GameResult } from '../../types';
import GameLobby from './GameLobby';
import PreGameSetup from './PreGameSetup';
import ResultsView from './ResultsView';

// Game Imports (Fixed relative paths)
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

// New Game Imports (Fixed relative paths)
import NinjaSlice from '../../NewGames/NinjaSlice';
import TreasureDiver from '../../NewGames/TreasureDiver';
import RocketLaunch from '../../NewGames/RocketLaunch';
import DragonTrainer from '../../NewGames/DragonTrainer';
import MazeEscape from '../../NewGames/MazeEscape';
import ZooBuilder from '../../NewGames/ZooBuilder';
import GhostHunting from '../../NewGames/GhostHunting';
import RaceTrack from '../../NewGames/RaceTrack';
import { GardenGame, CookingGame, JigsawGame, DetectiveGame, MonsterGame } from '../../NewGames/SimpleGames';

import { getQuestionsForGrade } from '../../QuestionBank';

const App: React.FC = () => {
  const [view, setView] = useState<'lobby' | 'setup' | 'game' | 'results'>('lobby');
  const [selectedGame, setSelectedGame] = useState<GameModeType | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const handleGameSelect = (mode: GameModeType) => {
    setSelectedGame(mode);
    setView('setup');
  };

  const handleSetupComplete = (profile: StudentProfile) => {
    setStudent(profile);
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
        const questions = getQuestionsForGrade(student.grade);
        
        return (
            <ArcherAdventure 
               profile={{ 
                 name: student.name,
                 grade: student.grade,
                 subject: 'All', 
                 chapter: '1', 
                 difficulty: 'Normal', 
                 questionsCount: 10,
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
          <p className="text-slate-500">This mission is currently being deployed by the engineering team.</p>
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
  );
};

export default App;