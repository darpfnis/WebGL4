// crate.js v2 — initGL_1() та draw_crate()

import { createProgram, mat4 }                      from './webgl-utils.js';
import { passAttribData, rotate_Y, perspective }  from './transform.js';
import { crateGeo }                                  from './geometry.js';

const VS = `
  attribute vec3 a_coords;
  attribute vec3 a_colors;
  uniform mat4 u_RotY;
  uniform mat4 u_RotX;
  uniform mat4 u_Scale;
  uniform mat4 u_Trans;
  uniform mat4 u_Basis;
  uniform mat4 u_Eye;
  uniform mat4 u_Pers;
  varying vec3 v_color;
  void main() {
    mat4 M   = u_Trans * u_RotX * u_RotY * u_Scale;
    mat4 V   = u_Basis * u_Eye;
    mat4 MVP = u_Pers  * V * M;
    gl_Position = MVP * vec4(a_coords, 1.0);
    v_color = a_colors;
  }
`;
const FS = `
  precision mediump float;
  varying vec3 v_color;
  void main() { gl_FragColor = vec4(v_color, 1.0); }
`;

export function initGL_1(gl) {
  const prog = createProgram(gl, VS, FS);
  return {
    prog,
    posBuf: gl.createBuffer(),
    colBuf: gl.createBuffer(),
    locs: {
      rotY:  gl.getUniformLocation(prog, 'u_RotY'),
      rotX:  gl.getUniformLocation(prog, 'u_RotX'),
      scale: gl.getUniformLocation(prog, 'u_Scale'),
      trans: gl.getUniformLocation(prog, 'u_Trans'),
      basis: gl.getUniformLocation(prog, 'u_Basis'),
      eye:   gl.getUniformLocation(prog, 'u_Eye'),
      pers:  gl.getUniformLocation(prog, 'u_Pers'),
    },
    attribs: {
      coords: gl.getAttribLocation(prog, 'a_coords'),
      colors: gl.getAttribLocation(prog, 'a_colors'),
    },
  };
}

export function draw_crate(gl, state, ctx) {
  const { prog, posBuf, colBuf, locs, attribs } = ctx;
  gl.useProgram(prog);

  passAttribData(gl, crateGeo.pos, posBuf, attribs.coords);
  passAttribData(gl, crateGeo.col, colBuf, attribs.colors);

  rotate_Y(gl, state.rotY, locs.rotY);
  gl.uniformMatrix4fv(locs.rotX,  false, mat4.rotX(Math.PI / 6));
  gl.uniformMatrix4fv(locs.scale, false, mat4.scale(0.9, 0.9, 0.9));
  gl.uniformMatrix4fv(locs.trans, false, mat4.trans(0, -0.3, 0));
  gl.uniformMatrix4fv(locs.basis, false, mat4.identity());
  gl.uniformMatrix4fv(locs.eye,   false, mat4.lookAt([0, 0.8, 3.2], [0,0,0], [0,1,0]));

  const aspect = gl.canvas.width / gl.canvas.height;
  perspective(gl, aspect, 45, 0.1, 20, locs.pers);

  gl.drawArrays(gl.TRIANGLES, 0, 36);
}