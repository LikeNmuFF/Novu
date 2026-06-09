# LearnBasilan Translation Guide

## Overview

This guide explains how to translate the LearnBasilan app into your assigned language.

**Languages supported:**
- English (source of truth)
- Filipino
- Chavacano
- Yakan
- Tausug

## Translation Workflow

### Step 1: Get the CSV Template

Open `TRANSLATION_TEMPLATE.csv` in Google Sheets or Microsoft Excel.

The file has these columns:

| Column | Description |
|--------|-------------|
| Key | Translation key (e.g., `home.welcome`) - DO NOT MODIFY |
| English | Source text - DO NOT MODIFY |
| Filipino | Your translations go here (for Filipino translators) |
| Chavacano | Your translations go here (for Chavacano translators) |
| Yakan | Your translations go here (for Yakan translators) |
| Tausug | Your translations go here (for Tausug translators) |
| Context | Where the text appears in the app |
| Notes | Special instructions |
| Status | Track progress: Not Started / In Progress / Review / Done |

### Step 2: Translate

1. **Only fill in your assigned language column**
2. **Keep the same row alignment** - don't add or remove rows
3. **Preserve placeholders** like `{{name}}`, `{{count}}`, `{{percent}}`
   - Example: English "Hello {{name}}!" → Your translation should also have `{{name}}`
4. **Check the Context column** for where text appears
5. **Check the Notes column** for special instructions

### Step 3: Mark Status

Update the Status column as you work:
- `Not Started` - Not yet translated
- `In Progress` - Currently being worked on
- `Review` - Ready for review by native speaker
- `Done` - Approved and finalized

### Step 4: Export and Convert

After translation is complete:

1. Export the Google Sheet as CSV (File → Download → CSV)
2. Replace `TRANSLATION_TEMPLATE.csv` with your exported file
3. Run the converter script:
   ```bash
   python src/translations/csv_to_json.py
   ```
4. This generates updated `{language}.json` files

## Important Rules

### DO:
- Use simple, clear language (target audience: elementary students)
- Keep sentences short and direct
- Match the tone of the English text
- Test translations in context when possible
- Ask for clarification if context is unclear

### DON'T:
- Translate brand names (LearnBasilan)
- Translate variable placeholders (`{{name}}`, `{{count}}`)
- Add or remove rows
- Change the Key column
- Change the English column
- Leave translations empty (mark as "In Progress" instead)

## Placeholder Reference

| Placeholder | Meaning | Example |
|-------------|---------|---------|
| `{{name}}` | User's name | "Hello Juan!" |
| `{{count}}` | Number/count | "3 Day Streak" |
| `{{level}}` | Grade/level | "Grade 4" |
| `{{xp}}` | Experience points | "+50 XP" |
| `{{percent}}` | Percentage | "85%" |
| `{{current}}` | Current item number | "Question 3 of 10" |
| `{{total}}` | Total items | "Question 3 of 10" |
| `{{completed}}` | Completed count | "5 of 10" |
| `{{remaining}}` | Remaining count | "Scan remaining 2 QR codes" |
| `{{date}}` | Date string | "Imported on Jan 15" |
| `{{min}}` | Minimum value | "At least 6 characters" |
| `{{max}}` | Maximum value | "At most 100 characters" |

## Translation Categories

### UI Elements (High Priority)
- Navigation labels
- Buttons
- Form labels
- Error messages
- Status messages

### Content (Medium Priority)
- Onboarding screens
- Settings labels
- Achievement names
- Subject names

### Teacher Tools (Lower Priority)
- Dashboard labels
- Analytics labels
- Content creator labels

## File Structure

```
src/translations/
├── TRANSLATION_TEMPLATE.csv    # Source spreadsheet
├── TRANSLATOR_GUIDE.md         # This file
├── csv_to_json.py              # Conversion script
├── en.json                     # English (complete)
├── fil.json                    # Filipino (to be translated)
├── chavacano.json              # Chavacano (to be translated)
├── yakan.json                  # Yakan (to be translated)
└── tausug.json                 # Tausug (to be translated)
```

## Quality Checklist

Before marking translations as "Done":

- [ ] All placeholders are preserved
- [ ] No empty translation values
- [ ] Text is appropriate for children (ages 6-12)
- [ ] No offensive or inappropriate content
- [ ] Grammar and spelling are correct
- [ ] Translations match the context
- [ ] Brand names are NOT translated

## Questions?

Contact the development team if you:
- Are unsure about context
- Find errors in the English source
- Need clarification on meaning
- Encounter technical issues with the CSV

## Progress Tracking

Current translation status:

| Language | Total Keys | Translated | Remaining | Status |
|----------|------------|------------|-----------|--------|
| English | 403 | 403 | 0 | Complete |
| Filipino | 403 | 0 | 403 | Not Started |
| Chavacano | 403 | 0 | 403 | Not Started |
| Yakan | 403 | 0 | 403 | Not Started |
| Tausug | 403 | 0 | 403 | Not Started |

---

Thank you for contributing to LearnBasilan! Your translations help students learn in their mother tongue.