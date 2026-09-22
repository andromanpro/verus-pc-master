// Презентация #7 «Самозанятость, акты, ответственность — за 30 минут»
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'Самозанятость, акты, ответственность';
  pres.subject = 'Юридический минимум для мастера';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'обучение', 1, TOTAL);

  s.addText('КУРС ПК-МАСТЕРА · УРОК 7', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Самозанятость\nи акты', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 44
  });
  s.addText('Юридический минимум: оформиться за 10 минут, защититься актами, понимать ответственность. Без воды.', {
    x: 0.5, y: 4.1, w: 6, h: 0.7,
    fontSize: 14, fontFace: S.FONT_BODY, color: S.MUTED,
    align: 'left', valign: 'middle', margin: 0
  });

  s.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 1.55, w: 2.7, h: 2.7,
    fill: { color: S.BG_DARKER }, line: { color: S.CY, width: 2 }
  });
  const titlePng = await S.iconPng('file', S.CY, 512);
  s.addImage({ data: titlePng, x: 6.85, y: 2.0, w: 1.8, h: 1.8 });

  // ============ 2 · РИСКИ БЕЗ ОФОРМЛЕНИЯ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'риски', 2, TOTAL);
  S.addSlideTitle(s, 'Работать без оформления — риски');

  const risks = [
    { icon: 'warn',  color: S.AM, title: 'Штраф 20-40%',     desc: 'От всех полученных доходов + сам налог. Налоговая видит поступления на карту.' },
    { icon: 'cross', color: S.RS, title: 'Статья 171 УК',     desc: 'Незаконное предпринимательство при обороте >2,25 млн или особо крупном ущербе.' },
    { icon: 'lock',  color: S.PU, title: 'Один клиент → проверка', desc: 'Один скандальный клиент = жалоба = проверка = все доходы всплывают.' },
  ];
  for (let i = 0; i < risks.length; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: risks[i].color, width: 1.5 }
    });
    const png = await S.iconPng(risks[i].icon, risks[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(risks[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.45,
      fontSize: 16, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(risks[i].desc, {
      x: x + 0.22, y: 3.62, w: w - 0.44, h: 1.0,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
    });
  }
  S.addBottomCallout(s, pres, 'Самозанятость занимает 10 минут. Жить дальше спокойно — бесценно. Не откладывай.', S.RS);

  // ============ 3 · НПД ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'НПД', 3, TOTAL);
  S.addSlideTitle(s, 'Самозанятость — для 99% мастеров');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'check', iconColor: S.MT,
    title: 'НПД — Налог на профессиональный доход',
    body: 'Самый простой режим для частного мастера. Без отчётности, без бухгалтера, без кассы.\n\nУсловия:\n· Доход до 2,4 млн в год\n· Без наёмных работников\n· Не торгуешь чужими товарами под маркой\n\nПлюсы:\n· Регистрация за 10 минут через приложение «Мой налог»\n· Налог 4% с физлиц, 6% с юрлиц — считается автоматически\n· Можно совмещать с основной работой / учёбой'
  });
  S.addBottomCallout(s, pres, 'Если оборот меньше 2,4 млн в год — самозанятость это твой выбор. Без вариантов.', S.MT);

  // ============ 4 · ОФОРМЛЕНИЕ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'оформление', 4, TOTAL);
  S.addSlideTitle(s, 'Как оформить за 10 минут');

  // 4 шага в ряд
  const steps = [
    { num: '1', color: S.CY, title: 'Скачай приложение',    desc: '«Мой налог» от ФНС России. Google Play, App Store, веб-версия lknpd.nalog.ru.' },
    { num: '2', color: S.MT, title: 'Регистрация',          desc: 'Через Госуслуги или паспорт + СНИЛС. СМС-подтверждение.' },
    { num: '3', color: S.AM, title: 'Вид деятельности',     desc: '«Информационные технологии» → «Ремонт компьютеров / IT-услуги».' },
    { num: '4', color: S.PU, title: 'Готово!',              desc: 'Можно работать. Налог считается автоматически после каждого чека.' },
  ];
  const stW = 2.2, stH = 2.6, stGap = 0.12;
  const stStartX = (10 - (stW * 4 + stGap * 3)) / 2;
  for (let i = 0; i < steps.length; i++) {
    const x = stStartX + i * (stW + stGap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w: stW, h: stH,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (stW - 0.85) / 2, y: 2.0, w: 0.85, h: 0.85,
      fill: { color: S.BG_DARKER }, line: { color: steps[i].color, width: 1.5 }
    });
    s.addText(steps[i].num, {
      x: x + (stW - 0.85) / 2, y: 2.0, w: 0.85, h: 0.85,
      fontSize: 34, fontFace: S.FONT_HEADER, bold: true, color: steps[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(steps[i].title, {
      x: x + 0.1, y: 2.95, w: stW - 0.2, h: 0.4,
      fontSize: 13, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(steps[i].desc, {
      x: x + 0.18, y: 3.4, w: stW - 0.36, h: 1.05,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Никаких визитов в налоговую. Всё в приложении на телефоне. Реально 10 минут.', S.CY);

  // ============ 5 · НАЛОГИ И ЧЕКИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'налоги', 5, TOTAL);
  S.addSlideTitle(s, 'Налоги и чеки — как считается');

  // 3 крупных блока: 4% / 6% / бонус
  const tax = [
    { value: '4%', color: S.MT, title: 'С физлица',           desc: 'Обычный клиент — частный человек. Платишь 4% с суммы чека.' },
    { value: '6%', color: S.AM, title: 'С юрлица',            desc: 'Если работаешь с организацией (фирма, ИП) — ставка 6%.' },
    { value: '10к', color: S.CY, title: 'Стартовый бонус',    desc: 'Каждому новому самозанятому — 10 000₽ налогового вычета. Пока не использовал — платишь меньше.' },
  ];
  for (let i = 0; i < tax.length; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addText(tax[i].value, {
      x: x + 0.1, y: 2.0, w: w - 0.2, h: 0.9,
      fontSize: 56, fontFace: S.FONT_HEADER, bold: true, color: tax[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(tax[i].title, {
      x: x + 0.1, y: 3.0, w: w - 0.2, h: 0.45,
      fontSize: 17, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(tax[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 1.1,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'center', valign: 'top', margin: 0, paraSpaceAfter: 3
    });
  }
  S.addBottomCallout(s, pres, 'Чек делаешь в приложении после оплаты. ФНС видит доход — налог считается сам.', S.MT);

  // ============ 6 · АКТ ПРИЁМКИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'акт приёмки', 6, TOTAL);
  S.addSlideTitle(s, 'Акт приёмки — твоя защита #1');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'file', iconColor: S.CY,
    title: 'Подписываешь ДО начала работы',
    body: 'Зафиксируй состояние техники когда клиент её принёс. Тогда через 2 недели клиент не скажет «ты мне царапину поставил» или «ты мне диск убил».\n\nЧто должно быть в акте:\n· Клиент: имя и телефон\n· ПК: модель и серийный номер\n· Внешнее состояние: царапины, потёртости, дефекты экрана\n· Комплектность: что отдал клиент (БП, мышь, кабели)\n· Жалоба клиента — его словами\n· Подпись клиента и твоя\n\nДашборд Verus печатает такой акт автоматически.'
  });
  S.addBottomCallout(s, pres, 'Без акта приёмки не работаешь. Никогда. Это твоя страховка номер один.', S.CY);

  // ============ 7 · АКТ ПЕРЕДАЧИ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'акт передачи', 7, TOTAL);
  S.addSlideTitle(s, 'Акт передачи — твоя защита #2');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'check', iconColor: S.MT,
    title: 'Подписываешь после работы',
    body: 'Когда вернул ПК клиенту — клиент подтверждает что принял рабочий. Через месяц он не сможет сказать «я сразу заметил что не работает».\n\nЧто должно быть в акте:\n· Что сделано: список конкретных работ\n· Что НЕ трогал: документы, фото, переписки, пароли\n· Под риском / рекомендуется: что увидел но не починил\n· Гарантия: обычно 14 дней\n· Подпись клиента «принял рабочий»\n\nДашборд Verus также печатает автоматически.'
  });
  S.addBottomCallout(s, pres, 'Дашборд Verus — твой партнёр. Заполнил формы → распечатал → подписали. 5 минут.', S.MT);

  // ============ 8 · ПДн ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'ПДн', 8, TOTAL);
  S.addSlideTitle(s, 'Личные данные клиента — что можно');

  const pdn = [
    { icon: 'check', color: S.MT, title: 'Можно',    desc: 'Видеть железо и систему. Хранить ПК у себя для ремонта (по акту приёмки). CRM-историю визитов.' },
    { icon: 'pause', color: S.AM, title: 'С согласия', desc: 'Делать бэкап данных клиента. Открывать конкретный файл «вот этот не открывается».' },
    { icon: 'cross', color: S.RS, title: 'Нельзя',    desc: 'Копировать данные себе без разрешения. Открывать переписки и фото. Хранить копии после возврата ПК.' },
  ];
  for (let i = 0; i < pdn.length; i++) {
    const w = 2.9, h = 2.85, gap = 0.15;
    const startX = (10 - (w * 3 + gap * 2)) / 2;
    const x = startX + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.9) / 2, y: 2.05, w: 0.9, h: 0.9,
      fill: { color: S.BG_DARKER }, line: { color: pdn[i].color, width: 1.5 }
    });
    const png = await S.iconPng(pdn[i].icon, pdn[i].color);
    s.addImage({ data: png, x: x + (w - 0.7) / 2, y: 2.15, w: 0.7, h: 0.7 });
    s.addText(pdn[i].title, {
      x: x + 0.1, y: 3.1, w: w - 0.2, h: 0.4,
      fontSize: 17, fontFace: S.FONT_BODY, bold: true, color: pdn[i].color,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(pdn[i].desc, {
      x: x + 0.22, y: 3.55, w: w - 0.44, h: 1.1,
      fontSize: 12, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
    });
  }
  S.addBottomCallout(s, pres, 'Один случай слитой переписки клиента — и твоя репутация в районе мертва. Уважай личное.', S.RS);

  // ============ 9 · ЖАЛОБЫ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'жалобы', 9, TOTAL);
  S.addSlideTitle(s, 'Если клиент жалуется — что делать');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'shield', iconColor: S.AM,
    title: 'Спокойствие + документы',
    body: 'Если клиент жалуется в Роспотребнадзор или подаёт в суд — не паникуй. Жалоба не равно «виновен».\n\nЧто делаешь:\n· Собери документы — акты приёмки и передачи, чек, журнал работы (Verus всё сохраняет сам)\n· Ответь Роспотребнадзору в срок (30 дней), приложи документы\n· В суде — пиши факты без эмоций, опирайся на подписанные акты'
  });
  S.addBottomCallout(s, pres, 'Без актов ты беззащитен. С полным комплектом — юридически защищён в 99% потребительских споров.', S.AM);

  // ============ 10 · ЧЕКЛИСТ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'итог', 10, TOTAL);
  S.addSlideTitle(s, 'Чеклист готовности — 5 пунктов');

  const check = [
    { icon: 'check', color: S.MT, label: 'Самозанятость оформлена в «Мой налог»' },
    { icon: 'check', color: S.MT, label: 'Дашборд Verus печатает акты приёмки и передачи' },
    { icon: 'check', color: S.MT, label: 'Чеки выставляешь после каждой работы' },
    { icon: 'check', color: S.MT, label: 'Понимаешь что можно и что нельзя с данными клиента' },
    { icon: 'check', color: S.MT, label: 'Знаешь алгоритм действий если придёт жалоба' },
  ];
  for (let i = 0; i < check.length; i++) {
    const y = 1.95 + i * 0.55;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y, w: 9, h: 0.45,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.06
    });
    s.addShape(pres.shapes.OVAL, {
      x: 0.65, y: y + 0.05, w: 0.35, h: 0.35,
      fill: { color: S.BG_DARKER }, line: { color: check[i].color, width: 1.5 }
    });
    const png = await S.iconPng(check[i].icon, check[i].color);
    s.addImage({ data: png, x: 0.69, y: y + 0.09, w: 0.27, h: 0.27 });
    s.addText(check[i].label, {
      x: 1.15, y, w: 8.2, h: 0.45,
      fontSize: 14, fontFace: S.FONT_BODY, color: S.WHITE,
      align: 'left', valign: 'middle', margin: 0
    });
  }
  S.addBottomCallout(s, pres, 'Все пять галочек = готов к платной работе. Хоть завтра принимай первого клиента.', S.MT);

  // ============ СОХРАНЕНИЕ ============
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '07-Самозанятость и акты.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });
