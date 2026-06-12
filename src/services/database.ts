import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('learnbasilan.db');
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDb();

  await database.execAsync('PRAGMA foreign_keys = ON');

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      grade TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'student',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      bg_color TEXT,
      subject_order INTEGER
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'fil',
      chapter_number INTEGER DEFAULT 1,
      image_url TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      explanation TEXT,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      status TEXT DEFAULT 'locked',
      score REAL,
      completed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS imported_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      imported_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      student_name TEXT NOT NULL,
      grade TEXT NOT NULL,
      average_score INTEGER NOT NULL,
      completed_lessons INTEGER NOT NULL,
      total_lessons INTEGER NOT NULL,
      xp INTEGER NOT NULL,
      level INTEGER NOT NULL,
      streak INTEGER NOT NULL,
      subjects TEXT NOT NULL,
      scanned_at INTEGER NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS earned_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS teacher_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      created_by INTEGER NOT NULL,
      used_by INTEGER DEFAULT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (used_by) REFERENCES users(id)
    );
  `);

  // Add grade_level columns if they don't exist
  try {
    await database.execAsync('ALTER TABLE subjects ADD COLUMN grade_level INTEGER DEFAULT 1');
  } catch {}
  try {
    await database.execAsync('ALTER TABLE lessons ADD COLUMN grade_level INTEGER DEFAULT 1');
  } catch {}
  try {
    await database.execAsync('ALTER TABLE lessons ADD COLUMN created_by INTEGER DEFAULT NULL');
  } catch {}

  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM subjects'
  );

  if (count && count.count === 0) {
    await seedSubjects(database);
  }

  const lessonCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM lessons'
  );

  if (lessonCount && lessonCount.count === 0) {
    await seedLessons(database);
  }
}

async function seedSubjects(database: SQLite.SQLiteDatabase): Promise<void> {
  const defaultSubjects = [
    { name: 'Mathematics', icon: '🔢', color: '#FF7E5F', bg_color: '#FFE8E0', order: 1 },
    { name: 'Science', icon: '🔬', color: '#2EC4B6', bg_color: '#E0F5F3', order: 2 },
    { name: 'English', icon: '📝', color: '#FFD93D', bg_color: '#FFF3D6', order: 3 },
    { name: 'Filipino', icon: '🇵🇭', color: '#6BCB77', bg_color: '#E0F5E6', order: 4 },
    { name: 'Araling Panlipunan', icon: '🌏', color: '#9B5DE5', bg_color: '#F0E6FF', order: 5 },
  ];

  for (const s of defaultSubjects) {
    await database.runAsync(
      'INSERT INTO subjects (name, icon, color, bg_color, subject_order) VALUES (?, ?, ?, ?, ?)',
      [s.name, s.icon, s.color, s.bg_color, s.order]
    );
  }
}

async function seedLessons(database: SQLite.SQLiteDatabase): Promise<void> {
  const lessons: Array<{
    subject_id: number; title: string; content: string; language: string;
    chapter_number: number; grade_level: number;
    quizzes: Array<{ question: string; options: string[]; correct_answer: number; explanation: string }>;
  }> = [
    // GRADE 1 - Mathematics
    { subject_id: 1, title: 'Counting 1-10', content: 'Learn to count from 1 to 10. Each number represents a quantity. 1 means isa, 2 means dalawa, 3 means tatlo.', language: 'fil', chapter_number: 1, grade_level: 1, quizzes: [
      { question: 'Ilan ang 2 + 1?', options: ['2', '3', '4', '5'], correct_answer: 1, explanation: '2 + 1 = 3 (tatlo)' },
      { question: 'Ano ang kasunod ng 5?', options: ['4', '6', '7', '3'], correct_answer: 1, explanation: 'Ang kasunod ng 5 ay 6.' },
    ]},
    { subject_id: 1, title: 'Addition within 10', content: 'Addition means putting numbers together. 3 + 2 = 5. Use your fingers to count!', language: 'fil', chapter_number: 2, grade_level: 1, quizzes: [
      { question: '4 + 3 = ?', options: ['5', '6', '7', '8'], correct_answer: 2, explanation: '4 + 3 = 7' },
    ]},
    { subject_id: 1, title: 'Subtraction within 10', content: 'Subtraction means taking away. 5 - 2 = 3. You have 5 apples and eat 2, how many left?', language: 'fil', chapter_number: 3, grade_level: 1, quizzes: [
      { question: '6 - 2 = ?', options: ['3', '4', '5', '2'], correct_answer: 1, explanation: '6 - 2 = 4' },
    ]},

    // GRADE 1 - Science
    { subject_id: 2, title: 'Parts of the Body', content: 'Your body has parts: head (ulo), arms (braso), legs (binti), eyes (mata), ears (tainga), nose (ilong), mouth (bibig).', language: 'fil', chapter_number: 1, grade_level: 1, quizzes: [
      { question: 'Ano ang ginagamit sa pandinig?', options: ['Mata', 'Tainga', 'Ilong', 'Bibig'], correct_answer: 1, explanation: 'Ang tainga ay ginagamit sa pandinig.' },
    ]},
    { subject_id: 2, title: 'Animal Names', content: 'Different animals: aso (dog), pusa (cat), manok (chicken), baboy (pig), baka (cow), kambing (goat).', language: 'fil', chapter_number: 2, grade_level: 1, quizzes: [
      { question: 'Anong hayop ang tumatahol?', options: ['Pusa', 'Aso', 'Manok', 'Baka'], correct_answer: 1, explanation: 'Ang aso ay tumatahol.' },
    ]},

    // GRADE 1 - English
    { subject_id: 3, title: 'The Alphabet', content: 'The English alphabet has 26 letters: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z.', language: 'en', chapter_number: 1, grade_level: 1, quizzes: [
      { question: 'How many letters in the English alphabet?', options: ['24', '25', '26', '27'], correct_answer: 2, explanation: 'There are 26 letters.' },
    ]},
    { subject_id: 3, title: 'Simple Sentences', content: 'A sentence starts with a capital letter and ends with a period. Example: I am a student. The cat is small.', language: 'en', chapter_number: 2, grade_level: 1, quizzes: [
      { question: 'Which is a complete sentence?', options: ['The big dog', 'I like apples.', 'Running fast', 'Under the table'], correct_answer: 1, explanation: '"I like apples." has a subject and verb.' },
    ]},

    // GRADE 1 - Filipino
    { subject_id: 4, title: 'Pangngalan (Nouns)', content: 'Pangngalan ay mga salitang tumutukoy sa tao, hayop, bagay, lugar, at ideya. Halimbawa: Juan, aso, mesa, paaralan.', language: 'fil', chapter_number: 1, grade_level: 1, quizzes: [
      { question: 'Alin ang pangngalan?', options: ['Tumakbo', 'Maganda', 'Juan', 'Mabilis'], correct_answer: 2, explanation: 'Juan ay pangngalan (pangalan ng tao).' },
    ]},
    { subject_id: 4, title: 'Pandiwa (Verbs)', content: 'Pandiwa ay mga salitang nagpapahiwatig ng kilos. Halimbawa: kumain, tumakbo, nagbasa, uminom.', language: 'fil', chapter_number: 2, grade_level: 1, quizzes: [
      { question: 'Alin ang pandiwa?', options: ['Maganda', 'Tumakbo', 'Malaki', 'Asul'], correct_answer: 1, explanation: 'Tumakbo ay pandiwa (kilos).' },
    ]},

    // GRADE 1 - Araling Panlipunan
    { subject_id: 5, title: 'Ang Pamilya', content: 'Ang pamilya ay binubuo ng ama (father), ina (mother), at mga anak (children). Mayroon ding lolo at lola.', language: 'fil', chapter_number: 1, grade_level: 1, quizzes: [
      { question: 'Sino ang ama sa pamilya?', options: ['Ina', 'Anak', 'Lolo', 'Father'], correct_answer: 3, explanation: 'Ang ama ay father sa Ingles.' },
    ]},

    // GRADE 2 - Mathematics
    { subject_id: 1, title: 'Addition with Regrouping', content: 'When adding numbers, if the sum in one column is 10 or more, carry over to the next column. Example: 8 + 7 = 15, write 5 carry 1.', language: 'fil', chapter_number: 1, grade_level: 2, quizzes: [
      { question: '15 + 8 = ?', options: ['21', '22', '23', '24'], correct_answer: 2, explanation: '15 + 8 = 23' },
    ]},
    { subject_id: 1, title: 'Subtraction with Borrowing', content: 'When subtracting and the top digit is smaller, borrow from the next column. Example: 13 - 7 = 6.', language: 'fil', chapter_number: 2, grade_level: 2, quizzes: [
      { question: '20 - 9 = ?', options: ['10', '11', '12', '13'], correct_answer: 1, explanation: '20 - 9 = 11' },
    ]},
    { subject_id: 1, title: 'Multiplication Basics', content: 'Multiplication is repeated addition. 3 x 4 means 3 groups of 4 = 12. Memorize your multiplication table!', language: 'fil', chapter_number: 3, grade_level: 2, quizzes: [
      { question: '5 x 3 = ?', options: ['12', '15', '18', '20'], correct_answer: 1, explanation: '5 x 3 = 15' },
    ]},

    // GRADE 2 - Science
    { subject_id: 2, title: 'Weather', content: 'Weather describes the condition outside: mainit (hot), malamig (cold), maulan (rainy), maaraw (sunny), mahangin (windy).', language: 'fil', chapter_number: 1, grade_level: 2, quizzes: [
      { question: 'Anong panahon kapag umaulan?', options: ['Maaraw', 'Maulan', 'Mainit', 'Mahangin'], correct_answer: 1, explanation: 'Maulan kapag may ulan.' },
    ]},
    { subject_id: 2, title: 'Plants and Animals', content: 'Plants need sunlight, water, and soil to grow. Animals need food, water, and shelter to survive.', language: 'fil', chapter_number: 2, grade_level: 2, quizzes: [
      { question: 'Ano ang kailangan ng halaman?', options: ['Lamok', 'Tubig at araw', 'Semento', 'Bakal'], correct_answer: 1, explanation: 'Ang halaman ay kailangan ng tubig at araw.' },
    ]},

    // GRADE 2 - English
    { subject_id: 3, title: 'Opposite Words', content: 'Opposite words have contrasting meanings: big/small, hot/cold, happy/sad, fast/slow, up/down.', language: 'en', chapter_number: 1, grade_level: 2, quizzes: [
      { question: 'What is the opposite of "big"?', options: ['Large', 'Small', 'Tall', 'Wide'], correct_answer: 1, explanation: 'The opposite of big is small.' },
    ]},
    { subject_id: 3, title: 'Singular and Plural', content: 'Singular means one, plural means more than one. Add -s or -es: cat/cats, box/boxes, baby/babies.', language: 'en', chapter_number: 2, grade_level: 2, quizzes: [
      { question: 'What is the plural of "child"?', options: ['Childs', 'Children', 'Childes', 'Childies'], correct_answer: 1, explanation: 'The plural of child is children.' },
    ]},

    // GRADE 2 - Filipino
    { subject_id: 4, title: 'Pang-uri (Adjectives)', content: 'Pang-uri ay mga salitang naglalarawan sa pangngalan. Halimbawa: maganda, malaki, mabilis, mabait.', language: 'fil', chapter_number: 1, grade_level: 2, quizzes: [
      { question: 'Alin ang pang-uri?', options: ['Tumakbo', 'Maganda', 'Juan', 'Dito'], correct_answer: 1, explanation: 'Maganda ay pang-uri.' },
    ]},

    // GRADE 2 - Araling Panlipunan
    { subject_id: 5, title: 'Ang Komunidad', content: 'Ang komunidad ay grupo ng mga taong nakatira sa iisang lugar. Mayroong mga matatanda, guro, doktor, at pulis.', language: 'fil', chapter_number: 1, grade_level: 2, quizzes: [
      { question: 'Sino ang nagpoprotekta sa komunidad?', options: ['Guro', 'Doktor', 'Pulis', 'Manunulat'], correct_answer: 2, explanation: 'Ang pulis ay nagpoprotekta sa komunidad.' },
    ]},

    // GRADE 3 - Mathematics
    { subject_id: 1, title: 'Multiplication Tables 1-5', content: 'Memorize multiplication tables: 1x1=1, 2x3=6, 4x5=20. Use patterns to remember easier.', language: 'fil', chapter_number: 1, grade_level: 3, quizzes: [
      { question: '4 x 6 = ?', options: ['20', '22', '24', '26'], correct_answer: 2, explanation: '4 x 6 = 24' },
    ]},
    { subject_id: 1, title: 'Division Basics', content: 'Division is splitting into equal groups. 12 ÷ 3 = 4 means 12 divided into 3 groups of 4.', language: 'fil', chapter_number: 2, grade_level: 3, quizzes: [
      { question: '18 ÷ 3 = ?', options: ['5', '6', '7', '8'], correct_answer: 1, explanation: '18 ÷ 3 = 6' },
    ]},
    { subject_id: 1, title: 'Fractions', content: 'A fraction shows part of a whole. 1/2 means one half. The top number is numerator, bottom is denominator.', language: 'fil', chapter_number: 3, grade_level: 3, quizzes: [
      { question: 'Ano ang numerator sa 3/4?', options: ['4', '3', '7', '1'], correct_answer: 1, explanation: 'Ang numerator ay ang itaas na number (3).' },
    ]},

    // GRADE 3 - Science
    { subject_id: 2, title: 'The Five Senses', content: 'We have five senses: sight (mata), hearing (tainga), smell (ilong), taste (dila), touch (kamay).', language: 'fil', chapter_number: 1, grade_level: 3, quizzes: [
      { question: 'Anong pandama ang ginagamit sa panlasa?', options: ['Mata', 'Dila', 'Ilong', 'Kamay'], correct_answer: 1, explanation: 'Ang dila ay pandama sa panlasa.' },
    ]},
    { subject_id: 2, title: 'Life Cycles', content: 'Animals go through life cycles. Butterfly: egg → caterpillar → pupa → butterfly. Frog: egg → tadpole → frog.', language: 'fil', chapter_number: 2, grade_level: 3, quizzes: [
      { question: 'Ano ang unang stage ng buhay ng paruparo?', options: ['Caterpillar', 'Butterfly', 'Itlog', 'Pupa'], correct_answer: 2, explanation: 'Ang itlog ay unang stage.' },
    ]},

    // GRADE 3 - English
    { subject_id: 3, title: 'Past Tense', content: 'Past tense tells what happened before. Regular: add -ed (walk→walked). Irregular: go→went, eat→ate.', language: 'en', chapter_number: 1, grade_level: 3, quizzes: [
      { question: 'What is the past tense of "run"?', options: ['Runned', 'Ran', 'Running', 'Runs'], correct_answer: 1, explanation: 'The past tense of run is ran.' },
    ]},
    { subject_id: 3, title: 'Adjectives and Adverbs', content: 'Adjectives describe nouns (beautiful flower). Adverbs describe verbs (run quickly).', language: 'en', chapter_number: 2, grade_level: 3, quizzes: [
      { question: 'Which is an adverb?', options: ['Beautiful', 'Quickly', 'Happy', 'Tall'], correct_answer: 1, explanation: 'Quickly is an adverb describing how something is done.' },
    ]},

    // GRADE 3 - Filipino
    { subject_id: 4, title: 'Panghalip (Pronouns)', content: 'Panghalip ay salitang halili sa pangngalan. ako/ikaw/siya, kami/kayo/sila, ito/iyon/ano.', language: 'fil', chapter_number: 1, grade_level: 3, quizzes: [
      { question: 'Alin ang panghalip?', options: ['Juan', 'Siya', 'Maganda', 'Tumakbo'], correct_answer: 1, explanation: 'Siya ay panghalip.' },
    ]},

    // GRADE 3 - Araling Panlipunan
    { subject_id: 5, title: 'Mga Panauhan', content: 'Ang mga panauhan ay mga lugar na pinupuntahan ng mga tao: paaralan, ospital, simbahan, palengke.', language: 'fil', chapter_number: 1, grade_level: 3, quizzes: [
      { question: 'Saan nagpupunta ang mga estudyante?', options: ['Ospital', 'Paaralan', 'Simbahan', 'Palengke'], correct_answer: 1, explanation: 'Ang mga estudyante ay nagpupunta sa paaralan.' },
    ]},

    // GRADE 4 - Mathematics
    { subject_id: 1, title: 'Long Multiplication', content: 'Multiply larger numbers step by step. Example: 23 x 4 = (20x4) + (3x4) = 80 + 12 = 92.', language: 'fil', chapter_number: 1, grade_level: 4, quizzes: [
      { question: '34 x 2 = ?', options: ['56', '64', '68', '72'], correct_answer: 2, explanation: '34 x 2 = 68' },
    ]},
    { subject_id: 1, title: 'Long Division', content: 'Divide step by step with remainders. Example: 45 ÷ 7 = 6 remainder 3.', language: 'fil', chapter_number: 2, grade_level: 4, quizzes: [
      { question: '50 ÷ 6 = ?', options: ['7 remainder 2', '8 remainder 2', '8 remainder 4', '9 remainder 1'], correct_answer: 1, explanation: '50 ÷ 6 = 8 remainder 2' },
    ]},

    // GRADE 4 - Science
    { subject_id: 2, title: 'Food Groups', content: 'Food groups: grains (bigas), vegetables (gulay), fruits (prutas), protein (karne, isda), dairy (gatas).', language: 'fil', chapter_number: 1, grade_level: 4, quizzes: [
      { question: 'Alin ang属于 sa food group ng prutas?', options: ['Bigas', 'Karne', 'Saging', 'Gatas'], correct_answer: 2, explanation: 'Ang saging ay prutas.' },
    ]},
    { subject_id: 2, title: 'States of Matter', content: 'Matter has three states: solid (matigas), liquid (likido), gas (gas). Water can be ice, water, or steam.', language: 'fil', chapter_number: 2, grade_level: 4, quizzes: [
      { question: 'Ano ang state ng tubig kapag nagyeyelo?', options: ['Liquid', 'Gas', 'Solid', 'Plasma'], correct_answer: 2, explanation: 'Ice ay solid na tubig.' },
    ]},

    // GRADE 4 - English
    { subject_id: 3, title: 'Conjunctions', content: 'Conjunctions connect words or sentences: and, but, or, so, because. Example: I ran and jumped.', language: 'en', chapter_number: 1, grade_level: 4, quizzes: [
      { question: 'Which is a conjunction?', options: ['Run', 'Beautiful', 'But', 'Quickly'], correct_answer: 2, explanation: '"But" is a conjunction.' },
    ]},

    // GRADE 4 - Filipino
    { subject_id: 4, title: 'Paggawa ng Pangungusap', content: 'Ang pangungusap ay may simulu, gitna, at wakas. Dapat may paksa at predicates.', language: 'fil', chapter_number: 1, grade_level: 4, quizzes: [
      { question: 'Alin ang tamang pangungusap?', options: ['Tumakbo ang', 'Ang bata ay mabait', 'Mabait ang bata', 'Bata mabait'], correct_answer: 2, explanation: '"Mabait ang bata" ay kumpleto.' },
    ]},

    // GRADE 4 - Araling Panlipunan
    { subject_id: 5, title: 'Ang Pilipinas', content: 'Ang Pilipinas ay binubuo ng 7,641 na pulo. May 17 rehiyon at 81 na probinsya. Ang Maynila ang kabisera.', language: 'fil', chapter_number: 1, grade_level: 4, quizzes: [
      { question: 'Ilan ang pulo ng Pilipinas?', options: ['7,000', '7,641', '8,000', '7,500'], correct_answer: 1, explanation: 'Ang Pilipinas ay may 7,641 pulo.' },
    ]},

    // GRADE 5 - Mathematics
    { subject_id: 1, title: 'Decimals', content: 'Decimals use a point to show parts of a whole. 3.5 means 3 and 5 tenths. Used in money and measurements.', language: 'fil', chapter_number: 1, grade_level: 5, quizzes: [
      { question: 'Ano ang 2.5 + 1.3?', options: ['3.7', '3.8', '4.0', '3.5'], correct_answer: 1, explanation: '2.5 + 1.3 = 3.8' },
    ]},
    { subject_id: 1, title: 'Percentages', content: 'Percent means per hundred. 50% means 50 out of 100. To find 25% of 80: 80 x 0.25 = 20.', language: 'fil', chapter_number: 2, grade_level: 5, quizzes: [
      { question: 'Ano ang 10% ng 200?', options: ['10', '20', '30', '40'], correct_answer: 1, explanation: '10% ng 200 = 20' },
    ]},

    // GRADE 5 - Science
    { subject_id: 2, title: 'The Solar System', content: 'The Solar System has 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', language: 'fil', chapter_number: 1, grade_level: 5, quizzes: [
      { question: 'Alin ang pinakamalapit sa araw?', options: ['Venus', 'Mars', 'Mercury', 'Earth'], correct_answer: 2, explanation: 'Mercury ang pinakamalapit sa araw.' },
    ]},
    { subject_id: 2, title: 'Ecosystems', content: 'An ecosystem is a community of living and non-living things working together. Forests, oceans, and deserts are ecosystems.', language: 'fil', chapter_number: 2, grade_level: 5, quizzes: [
      { question: 'Ano ang ecosystem?', options: ['Isang hayop', 'Komunidad ng buhay at hindi buhay', 'Isang halaman', 'Isang bato'], correct_answer: 1, explanation: 'Ang ecosystem ay komunidad ng buhay at hindi buhay na bagay.' },
    ]},

    // GRADE 5 - English
    { subject_id: 3, title: 'Active and Passive Voice', content: 'Active voice: The boy kicked the ball. Passive voice: The ball was kicked by the boy.', language: 'en', chapter_number: 1, grade_level: 5, quizzes: [
      { question: 'Which is passive voice?', options: ['She writes a letter', 'A letter is written by her', 'She is writing', 'She will write'], correct_answer: 1, explanation: '"A letter is written by her" is passive voice.' },
    ]},

    // GRADE 5 - Filipino
    { subject_id: 4, title: 'Tayutay (Figures of Speech)', content: 'Tayutay makes language colorful: pagtutulad (simile), sininepersonipika (personification), hiperbola (hyperbole).', language: 'fil', chapter_number: 1, grade_level: 5, quizzes: [
      { question: 'Alin ang halimbawa ng pagtutulad?', options: ['Ang bulaklak ay tumatawa', 'Mabait siya gaya ng ina', 'Milyung milyon ang tao', 'Ang buhay ay paraiso'], correct_answer: 1, explanation: '"Gaya ng" ay tanda ng pagtutulad.' },
    ]},

    // GRADE 5 - Araling Panlipunan
    { subject_id: 5, title: 'Heograpiya ng Pilipinas', content: 'Ang Pilipinas ay nasa Timog-Silangang Asya. May tatlong pangunahing rehiyon: Luzon, Visayas, at Mindanao.', language: 'fil', chapter_number: 1, grade_level: 5, quizzes: [
      { question: 'Saan matatagpuan ang Mindanao?', options: ['Hilaga', 'Gitna', 'Timog', 'Silangan'], correct_answer: 2, explanation: 'Ang Mindanao ay nasa Timog ng Pilipinas.' },
    ]},

    // GRADE 6 - Mathematics
    { subject_id: 1, title: 'Ratios and Proportions', content: 'A ratio compares two quantities. 2:3 means for every 2 of one thing, there are 3 of another. Used in cooking and maps.', language: 'fil', chapter_number: 1, grade_level: 6, quizzes: [
      { question: 'Ano ang ratio ng 10 sa 5?', options: ['1:2', '2:1', '5:1', '10:5'], correct_answer: 1, explanation: '10:5 = 2:1 (simplified)' },
    ]},
    { subject_id: 1, title: 'Area and Perimeter', content: 'Perimeter is the distance around a shape. Area is the space inside. Rectangle: P=2(L+W), A=LxW.', language: 'fil', chapter_number: 2, grade_level: 6, quizzes: [
      { question: 'Ano ang area ng rectangle na L=5, W=3?', options: ['15', '16', '8', '30'], correct_answer: 0, explanation: 'Area = 5 x 3 = 15' },
    ]},

    // GRADE 6 - Science
    { subject_id: 2, title: 'Human Body Systems', content: 'Body systems: circulatory (dugo), respiratory (hininga), digestive (pagkain), nervous (utak).', language: 'fil', chapter_number: 1, grade_level: 6, quizzes: [
      { question: 'Anong system ang nagdadala ng dugo?', options: ['Respiratory', 'Circulatory', 'Digestive', 'Nervous'], correct_answer: 1, explanation: 'Ang circulatory system ang nagdadala ng dugo.' },
    ]},
    { subject_id: 2, title: 'Forces and Motion', content: 'Forces can push, pull, or twist. Friction opposes motion. Gravity pulls objects toward Earth.', language: 'fil', chapter_number: 2, grade_level: 6, quizzes: [
      { question: 'Anong force ang humihila sa atin pababa?', options: ['Friction', 'Gravity', 'Magnetism', 'Electricity'], correct_answer: 1, explanation: 'Ang gravity ang humihila sa atin pababa.' },
    ]},

    // GRADE 6 - English
    { subject_id: 3, title: 'Tenses Review', content: 'Past: I walked. Present: I walk/walking. Future: I will walk. Master all three for good communication.', language: 'en', chapter_number: 1, grade_level: 6, quizzes: [
      { question: 'Which is future tense?', options: ['I walked', 'I walk', 'I will walk', 'I am walking'], correct_answer: 2, explanation: '"I will walk" is future tense.' },
    ]},

    // GRADE 6 - Filipino
    { subject_id: 4, title: 'Pagbasa at Pagsusuri', content: 'Ang pagbasa ay pag-unawa sa binabasa. Kailangang intindihin ang diwa ng teksto at suriin ang mga ideya.', language: 'fil', chapter_number: 1, grade_level: 6, quizzes: [
      { question: 'Ano ang layunin ng pagsusuri?', options: ['Magbasa lang', 'Intindihin at suriin', 'Takutin', 'Baguhin'], correct_answer: 1, explanation: 'Ang pagsusuri ay upang intindihin at suriin ang teksto.' },
    ]},

    // GRADE 6 - Araling Panlipunan
    { subject_id: 5, title: 'Kultura ng Pilipinas', content: 'Ang kultura ng Pilipinas ay mayaman: fiesta, sayaw, awit, pagkain, at tradisyon ng bawat rehiyon.', language: 'fil', chapter_number: 1, grade_level: 6, quizzes: [
      { question: 'Ano ang tawag sa selebrasyon sa baryo?', options: ['Pista', 'Eleksyon', 'Bagong Taon', 'Semana Santa'], correct_answer: 0, explanation: 'Ang pista ay selebrasyon sa baryo.' },
    ]},
  ];

  for (const lesson of lessons) {
    const result = await database.runAsync(
      'INSERT INTO lessons (subject_id, title, content, language, chapter_number, grade_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [lesson.subject_id, lesson.title, lesson.content, lesson.language, lesson.chapter_number, lesson.grade_level, Date.now()]
    );

    for (const quiz of lesson.quizzes) {
      await database.runAsync(
        'INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?)',
        [result.lastInsertRowId, quiz.question, JSON.stringify(quiz.options), quiz.correct_answer, quiz.explanation]
      );
    }
  }
}

export async function saveStudentReport(
  teacherId: number,
  report: {
    student_name: string;
    grade: string;
    average_score: number;
    completed_lessons: number;
    total_lessons: number;
    xp: number;
    level: number;
    streak: number;
    subjects: { name: string; avg: number; completed: number; total: number }[];
  }
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO student_reports (teacher_id, student_name, grade, average_score, completed_lessons, total_lessons, xp, level, streak, subjects, scanned_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      teacherId,
      report.student_name,
      report.grade,
      report.average_score,
      report.completed_lessons,
      report.total_lessons,
      report.xp,
      report.level,
      report.streak,
      JSON.stringify(report.subjects),
      Date.now(),
    ]
  );
  return result.lastInsertRowId;
}

export async function getStudentReports(teacherId: number): Promise<any[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM student_reports WHERE teacher_id = ? ORDER BY scanned_at DESC',
    [teacherId]
  );
  return rows.map(r => ({
    ...r,
    subjects: typeof r.subjects === 'string' ? JSON.parse(r.subjects) : r.subjects,
  }));
}

export async function deleteStudentReport(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM student_reports WHERE id = ?', [id]);
}
