/**
 * ========================================
 * KVIZOTEKA - Glavni JavaScript
 * Interaktivni kviz aplikacija
 * ========================================
 */

// ========== STANJE APLIKACIJE ==========
const state = {
    questions: [],          // Array svih pitanja iz JSON-a
    currentQuestionIndex: 0, // Indeks trenutnog pitanja
    score: 0,               // Broj točnih odgovora
    answered: false,        // Je li korisnik odgovorio na trenutno pitanje
    isLoading: true         // Je li aplikacija u stanju učitavanja
};

// ========== DOM ELEMENTI ==========
const elements = {
    // Ekrani
    startScreen: document.getElementById('start-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultScreen: document.getElementById('result-screen'),
    
    // Početni ekran
    startBtn: document.getElementById('start-btn'),
    totalQuestionsCount: document.getElementById('total-questions-count'),
    
    // Kviz ekran
    questionCard: document.getElementById('question-card'),
    questionImage: document.getElementById('question-image'),
    questionText: document.getElementById('question-text'),
    answersContainer: document.getElementById('answers-container'),
    nextBtn: document.getElementById('next-btn'),
    
    // Progress
    currentQuestion: document.getElementById('current-question'),
    totalQuestions: document.getElementById('total-questions'),
    progressFill: document.getElementById('progress-fill'),
    progressPercentage: document.getElementById('progress-percentage'),
    
    // Rezultat ekran
    resultIcon: document.getElementById('result-icon'),
    resultTitle: document.getElementById('result-title'),
    resultMessage: document.getElementById('result-message'),
    scoreNumber: document.getElementById('score-number'),
    scoreTotal: document.getElementById('score-total'),
    correctCount: document.getElementById('correct-count'),
    wrongCount: document.getElementById('wrong-count'),
    percentageScore: document.getElementById('percentage-score'),
    restartBtn: document.getElementById('restart-btn')
};

// ========== UTILITY FUNKCIJE ==========

/**
 * Prikazuje određeni ekran i sakriva ostale
 * @param {HTMLElement} screen - Ekran koji treba prikazati
 */
function showScreen(screen) {
    // Sakrij sve ekrane
    elements.startScreen.classList.remove('active');
    elements.quizScreen.classList.remove('active');
    elements.resultScreen.classList.remove('active');
    
    // Prikaži traženi ekran
    screen.classList.add('active');
}

/**
 * Miješa redoslijed elemenata u arrayu (Fisher-Yates shuffle)
 * @param {Array} array - Array za miješanje
 * @returns {Array} - Promiješani array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Ažurira progress bar
 */
function updateProgress() {
    const current = state.currentQuestionIndex + 1;
    const total = state.questions.length;
    const percentage = Math.round((current / total) * 100);
    
    elements.currentQuestion.textContent = current;
    elements.totalQuestions.textContent = total;
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressPercentage.textContent = `${percentage}%`;
}

// ========== UČITAVANJE PODATAKA ==========

/**
 * Učitava pitanja iz JSON datoteke
 */
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        state.questions = shuffleArray(data.questions); // Promiješaj pitanja
        state.isLoading = false;
        
        // Ažuriraj broj pitanja na početnom ekranu
        elements.totalQuestionsCount.textContent = state.questions.length;
        elements.totalQuestions.textContent = state.questions.length;
        
        console.log(`✅ Uspješno učitano ${state.questions.length} pitanja`);
        
    } catch (error) {
        console.error('❌ Greška pri učitavanju pitanja:', error);
        elements.questionText.textContent = 'Greška pri učitavanju pitanja. Molimo osvježite stranicu.';
        state.isLoading = false;
    }
}

// ========== PRIKAZ PITANJA ==========

/**
 * Prikazuje trenutno pitanje
 */
function displayQuestion() {
    const question = state.questions[state.currentQuestionIndex];
    
    if (!question) {
        console.error('Pitanje nije pronađeno');
        return;
    }
    
    // Resetiraj stanje
    state.answered = false;
    elements.nextBtn.disabled = true;
    
    // Animacija prijelaza
    elements.questionCard.style.animation = 'none';
    elements.questionCard.offsetHeight; // Trigger reflow
    elements.questionCard.style.animation = 'slideIn 0.5s ease';
    
    // Postavi sliku
    if (question.image) {
        elements.questionImage.src = question.image;
        elements.questionImage.alt = `Slika za pitanje ${question.id}`;
    } else {
        // Placeholder ako nema slike
        elements.questionImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzY2N2VlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+';
    }
    
    // Postavi tekst pitanja
    elements.questionText.textContent = question.question;
    
    // Generiraj gumbe za odgovore
    generateAnswerButtons(question);
    
    // Ažuriraj progress
    updateProgress();
}

/**
 * Generira gumbe za odgovore
 * @param {Object} question - Objekt pitanja
 */
function generateAnswerButtons(question) {
    // Očisti prethodne odgovore
    elements.answersContainer.innerHTML = '';
    
    // Kreiraj gumb za svaki odgovor
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.dataset.index = index;
        
        // Event listener za klik
        button.addEventListener('click', () => handleAnswerClick(index, question.correctAnswer));
        
        elements.answersContainer.appendChild(button);
    });
}

// ========== OBRADA ODGOVORA ==========

/**
 * Obrađuje klik na odgovor
 * @param {number} selectedIndex - Indeks odabranog odgovora
 * @param {number} correctIndex - Indeks točnog odgovora
 */
function handleAnswerClick(selectedIndex, correctIndex) {
    // Spriječi višestruko klikanje
    if (state.answered) return;
    state.answered = true;
    
    // Dohvati sve gumbe odgovora
    const answerButtons = elements.answersContainer.querySelectorAll('.answer-btn');
    
    // Onemogući sve gumbe
    answerButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Označi odgovore
    answerButtons.forEach((btn, index) => {
        if (index === correctIndex) {
            btn.classList.add('correct');
        } else if (index === selectedIndex) {
            btn.classList.add('wrong');
        }
    });
    
    // Ažuriraj rezultat
    if (selectedIndex === correctIndex) {
        state.score++;
        console.log('✅ Točan odgovor!');
    } else {
        console.log('❌ Netočan odgovor');
    }
    
    // Omogući gumb za sljedeće pitanje
    elements.nextBtn.disabled = false;
    
    // Promijeni tekst gumba ako je zadnje pitanje
    if (state.currentQuestionIndex === state.questions.length - 1) {
        elements.nextBtn.innerHTML = 'Završi kviz <span class="btn-arrow">→</span>';
    }
}

// ========== NAVIGACIJA ==========

/**
 * Prelazi na sljedeće pitanje ili završava kviz
 */
function nextQuestion() {
    state.currentQuestionIndex++;
    
    if (state.currentQuestionIndex < state.questions.length) {
        // Prikaži sljedeće pitanje
        displayQuestion();
    } else {
        // Završi kviz
        showResults();
    }
}

/**
 * Pokreće kviz
 */
function startQuiz() {
    // Resetiraj stanje
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.answered = false;
    
    // Promiješaj pitanja
    state.questions = shuffleArray(state.questions);
    
    // Resetiraj tekst gumba
    elements.nextBtn.innerHTML = 'Sljedeće pitanje <span class="btn-arrow">→</span>';
    
    // Prikaži kviz ekran
    showScreen(elements.quizScreen);
    
    // Prikaži prvo pitanje
    displayQuestion();
}

/**
 * Restartira kviz
 */
function restartQuiz() {
    // Resetiraj i pokreni iznova
    startQuiz();
}

// ========== PRIKAZ REZULTATA ==========

/**
 * Prikazuje završne rezultate
 */
function showResults() {
    const total = state.questions.length;
    const correct = state.score;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);
    
    // Postavi vrijednosti
    elements.scoreNumber.textContent = correct;
    elements.scoreTotal.textContent = total;
    elements.correctCount.textContent = correct;
    elements.wrongCount.textContent = wrong;
    elements.percentageScore.textContent = `${percentage}%`;
    
    // Postavi poruku ovisno o rezultatu
    if (percentage === 100) {
        elements.resultIcon.textContent = '🏆';
        elements.resultTitle.textContent = 'Savršeno!';
        elements.resultMessage.textContent = 'Sve ste točno odgovorili! Vi ste pravi gagić!';
    } else if (percentage >= 80) {
        elements.resultIcon.textContent = '🌟';
        elements.resultTitle.textContent = 'Odlično!';
        elements.resultMessage.textContent = 'Izvrsno znanje! Još malo pa ćete postati pravi gagić!';
    } else if (percentage >= 60) {
        elements.resultIcon.textContent = '👍';
        elements.resultTitle.textContent = 'Vrlo dobro!';
        elements.resultMessage.textContent = 'Solidno znanje, ali ima prostora za napredak.';
    } else if (percentage >= 40) {
        elements.resultIcon.textContent = '🤔';
        elements.resultTitle.textContent = 'Može bolje!';
        elements.resultMessage.textContent = 'Pokušajte ponovno i poboljšajte svoj rezultat!';
    } else {
        elements.resultIcon.textContent = '💪';
        elements.resultTitle.textContent = 'Ne odustajte!';
        elements.resultMessage.textContent = 'Iako, niste vi nikakav gagić.';
    }
    
    // Prikaži rezultat ekran
    showScreen(elements.resultScreen);
}

// ========== EVENT LISTENERI ==========

/**
 * Inicijalizira event listenere
 */
function initEventListeners() {
    // Gumb za pokretanje kviza
    elements.startBtn.addEventListener('click', startQuiz);
    
    // Gumb za sljedeće pitanje
    elements.nextBtn.addEventListener('click', nextQuestion);
    
    // Gumb za restart
    elements.restartBtn.addEventListener('click', restartQuiz);
    
    // Tipkovnički prečaci
    document.addEventListener('keydown', (e) => {
        // Enter ili Space za sljedeće pitanje
        if ((e.key === 'Enter' || e.key === ' ') && !elements.nextBtn.disabled) {
            if (elements.quizScreen.classList.contains('active')) {
                e.preventDefault();
                nextQuestion();
            }
        }
        
        // Brojevi 1-9 za odabir odgovora
        if (e.key >= '1' && e.key <= '9' && !state.answered) {
            const index = parseInt(e.key) - 1;
            const answerButtons = elements.answersContainer.querySelectorAll('.answer-btn');
            if (index < answerButtons.length) {
                answerButtons[index].click();
            }
        }
    });
}

// ========== INICIJALIZACIJA ==========

/**
 * Inicijalizira aplikaciju
 */
async function init() {
    console.log('🎯 Kvizoteka - Inicijalizacija...');
    
    // Učitaj pitanja
    await loadQuestions();
    
    // Inicijaliziraj event listenere
    initEventListeners();
    
    // Prikaži početni ekran
    showScreen(elements.startScreen);
    
    console.log('✅ Kvizoteka spremna!');
}

// Pokreni aplikaciju kada se DOM učita
document.addEventListener('DOMContentLoaded', init);
