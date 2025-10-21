// result.js

document.addEventListener('DOMContentLoaded', () => {
  const summaryEl = document.getElementById('summary');
  const reviewList = document.getElementById('answer-review');
  const playAgainBtn = document.getElementById('play-again');
  const backHomeBtn = document.getElementById('back-home');

  // Daten aus dem sessionStorage holen
  const setupRaw = sessionStorage.getItem('trivia_setup');
  const scoreRaw = sessionStorage.getItem('trivia_score');
  const reviewRaw = sessionStorage.getItem('trivia_review');

  // Falls Daten fehlen → zurück zur Startseite
  if (!setupRaw || !scoreRaw || !reviewRaw) {
    window.location.href = 'index.html';
    return;
  }

  const setup = JSON.parse(setupRaw);
  const score = Number(scoreRaw);
  const review = JSON.parse(reviewRaw);
  const total = review.length || setup.amount || 0;

  // Ergebnis anzeigen hallo.
  summaryEl.textContent = `Du hast ${score} von ${total} Punkten erreicht.`;

  // Antwortübersicht aufbauen
  reviewList.innerHTML = '';
  review.forEach((r, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Frage ${i + 1}:</strong> ${r.q}<br>
      <span class="${r.isCorrect ? 'correct' : 'wrong'}">
        Deine Antwort: ${r.user}
      </span><br>
      <span class="correct">Richtig: ${r.correct}</span>
    `;
    reviewList.appendChild(li);
  });

  // Button-Events
  playAgainBtn.addEventListener('click', () => {
    // Nur Fragen & Score löschen, aber Setup behalten
    sessionStorage.removeItem('trivia_questions');
    sessionStorage.removeItem('trivia_score');
    sessionStorage.removeItem('trivia_review');
    window.location.href = 'quiz.html';
  });

  backHomeBtn.addEventListener('click', () => {
    // Alles löschen
    sessionStorage.clear();
    window.location.href = 'index.html';
  });
});
