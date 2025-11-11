// --- (جديد) استيراد مدير الأدوار ---
import { TurnManager } from './turn_manager.js';

// --- العناصر (Elements) ---
const mainMenuScreen = document.getElementById('main-menu-screen');
// ... (باقي العناصر كما هي) ...
const skipQuestionButton = document.getElementById('skip-question-button');

// --- (جديد) تصدير إعدادات اللعبة ---
// أضفنا 'export' لنجعلها متاحة لـ turn_manager.js
export const gameSettings = {
    mode: 'turns',
    teams: '2p',
    timer: 'off'
};

// --- متغيرات حالة اللعبة ---
const questionCache = {};
// ... (باقي المتغيرات كما هي) ...
let currentQuestion = null;

// --- قائمة الحروف الأساسية ---
const ALL_LETTERS = [
    // ... (قائمة الحروف كما هي) ...
    { id: '28ya', char: 'ي' }
];

// --- الوظائف (Functions) ---

/**
 * 0. وظيفة لخلط أي مصفوفة
 */
function shuffleArray(array) {
    // ... (الكود كما هو) ...
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * 1. جلب سجل الأسئلة المستخدمة
 */
function loadUsedQuestions() {
    // ... (الكود كما هو) ...
    const stored = localStorage.getItem('hrof_used_questions');
    if (stored) {
        usedQuestions = JSON.parse(stored);
    } else {
        usedQuestions = {};
    }
}

/**
 * 2. حفظ سجل الأسئلة
 */
function saveUsedQuestions() {
    // ... (الكود كما هو) ...
    localStorage.setItem('hrof_used_questions', JSON.stringify(usedQuestions));
}

/**
 * 3. معالجة الضغط على أزرار الإعدادات
 */
function handleSettingClick(event) {
    // ... (الكود كما هو) ...
    const clickedButton = event.target;
    const settingType = clickedButton.dataset.setting;
    const settingValue = clickedButton.dataset.value;
    gameSettings[settingType] = settingValue;
    const buttonsInGroup = document.querySelectorAll(`.setting-button[data-setting="${settingType}"]`);
    buttonsInGroup.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
}

/**
 * 4. وظيفة بدء اللعبة (محدثة)
 */
function startGame() {
    mainMenuScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    loadUsedQuestions();
    initializeGameBoard();
    
    // --- (جديد) إخبار مدير الأدوار ببدء اللعبة ---
    TurnManager.startGame(); 
}

/**
 * 5. وظيفة بناء لوحة اللعب السداسية
 */
function initializeGameBoard() {
    // ... (الكود كما هو - بناء اللوحة) ...
    gameBoardContainer.innerHTML = '';
    const shuffledLetters = shuffleArray(ALL_LETTERS);
    const gameLetters = shuffledLetters.slice(0, 25);
    let letterIndex = 0;

    for (let col = 0; col < 7; col++) {
        const column = document.createElement('div');
        column.classList.add('hex-column');
        for (let row = 0; row < 7; row++) {
            const cell = document.createElement('div');
            // ... (باقي الكود كما هو) ...
            if ((row === 0 || row === 6) && (col === 0 || col === 6)) {
                cell.classList.add('hex-cell-selected');
            } else if ((row === 0 || row === 6) && (col > 0 && col < 6)) {
                cell.classList.add('hex-cell-red');
            } else if ((row > 0 && row < 6) && (col === 0 || col === 6)) {
                cell.classList.add('hex-cell-purple');
            } else {
                // ... (باقي الكود كما هو) ...
                cell.classList.add('hex-cell-default', 'playable');
                const letter = gameLetters[letterIndex];
                cell.dataset.letterId = letter.id;
                const letterSpan = document.createElement('span');
                letterSpan.classList.add('hex-letter');
                letterSpan.textContent = letter.char;
                cell.appendChild(letterSpan);
                letterIndex++;
                cell.addEventListener('click', handleCellClick);
            }
            column.appendChild(cell);
        }
        gameBoardContainer.appendChild(column);
    }
}

/**
 * 6. وظيفة معالجة النقر على الخلية
 */
async function handleCellClick(event) {
    // ... (الكود كما هو - جلب السؤال) ...
    const clickedCell = event.currentTarget;
    const letterId = clickedCell.dataset.letterId;

    if (!clickedCell.classList.contains('playable')) {
        return; 
    }

    currentClickedCell = clickedCell;

    const question = await getQuestionForLetter(letterId);

    if (question) {
        currentQuestion = question;
        questionText.textContent = question.question;
        answerText.textContent = question.answer;
        
        answerRevealSection.style.display = 'none';
        questionModalOverlay.style.display = 'flex';
    } else {
        // ... (الكود كما هو) ...
        questionText.textContent = 'عذراً، لا توجد أسئلة لهذا الحرف حالياً.';
        answerText.textContent = '';
        answerRevealSection.style.display = 'none';
        questionModalOverlay.style.display = 'flex';
    }
}

/**
 * 7. جلب سؤال لحرف معين
 */
async function getQuestionForLetter(letterId) {
    // ... (الكود كما هو - منطق جلب الأسئلة) ...
    if (!questionCache[letterId]) {
        try {
            const response = await fetch(`data/questions/${letterId}.json`);
            if (!response.ok) throw new Error('ملف السؤال غير موجود');
            questionCache[letterId] = await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    const allQuestions = questionCache[letterId];
    if (allQuestions.length === 0) return null;
    let unusedQuestions = [];
    for (let i = 0; i < allQuestions.length; i++) {
        const questionId = `${letterId}_q${i}`;
        if (!usedQuestions[questionId]) {
            unusedQuestions.push({
                ...allQuestions[i],
                id: questionId
            });
        }
    }
    if (unusedQuestions.length === 0) {
        console.log(`تم استخدام كل أسئلة ${letterId}. إعادة التعيين...`);
        for (let i = 0; i < allQuestions.length; i++) {
            const questionId = `${letterId}_q${i}`;
            delete usedQuestions[questionId];
        }
        saveUsedQuestions();
        unusedQuestions = allQuestions.map((q, i) => ({
            ...q,
            id: `${letterId}_q${i}`
        }));
    }
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
    return unusedQuestions[randomIndex];
}

/**
 * 8. وظيفة إظهار الجواب
 */
function showAnswer() {
    // ... (الكود كما هو) ...
    answerRevealSection.style.display = 'block';
}

/**
 * 9. معالجة نتيجة السؤال (محدثة)
 */
function handleQuestionResult(result) {
    questionModalOverlay.style.display = 'none';

    if (currentQuestion) {
        usedQuestions[currentQuestion.id] = true;
        saveUsedQuestions();
    }
    
    if (result === 'purple' || result === 'red') {
        const teamColor = result;
        currentClickedCell.classList.remove('playable', 'hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${teamColor}-owned`);
        
        // (لاحقاً)
        // checkWinCondition(teamColor);
    }
    
    // --- (جديد) إخبار مدير الأدوار بانتهاء الدور ---
    TurnManager.nextTurn(result);

    currentClickedCell = null;
    currentQuestion = null;
}

// --- ربط الأحداث (Event Listeners) ---
// ... (الكود كما هو) ...
settingButtons.forEach(button => {
    button.addEventListener('click', handleSettingClick);
});

startGameButton.addEventListener('click', startGame);

showAnswerButton.addEventListener('click', showAnswer);
teamPurpleWinButton.addEventListener('click', () => handleQuestionResult('purple'));
teamRedWinButton.addEventListener('click', () => handleQuestionResult('red'));
skipQuestionButton.addEventListener('click', () => handleQuestionResult('skip'));
