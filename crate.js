// crate.js — initGL_1() та draw_crate()
// окрема шейдерна програма для ящика (завдання 3)

import { createProgram, mat4 }                     from './webgl-utils.js';
import { passAttribData, perspective, applyCamera } from './transform.js';
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

export function draw_crate(gl, state, ctx) {
  const { prog, posBuf, colBuf, locs, attribs } = ctx;
  gl.useProgram(prog);

  passAttribData(gl, crateGeometry.positions, posBuf, attribs.coords, 3);
  passAttribData(gl, crateGeometry.colors,    colBuf, attribs.colors, 3);

  gl.uniformMatrix4fv(locs.rotY,  false, state.rotYMat);
  gl.uniformMatrix4fv(locs.rotX,  false, state.rotXMat);
  gl.uniformMatrix4fv(locs.scale, false, state.crateScaleMat);
  gl.uniformMatrix4fv(locs.trans, false, state.transMat);

  applyCamera(gl, [0, 0.5, 3.5], [0, 0, 0], [0, 1, 0], locs.view);

  const aspect = gl.canvas.width / gl.canvas.height;
  perspective(gl, aspect, 45, 0.1, 20, locs.pers);

  gl.drawArrays(gl.TRIANGLES, 0, crateGeometry.count);
}