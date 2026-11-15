/*
  The 3D scene behind the log-in / sign-up window: a small model house on a lawn.

  Plain WebGL, no library: nothing is loaded from another website, so it works with the site's
  strict security headers (script-src 'self'). AuthHouse3D.jsx loads this file on its own the first
  time the window opens, so it never slows the first page load.

  What is in it
  - A detailed house (siding, tiled roof, brick chimney, dormer, porch, glowing windows), a fence,
    flower beds, bushes, two trees, a lamp post and a yard sign.
  - Soft shadows on the lawn, shaded corners, glass that catches the light, and trees that sway.
  - Day and night: the light theme is a warm afternoon, the dark theme is a moonlit evening with
    lit windows, a glowing lamp and fireflies.
  - Chimney smoke that rises and fades.
  - Drag to spin (it glides to a stop), hover to tilt, tap to make the house bounce.
  - The house wakes up (windows glow brighter, the camera leans in) while someone types in the form.
  - It holds still if the person asked their device for reduced motion, and pauses when the window
    is closed or the tab is hidden.
*/

/* ----------------------------------------------------------------- maths */

const mat = {
  perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  },
  lookAt(eye, target, up) {
    let zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2];
    let l = Math.hypot(zx, zy, zz) || 1;
    zx /= l; zy /= l; zz /= l;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1;
    xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1,
    ];
  },
  multiply(a, b) {
    const out = new Array(16);
    for (let c = 0; c < 4; c += 1) {
      for (let r = 0; r < 4; r += 1) {
        out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return out;
  },
  // turn by `yaw`, grow by `scale`, lift by `lift`
  model(yaw, scale, lift) {
    const c = Math.cos(yaw) * scale, s = Math.sin(yaw) * scale;
    return [c, 0, -s, 0, 0, scale, 0, 0, s, 0, c, 0, 0, lift, 0, 1];
  },
  normal(yaw) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return [c, 0, -s, 0, 1, 0, s, 0, c];
  },
};

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/* ------------------------------------------------------------- the model */

// Material numbers the shader understands.
const M = { MATTE: 0, GLASS: 1, LEAF: 2, SHADOW: 3, LIGHT: 4, LAWN: 6, ROOF: 7, BRICK: 8, SIDING: 9 };

const PALETTES = {
  light: {
    wall: "#F4E2D6", trim: "#FFF8F3", roof: "#6B3A3A", ridge: "#4A2828", brick: "#9A5646", door: "#2A2940",
    knob: "#E7B07C", glass: "#FFD9A0", stone: "#CDB8AC", lawn: "#A9BE9B", base: "#6E4A47", leaf: "#6F8F6C",
    leaf2: "#5C7C5B", leaf3: "#80A07A", trunk: "#6B4A3A", sign: "#D29274", post: "#7A5A4A", fence: "#FFF8F3",
    bush: "#5E8260", bloomA: "#D29274", bloomB: "#FAEEEE", bloomC: "#C2566B", lamp: "#2A2940", bulb: "#FFE2B8",
    shadow: "#2A1F2B", spill: "#FFC27A", smoke: [0.66, 0.6, 0.64], fly: [1.0, 0.8, 0.45],
  },
  dark: {
    wall: "#F7E9E1", trim: "#FFF8F3", roof: "#8A4A4A", ridge: "#5E3434", brick: "#B26A57", door: "#D29274",
    knob: "#FFE2B8", glass: "#FFD08A", stone: "#9C8A86", lawn: "#5F7A60", base: "#3A2A33", leaf: "#7DA079",
    leaf2: "#678C66", leaf3: "#8CB188", trunk: "#8A6450", sign: "#E3A98C", post: "#A07F6B", fence: "#F4E6DE",
    bush: "#6B9570", bloomA: "#E3A98C", bloomB: "#FAEEEE", bloomC: "#D8708A", lamp: "#C9B8B0", bulb: "#FFE2B8",
    shadow: "#07060D", spill: "#FFB866", smoke: [0.8, 0.78, 0.86], fly: [1.0, 0.86, 0.5],
  },
};

// How each theme is lit: a warm afternoon, or a moonlit evening with the house lights on.
const LOOK = {
  light: {
    key: [-0.45, 0.78, 0.55], keyCol: [0.95, 0.88, 0.78], fill: [0.62, 0.22, -0.5], fillCol: [0.13, 0.16, 0.22],
    sky: [0.34, 0.37, 0.46], ground: [0.15, 0.12, 0.13], glow: 0.5, night: 0.12, lamp: 0.25, rim: 0.0,
  },
  dark: {
    key: [-0.4, 0.8, 0.45], keyCol: [0.62, 0.7, 0.98], fill: [0.62, 0.2, -0.5], fillCol: [0.22, 0.13, 0.08],
    sky: [0.26, 0.29, 0.43], ground: [0.1, 0.085, 0.13], glow: 1.0, night: 1.0, lamp: 1.0, rim: 1.0,
  },
};

const HX = -0.35; // house centre (x)
const HW = 1.2; // half width
const HD = 0.85; // half depth
const WH = 1.2; // wall height
const RISE = 0.85; // roof rise

function buildScene(theme) {
  const P = PALETTES[theme] || PALETTES.light;
  const solid = [];
  const decals = [];

  // one vertex: position, normal, colour, glow (or alpha for decals), material
  const push = (out, p, n, c, e, m) => out.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], e, m);
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const mean = (pts) => {
    const s = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
    return [s[0] / pts.length, s[1] / pts.length, s[2] / pts.length];
  };
  const C = (name) => hex(P[name]);

  // Any convex solid: faces point away from the middle of the solid, whatever order the corners were given in.
  function convex(points, faces, color, glow = 0, material = M.MATTE) {
    const centre = mean(points);
    faces.forEach((face) => {
      const pts = face.map((i) => points[i]);
      let n = unit(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
      const c = mean(pts);
      if (n[0] * (c[0] - centre[0]) + n[1] * (c[1] - centre[1]) + n[2] * (c[2] - centre[2]) < 0) n = [-n[0], -n[1], -n[2]];
      for (let i = 1; i < pts.length - 1; i += 1) {
        push(solid, pts[0], n, color, glow, material);
        push(solid, pts[i], n, color, glow, material);
        push(solid, pts[i + 1], n, color, glow, material);
      }
    });
  }

  function box(x0, y0, z0, x1, y1, z1, color, glow = 0, material = M.MATTE) {
    const p = [
      [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
      [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
    ];
    convex(p, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], color, glow, material);
  }

  function cone(cx, cy, cz, r, h, seg, color, material = M.LEAF) {
    const pts = [[cx, cy + h, cz]];
    for (let i = 0; i < seg; i += 1) {
      const a = (i / seg) * Math.PI * 2 + 0.3;
      pts.push([cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r]);
    }
    const faces = [];
    for (let i = 0; i < seg; i += 1) faces.push([0, 1 + i, 1 + ((i + 1) % seg)]);
    faces.push(Array.from({ length: seg }, (_, i) => 1 + i));
    convex(pts, faces, color, 0, material);
  }

  // Round, smooth-shaded disc or post (the lawn, its edge, tree trunks, the lamp post).
  function cylinder(cx, y0, cz, r, y1, seg, color, material = M.MATTE) {
    for (let i = 0; i < seg; i += 1) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const p00 = [cx + c0 * r, y0, cz + s0 * r], p10 = [cx + c1 * r, y0, cz + s1 * r];
      const p01 = [cx + c0 * r, y1, cz + s0 * r], p11 = [cx + c1 * r, y1, cz + s1 * r];
      const n0 = [c0, 0, s0], n1 = [c1, 0, s1];
      const up = [0, 1, 0], down = [0, -1, 0];
      push(solid, p00, n0, color, 0, material); push(solid, p10, n1, color, 0, material); push(solid, p11, n1, color, 0, material);
      push(solid, p00, n0, color, 0, material); push(solid, p11, n1, color, 0, material); push(solid, p01, n0, color, 0, material);
      push(solid, [cx, y1, cz], up, color, 0, material); push(solid, p01, up, color, 0, material); push(solid, p11, up, color, 0, material);
      push(solid, [cx, y0, cz], down, color, 0, material); push(solid, p10, down, color, 0, material); push(solid, p00, down, color, 0, material);
    }
  }

  // Smooth ball (bushes, flowers, tree crowns, the lamp bulb). `sy` squashes or stretches it upwards.
  function sphere(cx, cy, cz, r, color, material = M.LEAF, sy = 1, glow = 0, rings = 6, segs = 10) {
    const at = (v, u) => [Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)];
    for (let i = 0; i < rings; i += 1) {
      const v0 = (i / rings) * Math.PI, v1 = ((i + 1) / rings) * Math.PI;
      for (let j = 0; j < segs; j += 1) {
        const u0 = (j / segs) * Math.PI * 2, u1 = ((j + 1) / segs) * Math.PI * 2;
        const a = at(v0, u0), b = at(v0, u1), c = at(v1, u1), d = at(v1, u0);
        const vert = (q) => [cx + q[0] * r, cy + q[1] * r * sy, cz + q[2] * r];
        const nor = (q) => unit([q[0], q[1] / (sy * sy), q[2]]);
        [[a, d, c], [a, c, b]].forEach((tri) => tri.forEach((q) => push(solid, vert(q), nor(q), color, glow, material)));
      }
    }
  }

  // A soft round patch laid on the ground: a shadow under things, or a pool of light. Fades out at the edge.
  function blob(cx, cz, rx, rz, color, alpha, material = M.SHADOW, y = 0.006) {
    const seg = 20;
    const rings = [0, 0.2, 0.4, 0.6, 0.8, 1];
    const fade = (t) => (t >= 1 ? 0 : alpha * Math.exp(-3.4 * t * t));
    const ring = (t, i) => {
      const a = (i / seg) * Math.PI * 2;
      return [cx + Math.cos(a) * rx * t, y, cz + Math.sin(a) * rz * t];
    };
    const up = [0, 1, 0];
    for (let r = 0; r < rings.length - 1; r += 1) {
      for (let i = 0; i < seg; i += 1) {
        const t0 = rings[r], t1 = rings[r + 1];
        const a = ring(t0, i), b = ring(t0, i + 1), c = ring(t1, i + 1), d = ring(t1, i);
        push(decals, a, up, color, fade(t0), material); push(decals, d, up, color, fade(t1), material); push(decals, c, up, color, fade(t1), material);
        push(decals, a, up, color, fade(t0), material); push(decals, c, up, color, fade(t1), material); push(decals, b, up, color, fade(t0), material);
      }
    }
  }

  // ---- Ground: a round lawn on a darker base, like a model on a stand.
  cylinder(0, -0.34, 0, 2.7, -0.07, 56, C("base"));
  cylinder(0, -0.07, 0, 2.76, 0, 56, C("lawn"), M.LAWN);

  // ---- House: walls, step and plinth.
  box(HX - HW - 0.05, 0, -HD - 0.05, HX + HW + 0.05, 0.13, HD + 0.05, C("stone"));
  box(HX - HW, 0.13, -HD, HX + HW, WH, HD, C("wall"), 0, M.SIDING);

  // Gable ends (the triangles under the roof).
  const gl = HX - HW, gr = HX + HW;
  convex(
    [[gl, WH, -HD], [gl, WH, HD], [gl, WH + RISE, 0], [gr, WH, -HD], [gr, WH, HD], [gr, WH + RISE, 0]],
    [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [0, 2, 5, 3], [1, 2, 5, 4]],
    C("wall"), 0, M.SIDING
  );

  // Roof: two thick slabs that carry on past the walls, with a cap along the top.
  const over = 0.3, overX = 0.28, thick = 0.1, eps = 0.012;
  const slope = Math.hypot(HD, RISE);
  const nz = RISE / slope, ny = HD / slope; // up-and-outwards direction of the front slope
  const eaveZ = HD + over;
  const eaveY = WH + RISE - (RISE / HD) * eaveZ;
  [1, -1].forEach((side) => {
    const line = (offset) => [
      [0, WH + RISE + ny * offset],
      [eaveZ * side, eaveY + ny * offset],
    ];
    const lo = line(eps), hi = line(thick);
    const pts = [];
    [HX - HW - overX, HX + HW + overX].forEach((x) => {
      pts.push([x, lo[0][1], lo[0][0] + side * nz * eps]);
      pts.push([x, lo[1][1], lo[1][0] + side * nz * eps]);
      pts.push([x, hi[1][1], hi[1][0] + side * nz * thick]);
      pts.push([x, hi[0][1], hi[0][0] + side * nz * thick]);
    });
    convex(pts, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], C("roof"), 0, M.ROOF);
  });
  box(HX - HW - overX - 0.02, WH + RISE + 0.03, -0.09, HX + HW + overX + 0.02, WH + RISE + 0.17, 0.09, C("ridge"));
  // fascia boards along the front and back eaves
  [1, -1].forEach((side) => {
    const z = side * (eaveZ + 0.01);
    box(HX - HW - overX - 0.02, eaveY - 0.035, Math.min(z, z + side * 0.03), HX + HW + overX + 0.02, eaveY + 0.06, Math.max(z, z + side * 0.03), C("trim"));
  });

  // ---- Chimney (brick, with a cap).
  box(HX + 0.55, 1.45, -0.42, HX + 0.85, 2.18, -0.14, C("brick"), 0, M.BRICK);
  box(HX + 0.51, 2.18, -0.46, HX + 0.89, 2.25, -0.10, C("ridge"));

  // ---- Dormer window poking out of the front of the roof.
  const dx = HX - 0.62;
  const dyBase = WH + RISE - (RISE / HD) * 0.52; // roof height where the dormer front stands
  box(dx - 0.3, dyBase - 0.12, 0.12, dx + 0.3, dyBase + 0.5, 0.52, C("wall"), 0, M.SIDING);
  convex(
    [[dx - 0.38, dyBase + 0.5, 0.6], [dx + 0.38, dyBase + 0.5, 0.6], [dx, dyBase + 0.86, 0.6],
      [dx - 0.38, dyBase + 0.5, 0.1], [dx + 0.38, dyBase + 0.5, 0.1], [dx, dyBase + 0.86, 0.1]],
    [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [0, 2, 5, 3], [1, 2, 5, 4]],
    C("roof"), 0, M.ROOF
  );
  box(dx - 0.2, dyBase + 0.06, 0.52, dx + 0.2, dyBase + 0.44, 0.545, C("trim"));
  box(dx - 0.155, dyBase + 0.1, 0.545, dx + 0.155, dyBase + 0.4, 0.56, C("glass"), 1, M.GLASS);
  box(dx - 0.012, dyBase + 0.1, 0.56, dx + 0.012, dyBase + 0.4, 0.572, C("trim"));

  // ---- Front (the side with the door): door, frame, porch, two windows.
  const fz = HD; // front wall plane
  box(HX + 0.0, 0.13, fz, HX + 0.52, 0.99, fz + 0.025, C("trim"));
  box(HX + 0.05, 0.13, fz + 0.025, HX + 0.47, 0.93, fz + 0.06, C("door"));
  box(HX + 0.09, 0.2, fz + 0.06, HX + 0.21, 0.86, fz + 0.072, C("door")); // door panels
  box(HX + 0.29, 0.2, fz + 0.06, HX + 0.43, 0.86, fz + 0.072, C("door"));
  box(HX + 0.4, 0.5, fz + 0.07, HX + 0.44, 0.55, fz + 0.1, C("knob"));
  box(HX - 0.06, 0, fz + 0.02, HX + 0.58, 0.07, fz + 0.5, C("stone")); // step
  // porch: two posts and a little roof over the door
  box(HX - 0.05, 0.07, fz + 0.42, HX + 0.0, 1.07, fz + 0.47, C("trim"));
  box(HX + 0.52, 0.07, fz + 0.42, HX + 0.57, 1.07, fz + 0.47, C("trim"));
  box(HX - 0.12, 1.07, fz, HX + 0.64, 1.14, fz + 0.54, C("roof"), 0, M.ROOF);
  box(HX - 0.12, 1.02, fz + 0.5, HX + 0.64, 1.07, fz + 0.54, C("trim"));
  // porch light
  sphere(HX + 0.26, 1.0, fz + 0.04, 0.035, hex(P.bulb), M.MATTE, 1, 2, 4, 6);

  const windowFront = (cx) => {
    box(cx - 0.29, 0.5, fz, cx + 0.29, 1.08, fz + 0.03, C("trim"));
    box(cx - 0.23, 0.56, fz + 0.03, cx + 0.23, 1.02, fz + 0.05, C("glass"), 1, M.GLASS);
    box(cx - 0.23, 0.77, fz + 0.05, cx + 0.23, 0.81, fz + 0.065, C("trim"));
    box(cx - 0.02, 0.56, fz + 0.05, cx + 0.02, 1.02, fz + 0.065, C("trim"));
    box(cx - 0.31, 0.46, fz, cx + 0.31, 0.5, fz + 0.09, C("stone"));
    // shutters
    box(cx - 0.4, 0.5, fz, cx - 0.31, 1.08, fz + 0.03, C("roof"));
    box(cx + 0.31, 0.5, fz, cx + 0.4, 1.08, fz + 0.03, C("roof"));
  };
  windowFront(HX - 0.7);
  windowFront(HX + 0.95);

  // Side windows (so the glow is still there as it turns).
  [1, -1].forEach((side) => {
    const x = HX + side * HW;
    const lo = Math.min(x, x + side * 0.05), hi = Math.max(x, x + side * 0.05);
    box(lo, 0.5, -0.29, hi, 1.08, 0.29, C("trim"));
    const px0 = side > 0 ? x : x - 0.07, px1 = side > 0 ? x + 0.07 : x;
    box(px0, 0.56, -0.23, px1, 1.02, 0.23, C("glass"), 1, M.GLASS);
  });
  // back window
  box(HX - 0.29, 0.5, -HD - 0.03, HX + 0.29, 1.08, -HD, C("trim"));
  box(HX - 0.23, 0.56, -HD - 0.05, HX + 0.23, 1.02, -HD - 0.03, C("glass"), 1, M.GLASS);

  // ---- Path from the door to the edge of the lawn (stepping slabs).
  for (let i = 0; i < 4; i += 1) {
    const z0 = fz + 0.52 + i * 0.5;
    box(HX + 0.06, 0, z0, HX + 0.46, 0.035, z0 + 0.4, C("stone"));
  }

  // ---- Picket fence either side of the path.
  const fenceZ = 1.5;
  const picket = (x) => box(x - 0.03, 0, fenceZ - 0.015, x + 0.03, 0.4, fenceZ + 0.015, C("fence"));
  const fenceRun = (x0, x1) => {
    box(x0, 0.1, fenceZ - 0.03, x1, 0.15, fenceZ - 0.012, C("fence"));
    box(x0, 0.27, fenceZ - 0.03, x1, 0.32, fenceZ - 0.012, C("fence"));
    for (let x = x0 + 0.06; x < x1; x += 0.15) picket(x);
  };
  fenceRun(-1.0, -0.42);
  fenceRun(0.18, 0.98);

  // ---- Bushes and flowers under the front windows.
  const bush = (x, z, r) => {
    sphere(x, r * 0.85, z, r, C("bush"), M.LEAF, 0.8, 0, 6, 10);
    sphere(x + r * 0.55, r * 0.7, z + r * 0.15, r * 0.7, C("leaf"), M.LEAF, 0.8, 0, 5, 8);
  };
  bush(HX - 1.02, fz + 0.2, 0.22);
  bush(HX + 1.22, fz + 0.2, 0.24);
  bush(HX - 0.34, fz + 0.18, 0.17);
  const blooms = [C("bloomA"), C("bloomB"), C("bloomC")];
  [[-1.1, 1.12, 0.38], [-0.93, 1.1, 0.4], [-1.04, 1.07, 0.3], [0.78, 1.1, 0.4], [0.9, 1.12, 0.36], [0.98, 1.08, 0.3], [-0.5, 1.03, 0.28]].forEach((f, i) => {
    sphere(f[0] + 0.0, f[2], f[1], 0.045, blooms[i % 3], M.MATTE, 1, 0, 4, 6);
  });
  // a few flowers scattered on the lawn (the same every time)
  for (let i = 0; i < 9; i += 1) {
    const a = i * 2.399 + 0.6;
    const rad = 1.9 + ((i * 37) % 7) * 0.09;
    const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
    if (z > 1.1 && x > -0.7 && x < 0.4) continue; // keep the path clear
    sphere(x, 0.06, z, 0.045, blooms[i % 3], M.MATTE, 1, 0, 4, 6);
  }

  // ---- Round tree at the back, and a pine at the front right.
  cylinder(-1.9, 0, -0.95, 0.09, 0.62, 10, C("trunk"));
  sphere(-1.9, 1.0, -0.95, 0.62, C("leaf"), M.LEAF, 0.9, 0, 7, 12);
  sphere(-1.62, 0.84, -0.8, 0.42, C("leaf3"), M.LEAF, 0.9, 0, 6, 10);
  sphere(-2.12, 0.86, -1.12, 0.4, C("leaf2"), M.LEAF, 0.9, 0, 6, 10);
  sphere(-1.86, 1.38, -0.98, 0.38, C("leaf3"), M.LEAF, 0.9, 0, 6, 10);

  cylinder(1.75, 0, 0.7, 0.1, 0.42, 10, C("trunk"));
  cone(1.75, 0.3, 0.7, 0.58, 0.72, 9, C("leaf"));
  cone(1.75, 0.76, 0.7, 0.44, 0.66, 9, C("leaf2"));
  cone(1.75, 1.18, 0.7, 0.3, 0.6, 9, C("leaf"));

  // ---- Lamp post beside the path: glows in the evening.
  cylinder(HX + 0.78, 0, 1.95, 0.035, 0.8, 8, C("lamp"));
  box(HX + 0.78 - 0.07, 0.8, 1.95 - 0.07, HX + 0.78 + 0.07, 0.84, 1.95 + 0.07, C("lamp"));
  sphere(HX + 0.78, 0.93, 1.95, 0.095, hex(P.bulb), M.MATTE, 1, 2, 6, 10);
  cone(HX + 0.78, 1.0, 1.95, 0.13, 0.1, 8, C("lamp"), M.MATTE);

  // ---- "For sale" style yard sign.
  box(-1.42, 0, 1.55, -1.37, 0.78, 1.6, C("post"));
  box(-1.78, 0.5, 1.53, -1.0, 0.86, 1.58, C("sign"));
  box(-1.74, 0.34, 1.53, -1.04, 0.46, 1.58, C("ridge"));

  // ---- Soft shadows on the lawn (they turn with the model, like the shade in the corners of a room).
  const shade = hex(P.shadow);
  blob(HX + 0.25, -0.1, HW + 0.95, HD + 0.9, shade, 0.5);
  blob(1.75 + 0.35, 0.55, 0.95, 0.8, shade, 0.5);
  blob(-1.9 + 0.3, -0.8, 0.95, 0.8, shade, 0.46);
  blob(-1.4, 1.58, 0.62, 0.2, shade, 0.4);
  blob(HX - 1.0, fz + 0.3, 0.42, 0.26, shade, 0.4);
  blob(HX + 1.24, fz + 0.3, 0.42, 0.26, shade, 0.4);
  blob(HX + 0.78, 1.95, 0.22, 0.14, shade, 0.4);

  // ---- Light spilling onto the lawn from the lamp and the windows (stronger at night).
  const spill = hex(P.spill);
  blob(HX + 0.78, 1.95, 0.95, 0.8, spill, 0.55, M.LIGHT, 0.008);
  blob(HX - 0.7, fz + 0.62, 0.62, 0.42, spill, 0.45, M.LIGHT, 0.008);
  blob(HX + 0.95, fz + 0.62, 0.62, 0.42, spill, 0.45, M.LIGHT, 0.008);
  blob(HX + 0.26, fz + 0.4, 0.32, 0.3, spill, 0.5, M.LIGHT, 0.008);

  return { solid: new Float32Array(solid), decals: new Float32Array(decals) };
}

// Chimney smoke puffs and fireflies, each with: base position (3) and a seed (4).
function buildParticles() {
  const out = [];
  const smoke = 7;
  for (let i = 0; i < smoke; i += 1) out.push(HX + 0.7, 2.27, -0.28, i / smoke + 0.013, 0, 0, 0);
  const flies = 14;
  for (let i = 0; i < flies; i += 1) {
    const a = (i / flies) * Math.PI * 2 + (i % 3) * 0.4;
    const r = 1.5 + ((i * 53) % 10) * 0.11;
    out.push(Math.cos(a) * r, 0.35 + ((i * 29) % 9) * 0.1, Math.sin(a) * r, ((i * 0.6180339) % 1), 1, ((i * 0.37) % 1), (i * 1.7) % 6);
  }
  return { data: new Float32Array(out), smoke, flies };
}

/* --------------------------------------------------------------- shaders */

const VERT = `
attribute vec3 aPos;
attribute vec3 aNor;
attribute vec3 aCol;
attribute float aGlow;
attribute float aMat;
uniform mat4 uViewProj;
uniform mat4 uModel;
uniform mat3 uNormalMat;
uniform float uTime;
varying vec3 vNor;
varying vec3 vCol;
varying vec3 vWorld;
varying vec3 vLocal;
varying float vGlow;
varying float vMat;
void main() {
  vec3 p = aPos;
  if (aMat > 1.5 && aMat < 2.5) {
    float w = sin(uTime * 1.4 + p.x * 1.7 + p.z * 1.3) * 0.016 * max(p.y - 0.25, 0.0);
    p.x += w;
    p.z += w * 0.7;
  }
  vec4 world = uModel * vec4(p, 1.0);
  vNor = uNormalMat * aNor;
  vCol = aCol;
  vWorld = world.xyz;
  vLocal = p;
  vGlow = aGlow;
  vMat = aMat;
  gl_Position = uViewProj * world;
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vNor;
varying vec3 vCol;
varying vec3 vWorld;
varying vec3 vLocal;
varying float vGlow;
varying float vMat;
uniform vec3 uKey;
uniform vec3 uKeyCol;
uniform vec3 uFill;
uniform vec3 uFillCol;
uniform vec3 uSky;
uniform vec3 uGround;
uniform vec3 uEye;
uniform float uGlow;
uniform float uNight;
uniform float uLamp;
uniform float uRim;
uniform float uTime;
void main() {
  // flat patches laid on the ground: shadows and pools of light
  if (vMat > 2.5 && vMat < 4.5) {
    float a = vGlow * (vMat > 3.5 ? uNight : 1.0);
    gl_FragColor = vec4(vCol * a, a);
    return;
  }

  vec3 n = normalize(vNor);
  vec3 v = normalize(uEye - vWorld);
  vec3 base = pow(vCol, vec3(2.2));

  // little surface details
  float m = vMat;
  if (m > 5.5 && m < 6.5) {
    base *= 1.0 + 0.07 * sin(vLocal.x * 7.0 + vLocal.z * 2.5);
  } else if (m > 6.5 && m < 7.5) {
    base *= 1.0 - 0.09 * step(0.5, fract(vLocal.y * 9.0 + vLocal.x * 0.0));
    base *= 1.0 - 0.05 * step(0.5, fract(vLocal.x * 7.0 + floor(vLocal.y * 9.0) * 0.5));
  } else if (m > 7.5 && m < 8.5) {
    float row = floor(vLocal.y * 9.0);
    float mortarY = step(0.86, fract(vLocal.y * 9.0));
    float mortarX = step(0.9, fract((vLocal.x + vLocal.z) * 8.0 + row * 0.5));
    base *= 1.0 - 0.28 * max(mortarY, mortarX);
  } else if (m > 8.5) {
    base *= 1.0 - 0.07 * step(0.88, fract(vLocal.y * 11.0));
  }

  float key = clamp((dot(n, uKey) + 0.2) / 1.2, 0.0, 1.0);
  float fill = max(dot(n, uFill), 0.0);
  float sky = n.y * 0.5 + 0.5;
  vec3 ambient = mix(uGround, uSky, sky);

  // darker low down on walls and plants, so things sit on the lawn instead of floating over it
  float ao = mix(0.66, 1.0, smoothstep(0.0, 0.5, vLocal.y));
  ao = mix(ao, 1.0, step(0.9, n.y));

  vec3 lit = base * (ambient * ao + uKeyCol * key + uFillCol * fill);

  // glass catches the light and reflects the sky
  if (m > 0.5 && m < 1.5) {
    vec3 h = normalize(uKey + v);
    float spec = pow(max(dot(n, h), 0.0), 40.0);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    lit += uKeyCol * spec * 0.9 + uSky * fres * 0.5;
  }

  // a thin light on the edges facing away, mostly for the moonlit look
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * uRim;
  lit += vec3(0.32, 0.4, 0.7) * rim * 0.16 * smoothstep(-0.2, 0.6, n.y + 0.3);

  // lit windows, porch light and lamp
  float lamp = step(1.5, vGlow);
  float flicker = 1.0 + 0.035 * sin(uTime * 3.1 + vWorld.x * 4.0);
  float e = mix(vGlow * uGlow * flicker, uLamp, lamp);
  vec3 glow = base * 1.1 + vec3(0.5, 0.34, 0.1);
  lit = mix(lit, glow, clamp(e, 0.0, 1.0));
  lit += vec3(0.5, 0.34, 0.1) * max(e - 1.0, 0.0) * 0.5;

  gl_FragColor = vec4(pow(lit, vec3(1.0 / 2.2)), 1.0);
}`;

const P_VERT = `
attribute vec3 aBase;
attribute vec4 aSeed;
uniform mat4 uViewProj;
uniform mat4 uModel;
uniform float uTime;
uniform float uPx;
varying float vAlpha;
varying float vKind;
void main() {
  float k = aSeed.y;
  vec3 wp;
  float size;
  float a;
  if (k < 0.5) {
    float t = fract(uTime * 0.14 + aSeed.x);
    vec3 b = (uModel * vec4(aBase, 1.0)).xyz;
    wp = b + vec3(0.12 + 0.42 * t, 1.05 * t, 0.0);
    wp.x += sin(t * 6.0 + aSeed.x * 20.0) * 0.07;
    wp.z += cos(t * 5.0 + aSeed.x * 9.0) * 0.06;
    size = mix(9.0, 30.0, t);
    a = sin(t * 3.14159) * 0.55;
  } else {
    float t = uTime * (0.25 + aSeed.z * 0.35) + aSeed.x * 6.28;
    wp = aBase + vec3(sin(t * 1.3) * 0.55, sin(t * 0.9 + aSeed.w) * 0.22, cos(t * 1.1) * 0.55);
    size = 9.0;
    a = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 2.2 + aSeed.x * 30.0), 2.0);
  }
  vec4 pos = uViewProj * vec4(wp, 1.0);
  gl_Position = pos;
  gl_PointSize = size * uPx * (8.6 / max(pos.w, 0.5));
  vAlpha = a;
  vKind = k;
}`;

const P_FRAG = `
precision mediump float;
varying float vAlpha;
varying float vKind;
uniform vec3 uSmoke;
uniform vec3 uFly;
uniform float uNight;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float soft = clamp(1.0 - r, 0.0, 1.0);
  if (vKind < 0.5) {
    float a = vAlpha * soft * soft;
    gl_FragColor = vec4(uSmoke * a, a);
  } else {
    float a = vAlpha * soft * (0.25 + 0.75 * uNight);
    float core = pow(soft, 4.0) * (0.25 + 0.75 * uNight);
    gl_FragColor = vec4(uFly * (a * 0.8 + core), a);
  }
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || "Shader failed");
  }
  return shader;
}

function link(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Program failed");
  return program;
}

/* ----------------------------------------------------------------- scene */

/*
  createHouseScene(canvas, wrap, hooks)
    hooks.getTheme()        "light" or "dark"
    hooks.reducedMotion()   true if the person asked their device for less motion
    hooks.onLost()          called if the graphics context is lost (the caller hides the scene)
  Returns null if WebGL is not available, otherwise { setActive, setExcited, dispose }.
*/
export function createHouseScene(canvas, wrap, hooks) {
  let gl = null;
  try {
    const options = { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" };
    gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
  } catch (e) {
    gl = null;
  }
  if (!gl) return null;

  let solidProg = null, partProg = null;
  let solidBuf = null, decalBuf = null, partBuf = null;
  let solidCount = 0, decalCount = 0, partInfo = null;
  let sLoc = null, pLoc = null;
  let builtFor = "";
  let raf = 0;
  let lastTime = 0;
  let clock = 0;
  let disposed = false;
  let lost = false;
  let active = false;

  const theme = () => (hooks.getTheme && hooks.getTheme() === "dark" ? "dark" : "light");
  const reduced = () => Boolean(hooks.reducedMotion && hooks.reducedMotion());

  // Motion state.
  const state = {
    yaw: -0.65, velocity: 0, dragging: false, idleSince: 0,
    tiltX: 0, tiltY: 0, targetX: 0, targetY: 0,
    excite: 0, exciteTarget: 0,
    pop: 0, popV: 0,
  };
  const AUTO_SPEED = 0.3; // radians per second
  const view = { width: 0, height: 0 };

  function setup() {
    solidProg = link(gl, VERT, FRAG);
    partProg = link(gl, P_VERT, P_FRAG);
    const U = (p, n) => gl.getUniformLocation(p, n);
    const A = (p, n) => gl.getAttribLocation(p, n);
    sLoc = {
      pos: A(solidProg, "aPos"), nor: A(solidProg, "aNor"), col: A(solidProg, "aCol"), glow: A(solidProg, "aGlow"), mat: A(solidProg, "aMat"),
      viewProj: U(solidProg, "uViewProj"), model: U(solidProg, "uModel"), normalMat: U(solidProg, "uNormalMat"), time: U(solidProg, "uTime"),
      key: U(solidProg, "uKey"), keyCol: U(solidProg, "uKeyCol"), fill: U(solidProg, "uFill"), fillCol: U(solidProg, "uFillCol"),
      sky: U(solidProg, "uSky"), ground: U(solidProg, "uGround"), eye: U(solidProg, "uEye"),
      glowAmt: U(solidProg, "uGlow"), night: U(solidProg, "uNight"), lamp: U(solidProg, "uLamp"), rim: U(solidProg, "uRim"),
    };
    pLoc = {
      base: A(partProg, "aBase"), seed: A(partProg, "aSeed"),
      viewProj: U(partProg, "uViewProj"), model: U(partProg, "uModel"), time: U(partProg, "uTime"), px: U(partProg, "uPx"),
      smoke: U(partProg, "uSmoke"), fly: U(partProg, "uFly"), night: U(partProg, "uNight"),
    };
    solidBuf = gl.createBuffer();
    decalBuf = gl.createBuffer();
    partBuf = gl.createBuffer();
    partInfo = buildParticles();
    gl.bindBuffer(gl.ARRAY_BUFFER, partBuf);
    gl.bufferData(gl.ARRAY_BUFFER, partInfo.data, gl.STATIC_DRAW);
    builtFor = "";
    gl.clearColor(0, 0, 0, 0);
    uploadModel();
  }

  function uploadModel() {
    const t = theme();
    if (t === builtFor) return;
    const built = buildScene(t);
    solidCount = built.solid.length / 11;
    decalCount = built.decals.length / 11;
    gl.bindBuffer(gl.ARRAY_BUFFER, solidBuf);
    gl.bufferData(gl.ARRAY_BUFFER, built.solid, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, decalBuf);
    gl.bufferData(gl.ARRAY_BUFFER, built.decals, gl.STATIC_DRAW);
    builtFor = t;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(wrap.clientWidth * dpr);
    const h = Math.round(wrap.clientHeight * dpr);
    view.width = w;
    view.height = h;
    if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function bindSolid(buffer) {
    const stride = 44;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    [[sLoc.pos, 3, 0], [sLoc.nor, 3, 12], [sLoc.col, 3, 24], [sLoc.glow, 1, 36], [sLoc.mat, 1, 40]].forEach(([loc, size, off]) => {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off);
    });
  }

  function draw() {
    if (lost || !solidProg || view.width < 2 || view.height < 2) return;
    const look = LOOK[builtFor] || LOOK.light;
    const pal = PALETTES[builtFor] || PALETTES.light;
    const dpr = view.width / Math.max(1, wrap.clientWidth);
    const still = reduced();
    const time = still ? 2.4 : clock;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // camera: leans in a little while someone types
    const aspect = canvas.width / canvas.height;
    const elevation = 0.36 + state.tiltY * 0.16;
    const distance = 10.4 * (1 - 0.07 * state.excite);
    const target = [0.1, 0.5, 0];
    const eye = [
      target[0] + Math.sin(state.tiltX * 0.18) * distance,
      target[1] + Math.sin(elevation) * distance,
      target[2] + Math.cos(elevation) * distance,
    ];
    const viewProj = new Float32Array(mat.multiply(mat.perspective(0.5, aspect, 1, 40), mat.lookAt(eye, target, [0, 1, 0])));
    const bob = still ? 0 : Math.sin(clock * 0.9) * 0.035;
    const scale = 1 + state.pop * 0.07;
    const model = new Float32Array(mat.model(state.yaw, scale, bob));
    const normalMat = new Float32Array(mat.normal(state.yaw));
    const glowAmt = look.glow * (1 + 0.45 * state.excite);
    const lampAmt = Math.min(1.3, look.lamp * (1 + 0.3 * state.excite));

    // ---- solid things
    gl.useProgram(solidProg);
    bindSolid(solidBuf);
    gl.uniformMatrix4fv(sLoc.viewProj, false, viewProj);
    gl.uniformMatrix4fv(sLoc.model, false, model);
    gl.uniformMatrix3fv(sLoc.normalMat, false, normalMat);
    gl.uniform1f(sLoc.time, time);
    gl.uniform3fv(sLoc.key, look.key);
    gl.uniform3fv(sLoc.keyCol, look.keyCol);
    gl.uniform3fv(sLoc.fill, look.fill);
    gl.uniform3fv(sLoc.fillCol, look.fillCol);
    gl.uniform3fv(sLoc.sky, look.sky);
    gl.uniform3fv(sLoc.ground, look.ground);
    gl.uniform3fv(sLoc.eye, eye);
    gl.uniform1f(sLoc.glowAmt, glowAmt);
    gl.uniform1f(sLoc.night, look.night * (1 + 0.3 * state.excite));
    gl.uniform1f(sLoc.lamp, lampAmt);
    gl.uniform1f(sLoc.rim, look.rim);
    gl.drawArrays(gl.TRIANGLES, 0, solidCount);

    // ---- shadows and pools of light on the lawn
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    bindSolid(decalBuf);
    gl.drawArrays(gl.TRIANGLES, 0, decalCount);

    // ---- smoke and fireflies
    gl.useProgram(partProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, partBuf);
    gl.enableVertexAttribArray(pLoc.base);
    gl.vertexAttribPointer(pLoc.base, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(pLoc.seed);
    gl.vertexAttribPointer(pLoc.seed, 4, gl.FLOAT, false, 28, 12);
    gl.uniformMatrix4fv(pLoc.viewProj, false, viewProj);
    gl.uniformMatrix4fv(pLoc.model, false, model);
    gl.uniform1f(pLoc.time, time);
    gl.uniform1f(pLoc.px, dpr * (wrap.clientHeight / 168));
    gl.uniform3fv(pLoc.smoke, pal.smoke);
    gl.uniform3fv(pLoc.fly, pal.fly);
    gl.uniform1f(pLoc.night, look.night);
    gl.drawArrays(gl.POINTS, 0, partInfo.smoke);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.drawArrays(gl.POINTS, partInfo.smoke, partInfo.flies);

    gl.depthMask(true);
  }

  // Keep drawing while anything is moving; otherwise stop and wait to be woken.
  const moving = () => !reduced() || state.dragging || Math.abs(state.velocity) > 0.02 || Math.abs(state.pop) > 0.002 || Math.abs(state.excite - state.exciteTarget) > 0.004;

  function frame(now) {
    raf = 0;
    if (disposed || !active || document.hidden) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
    lastTime = now;
    const still = reduced();
    if (!still) clock += dt;

    if (state.dragging) {
      // yaw is moved directly by the pointer
    } else if (Math.abs(state.velocity) > 0.02) {
      state.yaw += state.velocity * dt;
      state.velocity *= Math.pow(0.04, dt); // glide to a stop
      state.idleSince = now;
    } else if (!still && now - state.idleSince > 1200) {
      state.yaw += AUTO_SPEED * (1 - 0.7 * state.excite) * dt;
    }
    // ease the pointer-follow tilt and the "someone is typing" excitement
    const ease = 1 - Math.pow(0.001, dt);
    state.tiltX += (state.targetX - state.tiltX) * ease;
    state.tiltY += (state.targetY - state.tiltY) * ease;
    state.excite += (state.exciteTarget - state.excite) * (1 - Math.pow(0.02, dt));
    // bounce after a tap: a small spring
    state.popV += (-90 * state.pop - 9 * state.popV) * dt;
    state.pop += state.popV * dt;
    if (still) { state.pop = 0; state.popV = 0; }

    draw();
    if (moving()) raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (raf || disposed || lost || !active || document.hidden) return;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }

  // Pointer: drag to spin, hover to tilt, tap to bounce.
  let lastX = 0;
  let lastMove = 0;
  let downX = 0;
  let downAt = 0;
  const onDown = (e) => {
    state.dragging = true;
    state.velocity = 0;
    lastX = downX = e.clientX;
    lastMove = downAt = performance.now();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
    kick();
  };
  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      state.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      state.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    if (state.dragging) {
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dtMove = Math.max(0.008, (now - lastMove) / 1000);
      state.yaw += dx * 0.012;
      state.velocity = Math.max(-6, Math.min(6, (dx * 0.012) / dtMove));
      lastX = e.clientX;
      lastMove = now;
    }
    kick();
  };
  const onUp = (e) => {
    if (!state.dragging) return;
    state.dragging = false;
    const now = performance.now();
    // a quick press with hardly any movement is a tap
    if (e && e.type === "pointerup" && Math.abs(e.clientX - downX) < 5 && now - downAt < 300 && !reduced()) {
      state.popV = 2.6;
      state.velocity = 0;
    } else if (now - lastMove > 120) {
      // a pause before letting go means "stay where I put it"
      state.velocity = 0;
    }
    state.idleSince = now;
    kick();
  };
  const onLeave = () => {
    state.targetX = 0;
    state.targetY = 0;
    kick();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointerleave", onLeave);

  const onLost = (e) => {
    e.preventDefault();
    lost = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (hooks.onLost) hooks.onLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const onVisibility = () => {
    if (!document.hidden) kick();
  };
  document.addEventListener("visibilitychange", onVisibility);

  let observer = null;
  const onResize = () => {
    resize();
    draw();
    kick();
  };
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(onResize);
    observer.observe(wrap);
  } else {
    window.addEventListener("resize", onResize);
  }

  try {
    setup();
    resize();
    state.idleSince = performance.now();
  } catch (e) {
    return null;
  }

  return {
    setActive(on) {
      if (disposed || lost) return;
      active = Boolean(on);
      if (active) {
        try {
          uploadModel(); // picks up a changed light/dark choice
        } catch (e) {
          /* keep what is already on screen */
        }
        resize();
        draw();
        kick();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    setExcited(on) {
      state.exciteTarget = on ? 1 : 0;
      kick();
    },
    // for tests: draw one frame at a chosen angle
    snapshot(yaw, excite = 0, seconds = 0) {
      state.yaw = yaw;
      state.excite = state.exciteTarget = excite;
      clock = seconds;
      uploadModel();
      resize();
      draw();
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (observer) observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      try {
        [solidBuf, decalBuf, partBuf].forEach((b) => b && gl.deleteBuffer(b));
        [solidProg, partProg].forEach((p) => p && gl.deleteProgram(p));
        const ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      } catch (e) {
        /* ignore */
      }
    },
  };
}
