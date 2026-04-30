import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "תנאי שימוש | Work Hunter",
  description: "תנאי השימוש של Work Hunter — הגדרות, זכויות, מגבלות ומדיניות ביטול.",
};

const LAST_UPDATED = "30 באפריל 2026";
const COMPANY = "Work Hunter";
const EMAIL = "yanaoskin35@gmail.com";

export default function TermsPage() {
  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-900">
      <div className="max-w-3xl mx-auto px-5 py-16 sm:py-24" dir="rtl">

        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm transition mb-10 inline-block">
          חזרה לעמוד הראשי
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">תנאי שימוש</h1>
        <p className="text-white/40 text-sm mb-12">עודכן לאחרונה: {LAST_UPDATED}</p>

        <div className="space-y-10 text-white/70 leading-relaxed text-[15px]">

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. הסכמה לתנאים</h2>
            <p>
              ברוכים הבאים ל-{COMPANY}. השימוש בפלטפורמה — בין אם דרך דפדפן, אפליקציה או ממשק API —
              מהווה הסכמה מלאה לתנאי שימוש אלה. אם אינכם מסכימים לתנאים, אנא הפסיקו את השימוש.
              גיל המינימום לשימוש בשירות הוא 16.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. תיאור השירות</h2>
            <p>
              {COMPANY} היא פלטפורמת ייעוץ קריירה מבוססת בינה מלאכותית המציעה:
            </p>
            <ul className="space-y-2 list-disc list-inside marker:text-purple-400 mt-2">
              <li>אבחון כישורים ומיפוי חוזקות (MBTI, Holland Code).</li>
              <li>ניתוח כיוון קריירה — שכיר, עצמאי או לימודים.</li>
              <li>בנייה ושיפור קורות חיים בעזרת AI.</li>
              <li>ייעוץ אסטרטגיית חיפוש עבודה ושוק נסתר.</li>
              <li>ראיונות דמה עם פידבק בשיטת STAR.</li>
              <li>חיפוש משרות מותאם אישית (בתלות בזמינות השירות).</li>
            </ul>
            <p className="mt-3">
              השירות אינו מהווה ייעוץ משפטי, פיננסי, פסיכולוגי או רפואי.
              תוצאות ה-AI הן המלצות בלבד — ההחלטות הסופיות נתונות למשתמש.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. חשבון משתמש</h2>
            <p>
              אתם אחראים לשמירת פרטי הגישה לחשבונכם ולכל פעילות שמתבצעת תחתיו.
              בעת הרשמה עליכם למסור פרטים מדויקים ועדכניים. אין להעביר גישה לחשבון לאחרים.
              אנו שומרים לעצמנו את הזכות להשעות או לסגור חשבון שמפר את התנאים.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. מסלולים ותשלום</h2>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-medium mb-1">תוכנית חינמית</p>
                <p className="text-sm">גישה חלקית לכלים — אבחון, ניתוח כיוון, ותצוגה מוגבלת של סיכומים. ללא הגבלת זמן.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-medium mb-1">מנוי שבועי — ₪25</p>
                <p className="text-sm">גישה מלאה לכל הכלים למשך 7 ימים ממועד הרכישה. אינו מתחדש אוטומטית. לאחר הפגיעה — חוזרים לתוכנית החינמית.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-medium mb-1">מנוי רבעוני — ₪59</p>
                <p className="text-sm">גישה מלאה למשך 90 יום. ניתן לחדש ידנית לאחר הפגיעה.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-medium mb-1">מנוי לצמיתות — ₪149</p>
                <p className="text-sm">גישה מלאה ללא הגבלת זמן, כל עוד השירות פעיל. תשלום חד-פעמי.</p>
              </div>
            </div>

            <p className="mt-4">
              כל המחירים כוללים מע&quot;מ. אנו עשויים לשנות מחירים בהודעה מוקדמת של 14 יום.
              לא חלה חובת תשלום מחדש על מנויים קיימים בשל שינוי מחיר.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. מדיניות ביטול והחזר</h2>
            <p>
              בשל אופי השירות הדיגיטלי שניתן לשימוש מיידי לאחר הרכישה, לא נינתן החזר כספי לאחר
              שהמנוי הופעל ונעשה בו שימוש.
            </p>
            <p className="mt-3">
              <span className="text-white/90 font-medium">חריג:</span> אם נתקלתם בתקלה טכנית שמנעה לחלוטין גישה לשירות, פנו אלינו תוך 72 שעות מהרכישה
              ב-<a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 underline" dir="ltr">{EMAIL}</a> ונבחן כל מקרה לגופו.
            </p>
            <p className="mt-3">
              ביטול מנוי (הסרת חידוש אוטומטי) — ניתן בכל עת דרך עמוד ה&quot;מנוי שלי&quot;. הגישה תמשיך
              עד סוף תקופת המנוי שנרכשה.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. שימוש מותר ואסור</h2>
            <p className="text-white/90 font-medium mb-2">מותר:</p>
            <ul className="space-y-1.5 list-disc list-inside marker:text-green-400">
              <li>שימוש אישי לצורכי חיפוש עבודה, פיתוח קריירה ושיפור מקצועי.</li>
              <li>שיתוף ממצאים עם יועץ קריירה או מנטור אישי.</li>
            </ul>
            <p className="text-white/90 font-medium mt-4 mb-2">אסור:</p>
            <ul className="space-y-1.5 list-disc list-inside marker:text-rose-400">
              <li>שימוש מסחרי — מכירה חוזרת, שיווק, שילוב בשירותים של צד שלישי — ללא אישור בכתב.</li>
              <li>יצירת חשבונות מרובים לעקיפת הגבלות שימוש.</li>
              <li>הזנת מידע שגוי, מטעה או פוגעני למערכת.</li>
              <li>ניסיון לפרוץ, לעקוף, להנדס לאחור או לגרד נתונים מהשירות.</li>
              <li>שימוש אוטומטי (bots, scrapers) ללא הסכמה מפורשת.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. קניין רוחני</h2>
            <p>
              כל הטכנולוגיה, הקוד, העיצוב, הפרומפטים והמתודולוגיה של {COMPANY} הם קניין
              בלעדי של החברה ומוגנים בזכויות יוצרים וסימני מסחר. השימוש בשירות אינו מקנה
              זכות כלשהי בקניין הרוחני.
            </p>
            <p className="mt-3">
              תוכן שאתם מזינים (קורות חיים, תשובות) נשאר בבעלותכם המלאה. אתם מעניקים לנו
              רישיון מוגבל לעבד אותו לצורך מתן השירות בלבד.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. הגבלת אחריות</h2>
            <p>
              השירות ניתן &quot;כמות שהוא&quot; (AS IS). אנו לא מתחייבים שהשירות יהיה זמין 100% מהזמן,
              שתוצאות ה-AI יהיו מדויקות לחלוטין, או שהמשרות המוצגות יתאימו בהכרח לצרכיכם.
            </p>
            <p className="mt-3">
              בשום מקרה לא תעלה אחריותנו על הסכום ששולם לנו בשלושת החודשים שקדמו לאירוע
              שבגינו נתבעת האחריות.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. שינויים בשירות</h2>
            <p>
              אנו שומרים לעצמנו את הזכות לשנות, להוסיף או להסיר פיצ׳רים מהשירות בכל עת.
              שינויים מהותיים יפורסמו מראש. הפסקת שירות מוחלטת תיעשה עם הודעה מוקדמת של
              לפחות 30 יום, ומנויים פעילים יקבלו החזר יחסי.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. שיפוי</h2>
            <p>
              אתם מתחייבים לשפות את {COMPANY} מפני כל תביעה, הפסד או נזק שינבעו
              משימוש בלתי מורשה בשירות, הפרת תנאי שימוש אלה, או הפרת זכויות של צד שלישי.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">11. דין חל וסמכות שיפוט</h2>
            <p>
              תנאים אלה כפופים לדיני מדינת ישראל. כל סכסוך יידון בבתי המשפט המוסמכים
              במחוז תל אביב, בכפוף לניסיון ראשוני ליישוב בדרכי גישור.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">12. יצירת קשר</h2>
            <p>
              לשאלות, הצעות או תלונות:
            </p>
            <p className="mt-2">
              <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 underline" dir="ltr">{EMAIL}</a>
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-white/30 text-sm">
          <Link href="/privacy" className="hover:text-white/60 transition">מדיניות פרטיות</Link>
          <Link href="/" className="hover:text-white/60 transition">עמוד ראשי</Link>
        </div>

      </div>
    </div>
    <SiteFooter />
    </>
  );
}
