# LearnBasilan

## Offline-First Mother Tongue Mobile Learning System with QR-Based Content Distribution

Version: 1.0

---

# PROJECT OVERVIEW

LearnBasilan is a mobile learning application designed for elementary students in Basilan.

The system must function without internet connectivity.

The platform supports:

- Filipino
    
- Chavacano
    
- Yakan
    
- Tausug
    
- English
    

The application provides:

- Learning modules
    
- Interactive quizzes
    
- Student progress tracking
    
- Achievements and gamification
    
- Teacher content creation tools
    
- QR-based lesson sharing
    
- QR-based quiz sharing
    
- QR-based progress reporting
    

The entire system must be offline-first.

No cloud server.

No Firebase.

No internet required.

All data is stored locally using SQLite.

---

# PRIMARY USERS

## Student

Can:

- Register account
    
- Login
    
- Learn lessons
    
- Take quizzes
    
- Track progress
    
- Earn badges
    
- Share lessons via QR
    
- Receive lessons via QR
    
- Share progress via QR
    

---

## Teacher

Can:

- Login as teacher
    
- Create lessons
    
- Create quizzes
    
- Generate QR packages
    
- Scan student progress QR
    
- Monitor imported student reports
    
- Manage content versions
    

---

# TECH STACK

## Mobile

React Native

Expo SDK Latest

TypeScript

---

## Database

expo-sqlite

SQLite

---

## State Management

Zustand

---

## Styling

NativeWind

TailwindCSS

---

## Forms

React Hook Form

Zod

---

## Localization

i18next

react-i18next

---

## QR Code

react-native-qrcode-svg

expo-barcode-scanner

---

## Speech

expo-speech

---

## Local Storage

AsyncStorage

---

# APPLICATION FLOW

Splash Screen

↓

Language Selection

↓

Onboarding

↓

Login / Register

↓

Main App

---

# LANGUAGE SYSTEM

Supported Languages:

- Filipino
    
- Chavacano
    
- Yakan
    
- Tausug
    
- English
    

Store language preference in AsyncStorage.

All UI strings must use translation keys.

Never hardcode text.

Folder Structure:

translations/  
├── en.json  
├── fil.json  
├── chavacano.json  
├── yakan.json  
└── tausug.json

---

# DATABASE DESIGN

## users

Fields:

id  
full_name  
grade_level  
username  
password  
role  
created_at

Role values:

student  
teacher

---

## subjects

id  
name  
icon  
grade_level

---

## lessons

id  
subject_id  
title  
content  
image_url  
language  
lesson_order

---

## quizzes

id  
lesson_id  
question  
choice_a  
choice_b  
choice_c  
choice_d  
correct_answer  
explanation

---

## progress

id  
user_id  
lesson_id  
completed  
score  
completed_at

---

## badges

id  
user_id  
badge_name  
earned_at

---

## imported_content

id  
content_id  
version  
imported_at

---

# AUTHENTICATION

## Registration

Student enters:

Full Name

Grade Level

Username

Password

Save to SQLite.

---

## Login

Validate against SQLite.

Redirect based on role.

student → Student App

teacher → Teacher Dashboard

---

# STUDENT APP

Bottom Navigation:

Home

Learn

Rewards

Progress

Profile

---

# HOME SCREEN

Display:

Student Name

Grade

Level

XP

Current Streak

Continue Learning

Subject Cards

---

# SUBJECTS

Available Subjects:

Mathematics

Science

English

Filipino

Araling Panlipunan

Display as visual cards.

---

# CHAPTER SYSTEM

Each subject contains chapters.

Chapters have:

Completed

Unlocked

Locked

Only unlock next chapter after passing quiz.

Pass score:

75%

---

# LESSON SCREEN

Components:

Title

Content

Images

Examples

Summary

Read Aloud Button

Previous

Next

Start Quiz

---

# TEXT TO SPEECH

Use expo-speech.

Support:

Filipino

English

For unsupported languages:

Display lesson text only.

Provide fallback message.

---

# QUIZ SYSTEM

Question Types:

Multiple Choice

Four Answers

Features:

Progress Bar

Question Counter

Score Calculation

Explanation Review

Pass/Fail Detection

---

# QUIZ RESULTS

Display:

Score

Percentage

Stars

XP Earned

Correct Answers

Incorrect Answers

Button:

Review Answers

Continue

---

# ACHIEVEMENTS

Examples:

First Lesson

First Quiz

Perfect Score

5 Day Streak

10 Lessons Completed

100 XP Earned

Display as badge collection.

---

# XP SYSTEM

Lesson Completed

10 XP

Quiz Passed

50 XP

Perfect Quiz

100 XP

---

# LEVEL SYSTEM

Level 1

0 XP

Level 2

100 XP

Level 3

250 XP

Level 4

500 XP

Continue scaling.

---

# PROFILE

Display:

Name

Grade

XP

Badges

Lessons Completed

Quiz Average

Actions:

Edit Profile

Generate Progress QR

Logout

---

# QR SHARING SYSTEM

This is a core feature.

All sharing must work offline.

---

# QR TRANSFER ARCHITECTURE (MANDATORY)

All QR content distribution **must** use the compressed JSON + chunked transfer system defined in `src/utils/qr/*`. No content is ever placed directly into a QR code as raw JSON.

## Core Architecture

Three-layer system built into `src/utils/qr/`:

```
package.ts   → High-level API (createQRPackage / processQRScan)
chunk.ts     → Chunking layer (split / reconstruct)
compress.ts  → Compression layer (pako deflate/inflate + base64)
crc32.ts     → Integrity verification (CRC32 checksum)
```

## Compression

- Uses **pako** (deflate algorithm, level 9) for maximum compression
- Base64-encodes the compressed binary for QR-safe alphanumeric output
- Achieves 60-96% size reduction for typical lesson/quiz content

## Chunking

- **MAX_QR_CHUNK_SIZE = 1800** characters per QR code (safe scanning limit)
- If compressed data exceeds 1800 chars, it is split into multiple chunks
- All chunks share a common `packageId` and `checksum`
- System reconstructs content automatically when all chunks are scanned

## QR Payload Format (v1)

```json
{
  "v": 1,           // Format version
  "id": "a3b8x9k2", // Package ID (shared across all chunks)
  "i": 0,           // Chunk index (0-based)
  "t": 1,           // Total number of chunks
  "d": "<base64>",  // Compressed data (full or partial)
  "c": "a09cb39f",  // CRC32 checksum of original uncompressed JSON
  "type": "lesson"  // Content type
}
```

## Content Types

- `lesson` — Lesson content with images, examples, translations
- `quiz` — Quiz questions with choices and explanations
- `subject` — Subject metadata
- `progress` — Student progress report
- `translation` — Vocabulary/translation packages

## Scan Flow

1. Parse QR → validate fields → check for duplicate chunk
2. Store chunk in QRStore (in-memory, to be persisted via AsyncStorage)
3. If all chunks received → concatenate → base64 decode → pako inflate → JSON parse → verify CRC32
4. Return complete content or partial progress status

## API Reference

```typescript
createQRPackage<T>(content: T, type: QRContentType): QRChunkMeta[]
processQRScan(chunkData: string): QRScanResult
getQRProgress(packageId: string): QRScanResult
clearQRPackage(packageId: string): void
```

See `QR Transfer Architecture.md` for full documentation.

---

# PROGRESS QR REPORTING

Student opens:

Profile

↓

Generate Progress QR

Generate JSON:

{  
"student":"Juan",  
"grade":"4",  
"average_score":85,  
"completed_lessons":12,  
"badges":5  
}

Convert to QR.

---

# TEACHER DASHBOARD

Teacher Dashboard is not used for online monitoring.

Teacher Dashboard is used for:

Content Creation

Content Distribution

Progress Collection

Analytics

---

# DASHBOARD OVERVIEW

Display:

Total Students Imported

Average Score

Lessons Created

Quizzes Created

Students Needing Support

---

# CONTENT CREATOR

Teacher can:

Create Subject

Create Lesson

Edit Lesson

Delete Lesson

Create Quiz

Edit Quiz

Delete Quiz

---

# QR DISTRIBUTION CENTER

Teacher can:

Generate Lesson QR

Generate Quiz QR

Generate Subject QR

Generate Translation QR

---

# STUDENT PROGRESS IMPORT

Teacher scans Student Progress QR.

Data stored locally.

Teacher Dashboard updates analytics.

---

# ANALYTICS

Display:

Student Name

Average Score

Lessons Completed

Badges Earned

Weak Performance Indicators

Highlight:

Scores below 50%

---

# SETTINGS

Language

Dark Mode

Text Size

Read Aloud

About App

Reset Data

---

# UI DESIGN REQUIREMENTS

Style:

Modern

Child-Friendly

Educational

Gamified

Inspired by:

Duolingo

Khan Academy Kids

Google Classroom

Use:

Rounded Cards

Large Buttons

Bright Colors

Progress Animations

XP Indicators

Achievement Celebrations

---

# ACCESSIBILITY

Minimum text size:

16px

Large touch targets

High contrast

Screen reader compatibility

Speech support

---

# SECURITY

Passwords stored using secure hashing.

Never store plain text passwords.

Validate all QR imports.

Prevent duplicate content imports.

---

# MVP DEVELOPMENT ORDER

Phase 1

SQLite Setup

Authentication

Language System

Navigation

---

Phase 2

Subjects

Lessons

Quizzes

Progress Tracking

---

Phase 3

Achievements

XP System

Levels

Profile

---

Phase 4

Teacher Dashboard

Lesson Builder

Quiz Builder

---

Phase 5

QR Generation

QR Scanner

Lesson Sharing

Quiz Sharing

Progress Sharing

---

Phase 6

Polish

Animations

Accessibility

Dark Mode

Testing

---

# FINAL REQUIREMENT

Build a production-ready Expo React Native application using TypeScript.

Architecture must be modular, scalable, reusable, and maintainable.

All features must function without internet connectivity.

The QR ecosystem is the primary method for distributing educational content and collecting student progress reports.