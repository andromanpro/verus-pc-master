// Презентация #9 «Что я смотрю в твоём ПК и что НЕ открываю» — для клиента
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'Что я смотрю в твоём ПК и что НЕ открываю';
  pres.subject = 'Для клиента — прозрачность работы мастера';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'честный мастер', 1, TOTAL);

  s.addText('ДЛЯ КЛИЕНТА · ЧЕСТНЫЙ СЕРВИС', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Что я смотрю\nв твоём ПК', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 42
  });
  s.addText('И главное — что я НЕ открываю. Твои документы, фото и переписки — это твоё личное. Я туда не лезу.', {
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

  // ============ 2 · ПОРЯДОК РАБОТЫ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'как работаю', 2, TOTAL);
  S.addSlideTitle(s, 'Как я работаю с твоим ПК');

  const order = [
    { num: '1', color: S.CY, title: 'Акт приёмки',  desc: 'Зафиксируем состояние ПК на бумаге. Подпишем оба. Это твоя страховка.' },
    { num: '2', color: S.MT, title: 'Диагностика',  desc: 'Запускаю программу, она показывает железо и систему. Никаких файлов не открываю.' },
    { num: '3', color: S.AM, title: 'Скажу что нашёл', desc: 'Цифры на экране — ты видишь сам. Объясняю по-человечески, без терминов.' },
    { num: '4', color: S.PU, title: 'Цена до работы',  desc: 'Назову точную цену до ремонта. Без сюрпризов в счёте.' },
    { num: '5', color: S.RS, title: 'Делаю с твоего «да»', desc: 'Ничего не меняю без твоего согласия. Решение — за тобой.' },
    { num: '6', color: S.MT, title: 'Акт передачи', desc: 'Подписываем что приняли работу. Гарантия 14 дней.' },
  ];
  const oW = 2.9, oH = 1.4, oGap = 0.12;
  const oStartX = (10 - (oW * 3 + oGap * 2)) / 2;
  for (let i = 0; i < order.length; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = oStartX + col * (oW + oGap), y = 1.8 + row * (oH + oGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: oW, h: oH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: y + 0.28, w: 0.55, h: 0.55,
      fill: { color: S.BG_DARKER }, line: { color: order[i].color, width: 1.5 }
    });
    s.addText(order[i].num, {
      x: x + 0.2, y: y + 0.28, w: 0.55, h: 0.55,
      fontSize: 22, fontFace: S.FONT_HEADER, bold: true, color: order[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(order[i].title, {
      x: x + 0.88, y: y + 0.18, w: oW - 1.0, h: 0.35,
      fontSize: 13, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
    s.addText(order[i].desc, {
      x: x + 0.2, y: y + 0.78, w: oW - 0.4, h: 0.6,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Никакой магии. Прозрачно, с бумагами, по согласию. Так работает честный мастер.', S.CY);

  // ============ 3 · ЗДОРОВЬЕ ДИСКА ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'диск', 3, TOTAL);
  S.addSlideTitle(s, 'Здоровье твоего диска');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'disk', iconColor: S.CY,
    title: 'Диск сам ведёт дневник',
    body: 'Каждый современный диск сам считает свои часы работы, ошибки и износ. Это называется SMART.\n\nПрограмма CrystalDiskInfo читает эти цифры и показывает мне:\n· Сколько лет диск проработал\n· Есть ли сбои чтения или записи\n· Сколько ресурса осталось (для SSD)\n\nЕсли в SMART красные показатели — твои фотографии и документы под угрозой. Я покажу цифры на экране, и ты сам решишь: менять диск сейчас или подождать.'
  });
  S.addBottomCallout(s, pres, 'Это не моё мнение «диск плохой» — это сам диск пишет о себе. Цифры — наша общая правда.', S.CY);

  // ============ 4 · ТЕМПЕРАТУРЫ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'температуры', 4, TOTAL);
  S.addSlideTitle(s, 'Почему ПК тормозит и выключается');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'thermo', iconColor: S.AM,
    title: 'Перегрев — самая частая причина',
    body: 'Если ПК тормозит в играх, выключается под нагрузкой или гудит как самолёт — почти всегда это перегрев.\n\nПричины (за 2-3 года накапливаются):\n· Пыль забивает радиатор — воздух не проходит, тепло не отводится\n· Термопаста между процессором и радиатором высыхает\n\nЯ показываю температуру в реальном времени. Если высокая — чистка от пыли и замена термопасты решают проблему. Это типовая профилактика раз в 1-2 года.'
  });
  S.addBottomCallout(s, pres, 'Профилактика дешевле ремонта. 1200₽ на чистку — и ПК снова работает как новый.', S.AM);

  // ============ 5 · ВИРУСЫ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'вирусы и реклама', 5, TOTAL);
  S.addSlideTitle(s, 'Что я ищу из «нежелательного»');

  const malware = [
    { icon: 'cross', color: S.RS, title: 'Вирусы и трояны', desc: 'Программы которые крадут пароли или майнят криптовалюту на твоём ПК.' },
    { icon: 'warn',  color: S.AM, title: 'Рекламное ПО',    desc: 'Реклама везде, новая стартовая страница в браузере, всплывающие окна.' },
    { icon: 'lock',  color: S.PU, title: 'Подозрительные настройки', desc: 'Антивирус отключён без твоего ведома, странные программы в автозагрузке.' },
  ];
  for (let i = 0; i < malware.length; i++) {
    const w = 2.9, h = 2.6, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: malware[i].color, width: 1.5 }
    });
    const png = await S.iconPng(malware[i].icon, malware[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(malware[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 16, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(malware[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 0.85,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Найдёт программа — покажу тебе список и спрошу что удалять. Ничего не убираю без согласия.', S.MT);

  // ============ 6 · ГЛАВНОЕ — ЧТО Я НЕ ОТКРЫВАЮ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'твоё личное', 6, TOTAL);
  S.addSlideTitle(s, 'Что я НЕ открываю — никогда');

  const notTouch = [
    { icon: 'file',  color: S.MT, label: 'Твои документы (Word, Excel, PDF)' },
    { icon: 'gpu',   color: S.MT, label: 'Фотографии и видео' },
    { icon: 'list',  color: S.MT, label: 'Переписки в мессенджерах и почте' },
    { icon: 'lock',  color: S.MT, label: 'Сохранённые пароли в браузере' },
    { icon: 'globe', color: S.MT, label: 'История посещённых сайтов' },
    { icon: 'shield',color: S.MT, label: 'Банковские приложения и Госуслуги' },
  ];
  for (let i = 0; i < notTouch.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const w = 4.35, h = 0.8, gap = 0.15;
    const startX = (10 - (w * 2 + gap)) / 2;
    const x = startX + col * (w + gap), y = 1.9 + row * (h + 0.1);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.MT, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.15, y: y + 0.18, w: 0.45, h: 0.45,
      fill: { color: S.BG_DARKER }, line: { color: S.MT, width: 1.5 }
    });
    const png = await S.iconPng('check', S.MT);
    s.addImage({ data: png, x: x + 0.205, y: y + 0.235, w: 0.34, h: 0.34 });
    s.addText(notTouch[i].label, {
      x: x + 0.75, y, w: w - 0.9, h,
      fontSize: 14, fontFace: S.FONT_BODY, color: S.WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Эти галочки — в акте передачи. Подписываю, что ничего из этого не открывал и не копировал.', S.MT);

  // ============ 7 · АКТ ПРИЁМКИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'акт приёмки', 7, TOTAL);
  S.addSlideTitle(s, 'Акт приёмки — мы оба защищены');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'file', iconColor: S.CY,
    title: 'Подпишем перед тем как я унесу ПК',
    body: 'На бумаге зафиксируем:\n· Твои контакты — кому возвращать ПК\n· Модель и серийный номер устройства\n· Внешнее состояние: царапины, потёртости, сколы (если есть)\n· Что в комплекте: блок питания, кабели, мышь\n· Твоя жалоба — твоими словами\n\nЗачем это нам обоим: ты защищён от «мастер подменил мне ноутбук». Я защищён от «верни мне исправный, ты что-то сломал». Через 2 недели память подведёт нас обоих — а бумага не врёт.'
  });
  S.addBottomCallout(s, pres, 'Распечатываю прямо у тебя. Один экземпляр забираю с собой, один — тебе.', S.CY);

  // ============ 8 · АКТ ПЕРЕДАЧИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'акт передачи', 8, TOTAL);
  S.addSlideTitle(s, 'Акт передачи — что я сделал');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'check', iconColor: S.MT,
    title: 'Подпишем когда я верну ПК',
    body: 'На бумаге будет:\n· Что я сделал — список конкретных работ\n· Что я НЕ трогал — твои документы, фото, переписки, пароли\n· Под риском / рекомендуется — что заметил, но не починил (например «диск износ 88%»)\n· Гарантия 14 дней на выполненные работы\n· Следующее ТО — когда профилактика рекомендуется\n\nЭто и чек к нему — твои документы что работа сделана. Если через неделю что-то перестанет работать — я приеду по гарантии бесплатно.'
  });
  S.addBottomCallout(s, pres, 'Гарантия 14 дней на мою работу. Если по моей вине — починю бесплатно. Это в акте.', S.MT);

  // ============ 9 · ОПЛАТА И ЧЕК ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'оплата', 9, TOTAL);
  S.addSlideTitle(s, 'Как платить — официально');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'key', iconColor: S.AM,
    title: 'Я зарегистрирован как самозанятый',
    body: 'Работаю официально, как самозанятый в системе НПД. Это значит:\n\n· После оплаты пробью тебе чек в приложении «Мой налог»\n· Чек придёт на твою почту или в мессенджер\n· Налог 4% я плачу сам, тебе только сумма работы\n\nПлатить можно как удобно:\n· Наличными\n· Переводом по СБП (QR-код покажу)\n· На карту банка\n\nЧек официальный — можешь использовать для отчёта на работе или в декларации.'
  });
  S.addBottomCallout(s, pres, 'Никакой «работы в чёрную». Чек, акты, гарантия — всё как у нормального сервиса.', S.AM);

  // ============ 10 · ИТОГ — ОБЕЩАНИЯ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'обещаю', 10, TOTAL);
  S.addSlideTitle(s, 'Что я тебе обещаю');

  const promises = [
    { icon: 'check',  color: S.MT, title: 'Честно',     desc: 'Покажу что нашёл цифрами. Не «у тебя плохой ПК», а конкретные показатели.' },
    { icon: 'lock',   color: S.CY, title: 'Уважительно',desc: 'Твои документы, фото и переписки — твоё личное. Я туда не лезу.' },
    { icon: 'list',   color: S.AM, title: 'С бумагой',  desc: 'Акт приёмки + акт передачи + чек. Всё официально, без воды.' },
    { icon: 'shield', color: S.PU, title: 'С гарантией', desc: 'Если что-то отвалится по моей работе — приеду бесплатно в течение 14 дней.' },
  ];
  for (let i = 0; i < promises.length; i++) {
    const w = 2.2, h = 2.6, gap = 0.12;
    const startX = (10 - (w * 4 + gap * 3)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.85) / 2, y: 2.0, w: 0.85, h: 0.85,
      fill: { color: S.BG_DARKER }, line: { color: promises[i].color, width: 1.5 }
    });
    const png = await S.iconPng(promises[i].icon, promises[i].color);
    s.addImage({ data: png, x: x + (w - 0.65) / 2, y: 2.1, w: 0.65, h: 0.65 });
    s.addText(promises[i].title, {
      x: x + 0.1, y: 2.95, w: w - 0.2, h: 0.5,
      fontSize: 16, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(promises[i].desc, {
      x: x + 0.18, y: 3.5, w: w - 0.36, h: 0.95,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 2
    });
  }
  S.addBottomCallout(s, pres, 'Спасибо что доверяешь мне свой ПК. Я отношусь к этому серьёзно.', S.CY);

  // ============ СОХРАНЕНИЕ ============
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '09-Что я смотрю в твоём ПК.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });
