<div align="center">

# LearnBasilan

### Offline-First Mother Tongue Mobile Learning System with QR-Based Content Distribution

![Version](https://img.shields.io/badge/version-1.0.1-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.76.9-61DAFB)
![Expo](https://img.shields.io/badge/Expo%20SDK-52-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6)
![License](https://img.shields.io/badge/license-MIT-green)

**Built for elementary students in Basilan, Philippines**

[Getting Started](#getting-started) | [Features](#features) | [Tech Stack](#tech-stack) | [Architecture](#architecture) | [Contributing](#contributing)

</div>

---

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

| Category | Technology |
|----------|------------|
| **Mobile Framework** | React Native |
| **Runtime** | Expo SDK 52 |
| **Language** | TypeScript |
| **Database** | expo-sqlite (SQLite) |
| **State Management** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Localization** | i18next + react-i18next |
| **QR Code** | react-native-qrcode-svg + expo-barcode-scanner |
| **Speech** | expo-speech |
| **Secure Storage** | expo-crypto (SHA-256 hashing) |
| **Local Storage** | AsyncStorage |

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

| Table | Purpose |
|-------|---------|
| `users` | Student & teacher accounts |
| `subjects` | Mathematics, Science, English, Filipino, Araling Panlipunan |
| `lessons` | Lesson content with language and chapter ordering |
| `quizzes` | Multiple-choice questions linked to lessons |
| `progress` | Student lesson completion and scores |
| `user_stats` | XP, level, and streak tracking |
| `earned_badges` | Achievement badges earned by students |
| `imported_content` | Content imported via QR codes |

### QR Transfer System

The QR ecosystem is the primary method for distributing educational content offline.

**Architecture:**
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
| Action | XP |
|--------|----|
| Lesson Completed | +10 XP |
| Quiz Passed | +50 XP |
| Perfect Quiz Score | +100 XP |

### Level Progression
| Level | XP Required |
|-------|-------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 250 |
| 4 | 500 |
| ... | Scaling |

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

| Language | Status |
|----------|--------|
| English | Complete (403 UI keys) |
| Filipino | Pending translation |
| Chavacano | Pending translation |
| Yakan | Pending translation |
| Tausug | Pending translation |

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

| Profile | Purpose | Channel |
|---------|---------|---------|
| `development` | Development builds with dev tools | development |
| `preview` | Testing and QA | preview |
| `production` | Production release | production |

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

**LearnBasilan** — Empowering education through mother tongue learning

</div>
