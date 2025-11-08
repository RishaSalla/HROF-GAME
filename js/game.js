// js/game.js

// تعريف المتغيرات العامة اللازمة لاستدعائها من ملفات أخرى
let globalGameConfig = {};
let gameInstance = null;
let currentScene = null;

// تعريف دالة startGame التي يتم استدعاؤها من security.js بعد التحقق من الكود
startGame = function(config) {
    globalGameConfig = config; // حفظ الإعدادات التي تم قراءتها من config.json

    const phaserConfig = {
        type: Phaser.AUTO,
        width: 1280,       // عرض الشاشة المبدئي
        height: 720,       // طول الشاشة المبدئي
        parent: 'game-container', // يمكننا لاحقًا ربطها بـ DIV محدد
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        render: {
            pixelArt: true // **مهم جداً:** لضمان وضوح تصميم البكسل آرت
        },
        scale: {
            mode: Phaser.Scale.FIT, // لتعديل حجم اللعبة حسب حجم شاشة المتصفح
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };

    gameInstance = new Phaser.Game(phaserConfig);
    console.log("Phaser Game Instance Created. Ready for Preload.");
};

// ===================================================
// وظائف دورة حياة Phaser
// ===================================================

function preload() {
    // حفظ المشهد الحالي للوصول إليه من أي مكان
    currentScene = this; 
    
    // تحميل الخلفية
    this.load.image('background', 'assets/images/background.png');
    
    // تحميل ملفات الصوت الأساسية (الـ 6 ملفات)
    this.load.audio('ui_click', 'assets/audio/ui_click.mp3');
    this.load.audio('winning', 'assets/audio/Winning.mp3');
    this.load.audio('Beginning_game', 'assets/audio/Beginning_game.mp3'); 
    this.load.audio('Flip_letter', 'assets/audio/Flip_letter.mp3');
    this.load.audio('correct_answer', 'assets/audio/correct_answer.mp3');
    this.load.audio('wrong_answer', 'assets/audio/wrong_answer.mp3');
    
    // تحميل أصول الخلايا السداسية (Hex Cells)
    this.load.image('hex_cell_default', 'assets/images/hex_cell_default.png');
    this.load.image('hex_cell_team1', 'assets/images/hex_cell_team1.png'); // الأحمر
    this.load.image('hex_cell_team2', 'assets/images/hex_cell_team2.png'); // الأرجواني

    // تحميل أصول شريط النقاط ومؤشر الدور
    this.load.image('ui_scoreboard_bg', 'assets/images/ui_scoreboard_bg.png');
    this.load.image('turn_indicator_arrow_to_left', 'assets/images/turn_indicator_arrow_to_left.png');
    this.load.image('turn_indicator_arrow_to_right', 'assets/images/turn_indicator_arrow_to_right.png');
}

// ===================================================
// وظيفة معالجة النقر على الخلية
// ===================================================

function handleHexClick(cellData) {
    // هذه الدالة سيتم تطويرها لتظهر شاشة السؤال
    console.log(`Hex clicked at R${cellData.row}, C${cellData.col}. Content: ${cellData.content}`);
    
    if (cellData.state === 'default') {
        // مؤقتاً: نقوم بتلوين الخلية باللون الحالي للفريق
        const player = turnManager.getCurrentPlayer();
        const texture = (player === 1) ? 'hex_cell_team1' : 'hex_cell_team2';
        
        cellData.image.setTexture(texture);
        cellData.state = (player === 1) ? 'team1' : 'team2';

        // نبدل الدور مؤقتاً لغرض التجربة البصرية فقط
        // هذا السطر سيتغير لاحقاً ليحدث بعد الإجابة الصحيحة
        turnManager.switchTurn(); 
    }
}


// ===================================================
// وظيفة بناء الشبكة السداسية
// ===================================================

function buildHexGrid() {
    const scene = this;
    const gridData = [];
    
    // الأبعاد المعتمدة: (5x5 Grid)
    const HEX_WIDTH = 138;
    const HEX_HEIGHT = 160;
    
    // منطقة بدء الشبكة (تعديل طفيف لتوسيطها تحت شريط النقاط)
    const startX = 350; // تم تعديلها لتوسيط شبكة 5x5 على عرض 1280
    const startY = 200;

    const ROWS = 5;
    const COLS = 5;

    // الحروف/الأرقام الأولية (سيتم استخدامها لحين تحميل بيانات الأسئلة)
    const initialContent = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه']; // 25 حرف لـ 5x5
    let contentIndex = 0;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            
            // حساب الإزاحة للصفوف الفردية (للرص المتلاصق)
            const xOffset = (row % 2 === 1) ? HEX_WIDTH / 2 : 0;
            
            // حساب موقع الخلية
            const x = startX + col * HEX_WIDTH + xOffset;
            const y = startY + row * (HEX_HEIGHT * 0.75); // 0.75 لتقليل التداخل العمودي

            // 1. إنشاء الخلية السداسية (الصورة)
            const hexImage = scene.add.image(x, y, 'hex_cell_default').setInteractive();
            hexImage.setDisplaySize(HEX_WIDTH, HEX_HEIGHT);
            
            // 2. إنشاء النص العربي داخل الخلية
            const letter = initialContent[contentIndex++];
            const hexText = scene.add.text(x, y, letter, {
                fontFamily: 'Cairo',
                fontSize: '32px',
                color: '#111111', 
                rtl: true
            }).setOrigin(0.5);

            // 3. تخزين بيانات الخلية
            const cellData = {
                row: row,
                col: col,
                content: letter,
                state: 'default', // 'default', 'team1', 'team2'
                image: hexImage,
                text: hexText
            };
            gridData.push(cellData);

            // 4. تفعيل حدث النقر (يرتبط بالدالة handleHexClick المعرفة أعلاه)
            hexImage.on('pointerdown', () => {
                handleHexClick.call(scene, cellData);
            });
        }
    }

    // حفظ الشبكة للاستخدام لاحقاً (لمنطق الفوز)
    scene.data.set('hexGrid', gridData);
}


// ===================================================
// دالة Create (تجميع المكونات)
// ===================================================

function create() {
    // 1. تثبيت الأبعاد النهائية للشاشة
    this.game.scale.resize(1280, 720); 

    // 2. وضع الخلفية أولاً
    const centerX = this.game.config.width / 2;
    const centerY = this.game.config.height / 2;
    this.add.image(centerX, centerY, 'background').setDisplaySize(this.game.config.width, this.game.config.height);

    // ===================================================
    // 3. بناء واجهة المستخدم وشريط النقاط
    // ===================================================
    
    const scene = this;
    const gameWidth = scene.game.config.width;
    const padding = 50;
    const scoreboardY = 50;
    
    // خلفية شريط النقاط
    const scoreboardBG = scene.add.image(gameWidth / 2, scoreboardY, 'ui_scoreboard_bg');
    scoreboardBG.setDisplaySize(gameWidth - 100, 100); 

    // تصميم النص العربي 
    const textStyle = { 
        fontFamily: 'Cairo', 
        fontSize: '24px', 
        color: '#ffffff',
        rtl: true
    };

    // نص الفريق الأول وموقعه
    const team1X = padding + 150;
    const team1Text = scene.add.text(team1X, scoreboardY - 10, 'الفريق الأول', textStyle).setOrigin(0.5);
    const score1Text = scene.add.text(team1X, scoreboardY + 20, 'النقاط: 0', textStyle).setOrigin(0.5).setFontSize(18);

    // نص الفريق الثاني وموقعه
    const team2X = gameWidth - padding - 150;
    const team2Text = scene.add.text(team2X, scoreboardY - 10, 'الفريق الثاني', textStyle).setOrigin(0.5);
    const score2Text = scene.add.text(team2X, scoreboardY + 20, 'النقاط: 0', textStyle).setOrigin(0.5).setFontSize(18);

    // مؤشر الدور (السهم)
    const arrowLeft = scene.add.image(team1X - 80, scoreboardY, 'turn_indicator_arrow_to_left').setDisplaySize(64, 64);
    const arrowRight = scene.add.image(team2X + 80, scoreboardY, 'turn_indicator_arrow_to_right').setDisplaySize(64, 64);
    
    // وظيفة بسيطة لتحديث المؤشر البصري 
    turnManager.onTurnChange = (player) => {
        if (player === 1) {
            arrowLeft.setVisible(true);
            arrowRight.setVisible(false);
            team1Text.setColor('#ffcc00'); 
            team2Text.setColor('#ffffff');
        } else {
            arrowLeft.setVisible(false);
            arrowRight.setVisible(true);
            team1Text.setColor('#ffffff');
            team2Text.setColor('#ffcc00');
        }
    };
    
    // تطبيق الحالة الأولية للدور (الفريق 1 يبدأ)
    turnManager.onTurnChange(turnManager.getCurrentPlayer()); 
    
    // حفظ نصوص النقاط لتحديثها لاحقاً
    scene.data.set('scoreTexts', { 1: score1Text, 2: score2Text });

    // ===================================================
    // 4. استدعاء دالة بناء شبكة الهيكساجون (الآن)
    // ===================================================
    // هذا هو السطر الذي يجعل الشبكة تظهر عند تحميل اللعبة
    buildHexGrid.call(this); 

    console.log("Game Created. Scoreboard & Hex Grid Loaded.");
}

function update() {
    // تُستخدم للحركة والتحقق المستمر إذا لزم الأمر
}
