// Негативный тест riskCard: вырезаем функцию из dashboard/index.html и гоняем на четырёх наборах.
// Проверяем не только «пусто → оценить нельзя», но и что старое поведение не сломалось.
const fs = require('fs');

const INDEX = require('path').join(__dirname, '..', 'dashboard', 'index.html');
const html = fs.readFileSync(INDEX, 'utf8');
const start = html.indexOf('function riskCard()');
if (start < 0) { console.error('riskCard не найдена'); process.exit(1); }
// конец — начало следующей функции верхнего уровня
const end = html.indexOf('function smartChips', start);
const src = html.slice(start, end);

// заглушки зависимостей
let M = {};
const arr = x => Array.isArray(x) ? x : [];
const esc = s => String(s == null ? '' : s);
const ne  = s => String(s == null || s === '' ? '—' : s);
const plural = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11) ? a : ((n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? b : c);
const window = { LOG: { items: [] } };

const riskCard = new Function('M', 'arr', 'esc', 'ne', 'plural', 'window',
  src + '; return riskCard;')(null, arr, esc, ne, plural, window);

// riskCard читает M из замыкания — пересобираем на каждый случай
function run(model) {
  const fn = new Function('M', 'arr', 'esc', 'ne', 'plural', 'window',
    src + '; return riskCard;')(model, arr, esc, ne, plural, window);
  return fn();
}

const cases = [
  {
    name: 'дисков нет вообще (нет прав администратора)',
    model: { disksPhysical: [], disksLogical: [] },
    expect: 'оценить нельзя', forbid: 'низкий',
  },
  {
    name: 'поле disksPhysical отсутствует',
    model: { disksLogical: [] },
    expect: 'оценить нельзя', forbid: 'низкий',
  },
  {
    name: 'только съёмные носители (флешка мастера)',
    model: { disksPhysical: [{ name: 'USB', removable: true, health: 'Healthy' }], disksLogical: [] },
    expect: 'оценить нельзя', forbid: 'низкий',
  },
  {
    name: 'здоровый диск есть — старое поведение',
    model: { disksPhysical: [{ name: 'SSD', removable: false, health: 'Healthy', wear: 12, readErr: 0, writeErr: 0 }], disksLogical: [{ drive: 'C:', usedPct: 40 }] },
    expect: 'низкий', forbid: 'оценить нельзя',
  },
  {
    name: 'диск с ошибками чтения — старое поведение',
    model: { disksPhysical: [{ name: 'HDD', removable: false, health: 'Healthy', readErr: 5, writeErr: 0 }], disksLogical: [] },
    expect: 'высокий', forbid: 'низкий',
  },
  {
    name: 'дисков нет, но логический переполнен — реальная находка важнее',
    model: { disksPhysical: [], disksLogical: [{ drive: 'C:', usedPct: 97 }] },
    expect: 'средний', forbid: 'оценить нельзя',
  },
];

let fail = 0;
for (const c of cases) {
  const out = run(c.model);
  const ok = out.includes(c.expect) && !out.includes(c.forbid);
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'ПРОВАЛ'} ${c.name}`);
  if (!ok) {
    console.log(`      ждали «${c.expect}», без «${c.forbid}»`);
    console.log(`      получили: ${out.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150)}`);
  }
}
console.log(fail ? `\nПРОВАЛОВ: ${fail}` : '\nвсе случаи прошли');
process.exit(fail ? 1 : 0);
