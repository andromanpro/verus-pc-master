// Презентация #5 «Восстановление данных — когда сам, когда в лабораторию»
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'Восстановление данных';
  pres.subject = 'Урок 5 курса «Мастер ПК»';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'обучение', 1, TOTAL);

  s.addText('КУРС ПК-МАСТЕРА · УРОК 5', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Восстановление\nданных', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 40
  });
  s.addText('Когда чинить самому, когда честно сказать «не возьмусь, в лабораторию». И главное — что не делать никогда.', {
    x: 0.5, y: 4.1, w: 6, h: 0.7,
    fontSize: 14, fontFace: S.FONT_BODY, color: S.MUTED,
    align: 'left', valign: 'middle', margin: 0
  });

  s.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 1.55, w: 2.7, h: 2.7,
    fill: { color: S.BG_DARKER }, line: { color: S.CY, width: 2 }
  });
  const titlePng = await S.iconPng('search', S.CY, 512);
  s.addImage({ data: titlePng, x: 6.85, y: 2.0, w: 1.8, h: 1.8 });

  // ============ 2 · ГЛАВНОЕ ПРАВИЛО ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'правило #1', 2, TOTAL);
  S.addSlideTitle(s, 'Главное правило — другой диск');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'warn', iconColor: S.RS,
    title: 'Никогда не пиши на тот же диск',
    body: 'Когда файл удалён — он не исчезает физически. Windows просто пометила место «свободно». Файл всё ещё там, пока его не перезапишут новые данные.\n\nЕсли ставить программу восстановления на тот же диск, или копировать файлы туда обратно — ты затираешь то, что хотел спасти.\n\nЧто делать всегда:\n· Программу восстановления запускаешь с флешки или другого диска\n· Восстановленные файлы пишешь на ДРУГОЙ диск (внешний, флешка)\n· Если диск С: — работай с него только на чтение'
  });
  S.addBottomCallout(s, pres, 'Это правило важнее самой программы восстановления. Нарушил — потерял всё.', S.RS);

  // ============ 3 · 4 УРОВНЯ СЛОЖНОСТИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'сложность', 3, TOTAL);
  S.addSlideTitle(s, '4 уровня сложности — что у клиента');

  const levels = [
    { num: '1', color: S.MT, title: 'Просто удалил', desc: 'Удалил Shift+Del. Файл цел, ссылка пропала. 80% случаев восстанавливается за час.' },
    { num: '2', color: S.CY, title: 'Форматнул',     desc: 'Случайно «быстрое форматирование». Файлы целы, NTFS-таблица пуста. Восстанавливается.' },
    { num: '3', color: S.AM, title: 'Битая ФС (RAW)', desc: 'Диск показывает 0 байт, файловая система RAW. NTFS повреждена — лечится TestDisk.' },
    { num: '4', color: S.RS, title: 'Физика',         desc: 'Диск щёлкает, скрежещет или не определяется в BIOS. Срочно в лабораторию, не включай.' },
  ];
  const lW = 2.2, lH = 2.6, lGap = 0.12;
  const lStartX = (10 - (lW * 4 + lGap * 3)) / 2;
  for (let i = 0; i < levels.length; i++) {
    const x = lStartX + i * (lW + lGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w: lW, h: lH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (lW - 0.7) / 2, y: 1.98, w: 0.7, h: 0.7,
      fill: { color: S.BG_DARKER }, line: { color: levels[i].color, width: 1.5 }
    });
    s.addText(levels[i].num, {
      x: x + (lW - 0.7) / 2, y: 1.98, w: 0.7, h: 0.7,
      fontSize: 28, fontFace: S.FONT_HEADER, bold: true, color: levels[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(levels[i].title, {
      x: x + 0.1, y: 2.78, w: lW - 0.2, h: 0.4,
      fontSize: 14, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(levels[i].desc, {
      x: x + 0.18, y: 3.22, w: lW - 0.36, h: 1.18,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
    });
  }
  S.addBottomCallout(s, pres, 'Сначала определи уровень — потом выбирай программу. Не наоборот.', S.CY);

  // ============ 4 · УРОВЕНЬ 1 — КОРЗИНА И ШЭДОУ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'уровень 1', 4, TOTAL);
  S.addSlideTitle(s, 'Просто удалил — самое простое');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'back', iconColor: S.MT,
    title: 'Корзина → Shadow Copies → Recuva',
    body: 'Сначала проверь самое простое:\n· Корзина (если не Shift+Del)\n· Предыдущие версии папки (ПКМ → Свойства → Предыдущие версии) — Windows иногда сама хранит снимки\n· OneDrive / Google Drive / iCloud — если файл был в облачной папке\n· История файлов (если у клиента настроена)\n\nЕсли всё пусто — программа Recuva (бесплатно, от Piriform). Простая, для базовых случаев работает отлично. Ставишь на флешку, сканируешь диск.'
  });
  S.addBottomCallout(s, pres, 'Сначала «бесплатные» источники, потом сканеры. Сэкономишь час и нервы клиента.', S.MT);

  // ============ 5 · УРОВЕНЬ 2 — PhotoRec ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'уровень 2', 5, TOTAL);
  S.addSlideTitle(s, 'PhotoRec — по сигнатурам');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'file', iconColor: S.CY,
    title: 'Спасатель когда таблица потеряна',
    body: 'PhotoRec не ищет «файлы по именам». Он сканирует диск побайтно и ищет известные сигнатуры — начало JPG, DOCX, ZIP, MP4. Находит файлы которые «висят» в свободном месте.\n\nПлюсы:\n· Бесплатно (часть пакета TestDisk)\n· Работает после форматирования или потери таблицы\n· Поддерживает 400+ типов файлов\n\nМинус: восстановленные файлы **без имён**, в куче. Папок нет, всё в формате `f0001234.jpg`, `f0001235.docx`. Клиент будет долго переименовывать.'
  });
  S.addBottomCallout(s, pres, 'PhotoRec — последний рубеж когда «по именам» не работает. Главное — данные есть.', S.CY);

  // ============ 6 · УРОВЕНЬ 3 — TestDisk ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'уровень 3', 6, TOTAL);
  S.addSlideTitle(s, 'TestDisk — лечит файловую систему');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'shield', iconColor: S.AM,
    title: 'Когда диск стал RAW',
    body: 'Иногда диск физически жив, файлы целы — но NTFS-таблица повреждена. Windows показывает «диск не отформатирован». Не нажимай форматировать!\n\nTestDisk восстанавливает саму таблицу разделов и NTFS-индекс. После этого файлы возвращаются с именами и структурой папок.\n\nИнтерфейс — текстовый, как из 90-х, не пугайся. Команды простые: Analyse → Quick Search (найдёт раздел) → Write (запишет таблицу). Гайды есть на cgsecurity.org/wiki.'
  });
  S.addBottomCallout(s, pres, 'TestDisk и PhotoRec — это один пакет. Бесплатный, мощный, лет 20 как стандарт у мастеров.', S.AM);

  // ============ 7 · УРОВЕНЬ 4 — DMDE / R-Studio ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'уровень 4', 7, TOTAL);
  S.addSlideTitle(s, 'DMDE и R-Studio — когда сложнее');

  // Две колонки
  const advTools = [
    { color: S.CY, title: 'DMDE', desc: 'Видит то, что не видит TestDisk: RAID-массивы, сложные случаи. Интерфейс понятный.\n\nГде брать: dmde.com\nЛицензия: бесплатная — только личное/ознакомление. Восстановление данных клиентам = услуга → нужна платная (от ~$20).' },
    { color: S.PU, title: 'R-Studio', desc: 'Профессиональный инструмент. Дорогой (от 80 долларов), но восстанавливает что не смогли другие. Используется в лабораториях.\n\nКогда брать: если клиент готов платить за результат.\nДемо-версия читает но не сохраняет.' },
  ];
  for (let i = 0; i < advTools.length; i++) {
    const w = 4.4, h = 2.85, gap = 0.2;
    const startX2 = (10 - (w * 2 + gap)) / 2;
    const x = startX2 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.1
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.3, y: 2.05, w: 0.85, h: 0.85,
      fill: { color: S.BG_DARKER }, line: { color: advTools[i].color, width: 1.5 }
    });
    const png = await S.iconPng('search', advTools[i].color);
    s.addImage({ data: png, x: x + 0.4, y: 2.15, w: 0.65, h: 0.65 });
    s.addText(advTools[i].title, {
      x: x + 1.25, y: 2.1, w: w - 1.4, h: 0.55,
      fontSize: 22, fontFace: S.FONT_HEADER, bold: true, color: S.WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(advTools[i].desc, {
      x: x + 0.3, y: 3.0, w: w - 0.5, h: 1.65,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 4
    });
  }
  S.addBottomCallout(s, pres, 'Для платных услуг: TestDisk/PhotoRec (GPL) бесплатны и легальны; DMDE/R-Studio — по платной лицензии.', S.PU);

  // ============ 8 · КОГДА НЕ БРАТЬСЯ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'стоп!', 8, TOTAL);
  S.addSlideTitle(s, 'Когда категорически не браться');

  const stops = [
    { icon: 'cross', color: S.RS, title: 'Диск щёлкает', desc: 'Стук, треск, скрежет = головка касается блинов. Каждое включение убивает файлы дальше. Сразу в лабораторию.' },
    { icon: 'lock',  color: S.PU, title: 'BitLocker без ключа', desc: 'Шифрование без ключа восстановления — это математически невозможно вскрыть. Сразу честно сказать клиенту.' },
    { icon: 'warn',  color: S.AM, title: 'Залит жидкостью', desc: 'Замыкания не видно, но контакты корродируют. Включишь — сожжёшь оставшееся. Лаборатория с чистой комнатой.' },
  ];
  for (let i = 0; i < stops.length; i++) {
    const w = 2.9, h = 2.6, gap = 0.15;
    const startX2 = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX2 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: stops[i].color, width: 1.5 }
    });
    const png = await S.iconPng(stops[i].icon, stops[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(stops[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 16, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(stops[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 0.9,
      fontSize: 11.5, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Если сомневаешься — не включай. Тяга «попробовать» убивает шанс на восстановление в лаборатории.', S.RS);

  // ============ 9 · ЛАБОРАТОРИЯ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'лаборатория', 9, TOTAL);
  S.addSlideTitle(s, 'Когда отправлять в лабораторию');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'rocket', iconColor: S.MT,
    title: 'Когда сам не сможешь — направляй честно',
    body: 'Лаборатория восстановления — это «чистая комната», стенды для разборки головок, доноры для замены электроники. Это не «программа». Это физический ремонт диска.\n\nКогда стоит направлять:\n· Физическое повреждение (стук, удар, падение)\n· Диск не определяется в BIOS совсем\n· После пожара или потопа\n· Когда клиент готов платить от 15-50 тыс. ₽ за результат\n\nЧестно скажи клиенту: «я не возьмусь, испорчу. Вот ребята, у них оборудование. Цена дороже, но шанс есть.» Доверие клиента — твой капитал.'
  });
  S.addBottomCallout(s, pres, 'Запиши 2-3 проверенных лаборатории в своём городе. Это твой ресурс.', S.MT);

  // ============ 10 · АЛГОРИТМ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'итог', 10, TOTAL);
  S.addSlideTitle(s, 'Порядок действий — 4 шага');

  const steps = [
    { num: '1', color: S.CY, title: 'Выключи и не пиши',  desc: 'Отключи питание. Не запускай программы. Каждое действие может затереть.' },
    { num: '2', color: S.MT, title: 'Сними образ диска',  desc: 'Если важные данные — сделай посекторный образ (Macrium Reflect). Работай с копией.' },
    { num: '3', color: S.AM, title: 'Иди по уровням',     desc: 'Корзина → Recuva → PhotoRec → TestDisk → DMDE → R-Studio. От простого к сложному.' },
    { num: '4', color: S.PU, title: 'Знай где остановиться', desc: 'Физическая поломка → лаборатория. BitLocker без ключа → невозможно. Скажи честно.' },
  ];
  for (let i = 0; i < steps.length; i++) {
    const w = 2.2, h = 2.6, gap = 0.12;
    const startX2 = (10 - (w * 4 + gap * 3)) / 2;
    const x = startX2 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.7) / 2, y: 1.98, w: 0.7, h: 0.7,
      fill: { color: S.BG_DARKER }, line: { color: steps[i].color, width: 1.5 }
    });
    s.addText(steps[i].num, {
      x: x + (w - 0.7) / 2, y: 1.98, w: 0.7, h: 0.7,
      fontSize: 28, fontFace: S.FONT_HEADER, bold: true, color: steps[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(steps[i].title, {
      x: x + 0.1, y: 2.78, w: w - 0.2, h: 0.4,
      fontSize: 13, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(steps[i].desc, {
      x: x + 0.18, y: 3.22, w: w - 0.36, h: 1.18,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
    });
  }
  S.addBottomCallout(s, pres, 'Данные клиента — это его жизнь. Спешка убивает шансы. Спокойствие и порядок.', S.MT);

  // ============ СОХРАНЕНИЕ ============
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '05-Восстановление данных.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });
