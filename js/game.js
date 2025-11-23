import { TurnManager } from './turn_manager.js';

const mainMenuScreen = document.getElementById('main-menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameBoardContainer = document.getElementById('game-board-container');

const settingButtons = document.querySelectorAll('.setting-button');
const startGameButton = document.getElementById('start-game-button');
const instructionsButton = document.getElementById('instructions-button');
const instructionsModalOverlay = document.getElementById('instructions-modal-overlay');
const closeInstructionsButton = document.getElementById('close-instructions-button');

const individualSettingsPanel = document.getElementById('players-individual-settings');
const teamSettingsPanel = document.getElementById('players-team-settings');
const player1NameInput = document.getElementById('player-1-name-input');
const player2NameInput = document.getElementById('player-2-name-input');
const team1NameInput_team = document.getElementById('team-1-name-input-team');
const team2NameInput_team = document.getElementById('team-2-name-input-team');
const addTeam1MemberButton = document.getElementById('add-team-1-member-button');
const addTeam2MemberButton = document.getElementById('add-team-2-member-button');
const team1MembersList = document.getElementById('team-1-members-list');
const team2MembersList = document.getElementById('team-2-members-list');

const rotateOverlay = document.getElementById('rotate-device-overlay');
const closeRotateOverlay = document.getElementById('close-rotate-overlay');
const exitGameButton = document.getElementById('exit-game-button');
const toggleThemeButton = document.getElementById('toggle-theme-button');

const questionModalOverlay = document.getElementById('question-modal-overlay');
const questionTimerDisplay = document.getElementById('question-timer');
const questionText = document.getElementById('question-text');
const questionCharDisplay = document.getElementById('question-char-display');
const showAnswerButton = document.getElementById('show-answer-button');
const answerRevealSection = document.getElementById('answer-reveal-section');
const answerText = document.getElementById('answer-text');

const competitiveControls = document.getElementById('competitive-controls');
const turnsControls = document.getElementById('turns-controls');
const turnsStatusText = document.getElementById('turns-status-text');
const teamPurpleWinButton = document.getElementById('team-purple-win-button');
const teamRedWinButton = document.getElementById('team-red-win-button');
const competitiveSkipButton = document.getElementById('competitive-skip-button');
const turnCorrectButton = document.getElementById('turn-correct-button');
const turnWrongButton = document.getElementById('turn-wrong-button');

const redScoreDisplay = document.getElementById('red-score');
const purpleScoreDisplay = document.getElementById('purple-score');
const redScoreboardName = document.querySelector('#team-red-scoreboard .team-name');
const purpleScoreboardName = document.querySelector('#team-purple-scoreboard .team-name');
const redButtonName = document.querySelector('#team-red-win-button .team-name-in-button');
const purpleButtonName = document.querySelector('#team-purple-win-button .team-name-in-button');

const roundWinOverlay = document.getElementById('round-win-overlay');
const winMessage = document.getElementById('win-message');
const winScorePurple = document.getElementById('win-score-purple');
const winScoreRed = document.getElementById('win-score-red');
const nextRoundButton = document.getElementById('next-round-button');

const exitConfirmModal = document.getElementById('exit-confirm-modal');
const exitConfirmYes = document.getElementById('exit-confirm-yes');
const exitConfirmNo = document.getElementById('exit-confirm-no');

const soundStart = document.getElementById('sound-start');
const soundFlip = document.getElementById('sound-flip');
const soundWin = document.getElementById('sound-win');
const soundCorrect = document.getElementById('sound-correct');
const soundClick = document.getElementById('sound-click');
const soundWrong = document.getElementById('sound-wrong');

export const gameSettings = { mode: 'turns', teams: 'individual', timer: 'off', team1Name: 'اللاعب 1 (أحمر)', team2Name: 'اللاعب 2 (بنفسجي)', team1Members: [], team2Members: [] };

const questionCache = {};
let usedQuestions = {};
let currentClickedCell = null;
let currentQuestion = null;
let gameActive = true;
let scores = { purple: 0, red: 0 }; 
const WINNING_SCORE = 1; 
let timerInterval = null;
let remainingTime = 0;
let isStealPhase = false; 

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

function resizeBoard() {
    if (!gameScreen.classList.contains('active')) return;
    const boardWidth = 800; const boardHeight = 650; 
    const headerHeight = document.querySelector('.game-header').offsetHeight || 100;
    const footerHeight = document.querySelector('.game-controls').offsetHeight || 80;
    const verticalPadding = 40; 
    const availableWidth = window.innerWidth * 0.95; 
    const availableHeight = window.innerHeight - headerHeight - footerHeight - verticalPadding;
    const scaleX = availableWidth / boardWidth; const scaleY = availableHeight / boardHeight;
    let scale = Math.min(scaleX, scaleY);
    if (scale > 1.3) scale = 1.3; if (scale < 0.3) scale = 0.3; 
    gameBoardContainer.style.transform = `scale(${scale})`;
}

function playSound(audioElement) {
    if (audioElement) { audioElement.currentTime = 0; audioElement.play().catch(e => console.log('Audio playback failed:', e)); }
}

function shuffleArray(array) {
    let newArray = [...array]; for (let i = newArray.length-1; i>0; i--){ const j = Math.floor(Math.random() * (i+1)); [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; } return newArray;
}

function loadUsedQuestions() { const stored = localStorage.getItem('hrof_used_questions'); usedQuestions = stored ? JSON.parse(stored) : {}; }
function saveUsedQuestions() { localStorage.setItem('hrof_used_questions', JSON.stringify(usedQuestions)); }

function handleSettingClick(event) {
    playSound(soundClick); const clickedButton = event.target;
    const settingType = clickedButton.dataset.setting; const settingValue = clickedButton.dataset.value;
    gameSettings[settingType] = settingValue;
    const buttonsInGroup = document.querySelectorAll(`.setting-button[data-setting="${settingType}"]`);
    buttonsInGroup.forEach(btn=>btn.classList.remove('active')); clickedButton.classList.add('active');
    if(settingType==='teams'){
        if(settingValue==='individual'){ individualSettingsPanel.classList.remove('hidden'); teamSettingsPanel.classList.add('hidden'); } 
        else { individualSettingsPanel.classList.add('hidden'); teamSettingsPanel.classList.remove('hidden'); }
    }
    validateSettings();
}

function startGame() {
    playSound(soundStart);
    if(gameSettings.teams==='individual'){ gameSettings.team1Name = player1NameInput.value || 'اللاعب 1 (أحمر)'; gameSettings.team2Name = player2NameInput.value || 'اللاعب 2 (بنفسجي)'; } 
    else { gameSettings.team1Name = team1NameInput_team.value || 'الفريق الأحمر'; gameSettings.team2Name = team2NameInput_team.value || 'الفريق البنفسجي'; gameSettings.team1Members = Array.from(team1MembersList.querySelectorAll('input')).map(i=>i.value); gameSettings.team2Members = Array.from(team2MembersList.querySelectorAll('input')).map(i=>i.value); }
    mainMenuScreen.classList.remove('active'); gameScreen.classList.add('active');
    redScoreboardName.textContent = gameSettings.team1Name; purpleScoreboardName.textContent = gameSettings.team2Name;
    redButtonName.textContent = gameSettings.team1Name; purpleButtonName.textContent = gameSettings.team2Name;
    scores = { purple:0, red:0 }; updateScoreboard(); loadUsedQuestions(); startNewRound();
    setTimeout(() => { resizeBoard(); }, 100); window.addEventListener('resize', resizeBoard);
}

function startNewRound() {
    gameActive = true; roundWinOverlay.classList.add('hidden');
    if (scores.red >= WINNING_SCORE || scores.purple >= WINNING_SCORE) { scores = { purple:0, red:0 }; updateScoreboard(); }
    initializeGameBoard(); TurnManager.startGame({mode: gameSettings.mode}); resizeBoard();
}

function initializeGameBoard() {
    gameBoardContainer.innerHTML = ''; const shuffledLetters = shuffleArray(ALL_LETTERS); const gameLetters = shuffledLetters.slice(0,25); let letterIndex = 0;
    BOARD_LAYOUT.forEach((rowData, r)=>{
        const row = document.createElement('div'); row.classList.add('hex-row');
        rowData.forEach((cellType,c)=>{
            const cell = document.createElement('div'); cell.classList.add('hex-cell'); cell.dataset.row = r; cell.dataset.col = c;
            switch(cellType){
                case R: cell.classList.add('hex-cell-red'); break; case P: cell.classList.add('hex-cell-purple'); break;
                case G:
                    cell.classList.add('hex-cell-default','playable');
                    if(letterIndex<gameLetters.length){
                        const letterData = gameLetters[letterIndex]; cell.dataset.letterId = letterData.id; cell.dataset.letterName = letterData.name;
                        const span = document.createElement('span'); span.classList.add('hex-letter'); span.textContent = letterData.char; cell.appendChild(span); letterIndex++;
                    }
                    cell.addEventListener('click', handleCellClick); break;
                case T: cell.classList.add('hex-cell-transparent'); break;
            }
            row.appendChild(cell);
        });
        gameBoardContainer.appendChild(row);
    });
}

async function handleCellClick(event){
    if(!gameActive) return; const clickedCell = event.currentTarget;
    if(!clickedCell.classList.contains('playable')) return;
    
    // التحقق من أن الخلية تنتمي للاعب صاحب الدور (في وضع الأدوار فقط)
    if (gameSettings.mode === 'turns') {
        const currentPlayer = TurnManager.getCurrentPlayer();
        // (ملاحظة: يمكنك إلغاء هذا الشرط إذا كنت تريد السماح بالنقر على أي خلية، 
        // لكن المنطق السليم يقتضي أن الأحمر يضغط فقط في دوره، إلا إذا أردت حرية كاملة للحكم)
    }

    playSound(soundFlip); currentClickedCell = clickedCell;
    questionCharDisplay.textContent = clickedCell.dataset.letterName;
    const letterId = clickedCell.dataset.letterId; const question = await getQuestionForLetter(letterId);
    isStealPhase = false; 

    if(gameSettings.mode==='turns'){
        competitiveControls.classList.add('hidden'); turnsControls.classList.remove('hidden');
        turnsStatusText.textContent = "هل تمت الإجابة بشكل صحيح؟"; turnsStatusText.style.color = "var(--color-dark-bg)";
        turnCorrectButton.textContent = "نعم، إجابة صحيحة"; turnWrongButton.textContent = "لا، إجابة خاطئة";
    } else { competitiveControls.classList.remove('hidden'); turnsControls.classList.add('hidden'); }

    answerRevealSection.style.display = 'none'; showAnswerButton.classList.remove('hidden');
    if(question){ currentQuestion = question; questionText.textContent = question.question; answerText.textContent = question.answer; questionModalOverlay.classList.remove('hidden'); } 
    else { questionText.textContent = 'حدث خطأ في جلب السؤال.'; questionModalOverlay.classList.remove('hidden'); }
    if(gameSettings.timer!=='off'){ startTimer(parseInt(gameSettings.timer)); } else { questionTimerDisplay.classList.add('hidden'); }
}

async function getQuestionForLetter(letterId){
    if(!questionCache[letterId]){
        try{ const response = await fetch(`data/questions/${letterId}.json`); if(!response.ok) throw new Error(); questionCache[letterId] = await response.json(); } catch(err){ return null; }
    }
    const allQuestions = questionCache[letterId]; if(!allQuestions) return null;
    let unused = allQuestions.filter((q,i)=>!usedQuestions[`${letterId}_q${i}`]);
    if(unused.length===0){ allQuestions.forEach((q,i)=> delete usedQuestions[`${letterId}_q${i}`]); saveUsedQuestions(); unused = allQuestions.map((q,i)=>({...q,id:`${letterId}_q${i}`})); }
    const rand = Math.floor(Math.random()*unused.length); const q = unused[rand]; return {...q, id: `${letterId}_q${allQuestions.indexOf(q)}`}; 
}

function showAnswer(){ playSound(soundClick); answerRevealSection.style.display = 'block'; showAnswerButton.classList.add('hidden'); }

function handleQuestionResult(result){
    stopTimer();
    if (gameSettings.mode === 'competitive') { processResult(result); return; }
    if (result === 'turn_correct') {
        if (!isStealPhase) { processResult('turn_correct'); } else { processResult('steal_success'); }
    } else if (result === 'turn_wrong') {
        if (!isStealPhase) {
            isStealPhase = true; playSound(soundWrong);
            turnsStatusText.textContent = "🔥 فرصة سرقة للفريق الآخر! 🔥"; turnsStatusText.style.color = "var(--color-red)";
            turnCorrectButton.textContent = "سرقة ناجحة ✅"; turnWrongButton.textContent = "فشل السرقة ❌";
        } else { processResult('steal_fail'); }
    }
}

function processResult(finalResult) {
    questionModalOverlay.classList.add('hidden');
    if(currentQuestion){ usedQuestions[currentQuestion.id]=true; saveUsedQuestions(); }
    let teamColor = null; let isCorrect = false;
    if (finalResult === 'purple') { teamColor = 'purple'; isCorrect = true; }
    else if (finalResult === 'red') { teamColor = 'red'; isCorrect = true; }
    else if (finalResult === 'turn_correct') { teamColor = TurnManager.getCurrentPlayer(); isCorrect = true; }
    else if (finalResult === 'steal_success') { teamColor = (TurnManager.getCurrentPlayer() === 'red') ? 'purple' : 'red'; isCorrect = true; }

    if (isCorrect) playSound(soundCorrect); else playSound(soundWrong);
    if (teamColor) {
        currentClickedCell.classList.remove('playable','hex-cell-default'); currentClickedCell.classList.add(`hex-cell-${teamColor}-owned`);
        const winningPath = checkWinCondition(teamColor);
        if(winningPath){ handleGameWin(teamColor, winningPath); return; }
    }
    checkDrawCondition(); TurnManager.nextTurn(); currentClickedCell=null; currentQuestion=null;
}

function checkDrawCondition() {
    const playableCells = document.querySelectorAll('.hex-cell.playable');
    if (playableCells.length === 0 && gameActive) { gameActive = false; winMessage.textContent = "تعادل! انتهت الجولة بلا فائز"; roundWinOverlay.classList.remove('hidden'); playSound(soundWrong); }
}

function getCell(r,c){ return document.querySelector(`.hex-cell[data-row="${r}"][data-col="${c}"]`); }
function getNeighbors(r,c){
    r=parseInt(r); c=parseInt(c); const isOdd = r%2!==0; 
    let potential = isOdd ? [[r,c-1],[r,c+1],[r-1,c-1],[r-1,c],[r+1,c-1],[r+1,c]] : [[r,c-1],[r,c+1],[r-1,c],[r-1,c+1],[r+1,c],[r+1,c+1]];
    return potential.filter(([nr,nc])=>{ const cellType = BOARD_LAYOUT[nr] ? BOARD_LAYOUT[nr][nc] : undefined; return (cellType !== undefined && cellType !== T); });
}

function checkWinCondition(teamColor){
    const visited = new Set(); const queue = []; const parentMap = new Map();
    if(teamColor==='red'){ for(let c=2;c<=6;c++) if(getCell(2,c)?.classList.contains('hex-cell-red-owned')) { queue.push([2,c]); visited.add(`2,${c}`); parentMap.set(`2,${c}`, null); } } 
    else { for(let r=2;r<=6;r++) if(getCell(r,6)?.classList.contains('hex-cell-purple-owned')) { queue.push([r,6]); visited.add(`${r},6`); parentMap.set(`${r},6`, null); } }

    while(queue.length>0){
        const [r,c] = queue.shift(); const currentKey = `${r},${c}`;
        for(const [nr,nc] of getNeighbors(r,c)){
            const neighborKey = `${nr},${nc}`; const nCell = getCell(nr, nc);
            let won = (teamColor==='red' && nr===7 && BOARD_LAYOUT[nr][nc]===R) || (teamColor==='purple' && nc===1 && BOARD_LAYOUT[nr][nc]===P);
            if (won) { const path = []; let curr = currentKey; while (curr) { path.push(curr); curr = parentMap.get(curr); } return path; }
            if(nCell && !visited.has(neighborKey) && nCell.classList.contains(`hex-cell-${teamColor}-owned`)){ visited.add(neighborKey); parentMap.set(neighborKey, currentKey); queue.push([nr,nc]); }
        }
    } return null;
}

function handleGameWin(teamColor, winningPath){
    playSound(soundWin); gameActive=false; stopTimer(); questionModalOverlay.classList.add('hidden');
    if (winningPath) winningPath.forEach(c => getCell(...c.split(',')).classList.add('winning-path-cell'));
    scores[teamColor]++; updateScoreboard();
    if (scores[teamColor] >= WINNING_SCORE) { winMessage.textContent = `🏆 مبروك! ${teamColor==='red'?gameSettings.team1Name:gameSettings.team2Name} فاز بالمباراة! 🏆`; nextRoundButton.textContent = "ابدأ مباراة جديدة"; } 
    else { winMessage.textContent = `${teamColor==='red'?gameSettings.team1Name:gameSettings.team2Name} فاز بالجولة!`; nextRoundButton.textContent = "ابدأ الجولة التالية"; }
    winScorePurple.textContent = scores.purple; winScoreRed.textContent = scores.red;
    setTimeout(() => { roundWinOverlay.classList.remove('hidden'); playSound(soundClick); }, 1500);
}

function updateScoreboard(){ redScoreDisplay.textContent=scores.red; purpleScoreDisplay.textContent=scores.purple; }
function showExitConfirm(){ playSound(soundClick); exitConfirmModal.classList.remove('hidden'); }
function confirmExit(){ playSound(soundClick); exitConfirmModal.classList.add('hidden'); gameScreen.classList.remove('active'); mainMenuScreen.classList.add('active'); stopTimer(); }
function cancelExit(){ playSound(soundClick); exitConfirmModal.classList.add('hidden'); }
function toggleTheme(){ playSound(soundClick); document.body.classList.toggle('dark-mode'); document.body.classList.toggle('light-mode'); }
function showInstructions(){ playSound(soundClick); instructionsModalOverlay.classList.remove('hidden'); }
function hideInstructions(){ playSound(soundClick); instructionsModalOverlay.classList.add('hidden'); }
function hideRotateMessage(){ rotateOverlay.style.display='none'; }
function checkDevice(){ if(!('ontouchstart' in window || navigator.maxTouchPoints>0)) rotateOverlay.style.display='none'; }

function startTimer(duration){
    stopTimer(); remainingTime = duration;
    questionTimerDisplay.style.display = 'flex'; questionTimerDisplay.classList.remove('hidden');
    questionTimerDisplay.textContent = duration < 10 ? `0${duration}` : duration;
    questionTimerDisplay.style.backgroundColor = 'var(--color-yellow)'; questionTimerDisplay.style.color = 'var(--color-dark-bg)';
    timerInterval = setInterval(() => {
        remainingTime--; questionTimerDisplay.textContent = remainingTime < 10 ? `0${remainingTime}` : remainingTime;
        if(remainingTime <= 5) { questionTimerDisplay.style.backgroundColor = 'var(--color-red)'; questionTimerDisplay.style.color = 'white'; }
        if(remainingTime <= 0) { stopTimer(); if(gameSettings.mode === 'turns') handleQuestionResult('turn_wrong'); else handleQuestionResult('skip'); }
    }, 1000);
}
function stopTimer(){ if(timerInterval) { clearInterval(timerInterval); timerInterval = null; } questionTimerDisplay.style.display = 'none'; }
function addMemberInput(team){
    playSound(soundClick); const list=(team===1)?team1MembersList:team2MembersList;
    const div=document.createElement('div'); div.className='member-input-container';
    div.innerHTML=`<input type="text" placeholder="اسم العضو ${list.children.length+1}"><button type="button" class="remove-member-button">X</button>`;
    div.querySelector('button').onclick=()=>{playSound(soundClick); div.remove();}; list.appendChild(div);
}
function validateSettings(){ startGameButton.disabled = (gameSettings.teams==='individual') ? !(player1NameInput.value.trim() && player2NameInput.value.trim()) : !(team1NameInput_team.value.trim() && team2NameInput_team.value.trim()); }

document.addEventListener('DOMContentLoaded', checkDevice);
settingButtons.forEach(btn=>btn.addEventListener('click',handleSettingClick));
startGameButton.addEventListener('click',startGame);
nextRoundButton.addEventListener('click',()=>{ playSound(soundClick); startNewRound(); });
instructionsButton.addEventListener('click',showInstructions);
closeInstructionsButton.addEventListener('click',hideInstructions);
exitGameButton.addEventListener('click',showExitConfirm);
toggleThemeButton.addEventListener('click',toggleTheme);
closeRotateOverlay.addEventListener('click',hideRotateMessage);
exitConfirmYes.addEventListener('click',confirmExit);
exitConfirmNo.addEventListener('click',cancelExit);
addTeam1MemberButton.addEventListener('click',()=>addMemberInput(1));
addTeam2MemberButton.addEventListener('click',()=>addMemberInput(2));
player1NameInput.addEventListener('input',validateSettings);
player2NameInput.addEventListener('input',validateSettings);
team1NameInput_team.addEventListener('input',validateSettings);
team2NameInput_team.addEventListener('input',validateSettings);
validateSettings();
showAnswerButton.addEventListener('click',showAnswer);
teamPurpleWinButton.addEventListener('click',()=>handleQuestionResult('purple'));
teamRedWinButton.addEventListener('click',()=>handleQuestionResult('red'));
competitiveSkipButton.addEventListener('click',()=>handleQuestionResult('skip'));
turnCorrectButton.addEventListener('click',()=>handleQuestionResult('turn_correct'));
turnWrongButton.addEventListener('click',()=>handleQuestionResult('turn_wrong'));
window.addEventListener('resize', resizeBoard);
