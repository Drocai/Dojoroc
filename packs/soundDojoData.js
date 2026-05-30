// Built-in GYM — music & sound. Same data shape as the starter.

const SHARED_RULES =
  '\n\nRules: Respond directly and concisely. You are talking with a parent and their kid, so keep it ' +
  'friendly, safe, and encouraging. Prefer short, action-first answers. Let them make sound and play ' +
  'before theory — music is something you do, not just read.';

const soundDojoData = {
  id: 'sound-dojo',
  name: 'Sound Dojo',
  subject: 'Music, rhythm & making songs',
  builtin: true,

  brand: { title: 'SOUND DOJO', icon: 'Music', accent: 'purple', coreLabel: 'BEAT CORE', coreUnit: 'BPM' },

  players: [
    { key: 'derrick', label: 'Derrick', chatName: 'Dad', color: 'purple', role: 'mentor' },
    { key: 'graysen', label: 'Graysen', chatName: 'Graysen', color: 'cyan', role: 'student' },
  ],

  sensei: {
    name: 'Tempo',
    title: 'AI SENSEI',
    greeting: "Beat Core thumping. I'm Tempo. Music is just patterns you can feel — let's make some. What sound's in your head?",
    placeholder: 'Ask Tempo about music & beats...',
  },

  lore: {
    tagline: 'Feel the beat. Build the song.',
    canon:
      'The Sound Dojo is a music lab where a father and son make beats and songs together. ' +
      'Every mission cleared and round played feeds the Beat Core (BPM). ' +
      'Tempo is the AI sensei guiding the climb from clapping rhythms to writing songs.',
    boot: 'Beat Core online · metronome synced · groove locked',
    emptyActivity: 'The Beat Core is silent. Clear a mission or play a round to start the groove.',
    levelUpTemplate: '🎵 {name} reached Groove Level {lvl} — the Beat Core thumps harder.',
    arcadeXpTemplate: '🥁 {name} dropped {xp} BPM in the arcade.',
  },

  missions: [
    { id: 'keep_beat', title: 'Find the Pulse', desc: 'Clap a steady beat in time', xp: 100 },
    { id: 'rhythm', title: 'Stack a Rhythm', desc: 'Build a simple rhythm pattern', xp: 150 },
    { id: 'melody', title: 'First Melody', desc: 'Make a short tune you can hum', xp: 200 },
    { id: 'song_parts', title: 'Build a Song', desc: 'Learn verse, chorus & hook', xp: 150 },
  ],

  modes: [
    {
      key: 'coach',
      label: 'Music Coach',
      note: 'Rhythm, melody & basics',
      system:
        'You are Tempo, the AI sensei of the Sound Dojo. You coach Derrick and his son Graysen in music — ' +
        'rhythm, melody, and how songs are built. Get them clapping, humming, or tapping before any theory. ' +
        'Use counts (1-2-3-4) and simple patterns. End with one thing to try out loud.' + SHARED_RULES,
    },
    {
      key: 'writer',
      label: 'Song Writer',
      note: 'Lyrics & song structure',
      system:
        'You are Tempo in Song Writer mode. You help write simple, fun, kid-appropriate songs — verses, a catchy ' +
        'chorus, and a hook. Build on their ideas and topics, suggest rhymes, and keep it playful and clean.' + SHARED_RULES,
    },
    {
      key: 'explain',
      label: 'How Music Works',
      note: 'The why behind sound',
      system:
        'You are Tempo in How-Music-Works mode. Explain music ideas simply — why some notes sound happy or sad, ' +
        'what a beat or tempo is, how instruments make sound — with everyday comparisons a kid gets.' + SHARED_RULES,
    },
  ],

  chat: { defaultRoom: 'graysen-dad-sound-dojo' },

  arcade: {
    tips: [
      'A beat is the steady pulse you tap your foot to.',
      'Tempo is how fast the beat goes, measured in BPM.',
      'Most pop songs count in groups of 4: 1-2-3-4.',
      'A melody is a tune you can hum; a rhythm is the pattern of long and short sounds.',
      'A chorus is the part that repeats and sticks in your head.',
      'High notes sound bright; low notes sound deep.',
      'Silence (rests) is part of music too.',
    ],
    quiz: [
      { q: 'The steady pulse you tap to is the…', answers: ['Beat', 'Lyrics', 'Cover'], correct: 0 },
      { q: 'BPM measures…', answers: ['How fast the beat is', 'How loud it is', 'How long the song is'], correct: 0 },
      { q: 'The catchy part that repeats is the…', answers: ['Chorus', 'Verse', 'Bridge'], correct: 0 },
      { q: 'A tune you can hum is a…', answers: ['Melody', 'Rhythm', 'Rest'], correct: 0 },
      { q: 'Most pop songs count in groups of…', answers: ['4', '3', '7'], correct: 0 },
      { q: 'High notes sound…', answers: ['Bright', 'Deep', 'Slow'], correct: 0 },
    ],
    byMission: {
      keep_beat: {
        tips: ['Tap your foot and clap on each tap — that\'s the beat.', 'Count out loud: 1-2-3-4, 1-2-3-4.'],
        quiz: [{ q: 'To keep a steady beat you can…', answers: ['Tap your foot', 'Hold your breath', 'Close your eyes'], correct: 0 }],
      },
      song_parts: {
        tips: ['Verse tells the story; chorus is the catchy repeat.', 'A hook is the bit you can\'t stop singing.'],
        quiz: [{ q: 'Which part repeats and sticks?', answers: ['Chorus', 'Verse', 'Intro'], correct: 0 }],
      },
    },
  },

  handoff: {
    studentDefault: 'Graysen',
    projectName: 'Graysen Sound Lab',
    sheetTitle: 'SOUND DOJO — HANDOFF SETUP SHEET',
    aiPolishTemplate:
      'Translate these raw kid answers into ONE clean, warm "Personal preferences" block (150-220 words) ' +
      'telling Claude how to help {name} make music: do-before-theory, counts and claps, playful, build on ' +
      'their favorite music. Output only the block text.',
    questionGroups: [
      {
        title: 'What you listen to',
        items: [
          ['musicLikes', 'What music do you love?', 'Artists, songs, or styles.'],
          ['instrument', 'Do you play or want to play anything?', 'Piano, drums, guitar, singing, making beats?'],
          ['makeMusic', 'Want to make beats, write songs, or just understand music?', ''],
        ],
      },
      {
        title: 'How you learn',
        items: [
          ['musicHelp', 'Like to try-by-doing or understand first?', ''],
          ['musicGoal', 'One musical thing you wish you could do?', ''],
        ],
      },
    ],
    blocks: [
      {
        key: 'prefs',
        title: 'Claude Profile / Preferences',
        where: 'Settings → Personal preferences',
        bodyTemplate: `You are helping {name} learn music with Dad. Get them clapping, humming, or tapping before any theory, use counts (1-2-3-4), and build on the music they already love.

{name}'s music:
- Loves listening to: {musicLikes}
- Plays/wants to play: {instrument}
- Wants to: {makeMusic}

Response rules:
- Do-before-explain: give something to try out loud first.
- Keep theory in plain language with everyday comparisons.
- Build on their favorite songs and ideas.`,
      },
    ],
  },
};

export default soundDojoData;
