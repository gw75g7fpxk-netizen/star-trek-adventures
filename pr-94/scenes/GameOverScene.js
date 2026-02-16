// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.wave = data.wave || 0;
        this.podsRescued = data.podsRescued || 0;
        this.levelNumber = data.levelNumber || 1;
        this.pointsEarned = data.pointsEarned || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        
        // LCARS-style title with level info
        const levelInfo = ProgressConfig.levelInfo[this.levelNumber];
        const title = this.add.text(width / 2, height / 3, 'MISSION FAILED', {
            fontSize: '64px',
            color: '#FF0000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        
        const levelText = this.add.text(width / 2, height / 3 + 65, `Level ${this.levelNumber}: ${levelInfo.name}`, {
            fontSize: '20px',
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace'
        });
        levelText.setOrigin(0.5);
        
        // Get high score
        const highScore = this.getHighScore();
        
        // Stats with LCARS border
        const statsY = height / 2;
        const statsPanel = this.add.graphics();
        statsPanel.lineStyle(3, 0xFF0000, 1);
        statsPanel.strokeRect(width / 2 - 220, statsY - 20, 440, 220);
        
        this.add.text(width / 2, statsY, `FINAL SCORE: ${this.finalScore}`, {
            fontSize: '24px',
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 40, `HIGH SCORE: ${highScore}`, {
            fontSize: '20px',
            color: '#FFD700',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 80, `WAVE REACHED: ${this.wave}`, {
            fontSize: '20px',
            color: '#FFFFFF',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 120, `PODS RESCUED: ${this.podsRescued}`, {
            fontSize: '20px',
            color: '#00FFFF',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5);
        
        // Display credits earned (roguelite progression!)
        const creditsY = statsY + 160; // Positioned below pods rescued
        this.add.text(width / 2, creditsY, `CREDITS EARNED: +${this.pointsEarned}`, {
            fontSize: '20px',
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Navigation buttons
        const buttonY = height * 0.75;
        const buttonSpacing = 60;
        
        // Restart button
        const restartButton = this.add.text(width / 2, buttonY, '[ RETRY MISSION ]', {
            fontSize: '28px',
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive();
        
        restartButton.on('pointerdown', () => {
            this.scene.start('Level1Scene', { levelNumber: this.levelNumber });
        });
        
        restartButton.on('pointerover', () => {
            restartButton.setColor('#00FFFF');
            restartButton.setScale(1.05);
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setColor('#00FF00');
            restartButton.setScale(1.0);
        });
        
        // Return to Menu button
        const menuButton = this.add.text(width / 2, buttonY + buttonSpacing, '[ RETURN TO MENU ]', {
            fontSize: '24px',
            color: '#888888',
            fontFamily: 'Courier New, monospace'
        });
        menuButton.setOrigin(0.5);
        menuButton.setInteractive();
        
        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setColor('#00FFFF');
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setColor('#888888');
        });
        
        // Keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level1Scene', { levelNumber: this.levelNumber });
        });
        
        this.input.keyboard.once('keydown-M', () => {
            this.scene.start('MainMenuScene');
        });
    }
    
    getHighScore() {
        try {
            const saved = localStorage.getItem('starTrekAdventuresHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }
}
