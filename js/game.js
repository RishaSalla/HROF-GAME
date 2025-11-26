import { TurnManager } from './turn_manager.js';

// --- إدارة الشاشات (الحل الجذري) ---
const screens = document.querySelectorAll('.screen');
function switchScreen(screenId) {
    screens.forEach(s => {
        s.classList.remove('active'); // إزالة الكلاس
        s.style.display = 'none'; // إخفاء نهائي
    });
    const activeScreen = document.getElementById(screenId);
    activeScreen.style.display = 'flex'; // تجهيز العرض
    // تأخير بسيط لضمان عدم التداخل
    setTimeout(() => activeScreen.classList.add('active'), 50);
}

// --- العناصر ---
const gameBoardContainer = document.getElementById('game-board-container');
// (إعدادات)
const modeTabs = document.querySelectorAll('.mode-tab');
const pillBtns = document.querySelectorAll('.pill-btn');
const startGameButton = document.getElementById('start-game-button');
const player1Input = document.getElementById('player-1-name-input');
const player2Input = document.getElementById('player-2-name-input');
const team1Input = document.getElementById('team-1-name-input-team');
const team2Input = document.getElementById('team-2-name-input-team');
const indivRedDiv = document.getElementById('indiv-red');
const teamRedDiv = document.getElementById('team-red');
const indivPurpleDiv = document.getElementById('indiv-purple');
const teamPurpleDiv = document.getElementById('team-purple');
const addTeam1Btn = document.getElementById('add-team-1-member-button');
const addTeam2Btn = document.getElementById('add-team-2-member-button');
const team1List = document.getElementById('team-1-members-list');
const team2List = document.getElementById('team-2-members-list');

// (لعبة)
const redTeamNameDisplay = document.getElementById('red-team-name');
const purpleTeamNameDisplay = document.getElementById('purple-team-name');
const redRosterDisplay = document.getElementById('red-roster-display');
const purpleRosterDisplay = document.getElementById('purple-roster-display');

const questionModalOverlay = document.getElementById('question-modal-overlay');
const questionText = document.getElementById('question-text');
const questionCharDisplay = document.getElementById('question-char-display');
const showAnswerButton = document.getElementById('show-answer-button');
const answerRevealSection = document.getElementById('answer-reveal-section');
const answerText = document.getElementById('answer-text');
const competitiveControls = document.getElementById('competitive-controls');
const turnsControls = document.getElementById('turns-controls');

const roundWinOverlay = document.getElementById('round-win-overlay');
const winMessage = document.getElementById('win-message');
const nextRoundButton = document.getElementById('next-round-button');

// صوتيات
const soundClick = document.getElementById('sound-click');
const soundFlip = document.getElementById('sound-flip');
const soundCorrect = document.getElementById('sound-correct');
const soundWrong = document.getElementById('sound-wrong');
const soundWin = document.getElementById('sound-win');

// --- البيانات ---
export const gameSettings = { mode: 'turns', teams: 'individual', timer: 'off', team1Name: '', team2Name: '', team1Members: [], team2Members: [] };
let gameActive = true;
let currentClickedCell = null;
let currentQuestion = null;
let scores = { purple: 0, red: 0 };
const WINNING_SCORE = 1; // الفوز من جولة واحدة

// الحروف (مختصرة هنا، لكن استخدم قائمتك الكاملة)
const ALL_LETTERS = [
    { id: '01alif', char: 'أ', name: 'حرف الألف' }, { id: '02ba', char: 'ب', name: 'حرف الباء' }, 
    { id: '03ta', char: 'ت', name: 'حرف التاء' }, { id: '04tha', char: 'ث', name: 'حرف الثاء' },
    { id: '05jeem', char: 'ج', name: 'حرف الجيم' }, { id: '06haa', char: 'ح', name: 'حرف الحاء' },
    { id: '07khaa', char: 'خ', name: 'حرف الخاء' }, { id: '08dal', char: 'د', name: 'حرف الدال' },
    { id: '09dhal', char: 'ذ', name: 'حرف الذال' }, { id: '10ra', char: 'ر', name: 'حرف الراء' },
    { id: '11zay', char: 'ز', name: 'حرف الزاي' }, { id: '12seen', char: 'س', name: 'حرف السين' },
    { id: '13sheen', char: 'ش', name: 'حرف الشين' }, { id: '14sad', char: 'ص', name: 'حرف الصاد' },
    { id: '15dad', char: 'ض', name: 'حرف الضاد' }, { id: '16ta_a', char: 'ط', name: 'حرف الطاء' },
    { id: '17zha', char: 'ظ', name: 'حرف الظاء' }, { id: '18ain', char: 'ع', name: 'حرف العين' },
    { id: '19ghain', char: 'غ', name: 'حرف الغين' }, { id: '20fa', char: 'ف', name: 'حرف الفاء' },
    { id: '21qaf', char: 'ق', name: 'حرف القاف' }, { id: '22kaf', char: 'ك', name: 'حرف الكاف' },
    { id: '23lam', char: 'ل', name: 'حرف اللام' }, { id: '24meem', char: 'م', name: 'حرف الميم' },
    { id: '25noon', char: 'ن', name: 'حرف النون' }, { id: '26ha_a', char: 'هـ', name: 'حرف الهاء' },
    { id: '27waw', char: 'و', name: 'حرف الواو' }, { id: '28ya', char: 'ي', name: 'حرف الياء' }
];

const T='T', G='G', R='red', P='purple';
const BOARD_LAYOUT = [ [T, T, T, T, T, T, T, T, T], [T, T, R, R, R, R, R, R, T], [T, P, G, G, G, G, G, P, T], [T, P, G, G, G, G, G, P, T], [T, P, G, G, G, G, G, P, T], [T, P, G, G, G, G, G, P, T], [T, P, G, G, G, G, G, P, T], [T, T, R, R, R, R, R, R, T], [T, T, T, T, T, T, T, T, T] ];

// --- الوظائف الرئيسية ---

function startGame() {
    playSound(soundClick);
    
    // حفظ البيانات
    if (gameSettings.teams === 'individual') {
        gameSettings.team1Name = player1Input.value || 'الأحمر';
        gameSettings.team2Name = player2Input.value || 'البنفسجي';
        gameSettings.team1Members = [player1Input.value];
        gameSettings.team2Members = [player2Input.value];
    } else {
        gameSettings.team1Name = team1Input.value || 'فريق 1';
        gameSettings.team2Name = team2Input.value || 'فريق 2';
        gameSettings.team1Members = Array.from(team1List.querySelectorAll('input')).map(i=>i.value).filter(v=>v);
        gameSettings.team2Members = Array.from(team2List.querySelectorAll('input')).map(i=>i.value).filter(v=>v);
    }

    // تعبئة الواجهة
    redTeamNameDisplay.textContent = gameSettings.team1Name;
    purpleTeamNameDisplay.textContent = gameSettings.team2Name;
    fillRoster(redRosterDisplay, gameSettings.team1Members);
    fillRoster(purpleRosterDisplay, gameSettings.team2Members);

    // الانتقال للشاشة (أهم نقطة لمنع التعليق)
    switchScreen('game-screen');
    
    startNewRound();
    setTimeout(resizeBoard, 100);
    window.addEventListener('resize', resizeBoard);
}

function fillRoster(container, list) {
    container.innerHTML = '';
    list.forEach(name => {
        const div = document.createElement('div');
        div.className = 'roster-item';
        div.textContent = name;
        container.appendChild(div);
    });
}

function startNewRound() {
    gameActive = true;
    roundWinOverlay.classList.add('hidden');
    scores = {red:0, purple:0};
    initializeBoard();
    TurnManager.startGame({mode: gameSettings.mode});
}

function initializeBoard() {
    gameBoardContainer.innerHTML = '';
    const shuffled = [...ALL_LETTERS].sort(() => 0.5 - Math.random());
    let idx = 0;

    BOARD_LAYOUT.forEach((row, r) => {
        const rowDiv = document.createElement('div'); rowDiv.className = 'hex-row';
        row.forEach((type, c) => {
            const cell = document.createElement('div'); cell.className = 'hex-cell';
            cell.dataset.row = r; cell.dataset.col = c;
            
            if (type === G) {
                cell.classList.add('hex-cell-default', 'playable');
                if (idx < 25) {
                    const l = shuffled[idx++];
                    cell.dataset.name = l.name; cell.dataset.id = l.id;
                    cell.innerHTML = `<span class="hex-letter">${l.char}</span>`;
                }
                cell.addEventListener('click', handleCellClick);
            } else if (type === R) cell.classList.add('hex-cell-red');
            else if (type === P) cell.classList.add('hex-cell-purple');
            else cell.classList.add('hex-cell-transparent');
            
            rowDiv.appendChild(cell);
        });
        gameBoardContainer.appendChild(rowDiv);
    });
}

async function handleCellClick(e) {
    if (!gameActive) return;
    const cell = e.currentTarget;
    if (!cell.classList.contains('playable')) return;

    playSound(soundFlip);
    currentClickedCell = cell;
    questionCharDisplay.textContent = cell.dataset.name;

    // جلب السؤال (مؤقت للمحاكاة)
    try {
        const res = await fetch(`data/questions/${cell.dataset.id}.json`);
        if (res.ok) {
            const data = await res.json();
            const q = data[Math.floor(Math.random() * data.length)];
            currentQuestion = q;
            questionText.textContent = q.question;
            answerText.textContent = q.answer;
        }
    } catch(err) {
        questionText.textContent = "سؤال تجريبي (لم يتم العثور على الملف)";
        answerText.textContent = "الإجابة النموذجية";
    }

    // تجهيز النافذة
    if (gameSettings.mode === 'turns') {
        competitiveControls.classList.add('hidden'); turnsControls.classList.remove('hidden');
    } else {
        competitiveControls.classList.remove('hidden'); turnsControls.classList.add('hidden');
    }
    
    answerRevealSection.style.display = 'none';
    showAnswerButton.classList.remove('hidden');
    questionModalOverlay.classList.remove('hidden');
}

// معالجة النتائج
function handleResult(res) {
    questionModalOverlay.classList.add('hidden');
    let color = null;
    let sound = soundWrong;

    if (res === 'red') { color = 'red'; sound = soundCorrect; }
    else if (res === 'purple') { color = 'purple'; sound = soundCorrect; }
    else if (res === 'turn_correct') { 
        color = TurnManager.getCurrentPlayer(); sound = soundCorrect; 
    }
    
    playSound(sound);

    if (color) {
        currentClickedCell.classList.remove('playable', 'hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${color}-owned`);
        if (checkWin(color)) { handleWin(color); return; }
    }

    checkDraw();
    TurnManager.nextTurn();
}

function checkWin(color) {
    // (منطق الفوز المبسط - BFS)
    // ... (نفس كود الفحص السابق، يعمل بامتياز) ...
    const visited = new Set(); const queue = []; const parent = new Map();
    const getCell = (r,c) => document.querySelector(`.hex-cell[data-row="${r}"][data-col="${c}"]`);
    
    if(color==='red'){ 
        for(let c=2;c<=6;c++) if(getCell(2,c)?.classList.contains('hex-cell-red-owned')) { queue.push([2,c]); visited.add(`2,${c}`); parent.set(`2,${c}`, null); }
    } else { 
        for(let r=2;r<=6;r++) if(getCell(r,6)?.classList.contains('hex-cell-purple-owned')) { queue.push([r,6]); visited.add(`${r},6`); parent.set(`${r},6`, null); }
    }

    while(queue.length > 0) {
        const [r,c] = queue.shift();
        // Get Neighbors (Odd-r logic)
        const isOdd = r % 2 !== 0;
        const diffs = isOdd ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]] : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
        
        for (const [dr, dc] of diffs) {
            const nr = r + dr, nc = c + dc;
            if (nr<0 || nr>=9 || nc<0 || nc>=9) continue;
            const key = `${nr},${nc}`;
            
            // Check Win
            if ((color==='red' && nr===7 && BOARD_LAYOUT[nr][nc]===R) || 
                (color==='purple' && nc===1 && BOARD_LAYOUT[nr][nc]===P)) {
                
                // Build Path
                const path = []; let curr = `${r},${c}`;
                while(curr) { path.push(curr); curr = parent.get(curr); }
                return path;
            }

            const cell = getCell(nr, nc);
            if (cell && !visited.has(key) && cell.classList.contains(`hex-cell-${color}-owned`)) {
                visited.add(key); parent.set(key, `${r},${c}`); queue.push([nr, nc]);
            }
        }
    }
    return null;
}

function handleWin(color) {
    playSound(soundWin);
    gameActive = false;
    winMessage.textContent = `مبروك! الفريق ${color==='red'?'الأحمر':'البنفسجي'} فاز!`;
    roundWinOverlay.classList.remove('hidden');
}

function checkDraw() {
    if (!document.querySelector('.hex-cell.playable') && gameActive) {
        gameActive = false; winMessage.textContent = "تعادل!";
        roundWinOverlay.classList.remove('hidden'); playSound(soundWrong);
    }
}

function resizeBoard() {
    // تحجيم بسيط وآمن
    if (!gameScreen.classList.contains('active')) return;
    const h = window.innerHeight;
    const scale = Math.min(window.innerWidth / 800, (h - 150) / 650);
    gameBoardContainer.style.transform = `scale(${Math.max(0.4, Math.min(scale, 1.2))})`;
}

// ربط الأزرار
document.getElementById('turn-correct-button').onclick = () => handleResult('turn_correct');
document.getElementById('turn-wrong-button').onclick = () => handleResult('skip');
document.getElementById('team-red-win-button').onclick = () => handleResult('red');
document.getElementById('team-purple-win-button').onclick = () => handleResult('purple');
document.getElementById('competitive-skip-button').onclick = () => handleResult('skip');
showAnswerButton.onclick = () => { answerRevealSection.style.display='block'; showAnswerButton.classList.add('hidden'); playSound(soundClick); };
startGameButton.onclick = startGame;
nextRoundButton.onclick = () => location.reload(); // أسهل طريقة لإعادة اللعبة بالكامل
document.getElementById('exit-game-button').onclick = () => location.reload();

// تفعيل التبديل في القائمة
modeTabs.forEach(btn => btn.addEventListener('click', (e) => {
    modeTabs.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    gameSettings.teams = e.target.dataset.value;
    if(gameSettings.teams === 'individual') {
        indivRedDiv.classList.remove('hidden'); teamRedDiv.classList.add('hidden');
        indivPurpleDiv.classList.remove('hidden'); teamPurpleDiv.classList.add('hidden');
    } else {
        indivRedDiv.classList.add('hidden'); teamRedDiv.classList.remove('hidden');
        indivPurpleDiv.classList.add('hidden'); teamPurpleDiv.classList.remove('hidden');
    }
}));

document.querySelectorAll('.pill-btn').forEach(btn => btn.addEventListener('click', (e) => {
    const type = e.target.dataset.setting;
    document.querySelectorAll(`.pill-btn[data-setting="${type}"]`).forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    gameSettings[type] = e.target.dataset.value;
}));

addTeam1Btn.onclick = () => { 
    const i = document.createElement('input'); i.placeholder = 'عضو جديد'; 
    team1List.appendChild(i); 
};
addTeam2Btn.onclick = () => { 
    const i = document.createElement('input'); i.placeholder = 'عضو جديد'; 
    team2List.appendChild(i); 
};
