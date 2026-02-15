// Level Select Scene - Shows map of all levels as space route
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' })
        this.selectedLevel = 1
        this.secretTapCount = 0 // Track taps on "MISSION SELECT" title
        this.secretTapTimer = null // Timer to reset tap count
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const isMobile = width < 600 || height < 600
        
        console.log('LevelSelectScene: Loading level selection...')
        
        // Load progress data
        this.saveData = ProgressConfig.loadProgress()
        
        // Background starfield
        this.createStarfield()
        
        // Title
        const titleSize = isMobile ? '28px' : '36px'
        const titleY = isMobile ? 25 : 30
        const title = this.add.text(width / 2, titleY, 'MISSION SELECT', {
            fontSize: titleSize,
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        })
        title.setOrigin(0.5)
        title.setInteractive({ useHandCursor: true })
        
        // Add secret tap counter to unlock testing level
        title.on('pointerdown', () => {
            this.secretTapCount++
            
            // Reset timer on each tap
            if (this.secretTapTimer) {
                this.secretTapTimer.remove()
            }
            
            // Reset counter after 2 seconds of no taps
            this.secretTapTimer = this.time.delayedCall(2000, () => {
                this.secretTapCount = 0
            })
            
            // Unlock level 11 after 5 taps
            if (this.secretTapCount >= 5) {
                this.unlockSecretLevel()
            }
        })
        
        // Create the level map
        this.createLevelMap(isMobile)
        
        // Create info panel for selected level
        this.createInfoPanel(isMobile)
        
        // Back button
        this.createBackButton(isMobile)
        
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
    
    createLevelMap(isMobile) {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Define positions for 10 levels in a winding space route
        // For mobile, use a more compact vertical layout
        let levelPositions
        
        if (isMobile) {
            // Mobile: Compact grid layout on the right side
            levelPositions = [
                { x: width * 0.55, y: height * 0.20 },  // Level 1
                { x: width * 0.75, y: height * 0.20 },  // Level 2
                { x: width * 0.55, y: height * 0.32 },  // Level 3
                { x: width * 0.75, y: height * 0.32 },  // Level 4
                { x: width * 0.55, y: height * 0.44 },  // Level 5
                { x: width * 0.75, y: height * 0.44 },  // Level 6
                { x: width * 0.55, y: height * 0.56 },  // Level 7
                { x: width * 0.75, y: height * 0.56 },  // Level 8
                { x: width * 0.55, y: height * 0.68 },  // Level 9
                { x: width * 0.75, y: height * 0.68 },  // Level 10
                { x: width * 0.65, y: height * 0.80 }   // Level 11 (secret)
            ]
        } else {
            // Desktop: Original winding space route
            levelPositions = [
                { x: width * 0.2, y: height * 0.25 },  // Level 1
                { x: width * 0.35, y: height * 0.3 },  // Level 2
                { x: width * 0.5, y: height * 0.25 },  // Level 3
                { x: width * 0.65, y: height * 0.3 },  // Level 4
                { x: width * 0.75, y: height * 0.4 },  // Level 5
                { x: width * 0.7, y: height * 0.55 },  // Level 6
                { x: width * 0.55, y: height * 0.6 },  // Level 7
                { x: width * 0.4, y: height * 0.55 },  // Level 8
                { x: width * 0.3, y: height * 0.65 },  // Level 9
                { x: width * 0.2, y: height * 0.75 },  // Level 10
                { x: width * 0.5, y: height * 0.85 }   // Level 11 (secret)
            ]
        }
        
        this.levelNodes = []
        
        // Draw connecting lines between levels (skip for mobile to reduce clutter)
        if (!isMobile) {
            const graphics = this.add.graphics()
            graphics.lineStyle(2, 0x00FFFF, 0.3)
            
            for (let i = 0; i < levelPositions.length - 1; i++) {
                const start = levelPositions[i]
                const end = levelPositions[i + 1]
                graphics.lineBetween(start.x, start.y, end.x, end.y)
            }
        }
        
        // Create level nodes
        const nodeSize = isMobile ? 15 : 20
        const fontSize = isMobile ? '12px' : '16px'
        const starOffset = isMobile ? -25 : -35
        const lockOffset = isMobile ? -25 : -35
        
        for (let i = 1; i <= 11; i++) {
            const pos = levelPositions[i - 1]
            const isUnlocked = ProgressConfig.isLevelUnlocked(i, this.saveData)
            const stats = ProgressConfig.getLevelStats(i, this.saveData)
            const isCompleted = stats !== null
            
            // Node circle
            const nodeColor = isCompleted ? 0x00FF00 : (isUnlocked ? 0xFFFF00 : 0x666666)
            const nodeAlpha = isUnlocked ? 1.0 : 0.5
            
            const node = this.add.circle(pos.x, pos.y, nodeSize, nodeColor, nodeAlpha)
            node.setStrokeStyle(isMobile ? 2 : 3, 0x00FFFF, nodeAlpha)
            
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
                fontSize: fontSize,
                color: '#000000',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            })
            levelText.setOrigin(0.5)
            
            // Completion star for completed levels
            if (isCompleted) {
                const star = this.add.text(pos.x, pos.y + starOffset, '★', {
                    fontSize: isMobile ? '16px' : '20px',
                    color: '#FFD700'
                })
                star.setOrigin(0.5)
            }
            
            // Lock icon for locked levels
            if (!isUnlocked) {
                const lock = this.add.text(pos.x, pos.y + lockOffset, '🔒', {
                    fontSize: isMobile ? '12px' : '16px'
                })
                lock.setOrigin(0.5)
            }
            
            this.levelNodes.push({ node, levelNumber: i, isUnlocked })
        }
    }
    
    createInfoPanel(isMobile) {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Info panel background - adjust for mobile
        let panelX, panelY, panelWidth, panelHeight
        
        if (isMobile) {
            // Mobile: Smaller panel on left side with reduced height to avoid hiding back button
            panelX = width * 0.03
            panelY = height * 0.12
            panelWidth = width * 0.44
            panelHeight = height * 0.60
        } else {
            // Desktop: Original size
            panelX = width * 0.05
            panelY = height * 0.15
            panelWidth = width * 0.35
            panelHeight = height * 0.7
        }
        
        const panel = this.add.graphics()
        panel.fillStyle(0x000000, 0.8)
        panel.fillRect(panelX, panelY, panelWidth, panelHeight)
        panel.lineStyle(isMobile ? 2 : 3, 0x00FFFF, 1)
        panel.strokeRect(panelX, panelY, panelWidth, panelHeight)
        
        // Info panel text (will be updated dynamically)
        const padding = isMobile ? 10 : 20
        const nameSize = isMobile ? '18px' : '24px'
        const descSize = isMobile ? '12px' : '16px'
        const statsSize = isMobile ? '11px' : '14px'
        
        this.infoPanelTexts = {
            levelName: this.add.text(panelX + padding, panelY + padding, '', {
                fontSize: nameSize,
                color: '#FF9900',
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold',
                wordWrap: { width: panelWidth - padding * 2 }
            }),
            description: this.add.text(panelX + padding, panelY + padding + (isMobile ? 40 : 60), '', {
                fontSize: descSize,
                color: '#FFFFFF',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - padding * 2 }
            }),
            stats: this.add.text(panelX + padding, panelY + padding + (isMobile ? 80 : 120), '', {
                fontSize: statsSize,
                color: '#00FFFF',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - padding * 2 }
            }),
            locked: this.add.text(panelX + padding, panelY + padding + (isMobile ? 80 : 120), '', {
                fontSize: descSize,
                color: '#FF0000',
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: panelWidth - padding * 2 }
            })
        }
        
        // Play button
        const buttonSize = isMobile ? '18px' : '24px'
        const buttonY = panelY + panelHeight - (isMobile ? 50 : 60)
        this.playButton = this.add.text(panelX + panelWidth / 2, buttonY, '[ LAUNCH MISSION ]', {
            fontSize: buttonSize,
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
    
    createBackButton(isMobile) {
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        
        // Position back button based on screen size
        // Mobile: Button near bottom but clear of OS touch areas and info panel
        // Desktop: Button at top to avoid overlap with level map
        const backSize = isMobile ? '16px' : '18px'
        const backX = width / 2
        const backY = isMobile ? height - 85 : 30
        
        const backButton = this.add.text(backX, backY, '[ BACK TO MENU ]', {
            fontSize: backSize,
            color: '#888888',
            fontFamily: 'Courier New, monospace'
        })
        backButton.setOrigin(0.5)
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
    
    unlockSecretLevel() {
        console.log('Secret testing level unlocked!')
        
        // Unlock level 11 in save data
        ProgressConfig.unlockLevel(11, this.saveData)
        
        // Reset tap counter
        this.secretTapCount = 0
        if (this.secretTapTimer) {
            this.secretTapTimer.remove()
        }
        
        // Recreate the level map to show level 11
        this.scene.restart()
    }
}
