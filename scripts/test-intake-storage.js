// Карточка клиента в браузере: живёт весь ремонт, но исчезает после акта передачи.
// Функции и проверка автоочистки берутся прямо из dashboard/index.html.
const fs = require('fs');
const INDEX = require('path').join(__dirname, '..', 'dashboard', 'index.html');
const html = fs.readFileSync(INDEX, 'utf8');

function grab(name) {
  const i = html.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('не найдена функция ' + name);
  const j = html.indexOf('\nfunction ', i + 1);
  return html.slice(i, j > 0 ? j : i + 2000);
}

function makeStore() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    dump: () => Object.fromEntries(m),
  };
}

function build(store) {
  const code = [grab('safeLS'), grab('readIntake'), grab('writeIntake'), grab('clearIntake'),
    'return { readIntake, writeIntake, clearIntake };'].join('\n');
  // хвост последней вырезки цепляет соседний код страницы, присваивающий window.*
  return new Function('localStorage', 'window', code)(store, {});
}

const PD = { cli: 'Иванов Иван', tel: '+79001234567', pc: 'HP 250', sn: 'SN-777', zh: 'не включается', note: 'коробка' };
let fail = 0;
const check = (ok, label, extra) => { if (!ok) { fail++; console.log('ПРОВАЛ ' + label); if (extra) console.log('       ' + extra); } else console.log('OK   ' + label); };

// 1. приёмка: карточка сохраняется и переживает закрытие браузера
const ls = makeStore();
const api = build(ls);
api.writeIntake(Object.assign({ clientID: 'cid-1', intakeAt: '2026-07-24T10:00:00Z' }, PD));

let got = build(ls).readIntake();   // новый «запуск страницы» на том же хранилище
check(got.cli === 'Иванов Иван' && got.tel === '+79001234567',
  'карточка переживает закрытие браузера (ремонт идёт дни)');
check(got.clientID === 'cid-1' && got.intakeAt === '2026-07-24T10:00:00Z',
  'идентификатор визита и метка приёмки на месте');

// 2. очистка убирает всё
api.clearIntake();
check(Object.keys(ls.dump()).length === 0, 'очистка стирает карточку целиком');
got = build(ls).readIntake();
check(!got.cli && !got.tel && !got.clientID, 'после очистки персональных данных не остаётся');

// 3. автоочистка после акта передачи — проверяем сам код страницы
const printBlock = html.slice(html.indexOf('let saveErr=null;'), html.indexOf('closeAct();', html.indexOf('let saveErr=null;')));
check(/type===['"]handoff['"]\s*\)\s*\{\s*clearIntake\(\)/.test(printBlock),
  'после акта передачи карточка стирается автоматически');
check(!/type===['"]intake['"]\s*\)\s*\{\s*clearIntake\(\)/.test(printBlock),
  'после приёмки карточка НЕ стирается (ремонт только начался)');

// 4. в постоянном хранилище нет других хвостов с персональными данными
const ls2 = makeStore();
build(ls2).writeIntake({ clientID: 'cid-2' });
check(!/Иванов|79001234567/.test(JSON.stringify(ls2.dump())), 'пустая карточка не тянет старые данные');

console.log(fail ? `\nПРОВАЛОВ: ${fail}` : '\nвсе проверки прошли');
process.exit(fail ? 1 : 0);
