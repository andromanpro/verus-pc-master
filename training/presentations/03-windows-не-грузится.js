// Презентация #3 «Когда Windows не грузится — план действий»
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'Когда Windows не грузится — план действий';
  pres.subject = 'Урок 3 курса «Мастер ПК»';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'обучение', 1, TOTAL);

  s.addText('КУРС ПК-МАСТЕРА · УРОК 3', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Когда Windows\nне грузится', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 46
  });
  s.addText('План спасения: от лёгких приёмов до полной переустановки. И главное — где остановиться, чтобы не угробить данные.', {
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

  // ============ 2 · ГЛАВНОЕ ПРАВИЛО ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'правило #1', 2, TOTAL);
  S.addSlideTitle(s, 'Сначала данные — потом всё остальное');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'shield', iconColor: S.MT,
    title: 'Главное правило ремонта',
    body: 'Прежде чем что-то нажимать на сломанной системе — скопируй файлы клиента на свою флешку. Документы, фото, рабочий стол, AppData.\n\nПочему именно так:\n· Сломанная Windows может ещё больше «сломаться» от твоих попыток\n· Любая команда восстановления может перезаписать важные данные\n· Спасти 30 минут на бэкап важнее чем потерять диплом клиента\n\nЕсли система совсем не грузится — загрузись с Hiren\'s BootCD, оттуда скопируй файлы на внешний диск. Это шаг ноль, до любых других действий.'
  });
  S.addBottomCallout(s, pres, 'Лучше потратить полчаса на бэкап, чем потом 5 часов на восстановление данных лабораторией.', S.MT);

  // ============ 3 · 5 ТИПИЧНЫХ СИМПТОМОВ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'симптомы', 3, TOTAL);
  S.addSlideTitle(s, '5 типичных «не грузится»');

  const symptoms = [
    { icon: 'cross', color: S.RS, title: 'Чёрный экран',     desc: 'Курсор мигает, но ничего не происходит. Загрузчик сломан.' },
    { icon: 'bsod',  color: S.CY, title: 'BSOD при старте',   desc: 'Синий экран сразу после логотипа Windows. Драйвер или RAM.' },
    { icon: 'disk',  color: S.AM, title: '«No bootable device»', desc: 'BIOS не видит загрузчика. Проверь диск и порядок загрузки.' },
    { icon: 'clock', color: S.PU, title: 'Бесконечный спиннер', desc: 'Кружочки крутятся 20+ минут. Что-то ждёт сетевой ресурс или сервис висит.' },
    { icon: 'back',  color: S.MT, title: 'Цикл перезагрузки', desc: 'Грузится, BSOD, ребут, грузится, BSOD. Зацикливается на одной ошибке.' },
  ];
  const sW = 1.83, sH = 2.55, sGap = 0.12;
  const sStartX = (10 - (sW * 5 + sGap * 4)) / 2;
  for (let i = 0; i < symptoms.length; i++) {
    const x = sStartX + i * (sW + sGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w: sW, h: sH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (sW - 0.7) / 2, y: 2.0, w: 0.7, h: 0.7,
      fill: { color: S.BG_DARKER }, line: { color: symptoms[i].color, width: 1.5 }
    });
    const png = await S.iconPng(symptoms[i].icon, symptoms[i].color);
    s.addImage({ data: png, x: x + (sW - 0.55) / 2, y: 2.075, w: 0.55, h: 0.55 });
    s.addText(symptoms[i].title, {
      x: x + 0.1, y: 2.85, w: sW - 0.2, h: 0.5,
      fontSize: 13, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(symptoms[i].desc, {
      x: x + 0.18, y: 3.4, w: sW - 0.36, h: 1.0,
      fontSize: 10.5, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'center', valign: 'top', margin: 0, paraSpaceAfter: 2
    });
  }
  S.addBottomCallout(s, pres, 'У каждого симптома свой набор причин. Запиши что видишь — и переходи к лесенке шагов.', S.CY);

  // ============ 4 · ШАГ 1: БЕЗОПАСНЫЙ РЕЖИМ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'шаг 1', 4, TOTAL);
  S.addSlideTitle(s, 'Шаг 1 — безопасный режим');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'shield', iconColor: S.CY,
    title: 'Windows с минимумом драйверов',
    body: 'В безопасном режиме Windows грузит только базовые драйверы. Если обычно всё валится, а в безопасном — работает, виновник найден: какой-то драйвер.\n\nКак зайти:\n· Shift + перезагрузка → Доп. параметры → клавиша 4 (или F4)\n· Если не грузится совсем: 3 раза подряд выключи кнопкой при загрузке — WinRE сама вылезет'
  });
  S.addBottomCallout(s, pres, 'Безопасный режим — первая дверь когда обычная закрыта. Не пропусти её.', S.CY);

  // ============ 5 · ШАГ 2: ТОЧКА ВОССТАНОВЛЕНИЯ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'шаг 2', 5, TOTAL);
  S.addSlideTitle(s, 'Шаг 2 — точка восстановления');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'back', iconColor: S.MT,
    title: 'Откат настроек Windows назад',
    body: 'Windows иногда сама создаёт «точки» — снимки своих настроек перед важными изменениями (обновлениями, установкой драйверов). Откатишься на такую точку — и кривое обновление как будто не происходило.\n\nКак зайти:\n· Среда восстановления (WinRE): Доп. параметры → Восстановление системы\n· Если не загружается — WinRE сама вылезет после 2-3 неудачных загрузок\n\nЧто восстанавливается: реестр Windows, драйверы, обновления.\nЧто НЕ восстанавливается: твои файлы (документы, фото — они остаются как есть).'
  });
  S.addBottomCallout(s, pres, 'Точка восстановления — самый безопасный способ откатить кривое обновление. Файлы клиента не пострадают.', S.MT);

  // ============ 6 · ШАГ 3: WinRE и команды ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'шаг 3', 6, TOTAL);
  S.addSlideTitle(s, 'Шаг 3 — команды восстановления');

  // Команды списком в terminal-стиле
  const cmds = [
    { cmd: 'bootrec /fixmbr',                     desc: 'Чинит главную загрузочную запись' },
    { cmd: 'bootrec /fixboot',                    desc: 'Чинит загрузочный сектор раздела' },
    { cmd: 'bootrec /rebuildbcd',                 desc: 'Пересобирает список систем для загрузки' },
    { cmd: 'sfc /scannow',                        desc: 'Проверяет и чинит системные файлы' },
    { cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', desc: 'Чинит хранилище компонентов Windows' },
    { cmd: 'chkdsk C: /f /r',                     desc: 'Проверяет диск на ошибки (долго)' },
  ];

  // Слева — иконка терминала и подзаголовок
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.1
  });
  s.addShape(pres.shapes.OVAL, {
    x: 0.75, y: 1.85 + (2.85 - 1.5) / 2 - 0.1, w: 1.3, h: 1.3,
    fill: { color: S.BG_DARKER }, line: { color: S.AM, width: 2 }
  });
  const termPng = await S.iconPng('terminal', S.AM, 384);
  s.addImage({ data: termPng, x: 0.84, y: 1.85 + (2.85 - 1.2) / 2 - 0.1, w: 1.12, h: 1.12 });
  s.addText('Когда WinRE → командная строка', {
    x: 2.45, y: 2.05, w: 6.9, h: 0.4,
    fontSize: 17, fontFace: S.FONT_HEADER, bold: true, color: S.WHITE,
    align: 'left', valign: 'middle', margin: 0
  });
  // 6 строк команд
  for (let i = 0; i < cmds.length; i++) {
    const y = 2.55 + i * 0.32;
    s.addText(cmds[i].cmd, {
      x: 2.45, y, w: 3.8, h: 0.3,
      fontSize: 11.5, fontFace: S.FONT_MONO, bold: true, color: S.CY,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(cmds[i].desc, {
      x: 6.3, y, w: 3.1, h: 0.3,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'middle', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Выполняй по одной. После каждой — перезагрузка и проверка, грузится или нет.', S.AM);

  // ============ 7 · ШАГ 4: ЗАГРУЗКА С ФЛЕШКИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'шаг 4', 7, TOTAL);
  S.addSlideTitle(s, 'Шаг 4 — загрузка с флешки');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'usb', iconColor: S.PU,
    title: 'Hiren\'s BootCD PE или WinPE',
    body: 'Когда родная Windows не грузится совсем — поднимай ПК с твоей флешки. На ней живёт мини-Windows со всеми инструментами.\n\nЧто понадобится:\n· Флешка с Hiren\'s BootCD PE (бесплатно с hirensbootcd.org)\n· В BIOS поставить загрузку с USB первой\n\nЧто делаешь оттуда: копируешь файлы клиента, гоняешь chkdsk / sfc на «выключенной» системе, чинишь загрузчик через bootrec.'
  });
  S.addBottomCallout(s, pres, 'Флешка-спасатель — главный инструмент мастера. Сделай её один раз и носи с собой.', S.PU);

  // ============ 8 · КОГДА ВЕРНУТЬСЯ К БЕЗОПАСНОМУ РЕЖИМУ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'лесенка', 8, TOTAL);
  S.addSlideTitle(s, 'Лесенка по сложности');

  // 4 ступеньки с цифрами в кружках, разная высота
  const stairs = [
    { num: '1', color: S.MT, title: 'Безопасный режим',   risk: 'Низкий риск',     time: '5 мин',  fix: 'удалить вирус / откатить драйвер' },
    { num: '2', color: S.CY, title: 'Точка восстановления',risk: 'Низкий риск',    time: '10 мин', fix: 'откатить кривое обновление' },
    { num: '3', color: S.AM, title: 'WinRE-команды',       risk: 'Средний риск',   time: '20 мин', fix: 'пересобрать загрузчик, проверить файлы' },
    { num: '4', color: S.RS, title: 'Hiren\'s + переустановка', risk: 'Высокий риск', time: '1-2 ч', fix: 'снять данные, поставить Windows заново' },
  ];
  const stW = 2.2, stH = 2.6, stGap = 0.12;
  const stStartX = (10 - (stW * 4 + stGap * 3)) / 2;
  for (let i = 0; i < stairs.length; i++) {
    const x = stStartX + i * (stW + stGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w: stW, h: stH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    // Большая цифра вверху
    s.addShape(pres.shapes.OVAL, {
      x: x + (stW - 0.7) / 2, y: 1.98, w: 0.7, h: 0.7,
      fill: { color: S.BG_DARKER }, line: { color: stairs[i].color, width: 1.5 }
    });
    s.addText(stairs[i].num, {
      x: x + (stW - 0.7) / 2, y: 1.98, w: 0.7, h: 0.7,
      fontSize: 28, fontFace: S.FONT_HEADER, bold: true, color: stairs[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(stairs[i].title, {
      x: x + 0.1, y: 2.78, w: stW - 0.2, h: 0.4,
      fontSize: 14, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    // Параметры на 3 строки
    s.addText(stairs[i].risk, {
      x: x + 0.15, y: 3.22, w: stW - 0.3, h: 0.28,
      fontSize: 11, fontFace: S.FONT_BODY, color: stairs[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText('⏱ ' + stairs[i].time, {
      x: x + 0.15, y: 3.5, w: stW - 0.3, h: 0.28,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(stairs[i].fix, {
      x: x + 0.2, y: 3.85, w: stW - 0.4, h: 0.55,
      fontSize: 10.5, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'center', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Иди по лесенке: сначала простое, потом сложное. Не прыгай на «переустановку» с порога.', S.CY);

  // ============ 9 · КОГДА ПЕРЕУСТАНОВКА ОБЯЗАТЕЛЬНА ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'переустановка', 9, TOTAL);
  S.addSlideTitle(s, 'Когда переустановка обязательна');

  const must = [
    { icon: 'cross', color: S.RS, title: 'Шифровальщик', desc: 'Файлы зашифрованы вирусом-вымогателем. Чистка системы не вернёт данные — только из бэкапа.' },
    { icon: 'warn',  color: S.AM, title: 'Дохлый диск',  desc: 'SMART красный, ошибок чтения сотни. Сначала меняй диск, потом ставь Windows на новый.' },
    { icon: 'bsod',  color: S.PU, title: 'BSOD не лечится', desc: 'Прогнал все шаги, ничего не помогло. Иногда быстрее переставить, чем копать дальше.' },
  ];
  for (let i = 0; i < must.length; i++) {
    const w = 2.9, h = 2.6, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: must[i].color, width: 1.5 }
    });
    const png = await S.iconPng(must[i].icon, must[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(must[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 16, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(must[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 0.85,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Перед переустановкой — обязательный шаг ноль: сними данные клиента и положи на свою флешку.', S.RS);

  // ============ 10 · ФИНАЛ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'итог', 10, TOTAL);
  S.addSlideTitle(s, 'Порядок действий — 3 правила');

  const rules = [
    { icon: 'shield', color: S.MT, title: 'Сначала данные', desc: 'До любых попыток восстановить — скопируй файлы клиента. Это шаг ноль, всегда.' },
    { icon: 'list',   color: S.CY, title: 'Иди от лёгкого', desc: 'Безопасный режим → точка восстановления → команды → флешка-спасатель → переустановка.' },
    { icon: 'check',  color: S.AM, title: 'Знай когда остановиться', desc: 'Если диск физически умирает или вирус-шифровальщик — не теряй время, иди в переустановку.' },
  ];
  for (let i = 0; i < rules.length; i++) {
    const w = 2.9, h = 2.6, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: rules[i].color, width: 1.5 }
    });
    const png = await S.iconPng(rules[i].icon, rules[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(rules[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 16, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(rules[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 0.85,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Спокойствие, бэкап и порядок шагов. С этим оживает 9 ПК из 10.', S.MT);

  // ============ СОХРАНЕНИЕ ============
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '03-Когда Windows не грузится.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });
