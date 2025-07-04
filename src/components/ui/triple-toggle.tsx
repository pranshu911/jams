import React from 'react';

interface TripleToggleProps {
  labels: [string, string, string];
  value: 'left' | 'center' | 'right';
  onChange: (value: 'left' | 'center' | 'right') => void;
  className?: string;
}

export const TripleToggle: React.FC<TripleToggleProps> = ({ labels, value, onChange, className }) => {
  // Calculate left position as a percentage for the sliding background
  const getLeft = () => {
    if (value === 'left') return '0%';
    if (value === 'center') return '33.3333%';
    return '66.6666%';
  };

  return (
    <div className={`relative flex items-center justify-between w-64 h-12 rounded-full bg-muted shadow-inner px-2 ${className || ''}`}> 
      {/* Switch background */}
      <div
        className="absolute top-1 h-10 w-1/3 rounded-full bg-background shadow transition-all duration-300 z-0"
        style={{ left: getLeft(), transition: 'left 0.3s cubic-bezier(.4,0,.2,1)' }}
      />
      {/* Options */}
      {(['left', 'center', 'right'] as const).map((pos, idx) => (
        <button
          key={pos}
          type="button"
          className={`relative z-10 flex-1 h-10 flex items-center justify-center rounded-full transition-colors duration-200
            ${value === pos ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
          style={{ minWidth: 80 }}
          onClick={() => onChange(pos)}
        >
          {labels[idx]}
        </button>
      ))}
    </div>
  );
};

export default TripleToggle; 