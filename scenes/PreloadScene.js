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
            this.progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            console.log('PreloadScene: All assets loaded');
        });
    }

    create() {
        console.log('PreloadScene: Assets ready, starting Level 1...');
        
        // Small delay for effect
        this.time.delayedCall(this.SCENE_TRANSITION_DELAY, () => {
            this.scene.start('Level1Scene');
        });
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
        
        // Progress bar background
        const progressBarBg = this.add.graphics();
        progressBarBg.fillStyle(0x222222, 1);
        progressBarBg.fillRect(250, 280, 300, 30);
        
        // Progress bar
        this.progressBar = this.add.graphics();
    }

    loadPlaceholderAssets() {
        // Create placeholder graphics as textures
        // These will be replaced with actual sprites later
        
        // Player ship placeholder (blue triangle)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0x0088FF, 1);
        playerGraphics.fillTriangle(20, 0, 0, 40, 40, 40);
        playerGraphics.generateTexture('player-ship', 40, 40);
        playerGraphics.destroy();
        
        // Enemy ship placeholder (red triangle)
        const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        enemyGraphics.fillStyle(0xFF0000, 1);
        enemyGraphics.fillTriangle(20, 40, 0, 0, 40, 0);
        enemyGraphics.generateTexture('enemy-ship', 40, 40);
        enemyGraphics.destroy();
        
        // Bullet placeholder (small yellow rectangle)
        const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bulletGraphics.fillStyle(0xFFFF00, 1);
        bulletGraphics.fillRect(0, 0, 4, 12);
        bulletGraphics.generateTexture('bullet', 4, 12);
        bulletGraphics.destroy();
        
        console.log('PreloadScene: Placeholder assets created');
    }
}
