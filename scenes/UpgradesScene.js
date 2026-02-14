// Upgrades Scene - Ship upgrade system (placeholder for future implementation)
class UpgradesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradesScene' })
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        console.log('UpgradesScene: Opening upgrades...')
        
        // Load progress data
        this.saveData = ProgressConfig.loadProgress()
        
        // Background
        this.createStarfield()
        
        // Title
        const title = this.add.text(width / 2, 50, 'SHIP UPGRADES', {
            fontSize: '36px',
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        
        // Points display
        const pointsText = this.add.text(width / 2, 100, `Available Points: ${this.saveData.upgradePoints}`, {
            fontSize: '24px',
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        pointsText.setOrigin(0.5)
        
        // Coming soon message
        const comingSoon = this.add.text(width / 2, height / 2, 'UPGRADE SYSTEM\n\nComing Soon!', {
            fontSize: '32px',
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
        
        const startY = height / 2 + 100
        const spacing = 35
        
        this.add.text(width / 2, startY - 40, 'Planned Upgrade Categories:', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5)
        
        upgradeCategories.forEach((category, index) => {
            const categoryText = this.add.text(width / 2, startY + index * spacing, `• ${category}`, {
                fontSize: '16px',
                color: '#00FF00',
                fontFamily: 'Courier New, monospace'
            })
            categoryText.setOrigin(0.5)
        })
        
        // Back button
        const backButton = this.add.text(width / 2, height - 50, '[ BACK TO MENU ]', {
            fontSize: '24px',
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
