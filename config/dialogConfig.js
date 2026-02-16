// Dialog Configuration for Communications System
// Manages story dialog, character communications, and HUD presentation

const DialogConfig = {
    // Communication HUD styling
    hud: {
        // Position in top-left corner
        x: 20,
        y: 60,
        width: 450,
        height: 140,
        
        // Mobile adjustments
        mobileWidth: 280,
        mobileHeight: 120,
        
        // Portrait/avatar section (left side)
        portraitSize: 100,
        mobilePortraitSize: 80,
        portraitPadding: 10,
        
        // Text section (right side)
        textPadding: 15,
        lineHeight: 20,
        mobileLineHeight: 16,
        
        // Colors
        backgroundColor: 0x000000,
        backgroundAlpha: 0.85,
        borderColor: 0x00FFFF,
        borderWidth: 3,
        
        speakerColor: '#FFD700',    // Gold for speaker name
        textColor: '#FFFFFF',       // White for dialog text
        
        // Font sizes
        speakerFontSize: '18px',
        textFontSize: '14px',
        mobileSpeakerFontSize: '14px',
        mobileTextFontSize: '12px',
        
        // Typewriter effect
        typewriterSpeed: 30,        // milliseconds per character
        skipAllowed: true,
        
        // Advance prompt
        advanceText: '[SPACE] Continue',
        mobileAdvanceText: '[TAP] Continue',
        advanceFontSize: '12px',
        advanceColor: '#00FF00'
    },
    
    // Camera and player ship settings for dramatic effect during communications
    camera: {
        normalZoom: 1.0,
        focusOnPlayer: true,        // Center on player ship during comms
        panDuration: 800            // milliseconds for pan transition
    },
    
    // Player ship scale settings during communications
    playerShip: {
        normalScale: 1.0,
        communicationScale: 2.0,    // Scale player ship to 2x size during comms
        scaleDuration: 800          // milliseconds for scale transition
    },
    
    // Ship portraits for communications
    // Maps ship/character identifiers to their image keys
    portraits: {
        playerShip: 'player-ship',           // USS Aurora
        enemyFighter: 'enemy-fighter',       // Crystalis fighter
        enemyCruiser: 'enemy-cruiser',       // Crystalis cruiser
        enemyBattleship: 'enemy-battleship', // Crystalis battleship
        escapePod: 'escape-pod',             // Federation escape pod
        
        // For future use with custom portrait assets
        // captain: 'captain-portrait',
        // officer: 'officer-portrait',
        // alien: 'alien-portrait'
    },
    
    // Level-specific dialog sequences
    // Each level can have multiple dialog sequences (intro, mid-level, outro, etc.)
    levelDialogs: {
        2: {
            // Dialog at level start (intro)
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Captain',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Communications are heavily jammed. We need to navigate through this asteroid field carefully.',
                        audio: null  // Optional: path to audio file for voice-over
                    },
                    {
                        speaker: 'Science Officer',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Sensors detect multiple escape pods in the field, Captain. Survivors from a Federation science vessel.',
                        audio: null
                    },
                    {
                        speaker: 'Captain',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'All hands to rescue stations. Helm, take us in. Tactical, keep shields at maximum. We have people to save.',
                        audio: null
                    }
                ]
            },
            
            // Dialog at level end (outro/victory)
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Tactical Officer',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The crystal node is destroyed! Communications jamming has ceased.',
                        audio: null
                    },
                    {
                        speaker: 'Science Officer',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Incredible... these Crystalis vessels are constructed from fragments of the Crystalline Entity itself.',
                        audio: null
                    },
                    {
                        speaker: 'Captain',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Contact Starfleet immediately. They need to know what we\'re dealing with. Aurora out.',
                        audio: null
                    }
                ]
            }
        },
        
        // Template for future levels
        3: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Starfleet Command',
                        ship: 'Starbase 47',
                        portrait: 'playerShip',
                        text: 'Aurora, the colony on New Horizon is under attack. Provide orbital defense until reinforcements arrive.',
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Captain',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'New Horizon is secure. All evacuees are safe. Standing by for further orders.',
                        audio: null
                    }
                ]
            }
        }
    },
    
    // Get dialog sequence for a specific level and trigger
    getDialog(levelNumber, trigger = 'intro') {
        const dialogsForLevel = this.levelDialogs[levelNumber]
        if (dialogsForLevel && dialogsForLevel[trigger]) {
            return dialogsForLevel[trigger]
        }
        return null
    },
    
    // Check if a level has any dialogs defined
    hasDialog(levelNumber, trigger = 'intro') {
        return this.getDialog(levelNumber, trigger) !== null
    }
}
