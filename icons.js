// Hand-drawn SVG path icons for Doctor Ayden.
// Every icon is a list of [pathD, fill, stroke?, lineWidth?] layers in a 48x48 box.
// stroke defaults to a ~30% darker shade of fill; null means no outline.
// The same data drives both the inline-SVG and the canvas renderer, so they cannot drift.

const LINE = 2.5;
const INK = '#4a3a33';
const SKIN = '#edbd94';
const WHITE = '#ffffff';

const shades = new Map();
export function shade(hex, amount) {
  const key = hex + amount;
  if (shades.has(key)) return shades.get(key);
  const n = parseInt(hex.slice(1, 7), 16),
    to = amount < 0 ? 0 : 255,
    p = Math.abs(amount);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (to - v) * p));
  const out = '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  shades.set(key, out);
  return out;
}

// ---------- geometry helpers (all return path-data strings) ----------
const f = (v) => +v.toFixed(2);
const ID = (x, y) => [x, y];
const move = (dx, dy) => (x, y) => [x + dx, y + dy];
const turn = (deg, ox, oy, dx = 0, dy = 0) => {
  const a = (deg * Math.PI) / 180,
    c = Math.cos(a),
    s = Math.sin(a);
  return (x, y) => [ox + dx + (x - ox) * c - (y - oy) * s, oy + dy + (x - ox) * s + (y - oy) * c];
};
const pt = (T, x, y) => T(x, y).map(f).join(' ');

function circle(cx, cy, r, T = ID, ccw = false) {
  const s = ccw ? 0 : 1;
  return `M${pt(T, cx - r, cy)}A${f(r)} ${f(r)} 0 1 ${s} ${pt(T, cx + r, cy)}A${f(r)} ${f(r)} 0 1 ${s} ${pt(T, cx - r, cy)}Z`;
}
function ellipse(cx, cy, rx, ry, rot = 0) {
  const a = (rot * Math.PI) / 180,
    dx = rx * Math.cos(a),
    dy = rx * Math.sin(a);
  const p1 = `${f(cx - dx)} ${f(cy - dy)}`,
    p2 = `${f(cx + dx)} ${f(cy + dy)}`;
  return `M${p1}A${rx} ${ry} ${rot} 1 1 ${p2}A${rx} ${ry} ${rot} 1 1 ${p1}Z`;
}
function rrect(x, y, w, h, r, T = ID) {
  r = Math.min(r, w / 2, h / 2);
  const A = (px, py) => `A${f(r)} ${f(r)} 0 0 1 ${pt(T, px, py)}`;
  return (
    `M${pt(T, x + r, y)}L${pt(T, x + w - r, y)}${A(x + w, y + r)}L${pt(T, x + w, y + h - r)}` +
    `${A(x + w - r, y + h)}L${pt(T, x + r, y + h)}${A(x, y + h - r)}L${pt(T, x, y + r)}${A(x + r, y)}Z`
  );
}
function capsule(x1, y1, x2, y2, r, T = ID) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1,
    nx = (-(y2 - y1) / len) * r,
    ny = ((x2 - x1) / len) * r;
  const A = (px, py) => `A${f(r)} ${f(r)} 0 0 0 ${pt(T, px, py)}`;
  return (
    `M${pt(T, x1 + nx, y1 + ny)}L${pt(T, x2 + nx, y2 + ny)}${A(x2 - nx, y2 - ny)}` +
    `L${pt(T, x1 - nx, y1 - ny)}${A(x1 + nx, y1 + ny)}Z`
  );
}
function poly(points, close = true, T = ID) {
  return points.map(([x, y], i) => (i ? 'L' : 'M') + pt(T, x, y)).join('') + (close ? 'Z' : '');
}
function star(cx, cy, R, r, n = 5, rot = -90) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180,
      rad = i % 2 ? r : R;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  return poly(pts);
}
function sparkle(cx, cy, R, k = 0.2) {
  const q = R * k;
  return (
    `M${f(cx)} ${f(cy - R)}Q${f(cx + q)} ${f(cy - q)} ${f(cx + R)} ${f(cy)}` +
    `Q${f(cx + q)} ${f(cy + q)} ${f(cx)} ${f(cy + R)}Q${f(cx - q)} ${f(cy + q)} ${f(cx - R)} ${f(cy)}` +
    `Q${f(cx - q)} ${f(cy - q)} ${f(cx)} ${f(cy - R)}Z`
  );
}
function cloudPath(cx, cy, s) {
  const P = (x, y) => `${f(cx + (x - 24) * s)} ${f(cy + (y - 28) * s)}`,
    R = (r) => `${f(r * s)} ${f(r * s)}`;
  return `M${P(13, 37)}A${R(8)} 0 0 1 ${P(13.5, 21)}A${R(10.5)} 0 0 1 ${P(33, 18.5)}A${R(9.5)} 0 0 1 ${P(35.5, 37)}Z`;
}
function annulusTop(cx, cy, r1, r2) {
  return `M${f(cx - r2)} ${cy}A${r2} ${r2} 0 0 1 ${f(cx + r2)} ${cy}L${f(cx + r1)} ${cy}A${r1} ${r1} 0 0 0 ${f(cx - r1)} ${cy}Z`;
}

// Merge overlapping parts into one sticker shape: thick outline pass, then fills.
function merged(parts, fill, stroke = shade(fill, -0.3)) {
  return [...parts.map((d) => [d, stroke, stroke, LINE * 2]), ...parts.map((d) => [d, fill, null])];
}
// A line drawn as an outlined tube.
function tube(d, fill, width, stroke = shade(fill, -0.3)) {
  return [
    [d, 'none', stroke, width + LINE * 2],
    [d, 'none', fill, width],
  ];
}
const face = (x, y, gap = 4, r = 1.6) => [
  [circle(x - gap, y, r) + circle(x + gap, y, r), INK, null],
  [`M${x - 3.5} ${y + 4.2}Q${x} ${y + 7.4} ${x + 3.5} ${y + 4.2}`, 'none', INK, 2],
];
const shine = (cx, cy, rx, ry, rot = -30) => [ellipse(cx, cy, rx, ry, rot), WHITE, null];

// ---------- shared shapes ----------
function handLayers(T) {
  const palm = rrect(14, 21, 22, 19, 8, T),
    thumb = capsule(16, 33, 9.5, 25, 3.2, T);
  const stroke = shade(SKIN, -0.3);
  return [
    [palm, stroke, stroke, LINE * 2],
    [thumb, stroke, stroke, LINE * 2],
    [capsule(17.5, 26, 17.5, 11, 2.9, T), SKIN],
    [capsule(23, 26, 23, 8.5, 2.9, T), SKIN],
    [capsule(28.5, 26, 28.5, 10, 2.9, T), SKIN],
    [capsule(33.5, 27, 33.5, 14.5, 2.6, T), SKIN],
    [palm, SKIN, null],
    [thumb, SKIN, null],
  ];
}
function speakerBody() {
  const c = '#5fa98f';
  return [
    ['M8 18H14L24 9.5Q26 8.2 26 10.5V37.5Q26 39.8 24 38.5L14 30H8Q6 30 6 28V20Q6 18 8 18Z', c],
    shine(10.5, 22, 1.6, 2.6, 0),
  ];
}
function snowflakeD(cx, cy, R) {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const a = ((i * 60 - 90) * Math.PI) / 180,
      ux = Math.cos(a),
      uy = Math.sin(a);
    d += `M${f(cx)} ${f(cy)}L${f(cx + ux * R)} ${f(cy + uy * R)}`;
    const m = [cx + ux * R * 0.58, cy + uy * R * 0.58];
    const l = [m[0] + Math.cos(a + 0.8) * 5.5, m[1] + Math.sin(a + 0.8) * 5.5];
    const r = [m[0] + Math.cos(a - 0.8) * 5.5, m[1] + Math.sin(a - 0.8) * 5.5];
    d += `M${f(l[0])} ${f(l[1])}L${f(m[0])} ${f(m[1])}L${f(r[0])} ${f(r[1])}`;
  }
  return d;
}
function gearD(cx, cy, n, R, r) {
  const pts = [];
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a = i * step - 90;
    for (const [rad, off] of [
      [r, -step * 0.36],
      [R, -step * 0.2],
      [R, step * 0.2],
      [r, step * 0.36],
    ]) {
      const t = ((a + off) * Math.PI) / 180;
      pts.push([cx + rad * Math.cos(t), cy + rad * Math.sin(t)]);
    }
  }
  return poly(pts);
}

// ---------- icons ----------
export const ICONS = {
  // ----- items -----
  sun: [
    [star(24, 24, 21, 15.5, 12), '#f6b94c'],
    [circle(24, 24, 12.5), '#fbd36e', shade('#f6b94c', -0.3)],
    shine(18.5, 17.5, 2.6, 1.5),
    [ellipse(17.5, 27, 2, 1.3) + ellipse(30.5, 27, 2, 1.3), '#f3a078', null],
    ...face(24, 22.5),
  ],
  flower: [
    ...tube('M24 30V43', '#8fbf5c', 3),
    [
      'M23 41C17 42 11 39.5 9 34C15 32 21 35 23 41Z' +
        'M25 41C31 42 37 39.5 39 34C33 32 27 35 25 41Z',
      '#a9cc73',
    ],
    [
      circle(24, 9, 6.5) +
        circle(33, 15.5, 6.5) +
        circle(29.6, 26, 6.5) +
        circle(18.4, 26, 6.5) +
        circle(15, 15.5, 6.5),
      '#fff1c2',
      '#c9a95a',
    ],
    [circle(24, 18.5, 6.5), '#f6c94c'],
    shine(22, 16.5, 1.8, 1.1),
  ],
  cloud: [
    [cloudPath(24, 28, 1.05), '#7fbddd'],
    shine(14, 23, 2.4, 1.5),
    [ellipse(16.5, 31, 2, 1.3) + ellipse(31.5, 31, 2, 1.3), '#f2a6a0', null],
    ...face(24, 26.5),
  ],
  lotion: [
    [rrect(28, 6.5, 10, 4, 2), '#d9d0ea', shade('#b8a2da', -0.3)],
    [rrect(21.5, 9, 5, 8, 1.5), '#d9d0ea', shade('#b8a2da', -0.3)],
    [rrect(16, 4.5, 16, 5.5, 2.5), '#d9d0ea', shade('#b8a2da', -0.3)],
    [rrect(18.5, 15, 11, 6, 2), '#9d86c4'],
    [rrect(11.5, 20, 25, 24, 6), '#b8a2da'],
    [rrect(16, 27, 16, 11, 3), '#f4f0fb', shade('#b8a2da', -0.3), 2],
    ['M24 29.5Q27.5 33.5 27.5 34.8A3.5 3.5 0 0 1 20.5 34.8Q20.5 33.5 24 29.5Z', '#7fbddd', null],
    shine(14.8, 25, 1.4, 2.8, 0),
  ],
  bandage: [
    [capsule(13, 35, 35, 13, 8), '#ecaa83'],
    [
      poly([
        [32.13, 23.65],
        [24.35, 15.87],
        [15.87, 24.35],
        [23.65, 32.13],
      ]),
      '#f7d6c2',
      shade('#ecaa83', -0.3),
      2,
    ],
    [
      circle(16.57, 35.67, 1.3) +
        circle(12.33, 31.43, 1.3) +
        circle(35.67, 16.57, 1.3) +
        circle(31.43, 12.33, 1.3),
      shade('#ecaa83', -0.25),
      null,
    ],
    shine(19.5, 19.5, 2.8, 1.3, -45),
  ],
  ice: [
    [
      poly([
        [8, 18],
        [18, 9],
        [40, 9],
        [30, 18],
      ]),
      '#c9f0f7',
      shade('#8bd8e8', -0.35),
    ],
    [
      poly([
        [30, 18],
        [40, 9],
        [40, 32],
        [30, 41],
      ]),
      '#6fc6da',
      shade('#8bd8e8', -0.35),
    ],
    [rrect(8, 18, 22, 23, 2), '#8bd8e8', shade('#8bd8e8', -0.35)],
    [rrect(11.5, 21.5, 4, 9, 2), WHITE, null],
    [circle(13.5, 34, 1.8), WHITE, null],
    [sparkle(37, 38.5, 5), WHITE, shade('#8bd8e8', -0.35), 1.8],
  ],
  cup: [
    ['M10.5 15H37.5L34.4 40.7Q34.1 43 31.8 43H16.2Q13.9 43 13.6 40.7Z', '#e8f5fb', null],
    ...tube('M25 36L30 7.5L37 6', '#ef8a80', 3.4),
    ['M12.3 24.5H35.7L34 40.4Q33.8 41.8 32.2 41.8H15.8Q14.2 41.8 14 40.4Z', '#8fc7e2', null],
    [
      'M10.5 15H37.5L34.4 40.7Q34.1 43 31.8 43H16.2Q13.9 43 13.6 40.7Z',
      'none',
      shade('#8fc7e2', -0.35),
    ],
    [rrect(15, 26.5, 3, 11, 1.5), WHITE, null],
  ],
  teddy: [
    [circle(12.5, 14, 6.5) + circle(35.5, 14, 6.5), '#cc956a'],
    [circle(12.5, 14, 3.2) + circle(35.5, 14, 3.2), '#ecc9a5', null],
    [ellipse(24, 27, 15.5, 14), '#cc956a'],
    [ellipse(24, 31.5, 7.5, 6), '#ecc9a5', shade('#cc956a', -0.3), 2],
    [ellipse(24, 29, 3, 2.1), INK, null],
    [circle(17.5, 23.5, 1.9) + circle(30.5, 23.5, 1.9), INK, null],
    ['M21.5 33.5Q24 35.5 26.5 33.5', 'none', INK, 1.8],
    shine(16, 18, 2.2, 1.3),
  ],

  // ----- symptoms / checkups -----
  thermometer: [
    ['M19.5 28V9A4.5 4.5 0 0 1 28.5 9V28A8 8 0 1 1 19.5 28Z', WHITE, '#8a9aa3'],
    [rrect(22, 12, 4, 23, 2), '#ef6b5b', null],
    [circle(24, 34.6, 5.4), '#ef6b5b', null],
    [circle(22, 32.6, 1.5), WHITE, null],
    ['M31.5 12H35M31.5 17H34M31.5 22H35', 'none', '#8a9aa3', 2],
  ],
  sneeze: [
    [
      'M17 25C16 17 18.5 11 22.5 7C24.5 10.5 29 9.5 32 6C32.5 12.5 31.5 19 31 25Z',
      WHITE,
      '#9fb0b8',
    ],
    [rrect(6, 22, 36, 21, 5), '#9fd6c4'],
    [rrect(15, 20, 18, 5, 2.5), '#6fae9a', null],
    ['M18 24.5C18 21 20 19 21 18C22.5 20.5 27 20 29.5 18.5C30 20.5 30 22.5 30 24.5Z', WHITE, null],
    [
      'M24 38.5C19 35 17.5 33 17.5 31A3 3 0 0 1 24 30A3 3 0 0 1 30.5 31C30.5 33 29 35 24 38.5Z',
      '#f4a9b8',
      null,
    ],
    shine(10.5, 27, 1.4, 2.4, 0),
  ],
  bump: [
    ...merged([rrect(3.5, 30, 41, 14, 6), 'M11 32C11 16 37 16 37 32Z'], SKIN),
    [ellipse(24, 26.5, 7, 4.5), '#f4a9a0', null],
    [ellipse(21.5, 25, 2.2, 1.1, 0), WHITE, null],
    [star(36, 10, 7.5, 3.4), '#f6c94c'],
    [sparkle(12, 12, 5), '#f6c94c'],
    ['M24 13.5V9.5M17.5 16L15 13.5M30.5 16L33 13.5', 'none', '#e9a13b', 2.2],
  ],
  arm: [
    ['M11 33H26Q33 33 33 26V17', 'none', shade(SKIN, -0.3), 15],
    [circle(33, 12, 6.8), shade(SKIN, -0.3), shade(SKIN, -0.3), 5],
    ['M11 33H26Q33 33 33 26V17', 'none', SKIN, 10],
    [circle(33, 12, 6.8), SKIN, null],
    ['M27.5 10.5H30.5M27.5 14H30.5', 'none', shade(SKIN, -0.3), 2],
    [rrect(26, 18.5, 14, 7, 2.5), '#fff6e6', '#c9a98a', 2.2],
    ['M30 19.5V24.5M34 19.5V24.5', 'none', '#e5d3bb', 1.6],
    [rrect(3.5, 25, 11, 16, 4), '#7fbddd'],
    shine(35.5, 9.5, 1.4, 1, 0),
  ],
  stethoscope: [
    ...tube('M14 6V14Q14 24 24 24Q34 24 34 14V6', '#3b9679', 3.2),
    ...tube('M24 24V31Q24 37 29 37', '#3b9679', 3.2),
    [circle(14, 5.5, 2.6) + circle(34, 5.5, 2.6), '#5f6b73', null],
    [circle(34, 37, 6.5), '#c9d3d9'],
    [circle(34, 37, 3), '#e9eef1', shade('#c9d3d9', -0.3), 1.8],
  ],
  magnifier: [
    ...tube('M30 30L39.5 39.5', '#e9b947', 6),
    [circle(20, 20, 12), '#e3f3f8', '#1f6e58', 7.5],
    [circle(20, 20, 12), 'none', '#3b9679', 3],
    ['M13.5 19A6.5 6.5 0 0 1 19 13.5', 'none', WHITE, 2.8],
  ],

  // ----- UI -----
  wheelchair: [
    ...tube('M11 12V28H30', '#8a9aa3', 2.5),
    [circle(20, 31, 10.5), 'none', '#1f6e58', 6.5],
    [circle(20, 31, 10.5), 'none', '#7fbddd', 3],
    [circle(20, 31, 2.6), '#3b9679'],
    ...tube('M19 16V25H29L32.5 34', '#3b9679', 5),
    [circle(19.5, 8.5, 4.6), SKIN],
    [circle(36, 39.5, 3.3), '#8a9aa3'],
  ],
  chat: [
    [
      'M15 7H33A9 9 0 0 1 42 16V24A9 9 0 0 1 33 33H22L12.5 41L14.5 33A9 9 0 0 1 6 24V16A9 9 0 0 1 15 7Z',
      '#d9efe4',
      '#3b9679',
    ],
    [circle(15.5, 20, 2.8) + circle(24, 20, 2.8) + circle(32.5, 20, 2.8), '#3b9679', null],
  ],
  hand: handLayers(move(1, 0)),
  clipboard: [
    [rrect(8.5, 7, 31, 37, 5), '#cc956a'],
    [rrect(12.5, 12, 23, 28, 2), WHITE, '#b8a58f', 2],
    [rrect(17, 4, 14, 8, 3), '#c9d3d9'],
    ['M17 20.5H31M17 26.5H31M17 32.5H25', 'none', '#8bb5a0', 2.5],
    ['M27 33L29.5 35.5L34 30', 'none', '#268c71', 2.5],
  ],
  soap: [
    [rrect(4, 25, 29, 16, 7), '#f4b6c2'],
    [rrect(8.5, 28.5, 13, 3, 1.5), WHITE, null],
    [circle(34, 17, 7.5), '#dff3fb', '#6aaed0'],
    [circle(19.5, 12.5, 5), '#dff3fb', '#6aaed0'],
    [circle(39.5, 33, 4), '#dff3fb', '#6aaed0'],
    [ellipse(31.5, 14.5, 2, 1.2) + ellipse(18, 11, 1.4, 0.8), WHITE, null],
  ],
  sparkles: [
    [sparkle(19, 27, 15), '#f6c94c'],
    [sparkle(36, 11, 7.5), '#f6c94c'],
    [sparkle(37.5, 36, 5.5), '#f6c94c'],
    shine(15, 22.5, 1.8, 1.1),
  ],
  lock: [
    ['M16 22V15A8 8 0 0 1 32 15V22', 'none', '#6f7f88', 8.5],
    ['M16 22V15A8 8 0 0 1 32 15V22', 'none', '#c9d3d9', 3.5],
    [rrect(9, 21, 30, 23, 6), '#e9b947'],
    [circle(24, 30.5, 3.3) + 'M22.3 31.5L21.5 38H26.5L25.7 31.5Z', INK, null],
    shine(13.5, 25.5, 1.4, 2.6, 0),
  ],
  tap: [
    ...merged([rrect(14, 21, 22, 20, 8)], SKIN),
    [capsule(19.8, 26, 19.8, 7, 3.3), SKIN],
    [rrect(14, 21, 22, 20, 8), SKIN, null],
    ['M25.5 27H33M25.5 32.5H33', 'none', shade(SKIN, -0.3), 2.2],
    [capsule(12.5, 34, 23, 35, 3.2), SKIN],
    ['M11.5 7L8 4.5M28 7L31.5 4.5M10.5 13H6.5M29 13H33', 'none', '#e9a13b', 2.5],
  ],
  keyboard: [
    [rrect(3.5, 13, 41, 23, 5), '#dfe8ee', '#8a9aa3'],
    [
      [8, 12.9, 17.8, 22.7, 27.6, 32.5, 37.4].map((x) => rrect(x, 17, 3.6, 3.6, 1)).join('') +
        [10.4, 15.3, 20.2, 25.1, 30, 34.9].map((x) => rrect(x, 23, 3.6, 3.6, 1)).join('') +
        rrect(14, 29, 20, 3.6, 1.5),
      '#8fa6b3',
      null,
    ],
  ],
  pause: [
    [rrect(11, 8, 10, 32, 4), '#3b9679'],
    [rrect(27, 8, 10, 32, 4), '#3b9679'],
    [rrect(13.5, 11, 2.5, 8, 1.2), WHITE, null],
    [rrect(29.5, 11, 2.5, 8, 1.2), WHITE, null],
  ],
  bag: [
    ...tube('M17 17V12.5Q17 8.5 21 8.5H27Q31 8.5 31 12.5V17', '#7a5a48', 3),
    [rrect(5, 16, 38, 27, 7), '#e07d6e'],
    [rrect(5, 22, 38, 3, 1.5), shade('#e07d6e', -0.15), null],
    ['M21.5 26H26.5V29.5H30V34.5H26.5V38H21.5V34.5H18V29.5H21.5Z', WHITE, null],
    shine(10, 20, 2.2, 1.2, 0),
  ],
  trophy: [
    ['M13 10H8.5Q6 10 6 13Q6 20 14.5 22.5', 'none', '#a88220', 7],
    ['M35 10H39.5Q42 10 42 13Q42 20 33.5 22.5', 'none', '#a88220', 7],
    ['M13 10H8.5Q6 10 6 13Q6 20 14.5 22.5', 'none', '#e9b947', 2.5],
    ['M35 10H39.5Q42 10 42 13Q42 20 33.5 22.5', 'none', '#e9b947', 2.5],
    [rrect(20.5, 26, 7, 8, 1), '#d9a93a'],
    ['M12.5 5H35.5V14Q35.5 28.5 24 28.5Q12.5 28.5 12.5 14Z', '#e9b947'],
    [star(24, 15.5, 5.5, 2.5), '#fff3c4', null],
    [rrect(13, 33, 22, 10, 3), '#cc956a'],
    [rrect(17.5, 36.5, 13, 3, 1.5), '#f6c94c', null],
    shine(16.5, 9.5, 1.3, 2.4, 0),
  ],
  star: [[star(24, 25.5, 21, 10, 5), '#f6c94c'], shine(17.5, 20, 2.6, 1.5)],
  wave: [
    ['M6 13Q3 18.5 5.5 24M40.5 6Q45 11 43.5 17', 'none', '#8bb5a0', 2.5],
    ...handLayers(turn(-18, 24, 32, 1, 1)),
  ],
  rainbow: [
    [annulusTop(24, 35, 16, 20.5), '#f08c82', null],
    [annulusTop(24, 35, 11.5, 16), '#f6c94c', null],
    [annulusTop(24, 35, 7, 11.5), '#7fbddd', null],
    [annulusTop(24, 35, 7, 20.5), 'none', '#8a7d8c'],
    [cloudPath(9, 36, 0.42), WHITE, '#9fb0b8'],
    [cloudPath(39, 36, 0.42), WHITE, '#9fb0b8'],
  ],
  hospital: [
    [rrect(5, 19, 38, 24, 3), '#dcebf3', '#7f98a6'],
    [rrect(15, 5, 18, 38, 3), '#f3f8fb', '#7f98a6'],
    ['M22 8.5H26V12H29.5V16H26V19.5H22V16H18.5V12H22Z', '#ef6b5b', null],
    [
      rrect(8, 23, 4.5, 4.5, 1) +
        rrect(8, 31, 4.5, 4.5, 1) +
        rrect(35.5, 23, 4.5, 4.5, 1) +
        rrect(35.5, 31, 4.5, 4.5, 1),
      '#8fc7e2',
      null,
    ],
    [rrect(19.5, 33, 9, 10, 2), '#8fc7e2', '#7f98a6', 2],
    [rrect(18.5, 24, 11, 5, 1.2), '#8fc7e2', null],
  ],
  medal: [
    [
      poly([
        [10, 4],
        [19, 4],
        [28, 22],
        [19, 22],
      ]),
      '#7fbddd',
    ],
    [
      poly([
        [38, 4],
        [29, 4],
        [20, 22],
        [29, 22],
      ]),
      '#f08c82',
    ],
    [circle(24, 31.5, 11.5), '#e9b947'],
    [circle(24, 31.5, 7.3), '#f6cf62', shade('#e9b947', -0.3), 2],
    [star(24, 31.8, 4.6, 2.1), '#fff3c4', null],
    shine(18, 26, 1.3, 2.2, 30),
  ],
  heart: [
    [
      'M24 41.5C10 33 5 25 5 17C5 10.8 9.6 6 15.2 6C19 6 22 8.3 24 11.8C26 8.3 29 6 32.8 6C38.4 6 43 10.8 43 17C43 25 38 33 24 41.5Z',
      '#ef8fa0',
    ],
    shine(13.5, 15, 3.2, 2),
  ],
  fish: [
    ['M33 24L43.5 14.5Q40.5 24 43.5 33.5Z', '#f6c94c'],
    ['M16 14Q22 4.5 30 14.5Z', '#f6c94c'],
    ['M18 34Q22 40 27 34.5Z', '#f6c94c'],
    ['M5 24C8 14.5 17 12 23 12C31 12 35 18 37 24C35 30 31 36 23 36C17 36 8 33.5 5 24Z', '#f5a54a'],
    ['M22 13.5Q18 24 22 34.5', 'none', WHITE, 3],
    [circle(12.5, 21.5, 3.2), WHITE, INK, 1.5],
    [circle(13.2, 21.8, 1.5), INK, null],
    ['M6.5 26.5Q8.5 27.5 10 26.5', 'none', INK, 1.6],
  ],
  spoon: [
    [capsule(22.5, 22.5, 40, 40, 3.2), '#c9d3d9'],
    [ellipse(17.5, 17.5, 12.5, 9.5, 45), '#c9d3d9'],
    [ellipse(17, 17, 8.5, 6, 45), '#f08c82', null],
    shine(13.5, 15, 1.2, 2.4, 45),
  ],
  bone: [
    ...merged(
      [
        capsule(14, 34, 34, 14, 4.5),
        circle(30.5, 10.5, 5.8),
        circle(37.5, 17.5, 5.8),
        circle(10.5, 30.5, 5.8),
        circle(17.5, 37.5, 5.8),
      ],
      '#fbf6e8',
      '#a89a78'
    ),
    [ellipse(29.5, 9.5, 2, 1.2, -45), WHITE, null],
  ],
  blanket: [
    [rrect(4, 26, 40, 16, 6.5), '#8fc7e2'],
    ['M10 26V42M17 26V42M31 26V42M38 26V42', 'none', '#b9dcee', 2.5],
    [rrect(4, 26, 40, 16, 6.5), 'none', shade('#8fc7e2', -0.3)],
    [rrect(7, 10, 34, 16, 6.5), '#ecaa83'],
    ['M13 10V26M20 10V26M28 10V26M35 10V26', 'none', '#f5ccb3', 2.5],
    [rrect(7, 10, 34, 16, 6.5), 'none', shade('#ecaa83', -0.3)],
    [
      'M24 22.5C21 20.5 19.8 19 19.8 17.6A2.1 2.1 0 0 1 24 17A2.1 2.1 0 0 1 28.2 17.6C28.2 19 27 20.5 24 22.5Z',
      '#e07d6e',
      null,
    ],
  ],
  tray: [
    [rrect(10.5, 9, 7, 5, 1.5), '#8bb5a0'],
    [rrect(9, 13, 10, 16, 3), '#b8a2da'],
    [rrect(11, 18, 6, 6, 1), '#f4f0fb', null],
    [capsule(24, 24, 34, 24, 3.4), '#f08c82'],
    ['M29 20.6H30.6A3.4 3.4 0 0 1 30.6 27.4H29Z', '#fff1c2', null],
    [capsule(24, 24, 34, 24, 3.4), 'none', shade('#f08c82', -0.3)],
    ['M6 32H42L38.5 40.5Q37.8 42 36 42H12Q10.2 42 9.5 40.5Z', '#c9d3d9'],
    [rrect(3, 28.5, 42, 5, 2.5), '#dde5ea', shade('#c9d3d9', -0.3)],
  ],
  snowflake: [
    [snowflakeD(24, 24, 19), 'none', '#4f93b3', 6.5],
    [snowflakeD(24, 24, 19), 'none', '#bfe6f5', 3],
    [circle(24, 24, 3.2), '#bfe6f5', '#4f93b3', 2],
  ],
  speaker: [
    ...speakerBody(),
    ['M31 18.5Q34.5 24 31 29.5M36 13.5Q42.5 24 36 34.5', 'none', '#3b9679', 3.2],
  ],
  'speaker-off': [
    ...speakerBody(),
    ['M31.5 18.5L41.5 29.5M41.5 18.5L31.5 29.5', 'none', '#e07d6e', 3.6],
  ],
  gear: [
    [gearD(24, 24, 8, 20.5, 15.5) + circle(24, 24, 5.5, ID, true), '#8fa9b8'],
    ['M14.5 19A10.5 10.5 0 0 1 19 14.5', 'none', WHITE, 2.4],
  ],
};

// ---------- renderers ----------
const warned = new Set();
function lookup(name) {
  const layers = ICONS[name];
  if (!layers && !warned.has(name)) {
    warned.add(name);
    console.warn(`[icons] unknown icon "${name}"`);
  }
  return layers;
}
function resolve([d, fill, stroke, width]) {
  const s = stroke === undefined ? (fill === 'none' ? null : shade(fill, -0.3)) : stroke;
  return { d, fill, stroke: s, width: width ?? LINE };
}
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export function iconSVG(name, { size = 24, label = '', className = 'icon' } = {}) {
  const layers = lookup(name);
  if (!layers) return '';
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  const paths = layers
    .map((l) => {
      const { d, fill, stroke, width } = resolve(l);
      const st = stroke ? ` stroke="${stroke}" stroke-width="${width}"` : '';
      return `<path d="${d}" fill="${fill}"${st}/>`;
    })
    .join('');
  return (
    `<svg class="${esc(className)}" width="${size}" height="${size}" viewBox="0 0 48 48" ` +
    `stroke-linejoin="round" stroke-linecap="round" ${a11y}>${paths}</svg>`
  );
}

const pathCache = new Map();
export function drawIcon(ctx, name, cx, cy, size) {
  const layers = lookup(name);
  if (!layers || typeof Path2D === 'undefined') return;
  let cached = pathCache.get(name);
  if (!cached) {
    cached = layers.map((l) => {
      const r = resolve(l);
      return { ...r, path: new Path2D(r.d) };
    });
    pathCache.set(name, cached);
  }
  const s = size / 48;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const { path, fill, stroke, width } of cached) {
    if (fill && fill !== 'none') {
      ctx.fillStyle = fill;
      ctx.fill(path);
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke(path);
    }
  }
  ctx.restore();
}

export const ICON_NAMES = Object.keys(ICONS);
