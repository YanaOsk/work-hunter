import React from "react";

// Matches sequences that are clearly LTR: English words, emails, tech terms, numbers with delimiters
const LTR_RE = /([a-zA-Z0-9][a-zA-Z0-9@._+\-/:&*#]*[a-zA-Z0-9]|[a-zA-Z0-9])/g;

function isLtr(s: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9@._+\-/:&*#]*$/.test(s);
}

// U+202D LEFT-TO-RIGHT OVERRIDE, U+202C POP DIRECTIONAL FORMATTING
// More reliable than CSS unicode-bidi in deeply nested RTL contexts
const LRO = "‭";
const PDF = "‬";

/**
 * Renders mixed Hebrew/English text with Unicode LTR Override on ASCII segments.
 * Also handles **bold** markdown.
 * Prevents browser bidi algorithm from reversing emails, tech names, and numbers.
 */
export function renderMixedText(text: string): React.ReactNode {
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {boldParts.map((part, bi) => {
        const isBold = part.startsWith("**") && part.endsWith("**");
        const content = isBold ? part.slice(2, -2) : part;

        const segments = content.split(LTR_RE);
        const rendered = segments.map((seg, si) =>
          isLtr(seg) ? (
            <span key={si} dir="ltr">{LRO}{seg}{PDF}</span>
          ) : (
            seg
          )
        );

        return isBold ? (
          <strong key={bi} className="text-white font-bold">{rendered}</strong>
        ) : (
          <React.Fragment key={bi}>{rendered}</React.Fragment>
        );
      })}
    </>
  );
}

/** Wraps a single LTR string (email, phone, URL) with Unicode LTR Override. */
export function ltrSpan(text: string): React.ReactNode {
  return <span dir="ltr">{LRO + text + PDF}</span>;
}
