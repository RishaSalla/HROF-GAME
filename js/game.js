import { TurnManager } from './turn_manager.js';

// ===================== 1. إعدادات اللعبة =====================
const gameSettings = { 
    mode: 'turns', 
    teams: 'individual', 
    timer: 'off', 
    team1Name: '', 
    team2Name: '', 
    team1Members: [], 
    team2Members: [] 
};

let gameActive = true;
let currentTurn = 'red'; 
let currentMemberIndex = { red: 0, purple: 0 }; 
let isMuted = false;
let currentQuestion = null;
let currentClickedCell = null;
let timerInterval = null;
let usedQuestions = JSON.parse(localStorage.getItem('hrof_used')) || {};

// قائمة الحروف
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
    ['T','T','T','T','T','T','T','T','T'], 
    ['T','T','red','red','red','red','red','red','T'],
    ['T','purple','G','G','G','G','G','purple','T'], 
    ['T','purple','G','G','G','G','G','purple','T'],
    ['T','purple','G','G','G','G','G','purple','T'], 
    ['T','purple','G','G','G','G','G','purple','T'],
    ['T','purple','G','G','G','G','G','purple','T'], 
    ['T','T','red','red','red','red','red','red','T'],
    ['T','T','T','T','T','T','T','T','T']
];

// ===================== 2. الوظائف المساعدة =====================

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const t = document.getElementById(id); 
    if(t){ t.style.display='flex'; setTimeout(()=>t.classList.add('active'),50); }
}

function playSound(id) {
    if(isMuted) return;
    const a = document.getElementById(id); if(a){ a.currentTime=0; a.play().catch(()=>{}); }
}

function toggleSound() {
    isMuted = !isMuted;
    const path = isMuted 
        ? "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
        : "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z";
    [document.getElementById('main-sound-toggle'), document.getElementById('game-sound-toggle')].forEach(b => {
        if(b) b.querySelector('path').setAttribute('d', path);
    });
}

// ===================== 3. دوال التحكم بالظهور (الحل الجذري) =====================

// دالة خاصة لكسر الإخفاء وإظهار العناصر بالقوة
function forceShowElement(id, show) {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (show) {
        el.classList.remove('hidden'); // إزالة كلاس الإخفاء تماماً
        el.style.display = 'block';    // فرض الظهور
    } else {
        el.classList.add('hidden');
        el.style.display = 'none';
    }
}

// ===================== 4. بدء اللعب =====================

function startGame() {
    playSound('sound-click');
    const p1 = document.getElementById('player-1-name-input').value.trim();
    const p2 = document.getElementById('player-2-name-input').value.trim();
    
    const t1Name = "الأحمر";
    const t2Name = "البنفسجي";

    if (gameSettings.teams === 'individual') {
        if(!p1 && !p2) { alert('الرجاء كتابة أسماء اللاعبين'); return; }
        gameSettings.team1Name = "الأحمر"; 
        gameSettings.team2Name = "البنفسجي";
        gameSettings.team1Members = [p1]; 
        gameSettings.team2Members = [p2];
    } else {
        const m1 = Array.from(document.querySelectorAll('#team-1-members-list input')).map(i => i.value.trim()).filter(v => v);
        const m2 = Array.from(document.querySelectorAll('#team-2-members-list input')).map(i => i.value.trim()).filter(v => v);
        
        if(m1.length === 0 || m2.length === 0) { alert('الرجاء إضافة عضو واحد على الأقل لكل فريق'); return; }

        gameSettings.team1Name = t1Name;
        gameSettings.team2Name = t2Name;
        gameSettings.team1Members = m1;
        gameSettings.team2Members = m2;
    }

    fillRoster('red-roster-display', gameSettings.team1Members);
    fillRoster('purple-roster-display', gameSettings.team2Members);

    switchScreen('game-screen');
    startNewRound();
    playSound('sound-start');
}

function fillRoster(elementId, list) {
    const container = document.getElementById(elementId);
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
    currentTurn = 'red';
    currentMemberIndex = { red: 0, purple: 0 }; 
    
    updatePlayerTurnDisplay();
    updateSidebars();
    
    document.getElementById('round-win-overlay').classList.add('hidden');
    document.getElementById('exit-confirm-modal').classList.add('hidden');
    document.getElementById('confetti-canvas').style.display = 'none';
    
    initializeBoard();
    resizeBoard();
}

function updatePlayerTurnDisplay() {
    const rIndex = currentMemberIndex.red % gameSettings.team1Members.length;
    const pIndex = currentMemberIndex.purple % gameSettings.team2Members.length;
    
    const rName = gameSettings.team1Members[rIndex];
    const pName = gameSettings.team2Members[pIndex];
    
    document.getElementById('red-current-player').textContent = rName;
    document.getElementById('purple-current-player').textContent = pName;
}

function updateSidebars() {
    const redPanel = document.getElementById('panel-red');
    const purplePanel = document.getElementById('panel-purple');
    
    redPanel.classList.remove('active-turn-red');
    purplePanel.classList.remove('active-turn-purple');

    if (gameSettings.mode === 'competitive') return; 

    if(currentTurn === 'red') redPanel.classList.add('active-turn-red');
    else purplePanel.classList.add('active-turn-purple');
}

// ===================== 5. اللوحة والأسئلة =====================

function initializeBoard() {
    const container = document.getElementById('game-board-container');
    container.innerHTML = '';
    const shuffled = [...ALL_LETTERS].sort(() => 0.5 - Math.random());
    let idx = 0;

    BOARD_LAYOUT.forEach((row, r) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'hex-row';
        row.forEach((type, c) => {
            const cell = document.createElement('div');
            cell.className = 'hex-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;

            if(type === 'G') {
                cell.classList.add('hex-cell-default', 'playable');
                if(idx < 25) {
                    const l = shuffled[idx++];
                    cell.dataset.id = l.id;
                    cell.dataset.name = l.name;
                    cell.innerHTML = `<span class="hex-letter">${l.char}</span>`;
                }
                cell.addEventListener('click', handleCellClick);
            } else if(type === 'red') cell.classList.add('hex-cell-red');
            else if(type === 'purple') cell.classList.add('hex-cell-purple');
            else cell.classList.add('hex-cell-transparent');
            
            rowDiv.appendChild(cell);
        });
        container.appendChild(rowDiv);
    });
}

async function handleCellClick(e) {
    if(!gameActive) return;
    const cell = e.currentTarget;
    if(!cell.classList.contains('playable')) return;

    playSound('sound-flip');
    currentClickedCell = cell;
    
    document.getElementById('question-char-display').textContent = cell.dataset.name;
    document.getElementById('question-text').textContent = '...';
    document.getElementById('question-modal-overlay').classList.remove('hidden');
    document.getElementById('show-answer-button').classList.remove('hidden');
    document.getElementById('answer-reveal-section').style.display = 'none';

    const isTurns = gameSettings.mode === 'turns';
    document.getElementById('competitive-controls').classList.toggle('hidden', isTurns);
    document.getElementById('turns-controls').classList.toggle('hidden', !isTurns);

    try {
        const res = await fetch(`data/questions/${cell.dataset.id}.json`);
        if(res.ok) {
            const data = await res.json();
            const available = data.filter((_, i) => !usedQuestions[`${cell.dataset.id}_${i}`]);
            const selected = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : data[0];
            
            currentQuestion = selected;
            currentQuestion.uid = `${cell.dataset.id}_${data.indexOf(selected)}`;
            document.getElementById('question-text').textContent = selected.question;
            document.getElementById('answer-text').textContent = selected.answer;
        } else throw new Error();
    } catch {
        document.getElementById('question-text').textContent = "سؤال تجريبي";
        document.getElementById('answer-text').textContent = "إجابة نموذجية";
    }

    if(gameSettings.timer !== 'off') startTimer(parseInt(gameSettings.timer));
    else document.getElementById('question-timer').classList.add('hidden');
}

function handleResult(result) {
    stopTimer();
    document.getElementById('question-modal-overlay').classList.add('hidden');
    
    if(currentQuestion?.uid) {
        usedQuestions[currentQuestion.uid] = true;
        localStorage.setItem('hrof_used', JSON.stringify(usedQuestions));
    }

    let winnerColor = null;
    
    if (result === 'skip' || (result !== 'red' && result !== 'purple' && result !== 'turn_correct')) {
        playSound(result === 'skip' ? 'sound-click' : 'sound-wrong');
        if (gameSettings.mode === 'turns') {
            currentMemberIndex[currentTurn]++;
            currentTurn = (currentTurn === 'red') ? 'purple' : 'red';
            updatePlayerTurnDisplay();
            updateSidebars();
        }
        return;
    }

    if (result === 'red') winnerColor = 'red';
    else if (result === 'purple') winnerColor = 'purple';
    else if (result === 'turn_correct') winnerColor = currentTurn;

    if (winnerColor) {
        playSound('sound-correct');
        currentClickedCell.classList.remove('playable', 'hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${winnerColor}-owned`);
        
        setTimeout(() => { if (checkWin(winnerColor)) handleGameWin(winnerColor); }, 100);
        
        if (gameSettings.mode === 'turns') {
            currentMemberIndex[currentTurn]++;
            currentTurn = (currentTurn === 'red') ? 'purple' : 'red';
        }
    }

    updatePlayerTurnDisplay();
    updateSidebars();
}

function checkWin(color) {
    const q = []; const visited = new Set(); const parent = new Map();
    const getC = (r, c) => document.querySelector(`.hex-cell[data-r="${r}"][data-c="${c}"]`);
    
    if (color === 'red') {
        for(let c=2; c<=6; c++) if(getC(2, c)?.classList.contains('hex-cell-red-owned')) {
            q.push([2, c]); visited.add(`2,${c}`); parent.set(`2,${c}`, null);
        }
    } else {
        for(let r=2; r<=6; r++) if(getC(r, 6)?.classList.contains('hex-cell-purple-owned')) {
            q.push([r, 6]); visited.add(`${r},6`); parent.set(`${r},6`, null);
        }
    }

    let safety = 0;
    while(q.length > 0) {
        safety++; if(safety > 300) break;
        const [r, c] = q.shift();
        const odd = r % 2 !== 0;
        const diffs = odd ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]] : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
        
        for(const [dr, dc] of diffs) {
            const nr = r + dr, nc = c + dc;
            if(nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            
            const isWin = (color === 'red' && nr === 7 && BOARD_LAYOUT[nr][nc] === 'red') || 
                          (color === 'purple' && nc === 1 && BOARD_LAYOUT[nr][nc] === 'purple');
            
            if(isWin) {
                let k = `${r},${c}`;
                while(k) { const [pr, pc] = k.split(','); getC(pr, pc).classList.add('winning-path-cell'); k = parent.get(k); }
                return true;
            }
            const cell = getC(nr, nc);
            if(cell && !visited.has(`${nr},${nc}`) && cell.classList.contains(`hex-cell-${color}-owned`)) {
                visited.add(`${nr},${nc}`); parent.set(`${nr},${nc}`, `${r},${c}`); q.push([nr, nc]);
            }
        }
    }
    return false;
}

function handleGameWin(color) {
    gameActive = false;
    playSound('sound-win');
    startConfetti();
    document.getElementById('confetti-canvas').style.display = 'block';
    
    const wName = (color === 'red') ? gameSettings.team1Name : gameSettings.team2Name;
    document.getElementById('win-message').textContent = `الفريق ${wName} سيطر على اللوحة!`;
    document.getElementById('round-win-overlay').classList.remove('hidden');
}

function startTimer(dur) {
    if(timerInterval) clearInterval(timerInterval);
    let rem = dur;
    const d = document.getElementById('question-timer');
    d.classList.remove('hidden'); d.textContent = rem; d.style.background = 'var(--color-yellow)';
    timerInterval = setInterval(() => {
        rem--; d.textContent = rem;
        if(rem <= 5) d.style.background = 'red';
        if(rem <= 0) { clearInterval(timerInterval); handleResult('skip'); }
    }, 1000);
}
function stopTimer() { if(timerInterval) clearInterval(timerInterval); }

function resizeBoard() {
    if(document.getElementById('game-screen').style.display === 'none') return;
    const h = window.innerHeight; const w = window.innerWidth;
    const scale = Math.min((w - 450) / 800, (h - 120) / 650);
    const c = document.getElementById('game-board-container');
    if(w < 768) c.style.transform = `scale(${Math.min(w/850, 0.6)})`;
    else c.style.transform = `scale(${Math.max(0.4, Math.min(scale, 1.3))})`;
}

// ===================== 6. تهيئة الأحداث (التشغيل) =====================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تفعيل زر الإضافة باستخدام المعرف المباشر
    const add1 = document.getElementById('add-team-1-member-button');
    if(add1) {
        add1.addEventListener('click', () => {
            const i = document.createElement('input'); 
            i.placeholder = 'اسم العضو'; 
            i.className = 'member-input';
            document.getElementById('team-1-members-list').appendChild(i);
            i.focus();
        });
    }

    const add2 = document.getElementById('add-team-2-member-button');
    if(add2) {
        add2.addEventListener('click', () => {
            const i = document.createElement('input'); 
            i.placeholder = 'اسم العضو'; 
            i.className = 'member-input';
            document.getElementById('team-2-members-list').appendChild(i);
            i.focus();
        });
    }

    // 2. تفعيل التبديل بين فردي/فريق باستخدام دالة الظهور القسري
    document.querySelectorAll('.mode-tab').forEach(b => b.onclick = (e) => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        gameSettings.teams = e.target.dataset.value;
        const isIndiv = gameSettings.teams === 'individual';
        
        // استخدام الدالة الجديدة لكسر الإخفاء
        forceShowElement('indiv-red', isIndiv);
        forceShowElement('team-red', !isIndiv);
        
        forceShowElement('indiv-purple', isIndiv);
        forceShowElement('team-purple', !isIndiv);
    });

    document.getElementById('start-game-button').onclick = startGame;
    
    document.getElementById('show-answer-button').onclick = () => {
        document.getElementById('answer-reveal-section').style.display = 'block';
        document.getElementById('show-answer-button').classList.add('hidden');
        playSound('sound-click');
    };
    
    document.getElementById('turn-correct-button').onclick = () => handleResult('turn_correct');
    document.getElementById('turn-wrong-button').onclick = () => handleResult('skip');
    document.getElementById('team-red-win-button').onclick = () => handleResult('red');
    document.getElementById('team-purple-win-button').onclick = () => handleResult('purple');
    document.getElementById('competitive-skip-button').onclick = () => handleResult('skip');
    
    document.getElementById('exit-game-button').onclick = () => document.getElementById('exit-confirm-modal').classList.remove('hidden');
    document.getElementById('exit-confirm-yes').onclick = () => { stopTimer(); location.reload(); };
    document.getElementById('exit-confirm-no').onclick = () => document.getElementById('exit-confirm-modal').classList.add('hidden');
    document.getElementById('next-round-button').onclick = () => { location.reload(); };

    document.getElementById('instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.remove('hidden');
    document.getElementById('close-instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.add('hidden');
    document.getElementById('game-sound-toggle').onclick = toggleSound;

    document.querySelectorAll('.pill-btn').forEach(b => b.onclick = (e) => {
        const t = e.target.dataset.setting;
        document.querySelectorAll(`.pill-btn[data-setting="${t}"]`).forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        gameSettings[t] = e.target.dataset.value;
    });

    window.onresize = resizeBoard;
});

function startConfetti() {
    const c = document.getElementById('confetti-canvas');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; 
    c.height = window.innerHeight;
    const pieces = [];
    const colors = ['#f1c40f', '#e74c3c', '#8e44ad', '#3498db'];
    
    for(let i=0; i<150; i++) pieces.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height - c.height,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2
    });

    function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        pieces.forEach(p => {
            p.y += p.speed;
            p.rotation += 2;
            if(p.y > c.height) p.y = -10;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-5 * p.scale, -5 * p.scale, 10 * p.scale, 10 * p.scale);
            ctx.restore();
        });
        if(document.getElementById('confetti-canvas').style.display !== 'none') {
            requestAnimationFrame(draw);
        }
    }
    draw();
}
