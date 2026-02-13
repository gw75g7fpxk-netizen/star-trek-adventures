// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.wave = data.wave || 0;
        this.podsRescued = data.podsRescued || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        
        // Game Over title
        const title = this.add.text(width / 2, height / 3, 'GAME OVER', {
            fontSize: '64px',
            color: '#FF0000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        
        // Stats
        const statsY = height / 2;
        this.add.text(width / 2, statsY, `Final Score: ${this.finalScore}`, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 40, `Wave Reached: ${this.wave}`, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 80, `Pods Rescued: ${this.podsRescued}`, {
            fontSize: '24px',
            color: '#00FFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Restart button
        const restartButton = this.add.text(width / 2, height * 0.75, 'RESTART', {
            fontSize: '32px',
            color: '#00FF00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive();
        
        restartButton.on('pointerdown', () => {
            this.scene.start('Level1Scene');
        });
        
        restartButton.on('pointerover', () => {
            restartButton.setColor('#00FFFF');
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setColor('#00FF00');
        });
        
        // Keyboard restart
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level1Scene');
        });
    }
}
