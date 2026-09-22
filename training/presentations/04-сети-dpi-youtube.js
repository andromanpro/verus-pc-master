// Презентация #4 «Сети, провайдер, DPI — починка YouTube/Telegram»
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'Сети и DPI — починка YouTube и Telegram';
  pres.subject = 'Урок 4 курса «Мастер ПК»';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'обучение', 1, TOTAL);

  s.addText('КУРС ПК-МАСТЕРА · УРОК 4', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Сети\nи интернет', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 50
  });
  s.addText('Где чья зона ответственности — и как чинить торможение YouTube, Discord и Telegram локально, без VPN.', {
    x: 0.5, y: 4.1, w: 6, h: 0.7,
    fontSize: 14, fontFace: S.FONT_BODY, color: S.MUTED,
    align: 'left', valign: 'middle', margin: 0
  });

  s.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 1.55, w: 2.7, h: 2.7,
    fill: { color: S.BG_DARKER }, line: { color: S.CY, width: 2 }
  });
  const titlePng = await S.iconPng('globe', S.CY, 512);
  s.addImage({ data: titlePng, x: 6.85, y: 2.0, w: 1.8, h: 1.8 });

  // ============ 2 · СХЕМА: ПК → РОУТЕР → ПРОВАЙДЕР → ИНТЕРНЕТ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'схема', 2, TOTAL);
  S.addSlideTitle(s, 'Где чья зона ответственности');

  // 4 узла в ряд + стрелки между ними
  const nodes = [
    { icon: 'pc',     color: S.CY, title: 'ПК клиента',    sub: 'Wi-Fi, кабель,\nнастройки сети' },
    { icon: 'router', color: S.MT, title: 'Роутер',        sub: 'Wi-Fi дома,\nраздаёт интернет' },
    { icon: 'plug',   color: S.AM, title: 'Провайдер',     sub: 'Кабель в дом,\nограничения скорости' },
    { icon: 'globe',  color: S.PU, title: 'Интернет',      sub: 'Серверы YouTube,\nTelegram и т.д.' },
  ];
  const nW = 1.95, nH = 2.6;
  const totalNodesW = nW * 4 + 0.3 * 3; // 4 узла + 3 стрелки 0.3
  const startX = (10 - totalNodesW) / 2;
  for (let i = 0; i < nodes.length; i++) {
    const x = startX + i * (nW + 0.3);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w: nW, h: nH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (nW - 0.8) / 2, y: 2.05, w: 0.8, h: 0.8,
      fill: { color: S.BG_DARKER }, line: { color: nodes[i].color, width: 1.5 }
    });
    const png = await S.iconPng(nodes[i].icon, nodes[i].color);
    s.addImage({ data: png, x: x + (nW - 0.62) / 2, y: 2.14, w: 0.62, h: 0.62 });
    s.addText(nodes[i].title, {
      x: x + 0.1, y: 2.95, w: nW - 0.2, h: 0.4,
      fontSize: 15, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(nodes[i].sub, {
      x: x + 0.15, y: 3.4, w: nW - 0.3, h: 1.0,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'center', valign: 'top', margin: 0
    });
    // Стрелка → между карточками
    if (i < nodes.length - 1) {
      const arrX = x + nW + 0.03;
      s.addText('→', {
        x: arrX, y: 2.85, w: 0.24, h: 0.4,
        fontSize: 22, fontFace: S.FONT_HEADER, bold: true, color: S.CY,
        align: 'center', valign: 'middle', margin: 0
      });
    }
  }
  S.addBottomCallout(s, pres, 'Прежде чем чинить — пойми где ломается. Часто проблема не на ПК, а в провайдере или роутере.', S.CY);

  // ============ 3 · 4 КОМАНДЫ ДИАГНОСТИКИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'команды', 3, TOTAL);
  S.addSlideTitle(s, '4 команды для диагностики сети');

  const netCmds = [
    { cmd: 'ipconfig /all', color: S.CY, desc: 'Какой у меня IP, шлюз, DNS. Стартовая команда.' },
    { cmd: 'ping ya.ru', color: S.MT, desc: 'Отвечает сервер или нет? Сколько мс задержка?' },
    { cmd: 'tracert ya.ru', color: S.AM, desc: 'Через какие узлы идёт пакет. Где обрыв.' },
    { cmd: 'nslookup ya.ru', color: S.PU, desc: 'Имя превращается в IP. Если нет — DNS сломан.' },
  ];
  for (let i = 0; i < netCmds.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const w = 4.35, h = 1.35, gap = 0.18;
    const startX2 = (10 - (w * 2 + gap)) / 2;
    const x = startX2 + col * (w + gap), y = 1.85 + row * (h + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.25, y: y + 0.3, w: 0.75, h: 0.75,
      fill: { color: S.BG_DARKER }, line: { color: netCmds[i].color, width: 1.5 }
    });
    const png = await S.iconPng('terminal', netCmds[i].color);
    s.addImage({ data: png, x: x + 0.35, y: y + 0.4, w: 0.55, h: 0.55 });
    s.addText(netCmds[i].cmd, {
      x: x + 1.15, y: y + 0.2, w: w - 1.3, h: 0.45,
      fontSize: 16, fontFace: S.FONT_MONO, bold: true, color: netCmds[i].color,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(netCmds[i].desc, {
      x: x + 1.15, y: y + 0.65, w: w - 1.3, h: 0.55,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Открой cmd → набери команду. Цифры расскажут, где беда раньше чем клиент.', S.CY);

  // ============ 4 · DNS — что это ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'DNS', 4, TOTAL);
  S.addSlideTitle(s, 'DNS — телефонная книга интернета');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'list', iconColor: S.MT,
    title: 'Имя → IP-адрес',
    body: 'Сайт «youtube.com» — это просто имя. У него за кулисами IP, например 142.250.184.78. DNS — это служба, которая по имени отдаёт IP.\n\nКак ломается:\n· DNS-сервер провайдера тупит → сайты «не открываются по имени, но работают по IP»\n· DNS подменён вирусом → ты идёшь на «youtube.com», а попадаешь на фишинг\n\nЛечение:\n· В свойствах сети сменить DNS на Cloudflare 1.1.1.1 или Google 8.8.8.8\n· Команда `ipconfig /flushdns` — сброс кэша'
  });
  S.addBottomCallout(s, pres, 'Если ping работает по IP но не работает по имени — почти точно DNS виноват.', S.MT);

  // ============ 5 · DPI и TSPU ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'DPI и TSPU', 5, TOTAL);
  S.addSlideTitle(s, 'Почему YouTube тормозит в РФ');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'filter', iconColor: S.RS,
    title: 'TSPU — провайдер смотрит в твои пакеты',
    body: 'С 2022 у российских провайдеров установлено оборудование TSPU. Оно смотрит ЧТО внутри каждого пакета — это называется Deep Packet Inspection (DPI).\n\nКогда оборудование видит «это пакет к YouTube» — оно специально замедляет соединение. Цель: чтобы видео грузилось плохо.\n\nКак это выглядит у клиента:\n· YouTube открывается, но видео крутится бесконечно\n· Telegram-чат работает, а звонки рассыпаются\n· На том же Wi-Fi через 4G на телефоне — всё в порядке (другой провайдер)'
  });
  S.addBottomCallout(s, pres, 'Это не клиентский ПК и не его Wi-Fi. Это провайдер. Объясни клиенту — снимешь его панику.', S.RS);

  // ============ 6 · GoodbyeDPI ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'GoodbyeDPI', 6, TOTAL);
  S.addSlideTitle(s, 'GoodbyeDPI — лечит локально');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'shield', iconColor: S.CY,
    title: 'Open-source утилита от ValdikSS',
    body: 'GoodbyeDPI меняет формат сетевых пакетов так, что TSPU не может их «прочитать» и замедлить. Никуда за границу твой трафик не идёт — это не VPN, это локальная правка пакетов.\n\nЧто делает мастер:\n· В дашборде Verus: кнопка «🎬 Починить YouTube/Discord/Telegram»\n· Выбирает GoodbyeDPI → «Поставить сервис»\n· Через 5 секунд YouTube грузит видео нормально\n\nГоды проверки: проект ValdikSS с 2017, работает у миллионов людей. Бесплатно. Без подписок. Без аккаунтов.'
  });
  S.addBottomCallout(s, pres, 'GoodbyeDPI — стандарт. Решает 80-90% жалоб на торможение YouTube и Discord.', S.CY);

  // ============ 7 · zapret ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'zapret', 7, TOTAL);
  S.addSlideTitle(s, 'zapret — когда GoodbyeDPI не пробил');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'bolt', iconColor: S.AM,
    title: 'Расширенный обход для новых TSPU',
    body: 'TSPU обновляются. Когда провайдер закрывает дыру, в которую пролезал GoodbyeDPI — выходит zapret с новой стратегией. У нас на флешке версия от Flowseal с готовыми .bat для YouTube, Discord и Telegram.\n\nКогда брать zapret:\n· GoodbyeDPI поставил, YouTube всё равно тормозит\n· Нужны голос или видеозвонки в Telegram (zapret умеет UDP)\n· Жёсткий регион (Москва, СПб — иногда GoodbyeDPI не пробивает)'
  });
  S.addBottomCallout(s, pres, 'Сначала пробуй GoodbyeDPI. Не помог — переключайся на zapret. Это в той же модалке дашборда.', S.AM);

  // ============ 8 · ЗВОНКИ В TELEGRAM ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'голос в Telegram', 8, TOTAL);
  S.addSlideTitle(s, 'Голос в Telegram — частично');

  // 3 столбца: TCP / UDP / Telegram-звонки
  const proto = [
    { color: S.MT, title: 'TCP-трафик',         desc: 'Веб-страницы, чаты в Telegram, картинки. GoodbyeDPI/zapret пробивают почти всегда.' },
    { color: S.AM, title: 'UDP-трафик',         desc: 'Видеозвонки, голос. Лечится только zapret и не всегда. У провайдера разная политика к UDP.' },
    { color: S.RS, title: 'Что не вылечить',    desc: 'Если провайдер режет UDP жёстко — звонки в Telegram локально не починить. Нужен VPN.' },
  ];
  for (let i = 0; i < proto.length; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX2 = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX2 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.85) / 2, y: 2.0, w: 0.85, h: 0.85,
      fill: { color: S.BG_DARKER }, line: { color: proto[i].color, width: 1.5 }
    });
    const ic = i === 0 ? 'check' : (i === 1 ? 'warn' : 'cross');
    const png = await S.iconPng(ic, proto[i].color);
    s.addImage({ data: png, x: x + (w - 0.65) / 2, y: 2.1, w: 0.65, h: 0.65 });
    s.addText(proto[i].title, {
      x: x + 0.1, y: 2.95, w: w - 0.2, h: 0.4,
      fontSize: 17, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(proto[i].desc, {
      x: x + 0.22, y: 3.45, w: w - 0.44, h: 1.2,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
    });
  }
  S.addBottomCallout(s, pres, 'Скажи клиенту честно: чат лечу, видеосообщения — лечу, звонки — может и не выйти. Тогда VPN.', S.AM);

  // ============ 9 · ГРАНИЦА VPN ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'VPN', 9, TOTAL);
  S.addSlideTitle(s, 'Когда локального уже не хватает');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'lock', iconColor: S.PU,
    title: 'Граница локальных решений',
    body: 'VPN — это туннель через зарубежный сервер. Весь твой трафик идёт через него, провайдер видит только зашифрованный поток.\n\nКогда VPN реально нужен:\n· Звонки в Telegram через UDP в проблемных регионах\n· Сервисы которые не «замедлены», а реально заблокированы\n· Корпоративные ресурсы за рубежом\n\nЧто предлагать: AmneziaVPN (российский open-source) или Outline. Клиент платит VPS-провайдеру сам ~200₽/мес.'
  });
  S.addBottomCallout(s, pres, 'VPN — последний шаг. Дороже, сложнее, может перестать работать. Сначала локальные средства.', S.PU);

  // ============ 10 · АЛГОРИТМ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'итог', 10, TOTAL);
  S.addSlideTitle(s, 'Алгоритм диагностики сети');

  const steps = [
    { num: '1', color: S.CY, title: 'Открой Verus → probe', desc: 'Дашборд сам пингует YouTube/Telegram/Discord/Cloudflare. Если красное — есть замедление.' },
    { num: '2', color: S.MT, title: 'Поставь GoodbyeDPI',   desc: 'Кнопка «🎬 Починить» → GoodbyeDPI → сервис. 80% случаев решается за 5 секунд.' },
    { num: '3', color: S.AM, title: 'Не помогло → zapret',  desc: 'Та же модалка → zapret. Особенно если жалуются на голос в Telegram.' },
    { num: '4', color: S.PU, title: 'Не помогло → VPN',     desc: 'AmneziaVPN или Outline. Это отдельная услуга, дороже. Объясни клиенту риски.' },
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
  S.addBottomCallout(s, pres, 'Не лезь в роутер и DNS пока не убедился что проблема не в DPI. Сначала probe.', S.CY);

  // ============ СОХРАНЕНИЕ ============
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '04-Сети и DPI — починка YouTube.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });
