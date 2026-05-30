// Generic Handoff engine. A pack describes its own intake questions and the
// config blocks it produces; this turns that description into the question
// list, the Claude-ready blocks, the full setup sheet, and the AI-polish
// prompt. Subject-specific wording lives in the pack, not here — so the same
// engine works for "learn dev tools", "build my game", or anything else.

const clean = (v, fallback = 'Not answered yet') => {
  const s = String(v || '').trim();
  return s ? s : fallback;
};

// Wrap a pack's raw answers so block templates can read `p.fieldId` and always
// get a sensible string back instead of undefined.
const cleaned = (p) =>
  new Proxy(p || {}, {
    get: (target, key) => (key === 'studentName' ? target.studentName : clean(target[key])),
  });

/**
 * Build a handoff config object for a pack.
 *
 * @param {object}   cfg
 * @param {string}   cfg.studentDefault  Default student name.
 * @param {string}   cfg.projectName     Name used for the Claude project.
 * @param {string}   cfg.sheetTitle      Heading for the full setup sheet.
 * @param {Array}    cfg.questionGroups  [{ title, items: [[id, label, hint], ...] }]
 * @param {Function} cfg.blocks          (cleanedAnswers, name) => [{ key, title, where, body }]
 * @param {Function} cfg.aiPolishPrompt  (rawAnswers, name) => string
 */
export function makeHandoff(cfg) {
  const {
    studentDefault = 'Student',
    projectName = `${studentDefault} Build Lab`,
    sheetTitle = 'HANDOFF SETUP SHEET',
    questionGroups = [],
    blocks,
    aiPolishPrompt,
  } = cfg;

  const allQuestions = questionGroups.flatMap((g) => g.items);

  const buildBlocks = (p) => {
    const name = clean(p.studentName, studentDefault);
    return blocks(cleaned(p), name);
  };

  const generateSheet = (p) => {
    const name = clean(p.studentName, studentDefault);
    const built = buildBlocks(p);
    const answers = allQuestions.map(([id, label]) => `${label} ${clean(p[id])}`).join('\n');

    const sections = built
      .map(
        (b, i) =>
          `============================================================\n` +
          `${i + 1}. ${b.title.toUpperCase()}\n   (${b.where})\n` +
          `============================================================\n${b.body}`
      )
      .join('\n\n');

    return `${sheetTitle}
Generated: ${new Date().toLocaleString()}
Recipient: ${name}

${sections}

============================================================
${built.length + 1}. ${name.toUpperCase()}'S FULL ANSWERS
============================================================
${answers}
`;
  };

  return {
    studentDefault,
    projectName,
    sheetTitle,
    questionGroups,
    allQuestions,
    buildBlocks,
    generateSheet,
    aiPolishPrompt: (p) => aiPolishPrompt(p, clean(p.studentName, studentDefault)),
  };
}
