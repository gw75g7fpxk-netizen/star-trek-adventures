// Boot Scene - Initial setup and system checks
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar for boot assets
        this.createLoadingBar();
    }

    create() {
        console.log('BootScene: Initializing game systems...');
        
        // Set up game scale manager
        this.scale.on('resize', this.resize, this);
        
        // Initialize any global game systems here
        this.initializeGameSystems();
        
        // Proceed to Preload scene
        this.scene.start('PreloadScene');
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Boot text
        const bootText = this.add.text(width / 2, height / 2 - 50, 'STAR TREK ADVENTURES', {
            fontSize: '32px',
            color: '#00FFFF',
            fontFamily: 'Arial'
        });
        bootText.setOrigin(0.5);
    }

    initializeGameSystems() {
        // Initialize game-wide systems
        console.log('BootScene: Game systems initialized');
        console.log('BootScene: Physics: Arcade');
        console.log('BootScene: Target FPS: 60');
        console.log('BootScene: Scale Mode: FIT');
    }

    resize(gameSize) {
        // Handle resize events
        const width = gameSize.width;
        const height = gameSize.height;
        this.cameras.resize(width, height);
    }
}
