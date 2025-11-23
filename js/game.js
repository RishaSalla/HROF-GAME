// --- العناصر (Elements) ---
const turnIndicatorLeft = document.getElementById('turn-indicator-left');
const turnIndicatorRight = document.getElementById('turn-indicator-right');

// --- حالة المدير (Manager State) ---
const state = {
    currentPlayer: 'red', // البداية دائماً للأحمر
    gameMode: 'turns'
};

/**
 * 1. وظيفة بدء اللعبة
 */
function startGame(gameSettings) {
    state.gameMode = gameSettings.mode;
    state.currentPlayer = 'red'; // إعادة تعيين للأحمر عند بدء لعبة جديدة
    
    if (state.gameMode === 'competitive') {
        state.currentPlayer = 'all';
    }
    
    updateTurnIndicator();
}

/**
 * 2. وظيفة الانتقال للدور التالي (تبديل إجباري)
 * هذا يضمن التناوب المستمر: أحمر -> بنفسجي -> أحمر...
 */
function nextTurn() {
    // في الوضع التنافسي، الكل يلعب دائماً
    if (state.gameMode === 'competitive') {
        state.currentPlayer = 'all';
    } 
    // في وضع الأدوار، اقلب الدور دائماً
    else {
        if (state.currentPlayer === 'red') {
            state.currentPlayer = 'purple';
        } else {
            state.currentPlayer = 'red';
        }
    }

    updateTurnIndicator();
}

/**
 * 3. تحديث الأسهم (UI)
 */
function updateTurnIndicator() {
    turnIndicatorLeft.classList.remove('active');
    turnIndicatorRight.classList.remove('active');

    if (state.currentPlayer === 'red') {
        turnIndicatorLeft.classList.add('active'); // سهم اليسار للأحمر
    } else if (state.currentPlayer === 'purple') {
        turnIndicatorRight.classList.add('active'); // سهم اليمين للبنفسجي
    } else if (state.currentPlayer === 'all') {
        turnIndicatorLeft.classList.add('active');
        turnIndicatorRight.classList.add('active');
    }
}

/**
 * 4. معرفة من عليه الدور حالياً
 */
function getCurrentPlayer() {
    return state.currentPlayer;
}

// --- التصدير ---
export const TurnManager = {
    startGame,
    nextTurn,
    getCurrentPlayer 
};
