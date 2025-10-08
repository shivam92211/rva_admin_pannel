import React from 'react';
import { validatePasswordStrength } from '../../utils/passwordValidator';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const { score, strength, feedback, color } = validatePasswordStrength(password);

  if (!password) {
    return null;
  }

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
      default:
        return 'bg-red-500';
    }
  };

  const getTextColorClasses = () => {
    switch (color) {
      case 'green':
        return 'text-green-400';
      case 'yellow':
        return 'text-yellow-400';
      case 'red':
      default:
        return 'text-red-400';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColorClasses()}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-xs font-medium capitalize ${getTextColorClasses()}`}>
          {strength}
        </span>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="text-xs text-slate-400">
          <div className="font-medium mb-1">Password must include:</div>
          <ul className="list-disc list-inside space-y-0.5">
            {feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
