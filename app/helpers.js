export function validFilename(filename) {
  if (!filename || filename.length === 0) return false;

  return /^([\w][\w.]*\/)*[\w][\w.]*$/.test(filename);
}
