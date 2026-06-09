# LearnBasilan Comprehensive Fix Plan

> **Created:** 2026-06-09
> **Status:** Ready to Execute
> **Scope:** Phase 0 through Phase 4 (50+ fixes across 20 files)

---

## Executive Summary

The app builds and installs but shows a **blank #1A535C screen**. Root cause: font files downloaded as HTML pages (now fixed with valid TTFs), plus React anti-patterns in App.tsx calling setState during render. Beyond the blank screen, nearly every feature has significant bugs: hardcoded data, missing navigation, broken data flow, deprecated packages, and a critical crypto API mismatch.

**Total issues found:** 50+ across 20 files
**Critical (app won't start):** 5
**High (features broken):** 12
**Medium (quality/correctness):** 15
**Low (cleanup):** 18

---

## Phase 0: App Launches and Renders

> Goal: App shows splash screen, loads fonts, navigates to language selection.

### Step 0.1: Add expo-font plugin to app.json

- **File:** `app.json`
- **Issue:** `expo-font` is installed but not in `plugins` array. Production builds may not bundle custom fonts correctly.
- **Fix:** Add `"expo-font"` to the plugins array.

### Step 0.2: Fix setState during render in App.tsx

- **File:** `App.tsx` (lines 219, 233-234, 247-248, 289)
- **Issue:** `<>{navigate('login')}</>` calls setState directly inside JSX return. This causes undefined behavior and may produce a blank screen.
- **Fix:** Replace all inline navigate() calls with useEffect guards that watch the condition and redirect, or render null/loading for guarded routes.

### Step 0.3: Fix crypto API in auth.ts

- **File:** `src/services/auth.ts` (line 14)
- **Issue:** `Crypto.getRandomBytesAsync(16)` was removed in expo-crypto v14 (SDK 52). Registration crashes.
- **Fix:** Change to `Crypto.getRandomBytes(16)` (synchronous in v14, no await needed).

### Step 0.4: Enable SQLite foreign keys

- **File:** `src/services/database.ts`
- **Issue:** All ON DELETE CASCADE constraints are silently ignored because PRAGMA foreign_keys is never set.
- **Fix:** Add `await database.execAsync('PRAGMA foreign_keys = ON')` after opening the database.

### Step 0.5: Add user session persistence

- **File:** `App.tsx` + `src/services/auth.ts`
- **Issue:** On app restart, user is always null. Student must log in every time.
- **Fix:** On startup, check SQLite for the last logged-in user before showing login. Add getLastSession() to auth.ts.

---

## Phase 1: Core Data Flow Works

> Goal: Subjects load from DB, quizzes work, navigation passes correct IDs.

### Step 1.1: HomeScreen fetch subjects from database

- **File:** `src/screens/HomeScreen.tsx` (lines 19-24)
- **Issue:** Subjects are hardcoded with fake progress. DB has 5 subjects.
- **Fix:** Query subjects from SQLite on mount. Show real data with real progress.

### Step 1.2: SubjectDetailScreen accept subjectId prop

- **File:** `src/screens/SubjectDetailScreen.tsx` (line 13) + `App.tsx`
- **Issue:** SUBJECT_ID = 1 hardcoded. Always shows Mathematics.
- **Fix:** Add subjectId to props. Add selectedSubjectId state to App.tsx. Wire through onSubjectPress.

### Step 1.3: Fix grade display in SubjectDetailScreen

- **File:** `src/screens/SubjectDetailScreen.tsx` (line 62)
- **Issue:** Shows Grade {userId} where userId is DB row ID, not student grade.
- **Fix:** Add userGrade prop. Pass user.grade from App.tsx.

### Step 1.4: Make bottom navigation functional

- **File:** `src/screens/HomeScreen.tsx` (lines 217-235) + `App.tsx`
- **Issue:** Bottom nav buttons have no onPress handlers.
- **Fix:** Add onNavPress callback prop. Add new FlowSteps for rewards, progress, profile in App.tsx.

### Step 1.5: Persist language selection

- **File:** `src/screens/LanguageScreen.tsx` + `App.tsx`
- **Issue:** Language selected but never stored or used.
- **Fix:** Install @react-native-async-storage/async-storage. Store selection. Read on mount.

### Step 1.6: Add JSON.parse safety for quiz options

- **File:** `App.tsx` (line 130)
- **Issue:** JSON.parse(r.options) crashes on malformed data.
- **Fix:** Wrap in try/catch with fallback options array.

### Step 1.7: Fix XP award formula

- **File:** `App.tsx` (line 144)
- **Issue:** Awards score * 10 instead of spec: 50 for pass, 100 for perfect.
- **Fix:** Calculate percentage. Award 100 XP for 100%, 50 XP for 75%+, 0 otherwise.

---

## Phase 2: QR System Works

> Goal: QR scanning, generation, import, and teacher sharing all function.

### Step 2.1: Migrate expo-barcode-scanner to expo-camera

- **Files:** `package.json`, `app.json`, `src/screens/QRScannerScreen.tsx`
- **Issue:** expo-barcode-scanner is deprecated (SDK 49+) and may break.
- **Fix:** Install expo-camera ~16.1.11. Remove expo-barcode-scanner. Rewrite QRScannerScreen to use CameraView with barcodeScannerSettings.

### Step 2.2: Persist QR chunks to AsyncStorage

- **File:** `src/utils/qr/package.ts`
- **Issue:** QR scan progress is in-memory only. Lost on app restart.
- **Fix:** In addChunkToStore, also persist to AsyncStorage. On QR scanner mount, load stored chunks.

### Step 2.3: Add error handling to importContent in scanner

- **File:** `src/screens/QRScannerScreen.tsx` (line 49)
- **Issue:** importContent() has no try/catch.
- **Fix:** Wrap in try/catch with user-facing error message.

### Step 2.4: Fix content type enum usage

- **File:** `App.tsx` (line 282)
- **Issue:** 'lesson' as QRContentType bypasses type safety.
- **Fix:** Use QRContentType.Lesson instead.

### Step 2.5: Fix teacher lesson content in QR

- **File:** `App.tsx` (lines 299-306)
- **Issue:** content: lesson.title means QR contains title, not lesson content.
- **Fix:** Add content field to CreatedLesson interface. Wire through from TeacherLessonCreatorScreen.

---

## Phase 3: Teacher Features Work

> Goal: Teacher can create lessons, view in dashboard, share via QR.

### Step 3.1: TeacherDashboardScreen fetch from database

- **File:** `src/screens/TeacherDashboardScreen.tsx` (lines 28-43)
- **Issue:** Lessons are hardcoded mock data. Never queries DB.
- **Fix:** Add useEffect to query lessons, quizzes count, and student count from DB.

### Step 3.2: Fix Create New Quiz button

- **File:** `src/screens/TeacherDashboardScreen.tsx` (line 85)
- **Issue:** TouchableOpacity has no onPress handler.
- **Fix:** Either add onCreateQuiz prop or disable button with "Coming Soon" text.

### Step 3.3: Fix lesson creator image URL input

- **File:** `src/screens/TeacherLessonCreatorScreen.tsx` (line 148)
- **Issue:** TextInput has no value or onChangeText. Input is discarded.
- **Fix:** Add imageUrls state. Wire value and onChangeText. Split by newline on save.

### Step 3.4: Save lessons to database

- **File:** `src/screens/TeacherLessonCreatorScreen.tsx` + `src/services/database.ts`
- **Issue:** Lessons only held in memory for QR. Never saved to SQLite.
- **Fix:** Add saveLesson() function. Call on save. Also save from QR import flow.

---

## Phase 4: Polish and Correctness

> Goal: Error handling, type safety, cleanup.

### Step 4.1: Add error handling to SubjectDetailScreen async

- **File:** `src/screens/SubjectDetailScreen.tsx` (lines 33-44)
- **Fix:** Wrap async IIFE in try/catch with error state.

### Step 4.2: Add .catch to HomeScreen imported content polling

- **File:** `src/screens/HomeScreen.tsx` (line 42-54)
- **Fix:** Add .catch(() => setImported([])) to getImportedContent.

### Step 4.3: Add error handling to Speech.speak

- **File:** `src/screens/LessonViewerScreen.tsx` (line 57)
- **Fix:** Wrap in try/catch. Show "not available" message on failure.

### Step 4.4: Fix ImportedItem id type

- **File:** `src/services/contentStore.ts` (line 4)
- **Fix:** Change id from string to number. Remove String() conversion.

### Step 4.5: Parse content JSON on retrieval

- **File:** `src/services/contentStore.ts`
- **Fix:** JSON.parse content when reading from DB.

### Step 4.6: Cleanup QuizEngineScreen setTimeout

- **File:** `src/screens/QuizEngineScreen.tsx`
- **Fix:** Store timeout ID in ref. Clear on unmount.

### Step 4.7: Fix addXpDirect parameter type

- **File:** `src/services/progress.ts` (line 186)
- **Fix:** Change db parameter from any to SQLite.SQLiteDatabase.

### Step 4.8: Remove unused navigation dependencies

- **File:** `package.json`
- **Fix:** Remove @react-navigation/bottom-tabs and @react-navigation/native.

### Step 4.9: Remove unused QRContentType import

- **File:** `src/screens/TeacherLessonCreatorScreen.tsx` (line 13)
- **Fix:** Delete the import.

### Step 4.10: Add try/catch to checkAndAwardBadges

- **File:** `src/services/progress.ts` (lines 141-181)
- **Fix:** Wrap entire function body in try/catch. Return empty array on error.

### Step 4.11: Guard against empty chunks

- **File:** `src/utils/qr/chunk.ts` (line 63)
- **Fix:** Check if sorted.length === 0 before accessing sorted[0].

---

## Execution Order

```
Phase 0 (Critical)
  0.1  app.json — add expo-font plugin
  0.2  App.tsx — fix setState during render
  0.3  auth.ts — fix crypto API
  0.4  database.ts — enable foreign keys
  0.5  App.tsx — session persistence

Phase 1 (High)
  1.1  HomeScreen — subjects from DB
  1.2  SubjectDetailScreen + App.tsx — subjectId prop
  1.3  SubjectDetailScreen — grade display
  1.4  HomeScreen + App.tsx — bottom nav
  1.5  LanguageScreen + App.tsx — persist language
  1.6  App.tsx — quiz JSON.parse safety
  1.7  App.tsx — XP formula

Phase 2 (High)
  2.1  package.json + app.json + QRScannerScreen — expo-camera
  2.2  package.ts — AsyncStorage persistence
  2.3  QRScannerScreen — error handling
  2.4  App.tsx — enum usage
  2.5  App.tsx — lesson content in QR

Phase 3 (Medium)
  3.1  TeacherDashboardScreen — DB queries
  3.2  TeacherDashboardScreen — quiz button
  3.3  TeacherLessonCreatorScreen — image input
  3.4  TeacherLessonCreatorScreen + database.ts — save to DB

Phase 4 (Low)
  4.1  SubjectDetailScreen — error handling
  4.2  HomeScreen — catch imported content
  4.3  LessonViewerScreen — speech error handling
  4.4  contentStore.ts — id type
  4.5  contentStore.ts — parse JSON
  4.6  QuizEngineScreen — cleanup timeout
  4.7  progress.ts — addXpDirect type
  4.8  package.json — remove unused deps
  4.9  TeacherLessonCreatorScreen — remove unused import
  4.10 progress.ts — badge error handling
  4.11 chunk.ts — guard empty chunks
```

---

## Dependencies

Install:
```bash
npx expo install expo-camera @react-native-async-storage/async-storage
```

Remove:
```bash
npm uninstall expo-barcode-scanner @react-navigation/bottom-tabs @react-navigation/native
```

---

## Verification Checklist

- [ ] App shows splash screen with logo, text, and animations
- [ ] Splash transitions to language selection after 3 seconds
- [ ] Language selection persists across restarts
- [ ] Registration creates account (no crypto crash)
- [ ] Login works and session persists on restart
- [ ] HomeScreen shows real subjects from DB with progress
- [ ] Tapping subject navigates to correct subject detail
- [ ] Subject detail shows correct grade (not user ID)
- [ ] Lessons load from DB and display content
- [ ] Quiz loads questions and handles completion
- [ ] XP awards: 50 for pass, 100 for perfect
- [ ] Bottom navigation works for all 5 tabs
- [ ] QR scanner uses expo-camera with permission request
- [ ] QR generation creates valid QR codes
- [ ] QR scan imports content to DB
- [ ] Teacher dashboard shows real lessons from DB
- [ ] Teacher lesson creator saves to DB
- [ ] Teacher can generate QR for created lessons
- [ ] No unhandled promise rejections
- [ ] Build passes on EAS with preview profile
