// input.js — ←/→ обертання по Y, ↑/↓ відкривання кришки

const STEP_Y   = Math.PI / 18; // 10° за натискання
const STEP_LID = Math.PI / 12; // 15° за натискання
const LID_MAX  = Math.PI / 2;  // 90° max

export function initInput(state, onUpdate) {
  const active = new Set();
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { state.rotY -= STEP_Y; active.add('left'); }
    if (e.key === 'ArrowRight') { state.rotY += STEP_Y; active.add('right'); }
    if (e.key === 'ArrowUp')    { state.lidAngle = Math.min(state.lidAngle + STEP_LID, LID_MAX); active.add('up');   e.preventDefault(); }
    if (e.key === 'ArrowDown')  { state.lidAngle = Math.max(state.lidAngle - STEP_LID, 0);       active.add('down'); e.preventDefault(); }
    onUpdate(active);
  });
  document.addEventListener('keyup', e => {
    const m = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
    if (m[e.key]) active.delete(m[e.key]);
    onUpdate(active);
  });
}