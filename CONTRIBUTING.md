# Contributing to LearnBasilan

Thank you for your interest in contributing to LearnBasilan! This document provides guidelines and information for contributors.

## About the Project

LearnBasilan is an offline-first mother tongue mobile learning system designed for elementary students in Basilan. The application supports five languages: Filipino, Chavacano, Yakan, Tausug, and English.

## Getting Started

### Prerequisites

- Node.js >= 20.19.4
- npm or yarn
- Expo CLI
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Novu.git
   cd Novu
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Development Guidelines

### Tech Stack

- **Mobile**: React Native (Expo SDK 52)
- **Database**: SQLite (expo-sqlite)
- **State Management**: Zustand
- **Styling**: NativeWind (TailwindCSS)
- **TypeScript**: Required for all new code

### Code Style

1. **TypeScript**: All code must be written in TypeScript
2. **No Hardcoded Text**: Use i18n translation keys for all UI strings
3. **Offline-First**: All features must work without internet connectivity
4. **Modular Architecture**: Keep components, services, and utilities separated

### Project Structure

```
src/
├── components/      # Reusable UI components
├── screens/         # Screen components
├── services/        # Business logic and database operations
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── translations/    # i18n translation files
```

### Commit Messages

Use clear, descriptive commit messages:

- `feat: Add new QR scanning feature`
- `fix: Resolve blank screen crash on startup`
- `docs: Update README with setup instructions`
- `refactor: Simplify database initialization`
- `test: Add unit tests for auth service`

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Test your changes on a physical device or emulator
4. Update documentation if needed
5. Submit a pull request with a clear description

### Testing

Before submitting a PR:

1. Run TypeScript type checker:
   ```bash
   npx tsc --noEmit
   ```

2. Run Expo doctor:
   ```bash
   npx expo-doctor
   ```

3. Test on both iOS and Android if possible

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. Device information (model, OS version)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable

### Feature Requests

For feature requests:

1. Describe the feature clearly
2. Explain the use case
3. Consider offline-first implications
4. Suggest implementation approach if possible

## Language Support

When adding or modifying translations:

1. Support all five languages: Filipino, Chavacano, Yakan, Tausug, English
2. Use translation keys, not hardcoded text
3. Test RTL support if applicable

## QR System Guidelines

The QR system is critical for content distribution:

1. Always use the compressed JSON + chunked transfer system
2. Never place raw content directly into QR codes
3. Test QR generation and scanning thoroughly
4. Verify data integrity with CRC32 checksums

## Database Guidelines

When modifying the database schema:

1. Maintain backward compatibility
2. Add migration scripts if needed
3. Test with existing user data
4. Update the database documentation

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Open a new issue with the `question` label
3. Be patient and respectful

Thank you for contributing to LearnBasilan!
