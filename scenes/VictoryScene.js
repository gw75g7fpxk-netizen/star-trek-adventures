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
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
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
        
        // Subtitle
        const subtitle = this.add.text(width / 2, height / 4 + 70, 'Dominion Forces Neutralized', subtitleStyle);
        subtitle.setOrigin(0.5);
        
        // Get high score
        const highScore = this.getHighScore();
        const isNewHighScore = this.finalScore > highScore;
        
        // Stats with LCARS-style border
        const statsY = height / 2;
        const statsPanel = this.add.graphics();
        statsPanel.lineStyle(3, 0x00FFFF, 1);
        statsPanel.strokeRect(width / 2 - 250, statsY - 30, 500, 220);
        
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
        
        // Play Again button with LCARS styling
        const playButton = this.add.text(width / 2, height * 0.85, '[ PLAY AGAIN ]', {
            fontSize: '32px',
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        });
        playButton.setOrigin(0.5);
        playButton.setInteractive();
        
        playButton.on('pointerdown', () => {
            this.scene.start('Level1Scene');
        });
        
        playButton.on('pointerover', () => {
            playButton.setColor('#00FFFF');
            playButton.setScale(1.1);
        });
        
        playButton.on('pointerout', () => {
            playButton.setColor('#00FF00');
            playButton.setScale(1.0);
        });
        
        // Keyboard restart
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level1Scene');
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
}
