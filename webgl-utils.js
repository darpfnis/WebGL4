// webgl-utils.js — GL setup + mat4

export function setupWebGL(id) {
  const canvas = document.getElementById(id);
  const gl = canvas.getContext('webgl');
  if (!gl) { alert('WebGL не підтримується'); return null; }
  gl.viewport(0, 0, canvas.width, canvas.height);
  return gl;
}

export function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(sh));
  return sh;
}

export function createProgram(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER,   vs));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p));
  return p;
}

// ── mat4 ─────────────────────────────────────────────────────────────────────
// column-major (WebGL standard)

export const mat4 = {

  identity: () => new Float32Array([
    1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1,
  ]),

  multiply(a, b) {
    const o = new Float32Array(16);
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[r + k*4] * b[k + c*4];
        o[r + c*4] = s;
      }
    return o;
  },

  // x' = x cosβ − y sinβ,  y' = x sinβ + y cosβ
  rotationY(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([
       c, 0, s, 0,
       0, 1, 0, 0,
      -s, 0, c, 0,
       0, 0, 0, 1,
    ]);
  },

  rotationX(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([
      1,  0,  0, 0,
      0,  c,  s, 0,
      0, -s,  c, 0,
      0,  0,  0, 1,
    ]);
  },

  // масштабування
  scale: (sx, sy, sz) => new Float32Array([
    sx, 0,  0,  0,
    0,  sy, 0,  0,
    0,  0,  sz, 0,
    0,  0,  0,  1,
  ]),

  // переміщення
  translation: (tx, ty, tz) => new Float32Array([
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    tx, ty, tz, 1,
  ]),

  // перспективна матриця (з прикладу з PDF, column-major)
  // pa = 1/(aspect * tan(fov/2)), pb = 1/tan(fov/2)
  // pc = -(far+near)/(far-near), pd = -(2*far*near)/(far-near)
  perspective(fovDeg, aspect, near, far) {
    const t  = Math.tan((fovDeg / 2) * Math.PI / 180);
    const pa = 1 / (aspect * t);
    const pb = 1 / t;
    const pc = -(far + near) / (far - near);
    const pd = -(2 * far * near) / (far - near);
    return new Float32Array([
      pa,  0,   0,   0,
       0, pb,   0,   0,
       0,  0,  pc,  -1,
       0,  0,  pd,   0,
    ]);
  },

  // lookAt — камера (basis × eye)
  lookAt(eye, center, up) {
    const norm = v => { const l = Math.hypot(...v); return v.map(x => x/l); };
    const sub  = (a,b) => a.map((v,i) => v - b[i]);
    const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    const dot   = (a,b) => a.reduce((s,v,i) => s + v*b[i], 0);

    const f = norm(sub(center, eye));
    const r = norm(cross(f, up));
    const u = cross(r, f);

    return new Float32Array([
       r[0],  u[0], -f[0], 0,
       r[1],  u[1], -f[1], 0,
       r[2],  u[2], -f[2], 0,
      -dot(r,eye), -dot(u,eye), dot(f,eye), 1,
    ]);
  },
};