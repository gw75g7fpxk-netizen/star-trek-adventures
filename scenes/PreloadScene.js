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
        console.log('PreloadScene: Assets ready, starting Level 1...');
        
        // Initialize audio context early to reduce sound delay later
        this.initializeAudioContext();
        
        // Small delay for effect
        this.time.delayedCall(this.SCENE_TRANSITION_DELAY, () => {
            this.scene.start('Level1Scene');
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
        const title = this.add.text(width / 2, height / 2 - 100, 'STAR TREK ADVENTURES', {
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
        
        // Create placeholder graphics as textures for other game objects
        // These will be replaced with actual sprites later
        
        // Boss placeholder texture removed - waiting for proper boss sprite
        // The boss sprite reference 'boss' needs to be created but without visible texture
        const bossGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bossGraphics.fillStyle(0x000000, 0); // Transparent
        bossGraphics.fillRect(0, 0, 200, 200);
        bossGraphics.generateTexture('boss', 200, 200);
        bossGraphics.destroy();
        
        // Player bullet placeholder (yellow rectangle)
        const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bulletGraphics.fillStyle(0xFFFF00, 1);
        bulletGraphics.fillRect(0, 0, 4, 12);
        bulletGraphics.generateTexture('bullet', 4, 12);
        bulletGraphics.destroy();
        
        // Enemy bullet placeholder (red rectangle)
        const enemyBulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        enemyBulletGraphics.fillStyle(0xFF0000, 1);
        enemyBulletGraphics.fillRect(0, 0, 6, 10);
        enemyBulletGraphics.generateTexture('enemy-bullet', 6, 10);
        enemyBulletGraphics.destroy();
        
        // Escape pod placeholder (white/cyan circle)
        const podGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        podGraphics.fillStyle(0xFFFFFF, 1);
        podGraphics.fillCircle(10, 10, 10);
        podGraphics.fillStyle(0x00FFFF, 1);
        podGraphics.fillCircle(10, 10, 6);
        podGraphics.generateTexture('escape-pod', 20, 20);
        podGraphics.destroy();
        
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
