// transform.js — функції трансформації, перспективи, буферів атрибутів
import { mat4 } from './webgl-utils.js';

// rotate_Y(thetaY, loc) — обертання по Y
export function rotate_Y(gl, thetaY, loc) {
  gl.uniformMatrix4fv(loc, false, mat4.rotY(thetaY));
}

// perspective(aspect, fov, near, far, loc) — матриця перспективи в шейдер
export function perspective(gl, aspect, fovDeg, near, far, loc) {
  gl.uniformMatrix4fv(loc, false, mat4.perspective(fovDeg, aspect, near, far));
}

// passAttribData(data, buffer, loc) — завантажує дані атрибута в GPU
export function passAttribData(gl, data, buffer, loc) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
}