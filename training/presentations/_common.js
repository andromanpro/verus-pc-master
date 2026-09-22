// Общий стиль Verus для презентаций курса «Мастер ПК».
// Используется в 01-..., 02-..., ... — единый цвет/типографика/компоненты.
'use strict';

const sharp = require('sharp');

// ================= СТИЛЬ =================
const BG          = '0d1424';
const BG_DARKER   = '0a1020';
const CARD_BG     = '0f1a2e';
const CARD_BORDER = '1b2740';

const CY    = '22d3ee'; // циан — основной
const MT    = '34d399'; // мята — позитив / правильно
const AM    = 'fbbf24'; // янтарь — внимание
const PU    = 'a855f7'; // фиолетовый
const RS    = 'fb7185'; // роза — предупреждение

const WHITE = 'f8fafc';
const MUTED = '94a3b8';

const FONT_HEADER = 'Arial Black';
const FONT_BODY   = 'Calibri';
const FONT_MONO   = 'Consolas';

// ================= БИБЛИОТЕКА ИКОНОК =================
// Минималистичные outline-иконки. `currentColor` заменяется на hex при render.
const ICONS = {
  cpu: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="22" y="22" width="56" height="56" rx="4"/>
    <rect x="36" y="36" width="28" height="28" fill="currentColor" stroke="none"/>
    <line x1="34" y1="10" x2="34" y2="22"/><line x1="50" y1="10" x2="50" y2="22"/><line x1="66" y1="10" x2="66" y2="22"/>
    <line x1="34" y1="78" x2="34" y2="90"/><line x1="50" y1="78" x2="50" y2="90"/><line x1="66" y1="78" x2="66" y2="90"/>
    <line x1="10" y1="34" x2="22" y2="34"/><line x1="10" y1="50" x2="22" y2="50"/><line x1="10" y1="66" x2="22" y2="66"/>
    <line x1="78" y1="34" x2="90" y2="34"/><line x1="78" y1="50" x2="90" y2="50"/><line x1="78" y1="66" x2="90" y2="66"/>
  </svg>`,
  ram: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="32" width="80" height="36" rx="3"/>
    <line x1="22" y1="32" x2="22" y2="68"/><line x1="36" y1="32" x2="36" y2="68"/>
    <line x1="50" y1="32" x2="50" y2="68"/><line x1="64" y1="32" x2="64" y2="68"/>
    <line x1="78" y1="32" x2="78" y2="68"/>
    <line x1="20" y1="78" x2="35" y2="78" stroke-width="4"/>
    <line x1="45" y1="78" x2="55" y2="78" stroke-width="4"/>
    <line x1="65" y1="78" x2="80" y2="78" stroke-width="4"/>
  </svg>`,
  disk: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="14" y="22" width="72" height="56" rx="4"/>
    <line x1="14" y1="40" x2="86" y2="40"/><line x1="14" y1="60" x2="86" y2="60"/>
    <circle cx="74" cy="30" r="3" fill="currentColor"/>
    <circle cx="74" cy="50" r="3" fill="currentColor"/>
    <circle cx="74" cy="70" r="3" fill="currentColor"/>
  </svg>`,
  mobo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="10" width="80" height="80" rx="3"/>
    <rect x="22" y="22" width="28" height="28" rx="2"/>
    <rect x="58" y="22" width="20" height="56" rx="1" fill="currentColor" stroke="none"/>
    <rect x="22" y="58" width="28" height="20" rx="1"/>
    <line x1="60" y1="30" x2="76" y2="30" stroke-width="2"/>
    <line x1="60" y1="38" x2="76" y2="38" stroke-width="2"/>
    <line x1="60" y1="46" x2="76" y2="46" stroke-width="2"/>
  </svg>`,
  power: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 55 12 L 30 56 L 50 56 L 45 88 L 70 44 L 50 44 Z" fill="currentColor"/>
  </svg>`,
  gpu: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="34" width="84" height="38" rx="3"/>
    <circle cx="32" cy="53" r="11"/><circle cx="32" cy="53" r="4" fill="currentColor"/>
    <circle cx="64" cy="53" r="11"/><circle cx="64" cy="53" r="4" fill="currentColor"/>
    <line x1="8" y1="72" x2="14" y2="80" stroke-width="3"/>
    <line x1="20" y1="72" x2="26" y2="80" stroke-width="3"/>
    <line x1="74" y1="72" x2="80" y2="80" stroke-width="3"/>
    <line x1="86" y1="72" x2="92" y2="80" stroke-width="3"/>
  </svg>`,
  pc: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="14" y="18" width="72" height="48" rx="3"/>
    <line x1="14" y1="58" x2="86" y2="58"/>
    <line x1="38" y1="66" x2="38" y2="76"/><line x1="62" y1="66" x2="62" y2="76"/>
    <line x1="30" y1="82" x2="70" y2="82"/>
  </svg>`,
  plug: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 30 10 L 30 38 L 50 58 L 50 78 L 70 78 L 70 58 L 90 38 L 90 10"/>
    <line x1="50" y1="78" x2="50" y2="90"/><line x1="70" y1="78" x2="70" y2="90"/>
    <line x1="38" y1="10" x2="38" y2="20"/><line x1="82" y1="10" x2="82" y2="20"/>
  </svg>`,
  shield: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 50 10 L 18 22 L 18 50 Q 18 78 50 90 Q 82 78 82 50 L 82 22 Z"/>
    <path d="M 36 50 L 46 60 L 66 40" stroke-width="7"/>
  </svg>`,
  bolt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
    <path d="M 60 8 L 22 56 L 48 56 L 38 92 L 76 44 L 50 44 L 60 8 Z"/>
  </svg>`,
  list: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="22" cy="28" r="5" fill="currentColor"/>
    <line x1="38" y1="28" x2="82" y2="28"/>
    <circle cx="22" cy="50" r="5" fill="currentColor"/>
    <line x1="38" y1="50" x2="82" y2="50"/>
    <circle cx="22" cy="72" r="5" fill="currentColor"/>
    <line x1="38" y1="72" x2="82" y2="72"/>
  </svg>`,
  // Дополнительные иконки для остальных уроков:
  thermo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 42 12 Q 42 6 50 6 Q 58 6 58 12 L 58 62 Q 68 70 68 80 Q 68 92 50 92 Q 32 92 32 80 Q 32 70 42 62 Z"/>
    <circle cx="50" cy="80" r="8" fill="currentColor"/>
    <line x1="62" y1="22" x2="72" y2="22"/>
    <line x1="62" y1="34" x2="72" y2="34"/>
    <line x1="62" y1="46" x2="72" y2="46"/>
  </svg>`,
  bsod: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="14" width="80" height="60" rx="3" fill="currentColor" stroke="none" opacity="0.18"/>
    <rect x="10" y="14" width="80" height="60" rx="3"/>
    <text x="50" y="44" font-family="Arial Black" font-size="32" fill="currentColor" text-anchor="middle" stroke="none">:(</text>
    <line x1="20" y1="56" x2="80" y2="56" stroke-width="3"/>
    <line x1="38" y1="80" x2="38" y2="86"/>
    <line x1="62" y1="80" x2="62" y2="86"/>
    <line x1="30" y1="92" x2="70" y2="92"/>
  </svg>`,
  warn: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 50 10 L 92 84 L 8 84 Z"/>
    <line x1="50" y1="40" x2="50" y2="64" stroke-width="8"/>
    <circle cx="50" cy="76" r="4" fill="currentColor"/>
  </svg>`,
  check: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="40"/>
    <path d="M 30 52 L 44 66 L 70 38"/>
  </svg>`,
  cross: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="40"/>
    <line x1="32" y1="32" x2="68" y2="68"/>
    <line x1="68" y1="32" x2="32" y2="68"/>
  </svg>`,
  question: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="40"/>
    <path d="M 36 38 Q 36 24 50 24 Q 64 24 64 38 Q 64 48 54 52 Q 50 54 50 64"/>
    <circle cx="50" cy="76" r="3.5" fill="currentColor"/>
  </svg>`,
  clock: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="40"/>
    <line x1="50" y1="24" x2="50" y2="50"/>
    <line x1="50" y1="50" x2="70" y2="60"/>
    <circle cx="50" cy="50" r="3.5" fill="currentColor"/>
  </svg>`,
  search: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="44" cy="44" r="26"/>
    <line x1="64" y1="64" x2="86" y2="86" stroke-width="8"/>
  </svg>`,
  file: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 24 8 L 64 8 L 80 24 L 80 92 L 24 92 Z"/>
    <path d="M 62 8 L 62 26 L 80 26"/>
    <line x1="36" y1="46" x2="68" y2="46"/>
    <line x1="36" y1="60" x2="68" y2="60"/>
    <line x1="36" y1="74" x2="56" y2="74"/>
  </svg>`,
  cooler: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="36"/>
    <path d="M 50 50 Q 50 18 70 32 Q 82 50 50 50 Q 50 82 30 68 Q 18 50 50 50 Q 18 50 30 32 Q 50 18 50 50 Q 82 50 70 68 Q 50 82 50 50" fill="currentColor" stroke="none" opacity="0.6"/>
    <circle cx="50" cy="50" r="6" fill="currentColor"/>
  </svg>`,
  rocket: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 50 8 Q 70 28 70 54 L 70 76 L 30 76 L 30 54 Q 30 28 50 8 Z"/>
    <circle cx="50" cy="40" r="7"/>
    <path d="M 30 62 L 16 78 L 28 76 M 70 62 L 84 78 L 72 76"/>
    <path d="M 40 80 L 36 92 M 50 80 L 50 92 M 60 80 L 64 92"/>
  </svg>`,
  terminal: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="18" width="80" height="64" rx="3"/>
    <line x1="10" y1="32" x2="90" y2="32"/>
    <circle cx="20" cy="25" r="2" fill="currentColor"/>
    <circle cx="28" cy="25" r="2" fill="currentColor"/>
    <circle cx="36" cy="25" r="2" fill="currentColor"/>
    <path d="M 22 48 L 32 56 L 22 64" stroke-width="5"/>
    <line x1="40" y1="64" x2="62" y2="64" stroke-width="4"/>
  </svg>`,
  key: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="32" cy="50" r="20"/>
    <circle cx="32" cy="50" r="6" fill="currentColor"/>
    <line x1="52" y1="50" x2="90" y2="50"/>
    <line x1="74" y1="50" x2="74" y2="62"/>
    <line x1="84" y1="50" x2="84" y2="64"/>
  </svg>`,
  usb: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="36" y="10" width="28" height="50" rx="2"/>
    <rect x="42" y="20" width="6" height="6" fill="currentColor" stroke="none"/>
    <rect x="52" y="20" width="6" height="6" fill="currentColor" stroke="none"/>
    <line x1="50" y1="60" x2="50" y2="76"/>
    <circle cx="50" cy="84" r="6"/>
  </svg>`,
  back: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="40"/>
    <path d="M 60 30 Q 36 30 28 50 Q 36 70 60 70"/>
    <path d="M 35 40 L 25 50 L 35 60"/>
  </svg>`,
  install: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 50 14 L 50 62"/>
    <path d="M 32 46 L 50 64 L 68 46"/>
    <path d="M 18 76 L 18 88 L 82 88 L 82 76"/>
  </svg>`,
  flame: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 50 8 Q 38 22 42 38 Q 32 32 28 48 Q 22 64 32 76 Q 42 90 50 92 Q 58 90 68 76 Q 78 64 72 48 Q 68 34 60 38 Q 54 22 50 8 Z" fill="currentColor" stroke="none" opacity="0.85"/>
  </svg>`,
  router: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="14" y="46" width="72" height="32" rx="3"/>
    <line x1="24" y1="46" x2="24" y2="28" stroke-width="4"/>
    <line x1="50" y1="46" x2="50" y2="22" stroke-width="4"/>
    <line x1="76" y1="46" x2="76" y2="28" stroke-width="4"/>
    <circle cx="24" cy="22" r="3" fill="currentColor"/>
    <circle cx="50" cy="16" r="3" fill="currentColor"/>
    <circle cx="76" cy="22" r="3" fill="currentColor"/>
    <circle cx="28" cy="62" r="2.5" fill="currentColor"/>
    <circle cx="40" cy="62" r="2.5" fill="currentColor"/>
    <circle cx="52" cy="62" r="2.5" fill="currentColor"/>
    <rect x="64" y="58" width="14" height="8" rx="1" fill="currentColor" stroke="none"/>
  </svg>`,
  globe: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="40"/>
    <ellipse cx="50" cy="50" rx="18" ry="40"/>
    <line x1="10" y1="50" x2="90" y2="50"/>
    <path d="M 14 32 Q 50 22 86 32 M 14 68 Q 50 78 86 68"/>
  </svg>`,
  lock: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="22" y="44" width="56" height="44" rx="4"/>
    <path d="M 32 44 L 32 32 Q 32 14 50 14 Q 68 14 68 32 L 68 44"/>
    <circle cx="50" cy="62" r="5" fill="currentColor"/>
    <line x1="50" y1="67" x2="50" y2="76"/>
  </svg>`,
  filter: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 12 14 L 88 14 L 60 50 L 60 86 L 40 76 L 40 50 Z"/>
  </svg>`,
  pause: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="40"/>
    <rect x="36" y="32" width="8" height="36" fill="currentColor" stroke="none" rx="1"/>
    <rect x="56" y="32" width="8" height="36" fill="currentColor" stroke="none" rx="1"/>
  </svg>`,
  play: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="40"/>
    <path d="M 40 30 L 70 50 L 40 70 Z" fill="currentColor"/>
  </svg>`,
};

async function iconPng(name, color, size = 256) {
  const raw = ICONS[name];
  if (!raw) throw new Error('Unknown icon: ' + name);
  const colored = raw.replace(/currentColor/g, '#' + color);
  const buf = await sharp(Buffer.from(colored)).resize(size, size).png().toBuffer();
  return 'data:image/png;base64,' + buf.toString('base64');
}

// ================= КОМПОНЕНТЫ СЛАЙДА =================
function addBgDecor(slide, pres) {
  slide.addShape(pres.shapes.OVAL, {
    x: -2.5, y: -2.5, w: 5, h: 5,
    fill: { color: MT, transparency: 92 }, line: { type: 'none' }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 8.5, y: 4.5, w: 3, h: 3,
    fill: { color: RS, transparency: 90 }, line: { type: 'none' }
  });
}

function addHeaderTag(slide, pres, tagText, num, total) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 0.32, w: 0.14, h: 0.14,
    fill: { color: CY }, line: { type: 'none' }
  });
  slide.addText('// ' + tagText, {
    x: 0.55, y: 0.22, w: 4, h: 0.35,
    fontSize: 11, fontFace: FONT_MONO, color: CY,
    align: 'left', valign: 'middle', margin: 0
  });
  slide.addText(String(num).padStart(2,'0') + ' / ' + String(total).padStart(2,'0'), {
    x: 8.7, y: 0.22, w: 1.05, h: 0.35,
    fontSize: 11, fontFace: FONT_MONO, color: MUTED,
    align: 'right', valign: 'middle', margin: 0
  });
}

function addSlideTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x || 0.5, y: opts.y || 0.75, w: opts.w || 9, h: opts.h || 0.9,
    fontSize: opts.fontSize || 32, fontFace: FONT_HEADER, bold: true,
    color: WHITE, align: opts.align || 'left', valign: 'middle', margin: 0, fit: 'shrink'
  });
}

// Карточка: иконка-сверху по центру + заголовок + подпись (для маленьких карточек)
async function addIconCard(slide, pres, opts) {
  const { x, y, w, h, icon, iconColor, title, subtitle } = opts;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.08
  });
  const iconSize = 0.55;
  const iconX = x + (w - iconSize) / 2;
  const iconY = y + 0.15;
  slide.addShape(pres.shapes.OVAL, {
    x: iconX - 0.06, y: iconY - 0.06, w: iconSize + 0.12, h: iconSize + 0.12,
    fill: { color: BG_DARKER }, line: { color: iconColor, width: 1.5 }
  });
  const pngData = await iconPng(icon, iconColor);
  slide.addImage({ data: pngData, x: iconX, y: iconY, w: iconSize, h: iconSize });
  slide.addText(title, {
    x: x + 0.1, y: y + 0.85, w: w - 0.2, h: 0.35,
    fontSize: 15, fontFace: FONT_BODY, bold: true,
    color: WHITE, align: 'center', valign: 'middle', margin: 0, fit: 'shrink'
  });
  slide.addText(subtitle, {
    x: x + 0.2, y: y + 1.18, w: w - 0.4, h: h - 1.25,
    fontSize: 11, fontFace: FONT_BODY,
    color: MUTED, align: 'center', valign: 'top', margin: 0, paraSpaceAfter: 2, fit: 'shrink'
  });
}

// Большая карточка: иконка слева + заголовок + body (для слайдов-деталей)
async function addBigDetailCard(slide, pres, opts) {
  const { x, y, w, h, icon, iconColor, title, body } = opts;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.1
  });
  const iconSize = 1.5;
  slide.addShape(pres.shapes.OVAL, {
    x: x + 0.35, y: y + (h - iconSize - 0.2) / 2, w: iconSize + 0.2, h: iconSize + 0.2,
    fill: { color: BG_DARKER }, line: { color: iconColor, width: 2 }
  });
  const png = await iconPng(icon, iconColor, 384);
  slide.addImage({ data: png, x: x + 0.45, y: y + (h - iconSize) / 2, w: iconSize, h: iconSize });
  slide.addText(title, {
    x: x + 2.4, y: y + 0.25, w: w - 2.6, h: 0.55,
    fontSize: 22, fontFace: FONT_HEADER, bold: true, color: WHITE,
    align: 'left', valign: 'middle', margin: 0, fit: 'shrink'
  });
  slide.addText(body, {
    x: x + 2.4, y: y + 0.88, w: w - 2.6, h: h - 1.0,
    fontSize: 13, fontFace: FONT_BODY, color: MUTED,
    align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 5, fit: 'shrink'
  });
}

// Финальная плашка-«вывод» внизу
function addBottomCallout(slide, pres, text, color) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.88, w: 9, h: 0.55,
    fill: { color: BG_DARKER }, line: { color: color || CY, width: 1.5 }, rectRadius: 0.08
  });
  slide.addText(text, {
    x: 0.6, y: 4.88, w: 8.8, h: 0.55,
    fontSize: 13, fontFace: FONT_BODY, bold: true, color: WHITE,
    align: 'center', valign: 'middle', margin: 0, fit: 'shrink'
  });
}

module.exports = {
  // colors
  BG, BG_DARKER, CARD_BG, CARD_BORDER,
  CY, MT, AM, PU, RS, WHITE, MUTED,
  // fonts
  FONT_HEADER, FONT_BODY, FONT_MONO,
  // icons
  ICONS, iconPng,
  // components
  addBgDecor, addHeaderTag, addSlideTitle,
  addIconCard, addBigDetailCard, addBottomCallout,
};
