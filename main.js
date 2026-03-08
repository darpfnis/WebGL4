// main.js

import { setupWebGL } from './webgl-utils.js';
import { initGL_1, draw_crate } from './crate.js';
import { initGL_2, draw_lid   } from './lid.js';
import { initInput }             from './input.js';

window.onload = function () {
  const gl = setupWebGL('main-canvas');
  if (!gl) return;
  gl.enable(gl.DEPTH_TEST);

  // початковий кут 30° по X і Y (вимога PDF)
  const state = {
    rotY:     Math.PI / 6,
    lidAngle: 0,
  };

  const crateCtx = initGL_1(gl);
  const lidCtx   = initGL_2(gl);

  initInput(state, active => {
    ['left','right','up','down'].forEach(k => {
      const el = document.getElementById(`kbd-${k}`);
      if (el) el.classList.toggle('active-key', active.has(k));
    });
  });

  function render() {
    gl.clearColor(0.165, 0.153, 0.145, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw_crate(gl, state, crateCtx);
    draw_lid(gl, state, lidCtx);

    const el = document.getElementById('status-info');
    if (el) {
      const ry = (((state.rotY * 180 / Math.PI) % 360) + 360) % 360;
      const ld = Math.round(state.lidAngle * 180 / Math.PI);
      el.textContent = `rotY: ${Math.round(ry)}° · lid: ${ld}°`;
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
};