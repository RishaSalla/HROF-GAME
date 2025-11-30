import { TurnManager } from './turn_manager.js';

// ===================== العناصر =====================
const gameScreen = document.getElementById('game-screen');
const gameBoardContainer = document.getElementById('game-board-container');
const mainMenuScreen = document.getElementById('main-menu-screen');

// النوافذ
const questionModalOverlay = document.getElementById('question-modal-overlay');
const roundWinOverlay = document.getElementById('round-win-overlay');
const exitConfirmModal = document.getElementById('exit-confirm-modal');

// عناصر النافذة
const showAnswerButton = document.getElementById('show-answer-button');
const answerRevealSection = document.getElementById('answer-reveal-section');
const questionText = document.getElementById('question-text');
const answerText = document.getElementById('answer-text');
const questionCharDisplay = document.getElementById('question-char-display');
const questionTimerDisplay = document.getElementById('question-timer');

// الأزرار داخل النافذة
const btnTurnCorrect = document.getElementById('turn-correct-button');
const btnTurnWrong = document.getElementById('turn-wrong-button');
const btnCompRed = document.getElementById('team-red-win-button');
const btnCompPurple = document.getElementById('team-purple-win-button');
const btnCompSkip = document.getElementById('competitive-skip-button');

// القوائم الجانبية
const redTeamNameDisplay = document.getElementById('red-team-name');
const purpleTeamNameDisplay = document.getElementById('purple-team-name');
const redRosterDisplay = document.getElementById('red-roster-display');
const purpleRosterDisplay = document.getElementById('purple-roster-display');

// الصوتيات
const soundClick = document.getElementById('sound-click');
const soundFlip = document.getElementById('sound-flip');
const soundCorrect = document.getElementById('sound-correct');
const soundWrong = document.getElementById('sound-wrong');
const soundWin = document.getElementById('sound-win');
const soundStart = document.getElementById('sound-start');

// الإعدادات والمتغيرات
export const gameSettings = { mode: 'turns', teams: 'individual', timer: 'off', team1Name: '', team2Name: '', team1Members: [], team2Members: [] };
const questionCache = {};
let usedQuestions = JSON.parse(localStorage.getItem('hrof_used')) || {};
let currentClickedCell = null;
let currentQuestion = null;
let gameActive = true;
let timerInterval = null;
let remainingTime = 0;
let scores = { red: 0, purple: 0 };
const WINNING_SCORE = 1;

// الحروف
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

// --- الوظائف الأساسية ---

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none'; 
    });
    const target = document.getElementById(screenId);
    if(target) {
        target.style.display = 'flex';
        setTimeout(() => target.classList.add('active'), 10);
    }
}

function playSound(audio) { if(audio){ audio.currentTime=0; audio.play().catch(()=>{}); } }

function startGame() {
    playSound(soundStart);
    // جلب البيانات من المدخلات
    const p1 = document.getElementById('player-1-name-input').value;
    const p2 = document.getElementById('player-2-name-input').value;
    const t1 = document.getElementById('team-1-name-input-team').value;
    const t2 = document.getElementById('team-2-name-input-team').value;

    if (gameSettings.teams === 'individual') {
        gameSettings.team1Name = p1 || 'أحمر';
        gameSettings.team2Name = p2 || 'بنفسجي';
        gameSettings.team1Members = [p1];
        gameSettings.team2Members = [p2];
    } else {
        gameSettings.team1Name = t1 || 'فريق 1';
        gameSettings.team2Name = t2 || 'فريق 2';
        gameSettings.team1Members = Array.from(document.getElementById('team-1-members-list').querySelectorAll('input')).map(i=>i.value).filter(v=>v);
        gameSettings.team2Members = Array.from(document.getElementById('team-2-members-list').querySelectorAll('input')).map(i=>i.value).filter(v=>v);
    }

    redTeamNameDisplay.textContent = gameSettings.team1Name;
    purpleTeamNameDisplay.textContent = gameSettings.team2Name;
    fillRoster(redRosterDisplay, gameSettings.team1Members);
    fillRoster(purpleRosterDisplay, gameSettings.team2Members);

    switchScreen('game-screen');
    startNewRound();
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
    resizeBoard();
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

    // محاولة جلب السؤال
    try {
        const res = await fetch(`data/questions/${cell.dataset.id}.json`);
        if(res.ok) {
            const data = await res.json();
            const q = data.filter((_,i)=>!usedQuestions[`${cell.dataset.id}_${i}`]);
            const selected = q.length>0 ? q[Math.floor(Math.random()*q.length)] : data[0];
            currentQuestion = selected; currentQuestion.uid = `${cell.dataset.id}_${data.indexOf(selected)}`;
            questionText.textContent = selected.question;
            answerText.textContent = selected.answer;
        } else { throw new Error('File not found'); }
    } catch(err) {
        questionText.textContent = "سؤال تجريبي (الأسئلة غير متصلة)";
        answerText.textContent = "إجابة نموذجية";
    }

    // إعداد الأزرار
    const isTurns = gameSettings.mode === 'turns';
    document.getElementById('competitive-controls').classList.toggle('hidden', isTurns);
    document.getElementById('turns-controls').classList.toggle('hidden', !isTurns);

    answerRevealSection.style.display = 'none'; 
    showAnswerButton.classList.remove('hidden');
    questionModalOverlay.classList.remove('hidden'); // إظهار النافذة

    if(gameSettings.timer!=='off') startTimer(parseInt(gameSettings.timer));
    else questionTimerDisplay.classList.add('hidden');
}

// --- معالجة النتائج (الإصلاح الرئيسي هنا) ---
function handleResult(res) {
    // 1. إيقاف وإخفاء كل شيء فوراً لمنع التعليق
    stopTimer();
    questionModalOverlay.classList.add('hidden'); 
    
    // 2. تسجيل السؤال كمستخدم
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
        
        // التحقق من الفوز (مع حماية من التعليق)
        try {
            if(checkWin(color)) { handleWin(color); return; }
        } catch(e) { console.error("Win check error", e); }
    }

    checkDraw();
    TurnManager.nextTurn();
}

function checkWin(color) {
    const q = []; const visited = new Set(); const parent = new Map();
    const getC = (r,c) => document.querySelector(`.hex-cell[data-row="${r}"][data-col="${c}"]`);
    
    // نقاط البداية
    if(color==='red') { for(let c=2;c<=6;c++) if(getC(2,c)?.classList.contains('hex-cell-red-owned')) { q.push([2,c]); visited.add(`2,${c}`); parent.set(`2,${c}`, null); } }
    else { for(let r=2;r<=6;r++) if(getC(r,6)?.classList.contains('hex-cell-purple-owned')) { q.push([r,6]); visited.add(`${r},6`); parent.set(`${r},6`, null); } }

    let loopCount = 0; // قاطع أمان
    while(q.length > 0) {
        loopCount++; if(loopCount > 1000) return null; // منع التعليق

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
            const key = `${nr},${nc}`;
            if(cell && !visited.has(key) && cell.classList.contains(`hex-cell-${color}-owned`)) {
                visited.add(key); parent.set(key, `${r},${c}`); q.push([nr,nc]);
            }
        }
    }
    return null;
}

function handleWin(color) {
    playSound(soundWin);
    gameActive = false;
    document.getElementById('win-message').textContent = `الفريق ${color==='red'?'الأحمر':'البنفسجي'} فاز!`;
    roundWinOverlay.classList.remove('hidden'); // إظهار نافذة الفوز
}

function checkDraw() {
    if (!document.querySelector('.hex-cell.playable') && gameActive) {
        gameActive = false; 
        document.getElementById('win-message').textContent = "تعادل!";
        roundWinOverlay.classList.remove('hidden');
        playSound(soundWrong);
    }
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

function resizeBoard() {
    if (gameScreen.style.display === 'none') return;
    // منطق تحجيم بسيط
    const h = window.innerHeight;
    const w = window.innerWidth;
    const scale = Math.min((w - 400)/800, (h - 150)/650); 
    // للجوال
    if(w < 768) {
        gameBoardContainer.style.transform = `scale(${Math.min(w/850, 0.6)})`;
    } else {
        gameBoardContainer.style.transform = `scale(${Math.max(0.5, Math.min(scale, 1.2))})`;
    }
}

// === تفعيل الأزرار (Event Listeners) ===
document.addEventListener('DOMContentLoaded', () => {
    // تبديل التابات
    document.querySelectorAll('.mode-tab').forEach(b => b.onclick = (e) => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active')); e.target.classList.add('active');
        gameSettings.teams = e.target.dataset.value;
        const isIndiv = gameSettings.teams === 'individual';
        document.getElementById('indiv-red').style.display = isIndiv ? 'block' : 'none';
        document.getElementById('team-red').style.display = isIndiv ? 'none' : 'block';
        document.getElementById('indiv-purple').style.display = isIndiv ? 'block' : 'none';
        document.getElementById('team-purple').style.display = isIndiv ? 'none' : 'block';
    });

    // أزرار المؤقت
    document.querySelectorAll('.pill-btn').forEach(b => b.onclick = (e) => {
        const t = e.target.dataset.setting;
        document.querySelectorAll(`.pill-btn[data-setting="${t}"]`).forEach(p => p.classList.remove('active'));
        e.target.classList.add('active'); gameSettings[t] = e.target.dataset.value;
    });

    // أزرار اللعبة
    document.getElementById('start-game-button').onclick = startGame;
    document.getElementById('exit-game-button').onclick = () => location.reload();
    document.getElementById('next-round-button').onclick = () => location.reload();
    document.getElementById('close-instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.add('hidden');
    document.getElementById('instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.remove('hidden');
    
    // زر إظهار الإجابة
    showAnswerButton.onclick = () => { 
        answerRevealSection.style.display='block'; 
        showAnswerButton.classList.add('hidden'); 
        playSound(soundClick); 
    };

    // أزرار النتائج
    btnTurnCorrect.onclick = () => handleResult('turn_correct');
    btnTurnWrong.onclick = () => handleResult('skip');
    btnCompRed.onclick = () => handleResult('red');
    btnCompPurple.onclick = () => handleResult('purple');
    btnCompSkip.onclick = () => handleResult('skip');

    // إضافات الفريق
    document.getElementById('add-team-1-member-button').onclick = () => {
        const i = document.createElement('input'); i.placeholder='عضو جديد';
        document.getElementById('team-1-members-list').appendChild(i);
    };
    document.getElementById('add-team-2-member-button').onclick = () => {
        const i = document.createElement('input'); i.placeholder='عضو جديد';
        document.getElementById('team-2-members-list').appendChild(i);
    };

    window.onresize = resizeBoard;
});
