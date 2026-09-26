import { ITEMS } from './data.js';
import { iconSVG } from './icons.js';
import { round, ellipse, line, text, person, crisp, shade } from './draw.js';
const INFO = {
  temperature: ['Temperature time', 'Hold the thermometer on the glowing spot.', 'thermometer'],
  listen: ['Listen with your heart', 'Hold each heart until the circle is full.', 'stethoscope'],
  inspect: ['A gentle checkup', 'Tap the three stars for a closer look.', 'magnifier'],
  clean: ['Clean & sparkle', 'Swipe over all the little marks. Gently does it!', 'lotion'],
  bandage: ['Wrap it with care', 'Drag from 1 to 2 to 3 to 4. Or tap in order.', 'bandage'],
  ice: ['Cool as a cucumber', 'Hold the ice pack on the glowing spot.', 'ice'],
  medicine: ['Match the care card', 'Choose the same picture, then tap the tray.', 'spoon'],
  rest: ['A cosy little rest', 'Give water, a blanket, and a cuddly friend.', 'teddy'],
  patch: ['A little comfort', 'Tap the stars to place our pretend comfort patch.', 'sparkles'],
  align: ['Picture perfect', 'Slide the arm picture into its matching outline.', 'bone'],
};
export class MiniGame {
  constructor(root, type, p, step, audio, settings, onComplete, onCancel) {
    this.root = root;
    this.type = type;
    this.p = p;
    this.step = step;
    this.audio = audio;
    this.settings = settings;
    this.onComplete = onComplete;
    this.onCancel = onCancel;
    this.aborter = new AbortController();
    this.done = false;
    this.cancelled = false;
    this.holding = null;
    this.completed = 0;
    this.total = 1;
    this.errors = 0;
    this.elapsed = 0;
    this.activeTime = 0;
    this.hold = 0;
    this.selected = false;
    this.last = performance.now();
    this.render();
    this.bind(window, 'blur', () => {
      this.holding?.classList.remove('holding');
      this.holding = null;
      this.hold = 0;
    });
    this.frame = requestAnimationFrame((t) => this.update(t));
  }
  bind(el, event, fn) {
    el.addEventListener(event, fn, { signal: this.aborter.signal });
  }
  render() {
    const [title, instruction, icon] = INFO[this.type];
    this.root.innerHTML = `<div class="modal-backdrop"><section class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mini-title"><div class="modal-head">${iconSVG(icon, { size: 44 })}<div><div class="eyebrow">CARING FOR ${this.p.name.toUpperCase()}</div><h2 id="mini-title">${title}</h2></div><button class="say-again mini-say" aria-label="Say it again" title="Say it again">${iconSVG('speaker', { size: 22 })}</button><button class="close" aria-label="Close mini-game">×</button></div><p class="mini-subtitle">${instruction}</p><div class="mini-area"><canvas class="mini-art" width="720" height="320"></canvas></div><div class="mini-progress" role="progressbar" aria-label="Treatment progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><div class="mini-counter">You’ve got this, Doctor Ayden!</div></section></div>`;
    this.area = this.root.querySelector('.mini-area');
    this.canvas = this.root.querySelector('canvas');
    this.ctx = crisp(this.canvas);
    this.bar = this.root.querySelector('.mini-progress i');
    this.counter = this.root.querySelector('.mini-counter');
    this.bind(this.root.querySelector('.close'), 'click', () => this.cancel());
    this.bind(this.root.querySelector('.mini-say'), 'click', () => this.audio.say(this.type));
    this.audio.say(this.type);
    this.build();
    this.paint();
    this.area.querySelector('button,input')?.focus();
  }
  target(x, y, label, action, index = 0) {
    const b = document.createElement('button');
    b.className = 'mini-target';
    b.style.left = `calc(${x}% - 27px)`;
    b.style.top = `calc(${y}% - 27px)`;
    b.innerHTML = label;
    b.dataset.target = index;
    b.setAttribute(
      'aria-label',
      this.type === 'bandage' ? `Bandage point ${index + 1}` : `Treatment spot ${index + 1}`
    );
    this.area.append(b);
    if (action) this.bind(b, 'click', () => action(b, index));
    return b;
  }
  build() {
    if (['temperature', 'ice', 'listen'].includes(this.type)) {
      this.points =
        this.type === 'listen'
          ? [
              [43, 63],
              [57, 63],
              [51, 78],
            ]
          : this.type === 'temperature'
            ? [[58, 40]]
            : [[52, 50]];
      this.total = this.points.length;
      this.holdLength = this.type === 'listen' ? 1.25 : 2.5;
      this.points.forEach(([x, y], i) => {
        const b = this.target(
          x,
          y,
          this.type === 'temperature'
            ? iconSVG('thermometer', { size: 32 })
            : this.type === 'ice'
              ? iconSVG('ice', { size: 32 })
              : '♡',
          null,
          i
        );
        const down = (e) => {
          if (this.done || b.classList.contains('done')) return;
          e.preventDefault();
          this.holding = b;
          this.hold = 0;
          b.classList.add('holding');
          if (e.pointerId !== undefined) b.setPointerCapture(e.pointerId);
        };
        const up = () => {
          if (this.holding === b) {
            b.classList.remove('holding');
            this.holding = null;
            this.hold = 0;
          }
        };
        this.bind(b, 'pointerdown', down);
        this.bind(b, 'pointerup', up);
        this.bind(b, 'pointercancel', up);
        this.bind(b, 'lostpointercapture', up);
        this.bind(b, 'keydown', (e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e);
        });
        this.bind(b, 'keyup', (e) => {
          if (e.key === ' ' || e.key === 'Enter') up();
        });
        this.bind(b, 'blur', up);
      });
    } else if (['inspect', 'patch', 'rest'].includes(this.type)) {
      this.total = 3;
      const icons =
        this.type === 'rest'
          ? ['cup', 'blanket', 'teddy'].map((n) => iconSVG(n, { size: 32 }))
          : ['✦', '✦', '✦'];
      [
        [31, 50],
        [50, 58],
        [69, 50],
      ].forEach(([x, y], i) => this.target(x, y, icons[i], (b) => this.mark(b), i));
    } else if (this.type === 'clean') {
      this.total = 7;
      const points = [
        [36, 40],
        [47, 34],
        [61, 39],
        [66, 57],
        [52, 63],
        [38, 60],
        [51, 48],
      ];
      points.forEach(([x, y], i) => {
        const b = this.target(x, y, '•', (b) => this.mark(b), i);
        b.style.color = '#b3946c';
        b.style.background = '#dfcba388';
        b.style.borderColor = '#ceb999';
        b.style.width = '43px';
        b.style.height = '43px';
      });
      let pressed = false;
      this.bind(this.area, 'pointerdown', (e) => {
        pressed = true;
        this.area.setPointerCapture(e.pointerId);
        this.cleanAt(e);
      });
      this.bind(this.area, 'pointermove', (e) => {
        if (pressed) this.cleanAt(e);
      });
      this.bind(this.area, 'pointerup', () => (pressed = false));
      this.bind(this.area, 'pointercancel', () => (pressed = false));
    } else if (this.type === 'bandage') {
      this.total = 4;
      const points = [
        [29, 43],
        [67, 43],
        [29, 68],
        [67, 68],
      ];
      points.forEach(([x, y], i) => this.target(x, y, String(i + 1), (b, n) => this.wrap(b, n), i));
      let pressed = false;
      this.bind(this.area, 'pointerdown', (e) => {
        pressed = true;
        this.area.setPointerCapture(e.pointerId);
        this.wrapAt(e);
      });
      this.bind(this.area, 'pointermove', (e) => {
        if (pressed) this.wrapAt(e);
      });
      this.bind(this.area, 'pointerup', () => (pressed = false));
      this.bind(this.area, 'pointercancel', () => (pressed = false));
    } else if (this.type === 'medicine') {
      this.total = 2;
      const wanted = ITEMS[this.step.item];
      const ids = ['fever', 'allergy', 'cough'];
      text(this.ctx, '', 0, 0);
      const card = document.createElement('div');
      card.style.cssText =
        'position:absolute;top:18px;left:0;right:0;text-align:center;font-weight:850;font-size:14px';
      card.innerHTML = `Care card: ${iconSVG(wanted.icon, { size: 26 })} ${wanted.name}`;
      this.area.append(card);
      ids.forEach((id, i) => {
        const b = this.target(
          24 + i * 26,
          40,
          iconSVG(ITEMS[id].icon, { size: 34 }),
          (button) => {
            if (this.selected) return;
            if (id === this.step.item) {
              this.selected = true;
              this.mark(button);
              this.counter.textContent = 'Lovely! Now tap the patient’s tray.';
            } else {
              this.errors++;
              this.audio.say('wrong-item');
              button.animate?.(
                [
                  { transform: 'translateX(-5px)' },
                  { transform: 'translateX(5px)' },
                  { transform: 'translateX(0)' },
                ],
                { duration: 220 }
              );
              this.counter.innerHTML = `Look for the ${wanted.symbol.toLowerCase()} picture ${iconSVG(wanted.icon, { size: 20 })}`;
            }
          },
          i
        );
        b.setAttribute('aria-label', ITEMS[id].name);
      });
      const tray = this.target(
        50,
        78,
        iconSVG('tray', { size: 36 }),
        (b) => {
          if (this.selected) this.mark(b);
          else this.counter.textContent = 'Choose the matching bottle first.';
        },
        3
      );
      tray.style.width = '95px';
      tray.style.borderRadius = '15px';
      tray.setAttribute('aria-label', 'Give medicine on tray');
    } else if (this.type === 'align') {
      this.total = 1;
      this.alignment = 15;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = 0;
      input.max = 100;
      input.value = '15';
      input.setAttribute('aria-label', 'Align the arm scan');
      input.style.cssText = 'position:absolute;left:15%;width:70%;bottom:30px;accent-color:#77ad8d';
      this.area.append(input);
      this.bind(input, 'input', () => {
        this.alignment = Number(input.value);
        this.paint();
        if (Math.abs(this.alignment - 65) <= 5) {
          this.holding = input;
        } else {
          this.holding = null;
          this.hold = 0;
        }
      });
      this.holdLength = 0.9;
    }
  }
  cleanAt(e) {
    for (const b of this.area.querySelectorAll('.mini-target:not(.done)')) {
      const r = b.getBoundingClientRect();
      if (
        e.clientX >= r.left - 8 &&
        e.clientX <= r.right + 8 &&
        e.clientY >= r.top - 8 &&
        e.clientY <= r.bottom + 8
      )
        this.mark(b);
    }
  }
  wrapAt(e) {
    const b = this.area.querySelector(`[data-target="${this.completed}"]`);
    if (!b) return;
    const r = b.getBoundingClientRect();
    if (
      e.clientX >= r.left - 9 &&
      e.clientX <= r.right + 9 &&
      e.clientY >= r.top - 9 &&
      e.clientY <= r.bottom + 9
    )
      this.wrap(b, this.completed);
  }
  wrap(b, n) {
    if (b.classList.contains('done')) return;
    if (n !== this.completed) {
      this.counter.textContent = `Find number ${this.completed + 1} next. You can do it!`;
      return;
    }
    this.mark(b);
    this.paint();
  }
  mark(b) {
    if (this.done || b.classList.contains('done')) return;
    b.classList.add('done');
    b.classList.remove('holding');
    b.textContent = '✓';
    this.completed++;
    this.audio.fx(this.type === 'clean' ? 'wipe' : this.type === 'bandage' ? 'wrap' : 'success');
    this.holding = null;
    this.hold = 0;
    this.counter.textContent = `${this.completed} of ${this.total} — lovely work!`;
    this.progress();
    this.paint();
    if (this.completed >= this.total) this.finish();
  }
  progress() {
    const value = Math.min(
      100,
      ((this.completed + this.hold / (this.holdLength || 1)) / this.total) * 100
    );
    this.bar.style.width = value + '%';
    this.bar.parentElement.setAttribute('aria-valuenow', String(Math.round(value)));
  }
  update(t) {
    if (this.cancelled) return;
    // Real elapsed time, so holds take the same time on slow tablets. The cap only guards
    // against a long pause (e.g. the tab was hidden).
    const dt = Math.min(0.25, (t - this.last) / 1000);
    this.last = t;
    if (!document.hidden) {
      this.elapsed += dt;
      if (this.done) {
        if (this.elapsed - this.doneAt > 0.85) {
          this.destroy();
          this.onComplete(Math.max(0.5, 1 - this.errors * 0.12), this.errors);
          return;
        }
      } else if (this.holding) {
        this.hold += dt;
        this.progress();
        if (this.hold >= this.holdLength) {
          if (this.type === 'align') {
            this.completed = 1;
            this.hold = 0;
            this.progress();
            this.finish();
          } else {
            if (this.type === 'listen') this.audio.fx('heartbeat');
            this.mark(this.holding);
          }
        }
      }
    }
    this.frame = requestAnimationFrame((time) => this.update(time));
  }
  finish() {
    if (this.done) return;
    this.done = true;
    this.doneAt = this.elapsed;
    this.counter.textContent = 'Wonderful! Your patient feels cared for. ♡';
    this.audio.praise();
  }
  cancel() {
    if (this.done) return;
    this.destroy();
    this.onCancel();
  }
  destroy() {
    this.cancelled = true;
    cancelAnimationFrame(this.frame);
    this.aborter.abort();
  }
  paint() {
    const c = this.ctx;
    c.clearRect(0, 0, 720, 320);
    if (['clean', 'bandage', 'ice', 'inspect', 'patch'].includes(this.type)) {
      const arm = this.p.condition === 'arm';
      if (arm) closeArm(c, this.p);
      else closeKnee(c, this.p);
      const spotX = 360,
        spotY = arm ? 160 : 156;
      if (this.type === 'inspect' || this.type === 'clean') {
        // The sore spot fades as it is cleaned.
        c.save();
        c.globalAlpha = this.type === 'clean' ? 1 - (this.completed / this.total) * 0.75 : 1;
        if (this.p.condition === 'scrape') scrape(c, spotX, spotY);
        else if (this.p.condition === 'bruise') bump(c, spotX, spotY);
        else soreSpot(c, spotX, spotY);
        c.restore();
      }
      if (this.type === 'ice') {
        bump(c, spotX, spotY);
        snowflake(c, spotX, spotY, 26, '#ffffffcc');
      }
      if (this.type === 'patch') {
        soreSpot(c, spotX, spotY);
        // The comfort patch appears a little more with each star.
        c.save();
        c.globalAlpha = this.completed / this.total;
        round(c, spotX - 45, spotY - 27, 90, 53, 13, '#eebfaf', '#d99e8c');
        text(c, '♥', spotX + 1, spotY + 1, 25, '#fff4e7');
        c.restore();
      }
      if (this.type === 'bandage') {
        // Each finished step wraps one more band around the leg or arm.
        for (let i = 0; i < this.completed; i++) {
          const x = 250 + i * 58;
          c.save();
          c.translate(x, 160);
          c.rotate(-0.12);
          round(c, -24, -78, 48, 156, 12, '#fffdf3', '#d9d3bb');
          for (let y = -66; y < 70; y += 14)
            line(
              c,
              [
                [-18, y],
                [18, y + 6],
              ],
              '#ebe6d2',
              1.5
            );
          c.restore();
        }
      }
    } else if (this.type === 'align') {
      round(c, 189, 46, 350, 203, 24, '#d4e2dd');
      round(c, 205, 60, 319, 174, 16, '#527673');
      const arm = (x) => {
        line(
          c,
          [
            [x, 104],
            [x + 73, 131],
            [x + 107, 191],
          ],
          '#edf5df',
          21
        );
        ellipse(c, x, 104, 15, 15, '#edf5df');
        ellipse(c, x + 107, 191, 15, 15, '#edf5df');
      };
      c.save();
      c.globalAlpha = 0.3;
      arm(293 + 65 * 1.2);
      c.restore();
      arm(293 + this.alignment * 1.2);
      text(c, 'PRETEND PICTURE SCAN', 365, 76, 10, '#b9d0c1');
    } else if (this.type === 'rest') {
      round(c, 237, 80, 246, 169, 24, '#eee3bb');
      round(c, 249, 89, 220, 151, 21, '#fffcef');
      round(c, 259, 97, 202, 44, 16, '#f3ecd7');
      person(c, 360, 176, { ...this.p, scale: 1.1, happy: true });
      round(c, 248, 155, 224, 85, 20, '#c4d7a4');
      text(c, '★', 360, 203, 36, '#e5edc5');
    } else if (this.type !== 'medicine') {
      person(c, 360, 285, { ...this.p, scale: 2.65 });
    }
  }
}

// Close-up of a knee: shorts, leg, sock and shoe, drawn in the patient's own skin tone.
function closeKnee(c, p) {
  const skin = p.skin || '#f0c9a4',
    edge = shade(skin, -0.28);
  c.save();
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(150, 100);
  c.bezierCurveTo(260, 92, 300, 86, 360, 90);
  c.bezierCurveTo(420, 94, 470, 108, 600, 118);
  c.lineTo(600, 202);
  c.bezierCurveTo(470, 212, 420, 228, 360, 228);
  c.bezierCurveTo(300, 228, 260, 222, 150, 220);
  c.closePath();
  c.fillStyle = skin;
  c.fill();
  c.strokeStyle = edge;
  c.lineWidth = 3;
  c.stroke();
  // Kneecap.
  c.globalAlpha = 0.35;
  ellipse(c, 360, 150, 62, 50, shade(skin, 0.35));
  c.globalAlpha = 1;
  c.beginPath();
  c.arc(360, 158, 58, 0.25 * Math.PI, 0.75 * Math.PI);
  c.strokeStyle = shade(skin, -0.12);
  c.lineWidth = 2;
  c.stroke();
  // Shorts.
  round(c, 40, 82, 150, 156, 26, '#5d6485', '#454b66');
  line(
    c,
    [
      [175, 90],
      [175, 230],
    ],
    '#4b5170',
    3
  );
  // Sock and shoe.
  round(c, 585, 112, 52, 96, 12, '#fbfaf4', '#d7d4c6');
  line(
    c,
    [
      [592, 128],
      [630, 128],
    ],
    '#8cc4a8',
    5
  );
  round(c, 624, 104, 70, 118, 30, '#ef9f55', '#c77c38');
  round(c, 676, 116, 16, 94, 8, '#f7f1e3', '#d8cdb3');
  c.restore();
}
// Close-up of a forearm and hand, with the patient's sleeve.
function closeArm(c, p) {
  const skin = p.skin || '#f0c9a4',
    edge = shade(skin, -0.28),
    sleeve = p.shirt || '#8bae87';
  c.save();
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(170, 108);
  c.bezierCurveTo(300, 100, 440, 112, 560, 120);
  c.lineTo(560, 198);
  c.bezierCurveTo(440, 206, 300, 220, 170, 214);
  c.closePath();
  c.fillStyle = skin;
  c.fill();
  c.strokeStyle = edge;
  c.lineWidth = 3;
  c.stroke();
  // Hand with a thumb and four chunky fingers.
  ellipse(c, 598, 158, 50, 44, skin);
  c.beginPath();
  c.ellipse(598, 158, 50, 44, 0, 0, Math.PI * 2);
  c.strokeStyle = edge;
  c.lineWidth = 3;
  c.stroke();
  for (const [y, len] of [
    [124, 44],
    [146, 50],
    [168, 48],
    [190, 40],
  ]) {
    round(c, 630, y - 10, len + 12, 20, 10, skin, edge);
  }
  round(c, 560, 88, 26, 52, 13, skin, edge);
  c.globalAlpha = 0.5;
  line(
    c,
    [
      [596, 146],
      [596, 172],
    ],
    shade(skin, -0.15),
    2
  );
  c.globalAlpha = 1;
  // Sleeve.
  round(c, 30, 78, 160, 166, 28, sleeve, shade(sleeve, -0.3));
  line(
    c,
    [
      [170, 92],
      [170, 230],
    ],
    shade(sleeve, -0.18),
    4
  );
  c.restore();
}
function scrape(c, x, y) {
  c.save();
  c.globalAlpha = 0.8;
  ellipse(c, x, y, 34, 22, '#eaa29a');
  c.globalAlpha = 1;
  for (const [dx, dy, len] of [
    [-20, -8, 22],
    [-12, 2, 26],
    [-4, 10, 18],
    [4, -12, 20],
  ])
    line(
      c,
      [
        [x + dx, y + dy],
        [x + dx + len, y + dy - 3],
      ],
      '#f7c7b7',
      3
    );
  c.restore();
}
function bump(c, x, y) {
  c.save();
  c.globalAlpha = 0.55;
  ellipse(c, x, y, 38, 30, '#c9a0c6');
  c.globalAlpha = 0.6;
  ellipse(c, x - 8, y - 8, 14, 10, '#fff');
  c.restore();
}
function soreSpot(c, x, y) {
  c.save();
  c.globalAlpha = 0.45;
  ellipse(c, x, y, 44, 30, '#ec9d95');
  c.globalAlpha = 0.35;
  ellipse(c, x, y, 26, 17, '#e4827a');
  c.restore();
}
function snowflake(c, x, y, r, color) {
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    line(
      c,
      [
        [x - Math.cos(a) * r, y - Math.sin(a) * r],
        [x + Math.cos(a) * r, y + Math.sin(a) * r],
      ],
      color,
      4
    );
  }
}
