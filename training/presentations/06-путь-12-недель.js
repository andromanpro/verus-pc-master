// Презентация #6 «Путь ПК-мастера — план на 12 недель»
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'Путь ПК-мастера — 12 недель';
  pres.subject = 'Обзорная презентация курса';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'обзор курса', 1, TOTAL);

  s.addText('КУРС ПК-МАСТЕРА · ПЛАН ОБУЧЕНИЯ', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Путь мастера\n12 недель', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 44
  });
  s.addText('От «что внутри ПК» до первого платного клиента. План по неделям — каждая со своей темой, практикой и проверкой.', {
    x: 0.5, y: 4.1, w: 6, h: 0.7,
    fontSize: 14, fontFace: S.FONT_BODY, color: S.MUTED,
    align: 'left', valign: 'middle', margin: 0
  });

  s.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 1.55, w: 2.7, h: 2.7,
    fill: { color: S.BG_DARKER }, line: { color: S.CY, width: 2 }
  });
  const titlePng = await S.iconPng('rocket', S.CY, 512);
  s.addImage({ data: titlePng, x: 6.85, y: 2.0, w: 1.8, h: 1.8 });

  // ============ 2 · ЧТО БУДЕТ ЧЕРЕЗ 12 НЕДЕЛЬ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'цель', 2, TOTAL);
  S.addSlideTitle(s, 'Что ты сможешь через 12 недель');

  const goals = [
    { icon: 'check', color: S.MT, title: 'Разбираешь ПК',     desc: 'Спокойно открываешь системник и ноут, не боишься компонентов.' },
    { icon: 'check', color: S.CY, title: 'Ставишь Windows',    desc: 'С нуля, с драйверами и нужными программами. За 1-2 часа.' },
    { icon: 'check', color: S.AM, title: 'Видишь причину',     desc: 'По симптому понимаешь что вероятно сломано. Берёшь нужный инструмент.' },
    { icon: 'check', color: S.PU, title: 'Решаешь типовое',    desc: 'Вирусы, медленный ПК, перегрев, замена SSD. Самые частые жалобы.' },
    { icon: 'check', color: S.RS, title: 'Знаешь когда не браться', desc: 'Честно говоришь клиенту «не возьмусь» и направляешь в лабораторию.' },
    { icon: 'check', color: S.MT, title: 'Работаешь легально',  desc: 'Самозанятый, акты приёмки, гарантия 14 дней.' },
  ];
  const gW = 2.9, gH = 1.4, gGap = 0.12;
  const gStartX = (10 - (gW * 3 + gGap * 2)) / 2;
  for (let i = 0; i < goals.length; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = gStartX + col * (gW + gGap), y = 1.8 + row * (gH + gGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: gW, h: gH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: y + 0.28, w: 0.55, h: 0.55,
      fill: { color: S.BG_DARKER }, line: { color: goals[i].color, width: 1.5 }
    });
    const png = await S.iconPng(goals[i].icon, goals[i].color);
    s.addImage({ data: png, x: x + 0.265, y: y + 0.345, w: 0.42, h: 0.42 });
    s.addText(goals[i].title, {
      x: x + 0.88, y: y + 0.18, w: gW - 1.0, h: 0.35,
      fontSize: 13, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(goals[i].desc, {
      x: x + 0.2, y: y + 0.78, w: gW - 0.4, h: 0.6,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Это база — после неё ты профессионально решаешь 80% типовых обращений к мастеру.', S.CY);

  // ============ 3 · ФАЗА 1 — ФУНДАМЕНТ (1-3) ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'фаза 1', 3, TOTAL);
  S.addSlideTitle(s, 'Недели 1-3 — фундамент');

  await phaseSlide(s, pres, {
    color: S.CY,
    weeks: [
      { num: '1', title: 'Устройство ПК',     desc: 'CPU, RAM, диски, материнка, БП. Что зачем, что бывает.' },
      { num: '2', title: 'Операционка Windows', desc: 'NTFS, реестр, службы, учётки, UAC.' },
      { num: '3', title: 'Диагностика железа', desc: 'SMART дисков, температуры, MemTest, термопаста.' },
    ],
    insight: 'Без фундамента дальше не будет.',
  });
  S.addBottomCallout(s, pres, 'Каждая неделя кончается практикой: разобрать ПК, поставить Windows, прогнать MemTest86+.', S.CY);

  // ============ 4 · ФАЗА 2 — СПАСЕНИЕ И СЕТИ (4-6) ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'фаза 2', 4, TOTAL);
  S.addSlideTitle(s, 'Недели 4-6 — спасение и сети');

  await phaseSlide(s, pres, {
    color: S.MT,
    weeks: [
      { num: '4', title: 'Когда Windows не грузится', desc: 'Безопасный режим, точка восстановления, Hiren\'s, команды.' },
      { num: '5', title: 'Чистка от вирусов',     desc: 'Сканеры, Autoruns, чистка автозагрузки. По-честному.' },
      { num: '6', title: 'Сети, провайдер, DPI',  desc: 'Команды диагностики, GoodbyeDPI и zapret, починка YouTube/Telegram.' },
    ],
    insight: 'Здесь ты решаешь самые частые жалобы 2026 года.',
  });
  S.addBottomCallout(s, pres, 'К концу 6 недели ты уже можешь идти к другу с ноутом «тормозит» и реально починить.', S.MT);

  // ============ 5 · ФАЗА 3 — ПРОДВИНУТОЕ (7-9) ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'фаза 3', 5, TOTAL);
  S.addSlideTitle(s, 'Недели 7-9 — продвинутые навыки');

  await phaseSlide(s, pres, {
    color: S.AM,
    weeks: [
      { num: '7', title: 'Замена компонентов',  desc: 'SSD с клонированием, RAM, термопаста, БП. Самый прибыльный навык.' },
      { num: '8', title: 'Восстановление данных', desc: 'TestDisk, PhotoRec, DMDE. И главное — когда не браться.' },
      { num: '9', title: 'Общение с клиентом',  desc: 'Скрипты разговора, типовые ситуации, отказы. Половина успеха бизнеса.' },
    ],
    insight: 'Тут навыки становятся специализацией мастера.',
  });
  S.addBottomCallout(s, pres, 'Эти три темы решают самые сложные и прибыльные случаи. Здесь ты начинаешь зарабатывать.', S.AM);

  // ============ 6 · ФАЗА 4 — БИЗНЕС (10-12) ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'фаза 4', 6, TOTAL);
  S.addSlideTitle(s, 'Недели 10-12 — бизнес');

  await phaseSlide(s, pres, {
    color: S.PU,
    weeks: [
      { num: '10', title: 'Дашборд Verus',       desc: 'Глубокое освоение всех функций. Это твой главный рабочий инструмент.' },
      { num: '11', title: 'Юридический минимум', desc: 'Самозанятость, акты, ПДн клиента, ответственность за данные.' },
      { num: '12', title: 'Первый клиент',       desc: 'Друг или родственник — бесплатно или за символическую плату. Пробный цикл.' },
    ],
    insight: 'Знания + инструмент + легальность = готов к платной работе.',
  });
  S.addBottomCallout(s, pres, 'К 12-й неделе у тебя дашборд, акты, регистрация самозанятого и первый клиент в портфолио.', S.PU);

  // ============ 7 · ГЛАВНЫЕ ПРИНЦИПЫ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'принципы', 7, TOTAL);
  S.addSlideTitle(s, 'Главные принципы мастера');

  const principles = [
    { icon: 'shield', color: S.MT, title: 'Данные клиента — святое', desc: 'Перед любой работой — бэкап. Не открывай личное без необходимости.' },
    { icon: 'check',  color: S.CY, title: 'Честность важнее заработка', desc: 'Покажи реальную причину, а не выдуманную. Не возьмёшь — направь в лабораторию.' },
    { icon: 'list',   color: S.AM, title: 'Каждая работа в бумаге', desc: 'Акт приёмки + акт передачи + чек. Это твоя страховка от исков.' },
  ];
  for (let i = 0; i < principles.length; i++) {
    const w = 2.9, h = 2.6, gap = 0.15;
    const startX2 = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX2 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: principles[i].color, width: 1.5 }
    });
    const png = await S.iconPng(principles[i].icon, principles[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(principles[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 15, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(principles[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 0.85,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Эти три принципа важнее любых технических навыков. Без них репутация умрёт за один прокол.', S.MT);

  // ============ 8 · МАРКЕРЫ ГОТОВНОСТИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'маркеры', 8, TOTAL);
  S.addSlideTitle(s, 'Как понять что прокачался');

  const markers = [
    { level: '0-10',   color: S.CY, title: 'Новичок',  desc: 'Знаешь компоненты, можешь решить простые случаи. Заполняешь акты грамотно.' },
    { level: '10-50',  color: S.MT, title: 'Базовый',  desc: 'Уверенно ставишь диагноз в типовых ситуациях. Знаешь куда отправить в сложном случае.' },
    { level: '50-200', color: S.AM, title: 'Опытный',  desc: 'Видишь паттерны: «эта модель ноута ломается так». Берёшь сложные кейсы.' },
    { level: '200+',   color: S.PU, title: 'Профи',    desc: 'Тебя рекомендуют другие мастера. Открываешь свой сервис или школу.' },
  ];
  const mW = 2.2, mH = 2.6, mGap = 0.12;
  const mStartX = (10 - (mW * 4 + mGap * 3)) / 2;
  for (let i = 0; i < markers.length; i++) {
    const x = mStartX + i * (mW + mGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w: mW, h: mH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    // Уровень в кружке
    s.addShape(pres.shapes.OVAL, {
      x: x + (mW - 1.2) / 2, y: 2.0, w: 1.2, h: 1.2,
      fill: { color: S.BG_DARKER }, line: { color: markers[i].color, width: 2 }
    });
    s.addText(markers[i].level, {
      x: x + (mW - 1.2) / 2, y: 2.0, w: 1.2, h: 1.2,
      fontSize: 17, fontFace: S.FONT_HEADER, bold: true, color: markers[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText('клиентов', {
      x: x + (mW - 1.2) / 2, y: 1.6, w: 1.2, h: 0.3,
      fontSize: 9, fontFace: S.FONT_MONO, color: S.MUTED,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(markers[i].title, {
      x: x + 0.1, y: 3.32, w: mW - 0.2, h: 0.4,
      fontSize: 16, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(markers[i].desc, {
      x: x + 0.18, y: 3.78, w: mW - 0.36, h: 0.7,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'От новичка до базового уровня — 6-12 месяцев активной практики. Не торопись.', S.CY);

  // ============ 9 · ЧТО ПОСЛЕ 12 НЕДЕЛЬ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'дальше', 9, TOTAL);
  S.addSlideTitle(s, 'Что после 12 недель — направления');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'rocket', iconColor: S.MT,
    title: 'Куда расти после базы',
    body: 'После 12 недель — выбираешь специализацию или продолжаешь общую практику.\n\n· Ноутбуки — пайка, BGA, диагностика плат. Учиться ещё 6-12 мес.\n· MacBook / Apple — отдельная экосистема, дорогие клиенты.\n· Серверы / RAID — для бизнес-клиентов, другие деньги.\n· Восстановление данных в лаборатории — нужно оборудование PC-3000.\n· Сетевая инфраструктура — настройка квартир и офисов.\n· Расширения для геймеров — разгон, водянка, RGB.\n\nНе торопись с выбором. После полугода практики увидишь куда тянет.'
  });
  S.addBottomCallout(s, pres, 'Технологии меняются. Учиться придётся всю жизнь. Перестал учиться — устарел за год.', S.MT);

  // ============ 10 · ПРИЗЫВ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'старт', 10, TOTAL);
  S.addSlideTitle(s, 'С чего начать прямо сейчас');

  const start = [
    { num: '1', color: S.CY, title: 'Открой дорожную карту', desc: 'Модуль «Дорожная карта мастера» — там подробно по каждой неделе.' },
    { num: '2', color: S.MT, title: 'Начни неделю 1', desc: 'Разбери свой ПК. Сделай фото. Изучи что внутри.' },
    { num: '3', color: S.AM, title: 'Не торопись',    desc: 'Лучше 4 недели по-настоящему, чем 12 по верхам.' },
  ];
  for (let i = 0; i < start.length; i++) {
    const w = 2.9, h = 2.6, gap = 0.15;
    const startX2 = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX2 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: start[i].color, width: 1.5 }
    });
    s.addText(start[i].num, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fontSize: 36, fontFace: S.FONT_HEADER, bold: true, color: start[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(start[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 17, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(start[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 0.85,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'center', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Один реальный клиент полезнее 10 часов теории. Не откладывай практику до «когда буду готов».', S.MT);

  // ============ СОХРАНЕНИЕ ============
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '06-Путь ПК-мастера за 12 недель.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });

// Хелпер: слайд фазы — 3 карточки недели + insight
async function phaseSlide(slide, pres, opts) {
  const { color, weeks, insight } = opts;
  for (let i = 0; i < 3; i++) {
    const w = 2.9, h = 2.3, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    // Большой номер недели
    slide.addShape(pres.shapes.OVAL, {
      x: x + (w - 1.0) / 2, y: 1.98, w: 1.0, h: 1.0,
      fill: { color: S.BG_DARKER }, line: { color: color, width: 2 }
    });
    slide.addText('Неделя', {
      x: x + (w - 1.0) / 2, y: 1.6, w: 1.0, h: 0.3,
      fontSize: 10, fontFace: S.FONT_MONO, color: S.MUTED,
      align: 'center', valign: 'middle', margin: 0
    });
    slide.addText(weeks[i].num, {
      x: x + (w - 1.0) / 2, y: 1.98, w: 1.0, h: 1.0,
      fontSize: 36, fontFace: S.FONT_HEADER, bold: true, color: color,
      align: 'center', valign: 'middle', margin: 0
    });
    slide.addText(weeks[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 15, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    slide.addText(weeks[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 0.55,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'center', valign: 'top', margin: 0
    });
  }
  // Insight как отдельная строка под карточками
  slide.addText(insight, {
    x: 0.5, y: 4.3, w: 9, h: 0.4,
    fontSize: 13, fontFace: S.FONT_BODY, italic: true, color: color,
    align: 'center', valign: 'middle', margin: 0
  });
}
