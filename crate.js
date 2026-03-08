// crate.js — initGL_1() та draw_crate()
// окрема шейдерна програма для ящика (завдання 3)

import { createProgram }                           from './webgl-utils.js';
import { passAttribData, perspective, applyCamera } from './transform.js';
import { crateGeometry }                            from './geometry.js';

// шейдер ящика: M = Trans × RotX × RotY × Scale
// V = камера (lookAt), P = перспектива
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
    mat4 MVP = u_Pers  * u_View * M;
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

export function initGL_1(gl) {
  const prog = createProgram(gl, VS, FS);

  // буфери під позиції та кольори
  const posBuf = gl.createBuffer();
  const colBuf = gl.createBuffer();

  // локації uniform-змінних
  const locs = {
    rotY:  gl.getUniformLocation(prog, 'u_RotY'),
    rotX:  gl.getUniformLocation(prog, 'u_RotX'),
    scale: gl.getUniformLocation(prog, 'u_Scale'),
    trans: gl.getUniformLocation(prog, 'u_Trans'),
    view:  gl.getUniformLocation(prog, 'u_View'),
    pers:  gl.getUniformLocation(prog, 'u_Pers'),
  };

  // локації атрибутів
  const attribs = {
    coords: gl.getAttribLocation(prog, 'a_coords'),
    colors: gl.getAttribLocation(prog, 'a_colors'),
  };

  return { prog, posBuf, colBuf, locs, attribs };
}

export function draw_crate(gl, state, ctx) {
  const { prog, posBuf, colBuf, locs, attribs } = ctx;
  gl.useProgram(prog);

  // завантажуємо геометрію через passAttribData
  passAttribData(gl, crateGeometry.positions, posBuf, attribs.coords, 3);
  passAttribData(gl, crateGeometry.colors,    colBuf, attribs.colors, 3);

  // трансформації: починаємо з кута 30° по X і Y 
  gl.uniformMatrix4fv(locs.rotY,  false, state.rotYMat);
  gl.uniformMatrix4fv(locs.rotX,  false, state.rotXMat);
  gl.uniformMatrix4fv(locs.scale, false, state.crateScaleMat);
  gl.uniformMatrix4fv(locs.trans, false, state.transMat);

  // камера і перспектива
  applyCamera(gl,
    [0, 0.5, 3.5],   // позиція камери
    [0, 0, 0],        // дивимося на центр
    [0, 1, 0],        // вектор вгору
    locs.view
  );

  const aspect = gl.canvas.width / gl.canvas.height;
  perspective(gl, aspect, 45, 0.1, 20, locs.pers);

  gl.drawArrays(gl.TRIANGLES, 0, crateGeometry.count);
}