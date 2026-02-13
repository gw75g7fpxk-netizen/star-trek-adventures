// Game Configuration
const GameConfig = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#000000',
    
    // Auto-scaling configuration for all resolutions (desktop/mobile)
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    
    // Arcade Physics
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    
    // Target 60 FPS
    fps: {
        target: 60,
        forceSetTimeOut: false
    },
    
    // Input configuration
    input: {
        activePointers: 3 // Support touch controls
    },
    
    // Scene list (Boot -> Preload -> Level1)
    scene: [] // Will be populated in main.js
};
