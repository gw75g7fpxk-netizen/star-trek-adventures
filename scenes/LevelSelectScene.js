// Level Select Scene - Shows map of all levels as space route
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' })
        this.selectedLevel = 1
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        console.log('LevelSelectScene: Loading level selection...')
        
        // Load progress data
        this.saveData = ProgressConfig.loadProgress()
        
        // Background starfield
        this.createStarfield()
        
        // Title
        const title = this.add.text(width / 2, 30, 'MISSION SELECT', {
            fontSize: '36px',
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        
        // Create the level map
        this.createLevelMap()
        
        // Create info panel for selected level
        this.createInfoPanel()
        
        // Back button
        this.createBackButton()
        
        // Update info panel with initial selection
        this.updateInfoPanel()
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
    
    createLevelMap() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Define positions for 10 levels in a winding space route
        // Arranged as a path through space
        const levelPositions = [
            { x: width * 0.2, y: height * 0.25 },  // Level 1
            { x: width * 0.35, y: height * 0.3 },  // Level 2
            { x: width * 0.5, y: height * 0.25 },  // Level 3
            { x: width * 0.65, y: height * 0.3 },  // Level 4
            { x: width * 0.75, y: height * 0.4 },  // Level 5
            { x: width * 0.7, y: height * 0.55 },  // Level 6
            { x: width * 0.55, y: height * 0.6 },  // Level 7
            { x: width * 0.4, y: height * 0.55 },  // Level 8
            { x: width * 0.3, y: height * 0.65 },  // Level 9
            { x: width * 0.2, y: height * 0.75 }   // Level 10
        ]
        
        this.levelNodes = []
        
        // Draw connecting lines between levels
        const graphics = this.add.graphics()
        graphics.lineStyle(2, 0x00FFFF, 0.3)
        
        for (let i = 0; i < levelPositions.length - 1; i++) {
            const start = levelPositions[i]
            const end = levelPositions[i + 1]
            graphics.lineBetween(start.x, start.y, end.x, end.y)
        }
        
        // Create level nodes
        for (let i = 1; i <= 10; i++) {
            const pos = levelPositions[i - 1]
            const isUnlocked = ProgressConfig.isLevelUnlocked(i, this.saveData)
            const stats = ProgressConfig.getLevelStats(i, this.saveData)
            const isCompleted = stats !== null
            
            // Node circle
            const nodeColor = isCompleted ? 0x00FF00 : (isUnlocked ? 0xFFFF00 : 0x666666)
            const nodeAlpha = isUnlocked ? 1.0 : 0.5
            
            const node = this.add.circle(pos.x, pos.y, 20, nodeColor, nodeAlpha)
            node.setStrokeStyle(3, 0x00FFFF, nodeAlpha)
            
            if (isUnlocked) {
                node.setInteractive({ useHandCursor: true })
                
                node.on('pointerdown', () => {
                    this.selectLevel(i)
                })
                
                node.on('pointerover', () => {
                    node.setScale(1.2)
                    node.setAlpha(1.0)
                })
                
                node.on('pointerout', () => {
                    node.setScale(1.0)
                    node.setAlpha(nodeAlpha)
                })
            }
            
            // Level number
            const levelText = this.add.text(pos.x, pos.y, i.toString(), {
                fontSize: '16px',
                color: '#000000',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            })
            levelText.setOrigin(0.5)
            
            // Completion star for completed levels
            if (isCompleted) {
                const star = this.add.text(pos.x, pos.y - 35, '★', {
                    fontSize: '20px',
                    color: '#FFD700'
                })
                star.setOrigin(0.5)
            }
            
            // Lock icon for locked levels
            if (!isUnlocked) {
                const lock = this.add.text(pos.x, pos.y - 35, '🔒', {
                    fontSize: '16px'
                })
                lock.setOrigin(0.5)
            }
            
            this.levelNodes.push({ node, levelNumber: i, isUnlocked })
        }
    }
    
    createInfoPanel() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Info panel background
        const panelX = width * 0.05
        const panelY = height * 0.15
        const panelWidth = width * 0.35
        const panelHeight = height * 0.7
        
        const panel = this.add.graphics()
        panel.fillStyle(0x000000, 0.8)
        panel.fillRect(panelX, panelY, panelWidth, panelHeight)
        panel.lineStyle(3, 0x00FFFF, 1)
        panel.strokeRect(panelX, panelY, panelWidth, panelHeight)
        
        // Info panel text (will be updated dynamically)
        this.infoPanelTexts = {
            levelName: this.add.text(panelX + 20, panelY + 20, '', {
                fontSize: '24px',
                color: '#FF9900',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold',
                wordWrap: { width: panelWidth - 40 }
            }),
            description: this.add.text(panelX + 20, panelY + 60, '', {
                fontSize: '16px',
                color: '#FFFFFF',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - 40 }
            }),
            stats: this.add.text(panelX + 20, panelY + 120, '', {
                fontSize: '14px',
                color: '#00FFFF',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - 40 }
            }),
            locked: this.add.text(panelX + 20, panelY + 120, '', {
                fontSize: '16px',
                color: '#FF0000',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - 40 }
            })
        }
        
        // Play button
        this.playButton = this.add.text(panelX + panelWidth / 2, panelY + panelHeight - 60, '[ LAUNCH MISSION ]', {
            fontSize: '24px',
            color: '#00FF00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        this.playButton.setOrigin(0.5)
        this.playButton.setInteractive()
        
        this.playButton.on('pointerdown', () => {
            this.launchLevel()
        })
        
        this.playButton.on('pointerover', () => {
            this.playButton.setColor('#00FFFF')
            this.playButton.setScale(1.05)
        })
        
        this.playButton.on('pointerout', () => {
            this.playButton.setColor('#00FF00')
            this.playButton.setScale(1.0)
        })
    }
    
    createBackButton() {
        const width = this.cameras.main.width
        
        const backButton = this.add.text(width / 2, 30, '[ BACK TO MENU ]', {
            fontSize: '18px',
            color: '#888888',
            fontFamily: 'Courier New, monospace'
        })
        backButton.setOrigin(0.5, 0)
        backButton.setInteractive()
        
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene')
        })
        
        backButton.on('pointerover', () => {
            backButton.setColor('#00FFFF')
        })
        
        backButton.on('pointerout', () => {
            backButton.setColor('#888888')
        })
    }
    
    selectLevel(levelNumber) {
        this.selectedLevel = levelNumber
        this.updateInfoPanel()
        console.log(`Selected level ${levelNumber}`)
    }
    
    updateInfoPanel() {
        const levelInfo = ProgressConfig.levelInfo[this.selectedLevel]
        const isUnlocked = ProgressConfig.isLevelUnlocked(this.selectedLevel, this.saveData)
        const stats = ProgressConfig.getLevelStats(this.selectedLevel, this.saveData)
        
        // Update level name
        if (isUnlocked) {
            this.infoPanelTexts.levelName.setText(`LEVEL ${this.selectedLevel}: ${levelInfo.name}`)
            this.infoPanelTexts.description.setText(levelInfo.description)
        } else {
            this.infoPanelTexts.levelName.setText(`LEVEL ${this.selectedLevel}: ???`)
            this.infoPanelTexts.description.setText('Complete previous missions to unlock')
        }
        
        // Update stats or locked message
        if (stats) {
            // Show completion stats
            this.infoPanelTexts.stats.setText(
                `STATUS: COMPLETED ★\n\n` +
                `High Score: ${stats.highScore}\n` +
                `Enemies Defeated: ${stats.enemiesKilled}\n` +
                `Pods Rescued: ${stats.podsRescued}\n` +
                `Waves Cleared: ${stats.wave}`
            )
            this.infoPanelTexts.stats.setVisible(true)
            this.infoPanelTexts.locked.setVisible(false)
            this.playButton.setVisible(true)
        } else if (isUnlocked) {
            // Show unlocked but not completed
            this.infoPanelTexts.stats.setText('STATUS: READY\n\nMission not yet attempted')
            this.infoPanelTexts.stats.setVisible(true)
            this.infoPanelTexts.locked.setVisible(false)
            this.playButton.setVisible(true)
        } else {
            // Show locked
            this.infoPanelTexts.stats.setVisible(false)
            this.infoPanelTexts.locked.setText('🔒 LOCKED\n\nComplete previous missions to unlock this level')
            this.infoPanelTexts.locked.setVisible(true)
            this.playButton.setVisible(false)
        }
    }
    
    launchLevel() {
        const isUnlocked = ProgressConfig.isLevelUnlocked(this.selectedLevel, this.saveData)
        
        if (isUnlocked) {
            console.log(`Launching Level ${this.selectedLevel}`)
            // All levels use Level1Scene with level number parameter
            this.scene.start('Level1Scene', { levelNumber: this.selectedLevel })
        }
    }
}
