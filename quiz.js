// quiz.js – komplette Version mit Timer (20 Sekunden pro Frage)

const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const categoryBadge = document.getElementById('category-badge');
const quitBtn = document.getElementById('quit-btn');
const timerEl = document.getElementById('timer');

let setup = null;
let questions = [];
let index = 0;
let score = 0;
let review = []; // {q, correct, user, isCorrect}
let timeLeft = 20;
let timerInterval = null;

// HTML-Entities decodieren
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// Array mischen
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Fragen von der API oder aus Session holen
async function ensureQuestions() {
  const cached = sessionStorage.getItem('trivia_questions');
  if (cached) {
    questions = JSON.parse(cached);
    return;
  }

  if (!setup) throw new Error('Kein Setup gefunden');

  const params = new URLSearchParams();
  params.set('amount', String(setup.amount || 10));
  if (setup.category) params.set('category', setup.category);
  if (setup.difficulty) params.set('difficulty', setup.difficulty);
  params.set('type', 'multiple');

  const url = `https://opentdb.com/api.php?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.response_code !== 0 || !Array.isArray(data.results) || data.results.length === 0) {
    alert('Für diese Auswahl wurden keine Fragen gefunden. Bitte versuche andere Einstellungen.');
    window.location.href = 'index.html';
    return;
  }

  questions = data.results.map(q => ({
    category: q.category,
    difficulty: q.difficulty,
    question: decodeHTML(q.question),
    correct_answer: decodeHTML(q.correct_answer),
    incorrect_answers: q.incorrect_answers.map(decodeHTML)
  }));

  sessionStorage.setItem('trivia_questions', JSON.stringify(questions));
}

// Frage anzeigen
function render() {
  const total = questions.length;
  const q = questions[index];

  progressEl.textContent = `Frage ${index + 1}/${total}`;
  scoreEl.textContent = `Punkte: ${score}`;
  categoryBadge.textContent = `${q.category} • ${q.difficulty.toUpperCase()}`;
  questionEl.textContent = q.question;

  answersEl.innerHTML = '';
  const options = shuffle([q.correct_answer, ...q.incorrect_answers]);

  for (const option of options) {
    const btn = document.createElement('button');
    btn.className = 'btn answer-btn';
    btn.textContent = option;
    btn.setAttribute('type', 'button');
    btn.addEventListener('click', () => onAnswer(option));
    answersEl.appendChild(btn);
  }

  nextBtn.disabled = true;
  nextBtn.textContent = index === total - 1 ? 'Ergebnis anzeigen' : 'Weiter';

  // Timer starten
  startTimer();
}

// Timer-Funktionen
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 20;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerEl.textContent = `⏱ ${timeLeft}s`;
  timerEl.style.color = timeLeft <= 5 ? '#ef4444' : '#e5e7eb';
}

function handleTimeout() {
  const q = questions[index];
  const alreadyAnswered = answersEl.querySelector('.correct, .wrong');
  if (alreadyAnswered) return;

  review.push({
    q: q.question,
    correct: q.correct_answer,
    user: '(keine Antwort)',
    isCorrect: false
  });

  // Richtige Antwort anzeigen
  for (const b of answersEl.querySelectorAll('button')) {
    if (b.textContent === q.correct_answer) b.classList.add('correct');
    b.disabled = true;
  }

  nextBtn.disabled = false;
}

// Wenn Spieler antwortet
function onAnswer(choice) {
  clearInterval(timerInterval);
  const q = questions[index];
  const isCorrect = choice === q.correct_answer;
  if (isCorrect) score++;

  review.push({
    q: q.question,
    correct: q.correct_answer,
    user: choice,
    isCorrect
  });

  // Buttons einfärben & sperren
  for (const b of answersEl.querySelectorAll('button')) {
    if (b.textContent === q.correct_answer) b.classList.add('correct');
    if (b.textContent === choice && !isCorrect) b.classList.add('wrong');
    b.disabled = true;
  }

  nextBtn.disabled = false;
  scoreEl.textContent = `Punkte: ${score}`;
}

// Nächste Frage oder Ergebnis-Seite
nextBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  if (index < questions.length - 1) {
    index++;
    render();
  } else {
    sessionStorage.setItem('trivia_score', String(score));
    sessionStorage.setItem('trivia_review', JSON.stringify(review));
    window.location.href = 'result.html';
  }
});

// Quiz abbrechen
quitBtn.addEventListener('click', () => {
  if (confirm('Quiz beenden und zur Startseite zurückkehren?')) {
    clearInterval(timerInterval);
    window.location.href = 'index.html';
  }
});

// Initialisierung
(async function init() {
  const setupRaw = sessionStorage.getItem('trivia_setup');
  if (!setupRaw) {
    window.location.href = 'index.html';
    return;
  }
  setup = JSON.parse(setupRaw);
  await ensureQuestions();
  index = 0;
  score = 0;
  review = [];
  render();
})();
