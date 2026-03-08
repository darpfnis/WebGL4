// lid.js — initGL_2() та draw_lid()
// кришка = масштабована версія ящика (завдання 1)
// окрема шейдерна програма (завдання 3)
// ↑/↓ — відкривання/закривання (завдання 5)

import { createProgram, mat4 }                     from './webgl-utils.js';
import { passAttribData, perspective, applyCamera } from './transform.js';
import { lidGeometry }                              from './geometry.js';

// шейдер кришки — та сама структура що й ящик: M = Trans × RotX × RotY × Scale
const VS = `
  attribute vec3 a_coords;
  attribute vec3 a_colors;
  uniform mat4 u_RotY;
  uniform mat4 u_RotX;
  uniform mat4 u_Scale;
  uniform mat4 u_Trans;
  uniform mat4 u_View;
  uniform mat4 u_Pers;
  varying vec3 v_color;
  void main() {
    mat4 M   = u_Trans * u_RotX * u_RotY * u_Scale;
    mat4 MVP = u_Pers * u_View * M;
    gl_Position = MVP * vec4(a_coords, 1.0);
    v_color = a_colors;
  }
`;

const FS = `
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

export function initGL_2(gl) {
  const prog = createProgram(gl, VS, FS);

  const posBuf = gl.createBuffer();
  const colBuf = gl.createBuffer();

  const locs = {
    rotY:  gl.getUniformLocation(prog, 'u_RotY'),
    rotX:  gl.getUniformLocation(prog, 'u_RotX'),
    scale: gl.getUniformLocation(prog, 'u_Scale'),
    trans: gl.getUniformLocation(prog, 'u_Trans'),
    view:  gl.getUniformLocation(prog, 'u_View'),
    pers:  gl.getUniformLocation(prog, 'u_Pers'),
  };

  const attribs = {
    coords: gl.getAttribLocation(prog, 'a_coords'),
    colors: gl.getAttribLocation(prog, 'a_colors'),
  };

  return { prog, posBuf, colBuf, locs, attribs };
}

export function draw_lid(gl, state, ctx) {
  const { prog, posBuf, colBuf, locs, attribs } = ctx;
  gl.useProgram(prog);

  passAttribData(gl, lidGeometry.positions, posBuf, attribs.coords, 3);
  passAttribData(gl, lidGeometry.colors,    colBuf, attribs.colors, 3);

  // ── Кришка в тому самому просторі що й ящик ──────────────────────────────
  // Ящик: Trans(0,-0.3,0) × RotX(30°) × RotY × Scale(0.9,0.9,0.9)
  // Одиничний куб: Y від -0.5 до +0.5
  // Після Scale(0.9): Y від -0.45 до +0.45
  // Верхнє ребро ящика в LOCAL space (до RotX/RotY/Trans) = y = +0.45
  // Кришка — плоска: Scale(0.92, 0.10, 0.92)
  // Одиничний куб після цього: Y від -0.05 до +0.05
  // Відкривання: pivot = заднє ребро кришки (z = -0.46 в local space кришки)
  //   1. T(0, 0.50, 0)                → ставимо кришку на місце
  //   2. T(0, 0, -0.46)               → переносимо в pivot
  //   3. RotX(-lidAngle)              → відкриваємо
  //   4. T(0, 0, +0.46)               → повертаємо pivot


  const lidH    = 0.10;                 // товщина кришки
  const halfH   = lidH / 2;            // 0.05
  const crateHalfY = 0.45;             // ящик scale(0.9) → ±0.45
  const lidCenterY = crateHalfY + halfH; // 0.50 — центр кришки над ящиком
  const pivotZ  = 0.46;                // задній край кришки по Z (0.92/2)

  // pivot-обертання: T(-pivotZ) × RotX × T(+pivotZ)
  const toPivot   = mat4.translation(0, 0,  pivotZ);
  const fromPivot = mat4.translation(0, 0, -pivotZ);
  const openRot   = mat4.rotationX(-state.lidAngle);

  const pivotOpen = mat4.multiply(toPivot, mat4.multiply(openRot, fromPivot));

  // localModel: підйом → pivot-відкривання → масштаб
  const liftUp    = mat4.translation(0, lidCenterY, 0);
  const lidScale  = mat4.scale(0.92, lidH, 0.92);

  const localModel = mat4.multiply(liftUp, mat4.multiply(pivotOpen, lidScale));


  gl.uniformMatrix4fv(locs.scale, false, localModel);
  gl.uniformMatrix4fv(locs.rotY,  false, state.rotYMat);
  gl.uniformMatrix4fv(locs.rotX,  false, state.rotXMat);
  gl.uniformMatrix4fv(locs.trans, false, state.transMat);

  applyCamera(gl, [0, 0.5, 3.5], [0, 0, 0], [0, 1, 0], locs.view);

  const aspect = gl.canvas.width / gl.canvas.height;
  perspective(gl, aspect, 45, 0.1, 20, locs.pers);

  gl.drawArrays(gl.TRIANGLES, 0, lidGeometry.count);
}