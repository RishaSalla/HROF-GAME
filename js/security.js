// --- العناصر (Elements) ---
const securityScreen = document.getElementById('security-screen');
const mainMenuScreen = document.getElementById('main-menu-screen');

const codeInput = document.getElementById('game-code-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('login-error-message');

// --- المتغيرات (Variables) ---
let validCodes = []; 

// --- الوظائف (Functions) ---

async function fetchValidCodes() {
    try {
        const response = await fetch('data/config.json');
        if (!response.ok) throw new Error();
        const config = await response.json();
        validCodes = config.valid_codes;
    } catch (error) {
        console.error('Error loading codes:', error);
        // كود احتياطي في حال فشل الملف
        validCodes = ["0000", "1234"]; 
    }
}

function checkLoginCode() {
    const enteredCode = codeInput.value.trim(); // إزالة المسافات الزائدة

    if (validCodes.includes(enteredCode)) {
        errorMessage.textContent = '';
        goToMainMenu();
    } else {
        errorMessage.textContent = 'الكود غير صحيح!';
        // اهتزاز
        securityScreen.classList.add('shake-animation');
        setTimeout(() => securityScreen.classList.remove('shake-animation'), 500);
    }
}

function goToMainMenu() {
    // 1. إخفاء شاشة الدخول تماماً (الحل الجذري للتعليق)
    securityScreen.style.opacity = '0';
    
    setTimeout(() => {
        securityScreen.classList.remove('active');
        securityScreen.style.display = 'none'; // إزالة من العرض
        
        // 2. إظهار القائمة الرئيسية
        mainMenuScreen.style.display = 'flex';
        setTimeout(() => mainMenuScreen.classList.add('active'), 50);
    }, 300); // انتظار 0.3 ثانية لجمالية الانتقال
}

// --- الأحداث ---
loginButton.addEventListener('click', checkLoginCode);

codeInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') checkLoginCode();
});

document.addEventListener('DOMContentLoaded', fetchValidCodes);
