// Level 1 Scene - Main gameplay scene
class Level1Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1Scene' });
        
        // Player stats
        this.playerStats = {
            health: 100,
            maxHealth: 100,
            shields: 100,
            maxShields: 100,
            speed: 200,
            fireRate: 200 // milliseconds between shots
        };
        
        // Wave configuration
        this.waveConfig = {
            wave1: { enemyCount: 5, enemyType: 'fighter', spawnRate: 2000, difficulty: 1 },
            wave2: { enemyCount: 8, enemyType: 'fighter', spawnRate: 1500, difficulty: 1.5 },
            wave3: { enemyCount: 10, enemyType: 'mixed', spawnRate: 1200, difficulty: 2 }
        };
        
        this.currentWave = 0;
    }

    create() {
        console.log('Level1Scene: Starting Level 1...');
        
        // Create scrolling background
        this.createScrollingBackground();
        
        // Create player ship
        this.createPlayer();
        
        // Setup controls
        this.setupControls();
        
        // Create HUD
        this.createHUD();
        
        // Setup weapon system
        this.lastFired = 0;
        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 50,
            runChildUpdate: true
        });
        
        console.log('Level1Scene: Level ready!');
    }

    createScrollingBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create parallax background layers
        
        // Layer 1: Deep space stars (slowest)
        const starsGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        starsGraphics.fillStyle(0xFFFFFF, 1);
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 2);
            starsGraphics.fillCircle(x, y, size);
        }
        starsGraphics.generateTexture('stars-layer', width, height);
        starsGraphics.destroy();
        
        this.starsLayer = this.add.tileSprite(width / 2, height / 2, width, height, 'stars-layer');
        
        // Layer 2: Nebula (medium speed)
        const nebulaGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        nebulaGraphics.fillStyle(0x4400FF, 0.3);
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const radius = Phaser.Math.Between(30, 80);
            nebulaGraphics.fillCircle(x, y, radius);
        }
        nebulaGraphics.generateTexture('nebula-layer', width, height);
        nebulaGraphics.destroy();
        
        this.nebulaLayer = this.add.tileSprite(width / 2, height / 2, width, height, 'nebula-layer');
        this.nebulaLayer.setAlpha(0.5);
        
        console.log('Level1Scene: Scrolling background created with parallax layers');
    }

    createPlayer() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create player ship (USS Defiant)
        this.player = this.physics.add.sprite(width / 2, height - 100, 'player-ship');
        this.player.setCollideWorldBounds(true);
        
        // Set player velocity limits
        this.player.body.setMaxVelocity(this.playerStats.speed, this.playerStats.speed);
        this.player.body.setDrag(200, 200); // Smooth movement
        
        // Player animations will be added here
        console.log('Level1Scene: USS Defiant created');
    }

    setupControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Touch/Mouse controls (for mobile)
        this.input.on('pointerdown', (pointer) => {
            this.isFiring = true;
        });
        
        this.input.on('pointerup', (pointer) => {
            this.isFiring = false;
        });
        
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                // Move player towards pointer
                const targetX = pointer.x;
                const targetY = pointer.y;
                
                const angle = Phaser.Math.Angle.Between(
                    this.player.x, this.player.y,
                    targetX, targetY
                );
                
                const velocityX = Math.cos(angle) * this.playerStats.speed;
                const velocityY = Math.sin(angle) * this.playerStats.speed;
                
                this.player.setVelocity(velocityX, velocityY);
            }
        });
        
        console.log('Level1Scene: Controls configured (keyboard + touch)');
    }

    createHUD() {
        const width = this.cameras.main.width;
        
        // Health bar background
        const healthBarBg = this.add.graphics();
        healthBarBg.fillStyle(0x333333, 1);
        healthBarBg.fillRect(10, 10, 204, 24);
        healthBarBg.setScrollFactor(0);
        
        // Health bar
        this.healthBar = this.add.graphics();
        this.healthBar.setScrollFactor(0);
        this.updateHealthBar();
        
        // Health text
        this.healthText = this.add.text(10, 40, `Health: ${this.playerStats.health}/${this.playerStats.maxHealth}`, {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.healthText.setScrollFactor(0);
        
        // Shields text
        this.shieldsText = this.add.text(10, 60, `Shields: ${this.playerStats.shields}/${this.playerStats.maxShields}`, {
            fontSize: '16px',
            color: '#00FFFF',
            fontFamily: 'Arial'
        });
        this.shieldsText.setScrollFactor(0);
        
        console.log('Level1Scene: HUD created with health bar');
    }

    updateHealthBar() {
        this.healthBar.clear();
        
        // Calculate health percentage
        const healthPercent = this.playerStats.health / this.playerStats.maxHealth;
        
        // Color based on health
        let color = 0x00FF00; // Green
        if (healthPercent < 0.5) color = 0xFFFF00; // Yellow
        if (healthPercent < 0.25) color = 0xFF0000; // Red
        
        this.healthBar.fillStyle(color, 1);
        this.healthBar.fillRect(12, 12, 200 * healthPercent, 20);
    }

    update(time, delta) {
        // Scroll background (infinite vertical scrolling)
        this.starsLayer.tilePositionY -= 0.5; // Slow movement
        this.nebulaLayer.tilePositionY -= 1.5; // Faster movement for parallax
        
        // Handle player movement
        this.handlePlayerMovement();
        
        // Handle shooting
        this.handleShooting(time);
        
        // Update HUD
        this.updateHUD();
    }

    handlePlayerMovement() {
        // Reset velocity
        let velocityX = 0;
        let velocityY = 0;
        
        // Keyboard controls
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            velocityX = -this.playerStats.speed;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            velocityX = this.playerStats.speed;
        }
        
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            velocityY = -this.playerStats.speed;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            velocityY = this.playerStats.speed;
        }
        
        // Apply velocity
        this.player.setVelocity(velocityX, velocityY);
        
        // Clamp to screen bounds (already handled by setCollideWorldBounds)
    }

    handleShooting(time) {
        const canFire = time > this.lastFired + this.playerStats.fireRate;
        
        if ((this.spaceKey.isDown || this.isFiring) && canFire) {
            this.fireBullet();
            this.lastFired = time;
        }
    }

    fireBullet() {
        // Get bullet from pool
        const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
        
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.setVelocity(0, -400);
            
            // Remove bullet when it goes off screen
            this.time.delayedCall(2000, () => {
                if (bullet.active) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            });
        }
    }

    updateHUD() {
        this.healthText.setText(`Health: ${this.playerStats.health}/${this.playerStats.maxHealth}`);
        this.shieldsText.setText(`Shields: ${this.playerStats.shields}/${this.playerStats.maxShields}`);
        this.updateHealthBar();
    }

    // Method for taking damage (to be used when enemies are implemented)
    takeDamage(amount) {
        if (this.playerStats.shields > 0) {
            this.playerStats.shields -= amount;
            if (this.playerStats.shields < 0) {
                const overflow = Math.abs(this.playerStats.shields);
                this.playerStats.shields = 0;
                this.playerStats.health -= overflow;
            }
        } else {
            this.playerStats.health -= amount;
        }
        
        if (this.playerStats.health <= 0) {
            this.playerStats.health = 0;
            this.gameOver();
        }
    }

    gameOver() {
        console.log('Level1Scene: Game Over!');
        // Game over logic here
    }
}
