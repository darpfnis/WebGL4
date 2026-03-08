// input.js — обробка клавіатури (стрілки)
// ←/→  — обертання ящика+кришки по Y (завдання 4)
// ↑/↓  — відкриття / закриття кришки (завдання 5)

const STEP_Y   = Math.PI / 18; // 10° за натискання
const STEP_LID = Math.PI / 12; // ~15° за натискання
const LID_MAX  = Math.PI / 2;  // максимум відкриття — 90°

export function initInput(state, onUpdate) {
  const active = new Set();

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowLeft':
        state.rotY -= STEP_Y;
        active.add('left');
        break;
      case 'ArrowRight':
        state.rotY += STEP_Y;
        active.add('right');
        break;
      case 'ArrowUp':
        // відкриваємо кришку
        state.lidAngle = Math.min(state.lidAngle + STEP_LID, LID_MAX);
        active.add('up');
        e.preventDefault();
        break;
      case 'ArrowDown':
        // закриваємо кришку
        state.lidAngle = Math.max(state.lidAngle - STEP_LID, 0);
        active.add('down');
        e.preventDefault();
        break;
    }
    onUpdate(active);
  });

  document.addEventListener('keyup', e => {
    const map = {
      ArrowLeft: 'left', ArrowRight: 'right',
      ArrowUp: 'up', ArrowDown: 'down',
    };
    if (map[e.key]) active.delete(map[e.key]);
    onUpdate(active);
  });
}