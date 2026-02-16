# Communication HUD Visual Layout

## Desktop View (800x600)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Star Trek Aurora                            │
│                                                                        │
│  ┌─ INCOMING TRANSMISSION ────────────────────────┐                   │
│  │                                                 │                   │
│  │  ┌──────────┐  Captain - USS Aurora            │                   │
│  │  │          │                                   │                   │
│  │  │   USS    │  Communications are heavily      │                   │
│  │  │  AURORA  │  jammed. We need to navigate     │     ★  ★          │
│  │  │  [Ship]  │  through this asteroid field     │         ★         │
│  │  │          │  carefully.                      │   [Player Ship]   │
│  │  └──────────┘                                   │      (Zoomed)     │
│  │                                                 │                   │
│  │                      [SPACE] Continue ▶         │    ★        ★     │
│  └─────────────────────────────────────────────────┘                   │
│                                                                        │
│                    (Game Paused - Camera Zoomed 1.2x)                 │
└────────────────────────────────────────────────────────────────────────┘
```

## Mobile View (320x480)

```
┌──────────────────────────┐
│   Star Trek Aurora   │
│                          │
│ ┌─ TRANSMISSION ───────┐ │
│ │                      │ │
│ │ ┌────┐ Captain      │ │
│ │ │USS │              │ │
│ │ │Ship│ Comms jammed │ │
│ │ └────┘ Navigate...  │ │
│ │                      │ │
│ │      [TAP] Continue  │ │
│ └──────────────────────┘ │
│                          │
│     [Player Ship]        │
│      (Centered)          │
│                          │
│   ★       ★              │
│        ★                 │
└──────────────────────────┘
```

## HUD Elements

### 1. Title Bar (Top)
- Text: "INCOMING TRANSMISSION"
- Color: Cyan (#00FFFF)
- Background: Cyan with 30% alpha
- Position: Above main HUD panel

### 2. Portrait Section (Left Side)
- Size: 100x100px (desktop), 80x80px (mobile)
- Border: 2px cyan border
- Content: Ship image or fallback colored circle
- Examples: USS Aurora (player ship), Enemy ships, Escape pods

### 3. Text Section (Right Side)
- Speaker Name & Ship: Gold text (#FFD700), 18px (14px mobile)
- Dialog Text: White text (#FFFFFF), 14px (12px mobile)
- Typewriter Effect: 30ms per character
- Word wrap enabled

### 4. Advance Prompt (Bottom Right)
- Text: "[SPACE] Continue" (desktop) or "[TAP] Continue" (mobile)
- Color: Green (#00FF00)
- Blinking animation when ready
- Hidden during typewriter effect

## Camera Effects

### Zoom Sequence
```
Normal View (1.0x)
    ↓ (800ms transition)
Communication View (1.2x) - Centered on player
    ↓ (Dialog plays)
Normal View (1.0x)
    ↓ (800ms transition)
Gameplay resumes
```

### Easing
- Type: Sine.easeInOut
- Duration: 800 milliseconds
- Smooth, cinematic feel

## Color Scheme

- **Background**: Black (#000000) at 85% alpha
- **Border**: Cyan (#00FFFF)
- **Speaker Name**: Gold (#FFD700)
- **Dialog Text**: White (#FFFFFF)
- **Advance Prompt**: Green (#00FF00)
- **Title**: Cyan (#00FFFF)

## Responsive Breakpoints

- **Desktop**: Width ≥ 600px
  - HUD: 450x140px
  - Portrait: 100x100px
  - Font sizes: 18px/14px

- **Mobile**: Width < 600px
  - HUD: 280x120px
  - Portrait: 80x80px
  - Font sizes: 14px/12px

## Animation Timeline

### Message Display (Example)
```
0ms     - HUD appears
0ms     - Portrait displays
0ms     - Speaker name appears
0ms     - Typewriter starts
30ms    - First character
60ms    - Second character
...     - Continue at 30ms/char
900ms   - "Communications" complete
...     - Continue...
2400ms  - Full message displayed
2400ms  - Advance prompt appears (blinking)
[WAIT]  - User input
0ms     - Next message OR close dialog
```

### Close Sequence
```
0ms     - User completes all messages
0ms     - HUD elements destroyed
0ms     - Camera zoom out begins (800ms)
0ms     - Camera pan to center begins (800ms)
800ms   - Camera restored
800ms   - Physics resume
800ms   - Callback executed (startNextWave or victory scene)
```
