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

  passAttribData(gl, crateGeometry.positions, posBuf, attribs.coords, 3);
  passAttribData(gl, crateGeometry.colors,    colBuf, attribs.colors, 3);

  // 1. Параметри розмірів
  const lidH = 0.05;                // Зменшимо товщину кришки для кращого вигляду
  const crateScale = 0.9;           // Має збігатися з масштабом у main.js
  const crateHeight = 1.0 * crateScale; 
  const halfCrateHeight = crateHeight / 2;
  
  // Координата Y для центру кришки, щоб вона лежала ПОВЕРХ ящика
  // -0.3 — це зміщення всього ящика вниз у main.js
  const lidCenterY = halfCrateHeight + (lidH / 2); 

  // 2. Налаштування Pivot (точка обертання на задньому ребрі)
  const pivotZ = 0.5 * crateScale; // Заднє ребро ящика по осі Z
  
  const toPivot   = mat4.translation(0, 0, pivotZ);
  const fromPivot = mat4.translation(0, 0, -pivotZ);
  const openRot   = mat4.rotationX(-state.lidAngle);

  // Матриця відкриття: перенос в pivot -> поворот -> повернення
  const pivotOpen = mat4.multiply(toPivot, mat4.multiply(openRot, fromPivot));

  // 3. Комбінація трансформацій
  // Порядок: Світове зміщення * Обертання сцени * Підйом наверх ящика * Відкриття * Масштаб
  let modelMat = mat4.multiply(state.transMat, state.rotYMat); // Загальні Т та R
  modelMat = mat4.multiply(modelMat, mat4.translation(0, halfCrateHeight, 0)); // На верхню грань
  modelMat = mat4.multiply(modelMat, pivotOpen); // Обертання кришки
  modelMat = mat4.multiply(modelMat, mat4.translation(0, lidH / 2, 0)); // Центрування товщини
  modelMat = mat4.multiply(modelMat, mat4.scale(crateScale, lidH, crateScale)); // Масштаб як у ящика

  // 4. Передача матриць у шейдер
  // Оскільки у вашому VS матриця M = u_Trans * u_RotX * u_RotY * u_Scale,
  // для коректної роботи з нашою modelMat передамо її в u_Trans, а інші зробимо одиничними
  gl.uniformMatrix4fv(locs.trans, false, modelMat);
  gl.uniformMatrix4fv(locs.rotX,  false, mat4.identity());
  gl.uniformMatrix4fv(locs.rotY,  false, mat4.identity());
  gl.uniformMatrix4fv(locs.scale, false, mat4.identity());

  // Камера та перспектива
  applyCamera(gl, locs.view);
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  perspective(gl, aspect, 45, 0.1, 100, locs.pers);

  gl.drawArrays(gl.TRIANGLES, 0, crateGeometry.positions.length / 3);
}