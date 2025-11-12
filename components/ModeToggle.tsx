
import React from 'react';
import { Mode } from '../types';

interface ModeToggleProps {
  selectedMode: Mode;
  setSelectedMode: (mode: Mode) => void;
}

const modes: Mode[] = [Mode.Social, Mode.Professional, Mode.Both];

const ModeToggle: React.FC<ModeToggleProps> = ({ selectedMode, setSelectedMode }) => {
  return (
    <div className="flex bg-slate-200 p-1 rounded-full">
      {modes.map(mode => {
        const isSelected = selectedMode === mode;
        return (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
              ${isSelected ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300/50'}`}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
