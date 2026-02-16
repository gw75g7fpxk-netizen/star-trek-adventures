// Victory Scene
class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.wave = data.wave || 0;
        this.podsRescued = data.podsRescued || 0;
        this.enemiesKilled = data.enemiesKilled || 0;
        this.levelNumber = data.levelNumber || 1;
        this.pointsEarned = data.pointsEarned || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Save level completion progress
        this.saveLevelProgress();
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        
        // Star Trek LCARS styling
        const titleStyle = {
            fontSize: '64px',
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        };
        
        const subtitleStyle = {
            fontSize: '24px',
            color: '#00FFFF',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        };
        
        const statsStyle = {
            fontSize: '20px',
            color: '#FFFFFF',
            fontFamily: 'Courier New, monospace'
        };
        
        // Victory title with LCARS styling
        const title = this.add.text(width / 2, height / 4, 'MISSION COMPLETE', titleStyle);
        title.setOrigin(0.5);
        
        // Subtitle - show level info
        const levelInfo = ProgressConfig.levelInfo[this.levelNumber];
        const subtitle = this.add.text(width / 2, height / 4 + 70, `Level ${this.levelNumber}: ${levelInfo.name}`, subtitleStyle);
        subtitle.setOrigin(0.5);
        
        // Get high score
        const highScore = this.getHighScore();
        const isNewHighScore = this.finalScore > highScore;
        
        // Stats with LCARS-style border
        const statsY = height / 2;
        const statsPanel = this.add.graphics();
        statsPanel.lineStyle(3, 0x00FFFF, 1);
        statsPanel.strokeRect(width / 2 - 250, statsY - 30, 500, 260);
        
        this.add.text(width / 2, statsY, `FINAL SCORE: ${this.finalScore}`, {
            fontSize: '28px',
            color: isNewHighScore ? '#FFD700' : '#FFFF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        if (isNewHighScore) {
            this.add.text(width / 2, statsY + 35, '*** NEW HIGH SCORE ***', {
                fontSize: '20px',
                color: '#FFD700',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        } else {
            this.add.text(width / 2, statsY + 35, `High Score: ${highScore}`, {
                fontSize: '18px',
                color: '#FFD700',
                fontFamily: 'Courier New, monospace'
            }).setOrigin(0.5);
        }
        
        this.add.text(width / 2, statsY + 70, `WAVES: ${this.wave}`, statsStyle).setOrigin(0.5);
        this.add.text(width / 2, statsY + 100, `ENEMIES: ${this.enemiesKilled}`, statsStyle).setOrigin(0.5);
        this.add.text(width / 2, statsY + 130, `PODS RESCUED: ${this.podsRescued}`, {
            fontSize: '20px',
            color: '#00FFFF',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5);
        
        // Display credits earned
        const creditsY = statsY + 170; // Positioned below pods rescued
        this.add.text(width / 2, creditsY, `CREDITS EARNED: +${this.pointsEarned}`, {
            fontSize: '20px',
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Navigation buttons
        const buttonY = height * 0.78;
        const buttonSpacing = 60;
        
        // Play Again button
        const playButton = this.add.text(width / 2, buttonY, '[ REPLAY MISSION ]', {
            fontSize: '28px',
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        });
        playButton.setOrigin(0.5);
        playButton.setInteractive();
        
        playButton.on('pointerdown', () => {
            this.scene.start('Level1Scene', { levelNumber: this.levelNumber });
        });
        
        playButton.on('pointerover', () => {
            playButton.setColor('#00FFFF');
            playButton.setScale(1.05);
        });
        
        playButton.on('pointerout', () => {
            playButton.setColor('#00FF00');
            playButton.setScale(1.0);
        });
        
        // Next Level button (if not last level)
        if (this.levelNumber < 10) {
            const nextButton = this.add.text(width / 2, buttonY + buttonSpacing, '[ NEXT MISSION ]', {
                fontSize: '28px',
                color: '#FFFF00',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            });
            nextButton.setOrigin(0.5);
            nextButton.setInteractive();
            
            nextButton.on('pointerdown', () => {
                this.scene.start('Level1Scene', { levelNumber: this.levelNumber + 1 });
            });
            
            nextButton.on('pointerover', () => {
                nextButton.setColor('#00FFFF');
                nextButton.setScale(1.05);
            });
            
            nextButton.on('pointerout', () => {
                nextButton.setColor('#FFFF00');
                nextButton.setScale(1.0);
            });
        }
        
        // Return to Menu button
        const menuButton = this.add.text(width / 2, buttonY + buttonSpacing * 2, '[ RETURN TO MENU ]', {
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
        
        // Keyboard shortcut - space for replay, M for menu
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level1Scene', { levelNumber: this.levelNumber });
        });
        
        this.input.keyboard.once('keydown-M', () => {
            this.scene.start('MainMenuScene');
        });
        
        // Add some celebratory particle effects
        this.time.addEvent({
            delay: 100,
            callback: () => {
                const x = Phaser.Math.Between(0, width);
                const y = Phaser.Math.Between(0, height);
                const colors = [0xFFFF00, 0x00FFFF, 0xFF9900];
                const color = Phaser.Utils.Array.GetRandom(colors);
                const particle = this.add.circle(x, y, 3, color);
                this.tweens.add({
                    targets: particle,
                    alpha: 0,
                    y: y + 50,
                    duration: 1000,
                    onComplete: () => particle.destroy()
                });
            },
            loop: true
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
    
    saveLevelProgress() {
        const saveData = ProgressConfig.loadProgress();
        ProgressConfig.saveLevelStats(this.levelNumber, {
            score: this.finalScore,
            enemiesKilled: this.enemiesKilled,
            podsRescued: this.podsRescued,
            wave: this.wave
        }, saveData);
    }
}
