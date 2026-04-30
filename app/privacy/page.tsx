import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | Work Hunter",
  description: "מדיניות הפרטיות של Work Hunter — כיצד אנו אוספים, משתמשים ומגנים על המידע שלך.",
};

const LAST_UPDATED = "30 באפריל 2026";
const COMPANY = "Work Hunter";
const EMAIL = "yanaoskin35@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-900">
      <div className="max-w-3xl mx-auto px-5 py-16 sm:py-24" dir="rtl">

        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm transition mb-10 inline-block">
          ← חזרה לעמוד הראשי
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">מדיניות פרטיות</h1>
        <p className="text-white/40 text-sm mb-12">עודכן לאחרונה: {LAST_UPDATED}</p>

        <div className="space-y-10 text-white/70 leading-relaxed text-[15px]">

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. מבוא</h2>
            <p>
              {COMPANY} (&quot;אנחנו&quot;, &quot;השירות&quot;) מתייחסים ברצינות מלאה לפרטיות המשתמשים שלנו.
              מדיניות זו מסבירה אילו מידע נאסף כשאתם משתמשים בפלטפורמה, כיצד הוא משמש,
              ואיזו שליטה יש לכם עליו. אנא קראו אותה לפני השימוש בשירות.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. מידע שאנו אוספים</h2>
            <ul className="space-y-2 list-disc list-inside marker:text-purple-400">
              <li>
                <span className="text-white/90 font-medium">פרטי חשבון</span> — שם, כתובת אימייל וסיסמה (מוצפנת) בעת הרשמה. אם נכנסתם דרך Google, אנו מקבלים רק את השם, האימייל ותמונת הפרופיל הציבורית.
              </li>
              <li>
                <span className="text-white/90 font-medium">קורות חיים ומידע מקצועי</span> — הטקסט שהזנתם באופן ידני או קובץ ה-PDF שהעלאתם, לצורך ניתוח ותאימות משרות. אנו לא שומרים את הקובץ המקורי לאחר הניתוח.
              </li>
              <li>
                <span className="text-white/90 font-medium">נתוני שימוש</span> — שלבים שהושלמו בתהליך הייעוץ, העדפות שנבחרו, ותוצאות האבחון (MBTI, Holland), לצורך שמירת ההתקדמות.
              </li>
              <li>
                <span className="text-white/90 font-medium">נתוני תשלום</span> — אנו שומרים רק את 4 ספרות הכרטיס האחרונות, תוקף ומותג, לצורך הצגה בלבד. פרטי כרטיס האשראי המלאים עוברים ישירות דרך ספק התשלומים ואינם עוברים בשרתינו.
              </li>
              <li>
                <span className="text-white/90 font-medium">קובצי Cookie ולוגים טכניים</span> — לצורך אימות הסשן, ניתוח שגיאות ושיפור הביצועים.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. כיצד אנו משתמשים במידע</h2>
            <ul className="space-y-2 list-disc list-inside marker:text-purple-400">
              <li>להתאים משרות ולהציג ייעוץ קריירה מותאם אישית.</li>
              <li>לשמור את התקדמות המשתמש בתהליכי הייעוץ ובניית קורות החיים.</li>
              <li>לשלוח אימייל אישור לאחר הרשמה (ואחת לתקופה — עדכוני שירות רלוונטיים).</li>
              <li>לזהות ולמנוע שימוש לרעה בשירות.</li>
              <li>לשפר את איכות תשובות ה-AI על בסיס שאלות נפוצות (ללא זיהוי אישי).</li>
            </ul>
            <p className="mt-3">
              אנו לא מוכרים, משכירים או משתפים מידע מזהה אישית עם צדדים שלישיים לצרכי שיווק.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. שירותי AI ועיבוד טקסט</h2>
            <p>
              תוכן שמוזן לשירות (קורות חיים, תשובות לשאלות, פרטים מקצועיים) עשוי להישלח לספקי AI חיצוניים
              כגון Google Gemini ו-Groq לצורך עיבוד. ספקים אלה כפופים לתנאי שירות משלהם ואינם
              רשאים להשתמש בנתונים לאימון מודלים ללא הסכמה מפורשת (בהתאם לתנאיהם).
              אנו ממליצים להימנע מהזנת מידע רגיש במיוחד (כגון מספר זהות, פרטים בנקאיים) לתיבות הטקסט.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. שמירת מידע ומחיקה</h2>
            <p>
              המידע שלכם נשמר כל עוד חשבונכם פעיל. תוכלו לבקש מחיקת חשבון ומחיקת כל המידע הקשור אליו
              בכל עת על-ידי פנייה אלינו בכתובת{" "}
              <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 underline" dir="ltr">{EMAIL}</a>.
              אנו נפעל למחיקה תוך 30 ימי עבודה.
              לאחר המחיקה, מידע עשוי להישמר בגיבויים מוצפנים לתקופה של עד 90 יום נוספים.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. אבטחת מידע</h2>
            <p>
              אנו נוקטים באמצעי אבטחה סבירים: HTTPS בכל תקשורת, הצפנת סיסמאות עם bcrypt,
              אחסון בסיס נתונים מוצפן. יחד עם זאת, אין אבטחה מוחלטת — במקרה של פרצת אבטחה
              שעלולה לפגוע בכם, נודיע לכם בהקדם האפשרי.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. עוגיות (Cookies)</h2>
            <p>
              אנו משתמשים בעוגיות אימות הכרחיות לשמירת הסשן בלבד. איננו משתמשים בעוגיות עקיבה
              פרסומיות. ניתן לנהל עוגיות דרך הגדרות הדפדפן, אך כיבוי עוגיות האימות ימנע כניסה לחשבון.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. זכויות המשתמש</h2>
            <p>בהתאם לחוק הגנת הפרטיות הישראלי ולתקנות GDPR (ככל שחלות), יש לכם זכות:</p>
            <ul className="space-y-1.5 list-disc list-inside marker:text-purple-400 mt-2">
              <li>לעיין במידע האצור עליכם.</li>
              <li>לתקן מידע שגוי.</li>
              <li>לבקש מחיקת המידע (&quot;הזכות להישכח&quot;).</li>
              <li>להתנגד לעיבוד מידע מסוים.</li>
              <li>לקבל עותק של המידע שלכם בפורמט קריא מכונה.</li>
            </ul>
            <p className="mt-3">לכל פנייה: <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 underline" dir="ltr">{EMAIL}</a></p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. שינויים במדיניות</h2>
            <p>
              אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו בפלטפורמה
              ויישלח עדכון לכתובת האימייל הרשומה, לפחות 14 ימים לפני כניסתם לתוקף.
              המשך השימוש בשירות לאחר הודעה כזו מהווה הסכמה לשינויים.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. צור קשר</h2>
            <p>
              לשאלות בנושא פרטיות, פניות למחיקת מידע, או כל עניין אחר:
            </p>
            <p className="mt-2">
              <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 underline" dir="ltr">{EMAIL}</a>
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-white/30 text-sm">
          <Link href="/terms" className="hover:text-white/60 transition">תנאי שימוש</Link>
          <Link href="/" className="hover:text-white/60 transition">עמוד ראשי</Link>
        </div>

      </div>
    </div>
  );
}
