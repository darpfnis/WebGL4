// geometry.js — геометрія куба [-0.5..+0.5]^3

function buildMesh(faceColors) {
  const P = [
    [-0.5,-0.5, 0.5],[ 0.5,-0.5, 0.5],[ 0.5, 0.5, 0.5],[-0.5, 0.5, 0.5],
    [-0.5,-0.5,-0.5],[ 0.5,-0.5,-0.5],[ 0.5, 0.5,-0.5],[-0.5, 0.5,-0.5],
  ];
  const F = [[1,5,6,2],[0,3,7,4],[3,2,6,7],[0,4,5,1],[0,1,2,3],[4,7,6,5]];
  const pos = [], col = [];
  for (let fi = 0; fi < 6; fi++) {
    const [a,b,c,d] = F[fi], fc = faceColors[fi];
    for (const i of [a,b,c,a,c,d]) { pos.push(...P[i]); col.push(...fc); }
  }
  return { pos: new Float32Array(pos), col: new Float32Array(col) };
}

export const crateGeo = buildMesh([
  [0.957,0.761,0.761], // pink   +X
  [0.690,0.831,0.957], // blue   -X
  [0.718,0.898,0.792], // mint   +Y
  [0.957,0.941,0.690], // yellow -Y
  [0.843,0.757,0.957], // purple +Z
  [0.980,0.890,0.820], // peach  -Z
]);

export const lidGeo = buildMesh([
  [0.880,0.620,0.620],
  [0.560,0.710,0.880],
  [0.580,0.800,0.680],
  [0.880,0.860,0.560],
  [0.720,0.620,0.900],
  [0.900,0.770,0.690],
]);