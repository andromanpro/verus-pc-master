// Verus — движок тестов. Один JS на все модули.
// Загружает data/<id>.json, показывает вопросы, проверяет, сохраняет прогресс в localStorage.
'use strict';

const STORAGE_KEY = 'verus-edu-progress';
const PASS_THRESHOLD = 0.7; // ≥70% правильных = зачёт модуля

// ===== ПРОГРЕСС В localStorage =====

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Битый прогресс, сбрасываю:', e);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e2) {}
    return {};
  }
}

function saveModule(moduleId, score, total) {
  const p = loadProgress();
  const prev = p[moduleId];
  const newScore = score;
  const newPassed = score / total >= PASS_THRESHOLD;

  // Сохраняем ЛУЧШИЙ результат — чтобы перепрохождение хуже не сбрасывало зачёт.
  // Дата — последняя попытки (любой), best date — лучшей.
  if (prev && prev.score > newScore) {
    // Новый результат хуже — обновляем только дату последней попытки, лучший оставляем.
    p[moduleId] = {
      ...prev,
      lastTryDate: new Date().toISOString().slice(0, 10),
      lastTryScore: newScore
    };
  } else {
    // Новый результат равен или лучше — пишем как основной.
    p[moduleId] = {
      completed: true,
      score: newScore,
      total: total,
      passed: newPassed,
      date: new Date().toISOString().slice(0, 10)
    };
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
  catch (e) { console.warn('Не удалось сохранить прогресс:', e); }
}

function clearAllProgress() {
  if (!confirm('Сбросить весь прогресс по тестам?\nЭто действие нельзя отменить.')) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  location.reload();
}

// Клик по пройденной карточке — подтверждение перепрохождения.
// Объявлено на window чтобы было доступно из onclick атрибута.
window.confirmRetake = function(moduleId, title, score, total, date) {
  const msg = 'Модуль «' + title + '» уже пройден.\n\n'
    + 'Лучший результат: ' + score + ' / ' + total + ' (от ' + date + ')\n\n'
    + 'Перепройти заново? Лучший результат сохранится — если пройдёшь хуже, прошлый зачёт останется.';
  if (confirm(msg)) {
    location.href = 'test.html?module=' + moduleId;
  }
};

// ===== УТИЛИТЫ =====

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function $(id) { return document.getElementById(id); }

function getParam(name) {
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

// Перемешать массив (Fisher-Yates) — чтобы порядок вариантов разный был
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== ТЕСТ-ПЛЕЕР =====

let currentTest = null;
let currentQuestionIdx = 0;
let answers = []; // массив { questionId, selected: [индексы], correct: bool }

async function loadTest(moduleId) {
  // 1) Сначала — встроенные данные (tests-data.js). Работает без сервера, file://.
  if (window.TESTS_DATA && window.TESTS_DATA[moduleId]) {
    // Глубокая копия — иначе при «Перепройти» порядок вариантов запомнится между запусками.
    return JSON.parse(JSON.stringify(window.TESTS_DATA[moduleId]));
  }

  // 2) Fallback — fetch из data/<id>.json (если запущено с сервера).
  try {
    const r = await fetch('data/' + moduleId + '.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (e) {
    const isFile = location.protocol === 'file:';
    const hint = isFile
      ? '<p style="color:var(--am)">Браузер запретил локальный fetch (file://). Открой <code>tests-data.js</code> через сборку: запусти <b>build-tests-data.ps1</b>.</p>'
      : '';
    document.body.innerHTML = '<main><h1>Ошибка загрузки</h1><p>Не удалось загрузить тест: ' + esc(e.message) + '</p>' + hint + '<p><a href="index.html">← к списку модулей</a></p></main>';
    return null;
  }
}

function renderQuestion() {
  const q = currentTest.questions[currentQuestionIdx];
  const total = currentTest.questions.length;
  const progress = ((currentQuestionIdx) / total) * 100;

  const typeLabel = q.type === 'scenario' ? 'СЦЕНАРИЙ' : 'ВОПРОС';
  const typeClass = q.type === 'scenario' ? 'scenario' : '';

  // У каждого вопроса варианты тасуются. Запоминаем порядок в q._shuffledIdx для проверки.
  if (!q._shuffledIdx) {
    q._shuffledIdx = shuffle(q.options.map((_, i) => i));
  }

  let html = `
    <div class="eyebrow">
      <span class="marker"></span>
      <span>// ${esc(currentTest.title)}</span>
      <span class="counter">${String(currentQuestionIdx + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</span>
    </div>

    <div class="test-progress"><div class="fill" style="width:${progress}%"></div></div>

    <div class="question-card">
      <span class="question-type-tag ${typeClass}">${typeLabel}</span>
      <div class="question-text">${esc(q.question)}</div>
      <div class="options" id="options">
  `;

  q._shuffledIdx.forEach((origIdx, displayIdx) => {
    const opt = q.options[origIdx];
    html += `
      <div class="option" data-idx="${displayIdx}" data-orig="${origIdx}" onclick="selectOption(${displayIdx})">
        <div class="check"></div>
        <div class="option-text">${esc(opt.text)}</div>
      </div>
    `;
  });

  html += `
      </div>
      <div class="explain" id="explain"></div>
    </div>

    <div class="actions">
      <a href="index.html" class="btn-back">← К списку модулей</a>
      <button class="btn btn-primary" id="next-btn" disabled onclick="onNextClick()">
        Проверить →
      </button>
    </div>
  `;

  $('test-container').innerHTML = html;
}

let selectedIndices = []; // displayIdx[] для текущего вопроса
let isAnswered = false;

function selectOption(displayIdx) {
  if (isAnswered) return;
  const q = currentTest.questions[currentQuestionIdx];
  const isMulti = q.type === 'multiple';

  if (isMulti) {
    // toggle
    const pos = selectedIndices.indexOf(displayIdx);
    if (pos >= 0) selectedIndices.splice(pos, 1);
    else selectedIndices.push(displayIdx);
  } else {
    selectedIndices = [displayIdx];
  }

  // Перерисовать классы
  document.querySelectorAll('#options .option').forEach(el => {
    const idx = parseInt(el.dataset.idx, 10);
    el.classList.toggle('selected', selectedIndices.includes(idx));
  });

  $('next-btn').disabled = selectedIndices.length === 0;
}

function onNextClick() {
  if (!isAnswered) {
    checkAnswer();
  } else {
    advanceQuestion();
  }
}

function checkAnswer() {
  const q = currentTest.questions[currentQuestionIdx];
  const correctOrigs = q.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0);
  const selectedOrigs = selectedIndices.map(d => q._shuffledIdx[d]);

  const isCorrect = selectedOrigs.length === correctOrigs.length
    && selectedOrigs.every(o => correctOrigs.includes(o));

  // Показать результат на каждом варианте
  document.querySelectorAll('#options .option').forEach(el => {
    const orig = parseInt(el.dataset.orig, 10);
    const isThisCorrect = q.options[orig].correct;
    const wasSelected = selectedOrigs.includes(orig);
    el.classList.remove('selected');
    if (isThisCorrect) {
      el.classList.add('correct');
    } else if (wasSelected) {
      el.classList.add('wrong');
    }
    el.style.cursor = 'default';
  });

  // Показать разбор
  const explain = $('explain');
  explain.className = 'explain show ' + (isCorrect ? 'correct' : 'wrong');
  explain.innerHTML = (isCorrect ? '✓ <b>Верно!</b> ' : '✕ <b>Неправильно.</b> ') + esc(q.explain || '');

  // Зафиксировать ответ
  answers.push({
    questionId: q.id || ('q' + currentQuestionIdx),
    question: q.question,
    correctText: correctOrigs.map(i => q.options[i].text).join(', '),
    yourText: selectedOrigs.map(i => q.options[i].text).join(', ') || '(не выбрано)',
    correct: isCorrect
  });

  isAnswered = true;
  $('next-btn').disabled = false;
  $('next-btn').textContent = (currentQuestionIdx === currentTest.questions.length - 1) ? 'Завершить тест →' : 'Следующий вопрос →';
}

function advanceQuestion() {
  if (currentQuestionIdx + 1 >= currentTest.questions.length) {
    finishTest();
    return;
  }
  currentQuestionIdx++;
  selectedIndices = [];
  isAnswered = false;
  renderQuestion();
}

function finishTest() {
  const correct = answers.filter(a => a.correct).length;
  const total = answers.length;
  const passed = correct / total >= PASS_THRESHOLD;

  // Сохранить
  saveModule(currentTest.moduleId, correct, total);

  const passClass = passed ? 'pass' : 'fail';
  const passMsg = passed
    ? `Модуль пройден. Ты ответил на ${correct} из ${total} вопросов.`
    : `Не хватило для зачёта (нужно ${Math.ceil(total * PASS_THRESHOLD)} из ${total}). Прочитай разборы ниже, повтори модуль через презентацию — потом перепройди тест.`;

  const wrongAnswers = answers.filter(a => !a.correct);
  let reviewHtml = '';
  if (wrongAnswers.length) {
    reviewHtml = '<h2 style="text-align:left;font-size:22px;margin:40px 0 16px;color:var(--white)">Где ошибся</h2>';
    reviewHtml += '<div class="review-list">';
    wrongAnswers.forEach((a, i) => {
      reviewHtml += `
        <div class="review-item">
          <div class="q">${i + 1}. ${esc(a.question)}</div>
          <div class="correct-answer">✓ Правильно: ${esc(a.correctText)}</div>
          <div class="your-answer">✕ Ты ответил: ${esc(a.yourText)}</div>
        </div>
      `;
    });
    reviewHtml += '</div>';
  }

  $('test-container').innerHTML = `
    <div class="eyebrow">
      <span class="marker"></span>
      <span>// ${esc(currentTest.title)}</span>
      <span class="counter">ИТОГ</span>
    </div>

    <div class="final-screen">
      <div class="final-score ${passClass}">
        ${correct}<span class="of">/${total}</span>
      </div>
      <div class="final-message ${passClass}">
        ${esc(passMsg)}
      </div>
      <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:30px">
        <button class="btn" onclick="restartTest()">↻ Перепройти</button>
        <a href="index.html" class="btn btn-primary">← К списку модулей</a>
      </div>
      ${reviewHtml}
    </div>
  `;
}

function restartTest() {
  currentQuestionIdx = 0;
  answers = [];
  selectedIndices = [];
  isAnswered = false;
  // Сбросить порядок вариантов чтобы перетасовать заново
  currentTest.questions.forEach(q => { delete q._shuffledIdx; });
  renderQuestion();
}

// ===== ГЛАВНАЯ — СПИСОК МОДУЛЕЙ =====

const MODULES = [
  { id: '01', title: 'Компьютер изнутри',         summary: 'Что внутри ПК и зачем оно нужно.' },
  { id: '02', title: 'SMART, температуры, BSOD',  summary: 'Язык на котором ПК говорит о здоровье.' },
  { id: '03', title: 'Когда Windows не грузится', summary: 'Лесенка от безопасного режима до переустановки.' },
  { id: '04', title: 'Сети и DPI',                summary: 'Зоны ответственности, GoodbyeDPI, zapret.' },
  { id: '05', title: 'Восстановление данных',     summary: 'TestDisk, PhotoRec, DMDE. И где остановиться.' },
  { id: '06', title: 'Путь мастера 12 недель',    summary: 'План обучения и маркеры роста.' },
  { id: '07', title: 'Самозанятость и акты',      summary: 'Юр-минимум: НПД, акты, ответственность.' },
  { id: '08', title: 'Разговор с клиентом',       summary: 'Скрипты для типовых ситуаций.' },
  { id: '09', title: 'Прозрачность для клиента',  summary: 'Что я смотрю и что НЕ открываю.' },
  { id: '10', title: 'Бэкапы 3-2-1',              summary: 'Как не потерять данные клиента и свои.' }
];

function renderIndex() {
  const progress = loadProgress();
  const completed = Object.values(progress).filter(p => p && p.passed).length;
  const totalModules = MODULES.length;
  const pct = Math.round((completed / totalModules) * 100);

  let html = `
    <div class="eyebrow">
      <span class="marker"></span>
      <span>// учебные тесты Verus</span>
      <span class="counter">${completed} / ${totalModules}</span>
    </div>

    <h1>Тесты по урокам</h1>
    <p class="lead">10 модулей × 15 вопросов. По 70% правильных — модуль зачтён. Прошёл все — получи сертификат.</p>

    <div class="progress-summary">
      <div>
        <div class="big-num">${completed}<span class="of">/${totalModules}</span></div>
        <div class="label">модулей зачтено</div>
      </div>
      <div class="bar-wrap">
        <div class="label">Прогресс курса · ${pct}%</div>
        <div class="progress-bar"><div class="fill" style="width:${pct}%"></div></div>
      </div>
      <button class="cert-btn" ${completed < totalModules ? 'disabled' : ''} onclick="location.href='cert.html'">
        ${completed < totalModules ? '🔒 Сертификат (после всех модулей)' : '🏆 Получить сертификат'}
      </button>
    </div>

    <div class="modules-grid">
  `;

  MODULES.forEach(m => {
    const p = progress[m.id];
    const isDone = p && p.passed;
    const status = isDone
      ? `<span>пройден ${p.date}</span><span class="score">${p.score} / ${p.total}</span>`
      : (p ? `<span>попытка ${p.date}</span><span style="color:var(--am)">${p.score} / ${p.total} — нужно ${Math.ceil(p.total * PASS_THRESHOLD)}</span>` : '<span>не пройден</span><span style="color:var(--muted)">—</span>');

    // Если модуль пройден — клик спрашивает подтверждение перепрохождения.
    // Если не пройден — обычный переход.
    const clickHandler = isDone
      ? `onclick="event.preventDefault();confirmRetake('${m.id}', '${esc(m.title).replace(/'/g, "\\'")}', ${p.score}, ${p.total}, '${p.date}');"`
      : '';

    html += `
      <a class="module-card ${isDone ? 'completed' : ''}" href="test.html?module=${m.id}" ${clickHandler}>
        ${isDone ? '<div class="done-badge" title="Модуль пройден">✓</div>' : ''}
        <div class="module-num">${m.id}</div>
        <div class="module-title">${esc(m.title)}</div>
        <div class="module-summary">${esc(m.summary)}</div>
        <div class="module-status">${status}</div>
      </a>
    `;
  });

  html += `
    </div>

    <div style="margin-top:50px;text-align:center;color:var(--muted);font-size:13px">
      Прогресс хранится в этом браузере локально. Очистил кэш = сбросил прогресс.
      <br>
      <a href="#" onclick="event.preventDefault();clearAllProgress();" style="color:var(--rs);text-decoration:underline">Сбросить прогресс</a>
    </div>
  `;

  $('test-container').innerHTML = html;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

window.addEventListener('DOMContentLoaded', async () => {
  const moduleId = getParam('module');

  if (!moduleId) {
    // Главная — список модулей
    renderIndex();
  } else {
    // Тест конкретного модуля
    currentTest = await loadTest(moduleId);
    if (currentTest) renderQuestion();
  }
});
