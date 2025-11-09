// js/security.js - الكود 36 (تفعيل مشهد المقدمة)

// دالة لجلب إعدادات اللعبة من ملف config.json
async function loadConfig() {
    try {
        const response = await fetch('data/config.json');
        if (!response.ok) {
            console.error("Critical Error: config.json failed to load with status:", response.status);
            // استبدال alert بـ عرض رسالة خطأ في الواجهة
            document.getElementById('code-entry-message').textContent = "فشل تحميل ملف الإعدادات. تأكد من وجوده في data/config.json.";
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Critical Error fetching config.json:", error);
        document.getElementById('code-entry-message').textContent = "خطأ أثناء قراءة ملف الإعدادات.";
        return null;
    }
}

// دالة بدء اللعبة (تم تحديثها لبدء مشهد المقدمة)
function startIntroScene(config) {
    globalGameConfig = config;

    const phaserConfig = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        parent: 'game-container',
        // سيتم إضافة المشاهد IntroScene و MainScene في game.js
        scene: [IntroScene, MainScene], 
        render: { pixelArt: true },
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
    };

    gameInstance = new Phaser.Game(phaserConfig);
    console.log("Phaser Game Instance Created with IntroScene config.");
}

// دالة التحقق وعرض الشاشة
async function handleSecurity() {
    const config = await loadConfig();

    if (!config) {
        // إذا فشل تحميل الإعدادات، نوقف العملية
        return; 
    }
    
    // الكود السري من ملف الإعدادات
    const correctCode = config.security.test_code;

    const container = document.getElementById('code-entry-container');
    const input = document.getElementById('secret-code-input');
    const button = document.getElementById('code-entry-button');
    const message = document.getElementById('code-entry-message');
    
    // إظهار شاشة الحماية
    container.style.display = 'flex';
    
    button.onclick = () => {
        if (input.value === correctCode) {
            container.remove(); // إزالة الحاوية بالكامل من الـ DOM
            startIntroScene(config); // بدء اللعبة (الآن تبدأ مشهد المقدمة)
        } else {
            message.textContent = 'الكود خاطئ. حاول مرة أخرى.';
            input.value = '';
        }
    };
}

// البدء بعملية التحقق فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', handleSecurity);
