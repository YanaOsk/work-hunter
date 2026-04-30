export interface Review {
  id: string;
  nameHe: string;
  nameEn: string;
  age: number;
  cityHe: string;
  cityEn: string;
  fieldKey:
    | "reviewsFieldTech"
    | "reviewsFieldEducation"
    | "reviewsFieldHealth"
    | "reviewsFieldDesign"
    | "reviewsFieldSocial"
    | "reviewsFieldSales"
    | "reviewsFieldProduct"
    | "reviewsFieldFinance"
    | "reviewsFieldReturn";
  titleHe: string;
  titleEn: string;
  bodyHe: string;
  bodyEn: string;
  rating: number;
  timeKey: "reviewsTimeWeek" | "reviewsTimeWeeks" | "reviewsTimeMonth" | "reviewsTimeMonths";
  timeN?: number;
}

export const REVIEWS: Review[] = [
  {
    id: "1",
    nameHe: "יעל כהן",
    nameEn: "Yael Cohen",
    age: 29,
    cityHe: "חיפה",
    cityEn: "Haifa",
    fieldKey: "reviewsFieldEducation",
    titleHe: "עברתי מהוראה ל-EdTech — ובפעם הראשונה הרגשתי שמישהו שומע אותי",
    titleEn: "Moved from teaching to EdTech — first time I felt actually heard",
    bodyHe:
      "הייתי 6 שנים מורה לאנגלית ורציתי לעזוב אבל לא ידעתי לאן. היועץ שאל שאלות שאף יועץ אנושי לא שאל אותי (ראיתי בערך חמישה). האבחון פתח לי את העיניים לתחום ה-EdTech ושלב האסטרטגיה נתן לי רשימה של חברות שבאמת התאימו. תוך חודש קיבלתי עבודה כ-Learning Designer בסטארטאפ חינוכי.",
    bodyEn:
      "I was an English teacher for 6 years and wanted out but had no idea where to go. The advisor asked me questions no human coach (I saw 5) ever asked. The diagnosis opened my eyes to EdTech and the strategy stage gave me a real list of fitting companies. Within a month I got a Learning Designer role at an Israeli company.",
    rating: 5,
    timeKey: "reviewsTimeWeeks",
    timeN: 3,
  },
  {
    id: "2",
    nameHe: "דני לוי",
    nameEn: "Danny Levi",
    age: 42,
    cityHe: "תל אביב",
    cityEn: "Tel Aviv",
    fieldKey: "reviewsFieldFinance",
    titleHe: "יועץ מס עצמאי — סוף סוף תמחרתי את עצמי נכון",
    titleEn: "Tax consultant — finally priced myself right",
    bodyHe:
      "אני עצמאי 15 שנה ותמיד תמחרתי מתחת לשוק. ניתוח המסלולים הראה לי שאני בעצמאי-מומחה ולא עצמאי-שורד, והאסטרטגיה נתנה לי מילים לדבר עם לקוחות גדולים יותר. העליתי מחירים ב-40% ואף לקוח לא ברח. שווה פי 100 ממה ששילמתי.",
    bodyEn:
      "I've been self-employed for 15 years and always under-priced. The path analysis showed I was stuck in survival mode, not expert mode, and the strategy gave me words to talk to bigger clients. Raised my prices 40% and nobody left. Worth 100x what I paid.",
    rating: 5,
    timeKey: "reviewsTimeMonth",
  },
  {
    id: "3",
    nameHe: "מיכל אברהם",
    nameEn: "Michal Avraham",
    age: 35,
    cityHe: "ירושלים",
    cityEn: "Jerusalem",
    fieldKey: "reviewsFieldSocial",
    titleHe: "עובדת סוציאלית שעברה ל-HR — תודה על הלינקדאין",
    titleEn: "Social worker who moved to HR — thanks for the LinkedIn",
    bodyHe:
      "אחרי שנים בעבודה סוציאלית הבנתי שאני רוצה לעבור ל-HR אבל לא ידעתי איך להציג את עצמי. השכתוב של ה-LinkedIn היה פגז — העליתי ולדעתי תוך שבועיים פנו אליי מ-3 חברות. עדיין מדהים אותי שכל זה AI.",
    bodyEn:
      "After years in social work I knew I wanted HR but didn't know how to position myself. The LinkedIn rewrite was incredible — I posted it and within 2 weeks 3 companies reached out. Still amazes me this is all AI.",
    rating: 5,
    timeKey: "reviewsTimeWeeks",
    timeN: 2,
  },
  {
    id: "4",
    nameHe: "נעם בן-דוד",
    nameEn: "Noam Ben-David",
    age: 26,
    cityHe: "הרצליה",
    cityEn: "Herzliya",
    fieldKey: "reviewsFieldTech",
    titleHe: "הראיונות המדומים עם בעיות LeetCode אמיתיות — פגז",
    titleEn: "Mock interviews with real LeetCode problems — fire",
    bodyHe:
      "התכוננתי לראיונות Senior Backend ועשיתי 8 ראיונות מדומים באתר. התרגילים היו ברמה של חברות אמיתיות (Amazon, Wix, מאנדיי). הפידבק בשיטת STAR שינה לי את הסוגה של התשובות. קיבלתי הצעה מ-2 חברות.",
    bodyEn:
      "Was prepping for Senior Backend interviews and did 8 mock interviews here. Problems were real-company level (Amazon, Wix, Monday). The STAR feedback changed how I structure answers. Got offers from 2 companies.",
    rating: 5,
    timeKey: "reviewsTimeWeek",
  },
  {
    id: "5",
    nameHe: "רונית שוורץ",
    nameEn: "Ronit Schwartz",
    age: 50,
    cityHe: "אור יהודה",
    cityEn: "Or Yehuda",
    fieldKey: "reviewsFieldReturn",
    titleHe: "חזרה לעבודה אחרי 12 שנות אימהות — בלי פאניקה",
    titleEn: "Returning to work after 12 years of motherhood — without panic",
    bodyHe:
      "הייתי אחות ולקחתי הפסקה של 12 שנה. חשבתי שאף אחד לא ירצה אותי. היועץ זיהה שהניסיון שלי רלוונטי לתפקידי תיאום בחברות רפואיות ושכתב לי CV שמציג את זה ככה. קיבלתי עבודה תוך 3 חודשים.",
    bodyEn:
      "I was a nurse and took a 12-year break. Thought nobody would want me. The advisor spotted that my experience fits medical coordination roles and rewrote my CV to show it. Got a job in 3 months.",
    rating: 5,
    timeKey: "reviewsTimeMonths",
    timeN: 2,
  },
  {
    id: "6",
    nameHe: "אסף גולן",
    nameEn: "Asaf Golan",
    age: 31,
    cityHe: "רמת גן",
    cityEn: "Ramat Gan",
    fieldKey: "reviewsFieldDesign",
    titleHe: "עברתי מעובד בחברה לפרילנסר — הכיוון היה הכל",
    titleEn: "Went from employee to freelancer — the direction stage was everything",
    bodyHe:
      "הייתי מעצב גרפי בחברה והרגשתי חנוק. שלב הכיוון השווה עצמאי מול שכיר בצורה כל כך כנה שלא שמעתי מאף יועץ אנושי. אחרי שבחרתי עצמאי, האסטרטגיה נתנה לי בדיוק איך למצוא את 10 הלקוחות הראשונים. היום יש לי 14.",
    bodyEn:
      "I was a graphic designer at a company feeling suffocated. The direction stage compared freelance vs employee so honestly, I've never heard anything like it from human coaches. After I picked freelance, the strategy gave me exactly how to find my first 10 clients. I now have 14.",
    rating: 5,
    timeKey: "reviewsTimeWeeks",
    timeN: 5,
  },
  {
    id: "7",
    nameHe: "שירה מזרחי",
    nameEn: "Shira Mizrahi",
    age: 23,
    cityHe: "באר שבע",
    cityEn: "Beer Sheva",
    fieldKey: "reviewsFieldSocial",
    titleHe: "בוגרת פסיכולוגיה שלא ידעה לאן ללכת",
    titleEn: "Psychology grad who didn't know where to go",
    bodyHe:
      "סיימתי תואר ראשון והרגשתי שאני לא מתאימה לפסיכולוגיה טיפולית, אבל לא ידעתי מה כן. האבחון הציע לי UX Research — מעולם לא חשבתי על זה. עכשיו אני חוקרת משתמשים בסטארטאפ. החיים שלי השתנו.",
    bodyEn:
      "Finished my BA feeling I didn't fit clinical psychology, but had no idea what did. The diagnosis suggested UX Research — I'd never thought of it. I now do user research at a startup. My life changed.",
    rating: 5,
    timeKey: "reviewsTimeMonth",
  },
  {
    id: "8",
    nameHe: "עמית פרידמן",
    nameEn: "Amit Friedman",
    age: 38,
    cityHe: "קריית ביאליק",
    cityEn: "Kiryat Bialik",
    fieldKey: "reviewsFieldProduct",
    titleHe: "מנהל פרויקטים בבנייה שמצא עבודה מרחוק",
    titleEn: "Construction PM who found remote work",
    bodyHe:
      "הייתי 15 שנה בבנייה באזור הצפון ורציתי לעבוד מהבית. כולם אמרו שאין דבר כזה בענף. שלב האסטרטגיה הראה לי חברות ב-construction-tech ו-PropTech שמחפשות ניסיון שטח. קיבלתי תפקיד Product Manager בחברה ישראלית שעובדים 100% מהבית.",
    bodyEn:
      "15 years in construction in the north and I wanted remote work. Everyone said there's no such thing in the field. The strategy stage showed me construction-tech and PropTech companies hungry for field experience. Got a Product Manager role at an Israeli company 100% remote.",
    rating: 5,
    timeKey: "reviewsTimeWeeks",
    timeN: 4,
  },
  {
    id: "9",
    nameHe: "תמר בן-אהרון",
    nameEn: "Tamar Ben-Aharon",
    age: 44,
    cityHe: "פתח תקווה",
    cityEn: "Petah Tikva",
    fieldKey: "reviewsFieldSales",
    titleHe: "מנהלת מכירות מוחלשת חזרה לשוק",
    titleEn: "Depleted sales manager back in the market",
    bodyHe:
      "פוטרתי אחרי 7 שנים והייתי מיואשת. ב-45 דקות עברתי את המסע, קיבלתי סיכום מפורט של הכוחות שלי והבנתי שאני שווה הרבה יותר ממה שחשבתי. עשיתי 4 ראיונות מדומים לפני ראיון אמיתי וסגרתי עבודה ב+15% משכר קודם.",
    bodyEn:
      "Laid off after 7 years and devastated. Did the 45-min journey, got a detailed summary of my strengths, and realized I'm worth way more than I thought. Did 4 mock interviews before the real one and landed a job at +15% salary.",
    rating: 5,
    timeKey: "reviewsTimeWeek",
  },
  {
    id: "10",
    nameHe: "יואב כץ",
    nameEn: "Yoav Katz",
    age: 34,
    cityHe: "מודיעין",
    cityEn: "Modi'in",
    fieldKey: "reviewsFieldHealth",
    titleHe: "פיזיותרפיסט שפתח קליניקה עצמאית",
    titleEn: "Physiotherapist who opened a solo clinic",
    bodyHe:
      "עבדתי במרפאה גדולה ורציתי לצאת לעצמאי. שלב הכיוון עשה לי השוואה כנה, אפילו אמר ישירות איפה אני חלש כיזם. אחרי שדעתי, האסטרטגיה נתנה לי 30 ימים של צעדים קונקרטיים. היום יש לי קליניקה בהרצליה.",
    bodyEn:
      "Worked at a big clinic and wanted to go solo. The direction stage did an honest comparison, even bluntly told me where I'm weak as an entrepreneur. Once I decided, the strategy gave me 30 days of concrete steps. I now have a clinic in Herzliya.",
    rating: 5,
    timeKey: "reviewsTimeMonth",
  },
];
