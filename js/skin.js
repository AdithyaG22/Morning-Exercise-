// Generates one continuous, smooth skin over the avatar's body shapes and binds it to the skeleton.
//
// 1. In a bind pose, every body shape (ellipsoid or tapered capsule) becomes a signed distance field.
//    Shapes on neighbouring bones are blended with a smooth union, so shoulders, hips and the waist
//    flow into each other; shapes on unrelated bones (left vs right leg, arm vs torso) are not.
// 2. A surface-nets pass turns that field into a mesh, which is then lightly smoothed.
// 3. Each vertex is weighted to the bones of the shapes nearest to it, so the skin bends with the body.
import * as THREE from '../vendor/three.module.min.js';

const CELL = 0.011;   // grid resolution in metres (before height scaling)
const BLEND = 0.028;  // smooth-union radius between connected body parts
const FALLOFF = 0.012;

function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

/** Turn a body-shape mesh into a fast distance function in the avatar's local space. */
function makePrim(p, rel) {
  const inv = rel.clone().invert();
  const e = inv.elements;
  const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3();
  rel.decompose(pos, quat, scl);
  const prim = { bone: p.bone, e, scl };
  if (p.type === 'ell') {
    const [rx, ry, rz] = [scl.x, scl.y, scl.z];
    prim.dist = (x, y, z) => {
      const ux = e[0] * x + e[4] * y + e[8] * z + e[12];
      const uy = e[1] * x + e[5] * y + e[9] * z + e[13];
      const uz = e[2] * x + e[6] * y + e[10] * z + e[14];
      const k0 = Math.sqrt(ux * ux + uy * uy + uz * uz);
      const k1 = Math.sqrt((ux / rx) ** 2 + (uy / ry) ** 2 + (uz / rz) ** 2) || 1e-6;
      return (k0 * (k0 - 1)) / k1;
    };
  } else {
    // Tapered capsule along local y: radius r at the top, r2 at the bottom.
    const { r, len, r2 } = p;
    const half = len / 2, total = len + 2 * r;
    const s = Math.min(scl.x, scl.z);
    prim.dist = (x, y, z) => {
      const gx = e[0] * x + e[4] * y + e[8] * z + e[12];
      const gy = e[1] * x + e[5] * y + e[9] * z + e[13];
      const gz = e[2] * x + e[6] * y + e[10] * z + e[14];
      const h = Math.max(-half, Math.min(half, gy));
      const t = (h + half + r) / total;
      const rad = r2 + (r - r2) * t;
      const dy = gy - h;
      return (Math.sqrt(gx * gx + gz * gz + dy * dy) - rad) * s;
    };
  }
  // World-space AABB of the shape
  const box = new THREE.Box3();
  const ex = p.type === 'ell' ? [1, 1, 1] : [r_or(p), p.len / 2 + p.r, r_or(p)];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    box.expandByPoint(new THREE.Vector3(sx * ex[0], sy * ex[1], sz * ex[2]).applyMatrix4(rel));
  }
  box.expandByScalar(BLEND + CELL * 2);
  prim.box = box;
  return prim;
}
const r_or = (p) => Math.max(p.r, p.r2);

export function buildSkinGeometry(prims, bones) {
  const boneIndex = new Map(bones.map((b, i) => [b, i]));
  const adjacent = (a, b) => a === b || a.parent === b || b.parent === a;

  // ---- 1. Distance field ----
  const bounds = new THREE.Box3();
  for (const p of prims) bounds.union(p.box);
  const nx = Math.ceil((bounds.max.x - bounds.min.x) / CELL) + 1;
  const ny = Math.ceil((bounds.max.y - bounds.min.y) / CELL) + 1;
  const nz = Math.ceil((bounds.max.z - bounds.min.z) / CELL) + 1;
  const ox = bounds.min.x, oy = bounds.min.y, oz = bounds.min.z;
  const N = nx * ny * nz;
  const field = new Float32Array(N).fill(1);
  const owner = new Int16Array(N).fill(-1);

  prims.forEach((p, pi) => {
    const i0 = Math.max(0, Math.floor((p.box.min.x - ox) / CELL)), i1 = Math.min(nx - 1, Math.ceil((p.box.max.x - ox) / CELL));
    const j0 = Math.max(0, Math.floor((p.box.min.y - oy) / CELL)), j1 = Math.min(ny - 1, Math.ceil((p.box.max.y - oy) / CELL));
    const k0 = Math.max(0, Math.floor((p.box.min.z - oz) / CELL)), k1 = Math.min(nz - 1, Math.ceil((p.box.max.z - oz) / CELL));
    for (let k = k0; k <= k1; k++) {
      const z = oz + k * CELL;
      for (let j = j0; j <= j1; j++) {
        const y = oy + j * CELL;
        for (let i = i0; i <= i1; i++) {
          const n = i + nx * (j + ny * k);
          const d = p.dist(ox + i * CELL, y, z);
          const cur = field[n], o = owner[n];
          if (o < 0) { field[n] = d; owner[n] = pi; continue; }
          const blend = adjacent(p.bone, prims[o].bone);
          const v = blend ? smin(cur, d, BLEND) : Math.min(cur, d);
          if (d < cur) owner[n] = pi;
          field[n] = v;
        }
      }
    }
  });

  // ---- 2. Surface nets ----
  const inside = new Uint8Array(N);
  for (let n = 0; n < N; n++) inside[n] = field[n] < 0 ? 1 : 0;
  const sx = 1, sy = nx, sz = nx * ny;                 // sample strides
  const cx = nx - 1, cy = ny - 1, cz = nz - 1;
  const csy = cx, csz = cx * cy;                       // cell strides
  const cellVert = new Int32Array(cx * cy * cz).fill(-1);
  const verts = [];
  const cornerOff = [0, sx, sy, sx + sy, sz, sx + sz, sy + sz, sx + sy + sz];
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const val = new Float32Array(8);
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) {
    const row = sy * j + sz * k;
    for (let i = 0; i < cx; i++) {
      const base = row + i;
      let cnt = 0;
      for (let c = 0; c < 8; c++) cnt += inside[base + cornerOff[c]];
      if (cnt === 0 || cnt === 8) continue;
      for (let c = 0; c < 8; c++) val[c] = field[base + cornerOff[c]];
      let px = 0, py = 0, pz = 0, m = 0;
      for (const [ea, eb] of edges) {
        const va = val[ea], vb = val[eb];
        if ((va < 0) === (vb < 0)) continue;
        const t = va / (va - vb);
        px += corners[ea][0] + (corners[eb][0] - corners[ea][0]) * t;
        py += corners[ea][1] + (corners[eb][1] - corners[ea][1]) * t;
        pz += corners[ea][2] + (corners[eb][2] - corners[ea][2]) * t;
        m++;
      }
      cellVert[i + csy * j + csz * k] = verts.length / 3;
      verts.push(ox + (i + px / m) * CELL, oy + (j + py / m) * CELL, oz + (k + pz / m) * CELL);
    }
  }

  const index = [];
  const quad = (a, b, c, d, nxDir, nyDir, nzDir) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    // Orient so the face normal points out of the body
    const ax = verts[c * 3] - verts[a * 3], ay = verts[c * 3 + 1] - verts[a * 3 + 1], az = verts[c * 3 + 2] - verts[a * 3 + 2];
    const bx = verts[d * 3] - verts[b * 3], by = verts[d * 3 + 1] - verts[b * 3 + 1], bz = verts[d * 3 + 2] - verts[b * 3 + 2];
    const dot = (ay * bz - az * by) * nxDir + (az * bx - ax * bz) * nyDir + (ax * by - ay * bx) * nzDir;
    if (dot > 0) index.push(a, b, c, a, c, d);
    else index.push(a, d, c, a, c, b);
  };
  for (let k = 1; k < cz; k++) for (let j = 1; j < cy; j++) for (let i = 1; i < cx; i++) {
    const n = i + sy * j + sz * k;
    const v0 = inside[n];
    const c = i + csy * j + csz * k;                  // cell (i, j, k)
    if (v0 !== inside[n + sx]) {
      const s = v0 ? 1 : -1;
      quad(cellVert[c - csy - csz], cellVert[c - csz], cellVert[c], cellVert[c - csy], s, 0, 0);
    }
    if (v0 !== inside[n + sy]) {
      const s = v0 ? 1 : -1;
      quad(cellVert[c - 1 - csz], cellVert[c - csz], cellVert[c], cellVert[c - 1], 0, s, 0);
    }
    if (v0 !== inside[n + sz]) {
      const s = v0 ? 1 : -1;
      quad(cellVert[c - 1 - csy], cellVert[c - csy], cellVert[c], cellVert[c - 1], 0, 0, s);
    }
  }

  // ---- Light Taubin smoothing (smooths without shrinking) ----
  const nv = verts.length / 3;
  // Neighbour lists in flat arrays (each triangle edge, both directions; duplicates are harmless)
  const deg = new Uint32Array(nv + 1);
  for (let t = 0; t < index.length; t++) deg[index[t] + 1] += 2;
  for (let v = 0; v < nv; v++) deg[v + 1] += deg[v];
  const nbr = new Uint32Array(deg[nv]);
  const fillPos = deg.slice(0, nv);
  for (let t = 0; t < index.length; t += 3) {
    const a = index[t], b = index[t + 1], c = index[t + 2];
    nbr[fillPos[a]++] = b; nbr[fillPos[a]++] = c;
    nbr[fillPos[b]++] = c; nbr[fillPos[b]++] = a;
    nbr[fillPos[c]++] = a; nbr[fillPos[c]++] = b;
  }
  const P = Float32Array.from(verts);
  const tmp = new Float32Array(P.length);
  for (let it = 0; it < 3; it++) {
    for (const f of [0.5, -0.53]) {
      for (let v = 0; v < nv; v++) {
        let ax = 0, ay = 0, az = 0;
        const e0 = deg[v], e1 = deg[v + 1];
        for (let e = e0; e < e1; e++) { const n = nbr[e] * 3; ax += P[n]; ay += P[n + 1]; az += P[n + 2]; }
        const c = (e1 - e0) || 1, o = v * 3;
        tmp[o] = P[o] + f * (ax / c - P[o]);
        tmp[o + 1] = P[o + 1] + f * (ay / c - P[o + 1]);
        tmp[o + 2] = P[o + 2] + f * (az / c - P[o + 2]);
      }
      P.set(tmp);
    }
  }

  // ---- 3. Skin weights: nearest shapes decide which bones move each vertex ----
  const skinIndex = new Uint16Array(nv * 4);
  const skinWeight = new Float32Array(nv * 4);
  const acc = new Float32Array(bones.length);
  const dists = new Float32Array(prims.length);
  for (let v = 0; v < nv; v++) {
    const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    let dmin = Infinity;
    for (let p = 0; p < prims.length; p++) {
      const b = prims[p].box;
      const d = (x < b.min.x || x > b.max.x || y < b.min.y || y > b.max.y || z < b.min.z || z > b.max.z) ? Infinity : prims[p].dist(x, y, z);
      dists[p] = d;
      if (d < dmin) dmin = d;
    }
    acc.fill(0);
    for (let p = 0; p < prims.length; p++) {
      if (dists[p] === Infinity) continue;
      acc[boneIndex.get(prims[p].bone)] += Math.exp(-(dists[p] - dmin) / FALLOFF);
    }
    // keep the 4 strongest bones
    let sum = 0;
    for (let n = 0; n < 4; n++) {
      let best = 0;
      for (let b = 1; b < acc.length; b++) if (acc[b] > acc[best]) best = b;
      skinIndex[v * 4 + n] = best;
      skinWeight[v * 4 + n] = acc[best];
      sum += Math.max(0, acc[best]);
      acc[best] = -1;
    }
    for (let n = 0; n < 4; n++) skinWeight[v * 4 + n] = Math.max(0, skinWeight[v * 4 + n]) / (sum || 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
  geo.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeight, 4));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

export { makePrim };
