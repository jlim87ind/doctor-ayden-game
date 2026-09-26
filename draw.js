import { BEDS, CONDITIONS, ITEMS } from './data.js';
import { drawIcon } from './icons.js';
export const C = { ink: '#36524b', green: '#3b9679', floor: '#ecf2de' };
export function round(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
export function line(ctx, pts, color, width = 3) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
  ctx.stroke();
}
export function text(ctx, t, x, y, size = 18, color = C.ink, align = 'center', weight = 800) {
  ctx.font = `${weight} ${size}px Nunito, 'Avenir Next', sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(t, x, y);
}
// Match the canvas backing store to the screen so art stays sharp on tablets and retina displays.
// Drawing code keeps using the logical size stored in data-w/data-h; CSS must size the element.
export function crisp(canvas) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (!canvas.dataset.w) {
    canvas.dataset.w = canvas.width;
    canvas.dataset.h = canvas.height;
  }
  const w = Math.round(canvas.dataset.w * dpr),
    h = Math.round(canvas.dataset.h * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(w / canvas.dataset.w, 0, 0, h / canvas.dataset.h, 0, 0);
  return ctx;
}
// Character art: chunky outlined "sticker" figures. Feet sit at (0,0); the head is centred near (0,-68).
const shades = new Map();
export function shade(hex, amt) {
  const key = hex + amt;
  if (shades.has(key)) return shades.get(key);
  const n = parseInt(hex.slice(1, 7), 16),
    to = amt < 0 ? 0 : 255,
    p = Math.abs(amt);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (to - v) * p));
  const out = '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  shades.set(key, out);
  return out;
}
function fillEdge(ctx, fill, edge = shade(fill, -0.32), width = 2) {
  ctx.fillStyle = fill;
  ctx.fill();
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}
function oval(ctx, x, y, rx, ry, fill, edge, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  fillEdge(ctx, fill, edge);
}
function limb(ctx, pts, color, width) {
  line(ctx, pts, shade(color, -0.32), width + 4);
  line(ctx, pts, color, width);
}
// Several overlapping shapes read as one outlined silhouette: stroke them all, then fill them all.
function blobs(ctx, shapes, fill) {
  const path = () => {
    ctx.beginPath();
    for (const [x, y, rx, ry] of shapes) {
      ctx.moveTo(x + rx, y);
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    }
  };
  path();
  ctx.strokeStyle = shade(fill, -0.32);
  ctx.lineWidth = 4;
  ctx.stroke();
  path();
  ctx.fillStyle = fill;
  ctx.fill();
}
function hairBack(ctx, style, hair, back) {
  if (style === 'pigtails') {
    for (const s of [-1, 1]) {
      oval(ctx, s * 28, -62, 8.5, 12, hair, undefined, s * 0.35);
      oval(ctx, s * 23.5, -70, 3.4, 3.4, '#f2b84b');
    }
  } else if (style === 'bob')
    (roundPath(ctx, -28, -92, 56, back ? 50 : 44, [27, 27, 12, 12]), fillEdge(ctx, hair));
  else if (style === 'bun') oval(ctx, 0, back ? -80 : -91, 9, 8, hair);
  else if (style === 'curly' && back)
    blobs(
      ctx,
      [
        [-17, -80, 9, 9],
        [-6, -88, 9, 9],
        [7, -88, 9, 9],
        [18, -80, 9, 9],
        [-20, -66, 8, 8],
        [20, -66, 8, 8],
        [0, -72, 20, 18],
      ],
      hair
    );
}
function roundPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function hairFront(ctx, style, hair) {
  const cap = (fringe) => {
    ctx.beginPath();
    ctx.moveTo(-24.5, -63);
    ctx.bezierCurveTo(-27, -99, 27, -99, 24.5, -63);
    for (const p of fringe) ctx.lineTo(...p);
    ctx.closePath();
    fillEdge(ctx, hair);
  };
  if (style === 'curly') {
    blobs(
      ctx,
      [
        [-19, -72, 8, 9],
        [-13, -83, 9, 9],
        [-3, -88, 9, 9],
        [9, -87, 9, 9],
        [18, -79, 9, 9],
        [21, -68, 6, 7],
        [-22, -64, 5, 6],
        [-8, -76, 7, 6],
        [5, -77, 7, 6],
        [0, -80, 16, 9],
      ],
      hair
    );
  } else if (style === 'grandpa') {
    blobs(
      ctx,
      [
        [-21, -72, 6.5, 7],
        [-23, -64, 4.5, 6],
        [21, -72, 6.5, 7],
        [23, -64, 4.5, 6],
      ],
      hair
    );
    ctx.save();
    ctx.globalAlpha = 0.35;
    oval(ctx, -8, -85, 6, 3, '#fff', null, -0.3);
    ctx.restore();
    return;
  } else if (style === 'bob')
    cap([
      [24, -56],
      [20, -56],
      [19, -73],
      [-19, -73],
      [-20, -56],
      [-24, -56],
    ]);
  else if (style === 'pigtails' || style === 'bun')
    cap([
      [23, -64],
      [19, -75],
      [10, -79],
      [1, -82],
      [-1, -80],
      [-10, -79],
      [-19, -75],
      [-23, -64],
    ]);
  else {
    cap([
      [23, -65],
      [18, -74],
      [12, -71],
      [7, -78],
      [0, -73],
      [-6, -79],
      [-13, -73],
      [-19, -76],
      [-22, -66],
    ]);
  }
  if (style !== 'curly') {
    ctx.save();
    ctx.globalAlpha = 0.28;
    line(
      ctx,
      [
        [-15, -84],
        [-6, -89],
        [4, -89],
      ],
      '#fff',
      3
    );
    ctx.restore();
  }
}
function faceFeatures(ctx, s, happy, t, style, hair) {
  const blink = t % 4.3 < 0.13,
    brow = style === 'grandpa' ? '#e8e8e2' : shade(hair, -0.15);
  for (const d of [-1, 1]) {
    const ex = d * 8.5 + s;
    if (happy)
      line(
        ctx,
        [
          [ex - 3.5, -63],
          [ex, -67],
          [ex + 3.5, -63],
        ],
        '#2f3a38',
        2.4
      );
    else if (blink)
      line(
        ctx,
        [
          [ex - 3.2, -64],
          [ex + 3.2, -64],
        ],
        '#2f3a38',
        2
      );
    else {
      oval(ctx, ex, -64, 3.3, 4.3, '#2f3a38', null);
      oval(ctx, ex + 1.1, -65.6, 1.3, 1.3, '#fff', null);
    }
    line(
      ctx,
      [
        [ex - 3.5, -71.5],
        [ex, -73],
        [ex + 3.5, -72],
      ],
      brow,
      style === 'grandpa' ? 3 : 1.8
    );
    ctx.save();
    ctx.globalAlpha = 0.5;
    oval(ctx, d * 14.5 + s, -57.5, 4.6, 2.8, '#f08a7c', null);
    ctx.restore();
  }
  if (style === 'grandpa') {
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(d * 8.5 + s, -64, 6.3, 0, Math.PI * 2);
      ctx.strokeStyle = '#607370';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    line(
      ctx,
      [
        [-2.2 + s, -64],
        [2.2 + s, -64],
      ],
      '#607370',
      1.6
    );
    blobs(
      ctx,
      [
        [-4 + s, -56.5, 5, 2.6],
        [4 + s, -56.5, 5, 2.6],
      ],
      '#e8e8e2'
    );
  }
  line(
    ctx,
    [
      [-1 + s, -60],
      [s, -59],
      [1 + s, -60],
    ],
    '#b46e5c',
    1.6
  );
  const my = style === 'grandpa' ? -52 : -54.5;
  if (happy) {
    ctx.beginPath();
    ctx.moveTo(s - 5.5, my - 1);
    ctx.quadraticCurveTo(s, my + 8, s + 5.5, my - 1);
    ctx.closePath();
    fillEdge(ctx, '#8e3b3b', '#7a3232', 1.2);
    oval(ctx, s, my + 3.2, 2.6, 1.5, '#ec8a80', null);
  } else {
    ctx.beginPath();
    ctx.arc(s, my - 2.5, 4.2, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.strokeStyle = '#8a4a3f';
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
function head(ctx, o) {
  const { skin, hair, style, face, happy, t } = o,
    back = face === 'up',
    s = face === 'left' ? -4 : face === 'right' ? 4 : 0;
  hairBack(ctx, style, hair, back);
  if (style !== 'bob' || back)
    for (const d of [-1, 1]) {
      oval(ctx, d * 23.5, -65, 4.6, 6, skin);
      oval(ctx, d * 23.5, -65, 2, 3, shade(skin, -0.12), null);
    }
  oval(ctx, 0, -67, 24, 22.5, skin);
  if (back) {
    if (style === 'grandpa') {
      blobs(ctx, [[0, -62, 22, 11]], hair);
      oval(ctx, 0, -72, 20, 14, skin, null);
    } else if (style === 'curly') hairBack(ctx, style, hair, true);
    else {
      ctx.beginPath();
      ctx.ellipse(0, -69, 25, 24.5, 0, 0, Math.PI * 2);
      fillEdge(ctx, hair);
    }
    if (style === 'pigtails')
      for (const d of [-1, 1]) oval(ctx, d * 23.5, -70, 3.4, 3.4, '#f2b84b');
    return;
  }
  faceFeatures(ctx, s, happy, t, style, hair);
  hairFront(ctx, style, hair);
}
function shirtEmblem(ctx, seed, color) {
  const c = shade(color, 0.5);
  if (seed % 3 === 0) {
    text(ctx, '★', 0, -28, 12, c);
  } else if (seed % 3 === 1) {
    text(ctx, '♥', 0, -28, 11, c);
  } else {
    for (const y of [-36, -26])
      line(
        ctx,
        [
          [-17, y],
          [17, y],
        ],
        c,
        3
      );
  }
}
export function person(ctx, x, y, opts = {}) {
  const {
    scale = 1,
    time = 0,
    doctor = false,
    moving = false,
    happy = false,
    skin = '#edbd94',
    hair = '#343936',
    shirt = '#ed948b',
    face = 'down',
    nurse = false,
    carrying = false,
    pose = 'stand',
    angle = 0,
    name = '',
  } = opts;
  const style = nurse ? 'bun' : opts.style || 'short',
    seed = [...(name || shirt + style)].reduce((a, c) => a + c.charCodeAt(0), 0),
    t = time + seed * 0.61;
  const bed = pose === 'bed',
    sit = pose === 'sit',
    step = moving ? Math.sin(t * 14) : 0;
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (!bed) ellipse(ctx, 0, 6, 21, 6, '#33534022');
  ctx.translate(
    0,
    bed
      ? 0
      : moving
        ? -Math.abs(step) * 3
        : happy
          ? -Math.abs(Math.sin(t * 7)) * 4
          : Math.sin(t * 2) * 0.5
  );
  const top = doctor ? '#fdfdf6' : nurse ? '#8cc4a8' : shirt,
    pants = doctor ? '#4f7f86' : nurse ? '#6fa58b' : '#5d6485',
    shoe = doctor
      ? '#f0a64a'
      : nurse
        ? '#f7f4ec'
        : ['#ef9f55', '#e2706f', '#6aa7d8', '#f0c24b'][seed % 4];
  if (!bed) {
    for (const d of [-1, 1]) {
      const lift = d * step * 3,
        len = sit ? 9 : 15;
      roundPath(ctx, d * 8 - 5.5, -18 + (sit ? 6 : 0) + Math.min(0, lift), 11, len, 4);
      fillEdge(ctx, pants);
      roundPath(ctx, d * 8 - (d < 0 ? 8 : 5), -5 + Math.min(0, lift), 13, 8, 4);
      fillEdge(ctx, shoe);
    }
  }
  const hands = bed
    ? [
        [-21, -20],
        [21, -20],
      ]
    : carrying
      ? [
          [-11, -25],
          [11, -25],
        ]
      : happy
        ? [
            [-25, -24],
            [29 + Math.sin(t * 9) * 3, -68],
          ]
        : [
            [-23, -21 + step * 2.5],
            [23, -21 - step * 2.5],
          ];
  const armsInFront = bed || carrying,
    arm = () => {
      for (const [i, d] of [-1, 1].entries()) {
        const [hx, hy] = hands[i];
        limb(
          ctx,
          [
            [d * 14, -43],
            [hx * 0.85 + d * 2, (hy - 43) / 2 + (hy < -50 ? -6 : 0)],
            [hx, hy],
          ],
          top,
          8.5
        );
        oval(ctx, hx, hy, 5, 5, skin);
      }
    };
  if (!armsInFront) arm();
  ctx.beginPath();
  ctx.moveTo(-12, -48);
  ctx.quadraticCurveTo(-19, -47, -19, -40);
  ctx.lineTo(-21, -17);
  ctx.quadraticCurveTo(-21, -12, -16, -12);
  ctx.lineTo(16, -12);
  ctx.quadraticCurveTo(21, -12, 21, -17);
  ctx.lineTo(19, -40);
  ctx.quadraticCurveTo(19, -47, 12, -48);
  ctx.closePath();
  fillEdge(ctx, top, doctor ? '#bccfc6' : undefined);
  if (doctor) {
    ctx.beginPath();
    ctx.moveTo(-8, -48);
    ctx.lineTo(0, -31);
    ctx.lineTo(8, -48);
    ctx.closePath();
    fillEdge(ctx, '#7cc0ae', '#5e9e8e', 1.5);
    line(
      ctx,
      [
        [-8, -48],
        [-3, -33],
      ],
      '#bccfc6',
      1.6
    );
    line(
      ctx,
      [
        [8, -48],
        [3, -33],
      ],
      '#bccfc6',
      1.6
    );
    line(
      ctx,
      [
        [0, -31],
        [0, -13],
      ],
      '#d3e0d8',
      1.5
    );
    oval(ctx, -2.5, -24, 1.3, 1.3, '#bccfc6', null);
    oval(ctx, -2.5, -17, 1.3, 1.3, '#bccfc6', null);
    roundPath(ctx, 7, -27, 10, 9, 2);
    fillEdge(ctx, '#f2f6ef', '#bccfc6', 1.3);
    line(
      ctx,
      [
        [10, -26],
        [10, -31],
      ],
      '#4f86c6',
      2
    );
    roundPath(ctx, -17, -40, 8, 6, 1.5);
    fillEdge(ctx, '#e8f3ea', '#a9c3b7', 1.2);
    ctx.beginPath();
    ctx.moveTo(-10, -47);
    ctx.quadraticCurveTo(-12, -33, -1, -33);
    ctx.quadraticCurveTo(10, -33, 10, -47);
    ctx.strokeStyle = '#3f6f73';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    line(
      ctx,
      [
        [-1, -33],
        [-3, -27],
      ],
      '#3f6f73',
      2
    );
    oval(ctx, -3, -25, 3.4, 3.4, '#c6d4d6', '#6f8a8c');
  } else if (nurse) {
    ctx.beginPath();
    ctx.moveTo(-8, -48);
    ctx.lineTo(0, -38);
    ctx.lineTo(8, -48);
    ctx.strokeStyle = '#5f9a7f';
    ctx.lineWidth = 2;
    ctx.stroke();
    roundPath(ctx, -15, -31, 10, 8, 2);
    fillEdge(ctx, '#a3d2ba', '#6fa58b', 1.3);
  } else {
    ctx.beginPath();
    ctx.arc(0, -48, 6.5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.strokeStyle = shade(top, -0.32);
    ctx.lineWidth = 1.8;
    ctx.stroke();
    shirtEmblem(ctx, seed, top);
  }
  if (bed) {
    const b = Math.sin(t * 1.6) * 0.8;
    roundPath(ctx, -44, -35 + b, 88, 70, 12);
    fillEdge(ctx, shade(top, 0.45));
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (const [dx, dy] of [
      [-28, -12],
      [0, -4],
      [28, -12],
      [-14, 12],
      [14, 12],
      [-28, 26],
      [28, 26],
    ])
      text(ctx, '♥', dx, dy + b, 10, shade(top, 0.1));
    ctx.restore();
    roundPath(ctx, -45, -38 + b, 90, 11, 5);
    fillEdge(ctx, '#fffef6', '#d6ddd2');
  }
  if (armsInFront) arm();
  if (carrying && !bed) {
    roundPath(ctx, -10, -34, 20, 17, 4);
    fillEdge(ctx, '#f2d588', '#c9a24c');
    text(ctx, '✚', 0, -25.5, 11, '#fff');
  }
  head(ctx, { skin, hair, style, face, happy, t });
  if (nurse) {
    roundPath(ctx, -14, -97, 28, 11, [6, 6, 3, 3]);
    fillEdge(ctx, '#fffef6', '#cfd8d0');
    text(ctx, '+', 0, -91.5, 11, '#df7f75');
  }
  ctx.restore();
}
function plant(ctx, x, y, size = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ellipse(ctx, 0, 6, 18, 6, '#39563b14');
  round(ctx, -15, -10, 30, 23, 5, '#d2ac7a');
  round(ctx, -18, -12, 36, 7, 3, '#e3c397');
  line(
    ctx,
    [
      [0, -10],
      [0, -40],
    ],
    '#6b9661',
    4
  );
  for (const [dx, dy] of [
    [-12, -30],
    [11, -44],
    [-8, -52],
    [14, -24],
  ]) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(dx > 0 ? 0.6 : -0.6);
    ellipse(ctx, 0, 0, 9, 16, dx > 0 ? '#7da571' : '#91b67f');
    ctx.restore();
  }
  ctx.restore();
}
function room(ctx, x, y, w, h, fill, name, icon, sub) {
  round(ctx, x, y, w, h, 16, fill);
  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let i = x + 25; i < x + w; i += 45)
    line(
      ctx,
      [
        [i, y + 8],
        [i, y + h - 8],
      ],
      '#a9bbae',
      0.7
    );
  for (let j = y + 25; j < y + h; j += 45)
    line(
      ctx,
      [
        [x + 8, j],
        [x + w - 8, j],
      ],
      '#a9bbae',
      0.7
    );
  ctx.restore();
  round(ctx, x + 18, y + 13, Math.min(w - 36, name.length * 11 + 80), 40, 12, '#fffdf8e8');
  text(ctx, icon + '  ' + name, x + 34, y + 33, 17, C.ink, 'left');
  if (sub) text(ctx, sub, x + w - 25, y + 35, 11, '#8aa092', 'right');
}
function bed(ctx, x, y, num) {
  round(ctx, x - 62, y - 62, 124, 125, 17, '#66786b14');
  round(ctx, x - 58, y - 72, 116, 126, 13, '#fffdf7', '#c2d8d3');
  round(ctx, x - 49, y - 59, 98, 96, 10, '#deebe3');
  round(ctx, x - 39, y - 51, 78, 30, 8, '#fffef8');
  round(ctx, x - 50, y - 1, 100, 43, 10, '#83b9b2');
  line(
    ctx,
    [
      [x - 43, y + 7],
      [x + 43, y + 7],
    ],
    '#a4d0c4',
    4
  );
  round(ctx, x - 63, y + 45, 126, 16, 6, '#c1d6ce');
  round(ctx, x - 58, y + 57, 10, 12, 3, '#8ba79c');
  round(ctx, x + 48, y + 57, 10, 12, 3, '#8ba79c');
  round(ctx, x - 14, y + 49, 28, 17, 5, '#fffef6');
  text(ctx, String(num), x, y + 57, 10, '#72948c');
}
export function wheelchair(ctx, x, y, p, time = 0) {
  ellipse(ctx, x, y + 9, 37, 10, '#254f3f1a');
  round(ctx, x - 22, y - 45, 44, 46, 9, '#97b2cb', '#698a9d');
  line(
    ctx,
    [
      [x - 28, y - 27],
      [x - 30, y + 3],
      [x + 30, y + 3],
      [x + 29, y - 28],
    ],
    '#769399',
    5
  );
  ellipse(ctx, x - 28, y + 2, 10, 16, '#69818a');
  ellipse(ctx, x + 28, y + 2, 10, 16, '#69818a');
  ellipse(ctx, x - 28, y + 2, 5, 9, '#cfddd7');
  ellipse(ctx, x + 28, y + 2, 5, 9, '#cfddd7');
  if (p) person(ctx, x, y - 2, { ...p, scale: 0.65, time });
}
// Patients rest with their head on the pillow: upright in ward beds, sideways on the procedure table and recovery couch.
function inBed(p, at) {
  return p.location === 'procedure'
    ? [at.x - 16, at.y + 16]
    : p.location === 'recovery'
      ? [at.x + 4, at.y + 10]
      : [at.x, at.y + 16];
}
export function drawHospital(ctx, game, time, view) {
  crisp(ctx.canvas);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(-view.x, 0);
  round(ctx, 0, 0, 1200, 760, 0, '#eff2df');
  room(ctx, 20, 80, 790, 335, '#e3efe9', 'PATIENT ROOM', '♡', '');
  room(ctx, 830, 80, 350, 335, '#e7efd8', 'SUPPLIES', '✚');
  room(ctx, 20, 545, 345, 195, '#f1e9d5', 'WELCOME', '☀');
  room(ctx, 380, 545, 430, 195, '#f3e5d2', 'PROCEDURE', '✧');
  room(ctx, 830, 545, 350, 195, '#f3efd5', 'RECOVERY', '☾');
  round(ctx, 22, 428, 1156, 107, 16, '#e3e8d5');
  line(
    ctx,
    [
      [62, 480],
      [1132, 480],
    ],
    '#d0dcc5',
    2
  );
  for (let x = 72; x < 1150; x += 38) ellipse(ctx, x, 480, 2, 2, '#c2d1b8');
  // Low walls and wide, accessible doorways.
  for (const [x, w] of [
    [20, 310],
    [440, 370],
    [830, 40],
    [1090, 90],
  ]) {
    round(ctx, x, 407, w, 17, 5, '#c1d5c6');
    round(ctx, x, 402, w, 12, 4, '#faffef');
  }
  for (const [x, w] of [
    [20, 160],
    [285, 185],
    [710, 160],
    [1090, 90],
  ]) {
    round(ctx, x, 534, w, 18, 4, '#cbd6bd');
    round(ctx, x, 529, w, 10, 4, '#fcfff2');
  }
  round(ctx, 810, 90, 16, 327, 4, '#cadcc8');
  round(ctx, 365, 550, 15, 190, 4, '#cfdbc0');
  round(ctx, 810, 550, 15, 190, 4, '#cfdbc0');
  for (let i = 0; i < 4; i++) {
    bed(ctx, BEDS[i].x, BEDS[i].y, i + 1);
    if (
      !game?.patients.some((p) => p.bed === i && p.location === 'ward' && p.state !== 'discharged')
    ) {
      round(ctx, BEDS[i].x - 38, 150, 76, 34, 8, '#f8fcf3', '#c9ded0');
      text(ctx, '♡  CARE', BEDS[i].x, 168, 10, '#80a68e');
    }
  }
  // Sunny windows and children’s art.
  for (const x of [326, 580]) {
    round(ctx, x, 88, 124, 45, 9, '#bad9d1', '#fcfff4');
    round(ctx, x + 5, 92, 114, 36, 6, '#daece3');
    line(
      ctx,
      [
        [x + 62, 90],
        [x + 62, 130],
      ],
      '#fbfff4',
      4
    );
    ellipse(ctx, x + 94, 106, 9, 9, '#f2d482');
  }
  plant(ctx, 772, 174, 0.82);
  round(ctx, 757, 302, 55, 48, 8, '#bdd8ce');
  round(ctx, 761, 304, 47, 27, 8, '#fffef5');
  ellipse(ctx, 784, 318, 15, 8, '#d4e7df');
  line(
    ctx,
    [
      [781, 308],
      [781, 297],
      [791, 297],
    ],
    '#749f99',
    4
  );
  round(ctx, 882, 181, 253, 123, 11, '#aac19d');
  round(ctx, 882, 175, 253, 120, 11, '#f9f9e8', '#b8c9a8');
  line(
    ctx,
    [
      [885, 234],
      [1132, 234],
    ],
    '#cbd6b4',
    5
  );
  line(
    ctx,
    [
      [965, 179],
      [965, 291],
    ],
    '#d4dcbd',
    3
  );
  line(
    ctx,
    [
      [1050, 179],
      [1050, 291],
    ],
    '#d4dcbd',
    3
  );
  const icons = ['sun', 'flower', 'cloud', 'lotion', 'bandage', 'ice'];
  icons.forEach((ic, i) => {
    const x = 924 + (i % 3) * 83,
      y = i < 3 ? 213 : 270;
    round(
      ctx,
      x - 18,
      y - 21,
      36,
      37,
      7,
      ['#f7d186', '#c9dda7', '#b8dbea', '#d6c6e7', '#ebc7ad', '#bee5e6'][i]
    );
    drawIcon(ctx, ic, x, y - 2, 28);
  });
  round(ctx, 920, 333, 186, 32, 10, '#fffcf0');
  text(ctx, 'Tap to choose supplies', 1013, 350, 13, '#85a077');
  plant(ctx, 1153, 379, 0.77);
  // Reception: books, fish, plant and friendly nurse.
  round(ctx, 48, 597, 92, 47, 9, '#9ac7bc', '#78aba0');
  round(ctx, 53, 601, 82, 34, 6, '#cce7da');
  drawIcon(ctx, 'fish', 82, 618, 26);
  drawIcon(ctx, 'fish', 113, 612, 18);
  round(ctx, 82, 633, 160, 57, 15, '#d8b98c');
  round(ctx, 77, 630, 170, 18, 7, '#f5e0b8');
  round(ctx, 169, 610, 45, 24, 5, '#79988c');
  round(ctx, 173, 613, 37, 15, 3, '#d4e5d5');
  text(ctx, 'HELLO!', 166, 669, 12, '#8c7956');
  plant(ctx, 48, 700, 0.9);
  person(ctx, 293, 647, { nurse: true, hair: '#544d41', skin: '#e8b68b', time });
  text(ctx, 'Nurse Lily', 295, 699, 14, '#6f8a68');
  // Procedure and recovery furniture.
  round(ctx, 483, 593, 206, 99, 18, '#dec6a4');
  round(ctx, 490, 588, 192, 91, 15, '#fffaf0');
  round(ctx, 503, 600, 47, 62, 12, '#f0ddc2');
  round(ctx, 557, 600, 113, 63, 11, '#eac4a1');
  round(ctx, 734, 605, 49, 40, 8, '#fff9e5', '#d9c49d');
  text(ctx, '✚', 758, 625, 22, '#cfa984');
  round(ctx, 905, 591, 190, 104, 18, '#e1dcb7');
  round(ctx, 913, 587, 174, 98, 16, '#fffef2');
  round(ctx, 924, 598, 48, 65, 12, '#f5eacc');
  round(ctx, 980, 598, 97, 73, 11, '#c9d8a2');
  text(ctx, '★', 1029, 633, 34, '#e6ecbc');
  plant(ctx, 1140, 702, 0.8);
  if (game) {
    if (game.path.length && !game.settings.reduced) {
      ctx.save();
      ctx.setLineDash([3, 14]);
      line(
        ctx,
        [[game.doctor.x, game.doctor.y], ...game.path.map((p) => [p.x, p.y])],
        '#8da98d',
        3
      );
      ctx.restore();
    }
    for (const p of game.patients) {
      if (p.state === 'discharged') {
        const at = game.position(p);
        if (time - (p.celebrated || 0) < 2) {
          person(ctx, at.x, at.y + 15, { ...p, time, happy: true });
          text(ctx, 'All better! ♡', at.x, at.y - 87, 14, '#44876b');
        }
        continue;
      }
      if (game.wheelchair === p.id) continue;
      const at = game.position(p);
      person(ctx, ...inBed(p, at), {
        ...p,
        time,
        scale: 0.78,
        happy: p.reassured,
        pose: 'bed',
        angle: p.location === 'ward' ? 0 : -Math.PI / 2,
      });
      round(ctx, at.x - 75, at.y - 124, 150, 46, 14, '#fffef8', '#d6e3d2');
      const care = CONDITIONS[p.condition],
        next = game.next(p);
      const bubble =
        p.exam < care.exam.length
          ? care.symptom
          : p.step >= care.steps.length
            ? 'heart'
            : next.game === 'transport'
              ? 'wheelchair'
              : next.item
                ? ITEMS[next.item].icon
                : 'sparkles';
      drawIcon(ctx, bubble, at.x - 47, at.y - 101, 32);
      text(ctx, p.name, at.x + 14, at.y - 101, 16);
      text(
        ctx,
        '♥'.repeat(Math.ceil(p.happiness)) + '♡'.repeat(3 - Math.ceil(p.happiness)),
        at.x,
        at.y + 79,
        14,
        '#d99887'
      );
    }
    const d = game.doctor;
    if (game.wheelchair !== null || game.emptyChair) {
      person(ctx, d.x, d.y - 23, { doctor: true, time, moving: d.moving, face: d.face });
      wheelchair(
        ctx,
        d.x,
        d.y + 30,
        game.patients.find((p) => p.id === game.wheelchair),
        time
      );
    } else {
      wheelchair(ctx, game.chairPosition?.x || 480, game.chairPosition?.y || 481);
      person(ctx, d.x, d.y, {
        doctor: true,
        time,
        moving: d.moving,
        face: d.face,
        carrying: game.inventory.length > 0,
        happy: d.pose === 'celebrate',
      });
    }
    round(ctx, d.x - 50, d.y + 21, 100, 27, 10, '#fffef6e8');
    text(ctx, 'Dr. Ayden', d.x, d.y + 35, 14, '#3f7d66');
  } else {
    wheelchair(ctx, 480, 481);
    person(ctx, 380, 487, { doctor: true, time });
    person(ctx, 125, 282, {
      ...{ skin: '#f2bc91', hair: '#654139', shirt: '#ee8987', style: 'pigtails' },
      time,
      scale: 0.8,
    });
  }
  text(ctx, '✦', 1138, 46, 24, '#d6b967');
  text(ctx, 'KINDNESS CLINIC', 135, 44, 16, '#7d9880');
  text(ctx, 'A happy little place to feel better', 350, 44, 11, '#93a78d');
  ctx.restore();
}
export function hero(canvas, time = 0) {
  const ctx = crisp(canvas);
  ctx.clearRect(0, 0, 550, 520);
  ellipse(ctx, 280, 273, 216, 213, '#e5edcf');
  ellipse(ctx, 280, 290, 178, 176, '#edf3de');
  for (const [x, y, s] of [
    [87, 98, 27],
    [460, 155, 18],
    [438, 377, 24],
    [124, 368, 16],
  ])
    text(ctx, '✧', x, y, s, '#dfbc66');
  round(ctx, 119, 159, 303, 217, 28, '#c4d5b3');
  round(ctx, 113, 143, 315, 219, 26, '#fffdf0', '#d8e3c8');
  round(ctx, 134, 165, 273, 51, 13, '#d5e7cf');
  text(ctx, 'KINDNESS CLINIC', 270, 191, 16, '#6c9171');
  round(ctx, 140, 232, 72, 89, 12, '#dbeade');
  round(ctx, 328, 232, 72, 89, 12, '#dbeade');
  line(
    ctx,
    [
      [176, 232],
      [176, 321],
    ],
    '#f8fcf0',
    4
  );
  line(
    ctx,
    [
      [364, 232],
      [364, 321],
    ],
    '#f8fcf0',
    4
  );
  round(ctx, 233, 244, 72, 112, 13, '#a2cbb6');
  text(ctx, '✚', 269, 275, 30, '#fffdf0');
  plant(ctx, 117, 381, 1.1);
  plant(ctx, 425, 381, 1.2);
  person(ctx, 276, 404, { doctor: true, scale: 2.35, time, happy: true });
  person(ctx, 153, 409, {
    skin: '#f2bc91',
    hair: '#654139',
    shirt: '#ee8987',
    style: 'pigtails',
    scale: 0.9,
    time,
    happy: true,
  });
  person(ctx, 398, 409, {
    skin: '#ae7655',
    hair: '#3b302e',
    shirt: '#e9b953',
    style: 'curly',
    scale: 1,
    time,
    happy: true,
  });
  text(ctx, '♥', 191, 315, 30, '#df9b80');
  text(ctx, '♥', 373, 291, 22, '#df9b80');
}
