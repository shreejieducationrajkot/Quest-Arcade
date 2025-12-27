
import { GameModeConfig, Enemy } from './types';

export const AVATARS = [
  '🤖', '👨‍🚀', '🥷', '🧙', '🦸', '🐱', '🦄', '🐲', '👦', '👧', '🐻', '🐰', '🦊'
];

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'RACE_TRACK',
    title: 'Turbo Racing',
    description: 'High speed racing! Answer correctly to boost past your rival.',
    icon: 'car',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'ARCHER',
    title: 'Trap Room',
    description: 'Survive the deadly traps! Answer correctly to avoid the spikes.',
    icon: 'skull',
    color: 'from-stone-700 to-zinc-900'
  },
  {
    id: 'NINJA_SLICE',
    title: 'Ninja Slice',
    description: 'Slice only the correct answers—avoid the bombs!',
    icon: 'sword',
    color: 'from-stone-800 to-stone-900'
  },
  {
    id: 'GHOST_HUNT',
    title: 'Ghost Hunt',
    description: 'Use your flashlight to find and capture the correct ghosts!',
    icon: 'ghost',
    color: 'from-purple-900 to-slate-900'
  },
  {
    id: 'TOWER',
    title: 'Tower Defense',
    description: 'Defend your castle from waves of enemies by answering questions!',
    icon: 'castle',
    color: 'from-slate-700 to-slate-900'
  },
  {
    id: 'BATTLE',
    title: 'Boss Battle',
    description: 'RPG Style! Battle the Boss Monster by answering correctly.',
    icon: 'sword',
    color: 'from-red-500 to-rose-600'
  },
  {
    id: 'RACE',
    title: 'Race to the Top',
    description: 'Race against bots! Answer correctly to climb the mountain.',
    icon: 'mountain',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'PENALTY',
    title: 'Penalty Kick',
    description: 'Score goals against the goalie! Wrong answers get blocked.',
    icon: 'trophy',
    color: 'from-green-600 to-emerald-800'
  },
  {
    id: 'MAZE_ESCAPE',
    title: 'Maze Escape',
    description: 'Unlock doors and find the exit of the magical maze.',
    icon: 'maze',
    color: 'from-purple-600 to-violet-900'
  },
  {
    id: 'TREASURE_DIVER',
    title: 'Treasure Diver',
    description: 'Dive deep into the ocean to find hidden gems.',
    icon: 'diver',
    color: 'from-blue-600 to-indigo-800'
  },
  {
    id: 'DRAGON_TRAINER',
    title: 'Dragon Trainer',
    description: 'Teach your dragon new tricks and help it grow!',
    icon: 'dragon',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'ROCKET_LAUNCH',
    title: 'Rocket Launch',
    description: 'Fuel your rocket and blast off to new planets!',
    icon: 'rocket',
    color: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'BUBBLE',
    title: 'Bubble Pop',
    description: 'Pop the bubbles with the correct answers before they float away!',
    icon: 'bubble',
    color: 'from-sky-400 to-blue-500'
  },
  {
    id: 'TARGET',
    title: 'Target Shooter',
    description: 'Aim your bow and shoot the correct target board.',
    icon: 'target',
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 'MEMORY',
    title: 'Memory Match',
    description: 'Find matching cards to test your memory and knowledge.',
    icon: 'brain',
    color: 'from-violet-600 to-purple-800'
  },
  {
    id: 'CATCHER',
    title: 'Star Catcher',
    description: 'Catch the falling correct answers in your basket!',
    icon: 'basket',
    color: 'from-indigo-500 to-blue-700'
  },
  {
    id: 'TIMER',
    title: 'Speed Racer',
    description: 'Race against the clock! Answer quickly before time runs out.',
    icon: 'timer',
    color: 'from-red-500 to-orange-600'
  },
  {
    id: 'ZOO_BUILDER',
    title: 'Zoo Builder',
    description: 'Rescue animals and build the greatest zoo!',
    icon: 'zoo',
    color: 'from-emerald-500 to-green-700'
  },
  {
    id: 'GARDEN_GROWER',
    title: 'Garden Grower',
    description: 'Water magical seeds and watch your garden bloom.',
    icon: 'flower',
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'MONSTER_ALBUM',
    title: 'Monster Album',
    description: 'Catch rare monsters and fill your collection album.',
    icon: 'ghost',
    color: 'from-fuchsia-500 to-purple-600'
  },
  {
    id: 'DETECTIVE_CASE',
    title: 'Detective Case',
    description: 'Collect clues and solve the mystery!',
    icon: 'magnify',
    color: 'from-slate-600 to-slate-800'
  },
  {
    id: 'JIGSAW_REVEAL',
    title: 'Jigsaw Reveal',
    description: 'Reveal puzzle pieces to see the secret picture.',
    icon: 'puzzle',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'COOKING_MASTER',
    title: 'Cooking Master',
    description: 'Add the right ingredients for a three-star dish!',
    icon: 'chef',
    color: 'from-yellow-500 to-orange-500'
  }
];

export const NEW_GAME_METADATA = {
  NINJA_SLICE: {
    intro: "🥷 Welcome, young Ninja! Answers are flying across the screen. SLICE only the correct ones — avoid the bombs! 💣",
    hit: ["⚔️ SWOOSH! Clean slice, Ninja!", "🥷💨 HAI-YA! Perfect cut!", "✨ Sliced like a MASTER!"],
    miss: ["💣 BONK! That was a bomb!", "⚔️❌ Blade bounced! Wrong target!", "🥷 Oops! Ninja missed. Focus!"],
    levelUp: "🥷 NINJA MASTER! Your blade is UNSTOPPABLE! ⚔️🏆"
  },
  MAZE_ESCAPE: {
    intro: "🌀 You are lost in the Labyrinth of Knowledge! Each gate is locked with a riddle. Answer correctly to escape before the darkness closes in! 🕯️",
    hit: ["✨ CLICK! The gate swings open!", "🌀 The path ahead is clear!", "🔑 Key found! Moving deeper..."],
    miss: ["🚪 CLANG! The door is barred!", "👻 A phantom blocks your path!", "💡 Focus! The maze is tricking you!"],
    levelUp: "🏆 MAZE MASTER! You found the exit and escaped with the Hidden Truth! 🌟✨"
  },
  TREASURE_DIVER: {
    intro: "🤿 Dive deep into the ocean! Answer correctly to swim deeper and find hidden treasures. Watch out for jellyfish! 🪼",
    hit: ["💎 SPLASH! You grabbed a gem!", "🤿⬇️ Deeper we go! Nice one!", "🐚 Pearl collected! Keep diving!"],
    miss: ["🪼 OUCH! Jellyfish sting! Float up...", "🌊 Whoops! Current pushed you back!", "🤿❌ Missed the treasure! Try again!"],
    levelUp: "🏆 OCEAN EXPLORER! You found the SUNKEN TREASURE! 💎🐠"
  },
  DRAGON_TRAINER: {
    intro: "🐉 Your baby dragon just hatched! Teach it new tricks by answering correctly. Help it grow into a MIGHTY BEAST! 🔥",
    hit: ["🐉🔥 ROAR! Dragon learned a new trick!", "✨ Amazing! Your dragon is getting stronger!", "🐉💪 Woohoo! Dragon did a flip!"],
    miss: ["🐉❓ Dragon looks confused... Try again!", "😅 Oops! Dragon shook its head. One more time!", "🐉💨 Not quite! Your dragon still believes in you!"],
    levelUp: "🐉🔥 EVOLUTION TIME! Your dragon grew BIGGER and STRONGER! 🏆✨"
  },
  ROCKET_LAUNCH: {
    intro: "🚀 Mission Control here! Answer correctly to FUEL your rocket. Fill the tank and... BLAST OFF to space! 🌟",
    hit: ["⛽🔥 FUEL UP! Tank is filling!", "🚀💨 More power! Almost ready!", "✅ Fuel added! Rocket is shaking!"],
    miss: ["⛽💧 Leak! Lost some fuel...", "🚀😬 Oops! Tank dropped a little!", "🔧 Small problem! Keep fueling!"],
    levelUp: "🚀🔥 3... 2... 1... BLAST OFF!!! You reached a NEW PLANET! 🪐🏆"
  }
};

export const ENEMIES: Enemy[] = [
  { id: 'e1', name: "Math Ogre", hp: 400, maxHp: 400, avatar: "👹", theme: 'fantasy' },
  { id: 'e2', name: "Glitch Firewall", hp: 350, maxHp: 350, avatar: "👾", theme: 'cyber' },
  { id: 'e3', name: "Void Dragon", hp: 500, maxHp: 500, avatar: "🐲", theme: 'fantasy' },
  { id: 'e4', name: "Cybernetic Guardian", hp: 450, maxHp: 450, avatar: "🤖", theme: 'cyber' },
  { id: 'e5', name: "Void Lurker", hp: 300, maxHp: 300, avatar: "👽", theme: 'space' },
  { id: 'e6', name: "Quantum Specter", hp: 380, maxHp: 380, avatar: "👻", theme: 'space' }
];
