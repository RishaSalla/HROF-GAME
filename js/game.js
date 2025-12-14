import { TurnManager } from './turn_manager.js';

// ===================== 1. المتغيرات والإعدادات =====================
const gameSettings = { mode: 'turns', teams: 'individual', timer: 'off', team1Name: '', team2Name: '', team1Members: [], team2Members: [] };
let gameActive = true;
let currentTurn = 'red'; // red | purple
let isMuted = false;
let currentQuestion = null;
let currentClickedCell = null;
let timerInterval = null;
let usedQuestions = JSON.parse(localStorage.getItem('hrof_used')) || {};

// الحروف (تم التأكد من حرف العين 18ain)
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

// ===================== 2. الوظائف الأساسية =====================

function validateInputs() {
    // تفعيل زر البدء دائماً لتجنب المشاكل، لكن التحقق الفعلي يتم عند الضغط
    const btn = document.getElementById('start-game-button');
    if(btn) {
        btn.disabled = false;
        btn.style.filter = 'none';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active'); s.style.display = 'none';
    });
    const target = document.getElementById(screenId);
    if(target) {
        target.style.display = 'flex';
        setTimeout(() => target.classList.add('active'), 50);
    }
}

function playSound(id) {
    if(isMuted) return;
    const aud = document.getElementById(id);
    if(aud) { aud.currentTime=0; aud.play().catch(()=>{}); }
}

function toggleSound() {
    isMuted = !isMuted;
    const svgPath = isMuted 
        ? "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
        : "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z";
    
    // تحديث الأيقونة في الزرين (القائمة واللعبة)
    [document.getElementById('main-sound-toggle'), document.getElementById('game-sound-toggle')].forEach(btn => {
        if(btn) {
            // إذا كان زر SVG
            const svgIcon = btn.querySelector('path');
            if(svgIcon) svgIcon.setAttribute('d', svgPath);
            // إذا كان زر نصي
            else btn.textContent = isMuted ? 'صامت' : 'صوت';
        }
    });
}

// ===================== 3. منطق اللعب =====================

function startGame() {
    playSound('sound-click');
    const p1 = document.getElementById('player-1-name-input').value.trim();
    const p2 = document.getElementById('player-2-name-input').value.trim();
    const t1 = document.getElementById('team-1-name-input-team').value.trim();
    const t2 = document.getElementById('team-2-name-input-team').value.trim();

    // التحقق من الأسماء قبل البدء
    if (gameSettings.teams === 'individual') {
        if(!p1 && !p2) { alert('الرجاء كتابة الأسماء'); return; }
        gameSettings.team1Name = p1 || 'الأحمر';
        gameSettings.team2Name = p2 || 'البنفسجي';
        gameSettings.team1Members = [gameSettings.team1Name];
        gameSettings.team2Members = [gameSettings.team2Name];
    } else {
        if(!t1 && !t2) { alert('الرجاء كتابة أسماء الفرق'); return; }
        gameSettings.team1Name = t1 || 'فريق 1';
        gameSettings.team2Name = t2 || 'فريق 2';
        gameSettings.team1Members = Array.from(document.getElementById('team-1-members-list').querySelectorAll('input')).map(i=>i.value).filter(v=>v);
        gameSettings.team2Members = Array.from(document.getElementById('team-2-members-list').querySelectorAll('input')).map(i=>i.value).filter(v=>v);
    }

    document.getElementById('red-team-name').textContent = gameSettings.team1Name;
    document.getElementById('purple-team-name').textContent = gameSettings.team2Name;
    fillRoster('red-roster-display', gameSettings.team1Members);
    fillRoster('purple-roster-display', gameSettings.team2Members);

    switchScreen('game-screen');
    startNewRound();
    playSound('sound-start');
}

function fillRoster(id, list) {
    const c = document.getElementById(id); c.innerHTML='';
    list.forEach(n=>{ const d=document.createElement('div'); d.className='roster-item'; d.textContent=n; c.appendChild(d); });
}

function startNewRound() {
    gameActive = true; currentTurn = 'red';
    updateSidebars(); // تحديث الإضاءة حسب النمط
    
    document.getElementById('round-win-overlay').classList.add('hidden');
    document.getElementById('exit-confirm-modal').classList.add('hidden');
    document.getElementById('confetti-canvas').style.display = 'none';
    
    initializeBoard(); resizeBoard();
}

function updateSidebars() {
    const red = document.getElementById('panel-red');
    const purple = document.getElementById('panel-purple');
    
    // إزالة الإضاءة أولاً
    red.classList.remove('active-turn-red');
    purple.classList.remove('active-turn-purple');

    // إذا كان الوضع "تنافسي"، لا تضيء أحداً (لأن الدور للجميع)
    if (gameSettings.mode === 'competitive') {
        return; 
    }

    // إذا كان الوضع "أدوار"، أضئ صاحب الدور
    if(currentTurn==='red') red.classList.add('active-turn-red');
    else purple.classList.add('active-turn-purple');
}

function initializeBoard() {
    const con = document.getElementById('game-board-container'); con.innerHTML='';
    const shuf = [...ALL_LETTERS].sort(()=>0.5-Math.random());
    let idx = 0;
    BOARD_LAYOUT.forEach((row, r) => {
        const d = document.createElement('div'); d.className='hex-row';
        row.forEach((type, c) => {
            const cell = document.createElement('div'); cell.className='hex-cell'; cell.dataset.r=r; cell.dataset.c=c;
            if(type==='G') {
                cell.classList.add('hex-cell-default','playable');
                if(idx<25) { const l=shuf[idx++]; cell.dataset.id=l.id; cell.dataset.name=l.name; cell.innerHTML=`<span class="hex-letter">${l.char}</span>`; }
                cell.addEventListener('click', handleCellClick);
            } else if(type==='red') cell.classList.add('hex-cell-red');
            else if(type==='purple') cell.classList.add('hex-cell-purple');
            else cell.classList.add('hex-cell-transparent');
            d.appendChild(cell);
        });
        con.appendChild(d);
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

    // إخفاء/إظهار الأزرار حسب النمط
    const isTurns = gameSettings.mode === 'turns';
    document.getElementById('competitive-controls').classList.toggle('hidden', isTurns);
    document.getElementById('turns-controls').classList.toggle('hidden', !isTurns);
    document.getElementById('control-label-text').textContent = isTurns ? "نتيجة الإجابة:" : "من الأسرع؟";

    try {
        // التأكد من المسار الصحيح (مثل 18ain.json)
        const res = await fetch(`data/questions/${cell.dataset.id}.json`);
        if(res.ok) {
            const data = await res.json();
            const q = data.filter((_,i)=>!usedQuestions[`${cell.dataset.id}_${i}`]);
            const sel = q.length>0 ? q[Math.floor(Math.random()*q.length)] : data[0];
            currentQuestion = sel; currentQuestion.uid = `${cell.dataset.id}_${data.indexOf(sel)}`;
            document.getElementById('question-text').textContent = sel.question;
            document.getElementById('answer-text').textContent = sel.answer;
        } else { 
            throw new Error('File Not Found'); 
        }
    } catch(err) {
        console.error("Error loading question:", err);
        document.getElementById('question-text').textContent = `لم يتم العثور على ملف السؤال (${cell.dataset.id})`;
        document.getElementById('answer-text').textContent = "تأكد من مجلد data/questions";
    }

    if(gameSettings.timer!=='off') startTimer(parseInt(gameSettings.timer));
    else document.getElementById('question-timer').classList.add('hidden');
}

function handleResult(res) {
    stopTimer();
    document.getElementById('question-modal-overlay').classList.add('hidden');
    if(currentQuestion?.uid) { usedQuestions[currentQuestion.uid]=true; localStorage.setItem('hrof_used',JSON.stringify(usedQuestions)); }

    let winColor = null;
    let switchT = true;

    if(res==='red') { winColor='red'; switchT=false; } // تنافسي أحمر
    else if(res==='purple') { winColor='purple'; switchT=false; } // تنافسي بنفسجي
    else if(res==='turn_correct') { winColor=currentTurn; switchT=true; } // أدوار صحيح
    else { 
        // إجابة خاطئة أو تخطي
        playSound('sound-wrong'); 
        // في الأدوار: الخاطئ يقلب الدور
        if(gameSettings.mode === 'turns') {
            currentTurn=(currentTurn==='red')?'purple':'red'; 
            updateSidebars(); 
        }
        return; 
    }

    if(winColor) {
        playSound('sound-correct');
        currentClickedCell.classList.remove('playable','hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${winColor}-owned`);
        
        setTimeout(() => { if(checkWin(winColor)) handleGameWin(winColor); }, 100);
    }

    // تبديل الدور فقط في نمط الأدوار
    if((switchT || gameSettings.mode==='turns') && !checkWin(winColor)) {
        currentTurn=(currentTurn==='red')?'purple':'red';
    }
    updateSidebars();
}

function checkWin(color) {
    const q = []; const visited = new Set(); const parent = new Map();
    const getC = (r,c) => document.querySelector(`.hex-cell[data-r="${r}"][data-c="${c}"]`);
    
    if(color==='red') { for(let c=2;c<=6;c++) if(getC(2,c)?.classList.contains('hex-cell-red-owned')) { q.push([2,c]); visited.add(`2,${c}`); parent.set(`2,${c}`, null); } }
    else { for(let r=2;r<=6;r++) if(getC(r,6)?.classList.contains('hex-cell-purple-owned')) { q.push([r,6]); visited.add(`${r},6`); parent.set(`${r},6`, null); } }

    let loop = 0;
    while(q.length>0) {
        loop++; if(loop>300) break;
        const [r,c] = q.shift();
        const odd = r%2!==0;
        const diffs = odd ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]] : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
        for(const [dr,dc] of diffs) {
            const nr=r+dr, nc=c+dc;
            if(nr<0||nr>8||nc<0||nc>8) continue;
            const winEdge = (color==='red' && nr===7 && BOARD_LAYOUT[nr][nc]==='red') || (color==='purple' && nc===1 && BOARD_LAYOUT[nr][nc]==='purple');
            if(winEdge) {
                let k=`${r},${c}`;
                while(k) { const [pr,pc]=k.split(','); getC(pr,pc).classList.add('winning-path-cell'); k=parent.get(k); }
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
    gameActive = false; playSound('sound-win');
    startConfetti(); 
    document.getElementById('confetti-canvas').style.display='block';
    const nm = (color==='red') ? gameSettings.team1Name : gameSettings.team2Name;
    document.getElementById('win-message').textContent = `الفريق ${nm} فاز!`;
    document.getElementById('round-win-overlay').classList.remove('hidden');
}

function startTimer(dur) {
    if(timerInterval) clearInterval(timerInterval);
    let rem = dur;
    const d = document.getElementById('question-timer');
    d.classList.remove('hidden'); d.textContent=rem; d.style.background='var(--color-yellow)';
    timerInterval = setInterval(() => {
        rem--; d.textContent=rem;
        if(rem<=5) d.style.background='red';
        if(rem<=0) { clearInterval(timerInterval); handleResult('skip'); }
    }, 1000);
}
function stopTimer() { if(timerInterval) clearInterval(timerInterval); }

function resizeBoard() {
    if(document.getElementById('game-screen').style.display==='none') return;
    const h = window.innerHeight; const w = window.innerWidth;
    const sc = Math.min((w-450)/800, (h-120)/650);
    const con = document.getElementById('game-board-container');
    if(w<768) con.style.transform = `scale(${Math.min(w/850, 0.6)})`;
    else con.style.transform = `scale(${Math.max(0.4, Math.min(sc, 1.3))})`;
}

// ===================== 4. الأحداث =====================
document.addEventListener('DOMContentLoaded', () => {
    validateInputs(); 
    
    // زر إضافة عضو (ديناميكي)
    const addP1 = document.getElementById('add-team-1-member-button');
    if(addP1) addP1.onclick = () => { 
        const i=document.createElement('input'); i.placeholder='اسم العضو'; 
        document.getElementById('team-1-members-list').appendChild(i); 
    };
    const addP2 = document.getElementById('add-team-2-member-button');
    if(addP2) addP2.onclick = () => { 
        const i=document.createElement('input'); i.placeholder='اسم العضو'; 
        document.getElementById('team-2-members-list').appendChild(i); 
    };

    document.getElementById('start-game-button').onclick = startGame;
    document.getElementById('main-sound-toggle').addEventListener('click', toggleSound);
    
    document.querySelectorAll('.mode-tab').forEach(b => b.onclick = (e) => {
        document.querySelectorAll('.mode-tab').forEach(t=>t.classList.remove('active')); e.target.classList.add('active');
        gameSettings.teams = e.target.dataset.value;
        const ind = gameSettings.teams==='individual';
        document.getElementById('indiv-red').style.display=ind?'block':'none'; document.getElementById('team-red').style.display=ind?'none':'block';
        document.getElementById('indiv-purple').style.display=ind?'block':'none'; document.getElementById('team-purple').style.display=ind?'none':'block';
    });
    
    document.querySelectorAll('.pill-btn').forEach(b => b.onclick = (e) => {
        const t = e.target.dataset.setting;
        document.querySelectorAll(`.pill-btn[data-setting="${t}"]`).forEach(p=>p.classList.remove('active'));
        e.target.classList.add('active'); gameSettings[t] = e.target.dataset.value;
    });

    document.getElementById('show-answer-button').onclick = () => { 
        document.getElementById('answer-reveal-section').style.display='block'; 
        document.getElementById('show-answer-button').classList.add('hidden'); 
        playSound('sound-click'); 
    };
    
    document.getElementById('turn-correct-button').onclick = () => handleResult('turn_correct');
    document.getElementById('turn-wrong-button').onclick = () => handleResult('skip');
    document.getElementById('team-red-win-button').onclick = () => handleResult('red');
    document.getElementById('team-purple-win-button').onclick = () => handleResult('purple');
    document.getElementById('competitive-skip-button').onclick = () => handleResult('skip');
    
    document.getElementById('exit-game-button').onclick = () => document.getElementById('exit-confirm-modal').classList.remove('hidden');
    document.getElementById('exit-confirm-yes').onclick = () => { stopTimer(); document.getElementById('exit-confirm-modal').classList.add('hidden'); switchScreen('main-menu-screen'); };
    document.getElementById('exit-confirm-no').onclick = () => document.getElementById('exit-confirm-modal').classList.add('hidden');
    document.getElementById('next-round-button').onclick = () => { document.getElementById('round-win-overlay').classList.add('hidden'); switchScreen('main-menu-screen'); };
    document.getElementById('instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.remove('hidden');
    document.getElementById('close-instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.add('hidden');
    document.getElementById('game-sound-toggle').onclick = toggleSound;

    window.onresize = resizeBoard;
});

function startConfetti() {
    const c = document.getElementById('confetti-canvas'); const ctx = c.getContext('2d');
    c.width=window.innerWidth; c.height=window.innerHeight;
    const p=[]; const col=['#f1c40f','#e74c3c','#8e44ad','#3498db'];
    for(let i=0;i<150;i++) p.push({x:Math.random()*c.width, y:Math.random()*c.height-c.height, r:Math.random()*360, s:Math.random()*0.5+0.5, c:col[Math.floor(Math.random()*col.length)], v:Math.random()*3+2});
    function d(){ ctx.clearRect(0,0,c.width,c.height); p.forEach(a=>{ a.y+=a.v; a.r+=2; if(a.y>c.height) a.y=-10; ctx.save(); ctx.translate(a.x,a.y); ctx.rotate(a.r*Math.PI/180); ctx.fillStyle=a.c; ctx.fillRect(-5*a.s,-5*a.s,10*a.s,10*a.s); ctx.restore(); }); if(c.style.display!=='none') requestAnimationFrame(d); }
    d();
}
