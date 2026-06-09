#!/usr/bin/env python3
"""
CSV to JSON Translation Converter for LearnBasilan

This script converts the TRANSLATION_TEMPLATE.csv into individual language JSON files.

Usage:
    python csv_to_json.py

Input:  TRANSLATION_TEMPLATE.csv
Output: en.json, fil.json, chavacano.json, yakan.json, tausug.json

Requirements: Python 3.7+ (no external dependencies)
"""

import csv
import json
import os
from collections import OrderedDict

# Configuration
CSV_FILE = "TRANSLATION_TEMPLATE.csv"
LANGUAGES = ["en", "fil", "chavacano", "yakan", "tausug"]
LANGUAGE_COLUMNS = {
    "en": "English",
    "fil": "Filipino",
    "chavacano": "Chavacano",
    "yakan": "Yakan",
    "tausug": "Tausug"
}


def set_nested_value(data: dict, key: str, value: str) -> None:
    """Set a value in a nested dict using dot notation key."""
    parts = key.split(".")
    current = data
    for part in parts[:-1]:
        if part not in current:
            current[part] = OrderedDict()
        current = current[part]
    current[parts[-1]] = value


def csv_to_json():
    """Convert CSV translation template to JSON files."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, CSV_FILE)

    if not os.path.exists(csv_path):
        print(f"Error: {CSV_FILE} not found in {script_dir}")
        return

    # Initialize language data
    lang_data = {lang: OrderedDict() for lang in LANGUAGES}

    # Read CSV
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            key = row.get("Key", "").strip()
            if not key:
                continue

            for lang in LANGUAGES:
                col_name = LANGUAGE_COLUMNS[lang]
                value = row.get(col_name, "").strip()
                if value:  # Only set non-empty values
                    set_nested_value(lang_data[lang], key, value)

    # Write JSON files
    for lang in LANGUAGES:
        output_path = os.path.join(script_dir, f"{lang}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(lang_data[lang], f, ensure_ascii=False, indent=2)
        print(f"Generated: {lang}.json")

    # Print summary
    print("\n--- Summary ---")
    for lang in LANGUAGES:
        key_count = count_keys(lang_data[lang])
        empty_count = count_empty(lang_data[lang])
        filled_count = key_count - empty_count
        print(f"{LANGUAGE_COLUMNS[lang]:12s}: {filled_count:3d} translated, {empty_count:3d} remaining ({key_count} total)")


def count_keys(data: dict) -> int:
    """Count total keys (leaf nodes) in nested dict."""
    count = 0
    for v in data.values():
        if isinstance(v, dict):
            count += count_keys(v)
        else:
            count += 1
    return count


def count_empty(data: dict) -> int:
    """Count empty string values in nested dict."""
    count = 0
    for v in data.values():
        if isinstance(v, dict):
            count += count_empty(v)
        elif v == "":
            count += 1
    return count


if __name__ == "__main__":
    csv_to_json()