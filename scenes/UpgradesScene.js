// Upgrades Scene - Ship upgrade system (placeholder for future implementation)
class UpgradesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradesScene' })
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600
        
        console.log('UpgradesScene: Opening upgrades...')
        
        // Load progress data
        this.saveData = ProgressConfig.loadProgress()
        
        // Background
        this.createStarfield()
        
        // Title
        const titleSize = isMobile ? '28px' : '36px'
        const titleY = isMobile ? 40 : 50
        const title = this.add.text(width / 2, titleY, 'SHIP UPGRADES', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        
        // Points display
        const pointsSize = isMobile ? '20px' : '24px'
        const pointsY = isMobile ? 75 : 100
        const pointsText = this.add.text(width / 2, pointsY, `Available Points: ${this.saveData.upgradePoints}`, {
            fontSize: pointsSize,
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        pointsText.setOrigin(0.5)
        
        // Coming soon message
        const comingSoonSize = isMobile ? '24px' : '32px'
        const comingSoon = this.add.text(width / 2, height / 2 - 40, 'UPGRADE SYSTEM\n\nComing Soon!', {
            fontSize: comingSoonSize,
            color: '#00FFFF',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold',
            align: 'center'
        })
        comingSoon.setOrigin(0.5)
        
        // Placeholder upgrade categories
        const upgradeCategories = [
            'Hull Plating',
            'Shield Generators',
            'Phaser Arrays',
            'Torpedo Launchers',
            'Impulse Engines',
            'Sensor Array'
        ]
        
        const startY = height / 2 + 60
        const spacing = isMobile ? 28 : 35
        const categorySize = isMobile ? '14px' : '16px'
        const categoryHeaderOffset = isMobile ? -30 : -35
        
        this.add.text(width / 2, startY + categoryHeaderOffset, 'Planned Upgrade Categories:', {
            fontSize: isMobile ? '16px' : '18px',
            color: '#FFFFFF',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5)
        
        upgradeCategories.forEach((category, index) => {
            const categoryText = this.add.text(width / 2, startY + index * spacing, `• ${category}`, {
                fontSize: categorySize,
                color: '#00FF00',
                fontFamily: 'Courier New, monospace'
            })
            categoryText.setOrigin(0.5)
        })
        
        // Back button - ensure it's visible on mobile
        const backButtonY = isMobile ? height - 60 : height - 50
        const backButtonSize = isMobile ? '20px' : '24px'
        const backButton = this.add.text(width / 2, backButtonY, '[ BACK TO MENU ]', {
            fontSize: backButtonSize,
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        backButton.setOrigin(0.5)
        backButton.setInteractive()
        
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene')
        })
        
        backButton.on('pointerover', () => {
            backButton.setColor('#00FFFF')
            backButton.setScale(1.05)
        })
        
        backButton.on('pointerout', () => {
            backButton.setColor('#00FF00')
            backButton.setScale(1.0)
        })
        
        // Keyboard shortcut
        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('MainMenuScene')
        })
    }
    
    createStarfield() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Create starfield background
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width)
            const y = Phaser.Math.Between(0, height)
            const size = Phaser.Math.Between(1, 2)
            const alpha = Phaser.Math.FloatBetween(0.3, 0.7)
            
            this.add.circle(x, y, size, 0xFFFFFF, alpha)
        }
    }
}
