import { TurnManager } from './turn_manager.js';

// ===================== 1. المتغيرات والإعدادات =====================
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
let currentTurn = 'red'; // red | purple
let currentMemberIndex = { red: 0, purple: 0 }; // لتتبع دور اللاعب داخل الفريق
let isMuted = false;
let currentQuestion = null;
let currentClickedCell = null;
let timerInterval = null;
let usedQuestions = JSON.parse(localStorage.getItem('hrof_used')) || {};

// قائمة الحروف (تم اعتماد 18ain)
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

// تخطيط اللوحة
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

// ===================== 2. دوال النظام والتحكم =====================

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => { 
        s.classList.remove('active'); 
        s.style.display = 'none'; 
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
    if(aud) { 
        aud.currentTime = 0; 
        aud.play().catch(() => {}); 
    }
}

function toggleSound() {
    isMuted = !isMuted;
    // تحديث الأيقونة
    const svgPath = isMuted 
        ? "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
        : "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z";
    
    [document.getElementById('main-sound-toggle'), document.getElementById('game-sound-toggle')].forEach(btn => {
        if(btn) {
            const svgIcon = btn.querySelector('path');
            if(svgIcon) svgIcon.setAttribute('d', svgPath);
        }
    });
}

// ===================== 3. بدء اللعبة وتجهيز الفرق =====================

function startGame() {
    playSound('sound-click');
    const p1 = document.getElementById('player-1-name-input').value.trim();
    const p2 = document.getElementById('player-2-name-input').value.trim();
    const t1 = document.getElementById('team-1-name-input-team').value.trim();
    const t2 = document.getElementById('team-2-name-input-team').value.trim();

    if (gameSettings.teams === 'individual') {
        if(!p1 && !p2) { alert('الرجاء كتابة أسماء اللاعبين'); return; }
        gameSettings.team1Name = p1 || 'الأحمر';
        gameSettings.team2Name = p2 || 'البنفسجي';
        gameSettings.team1Members = [gameSettings.team1Name];
        gameSettings.team2Members = [gameSettings.team2Name];
    } else {
        if(!t1 && !t2) { alert('الرجاء كتابة أسماء الفرق'); return; }
        gameSettings.team1Name = t1 || 'فريق 1';
        gameSettings.team2Name = t2 || 'فريق 2';
        
        // تجميع أسماء الأعضاء من الخانات
        const members1 = Array.from(document.getElementById('team-1-members-list').querySelectorAll('input'))
                              .map(input => input.value.trim()).filter(val => val !== "");
        const members2 = Array.from(document.getElementById('team-2-members-list').querySelectorAll('input'))
                              .map(input => input.value.trim()).filter(val => val !== "");
        
        // إذا لم يدخل المستخدم أعضاء، نضع اسم الفريق كعضو وحيد افتراضياً
        gameSettings.team1Members = members1.length > 0 ? members1 : [gameSettings.team1Name];
        gameSettings.team2Members = members2.length > 0 ? members2 : [gameSettings.team2Name];
    }

    // تعبئة البيانات في الواجهة
    document.getElementById('red-team-name').textContent = gameSettings.team1Name;
    document.getElementById('purple-team-name').textContent = gameSettings.team2Name;
    
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
    currentMemberIndex = { red: 0, purple: 0 }; // إعادة تعيين تناوب الأعضاء
    
    updatePlayerTurnDisplay();
    updateSidebars();
    
    document.getElementById('round-win-overlay').classList.add('hidden');
    document.getElementById('exit-confirm-modal').classList.add('hidden');
    document.getElementById('confetti-canvas').style.display = 'none';
    
    initializeBoard();
    resizeBoard();
}

// === وظيفة تحديث اسم اللاعب الحالي (التناوب) ===
function updatePlayerTurnDisplay() {
    const redMember = gameSettings.team1Members[currentMemberIndex.red % gameSettings.team1Members.length];
    const purpleMember = gameSettings.team2Members[currentMemberIndex.purple % gameSettings.team2Members.length];
    
    document.getElementById('red-current-player').textContent = redMember;
    document.getElementById('purple-current-player').textContent = purpleMember;
}

function updateSidebars() {
    const redPanel = document.getElementById('panel-red');
    const purplePanel = document.getElementById('panel-purple');
    
    redPanel.classList.remove('active-turn-red');
    purplePanel.classList.remove('active-turn-purple');

    // في الوضع التنافسي: لا تضيء الجوانب (لأن الدور للجميع)
    if (gameSettings.mode === 'competitive') return;

    // في وضع الأدوار: أضئ الفريق الحالي
    if(currentTurn === 'red') redPanel.classList.add('active-turn-red');
    else purplePanel.classList.add('active-turn-purple');
}

// ===================== 4. منطق اللوحة والأسئلة =====================

function initializeBoard() {
    const container = document.getElementById('game-board-container');
    container.innerHTML = '';
    
    // خلط وتوزيع الحروف
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
            } else if(type === 'red') {
                cell.classList.add('hex-cell-red');
            } else if(type === 'purple') {
                cell.classList.add('hex-cell-purple');
            } else {
                cell.classList.add('hex-cell-transparent');
            }
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
    
    // إظهار السؤال
    document.getElementById('question-char-display').textContent = cell.dataset.name;
    document.getElementById('question-text').textContent = '...';
    document.getElementById('question-modal-overlay').classList.remove('hidden');
    
    // إظهار زر "أظهر الإجابة" وإخفاء الإجابة
    document.getElementById('show-answer-button').classList.remove('hidden');
    document.getElementById('answer-reveal-section').style.display = 'none';

    // تبديل الأزرار حسب النمط
    const isTurns = gameSettings.mode === 'turns';
    document.getElementById('competitive-controls').classList.toggle('hidden', isTurns);
    document.getElementById('turns-controls').classList.toggle('hidden', !isTurns);

    // جلب ملف السؤال
    try {
        const res = await fetch(`data/questions/${cell.dataset.id}.json`);
        if(res.ok) {
            const data = await res.json();
            // اختيار سؤال لم يستخدم من قبل
            const available = data.filter((_, i) => !usedQuestions[`${cell.dataset.id}_${i}`]);
            const selected = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : data[0];
            
            currentQuestion = selected;
            currentQuestion.uid = `${cell.dataset.id}_${data.indexOf(selected)}`;
            
            document.getElementById('question-text').textContent = selected.question;
            document.getElementById('answer-text').textContent = selected.answer;
        } else {
            throw new Error('File not found');
        }
    } catch (err) {
        document.getElementById('question-text').textContent = "سؤال تجريبي (لم يتم العثور على الملف)";
        document.getElementById('answer-text').textContent = "الإجابة";
    }

    // المؤقت
    if(gameSettings.timer !== 'off') {
        startTimer(parseInt(gameSettings.timer));
    } else {
        document.getElementById('question-timer').classList.add('hidden');
    }
}

// ===================== 5. معالجة النتائج والفوز =====================

function handleResult(result) {
    stopTimer();
    document.getElementById('question-modal-overlay').classList.add('hidden');
    
    // تسجيل السؤال كمستخدم
    if(currentQuestion?.uid) {
        usedQuestions[currentQuestion.uid] = true;
        localStorage.setItem('hrof_used', JSON.stringify(usedQuestions));
    }

    let winnerColor = null;
    let shouldSwitchTurn = true;

    // تحليل النتيجة
    if (result === 'red') {
        winnerColor = 'red';
        shouldSwitchTurn = false; // في التنافسي لا يوجد تبديل دور ثابت
    } else if (result === 'purple') {
        winnerColor = 'purple';
        shouldSwitchTurn = false;
    } else if (result === 'turn_correct') {
        winnerColor = currentTurn;
        shouldSwitchTurn = true; // في الأدوار، دائماً نبدل بعد الإجابة
    } else if (result === 'skip') {
        // تخطي: تشغيل صوت فقط وتبديل الدور إذا كنا في نمط الأدوار
        playSound('sound-click');
        if (gameSettings.mode === 'turns') {
            // اللاعب أنهى محاولته (بالتخطي أو الخطأ) -> ننتقل للعضو التالي في فريقه للمرة القادمة
            currentMemberIndex[currentTurn]++;
            currentTurn = (currentTurn === 'red') ? 'purple' : 'red';
            updatePlayerTurnDisplay();
            updateSidebars();
        }
        return; // خروج، لا تلوين
    }

    // تطبيق الفوز بالخلية
    if (winnerColor) {
        playSound('sound-correct');
        currentClickedCell.classList.remove('playable', 'hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${winnerColor}-owned`);
        
        // التحقق من الفوز باللعبة
        setTimeout(() => {
            if (checkWin(winnerColor)) handleGameWin(winnerColor);
        }, 100);
        
        // تبديل الدور وتحديث العضو (فقط في نمط الأدوار)
        if (shouldSwitchTurn || gameSettings.mode === 'turns') {
            currentMemberIndex[currentTurn]++; // ننتقل للاعب التالي في الفريق
            currentTurn = (currentTurn === 'red') ? 'purple' : 'red';
        }
    }

    updatePlayerTurnDisplay();
    updateSidebars();
}

function checkWin(color) {
    // خوارزمية البحث (BFS) للتحقق من الاتصال
    const q = []; 
    const visited = new Set(); 
    const parent = new Map();
    const getCell = (r, c) => document.querySelector(`.hex-cell[data-r="${r}"][data-c="${c}"]`);
    
    // تحديد نقاط البداية
    if (color === 'red') {
        for(let c=2; c<=6; c++) {
            if(getCell(2, c)?.classList.contains('hex-cell-red-owned')) {
                q.push([2, c]); visited.add(`2,${c}`); parent.set(`2,${c}`, null);
            }
        }
    } else {
        for(let r=2; r<=6; r++) {
            if(getCell(r, 6)?.classList.contains('hex-cell-purple-owned')) {
                q.push([r, 6]); visited.add(`${r},6`); parent.set(`${r},6`, null);
            }
        }
    }

    let loopSafety = 0;
    while(q.length > 0) {
        loopSafety++; if(loopSafety > 300) break;
        
        const [r, c] = q.shift();
        const isOddRow = r % 2 !== 0;
        const neighbors = isOddRow 
            ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]] 
            : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
        
        for(const [dr, dc] of neighbors) {
            const nr = r + dr, nc = c + dc;
            if(nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            
            // شرط الفوز (الوصول للطرف الآخر)
            const isWinEdge = (color === 'red' && nr === 7 && BOARD_LAYOUT[nr][nc] === 'red') || 
                              (color === 'purple' && nc === 1 && BOARD_LAYOUT[nr][nc] === 'purple');
            
            if(isWinEdge) {
                // تلوين المسار الفائز
                let key = `${r},${c}`;
                while(key) {
                    const [pr, pc] = key.split(',');
                    getCell(pr, pc).classList.add('winning-path-cell');
                    key = parent.get(key);
                }
                return true;
            }

            const cell = getCell(nr, nc);
            if(cell && !visited.has(`${nr},${nc}`) && cell.classList.contains(`hex-cell-${color}-owned`)) {
                visited.add(`${nr},${nc}`);
                parent.set(`${nr},${nc}`, `${r},${c}`);
                q.push([nr, nc]);
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
    
    const winnerName = (color === 'red') ? gameSettings.team1Name : gameSettings.team2Name;
    document.getElementById('win-message').textContent = `الفريق ${winnerName} فاز!`;
    document.getElementById('round-win-overlay').classList.remove('hidden');
}

// ===================== 6. المؤقت والقصاصات =====================

function startTimer(duration) {
    if(timerInterval) clearInterval(timerInterval);
    let remaining = duration;
    const display = document.getElementById('question-timer');
    display.classList.remove('hidden');
    display.textContent = remaining;
    display.style.background = 'var(--color-yellow)';
    
    timerInterval = setInterval(() => {
        remaining--;
        display.textContent = remaining;
        if(remaining <= 5) display.style.background = 'red';
        if(remaining <= 0) {
            clearInterval(timerInterval);
            handleResult('skip');
        }
    }, 1000);
}
function stopTimer() { if(timerInterval) clearInterval(timerInterval); }

function resizeBoard() {
    const gameScreen = document.getElementById('game-screen');
    if(gameScreen.style.display === 'none') return;
    
    const h = window.innerHeight;
    const w = window.innerWidth;
    const scale = Math.min((w - 450) / 800, (h - 120) / 650);
    const container = document.getElementById('game-board-container');
    
    if(w < 768) {
        container.style.transform = `scale(${Math.min(w/850, 0.6)})`;
    } else {
        container.style.transform = `scale(${Math.max(0.4, Math.min(scale, 1.3))})`;
    }
}

// ===================== 7. تهيئة الأحداث (Event Listeners) =====================

document.addEventListener('DOMContentLoaded', () => {
    // تفعيل زر إضافة الأعضاء
    const addTeam1Btn = document.getElementById('add-team-1-member-button');
    if(addTeam1Btn) addTeam1Btn.onclick = () => {
        const input = document.createElement('input');
        input.placeholder = 'اسم العضو';
        input.className = 'member-input';
        document.getElementById('team-1-members-list').appendChild(input);
    };

    const addTeam2Btn = document.getElementById('add-team-2-member-button');
    if(addTeam2Btn) addTeam2Btn.onclick = () => {
        const input = document.createElement('input');
        input.placeholder = 'اسم العضو';
        input.className = 'member-input';
        document.getElementById('team-2-members-list').appendChild(input);
    };

    document.getElementById('start-game-button').onclick = startGame;
    document.getElementById('show-answer-button').onclick = () => {
        document.getElementById('answer-reveal-section').style.display = 'block';
        document.getElementById('show-answer-button').classList.add('hidden');
        playSound('sound-click');
    };

    // ربط أزرار التحكم
    document.getElementById('turn-correct-button').onclick = () => handleResult('turn_correct');
    document.getElementById('turn-wrong-button').onclick = () => handleResult('skip');
    document.getElementById('team-red-win-button').onclick = () => handleResult('red');
    document.getElementById('team-purple-win-button').onclick = () => handleResult('purple');
    document.getElementById('competitive-skip-button').onclick = () => handleResult('skip');

    // الخروج والتعليمات
    document.getElementById('exit-game-button').onclick = () => document.getElementById('exit-confirm-modal').classList.remove('hidden');
    document.getElementById('exit-confirm-yes').onclick = () => { stopTimer(); location.reload(); };
    document.getElementById('exit-confirm-no').onclick = () => document.getElementById('exit-confirm-modal').classList.add('hidden');
    document.getElementById('next-round-button').onclick = () => { document.getElementById('round-win-overlay').classList.add('hidden'); switchScreen('main-menu-screen'); };
    document.getElementById('instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.remove('hidden');
    document.getElementById('close-instructions-button').onclick = () => document.getElementById('instructions-modal-overlay').classList.add('hidden');
    document.getElementById('game-sound-toggle').onclick = toggleSound;

    // تبديل الأنماط في القائمة
    document.querySelectorAll('.mode-tab').forEach(btn => btn.onclick = (e) => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        gameSettings.teams = e.target.dataset.value;
        const isIndividual = gameSettings.teams === 'individual';
        
        document.getElementById('indiv-red').style.display = isIndividual ? 'block' : 'none';
        document.getElementById('team-red').style.display = isIndividual ? 'none' : 'block';
        document.getElementById('indiv-purple').style.display = isIndividual ? 'block' : 'none';
        document.getElementById('team-purple').style.display = isIndividual ? 'none' : 'block';
    });

    document.querySelectorAll('.pill-btn').forEach(btn => btn.onclick = (e) => {
        const setting = e.target.dataset.setting;
        document.querySelectorAll(`.pill-btn[data-setting="${setting}"]`).forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        gameSettings[setting] = e.target.dataset.value;
    });

    window.onresize = resizeBoard;
});

function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
    const pieces = [];
    const colors = ['#f1c40f', '#e74c3c', '#8e44ad', '#3498db'];
    
    for(let i=0; i<150; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            rotation: Math.random() * 360,
            scale: Math.random() * 0.5 + 0.5,
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
        if(document.getElementById('confetti-canvas').style.display !== 'none') {
            requestAnimationFrame(draw);
        }
    }
    draw();
}
