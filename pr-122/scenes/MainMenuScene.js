// Main Menu Scene - Entry point with options to select levels or upgrades
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' })
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600
        
        console.log('MainMenuScene: Starting main menu...')
        
        // Background - starfield effect
        this.createStarfield()
        
        // Title with LCARS styling - adjust size for mobile
        const titleSize = isMobile ? '48px' : '72px'
        const titleY = isMobile ? 60 : height / 4
        const title = this.add.text(width / 2, titleY, 'STAR TREK', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        
        const subtitleSize = isMobile ? '32px' : '48px'
        const subtitleY = isMobile ? 100 : height / 4 + 70
        const subtitle = this.add.text(width / 2, subtitleY, 'AURORA', {
            fontSize: subtitleSize,
            color: '#00FFFF',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        subtitle.setOrigin(0.5)
        
        // Load progress to check if player has unlocked levels
        const saveData = ProgressConfig.loadProgress()
        const unlockedCount = saveData.unlockedLevels.length
        
        // Menu buttons with LCARS styling
        const buttonY = isMobile ? 180 : height / 2 + 20
        const buttonSpacing = isMobile ? 70 : 80
        const buttonSize = isMobile ? '24px' : '32px'
        const infoSize = isMobile ? '14px' : '16px'
        
        // Level Select button
        const levelSelectButton = this.add.text(width / 2, buttonY, '[ MISSION SELECT ]', {
            fontSize: buttonSize,
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        levelSelectButton.setOrigin(0.5)
        levelSelectButton.setInteractive()
        
        // Display unlocked levels count
        const levelProgress = this.add.text(width / 2, buttonY + 30, `${unlockedCount} of 10 missions unlocked`, {
            fontSize: infoSize,
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
            fontSize: buttonSize,
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        upgradesButton.setOrigin(0.5)
        upgradesButton.setInteractive()
        
        // Display upgrade points
        const upgradePoints = this.add.text(width / 2, buttonY + buttonSpacing + 30, `${saveData.upgradePoints} upgrade points available`, {
            fontSize: infoSize,
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
        
        // High Score display - position higher on mobile to prevent cutoff
        const highScore = this.getHighScore()
        const highScoreY = isMobile ? height - 80 : height - 60
        const highScoreSize = isMobile ? '16px' : '20px'
        this.add.text(width / 2, highScoreY, `High Score: ${highScore}`, {
            fontSize: highScoreSize,
            color: '#FFD700',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5)
        
        // Version info
        const versionY = isMobile ? height - 50 : height - 30
        const versionSize = isMobile ? '12px' : '14px'
        this.add.text(width / 2, versionY, 'v1.0.0', {
            fontSize: versionSize,
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
