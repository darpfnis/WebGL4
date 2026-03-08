// lid.js — initGL_2() та draw_lid()

import { createProgram, mat4 }                     from './webgl-utils.js';
import { passAttribData, perspective, applyCamera } from './transform.js';
// ВИПРАВЛЕНО: імпортуємо crateGeometry, щоб назва збігалася з тією, що в draw_lid
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
    // Важливо: u_Trans має включати в себе всі трансформації моделі
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

  // Тепер crateGeometry визначена завдяки правильному імпорту
  passAttribData(gl, crateGeometry.positions, posBuf, attribs.coords, 3);
  passAttribData(gl, crateGeometry.colors,    colBuf, attribs.colors, 3);

  // --- Налаштування розмірів та позиції ---
  const crateScale = 0.9;   // Масштаб ящика з main.js
  const lidH = 0.05;        // Робимо кришку тонкою (було 0.10)
  
  // Розрахунок висоти: ящик має висоту 1.0 * 0.9 = 0.9. 
  // Верхня грань ящика знаходиться на Y = 0.45 (половина висоти)
  const crateTopY = 0.5 * crateScale; 
  const lidCenterY = crateTopY + (lidH / 2); // Центр кришки точно над ящиком

  // Точка обертання (Pivot) на задньому ребрі (Z = -0.45)
  const pivotZ = -0.5 * crateScale;

  // Матриці для анімації відкриття
  const toPivot   = mat4.translation(0, 0, pivotZ);
  const fromPivot = mat4.translation(0, 0, -pivotZ);
  const openRot   = mat4.rotationX(-state.lidAngle);
  const pivotMat  = mat4.multiply(fromPivot, mat4.multiply(openRot, toPivot));

  // Збірка фінальної матриці моделі
  // 1. Починаємо з загальних трансформацій сцени (перенос та поворот Y)
  let modelMat = mat4.multiply(state.transMat, state.rotYMat);
  
  // 2. Додаємо підйом кришки на верх ящика
  modelMat = mat4.multiply(modelMat, mat4.translation(0, lidCenterY, 0));
  
  // 3. Додаємо обертання відкриття навколо заднього ребра
  modelMat = mat4.multiply(modelMat, pivotMat);
  
  // 4. Застосовуємо масштаб (0.9 щоб збігалося з ящиком, lidH для тонкості)
  modelMat = mat4.multiply(modelMat, mat4.scale(crateScale, lidH, crateScale));

  // Передаємо результат у шейдер
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