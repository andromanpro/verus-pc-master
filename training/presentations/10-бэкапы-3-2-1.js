// Презентация #10 «Бэкапы клиента — правило 3-2-1»
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'Бэкапы — как не потерять данные';
  pres.subject = 'Для клиента — правило 3-2-1';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'для клиента', 1, TOTAL);

  s.addText('ДЛЯ КЛИЕНТА · ЗАЩИТА ДАННЫХ', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Как не потерять\nданные', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 42
  });
  s.addText('Правило 3-2-1 — как настроить бэкап чтобы фото и документы не пропали. Подходит и для дома, и для работы.', {
    x: 0.5, y: 4.1, w: 6, h: 0.7,
    fontSize: 14, fontFace: S.FONT_BODY, color: S.MUTED,
    align: 'left', valign: 'middle', margin: 0
  });

  s.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 1.55, w: 2.7, h: 2.7,
    fill: { color: S.BG_DARKER }, line: { color: S.CY, width: 2 }
  });
  const titlePng = await S.iconPng('shield', S.CY, 512);
  s.addImage({ data: titlePng, x: 6.85, y: 2.0, w: 1.8, h: 1.8 });

  // ============ 2 · 3 ИСТОРИИ ПОТЕРИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'риски', 2, TOTAL);
  S.addSlideTitle(s, '3 истории как теряют данные');

  const stories = [
    { icon: 'disk', color: S.RS, title: 'Диск умер', desc: 'Однажды утром ПК не включился. 8 лет фотографий, диплом, рабочие документы — всё на одном диске. Восстановление в лаборатории от 15 000₽.' },
    { icon: 'lock', color: S.PU, title: 'Шифровальщик', desc: 'Открыл вложение в письме — все файлы стали .locked. Вымогатель просит 0.3 BTC за ключ. Без бэкапа — данные не вернуть.' },
    { icon: 'cross', color: S.AM, title: 'Пропажа ПК', desc: 'Украли ноутбук в кафе. Залило кофе и ноут не включился. Уронили и разбился. Резервной копии не было — всё ушло вместе с ноутом.' },
  ];
  for (let i = 0; i < stories.length; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: stories[i].color, width: 1.5 }
    });
    const png = await S.iconPng(stories[i].icon, stories[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(stories[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 16, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(stories[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 1.15,
      fontSize: 11.5, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
    });
  }
  S.addBottomCallout(s, pres, 'У каждого случая один итог: «если бы был бэкап — было бы не страшно». Не «может быть», а «будет».', S.RS);

  // ============ 3 · ПРАВИЛО 3-2-1 ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'правило', 3, TOTAL);
  S.addSlideTitle(s, 'Правило 3-2-1 — стандарт защиты');

  // 3 крупных цифры
  const rule = [
    { value: '3', color: S.CY, title: 'копии данных', desc: 'Оригинал + 2 резервные. Если умрёт одна — есть запасная.' },
    { value: '2', color: S.MT, title: 'разных носителя', desc: 'Не «два внешних диска», а внешний + облако. Разные технологии.' },
    { value: '1', color: S.AM, title: 'копия не дома', desc: 'Облако или диск у родителей. На случай пожара или кражи.' },
  ];
  for (let i = 0; i < rule.length; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addText(rule[i].value, {
      x: x + 0.1, y: 2.0, w: w - 0.2, h: 1.1,
      fontSize: 96, fontFace: S.FONT_HEADER, bold: true, color: rule[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(rule[i].title, {
      x: x + 0.1, y: 3.15, w: w - 0.2, h: 0.4,
      fontSize: 15, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(rule[i].desc, {
      x: x + 0.22, y: 3.6, w: w - 0.44, h: 0.95,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'center', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Это не «параноя». Это стандарт. Так делают банки, фотографы, программисты и просто умные люди.', S.CY);

  // ============ 4 · УРОВЕНЬ 1 — ВНЕШНИЙ ДИСК ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'уровень 1', 4, TOTAL);
  S.addSlideTitle(s, 'Уровень 1 — внешний диск');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'disk', iconColor: S.MT,
    title: 'Самое простое — флешка или USB-диск',
    body: 'Купи внешний жёсткий диск или большую флешку. Раз в неделю / месяц — копируй туда главное.\n\nЧто покупать в 2026:\n· USB-флешка 256 ГБ — около 2000₽. Для документов и фото хватит.\n· Внешний SSD 1 ТБ — около 8000₽. Быстрый, надёжный.\n· Внешний HDD 2 ТБ — около 6000₽. Дёшево и много, но медленнее.\n\nГлавное правило: после копирования — отсоедини диск и убери. Если он постоянно подключён, шифровальщик зашифрует и его.'
  });
  S.addBottomCallout(s, pres, 'Подключил → скопировал → отсоединил. Это и есть бэкап. 10 минут раз в неделю.', S.MT);

  // ============ 5 · УРОВЕНЬ 2 — ОБЛАКО ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'уровень 2', 5, TOTAL);
  S.addSlideTitle(s, 'Уровень 2 — облако');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'globe', iconColor: S.CY,
    title: 'Автоматический бэкап в интернет',
    body: 'Облачные сервисы сами синхронизируют выбранные папки. Поставил программу — забыл, она работает в фоне.\n\nВарианты в РФ 2026:\n· Яндекс.Диск — 100 ГБ за 99₽/мес, удобно, российский сервис\n· Облако Mail.ru — 128 ГБ за 75₽/мес, есть тарифы по 1 ТБ\n· Google Drive / OneDrive — работают, но 15 ГБ бесплатно, дальше платно\n\nГлавное: облако защитит даже от пожара и кражи дома. Минус — нужен интернет.'
  });
  S.addBottomCallout(s, pres, 'Можно совмещать: фото в облако (синхронизация телефона) + документы на внешний диск.', S.CY);

  // ============ 6 · УРОВЕНЬ 3 — NAS ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'уровень 3', 6, TOTAL);
  S.addSlideTitle(s, 'Уровень 3 — NAS (для продвинутых)');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'router', iconColor: S.PU,
    title: 'Собственное домашнее облако',
    body: 'NAS — это маленький компьютер с 2-4 дисками внутри. Стоит дома, к нему подключаются все твои устройства: ПК, ноут, телефон, телевизор.\n\nДля кого:\n· Семья с большим архивом фото / видео (террабайты)\n· Фрилансеры с рабочими файлами\n· Дом «умной» техники\n\nЦена входа: Synology / QNAP — от 15 000₽ за корпус + диски. Один раз вложился — потом только электричество.\n\nПлюс: твои данные у тебя дома, никакому Mail.ru не доверяешь.'
  });
  S.addBottomCallout(s, pres, 'NAS — это «облако у тебя дома». Дорогое решение, но навсегда твоё.', S.PU);

  // ============ 7 · ЧТО БЭКАПИТЬ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'что бэкапить', 7, TOTAL);
  S.addSlideTitle(s, 'Что бэкапить в первую очередь');

  const priority = [
    { num: '★', color: S.RS, title: 'Незаменимое',     desc: 'Фотографии. Видео. Личные документы. Дипломы. Если потеряешь — не вернёшь никак.' },
    { num: '◆', color: S.AM, title: 'Важное',          desc: 'Рабочие файлы. Учёба. Переписка. Восстанавливается, но это часы и нервы.' },
    { num: '·',  color: S.MT, title: 'Удобное',         desc: 'Закладки браузера. Игровые сейвы. Настройки программ. Желательно, не критично.' },
  ];
  for (let i = 0; i < priority.length; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.95) / 2, y: 2.0, w: 0.95, h: 0.95,
      fill: { color: S.BG_DARKER }, line: { color: priority[i].color, width: 2 }
    });
    s.addText(priority[i].num, {
      x: x + (w - 0.95) / 2, y: 2.0, w: 0.95, h: 0.95,
      fontSize: 40, fontFace: S.FONT_HEADER, bold: true, color: priority[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(priority[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.45,
      fontSize: 17, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(priority[i].desc, {
      x: x + 0.22, y: 3.6, w: w - 0.44, h: 1.05,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Начинай с «незаменимого». Если только это — уже выигрыш. Остальное добавишь потом.', S.RS);

  // ============ 8 · КАК ЧАСТО ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'расписание', 8, TOTAL);
  S.addSlideTitle(s, 'Как часто делать бэкап');

  const schedule = [
    { period: 'Каждый день', color: S.CY, what: 'Облачная синхронизация фото с телефона (Яндекс.Диск, Mail.Облако — авто).' },
    { period: 'Раз в неделю', color: S.MT, what: 'Скопировать новые рабочие файлы на внешний диск. 10 минут.' },
    { period: 'Раз в месяц',  color: S.AM, what: 'Полная копия документов и фото на второй диск (хранить у родителей).' },
    { period: 'Раз в полгода', color: S.PU, what: 'Проверить что бэкап реально работает — попробовать восстановить файл.' },
  ];
  for (let i = 0; i < schedule.length; i++) {
    const y = 1.95 + i * 0.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y, w: 9, h: 0.5,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.06
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 0.08, h: 0.5,
      fill: { color: schedule[i].color }, line: { type: 'none' }
    });
    s.addText(schedule[i].period, {
      x: 0.75, y, w: 2.4, h: 0.5,
      fontSize: 14, fontFace: S.FONT_BODY, bold: true, color: schedule[i].color,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(schedule[i].what, {
      x: 3.2, y, w: 6.2, h: 0.5,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Бэкап без расписания = не бэкап. Поставь напоминание в календарь раз в неделю.', S.MT);

  // ============ 9 · ПРОВЕРКА ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'проверка', 9, TOTAL);
  S.addSlideTitle(s, 'Главное — проверить что работает');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'check', iconColor: S.MT,
    title: 'Тест восстановления — раз в полгода',
    body: 'Бэкап, который не проверяли — это надежда, а не защита. Бывает: 2 года копировал на диск, а оказалось — он не читался.\n\nЧто делать раз в полгода:\n1. Открой бэкап и попробуй прочитать любой файл оттуда\n2. Если открывается — живой. Если нет — пора менять носитель.\n\nЕщё лучше: «восстанови» файл как будто оригинал пропал — потренируешься и проверишь процесс.'
  });
  S.addBottomCallout(s, pres, 'Проверка — 10 минут раз в полгода. По сравнению с потерей всех фото — это ничто.', S.MT);

  // ============ 10 · НАЧНИ СЕЙЧАС ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'старт', 10, TOTAL);
  S.addSlideTitle(s, 'С чего начать прямо сегодня');

  const start = [
    { num: '1', color: S.CY, title: 'Купи внешний диск',  desc: 'Любой 1-2 ТБ. Цена 5-8 тыс. ₽. Один раз — на годы.' },
    { num: '2', color: S.MT, title: 'Сделай первую копию', desc: 'Документы + фото = главное. Перенеси на внешний диск.' },
    { num: '3', color: S.AM, title: 'Подключи облако',    desc: 'Я.Диск или Mail.Облако. Включи синхронизацию папки «Фотографии».' },
    { num: '4', color: S.PU, title: 'Поставь напоминание', desc: 'Календарь / напоминания в телефоне: раз в неделю «обновить бэкап».' },
  ];
  for (let i = 0; i < start.length; i++) {
    const w = 2.2, h = 2.6, gap = 0.12;
    const startX = (10 - (w * 4 + gap * 3)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.85) / 2, y: 2.0, w: 0.85, h: 0.85,
      fill: { color: S.BG_DARKER }, line: { color: start[i].color, width: 1.5 }
    });
    s.addText(start[i].num, {
      x: x + (w - 0.85) / 2, y: 2.0, w: 0.85, h: 0.85,
      fontSize: 34, fontFace: S.FONT_HEADER, bold: true, color: start[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(start[i].title, {
      x: x + 0.1, y: 2.95, w: w - 0.2, h: 0.4,
      fontSize: 13, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(start[i].desc, {
      x: x + 0.18, y: 3.4, w: w - 0.36, h: 1.05,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 2
    });
  }
  S.addBottomCallout(s, pres, 'Час времени и 5000₽ сегодня = годы спокойствия завтра. Не откладывай до первой потери.', S.CY);

  // ============ СОХРАНЕНИЕ ============
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '10-Бэкапы 3-2-1.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });
