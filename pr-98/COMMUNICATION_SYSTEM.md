# Communication System Documentation

## Overview
The communication system provides an immersive storytelling experience through dialog sequences that appear at key moments during gameplay. It features a HUD-based communication interface with ship portraits, typewriter text effects, and camera zoom for dramatic effect.

## How It Works

### Architecture

1. **DialogConfig** (`config/dialogConfig.js`)
   - Central configuration for all communication dialogs
   - Defines HUD styling, camera behavior, and dialog content
   - Maps ship identifiers to portrait images

2. **Level1Scene Integration**
   - `showCommunication(trigger, onComplete)` - Main entry point
   - `displayCommunicationHUD(message)` - Renders the HUD
   - `startTypewriterEffect()` - Animates text display
   - `setupCommunicationInput()` - Handles user input
   - `closeCommunication()` - Cleanup and restoration

### User Experience Flow

#### Level 2 Intro (Before First Wave)
1. Player selects Level 2 from mission select
2. Level1Scene initializes with `levelNumber: 2`
3. `create()` detects intro dialog exists
4. Camera zooms to 1.2x and centers on player ship
5. Game physics pauses
6. Communication HUD appears in top-left corner
7. Ship portrait displays (USS Aurora)
8. Speaker name and ship shown in gold text
9. Dialog text appears with typewriter effect (30ms/char)
10. Player presses SPACE (desktop) or TAP (mobile) to advance
11. Sequence continues through 3 messages
12. Camera zooms back out, physics resume
13. First wave begins

#### Level 2 Outro (After Boss Defeated)
1. Boss is destroyed, `victory()` is called
2. High score saved, session points calculated
3. `victory()` detects outro dialog exists
4. Same communication sequence plays with 3 new messages
5. After dialog completion, transitions to VictoryScene

### Dialog Structure

Each dialog sequence contains:
```javascript
{
    title: 'INCOMING TRANSMISSION',
    sequence: [
        {
            speaker: 'Captain',           // Character speaking
            ship: 'USS Aurora',           // Ship/location
            portrait: 'playerShip',       // Portrait key
            text: 'Dialog text...',       // Message content
            audio: null                   // Optional audio file
        }
        // ... more messages
    ]
}
```

### HUD Layout

```
┌─ INCOMING TRANSMISSION ───────────────┐
│                                        │
│  ┌────────┐  Captain - USS Aurora     │
│  │        │                            │
│  │ SHIP   │  Communications are       │
│  │ IMAGE  │  heavily jammed. We need  │
│  │        │  to navigate through...   │
│  └────────┘                            │
│                                        │
│                   [SPACE] Continue  ►  │
└────────────────────────────────────────┘
```

### Configuration Options

#### HUD Styling (DialogConfig.hud)
- **Position**: Top-left corner (x: 20, y: 60)
- **Size**: 450x140 (desktop), 280x120 (mobile)
- **Portrait**: 100x100 (desktop), 80x80 (mobile)
- **Colors**: Black background (85% alpha), cyan border
- **Text**: Gold for speaker, white for dialog
- **Typewriter**: 30ms per character

#### Camera Effects (DialogConfig.camera)
- **Normal Zoom**: 1.0x
- **Communication Zoom**: 1.2x
- **Zoom Duration**: 800ms
- **Easing**: Sine.easeInOut
- **Focus**: Centers on player ship

## Adding New Dialogs

### For Existing Levels
Edit `config/dialogConfig.js` and add entries to `levelDialogs`:

```javascript
levelDialogs: {
    3: {
        intro: {
            title: 'INCOMING TRANSMISSION',
            sequence: [
                {
                    speaker: 'Starfleet Command',
                    ship: 'Starbase 47',
                    portrait: 'playerShip',
                    text: 'Your message here...',
                    audio: null
                }
            ]
        },
        outro: { /* ... */ }
    }
}
```

### Custom Portraits
1. Add image to `assets/images/` directory
2. Load in `PreloadScene.js`: `this.load.image('portrait-key', 'assets/images/portrait.png')`
3. Add to `DialogConfig.portraits`: `customChar: 'portrait-key'`
4. Use in dialog: `portrait: 'customChar'`

### Audio Support (Future Enhancement)
The system includes `audio` property placeholders:
```javascript
{
    speaker: 'Captain',
    text: 'Dialog...',
    audio: 'assets/audio/captain-line-01.mp3'  // Future use
}
```

To implement:
1. Load audio in PreloadScene
2. Modify `startTypewriterEffect()` to play audio
3. Sync typewriter speed with audio duration

## Testing

### Manual Testing Checklist
- [ ] Level 1 starts immediately (no dialog)
- [ ] Level 2 shows intro dialog before first wave
- [ ] Typewriter effect completes properly
- [ ] Space bar advances dialog
- [ ] Tap/click advances dialog (mobile)
- [ ] Camera zooms in and back out smoothly
- [ ] Game pauses during dialog
- [ ] Level 2 shows outro dialog after boss defeated
- [ ] Victory screen appears after outro dialog
- [ ] No console errors

### Access Level 2
1. Start game
2. Go to Mission Select
3. **Method 1**: Complete Level 1 to unlock Level 2
4. **Method 2**: Tap "MISSION SELECT" title 5 times to unlock all levels
5. Select Level 2
6. Click "LAUNCH MISSION"

## Technical Notes

### Responsive Design
- HUD automatically scales for mobile (< 600px width/height)
- Font sizes reduce on mobile
- Portrait images scale appropriately
- Touch controls replace keyboard controls

### Performance
- Dialog HUD elements use `setScrollFactor(0)` to stay fixed
- All elements properly destroyed in `clearCommunicationHUD()`
- Physics pause prevents unnecessary calculations
- Tweens cleaned up on dialog close

### Edge Cases Handled
- No dialog defined: Level starts/ends normally
- Missing portrait image: Falls back to colored circle
- User spams advance: Typewriter skips to full text
- Scene cleanup: All listeners and elements removed

## Future Enhancements

### Planned Features
1. **Voice Acting**: Audio playback synchronized with text
2. **Portrait Animations**: Character expressions/ship status
3. **Dialog Choices**: Branching storylines based on player decisions
4. **Mid-Wave Dialogs**: Triggered by specific events during gameplay
5. **Cinematic Mode**: Fade to black transitions, wider camera shots
6. **Subtitle Styling**: Bold, italics, color variations in text
7. **Multi-Character**: Show two portraits for ship-to-ship conversations

### Code Extension Points
- `DialogConfig.levelDialogs` - Add more levels
- `startTypewriterEffect()` - Enhance text animation
- `displayCommunicationHUD()` - Modify HUD layout
- `showCommunication()` - Add new triggers (mid-wave, boss-intro, etc.)

## Credits
Communication system designed for immersive storytelling in Star Trek Aurora game.
