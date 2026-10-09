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
  const idx = (i, j, k) => i + nx * (j + ny * k);

  prims.forEach((p, pi) => {
    const i0 = Math.max(0, Math.floor((p.box.min.x - ox) / CELL)), i1 = Math.min(nx - 1, Math.ceil((p.box.max.x - ox) / CELL));
    const j0 = Math.max(0, Math.floor((p.box.min.y - oy) / CELL)), j1 = Math.min(ny - 1, Math.ceil((p.box.max.y - oy) / CELL));
    const k0 = Math.max(0, Math.floor((p.box.min.z - oz) / CELL)), k1 = Math.min(nz - 1, Math.ceil((p.box.max.z - oz) / CELL));
    for (let k = k0; k <= k1; k++) {
      const z = oz + k * CELL;
      for (let j = j0; j <= j1; j++) {
        const y = oy + j * CELL;
        for (let i = i0; i <= i1; i++) {
          const n = idx(i, j, k);
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
  const cx = nx - 1, cy = ny - 1, cz = nz - 1;
  const cellVert = new Int32Array(cx * cy * cz).fill(-1);
  const cidx = (i, j, k) => i + cx * (j + cy * k);
  const verts = [];
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const val = new Float32Array(8);
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let inside = 0;
    for (let c = 0; c < 8; c++) {
      val[c] = field[idx(i + corners[c][0], j + corners[c][1], k + corners[c][2])];
      if (val[c] < 0) inside++;
    }
    if (inside === 0 || inside === 8) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [a, b] of edges) {
      const va = val[a], vb = val[b];
      if ((va < 0) === (vb < 0)) continue;
      const t = va / (va - vb);
      sx += corners[a][0] + (corners[b][0] - corners[a][0]) * t;
      sy += corners[a][1] + (corners[b][1] - corners[a][1]) * t;
      sz += corners[a][2] + (corners[b][2] - corners[a][2]) * t;
      cnt++;
    }
    cellVert[cidx(i, j, k)] = verts.length / 3;
    verts.push(ox + (i + sx / cnt) * CELL, oy + (j + sy / cnt) * CELL, oz + (k + sz / cnt) * CELL);
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
    const v0 = field[idx(i, j, k)] < 0;
    // edge along x
    if (v0 !== (field[idx(i + 1, j, k)] < 0)) {
      const s = v0 ? 1 : -1;
      quad(cellVert[cidx(i, j - 1, k - 1)], cellVert[cidx(i, j, k - 1)], cellVert[cidx(i, j, k)], cellVert[cidx(i, j - 1, k)], s, 0, 0);
    }
    if (v0 !== (field[idx(i, j + 1, k)] < 0)) {
      const s = v0 ? 1 : -1;
      quad(cellVert[cidx(i - 1, j, k - 1)], cellVert[cidx(i, j, k - 1)], cellVert[cidx(i, j, k)], cellVert[cidx(i - 1, j, k)], 0, s, 0);
    }
    if (v0 !== (field[idx(i, j, k + 1)] < 0)) {
      const s = v0 ? 1 : -1;
      quad(cellVert[cidx(i - 1, j - 1, k)], cellVert[cidx(i, j - 1, k)], cellVert[cidx(i, j, k)], cellVert[cidx(i - 1, j, k)], 0, 0, s);
    }
  }

  // ---- Light Taubin smoothing (smooths without shrinking) ----
  const nv = verts.length / 3;
  const nbr = Array.from({ length: nv }, () => new Set());
  for (let t = 0; t < index.length; t += 3) {
    const [a, b, c] = [index[t], index[t + 1], index[t + 2]];
    nbr[a].add(b); nbr[a].add(c); nbr[b].add(a); nbr[b].add(c); nbr[c].add(a); nbr[c].add(b);
  }
  const P = Float32Array.from(verts);
  const tmp = new Float32Array(P.length);
  for (let it = 0; it < 3; it++) {
    for (const f of [0.5, -0.53]) {
      for (let v = 0; v < nv; v++) {
        let ax = 0, ay = 0, az = 0;
        for (const n of nbr[v]) { ax += P[n * 3]; ay += P[n * 3 + 1]; az += P[n * 3 + 2]; }
        const c = nbr[v].size || 1;
        tmp[v * 3] = P[v * 3] + f * (ax / c - P[v * 3]);
        tmp[v * 3 + 1] = P[v * 3 + 1] + f * (ay / c - P[v * 3 + 1]);
        tmp[v * 3 + 2] = P[v * 3 + 2] + f * (az / c - P[v * 3 + 2]);
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
    const top = [...acc.keys()].sort((a, b) => acc[b] - acc[a]).slice(0, 4);
    const sum = top.reduce((s, b) => s + acc[b], 0) || 1;
    top.forEach((b, n) => { skinIndex[v * 4 + n] = b; skinWeight[v * 4 + n] = acc[b] / sum; });
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
