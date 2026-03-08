// lid.js — initGL_2() та draw_lid()

import { createProgram, mat4 }                     from './webgl-utils.js';
import { passAttribData, perspective, applyCamera } from './transform.js';
// ВИПРАВЛЕНО: імпортуємо crateGeometry, бо саме цей об'єкт містить масиви вершин
import { crateGeometry }                            from './geometry.js'; 

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
    // Порядок множення: Перенос * Обертання * Масштаб
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

  // Використовуємо crateGeometry (яку ми тепер правильно імпортували)
  passAttribData(gl, crateGeometry.positions, posBuf, attribs.coords, 3);
  passAttribData(gl, crateGeometry.colors,    colBuf, attribs.colors, 3);

  // --- РОЗРАХУНОК ГЕОМЕТРІЇ КРИШКИ ---
  const crateScale = 0.9;   // має відповідати масштабу ящика в main.js
  const lidH = 0.05;        // товщина кришки (робимо тонкою)
  
  // Висота ящика після масштабування: 1.0 * 0.9 = 0.9. 
  // Центр ящика в 0, отже верхня грань на +0.45
  const crateTopY = 0.5 * crateScale; 
  
  // Центр кришки має бути над верхньою гранню ящика
  const lidCenterY = crateTopY + (lidH / 2);

  // Точка обертання (Pivot) на задньому ребрі ящика (Z = -0.45)
  const pivotZ = -0.5 * crateScale;

  // 1. Створюємо матрицю трансформації для кришки вручну
  // Порядок: Світовий перенос -> Світове обертання Y -> Підйом наверх -> Обертання відкриття (Pivot) -> Масштаб
  
  // Матриця відкриття навколо заднього ребра
  const toPivot   = mat4.translation(0, 0, pivotZ);
  const fromPivot = mat4.translation(0, 0, -pivotZ);
  const openRot   = mat4.rotationX(-state.lidAngle);
  const pivotMat  = mat4.multiply(fromPivot, mat4.multiply(openRot, toPivot));

  let modelMat = mat4.multiply(state.transMat, state.rotYMat); // Загальний рух сцени
  modelMat = mat4.multiply(modelMat, mat4.translation(0, lidCenterY, 0)); // Ставимо на ящик
  modelMat = mat4.multiply(modelMat, pivotMat); // Відкриваємо
  modelMat = mat4.multiply(modelMat, mat4.scale(crateScale, lidH, crateScale)); // Робимо пласкою і потрібної ширини

  // Передаємо фінальну матрицю в u_Trans, інші робимо одиничними
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