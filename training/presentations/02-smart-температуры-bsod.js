// Презентация #2 «SMART, температуры, BSOD — язык вашего ПК»
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'SMART, температуры, BSOD — язык ПК';
  pres.subject = 'Урок 2 курса «Мастер ПК»';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'обучение', 1, TOTAL);

  s.addText('КУРС ПК-МАСТЕРА · УРОК 2', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Язык вашего ПК', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 50
  });
  s.addText('SMART, температуры, синие экраны — три способа, которыми ПК сам рассказывает о своём здоровье.', {
    x: 0.5, y: 4.1, w: 6, h: 0.7,
    fontSize: 14, fontFace: S.FONT_BODY, color: S.MUTED,
    align: 'left', valign: 'middle', margin: 0
  });

  // иконка справа
  s.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 1.55, w: 2.7, h: 2.7,
    fill: { color: S.BG_DARKER }, line: { color: S.CY, width: 2 }
  });
  const titlePng = await S.iconPng('search', S.CY, 512);
  s.addImage({ data: titlePng, x: 6.85, y: 2.0, w: 1.8, h: 1.8 });

  // ============ 2 · ТРИ ГЛАВНЫХ ЯЗЫКА ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'три языка', 2, TOTAL);
  S.addSlideTitle(s, 'Тремя способами ПК говорит о здоровье');

  const langs = [
    { icon: 'disk',   color: S.CY, title: 'SMART дисков', subtitle: 'Диск сам считает свои часы работы, ошибки и износ. Программа CrystalDiskInfo читает эти цифры.' },
    { icon: 'thermo', color: S.AM, title: 'Температуры',  subtitle: 'CPU, GPU, диск — у каждого датчик. LibreHardwareMonitor показывает их в реальном времени.' },
    { icon: 'bsod',   color: S.RS, title: 'Синие экраны', subtitle: 'BSOD — это не «глюк», это диагноз. Код ошибки + минидамп говорят, что именно сломалось.' },
  ];
  for (let i = 0; i < 3; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    await S.addIconCard(s, pres, {
      x, y: 1.85, w, h,
      icon: langs[i].icon, iconColor: langs[i].color,
      title: langs[i].title, subtitle: langs[i].subtitle
    });
  }
  S.addBottomCallout(s, pres, 'Когда что-то не работает — сначала спроси сам ПК. Он уже знает что у него болит.', S.CY);

  // ============ 3 · SMART — что это ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'SMART', 3, TOTAL);
  S.addSlideTitle(s, 'SMART — диск рассказывает о себе');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'disk', iconColor: S.CY,
    title: 'Self-Monitoring, Analysis, Reporting',
    body: 'Каждый современный диск (HDD, SSD, NVMe) сам ведёт дневник: сколько часов работал, сколько ошибок было, какая температура.\n\nТы читаешь этот дневник программой CrystalDiskInfo. Она бесплатная и есть на флешке мастера.\n\nЦвета в её отчёте:\n· Синий «Хорошо» — диск здоров\n· Жёлтый «Тревога» — пора готовиться к замене\n· Красный «Плохо» — копируй данные срочно, диск умирает'
  });
  S.addBottomCallout(s, pres, 'Не доверяй ощущениям клиента «диск работает». Доверяй SMART.', S.CY);

  // ============ 4 · ГЛАВНЫЕ ПАРАМЕТРЫ SMART ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'параметры SMART', 4, TOTAL);
  S.addSlideTitle(s, '5 параметров на которые смотреть');

  const params = [
    { icon: 'clock', color: S.CY, title: 'Power-On Hours', subtitle: 'Сколько часов диск проработал за всю жизнь. Норма для HDD до 30 000 ч. Больше — старый, готовь замену.' },
    { icon: 'warn',  color: S.RS, title: 'Reallocated Sectors', subtitle: 'Сколько повреждённых блоков уже переназначено. У живого диска должно быть 0. Любое значение > 0 — тревога.' },
    { icon: 'thermo',color: S.AM, title: 'Wear Leveling (SSD)', subtitle: 'Износ SSD: 100 = новый, 0 = выработал ресурс. Меньше 20 — замена обязательно.' },
    { icon: 'file',  color: S.PU, title: 'Total LBA Written', subtitle: 'Сколько ТБ записано за жизнь SSD. Помогает понять «бытовой» диск или «майнерский».' },
    { icon: 'cross', color: S.RS, title: 'Read/Write errors', subtitle: 'Сбои чтения и записи. У здорового диска — нули. Появились — диск гибнет.' },
    { icon: 'thermo',color: S.MT, title: 'Temperature', subtitle: 'Температура диска. Норма 30-45°C. Выше 55°C — нужна вентиляция корпуса.' },
  ];
  const pW = 2.9, pH = 1.45, pGap = 0.1;
  const pStartX = (10 - (pW * 3 + pGap * 2)) / 2;
  for (let i = 0; i < params.length; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = pStartX + col * (pW + pGap), y = 1.78 + row * (pH + pGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: pW, h: pH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: y + 0.25, w: 0.5, h: 0.5,
      fill: { color: S.BG_DARKER }, line: { color: params[i].color, width: 1.5 }
    });
    const png = await S.iconPng(params[i].icon, params[i].color);
    s.addImage({ data: png, x: x + 0.28, y: y + 0.32, w: 0.36, h: 0.36 });
    s.addText(params[i].title, {
      x: x + 0.8, y: y + 0.18, w: pW - 0.9, h: 0.35,
      fontSize: 13, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(params[i].subtitle, {
      x: x + 0.2, y: y + 0.68, w: pW - 0.4, h: pH - 0.78,
      fontSize: 10.5, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Все шесть параметров CrystalDiskInfo показывает в одном окне. Посмотри — и сразу видна картина.', S.CY);

  // ============ 5 · ТЕМПЕРАТУРЫ CPU ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'температуры CPU', 5, TOTAL);
  S.addSlideTitle(s, 'Температуры процессора — нормы');

  // Три зоны
  const zones = [
    { color: S.MT, title: 'В простое', range: '35-55°C', desc: 'Браузер открыт, музыка играет. Если выше 60°C в простое — пыль в радиаторе или термопаста.' },
    { color: S.AM, title: 'Под нагрузкой', range: '65-85°C', desc: 'Игра, монтаж видео, стресс-тест. Это норма для современного CPU.' },
    { color: S.RS, title: 'Тревога', range: '> 90°C', desc: 'Близко к thermal shutdown. Процессор сам выключит ПК чтобы не сгореть. Срочно чистить.' },
  ];
  for (let i = 0; i < zones.length; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.85) / 2, y: 2.05, w: 0.85, h: 0.85,
      fill: { color: S.BG_DARKER }, line: { color: zones[i].color, width: 1.5 }
    });
    const png = await S.iconPng('thermo', zones[i].color);
    s.addImage({ data: png, x: x + (w - 0.65) / 2, y: 2.15, w: 0.65, h: 0.65 });
    s.addText(zones[i].title, {
      x: x + 0.1, y: 3.0, w: w - 0.2, h: 0.4,
      fontSize: 17, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(zones[i].range, {
      x: x + 0.1, y: 3.42, w: w - 0.2, h: 0.4,
      fontSize: 22, fontFace: S.FONT_HEADER, bold: true, color: zones[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(zones[i].desc, {
      x: x + 0.22, y: 3.9, w: w - 0.44, h: 0.75,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Читай температуры через LibreHardwareMonitor — он рядом с дашбордом на флешке.', S.AM);

  // ============ 6 · ПЕРЕГРЕВ — СИМПТОМЫ И ПРИЧИНЫ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'перегрев', 6, TOTAL);
  S.addSlideTitle(s, 'Перегрев — симптомы и причины');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'warn', iconColor: S.RS,
    title: 'Когда ПК «горит»',
    body: 'Симптомы перегрева (если хоть один — копай туда):\n· Выключается сам во время игры или монтажа (thermal shutdown)\n· В играх кадры сначала 60, потом резко падают до 30 (тротлинг)\n· Вентилятор гудит на максимум даже в простое\n· Корпус ноутбука горячий снизу, обжигает руки\n\nПричины (по убыванию частоты):\n1. Пыль в радиаторе — забивается за 1-2 года\n2. Термопаста засохла — норма раз в 2-3 года менять\n3. Вентилятор не крутится или сломан\n4. Плохой корпус — нет вентиляции'
  });
  S.addBottomCallout(s, pres, 'Тротлинг = ПК сам режет себе скорость чтобы не сгореть. Лечится чисткой.', S.RS);

  // ============ 7 · BSOD — что это ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'BSOD', 7, TOTAL);
  S.addSlideTitle(s, 'BSOD — синий экран, который полезен');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'bsod', iconColor: S.CY,
    title: 'Blue Screen of Death',
    body: 'Когда Windows натыкается на что-то критическое (битая память, кривой драйвер, сбой ядра) — она аварийно останавливается и показывает синий экран.\n\nГлавное на этом экране — код ошибки. Запиши его прямо со смартфона, по нему почти всегда понятно где искать:\n· MEMORY_MANAGEMENT — память\n· DRIVER_IRQL_NOT_LESS_OR_EQUAL — драйвер\n· KMODE_EXCEPTION_NOT_HANDLED — драйвер или память\n\nЕщё на экране бывает QR-код — наведи камеру, Microsoft расскажет подробнее.'
  });
  S.addBottomCallout(s, pres, 'Синий экран — не «винда сломалась». Это Windows честно говорит что нашла беду.', S.CY);

  // ============ 8 · ТОП-5 КОДОВ BSOD ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'коды BSOD', 8, TOTAL);
  S.addSlideTitle(s, 'Топ-5 кодов и что они значат');

  const codes = [
    { color: S.RS, code: 'MEMORY_MANAGEMENT', cause: 'Битая планка RAM. Прогнать MemTest86+. Если ошибки — менять.' },
    { color: S.AM, code: 'DRIVER_IRQL_NOT_LESS_OR_EQUAL', cause: 'Кривой драйвер. Откатить последний обновлённый драйвер.' },
    { color: S.AM, code: 'KMODE_EXCEPTION_NOT_HANDLED', cause: 'Драйвер или память. Сначала драйверы, потом RAM.' },
    { color: S.PU, code: 'PAGE_FAULT_IN_NONPAGED_AREA', cause: 'RAM или диск. Проверить SMART + MemTest.' },
    { color: S.CY, code: 'CRITICAL_PROCESS_DIED', cause: 'Системный файл повреждён. sfc /scannow и DISM /RestoreHealth.' },
  ];
  const cW = 9, cH = 0.5, cGap = 0.08;
  for (let i = 0; i < codes.length; i++) {
    const y = 1.95 + i * (cH + cGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y, w: cW, h: cH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.06
    });
    // цветная полоса слева
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 0.06, h: cH,
      fill: { color: codes[i].color }, line: { type: 'none' }
    });
    s.addText(codes[i].code, {
      x: 0.7, y, w: 3.8, h: cH,
      fontSize: 12, fontFace: S.FONT_MONO, bold: true, color: codes[i].color,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(codes[i].cause, {
      x: 4.6, y, w: 4.85, h: cH,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Полная база кодов: Microsoft Bug Check Code Reference (поиск по коду).', S.CY);

  // ============ 9 · МИНИДАМПЫ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'минидампы', 9, TOTAL);
  S.addSlideTitle(s, 'Минидампы — кто виноват, в файле');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'file', iconColor: S.PU,
    title: 'C:\\Windows\\Minidump\\*.dmp',
    body: 'При каждом синем экране Windows записывает мини-дамп — снимок памяти в момент сбоя. Это файл размером ~300 КБ.\n\nЧем читать:\n· WhoCrashed (бесплатно) — самый простой. Покажет «виновник: nvlddmkm.sys» и подскажет «это драйвер NVIDIA».\n· BlueScreenView (NirSoft) — продвинутее, видит сразу список всех дампов с кодами.\n\nЧто узнаёшь:\n· Какой драйвер или модуль ядра упал\n· Какие процессы были в момент сбоя\n· Точный код ошибки (если на экране не успели запомнить)'
  });
  S.addBottomCallout(s, pres, 'Минидамп — это полная диагностика BSOD задним числом. Не пугайся слова «дамп».', S.PU);

  // ============ 10 · ФИНАЛ — порядок диагностики ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'итог', 10, TOTAL);
  S.addSlideTitle(s, 'Как собрать диагноз — порядок шагов');

  const steps = [
    { num: '1', color: S.CY, title: 'Открой Verus', desc: 'Дашборд покажет красные зоны: диск, температура, BSOD за месяц. Это твоя карта.' },
    { num: '2', color: S.AM, title: 'Углубись где красное', desc: 'Красный диск → CrystalDiskInfo. Красная температура → LibreHardwareMonitor + чистка. Много BSOD → WhoCrashed.' },
    { num: '3', color: S.MT, title: 'Объясни клиенту', desc: 'Покажи цифры на экране. Не «у тебя плохой ПК», а «вот диск износ 92%, вот BSOD из-за памяти».' },
  ];
  for (let i = 0; i < steps.length; i++) {
    const w = 2.9, h = 2.6, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    // Крупная цифра вместо иконки
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.95) / 2, y: 2.05, w: 0.95, h: 0.95,
      fill: { color: S.BG_DARKER }, line: { color: steps[i].color, width: 2 }
    });
    s.addText(steps[i].num, {
      x: x + (w - 0.95) / 2, y: 2.05, w: 0.95, h: 0.95,
      fontSize: 40, fontFace: S.FONT_HEADER, bold: true, color: steps[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(steps[i].title, {
      x: x + 0.1, y: 3.15, w: w - 0.2, h: 0.4,
      fontSize: 17, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(steps[i].desc, {
      x: x + 0.22, y: 3.6, w: w - 0.44, h: 0.8,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Сначала спроси ПК. Потом покажи ответ клиенту. Тогда работа выглядит как диагноз, а не «угадайка».', S.MT);

  // ---------- Сохраняем ----------
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '02-SMART, температуры, BSOD.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });
