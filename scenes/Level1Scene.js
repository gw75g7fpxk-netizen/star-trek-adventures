// Level 1 Scene - Main gameplay scene

// Sound effect frequency constants for Web Audio API
const SOUND_CONFIG = {
    phaser: { startFreq: 800, endFreq: 200, duration: 0.1, gain: 0.1 },
    explosion: { startFreq: 100, endFreq: 50, duration: 0.3, gain: 0.2 },
    rescue: { startFreq: 400, endFreq: 800, duration: 0.2, gain: 0.15 },
    boss: { freq: 80, duration: 0.5, gain: 0.2 },
    powerup: { startFreq: 600, endFreq: 1200, duration: 0.15, gain: 0.15 },
    hit: { startFreq: 300, endFreq: 150, duration: 0.08, gain: 0.12 },
    charging: { startFreq: 200, endFreq: 600, duration: 0.5, gain: 0.08 }
};

// Invincibility durations (in milliseconds)
const INVINCIBILITY_DURATION = {
    player: 500,  // Player gets 500ms after taking damage
    enemy: 100    // Enemies get 100ms after taking damage
};

// Rendering depth constants
const RENDER_DEPTH = {
    BOSS: 0,        // Boss main body renders behind components
    COMPONENT: 1    // Boss components (generators, turrets) render in front
};

// Enemy spawn and visibility constants
const ENEMY_VISIBLE_THRESHOLD = 10; // Y position where enemy is considered visibly on screen

// Sound interval for charging sound during pod rescue (in milliseconds)
const CHARGING_SOUND_INTERVAL = 500;

// Escape pod spawn position (above screen top)
const ESCAPE_POD_SPAWN_Y = -20;

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
        
        // Escape pod rescue tracking
        this.podRescueTracking = new Map(); // Map of pod -> { startTime, indicator }
        this.rescueDistance = 80; // Distance to hover near pod
        this.rescueTime = 4000; // 4 seconds to rescue
        
        // Mobile UI safe area offset (accounts for browser chrome)
        this.safeAreaOffset = 120; // pixels from bottom edge
    }
    
    // Haptic feedback stub - works on supported devices
    triggerHaptic(intensity = 'medium') {
        if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 50
            };
            navigator.vibrate(patterns[intensity] || 20);
        }
    }

    create() {
        console.log('Level1Scene: Starting Level 1...');
        
        // Reset game state on scene restart
        this.playerStats = {
            health: PlayerConfig.health,
            maxHealth: PlayerConfig.maxHealth,
            shields: PlayerConfig.shields,
            maxShields: PlayerConfig.maxShields,
            speed: PlayerConfig.speed,
            fireRate: PlayerConfig.fireRate
        };
        this.currentWave = 0;
        this.score = 0;
        this.scoreMultiplier = 1.0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.podsRescued = 0;
        this.isWaveActive = false;
        this.isBossFight = false;
        this.activePowerUps = [];
        this.podRescueTracking = new Map();
        this.invincibleUntil = 0; // Timestamp for invincibility after taking damage
        this.lastShieldRecharge = 0; // Timestamp for last shield recharge
        this.shieldRechargeRate = 30000; // 30 seconds in milliseconds
        
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
        
        // Setup sound effects
        this.setupSounds();
        
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
        
        // Initialize shield recharge timer to current time
        this.lastShieldRecharge = this.time.now;
        
        // Start first wave
        this.startNextWave();
        
        console.log('Level1Scene: Level ready!');
    }
    
    updateCameraDimensions() {
        if (this.cameras && this.cameras.main) {
            this.cameraWidth = this.cameras.main.width;
            this.cameraHeight = this.cameras.main.height;
        }
    }
    
    getSafeAreaOffset() {
        // Return the safe area offset for mobile devices with browser chrome
        return this.safeAreaOffset;
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
        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.cameraWidth, this.cameraHeight);
        }
        
        // Update mobile controls position with safe area offset
        const safeAreaOffset = this.getSafeAreaOffset();
        if (this.joystickBase) {
            this.joystickBase.y = this.cameraHeight - safeAreaOffset;
        }
        if (this.joystickStick) {
            this.joystickStick.y = this.cameraHeight - safeAreaOffset;
        }
        if (this.fireButton) {
            this.fireButton.x = this.cameraWidth - 80;
            this.fireButton.y = this.cameraHeight - safeAreaOffset;
        }
        if (this.fireIcon) {
            this.fireIcon.x = this.cameraWidth - 80;
            this.fireIcon.y = this.cameraHeight - safeAreaOffset;
        }
        
        // Update joystick zone size
        if (this.joystickZone) {
            this.joystickZone.setSize(this.cameraWidth / 2, this.cameraHeight);
        }
        
        // Update HUD text positions (right-aligned elements)
        if (this.scoreText) {
            this.scoreText.x = this.cameraWidth - 10;
        }
        if (this.waveText) {
            this.waveText.x = this.cameraWidth - 10;
        }
        if (this.multiplierText) {
            this.multiplierText.x = this.cameraWidth - 10;
        }
        if (this.podsText) {
            this.podsText.x = this.cameraWidth - 10;
        }
        if (this.highScoreText) {
            this.highScoreText.x = this.cameraWidth - 10;
        }
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
        // Create player ship (USS Defiant) - use percentage-based positioning for mobile compatibility
        const startX = this.cameraWidth * PlayerConfig.startX;
        const startY = this.cameraHeight * PlayerConfig.startY;
        this.player = this.physics.add.sprite(startX, startY, 'player-ship');
        this.player.setCollideWorldBounds(true);
        
        // Set player velocity limits
        this.player.body.setMaxVelocity(this.playerStats.speed, this.playerStats.speed);
        this.player.body.setDrag(200, 200); // Smooth movement
        
        // Add thrust particle emitter to player ship
        this.createThrustParticles();
        
        console.log(`Level1Scene: USS Defiant created at (${startX}, ${startY})`);
    }
    
    createThrustParticles() {
        // Create a small texture for thrust particles
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x00FFFF, 1);
        graphics.fillCircle(2, 2, 2);
        graphics.generateTexture('thrust-particle', 4, 4);
        graphics.destroy();
        
        // Create thrust particle emitter
        this.thrustEmitter = this.add.particles(0, 0, 'thrust-particle', {
            speed: 50,
            angle: { min: 80, max: 100 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 200,
            blendMode: 'ADD',
            frequency: 30,
            follow: this.player,
            followOffset: { x: 0, y: 20 }
        });
        
        this.thrustEmitter.start();
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
        this.autoFire = false;
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
        const safeAreaOffset = this.getSafeAreaOffset();
        const joystickY = this.cameraHeight - safeAreaOffset;
        
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
        const safeAreaOffset = this.getSafeAreaOffset();
        const buttonY = this.cameraHeight - safeAreaOffset;
        
        // Fire button
        this.fireButton = this.add.circle(buttonX, buttonY, buttonRadius, 0xFF0000, 0.4);
        this.fireButton.setScrollFactor(0);
        this.fireButton.setDepth(1000);
        this.fireButton.setInteractive();
        
        // Fire button icon
        this.fireIcon = this.add.text(buttonX, buttonY, 'FIRE', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.fireIcon.setOrigin(0.5);
        this.fireIcon.setScrollFactor(0);
        this.fireIcon.setDepth(1001);
        
        this.fireButton.on('pointerdown', () => {
            // Double tap for auto-fire toggle
            const now = Date.now();
            if (this.lastFireTap && now - this.lastFireTap < 300) {
                this.autoFire = !this.autoFire;
                this.fireIcon.setText(this.autoFire ? 'AUTO' : 'FIRE');
                this.fireButton.setFillStyle(this.autoFire ? 0x00FF00 : 0xFF0000, 0.4);
            }
            this.lastFireTap = now;
            
            this.isFiring = true;
            this.fireButton.setAlpha(0.8);
        });
        
        this.fireButton.on('pointerup', () => {
            if (!this.autoFire) {
                this.isFiring = false;
                this.fireButton.setAlpha(0.4);
            }
        });
        
        this.fireButton.on('pointerout', () => {
            if (!this.autoFire) {
                this.isFiring = false;
                this.fireButton.setAlpha(0.4);
            }
        });
    }

    createHUD() {
        // Star Trek inspired HUD styling
        const hudStyle = {
            fontSize: '14px',
            color: '#00FFFF', // LCARS cyan
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        };
        
        const titleStyle = {
            fontSize: '16px',
            color: '#FF9900', // LCARS orange
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        };
        
        // Health bar background with LCARS style
        const healthBarBg = this.add.graphics();
        healthBarBg.fillStyle(0x333333, 1);
        healthBarBg.fillRect(10, 10, 204, 24);
        healthBarBg.lineStyle(2, 0x00FFFF, 1);
        healthBarBg.strokeRect(10, 10, 204, 24);
        healthBarBg.setScrollFactor(0);
        healthBarBg.setDepth(999);
        
        // Health bar
        this.healthBar = this.add.graphics();
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(999);
        this.updateHealthBar();
        
        // Health text with LCARS styling
        this.healthText = this.add.text(10, 40, `HULL: ${this.playerStats.health}/${this.playerStats.maxHealth}`, hudStyle);
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(999);
        
        // Shields text with LCARS styling
        this.shieldsText = this.add.text(10, 58, `SHIELDS: ${this.playerStats.shields}/${this.playerStats.maxShields}`, hudStyle);
        this.shieldsText.setScrollFactor(0);
        this.shieldsText.setDepth(999);
        
        // Score text (top right) with LCARS styling
        this.scoreText = this.add.text(this.cameraWidth - 10, 10, `SCORE: ${this.score}`, titleStyle);
        this.scoreText.setOrigin(1, 0);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(999);
        
        // Wave text with LCARS styling
        this.waveText = this.add.text(this.cameraWidth - 10, 35, `WAVE: ${this.currentWave}`, hudStyle);
        this.waveText.setOrigin(1, 0);
        this.waveText.setScrollFactor(0);
        this.waveText.setDepth(999);
        
        // Multiplier text with LCARS styling
        this.multiplierText = this.add.text(this.cameraWidth - 10, 58, `MULTIPLIER: x${this.scoreMultiplier.toFixed(1)}`, hudStyle);
        this.multiplierText.setOrigin(1, 0);
        this.multiplierText.setScrollFactor(0);
        this.multiplierText.setDepth(999);
        
        // Pods rescued text with LCARS styling
        this.podsText = this.add.text(this.cameraWidth - 10, 78, `PODS: ${this.podsRescued}`, hudStyle);
        this.podsText.setOrigin(1, 0);
        this.podsText.setScrollFactor(0);
        this.podsText.setDepth(999);
        
        // High score text with LCARS styling
        const highScore = this.getHighScore();
        const highScoreStyle = {
            fontSize: '12px',
            color: '#FFD700',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        };
        this.highScoreText = this.add.text(this.cameraWidth - 10, 98, `HIGH: ${highScore}`, highScoreStyle);
        this.highScoreText.setOrigin(1, 0);
        this.highScoreText.setScrollFactor(0);
        this.highScoreText.setDepth(999);
        
        console.log('Level1Scene: HUD created');
    }

    setupSounds() {
        // Create simple procedural sound effects using Phaser's audio system
        // These are lightweight and don't require external audio files
        
        this.sounds = {
            enabled: true, // Can be toggled by user
            initialized: false
        };
        
        // Initialize audio context on first user interaction
        this.initializeAudioContext();
        
        console.log('Level1Scene: Sound system initialized');
    }
    
    initializeAudioContext() {
        // Web Audio API requires user interaction to start
        // Listen for any user input to initialize the audio context
        const initAudio = () => {
            // Guard clause to prevent errors if sound manager is not available
            if (!this.sound || !this.sound.context) {
                return;
            }
            
            if (!this.sounds.initialized) {
                // Resume the audio context if it's suspended
                if (this.sound.context.state === 'suspended') {
                    this.sound.context.resume().then(() => {
                        console.log('Level1Scene: Audio context resumed');
                        this.sounds.initialized = true;
                    });
                } else {
                    this.sounds.initialized = true;
                }
                
                // Remove the event listeners once initialized
                this.input.off('pointerdown', initAudio);
                this.input.keyboard.off('keydown', initAudio);
            }
        };
        
        // Listen for first user interaction
        this.input.on('pointerdown', initAudio);
        this.input.keyboard.on('keydown', initAudio);
    }

    playSound(type) {
        if (!this.sounds.enabled || !this.sounds.initialized) return;
        
        // Generate and play simple beep sounds using Web Audio API
        // This is a lightweight approach that works cross-platform
        const audioContext = this.sound.context;
        if (!audioContext || audioContext.state === 'suspended') return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const config = SOUND_CONFIG[type];
        if (!config) return;
        
        const time = audioContext.currentTime;
        
        // Configure sound based on type
        switch (type) {
            case 'phaser':
                oscillator.frequency.setValueAtTime(config.startFreq, time);
                oscillator.frequency.exponentialRampToValueAtTime(config.endFreq, time + config.duration);
                gainNode.gain.setValueAtTime(config.gain, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + config.duration);
                oscillator.start(time);
                oscillator.stop(time + config.duration);
                break;
            case 'explosion':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(config.startFreq, time);
                oscillator.frequency.exponentialRampToValueAtTime(config.endFreq, time + config.duration);
                gainNode.gain.setValueAtTime(config.gain, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + config.duration);
                oscillator.start(time);
                oscillator.stop(time + config.duration);
                break;
            case 'rescue':
                oscillator.frequency.setValueAtTime(config.startFreq, time);
                oscillator.frequency.exponentialRampToValueAtTime(config.endFreq, time + config.duration);
                gainNode.gain.setValueAtTime(config.gain, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + config.duration);
                oscillator.start(time);
                oscillator.stop(time + config.duration);
                break;
            case 'boss':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(config.freq, time);
                gainNode.gain.setValueAtTime(config.gain, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + config.duration);
                oscillator.start(time);
                oscillator.stop(time + config.duration);
                break;
            case 'powerup':
                oscillator.frequency.setValueAtTime(config.startFreq, time);
                oscillator.frequency.exponentialRampToValueAtTime(config.endFreq, time + config.duration);
                gainNode.gain.setValueAtTime(config.gain, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + config.duration);
                oscillator.start(time);
                oscillator.stop(time + config.duration);
                break;
            case 'hit':
                // Short impact sound for enemy hits
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(config.startFreq, time);
                oscillator.frequency.exponentialRampToValueAtTime(config.endFreq, time + config.duration);
                gainNode.gain.setValueAtTime(config.gain, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + config.duration);
                oscillator.start(time);
                oscillator.stop(time + config.duration);
                break;
            case 'charging':
                // Charging sound that rises in pitch
                oscillator.frequency.setValueAtTime(config.startFreq, time);
                oscillator.frequency.exponentialRampToValueAtTime(config.endFreq, time + config.duration);
                gainNode.gain.setValueAtTime(config.gain, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + config.duration);
                oscillator.start(time);
                oscillator.stop(time + config.duration);
                break;
        }
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
        
        // Handle shield regeneration
        this.handleShieldRegeneration(time);
        
        // Handle player movement
        this.handlePlayerMovement();
        
        // Handle shooting
        this.handleShooting(time);
        
        // Update enemies
        this.updateEnemies(time);
        
        // Update boss
        if (this.isBossFight) {
            this.updateBoss(time);
        }
        
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
    
    handleShieldRegeneration(time) {
        // Regenerate 1 shield point based on shieldRechargeRate (default: every 30 seconds)
        if (this.playerStats.shields < this.playerStats.maxShields) {
            if (time > this.lastShieldRecharge + this.shieldRechargeRate) {
                this.playerStats.shields++;
                this.lastShieldRecharge = time;
                console.log('Shield recharged! Current shields:', this.playerStats.shields);
            }
        }
    }

    handleShooting(time) {
        const canFire = time > this.lastFired + this.playerStats.fireRate;
        
        if ((this.spaceKey.isDown || this.isFiring || this.autoFire) && canFire) {
            this.fireBullet();
            this.lastFired = time;
        }
    }

    fireBullet() {
        // Get bullet from pool
        const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
        
        if (bullet) {
            // Enable bullet physics using helper (handles active, visible, and body.enable)
            this.enableBulletPhysics(bullet);
            bullet.body.setVelocity(0, -PlayerConfig.bulletSpeed);
            
            // Play phaser fire sound
            this.playSound('phaser');
            
            // Haptic feedback on fire
            this.triggerHaptic('light');
        }
    }

    // Helper function to enable bullet physics body
    enableBulletPhysics(bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        if (bullet.body) {
            bullet.body.enable = true;
        }
    }

    // Helper function to disable bullet physics body
    disableBulletPhysics(bullet) {
        bullet.setActive(false);
        bullet.setVisible(false);
        if (bullet.body) {
            bullet.body.enable = false;
        }
    }

    updateHUD() {
        this.healthText.setText(`HULL: ${this.playerStats.health}/${this.playerStats.maxHealth}`);
        this.shieldsText.setText(`SHIELDS: ${this.playerStats.shields}/${this.playerStats.maxShields}`);
        this.scoreText.setText(`SCORE: ${this.score}`);
        this.waveText.setText(`WAVE: ${this.currentWave}`);
        this.multiplierText.setText(`MULTIPLIER: x${this.scoreMultiplier.toFixed(1)}`);
        this.podsText.setText(`PODS: ${this.podsRescued}`);
        this.updateHealthBar();
    }

    // Method for taking damage (to be used when enemies are implemented)
    takeDamage(amount) {
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < this.invincibleUntil) {
            return; // Still invincible, ignore damage
        }
        
        // Haptic feedback on damage
        this.triggerHaptic('medium');
        
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
        
        // Set invincibility after taking damage
        this.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.player;
        
        if (this.playerStats.health <= 0) {
            this.playerStats.health = 0;
            this.triggerHaptic('heavy');
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
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < (enemy.invincibleUntil || 0)) {
            return; // Still invincible, ignore damage
        }
        
        // Disable bullet using helper function
        this.disableBulletPhysics(bullet);
        
        enemy.health -= 10; // Bullet damage
        
        // Set invincibility after taking damage
        enemy.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.enemy;
        
        // Play hit sound when enemy is damaged
        this.playSound('hit');
        
        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        }
    }
    
    destroyEnemy(enemy) {
        // Add score
        this.addScore(enemy.points);
        this.enemiesKilled++;
        
        // Play explosion sound
        this.playSound('explosion');
        
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
        
        this.takeDamage(1);
    }
    
    playerHitByEnemy(player, enemy) {
        this.takeDamage(1);
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
        
        // Damage the enemy on collision
        enemy.health -= 10;
        
        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        }
        
        if (pod.health <= 0) {
            this.destroyPod(pod);
        }
    }
    
    destroyPod(pod) {
        this.createExplosion(pod.x, pod.y);
        
        // Clean up progress indicator if it exists
        if (this.podRescueTracking.has(pod)) {
            const tracking = this.podRescueTracking.get(pod);
            if (tracking.indicator) {
                tracking.indicator.destroy();
            }
            this.podRescueTracking.delete(pod);
        }
        
        pod.setActive(false);
        pod.setVisible(false);
        pod.destroy();
        
        // Penalty for losing a pod
        this.scoreMultiplier = Math.max(1.0, this.scoreMultiplier - 0.2);
    }
    
    rescuePod(player, pod) {
        // New hover-based rescue mechanic - removed instant rescue
        // The update() method will handle the hover timer and rescue logic
    }
    
    collectPowerUp(player, powerUp) {
        this.applyPowerUp(powerUp.powerUpType);
        this.addScore(powerUp.points);
        
        // Play power-up collection sound
        this.playSound('powerup');
        
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
                    endTime: this.time.now + config.duration,
                    multiplierAmount: config.amount
                });
                this.scoreMultiplier *= config.amount;
                break;
            case 'magnet':
                this.activePowerUps.push({
                    type: type,
                    effect: config.effect,
                    endTime: this.time.now + config.duration,
                    radius: config.amount
                });
                // Tractor beam effect - attract power-ups and pods
                break;
        }
        
        console.log(`Power-up applied: ${config.name}`);
    }
    
    
    getHighScore() {
        try {
            const saved = localStorage.getItem('starTrekAdventuresHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return 0;
        }
    }
    
    saveHighScore() {
        try {
            const currentHigh = this.getHighScore();
            if (this.score > currentHigh) {
                localStorage.setItem('starTrekAdventuresHighScore', this.score.toString());
                console.log('New high score:', this.score);
                return true;
            }
        } catch (e) {
            console.warn('Could not save high score:', e);
        }
        return false;
    }
    
    updateHighScoreDisplay() {
        if (this.highScoreText) {
            const highScore = this.getHighScore();
            this.highScoreText.setText(`HIGH: ${highScore}`);
        }
    }
    
    addScore(points) {
        this.score += Math.floor(points * this.scoreMultiplier);
        // Update high score display if we beat it (but don't save yet to reduce I/O)
        if (this.score > this.getHighScore()) {
            this.updateHighScoreDisplay();
        }
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
            enemy.invincibleUntil = 0; // Initialize invincibility timer
            enemy.movementPattern = config.movementPattern;
            enemy.patternOffset = Math.random() * Math.PI * 2; // Random phase for patterns
            enemy.hasEnteredScreen = false; // Track if enemy has entered visible area
            enemy.initialSpeed = config.speed; // Store initial speed for when body is enabled
            
            // Disable collision detection initially - will be enabled when enemy enters screen
            enemy.body.checkCollision.none = true;
        }
    }
    
    spawnEscapePod() {
        const x = Phaser.Math.Between(50, this.cameraWidth - 50);
        const y = ESCAPE_POD_SPAWN_Y; // Spawn from top of screen
        
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
            
            // Enable collision once enemy is visibly on screen
            // Enemies spawn at y=-50, threshold ensures sprite is clearly visible
            if (!enemy.hasEnteredScreen && enemy.y >= ENEMY_VISIBLE_THRESHOLD) {
                enemy.hasEnteredScreen = true;
                enemy.body.checkCollision.none = false;
                // Set velocity after enabling collision
                if (enemy.initialSpeed) {
                    enemy.body.setVelocity(0, enemy.initialSpeed);
                }
            }
            
            // Update movement pattern
            this.updateEnemyMovement(enemy);
            
            // Enemy shooting - only if on screen
            if (enemy.y < this.cameraHeight && time > enemy.lastFired + enemy.fireRate) {
                this.enemyFire(enemy);
                enemy.lastFired = time;
            }
            
            // Target escape pods - only if on screen
            const nearestPod = this.findNearestPod(enemy);
            if (enemy.y < this.cameraHeight && nearestPod && Phaser.Math.Distance.Between(enemy.x, enemy.y, nearestPod.x, nearestPod.y) < 200) {
                // Shoot at pod only if fire rate allows
                if (time > enemy.lastFired + enemy.fireRate) {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, nearestPod.x, nearestPod.y);
                    const bullet = this.enemyBullets.get(enemy.x, enemy.y, 'enemy-bullet');
                    
                    if (bullet) {
                        bullet.setActive(true);
                        bullet.setVisible(true);
                        const speed = EnemyConfig[enemy.enemyType].bulletSpeed;
                        bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                        enemy.lastFired = time;
                    }
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
                const lastOffset = enemy.lastWeavingOffset ?? 0;
                enemy.x = enemy.x + (weavingOffset - lastOffset);
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
            
            // Check if pod is off screen (don't count as rescue)
            if (pod.y < -50 || pod.y > this.cameraHeight + 50 || pod.x < -50 || pod.x > this.cameraWidth + 50) {
                // Pod went off screen - cancel any rescue in progress
                if (this.podRescueTracking.has(pod)) {
                    const tracking = this.podRescueTracking.get(pod);
                    if (tracking.indicator) {
                        tracking.indicator.destroy();
                    }
                    this.podRescueTracking.delete(pod);
                }
                return;
            }
            
            // Calculate distance to player
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                pod.x, pod.y
            );
            
            // Check if player is hovering near the pod
            if (distance <= this.rescueDistance) {
                // Start or continue rescue timer
                if (!this.podRescueTracking.has(pod)) {
                    // Start new rescue attempt
                    const indicator = this.add.graphics();
                    indicator.setDepth(500);
                    this.podRescueTracking.set(pod, {
                        startTime: this.time.now,
                        indicator: indicator,
                        lastChargingSound: 0
                    });
                }
                
                const tracking = this.podRescueTracking.get(pod);
                const elapsed = this.time.now - tracking.startTime;
                const progress = Math.min(elapsed / this.rescueTime, 1.0);
                
                // Play charging sound periodically while rescuing
                if (progress > 0 && progress < 1.0) {
                    // Play charging sound at regular intervals
                    if (this.time.now - tracking.lastChargingSound > CHARGING_SOUND_INTERVAL) {
                        this.playSound('charging');
                        tracking.lastChargingSound = this.time.now;
                    }
                }
                
                // Draw progress indicator (green circle that fills up)
                tracking.indicator.clear();
                tracking.indicator.lineStyle(3, 0x00FF00, 1);
                tracking.indicator.strokeCircle(pod.x, pod.y, 25);
                
                // Draw filled arc showing progress
                if (progress > 0) {
                    tracking.indicator.fillStyle(0x00FF00, 0.3);
                    tracking.indicator.beginPath();
                    tracking.indicator.slice(pod.x, pod.y, 25, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2, false);
                    tracking.indicator.closePath();
                    tracking.indicator.fillPath();
                }
                
                // Check if rescue is complete
                if (progress >= 1.0) {
                    this.completePodRescue(pod);
                }
            } else {
                // Player moved too far away - reset rescue timer
                if (this.podRescueTracking.has(pod)) {
                    const tracking = this.podRescueTracking.get(pod);
                    if (tracking.indicator) {
                        tracking.indicator.destroy();
                    }
                    this.podRescueTracking.delete(pod);
                }
            }
            
            // Check if reached safe zone (stop moving but don't auto-rescue)
            if (pod.y >= this.cameraHeight * PodConfig.safeZoneY) {
                pod.body.setVelocity(0, 0); // Stop moving
            }
        });
    }
    
    completePodRescue(pod) {
        // Complete the rescue
        this.podsRescued++;
        this.addScore(PodConfig.points);
        this.scoreMultiplier = Math.min(5.0, this.scoreMultiplier + 0.2);
        
        // Play rescue success sound
        this.playSound('rescue');
        
        // Haptic feedback on rescue
        this.triggerHaptic('medium');
        
        // Clean up tracking
        const tracking = this.podRescueTracking.get(pod);
        if (tracking && tracking.indicator) {
            tracking.indicator.destroy();
        }
        this.podRescueTracking.delete(pod);
        
        // Remove the pod
        pod.setActive(false);
        pod.setVisible(false);
        pod.destroy();
        
        console.log('Pod rescued!');
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
                        this.scoreMultiplier /= powerUp.multiplierAmount;
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
        
        // Add particle effect for explosion
        this.createExplosionParticles(x, y);
    }
    
    createExplosionParticles(x, y) {
        // Create particle emitter for explosion effect
        const particles = this.add.particles(x, y, 'explosion', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            blendMode: 'ADD',
            quantity: 10,
            emitting: false
        });
        
        particles.explode(10);
        
        // Clean up particles after animation
        this.time.delayedCall(500, () => {
            particles.destroy();
        });
    }
    
    startBossFight() {
        this.isBossFight = true;
        console.log('Boss fight starting!');
        
        // Play boss alert sound
        this.playSound('boss');
        
        // Spawn boss
        const x = this.cameraWidth / 2;
        const y = -100;
        
        this.boss = this.physics.add.sprite(x, y, 'boss');
        this.boss.setActive(true);
        this.boss.setVisible(true);
        // Ensure boss is rendered behind its components (generators/turrets)
        this.boss.setDepth(RENDER_DEPTH.BOSS);
        
        // Initialize boss stats
        this.boss.phase = 0;
        this.boss.maxHealth = EnemyConfig.boss.health;
        this.boss.health = EnemyConfig.boss.health;
        this.boss.phaseHealth = EnemyConfig.boss.phases[0].health;
        this.boss.invincibleUntil = 0; // Initialize invincibility timer
        this.boss.generators = [];
        this.boss.turrets = [];
        this.boss.lastAttack = 0;
        this.boss.attackRate = 2000;
        this.boss.moveDirection = 1;
        
        // Move boss into position
        this.tweens.add({
            targets: this.boss,
            y: 150,
            duration: 3000,
            ease: 'Power2'
        });
        
        // Add collision
        this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);
        this.physics.add.overlap(this.player, this.boss, this.playerHitByBoss, null, this);
        
        // Start Phase 1: Shield Generators
        this.time.delayedCall(3000, () => {
            this.startBossPhase1();
        });
    }
    
    startBossPhase1() {
        console.log('Boss Phase 1: Shield Generators');
        this.boss.phase = 1;
        
        // Spawn shield generators around boss
        const positions = [
            { x: -60, y: -60 },
            { x: 60, y: -60 },
            { x: -60, y: 60 },
            { x: 60, y: 60 }
        ];
        
        positions.forEach((pos) => {
            const generator = this.physics.add.sprite(
                this.boss.x + pos.x,
                this.boss.y + pos.y,
                'enemy-cruiser'
            );
            generator.setScale(0.5);
            generator.setDepth(RENDER_DEPTH.COMPONENT); // Render above boss
            generator.health = EnemyConfig.boss.phases[0].generatorHealth;
            generator.invincibleUntil = 0; // Initialize invincibility timer
            generator.isBossComponent = true;
            this.boss.generators.push(generator);
            
            // Add collision
            this.physics.add.overlap(this.bullets, generator, this.hitBossGenerator, null, this);
        });
    }
    
    startBossPhase2() {
        console.log('Boss Phase 2: Turrets');
        this.boss.phase = 2;
        this.boss.phaseHealth = EnemyConfig.boss.phases[1].health;
        
        // Spawn turrets
        const turretCount = 6;
        for (let i = 0; i < turretCount; i++) {
            const angle = (i / turretCount) * Math.PI * 2;
            const radius = 100;
            const turret = this.physics.add.sprite(
                this.boss.x + Math.cos(angle) * radius,
                this.boss.y + Math.sin(angle) * radius,
                'enemy-fighter'
            );
            turret.setScale(0.7);
            turret.setDepth(RENDER_DEPTH.COMPONENT); // Render above boss
            turret.health = EnemyConfig.boss.phases[1].turretHealth;
            turret.invincibleUntil = 0; // Initialize invincibility timer
            turret.isBossComponent = true;
            turret.angle = angle;
            this.boss.turrets.push(turret);
            
            // Add collision
            this.physics.add.overlap(this.bullets, turret, this.hitBossTurret, null, this);
        }
    }
    
    startBossPhase3() {
        console.log('Boss Phase 3: Core Exposed');
        this.boss.phase = 3;
        this.boss.phaseHealth = EnemyConfig.boss.phases[2].health;
        
        // Boss becomes more aggressive
        this.boss.attackRate = 1000;
    }
    
    updateBoss(time) {
        if (!this.boss || !this.boss.active) return;
        
        // Boss horizontal movement
        this.boss.x += this.boss.moveDirection * 2;
        if (this.boss.x < 150 || this.boss.x > this.cameraWidth - 150) {
            this.boss.moveDirection *= -1;
        }
        
        // Update generators positions
        if (this.boss.generators.length > 0) {
            const positions = [
                { x: -60, y: -60 },
                { x: 60, y: -60 },
                { x: -60, y: 60 },
                { x: 60, y: 60 }
            ];
            this.boss.generators.forEach((gen, i) => {
                if (gen && gen.active) {
                    gen.x = this.boss.x + positions[i].x;
                    gen.y = this.boss.y + positions[i].y;
                }
            });
        }
        
        // Update turrets positions
        if (this.boss.turrets.length > 0) {
            this.boss.turrets.forEach((turret, i) => {
                if (turret && turret.active) {
                    const radius = 100;
                    turret.x = this.boss.x + Math.cos(turret.angle) * radius;
                    turret.y = this.boss.y + Math.sin(turret.angle) * radius;
                }
            });
        }
        
        // Boss attacks
        if (time > this.boss.lastAttack + this.boss.attackRate) {
            this.bossAttack();
            this.boss.lastAttack = time;
        }
    }
    
    bossAttack() {
        if (this.boss.phase === 1 || this.boss.phase === 3) {
            // Beam attack - spread of bullets
            for (let i = -2; i <= 2; i++) {
                const angle = Math.PI / 2 + (i * 0.2);
                const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 50, 'enemy-bullet');
                if (bullet) {
                    bullet.setActive(true);
                    bullet.setVisible(true);
                    bullet.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
                }
            }
        }
        
        if (this.boss.phase === 2 || this.boss.phase === 3) {
            // Rapid fire from turrets
            this.boss.turrets.forEach((turret) => {
                if (turret && turret.active) {
                    const angle = Phaser.Math.Angle.Between(turret.x, turret.y, this.player.x, this.player.y);
                    const bullet = this.enemyBullets.get(turret.x, turret.y, 'enemy-bullet');
                    if (bullet) {
                        bullet.setActive(true);
                        bullet.setVisible(true);
                        bullet.body.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
                    }
                }
            });
        }
        
        if (this.boss.phase === 2) {
            // Spawn minions based on config chance
            const phase2Config = EnemyConfig.boss.phases[1];
            if (Math.random() < phase2Config.minionSpawnChance) {
                this.spawnEnemy({
                    enemyTypes: ['fighter'],
                    difficulty: 2
                });
            }
        }
    }
    
    hitBoss(bullet, boss) {
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < (boss.invincibleUntil || 0)) {
            return; // Still invincible, ignore damage
        }
        
        // Disable bullet using helper function
        this.disableBulletPhysics(bullet);
        
        // Only damage in phase 3 (core exposed)
        if (boss.phase === 3) {
            boss.health -= 10;
            boss.phaseHealth -= 10;
            
            // Set invincibility after taking damage
            boss.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.enemy;
            
            if (boss.phaseHealth <= 0 || boss.health <= 0) {
                this.defeatBoss();
            }
        }
    }
    
    hitBossGenerator(bullet, generator) {
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < (generator.invincibleUntil || 0)) {
            return; // Still invincible, ignore damage
        }
        
        // Disable bullet using helper function
        this.disableBulletPhysics(bullet);
        
        generator.health -= 10;
        
        // Set invincibility after taking damage
        generator.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.enemy;
        
        if (generator.health <= 0) {
            this.createExplosion(generator.x, generator.y);
            generator.setActive(false);
            generator.setVisible(false);
            generator.destroy();
            
            // Remove from array
            const index = this.boss.generators.indexOf(generator);
            if (index > -1) {
                this.boss.generators.splice(index, 1);
            }
            
            // Check if all generators destroyed
            if (this.boss.generators.length === 0) {
                this.startBossPhase2();
            }
        }
    }
    
    hitBossTurret(bullet, turret) {
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < (turret.invincibleUntil || 0)) {
            return; // Still invincible, ignore damage
        }
        
        // Disable bullet using helper function
        this.disableBulletPhysics(bullet);
        
        turret.health -= 10;
        
        // Set invincibility after taking damage
        turret.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.enemy;
        
        if (turret.health <= 0) {
            this.createExplosion(turret.x, turret.y);
            turret.setActive(false);
            turret.setVisible(false);
            turret.destroy();
            
            // Remove from array
            const index = this.boss.turrets.indexOf(turret);
            if (index > -1) {
                this.boss.turrets.splice(index, 1);
            }
            
            // Check if all turrets destroyed
            if (this.boss.turrets.length === 0) {
                this.startBossPhase3();
            }
        }
    }
    
    playerHitByBoss(player, boss) {
        this.takeDamage(1);
    }
    
    defeatBoss() {
        console.log('Boss defeated!');
        
        // Defensive check - should always exist but guard anyway
        if (!this.boss) {
            console.warn('defeatBoss called but boss does not exist');
            return;
        }
        
        // Mark boss as defeated to stop updates
        this.isBossFight = false;
        
        // Capture boss position for explosion effects
        const bossX = this.boss.x;
        const bossY = this.boss.y;
        
        // Disable physics body immediately to prevent post-defeat collisions
        if (this.boss.body) {
            this.boss.body.checkCollision.none = true;
        }
        
        // Hide boss immediately but don't destroy yet (for proper cleanup)
        this.boss.setVisible(false);
        
        // Massive explosion using captured position
        for (let i = 0; i < 10; i++) {
            this.time.delayedCall(i * 200, () => {
                const x = bossX + Phaser.Math.Between(-100, 100);
                const y = bossY + Phaser.Math.Between(-100, 100);
                this.createExplosion(x, y);
            });
        }
        
        // Award points
        this.addScore(EnemyConfig.boss.points);
        
        // Destroy boss and transition to victory after explosions
        this.time.delayedCall(2000, () => {
            if (this.boss) {
                this.boss.destroy();
            }
            this.victory();
        });
    }
    
    victory() {
        console.log('Level1Scene: Victory!');
        
        // Stop all timers
        if (this.waveTimer) this.waveTimer.remove();
        if (this.podTimer) this.podTimer.remove();
        
        // Save high score before transitioning
        this.saveHighScore();
        
        // Transition to victory scene
        this.scene.start('VictoryScene', {
            score: this.score,
            wave: this.currentWave,
            podsRescued: this.podsRescued,
            enemiesKilled: this.enemiesKilled
        });
    }

    gameOver() {
        console.log('Level1Scene: Game Over!');
        
        // Stop all timers
        if (this.waveTimer) this.waveTimer.remove();
        if (this.podTimer) this.podTimer.remove();
        
        // Save high score before transitioning
        this.saveHighScore();
        
        // Transition to game over scene
        this.scene.start('GameOverScene', {
            score: this.score,
            wave: this.currentWave,
            podsRescued: this.podsRescued
        });
    }
}
