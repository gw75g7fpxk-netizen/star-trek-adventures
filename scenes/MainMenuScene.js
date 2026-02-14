// Main Menu Scene - Entry point with options to select levels or upgrades
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' })
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        console.log('MainMenuScene: Starting main menu...')
        
        // Background - starfield effect
        this.createStarfield()
        
        // Title with LCARS styling
        const title = this.add.text(width / 2, height / 4, 'STAR TREK', {
            fontSize: '72px',
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        
        const subtitle = this.add.text(width / 2, height / 4 + 70, 'ADVENTURES', {
            fontSize: '48px',
            color: '#00FFFF',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        subtitle.setOrigin(0.5)
        
        // Load progress to check if player has unlocked levels
        const saveData = ProgressConfig.loadProgress()
        const unlockedCount = saveData.unlockedLevels.length
        
        // Menu buttons with LCARS styling
        const buttonY = height / 2 + 20
        const buttonSpacing = 80
        
        // Level Select button
        const levelSelectButton = this.add.text(width / 2, buttonY, '[ MISSION SELECT ]', {
            fontSize: '32px',
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        levelSelectButton.setOrigin(0.5)
        levelSelectButton.setInteractive()
        
        // Display unlocked levels count
        const levelProgress = this.add.text(width / 2, buttonY + 35, `${unlockedCount} of 10 missions unlocked`, {
            fontSize: '16px',
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace'
        })
        levelProgress.setOrigin(0.5)
        
        levelSelectButton.on('pointerdown', () => {
            this.scene.start('LevelSelectScene')
        })
        
        levelSelectButton.on('pointerover', () => {
            levelSelectButton.setColor('#00FFFF')
            levelSelectButton.setScale(1.05)
        })
        
        levelSelectButton.on('pointerout', () => {
            levelSelectButton.setColor('#00FF00')
            levelSelectButton.setScale(1.0)
        })
        
        // Upgrades button (placeholder for future feature)
        const upgradesButton = this.add.text(width / 2, buttonY + buttonSpacing, '[ SHIP UPGRADES ]', {
            fontSize: '32px',
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        upgradesButton.setOrigin(0.5)
        upgradesButton.setInteractive()
        
        // Display upgrade points
        const upgradePoints = this.add.text(width / 2, buttonY + buttonSpacing + 35, `${saveData.upgradePoints} upgrade points available`, {
            fontSize: '16px',
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace'
        })
        upgradePoints.setOrigin(0.5)
        
        upgradesButton.on('pointerdown', () => {
            this.scene.start('UpgradesScene')
        })
        
        upgradesButton.on('pointerover', () => {
            upgradesButton.setColor('#00FFFF')
            upgradesButton.setScale(1.05)
        })
        
        upgradesButton.on('pointerout', () => {
            upgradesButton.setColor('#00FF00')
            upgradesButton.setScale(1.0)
        })
        
        // High Score display
        const highScore = this.getHighScore()
        this.add.text(width / 2, height - 60, `High Score: ${highScore}`, {
            fontSize: '20px',
            color: '#FFD700',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5)
        
        // Version info
        this.add.text(width / 2, height - 30, 'v1.0.0', {
            fontSize: '14px',
            color: '#888888',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5)
        
        // Keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('LevelSelectScene')
        })
    }
    
    createStarfield() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Create animated starfield background
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width)
            const y = Phaser.Math.Between(0, height)
            const size = Phaser.Math.Between(1, 3)
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8)
            
            const star = this.add.circle(x, y, size, 0xFFFFFF, alpha)
            
            // Twinkling animation
            this.tweens.add({
                targets: star,
                alpha: alpha * 0.3,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            })
        }
    }
    
    getHighScore() {
        try {
            const saved = localStorage.getItem('starTrekAdventuresHighScore')
            return saved ? parseInt(saved, 10) : 0
        } catch (e) {
            return 0
        }
    }
}
