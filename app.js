import { LEVELS, CONDITIONS, ITEMS, EXAM_NAMES, STATIONS, readSave } from './data.js';
import { GameModel, findPath, walkable } from './core.js';
import { drawHospital, hero, person, crisp } from './draw.js';
import { AudioManager } from './audio.js';
import { MiniGame } from './minigames.js';
import { iconSVG } from './icons.js';

const $ = (s) => document.querySelector(s);
const app = $('#app'),
  canvas = $('#world'),
  ctx = canvas.getContext('2d'),
  screen = $('#screen'),
  modalRoot = $('#modal-root');
let W = 1200;
let save = readSave(),
  settings = save.settings,
  audio = new AudioManager(settings),
  game = null,
  mode = 'menu',
  modal = null,
  mini = null,
  view = { x: 0 },
  keys = new Set(),
  stick = { x: 0, y: 0 },
  clock = 0,
  last = performance.now(),
  hudTime = 0,
  footTime = 0,
  toastTimer = 0,
  focusBefore = null,
  guideKey = '',
  guideVoice = null,
  guidePending = null,
  lastSaid = { name: '', at: -99 },
  frame = 0;
// Drawn icons look the same on every device, unlike emoji.
const ic = (name, size = 22) => iconSVG(name, { size });
const stars = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
function persist() {
  try {
    localStorage.setItem('doctor-ayden-v1', JSON.stringify(save));
  } catch {
    toast('Your browser could not save. You can still keep playing.');
  }
}
function toast(message) {
  $('#toast').innerHTML = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}
function confetti() {
  if (settings.reduced) return;
  for (let i = 0; i < 48; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = ['#dfac5a', '#8bb5a0', '#df9986', '#b5a3cc', '#cedf91'][i % 5];
    c.style.animationDelay = Math.random() * 0.7 + 's';
    c.style.setProperty('--drift', (Math.random() - 0.5) * 260 + 'px');
    document.body.append(c);
    setTimeout(() => c.remove(), 4000);
  }
}
// Speak a line unless the same line was just spoken. Pre-readers rely on these voice prompts.
function say(name, gap = 6) {
  if (!name || (lastSaid.name === name && clock - lastSaid.at < gap)) return;
  lastSaid = { name, at: clock };
  audio.say(name);
}
function bind(selector, event, fn) {
  $(selector)?.addEventListener(event, fn);
}
function updateSound() {
  document.body.classList.toggle('reduced', settings.reduced);
  $('#sound').innerHTML = ic(settings.muted ? 'speaker-off' : 'speaker', 22);
  $('#sound').setAttribute('aria-label', settings.muted ? 'Unmute sound' : 'Mute sound');
  audio.apply();
}
function dismiss() {
  mini?.destroy();
  mini = null;
  modalRoot.innerHTML = '';
  modal = null;
  keys.clear();
  stick = { x: 0, y: 0 };
  if (mode === 'playing') {
    audio.resume();
    audio.music('hospital');
  }
  focusBefore?.focus?.();
}
function showModal(title, body, wide = false, type = 'panel') {
  if (!modal) focusBefore = document.activeElement;
  mini?.destroy();
  mini = null;
  modal = type;
  keys.clear();
  stick = { x: 0, y: 0 };
  modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="modal-head"><h2 id="dialog-title">${title}</h2><button class="close" aria-label="Close">×</button></div>${body}</section></div>`;
  bind('.modal .close', 'click', dismiss);
  addTutorialSkip();
  $('.modal .close')?.focus();
}
function skipTutorial() {
  audio.stopVoice();
  save.unlocked = Math.max(1, save.unlocked);
  persist();
  startLevel(1);
  toast('Welcome to Day 1! You can replay the tutorial any time.');
}
function addTutorialSkip() {
  if (!game || game.levelIndex !== 0 || mode !== 'playing') return;
  const panel = modalRoot.querySelector('.modal');
  if (!panel) return;
  const footer = document.createElement('div');
  footer.className = 'tutorial-skip-area';
  const button = document.createElement('button');
  button.className = 'secondary small';
  button.dataset.skipTutorial = '';
  button.textContent = 'Skip tutorial → Day 1';
  button.addEventListener('click', skipTutorial);
  footer.append(button);
  panel.append(footer);
}
function switchScreen(name) {
  dismiss();
  game = null;
  mode = name;
  app.classList.add('menu-mode');
  document.body.classList.remove('playing');
  $('#hud').hidden = true;
  $('#bottom').hidden = true;
  $('#touch-controls').hidden = true;
  $('#world-buttons').innerHTML = '';
  $('#game-overlay').innerHTML = '';
  screen.innerHTML = '';
  audio.music('menu');
  view.x = 0;
  if (name === 'menu') home();
  else if (name === 'levels') levels();
  else stickers();
}
function home() {
  screen.innerHTML = `<section class="home-screen"><div class="hero-copy"><div class="tag"><span>✦</span> THE KINDNESS CLINIC IS OPEN</div><h1>Doctor Ayden<br>to the <em>rescue!</em></h1><p>A little checkup. A little kindness.<br>A whole lot of feeling better.</p><button id="play" class="primary play">Let’s play <span style="margin-left:18px">➜</span></button><div class="hero-links"><button id="book" class="secondary">✦ &nbsp; Sticker book</button><button id="how" class="secondary">? &nbsp; How to play</button></div><div class="hero-note"><span>♡ Made for ages 4–9</span><span>•</span><span>Play at your own pace</span></div></div><div class="hero-art"><canvas id="hero" width="550" height="520" aria-label="Doctor Ayden and his friends outside the Kindness Clinic"></canvas><div class="floating-label">Hi! I’m Doctor Ayden. <span>Ready to make someone smile?</span></div></div></section>`;
  bind('#play', 'click', () => {
    audio.unlock();
    audio.say('welcome');
    switchScreen('levels');
  });
  bind('#book', 'click', () => switchScreen('stickers'));
  bind('#how', 'click', help);
}
function levels() {
  screen.innerHTML = `<section class="level-screen"><div class="screen-heading"><div><div class="eyebrow">ONE KIND LITTLE ADVENTURE AT A TIME</div><h1>Your clinic days</h1><p>Help your patients. Collect a sticker. Make someone smile.</p></div><button class="secondary back" id="back">← Back</button></div><div class="tutorial-choice"><span>The tutorial is optional. Come back any time.</span><button class="secondary small" id="skip-intro">Skip tutorial → Day 1</button></div><div class="level-grid">${LEVELS.map((l, i) => `<button class="level-card ${save.unlocked === i ? 'current' : ''}" data-level="${i}" ${i > save.unlocked ? 'disabled' : ''}><span class="level-number">${i === 0 ? 'OPTIONAL TUTORIAL' : 'DAY ' + i} ${i > save.unlocked ? ic('lock', 14) : ''}</span><span class="level-icon">${ic(l.icon, 48)}</span><h3>${l.name}</h3><p>${l.subtitle}</p><span class="stars">${save.results[i] ? stars(save.results[i].stars) : i > save.unlocked ? ic('lock', 22) : '☆☆☆'}</span></button>`).join('')}</div></section>`;
  bind('#back', 'click', () => switchScreen('menu'));
  bind('#skip-intro', 'click', skipTutorial);
  screen
    .querySelectorAll('[data-level]')
    .forEach((b) => b.addEventListener('click', () => startLevel(Number(b.dataset.level))));
}
function stickers() {
  screen.innerHTML = `<section class="sticker-screen"><div class="screen-heading"><div><div class="eyebrow">YOUR LITTLE BOOK OF BIG KINDNESS</div><h1>Sticker book <span style="color:#a6b790;font-size:20px">${Object.keys(save.results).length} / 6</span></h1><p>Every finished clinic day earns a happy little memory.</p></div><button class="secondary back" id="back">← Back</button></div><div class="sticker-grid">${LEVELS.map((l, i) => `<div class="sticker ${save.results[i] ? '' : 'locked'}"><b>${ic(l.sticker, 72)}</b><h3>${save.results[i] ? l.name : 'Finish ' + (i ? 'Day ' + i : 'the tutorial')}</h3><span class="stars">${save.results[i] ? stars(save.results[i].stars) : '☆☆☆'}</span></div>`).join('')}</div></section>`;
  bind('#back', 'click', () => switchScreen('menu'));
}
function help() {
  showModal(
    'You’re the doctor!',
    `<p>Help each patient through a checkup, collect their supplies, and help them feel better.</p><div class="settings-row"><span>${ic('tap')} Tap a patient or room</span><b>Ayden walks there</b></div><div class="settings-row"><span>${ic('keyboard')} Arrow keys / WASD</span><b>Walk</b></div><div class="settings-row"><span>${ic('hand')} E or Space</span><b>Help / interact</b></div><div class="settings-row"><span>${ic('clipboard')} C or Tab</span><b>Patient clipboard</b></div><div class="settings-row"><span>${ic('pause')} Escape / P</span><b>Pause</b></div><p>On a tablet, tap where you want to go. You can turn on a thumb pad in Settings. Nurse Lily always has a helpful hint. There is no penalty for asking!</p><button class="primary" id="got-it">Got it! ♡</button>`
  );
  bind('#got-it', 'click', dismiss);
}
function startLevel(index) {
  dismiss();
  audio.unlock();
  game = new GameModel(index, settings);
  game.chairPosition = { x: 480, y: 480 };
  mode = 'playing';
  app.classList.remove('menu-mode');
  document.body.classList.add('playing');
  screen.innerHTML = '';
  $('#hud').hidden = false;
  $('#bottom').hidden = false;
  $('#touch-controls').hidden = !settings.joystick;
  guideKey = '';
  guidePending = null;
  audio.music('hospital');
  audio.say(index === 0 ? 'tutorial-patient' : 'next-patient');
  refresh();
  resize();
}
function refresh() {
  if (!game) return;
  const g = game;
  $('#hud').innerHTML =
    `<div class="hud-title"><div class="eyebrow">${g.levelIndex ? 'CLINIC DAY ' + g.levelIndex : 'YOUR FIRST ADVENTURE'}</div><h2>${ic(g.level.icon, 28)} ${g.level.name}</h2></div><div class="hud-chip"><span>♡</span> ${g.helped} / ${g.level.schedule.length} <small>helped</small><span class="progress-track"><i style="width:${(g.helped / g.level.schedule.length) * 100}%"></i></span></div><div class="hud-chip">✦ <span id="score">${g.score.toLocaleString()}</span></div><div class="hud-chip" id="clinic-time">${settings.patience ? formatTime(Math.max(0, g.level.duration - g.time)) : '☀ No rush'}</div>${g.levelIndex === 0 ? '<button id="skip-tutorial" class="secondary small">Skip tutorial →</button>' : ''}<button id="hud-settings" class="secondary small hud-icon" aria-label="Settings" title="Settings">${ic('gear', 20)}</button><button id="hud-sound" class="secondary small hud-icon" aria-label="${settings.muted ? 'Unmute sound' : 'Mute sound'}" title="Sound on / off">${ic(settings.muted ? 'speaker-off' : 'speaker', 20)}</button><button id="pause" class="secondary small" aria-label="Pause game">Ⅱ Pause</button>`;
  bind('#pause', 'click', pause);
  bind('#hud-sound', 'click', toggleSound);
  bind('#hud-settings', 'click', options);
  bind('#skip-tutorial', 'click', skipTutorial);
  $('#bottom').innerHTML =
    `<span class="bag-label">${ic('bag', 26)} Your bag <small>Tap an item<br>to put it back</small></span>${Array.from({ length: Number(settings.capacity) }, (_, i) => `<button class="slot ${g.inventory[i] ? 'filled' : ''}" data-slot="${i}" aria-label="${g.inventory[i] ? 'Return ' + ITEMS[g.inventory[i]].name : 'Empty bag slot'}" title="${g.inventory[i] ? 'Return ' + ITEMS[g.inventory[i]].name : 'Empty bag slot'}">${g.inventory[i] ? ic(ITEMS[g.inventory[i]].icon, 32) : '·'}${g.inventory[i] ? '<small>×</small>' : ''}</button>`).join('')}<span class="bottom-spacer"></span><span class="keyhint"><kbd>W A S D</kbd> move &nbsp; <kbd>E</kbd> help</span><button class="secondary" id="clipboard">${ic('clipboard')} Patients</button><button class="secondary" id="ask-nurse">${ic('chat')} Ask nurse</button>`;
  $('#bottom')
    .querySelectorAll('[data-slot]')
    .forEach((b) =>
      b.addEventListener('click', () => {
        if (modal) return;
        const i = Number(b.dataset.slot);
        if (g.inventory[i]) {
          toast(`${ITEMS[g.inventory[i]].name} put back. Room for something new!`);
          g.inventory.splice(i, 1);
          audio.fx('tray');
          refresh();
        }
      })
    );
  bind('#clipboard', 'click', clipboard);
  bind('#ask-nurse', 'click', nurse);
  hotspots();
  guide();
  fitWorld();
}
function formatTime(n) {
  return Math.floor(n / 60) + ':' + String(Math.floor(n % 60)).padStart(2, '0');
}
function availablePatient() {
  return game.patients.find((p) => p.state !== 'discharged');
}
function guide() {
  if (!game) return;
  let p = game.patients.find((p) => p.id === game.wheelchair) || availablePatient();
  let message = 'Everyone is doing great!',
    voice = null,
    key = 'done';
  if (p) {
    const n = game.next(p);
    const hasItem = !n.item || game.inventory.includes(n.item);
    key = [p.id, p.exam, p.step, game.wheelchair, game.emptyChair, hasItem].join(':');
    if (n.phase === 'exam') {
      message = `${p.name} needs a checkup ${ic(CONDITIONS[p.condition].symptom, 26)} • Tap their bed`;
      voice = 'hint-exam';
    } else if (n.game === 'transport' || n.game === 'recovery') {
      const dest = n.game === 'transport' ? 'procedure' : 'recovery';
      message =
        game.wheelchair !== null
          ? `${ic('wheelchair', 26)} Bring ${p.name} to ${dest === 'procedure' ? 'Procedure' : 'Recovery'}`
          : `${ic('wheelchair', 26)} Get the wheelchair and help ${p.name}`;
      voice = game.wheelchair !== null ? dest : 'wheelchair';
    } else if (!hasItem) {
      message = `Get ${ic(ITEMS[n.item].icon, 26)} ${ITEMS[n.item].name} from Supplies`;
      voice = 'need-' + n.item;
    } else {
      message = `${p.name} is ready • ${n.label}`;
      voice = n.game === 'rest' ? 'hint-rest' : 'hint-patient';
    }
  }
  guideVoice = voice;
  $('#game-overlay').innerHTML =
    `<div class="walkhint"><span>${message}</span>${voice ? '<button class="say-again" aria-label="Say it again" title="Say it again">' + ic('speaker') + '</button>' : ''}</div>`;
  bind('#game-overlay .say-again', 'click', () => {
    audio.unlock();
    say(guideVoice, 0);
  });
  // Speak each new task once, as soon as the clinic is quiet (see tick).
  if (key !== guideKey) {
    guideKey = key;
    guidePending = voice ? { voice, at: clock + 0.9 } : null;
  }
}
function hotspotData() {
  if (!game) return [];
  return [
    ...game.patients
      .filter((p) => p.state !== 'discharged' && game.wheelchair !== p.id)
      .map((p) => ({
        id: 'patient-' + p.id,
        x: game.position(p).x,
        y: game.position(p).y - 8,
        w: 140,
        h: 200,
        label: 'Help ' + p.name,
        action: () => goPatient(p),
      })),
    ...STATIONS.map((s) => ({
      ...s,
      ...(s.id === 'chair' ? { x: game.chairPosition.x, y: game.chairPosition.y } : {}),
      w: s.id === 'supplies' ? 265 : s.id === 'procedure' ? 185 : s.id === 'recovery' ? 180 : 70,
      h: s.id === 'supplies' ? 160 : 90,
      action: () => goStation(s.id),
    })),
  ];
}
function hotspots() {
  const root = $('#world-buttons');
  root.innerHTML = '';
  for (const h of hotspotData()) {
    if (h.id === 'chair' && (game.emptyChair || game.wheelchair !== null)) continue;
    const b = document.createElement('button');
    b.className = 'world-hotspot';
    b.style.zIndex = h.id.startsWith('patient-') ? '2' : '1';
    b.dataset.object = h.id;
    b.setAttribute('aria-label', h.label);
    b.title = h.label;
    b.style.width = (h.w / W) * 100 + '%';
    b.style.height = (h.h / 760) * 100 + '%';
    b.style.left = ((h.x - view.x) / W) * 100 + '%';
    b.style.top = (h.y / 760) * 100 + '%';
    b.innerHTML = `<span>${h.label}</span>`;
    b.addEventListener('click', () => {
      if (mode === 'playing' && !modal) h.action();
    });
    root.append(b);
  }
}
function syncHotspots() {
  if (!game) return;
  for (const h of hotspotData()) {
    const b = $(`[data-object="${h.id}"]`);
    if (b) b.style.left = ((h.x - view.x) / W) * 100 + '%';
  }
}
function goTo(x, y, action = null) {
  if (!game || modal) return;
  game.path = findPath(game.doctor, { x, y });
  game.destination = action;
  if (!game.path.length && action) {
    toast('Try a little closer to the doorway.');
    game.destination = null;
  }
  audio.fx('tap', 0.25);
}
function goPatient(p) {
  if (game.wheelchair !== null && game.wheelchair !== p.id) {
    toast('Let’s bring this patient to their next room first.');
    nurse();
    return;
  }
  const pos = game.approach(p);
  goTo(pos.x, pos.y, () => patientDialog(p));
}
function goStation(id) {
  const s = STATIONS.find((s) => s.id === id);
  const at =
    id === 'chair' ? { tx: game.chairPosition.x, ty: Math.min(710, game.chairPosition.y + 27) } : s;
  goTo(at.tx, at.ty, () => station(id));
}
function station(id) {
  if (id === 'supplies') supplies();
  if (id === 'nurse') nurse();
  if (id === 'sink') {
    audio.fx('sink');
    audio.say('hands');
    if (!game.washed) {
      game.score += 50;
      game.care++;
      game.washed = true;
    }
    toast(`${ic('soap')} Clean hands! Ready to help.`);
    refresh();
  }
  if (id === 'chair') {
    if (game.wheelchair !== null) {
      toast('Your patient is already riding with you.');
      return;
    }
    game.emptyChair = !game.emptyChair;
    if (!game.emptyChair) game.chairPosition = { x: game.doctor.x, y: game.doctor.y + 24 };
    audio.fx('wheel');
    toast(
      game.emptyChair
        ? `${ic('wheelchair')} Wheelchair ready! Go to the patient who needs a ride.`
        : 'Wheelchair parked.'
    );
    refresh();
  }
  if (id === 'procedure' || id === 'recovery') arriveRoom(id);
}
function interact() {
  if (modal || !game) return;
  const d = game.doctor;
  const targets = [
    ...game.patients
      .filter((p) => p.state !== 'discharged' && game.wheelchair !== p.id)
      .map((p) => ({ ...game.approach(p), action: () => patientDialog(p) })),
    ...STATIONS.map((s) => ({
      x: s.id === 'chair' ? game.chairPosition.x : s.tx,
      y: s.id === 'chair' ? game.chairPosition.y + 20 : s.ty,
      action: () => station(s.id),
    })),
  ];
  targets.sort((a, b) => Math.hypot(a.x - d.x, a.y - d.y) - Math.hypot(b.x - d.x, b.y - d.y));
  if (Math.hypot(targets[0].x - d.x, targets[0].y - d.y) < 90) targets[0].action();
  else toast('Walk near a patient or a cupboard. Or tap it to walk there!');
}
function careList(p) {
  const c = CONDITIONS[p.condition];
  const exams = c.exam
    .map(
      (ex, i) =>
        `<li class="${i < p.exam ? 'done' : i === p.exam ? 'active' : ''}">${i < p.exam ? '✓' : '○'} ${EXAM_NAMES[ex]}</li>`
    )
    .join('');
  if (p.exam < c.exam.length)
    return `<ul class="checklist">${exams}<li>♡ Let’s find out what ${p.name} needs.</li></ul>`;
  return `<ul class="checklist">${exams}${c.steps.map((s, i) => `<li class="${i < p.step ? 'done' : i === p.step ? 'active' : ''}">${i < p.step ? '✓' : '○'} ${s.item ? ic(ITEMS[s.item].icon, 18) + ' ' : ''}${s.label}</li>`).join('')}</ul>`;
}
function patientDialog(p) {
  if (p.state === 'discharged') return;
  const n = game.next(p);
  let label =
    n.phase === 'exam'
      ? 'Start checkup'
      : n.game === 'transport' || n.game === 'recovery'
        ? game.emptyChair
          ? 'Help into wheelchair'
          : 'Get the wheelchair'
        : n.item && !game.inventory.includes(n.item)
          ? 'Get supplies'
          : n.label;
  showModal(
    `${p.name} ${ic(CONDITIONS[p.condition].symptom, 32)}`,
    `<div class="patient-card" style="grid-template-columns:85px 1fr"><canvas id="patient-portrait" width="100" height="130"></canvas><div><p class="patient-line">“${CONDITIONS[p.condition].line}” <button class="say-again" id="say-symptom" aria-label="Hear ${p.name} again" title="Hear it again">${ic('speaker', 18)}</button></p><span style="color:#da9685">${'♥'.repeat(Math.ceil(p.happiness)) + '♡'.repeat(3 - Math.ceil(p.happiness))}</span><small style="margin-left:12px;color:#94a187">${p.personality}</small>${careList(p)}</div></div><div class="modal-actions"><button class="secondary" id="reassure" ${p.reassured ? 'disabled' : ''}>♡ ${p.reassured ? 'Feeling brave!' : 'You’re doing great!'}</button><button class="primary" id="patient-action">${label} →</button></div>`,
    false,
    'patient'
  );
  person(crisp($('#patient-portrait')), 50, 116, { ...p, scale: 1.12, happy: p.reassured });
  if (!p.spoke) {
    say(p.condition + '-symptom');
    p.spoke = true;
  }
  bind('#say-symptom', 'click', () => say(p.condition + '-symptom', 0));
  bind('#reassure', 'click', () => {
    game.reassure(p);
    audio.say('reassure');
    audio.fx('teddy');
    patientDialog(p);
    refresh();
  });
  bind('#patient-action', 'click', () => {
    dismiss();
    const next = game.next(p);
    if (next.game === 'transport' || next.game === 'recovery') {
      board(p);
      return;
    }
    if (next.room && p.location !== next.room) {
      toast('This treatment belongs in the procedure room.');
      return;
    }
    if (next.item && !game.inventory.includes(next.item)) {
      audio.say('supplies');
      goStation('supplies');
      return;
    }
    startMini(p);
  });
}
function board(p) {
  if (game.transportLock !== null && game.transportLock !== p.id) {
    toast('The procedure room is busy. Help our first rider finish their care.');
    return;
  }
  if (!game.emptyChair) {
    audio.say('wheelchair');
    goStation('chair');
    return;
  }
  game.transportLock = p.id;
  game.wheelchair = p.id;
  game.emptyChair = false;
  p.location = 'transport';
  p.state = 'transport';
  audio.say(game.next(p).game === 'transport' ? 'procedure' : 'recovery');
  toast(
    `${ic('wheelchair')} ${p.name} is ready! Tap ${game.next(p).game === 'transport' ? 'Procedure' : 'Recovery'}.`
  );
  refresh();
}
function arriveRoom(room) {
  if (game.wheelchair === null) {
    const p = game.patients.find((p) => p.location === room && p.state !== 'discharged');
    if (p) patientDialog(p);
    else
      toast(
        room === 'procedure'
          ? 'A cosy place for special checkups. Bring a patient who needs a ride.'
          : 'A quiet corner for a little rest.'
      );
    return;
  }
  const p = game.patients.find((p) => p.id === game.wheelchair),
    expected = game.next(p).game === 'transport' ? 'procedure' : 'recovery';
  if (room !== expected) {
    toast(`Let’s take ${p.name} to ${expected === 'procedure' ? 'Procedure' : 'Recovery'}.`);
    return;
  }
  game.complete(p, 1);
  p.location = room;
  game.wheelchair = null;
  game.chairPosition = room === 'procedure' ? { x: 738, y: 700 } : { x: 880, y: 708 };
  audio.fx('wheel');
  audio.praise();
  refresh();
  patientDialog(p);
}
function supplies() {
  const needed = new Set(
    game.patients.filter((p) => p.state !== 'discharged').flatMap((p) => game.needs(p))
  );
  if (modal !== 'supplies') {
    const missing = [...needed].find((id) => !game.inventory.includes(id));
    say(missing ? 'need-' + missing : 'supply-cupboard');
    if (guidePending?.voice.startsWith('need-')) guidePending = null;
  }
  showModal(
    'The supply cupboard',
    `<p>Match the picture on your patient’s care card. Your bag holds ${settings.capacity} items.</p><div class="supply-grid">${Object.entries(
      ITEMS
    )
      .map(
        ([id, item]) =>
          `<button class="supply ${needed.has(id) ? 'needed' : ''}" data-item="${id}"><span>${ic(item.icon, 46)}</span>${item.name}<small>${item.symbol} picture ${game.inventory.includes(id) ? ' · In bag ✓' : ''}</small></button>`
      )
      .join(
        ''
      )}</div><div class="modal-actions"><button class="primary" id="supplies-done">Back to my patients →</button></div>`,
    true,
    'supplies'
  );
  bind('#supplies-done', 'click', dismiss);
  modalRoot.querySelectorAll('[data-item]').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.item;
      if (game.take(id)) {
        audio.fx('pickup');
        toast(`${ic(ITEMS[id].icon)} ${ITEMS[id].name} is in your bag!`);
        refresh();
        supplies();
      } else {
        audio.say('bag-full');
        toast('Your bag is full. Close the cupboard, then tap a bag item to return it.');
      }
    })
  );
}
function clipboard() {
  if (!game || mini) return;
  audio.fx('page');
  showModal(
    'Your patient clipboard',
    `${game.patients
      .filter((p) => p.state !== 'discharged')
      .map(
        (p) =>
          `<article class="patient-card"><canvas data-portrait="${p.id}" width="80" height="105"></canvas><div><h3>${p.name} <span style="font-size:12px;color:#d5937e">${'♥'.repeat(Math.ceil(p.happiness))}</span></h3><p>${p.location === 'ward' ? 'Bed ' + (p.bed + 1) : p.location === 'transport' ? 'Riding with Ayden' : p.location === 'procedure' ? 'Procedure room' : 'Recovery corner'} · ${p.exam < CONDITIONS[p.condition].exam.length ? 'Needs a checkup' : CONDITIONS[p.condition].name}</p>${careList(p)}</div><button class="secondary visit" data-visit="${p.id}">Visit →</button></article>`
      )
      .join(
        ''
      )}<p style="font-size:12px">${game.helped} patients helped · ${game.level.schedule.length - game.patients.length} still to arrive</p>`,
    true,
    'clipboard'
  );
  modalRoot.querySelectorAll('[data-portrait]').forEach((c) =>
    person(crisp(c), 40, 97, {
      ...game.patients.find((p) => p.id === Number(c.dataset.portrait)),
      scale: 0.9,
    })
  );
  modalRoot.querySelectorAll('[data-visit]').forEach((b) =>
    b.addEventListener('click', () => {
      const p = game.patients.find((p) => p.id === Number(b.dataset.visit));
      dismiss();
      if (game.wheelchair === p.id)
        goStation(game.next(p).game === 'transport' ? 'procedure' : 'recovery');
      else goPatient(p);
    })
  );
}
function nurse() {
  if (!game || mini) return;
  let p =
    game.patients.find((p) => p.id === game.wheelchair) ||
    game.patients.find((p) => p.id === game.transportLock && p.state !== 'discharged') ||
    availablePatient();
  if (!p) {
    toast('You’ve helped everyone!');
    return;
  }
  const n = game.next(p);
  let words, voice, go;
  if (n.phase === 'exam') {
    words = `${p.name} needs a gentle checkup. Tap their bed. I’ll show you the way!`;
    voice = 'hint-exam';
    go = () => goPatient(p);
  } else if (n.game === 'transport' || n.game === 'recovery') {
    if (game.wheelchair !== null) {
      const dest = n.game === 'transport' ? 'procedure' : 'recovery';
      words = `Push ${p.name} to the ${dest} room. Tap the big bed in that room.`;
      voice = dest;
      go = () => goStation(dest);
    } else {
      words = game.emptyChair
        ? `Bring the wheelchair to ${p.name}. Tap their bed to help them in.`
        : `Get the wheelchair in the corridor, then visit ${p.name}.`;
      voice = 'wheelchair';
      go = () => (game.emptyChair ? goPatient(p) : goStation('chair'));
    }
  } else if (n.item && !game.inventory.includes(n.item)) {
    words = `${p.name} needs ${ic(ITEMS[n.item].icon)} ${ITEMS[n.item].name}. Look for the ${ITEMS[n.item].symbol.toLowerCase()} picture in the supply cupboard.`;
    voice = 'need-' + n.item;
    go = () => goStation('supplies');
  } else {
    words = `You have everything you need! Visit ${p.name} to ${n.label.toLowerCase()}.`;
    voice = n.game === 'rest' ? 'hint-rest' : 'hint-patient';
    go = () => goPatient(p);
  }
  showModal(
    `Nurse Lily is here! ${ic('chat', 30)}`,
    `<p style="font-size:18px">${words}</p><div class="modal-actions"><button class="secondary" id="repeat-hint">♫ Say it again</button><button class="primary" id="show-way">Show me the way →</button></div>`,
    false,
    'nurse'
  );
  say(voice, 0);
  bind('#repeat-hint', 'click', () => say(voice, 0));
  bind('#show-way', 'click', () => {
    dismiss();
    go();
  });
}
function startMini(p) {
  const n = game.next(p);
  if (n.item && !game.inventory.includes(n.item)) {
    toast('Let’s collect the supplies first.');
    return;
  }
  focusBefore = document.activeElement;
  modal = 'mini';
  keys.clear();
  game.path = [];
  game.destination = null;
  audio.music('mini');
  mini = new MiniGame(
    modalRoot,
    n.game,
    p,
    n,
    audio,
    settings,
    (quality, mistakes) => {
      game.errors += mistakes;
      game.score = Math.max(0, game.score - mistakes * 25);
      mini = null;
      modal = null;
      modalRoot.innerHTML = '';
      game.complete(p, quality);
      audio.music('hospital');
      if (p.state === 'discharged') {
        p.celebrated = clock;
        confetti();
        audio.say('all-better');
        toast(`♡ ${p.name} feels much better! +600`);
        if (game.finished) {
          showResults();
          return;
        }
      } else {
        toast(
          n.phase === 'exam' && p.exam === CONDITIONS[p.condition].exam.length
            ? '✓ Checkup done! Your care card is ready.'
            : 'Great care! What’s next on the clipboard?'
        );
        patientDialog(p);
      }
      refresh();
    },
    () => {
      mini = null;
      dismiss();
      toast('No rush. You can try again when you’re ready.');
    }
  );
  addTutorialSkip();
}
function showResults() {
  const report = game.report(),
    i = game.levelIndex;
  const old = save.results[i];
  save.results[i] = {
    ...report,
    score: Math.max(old?.score || 0, report.score),
    stars: Math.max(old?.stars || 0, report.stars),
  };
  save.unlocked = Math.max(save.unlocked, Math.min(5, i + 1));
  persist();
  mode = 'results';
  audio.music('complete');
  audio.say('complete');
  confetti();
  showModal(
    'Clinic complete!',
    `<div class="result"><div class="big-icon">${ic(i === 5 ? 'trophy' : 'star', 84)}</div><h2>${i === 5 ? 'Our kindness champion!' : 'You made their day!'}</h2><p>${game.helped} / ${game.level.schedule.length} patients feel better, thanks to you.</p><div class="stars">${stars(report.stars)}</div><div class="report-grid"><div><strong>♡</strong>Caring<div class="stars">${stars(report.caring)}</div></div><div><strong>${ic('stethoscope', 30)}</strong>Doctor skill<div class="stars">${stars(report.skill)}</div></div><div><strong>ϟ</strong>Efficiency<div class="stars">${stars(report.efficiency)}</div></div></div><h3 style="font-size:25px;margin-bottom:0">${report.score.toLocaleString()} points</h3><div class="sticker-reward"><b>${ic(LEVELS[i].sticker, 44)}</b>${old ? 'A lovely sticker for your book!' : 'New sticker unlocked!'}</div><div class="modal-actions"><button class="secondary" id="result-menu">Clinic days</button><button class="secondary" id="replay">↻ Replay</button><button class="primary" id="next-level">${i < 5 ? 'Next adventure →' : 'My sticker book ✦'}</button></div></div>`,
    false,
    'results'
  );
  $('.modal .close').hidden = true;
  bind('#replay', 'click', () => startLevel(i));
  bind('#result-menu', 'click', () => switchScreen('levels'));
  bind('#next-level', 'click', () => (i < 5 ? startLevel(i + 1) : switchScreen('stickers')));
}
function pause() {
  if (mode !== 'playing' || mini) return;
  audio.suspend();
  showModal(
    'A little breather ☁',
    `<p>Your patients can wait. Take your time!</p><div class="modal-actions"><button id="resume" class="primary">Keep helping →</button><button id="pause-options" class="secondary">Settings</button><button id="pause-home" class="secondary">Clinic days</button></div>`,
    false,
    'pause'
  );
  bind('#resume', 'click', dismiss);
  bind('#pause-options', 'click', options);
  bind('#pause-home', 'click', () => {
    showModal(
      'Leave this clinic day?',
      `<p>This day will restart next time. Your finished days and stickers are saved.</p><div class="modal-actions"><button class="secondary" id="stay">Keep playing</button><button class="primary" id="leave">Clinic days</button></div>`
    );
    bind('#stay', 'click', dismiss);
    bind('#leave', 'click', () => switchScreen('levels'));
  });
}
function options() {
  if (mini) return;
  showModal(
    'Make yourself comfortable',
    `<label class="settings-row"><span>♫ Acoustic music</span><input type="range" id="opt-music" min="0" max="1" step="0.05" value="${settings.music}"></label><label class="settings-row"><span>✦ Sound effects</span><input type="range" id="opt-sound" min="0" max="1" step="0.05" value="${settings.sound}"></label><label class="settings-row"><span>${ic('chat', 18)} Spoken encouragement</span><input type="range" id="opt-voice" min="0" max="1" step="0.05" value="${settings.voice}"></label><label class="settings-row"><span>Extra challenge<small>Waiting hearts and a gentle clinic clock</small></span><input type="checkbox" id="opt-patience" ${settings.patience ? 'checked' : ''}></label><label class="settings-row"><span>Less movement<small>Reduce bounces and confetti</small></span><input type="checkbox" id="opt-reduced" ${settings.reduced ? 'checked' : ''}></label><label class="settings-row"><span>Thumb pad<small>A joystick for walking. Tapping the floor also works.</small></span><input type="checkbox" id="opt-joystick" ${settings.joystick ? 'checked' : ''}></label><label class="settings-row"><span>Walking speed</span><select id="opt-speed"><option value="0.75">Easy stroll</option><option value="1">Normal</option><option value="1.3">Speedy sneakers</option></select></label><label class="settings-row"><span>Doctor bag<small>Changes when the bag has enough room</small></span><select id="opt-capacity"><option value="1">1 item</option><option value="2">2 items</option><option value="3">3 items</option></select></label><p style="font-size:12px">All procedures use friendly pretend comfort patches. No needles or scary pictures.</p><div class="modal-actions"><button id="test-voice" class="secondary">♫ Hear “Good job!”</button><button id="options-done" class="primary">All set!</button></div>`,
    false,
    'settings'
  );
  $('#opt-speed').value = String(settings.speed);
  $('#opt-capacity').value = String(settings.capacity);
  for (const key of [
    'music',
    'sound',
    'voice',
    'patience',
    'reduced',
    'joystick',
    'speed',
    'capacity',
  ])
    bind('#opt-' + key, 'input', (e) => {
      let value = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
      if (key === 'capacity' && game && game.inventory.length > value) {
        e.target.value = String(settings.capacity);
        toast('Return a bag item first, then choose a smaller bag.');
        return;
      }
      settings[key] = value;
      persist();
      updateSound();
      if (key === 'joystick' && mode === 'playing') $('#touch-controls').hidden = !value;
      if (game) refresh();
    });
  bind('#test-voice', 'click', () => {
    audio.resume();
    audio.unlock();
    audio.say('good-job');
  });
  bind('#options-done', 'click', () => {
    dismiss();
  });
}
function credits() {
  if (mini) return;
  showModal(
    'For grown-ups & credits',
    `<div class="credits-copy"><p><b>Doctor Ayden to the Rescue!</b> is a fictional children’s game. Treatments are simplified for play and should not be used as real medical advice. Real medicines are for grown-ups to handle.</p><p>The six clinic days include gentle checkups, matching supplies, cleaning, bandaging, and wheelchair trips. Finished days, best scores, stickers, and settings are saved in this browser.</p><p><b>Music:</b> “Carefree” by Kevin MacLeod (<a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400037" target="_blank" rel="noopener">incompetech.com</a>), licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">Creative Commons Attribution 4.0</a>. Edited into short loops and a celebration cue.</p><p><b>Recorded effects:</b> <a href="https://kenney.nl/assets/impact-sounds" target="_blank" rel="noopener">Impact Sounds by Kenney</a>, CC0. Trimmed and converted to MP3.</p><p><b>Speech:</b> Microsoft Aria neural voice. Encouragement is bundled with the game; no microphone, sign-in, or network connection is needed to play.</p><p><b>Typeface:</b> Nunito by Vernon Adams, Cyreal and Jacques Le Bailly, SIL Open Font License. Character and hospital art are drawn in the game’s own source.</p></div>`
  );
}
function closeClinic() {
  game.closed = true;
  showModal(
    'A lovely day of helping ☀',
    `<p>You helped ${game.helped} of ${game.level.schedule.length} patients before closing time. You can keep going and help everyone!</p><div class="modal-actions"><button class="primary" id="continue-clinic">Keep caring →</button><button class="secondary" id="retry-clinic">Try this day again</button></div>`,
    false,
    'closing'
  );
  bind('#continue-clinic', 'click', dismiss);
  bind('#retry-clinic', 'click', () => startLevel(game.levelIndex));
}
function fitWorld() {
  // Size the clinic so the whole map, HUD and bag fit on one tablet screen.
  const chrome = ($('#hud').offsetHeight || 0) + ($('#bottom').offsetHeight || 0);
  document.documentElement.style.setProperty('--play-chrome', chrome + 'px');
}
function resize() {
  fitWorld();
  W = innerWidth <= 600 ? 650 : 1200;
  canvas.dataset.w = W;
  canvas.dataset.h = 760;
  crisp(canvas);
  hotspots();
}
window.addEventListener('resize', resize);
canvas.addEventListener('pointerdown', (e) => {
  if (mode !== 'playing' || modal) return;
  const r = canvas.getBoundingClientRect();
  goTo(((e.clientX - r.left) / r.width) * W + view.x, ((e.clientY - r.top) / r.height) * 760);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && modal) {
    const focusable = [
      ...modalRoot.querySelectorAll('button:not(:disabled):not([hidden]),input,select,a'),
    ];
    if (!focusable.length) return;
    const first = focusable[0],
      last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    if (mini) mini.cancel();
    else if (modal && modal !== 'results') dismiss();
    else if (mode === 'playing') pause();
    return;
  }
  if (modal || mode !== 'playing') return;
  const key = e.key.toLowerCase();
  if (
    [
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      'w',
      'a',
      's',
      'd',
      ' ',
      'e',
      'tab',
      'c',
      'p',
    ].includes(key)
  )
    e.preventDefault();
  if (['tab', 'c'].includes(key) && !e.repeat) {
    clipboard();
    return;
  }
  if (key === 'p' && !e.repeat) {
    pause();
    return;
  }
  if (['e', ' '].includes(key) && !e.repeat) {
    interact();
    return;
  }
  keys.add(key);
});
document.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => {
  keys.clear();
  stick = { x: 0, y: 0 };
  if (mode === 'playing' && !modal) pause();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audio.suspend();
    keys.clear();
    if (mode === 'playing' && !modal) pause();
  } else if (modal !== 'pause') audio.resume();
});
$('#game-wrap').append($('#touch-controls'));
const joy = $('#joystick'),
  knob = joy.querySelector('span');
let joyPointer = null;
function moveJoystick(e) {
  const r = joy.getBoundingClientRect(),
    dx = e.clientX - r.left - r.width / 2,
    dy = e.clientY - r.top - r.height / 2,
    len = Math.hypot(dx, dy) || 1,
    f = Math.min(26, len);
  stick = { x: ((dx / len) * f) / 26, y: ((dy / len) * f) / 26 };
  knob.style.transform = `translate(${stick.x * 23}px,${stick.y * 23}px)`;
}
joy.addEventListener('pointerdown', (e) => {
  joyPointer = e.pointerId;
  joy.setPointerCapture(e.pointerId);
  moveJoystick(e);
});
joy.addEventListener('pointermove', (e) => {
  if (e.pointerId === joyPointer) moveJoystick(e);
});
for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture'])
  joy.addEventListener(ev, () => {
    joyPointer = null;
    stick = { x: 0, y: 0 };
    knob.style.transform = '';
  });
bind('#touch-interact', 'click', interact);
function toggleSound() {
  audio.unlock();
  settings.muted = !settings.muted;
  updateSound();
  persist();
  if (game) refresh();
}
bind('#sound', 'click', toggleSound);
bind('#settings', 'click', () => {
  audio.unlock();
  options();
});
bind('#credits', 'click', credits);
bind('#home', 'click', (e) => {
  e.preventDefault();
  if (mode === 'playing') pause();
  else switchScreen('menu');
});
document.addEventListener('pointerdown', () => audio.unlock(), { once: true });
function tick(now) {
  // Cap at 0.1 s so slow tablets keep real time without walking through walls.
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  clock += dt;
  frame++;
  const t = settings.reduced ? 0 : clock;
  if (game && mode === 'playing' && !modal) {
    const prev = game.patients.length;
    game.update(dt);
    if (game.patients.length > prev) {
      audio.fx('arrive', 0.2);
      if (clock > 8) audio.say('new-patient');
      toast('A new patient is waiting. You can do it!');
      refresh();
    }
    if (settings.patience && game.time >= game.level.duration && !game.closed) closeClinic();
    let dx =
        (keys.has('d') || keys.has('arrowright') ? 1 : 0) -
        (keys.has('a') || keys.has('arrowleft') ? 1 : 0) +
        stick.x,
      dy =
        (keys.has('s') || keys.has('arrowdown') ? 1 : 0) -
        (keys.has('w') || keys.has('arrowup') ? 1 : 0) +
        stick.y;
    const manual = Math.hypot(dx, dy) > 0.15;
    const d = game.doctor;
    if (manual) {
      game.path = [];
      game.destination = null;
    } else if (game.path.length) {
      const p = game.path[0];
      dx = p.x - d.x;
      dy = p.y - d.y;
      if (Math.hypot(dx, dy) < 4) {
        d.x = p.x;
        d.y = p.y;
        game.path.shift();
        dx = 0;
        dy = 0;
      }
    }
    const len = Math.hypot(dx, dy);
    d.moving = len > 0.05;
    if (d.moving) {
      const amount =
          210 * settings.speed * dt * (game.emptyChair || game.wheelchair !== null ? 0.83 : 1),
        vx = (dx / len) * Math.min(amount, manual ? amount : len),
        vy = (dy / len) * Math.min(amount, manual ? amount : len);
      if (walkable(d.x + vx, d.y)) d.x += vx;
      if (walkable(d.x, d.y + vy)) d.y += vy;
      d.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      footTime += dt;
      if (footTime > 0.3) {
        audio.fx(
          game.wheelchair !== null ? 'wheel' : Math.floor(clock * 4) % 2 ? 'step-1' : 'step-2',
          0.13
        );
        footTime = 0;
      }
    }
    if (guidePending && clock >= guidePending.at && !audio.busy()) {
      say(guidePending.voice);
      guidePending = null;
    }
    if (!game.path.length && game.destination) {
      const action = game.destination;
      game.destination = null;
      action();
    }
    hudTime += dt;
    if (hudTime > 0.5) {
      hudTime = 0;
      const timer = $('#clinic-time');
      if (timer)
        timer.textContent = settings.patience
          ? formatTime(Math.max(0, game.level.duration - game.time))
          : '☀ No rush';
    }
  }
  if (game && W < 1200) {
    const target = Math.max(0, Math.min(1200 - W, game.doctor.x - W / 2));
    view.x = settings.reduced ? target : view.x + (target - view.x) * Math.min(1, dt * 8);
    syncHotspots();
  } else view.x = 0;
  // The map is hidden on menus and dimmed behind pop-ups: redraw it less often there.
  if (mode === 'playing' && (!modal || frame % 6 === 0)) drawHospital(ctx, game, t, view);
  const h = $('#hero');
  if (h) hero(h, t);
  requestAnimationFrame(tick);
}
$('#settings').innerHTML = ic('gear', 22);
$('#touch-interact').innerHTML = `${ic('hand', 30)}<small>Help</small>`;
updateSound();
switchScreen('menu');
resize();
requestAnimationFrame(tick);
