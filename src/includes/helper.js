export function formatTime(time) {
  const minutes = Math.round(time / 60) || 0;
  const seconds = Math.round(time - minutes * 60 || 0);

  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
