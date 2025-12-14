import { TurnManager } from './turn_manager.js';

// ===================== 1. تهيئة المتغيرات =====================
const gameSettings = { mode: 'turns', teams: 'individual', timer: 'off', team1Name: '', team2Name: '', team1Members: [], team2Members: [] };
let gameActive = true;
let currentTurn = 'red'; // red or purple
let isMuted = false;
let currentQuestion = null;
let currentClickedCell = null;
let timerInterval = null;
let usedQuestions = JSON.parse(localStorage.getItem('hrof_used')) || {};

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

// ===================== 2. إدارة الشاشات والصوت =====================

function switchScreen(screenId) {
    // إخفاء كل الشاشات باستثناء شاشة الدخول (لأنها تتحكم بنفسها)
    ['main-menu-screen', 'game-screen'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active');
        el.style.display = 'none';
    });
    
    // إظهار الشاشة المطلوبة
    const target = document.getElementById(screenId);
    target.style.display = 'flex';
    setTimeout(() => target.classList.add('active'), 50);
}

function playSound(audioId) {
    if (isMuted) return;
    const audio = document.getElementById(audioId);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

function toggleSound() {
    isMuted = !isMuted;
    const icon = isMuted ? '🔇' : '🔊';
    document.getElementById('main-sound-toggle').textContent = icon;
    document.getElementById('game-sound-toggle').textContent = icon + (isMuted ? ' صامت' : ' صوت');
}

// ===================== 3. منطق اللعبة الرئيسي =====================

function startGame() {
    playSound('sound-click');
    
    // التحقق من الأسماء (Validation)
    const p1 = document.getElementById('player-1-name-input').value.trim();
    const p2 = document.getElementById('player-2-name-input').value.trim();
    const t1 = document.getElementById('team-1-name-input-team').value.trim();
    const t2 = document.getElementById('team-2-name-input-team').value.trim();

    if (gameSettings.teams === 'individual') {
        if (!p1 && !p2) { alert('الرجاء كتابة اسم واحد على الأقل'); return; }
        gameSettings.team1Name = p1 || 'الأحمر';
        gameSettings.team2Name = p2 || 'البنفسجي';
        gameSettings.team1Members = [p1];
        gameSettings.team2Members = [p2];
    } else {
        if (!t1 && !t2) { alert('الرجاء كتابة اسم الفريق'); return; }
        gameSettings.team1Name = t1 || 'فريق 1';
        gameSettings.team2Name = t2 || 'فريق 2';
        gameSettings.team1Members = Array.from(document.getElementById('team-1-members-list').querySelectorAll('input')).map(i=>i.value).filter(v=>v);
        gameSettings.team2Members = Array.from(document.getElementById('team-2-members-list').querySelectorAll('input')).map(i=>i.value).filter(v=>v);
    }

    // إعداد الواجهة
    document.getElementById('red-team-name').textContent = gameSettings.team1Name;
    document.getElementById('purple-team-name').textContent = gameSettings.team2Name;
    
    fillRoster('red-roster-display', gameSettings.team1Members);
    fillRoster('purple-roster-display', gameSettings.team2Members);

    // بدء اللعبة
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
    updateSidebars();
    
    // إخفاء النوافذ
    document.getElementById('round-win-overlay').classList.add('hidden');
    document.getElementById('exit-confirm-modal').classList.add('hidden');
    document.getElementById('confetti-canvas').style.display = 'none'; // إخفاء القصاصات
    
    initializeBoard();
    resizeBoard();
}

function updateSidebars() {
    const redPanel = document.getElementById('panel-red');
    const purplePanel = document.getElementById('panel-purple');
    
    // إزالة التفعيل السابق
    redPanel.classList.remove('active-turn-red');
    purplePanel.classList.remove('active-turn-purple');

    // إضافة التفعيل للدور الحالي
    if (currentTurn === 'red') {
        redPanel.classList.add('active-turn-red');
    } else {
        purplePanel.classList.add('active-turn-purple');
    }
}

function initializeBoard() {
    const container = document.getElementById('game-board-container');
    container.innerHTML = '';
    
    // خلط الحروف
    const shuffled = [...ALL_LETTERS].sort(() => 0.5 - Math.random());
    let idx = 0;

    BOARD_LAYOUT.forEach((row, r) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'hex-row';
        row.forEach((type, c) => {
            const cell = document.createElement('div');
            cell.className = 'hex-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (type === 'G') {
                cell.classList.add('hex-cell-default', 'playable');
                if (idx < 25) {
                    const l = shuffled[idx++];
                    cell.dataset.id = l.id;
                    cell.dataset.name = l.name;
                    cell.innerHTML = `<span class="hex-letter">${l.char}</span>`;
                }
                cell.addEventListener('click', handleCellClick);
            } else if (type === 'red') {
                cell.classList.add('hex-cell-red');
            } else if (type === 'purple') {
                cell.classList.add('hex-cell-purple');
            } else {
                cell.classList.add('hex-cell-transparent');
            }
            rowDiv.appendChild(cell);
        });
        container.appendChild(rowDiv);
    });
}

// ===================== 4. التفاعل (Modal & Logic) =====================

async function handleCellClick(e) {
    if (!gameActive) return;
    const cell = e.currentTarget;
    if (!cell.classList.contains('playable')) return;

    playSound('sound-flip');
    currentClickedCell = cell;
    
    // تعبئة النافذة
    document.getElementById('question-char-display').textContent = cell.dataset.name;
    document.getElementById('question-text').textContent = 'جاري جلب السؤال...';
    document.getElementById('answer-text').textContent = '';
    
    // عرض النافذة
    const modal = document.getElementById('question-modal-overlay');
    modal.classList.remove('hidden');
    document.getElementById('show-answer-button').classList.remove('hidden');
    document.getElementById('answer-reveal-section').style.display = 'none';

    // التحكم بنوع الأزرار
    const isTurns = gameSettings.mode === 'turns';
    document.getElementById('competitive-controls').classList.toggle('hidden', isTurns);
    document.getElementById('turns-controls').classList.toggle('hidden', !isTurns);

    // جلب السؤال
    try {
        const res = await fetch(`data/questions/${cell.dataset.id}.json`);
        if (res.ok) {
            const data = await res.json();
            // تصفية الأسئلة المستخدمة
            const available = data.filter((_, i) => !usedQuestions[`${cell.dataset.id}_${i}`]);
            const q = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : data[0];
            
            currentQuestion = q;
            currentQuestion.uid = `${cell.dataset.id}_${data.indexOf(q)}`;
            
            document.getElementById('question-text').textContent = q.question;
            document.getElementById('answer-text').textContent = q.answer;
        } else { throw new Error(); }
    } catch {
        document.getElementById('question-text').textContent = "سؤال تجريبي: ما هي عاصمة السعودية؟";
        document.getElementById('answer-text').textContent = "الرياض";
    }

    // المؤقت
    if (gameSettings.timer !== 'off') startTimer(parseInt(gameSettings.timer));
    else document.getElementById('question-timer').classList.add('hidden');
}

function handleResult(result) {
    // إيقاف كل شيء
    stopTimer();
    document.getElementById('question-modal-overlay').classList.add('hidden');

    // حفظ السؤال
    if (currentQuestion && currentQuestion.uid) {
        usedQuestions[currentQuestion.uid] = true;
        localStorage.setItem('hrof_used', JSON.stringify(usedQuestions));
    }

    let winnerColor = null;
    let switchTurn = true;

    // المنطق
    if (result === 'red') { winnerColor = 'red'; switchTurn = false; } // تنافسي
    else if (result === 'purple') { winnerColor = 'purple'; switchTurn = false; } // تنافسي
    else if (result === 'turn_correct') { 
        winnerColor = currentTurn; 
        switchTurn = true; // في الأدوار، التبديل دائماً (1-2-1-2)
    } else {
        // خطأ أو تخطي
        playSound('sound-wrong');
        currentTurn = (currentTurn === 'red') ? 'purple' : 'red';
        updateSidebars();
        return; 
    }

    // تطبيق الفوز بالخلية
    if (winnerColor) {
        playSound('sound-correct');
        currentClickedCell.classList.remove('playable', 'hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${winnerColor}-owned`);
        
        // فحص الفوز بالمباراة
        if (checkWin(winnerColor)) {
            handleGameWin(winnerColor);
            return;
        }
    }

    // تبديل الدور
    if (switchTurn || gameSettings.mode === 'turns') {
        currentTurn = (currentTurn === 'red') ? 'purple' : 'red';
    }
    updateSidebars();
}

function checkWin(color) {
    // (نفس خوارزمية BFS السابقة)
    const q = []; const visited = new Set(); const parent = new Map();
    const getC = (r,c) => document.querySelector(`.hex-cell[data-row="${r}"][data-col="${c}"]`);
    
    if(color==='red') { for(let c=2;c<=6;c++) if(getC(2,c)?.classList.contains('hex-cell-red-owned')) { q.push([2,c]); visited.add(`2,${c}`); parent.set(`2,${c}`, null); } }
    else { for(let r=2;r<=6;r++) if(getC(r,6)?.classList.contains('hex-cell-purple-owned')) { q.push([r,6]); visited.add(`${r},6`); parent.set(`${r},6`, null); } }

    let safeLoop = 0;
    while(q.length > 0) {
        safeLoop++; if(safeLoop > 500) break; // أمان
        const [r,c] = q.shift();
        const odd = r%2!==0;
        const diffs = odd ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]] : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
        
        for(const [dr,dc] of diffs) {
            const nr=r+dr, nc=c+dc;
            if(nr<0||nr>8||nc<0||nc>8) continue;
            
            const isWinEdge = (color==='red' && nr===7 && BOARD_LAYOUT[nr][nc]==='red') || (color==='purple' && nc===1 && BOARD_LAYOUT[nr][nc]==='purple');
            if(isWinEdge) {
                // تلوين المسار
                let k = `${r},${c}`;
                while(k) { 
                    const [pr,pc] = k.split(','); 
                    getC(pr,pc).classList.add('winning-path-cell'); 
                    k = parent.get(k); 
                }
                return true;
            }

            const cell = getC(nr,nc);
            if(cell && !visited.has(`${nr},${nc}`) && cell.classList.contains(`hex-cell-${color}-owned`)) {
                visited.add(`${nr},${nc}`); parent.set(`${nr},${nc}`, `${r},${c}`); q.push([nr,nc]);
            }
        }
    }
    return false;
}

function handleGameWin(color) {
    gameActive = false;
    playSound('sound-win');
    
    // تشغيل القصاصات
    startConfetti();
    document.getElementById('confetti-canvas').style.display = 'block';

    const winnerName = (color === 'red') ? gameSettings.team1Name : gameSettings.team2Name;
    document.getElementById('win-message').textContent = `الفريق ${winnerName} سيطر على اللوحة!`;
    document.getElementById('round-win-overlay').classList.remove('hidden');
}

// ===================== 5. الوظائف المساعدة =====================

function startTimer(dur) {
    if (timerInterval) clearInterval(timerInterval);
    let rem = dur;
    const disp = document.getElementById('question-timer');
    disp.classList.remove('hidden');
    disp.textContent = rem;
    disp.style.backgroundColor = 'var(--color-yellow)';
    
    timerInterval = setInterval(() => {
        rem--;
        disp.textContent = rem;
        if (rem <= 5) disp.style.backgroundColor = 'red';
        if (rem <= 0) {
            clearInterval(timerInterval);
            handleResult('skip'); // انتهاء الوقت = تخطي
        }
    }, 1000);
}
function stopTimer() { if(timerInterval) clearInterval(timerInterval); }

function resizeBoard() {
    if (document.getElementById('game-screen').style.display === 'none') return;
    const h = window.innerHeight;
    const w = window.innerWidth;
    // معادلة تحجيم ذكية
    const scale = Math.min((w - 480) / 800, (h - 150) / 650);
    // للجوال
    if(w < 768) {
        document.getElementById('game-board-container').style.transform = `scale(${Math.min(w/850, 0.55)})`;
    } else {
        document.getElementById('game-board-container').style.transform = `scale(${Math.max(0.4, Math.min(scale, 1.2))})`;
    }
}

// ===================== 6. تفعيل الأزرار =====================
document.addEventListener('DOMContentLoaded', () => {
    
    // أزرار القائمة الرئيسية
    document.getElementById('start-game-button').addEventListener('click', startGame);
    document.getElementById('main-sound-toggle').addEventListener('click', toggleSound);
    
    document.querySelectorAll('.mode-tab').forEach(b => b.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active')); e.target.classList.add('active');
        gameSettings.teams = e.target.dataset.value;
        const isIndiv = gameSettings.teams === 'individual';
        document.getElementById('indiv-red').style.display = isIndiv ? 'block' : 'none';
        document.getElementById('team-red').style.display = isIndiv ? 'none' : 'block';
        document.getElementById('indiv-purple').style.display = isIndiv ? 'block' : 'none';
        document.getElementById('team-purple').style.display = isIndiv ? 'none' : 'block';
    }));

    document.querySelectorAll('.pill-btn').forEach(b => b.addEventListener('click', (e) => {
        const type = e.target.dataset.setting;
        document.querySelectorAll(`.pill-btn[data-setting="${type}"]`).forEach(p => p.classList.remove('active'));
        e.target.classList.add('active'); gameSettings[type] = e.target.dataset.value;
    }));

    // أزرار داخل اللعبة
    document.getElementById('exit-game-button').onclick = () => document.getElementById('exit-confirm-modal').classList.remove('hidden');
    document.getElementById('exit-confirm-yes').onclick = () => {
        stopTimer();
        document.getElementById('exit-confirm-modal').classList.add('hidden');
        switchScreen('main-menu-screen'); // عودة للقائمة (ليس تحديث)
    };
    document.getElementById('exit-confirm-no').onclick = () => document.getElementById('exit-confirm-modal').classList.add('hidden');
    
    document.getElementById('show-answer-button').onclick = () => {
        document.getElementById('answer-reveal-section').style.display = 'block';
        document.getElementById('show-answer-button').classList.add('hidden');
        playSound('sound-click');
    };

    document.getElementById('game-sound-toggle').onclick = toggleSound;
    document.getElementById('toggle-theme-button').onclick = () => {
        document.body.classList.toggle('light-mode');
        document.body.classList.toggle('dark-mode');
    };

    // أزرار النتائج
    document.getElementById('team-red-win-button').onclick = () => handleResult('red');
    document.getElementById('team-purple-win-button').onclick = () => handleResult('purple');
    document.getElementById('turn-correct-button').onclick = () => handleResult('turn_correct');
    document.getElementById('turn-wrong-button').onclick = () => handleResult('skip');
    document.getElementById('competitive-skip-button').onclick = () => handleResult('skip');
    
    document.getElementById('next-round-button').onclick = () => {
        document.getElementById('round-win-overlay').classList.add('hidden');
        switchScreen('main-menu-screen');
    };

    // التعليمات
    document.getElementById('instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.remove('hidden');
    document.getElementById('close-instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.add('hidden');

    window.addEventListener('resize', resizeBoard);
});

// ===================== 7. كود القصاصات (Confetti Engine) =====================
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const pieces = [];
    const colors = ['#f1c40f', '#e74c3c', '#8e44ad', '#3498db', '#ffffff'];

    for(let i=0; i<200; i++) {
        pieces.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
            rotation: Math.random() * 360, scale: Math.random() * 0.5 + 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speed;
            p.rotation += 2;
            if(p.y > canvas.height) p.y = -10;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-5 * p.scale, -5 * p.scale, 10 * p.scale, 10 * p.scale);
            ctx.restore();
        });
        if(document.getElementById('confetti-canvas').style.display !== 'none') requestAnimationFrame(draw);
    }
    draw();
}
