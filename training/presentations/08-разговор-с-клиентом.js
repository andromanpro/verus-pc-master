// Презентация #8 «Как разговаривать с клиентом — типовые ситуации»
'use strict';

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const S = require('./_common.js');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Verus';
  pres.title = 'Разговор с клиентом — типовые ситуации';
  pres.subject = 'Урок 8 курса «Мастер ПК»';

  const TOTAL = 10;

  // ============ 1 · ТИТУЛ ============
  let s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'обучение', 1, TOTAL);

  s.addText('КУРС ПК-МАСТЕРА · УРОК 8', {
    x: 0.5, y: 1.8, w: 6, h: 0.35,
    fontSize: 13, fontFace: S.FONT_MONO, charSpacing: 6, color: S.CY,
    align: 'left', valign: 'middle', margin: 0
  });
  S.addSlideTitle(s, 'Разговор\nс клиентом', {
    x: 0.5, y: 2.15, w: 6, h: 1.85, fontSize: 46
  });
  s.addText('Половина успеха мастера — не в железе, а в словах. Готовые скрипты для 8 типовых ситуаций.', {
    x: 0.5, y: 4.1, w: 6, h: 0.7,
    fontSize: 14, fontFace: S.FONT_BODY, color: S.MUTED,
    align: 'left', valign: 'middle', margin: 0
  });

  s.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 1.55, w: 2.7, h: 2.7,
    fill: { color: S.BG_DARKER }, line: { color: S.CY, width: 2 }
  });
  const titlePng = await S.iconPng('list', S.CY, 512);
  s.addImage({ data: titlePng, x: 6.85, y: 2.0, w: 1.8, h: 1.8 });

  // ============ 2 · ГЛАВНОЕ ПРАВИЛО ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'правило', 2, TOTAL);
  S.addSlideTitle(s, 'Главное правило разговора');

  await S.addBigDetailCard(s, pres, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    icon: 'check', iconColor: S.MT,
    title: 'Помогать, а не продавать',
    body: 'Когда клиент чувствует что ты искренне на его стороне — он становится постоянным и рассказывает о тебе другим. Когда чувствует что ты «впариваешь» — уходит к конкуренту.\n\n· Покажи цифры на экране — клиент сам поймёт что не так\n· Дай 2 варианта решения, не один (вариант = свобода)\n· Не дави сроком и страхом\n· Если можно не чинить — скажи это честно\n\nПравило простое: представь что чинишь ПК своему другу. Что бы ты сказал ему? Так и говори с клиентом.'
  });
  S.addBottomCallout(s, pres, 'Постоянный клиент стоит дороже 10 разовых. Зарабатывай доверие, не разовый чек.', S.MT);

  // ============ 3 · ПЕРВЫЙ КОНТАКТ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'первый контакт', 3, TOTAL);
  S.addSlideTitle(s, '«Сколько будет стоить?» — по телефону');

  await scriptCard(s, pres, {
    color: S.CY,
    situation: 'Незнакомый человек пишет в чат / звонит: «Здравствуйте, у меня тормозит ноутбук. Сколько будет стоить починить?»',
    answer: '«Чтобы назвать цену — нужна диагностика, она у меня бесплатная. Тормоза могут быть от 5 разных причин: цена от 0 (просто почистить автозагрузку) до 8000₽ (умирающий диск). Сначала посмотрю — потом скажу точно. Где удобнее: я приеду или привезёшь?»',
    why: 'Не называй цену по телефону. Бесплатная диагностика снимает страх клиента и сразу переводит в действие.'
  });
  S.addBottomCallout(s, pres, 'Цена «по телефону» — ловушка. Либо завысишь и испугаешь, либо занизишь и потом стыдно поднимать.', S.CY);

  // ============ 4 · ТОРГ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'торг', 4, TOTAL);
  S.addSlideTitle(s, '«А сосед сделает за 500₽»');

  await scriptCard(s, pres, {
    color: S.AM,
    situation: 'Клиент торгуется на месте: «Слушай, 1500₽ — это много. У меня сосед говорит он делает за 500. Может скинешь?»',
    answer: '«Понимаю, бюджет важен. Моя цена — 1500₽: это с гарантией 14 дней и полным актом передачи. Если сосед делает за 500 — попробуй у него, я не обижусь. Если что-то не получится — звони, возьму ту же 1500₽ и сделаю до результата.»',
    why: 'Не оправдывайся. Не сравнивайся. Знай свою цену. Парадокс: люди соглашаются проще когда не давишь.'
  });
  S.addBottomCallout(s, pres, 'Скидка — только обоснованная (пенсионер, оптом, постоянный). Не «потому что попросил».', S.AM);

  // ============ 5 · ПЛОХАЯ НОВОСТЬ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'плохая новость', 5, TOTAL);
  S.addSlideTitle(s, 'Сообщить что диск умирает');

  await scriptCard(s, pres, {
    color: S.RS,
    situation: 'После диагностики ты видишь: SMART красный, износ 92%, ошибок чтения 47. На диске вся бухгалтерия за 5 лет.',
    answer: '«Слушай. Мне есть что сказать, и это не самое приятное. Твой диск — на финишной прямой. Сейчас работает, но через месяц-полгода однажды утром не включится. Что предлагаю: сегодня сделать бэкап (бесплатно, 30 мин), на неделе — новый SSD + перенос системы (~9000₽). Это дешевле чем потом восстановление в лаборатории. Решать тебе.»',
    why: 'Подготовь («есть что сказать»). Дай цифры. Покажи последствия. Дай план. Не дави.'
  });
  S.addBottomCallout(s, pres, 'Цифры (а не «диск ужасен») — это диск пишет о себе. Не твоё мнение. Клиент верит цифрам.', S.RS);

  // ============ 6 · НЕЛЕГАЛЬНАЯ ПРОСЬБА ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'нелегальное', 6, TOTAL);
  S.addSlideTitle(s, '«Поставь активатор Windows»');

  await scriptCard(s, pres, {
    color: S.PU,
    situation: 'Клиент просит установить пиратский активатор Windows / пиратский Photoshop / прочее нелегальное.',
    answer: '«Не возьмусь — не потому что не умею, а потому что активаторы в 30% случаев это трояны. У меня были люди — получили бесплатную винду и майнер в нагрузку. Если хочешь легально: лицензия ~6000₽ в DNS, либо OEM-ключ за 2000₽ на маркетплейсе. Либо Linux бесплатно — для офиса подходит, настрою.»',
    why: 'Откажись прямо, без морализаторства. Объясни ПОЧЕМУ клиенту вредно. Предложи легальную альтернативу.'
  });
  S.addBottomCallout(s, pres, 'Не читай мораль («это плохо»). Не торгуйся («ну если за тройную цену»). Просто отказ + альтернатива.', S.PU);

  // ============ 7 · КОНФЛИКТ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'конфликт', 7, TOTAL);
  S.addSlideTitle(s, '«Ты мне что-то сломал!»');

  await scriptCard(s, pres, {
    color: S.AM,
    situation: 'Через 3 дня после твоей работы (чистка от пыли) клиент звонит злой: «У меня Wi-Fi теперь пропадает каждые 10 минут! Ты что-то сделал!»',
    answer: '«Понял тебя. Сейчас разберёмся. Wi-Fi пропадает каждые 10 минут — серьёзно. Подъеду посмотрю бесплатно. Если проблема от моей работы — починю за свой счёт. Если не от моей — поставлю диагноз и скажу что чинить, но это отдельный заказ. Когда удобно?»',
    why: 'Первая реакция (защитная): «это не я!». НЕ говори этого. Спокойно: бесплатный визит → диагностика → честный итог.'
  });
  S.addBottomCallout(s, pres, 'Если ты накосячил — признай и почини бесплатно. Если нет — покажи факты без эмоций. Не спорь по телефону.', S.AM);

  // ============ 8 · БАБУШКА ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'бабушка', 8, TOTAL);
  S.addSlideTitle(s, 'Пожилой клиент с недоверием');

  await scriptCard(s, pres, {
    color: S.MT,
    situation: 'Бабушка по телефону: «Сынок, я тебя боюсь. Сосед как-то приходил, всё забрал и денег попросил много, а лучше не стало.»',
    answer: '«Не волнуйтесь, обманывать не буду. Сначала приеду посмотрю бесплатно. Скажу что не так и сколько починка стоит. Если согласитесь — починю, заплатите наличными после. Если не согласитесь — уеду, ничего не должны. Обычно мои работы 1000-3000 рублей.»',
    why: 'Спокойный тон, без давления. Назови верхнюю границу цены до встречи. Бесплатная диагностика — твой главный аргумент.'
  });
  S.addBottomCallout(s, pres, 'Не трогай банки и Госуслуги бабушки. Никогда. И не оставайся дольше нужного. Чай не пей.', S.MT);

  // ============ 9 · АЙТИШНИК ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'айтишник', 9, TOTAL);
  S.addSlideTitle(s, 'Клиент, который сам в IT');

  await scriptCard(s, pres, {
    color: S.PU,
    situation: 'Программист стоит над душой во время твоей работы: «А зачем ты вот это делаешь? Я бы по-другому. Я когда сам разбирал — всё работало.»',
    answer: '«Да, можно и так. Я делаю по-другому потому что [конкретная причина]. Смотри, вот я снял теплосъёмник — видишь термопаста? Превратилась в камень. Когда ты сам разбирал, она была свежая. Сейчас прошло 3 года — норма. Поставлю Arctic MX-4, теплопроводность 8.5 — будет как раньше.»',
    why: 'Это сложный, но не плохой клиент. Признай его компетенцию. Объясняй технически — он любит детали. Не нервничай на провокации.'
  });
  S.addBottomCallout(s, pres, 'Айтишник часто рекомендует тебя другим программистам. Это отличный канал клиентов.', S.PU);

  // ============ 10 · ИТОГ ============
  s = pres.addSlide();
  s.background = { color: S.BG };
  S.addBgDecor(s, pres);
  S.addHeaderTag(s, pres, 'итог', 10, TOTAL);
  S.addSlideTitle(s, '4 принципа любого разговора');

  const principles = [
    { icon: 'check',  color: S.MT, title: 'Помогать, не продавать', desc: 'Покажи цифры, дай варианты, не дави на страх и срок.' },
    { icon: 'list',   color: S.CY, title: 'Цена — после диагностики', desc: 'Никаких прайсов по телефону. Сначала смотрю, потом говорю.' },
    { icon: 'shield', color: S.AM, title: 'Не оправдывайся',         desc: 'Знай свою цену. Не сравнивайся с конкурентами. Не извиняйся за работу.' },
    { icon: 'cross',  color: S.RS, title: 'Умей сказать «нет»',      desc: 'Нелегальное, выше уровня, BitLocker без ключа — прямой отказ + альтернатива.' },
  ];
  for (let i = 0; i < principles.length; i++) {
    const w = 2.2, h = 2.6, gap = 0.12;
    const startX2 = (10 - (w * 4 + gap * 3)) / 2;
    const x = startX2 + i * (w + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w, h,
      fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.08
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + (w - 0.85) / 2, y: 2.0, w: 0.85, h: 0.85,
      fill: { color: S.BG_DARKER }, line: { color: principles[i].color, width: 1.5 }
    });
    const png = await S.iconPng(principles[i].icon, principles[i].color);
    s.addImage({ data: png, x: x + (w - 0.65) / 2, y: 2.1, w: 0.65, h: 0.65 });
    s.addText(principles[i].title, {
      x: x + 0.1, y: 2.95, w: w - 0.2, h: 0.5,
      fontSize: 13, fontFace: S.FONT_BODY, bold: true, color: S.WHITE,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(principles[i].desc, {
      x: x + 0.18, y: 3.5, w: w - 0.36, h: 0.95,
      fontSize: 11, fontFace: S.FONT_BODY, color: S.MUTED,
      align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 2
    });
  }
  S.addBottomCallout(s, pres, 'Тренируйся на друзьях. Записывай разговоры на диктофон. Через 50 клиентов появится свой стиль.', S.CY);

  // ============ СОХРАНЕНИЕ ============
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '08-Разговор с клиентом.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('Saved:', outPath);
})().catch(err => { console.error(err); process.exit(1); });

// Хелпер: карточка скрипта разговора — ситуация → ответ → пояснение
async function scriptCard(slide, pres, opts) {
  const { color, situation, answer, why } = opts;
  // Большая карточка-фон
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.85, w: 9, h: 2.85,
    fill: { color: S.CARD_BG }, line: { color: S.CARD_BORDER, width: 1 }, rectRadius: 0.1
  });
  // Слева — ситуация
  slide.addText('СИТУАЦИЯ', {
    x: 0.75, y: 1.95, w: 2.7, h: 0.3,
    fontSize: 10, fontFace: S.FONT_MONO, charSpacing: 3, color: S.MUTED,
    align: 'left', valign: 'middle', margin: 0
  });
  slide.addText(situation, {
    x: 0.75, y: 2.25, w: 2.7, h: 2.35,
    fontSize: 11.5, fontFace: S.FONT_BODY, color: S.WHITE,
    align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
  });
  // Разделитель
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 3.6, y: 1.95, w: 0.02, h: 2.65,
    fill: { color: S.CARD_BORDER }, line: { type: 'none' }
  });
  // Справа — ответ
  slide.addText('ТВОЙ ОТВЕТ', {
    x: 3.8, y: 1.95, w: 5.5, h: 0.3,
    fontSize: 10, fontFace: S.FONT_MONO, charSpacing: 3, color: color,
    align: 'left', valign: 'middle', margin: 0
  });
  slide.addText(answer, {
    x: 3.8, y: 2.25, w: 5.5, h: 1.85,
    fontSize: 11.5, fontFace: S.FONT_BODY, italic: true, color: S.WHITE,
    align: 'left', valign: 'top', margin: 0, paraSpaceAfter: 3
  });
  // Под ответом — почему так
  slide.addText('Почему так: ' + why, {
    x: 3.8, y: 4.15, w: 5.5, h: 0.5,
    fontSize: 10.5, fontFace: S.FONT_BODY, color: S.MUTED,
    align: 'left', valign: 'top', margin: 0
  });
}
