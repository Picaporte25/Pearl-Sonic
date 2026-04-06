/**
 * Validación de contraseñas para mayor seguridad
 */

/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export function validatePassword(password) {
  const errors = [];

  // Longitud mínima de 8 caracteres
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  // Longitud máxima de 128 caracteres
  if (password.length > 128) {
    errors.push('La contraseña es demasiado larga');
  }

  // Debe contener al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  // Debe contener al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  // Debe contener al menos un número
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  // Debe contener al menos un carácter especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{};:\'"\\|,.<>\/?)');
  }

  // Verificar que no contenga espacios
  if (/\s/.test(password)) {
    errors.push('La contraseña no debe contener espacios');
  }

  // Verificar que no sea una contraseña común débil
  const commonPasswords = [
    'password', 'Password123', '12345678', 'qwerty123', 'admin123',
    'letmein', 'welcome', 'monkey', 'dragon', 'football'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('La contraseña es demasiado común. Por favor elige una más segura.');
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join('. ') : null,
    errors
  };
}

/**
 * Calcula la fortaleza de una contraseña
 * @param {string} password - Contraseña a evaluar
 * @returns {object} - { score: number, label: string }
 */
export function getPasswordStrength(password) {
  let score = 0;

  // Longitud base
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Complejidad de caracteres
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  // Máximo puntaje es 8
  score = Math.min(score, 8);

  let label = 'Muy débil';
  if (score >= 2) label = 'Débil';
  if (score >= 4) label = 'Media';
  if (score >= 6) label = 'Fuerte';
  if (score >= 7) label = 'Muy fuerte';

  return { score, label };
}

/**
 * Genera sugerencias para mejorar la contraseña
 * @param {string} password - Contraseña actual
 * @returns {string[]} - Array de sugerencias
 */
export function getPasswordSuggestions(password) {
  const suggestions = [];
  const validation = validatePassword(password);

  if (!validation.isValid) {
    suggestions.push(...validation.errors);
  }

  // Sugerencias adicionales para contraseñas ya válidas pero mejorables
  if (password.length >= 8 && password.length < 12) {
    suggestions.push('Considera usar una contraseña más larga (12+ caracteres) para mayor seguridad');
  }

  if (validation.isValid && getPasswordStrength(password).score < 7) {
    suggestions.push('Considera agregar más variedad de caracteres para mayor seguridad');
  }

  return suggestions;
}