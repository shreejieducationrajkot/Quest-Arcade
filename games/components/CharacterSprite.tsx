
import React from 'react';
import { motion } from 'framer-motion';

interface CharacterSpriteProps {
  avatar: string;
  action?: 'idle' | 'walk' | 'jump' | 'attack' | 'hit' | 'win' | 'lose';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'left' | 'right'; // 'left' means facing right (default), 'right' means facing left (enemy)
  className?: string;
}

const MotionDiv = motion.div as any;

const CharacterSprite: React.FC<CharacterSpriteProps> = ({ 
  avatar, 
  action = 'idle', 
  size = 'md',
  direction = 'left',
  className = ''
}) => {
  const getSizeClass = () => {
    switch(size) {
      case 'sm': return 'text-4xl';
      case 'lg': return 'text-8xl';
      case 'xl': return 'text-[8rem] md:text-[10rem]';
      default: return 'text-6xl';
    }
  };

  // Direction modifier for X movement
  const dirMult = direction === 'left' ? 1 : -1;

  const getAnimation = () => {
    switch(action) {
      case 'walk':
        return { 
          y: [0, -10, 0],
          rotate: [0, -5 * dirMult, 5 * dirMult, 0],
          transition: { repeat: Infinity, duration: 0.6 }
        };
      case 'jump':
        return { 
          y: [0, -80, 0],
          scale: [1, 0.9, 1],
          transition: { duration: 0.5 }
        };
      case 'attack':
        return { 
          x: [0, 80 * dirMult, 0],
          rotate: [0, 15 * dirMult, 0],
          scale: [1, 1.2, 1],
          transition: { duration: 0.4, type: "spring", stiffness: 300 }
        };
      case 'hit':
        return { 
          x: [-10, 10, -10, 10, 0],
          filter: ['brightness(1)', 'brightness(2) hue-rotate(90deg)', 'brightness(1)'],
          scale: [1, 0.9, 1],
          transition: { duration: 0.4 }
        };
      case 'win':
        return { 
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
          rotate: [0, -10, 10, 0],
          transition: { repeat: Infinity, duration: 1 }
        };
      case 'lose':
        return {
          opacity: 0.5,
          scale: 0.8,
          filter: 'grayscale(100%)',
          rotate: [0, 10, -10, 0], // dizzy
          transition: { duration: 0.5 }
        };
      case 'idle':
      default:
        return { 
          y: [0, -5, 0],
          scale: [1, 1.02, 1],
          transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        };
    }
  };

  return (
    <div className={`relative ${className}`}>
      <MotionDiv
        className={`${getSizeClass()} filter drop-shadow-xl cursor-default select-none`}
        style={{ scaleX: direction === 'right' ? -1 : 1, transformOrigin: 'center bottom' } as any}
        animate={getAnimation()}
      >
        {avatar}
      </MotionDiv>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-black/20 rounded-[100%] blur-sm -z-10 scale-x-100" />
    </div>
  );
};

export default CharacterSprite;
