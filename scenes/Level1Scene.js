// Level 1 Scene - Main gameplay scene
class Level1Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1Scene' });
        
        // Player stats - loaded from PlayerConfig for easy balancing
        this.playerStats = {
            health: PlayerConfig.health,
            maxHealth: PlayerConfig.maxHealth,
            shields: PlayerConfig.shields,
            maxShields: PlayerConfig.maxShields,
            speed: PlayerConfig.speed,
            fireRate: PlayerConfig.fireRate
        };
        
        // Game state
        this.currentWave = 0;
        this.score = 0;
        this.scoreMultiplier = 1.0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.podsRescued = 0;
        this.isWaveActive = false;
        this.isBossFight = false;
        
        // Power-up effects
        this.activePowerUps = [];
    }

    create() {
        console.log('Level1Scene: Starting Level 1...');
        
        // Store camera dimensions for responsive layout
        this.updateCameraDimensions();
        
        // Listen for resize events
        this.scale.on('resize', this.handleResize, this);
        
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
        
        // Setup enemy system
        this.enemies = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 30,
            runChildUpdate: true
        });
        
        this.enemyBullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 50,
            runChildUpdate: true
        });
        
        // Setup escape pod system
        this.escapePods = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 10,
            runChildUpdate: true
        });
        
        // Setup power-up system
        this.powerUps = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 20,
            runChildUpdate: true
        });
        
        // Setup collisions
        this.setupCollisions();
        
        // Start first wave
        this.startNextWave();
        
        console.log('Level1Scene: Level ready!');
    }
    
    updateCameraDimensions() {
        this.cameraWidth = this.cameras.main.width;
        this.cameraHeight = this.cameras.main.height;
    }
    
    handleResize(gameSize) {
        this.updateCameraDimensions();
        
        // Update background
        if (this.starsLayer) {
            this.starsLayer.setSize(this.cameraWidth, this.cameraHeight);
            this.starsLayer.setPosition(this.cameraWidth / 2, this.cameraHeight / 2);
        }
        if (this.nebulaLayer) {
            this.nebulaLayer.setSize(this.cameraWidth, this.cameraHeight);
            this.nebulaLayer.setPosition(this.cameraWidth / 2, this.cameraHeight / 2);
        }
        
        // Update world bounds
        this.physics.world.setBounds(0, 0, this.cameraWidth, this.cameraHeight);
    }

    createScrollingBackground() {
        // Create parallax background layers
        
        // Layer 1: Deep space stars (slowest)
        const starsGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        starsGraphics.fillStyle(0xFFFFFF, 1);
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 1024);
            const size = Phaser.Math.Between(1, 2);
            starsGraphics.fillCircle(x, y, size);
        }
        starsGraphics.generateTexture('stars-layer', 1024, 1024);
        starsGraphics.destroy();
        
        this.starsLayer = this.add.tileSprite(this.cameraWidth / 2, this.cameraHeight / 2, this.cameraWidth, this.cameraHeight, 'stars-layer');
        
        // Layer 2: Nebula (medium speed)
        const nebulaGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        nebulaGraphics.fillStyle(0x4400FF, 0.3);
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 1024);
            const radius = Phaser.Math.Between(30, 80);
            nebulaGraphics.fillCircle(x, y, radius);
        }
        nebulaGraphics.generateTexture('nebula-layer', 1024, 1024);
        nebulaGraphics.destroy();
        
        this.nebulaLayer = this.add.tileSprite(this.cameraWidth / 2, this.cameraHeight / 2, this.cameraWidth, this.cameraHeight, 'nebula-layer');
        this.nebulaLayer.setAlpha(0.5);
        
        console.log('Level1Scene: Scrolling background created with parallax layers');
    }

    createPlayer() {
        // Create player ship (USS Defiant)
        this.player = this.physics.add.sprite(this.cameraWidth / 2, this.cameraHeight - 100, 'player-ship');
        this.player.setCollideWorldBounds(true);
        
        // Set player velocity limits
        this.player.body.setMaxVelocity(this.playerStats.speed, this.playerStats.speed);
        this.player.body.setDrag(200, 200); // Smooth movement
        
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
        
        // Mobile controls
        this.isFiring = false;
        this.joystickActive = false;
        this.joystickVector = { x: 0, y: 0 };
        
        // Create virtual joystick (left side of screen)
        this.createVirtualJoystick();
        
        // Create fire button (right side of screen)
        this.createFireButton();
        
        console.log('Level1Scene: Controls configured (keyboard + touch)');
    }
    
    createVirtualJoystick() {
        const joystickRadius = 60;
        const joystickX = 80;
        const joystickY = this.cameraHeight - 80;
        
        // Joystick base (semi-transparent)
        this.joystickBase = this.add.circle(joystickX, joystickY, joystickRadius, 0x333333, 0.3);
        this.joystickBase.setScrollFactor(0);
        this.joystickBase.setDepth(1000);
        
        // Joystick stick
        this.joystickStick = this.add.circle(joystickX, joystickY, joystickRadius / 2, 0x00FFFF, 0.6);
        this.joystickStick.setScrollFactor(0);
        this.joystickStick.setDepth(1001);
        
        // Touch zone for joystick (left side of screen)
        this.joystickZone = this.add.zone(0, 0, this.cameraWidth / 2, this.cameraHeight).setOrigin(0);
        this.joystickZone.setInteractive();
        this.joystickZone.setScrollFactor(0);
        
        this.joystickZone.on('pointerdown', (pointer) => {
            this.joystickActive = true;
            this.joystickBase.setPosition(pointer.x, pointer.y);
            this.joystickStick.setPosition(pointer.x, pointer.y);
        });
        
        this.joystickZone.on('pointermove', (pointer) => {
            if (this.joystickActive && pointer.isDown) {
                const angle = Phaser.Math.Angle.Between(
                    this.joystickBase.x, this.joystickBase.y,
                    pointer.x, pointer.y
                );
                const distance = Phaser.Math.Distance.Between(
                    this.joystickBase.x, this.joystickBase.y,
                    pointer.x, pointer.y
                );
                const clampedDistance = Math.min(distance, joystickRadius);
                
                this.joystickStick.x = this.joystickBase.x + Math.cos(angle) * clampedDistance;
                this.joystickStick.y = this.joystickBase.y + Math.sin(angle) * clampedDistance;
                
                // Calculate vector for player movement
                this.joystickVector.x = (this.joystickStick.x - this.joystickBase.x) / joystickRadius;
                this.joystickVector.y = (this.joystickStick.y - this.joystickBase.y) / joystickRadius;
            }
        });
        
        this.joystickZone.on('pointerup', () => {
            this.joystickActive = false;
            this.joystickStick.setPosition(this.joystickBase.x, this.joystickBase.y);
            this.joystickVector.x = 0;
            this.joystickVector.y = 0;
        });
    }
    
    createFireButton() {
        const buttonRadius = 50;
        const buttonX = this.cameraWidth - 80;
        const buttonY = this.cameraHeight - 80;
        
        // Fire button
        this.fireButton = this.add.circle(buttonX, buttonY, buttonRadius, 0xFF0000, 0.4);
        this.fireButton.setScrollFactor(0);
        this.fireButton.setDepth(1000);
        this.fireButton.setInteractive();
        
        // Fire button icon
        const fireIcon = this.add.text(buttonX, buttonY, 'FIRE', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        fireIcon.setOrigin(0.5);
        fireIcon.setScrollFactor(0);
        fireIcon.setDepth(1001);
        
        this.fireButton.on('pointerdown', () => {
            this.isFiring = true;
            this.fireButton.setAlpha(0.8);
        });
        
        this.fireButton.on('pointerup', () => {
            this.isFiring = false;
            this.fireButton.setAlpha(0.4);
        });
        
        this.fireButton.on('pointerout', () => {
            this.isFiring = false;
            this.fireButton.setAlpha(0.4);
        });
    }

    createHUD() {
        // Health bar background
        const healthBarBg = this.add.graphics();
        healthBarBg.fillStyle(0x333333, 1);
        healthBarBg.fillRect(10, 10, 204, 24);
        healthBarBg.setScrollFactor(0);
        healthBarBg.setDepth(999);
        
        // Health bar
        this.healthBar = this.add.graphics();
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(999);
        this.updateHealthBar();
        
        // Health text
        this.healthText = this.add.text(10, 40, `Health: ${this.playerStats.health}/${this.playerStats.maxHealth}`, {
            fontSize: '14px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(999);
        
        // Shields text
        this.shieldsText = this.add.text(10, 58, `Shields: ${this.playerStats.shields}/${this.playerStats.maxShields}`, {
            fontSize: '14px',
            color: '#00FFFF',
            fontFamily: 'Arial'
        });
        this.shieldsText.setScrollFactor(0);
        this.shieldsText.setDepth(999);
        
        // Score text (top right)
        this.scoreText = this.add.text(this.cameraWidth - 10, 10, `Score: ${this.score}`, {
            fontSize: '18px',
            color: '#FFFF00',
            fontFamily: 'Arial'
        });
        this.scoreText.setOrigin(1, 0);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(999);
        
        // Wave text
        this.waveText = this.add.text(this.cameraWidth - 10, 35, `Wave: ${this.currentWave}`, {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.waveText.setOrigin(1, 0);
        this.waveText.setScrollFactor(0);
        this.waveText.setDepth(999);
        
        // Multiplier text
        this.multiplierText = this.add.text(this.cameraWidth - 10, 58, `Multiplier: x${this.scoreMultiplier.toFixed(1)}`, {
            fontSize: '14px',
            color: '#00FF00',
            fontFamily: 'Arial'
        });
        this.multiplierText.setOrigin(1, 0);
        this.multiplierText.setScrollFactor(0);
        this.multiplierText.setDepth(999);
        
        // Pods rescued text
        this.podsText = this.add.text(this.cameraWidth - 10, 78, `Pods Rescued: ${this.podsRescued}`, {
            fontSize: '14px',
            color: '#00FFFF',
            fontFamily: 'Arial'
        });
        this.podsText.setOrigin(1, 0);
        this.podsText.setScrollFactor(0);
        this.podsText.setDepth(999);
        
        console.log('Level1Scene: HUD created');
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
        
        // Update enemies
        this.updateEnemies(time);
        
        // Update escape pods
        this.updateEscapePods();
        
        // Update power-ups
        this.updatePowerUps(time);
        
        // Update HUD
        this.updateHUD();
        
        // Clean up off-screen objects
        this.cleanupOffScreen();
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
        
        // Mobile joystick controls
        if (this.joystickActive) {
            velocityX = this.joystickVector.x * this.playerStats.speed;
            velocityY = this.joystickVector.y * this.playerStats.speed;
        }
        
        // Apply velocity
        this.player.setVelocity(velocityX, velocityY);
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
            bullet.body.setVelocity(0, -PlayerConfig.bulletSpeed);
        }
    }

    updateHUD() {
        this.healthText.setText(`Health: ${this.playerStats.health}/${this.playerStats.maxHealth}`);
        this.shieldsText.setText(`Shields: ${this.playerStats.shields}/${this.playerStats.maxShields}`);
        this.scoreText.setText(`Score: ${this.score}`);
        this.waveText.setText(`Wave: ${this.currentWave}`);
        this.multiplierText.setText(`Multiplier: x${this.scoreMultiplier.toFixed(1)}`);
        this.podsText.setText(`Pods Rescued: ${this.podsRescued}`);
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
    
    setupCollisions() {
        // Player bullets vs enemies
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        
        // Enemy bullets vs player
        this.physics.add.overlap(this.player, this.enemyBullets, this.playerHit, null, this);
        
        // Enemies vs player
        this.physics.add.overlap(this.player, this.enemies, this.playerHitByEnemy, null, this);
        
        // Enemy bullets vs escape pods
        this.physics.add.overlap(this.enemyBullets, this.escapePods, this.podHit, null, this);
        
        // Enemies vs escape pods
        this.physics.add.overlap(this.enemies, this.escapePods, this.podHitByEnemy, null, this);
        
        // Player vs escape pods (rescue)
        this.physics.add.overlap(this.player, this.escapePods, this.rescuePod, null, this);
        
        // Player vs power-ups
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
    }
    
    hitEnemy(bullet, enemy) {
        bullet.setActive(false);
        bullet.setVisible(false);
        
        enemy.health -= 10; // Bullet damage
        
        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        }
    }
    
    destroyEnemy(enemy) {
        // Add score
        this.addScore(enemy.points);
        this.enemiesKilled++;
        
        // Spawn explosion
        this.createExplosion(enemy.x, enemy.y);
        
        // Chance to drop power-up
        if (Math.random() < PowerUpConfig.spawnChance) {
            this.spawnPowerUp(enemy.x, enemy.y);
        }
        
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.destroy();
    }
    
    playerHit(player, bullet) {
        bullet.setActive(false);
        bullet.setVisible(false);
        
        this.takeDamage(10);
    }
    
    playerHitByEnemy(player, enemy) {
        this.takeDamage(20);
        this.destroyEnemy(enemy);
    }
    
    podHit(bullet, pod) {
        bullet.setActive(false);
        bullet.setVisible(false);
        
        pod.health--;
        
        if (pod.health <= 0) {
            this.destroyPod(pod);
        }
    }
    
    podHitByEnemy(enemy, pod) {
        pod.health--;
        
        if (pod.health <= 0) {
            this.destroyPod(pod);
        }
    }
    
    destroyPod(pod) {
        this.createExplosion(pod.x, pod.y);
        pod.setActive(false);
        pod.setVisible(false);
        pod.destroy();
        
        // Penalty for losing a pod
        this.scoreMultiplier = Math.max(1.0, this.scoreMultiplier - 0.2);
    }
    
    rescuePod(player, pod) {
        // Check if pod reached safe zone
        if (pod.y >= this.cameraHeight * PodConfig.safeZoneY) {
            this.podsRescued++;
            this.addScore(PodConfig.points);
            this.scoreMultiplier = Math.min(5.0, this.scoreMultiplier + 0.2);
            
            pod.setActive(false);
            pod.setVisible(false);
            pod.destroy();
            
            console.log('Pod rescued!');
        }
    }
    
    collectPowerUp(player, powerUp) {
        this.applyPowerUp(powerUp.powerUpType);
        this.addScore(powerUp.points);
        
        powerUp.setActive(false);
        powerUp.setVisible(false);
        powerUp.destroy();
    }
    
    applyPowerUp(type) {
        const config = PowerUpConfig.types[type];
        
        switch (config.effect) {
            case 'restore_shields':
                this.playerStats.shields = Math.min(
                    this.playerStats.maxShields,
                    this.playerStats.shields + config.amount
                );
                break;
            case 'increase_fire_rate':
                this.activePowerUps.push({
                    type: type,
                    effect: config.effect,
                    endTime: this.time.now + config.duration,
                    originalValue: this.playerStats.fireRate
                });
                this.playerStats.fireRate = this.playerStats.fireRate * (1 - config.amount);
                break;
            case 'increase_speed':
                this.activePowerUps.push({
                    type: type,
                    effect: config.effect,
                    endTime: this.time.now + config.duration,
                    originalValue: this.playerStats.speed
                });
                this.playerStats.speed = this.playerStats.speed * config.amount;
                break;
            case 'score_multiplier':
                this.activePowerUps.push({
                    type: type,
                    effect: config.effect,
                    endTime: this.time.now + config.duration
                });
                this.scoreMultiplier *= config.amount;
                break;
        }
        
        console.log(`Power-up applied: ${config.name}`);
    }
    
    addScore(points) {
        this.score += Math.floor(points * this.scoreMultiplier);
    }
    
    startNextWave() {
        this.currentWave++;
        const waveKey = `wave${this.currentWave}`;
        const waveConfig = WaveConfig.level1[waveKey];
        
        if (!waveConfig) {
            // Check for boss wave
            if (this.currentWave > WaveConfig.level1.bossWave.threshold) {
                this.startBossFight();
                return;
            }
            // No more waves, victory
            this.victory();
            return;
        }
        
        this.isWaveActive = true;
        this.enemiesSpawned = 0;
        
        console.log(`Starting Wave ${this.currentWave}`);
        
        // Spawn enemies for this wave
        this.waveTimer = this.time.addEvent({
            delay: waveConfig.spawnRate,
            callback: () => {
                if (this.enemiesSpawned < waveConfig.enemyCount) {
                    this.spawnEnemy(waveConfig);
                    this.enemiesSpawned++;
                } else {
                    this.waveTimer.remove();
                }
            },
            loop: true
        });
        
        // Spawn escape pods during wave
        this.podTimer = this.time.addEvent({
            delay: PodConfig.spawnRate,
            callback: () => {
                this.spawnEscapePod();
            },
            loop: true
        });
        
        // End wave after duration
        this.time.delayedCall(waveConfig.duration, () => {
            this.endWave();
        });
    }
    
    endWave() {
        this.isWaveActive = false;
        
        if (this.waveTimer) {
            this.waveTimer.remove();
        }
        if (this.podTimer) {
            this.podTimer.remove();
        }
        
        // Short break before next wave
        this.time.delayedCall(3000, () => {
            this.startNextWave();
        });
    }
    
    spawnEnemy(waveConfig) {
        // Pick random enemy type from wave config
        const enemyType = Phaser.Utils.Array.GetRandom(waveConfig.enemyTypes);
        const config = EnemyConfig[enemyType];
        
        // Random spawn position at top
        const x = Phaser.Math.Between(50, this.cameraWidth - 50);
        const y = -50;
        
        let texture = 'enemy-fighter';
        if (enemyType === 'cruiser') texture = 'enemy-cruiser';
        if (enemyType === 'battleship') texture = 'enemy-battleship';
        
        const enemy = this.enemies.get(x, y, texture);
        
        if (enemy) {
            enemy.setActive(true);
            enemy.setVisible(true);
            enemy.enemyType = enemyType;
            enemy.health = config.health;
            enemy.points = config.points;
            enemy.fireRate = config.fireRate;
            enemy.lastFired = 0;
            enemy.movementPattern = config.movementPattern;
            enemy.patternOffset = Math.random() * Math.PI * 2; // Random phase for patterns
            
            // Set velocity
            enemy.body.setVelocity(0, config.speed);
        }
    }
    
    spawnEscapePod() {
        const x = Phaser.Math.Between(50, this.cameraWidth - 50);
        const y = Phaser.Math.Between(50, 200); // Spawn in upper area
        
        const pod = this.escapePods.get(x, y, 'escape-pod');
        
        if (pod) {
            pod.setActive(true);
            pod.setVisible(true);
            pod.health = PodConfig.health;
            pod.body.setVelocity(0, PodConfig.speed);
            
            // Flashing effect
            this.tweens.add({
                targets: pod,
                alpha: 0.3,
                duration: PodConfig.flashRate,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    spawnPowerUp(x, y) {
        const types = Object.keys(PowerUpConfig.types);
        const randomType = Phaser.Utils.Array.GetRandom(types);
        const config = PowerUpConfig.types[randomType];
        
        let texture = 'powerup-shield';
        if (randomType === 'fireUpgrade') texture = 'powerup-fire';
        if (randomType === 'speedBoost') texture = 'powerup-speed';
        if (randomType === 'dilithium') texture = 'powerup-dilithium';
        if (randomType === 'tractorBeam') texture = 'powerup-tractor';
        
        const powerUp = this.powerUps.get(x, y, texture);
        
        if (powerUp) {
            powerUp.setActive(true);
            powerUp.setVisible(true);
            powerUp.powerUpType = randomType;
            powerUp.points = config.points;
            powerUp.body.setVelocity(0, PowerUpConfig.speed);
        }
    }
    
    updateEnemies(time) {
        this.enemies.children.each((enemy) => {
            if (!enemy.active) return;
            
            // Update movement pattern
            this.updateEnemyMovement(enemy);
            
            // Enemy shooting
            if (time > enemy.lastFired + enemy.fireRate) {
                this.enemyFire(enemy);
                enemy.lastFired = time;
            }
            
            // Target escape pods
            const nearestPod = this.findNearestPod(enemy);
            if (nearestPod && Phaser.Math.Distance.Between(enemy.x, enemy.y, nearestPod.x, nearestPod.y) < 200) {
                // Shoot at pod
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, nearestPod.x, nearestPod.y);
                const bullet = this.enemyBullets.get(enemy.x, enemy.y, 'enemy-bullet');
                
                if (bullet) {
                    bullet.setActive(true);
                    bullet.setVisible(true);
                    const speed = EnemyConfig[enemy.enemyType].bulletSpeed;
                    bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                }
            }
        });
    }
    
    updateEnemyMovement(enemy) {
        const config = EnemyConfig[enemy.enemyType];
        
        switch (enemy.movementPattern) {
            case 'straight':
                // Just move down (already set in spawn)
                break;
            case 'weaving':
                // Sine wave pattern
                const weavingOffset = Math.sin(this.time.now / 500 + enemy.patternOffset) * 100;
                enemy.x = enemy.x + (weavingOffset - enemy.lastWeavingOffset || 0);
                enemy.lastWeavingOffset = weavingOffset;
                break;
            case 'zigzag':
                // Zigzag pattern
                if (this.time.now % 1000 < 500) {
                    enemy.body.setVelocityX(50);
                } else {
                    enemy.body.setVelocityX(-50);
                }
                break;
            case 'horizontal':
                // Move horizontally at top of screen
                if (enemy.y < 100) {
                    enemy.body.setVelocityY(0);
                    if (enemy.x < 100 || enemy.x > this.cameraWidth - 100) {
                        enemy.body.setVelocityX(-enemy.body.velocity.x);
                    }
                    if (enemy.body.velocity.x === 0) {
                        enemy.body.setVelocityX(config.speed);
                    }
                }
                break;
        }
    }
    
    enemyFire(enemy) {
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20, 'enemy-bullet');
        
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            
            // Aim at player
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const speed = EnemyConfig[enemy.enemyType].bulletSpeed;
            bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
    }
    
    findNearestPod(enemy) {
        let nearest = null;
        let minDist = Infinity;
        
        this.escapePods.children.each((pod) => {
            if (!pod.active) return;
            
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, pod.x, pod.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = pod;
            }
        });
        
        return nearest;
    }
    
    updateEscapePods() {
        this.escapePods.children.each((pod) => {
            if (!pod.active) return;
            
            // Check if reached safe zone
            if (pod.y >= this.cameraHeight * PodConfig.safeZoneY) {
                pod.body.setVelocity(0, 0); // Stop moving
            }
        });
    }
    
    updatePowerUps(time) {
        // Check for expired power-ups
        this.activePowerUps = this.activePowerUps.filter((powerUp) => {
            if (time > powerUp.endTime) {
                // Revert effect
                switch (powerUp.effect) {
                    case 'increase_fire_rate':
                        this.playerStats.fireRate = powerUp.originalValue;
                        break;
                    case 'increase_speed':
                        this.playerStats.speed = powerUp.originalValue;
                        break;
                    case 'score_multiplier':
                        this.scoreMultiplier /= PowerUpConfig.types.dilithium.amount;
                        break;
                }
                return false;
            }
            return true;
        });
    }
    
    cleanupOffScreen() {
        // Clean up off-screen bullets
        this.bullets.children.each((bullet) => {
            if (bullet.active && bullet.y < -20) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
        
        this.enemyBullets.children.each((bullet) => {
            if (bullet.active && (bullet.y > this.cameraHeight + 20 || bullet.y < -20 || bullet.x < -20 || bullet.x > this.cameraWidth + 20)) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
        
        // Clean up off-screen enemies
        this.enemies.children.each((enemy) => {
            if (enemy.active && enemy.y > this.cameraHeight + 50) {
                enemy.setActive(false);
                enemy.setVisible(false);
                enemy.destroy();
            }
        });
        
        // Clean up off-screen power-ups
        this.powerUps.children.each((powerUp) => {
            if (powerUp.active && powerUp.y > this.cameraHeight + 50) {
                powerUp.setActive(false);
                powerUp.setVisible(false);
                powerUp.destroy();
            }
        });
    }
    
    createExplosion(x, y) {
        const explosion = this.add.sprite(x, y, 'explosion');
        explosion.setAlpha(0.8);
        
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 300,
            onComplete: () => {
                explosion.destroy();
            }
        });
    }
    
    startBossFight() {
        this.isBossFight = true;
        console.log('Boss fight starting!');
        // Boss fight implementation would go here
        // For now, just show victory
        this.victory();
    }
    
    victory() {
        console.log('Level1Scene: Victory!');
        // Victory screen logic here
    }

    gameOver() {
        console.log('Level1Scene: Game Over!');
        // Game over logic here
    }
}
