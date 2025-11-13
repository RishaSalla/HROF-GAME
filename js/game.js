// --- استيراد مدير الأدوار ---
import { TurnManager } from './turn_manager.js';

// --- العناصر (Elements) ---
const mainMenuScreen = document.getElementById('main-menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameBoardContainer = document.getElementById('game-board-container');

// عناصر القائمة الرئيسية
const settingButtons = document.querySelectorAll('.setting-button');
const startGameButton = document.getElementById('start-game-button');
const instructionsButton = document.getElementById('instructions-button');
const instructionsModalOverlay = document.getElementById('instructions-modal-overlay');
const closeInstructionsButton = document.getElementById('close-instructions-button');

// لوحات إعدادات الفرق
const individualSettingsPanel = document.getElementById('players-individual-settings');
const teamSettingsPanel = document.getElementById('players-team-settings');

// حقول "فردي"
const player1NameInput = document.getElementById('player-1-name-input');
const player2NameInput = document.getElementById('player-2-name-input');

// حقول "فريق"
const team1NameInput_team = document.getElementById('team-1-name-input-team');
const team2NameInput_team = document.getElementById('team-2-name-input-team');
const addTeam1MemberButton = document.getElementById('add-team-1-member-button');
const addTeam2MemberButton = document.getElementById('add-team-2-member-button');
const team1MembersList = document.getElementById('team-1-members-list');
const team2MembersList = document.getElementById('team-2-members-list');

// عناصر شاشة اللعبة
const rotateOverlay = document.getElementById('rotate-device-overlay');
const closeRotateOverlay = document.getElementById('close-rotate-overlay');
const exitGameButton = document.getElementById('exit-game-button');
const toggleThemeButton = document.getElementById('toggle-theme-button');

// عناصر نافذة السؤال
const questionModalOverlay = document.getElementById('question-modal-overlay');
const questionTimerDisplay = document.getElementById('question-timer');
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
const redScoreDisplay = document.getElementById('red-score');
const purpleScoreDisplay = document.getElementById('purple-score');
const redScoreboardName = document.querySelector('#team-red-scoreboard .team-name');
const purpleScoreboardName = document.querySelector('#team-purple-scoreboard .team-name');
const redButtonName = document.querySelector('#team-red-win-button .team-name-in-button');
const purpleButtonName = document.querySelector('#team-purple-win-button .team-name-in-button');

// عناصر شاشة الفوز
const roundWinOverlay = document.getElementById('round-win-overlay');
const winMessage = document.getElementById('win-message');
const winScorePurple = document.getElementById('win-score-purple');
const winScoreRed = document.getElementById('win-score-red');
const nextRoundButton = document.getElementById('next-round-button');

// عناصر نافذة تأكيد الخروج
const exitConfirmModal = document.getElementById('exit-confirm-modal');
const exitConfirmYes = document.getElementById('exit-confirm-yes');
const exitConfirmNo = document.getElementById('exit-confirm-no');

// --- إعدادات اللعبة ---
export const gameSettings = {
    mode: 'turns',
    teams: 'individual',
    timer: 'off',
    team1Name: 'اللاعب 1 (أحمر)',
    team2Name: 'اللاعب 2 (بنفسجي)',
    team1Members: [],
    team2Members: []
};

// --- متغيرات اللعبة ---
const questionCache = {};
let usedQuestions = {};
let currentClickedCell = null;
let currentQuestion = null;
let gameActive = true; 
let scores = { purple: 0, red: 0 };
let timerInterval = null; 
let remainingTime = 0; 

// --- قائمة الحروف ---
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

// --- هيكل اللوحة ---
const T = 'transparent'; 
const G = 'default';     
const R = 'red';         
const P = 'purple';      

const BOARD_LAYOUT = [
    [T, T, T, T, T, T, T, T, T],
    [T, T, R, R, R, R, R, R, T],
    [T, P, G, G, G, G, G, P, T],
    [T, P, G, G, G, G, G, P, T],
    [T, P, G, G, G, G, G, P, T],
    [T, P, G, G, G, G, G, P, T],
    [T, P, G, G, G, G, G, P, T],
    [T, T, R, R, R, R, R, R, T],
    [T, T, T, T, T, T, T, T, T]
];

// ===================== الوظائف =====================

function shuffleArray(array) {
    let newArray = [...array];
    for (let i = newArray.length-1; i>0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function loadUsedQuestions() {
    const stored = localStorage.getItem('hrof_used_questions');
    usedQuestions = stored ? JSON.parse(stored) : {};
}

function saveUsedQuestions() {
    localStorage.setItem('hrof_used_questions', JSON.stringify(usedQuestions));
}

function handleSettingClick(event) {
    const clickedButton = event.target;
    const settingType = clickedButton.dataset.setting;
    const settingValue = clickedButton.dataset.value;
    gameSettings[settingType] = settingValue;
    const buttonsInGroup = document.querySelectorAll(`.setting-button[data-setting="${settingType}"]`);
    buttonsInGroup.forEach(btn=>btn.classList.remove('active'));
    clickedButton.classList.add('active');

    if(settingType==='teams'){
        if(settingValue==='individual'){
            individualSettingsPanel.classList.remove('hidden');
            teamSettingsPanel.classList.add('hidden');
        } else {
            individualSettingsPanel.classList.add('hidden');
            teamSettingsPanel.classList.remove('hidden');
        }
    }
    validateSettings();
}

function startGame() {
    if(gameSettings.teams==='individual'){
        gameSettings.team1Name = player1NameInput.value || 'اللاعب 1 (أحمر)';
        gameSettings.team2Name = player2NameInput.value || 'اللاعب 2 (بنفسجي)';
    } else {
        gameSettings.team1Name = team1NameInput_team.value || 'الفريق الأحمر';
        gameSettings.team2Name = team2NameInput_team.value || 'الفريق البنفسجي';
        gameSettings.team1Members = Array.from(team1MembersList.querySelectorAll('input')).map(i=>i.value);
        gameSettings.team2Members = Array.from(team2MembersList.querySelectorAll('input')).map(i=>i.value);
    }

    mainMenuScreen.classList.remove('active');
    gameScreen.classList.add('active');

    redScoreboardName.textContent = gameSettings.team1Name;
    purpleScoreboardName.textContent = gameSettings.team2Name;
    redButtonName.textContent = gameSettings.team1Name;
    purpleButtonName.textContent = gameSettings.team2Name;

    scores = { purple:0, red:0 };
    updateScoreboard();
    loadUsedQuestions();
    startNewRound();
}

function startNewRound() {
    gameActive = true;
    roundWinOverlay.classList.add('hidden');
    initializeGameBoard();
    TurnManager.startGame({mode: gameSettings.mode});
}

function initializeGameBoard() {
    gameBoardContainer.innerHTML = '';
    const shuffledLetters = shuffleArray(ALL_LETTERS);
    const gameLetters = shuffledLetters.slice(0,25);
    let letterIndex = 0;

    BOARD_LAYOUT.forEach((rowData, r)=>{
        const row = document.createElement('div');
        row.classList.add('hex-row');

        rowData.forEach((cellType,c)=>{
            const cell = document.createElement('div');
            cell.classList.add('hex-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            switch(cellType){
                case R: cell.classList.add('hex-cell-red'); break;
                case P: cell.classList.add('hex-cell-purple'); break;
                case G:
                    cell.classList.add('hex-cell-default','playable');
                    if(letterIndex<gameLetters.length){
                        const letter = gameLetters[letterIndex];
                        cell.dataset.letterId = letter.id;
                        const span = document.createElement('span');
                        span.classList.add('hex-letter');
                        span.textContent = letter.char;
                        cell.appendChild(span);
                        letterIndex++;
                    }
                    cell.addEventListener('click', handleCellClick);
                    break;
                case T: cell.classList.add('hex-cell-transparent'); break;
            }
            row.appendChild(cell);
        });
        gameBoardContainer.appendChild(row);
    });
}

async function handleCellClick(event){
    if(!gameActive) return;
    const clickedCell = event.currentTarget;
    if(!clickedCell.classList.contains('playable')) return;

    currentClickedCell = clickedCell;
    const letterId = clickedCell.dataset.letterId;
    const question = await getQuestionForLetter(letterId);

    if(gameSettings.mode==='turns'){
        competitiveControls.classList.add('hidden');
        turnsControls.classList.remove('hidden');
    } else {
        competitiveControls.classList.remove('hidden');
        turnsControls.classList.add('hidden');
    }

    answerRevealSection.style.display = 'none';
    showAnswerButton.classList.remove('hidden');

    if(question){
        currentQuestion = question;
        questionText.textContent = question.question;
        answerText.textContent = question.answer;
        questionModalOverlay.classList.remove('hidden');
    } else {
        console.error(`لا يمكن جلب الأسئلة للملف: ${letterId}`);
        questionText.textContent = 'عذراً، حدث خطأ في جلب السؤال.';
        answerText.textContent = '...';
        questionModalOverlay.classList.remove('hidden');
    }

    if(gameSettings.timer!=='off'){
        startTimer(parseInt(gameSettings.timer));
    } else {
        questionTimerDisplay.classList.add('hidden');
    }
}

async function getQuestionForLetter(letterId){
    if(!questionCache[letterId]){
        try{
            const response = await fetch(`../data/questions/${letterId}.json`);
            if(!response.ok) throw new Error('ملف السؤال غير موجود');
            questionCache[letterId] = await response.json();
        } catch(err){ console.error(err); return null; }
    }
    const allQuestions = questionCache[letterId];
    if(!allQuestions || allQuestions.length===0) return null;
    let unused = [];
    allQuestions.forEach((q,i)=>{
        const qId = `${letterId}_q${i}`;
        if(!usedQuestions[qId]) unused.push({...q, id:qId});
    });
    if(unused.length===0){
        allQuestions.forEach((q,i)=> delete usedQuestions[`${letterId}_q${i}`]);
        saveUsedQuestions();
        unused = allQuestions.map((q,i)=>({...q,id:`${letterId}_q${i}`}));
    }
    const rand = Math.floor(Math.random()*unused.length);
    return unused[rand];
}

function showAnswer(){
    answerRevealSection.style.display = 'block';
    showAnswerButton.classList.add('hidden');
}

function handleQuestionResult(result){
    stopTimer();
    questionModalOverlay.classList.add('hidden');

    if(currentQuestion){
        usedQuestions[currentQuestion.id]=true;
        saveUsedQuestions();
    }

    let teamColor = null;
    if(result==='purple') teamColor='purple';
    else if(result==='red') teamColor='red';
    else if(result==='turn_correct') teamColor=TurnManager.getCurrentPlayer();

    if(teamColor){
        currentClickedCell.classList.remove('playable','hex-cell-default');
        currentClickedCell.classList.add(`hex-cell-${teamColor}-owned`);
        if(checkWinCondition(teamColor)){
            handleGameWin(teamColor);
            return;
        }
    }

    TurnManager.nextTurn(result);
    currentClickedCell=null;
    currentQuestion=null;
}

function getCell(r,c){
    return document.querySelector(`.hex-cell[data-row="${r}"][data-col="${c}"]`);
}

function getNeighbors(r,c){
    r=parseInt(r); c=parseInt(c);
    const isOdd = r%2!==0;
    let potential=[];
    if(isOdd){
        potential=[[r,c-1],[r,c+1],[r-1,c],[r-1,c+1],[r+1,c],[r+1,c+1]];
    } else{
        potential=[[r,c-1],[r,c+1],[r-1,c-1],[r-1,c],[r+1,c-1],[r+1,c]];
    }
    return potential.filter(([nr,nc])=>{
        return BOARD_LAYOUT[nr] && BOARD_LAYOUT[nr][nc]!==T && BOARD_LAYOUT[nr][nc]!==undefined;
    });
}

function checkWinCondition(teamColor){
    const visited = new Set();
    const queue = [];

    if(teamColor==='red'){
        for(let c=1;c<=6;c++){
            const cell = getCell(1,c);
            if(cell && cell.classList.contains('hex-cell-red-owned')){
                queue.push([1,c]);
                visited.add(`1,${c}`);
            }
        }
    } else {
        for(let r=2;r<=6;r++){
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

            const neighborCell=getCell(nr,nc);
            if(neighborCell && !visited.has(`${nr},${nc}`) &&
               neighborCell.classList.contains(`hex-cell-${teamColor}-owned`)){
                visited.add(`${nr},${nc}`);
                queue.push([nr,nc]);
            }
        }
    }

    return false;
}

function handleGameWin(teamColor){
    gameActive=false;
    stopTimer();
    scores[teamColor]++;
    updateScoreboard();
    winMessage.textContent=(teamColor==='red')?`${gameSettings.team1Name} فاز بالجولة!`:`${gameSettings.team2Name} فاز بالجولة!`;
    winScorePurple.textContent = scores.purple;
    winScoreRed.textContent = scores.red;
    roundWinOverlay.classList.remove('hidden');
}

function updateScoreboard(){
    redScoreDisplay.textContent=scores.red;
    purpleScoreDisplay.textContent=scores.purple;
}

function showExitConfirm(){ exitConfirmModal.classList.remove('hidden'); }
function confirmExit(){ exitConfirmModal.classList.add('hidden'); gameScreen.classList.remove('active'); mainMenuScreen.classList.add('active'); stopTimer(); }
function cancelExit(){ exitConfirmModal.classList.add('hidden'); }

function toggleTheme(){
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    const button=document.getElementById('toggle-theme-button');
    button.textContent=document.body.classList.contains('dark-mode')?'تبديل الوضع (فاتح)':'تبديل الوضع (غامق)';
}

function showInstructions(){ instructionsModalOverlay.classList.remove('hidden'); }
function hideInstructions(){ instructionsModalOverlay.classList.add('hidden'); }
function hideRotateMessage(){ rotateOverlay.style.display='none'; }
function checkDevice(){ if(!('ontouchstart' in window || navigator.maxTouchPoints>0)) rotateOverlay.style.display='none'; }

function startTimer(duration){
    remainingTime=duration;
    questionTimerDisplay.textContent=duration<10?`0${duration}`:duration;
    questionTimerDisplay.style.display='flex';
    timerInterval=setInterval(()=>{
        remainingTime--;
        questionTimerDisplay.textContent=remainingTime<10?`0${remainingTime}`:remainingTime;
        if(remainingTime<=0) handleQuestionResult('skip');
    },1000);
}

function stopTimer(){
    clearInterval(timerInterval);
    timerInterval=null;
    questionTimerDisplay.style.display='none';
}

function addMemberInput(team){
    const list=(team===1)?team1MembersList:team2MembersList;
    const container=document.createElement('div'); container.className='member-input-container';
    const input=document.createElement('input'); input.type='text';
    input.placeholder=`اسم العضو ${list.children.length+1}`;
    const removeBtn=document.createElement('button'); removeBtn.type='button'; removeBtn.className='remove-member-button'; removeBtn.textContent='X';
    removeBtn.onclick=()=>container.remove();
    container.appendChild(input); container.appendChild(removeBtn);
    list.appendChild(container);
}

function validateSettings(){
    let isValid=false;
    if(gameSettings.teams==='individual'){
        isValid=player1NameInput.value.trim()!=='' && player2NameInput.value.trim()!=='';
    } else{
        isValid=team1NameInput_team.value.trim()!=='' && team2NameInput_team.value.trim()!=='';
    }
    startGameButton.disabled=!isValid;
}

// ===================== ربط الأحداث =====================
document.addEventListener('DOMContentLoaded', checkDevice);

settingButtons.forEach(btn=>btn.addEventListener('click',handleSettingClick));
startGameButton.addEventListener('click',startGame);
nextRoundButton.addEventListener('click',startNewRound);
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
turnSkipButton.addEventListener('click',()=>handleQuestionResult('turn_skip'));
