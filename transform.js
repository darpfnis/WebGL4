// transform.js — функції трансформації, перспективи і буферів атрибутів
// (відповідно до вимог з PDF: окремі функції для кожного типу операції)

import { mat4 } from './webgl-utils.js';

// ── Функції трансформації 

// обертання по Y — передає матрицю в шейдер
export function rotate_Y(gl, thetaY, loc) {
  gl.uniformMatrix4fv(loc, false, mat4.rotationY(thetaY));
}

// обертання по X
export function rotate_X(gl, thetaX, loc) {
  gl.uniformMatrix4fv(loc, false, mat4.rotationX(thetaX));
}

// масштабування
export function applyScale(gl, sx, sy, sz, loc) {
  gl.uniformMatrix4fv(loc, false, mat4.scale(sx, sy, sz));
}

// переміщення
export function applyTranslation(gl, tx, ty, tz, loc) {
  gl.uniformMatrix4fv(loc, false, mat4.translation(tx, ty, tz));
}

// ── Функція перспективи 

// perspective(aspect, fov, near, far, loc)
// будує матрицю перспективи і передає в шейдер
export function perspective(gl, aspect, fovDeg, near, far, loc) {
  gl.uniformMatrix4fv(loc, false, mat4.perspective(fovDeg, aspect, near, far));
}

// ── Функція буфера атрибутів 

// passAttribData(gl, data, buffer, loc, size)
// завантажує дані в GPU і вмикає вершинний атрибут
export function passAttribData(gl, data, buffer, loc, size = 3) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
}

// ── Матриця камери 

// lookAt — будує V = basis × eye і передає в шейдер
export function applyCamera(gl, eye, center, up, loc) {
  gl.uniformMatrix4fv(loc, false, mat4.lookAt(eye, center, up));
}