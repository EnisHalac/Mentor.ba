
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && emailRegex.test(email);
}

export function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}