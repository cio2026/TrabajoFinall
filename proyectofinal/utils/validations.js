
export const validateLogin = ({ email, password }) => {
  if (!email.trim()) return "Ingresá tu correo electrónico.";

  if (!password) return "Ingresá tu contraseña.";

  if (!email.includes("@")) return "El correo electrónico no es válido.";

  return null;
};

export const validateRegister = ({
  name,
  email,
  password,
  confirmPassword
}) => {
  if (!name.trim()) return "Ingresá tu nombre.";

  if (!email.trim() || !email.includes("@")) {
    return "Ingresá un correo electrónico válido.";
  }

  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (password !== confirmPassword) {
    return "Las contraseñas no coinciden.";
  }

  return null;
};
