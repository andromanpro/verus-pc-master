// Презентация #1 «Компьютер изнутри — что и зачем»
// Стиль: Verus dark-neon, согласован с «Диагностика по шагам.pptx» и дашбордом
// Запуск: NODE_PATH="..." node 01-компьютер-изнутри.js
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');

// ================= СТИЛЬ =================
const BG          = '0d1424';
const BG_DARKER   = '0a1020';
const CARD_BG     = '0f1a2e';
const CARD_BORDER = '1b2740';

const CY    = '22d3ee'; // циан — основной
const MT    = '34d399'; // мята — позитив
const AM    = 'fbbf24'; // янтарь — внимание
const PU    = 'a855f7'; // фиолетовый
const RS    = 'fb7185'; // роза — предупреждение

const WHITE     = 'f8fafc';
const MUTED     = '94a3b8';
const SUBTLE    = '475569';

const FONT_HEADER = 'Arial Black';
const FONT_BODY   = 'Calibri';
const FONT_MONO   = 'Consolas';

// ================= SVG ИКОНКИ =================
// Минималистичные outline-иконки. currentColor заменится на конкретный hex при render.
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
    <line x1="22" y1="32" x2="22" y2="68"/>
    <line x1="36" y1="32" x2="36" y2="68"/>
    <line x1="50" y1="32" x2="50" y2="68"/>
    <line x1="64" y1="32" x2="64" y2="68"/>
    <line x1="78" y1="32" x2="78" y2="68"/>
    <line x1="20" y1="78" x2="35" y2="78" stroke-width="4"/>
    <line x1="45" y1="78" x2="55" y2="78" stroke-width="4"/>
    <line x1="65" y1="78" x2="80" y2="78" stroke-width="4"/>
  </svg>`,
  disk: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="14" y="22" width="72" height="56" rx="4"/>
    <line x1="14" y1="40" x2="86" y2="40"/>
    <line x1="14" y1="60" x2="86" y2="60"/>
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
    <circle cx="32" cy="53" r="11"/>
    <circle cx="32" cy="53" r="4" fill="currentColor"/>
    <circle cx="64" cy="53" r="11"/>
    <circle cx="64" cy="53" r="4" fill="currentColor"/>
    <line x1="8" y1="72" x2="14" y2="80" stroke-width="3"/>
    <line x1="20" y1="72" x2="26" y2="80" stroke-width="3"/>
    <line x1="74" y1="72" x2="80" y2="80" stroke-width="3"/>
    <line x1="86" y1="72" x2="92" y2="80" stroke-width="3"/>
  </svg>`,
  pc: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="14" y="18" width="72" height="48" rx="3"/>
    <line x1="14" y1="58" x2="86" y2="58"/>
    <line x1="38" y1="66" x2="38" y2="76"/>
    <line x1="62" y1="66" x2="62" y2="76"/>
    <line x1="30" y1="82" x2="70" y2="82"/>
  </svg>`,
  plug: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 30 10 L 30 38 L 50 58 L 50 78 L 70 78 L 70 58 L 90 38 L 90 10"/>
    <line x1="50" y1="78" x2="50" y2="90"/>
    <line x1="70" y1="78" x2="70" y2="90"/>
    <line x1="38" y1="10" x2="38" y2="20"/>
    <line x1="82" y1="10" x2="82" y2="20"/>
  </svg>`,
  rocket: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 50 10 Q 70 30 70 55 L 70 75 L 30 75 L 30 55 Q 30 30 50 10 Z"/>
    <circle cx="50" cy="42" r="6"/>
    <path d="M 30 60 L 18 80 L 28 76 M 70 60 L 82 80 L 72 76" />
    <path d="M 40 80 L 36 92 M 50 80 L 50 92 M 60 80 L 64 92"/>
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
};

// ================= УТИЛИТЫ =================
async function iconPng(name, color, size = 256) {
  const raw = ICONS[name];
  if (!raw) throw new Error('Unknown icon: ' + name);
  const colored = raw.replace(/currentColor/g, '#' + color);
  const buf = await sharp(Buffer.from(colored)).resize(size, size).png().toBuffer();
  return 'data:image/png;base64,' + buf.toString('base64');
}

// Фоновые декоративные «луны» — как в существующих презентациях
function addBgDecor(slide, pres) {
  // Тёмно-зелёный полукруг сверху-слева (mint с прозрачностью)
  slide.addShape(pres.shapes.OVAL, {
    x: -2.5, y: -2.5, w: 5, h: 5,
    fill: { color: MT, transparency: 92 }, line: { type: 'none' }
  });
  // Тёмно-фиолетовый круг внизу-справа
  slide.addShape(pres.shapes.OVAL, {
    x: 8.5, y: 4.5, w: 3, h: 3,
    fill: { color: RS, transparency: 90 }, line: { type: 'none' }
  });
}

// Заголовок-tag в углу слева сверху и счётчик справа
function addHeaderTag(slide, pres, tagText, num, total) {
  // Маленький квадрат-маркер
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 0.32, w: 0.14, h: 0.14,
    fill: { color: CY }, line: { type: 'none' }
  });
  // Тег '// текст'
  slide.addText('// ' + tagText, {
    x: 0.55, y: 0.22, w: 4, h: 0.35,
    fontSize: 11, fontFace: FONT_MONO, color: CY,
    align: 'left', valign: 'middle', margin: 0
  });
  // Счётчик
  slide.addText(String(num).padStart(2,'0') + ' / ' + String(total).padStart(2,'0'), {
    x: 8.7, y: 0.22, w: 1.05, h: 0.35,
    fontSize: 11, fontFace: FONT_MONO, color: MUTED,
    align: 'right', valign: 'middle', margin: 0
  });
}

// Заголовок слайда (крупный белый)
function addSlideTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x || 0.5, y: opts.y || 0.75, w: opts.w || 9, h: opts.h || 0.9,
    fontSize: opts.fontSize || 32, fontFace: FONT_HEADER, bold: true,
    color: WHITE, align: opts.align || 'left', valign: 'middle', margin: 0
  });
}

// ================= КАРТОЧКА (фон + иконка-кружок + заголовок + подпись) =================
async function addIconCard(slide, pres, opts) {
  const { x, y, w, h, icon, iconColor, title, subtitle } = opts;
  // Фон карточки
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.08
  });
  // Иконка в круге
  const iconSize = 0.55;
  const iconX = x + (w - iconSize) / 2;
  const iconY = y + 0.15;
  slide.addShape(pres.shapes.OVAL, {
    x: iconX - 0.06, y: iconY - 0.06, w: iconSize + 0.12, h: iconSize + 0.12,
    fill: { color: BG_DARKER }, line: { color: iconColor, width: 1.5 }
  });
  const pngData = await iconPng(icon, iconColor);
  slide.addImage({ data: pngData, x: iconX, y: iconY, w: iconSize, h: iconSize });
  // Заголовок карточки
  slide.addText(title, {
    x: x + 0.1, y: y + 0.85, w: w - 0.2, h: 0.35,
    fontSize: 15, fontFace: FONT_BODY, bold: true,
    color: WHITE, align: 'center', valign: 'middle', margin: 0
  });
  // Подпись
  slide.addText(subtitle, {
    x: x + 0.2, y: y + 1.18, w: w - 0.4, h: h - 1.25,
    fontSize: 11, fontFace: FONT_BODY,
    color: MUTED, align: 'center', valign: 'top', margin: 0,
    paraSpaceAfter: 2
  });
}

// «Большая» карточка одного компонента — для слайдов-деталей
async function addBigDetailCard(slide, pres, opts) {
  const { x, y, w, h, icon, iconColor, title, body } = opts;
  // Фон
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.1
  });
  // Иконка крупно слева
  const iconSize = 1.5;
  slide.addShape(pres.shapes.OVAL, {
    x: x + 0.35, y: y + (h - iconSize - 0.2) / 2, w: iconSize + 0.2, h: iconSize + 0.2,
    fill: { color: BG_DARKER }, line: { color: iconColor, width: 2 }
  });
  const png = await iconPng(icon, iconColor, 384);
  slide.addImage({ data: png, x: x + 0.45, y: y + (h - iconSize) / 2, w: iconSize, h: iconSize });
  // Заголовок
  slide.addText(title, {
    x: x + 2.4, y: y + 0.25, w: w - 2.6, h: 0.55,
    fontSize: 22, fontFace: FONT_HEADER, bold: true, color: WHITE,
    align: 'left', valign: 'middle', margin: 0
  });
  // Тело
  slide.addText(body, {
    x: x + 2.4, y: y + 0.88, w: w - 2.6, h: h - 1.0,
    fontSize: 13, fontFace: FONT_BODY, color: MUTED,
    align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 5
  });
}

// Финальный «вывод»-плашка с акцентной каймой
function addBottomCallout(slide, pres, text, color = CY) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.88, w: 9, h: 0.55,
    fill: { color: BG_DARKER }, line: { color: color, width: 1.5 }, rectRadius: 0.08
  });
  slide.addText(text, {
    x: 0.6, y: 4.88, w: 8.8, h: 0.55,
    fontSize: 13, fontFace: FONT_BODY, bold: true, color: WHITE,
    align: 'center', valign: 'middle', margin: 0
  });
}

// ================= СБОРКА ПРЕЗЕНТАЦИИ =================
(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 10" × 5.625"
  pres.author = 'Verus';
  pres.title = 'Компьютер изнутри — что и зачем';
  pres.subject = 'Урок 1 курса «Мастер ПК»';

  const TOTAL = 10;

  // ---------- Слайд 1 · Титул ----------
  let s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'обучение', 1, TOTAL);

  s.addText('КУРС ПК-МАСТЕРА · УРОК 1', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: FONT_MONO, charSpacing: 6, color: CY,
    align: 'left', valign: 'middle', margin: 0
  });
  addSlideTitle(s, 'Компьютер\nизнутри', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 56
  });
  s.addText('Что внутри и зачем оно нужно. Чтобы чинить — сначала пойми устройство.', {
    x: 0.5, y: 4.2, w: 6, h: 0.55,
    fontSize: 14, fontFace: FONT_BODY, color: MUTED,
    align: 'left', valign: 'middle', margin: 0
  });

  // Большая иконка ПК справа (с запасом по правому краю)
  s.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 1.55, w: 2.7, h: 2.7,
    fill: { color: BG_DARKER }, line: { color: CY, width: 2 }
  });
  const titlePng = await iconPng('pc', CY, 512);
  s.addImage({ data: titlePng, x: 6.78, y: 1.93, w: 1.95, h: 1.95 });

  // ---------- Слайд 2 · Главные части ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'из чего состоит', 2, TOTAL);
  addSlideTitle(s, 'Главные части ПК');

  const parts = [
    { icon: 'cpu',  color: CY, title: 'Процессор (CPU)',  subtitle: 'Мозг — считает' },
    { icon: 'ram',  color: MT, title: 'Память (RAM)',     subtitle: 'Рабочий стол' },
    { icon: 'disk', color: AM, title: 'Накопитель',       subtitle: 'Где всё хранится' },
    { icon: 'mobo', color: PU, title: 'Материнская плата',subtitle: 'Связь всего' },
    { icon: 'power', color: RS, title: 'Блок питания',    subtitle: 'Электричество' },
    { icon: 'gpu',  color: CY, title: 'Видеокарта (GPU)', subtitle: 'Картинка на экран' },
  ];
  const cardW = 2.85, cardH = 1.5, gap = 0.15;
  const startX = (10 - (cardW * 3 + gap * 2)) / 2;
  const startY = 1.7;
  for (let i = 0; i < parts.length; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    await addIconCard(s, pres, {
      x: startX + col * (cardW + gap), y: startY + row * (cardH + gap),
      w: cardW, h: cardH,
      icon: parts[i].icon, iconColor: parts[i].color,
      title: parts[i].title, subtitle: parts[i].subtitle
    });
  }

  // ---------- Слайд 3 · Процессор ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'процессор', 3, TOTAL);
  addSlideTitle(s, 'Процессор — мозг компьютера');

  await addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'cpu', iconColor: CY,
    title: 'CPU — что считает скорость',
    body: 'Всё, что ты делаешь на ПК, считает процессор. Открыл браузер, играешь, монтируешь видео — он работает.\n\nНа что смотреть (сегодня норма — 6-8 ядер, 3-4 ГГц):\n· Сколько ядер (4 / 6 / 8) — столько задач может идти параллельно\n· Частота в ГГц (например 3.5) — насколько быстро каждое ядро'
  });
  addBottomCallout(s, pres, 'Чем больше ядер и выше частота — тем больше задач сразу и тем быстрее каждая.', CY);

  // ---------- Слайд 4 · Память (RAM) ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'оперативная память', 4, TOTAL);
  addSlideTitle(s, 'Память (RAM) — рабочий стол');

  await addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'ram', iconColor: MT,
    title: 'Где живут открытые программы',
    body: 'Представь стол. Каждая открытая программа раскладывает на нём свои бумаги. Чем больше стол — тем больше держится открытым сразу.\n\nСколько нужно сегодня:\n· 8 ГБ — минимум для офиса и интернета\n· 16 ГБ — комфортно для всего обычного\n· 32 ГБ и больше — игры, монтаж, тяжёлая работа'
  });
  addBottomCallout(s, pres, 'Мало памяти = ПК тупит при открытии нескольких программ. Это первое что апгрейдят.', MT);

  // ---------- Слайд 5 · Накопители ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'накопители', 5, TOTAL);
  addSlideTitle(s, 'Диски — куда сохраняется всё');

  // Три карточки в ряд: HDD / SSD / NVMe
  const disks = [
    { icon: 'disk', color: RS, title: 'HDD', desc: 'Жёсткий диск с крутящимися блинами внутри. Дешёвый, но медленный. На 2026 — устаревший для системного диска.' },
    { icon: 'disk', color: AM, title: 'SSD (SATA)', desc: 'Без движущихся частей. В 5-10 раз быстрее HDD. Стоит примерно столько же. Хороший вариант под Windows и программы.' },
    { icon: 'disk', color: MT, title: 'NVMe (M.2)', desc: 'Самый быстрый. Прямо на материнке, без проводов. В 5 раз быстрее SATA SSD. Стандарт для новых ПК сегодня.' },
  ];
  for (let i = 0; i < disks.length; i++) {
    const w = 2.85, h = 2.6, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.8) / 2 - 0.05, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: BG_DARKER }, line: { color: disks[i].color, width: 1.5 }
    });
    const png = await iconPng(disks[i].icon, disks[i].color);
    s.addImage({ data: png, x: x + (w - 0.8) / 2, y: 2.10, w: 0.8, h: 0.8 });
    s.addText(disks[i].title, {
      x: x + 0.1, y: 3.05, w: w - 0.2, h: 0.4,
      fontSize: 22, fontFace: FONT_HEADER, bold: true, color: WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(disks[i].desc, {
      x: x + 0.22, y: 3.5, w: w - 0.44, h: 1.05,
      fontSize: 12, fontFace: FONT_BODY, color: MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 4
    });
  }
  addBottomCallout(s, pres, 'Замена HDD на SSD — самый заметный апгрейд для старого ПК.', AM);

  // ---------- Слайд 6 · Материнка ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'материнская плата', 6, TOTAL);
  addSlideTitle(s, 'Материнка — связь всего');

  await addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'mobo', iconColor: PU,
    title: 'Дорожки и разъёмы',
    body: 'Сама по себе материнка ничего не делает. Её задача — соединить все компоненты и дать им питание.\n\nЧто на ней находится:\n· Сокет — куда вставляется процессор. У Intel свои сокеты, у AMD — свои.\n· Слоты памяти (обычно 2 или 4 планки), слот M.2 для NVMe, разъёмы SATA'
  });
  addBottomCallout(s, pres, 'Поменять процессор Intel на AMD = и материнку тоже менять. Сокеты разные.', PU);

  // ---------- Слайд 7 · Блок питания ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'блок питания', 7, TOTAL);
  addSlideTitle(s, 'Блок питания — электричество');

  await addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'power', iconColor: AM,
    title: 'БП — блок питания',
    body: 'Из розетки идёт 220 вольт переменного тока. Компонентам нужны 12 и 5 вольт постоянного тока. БП переводит одно в другое.\n\nДве важные характеристики:\n· Мощность в ваттах. Офисный ПК — 400 Вт хватает, игровой — 650-850 Вт.\n· Сертификат 80+ (Bronze, Silver, Gold) — насколько эффективно работает. Минимум Bronze, лучше Gold.'
  });
  addBottomCallout(s, pres, 'Дешёвый БП может убить остальное железо при поломке. Не экономь на нём.', AM);

  // ---------- Слайд 8 · Видеокарта ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'видеокарта', 8, TOTAL);
  addSlideTitle(s, 'Видеокарта — рисует картинку');

  // Две колонки: встроенная vs дискретная
  const gpuTypes = [
    { title: 'Встроенная', color: MT, body: 'Внутри процессора (Intel UHD, AMD Vega). Питается от него же. Идёт с CPU бесплатно.\n\nХватает для:\n· Офис, браузер, видео\n· Лёгкие старые игры\n· 1-2 монитора\n\nНе тянет современные игры и монтаж в 4K.' },
    { title: 'Дискретная', color: PU, body: 'Отдельная плата (NVIDIA RTX, AMD Radeon). Своя память VRAM (8-24 ГБ). Своё охлаждение.\n\nНужна для:\n· Современных игр\n· Монтажа видео, 3D\n· Нейросетей\n\nМинус — цена. От 20 тыс. ₽.' },
  ];
  for (let i = 0; i < gpuTypes.length; i++) {
    const w = 4.3, h = 2.85, gap = 0.4;
    const startX = (10 - (w * 2 + gap)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.3, y: 2.05, w: 0.8, h: 0.8,
      fill: { color: BG_DARKER }, line: { color: gpuTypes[i].color, width: 1.5 }
    });
    const png = await iconPng('gpu', gpuTypes[i].color);
    s.addImage({ data: png, x: x + 0.4, y: 2.13, w: 0.6, h: 0.6 });
    s.addText(gpuTypes[i].title, {
      x: x + 1.2, y: 2.05, w: w - 1.4, h: 0.5,
      fontSize: 22, fontFace: FONT_HEADER, bold: true, color: WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(gpuTypes[i].body, {
      x: x + 0.3, y: 2.9, w: w - 0.5, h: h - 1.15,
      fontSize: 12, fontFace: FONT_BODY, color: MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 4
    });
  }
  addBottomCallout(s, pres, 'Нужна видеокарта или нет — зависит от задач: офис — встроенной хватит, игры и монтаж — нужна дискретная.', PU);

  // ---------- Слайд 9 · Что куда подключается ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'разъёмы и периферия', 9, TOTAL);
  addSlideTitle(s, 'Что куда подключается');

  const ports = [
    { icon: 'pc',   color: CY, title: 'Монитор',          desc: 'HDMI, DisplayPort, VGA (старый), DVI' },
    { icon: 'list', color: MT, title: 'Клавиатура и мышь',desc: 'USB-A / USB-C, реже Bluetooth' },
    { icon: 'plug', color: AM, title: 'Зарядка',          desc: 'Кабель в БП (стационар) или адаптер (ноут)' },
    { icon: 'disk', color: PU, title: 'Флешки и диски',   desc: 'USB-A, USB-C — внешние накопители' },
    { icon: 'bolt', color: RS, title: 'Сеть',             desc: 'RJ45 (Ethernet) и Wi-Fi (без проводов)' },
    { icon: 'gpu',  color: CY, title: 'Наушники / звук',  desc: 'Зелёный разъём 3.5 мм или USB / Bluetooth' },
  ];
  const pW = 2.85, pH = 1.3, pGap = 0.15;
  const pStartX = (10 - (pW * 3 + pGap * 2)) / 2;
  const pStartY = 1.85;
  for (let i = 0; i < ports.length; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = pStartX + col * (pW + pGap), y = pStartY + row * (pH + pGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: pW, h: pH,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: y + 0.35, w: 0.6, h: 0.6,
      fill: { color: BG_DARKER }, line: { color: ports[i].color, width: 1.5 }
    });
    const png = await iconPng(ports[i].icon, ports[i].color);
    s.addImage({ data: png, x: x + 0.28, y: y + 0.42, w: 0.46, h: 0.46 });
    s.addText(ports[i].title, {
      x: x + 0.9, y: y + 0.2, w: pW - 1.0, h: 0.4,
      fontSize: 14, fontFace: FONT_BODY, bold: true, color: WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(ports[i].desc, {
      x: x + 0.9, y: y + 0.6, w: pW - 1.0, h: 0.6,
      fontSize: 11, fontFace: FONT_BODY, color: MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  addBottomCallout(s, pres, 'Важно: USB-C — новый стандарт, USB-A — старый. У новых ноутов часто только USB-C, у старых ПК — только USB-A.', CY);

  // ---------- Слайд 10 · Финал · 3 правила сборщика ----------
  s = pres.addSlide();
  s.background = { color: BG };
  addBgDecor(s, pres);
  addHeaderTag(s, pres, 'итог', 10, TOTAL);
  addSlideTitle(s, 'Перед разборкой — 3 правила');

  const rules = [
    { icon: 'shield', color: CY, title: 'Выключи и отсоедини', desc: 'Все провода — из розетки. Дождись пока всё остынет. На ноуте — вытащи батарею если съёмная.' },
    { icon: 'bolt',   color: AM, title: 'Сними статику', desc: 'Дотронься до металла (батарея, корпус). Лучше — антистатический браслет. Иначе убьёшь компоненты.' },
    { icon: 'list',   color: MT, title: 'Сфотографируй ДО', desc: 'Каждый разъём, каждый винт. Через час забудешь куда что было. Фото — твой план сборки.' },
  ];
  for (let i = 0; i < rules.length; i++) {
    const w = 2.85, h = 2.6, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: BG_DARKER }, line: { color: rules[i].color, width: 1.5 }
    });
    const png = await iconPng(rules[i].icon, rules[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(rules[i].title, {
      x: x + 0.15, y: 3.1, w: w - 0.3, h: 0.4,
      fontSize: 17, fontFace: FONT_BODY, bold: true, color: WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(rules[i].desc, {
      x: x + 0.25, y: 3.55, w: w - 0.5, h: 0.85,
      fontSize: 12, fontFace: FONT_BODY, color: MUTED,
      align: 'center', valign: 'top', margin: 0, paraSpaceAfter: 4
    });
  }
  addBottomCallout(s, pres, 'Сначала пойми устройство — потом ремонтируй. Спешка убивает компоненты и нервы.', MT);

  // ---------- Сохраняем ----------
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '01-Компьютер изнутри.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });
