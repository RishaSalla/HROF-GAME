import { TurnManager } from './turn_manager.js';

// ===================== إدارة الشاشات (الإصلاح) =====================
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none'; // إخفاء إجباري
    });
    const target = document.getElementById(screenId);
    target.style.display = 'flex';
    setTimeout(() => target.classList.add('active'), 50);
}

// ===================== العناصر =====================
const gameBoardContainer = document.getElementById('game-board-container');
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

const redTeamNameDisplay = document.getElementById('red-team-name');
const purpleTeamNameDisplay = document.getElementById('purple-team-name');
const redRosterDisplay = document.getElementById('red-roster-display');
const purpleRosterDisplay = document.getElementById('purple-roster-display');

const questionModalOverlay = document.getElementById('question-modal-overlay');
const questionTimerDisplay = document.getElementById('question-timer');
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

const soundClick = document.getElementById('sound-click');
const soundFlip = document.getElementById('sound-flip');
const soundCorrect = document.getElementById('sound-correct');
const soundWrong = document.getElementById('sound-wrong');
const soundWin = document.getElementById('sound-win');
const soundStart = document.getElementById('sound-start');

export const gameSettings = { mode: 'turns', teams: 'individual', timer: 'off', team1Name: '', team2Name: '', team1Members: [], team2Members: [] };

let gameActive = true;
let currentClickedCell = null;
let currentQuestion = null;
let usedQuestions = JSON.parse(localStorage.getItem('hrof_used')) || {};
let timerInterval = null;
let remainingTime = 0;

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

const BOARD_LAYOUT = [
    ['T','T','T','T','T','T','T','T','T'], ['T','T','red','red','red','red','red','red','T'],
    ['T','purple','G','G','G','G','G','purple','T'], ['T','purple','G','G','G','G','G','purple','T'],
    ['T','purple','G','G','G','G','G','purple','T'], ['T','purple','G','G','G','G','G','purple','T'],
    ['T','purple','G','G','G','G','G','purple','T'], ['T','T','red','red','red','red','red','red','T'],
    ['T','T','T','T','T','T','T','T','T']
];

function playSound(audio) { if(audio){ audio.currentTime=0; audio.play().catch(()=>{}); } }

function startGame() {
    playSound(soundStart);
    if (gameSettings.teams === 'individual') {
        gameSettings.team1Name = player1Input.value || 'أحمر';
        gameSettings.team2Name = player2Input.value || 'بنفسجي';
        gameSettings.team1Members = [player1Input.value];
        gameSettings.team2Members = [player2Input.value];
    } else {
        gameSettings.team1Name = team1Input.value || 'فريق 1';
        gameSettings.team2Name = team2Input.value || 'فريق 2';
        gameSettings.team1Members = Array.from(team1List.querySelectorAll('input')).map(i=>i.value).filter(v=>v);
        gameSettings.team2Members = Array.from(team2List.querySelectorAll('input')).map(i=>i.value).filter(v=>v);
    }

    redTeamNameDisplay.textContent = gameSettings.team1Name;
    purpleTeamNameDisplay.textContent = gameSettings.team2Name;
    fillRoster(redRosterDisplay, gameSettings.team1Members);
    fillRoster(purpleRosterDisplay, gameSettings.team2Members);

    switchScreen('game-screen');
    startNewRound();
    setTimeout(resizeBoard, 100);
    window.addEventListener('resize', resizeBoard);
}

function fillRoster(container, list) {
    container.innerHTML = '';
    list.forEach(m => { const d = document.createElement('div'); d.className='roster-item'; d.textContent=m; container.appendChild(d); });
}

function startNewRound() {
    gameActive = true;
    roundWinOverlay.classList.add('hidden');
    initializeBoard();
    TurnManager.startGame({mode: gameSettings.mode});
}

function initializeBoard() {
    gameBoardContainer.innerHTML = '';
    const shuffled = [...ALL_LETTERS].sort(()=>0.5-Math.random());
    let idx = 0;
    BOARD_LAYOUT.forEach((row, r) => {
        const rowDiv = document.createElement('div'); rowDiv.className = 'hex-row';
        row.forEach((type, c) => {
            const cell = document.createElement('div'); cell.className = 'hex-cell';
            cell.dataset.row = r; cell.dataset.col = c;
            if(type==='G') {
                cell.classList.add('hex-cell-default','playable');
                if(idx<25) {
                    const l = shuffled[idx++]; cell.dataset.id=l.id; cell.dataset.name=l.name;
                    cell.innerHTML = `<span class="hex-letter">${l.char}</span>`;
                }
                cell.addEventListener('click', handleCellClick);
            } else if(type==='red') cell.classList.add('hex-cell-red');
            else if(type==='purple') cell.classList.add('hex-cell-purple');
            else cell.classList.add('hex-cell-transparent');
            rowDiv.appendChild(cell);
        });
        gameBoardContainer.appendChild(rowDiv);
    });
}

async function handleCellClick(e) {
    if(!gameActive) return;
    const cell = e.currentTarget;
    if(!cell.classList.contains('playable')) return;

    playSound(soundFlip);
    currentClickedCell = cell;
    questionCharDisplay.textContent = cell.dataset.name;

    try {
        const res = await fetch(`data/questions/${cell.dataset.id}.json`);
        if(res.ok) {
            const data = await res.json();
            const q = data.filter((_,i)=>!usedQuestions[`${cell.dataset.id}_${i}`]);
            const selected = q.length>0 ? q[Math.floor(Math.random()*q.length)] : data[0]; // Recycle if empty
            currentQuestion = selected; currentQuestion.uid = `${cell.dataset.id}_${data.indexOf(selected)}`;
            questionText.textContent = selected.question;
            answerText.textContent = selected.answer;
        }
    } catch {}

    if (gameSettings.mode === 'turns') {
        competitiveControls.classList.add('hidden'); turnsControls.classList.remove('hidden');
    } else {
        competitiveControls.classList.remove('hidden'); turnsControls.classList.add('hidden');
    }

    answerRevealSection.style.display = 'none'; showAnswerButton.classList.remove('hidden');
    questionModalOverlay.classList.remove('hidden');
    if(gameSettings.timer!=='off') startTimer(parseInt(gameSettings.timer));
}

function handleResult(res) {
    stopTimer();
    questionModalOverlay.classList.add('hidden');
    if(currentQuestion && currentQuestion.uid) { 
        usedQuestions[currentQuestion.uid] = true; 
        localStorage.setItem('hrof_used', JSON.stringify(usedQuestions));
    }

    let color = null;
    let sound = soundWrong;

    if(res==='red' || res==='purple') { color=res; sound=soundCorrect; }
    else if(res==='turn_correct') { color=TurnManager.getCurrentPlayer(); sound=soundCorrect; }

    playSound(sound);

    if(color) {
        currentClickedCell.classList.remove('playable','hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${color}-owned`);
        if(checkWin(color)) { handleWin(color); return; }
    }

    TurnManager.nextTurn();
}

function checkWin(color) {
    const q = []; const visited = new Set(); const parent = new Map();
    const getC = (r,c) => document.querySelector(`.hex-cell[data-row="${r}"][data-col="${c}"]`);
    
    if(color==='red') { for(let c=2;c<=6;c++) if(getC(2,c)?.classList.contains('hex-cell-red-owned')) { q.push([2,c]); visited.add(`2,${c}`); parent.set(`2,${c}`, null); } }
    else { for(let r=2;r<=6;r++) if(getC(r,6)?.classList.contains('hex-cell-purple-owned')) { q.push([r,6]); visited.add(`${r},6`); parent.set(`${r},6`, null); } }

    while(q.length>0) {
        const [r,c] = q.shift();
        const odd = r%2!==0;
        const diffs = odd ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]] : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
        
        for(const [dr,dc] of diffs) {
            const nr=r+dr, nc=c+dc;
            if(nr<0||nr>8||nc<0||nc>8) continue;
            
            const win = (color==='red' && nr===7 && BOARD_LAYOUT[nr][nc]==='red') || (color==='purple' && nc===1 && BOARD_LAYOUT[nr][nc]==='purple');
            if(win) {
                const path = []; let k = `${r},${c}`;
                while(k) { path.push(k); k = parent.get(k); }
                return path;
            }

            const cell = getC(nr,nc);
            if(cell && !visited.has(`${nr},${nc}`) && cell.classList.contains(`hex-cell-${color}-owned`)) {
                visited.add(`${nr},${nc}`); parent.set(`${nr},${nc}`, `${r},${c}`); q.push([nr,nc]);
            }
        }
    }
    return null;
}

function handleWin(color) {
    playSound(soundWin); gameActive = false;
    winMessage.textContent = `الفريق ${color==='red'?'الأحمر':'البنفسجي'} فاز!`;
    roundWinOverlay.classList.remove('hidden');
}

function resizeBoard() {
    if (!gameScreen.classList.contains('active')) return;
    const h = window.innerHeight;
    // تحجيم دقيق للجوال واللابتوب
    let wOffset = (window.innerWidth > 768) ? 440 : 0; 
    let hOffset = (window.innerWidth > 768) ? 100 : 150;
    const scale = Math.min((window.innerWidth - wOffset)/800, (h - hOffset)/650);
    gameBoardContainer.style.transform = `scale(${Math.max(0.3, Math.min(scale, 1.2))})`;
}

function startTimer(dur) {
    stopTimer(); remainingTime = dur;
    questionTimerDisplay.classList.remove('hidden'); questionTimerDisplay.textContent = dur;
    questionTimerDisplay.style.background = 'var(--color-yellow)';
    timerInterval = setInterval(() => {
        remainingTime--; questionTimerDisplay.textContent = remainingTime;
        if(remainingTime<=5) questionTimerDisplay.style.background = 'red';
        if(remainingTime<=0) { stopTimer(); handleResult('skip'); }
    }, 1000);
}
function stopTimer() { clearInterval(timerInterval); questionTimerDisplay.classList.add('hidden'); }

// Events
modeTabs.forEach(b => b.onclick = (e) => {
    modeTabs.forEach(t => t.classList.remove('active')); e.target.classList.add('active');
    gameSettings.teams = e.target.dataset.value;
    if(gameSettings.teams === 'individual') { indivRedDiv.classList.remove('hidden'); teamRedDiv.classList.add('hidden'); indivPurpleDiv.classList.remove('hidden'); teamPurpleDiv.classList.add('hidden'); }
    else { indivRedDiv.classList.add('hidden'); teamRedDiv.classList.remove('hidden'); indivPurpleDiv.classList.add('hidden'); teamPurpleDiv.classList.remove('hidden'); }
});
pillBtns.forEach(b => b.onclick = (e) => {
    const t = e.target.dataset.setting;
    document.querySelectorAll(`.pill-btn[data-setting="${t}"]`).forEach(p => p.classList.remove('active'));
    e.target.classList.add('active'); gameSettings[t] = e.target.dataset.value;
});
addTeam1Btn.onclick = () => { const i = document.createElement('input'); i.placeholder = 'عضو جديد'; team1List.appendChild(i); };
addTeam2Btn.onclick = () => { const i = document.createElement('input'); i.placeholder = 'عضو جديد'; team2List.appendChild(i); };
startGameButton.onclick = startGame;
showAnswerButton.onclick = () => { answerRevealSection.style.display='block'; showAnswerButton.classList.add('hidden'); playSound(soundClick); };
nextRoundButton.onclick = () => location.reload();
document.getElementById('exit-game-button').onclick = () => location.reload();
document.getElementById('close-instructions-button').onclick = () => instructionsModalOverlay.classList.add('hidden');
instructionsButton.onclick = () => instructionsModalOverlay.classList.remove('hidden');

document.getElementById('turn-correct-button').onclick = () => handleResult('turn_correct');
document.getElementById('turn-wrong-button').onclick = () => handleResult('skip');
document.getElementById('team-red-win-button').onclick = () => handleResult('red');
document.getElementById('team-purple-win-button').onclick = () => handleResult('purple');
document.getElementById('competitive-skip-button').onclick = () => handleResult('skip');

window.onresize = resizeBoard;
