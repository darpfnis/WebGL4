// lid.js — initGL_2() та draw_lid()
// кришка = плоска масштабована версія ящика, лежить зверху
// відкривання: обертання навколо заднього ребра (pivot = задній край верху ящика)

import { createProgram, mat4 }                     from './webgl-utils.js';
import { passAttribData, perspective, applyCamera } from './transform.js';
import { lidGeometry }                              from './geometry.js';

const VS = `
  attribute vec3 a_coords;
  attribute vec3 a_colors;
  uniform mat4 u_RotY;
  uniform mat4 u_RotX;
  uniform mat4 u_Model;
  uniform mat4 u_View;
  uniform mat4 u_Pers;
  varying vec3 v_color;
  void main() {
    mat4 MVP = u_Pers * u_View * u_RotX * u_RotY * u_Model;
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
    model: gl.getUniformLocation(prog, 'u_Model'),
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

  const scaleX    = 0.97;
  const scaleY    = 0.12;
  const scaleZ    = 0.97;
  const halfH     = scaleY / 2;        // 0.06 — половина висоти кришки
  const crateTop  = 0.45 - 0.3;       // верх ящика в world space = 0.15
  const pivotZ    = -scaleZ / 2;       // задній край по Z

  // крок 1: масштабуємо
  const S = mat4.scale(scaleX, scaleY, scaleZ);

  // крок 2: піднімаємо куб так щоб його підошва = y=0
  const liftToBase = mat4.translation(0, halfH, 0);

  // крок 3+4+5: pivot-обертання навколо заднього ребра (y=0, z=pivotZ)
  //   T(0, 0, -pivotZ) × RotX(lidAngle) × T(0, 0, pivotZ)
  const toPivot     = mat4.translation(0, 0, -pivotZ);
  const fromPivot   = mat4.translation(0, 0,  pivotZ);
  const openRot     = mat4.rotationX(-state.lidAngle); // від'ємний = відкривається вперед-вгору

  const pivotOpen = mat4.multiply(
    toPivot,
    mat4.multiply(openRot, fromPivot)
  );

  // крок 6: переміщуємо кришку на верх ящика
  const placeOnTop = mat4.translation(0, crateTop, 0);

  // складаємо model: placeOnTop × pivotOpen × liftToBase × S
  const model = mat4.multiply(
    placeOnTop,
    mat4.multiply(pivotOpen, mat4.multiply(liftToBase, S))
  );

  gl.uniformMatrix4fv(locs.model, false, model);
  gl.uniformMatrix4fv(locs.rotY,  false, state.rotYMat);
  gl.uniformMatrix4fv(locs.rotX,  false, state.rotXMat);

  applyCamera(gl, [0, 0.5, 3.5], [0, 0, 0], [0, 1, 0], locs.view);

  const aspect = gl.canvas.width / gl.canvas.height;
  perspective(gl, aspect, 45, 0.1, 20, locs.pers);

  gl.drawArrays(gl.TRIANGLES, 0, lidGeometry.count);
}