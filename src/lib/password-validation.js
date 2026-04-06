/**
 * Password Validation for Enhanced Security
 */

/**
 * Validates that a password meets security requirements
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export function validatePassword(password) {
  const errors = [];

  // Minimum length of 8 characters
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // Maximum length of 128 characters
  if (password.length > 128) {
    errors.push('Password is too long');
  }

  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Must contain at least one number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Must contain at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};:\'"\\|,.<>\/?)');
  }

  // Verify that it doesn't contain spaces
  if (/\s/.test(password)) {
    errors.push('Password must not contain spaces');
  }

  // Verify that it's not a common weak password
  const commonPasswords = [
    'password', 'Password123', '12345678', 'qwerty123', 'admin123',
    'letmein', 'welcome', 'monkey', 'dragon', 'football'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more secure one.');
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join('. ') : null,
    errors
  };
}

/**
 * Calculates password strength
 * @param {string} password - Password to evaluate
 * @returns {object} - { score: number, label: string }
 */
export function getPasswordStrength(password) {
  let score = 0;

  // Base length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character complexity
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  // Maximum score is 8
  score = Math.min(score, 8);

  let label = 'Very weak';
  if (score >= 2) label = 'Weak';
  if (score >= 4) label = 'Medium';
  if (score >= 6) label = 'Strong';
  if (score >= 7) label = 'Very strong';

  return { score, label };
}

/**
 * Generates suggestions to improve password
 * @param {string} password - Current password
 * @returns {string[]} - Array of suggestions
 */
export function getPasswordSuggestions(password) {
  const suggestions = [];
  const validation = validatePassword(password);

  if (!validation.isValid) {
    suggestions.push(...validation.errors);
  }

  // Additional suggestions for already valid but improvable passwords
  if (password.length >= 8 && password.length < 12) {
    suggestions.push('Consider using a longer password (12+ characters) for better security');
  }

  if (validation.isValid && getPasswordStrength(password).score < 7) {
    suggestions.push('Consider adding more character variety for better security');
  }

  return suggestions;
}