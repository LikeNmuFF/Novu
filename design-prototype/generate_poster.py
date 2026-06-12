#!/usr/bin/env python3
"""
LearnBasilan Feature Poster Generator
Creates a 2400x3200px PNG poster showcasing 6 key app features.
Design Philosophy: Reef Systems
"""

import math
import random
from PIL import Image, ImageDraw, ImageFont

# ══════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════
W, H = 2400, 1950
FONT_DIR = "C:/Users/Hp/.config/opencode/skills/canvas-design/canvas-fonts/"

# Brand Colors
CORAL      = (255, 126, 95)
CORAL_DARK = (232, 101, 72)
CORAL_LIGHT= (255, 166, 143)
CORAL_GLOW = (255, 240, 235)
TEAL       = (46, 196, 182)
TEAL_DARK  = (33, 154, 143)
TEAL_LIGHT = (125, 218, 208)
TEAL_GLOW  = (232, 248, 246)
GOLD       = (255, 217, 61)
GOLD_LIGHT = (255, 230, 128)
GOLD_GLOW  = (255, 248, 224)
GREEN      = (107, 203, 119)
GREEN_LIGHT= (148, 217, 157)
GREEN_GLOW = (237, 248, 239)
OCEAN      = (26, 83, 92)
OCEAN_DARK = (13, 59, 66)
CREAM      = (255, 248, 240)
WHITE      = (255, 255, 255)
SLATE      = (74, 85, 104)
SLATE_LIGHT= (113, 128, 150)

# Phone mockup dimensions
PHONE_W = 340
PHONE_H = 620
PHONE_RADIUS = 36
PHONE_BEZEL = 12

# Grid layout (2x3)
GRID_COLS = 3
GRID_ROWS = 2
GRID_GAP_X = 80
GRID_GAP_Y = 60


# ══════════════════════════════════════════════════════════════
# FONT LOADING
# ══════════════════════════════════════════════════════════════
def load_font(name, size):
    try:
        return ImageFont.truetype(FONT_DIR + name, size)
    except:
        return ImageFont.load_default()

FONT_TITLE    = load_font("BigShoulders-Bold.ttf", 120)
FONT_SUBTITLE = load_font("DMMono-Regular.ttf", 28)
FONT_LABEL    = load_font("Outfit-Bold.ttf", 22)
FONT_SMALL    = load_font("DMMono-Regular.ttf", 18)
FONT_MARKER   = load_font("BigShoulders-Bold.ttf", 32)
FONT_PHONE_H  = load_font("Outfit-Bold.ttf", 20)
FONT_PHONE_P  = load_font("Outfit-Regular.ttf", 16)
FONT_FEATURE  = load_font("Outfit-Bold.ttf", 24)
FONT_SCREEN   = load_font("Outfit-Bold.ttf", 16)


# ══════════════════════════════════════════════════════════════
# DRAWING HELPERS
# ══════════════════════════════════════════════════════════════
def lerp_color(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))

def draw_gradient_bg(draw, w, h):
    """Ocean depth gradient from teal to dark navy."""
    for y in range(h):
        t = y / h
        if t < 0.3:
            color = lerp_color(TEAL, OCEAN, t / 0.3)
        else:
            color = lerp_color(OCEAN, OCEAN_DARK, (t - 0.3) / 0.7)
        draw.line([(0, y), (w, y)], fill=color)

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = bbox
    r = min(radius, (x1 - x0) // 2, (y1 - y0) // 2)
    if fill:
        draw.rounded_rectangle(bbox, radius=r, fill=fill)
    if outline:
        draw.rounded_rectangle(bbox, radius=r, outline=outline, width=width)

def draw_phone_frame(img, x, y, w, h):
    """Draw a phone mockup frame with screen area. Returns screen coords."""
    draw = ImageDraw.Draw(img, 'RGBA')
    # Outer shadow
    for i in range(6, 0, -1):
        alpha = 25 + i * 4
        draw.rounded_rectangle(
            [x - i, y - i, x + w + i, y + h + i],
            radius=PHONE_RADIUS + i,
            fill=(13, 59, 66, alpha)
        )
    # Phone body (dark bezel)
    draw.rounded_rectangle([x, y, x + w, y + h], radius=PHONE_RADIUS, fill=(30, 30, 36, 255))
    # Screen area
    sx = x + PHONE_BEZEL
    sy = y + PHONE_BEZEL + 20
    sw = w - PHONE_BEZEL * 2
    sh = h - PHONE_BEZEL * 2 - 40
    draw.rounded_rectangle([sx, sy, sx + sw, sy + sh], radius=8, fill=(*CREAM, 255))
    # Notch
    notch_w = 80
    notch_h = 8
    notch_x = x + (w - notch_w) // 2
    notch_y = y + 8
    draw.rounded_rectangle([notch_x, notch_y, notch_x + notch_w, notch_y + notch_h],
                           radius=4, fill=(50, 50, 56, 255))
    return (sx, sy, sw, sh)


def draw_coral_pattern(img, cx, cy, scale=1.0, color=CORAL_LIGHT, opacity=80):
    """Draw decorative coral-reef circles."""
    draw = ImageDraw.Draw(img, 'RGBA')
    random.seed(42)
    for _ in range(12):
        r = random.randint(8, 28) * scale
        dx = random.randint(int(-60 * scale), int(60 * scale))
        dy = random.randint(int(-60 * scale), int(60 * scale))
        c = (*color, opacity)
        draw.ellipse([cx + dx - r, cy + dy - r, cx + dx + r, cy + dy + r], fill=c)


def draw_connecting_lines(draw, points, color=TEAL_LIGHT, width=2):
    """Draw thin connecting lines between phone mockups."""
    line_color = (*color, 50)
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            x1, y1 = points[i]
            x2, y2 = points[j]
            dist = math.hypot(x2 - x1, y2 - y1)
            if dist < 700:  # Only connect nearby phones
                draw.line([(x1, y1), (x2, y2)], fill=line_color, width=width)


def draw_numbered_marker(draw, x, y, num, color=WHITE):
    """Draw a numbered circle marker."""
    r = 22
    draw.ellipse([x - r, y - r, x + r, y + r], fill=CORAL)
    text = str(num)
    bbox = draw.textbbox((0, 0), text, font=FONT_MARKER)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x - tw // 2, y - th // 2 - 2), text, fill=WHITE, font=FONT_MARKER)


# ══════════════════════════════════════════════════════════════
# SCREEN CONTENT DRAWERS
# ══════════════════════════════════════════════════════════════
def draw_screen_home(img, sx, sy, sw, sh):
    """Home Dashboard screen."""
    draw = ImageDraw.Draw(img, 'RGBA')
    # Status bar
    draw.rectangle([sx, sy, sx + sw, sy + 24], fill=TEAL)
    draw.text((sx + 12, sy + 4), "9:41", fill=WHITE, font=FONT_SMALL)
    # Header
    draw.rectangle([sx, sy + 24, sx + sw, sy + 90], fill=TEAL)
    draw.text((sx + 16, sy + 32), "Kumusta, Juan!", fill=WHITE, font=FONT_PHONE_H)
    draw.text((sx + 16, sy + 56), "Grade 2 | 170 XP", fill=TEAL_LIGHT, font=FONT_PHONE_P)
    # XP Bar
    draw.rounded_rectangle([sx + 16, sy + 80, sx + sw - 16, sy + 96], radius=6, fill=TEAL_DARK)
    draw.rounded_rectangle([sx + 16, sy + 80, sx + 16 + int((sw - 32) * 0.68), sy + 96],
                           radius=6, fill=GOLD)
    draw.text((sx + sw - 50, sy + 80), "68%", fill=WHITE, font=FONT_SMALL)
    # Subject cards
    y_offset = sy + 110
    subjects = [("Math", CORAL, "72%"), ("Science", TEAL, "45%"), ("English", GREEN, "30%"), ("Filipino", GOLD, "88%")]
    for name, color, pct in subjects:
        draw.rounded_rectangle([sx + 16, y_offset, sx + sw - 16, y_offset + 48], radius=10, fill=WHITE)
        draw.rounded_rectangle([sx + 16, y_offset, sx + 24, y_offset + 48], radius=4, fill=color)
        draw.text((sx + 34, y_offset + 8), name, fill=OCEAN, font=FONT_PHONE_P)
        # Progress bar
        draw.rounded_rectangle([sx + 100, y_offset + 28, sx + sw - 60, y_offset + 36], radius=4, fill=(230, 230, 230))
        pct_val = int(pct.replace('%', '')) / 100
        draw.rounded_rectangle([sx + 100, y_offset + 28, sx + 100 + int((sw - 160) * pct_val), y_offset + 36],
                               radius=4, fill=color)
        draw.text((sx + sw - 50, y_offset + 24), pct, fill=SLATE, font=FONT_SMALL)
        y_offset += 56
    # Bottom nav
    nav_y = sy + sh - 48
    draw.rectangle([sx, nav_y, sx + sw, sy + sh], fill=WHITE)
    nav_items = ["Home", "Learn", "Rewards", "Progress", "Profile"]
    nav_w = sw // 5
    for i, item in enumerate(nav_items):
        nx = sx + i * nav_w + nav_w // 2
        if i == 0:
            draw.rounded_rectangle([sx + i * nav_w + 8, nav_y + 4, sx + (i + 1) * nav_w - 8, sy + sh - 4],
                                   radius=8, fill=CORAL_GLOW)
            draw.text((nx - 16, nav_y + 16), item[:5], fill=CORAL, font=FONT_SCREEN)
        else:
            draw.text((nx - 16, nav_y + 16), item[:5], fill=SLATE_LIGHT, font=FONT_SCREEN)


def draw_screen_lesson(img, sx, sy, sw, sh):
    """Lesson Viewer screen."""
    draw = ImageDraw.Draw(img, 'RGBA')
    # Hero
    draw.rectangle([sx, sy, sx + sw, sy + 140], fill=TEAL)
    draw.text((sx + 16, sy + 30), "← Back", fill=TEAL_LIGHT, font=FONT_PHONE_P)
    draw.text((sx + 16, sy + 52), "Mathematics", fill=TEAL_LIGHT, font=FONT_SMALL)
    draw.text((sx + 16, sy + 78), "Numbers 1 to 10", fill=WHITE, font=FONT_PHONE_H)
    draw.text((sx + sw - 40, sy + 100), "📖", font=FONT_PHONE_H)
    # Content area
    cy = sy + 152
    # Read aloud button
    draw.rounded_rectangle([sx + 16, cy, sx + 140, cy + 32], radius=16, fill=WHITE, outline=TEAL_LIGHT)
    draw.text((sx + 30, cy + 6), "🔊 Read Aloud", fill=OCEAN, font=FONT_SMALL)
    cy += 44
    # Image placeholder
    draw.rounded_rectangle([sx + 16, cy, sx + sw - 16, cy + 100], radius=10, fill=TEAL_GLOW)
    draw.text((sx + sw // 2 - 20, cy + 36), "🔢", font=FONT_PHONE_H)
    cy += 112
    # Text card
    draw.rounded_rectangle([sx + 16, cy, sx + sw - 16, cy + 120], radius=10, fill=WHITE)
    draw.text((sx + 28, cy + 12), "What are numbers?", fill=OCEAN, font=FONT_SCREEN)
    draw.text((sx + 28, cy + 36), "Numbers are symbols we", fill=SLATE, font=FONT_PHONE_P)
    draw.text((sx + 28, cy + 56), "use to count, measure,", fill=SLATE, font=FONT_PHONE_P)
    draw.text((sx + 28, cy + 76), "and label things.", fill=SLATE, font=FONT_PHONE_P)
    # Bottom CTA
    draw.rounded_rectangle([sx + 16, sy + sh - 60, sx + sw - 16, sy + sh - 16], radius=20, fill=CORAL)
    draw.text((sx + sw // 2 - 40, sy + sh - 46), "Start Quiz →", fill=WHITE, font=FONT_PHONE_P)


def draw_screen_quiz(img, sx, sy, sw, sh):
    """Quiz Engine screen."""
    draw = ImageDraw.Draw(img, 'RGBA')
    # Header
    draw.rectangle([sx, sy, sx + sw, sy + 24], fill=TEAL)
    draw.text((sx + 12, sy + 4), "9:41", fill=WHITE, font=FONT_SMALL)
    draw.text((sx + 16, sy + 32), "← Back    Quiz    1 / 5", fill=OCEAN, font=FONT_PHONE_P)
    # Progress bar
    draw.rounded_rectangle([sx + 16, sy + 60, sx + sw - 16, sy + 70], radius=4, fill=(230, 230, 230))
    draw.rounded_rectangle([sx + 16, sy + 60, sx + 16 + int((sw - 32) * 0.2), sy + 70],
                           radius=4, fill=CORAL)
    # Question
    draw.text((sx + 16, sy + 86), "📖 Numbers 1 to 10", fill=TEAL, font=FONT_SMALL)
    draw.text((sx + 16, sy + 114), "How many fingers do", fill=OCEAN, font=FONT_PHONE_H)
    draw.text((sx + 16, sy + 140), "you have on one hand?", fill=OCEAN, font=FONT_PHONE_H)
    # Options
    options = [("A", "3"), ("B", "4"), ("C", "5"), ("D", "6")]
    oy = sy + 180
    for letter, text in options:
        is_selected = letter == "C"
        bg = CORAL_GLOW if is_selected else WHITE
        border = CORAL if is_selected else (230, 230, 230)
        letter_bg = CORAL if is_selected else (230, 230, 230)
        draw.rounded_rectangle([sx + 16, oy, sx + sw - 16, oy + 42], radius=8, fill=bg, outline=border, width=2)
        draw.ellipse([sx + 24, oy + 8, sx + 48, oy + 32], fill=letter_bg)
        draw.text((sx + 32, oy + 10), letter, fill=WHITE if is_selected else SLATE, font=FONT_SCREEN)
        draw.text((sx + 58, oy + 10), text, fill=OCEAN, font=FONT_PHONE_P)
        oy += 50
    # Submit button
    draw.rounded_rectangle([sx + 16, sy + sh - 60, sx + sw - 16, sy + sh - 16], radius=20, fill=CORAL)
    draw.text((sx + sw // 2 - 50, sy + sh - 46), "Check Answer →", fill=WHITE, font=FONT_PHONE_P)


def draw_screen_qr_scanner(img, sx, sy, sw, sh):
    """QR Scanner screen."""
    draw = ImageDraw.Draw(img, 'RGBA')
    # Header
    draw.rectangle([sx, sy, sx + sw, sy + 24], fill=TEAL)
    draw.text((sx + 12, sy + 4), "9:41", fill=WHITE, font=FONT_SMALL)
    draw.text((sx + 16, sy + 32), "QR Scanner", fill=OCEAN, font=FONT_PHONE_H)
    draw.text((sx + sw - 30, sy + 32), "✕", fill=SLATE, font=FONT_PHONE_H)
    # Camera preview
    draw.rectangle([sx + 16, sy + 60, sx + sw - 16, sy + 300], fill=OCEAN_DARK)
    # Scanner frame
    frame_x = sx + sw // 2 - 70
    frame_y = sy + 150
    draw.rectangle([frame_x, frame_y, frame_x + 140, frame_y + 140], outline=WHITE, width=3)
    # Corner accents
    corner_len = 30
    for cx, cy, dx, dy in [(frame_x, frame_y, 1, 1), (frame_x + 140, frame_y, -1, 1),
                            (frame_x, frame_y + 140, 1, -1), (frame_x + 140, frame_y + 140, -1, -1)]:
        draw.line([(cx, cy), (cx + corner_len * dx, cy)], fill=CORAL, width=4)
        draw.line([(cx, cy), (cx, cy + corner_len * dy)], fill=CORAL, width=4)
    # Scan line
    scan_y = frame_y + 40
    draw.line([(frame_x + 10, scan_y), (frame_x + 130, scan_y)], fill=CORAL, width=3)
    # Hint text
    draw.text((sx + 16, sy + 320), "📷 Point camera at QR code", fill=OCEAN, font=FONT_PHONE_P)
    draw.text((sx + 16, sy + 344), "Scan lesson, quiz, or", fill=SLATE, font=FONT_SMALL)
    draw.text((sx + 16, sy + 364), "subject QR from teacher", fill=SLATE, font=FONT_SMALL)
    # Buttons
    draw.rounded_rectangle([sx + 16, sy + sh - 100, sx + sw // 2 - 8, sy + sh - 56], radius=16, fill=CORAL)
    draw.text((sx + 40, sy + sh - 86), "Simulate", fill=WHITE, font=FONT_PHONE_P)
    draw.rounded_rectangle([sx + sw // 2 + 8, sy + sh - 100, sx + sw - 16, sy + sh - 56], radius=16, fill=WHITE, outline=CORAL)
    draw.text((sx + sw // 2 + 30, sy + sh - 86), "Cancel", fill=CORAL, font=FONT_PHONE_P)


def draw_screen_rewards(img, sx, sy, sw, sh):
    """Rewards/Badges screen."""
    draw = ImageDraw.Draw(img, 'RGBA')
    # Header
    draw.rectangle([sx, sy, sx + sw, sy + 24], fill=TEAL)
    draw.text((sx + 12, sy + 4), "9:41", fill=WHITE, font=FONT_SMALL)
    draw.text((sx + 16, sy + 34), "Rewards", fill=OCEAN, font=FONT_PHONE_H)
    # Stats
    draw.rounded_rectangle([sx + 16, sy + 60, sx + sw - 16, sy + 100], radius=10, fill=WHITE)
    draw.text((sx + 30, sy + 68), "🏆 8 badges  |  ⭐ Level 4", fill=OCEAN, font=FONT_PHONE_P)
    # Badge grid (3x3)
    badges = [
        ("🎯", "First\nLesson", True), ("📝", "First\nQuiz", True), ("⭐", "Perfect\nScore", True),
        ("🔥", "5 Day\nStreak", True), ("📚", "10\nLessons", True), ("💯", "100\nXP", True),
        ("🎓", "Quiz\nMaster", False), ("🌟", "All\nBadges", False), ("👑", "Champion", False),
    ]
    grid_x = sx + 24
    grid_y = sy + 116
    cell_w = (sw - 48) // 3
    cell_h = 80
    for i, (icon, name, earned) in enumerate(badges):
        row, col = i // 3, i % 3
        bx = grid_x + col * cell_w
        by = grid_y + row * cell_h
        opacity = 255 if earned else 80
        bg = WHITE if earned else (240, 240, 240)
        draw.rounded_rectangle([bx + 4, by + 4, bx + cell_w - 4, by + cell_h - 8], radius=10, fill=bg)
        if earned:
            draw.rounded_rectangle([bx + 4, by + 4, bx + cell_w - 4, by + cell_h - 8],
                                   radius=10, outline=GOLD, width=2)
        draw.text((bx + cell_w // 2 - 12, by + 8), icon, font=FONT_PHONE_P)
        lines = name.split('\n')
        for j, line in enumerate(lines):
            draw.text((bx + cell_w // 2 - 16, by + 36 + j * 14), line,
                      fill=OCEAN if earned else SLATE_LIGHT, font=FONT_SMALL)
    # Bottom nav
    nav_y = sy + sh - 48
    draw.rectangle([sx, nav_y, sx + sw, sy + sh], fill=WHITE)
    nav_items = ["Home", "Learn", "Rewards", "Progress", "Profile"]
    nav_w = sw // 5
    for i, item in enumerate(nav_items):
        nx = sx + i * nav_w + nav_w // 2
        if i == 2:
            draw.rounded_rectangle([sx + i * nav_w + 8, nav_y + 4, sx + (i + 1) * nav_w - 8, sy + sh - 4],
                                   radius=8, fill=CORAL_GLOW)
            draw.text((nx - 16, nav_y + 16), item[:5], fill=CORAL, font=FONT_SCREEN)
        else:
            draw.text((nx - 16, nav_y + 16), item[:5], fill=SLATE_LIGHT, font=FONT_SCREEN)


def draw_screen_teacher(img, sx, sy, sw, sh):
    """Teacher Dashboard screen."""
    draw = ImageDraw.Draw(img, 'RGBA')
    # Header
    draw.rectangle([sx, sy, sx + sw, sy + 24], fill=TEAL)
    draw.text((sx + 12, sy + 4), "9:41", fill=WHITE, font=FONT_SMALL)
    draw.text((sx + 16, sy + 32), "Teacher Dashboard", fill=OCEAN, font=FONT_PHONE_H)
    draw.text((sx + 16, sy + 56), "Welcome back, Teacher!", fill=SLATE, font=FONT_SMALL)
    # Stats row
    stats_y = sy + 84
    stat_w = (sw - 48) // 3
    stats = [("12", "Students"), ("8", "Lessons"), ("85%", "Avg Score")]
    for i, (num, label) in enumerate(stats):
        stx = sx + 16 + i * (stat_w + 8)
        draw.rounded_rectangle([stx, stats_y, stx + stat_w, stats_y + 56], radius=8, fill=WHITE)
        draw.text((stx + stat_w // 2 - 12, stats_y + 8), num, fill=CORAL, font=FONT_PHONE_H)
        draw.text((stx + stat_w // 2 - 16, stats_y + 34), label, fill=SLATE, font=FONT_SMALL)
    # Create content section
    cy = stats_y + 72
    draw.text((sx + 16, cy), "Create Content", fill=OCEAN, font=FONT_PHONE_P)
    cy += 24
    # Create lesson card
    draw.rounded_rectangle([sx + 16, cy, sx + sw - 16, cy + 52], radius=10, fill=WHITE, outline=(230, 230, 230))
    draw.text((sx + 28, cy + 6), "📝", font=FONT_PHONE_P)
    draw.text((sx + 56, cy + 6), "Create New Lesson", fill=OCEAN, font=FONT_SCREEN)
    draw.text((sx + 56, cy + 28), "Write content for students", fill=SLATE, font=FONT_SMALL)
    draw.text((sx + sw - 30, cy + 16), "›", fill=SLATE, font=FONT_PHONE_H)
    cy += 60
    # Create quiz card
    draw.rounded_rectangle([sx + 16, cy, sx + sw - 16, cy + 52], radius=10, fill=WHITE, outline=(230, 230, 230))
    draw.text((sx + 28, cy + 6), "❓", font=FONT_PHONE_P)
    draw.text((sx + 56, cy + 6), "Create New Quiz", fill=OCEAN, font=FONT_SCREEN)
    draw.text((sx + 56, cy + 28), "Build multiple choice", fill=SLATE, font=FONT_SMALL)
    draw.text((sx + sw - 30, cy + 16), "›", fill=SLATE, font=FONT_PHONE_H)
    cy += 64
    # Recent lessons
    draw.text((sx + 16, cy), "Recent Lessons", fill=OCEAN, font=FONT_PHONE_P)
    cy += 24
    lessons = [("Mathematics", "Numbers 1 to 10"), ("Science", "Parts of a Plant")]
    for subj, title in lessons:
        draw.rounded_rectangle([sx + 16, cy, sx + sw - 16, cy + 44], radius=8, fill=WHITE)
        draw.text((sx + 28, cy + 4), subj.upper(), fill=CORAL, font=FONT_SMALL)
        draw.text((sx + 28, cy + 22), title, fill=OCEAN, font=FONT_PHONE_P)
        draw.rounded_rectangle([sx + sw - 70, cy + 10, sx + sw - 16, cy + 34], radius=12, fill=CORAL_GLOW)
        draw.text((sx + sw - 62, cy + 14), "Share", fill=CORAL, font=FONT_SMALL)
        cy += 50


# ══════════════════════════════════════════════════════════════
# MAIN POSTER GENERATION
# ══════════════════════════════════════════════════════════════
def generate_poster():
    # Create canvas with alpha channel
    img = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    # 1. Background gradient
    draw_gradient_bg(draw, W, H)

    # 2. Decorative coral patterns (background) — subtle
    draw_coral_pattern(img, 150, 350, scale=0.8, color=CORAL_LIGHT, opacity=18)
    draw_coral_pattern(img, 2250, 500, scale=0.7, color=TEAL_LIGHT, opacity=15)
    draw_coral_pattern(img, 200, 2400, scale=0.6, color=GOLD_LIGHT, opacity=12)
    draw_coral_pattern(img, 2200, 2200, scale=0.7, color=CORAL_LIGHT, opacity=15)
    draw = ImageDraw.Draw(img, 'RGBA')  # Refresh after patterns

    # 3. Title section
    title_text = "LearnBasilan"
    bbox = draw.textbbox((0, 0), title_text, font=FONT_TITLE)
    tw = bbox[2] - bbox[0]
    title_x = (W - tw) // 2
    draw.text((title_x + 4, 104), title_text, fill=(13, 59, 66, 100), font=FONT_TITLE)
    draw.text((title_x, 100), title_text, fill=WHITE, font=FONT_TITLE)

    # Subtitle
    sub_text = "Offline Mother Tongue Learning for Basilan"
    bbox = draw.textbbox((0, 0), sub_text, font=FONT_SUBTITLE)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) // 2, 230), sub_text, fill=TEAL_LIGHT, font=FONT_SUBTITLE)

    # Decorative line
    line_y = 278
    line_w = 260
    draw.line([(W // 2 - line_w, line_y), (W // 2 + line_w, line_y)], fill=CORAL, width=3)
    draw.ellipse([W // 2 - 5, line_y - 5, W // 2 + 5, line_y + 5], fill=CORAL)

    # 4. Calculate phone grid positions
    grid_w = GRID_COLS * PHONE_W + (GRID_COLS - 1) * GRID_GAP_X
    grid_h = GRID_ROWS * PHONE_H + (GRID_ROWS - 1) * GRID_GAP_Y
    grid_x = (W - grid_w) // 2
    grid_y = 320

    screen_drawers = [
        draw_screen_home,
        draw_screen_lesson,
        draw_screen_quiz,
        draw_screen_qr_scanner,
        draw_screen_rewards,
        draw_screen_teacher,
    ]
    feature_names = [
        "Home Dashboard",
        "Lesson Viewer",
        "Quiz Engine",
        "QR Scanner",
        "Rewards & Badges",
        "Teacher Dashboard",
    ]

    # Pre-calculate phone center positions for connecting lines
    phone_positions = []
    for i in range(6):
        row, col = i // GRID_COLS, i % GRID_COLS
        px = grid_x + col * (PHONE_W + GRID_GAP_X)
        py = grid_y + row * (PHONE_H + GRID_GAP_Y)
        phone_positions.append((px + PHONE_W // 2, py + PHONE_H // 2))

    # 5. Draw connecting lines FIRST (behind phones)
    draw_connecting_lines(draw, phone_positions, color=TEAL_LIGHT, width=2)

    # 6. Draw phones, labels, and markers
    for i in range(6):
        row, col = i // GRID_COLS, i % GRID_COLS
        px = grid_x + col * (PHONE_W + GRID_GAP_X)
        py = grid_y + row * (PHONE_H + GRID_GAP_Y)

        # Draw phone frame
        screen_coords = draw_phone_frame(img, px, py, PHONE_W, PHONE_H)
        sx, sy, sw, sh = screen_coords

        # Draw screen content
        screen_drawers[i](img, sx, sy, sw, sh)

        # Feature label below phone
        label = feature_names[i]
        bbox = draw.textbbox((0, 0), label, font=FONT_FEATURE)
        lw = bbox[2] - bbox[0]
        label_x = px + (PHONE_W - lw) // 2
        label_y = py + PHONE_H + 14
        draw.text((label_x, label_y), label, fill=WHITE, font=FONT_FEATURE)

        # Numbered marker — positioned to the LEFT of each phone
        marker_x = px - 30
        marker_y = py + 30
        draw_numbered_marker(draw, marker_x, marker_y, i + 1)

    # 7. Feature icons row
    icons_y = grid_y + grid_h + 70
    feature_data = [
        ("5 Languages", "Filipino • Chavacano\nYakan • Tausug • English"),
        ("Offline-First", "No internet needed\nAll data stored locally"),
        ("QR Distribution", "Share lessons & quizzes\nvia QR codes"),
        ("Gamified Learning", "XP • Badges • Levels\nStreak tracking"),
    ]
    icon_spacing = W // 4
    icon_labels = ["🌐", "📱", "📷", "🎮"]
    for i, (title, desc) in enumerate(feature_data):
        ix = icon_spacing * i + icon_spacing // 2
        draw.ellipse([ix - 32, icons_y - 32, ix + 32, icons_y + 32], fill=TEAL)
        draw.text((ix - 10, icons_y - 12), icon_labels[i], font=FONT_PHONE_P)
        bbox = draw.textbbox((0, 0), title, font=FONT_LABEL)
        tw = bbox[2] - bbox[0]
        draw.text((ix - tw // 2, icons_y + 42), title, fill=WHITE, font=FONT_LABEL)
        lines = desc.split('\n')
        for j, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=FONT_SMALL)
            lw = bbox[2] - bbox[0]
            draw.text((ix - lw // 2, icons_y + 70 + j * 20), line, fill=TEAL_LIGHT, font=FONT_SMALL)

    # 8. Color palette strip
    palette_y = icons_y + 160
    palette_colors = [CORAL, TEAL, GOLD, GREEN, OCEAN, CREAM]
    palette_names = ["Coral", "Teal", "Gold", "Green", "Ocean", "Cream"]
    palette_w = 110
    palette_gap = 16
    total_palette_w = len(palette_colors) * palette_w + (len(palette_colors) - 1) * palette_gap
    palette_x = (W - total_palette_w) // 2

    draw.text(((W - 180) // 2, palette_y - 32), "Brand Color Palette", fill=WHITE, font=FONT_LABEL)

    for i, (color, name) in enumerate(zip(palette_colors, palette_names)):
        cx = palette_x + i * (palette_w + palette_gap)
        draw.rounded_rectangle([cx, palette_y, cx + palette_w, palette_y + 50], radius=10, fill=color)
        if color == CREAM:
            draw.rounded_rectangle([cx, palette_y, cx + palette_w, palette_y + 50], radius=10,
                                   outline=(230, 230, 230), width=2)
        bbox = draw.textbbox((0, 0), name, font=FONT_SMALL)
        nw = bbox[2] - bbox[0]
        text_color = WHITE if color != CREAM and color != GOLD else OCEAN
        draw.text((cx + (palette_w - nw) // 2, palette_y + 16), name, fill=text_color, font=FONT_SMALL)

    # 9. Footer
    footer_y = H - 130
    tagline = "Mula sa Basilan, Para sa mga Batang Basilan"
    bbox = draw.textbbox((0, 0), tagline, font=FONT_SUBTITLE)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, footer_y), tagline, fill=CORAL_LIGHT, font=FONT_SUBTITLE)

    footer_text = "Design Prototype • LearnBasilan v1.0 • Basilan, Philippines"
    bbox = draw.textbbox((0, 0), footer_text, font=FONT_SMALL)
    fw = bbox[2] - bbox[0]
    draw.text(((W - fw) // 2, footer_y + 40), footer_text, fill=SLATE_LIGHT, font=FONT_SMALL)

    # Decorative line above footer
    draw.line([(W // 2 - 200, footer_y - 20), (W // 2 + 200, footer_y - 20)], fill=TEAL_LIGHT, width=1)

    # 10. Convert to RGB and save
    final = Image.new('RGB', (W, H), (13, 59, 66))
    final.paste(img, mask=img.split()[3])
    final.save("C:/Users/Hp/OneDrive/Desktop/Basilan-Offline-Learning-App/Offline-Learning-App/design-prototype/learnbasilan-poster.png",
               "PNG", quality=95)
    print(f"Poster saved: {W}x{H}px")


if __name__ == "__main__":
    generate_poster()
