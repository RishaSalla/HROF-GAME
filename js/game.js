// --- العناصر (Elements) ---
const mainMenuScreen = document.getElementById('main-menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameBoardContainer = document.getElementById('game-board-container'); // <-- جديد

const settingButtons = document.querySelectorAll('.setting-button');
const startGameButton = document.getElementById('start-game-button');

// --- إعدادات اللعبة (Game Settings) ---
export const gameSettings = {
    mode: 'turns',      // 'turns' (أدوار) or 'competitive' (تنافسي)
    teams: '2p',        // '2p' (لاعبين) or 'full' (فرق)
    timer: 'off'        // 'on' or 'off'
};

// --- الوظائف (Functions) ---

/**
 * 1. معالجة الضغط على أزرار الإعدادات
 */
function handleSettingClick(event) {
    const clickedButton = event.target;
    const settingType = clickedButton.dataset.setting; // 'mode', 'teams', or 'timer'
    const settingValue = clickedButton.dataset.value;  // 'turns', 'competitive', etc.

    gameSettings[settingType] = settingValue;
    console.log('الإعدادات المحدثة:', gameSettings);

    const buttonsInGroup = document.querySelectorAll(`.setting-button[data-setting="${settingType}"]`);
    buttonsInGroup.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
}

/**
 * 2. وظيفة بدء اللعبة (الانتقال للشاشة التالية)
 */
function startGame() {
    mainMenuScreen.classList.remove('active');
    gameScreen.classList.add('active');

    // 3. استدعاء وظيفة بناء لوحة اللعب
    initializeGameBoard(); // <-- جديد
}

/**
 * 3. وظيفة بناء لوحة اللعب السداسية (جديدة)
 */
function initializeGameBoard() {
    // 1. تفريغ اللوحة (مهم للجولات الجديدة)
    gameBoardContainer.innerHTML = '';

    // 2. بناء اللوحة (7 أعمدة، كل عمود به 7 خلايا)
    for (let col = 0; col < 7; col++) {
        const column = document.createElement('div');
        column.classList.add('hex-column');
        
        for (let row = 0; row < 7; row++) {
            const cell = document.createElement('div');
            cell.classList.add('hex-cell');
            
            // إضافة بيانات لموقع الخلية
            cell.dataset.row = row;
            cell.dataset.col = col;

            // 3. تحديد نوع الخلية بناءً على موقعها (حسب التصميم 17.jpg)
            if ((row === 0 || row === 6) && (col === 0 || col === 6)) {
                // الزوايا الأربع
                cell.classList.add('hex-cell-selected');
            } else if ((row === 0 || row === 6) && (col > 0 && col < 6)) {
                // الموصلات الحمراء (أعلى وأسفل)
                cell.classList.add('hex-cell-red');
            } else if ((row > 0 && row < 6) && (col === 0 || col === 6)) {
                // الموصلات البنفسجية (يمين ويسار)
                cell.classList.add('hex-cell-purple');
            } else {
                // الخلايا الرمادية في المنتصف (5x5)
                cell.classList.add('hex-cell-default', 'playable');
                // (مستقبلاً) سنضع الحروف هنا
            }

            column.appendChild(cell);
        }
        gameBoardContainer.appendChild(column);
    }
}


// --- ربط الأحداث (Event Listeners) ---
settingButtons.forEach(button => {
    button.addEventListener('click', handleSettingClick);
});

startGameButton.addEventListener('click', startGame);
