// Startseite: Kategorien laden & Einstellungen speichern
const categorySelect = document.getElementById('category');
const form = document.getElementById('setup-form');

(async function loadCategories(){
  try {
    const res = await fetch('https://opentdb.com/api_category.php');
    const data = await res.json();
    const cats = data.trivia_categories || [];
    for (const c of cats){
      const opt = document.createElement('option');
      opt.value = String(c.id);
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    }
  } catch (e){ 
    console.warn('Kategorien konnten nicht geladen werden.', e);
  }
})();

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const category = categorySelect.value.trim();            // '' = beliebig
  const difficulty = document.getElementById('difficulty').value.trim(); // '' = beliebig
  const amountVal = document.getElementById('amount').value;
  const amount = Math.max(5, Math.min(25, Number(amountVal) || 10));

  // Auswahl speichern
  const setup = { category, difficulty, amount };
  sessionStorage.setItem('trivia_setup', JSON.stringify(setup));

  // alte Session-Daten leeren
  sessionStorage.removeItem('trivia_questions');
  sessionStorage.removeItem('trivia_score');
  sessionStorage.removeItem('trivia_review');

  // weiter zur Quiz-Seite
  window.location.href = 'quiz.html';
});
