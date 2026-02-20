// Preload Scene - Load all game assets and sounds
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        // Scene transition delay in milliseconds
        this.SCENE_TRANSITION_DELAY = 500;
    }

    preload() {
        console.log('PreloadScene: Loading assets...');
        
        // Create loading UI
        this.createLoadingUI();
        
        // Load graphics (placeholder rectangles for now)
        this.loadPlaceholderAssets();
        
        // Update loading bar
        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x00FFFF, 1);
            this.progressBar.fillRect(this.progressBarX, this.progressBarY, this.progressBarWidth * value, this.progressBarHeight);
        });
        
        this.load.on('complete', () => {
            console.log('PreloadScene: All assets loaded');
        });
    }

    create() {
        console.log('PreloadScene: Assets ready, starting main menu...');
        
        // Initialize audio context early to reduce sound delay later
        this.initializeAudioContext();
        
        // Small delay for effect
        this.time.delayedCall(this.SCENE_TRANSITION_DELAY, () => {
            this.scene.start('MainMenuScene');
        });
    }
    
    initializeAudioContext() {
        // Try to resume audio context early during preload
        // This helps reduce sound delay when the game starts
        if (this.sound && this.sound.context) {
            if (this.sound.context.state === 'suspended') {
                // Set up user interaction listeners to resume audio context
                const resumeAudio = () => {
                    this.sound.context.resume().then(() => {
                        console.log('PreloadScene: Audio context resumed early');
                    });
                    // Remove listeners after first interaction
                    this.input.off('pointerdown', resumeAudio);
                    if (this.input.keyboard) {
                        this.input.keyboard.off('keydown', resumeAudio);
                    }
                };
                
                // Listen for first user interaction
                this.input.on('pointerdown', resumeAudio);
                if (this.input.keyboard) {
                    this.input.keyboard.on('keydown', resumeAudio);
                }
            }
        }
    }

    createLoadingUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Title
        const title = this.add.text(width / 2, height / 2 - 100, 'STAR TREK AURORA', {
            fontSize: '32px',
            color: '#00FFFF',
            fontFamily: 'Arial'
        });
        title.setOrigin(0.5);
        
        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.loadingText.setOrigin(0.5);
        
        // Progress bar dimensions (centered on screen)
        const barWidth = 300;
        const barHeight = 30;
        this.progressBarX = (width - barWidth) / 2;
        this.progressBarY = height / 2;
        
        // Progress bar background
        const progressBarBg = this.add.graphics();
        progressBarBg.fillStyle(0x222222, 1);
        progressBarBg.fillRect(this.progressBarX, this.progressBarY, barWidth, barHeight);
        
        // Progress bar
        this.progressBar = this.add.graphics();
        this.progressBarWidth = barWidth;
        this.progressBarHeight = barHeight;
    }

    loadPlaceholderAssets() {
        // Load actual player ship image (PNG with proper alpha transparency)
        this.load.image('player-ship', 'assets/images/player-ship.png');
        
        // Load actual enemy fighter image (will be scaled in Level1Scene)
        this.load.image('enemy-fighter', 'assets/images/enemy-fighter.png');
        
        // Load actual enemy cruiser image (will be scaled in Level1Scene)
        this.load.image('enemy-cruiser', 'assets/images/enemy-cruiser.png');
        
        // Load actual enemy battleship image (will be scaled in Level1Scene)
        this.load.image('enemy-battleship', 'assets/images/enemy-battleship.png');
        
        // Load actual enemy carrier image (will be scaled in Level1Scene)
        this.load.image('enemy-carrier', 'assets/images/enemy-carrier.png');
        
        // Load weapon platform image (will be scaled in Level1Scene)
        this.load.image('weapon-platform', 'assets/images/weapon-platform.png');
        
        // Load escape pod sprite
        this.load.image('escape-pod', 'assets/images/escape-pod.png');
        
        // Load planet image for Level 3
        this.load.image('planet-under-siege', 'assets/images/planet-under-siege.png');
        
        // Load asteroid image
        this.load.image('asteroid', 'assets/images/asteroid.png');
       
        // Load USS Sentinel image (reinforcement flagship)
        this.load.image('uss-sentinel', 'assets/images/uss-sentinel.png');
        
        // Create procedural mine texture (sphere with spikes)
        const mineGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        mineGraphics.fillStyle(0x333333, 1); // Dark gray body
        mineGraphics.fillCircle(8, 8, 7); // Main sphere
        mineGraphics.fillStyle(0x666666, 1); // Lighter gray for spikes
        // Draw spikes around the mine
        mineGraphics.fillCircle(8, 1, 2); // Top spike
        mineGraphics.fillCircle(8, 15, 2); // Bottom spike
        mineGraphics.fillCircle(1, 8, 2); // Left spike
        mineGraphics.fillCircle(15, 8, 2); // Right spike
        mineGraphics.fillStyle(0xFF0000, 1); // Red warning light
        mineGraphics.fillCircle(8, 8, 2); // Center light
        mineGraphics.generateTexture('mine', 16, 16);
        mineGraphics.destroy();
        
        // Create crystal node boss texture (pulsing crystal for Level 2 boss)
        const crystalNodeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        crystalNodeGraphics.fillStyle(0x00FFFF, 1); // Cyan crystal
        crystalNodeGraphics.fillCircle(60, 60, 60); // Main body
        crystalNodeGraphics.fillStyle(0x00CCCC, 1); // Darker cyan
        crystalNodeGraphics.fillCircle(60, 60, 45);
        crystalNodeGraphics.fillStyle(0xFFFFFF, 1); // White highlights
        crystalNodeGraphics.fillCircle(50, 50, 20);
        crystalNodeGraphics.fillCircle(70, 55, 15);
        crystalNodeGraphics.generateTexture('crystal-node', 120, 120);
        crystalNodeGraphics.destroy();
        
        // Load Crystal Entity boss image (Level 2 boss)
        this.load.image('crystal-entity', 'assets/images/crystal-entity.png');
        
        // Load enemy-boss-level-3 image (Level 3 boss - formerly IMG_8423.png)
        this.load.image('enemy-boss-level-3', 'assets/images/enemy-boss-level-3.png');
        
        // Create placeholder graphics as textures for other game objects
        // These will be replaced with actual sprites later
        
        // Boss placeholder texture removed - waiting for proper boss sprite
        // The boss sprite reference 'boss' needs to be created but without visible texture
        const bossGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bossGraphics.fillStyle(0x000000, 0); // Transparent
        bossGraphics.fillRect(0, 0, 200, 200);
        bossGraphics.generateTexture('boss', 200, 200);
        bossGraphics.destroy();
        
        // Boss core (Phase 3) - large red circle (inactive)
        const bossCoreGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bossCoreGraphics.fillStyle(0xFF0000, 1); // Red
        bossCoreGraphics.fillCircle(100, 100, 100); // Large red circle, 200px diameter
        bossCoreGraphics.generateTexture('boss-core', 200, 200);
        bossCoreGraphics.destroy();
        
        // Boss core - yellow variant (active/damageable)
        const bossCoreYellowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bossCoreYellowGraphics.fillStyle(0xFFFF00, 1); // Yellow
        bossCoreYellowGraphics.fillCircle(100, 100, 100); // Large yellow circle, 200px diameter
        bossCoreYellowGraphics.generateTexture('boss-core-yellow', 200, 200);
        bossCoreYellowGraphics.destroy();
        
        // Boss components (generators and turrets) - red shapes (inactive)
        const generatorGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        generatorGraphics.fillStyle(0xFF0000, 1); // Red
        generatorGraphics.fillRect(0, 0, 30, 30);
        generatorGraphics.generateTexture('boss-generator', 30, 30);
        generatorGraphics.destroy();
        
        // Boss generator - yellow variant (active/damageable)
        const generatorYellowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        generatorYellowGraphics.fillStyle(0xFFFF00, 1); // Yellow
        generatorYellowGraphics.fillRect(0, 0, 30, 30);
        generatorYellowGraphics.generateTexture('boss-generator-yellow', 30, 30);
        generatorYellowGraphics.destroy();
        
        const turretGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        turretGraphics.fillStyle(0xFF0000, 1); // Red
        turretGraphics.fillCircle(15, 15, 15);
        turretGraphics.generateTexture('boss-turret', 30, 30);
        turretGraphics.destroy();
        
        // Boss turret - yellow variant (active/damageable)
        const turretYellowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        turretYellowGraphics.fillStyle(0xFFFF00, 1); // Yellow
        turretYellowGraphics.fillCircle(15, 15, 15);
        turretYellowGraphics.generateTexture('boss-turret-yellow', 30, 30);
        turretYellowGraphics.destroy();
        
        // Player bullet placeholder (yellow rectangle)
        const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bulletGraphics.fillStyle(0xFFFF00, 1);
        bulletGraphics.fillRect(0, 0, 4, 12);
        bulletGraphics.generateTexture('bullet', 4, 12);
        bulletGraphics.destroy();
        
        // Enemy bullet placeholder (red circle)
        const enemyBulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        enemyBulletGraphics.fillStyle(0xFF0000, 1);
        enemyBulletGraphics.fillCircle(5, 5, 5);
        enemyBulletGraphics.generateTexture('enemy-bullet', 10, 10);
        enemyBulletGraphics.destroy();
        
        // Player torpedo placeholder (blue circle, same size as enemy bullet)
        const torpedoGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        torpedoGraphics.fillStyle(0x0088FF, 1);
        torpedoGraphics.fillCircle(5, 5, 5);
        torpedoGraphics.generateTexture('torpedo', 10, 10);
        torpedoGraphics.destroy();
        
        // Power-up placeholders (various colors)
        const powerUpGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Shield restore (cyan diamond)
        powerUpGraphics.fillStyle(0x00FFFF, 1);
        powerUpGraphics.fillRect(10, 0, 4, 24);
        powerUpGraphics.fillRect(0, 10, 24, 4);
        powerUpGraphics.generateTexture('powerup-shield', 24, 24);
        powerUpGraphics.clear();
        
        // Fire upgrade (yellow star)
        powerUpGraphics.fillStyle(0xFFFF00, 1);
        powerUpGraphics.fillCircle(12, 12, 12);
        powerUpGraphics.fillStyle(0xFF8800, 1);
        powerUpGraphics.fillCircle(12, 12, 6);
        powerUpGraphics.generateTexture('powerup-fire', 24, 24);
        powerUpGraphics.clear();
        
        // Speed boost (green arrow)
        powerUpGraphics.fillStyle(0x00FF00, 1);
        powerUpGraphics.fillTriangle(12, 0, 0, 24, 24, 24);
        powerUpGraphics.generateTexture('powerup-speed', 24, 24);
        powerUpGraphics.clear();
        
        // Dilithium (magenta crystal)
        powerUpGraphics.fillStyle(0xFF00FF, 1);
        powerUpGraphics.fillRect(8, 0, 8, 24);
        powerUpGraphics.fillRect(0, 8, 24, 8);
        powerUpGraphics.generateTexture('powerup-dilithium', 24, 24);
        powerUpGraphics.clear();
        
        // Tractor beam (blue circle)
        powerUpGraphics.fillStyle(0x0088FF, 1);
        powerUpGraphics.fillCircle(12, 12, 12);
        powerUpGraphics.fillStyle(0x004488, 1);
        powerUpGraphics.fillCircle(12, 12, 8);
        powerUpGraphics.generateTexture('powerup-tractor', 24, 24);
        powerUpGraphics.destroy();
        
        // Explosion placeholder (orange/red circles)
        const explosionGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        explosionGraphics.fillStyle(0xFF8800, 0.8);
        explosionGraphics.fillCircle(20, 20, 20);
        explosionGraphics.fillStyle(0xFF0000, 0.6);
        explosionGraphics.fillCircle(20, 20, 12);
        explosionGraphics.generateTexture('explosion', 40, 40);
        explosionGraphics.destroy();
        
        console.log('PreloadScene: Placeholder assets created');
        // Note: Sound effects are generated at runtime in Level1Scene using Web Audio API
    }
}
