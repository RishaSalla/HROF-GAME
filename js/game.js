// الكود 32: إصلاح شامل لملف منطق اللعبة
// هذا الملف يستخدم إطار عمل Phaser v3.80.1 لبناء لعبة الحروف السداسية (Arabic Hex Game).
// الهدف: التأكد من تحميل الأصول وعرض شريط النقاط وإنشاء الشبكة السداسية.

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 700;
const HEX_ASPECT_RATIO = 1.1547; // تقريباً (width / height) لـ hex_cell_default.png
const HEX_SIZE = 70; // حجم الخلية السداسية (الارتفاع)
const HEX_WIDTH = HEX_SIZE * HEX_ASPECT_RATIO;
const ROWS = 4;
const COLS = 6;
const CHARACTERS = [
    'ش', 'خ', 'غ', 'ق', 'ع', 'ح', 'أ', 'ب', 'ت', 'ث', 'ج', 'ح',
    'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع'
];

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.score = { team1: 0, team2: 0 };
        this.currentPlayer = 1;
    }

    // 1. تحميل الأصول (الصور والأصوات)
    preload() {
        console.log("Preloading assets...");
        
        // تحميل الصور
        this.load.image('background', 'assets/images/background.png');
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('hex_default', 'assets/images/hex_cell_default.png');
        this.load.image('hex_selected', 'assets/images/hex_cell_selected.png');
        this.load.image('hex_team1', 'assets/images/hex_cell_team1.png');
        this.load.image('hex_team2', 'assets/images/hex_cell_team2.png');
        this.load.image('turn_left', 'assets/images/turn_indicator_arrow_to_left.png');
        this.load.image('turn_right', 'assets/images/turn_indicator_arrow_to_right.png');
        this.load.image('connector_g_down', 'assets/images/connector_green_horizontal_down.png');
        this.load.image('connector_g_up', 'assets/images/connector_green_horizontal_upper.png');
        this.load.image('connector_r_left', 'assets/images/connector_red_vertical_left.png');
        this.load.image('connector_r_right', 'assets/images/connector_red_vertical_right.png');
        
        // تحميل الأصوات
        this.load.audio('beginning_game', 'assets/audio/Beginning_game.mp3');
        this.load.audio('flip_letter', 'assets/audio/Flip_letter.mp3');
        this.load.audio('winning', 'assets/audio/Winning.mp3');
        this.load.audio('correct_answer', 'assets/audio/correct_answer.mp3');
        this.load.audio('ui_click', 'assets/audio/ui_click.mp3');
        this.load.audio('wrong_answer', 'assets/audio/wrong_answer.mp3');
    }

    // 2. إنشاء عناصر اللعبة
    create() {
        console.log("Creating game elements...");

        // 2.1 إضافة الخلفية (التي تظهر حالياً)
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
        bg.displayWidth = GAME_WIDTH;
        bg.displayHeight = GAME_HEIGHT;

        // 2.2 إنشاء شريط النقاط وواجهة المستخدم العلوية
        this.createTopBar();

        // 2.3 إنشاء الشبكة السداسية المفقودة
        this.hexGrid = this.createHexGrid();
        
        // تشغيل صوت بداية اللعبة
        this.sound.play('beginning_game', { volume: 0.5 });
    }

    // 3. بناء شريط النقاط وشعارات الفرق
    createTopBar() {
        const barY = 50;
        const logoScale = 0.5;

        // الشعار في المنتصف
        const logo = this.add.image(GAME_WIDTH / 2, barY - 5, 'logo').setScale(logoScale);
        logo.setDepth(1); // تأكد من أنه فوق شريط النقاط

        // شريط النقاط الأسود (كخلفية للنقاط)
        const scoreBar = this.add.rectangle(GAME_WIDTH / 2, barY, GAME_WIDTH - 50, 60, 0x000000);
        scoreBar.setStrokeStyle(4, 0x00FF00); // إطار أخضر حول شريط النقاط
        scoreBar.setDepth(0);

        // مؤشر الدور (الأيسر للفريق الأول)
        this.turnIndicatorLeft = this.add.image(50, barY, 'turn_left').setScale(0.2).setInteractive();
        // مؤشر الدور (الأيمن للفريق الثاني)
        this.turnIndicatorRight = this.add.image(GAME_WIDTH - 50, barY, 'turn_right').setScale(0.2).setInteractive();

        // إعداد النصوص (باستخدام خط مناسب يدعم العربية)
        const textStyle = {
            fontFamily: 'Neo Sans Arabic, Arial', // يجب أن يتم تحميل هذا الخط في CSS/index.html
            fontSize: '24px',
            color: '#FFD700', // لون ذهبي للنصوص
            rtl: true // دعم الكتابة من اليمين لليسار
        };
        
        // نص الفريق الأول
        this.team1Text = this.add.text(this.turnIndicatorLeft.x + 150, barY - 20, 'الفريق الأول', textStyle).setOrigin(1, 0);
        this.score1Text = this.add.text(this.turnIndicatorLeft.x + 150, barY + 10, 'النقاط: 0', { ...textStyle, fontSize: '18px' }).setOrigin(1, 0);

        // نص الفريق الثاني
        this.team2Text = this.add.text(this.turnIndicatorRight.x - 150, barY - 20, 'الفريق الثاني', textStyle).setOrigin(0, 0);
        this.score2Text = this.add.text(this.turnIndicatorRight.x - 150, barY + 10, 'النقاط: 0', { ...textStyle, fontSize: '18px' }).setOrigin(0, 0);

        this.updateTurnIndicator(this.currentPlayer);
    }

    // 4. إنشاء الشبكة السداسية (الجزء المفقود)
    createHexGrid() {
        const grid = [];
        const startX = GAME_WIDTH / 2 - (COLS / 2) * HEX_WIDTH + HEX_WIDTH / 2;
        const startY = GAME_HEIGHT / 2 - (ROWS / 2) * HEX_SIZE + HEX_SIZE * 1.5;
        let charIndex = 0;

        for (let r = 0; r < ROWS; r++) {
            grid[r] = [];
            // تعويض الصفوف الفردية لإزاحة الخلايا
            const xOffset = (r % 2 === 1) ? HEX_WIDTH / 2 : 0; 
            
            for (let c = 0; c < COLS; c++) {
                if (charIndex < CHARACTERS.length) {
                    const x = startX + c * HEX_WIDTH + xOffset;
                    const y = startY + r * HEX_SIZE * 0.75; // 0.75 هو عامل الإزاحة العمودية للسداسي

                    // 4.1 إضافة صورة الخلية السداسية الافتراضية
                    const hexCell = this.add.image(x, y, 'hex_default').setScale(1.1); // تكبير قليل للوضوح
                    hexCell.setInteractive();
                    hexCell.setData({ row: r, col: c, char: CHARACTERS[charIndex], state: 'default' });

                    // 4.2 إضافة نص الحرف داخل الخلية
                    const hexText = this.add.text(x, y, CHARACTERS[charIndex], {
                        fontFamily: 'Neo Sans Arabic, Arial',
                        fontSize: '36px',
                        color: '#000000',
                        align: 'center',
                        rtl: true
                    }).setOrigin(0.5);

                    hexCell.data.set('textObject', hexText);

                    // 4.3 إعداد وظيفة النقر
                    hexCell.on('pointerdown', () => this.handleHexClick(hexCell));
                    
                    grid[r][c] = hexCell;
                    charIndex++;
                }
            }
        }
        console.log("Hexagonal grid created successfully.");
        return grid;
    }
    
    // 5. وظيفة معالجة النقر على الخلية
    handleHexClick(cell) {
        if (cell.getData('state') !== 'default') {
            console.log('Cell already taken.');
            this.sound.play('ui_click', { volume: 0.8 });
            return;
        }

        // هنا يمكنك إضافة منطق اختبار الإجابة (على سبيل المثال، إظهار شاشة السؤال)
        console.log(`Cell clicked: Row ${cell.getData('row')}, Col ${cell.getData('col')}, Char: ${cell.getData('char')}`);
        this.sound.play('flip_letter', { volume: 0.8 });
        
        // تغيير حالة الخلية مؤقتاً لعرضها كـ "محددة"
        cell.setTexture('hex_selected');
        cell.getData('textObject').setColor('#FFFFFF'); // تغيير لون النص
        cell.setData('state', 'selected');

        // في لعبة حقيقية، ستنتظر الآن إجابة المستخدم قبل تعيينها للفريق
        // لغرض الاختبار، سنفترض إجابة صحيحة ونعطيها للفريق الحالي
        setTimeout(() => this.assignCellToTeam(cell), 500);
    }
    
    // 6. تعيين الخلية للفريق
    assignCellToTeam(cell) {
        const teamTexture = this.currentPlayer === 1 ? 'hex_team1' : 'hex_team2';
        const teamColor = this.currentPlayer === 1 ? '#FFFFFF' : '#FFFFFF'; 

        cell.setTexture(teamTexture);
        cell.getData('textObject').setColor(teamColor);
        cell.setData('state', `team${this.currentPlayer}`);
        
        this.updateScore();
        this.switchTurn();
    }
    
    // 7. تحديث النقاط (للتجربة)
    updateScore() {
        // هذه وظيفة تجريبية بسيطة تزيد النقاط عشوائياً عند التعيين
        this.score[`team${this.currentPlayer}`] += 1; 
        
        this.score1Text.setText(`النقاط: ${this.score.team1}`);
        this.score2Text.setText(`النقاط: ${this.score.team2}`);
        
        this.sound.play('correct_answer', { volume: 0.5 });
    }
    
    // 8. تبديل الدور
    switchTurn() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateTurnIndicator(this.currentPlayer);
    }

    // 9. تحديث مؤشر الدور
    updateTurnIndicator(player) {
        if (player === 1) {
            this.turnIndicatorLeft.setAlpha(1);
            this.turnIndicatorRight.setAlpha(0.3);
            this.team1Text.setColor('#FFFFFF');
            this.team2Text.setColor('#FFD700');
        } else {
            this.turnIndicatorLeft.setAlpha(0.3);
            this.turnIndicatorRight.setAlpha(1);
            this.team1Text.setColor('#FFD700');
            this.team2Text.setColor('#FFFFFF');
        }
    }
    
    // 10. وظيفة التحديث (إذا لزم الأمر)
    update() {
        // المنطق الذي يتم تنفيذه في كل إطار (Frame)
    }
}

// تهيئة Phaser
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container', // تأكد من أن هذا يتطابق مع معرف DIV في index.html
    scene: MainScene,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    // إعدادات الخط الافتراضي لدعم الخطوط العربية
    callbacks: {
        postBoot: function (game) {
            game.canvas.style.fontFamily = 'Neo Sans Arabic, Arial';
        }
    }
};

new Phaser.Game(config);
