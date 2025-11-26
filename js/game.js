import { TurnManager } from './turn_manager.js';

// العناصر
const mainMenuScreen = document.getElementById('main-menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameBoardContainer = document.getElementById('game-board-container');

// أزرار القائمة الجديدة
const modeTabs = document.querySelectorAll('.mode-tab');
const pillBtns = document.querySelectorAll('.pill-btn');
const startGameButton = document.getElementById('start-game-button');
const instructionsButton = document.getElementById('instructions-button');
const instructionsModalOverlay = document.getElementById('instructions-modal-overlay');
const closeInstructionsButton = document.getElementById('close-instructions-button');

// المدخلات
const indivRedDiv = document.getElementById('indiv-red');
const teamRedDiv = document.getElementById('team-red');
const indivPurpleDiv = document.getElementById('indiv-purple');
const teamPurpleDiv = document.getElementById('team-purple');

const player1Input = document.getElementById('player-1-name-input');
const player2Input = document.getElementById('player-2-name-input');
const team1Input = document.getElementById('team-1-name-input-team');
const team2Input = document.getElementById('team-2-name-input-team');

const addTeam1Btn = document.getElementById('add-team-1-member-button');
const addTeam2Btn = document.getElementById('add-team-2-member-button');
const team1List = document.getElementById('team-1-members-list');
const team2List = document.getElementById('team-2-members-list');

// عناصر اللعب
const redTeamNameDisplay = document.querySelector('#team-red-scoreboard .team-name');
const purpleTeamNameDisplay = document.querySelector('#team-purple-scoreboard .team-name');
const redRosterDisplay = document.getElementById('red-roster-display'); // (جديد)
const purpleRosterDisplay = document.getElementById('purple-roster-display'); // (جديد)

const questionModalOverlay = document.getElementById('question-modal-overlay');
const questionTimerDisplay = document.getElementById('question-timer');
const questionText = document.getElementById('question-text');
const questionCharDisplay = document.getElementById('question-char-display');
const showAnswerButton = document.getElementById('show-answer-button');
const answerRevealSection = document.getElementById('answer-reveal-section');
const answerText = document.getElementById('answer-text');

const competitiveControls = document.getElementById('competitive-controls');
const turnsControls = document.getElementById('turns-controls');
const teamPurpleWinButton = document.getElementById('team-purple-win-button');
const teamRedWinButton = document.getElementById('team-red-win-button');
const competitiveSkipButton = document.getElementById('competitive-skip-button');
const turnCorrectButton = document.getElementById('turn-correct-button');
const turnWrongButton = document.getElementById('turn-wrong-button');

const roundWinOverlay = document.getElementById('round-win-overlay');
const winMessage = document.getElementById('win-message');
const nextRoundButton = document.getElementById('next-round-button');

const exitGameButton = document.getElementById('exit-game-button');
const exitConfirmModal = document.getElementById('exit-confirm-modal');
const exitYes = document.getElementById('exit-confirm-yes');
const exitNo = document.getElementById('exit-confirm-no');

const soundStart = document.getElementById('sound-start');
const soundFlip = document.getElementById('sound-flip');
const soundWin = document.getElementById('sound-win');
const soundCorrect = document.getElementById('sound-correct');
const soundClick = document.getElementById('sound-click');
const soundWrong = document.getElementById('sound-wrong');

// الإعدادات
export const gameSettings = { mode: 'turns', teams: 'individual', timer: 'off', team1Name: '', team2Name: '', team1Members: [], team2Members: [] };

const questionCache = {};
let usedQuestions = {};
let currentClickedCell = null;
let currentQuestion = null;
let gameActive = true;
let timerInterval = null;
let remainingTime = 0;

// الحروف (نفس القائمة السابقة)
const ALL_LETTERS = [
    { id: '01alif', char: 'أ', name: 'حرف الألف' }, { id: '02ba', char: 'ب', name: 'حرف الباء' }, { id: '03ta', char: 'ت', name: 'حرف التاء' },
    { id: '04tha', char: 'ث', name: 'حرف الثاء' }, { id: '05jeem', char: 'ج', name: 'حرف الجيم' }, { id: '06haa', char: 'ح', name: 'حرف الحاء' },
    { id: '07khaa', char: 'خ', name: 'حرف الخاء' }, { id: '08dal', char: 'د', name: 'حرف الدال' }, { id: '09dhal', char: 'ذ', name: 'حرف الذال' },
    { id: '10ra', char: 'ر', name: 'حرف الراء' }, { id: '11zay', char: 'ز', name: 'حرف الزاي' }, { id: '12seen', char: 'س', name: 'حرف السين' },
    { id: '13sheen', char: 'ش', name: 'حرف الشين' }, { id: '14sad', char: 'ص', name: 'حرف الصاد' }, { id: '15dad', char: 'ض', name: 'حرف الضاد' },
    { id: '16ta_a', char: 'ط', name: 'حرف الطاء' }, { id: '17zha', char: 'ظ', name: 'حرف الظاء' }, { id: '18ain', char: 'ع', name: 'حرف العين' },
    { id: '19ghain', char: 'غ', name: 'حرف الغين' }, { id: '20fa', char: 'ف', name: 'حرف الفاء' }, { id: '21qaf', char: 'ق', name: 'حرف القاف' },
    { id: '22kaf', char: 'ك', name: 'حرف الكاف' }, { id: '23lam', char: 'ل', name: 'حرف اللام' }, { id: '24meem', char: 'م', name: 'حرف الميم' },
    { id: '25noon', char: 'ن', name: 'حرف النون' }, { id: '26ha_a', char: 'هـ', name: 'حرف الهاء' }, { id: '27waw', char: 'و', name: 'حرف الواو' },
    { id: '28ya', char: 'ي', name: 'حرف الياء' }
];

const T = 'transparent'; const G = 'default'; const R = 'red'; const P = 'purple';
const BOARD_LAYOUT = [ [T, T, T, T, T, T, T, T, T], [T, T, R, R, R, R, R, R, T], [T, P, G, G, G, G, G, P, T], [T, P, G, G, G, G, G, P, T], [T, P, G, G, G, G, G, P, T], [T, P, G, G, G, G, G, P, T], [T, P, G, G, G, G, G, P, T], [T, T, R, R, R, R, R, R, T], [T, T, T, T, T, T, T, T, T] ];

// الوظائف
function resizeBoard() {
    if (!gameScreen.classList.contains('active')) return;
    const boardWidth = 800; const boardHeight = 650; 
    const headerHeight = document.querySelector('.game-header').offsetHeight || 100;
    const footerHeight = document.querySelector('.game-controls').offsetHeight || 80;
    const availableWidth = window.innerWidth * 0.95; 
    const availableHeight = window.innerHeight - headerHeight - footerHeight - 20;
    const scaleX = availableWidth / boardWidth; const scaleY = availableHeight / boardHeight;
    let scale = Math.min(scaleX, scaleY);
    if (scale > 1.2) scale = 1.2; if (scale < 0.35) scale = 0.35; 
    gameBoardContainer.style.transform = `scale(${scale})`;
}

function playSound(audio) { if(audio){ audio.currentTime=0; audio.play().catch(e=>{}); } }
function shuffleArray(arr) { let newArr=[...arr]; for(let i=newArr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [newArr[i],newArr[j]]=[newArr[j],newArr[i]]; } return newArr; }
function loadUsedQuestions() { const s=localStorage.getItem('hrof_used'); usedQuestions=s?JSON.parse(s):{}; }
function saveUsedQuestions() { localStorage.setItem('hrof_used', JSON.stringify(usedQuestions)); }

// معالجة التبديل الجديد (Tabs)
function handleModeTab(event) {
    playSound(soundClick);
    const btn = event.target;
    const val = btn.dataset.value;
    gameSettings.teams = val;
    
    modeTabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (val === 'individual') {
        indivRedDiv.classList.remove('hidden'); teamRedDiv.classList.add('hidden');
        indivPurpleDiv.classList.remove('hidden'); teamPurpleDiv.classList.add('hidden');
    } else {
        indivRedDiv.classList.add('hidden'); teamRedDiv.classList.remove('hidden');
        indivPurpleDiv.classList.add('hidden'); teamPurpleDiv.classList.remove('hidden');
    }
    validateSettings();
}

function handlePillClick(event) {
    playSound(soundClick);
    const btn = event.target;
    const type = btn.dataset.setting;
    const val = btn.dataset.value;
    gameSettings[type] = val;
    
    document.querySelectorAll(`.pill-btn[data-setting="${type}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    validateSettings();
}

function addRosterMember(team) {
    playSound(soundClick);
    const list = (team===1) ? team1List : team2List;
    const div = document.createElement('div'); div.className = 'member-input-container';
    div.innerHTML = `<input type="text" placeholder="عضو ${list.children.length+1}"><button type="button" class="remove-member-button">X</button>`;
    div.querySelector('button').onclick = () => { playSound(soundClick); div.remove(); };
    list.appendChild(div);
}

function validateSettings() {
    let valid = false;
    if (gameSettings.teams === 'individual') {
        valid = player1Input.value.trim() && player2Input.value.trim();
    } else {
        valid = team1Input.value.trim() && team2Input.value.trim();
    }
    startGameButton.disabled = !valid;
}

function startGame() {
    playSound(soundStart);
    
    // حفظ الأسماء
    if (gameSettings.teams === 'individual') {
        gameSettings.team1Name = player1Input.value || 'أحمر';
        gameSettings.team2Name = player2Input.value || 'بنفسجي';
        gameSettings.team1Members = [player1Input.value]; // كعضو وحيد
        gameSettings.team2Members = [player2Input.value];
    } else {
        gameSettings.team1Name = team1Input.value || 'فريق 1';
        gameSettings.team2Name = team2Input.value || 'فريق 2';
        gameSettings.team1Members = Array.from(team1List.querySelectorAll('input')).map(i=>i.value).filter(v=>v);
        gameSettings.team2Members = Array.from(team2List.querySelectorAll('input')).map(i=>i.value).filter(v=>v);
    }

    // تعبئة القوائم في الهيدر
    redTeamNameDisplay.textContent = gameSettings.team1Name;
    purpleTeamNameDisplay.textContent = gameSettings.team2Name;
    
    fillRosterDisplay(redRosterDisplay, gameSettings.team1Members);
    fillRosterDisplay(purpleRosterDisplay, gameSettings.team2Members);

    mainMenuScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    loadUsedQuestions();
    startNewRound();
    setTimeout(resizeBoard, 100);
}

function fillRosterDisplay(container, members) {
    container.innerHTML = '';
    members.forEach(m => {
        const span = document.createElement('span');
        span.className = 'roster-item';
        span.textContent = m;
        container.appendChild(span);
    });
}

function startNewRound() {
    gameActive = true;
    roundWinOverlay.classList.add('hidden');
    initializeGameBoard();
    TurnManager.startGame({mode: gameSettings.mode});
    resizeBoard();
}

function initializeGameBoard() {
    gameBoardContainer.innerHTML = '';
    const shuffled = shuffleArray(ALL_LETTERS);
    let idx = 0;
    
    BOARD_LAYOUT.forEach((row, r) => {
        const rowDiv = document.createElement('div'); rowDiv.className = 'hex-row';
        row.forEach((type, c) => {
            const cell = document.createElement('div'); cell.className = 'hex-cell';
            cell.dataset.row = r; cell.dataset.col = c;
            if (type === R) cell.classList.add('hex-cell-red');
            else if (type === P) cell.classList.add('hex-cell-purple');
            else if (type === G) {
                cell.classList.add('hex-cell-default', 'playable');
                if (idx < 25) {
                    const l = shuffled[idx++];
                    cell.dataset.id = l.id; cell.dataset.name = l.name;
                    cell.innerHTML = `<span class="hex-letter">${l.char}</span>`;
                }
                cell.addEventListener('click', handleCellClick);
            } else { cell.classList.add('hex-cell-transparent'); }
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
    
    const q = await getQuestion(cell.dataset.id);
    
    if (gameSettings.mode === 'turns') {
        competitiveControls.classList.add('hidden');
        turnsControls.classList.remove('hidden');
    } else {
        competitiveControls.classList.remove('hidden');
        turnsControls.classList.add('hidden');
    }

    answerRevealSection.style.display = 'none';
    showAnswerButton.classList.remove('hidden');
    
    if (q) {
        currentQuestion = q;
        questionText.textContent = q.question;
        answerText.textContent = q.answer;
        questionModalOverlay.classList.remove('hidden');
        if (gameSettings.timer !== 'off') startTimer(parseInt(gameSettings.timer));
        else questionTimerDisplay.classList.add('hidden');
    }
}

async function getQuestion(id) {
    if (!questionCache[id]) {
        try {
            const res = await fetch(`data/questions/${id}.json`);
            if (res.ok) questionCache[id] = await res.json();
        } catch {}
    }
    const list = questionCache[id];
    if (!list) return null;
    let unused = list.filter((q,i) => !usedQuestions[`${id}_${i}`]);
    if (unused.length === 0) {
        list.forEach((q,i) => delete usedQuestions[`${id}_${i}`]);
        saveUsedQuestions();
        unused = list;
    }
    const q = unused[Math.floor(Math.random()*unused.length)];
    return { ...q, id: `${id}_${list.indexOf(q)}` };
}

function handleResult(res) {
    stopTimer();
    questionModalOverlay.classList.add('hidden');
    if (currentQuestion) { usedQuestions[currentQuestion.id] = true; saveUsedQuestions(); }

    let color = null;
    let sound = soundWrong;

    if (res === 'red' || res === 'purple') {
        color = res; sound = soundCorrect;
    } else if (res === 'turn_correct') {
        color = TurnManager.getCurrentPlayer(); sound = soundCorrect;
    }
    
    playSound(sound);

    if (color) {
        currentClickedCell.classList.remove('playable', 'hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${color}-owned`);
        const path = checkWin(color);
        if (path) { handleWin(color, path); return; }
    }

    checkDraw();
    TurnManager.nextTurn();
}

function checkWin(color) {
    const queue = []; const visited = new Set(); const parent = new Map();
    // Logic shortened for brevity (same as before)
    if(color==='red'){ for(let c=2;c<=6;c++) if(getCell(2,c)?.classList.contains('hex-cell-red-owned')) { queue.push([2,c]); visited.add(`2,${c}`); parent.set(`2,${c}`, null); } } 
    else { for(let r=2;r<=6;r++) if(getCell(r,6)?.classList.contains('hex-cell-purple-owned')) { queue.push([r,6]); visited.add(`${r},6`); parent.set(`${r},6`, null); } }

    while(queue.length){
        const [r,c] = queue.shift();
        for(const [nr,nc] of getNeighbors(r,c)){
            const key = `${nr},${nc}`;
            const won = (color==='red' && nr===7 && BOARD_LAYOUT[nr][nc]===R) || (color==='purple' && nc===1 && BOARD_LAYOUT[nr][nc]===P);
            if (won) {
                const path = []; let curr = `${r},${c}`;
                while(curr) { path.push(curr); curr = parent.get(curr); }
                return path;
            }
            const cell = getCell(nr,nc);
            if(cell && !visited.has(key) && cell.classList.contains(`hex-cell-${color}-owned`)){
                visited.add(key); parent.set(key, `${r},${c}`); queue.push([nr,nc]);
            }
        }
    }
    return null;
}

function handleWin(color, path) {
    playSound(soundWin); gameActive = false;
    if(path) path.forEach(k => getCell(...k.split(',')).classList.add('winning-path-cell'));
    winMessage.textContent = `الفريق ${color==='red'?gameSettings.team1Name:gameSettings.team2Name} فاز!`;
    setTimeout(() => { roundWinOverlay.classList.remove('hidden'); playSound(soundClick); }, 1500);
}

function checkDraw() {
    if (!document.querySelector('.hex-cell.playable') && gameActive) {
        gameActive = false; winMessage.textContent = "تعادل!";
        roundWinOverlay.classList.remove('hidden'); playSound(soundWrong);
    }
}

// Helpers
function getCell(r,c){ return document.querySelector(`.hex-cell[data-row="${r}"][data-col="${c}"]`); }
function getNeighbors(r,c){
    r=+r; c=+c; const odd = r%2!==0;
    const diffs = odd ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]] : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
    return diffs.map(([dr,dc])=>[r+dr,c+dc]).filter(([nr,nc])=> BOARD_LAYOUT[nr]?.[nc] && BOARD_LAYOUT[nr][nc]!==T);
}
function startTimer(dur) {
    stopTimer(); remainingTime = dur;
    questionTimerDisplay.textContent = dur; questionTimerDisplay.classList.remove('hidden');
    questionTimerDisplay.style.background = 'var(--color-yellow)';
    timerInterval = setInterval(() => {
        remainingTime--; questionTimerDisplay.textContent = remainingTime;
        if(remainingTime<=5) questionTimerDisplay.style.background = 'red';
        if(remainingTime<=0) { stopTimer(); handleResult('skip'); }
    }, 1000);
}
function stopTimer() { clearInterval(timerInterval); questionTimerDisplay.classList.add('hidden'); }

// Events
modeTabs.forEach(b => b.addEventListener('click', handleModeTab));
pillBtns.forEach(b => b.addEventListener('click', handlePillClick));
addTeam1Btn.onclick = () => addRosterMember(1);
addTeam2Btn.onclick = () => addRosterMember(2);
[player1Input, player2Input, team1Input, team2Input].forEach(i => i.oninput = validateSettings);
showAnswerButton.onclick = () => { playSound(soundClick); answerRevealSection.style.display='block'; showAnswerButton.classList.add('hidden'); };
startGameButton.onclick = startGame;
nextRoundButton.onclick = () => { playSound(soundClick); startNewRound(); };
exitGameButton.onclick = () => exitConfirmModal.classList.remove('hidden');
exitYes.onclick = () => { location.reload(); }; // خروج = تحديث الصفحة
exitNo.onclick = () => exitConfirmModal.classList.add('hidden');
window.onresize = resizeBoard;

// Buttons logic
teamPurpleWinButton.onclick = () => handleResult('purple');
teamRedWinButton.onclick = () => handleResult('red');
competitiveSkipButton.onclick = () => handleResult('skip');
turnCorrectButton.onclick = () => handleResult('turn_correct');
turnWrongButton.onclick = () => handleResult('skip');
