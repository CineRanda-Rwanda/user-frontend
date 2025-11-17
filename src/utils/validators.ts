// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

// Username validation (3-20 chars, alphanumeric and underscore)
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// Phone number validation (Rwanda format: +250XXXXXXXXX)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+250[0-9]{9}$/
  return phoneRegex.test(phone)
}

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Rating validation (0-5)
export const isValidRating = (rating: number): boolean => {
  return rating >= 0 && rating <= 5
}

// Validate form data
export interface ValidationResult {
  isValid: boolean
  errors: { [key: string]: string }
}

export const validateLoginForm = (data: {
  emailOrUsername: string
  password: string
}): ValidationResult => {
  const errors: { [key: string]: string } = {}

  if (!data.emailOrUsername) {
    errors.emailOrUsername = 'Email or username is required'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateRegisterForm = (data: {
  username: string
  email: string
  password: string
  confirmPassword: string
}): ValidationResult => {
  const errors: { [key: string]: string } = {}

  if (!data.username) {
    errors.username = 'Username is required'
  } else if (!isValidUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, underscore)'
  }

  if (!data.email) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email address'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number'
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validatePaymentForm = (data: {
  email: string
  phoneNumber: string
}): ValidationResult => {
  const errors: { [key: string]: string } = {}

  if (!data.email) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email address'
  }

  if (!data.phoneNumber) {
    errors.phoneNumber = 'Phone number is required'
  } else if (!isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number (format: +250XXXXXXXXX)'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
