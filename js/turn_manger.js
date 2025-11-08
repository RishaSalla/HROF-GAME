// js/turn_manager.js

class TurnManager {
    constructor() {
        this.currentPlayer = 1; // الفريق الأول يبدأ اللعب
        this.teamScores = { 1: 0, 2: 0 }; // لتخزين نقاط الفريقين
        this.onTurnChange = null; // وظيفة callback لإبلاغ واجهة المستخدم بتغير الدور
    }

    getCurrentPlayer() {
        // يعيد رقم الفريق الحالي (1 أو 2)
        return this.currentPlayer;
    }

    addScore(points) {
        // يضيف نقاط للفريق الحالي
        this.teamScores[this.currentPlayer] += points;
        // يمكننا لاحقًا هنا استدعاء وظيفة لتحديث شريط النقاط (Scoreboard)
    }

    switchTurn() {
        // تبديل الدور إلى الفريق الآخر
        this.currentPlayer = (this.currentPlayer === 1) ? 2 : 1;
        
        // إذا كانت هناك وظيفة للإبلاغ عن التغيير، يتم استدعاؤها
        if (this.onTurnChange) {
            this.onTurnChange(this.currentPlayer);
        }
        
        // ملاحظة: في نمط "المقدم" (Presenter Mode)، قد لا يتم تبديل الدور بعد كل محاولة
        // بل يظل الدور للفائز في السؤال، لكن هذه الدالة هي الآلية الأساسية للتبديل.
    }
}

// إنشاء وتصدير نسخة وحيدة من مدير الأدوار لاستخدامها في game.js
const turnManager = new TurnManager();
