import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'yellow' | 'red' | 'green';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'md',
  color = 'yellow',
  className = '',
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorStyles = {
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
    green: 'bg-green-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${colorStyles[color]} ${sizeStyles[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-400 mt-1">{Math.round(clampedValue)}%</p>
      )}
    </div>
  );
};
