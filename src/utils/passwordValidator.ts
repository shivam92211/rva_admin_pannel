export interface PasswordStrength {
  score: number; // 0-100
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
  color: string;
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return {
      score: 0,
      strength: 'weak',
      feedback: ['Password is required'],
      color: 'red',
    };
  }

  // Length scoring
  if (password.length >= 8) {
    score += Math.min(20, password.length * 2);
  } else {
    feedback.push('At least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 20;
  } else {
    feedback.push('One uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 20;
  } else {
    feedback.push('One lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 20;
  } else {
    feedback.push('One number');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 20;
  } else {
    feedback.push('One special character');
  }

  // Penalize common patterns
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^admin/i,
    /(.)\1{2,}/, // Repeated characters
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score -= 20;
    feedback.push('Avoid common patterns');
  }

  // Determine strength and color
  let strength: 'weak' | 'medium' | 'strong';
  let color: string;

  score = Math.max(0, Math.min(100, score));

  if (score >= 80) {
    strength = 'strong';
    color = 'green';
  } else if (score >= 50) {
    strength = 'medium';
    color = 'yellow';
  } else {
    strength = 'weak';
    color = 'red';
  }

  return {
    score,
    strength,
    feedback,
    color,
  };
};
