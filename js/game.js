// --- استيراد مدير الأدوار ---
import { TurnManager } from './turn_manager.js';

// --- العناصر (Elements) ---
const mainMenuScreen = document.getElementById('main-menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameBoardContainer = document.getElementById('game-board-container');

// ... (عناصر الإعدادات) ...
const settingButtons = document.querySelectorAll('.setting-button');
const startGameButton = document.getElementById('start-game-button');

// ... (عناصر نافذة السؤال) ...
const questionModalOverlay = document.getElementById('question-modal-overlay');
const questionText = document.getElementById('question-text');
const showAnswerButton = document.getElementById('show-answer-button');
const answerRevealSection = document.getElementById('answer-reveal-section');
const answerText = document.getElementById('answer-text');
const teamPurpleWinButton = document.getElementById('team-purple-win-button');
const teamRedWinButton = document.getElementById('team-red-win-button');
const skipQuestionButton = document.getElementById('skip-question-button');

// ... (عناصر لوحة النتائج) ...
const purpleScoreDisplay = document.getElementById('purple-score');
const redScoreDisplay = document.getElementById('red-score');

// ... (عناصر شاشة الفوز الجديدة) ...
const roundWinOverlay = document.getElementById('round-win-overlay');
const winMessage = document.getElementById('win-message');
const winScorePurple = document.getElementById('win-score-purple');
const winScoreRed = document.getElementById('win-score-red');
const nextRoundButton = document.getElementById('next-round-button');

// --- تصدير إعدادات اللعبة ---
export const gameSettings = {
    mode: 'turns',
    teams: '2p',
    timer: 'off'
};

// --- متغيرات حالة اللعبة ---
const questionCache = {};
let usedQuestions = {};
let currentClickedCell = null;
let currentQuestion = null;
let gameActive = true; 
let scores = { purple: 0, red: 0 };

// --- (تم الإصلاح) قائمة الحروف الأساسية بالأسماء الصحيحة ---
const ALL_LETTERS = [
    { id: '01alif', char: 'أ' }, { id: '02ba', char: 'ب' }, { id: '03ta', char: 'ت' },
    { id: '04tha', char: 'ث' }, { id: '05jeem', char: 'ج' }, { id: '06haa', char: 'ح' },
    { id: '07khaa', char: 'خ' }, { id: '08dal', char: 'د' }, { id: '09dhal', char: 'ذ' },
    { id: '10ra', char: 'ر' }, { id: '11zay', char: 'ز' }, { id: '12seen', char: 'س' },
    { id: '13sheen', char: 'ش' }, { id: '14sad', char: 'ص' }, { id: '15dad', char: 'ض' },
    { id: '16ta_a', char: 'ط' }, { id: '17zha', char: 'ظ' }, { id: '18ain', char: 'ع' },
    { id: '19ghain', char: 'غ' }, { id: '20fa', char: 'ف' }, { id: '21qaf', char: 'ق' },
    { id: '22kaf', char: 'ك' }, { id: '23lam', char: 'ل' }, { id: '24meem', char: 'م' },
    { id: '25noon', char: 'ن' }, { id: '26ha_a', char: 'هـ' }, { id: '27waw', char: 'و' },
    { id: '28ya', char: 'ي' }
];

// --- (تم التعديل) هيكل اللوحة (81 خلية) ---
const T = 'transparent'; // خلية شفافة
const G = 'default';     // خلية لعب رمادية
const R = 'red';         // خلية موصل أحمر
const P = 'purple';      // خلية موصل بنفسجي
// (تم حذف D - الزوايا الداكنة)

const BOARD_LAYOUT = [
    [T, T, T, T, T, T, T, T, T], // صف 0 (شفاف)
    [T, T, R, R, R, R, R, R, T], // صف 1: (1T, 6R, 2T) - حسب طلبك
    [T, P, G, G, G, G, G, P, T], // صف 2: (1T, 1P, 5G, 1P, 1T)
    [T, P, G, G, G, G, G, P, T], // صف 3
    [T, P, G, G, G, G, G, P, T], // صف 4
    [T, P, G, G, G, G, G, P, T], // صف 5
    [T, P, G, G, G, G, G, P, T], // صف 6
    [T, T, R, R, R, R, R, R, T], // صف 7: (نفس صف 1)
    [T, T, T, T, T, T, T, T, T]  // صف 8 (شفاف)
];


// --- الوظائف (Functions) ---

/** 0. خلط المصفوفة */
function shuffleArray(array) {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/** 1. جلب سجل الأسئلة */
function loadUsedQuestions() {
    const stored = localStorage.getItem('hrof_used_questions');
    usedQuestions = stored ? JSON.parse(stored) : {};
}

/** 2. حفظ سجل الأسئلة */
function saveUsedQuestions() {
    localStorage.setItem('hrof_used_questions', JSON.stringify(usedQuestions));
}

/** 3. معالجة أزرار الإعدادات */
function handleSettingClick(event) {
    const clickedButton = event.target;
    const settingType = clickedButton.dataset.setting;
    const settingValue = clickedButton.dataset.value;
    gameSettings[settingType] = settingValue;
    const buttonsInGroup = document.querySelectorAll(`.setting-button[data-setting="${settingType}"]`);
    buttonsInGroup.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
}

/** 4. وظيفة بدء اللعبة */
function startGame() {
    mainMenuScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    scores = { purple: 0, red: 0 };
    updateScoreboard();

    loadUsedQuestions();
    startNewRound();
}

/** 5. بدء جولة جديدة */
function startNewRound() {
    gameActive = true; 
    roundWinOverlay.style.display = 'none'; 
    initializeGameBoard(); 
    TurnManager.startGame(); 
}

/** 6. (تم التعديل) بناء لوحة اللعب بالخلايا الشفافة (81 خلية) */
function initializeGameBoard() {
    gameBoardContainer.innerHTML = '';
    const shuffledLetters = shuffleArray(ALL_LETTERS);
    const gameLetters = shuffledLetters.slice(0, 25);
    let letterIndex = 0;

    BOARD_LAYOUT.forEach((rowData, r) => {
        const row = document.createElement('div');
        row.classList.add('hex-row');
        
        rowData.forEach((cellType, c) => {
            const cell = document.createElement('div');
            cell.classList.add('hex-cell'); 
            cell.dataset.row = r;
            cell.dataset.col = c;

            switch(cellType) {
                // (تم حذف case D)
                case R: // 'red'
                    cell.classList.add('hex-cell-red');
                    break;
                case P: // 'purple'
                    cell.classList.add('hex-cell-purple');
                    break;
                case G: // 'default'
                    cell.classList.add('hex-cell-default','playable');
                    
                    if (letterIndex < gameLetters.length) {
                        const letter = gameLetters[letterIndex];
                        cell.dataset.letterId = letter.id;
                        const letterSpan = document.createElement('span');
                        letterSpan.classList.add('hex-letter');
                        letterSpan.textContent = letter.char;
                        cell.appendChild(letterSpan);
                        letterIndex++;
                    }
                    
                    cell.addEventListener('click', handleCellClick);
                    break;
                case T: // (جديد) 'transparent'
                    cell.classList.add('hex-cell-transparent');
                    break;
            }
            row.appendChild(cell);
        });
        gameBoardContainer.appendChild(row);
    });
}


/** 7. معالجة النقر على الخلية */
async function handleCellClick(event) {
    if (!gameActive) return;

    const clickedCell = event.currentTarget;
    const letterId = clickedCell.dataset.letterId;
    if (!clickedCell.classList.contains('playable')) return; // سيمنع النقر على الشفاف

    currentClickedCell = clickedCell;
    const question = await getQuestionForLetter(letterId);
    if (question) {
        currentQuestion = question;
        questionText.textContent = question.question;
        answerText.textContent = question.answer;
        answerRevealSection.style.display = 'none';
        questionModalOverlay.style.display = 'flex';
    } else {
        console.error(`لا يمكن جلب الأسئلة للملف: ${letterId}. هل الملف موجود؟`);
        questionText.textContent = 'عذراً، حدث خطأ في جلب السؤال.';
        answerText.textContent = '...';
        answerRevealSection.style.display = 'none';
        questionModalOverlay.style.display = 'flex';
    }
}

/** 8. جلب سؤال لحرف معين */
async function getQuestionForLetter(letterId) {
    if (!questionCache[letterId]) {
        try {
            const response = await fetch(`data/questions/${letterId}.json`);
            if (!response.ok) throw new Error('ملف السؤال غير موجود');
            questionCache[letterId] = await response.json();
        } catch (error) { console.error(error); return null; }
    }
    const allQuestions = questionCache[letterId];
    if (!allQuestions || allQuestions.length === 0) return null; 
    let unusedQuestions = [];
    for (let i = 0; i < allQuestions.length; i++) {
        const questionId = `${letterId}_q${i}`;
        if (!usedQuestions[questionId]) {
            unusedQuestions.push({ ...allQuestions[i], id: questionId });
        }
    }
    if (unusedQuestions.length === 0) {
        for (let i = 0; i < allQuestions.length; i++) {
            delete usedQuestions[`${letterId}_q${i}`];
        }
        saveUsedQuestions();
        unusedQuestions = allQuestions.map((q, i) => ({ ...q, id: `${letterId}_q${i}` }));
    }
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
    return unusedQuestions[randomIndex];
}

/** 9. إظهار الجواب */
function showAnswer() {
    answerRevealSection.style.display = 'block';
}

/** 10. معالجة نتيجة السؤال */
function handleQuestionResult(result) {
    questionModalOverlay.style.display = 'none';

    if (currentQuestion) {
        usedQuestions[currentQuestion.id] = true;
        saveUsedQuestions();
    }

    if (result === 'purple' || result === 'red') {
        const teamColor = result;
        currentClickedCell.classList.remove('playable','hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${teamColor}-owned`);
        
        if (checkWinCondition(teamColor)) {
            handleGameWin(teamColor);
            return;
        }
    }

    TurnManager.nextTurn(result);
    currentClickedCell = null;
    currentQuestion = null;
}

/** 11. جلب خلية بواسطة الإحداثيات */
function getCell(r,c) {
    return document.querySelector(`.hex-cell[data-row="${r}"][data-col="${c}"]`);
}

/** 12. (تم التعديل) جلب الجيران (لتوجيه مدبب الرأس 9x9) */
function getNeighbors(r, c) {
    r = parseInt(r);
    c = parseInt(c);
    
    let potentialNeighbors = [];
    const isOddRow = r % 2 !== 0; // نعتمد على الصف الفردي/الزوجي

    if (isOddRow) { // صف فردي (مزاح لليمين)
        potentialNeighbors = [
            [r, c - 1],     // يسار
            [r, c + 1],     // يمين
            [r - 1, c],     // أعلى-يسار
            [r - 1, c + 1], // أعلى-يمين
            [r + 1, c],     // أسفل-يسار
            [r + 1, c + 1]  // أسفل-يمين
        ];
    } else { // صف زوجي
        potentialNeighbors = [
            [r, c - 1],     // يسار
            [r, c + 1],     // يمين
            [r - 1, c - 1], // أعلى-يسار
            [r - 1, c],     // أعلى-يمين
            [r + 1, c - 1], // أسفل-يسار
            [r + 1, c]      // أسفل-يمين
        ];
    }

    // (الإصلاح الحاسم)
    // فلترة الجيران بناءً على هيكل اللوحة الفعلي (81 خلية)
    return potentialNeighbors.filter(([nr, nc]) => {
        return BOARD_LAYOUT[nr] && 
               BOARD_LAYOUT[nr][nc] !== undefined &&
               BOARD_LAYOUT[nr][nc] !== T; // تجاهل الخلايا الشفافة
    });
}


/** 13. (تم التعديل) التحقق من الفوز (بناءً على إحداثيات 81 خلية) */
function checkWinCondition(teamColor) {
    const visited = new Set();
    const queue = [];

    if (teamColor==='red'){
        // البدء من الصف 1، الخلايا 1 إلى 6 (6 خلايا حمراء)
        for(let c=1; c<=6; c++){ // (تعديل)
            const cell = getCell(1,c); // (تعديل)
            if(cell && cell.classList.contains('hex-cell-red-owned')){
                queue.push([1,c]); // (تعديل)
                visited.add(`1,${c}`); // (تعديل)
            }
        }
    } else {
        // البدء من العمود 1، الصفوف 2 إلى 6 (5 خلايا بنفسجية)
        for(let r=2; r<=6; r++){ // (تعديل)
            const cell = getCell(r,1); // (تعديل)
            if(cell && cell.classList.contains('hex-cell-purple-owned')){
                queue.push([r,1]); // (تعديل)
                visited.add(`${r},1`); // (تعديل)
            }
        }
    }

    while(queue.length>0){
        const [r,c] = queue.shift();
        
        const neighbors = getNeighbors(r,c);
        
        for(const [nr,nc] of neighbors){
            // التحقق من الوصول للطرف الآخر
            if(teamColor==='red' && nr===7) return true; // الوصول للصف 7 (تعديل)
            if(teamColor==='purple' && nc===7) return true; // الوصول للعمود 7 (تعديل)
            
            const neighborCell = getCell(nr,nc);
            if(neighborCell && !visited.has(`${nr},${nc}`) && 
               neighborCell.classList.contains(`hex-cell-${teamColor}-owned`))
            {
                visited.add(`${nr},${nc}`);
                queue.push([nr,nc]);
            }
        }
    }

    return false;
}

/** 14. معالجة الفوز بالجولة */
function handleGameWin(teamColor){
    gameActive=false;
    scores[teamColor]++;
    updateScoreboard();
    winMessage.textContent = (teamColor==='red')?'الفريق الأحمر فاز بالجولة!':'الفريق البنفسجي فاز بالجولة!';
    winScorePurple.textContent = scores.purple;
    winScoreRed.textContent = scores.red;
    roundWinOverlay.style.display='flex';
}

/** 15. تحديث لوحة النتائج */
function updateScoreboard(){
    purpleScoreDisplay.textContent = scores.purple;
    redScoreDisplay.textContent = scores.red;
}

// --- ربط الأحداث ---
settingButtons.forEach(button=>{ button.addEventListener('click', handleSettingClick); });
startGameButton.addEventListener('click', startGame);
nextRoundButton.addEventListener('click', startNewRound);

showAnswerButton.addEventListener('click', showAnswer);
teamPurpleWinButton.addEventListener('click', ()=>handleQuestionResult('purple'));
teamRedWinButton.addEventListener('click', ()=>handleQuestionResult('red'));
skipQuestionButton.addEventListener('click', ()=>handleQuestionResult('skip'));
