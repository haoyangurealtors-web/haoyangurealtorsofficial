import React, { useEffect, useRef, useState } from "react";

/*
  A small low-poly 3D house for the log-in / sign-up window.

  - Plain WebGL: no extra library to install, and nothing is loaded from another website,
    so it works with the site's strict security headers (script-src 'self').
  - It loads on its own (App.jsx imports it with React.lazy), so it never slows the first page load.
  - Turns slowly by itself, follows the pointer a little, and can be dragged to spin.
  - It is only decoration (hidden from screen readers). If the device has no WebGL, or the
    graphics context is lost, it quietly disappears and the form carries on as normal.
  - Pauses when the window is closed or the tab is hidden. Holds still if the person asked
    their device for reduced motion.
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
  rotationY(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },
};

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/* ------------------------------------------------------------- the model */

const PALETTES = {
  light: {
    wall: "#F4E2D6", trim: "#FFF8F3", roof: "#6B3A3A", ridge: "#4A2828", brick: "#9A5646", door: "#2A2940",
    knob: "#E7B07C", glass: "#FFD9A0", stone: "#CDB8AC", lawn: "#A9BE9B", base: "#6E4A47", leaf: "#6F8F6C",
    leaf2: "#5C7C5B", trunk: "#6B4A3A", sign: "#D29274", post: "#7A5A4A",
  },
  dark: {
    wall: "#F7E9E1", trim: "#FFF8F3", roof: "#8A4A4A", ridge: "#5E3434", brick: "#B26A57", door: "#D29274",
    knob: "#FFE2B8", glass: "#FFD08A", stone: "#9C8A86", lawn: "#5F7A60", base: "#3A2A33", leaf: "#7DA079",
    leaf2: "#678C66", trunk: "#8A6450", sign: "#E3A98C", post: "#A07F6B",
  },
};

function buildHouse(theme) {
  const P = PALETTES[theme] || PALETTES.light;
  const data = [];

  const push = (p, n, c, e) => data.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], e);
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

  // Any convex solid: faces point away from the middle of the solid, whatever order the corners were given in.
  function convex(points, faces, color, glow = 0) {
    const centre = mean(points);
    faces.forEach((face) => {
      const pts = face.map((i) => points[i]);
      let n = unit(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
      const c = mean(pts);
      if (n[0] * (c[0] - centre[0]) + n[1] * (c[1] - centre[1]) + n[2] * (c[2] - centre[2]) < 0) n = [-n[0], -n[1], -n[2]];
      for (let i = 1; i < pts.length - 1; i += 1) {
        push(pts[0], n, color, glow);
        push(pts[i], n, color, glow);
        push(pts[i + 1], n, color, glow);
      }
    });
  }

  function box(x0, y0, z0, x1, y1, z1, color, glow = 0) {
    const p = [
      [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
      [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
    ];
    convex(p, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], color, glow);
  }

  function cone(cx, cy, cz, r, h, seg, color) {
    const pts = [[cx, cy + h, cz]];
    for (let i = 0; i < seg; i += 1) {
      const a = (i / seg) * Math.PI * 2 + 0.3;
      pts.push([cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r]);
    }
    const faces = [];
    for (let i = 0; i < seg; i += 1) faces.push([0, 1 + i, 1 + ((i + 1) % seg)]);
    faces.push(Array.from({ length: seg }, (_, i) => 1 + i));
    convex(pts, faces, color);
  }

  // Round, smooth-shaded disc or post (used for the lawn, its edge and the tree trunk).
  function cylinder(cx, y0, cz, r, y1, seg, color) {
    for (let i = 0; i < seg; i += 1) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const p00 = [cx + c0 * r, y0, cz + s0 * r], p10 = [cx + c1 * r, y0, cz + s1 * r];
      const p01 = [cx + c0 * r, y1, cz + s0 * r], p11 = [cx + c1 * r, y1, cz + s1 * r];
      const n0 = [c0, 0, s0], n1 = [c1, 0, s1];
      push(p00, n0, color, 0); push(p10, n1, color, 0); push(p11, n1, color, 0);
      push(p00, n0, color, 0); push(p11, n1, color, 0); push(p01, n0, color, 0);
      push([cx, y1, cz], [0, 1, 0], color, 0); push(p01, [0, 1, 0], color, 0); push(p11, [0, 1, 0], color, 0);
      push([cx, y0, cz], [0, -1, 0], color, 0); push(p10, [0, -1, 0], color, 0); push(p00, [0, -1, 0], color, 0);
    }
  }

  const C = (name) => hex(P[name]);

  // Ground: a round lawn on a darker base, like a model on a stand.
  cylinder(0, -0.34, 0, 2.7, -0.07, 56, C("base"));
  cylinder(0, -0.07, 0, 2.76, 0, 56, C("lawn"));

  // House: walls, step and plinth.
  const hx = -0.35; // house centre (x)
  const hw = 1.2; // half width
  const hd = 0.85; // half depth
  const wh = 1.2; // wall height
  const rise = 0.85; // roof rise
  box(hx - hw - 0.05, 0, -hd - 0.05, hx + hw + 0.05, 0.13, hd + 0.05, C("stone"));
  box(hx - hw, 0.13, -hd, hx + hw, wh, hd, C("wall"));

  // Gable ends (the triangles under the roof).
  const gl = hx - hw, gr = hx + hw;
  convex(
    [[gl, wh, -hd], [gl, wh, hd], [gl, wh + rise, 0], [gr, wh, -hd], [gr, wh, hd], [gr, wh + rise, 0]],
    [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [0, 2, 5, 3], [1, 2, 5, 4]],
    C("wall")
  );

  // Roof: two thick slabs that carry on past the walls, with a cap along the top.
  const over = 0.3, overX = 0.28, thick = 0.1, eps = 0.012;
  const slope = Math.hypot(hd, rise);
  const nz = rise / slope, ny = hd / slope; // up-and-outwards direction of the front slope
  const eaveZ = hd + over;
  const eaveY = wh + rise - (rise / hd) * eaveZ;
  [1, -1].forEach((side) => {
    const line = (offset) => [
      [0, wh + rise + ny * offset],
      [eaveZ * side, eaveY + ny * offset],
    ];
    const lo = line(eps), hi = line(thick);
    // adjust z for the slab's own thickness along the slope normal
    const pts = [];
    [hx - hw - overX, hx + hw + overX].forEach((x) => {
      pts.push([x, lo[0][1], lo[0][0] + side * nz * eps]);
      pts.push([x, lo[1][1], lo[1][0] + side * nz * eps]);
      pts.push([x, hi[1][1], hi[1][0] + side * nz * thick]);
      pts.push([x, hi[0][1], hi[0][0] + side * nz * thick]);
    });
    convex(pts, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], C("roof"));
  });
  box(hx - hw - overX - 0.02, wh + rise + 0.03, -0.09, hx + hw + overX + 0.02, wh + rise + 0.17, 0.09, C("ridge"));

  // Chimney.
  box(hx + 0.55, 1.45, -0.42, hx + 0.85, 2.18, -0.14, C("brick"));
  box(hx + 0.51, 2.18, -0.46, hx + 0.89, 2.25, -0.10, C("ridge"));

  // Front (the side with the door): door, frame, step, two windows.
  const fz = hd; // front wall plane
  box(hx + 0.0, 0.13, fz, hx + 0.52, 0.99, fz + 0.025, C("trim"));
  box(hx + 0.05, 0.13, fz + 0.025, hx + 0.47, 0.93, fz + 0.06, C("door"));
  box(hx + 0.4, 0.5, fz + 0.06, hx + 0.44, 0.55, fz + 0.09, C("knob"));
  box(hx - 0.06, 0, fz + 0.02, hx + 0.58, 0.07, fz + 0.4, C("stone"));
  const windowFront = (cx) => {
    box(cx - 0.29, 0.5, fz, cx + 0.29, 1.08, fz + 0.03, C("trim"));
    box(cx - 0.23, 0.56, fz + 0.03, cx + 0.23, 1.02, fz + 0.05, C("glass"), 1);
    box(cx - 0.23, 0.77, fz + 0.05, cx + 0.23, 0.81, fz + 0.065, C("trim"));
    box(cx - 0.02, 0.56, fz + 0.05, cx + 0.02, 1.02, fz + 0.065, C("trim"));
    box(cx - 0.31, 0.46, fz, cx + 0.31, 0.5, fz + 0.09, C("stone"));
  };
  windowFront(hx - 0.7);
  windowFront(hx + 0.95);

  // Side windows (so the glow is still there as it turns).
  [1, -1].forEach((side) => {
    const x = hx + side * hw;
    const lo = Math.min(x, x + side * 0.05), hi = Math.max(x, x + side * 0.05);
    box(lo, 0.5, -0.29, hi, 1.08, 0.29, C("trim"));
    const px0 = side > 0 ? x : x - 0.07, px1 = side > 0 ? x + 0.07 : x;
    box(px0, 0.56, -0.23, px1, 1.02, 0.23, C("glass"), 1);
  });

  // Path from the door to the edge of the lawn.
  box(hx + 0.04, 0, fz + 0.4, hx + 0.48, 0.03, 2.62, C("stone"));

  // Tree.
  cylinder(1.75, 0, 0.7, 0.1, 0.42, 10, C("trunk"));
  cone(1.75, 0.3, 0.7, 0.58, 0.72, 8, C("leaf"));
  cone(1.75, 0.76, 0.7, 0.44, 0.66, 8, C("leaf2"));
  cone(1.75, 1.18, 0.7, 0.3, 0.6, 8, C("leaf"));

  // "For sale" style yard sign.
  box(-1.42, 0, 1.55, -1.37, 0.78, 1.6, C("post"));
  box(-1.78, 0.5, 1.53, -1.0, 0.86, 1.58, C("sign"));
  box(-1.74, 0.34, 1.53, -1.04, 0.46, 1.58, C("ridge"));

  return new Float32Array(data);
}

/* --------------------------------------------------------------- shaders */

const VERT = `
attribute vec3 aPos;
attribute vec3 aNor;
attribute vec3 aCol;
attribute float aGlow;
uniform mat4 uViewProj;
uniform mat4 uModel;
varying vec3 vNor;
varying vec3 vCol;
varying float vGlow;
void main() {
  vNor = mat3(uModel) * aNor;
  vCol = aCol;
  vGlow = aGlow;
  gl_Position = uViewProj * (uModel * vec4(aPos, 1.0));
}`;

const FRAG = `
precision mediump float;
varying vec3 vNor;
varying vec3 vCol;
varying float vGlow;
uniform vec3 uKey;
uniform vec3 uFill;
void main() {
  vec3 n = normalize(vNor);
  vec3 base = pow(vCol, vec3(2.2));
  float key = max(dot(n, uKey), 0.0);
  float fill = max(dot(n, uFill), 0.0);
  float sky = n.y * 0.5 + 0.5;
  vec3 ambient = mix(vec3(0.15, 0.12, 0.13), vec3(0.34, 0.37, 0.46), sky);
  vec3 lit = base * (ambient + vec3(1.0, 0.93, 0.82) * key * 0.95 + vec3(0.5, 0.6, 0.85) * fill * 0.26);
  vec3 glow = base * 1.1 + vec3(0.5, 0.34, 0.1);
  lit = mix(lit, glow, vGlow);
  gl_FragColor = vec4(pow(lit, vec3(1.0 / 2.2)), 1.0);
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

/* ------------------------------------------------------------- component */

export default function AuthHouse3D({ active = true }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const controlRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    let gl = null;
    try {
      const options = { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" };
      gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
    } catch (e) {
      gl = null;
    }
    if (!gl) {
      setSupported(false);
      return undefined;
    }

    let program = null;
    let buffer = null;
    let vertexCount = 0;
    let builtFor = "";
    let loc = null;
    let raf = 0;
    let lastTime = 0;
    let disposed = false;
    let lost = false;

    const themeNow = () => {
      const root = wrap.closest("[data-theme]");
      return root && root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    };

    const reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

    // Motion state.
    const state = { yaw: -0.65, velocity: 0, dragging: false, idleSince: 0, tiltX: 0, tiltY: 0, targetX: 0, targetY: 0 };
    const AUTO_SPEED = 0.3; // radians per second
    const view = { width: 0, height: 0 };

    function setup() {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Program failed");
      gl.useProgram(program);
      loc = {
        pos: gl.getAttribLocation(program, "aPos"),
        nor: gl.getAttribLocation(program, "aNor"),
        col: gl.getAttribLocation(program, "aCol"),
        glow: gl.getAttribLocation(program, "aGlow"),
        viewProj: gl.getUniformLocation(program, "uViewProj"),
        model: gl.getUniformLocation(program, "uModel"),
        key: gl.getUniformLocation(program, "uKey"),
        fill: gl.getUniformLocation(program, "uFill"),
      };
      buffer = gl.createBuffer();
      builtFor = "";
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
      uploadModel();
    }

    function uploadModel() {
      const theme = themeNow();
      if (theme === builtFor) return;
      const data = buildHouse(theme);
      vertexCount = data.length / 10;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      builtFor = theme;
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

    function draw() {
      if (lost || !program || view.width < 2 || view.height < 2) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const stride = 40;
      gl.enableVertexAttribArray(loc.pos);
      gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(loc.nor);
      gl.vertexAttribPointer(loc.nor, 3, gl.FLOAT, false, stride, 12);
      gl.enableVertexAttribArray(loc.col);
      gl.vertexAttribPointer(loc.col, 3, gl.FLOAT, false, stride, 24);
      gl.enableVertexAttribArray(loc.glow);
      gl.vertexAttribPointer(loc.glow, 1, gl.FLOAT, false, stride, 36);

      const aspect = canvas.width / canvas.height;
      const elevation = 0.36 + state.tiltY * 0.16;
      const distance = 9.8;
      const target = [0.15, 0.55, 0];
      const eye = [
        target[0] + Math.sin(state.tiltX * 0.18) * distance,
        target[1] + Math.sin(elevation) * distance,
        target[2] + Math.cos(elevation) * distance,
      ];
      const proj = mat.perspective(0.5, aspect, 1, 40);
      const viewM = mat.lookAt(eye, target, [0, 1, 0]);
      gl.uniformMatrix4fv(loc.viewProj, false, new Float32Array(mat.multiply(proj, viewM)));
      gl.uniformMatrix4fv(loc.model, false, new Float32Array(mat.rotationY(state.yaw)));
      gl.uniform3f(loc.key, -0.45, 0.78, 0.55);
      gl.uniform3f(loc.fill, 0.62, 0.22, -0.5);
      gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    }

    const moving = () => !reduced.matches || state.dragging || Math.abs(state.velocity) > 0.02;

    function frame(now) {
      raf = 0;
      if (disposed || !activeRef.current || document.hidden) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
      lastTime = now;

      if (state.dragging) {
        // yaw is moved directly by the pointer
      } else if (Math.abs(state.velocity) > 0.02) {
        state.yaw += state.velocity * dt;
        state.velocity *= Math.pow(0.04, dt); // glide to a stop
        state.idleSince = now;
      } else if (!reduced.matches && now - state.idleSince > 1200) {
        state.yaw += AUTO_SPEED * dt;
      }
      // ease the pointer-follow tilt
      const ease = 1 - Math.pow(0.001, dt);
      state.tiltX += (state.targetX - state.tiltX) * ease;
      state.tiltY += (state.targetY - state.tiltY) * ease;

      draw();
      if (moving()) raf = requestAnimationFrame(frame);
    }

    function kick() {
      if (raf || disposed || lost || !activeRef.current || document.hidden) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    }

    // Pointer: drag to spin, hover to tilt.
    let lastX = 0;
    let lastMove = 0;
    const onDown = (e) => {
      state.dragging = true;
      state.velocity = 0;
      lastX = e.clientX;
      lastMove = performance.now();
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
        state.velocity = (dx * 0.012) / dtMove;
        state.velocity = Math.max(-6, Math.min(6, state.velocity));
        lastX = e.clientX;
        lastMove = now;
      }
      kick();
    };
    const onUp = () => {
      if (!state.dragging) return;
      state.dragging = false;
      // a pause before letting go means "stay where I put it"
      if (performance.now() - lastMove > 120) state.velocity = 0;
      state.idleSince = performance.now();
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
      setSupported(false);
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
      setSupported(false);
      return undefined;
    }

    // Lets the effect below start and stop it as the window opens and closes.
    controlRef.current = {
      setActive(on) {
        if (disposed || lost) return;
        if (on) {
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
    };
    if (activeRef.current) controlRef.current.setActive(true);

    return () => {
      disposed = true;
      controlRef.current = null;
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
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        const ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    if (controlRef.current) controlRef.current.setActive(active);
  }, [active]);

  if (!supported) return null;
  return (
    <div ref={wrapRef} className="pk-auth-3d" aria-hidden="true">
      <canvas ref={canvasRef} className="pk-auth-3d-canvas" />
    </div>
  );
}
