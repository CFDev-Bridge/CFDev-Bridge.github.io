// Aplica el tema guardado antes del primer pintado para evitar el parpadeo de colores.
// Se carga como script clásico y bloqueante en <head>; el resto de la lógica vive en main.js.
(function applyStoredTheme() {
  try {
    var theme = window.localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (error) {
    // Almacenamiento bloqueado (modo privado, políticas del navegador): se usa el tema del sistema.
    console.warn("No se pudo leer el tema guardado:", error && error.message);
  }
})();
