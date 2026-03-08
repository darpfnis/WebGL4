// main.js — точка входу

import { setupWebGL, mat4 } from './webgl-utils.js';
import { initGL_1, draw_crate } from './crate.js';
import { initGL_2, draw_lid   } from './lid.js';
import { initInput }             from './input.js';

window.onload = function () {
  const gl = setupWebGL('main-canvas');
  if (!gl) return;

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  // ── Стан сцени ─────────────────────────────────────────────────────────
  // початковий кут 30° по X і Y (вимога PDF)
  const state = {
    rotY:     Math.PI / 6,   // 30°
    lidAngle: 0,             // кут відкриття кришки (0 = закрита)

    get rotYMat()       { return mat4.rotationY(this.rotY); },
    get rotXMat()       { return mat4.rotationX(Math.PI / 6); }, // фіксований нахил 30°
    get transMat()      { return mat4.translation(0, -0.3, 0); },
    get crateScaleMat() { return mat4.scale(0.9, 0.9, 0.9); },
    // кришка — масштабована версія ящика (трохи ширша, плоша)
    get lidScaleMat()   { return mat4.scale(0.92, 0.18, 0.92); },
  };

  // ── Ініціалізація шейдерів 
  // initGL_1 — ящик, initGL_2 — кришка (окремі програми, завдання 3)
  const crateCtx = initGL_1(gl);
  const lidCtx   = initGL_2(gl);

  // ── Клавіатура 
  initInput(state, activeKeys => updateKeyHints(activeKeys));

  // ── Render loop 
  function render() {
    gl.clearColor(0.165, 0.153, 0.145, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    draw_crate(gl, state, crateCtx);
    draw_lid(gl, state, lidCtx);

    updateStatus(state);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
};

// ── Оновлення UI 

function updateStatus(state) {
  const el = document.getElementById('status-info');
  if (!el) return;
  const rotDeg = Math.round(state.rotY * 180 / Math.PI) % 360;
  const lidDeg = Math.round(state.lidAngle * 180 / Math.PI);
  el.textContent = `rotY: ${rotDeg}° · lid: ${lidDeg}°`;
}

function updateKeyHints(active) {
  const map = {
    'left':  'kbd-left',
    'right': 'kbd-right',
    'up':    'kbd-up',
    'down':  'kbd-down',
  };
  for (const [key, id] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.classList.toggle('active-key', active.has(key));
  }
}