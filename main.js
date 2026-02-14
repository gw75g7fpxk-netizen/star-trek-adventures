// Main game entry point
console.log('Star Trek Adventures - Initializing...');

// Configure scenes
GameConfig.scene = [
    BootScene, 
    PreloadScene, 
    MainMenuScene, 
    LevelSelectScene, 
    UpgradesScene, 
    Level1Scene, 
    GameOverScene, 
    VictoryScene
];

// Create Phaser game instance
const game = new Phaser.Game(GameConfig);

// Expose game to window for debugging and testing
window.game = game;

console.log('Star Trek Adventures - Game created');
console.log('Configuration:', {
    width: GameConfig.width,
    height: GameConfig.height,
    scaleMode: 'FIT',
    physics: 'Arcade',
    targetFPS: 60
});
