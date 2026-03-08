// geometry.js — координати та кольори ящика і кришки

// 6 граней куба, кожна — 2 трикутники
const CORNERS = [
  [-0.5, -0.5,  0.5], // 0
  [ 0.5, -0.5,  0.5], // 1
  [ 0.5,  0.5,  0.5], // 2
  [-0.5,  0.5,  0.5], // 3
  [-0.5, -0.5, -0.5], // 4
  [ 0.5, -0.5, -0.5], // 5
  [ 0.5,  0.5, -0.5], // 6
  [-0.5,  0.5, -0.5], // 7
];

const FACES = [
  [1,5,6,2], // +X
  [0,3,7,4], // -X
  [3,2,6,7], // +Y (верх)
  [0,4,5,1], // -Y (низ)
  [0,1,2,3], // +Z
  [4,7,6,5], // -Z
];

// пастельні кольори для ящика
const CRATE_COLORS = [
  [0.957, 0.761, 0.761], // pink   +X
  [0.690, 0.831, 0.957], // blue   -X
  [0.718, 0.898, 0.792], // mint   +Y
  [0.957, 0.941, 0.690], // yellow -Y
  [0.843, 0.757, 0.957], // purple +Z
  [0.980, 0.890, 0.820], // peach  -Z
];

// кришка трохи темніша / глибша
const LID_COLORS = [
  [0.910, 0.650, 0.650],
  [0.580, 0.720, 0.890],
  [0.600, 0.820, 0.700],
  [0.900, 0.880, 0.580],
  [0.740, 0.640, 0.910],
  [0.920, 0.790, 0.710],
];

function buildMesh(faceColors) {
  const pos = [], col = [];
  for (let fi = 0; fi < FACES.length; fi++) {
    const [a,b,c,d] = FACES[fi];
    const fc = faceColors[fi];
    for (const i of [a,b,c, a,c,d]) {
      pos.push(...CORNERS[i]);
      col.push(...fc);
    }
  }
  return {
    positions: new Float32Array(pos),
    colors:    new Float32Array(col),
    count: 36,
  };
}

export const crateGeometry = buildMesh(CRATE_COLORS);
export const lidGeometry   = buildMesh(LID_COLORS);