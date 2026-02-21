// Dialog Configuration for Communications System
// Manages story dialog, character communications, and HUD presentation

const DialogConfig = {
    // Communication HUD styling
    hud: {
        // Position in top-left corner
        x: 20,
        y: 60,
        width: 500,
        height: 160,
        
        // Mobile adjustments
        mobileWidth: 320,
        mobileHeight: 140,
        
        // Portrait/avatar section (left side)
        portraitSize: 100,
        mobilePortraitSize: 70,
        portraitPadding: 10,
        
        // Text section (right side)
        textPadding: 15,
        lineHeight: 24,
        mobileLineHeight: 20,
        speakerTextGap: 8,          // Gap between speaker name and dialog text
        mobileSpeakerTextGap: 6,
        
        // Colors
        backgroundColor: 0x000000,
        backgroundAlpha: 0.85,
        borderColor: 0x00FFFF,
        borderWidth: 3,
        
        speakerColor: '#FFD700',    // Gold for speaker name
        textColor: '#FFFFFF',       // White for dialog text
        
        // Font sizes - improved readability
        speakerFontSize: '16px',
        textFontSize: '15px',
        mobileSpeakerFontSize: '13px',
        mobileTextFontSize: '12px',
        fontFamily: 'Arial, sans-serif',  // Clearer font than Courier New
        
        // Typewriter effect
        typewriterSpeed: 30,        // milliseconds per character
        skipAllowed: true,
        
        // Dialogue advancement
        advanceResetDelay: 100,     // milliseconds to wait before allowing next advance
        
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
        normalScale: 1.0,           // Default scale (for reference)
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
        ussSentinel: 'uss-sentinel',         // USS Sentinel (reinforcement flagship)
        starfleetCommand: 'starfleet-command', // Starfleet Command
        
        // For future use with custom portrait assets
        // captain: 'captain-portrait',
        // officer: 'officer-portrait',
        // alien: 'alien-portrait'
    },
    
    // Level-specific dialog sequences
    // Each level can have multiple dialog sequences (intro, mid-level, outro, etc.)
    levelDialogs: {
        1: {
            // Dialog at level start (intro)
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, sensors are detecting an unknown fleet ahead. They match no known signatures in our database.',
                        audio: null
                    },
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Crystal-like vessels, Captain. And they\'re powering weapons! All frequencies jammed - we can\'t hail them.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Red alert! All hands to battle stations. This first contact just went hostile. Shields up, prepare to engage!',
                        audio: null
                    }
                ]
            },
            
            // Dialog at level end (outro/victory)
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The vanguard ship is destroyed, Captain. The remaining Crystalis forces are retreating.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Good work. Helm, take us toward that asteroid field. We need cover to regroup and figure out what we\'re dealing with.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Communications are still jammed, Captain. We\'re on our own for now.',
                        audio: null
                    }
                ]
            }
        },
        
        2: {
            // Dialog at level start (intro)
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Communications are heavily jammed. We need to navigate through this asteroid field carefully.',
                        audio: null  // Optional: path to audio file for voice-over
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Sensors detect multiple escape pods in the field, Captain. Survivors from a Federation science vessel.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
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
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The crystal node is destroyed! Communications jamming has ceased.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Incredible... these Crystalis vessels are constructed from fragments of the Crystalline Entity itself.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Contact Starfleet immediately. They need to know what we\'re dealing with. Aurora out.',
                        audio: null
                    }
                ]
            }
        },
        
        // Level 3: Siege of New Horizon - Orbital defense
        3: {
            intro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: "Captain, we're receiving a priority distress call from the Federation colony on New Horizon!",
                        audio: null
                    },
                    {
                        speaker: 'Admiral Holt',
                        ship: 'Starbase 47',
                        portrait: 'starfleetCommand',
                        text: 'Aurora, New Horizon is under heavy Crystalis attack. Provide orbital defense until reinforcements arrive.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Understood, Command. Helm, set course for New Horizon. All hands to battle stations. We hold the line!',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: "Detecting multiple evacuation pods launching from the surface. They're evacuating civilians, Captain.",
                        audio: null
                    }
                ]
            },
            outro: {
                title: 'INCOMING TRANSMISSION',
                sequence: [
                    {
                        speaker: 'Lieutenant Solis',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'The Crystalis flagship is destroyed! Remaining enemy forces are breaking off their attack.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Dray',
                        ship: 'USS Sentinel',
                        portrait: 'ussSentinel',
                        text: 'Well done, Aurora. Reinforcements have arrived and are securing the colony. New Horizon is safe.',
                        audio: null
                    },
                    {
                        speaker: 'Captain Thorne',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'All civilian evacuation pods recovered successfully. New Horizon colony is secure. Aurora standing by.',
                        audio: null
                    },
                    {
                        speaker: 'Commander T\'Vorin',
                        ship: 'USS Aurora',
                        portrait: 'playerShip',
                        text: 'Captain, the Crystalis are becoming more coordinated. Their attack patterns are evolving.',
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
