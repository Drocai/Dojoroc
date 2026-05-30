// Built-in GYM — math. Same data shape as the starter; auto-appears in the Hub
// + Dojo Map once registered in packs/index.js.

const SHARED_RULES =
  '\n\nRules: Respond directly and concisely. You are talking with a parent and their kid, so keep it ' +
  'friendly, safe, and encouraging. Prefer short, action-first answers. Use real-world examples ' +
  '(pizza slices, coins, levels) before symbols, and show one small step at a time.';

const numberDojoData = {
  id: 'number-dojo',
  name: 'Number Dojo',
  subject: 'Math, logic & number sense',
  builtin: true,

  brand: { title: 'NUMBER DOJO', icon: 'Brain', accent: 'amber', coreLabel: 'LOGIC CORE', coreUnit: 'PTS' },

  players: [
    { key: 'derrick', label: 'Derrick', chatName: 'Dad', color: 'amber', role: 'mentor' },
    { key: 'graysen', label: 'Graysen', chatName: 'Graysen', color: 'rose', role: 'student' },
  ],

  sensei: {
    name: 'Axiom',
    title: 'AI SENSEI',
    greeting: "Logic Core online. I'm Axiom. Math is a game with rules you can master — let's level up. What are we solving?",
    placeholder: 'Ask Axiom about math...',
  },

  lore: {
    tagline: 'Every problem is a puzzle. Solve. Level. Repeat.',
    canon:
      'The Number Dojo is a logic gym where a father and son sharpen their math minds together. ' +
      'Every mission cleared and round played feeds the Logic Core with points (PTS). ' +
      'Axiom is the AI sensei guiding the climb from counting to mastery.',
    boot: 'Logic Core online · proofs aligned · number sense locked',
    emptyActivity: 'The Logic Core is idle. Clear a mission or play a round to score points.',
    levelUpTemplate: '🧠 {name} reached Logic Level {lvl} — the Core sharpens.',
    arcadeXpTemplate: '🎲 {name} scored {xp} PTS in the arcade.',
  },

  missions: [
    { id: 'times_tables', title: 'Master the Grid', desc: 'Learn times tables up to 10', xp: 150 },
    { id: 'fractions', title: 'Split the Pizza', desc: 'Understand fractions', xp: 150 },
    { id: 'word_problems', title: 'Crack the Story', desc: 'Turn word problems into math', xp: 200 },
    { id: 'mental_math', title: 'Speed of Thought', desc: 'Add & subtract in your head fast', xp: 100 },
  ],

  modes: [
    {
      key: 'tutor',
      label: 'Math Tutor',
      note: 'Step-by-step help',
      system:
        'You are Axiom, the AI sensei of the Number Dojo. You help Derrick and his son Graysen with math — ' +
        'arithmetic, fractions, word problems, logic. Break every problem into the smallest steps, use real-world ' +
        'examples before symbols, and never just give the answer — guide them to it, then confirm.' + SHARED_RULES,
    },
    {
      key: 'puzzles',
      label: 'Puzzle Master',
      note: 'Fun brain teasers',
      system:
        'You are Axiom in Puzzle Master mode. You give fun, age-right math riddles and logic puzzles, one at a time, ' +
        'with a hint ready if they get stuck. Celebrate clever thinking and reveal the trick after they try.' + SHARED_RULES,
    },
    {
      key: 'why',
      label: 'Why It Works',
      note: 'The reason behind the rule',
      system:
        'You are Axiom in Why-It-Works mode. When a kid asks why a math rule works (why you flip to divide fractions, ' +
        'why a negative times a negative is positive), explain the intuition with a concrete picture, simply.' + SHARED_RULES,
    },
  ],

  chat: { defaultRoom: 'graysen-dad-number-dojo' },

  arcade: {
    tips: [
      'Multiplication is just fast repeated addition: 4×3 = 4+4+4.',
      'A fraction is part of a whole — 1/2 a pizza is one of two equal slices.',
      'To add fractions, the bottoms (denominators) must match first.',
      'Any number times 0 is 0. Always.',
      'Doubling then halving gets you back where you started.',
      'Estimate first — it tells you if your exact answer is sane.',
      'The order of operations: parentheses, then ×÷, then +−.',
    ],
    quiz: [
      { q: 'What is 7 × 8?', answers: ['56', '54', '64'], correct: 0 },
      { q: '1/2 + 1/2 = ?', answers: ['1', '2/4', '1/4'], correct: 0 },
      { q: 'Any number times 0 equals…', answers: ['0', 'itself', '1'], correct: 0 },
      { q: 'Which do you do FIRST: 2 + 3 × 4?', answers: ['3 × 4', '2 + 3', 'left to right'], correct: 0 },
      { q: 'What is half of 18?', answers: ['9', '8', '12'], correct: 0 },
      { q: 'Multiplication is repeated…', answers: ['addition', 'subtraction', 'division'], correct: 0 },
    ],
    byMission: {
      times_tables: {
        tips: ['9× trick: the digits of the answer add up to 9 (9×3=27, 2+7=9).', '×10 just adds a zero.'],
        quiz: [{ q: 'What is 9 × 6?', answers: ['54', '56', '45'], correct: 0 }],
      },
      fractions: {
        tips: ['Bigger bottom number = smaller slices.', '2/4 is the same as 1/2.'],
        quiz: [{ q: 'Which is bigger?', answers: ['1/2', '1/4', 'they are equal'], correct: 0 }],
      },
    },
  },

  handoff: {
    studentDefault: 'Graysen',
    projectName: 'Graysen Number Dojo',
    sheetTitle: 'NUMBER DOJO — HANDOFF SETUP SHEET',
    aiPolishTemplate:
      'Translate these raw kid answers into ONE clean, warm "Personal preferences" block (150-220 words) ' +
      'telling Claude how to help {name} learn math: real-world examples first, smallest steps, guide-don\'t-tell, ' +
      'patient and encouraging. Output only the block text.',
    questionGroups: [
      {
        title: 'Where you are',
        items: [
          ['mathLevel', 'What math are you working on right now?', 'Grade or topic is fine.'],
          ['mathFeel', 'How do you feel about math?', 'Love it, okay, or it stresses you out?'],
          ['stuckMath', 'What part trips you up most?', 'This tells Claude what to focus on.'],
        ],
      },
      {
        title: 'How you learn',
        items: [
          ['mathStyle', 'Do you like examples, pictures, or just the steps?', ''],
          ['mathPace', 'Fast quick answers or slow and thorough?', ''],
        ],
      },
    ],
    blocks: [
      {
        key: 'prefs',
        title: 'Claude Profile / Preferences',
        where: 'Settings → Personal preferences',
        bodyTemplate: `You are helping {name} learn math with Dad. Use real-world examples before symbols, break problems into the smallest steps, and guide to the answer rather than just giving it. Stay patient and celebrate progress.

{name}'s situation:
- Working on: {mathLevel}
- Feels about math: {mathFeel}
- Gets stuck on: {stuckMath}

Response rules:
- One step at a time, check understanding before moving on.
- Picture or example first, then the math.
- Never shame a wrong answer — find what they DID get right.`,
      },
    ],
  },
};

export default numberDojoData;
