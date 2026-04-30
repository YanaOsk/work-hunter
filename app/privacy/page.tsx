"use client";

import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { useLanguage } from "@/components/LanguageProvider";

const EMAIL = "yanaoskin35@gmail.com";

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const he = lang === "he";
  const LAST_UPDATED = he ? "30 באפריל 2026" : "April 30, 2026";

  if (!he) {
    return (
      <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-900">
        <div className="max-w-3xl mx-auto px-5 py-16 sm:py-24" dir="ltr">
          <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm transition mb-10 inline-block">← Back</Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-white/40 text-sm mb-12">Last updated: {LAST_UPDATED}</p>
          <div className="space-y-10 text-white/70 leading-relaxed text-[15px]">
            <section><h2 className="text-white font-semibold text-lg mb-3">1. Introduction</h2><p>Work Hunter (&quot;we&quot;, &quot;our&quot;) takes user privacy seriously. This policy explains what information we collect when you use our platform, how it is used, and what control you have over it. Please read it before using the service.</p></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">2. Information We Collect</h2><ul className="space-y-2 list-disc list-inside marker:text-purple-400"><li><span className="text-white/90 font-medium">Account information</span> — name and email address on registration. If you sign in with Google, we receive only your public name, email, and profile picture.</li><li><span className="text-white/90 font-medium">CV and professional data</span> — text you enter manually or upload, used to analyze your profile and match jobs. We do not retain the original file after parsing.</li><li><span className="text-white/90 font-medium">Usage data</span> — completed advisor stages, selected preferences, and diagnosis results, to save your progress.</li><li><span className="text-white/90 font-medium">Payment data</span> — we store only the last 4 card digits, expiry, and brand for display. Full card details go directly to our payment provider and never touch our servers.</li><li><span className="text-white/90 font-medium">Cookies and technical logs</span> — for session authentication, error analysis, and performance.</li></ul></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">3. How We Use Your Information</h2><ul className="space-y-2 list-disc list-inside marker:text-purple-400"><li>To match jobs and provide personalized career advice.</li><li>To save your progress in advisory and CV-building flows.</li><li>To send a confirmation email after registration (and occasionally relevant service updates).</li><li>To detect and prevent abuse.</li><li>To improve AI response quality using anonymized, aggregated data.</li></ul><p className="mt-3">We do not sell, rent, or share personally identifiable information with third parties for marketing purposes.</p></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">4. AI Processing</h2><p>Content entered into the service (CV, questionnaire answers, professional details) may be sent to external AI providers such as Google Gemini and Groq for processing. These providers operate under their own terms and are not permitted to use your data to train models without explicit consent. We recommend avoiding entering highly sensitive information (e.g. national ID, banking details) into text fields.</p></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">5. Data Retention and Deletion</h2><p>Your data is retained as long as your account is active. You may request account and data deletion at any time by contacting us at <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 underline">{EMAIL}</a>. We will act within 30 business days. Data may remain in encrypted backups for up to 90 additional days.</p></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">6. Security</h2><p>We apply reasonable security measures: HTTPS on all communications, bcrypt password hashing, encrypted database storage. No security is absolute — in the event of a breach that may affect you, we will notify you as quickly as possible.</p></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">7. Cookies</h2><p>We use only essential authentication cookies to maintain your session. We do not use advertising or tracking cookies. You may manage cookies in your browser settings; disabling authentication cookies will prevent you from logging in.</p></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">8. Your Rights (GDPR)</h2><p>You have the right to: access the data we hold about you; correct inaccurate data; request erasure (&quot;right to be forgotten&quot;); object to certain processing; receive your data in a machine-readable format. Contact us at <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 underline">{EMAIL}</a> to exercise these rights.</p></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">9. Changes to This Policy</h2><p>We may update this policy periodically. Material changes will be announced on the platform and emailed to registered users at least 14 days before taking effect. Continued use of the service constitutes acceptance of the updated policy.</p></section>
            <section><h2 className="text-white font-semibold text-lg mb-3">10. Contact</h2><p>For privacy questions, data deletion requests, or any other matter:</p><p className="mt-2"><a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 underline">{EMAIL}</a></p></section>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-white/30 text-sm">
            <Link href="/" className="hover:text-white/60 transition">Home</Link>
            <Link href="/contact" className="hover:text-white/60 transition">Contact</Link>
          </div>
        </div>
      </div>
      <SiteFooter />
      </>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-900">
      <div className="max-w-3xl mx-auto px-5 py-16 sm:py-24" dir="rtl">

        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm transition mb-10 inline-block">
          חזרה לעמוד הראשי
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">מדיניות פרטיות</h1>
        <p className="text-white/40 text-sm mb-12">עודכן לאחרונה: {LAST_UPDATED}</p>

        <div className="space-y-10 text-white/70 leading-relaxed text-[15px]">

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. מבוא</h2>
            <p>
              Work Hunter (&quot;אנחנו&quot;, &quot;השירות&quot;) מתייחסים ברצינות מלאה לפרטיות המשתמשים שלנו.
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
    <SiteFooter />
    </>
  );
}
