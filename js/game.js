// --- استيراد مدير الأدوار ---
import { TurnManager } from './turn_manager.js';

// --- (تم التعديل) العناصر (Elements) ---
const mainMenuScreen = document.getElementById('main-menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameBoardContainer = document.getElementById('game-board-container');

// عناصر القائمة الرئيسية
const settingButtons = document.querySelectorAll('.setting-button');
const startGameButton = document.getElementById('start-game-button');
const instructionsButton = document.getElementById('instructions-button');
const instructionsModalOverlay = document.getElementById('instructions-modal-overlay');
const closeInstructionsButton = document.getElementById('close-instructions-button');

// (جديد) لوحات إعدادات الفرق
const individualSettingsPanel = document.getElementById('players-individual-settings');
const teamSettingsPanel = document.getElementById('players-team-settings');

// (جديد) حقول إدخال "فردي"
const player1NameInput = document.getElementById('player-1-name-input');
const player2NameInput = document.getElementById('player-2-name-input');

// (جديد) حقول إدخال "فريق"
const team1NameInput = document.getElementById('team-1-name-input');
const team2NameInput = document.getElementById('team-2-name-input');
// (ملاحظة: حقول أسماء الأعضاء لا نحتاج لجلبها الآن إلا إذا أردنا عرضها)

// عناصر شاشة اللعبة
const rotateOverlay = document.getElementById('rotate-device-overlay');
const closeRotateOverlay = document.getElementById('close-rotate-overlay');
const exitGameButton = document.getElementById('exit-game-button');
const toggleThemeButton = document.getElementById('toggle-theme-button');

// عناصر نافذة السؤال
const questionModalOverlay = document.getElementById('question-modal-overlay');
const questionText = document.getElementById('question-text');
const showAnswerButton = document.getElementById('show-answer-button');
const answerRevealSection = document.getElementById('answer-reveal-section');
const answerText = document.getElementById('answer-text');

// أزرار التحكم بالنتيجة
const competitiveControls = document.getElementById('competitive-controls');
const turnsControls = document.getElementById('turns-controls');
const teamPurpleWinButton = document.getElementById('team-purple-win-button');
const teamRedWinButton = document.getElementById('team-red-win-button');
const competitiveSkipButton = document.getElementById('competitive-skip-button');
const turnCorrectButton = document.getElementById('turn-correct-button');
const turnSkipButton = document.getElementById('turn-skip-button');

// عناصر لوحة النتائج
const purpleScoreDisplay = document.getElementById('purple-score');
const redScoreDisplay = document.getElementById('red-score');
const purpleScoreboardName = document.querySelector('#team-purple-scoreboard .team-name');
const redScoreboardName = document.querySelector('#team-red-scoreboard .team-name');
const purpleButtonName = document.querySelector('#team-purple-win-button .team-name-in-button');
const redButtonName = document.querySelector('#team-red-win-button .team-name-in-button');


// عناصر شاشة الفوز
const roundWinOverlay = document.getElementById('round-win-overlay');
const winMessage = document.getElementById('win-message');
const winScorePurple = document.getElementById('win-score-purple');
const winScoreRed = document.getElementById('win-score-red');
const nextRoundButton = document.getElementById('next-round-button');

// --- تصدير إعدادات اللعبة ---
export const gameSettings = {
    mode: 'turns',
    teams: 'individual', // (تم التعديل) القيمة الافتراضية
    timer: 'off',
    team1Name: 'اللاعب 1',
    team2Name: 'اللاعب 2'
};

// --- متغيرات حالة اللعبة ---
const questionCache = {};
let usedQuestions = {};
let currentClickedCell = null;
let currentQuestion = null;
let gameActive = true; 
let scores = { purple: 0, red: 0 };
// let timerInterval = null; 

// --- قائمة الحروف الأساسية ---
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

// --- هيكل اللوحة (81 خلية) ---
const T = 'transparent'; 
const G = 'default';     
const R = 'red';         
const P = 'purple';      

const BOARD_LAYOUT = [
    [T, T, T, T, T, T, T, T, T], // صف 0 (شفاف)
    [T, R, R, R, R, R, R, T, T], // صف 1: (1T, 6R, 2T)
    [T, P, G, G, G, G, G, P, T], // صف 2: (1T, 1P, 5G, 1P, 1T)
    [T, P, G, G, G, G, G, P, T], // صف 3
    [T, P, G, G, G, G, G, P, T], // صف 4
    [T, P, G, G, G, G, G, P, T], // صف 5
    [T, P, G, G, G, G, G, P, T], // صف 6
    [T, R, R, R, R, R, R, T, T], // صف 7: (نفس صف 1)
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

/** 3. (تم التعديل) معالجة أزرار الإعدادات */
function handleSettingClick(event) {
    const clickedButton = event.target;
    const settingType = clickedButton.dataset.setting;
    const settingValue = clickedButton.dataset.value;

    gameSettings[settingType] = settingValue;
    console.log('الإعدادات المحدثة:', gameSettings);

    const buttonsInGroup = document.querySelectorAll(`.setting-button[data-setting="${settingType}"]`);
    buttonsInGroup.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');

    // (جديد) إظهار/إخفاء لوحات إدخال الأسماء
    if (settingType === 'teams') {
        if (settingValue === 'individual') {
            individualSettingsPanel.classList.remove('hidden');
            teamSettingsPanel.classList.add('hidden');
        } else if (settingValue === 'team') {
            individualSettingsPanel.classList.add('hidden');
            teamSettingsPanel.classList.remove('hidden');
        }
    }
}

/** 4. (تم التعديل) وظيفة بدء اللعبة */
function startGame() {
    // 1. حفظ الإعدادات بناءً على اللوحة النشطة
    if (gameSettings.teams === 'individual') {
        gameSettings.team1Name = player1NameInput.value || 'اللاعب 1';
        gameSettings.team2Name = player2NameInput.value || 'اللاعب 2';
    } else {
        gameSettings.team1Name = team1NameInput.value || 'الفريق البنفسجي';
        gameSettings.team2Name = team2NameInput.value || 'الفريق الأحمر';
        // (مستقبلاً: يمكن حفظ أسماء الأعضاء هنا)
    }

    // 2. تحديث الواجهة
    mainMenuScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    // 3. تحديث الأسماء في لوحة النتائج وفي نافذة السؤال
    purpleScoreboardName.textContent = gameSettings.team1Name;
    redScoreboardName.textContent = gameSettings.team2Name;
    purpleButtonName.textContent = gameSettings.team1Name;
    redButtonName.textContent = gameSettings.team2Name;
    
    // 4. بدء اللعبة
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

/** 6. بناء لوحة اللعب بالخلايا الشفافة (81 خلية) */
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
                case R:
                    cell.classList.add('hex-cell-red');
                    break;
                case P:
                    cell.classList.add('hex-cell-purple');
                    break;
                case G:
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
                case T:
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
    if (!clickedCell.classList.contains('playable')) return;

    currentClickedCell = clickedCell;
    const question = await getQuestionForLetter(letterId);

    // (جديد) إظهار الأزرار الصحيحة بناءً على وضع اللعبة
    if (gameSettings.mode === 'turns') {
        competitiveControls.classList.add('hidden');
        turnsControls.classList.remove('hidden');
    } else {
        competitiveControls.classList.remove('hidden');
        turnsControls.classList.add('hidden');
    }
    
    answerRevealSection.style.display = 'none';

    if (question) {
        currentQuestion = question;
        questionText.textContent = question.question;
        answerText.textContent = question.answer;
        questionModalOverlay.style.display = 'flex';
    } else {
        console.error(`لا يمكن جلب الأسئلة للملف: ${letterId}. هل الملف موجود؟`);
        questionText.textContent = 'عذراً، حدث خطأ في جلب السؤال.';
        answerText.textContent = '...';
        questionModalOverlay.style.display = 'flex';
    }

    // (لم يتم تفعيل المؤقت بعد)
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
    // (لم يتم تفعيل المؤقت بعد)
    
    questionModalOverlay.style.display = 'none';

    if (currentQuestion) {
        usedQuestions[currentQuestion.id] = true;
        saveUsedQuestions();
    }

    let teamColor = null;

    if (result === 'purple') {
        teamColor = 'purple';
    } else if (result === 'red') {
        teamColor = 'red';
    } else if (result === 'turn_correct') {
        teamColor = TurnManager.getCurrentPlayer(); 
    }

    if (teamColor) {
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

/** 12. جلب الجيران (لتوجيه مدبب الرأس 9x9) */
function getNeighbors(r, c) {
    r = parseInt(r);
    c = parseInt(c);
    
    let potentialNeighbors = [];
    const isOddRow = r % 2 !== 0; 

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

    return potentialNeighbors.filter(([nr, nc]) => {
        return BOARD_LAYOUT[nr] && 
               BOARD_LAYOUT[nr][nc] !== undefined &&
               BOARD_LAYOUT[nr][nc] !== T; 
    });
}


/** 13. التحقق من الفوز (بناءً على إحداثيات 81 خلية) */
function checkWinCondition(teamColor) {
    const visited = new Set();
    const queue = [];

    if (teamColor==='red'){
        // البدء من الصف 1، الخلايا 1 إلى 6 (6 خلايا حمراء)
        for(let c=1; c<=6; c++){ 
            const cell = getCell(1,c); 
            if(cell && cell.classList.contains('hex-cell-red-owned')){
                queue.push([1,c]); 
                visited.add(`1,${c}`); 
            }
        }
    } else {
        // البدء من العمود 1، الصفوف 2 إلى 6 (5 خلايا بنفسجية)
        for(let r=2; r<=6; r++){ 
            const cell = getCell(r,1); 
            if(cell && cell.classList.contains('hex-cell-purple-owned')){
                queue.push([r,1]); 
                visited.add(`${r},1`); 
            }
        }
    }

    while(queue.length>0){
        const [r,c] = queue.shift();
        
        const neighbors = getNeighbors(r,c);
        
        for(const [nr,nc] of neighbors){
            if(teamColor==='red' && nr===7) return true; 
            if(teamColor==='purple' && nc===7) return true; 
            
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
    winMessage.textContent = (teamColor==='red')? `${gameSettings.team2Name} فاز بالجولة!` : `${gameSettings.team1Name} فاز بالجولة!`;
    winScorePurple.textContent = scores.purple;
    winScoreRed.textContent = scores.red;
    roundWinOverlay.style.display='flex';
}

/** 15. تحديث لوحة النتائج */
function updateScoreboard(){
    purpleScoreDisplay.textContent = scores.purple;
    redScoreDisplay.textContent = scores.red;
}

// --- وظائف الميزات الإضافية ---

/** 16. الخروج للقائمة الرئيسية */
function exitToMenu() {
    gameScreen.classList.remove('active');
    mainMenuScreen.classList.add('active');
    // stopTimer();
}

/** 17. تبديل الوضع (فاتح/غامق) */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    const button = document.getElementById('toggle-theme-button');
    if (document.body.classList.contains('dark-mode')) {
        button.textContent = 'تبديل الوضع (فاتح)';
    } else {
        button.textContent = 'تبديل الوضع (غامق)';
    }
}

/** 18. إظهار التعليمات */
function showInstructions() {
    instructionsModalOverlay.style.display = 'flex';
}

/** 19. إخفاء التعليمات */
function hideInstructions() {
    instructionsModalOverlay.style.display = 'none';
}

/** 20. إخفاء رسالة تدوير الجهاز */
function hideRotateMessage() {
    rotateOverlay.style.display = 'none';
}

/** 21. التحقق من جهاز اللمس */
function checkDevice() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (!isTouch) {
        rotateOverlay.style.display = 'none';
    }
}

// --- (تم التعديل) ربط الأحداث ---
document.addEventListener('DOMContentLoaded', checkDevice); 

settingButtons.forEach(button=>{ button.addEventListener('click', handleSettingClick); });
startGameButton.addEventListener('click', startGame);
nextRoundButton.addEventListener('click', startNewRound);
instructionsButton.addEventListener('click', showInstructions); 
closeInstructionsButton.addEventListener('click', hideInstructions); 

exitGameButton.addEventListener('click', exitToMenu); 
toggleThemeButton.addEventListener('click', toggleTheme); 
closeRotateOverlay.addEventListener('click', hideRotateMessage); 

showAnswerButton.addEventListener('click', showAnswer);
teamPurpleWinButton.addEventListener('click', ()=>handleQuestionResult('purple'));
teamRedWinButton.addEventListener('click', ()=>handleQuestionResult('red'));
competitiveSkipButton.addEventListener('click', ()=>handleQuestionResult('skip')); 
turnCorrectButton.addEventListener('click', ()=>handleQuestionResult('turn_correct')); 
turnSkipButton.addEventListener('click', ()=>handleQuestionResult('turn_skip'));
