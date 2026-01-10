// js/security.js

// --- العناصر (Elements) ---
const securityScreen = document.getElementById('security-screen');
const mainMenuScreen = document.getElementById('main-menu-screen');

const codeInput = document.getElementById('game-code-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('login-error-message');

// --- المتغيرات (Variables) ---
let validHashes = []; 

// --- الوظائف (Functions) ---

async function fetchValidCodes() {
    try {
        // أضفنا ?t=وقت لمنع المتصفح من حفظ النسخة القديمة
        const response = await fetch(`data/config.json?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error();
        const config = await response.json();
        
        // جلب الهاشات (الشفرات) بدلاً من الأكواد المكشوفة
        // ندعم الاسمين لضمان العمل مهما كان المسمى في الملف
        validHashes = config.valid_hashes || config.valid_codes || [];
        
    } catch (error) {
        console.error('Error loading codes:', error);
        errorMessage.textContent = "خطأ في تحميل البيانات";
    }
}

async function checkLoginCode() {
    const enteredCode = codeInput.value.trim().toUpperCase(); // تنظيف وتكبير الحروف

    if (!enteredCode) {
        triggerError('الرجاء كتابة الكود');
        return;
    }

    errorMessage.textContent = "جاري التحقق...";

    try {
        // --- عملية التشفير (الجديدة) ---
        const msgBuffer = new TextEncoder().encode(enteredCode);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedInput = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // --- المقارنة ---
        if (validHashes.includes(hashedInput)) {
            // ✅ كود صحيح
            errorMessage.textContent = '';
            goToMainMenu();
        } else {
            // ❌ كود خاطئ
            triggerError('الكود غير صحيح!');
        }
    } catch (e) {
        console.error(e);
        triggerError('حدث خطأ فني');
    }
}

function triggerError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.color = 'red'; // تأكيد اللون الأحمر
    // تشغيل أنميشن الاهتزاز الذي صممته أنت
    securityScreen.classList.add('shake-animation');
    setTimeout(() => securityScreen.classList.remove('shake-animation'), 500);
}

function goToMainMenu() {
    // 1. إخفاء شاشة الدخول تماماً (كما طلبت سابقاً)
    securityScreen.style.opacity = '0';
    
    setTimeout(() => {
        securityScreen.classList.remove('active');
        securityScreen.style.display = 'none'; // إزالة من العرض
        
        // 2. إظهار القائمة الرئيسية
        mainMenuScreen.style.display = 'flex';
        setTimeout(() => mainMenuScreen.classList.add('active'), 50);
        
        // تشغيل صوت (اختياري إذا كان لديك في ملف HTML)
        const sound = document.getElementById('sound-click');
        if(sound) sound.play().catch(()=>{});
        
    }, 300); // نفس توقيتك للحفاظ على جمالية الانتقال
}

// --- الأحداث ---
// ملاحظة: جعلنا الوظيفة async لذلك لا نحتاج لتغيير الاستدعاء هنا
loginButton.addEventListener('click', checkLoginCode);

codeInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') checkLoginCode();
});

document.addEventListener('DOMContentLoaded', fetchValidCodes);
