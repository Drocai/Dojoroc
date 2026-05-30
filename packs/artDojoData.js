// Built-in GYM — art & drawing. Same data shape as the starter.

const SHARED_RULES =
  '\n\nRules: Respond directly and concisely. You are teaching learners of all ages, so keep it ' +
  'friendly, safe, and encouraging. Prefer short, action-first answers. There are no wrong answers in art — ' +
  'focus on trying, looking closely, and small wins.';

const artDojoData = {
  id: 'art-dojo',
  name: 'Art Dojo',
  subject: 'Drawing, color & creativity',
  builtin: true,

  brand: { title: 'ART DOJO', icon: 'Sparkles', accent: 'rose', coreLabel: 'MUSE CORE', coreUnit: 'SPK' },

  players: [
    { key: 'mentor', label: 'Mentor', chatName: 'Mentor', color: 'rose', role: 'mentor' },
    { key: 'learner', label: 'Learner', chatName: 'Learner', color: 'purple', role: 'student' },
  ],

  sensei: {
    name: 'Iris',
    title: 'AI SENSEI',
    greeting: "Muse Core glowing. I'm Iris. Anyone can draw — it's just looking closely and trying. What do you want to make?",
    placeholder: 'Ask Iris about drawing & art...',
  },

  lore: {
    tagline: 'See it. Sketch it. Make it yours.',
    canon:
      'The Art Dojo is a creative studio where a community of learners make things together. ' +
      'Every mission cleared and round played feeds the Muse Core with sparks (SPK). ' +
      'Iris is the AI sensei guiding the climb from stick figures to real art.',
    boot: 'Muse Core online · palette mixed · imagination unlocked',
    emptyActivity: 'The Muse Core is dim. Clear a mission or play a round to spark it.',
    levelUpTemplate: '🎨 {name} reached Muse Level {lvl} — the Core glows brighter.',
    arcadeXpTemplate: '🖌️ {name} sparked {xp} SPK in the arcade.',
  },

  missions: [
    { id: 'basic_shapes', title: 'See the Shapes', desc: 'Draw anything using circles, squares & triangles', xp: 100 },
    { id: 'shading', title: 'Light & Shadow', desc: 'Make a drawing look 3D with shading', xp: 200 },
    { id: 'color_wheel', title: 'Mix the Wheel', desc: 'Learn how colors work together', xp: 150 },
    { id: 'character', title: 'Invent a Hero', desc: 'Design your own character', xp: 150 },
  ],

  modes: [
    {
      key: 'coach',
      label: 'Drawing Coach',
      note: 'Step-by-step drawing',
      system:
        'You are Iris, the AI sensei of the Art Dojo. You coach your learners in drawing. ' +
        'Break any subject into simple shapes first, then guide them to add detail step by step. ' +
        'Be warm — there are no mistakes, only practice. End with one small thing to try next.' + SHARED_RULES,
    },
    {
      key: 'color',
      label: 'Color Guide',
      note: 'Color & palettes',
      system:
        'You are Iris in Color Guide mode. You explain color simply — warm vs cool, complementary pairs, ' +
        'how to mix and what mood colors create. Give concrete palette suggestions they can use right now.' + SHARED_RULES,
    },
    {
      key: 'ideas',
      label: 'Idea Spark',
      note: 'Beat the blank page',
      system:
        'You are Iris in Idea Spark mode for anyone staring at a blank page. Offer fun, doable prompts and ' +
        'creative what-ifs, building on whatever they like. Keep ideas simple enough to start in one minute.' + SHARED_RULES,
    },
  ],

  chat: { defaultRoom: 'community-art-dojo' },

  arcade: {
    tips: [
      'Almost anything can be drawn from circles, squares, and triangles.',
      'Squint at something to see its light and dark shapes.',
      'Warm colors (red, orange) pop forward; cool colors (blue) sink back.',
      'Complementary colors are opposite on the wheel — they make each other vivid.',
      'Draw lightly first, then darken the lines you want to keep.',
      'Shadows fall opposite the light source.',
      'Filling the whole page makes art feel finished.',
    ],
    quiz: [
      { q: 'Most things can be drawn starting from…', answers: ['Simple shapes', 'Perfect lines', 'Tracing only'], correct: 0 },
      { q: 'Warm colors include…', answers: ['Red & orange', 'Blue & green', 'Black & gray'], correct: 0 },
      { q: 'A shadow falls…', answers: ['Opposite the light', 'Toward the light', 'Straight up'], correct: 0 },
      { q: 'Complementary colors are…', answers: ['Opposite on the wheel', 'Next to each other', 'All the same'], correct: 0 },
      { q: 'Best way to start a drawing?', answers: ['Light sketch lines', 'Press hard right away', 'Final details first'], correct: 0 },
      { q: 'Cool colors tend to…', answers: ['Sink back', 'Pop forward', 'Glow'], correct: 0 },
    ],
    byMission: {
      basic_shapes: {
        tips: ['A face starts as a circle; a body as ovals and tubes.', 'Build big shapes first, details last.'],
        quiz: [{ q: 'A head usually starts as a…', answers: ['Circle', 'Square', 'Star'], correct: 0 }],
      },
      color_wheel: {
        tips: ['Red + yellow = orange; blue + yellow = green.', 'Three primary colors mix into everything.'],
        quiz: [{ q: 'Blue + yellow makes…', answers: ['Green', 'Purple', 'Orange'], correct: 0 }],
      },
    },
  },

  handoff: {
    studentDefault: 'Learner',
    projectName: 'My Art Studio',
    sheetTitle: 'ART DOJO — HANDOFF SETUP SHEET',
    aiPolishTemplate:
      'Translate these answers into ONE clean, warm "Personal preferences" block (150-220 words) ' +
      'telling Claude how to help {name} learn to draw: shapes-first, encouraging, no such thing as a mistake, ' +
      'one small step at a time. Output only the block text.',
    questionGroups: [
      {
        title: 'What you like to make',
        items: [
          ['artLikes', 'What do you love drawing most?', 'Characters, animals, cars, comics, nature?'],
          ['artStyle', 'What style do you like?', 'Cartoon, realistic, anime, pixel, doodles?'],
          ['artTools', 'What do you draw with?', 'Pencil, tablet, markers, in a game?'],
        ],
      },
      {
        title: 'How you learn',
        items: [
          ['artHelp', 'Want step-by-step or just ideas?', ''],
          ['artStuck', 'What feels hardest about drawing?', ''],
        ],
      },
    ],
    blocks: [
      {
        key: 'prefs',
        title: 'Claude Profile / Preferences',
        where: 'Settings → Personal preferences',
        bodyTemplate: `You are helping {name} learn to draw. Always start from simple shapes, build up step by step, and stay encouraging — there are no mistakes in art, only practice.

{name}'s art:
- Loves drawing: {artLikes}
- Style they like: {artStyle}
- Draws with: {artTools}

Response rules:
- Break subjects into basic shapes first.
- One small step to try next, every time.
- Praise effort and what's working before suggesting changes.`,
      },
    ],
  },
};

export default artDojoData;
