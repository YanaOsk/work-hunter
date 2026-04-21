export function langInstruction(lang?: string): string {
  if (lang === "he") {
    return `IMPORTANT — RESPONSE LANGUAGE:
חובה להשיב בעברית תקנית, ברורה, רהוטה, ומקצועית בלבד.
כל שדות ה-JSON (כולל כותרות, סיכומים, יתרונות, חסרונות, צעדים, והסברים) חייבים להיות בעברית ברורה ונגישה.
אין להשתמש באנגלית למעט במונחים מקצועיים נפוצים בעברית (למשל LinkedIn, STAR, MBTI).
אין לתרגם מילולית — לכתוב כאילו יועץ ישראלי מנוסה כותב למטופל ישראלי.`;
  }
  return "RESPONSE LANGUAGE: Respond in clear, natural English only.";
}
