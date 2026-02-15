// Upgrades Scene - Ship upgrade system
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
        this.selectedCategory = 'offensive' // Default category
        
        // Background
        this.createStarfield()
        
        // Title
        const titleSize = isMobile ? '24px' : '32px'
        const titleY = isMobile ? 30 : 40
        const title = this.add.text(width / 2, titleY, 'SHIP UPGRADES', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        
        // Points display (will be updated)
        const pointsSize = isMobile ? '18px' : '22px'
        const pointsY = isMobile ? 60 : 75
        this.pointsText = this.add.text(width / 2, pointsY, `Credits: ${this.saveData.upgradePoints}`, {
            fontSize: pointsSize,
            color: '#FFFF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        this.pointsText.setOrigin(0.5)
        
        // Category tabs
        this.createCategoryTabs(isMobile)
        
        // Upgrade list container
        const listStartY = isMobile ? 140 : 160
        this.upgradeListY = listStartY
        this.createUpgradeList(isMobile)
        
        // Back button
        const backButtonY = isMobile ? height - 90 : height - 50
        const backButtonSize = isMobile ? '18px' : '20px'
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
        
        // Keyboard shortcuts
        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('MainMenuScene')
        })
    }
    
    createCategoryTabs(isMobile) {
        const width = this.cameras.main.width
        const tabY = isMobile ? 95 : 115
        const tabSize = isMobile ? '14px' : '16px'
        const spacing = isMobile ? 120 : 160
        
        this.categoryTabs = {}
        const categories = ['offensive', 'defensive', 'movement']
        const startX = width / 2 - (categories.length - 1) * spacing / 2
        
        categories.forEach((categoryKey, index) => {
            const category = UpgradesConfig.categories[categoryKey]
            const x = startX + index * spacing
            
            const tab = this.add.text(x, tabY, category.name, {
                fontSize: tabSize,
                color: categoryKey === this.selectedCategory ? category.color : '#888888',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            })
            tab.setOrigin(0.5)
            tab.setInteractive()
            
            tab.on('pointerdown', () => {
                this.switchCategory(categoryKey)
            })
            
            tab.on('pointerover', () => {
                if (categoryKey !== this.selectedCategory) {
                    tab.setColor('#CCCCCC')
                }
            })
            
            tab.on('pointerout', () => {
                if (categoryKey !== this.selectedCategory) {
                    tab.setColor('#888888')
                }
            })
            
            this.categoryTabs[categoryKey] = tab
        })
    }
    
    switchCategory(categoryKey) {
        if (this.selectedCategory === categoryKey) return
        
        this.selectedCategory = categoryKey
        
        // Update tab colors
        Object.keys(this.categoryTabs).forEach(key => {
            const category = UpgradesConfig.categories[key]
            const tab = this.categoryTabs[key]
            tab.setColor(key === categoryKey ? category.color : '#888888')
        })
        
        // Recreate upgrade list
        this.clearUpgradeList()
        this.createUpgradeList(this.cameras.main.width < 600 || this.cameras.main.height < 600)
    }
    
    clearUpgradeList() {
        if (this.upgradeElements) {
            this.upgradeElements.forEach(element => element.destroy())
        }
        this.upgradeElements = []
    }
    
    createUpgradeList(isMobile) {
        this.upgradeElements = []
        const width = this.cameras.main.width
        const upgrades = UpgradesConfig.getUpgradesByCategory(this.selectedCategory)
        
        const startY = this.upgradeListY
        const spacing = isMobile ? 90 : 110
        const nameSize = isMobile ? '14px' : '16px'
        const descSize = isMobile ? '11px' : '12px'
        const levelSize = isMobile ? '12px' : '14px'
        const buttonSize = isMobile ? '12px' : '14px'
        
        upgrades.forEach((upgrade, index) => {
            const y = startY + index * spacing
            const currentLevel = this.saveData.upgrades[upgrade.key] || 0
            const maxLevel = upgrade.maxLevel
            const cost = UpgradesConfig.getCostToUpgrade(upgrade.key, currentLevel)
            const canAfford = cost !== null && this.saveData.upgradePoints >= cost
            const isMaxed = currentLevel >= maxLevel
            
            // Background box for this upgrade option
            const boxPadding = isMobile ? 8 : 10
            const boxWidth = isMobile ? width - 40 : width - 160
            const boxHeight = isMobile ? 75 : 80
            const boxX = width / 2
            const boxY = y + (isMobile ? 24 : 27)
            
            const background = this.add.rectangle(
                boxX,
                boxY,
                boxWidth,
                boxHeight,
                0x000000,
                0.7
            )
            this.upgradeElements.push(background)
            
            // Upgrade name
            const nameText = this.add.text(width / 2, y, upgrade.name, {
                fontSize: nameSize,
                color: '#FFFFFF',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            })
            nameText.setOrigin(0.5)
            this.upgradeElements.push(nameText)
            
            // Description
            const descText = this.add.text(width / 2, y + (isMobile ? 16 : 18), upgrade.description, {
                fontSize: descSize,
                color: '#AAAAAA',
                fontFamily: 'Courier New, monospace'
            })
            descText.setOrigin(0.5)
            this.upgradeElements.push(descText)
            
            // Level indicator
            const levelText = this.add.text(width / 2, y + (isMobile ? 32 : 36), `Level: ${currentLevel} / ${maxLevel}`, {
                fontSize: levelSize,
                color: '#00FFFF',
                fontFamily: 'Courier New, monospace'
            })
            levelText.setOrigin(0.5)
            this.upgradeElements.push(levelText)
            
            // Upgrade button
            if (!isMaxed) {
                const buttonY = y + (isMobile ? 48 : 54)
                const buttonText = `[ UPGRADE - ${cost} Credits ]`
                const buttonColor = canAfford ? '#00FF00' : '#666666'
                
                const button = this.add.text(width / 2, buttonY, buttonText, {
                    fontSize: buttonSize,
                    color: buttonColor,
                    fontFamily: 'Courier New, monospace',
                    fontStyle: 'bold'
                })
                button.setOrigin(0.5)
                
                if (canAfford) {
                    button.setInteractive()
                    
                    button.on('pointerdown', () => {
                        this.purchaseUpgrade(upgrade.key, cost)
                    })
                    
                    button.on('pointerover', () => {
                        button.setColor('#00FFFF')
                        button.setScale(1.05)
                    })
                    
                    button.on('pointerout', () => {
                        button.setColor('#00FF00')
                        button.setScale(1.0)
                    })
                }
                
                this.upgradeElements.push(button)
            } else {
                // Max level text
                const maxText = this.add.text(width / 2, y + (isMobile ? 48 : 54), '[ MAX LEVEL ]', {
                    fontSize: buttonSize,
                    color: '#FFD700',
                    fontFamily: 'Courier New, monospace',
                    fontStyle: 'bold'
                })
                maxText.setOrigin(0.5)
                this.upgradeElements.push(maxText)
            }
        })
    }
    
    purchaseUpgrade(upgradeKey, cost) {
        const currentLevel = this.saveData.upgrades[upgradeKey] || 0
        
        // Deduct points and upgrade
        this.saveData.upgrades[upgradeKey] = currentLevel + 1
        this.saveData.upgradePoints -= cost
        
        // Save progress
        ProgressConfig.saveProgress(this.saveData)
        
        // Update display
        this.pointsText.setText(`Credits: ${this.saveData.upgradePoints}`)
        
        // Recreate upgrade list to show new state
        this.clearUpgradeList()
        this.createUpgradeList(this.cameras.main.width < 600 || this.cameras.main.height < 600)
        
        console.log(`Purchased ${upgradeKey} level ${currentLevel + 1}`)
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
