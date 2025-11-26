const turnIndicatorLeft = document.getElementById('turn-indicator-left');
const turnIndicatorRight = document.getElementById('turn-indicator-right');

const state = { currentPlayer: 'red', gameMode: 'turns' };

function startGame(gameSettings) {
    state.gameMode = gameSettings.mode;
    state.currentPlayer = 'red'; 
    if (state.gameMode === 'competitive') state.currentPlayer = 'all';
    updateTurnIndicator();
}

function nextTurn() {
    if (state.gameMode === 'competitive') {
        state.currentPlayer = 'all';
    } else {
        state.currentPlayer = (state.currentPlayer === 'red') ? 'purple' : 'red';
    }
    updateTurnIndicator();
}

function updateTurnIndicator() {
    turnIndicatorLeft.classList.remove('active');
    turnIndicatorRight.classList.remove('active');
    if (state.currentPlayer === 'red') turnIndicatorLeft.classList.add('active'); 
    else if (state.currentPlayer === 'purple') turnIndicatorRight.classList.add('active'); 
    else if (state.currentPlayer === 'all') { turnIndicatorLeft.classList.add('active'); turnIndicatorRight.classList.add('active'); }
}

function getCurrentPlayer() { return state.currentPlayer; }

export const TurnManager = { startGame, nextTurn, getCurrentPlayer };
