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
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        
        // Victory title
        const title = this.add.text(width / 2, height / 4, 'VICTORY!', {
            fontSize: '64px',
            color: '#00FF00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(width / 2, height / 4 + 70, 'The Dominion has been defeated!', {
            fontSize: '24px',
            color: '#00FFFF',
            fontFamily: 'Arial'
        });
        subtitle.setOrigin(0.5);
        
        // Stats
        const statsY = height / 2;
        this.add.text(width / 2, statsY, `Final Score: ${this.finalScore}`, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 40, `Waves Completed: ${this.wave}`, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 80, `Enemies Destroyed: ${this.enemiesKilled}`, {
            fontSize: '24px',
            color: '#FFFF00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, statsY + 120, `Pods Rescued: ${this.podsRescued}`, {
            fontSize: '24px',
            color: '#00FFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Play Again button
        const playButton = this.add.text(width / 2, height * 0.8, 'PLAY AGAIN', {
            fontSize: '32px',
            color: '#00FF00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        playButton.setOrigin(0.5);
        playButton.setInteractive();
        
        playButton.on('pointerdown', () => {
            this.scene.start('Level1Scene');
        });
        
        playButton.on('pointerover', () => {
            playButton.setColor('#00FFFF');
        });
        
        playButton.on('pointerout', () => {
            playButton.setColor('#00FF00');
        });
        
        // Keyboard restart
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level1Scene');
        });
        
        // Add some celebratory effects
        this.time.addEvent({
            delay: 100,
            callback: () => {
                const x = Phaser.Math.Between(0, width);
                const y = Phaser.Math.Between(0, height);
                const particle = this.add.circle(x, y, 3, 0xFFFF00);
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
}
