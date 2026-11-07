// Separate read-only diagnostics from the application entry to avoid starting a
// second game when development tools import it after a Vite module refresh.
let reader = () => ({});
export function registerStateReader(read) { reader = read; }
export function getGameState() { return reader(); }
