<div align="center">

<!-- Cinematic Header with Animated Glow and Real Logo -->
<svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF7E5F;stop-opacity:1">
        <animate attributeName="stop-color" values="#FF7E5F;#2EC4B6;#FFD93D;#FF7E5F" dur="8s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:#2EC4B6;stop-opacity:1">
        <animate attributeName="stop-color" values="#2EC4B6;#FFD93D;#FF7E5F;#2EC4B6" dur="8s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Pulsing Background Aura -->
  <circle cx="120" cy="120" r="100" fill="url(#logoGrad)" opacity="0.1">
    <animate attributeName="r" values="100;110;100" dur="4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.1;0.2;0.1" dur="4s" repeatCount="indefinite"/>
  </circle>
  
  <!-- Logo Container with Glow -->
  <g filter="url(#glow)">
    <circle cx="120" cy="120" r="85" fill="white" opacity="0.1" stroke="url(#logoGrad)" stroke-width="2"/>
    <clipPath id="circleClip">
      <circle cx="120" cy="120" r="80" />
    </clipPath>
    <!-- Actual App Logo (using absolute URL for GitHub compatibility) -->
    <image xlink:href="https://raw.githubusercontent.com/LikeNmuFF/Novu/main/assets/icon.png" x="40" y="40" width="160" height="160" clip-path="url(#circleClip)" />
  </g>
  
  <!-- Floating Particles -->
  <circle cx="50" cy="50" r="3" fill="#FF7E5F">
    <animate attributeName="cy" values="50;30;50" dur="5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="190" cy="180" r="2.5" fill="#2EC4B6">
    <animate attributeName="cy" values="180;160;180" dur="4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.2;0.7;0.2" dur="4s" repeatCount="indefinite"/>
  </circle>
  <circle cx="210" cy="60" r="2" fill="#FFD93D">
    <animate attributeName="cy" values="60;40;60" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.4;0.9;0.4" dur="6s" repeatCount="indefinite"/>
  </circle>
</svg>

# LearnBasilan

<svg width="300" height="4" viewBox="0 0 300 4" xmlns="http://www.w3.org/2000/svg">
  <line x1="0" y1="2" x2="300" y2="2" stroke="#FF7E5F" stroke-width="3" stroke-dasharray="10 10">
    <animate attributeName="stroke-dashoffset" values="0;20" dur="1.5s" repeatCount="indefinite"/>
  </line>
</svg>

### Offline-First Mother Tongue Mobile Learning System with QR-Based Content Distribution

<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 25px 0">

<!-- Custom Branded Badges -->
<svg width="100" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="32" rx="16" fill="#FF7E5F"/>
  <text x="50" y="21" text-anchor="middle" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">v1.0.1</text>
  <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite"/>
</svg>

<svg width="140" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="140" height="32" rx="16" fill="#2EC4B6"/>
  <text x="70" y="21" text-anchor="middle" fill="white" font-family="sans-serif" font-size="11" font-weight="bold">React Native 0.76.9</text>
</svg>

<svg width="110" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="110" height="32" rx="16" fill="#1A535C"/>
  <text x="55" y="21" text-anchor="middle" fill="white" font-family="sans-serif" font-size="11" font-weight="bold">Expo SDK 52</text>
</svg>

<svg width="110" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="110" height="32" rx="16" fill="#3178C6"/>
  <text x="55" y="21" text-anchor="middle" fill="white" font-family="sans-serif" font-size="11" font-weight="bold">TypeScript 5.3</text>
</svg>

<svg width="90" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="90" height="32" rx="16" fill="#6BCB77"/>
  <text x="45" y="21" text-anchor="middle" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">MIT</text>
</svg>

</div>

**Empowering education through mother tongue learning for Basilan, Philippines**

[Getting Started](#getting-started) | [Features](#features) | [Tech Stack](#tech-stack) | [Architecture](#architecture) | [Contributing](#contributing)

</div>

---

<svg width="100%" height="2" xmlns="http://www.w3.org/2000/svg">
  <line x1="0" y1="1" x2="100%" y2="1" stroke="url(#gradLine)" stroke-width="2">
    <animate attributeName="x1" values="0;100%;0" dur="10s" repeatCount="indefinite"/>
  </line>
  <defs>
    <linearGradient id="gradLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FF6B6B"/>
      <stop offset="50%" style="stop-color:#4ECDC4"/>
      <stop offset="100%" style="stop-color:#45B7D1"/>
    </linearGradient>
  </defs>
</svg>

## Overview

LearnBasilan is a mobile learning application designed for elementary students in Basilan, Philippines. The app provides an offline-first learning experience with support for **5 languages**: Filipino, Chavacano, Yakan, Tausug, and English.

The platform enables students to learn subjects, take quizzes, track progress, and earn achievements — all without requiring internet connectivity. Teachers can create content, generate QR codes for lesson distribution, and collect student progress reports via QR scanning.

**Key Principle:** No internet? No problem. Every feature works offline.

---

## Features

### For Students

- **Multi-Language Support** — Learn in Filipino, Chavacano, Yakan, Tausug, or English
- **Interactive Lessons** — Read through structured lessons with images and examples
- **Quizzes & Assessment** — Test knowledge with multiple-choice questions
- **Progress Tracking** — Monitor completed lessons, quiz scores, and learning streaks
- **Achievements & Badges** — Earn rewards for completing milestones
- **XP & Leveling System** — Gain experience points and level up
- **QR Code Import** — Receive lessons, quizzes, and content from teachers via QR codes
- **Progress Sharing** — Generate QR codes to share progress with teachers
- **Text-to-Speech** — Listen to lessons read aloud (Filipino & English)

### For Teachers

- **Content Creator** — Create and edit lessons and quizzes directly in the app
- **QR Distribution** — Generate QR codes for lessons, quizzes, and subjects
- **Progress Scanner** — Scan student QR codes to import progress reports
- **Dashboard Analytics** — View student performance, averages, and identify struggling students
- **Multi-Language Content** — Create content in any supported language

---

## Tech Stack

| Category             | Technology                                     |
| -------------------- | ---------------------------------------------- |
| **Mobile Framework** | React Native 0.76.9                            |
| **Runtime**          | Expo SDK 52                                    |
| **Language**         | TypeScript 5.3                                 |
| **Database**         | expo-sqlite (SQLite)                           |
| **State Management** | Zustand                                        |
| **Forms**            | React Hook Form + Zod                          |
| **Localization**     | i18next + react-i18next                        |
| **QR Code**          | react-native-qrcode-svg + expo-barcode-scanner |
| **Speech**           | expo-speech                                    |
| **Secure Storage**   | expo-crypto (SHA-256 hashing)                  |
| **Local Storage**    | AsyncStorage                                   |

---

## Architecture

### Project Structure

```
Offline-Learning-App/
├── App.tsx                          # Root component with screen flow
├── app.json                         # Expo configuration
├── eas.json                         # EAS Build profiles
├── package.json                     # Dependencies
├── src/
│   ├── components/                  # Reusable UI components
│   │   └── AvatarPicker.tsx
│   ├── screens/                     # 13 app screens
│   │   ├── SplashScreen.tsx         # App loading
│   │   ├── LanguageScreen.tsx       # Language selection
│   │   ├── OnboardingScreen.tsx     # First-time user onboarding
│   │   ├── LoginScreen.tsx          # Student/Teacher login
│   │   ├── RegisterScreen.tsx       # New account registration
│   │   ├── HomeScreen.tsx           # Student dashboard
│   │   ├── SubjectDetailScreen.tsx  # Subject chapters & lessons
│   │   ├── LessonViewerScreen.tsx   # Lesson content reader
│   │   ├── QuizEngineScreen.tsx     # Quiz taking interface
│   │   ├── QRScannerScreen.tsx      # QR code scanner
│   │   ├── QRGeneratorScreen.tsx    # QR code generator
│   │   ├── TeacherDashboardScreen.tsx    # Teacher analytics
│   │   └── TeacherLessonCreatorScreen.tsx # Content creation
│   ├── services/                    # Business logic & data
│   │   ├── database.ts              # SQLite schema & initialization
│   │   ├── auth.ts                  # Authentication (SHA-256)
│   │   ├── progress.ts             # Progress tracking & badges
│   │   └── contentStore.ts         # Imported content management
│   ├── types/                       # TypeScript type definitions
│   │   └── qr.ts                   # QR payload types
│   ├── utils/                       # Utility functions
│   │   └── qr/                     # QR transfer system
│   │       ├── compress.ts         # Pako compression + base64
│   │       ├── chunk.ts            # Multi-QR chunking
│   │       ├── crc32.ts            # Integrity verification
│   │       ├── package.ts          # High-level API
│   │       └── index.ts            # Public exports
│   ├── theme/                       # Design system
│   │   └── colors.ts              # Color palette & shadows
│   └── translations/               # i18n localization
│       ├── en.json                 # English (403 keys - complete)
│       ├── fil.json                # Filipino (placeholder)
│       ├── chavacano.json          # Chavacano (placeholder)
│       ├── yakan.json              # Yakan (placeholder)
│       ├── tausug.json             # Tausug (placeholder)
│       ├── TRANSLATION_TEMPLATE.csv # Translator spreadsheet
│       ├── csv_to_json.py          # CSV → JSON converter
│       └── TRANSLATOR_GUIDE.md     # Translation instructions
```

### Database Schema

| Table              | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `users`            | Student & teacher accounts                                  |
| `subjects`         | Mathematics, Science, English, Filipino, Araling Panlipunan |
| `lessons`          | Lesson content with language and chapter ordering           |
| `quizzes`          | Multiple-choice questions linked to lessons                 |
| `progress`         | Student lesson completion and scores                        |
| `user_stats`       | XP, level, and streak tracking                              |
| `earned_badges`    | Achievement badges earned by students                       |
| `imported_content` | Content imported via QR codes                               |

### QR Transfer System

The QR ecosystem is the primary method for distributing educational content offline.

**Architecture:**

<svg width="100%" height="80" viewBox="0 0 800 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="110" height="40" rx="8" fill="#FF6B6B" opacity="0.8">
    <text x="65" y="45" text-anchor="middle" fill="white" font-size="11">Compress</text>
  </rect>
  <line x1="120" y1="40" x2="160" y2="40" stroke="#4ECDC4" stroke-width="2" stroke-dasharray="5 5">
    <animate attributeName="stroke-dashoffset" values="0;20" dur="1s" repeatCount="indefinite"/>
  </line>
  <rect x="160" y="20" width="110" height="40" rx="8" fill="#4ECDC4" opacity="0.8">
    <text x="215" y="45" text-anchor="middle" fill="white" font-size="11">Chunk</text>
  </rect>
  <line x1="270" y1="40" x2="310" y2="40" stroke="#45B7D1" stroke-width="2" stroke-dasharray="5 5">
    <animate attributeName="stroke-dashoffset" values="0;20" dur="1s" repeatCount="indefinite" begin="0.3s"/>
  </line>
  <rect x="310" y="20" width="110" height="40" rx="8" fill="#45B7D1" opacity="0.8">
    <text x="365" y="45" text-anchor="middle" fill="white" font-size="11">CRC32</text>
  </rect>
  <line x1="420" y1="40" x2="460" y2="40" stroke="#96CEB4" stroke-width="2" stroke-dasharray="5 5">
    <animate attributeName="stroke-dashoffset" values="0;20" dur="1s" repeatCount="indefinite" begin="0.6s"/>
  </line>
  <rect x="460" y="20" width="110" height="40" rx="8" fill="#96CEB4" opacity="0.8">
    <text x="515" y="45" text-anchor="middle" fill="white" font-size="11">QR Code</text>
  </rect>
  <line x1="570" y1="40" x2="610" y2="40" stroke="#FF6B6B" stroke-width="2" stroke-dasharray="5 5">
    <animate attributeName="stroke-dashoffset" values="0;20" dur="1s" repeatCount="indefinite" begin="0.9s"/>
  </line>
  <rect x="610" y="20" width="110" height="40" rx="8" fill="#FF6B6B" opacity="0.8">
    <text x="665" y="45" text-anchor="middle" fill="white" font-size="11">✅ Done</text>
  </rect>
</svg>

1. **Compression** — Pako (deflate level 9) + base64 encoding (60-96% size reduction)
2. **Chunking** — Splits data into ≤1800 character chunks for safe QR scanning
3. **Integrity** — CRC32 checksums verify data wasn't corrupted during transfer
4. **Reconstruction** — Automatic reassembly when all chunks are scanned

**Supported QR Content Types:**

- Lessons (with images, examples, translations)
- Quizzes (questions, choices, explanations)
- Subjects (metadata and structure)
- Progress Reports (student performance data)
- Translation Packages (vocabulary lists)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/build/setup/) (for building)
- Android Studio or physical Android device (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/LikeNmuFF/Novu.git
cd Offline-Learning-App

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

```bash
# Android (requires Android Studio or connected device)
npx expo start --android

# iOS (requires macOS and Xcode)
npx expo start --ios
```

### Building for Production

```bash
# Build APK for Android
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production
```

---

## Screen Flow

```
Splash Screen
    ↓
Language Selection (Filipino / Chavacano / Yakan / Tausug / English)
    ↓
Onboarding (first-time users)
    ↓
Login / Register
    ↓
Student App                          Teacher Dashboard
├── Home                             ├── Dashboard Overview
├── Subjects & Lessons               ├── Content Creator
├── Quizzes                          ├── QR Distribution Center
├── Progress Tracking                ├── Student Progress Import
├── Rewards & Badges                 └── Analytics
└── Profile
```

---

## Gamification System

### XP Rewards

| Action             | XP      |
| ------------------ | ------- |
| Lesson Completed   | +10 XP  |
| Quiz Passed        | +50 XP  |
| Perfect Quiz Score | +100 XP |

### Level Progression

| Level | XP Required |
| ----- | ----------- |
| 1     | 0           |
| 2     | 100         |
| 3     | 250         |
| 4     | 500         |
| ...   | Scaling     |

### Achievements

- First Lesson Completed
- First Quiz Passed
- Perfect Score
- 5-Day Streak
- 10 Lessons Completed
- 100 XP Earned
- And more...

---

## Supported Languages

| Language  | Status                 |
| --------- | ---------------------- |
| English   | Complete (403 UI keys) |
| Filipino  | Pending translation    |
| Chavacano | Pending translation    |
| Yakan     | Pending translation    |
| Tausug    | Pending translation    |

### Contributing Translations

See [TRANSLATOR_GUIDE.md](src/translations/TRANSLATOR_GUIDE.md) for instructions on contributing translations.

```bash
# Convert completed CSV translations to JSON
python src/translations/csv_to_json.py
```

---

## Design System

### Color Palette

- **Coral** — Primary actions, headers
- **Teal** — Science, success states
- **Gold** — Achievements, rewards
- **Green** — Progress, completion
- **Ocean** — Text, backgrounds

### Design Principles

- Child-friendly, gamified interface
- Rounded cards and large touch targets
- Bright, engaging colors
- Progress animations and celebrations
- Minimum 16px text for readability
- High contrast for accessibility

---

## Building

### EAS Build Profiles

| Profile       | Purpose                           | Channel     |
| ------------- | --------------------------------- | ----------- |
| `development` | Development builds with dev tools | development |
| `preview`     | Testing and QA                    | preview     |
| `production`  | Production release                | production  |

### Build Configuration

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

---

## Project Status

### Completed

- [x] QR Transfer Architecture (compression, chunking, CRC32)
- [x] SQLite database schema
- [x] Authentication system (SHA-256 password hashing)
- [x] 13 React Native screens
- [x] i18n translation system (English complete)
- [x] Translation workflow (CSV template + converter)
- [x] Design token system

### In Progress

- [ ] EAS Build configuration
- [ ] i18next integration
- [ ] Tab navigation wiring
- [ ] Phase 2 development (Subjects, Lessons, Quizzes)

### Planned

- [ ] Full i18n translations (Filipino, Chavacano, Yakan, Tausug)
- [ ] Teacher Dashboard analytics
- [ ] Advanced gamification
- [ ] Accessibility improvements
- [ ] Dark mode support

See [Project Status.md](Project%20Status.md) for detailed development tracking.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use `StyleSheet.create()` for styling
- All UI text must use i18n translation keys (never hardcode)
- Test on physical devices when possible
- Follow the existing code structure and patterns

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- QR code generation with [react-native-qrcode-svg](https://github.com/nicko170/react-native-qrcode-svg)
- Inspired by [Duolingo](https://www.duolingo.com/), [Khan Academy Kids](https://learn.khanacademy.org/khan-academy-kids/), and [Google Classroom](https://classroom.google.com/)
- Designed for the students and teachers of Basilan, Philippines

---

<div align="center">

<svg width="400" height="50" viewBox="0 0 400 50">
  <text x="200" y="20" text-anchor="middle" fill="#FF6B6B" font-size="14" font-weight="bold">
    LearnBasilan — Empowering education through mother tongue learning
    <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite"/>
  </text>
</svg>

</div>
