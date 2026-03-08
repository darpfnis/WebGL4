// lid.js v2 — initGL_2() та draw_lid()

import { createProgram, mat4 }                      from './webgl-utils.js';
import { passAttribData, rotate_Y, perspective }  from './transform.js';
import { lidGeo }                                    from './geometry.js';

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

export function initGL_2(gl) {
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

export function draw_lid(gl, state, ctx) {
  const { prog, posBuf, colBuf, locs, attribs } = ctx;
  gl.useProgram(prog);

  passAttribData(gl, lidGeo.pos, posBuf, attribs.coords);
  passAttribData(gl, lidGeo.col, colBuf, attribs.colors);

  // ── Математика кришки ─────────────────────────────────────────────────
  // Одиничний куб: y ∈ [-0.5, +0.5], z ∈ [-0.5, +0.5]
  // Ящик: scale(0.9) → верх = y=+0.45 в local space
  //
  // Кроки:
  //   1. scale(sx, lidY, sz)   — плоска плитка товщиною 0.12
  //   2. T(0, halfH, 0)        — підняти підошву до y=0
  //      після: y ∈ [0..0.12], задній нижній край = (x, 0, -pz)
  //   3. pivot-rotate навколо (0, 0, -pz):
  //      T(0,0,-pz) × RotX(-lidAngle) × T(0,0,+pz)
  //      від'ємний кут: передній край іде ВГОРУ (відкривання)
  //   4. T(0, 0.45, 0)         — поставити підошву кришки на верх ящика

  const lidY  = 0.12;
  const sx    = 0.92;
  const sz    = 0.92;
  const halfH = lidY / 2;  // 0.06
  const pz    = sz  / 2;   // 0.46 — задній край = нерухомий pivot

  const step1 = mat4.scale(sx, lidY, sz);
  const step2 = mat4.multiply(mat4.trans(0, halfH, 0), step1);

  // pivot: T(0,0,-pz) × RotX(-angle) × T(0,0,+pz)
  // -angle → передній край іде вгору при збільшенні lidAngle
  const pivM = mat4.multiply(
    mat4.trans(0, 0, -pz),
    mat4.multiply(mat4.rotX(-state.lidAngle), mat4.trans(0, 0, pz))
  );

  const step3    = mat4.multiply(pivM, step2);
  const localLid = mat4.multiply(mat4.trans(0, 0.45, 0), step3);

  // ті самі RotX(30°), RotY, Trans що й ящик → рух синхронний
  rotate_Y(gl, state.rotY, locs.rotY);
  gl.uniformMatrix4fv(locs.rotX,  false, mat4.rotX(Math.PI / 6));
  gl.uniformMatrix4fv(locs.scale, false, localLid);
  gl.uniformMatrix4fv(locs.trans, false, mat4.trans(0, -0.3, 0));
  gl.uniformMatrix4fv(locs.basis, false, mat4.identity());
  gl.uniformMatrix4fv(locs.eye,   false, mat4.lookAt([0, 0.8, 3.2], [0,0,0], [0,1,0]));

  const aspect = gl.canvas.width / gl.canvas.height;
  perspective(gl, aspect, 45, 0.1, 20, locs.pers);

  gl.drawArrays(gl.TRIANGLES, 0, 36);
}