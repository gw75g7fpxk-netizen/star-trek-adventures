// Level 1 Scene - Main gameplay scene

// Sound effect frequency constants for Web Audio API
const SOUND_CONFIG = {
    phaser: { startFreq: 800, endFreq: 200, duration: 0.1, gain: 0.1 },
    explosion: { startFreq: 100, endFreq: 50, duration: 0.3, gain: 0.2 },
    rescue: { startFreq: 400, endFreq: 800, duration: 0.2, gain: 0.15 },
    boss: { freq: 80, duration: 0.5, gain: 0.2 },
    powerup: { startFreq: 600, endFreq: 1200, duration: 0.15, gain: 0.15 },
    hit: { startFreq: 300, endFreq: 150, duration: 0.08, gain: 0.12 },
    charging: { startFreq: 200, endFreq: 600, duration: 0.5, gain: 0.08 },
    torpedo: { startFreq: 150, endFreq: 400, duration: 0.25, gain: 0.15 }
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
const DEFAULT_VERTICAL_SCROLL_SPEED = 50; // Default downward velocity for stationary enemies (px/s)

// Sound interval for charging sound during pod rescue (in milliseconds)
const CHARGING_SOUND_INTERVAL = 500;

// Cheat code constants for testing
const CHEAT_INVINCIBILITY_DURATION = 60000; // 60 seconds in milliseconds
const CHEAT_FIRE_RATE = 100; // Milliseconds between shots

// Escape pod spawn position (above screen top)
const ESCAPE_POD_SPAWN_Y = -20;

// Scout formation flight pattern constants
const SCOUT_CIRCLE_TRIGGER_FRACTION = 3; // Start circling at 1/3 of screen height

// Shield impact effect constants
const SHIELD_IMPACT = {
    radius: 40,           // Initial radius of shield bubble
    color: 0x00FFFF,      // Cyan color for shield effect
    strokeWidth: 3,       // Stroke thickness
    strokeAlpha: 0.8,     // Stroke opacity
    scale: 1.5,           // Expansion scale
    duration: 300         // Animation duration in milliseconds
};

// HUD bar dimension constants
const HUD_BAR = {
    width: 204,           // Total bar width in pixels
    height: 10,           // Bar height in pixels
    segmentGap: 2,        // Gap between segments in pixels
    xPos: 10,             // X position on screen
    healthYPos: 10,       // Y position for health bar
    shieldsYPos: 22       // Y position for shields bar
};

// Asteroid rotation constants
const ASTEROID_ROTATION_FACTOR = 0.01; // Rotation speed multiplier for asteroids

// Asteroid avoidance constants
const ASTEROID_AVOIDANCE_RADIUS = 100; // Distance at which enemies start avoiding asteroids (in pixels)
const ASTEROID_AVOIDANCE_FORCE = 80; // Force multiplier for asteroid avoidance vector

// Crystal node boss animation constants
const CRYSTAL_PULSE = {
    speed: 0.002,         // Pulse animation speed
    maxScale: 1.1,        // Maximum scale during pulse
    minScale: 0.9         // Minimum scale during pulse
};

// Boss movement constants
const BOSS_MOVEMENT_DIVISOR = 20; // Divisor for converting config speed to frame-based movement

// Enemy health bar constants
const ENEMY_HEALTH_BAR = {
    width: 30,            // Health bar width in pixels
    height: 4,            // Health bar height in pixels
    yOffset: 8            // Distance above enemy sprite
};

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
        
        // Track previous max values for HUD bar optimization
        this.previousMaxHealth = PlayerConfig.maxHealth;
        this.previousMaxShields = PlayerConfig.maxShields;
        
        // Game state
        this.currentWave = 0;
        this.score = 0;
        this.scoreMultiplier = 1.0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.podsRescued = 0;
        this.isWaveActive = false;
        this.isBossFight = false;
        this.isFinalWave = false;
        
        // Power-up effects
        this.activePowerUps = [];
        
        // Escape pod rescue tracking
        this.podRescueTracking = new Map(); // Map of pod -> { startTime, indicator }
        this.rescueDistance = 80; // Distance to hover near pod
        this.rescueTime = 4000; // 4 seconds to rescue
        
        // Mobile UI safe area offset (accounts for browser chrome)
        this.safeAreaOffset = 120; // pixels from bottom edge
        
        // Default to level 1 if not specified
        this.levelNumber = 1;
        
        // Enemy health bar tracking
        this.enemyHealthBars = new Map(); // Map of enemy -> health bar graphics
        
        // Player health bar (above ship, like enemy health bars)
        this.playerHealthBar = null;
    }
    
    init(data) {
        // Accept level number from scene data
        this.levelNumber = data?.levelNumber || 1
        console.log(`Level1Scene: Initializing level ${this.levelNumber}`)
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
        console.log(`Level1Scene: Starting Level ${this.levelNumber}...`);
        
        // Load save data for upgrades
        this.saveData = ProgressConfig.loadProgress()
        
        // Reset game state on scene restart
        this.playerStats = {
            health: PlayerConfig.health,
            maxHealth: PlayerConfig.maxHealth,
            shields: PlayerConfig.shields,
            maxShields: PlayerConfig.maxShields,
            speed: PlayerConfig.speed,
            fireRate: PlayerConfig.fireRate
        };
        
        // Apply upgrades to player stats
        this.applyUpgrades()
        
        // Store base values for power-ups (after upgrades are applied)
        this.baseFireRate = this.playerStats.fireRate;
        this.baseSpeed = this.playerStats.speed;
        
        this.currentWave = 0;
        this.score = 0;
        this.scoreMultiplier = 1.0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.podsRescued = 0;
        this.isWaveActive = false;
        this.isBossFight = false;
        this.isFinalWave = false;
        this.activePowerUps = [];
        this.podRescueTracking = new Map();
        this.invincibleUntil = 0; // Timestamp for invincibility after taking damage
        this.lastShieldRecharge = 0; // Timestamp for last shield recharge
        this.shieldRechargeRate = 30000; // 30 seconds in milliseconds
        this.scoutFormationId = 0; // Counter for unique formation IDs
        
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
        
        // Setup boss components group (generators and turrets)
        this.bossComponents = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 20,
            runChildUpdate: true
        });
        
        // Setup collisions
        this.setupCollisions();
        
        // Initialize shield recharge timer to current time
        this.lastShieldRecharge = this.time.now;
        
        // Check for level intro dialog
        if (DialogConfig.hasDialog(this.levelNumber, 'intro')) {
            // Show intro dialog before starting waves
            this.showCommunication('intro', () => {
                this.startNextWave();
            });
        } else {
            // Start first wave immediately if no dialog
            this.startNextWave();
        }
        
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
        this.nebulaLayer.setDepth(-1); // Render behind game objects
        
        console.log('Level1Scene: Scrolling background created with parallax layers');
    }

    createPlayer() {
        // Create player ship (USS Aurora) - use percentage-based positioning for mobile compatibility
        const startX = this.cameraWidth * PlayerConfig.startX;
        const startY = this.cameraHeight * PlayerConfig.startY;
        this.player = this.physics.add.sprite(startX, startY, 'player-ship');
        this.player.setCollideWorldBounds(true);
        
        // Scale the player ship to appropriate size (uniform scaling maintains aspect ratio)
        this.player.setScale(PlayerConfig.scale, PlayerConfig.scale);
        
        // Set player velocity limits
        this.player.body.setMaxVelocity(this.playerStats.speed, this.playerStats.speed);
        this.player.body.setDrag(200, 200); // Smooth movement
        
        // Create health bar above player ship (like enemy health bars)
        this.playerHealthBar = this.add.graphics();
        this.updatePlayerHealthBar();
        
        console.log(`Level1Scene: USS Aurora created at (${startX}, ${startY})`);
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
        
        // Cheat code: N key to skip to next wave (for testing)
        this.nextWaveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this.nextWaveKey.on('down', () => {
            if (!this.isBossFight) {
                console.log('Cheat code activated: Skipping to next wave!');
                this.skipToNextWave();
            }
        });
        
        // Boss fight cheat code disabled (no boss in level 1 currently)
        // this.bossKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        // this.bossKey.on('down', () => {
        //     if (!this.isBossFight && !this.boss) {
        //         console.log('Cheat code activated: Jumping to boss fight!');
        //         this.skipToBossFight();
        //     }
        // });
        
        // Mobile controls
        this.isFiring = false;
        this.autoFire = false;
        this.joystickActive = false;
        this.joystickVector = { x: 0, y: 0 };
        
        // Detect if device is mobile (has touch and no keyboard/mouse as primary input)
        this.isMobileDevice = this.detectMobileDevice();
        
        // Create virtual joystick (left side of screen) - only visible on mobile
        this.createVirtualJoystick();
        
        // Create fire button (right side of screen) - only visible on mobile
        this.createFireButton();
        
        console.log('Level1Scene: Controls configured (keyboard + touch)', 'Mobile device:', this.isMobileDevice);
    }
    
    detectMobileDevice() {
        // Check if device has touch capability AND is likely mobile
        // We check for touch support but also screen size to differentiate from touch-enabled desktops
        const hasTouchScreen = ('ontouchstart' in window) || 
                               (navigator.maxTouchPoints > 0) || 
                               (navigator.msMaxTouchPoints > 0);
        
        // Check if it's a mobile user agent (more reliable than just touch)
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // For touch-enabled desktops with keyboard, we want to hide mobile controls
        // Mobile devices typically have smaller screens
        const isSmallScreen = window.innerWidth <= 1024 || window.innerHeight <= 768;
        
        // Device is considered mobile if it has touch AND (is mobile UA OR has small screen)
        return hasTouchScreen && (isMobileUA || isSmallScreen);
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
        this.joystickBase.setVisible(this.isMobileDevice); // Hide on desktop
        
        // Joystick stick
        this.joystickStick = this.add.circle(joystickX, joystickY, joystickRadius / 2, 0x00FFFF, 0.6);
        this.joystickStick.setScrollFactor(0);
        this.joystickStick.setDepth(1001);
        this.joystickStick.setVisible(this.isMobileDevice); // Hide on desktop
        
        // Touch zone for joystick (left side of screen)
        this.joystickZone = this.add.zone(0, 0, this.cameraWidth / 2, this.cameraHeight).setOrigin(0);
        this.joystickZone.setInteractive();
        this.joystickZone.setScrollFactor(0);
        
        this.joystickZone.on('pointerdown', (pointer) => {
            this.joystickActive = true;
            this.joystickBase.setPosition(pointer.x, pointer.y);
            this.joystickStick.setPosition(pointer.x, pointer.y);
            // Show joystick when touched (for hybrid devices)
            if (this.isMobileDevice) {
                this.joystickBase.setVisible(true);
                this.joystickStick.setVisible(true);
            }
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
        this.fireButton.setVisible(this.isMobileDevice); // Hide on desktop
        
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
        this.fireIcon.setVisible(this.isMobileDevice); // Hide on desktop
        
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
        
        // Create segmented health bar background with divisions
        this.healthBarBg = this.add.graphics();
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setDepth(999);
        this.createSegmentedBarBackground(this.healthBarBg, HUD_BAR.xPos, HUD_BAR.healthYPos, this.playerStats.maxHealth);
        
        // Hull health bar (will be drawn with segments)
        this.healthBar = this.add.graphics();
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(999);
        this.updateHealthBar();
        
        // Create segmented shield bar background with divisions
        this.shieldBarBg = this.add.graphics();
        this.shieldBarBg.setScrollFactor(0);
        this.shieldBarBg.setDepth(999);
        this.createSegmentedBarBackground(this.shieldBarBg, HUD_BAR.xPos, HUD_BAR.shieldsYPos, this.playerStats.maxShields);
        
        // Shield bar (will be drawn with segments)
        this.shieldBar = this.add.graphics();
        this.shieldBar.setScrollFactor(0);
        this.shieldBar.setDepth(999);
        this.updateShieldsBar();
        
        // Score text (top right) with LCARS styling - adjusted Y position since bars are now taller
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
        
        // Skip Wave button (testing feature)
        const skipButtonBg = this.add.graphics();
        skipButtonBg.fillStyle(0x333333, 0.8);
        skipButtonBg.fillRoundedRect(10, 86, 100, 30, 5);
        skipButtonBg.lineStyle(2, 0xFF9900, 1);
        skipButtonBg.strokeRoundedRect(10, 86, 100, 30, 5);
        skipButtonBg.setScrollFactor(0);
        skipButtonBg.setDepth(999);
        
        const skipButtonStyle = {
            fontSize: '12px',
            color: '#FF9900',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        };
        this.skipWaveButton = this.add.text(60, 101, 'SKIP WAVE', skipButtonStyle);
        this.skipWaveButton.setOrigin(0.5, 0.5);
        this.skipWaveButton.setScrollFactor(0);
        this.skipWaveButton.setDepth(1000);
        this.skipWaveButton.setInteractive({ useHandCursor: true });
        
        // Skip wave button click handler
        this.skipWaveButton.on('pointerdown', () => {
            if (!this.isBossFight) {
                this.skipToNextWave();
            }
        });
        
        // Add hover effect for skip button
        this.skipWaveButton.on('pointerover', () => {
            this.skipWaveButton.setColor('#FFCC00');
        });
        this.skipWaveButton.on('pointerout', () => {
            this.skipWaveButton.setColor('#FF9900');
        });
        
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
            case 'torpedo':
                // Deep rumbling torpedo sound that rises in pitch
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(config.startFreq, time);
                oscillator.frequency.exponentialRampToValueAtTime(config.endFreq, time + config.duration);
                gainNode.gain.setValueAtTime(config.gain, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + config.duration);
                oscillator.start(time);
                oscillator.stop(time + config.duration);
                break;
        }
    }

    createSegmentedBarBackground(graphics, x, y, maxSegments) {
        const segmentWidth = (HUD_BAR.width - (maxSegments - 1) * HUD_BAR.segmentGap) / maxSegments;
        
        graphics.clear();
        
        // Draw outer border
        graphics.lineStyle(2, 0x00FFFF, 1);
        graphics.strokeRect(x, y, HUD_BAR.width, HUD_BAR.height);
        
        // Draw dark background
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(x + 2, y + 2, HUD_BAR.width - 4, HUD_BAR.height - 4);
        
        // Draw segment dividers
        graphics.lineStyle(1, 0x00FFFF, 0.5);
        for (let i = 1; i < maxSegments; i++) {
            const dividerX = x + 2 + i * (segmentWidth + HUD_BAR.segmentGap) - HUD_BAR.segmentGap / 2;
            graphics.lineBetween(dividerX, y + 2, dividerX, y + HUD_BAR.height - 2);
        }
    }

    updateHealthBar() {
        this.healthBar.clear();
        
        // Only redraw background if maxHealth changed (e.g., from upgrades)
        if (this.playerStats.maxHealth !== this.previousMaxHealth) {
            this.createSegmentedBarBackground(this.healthBarBg, HUD_BAR.xPos, HUD_BAR.healthYPos, this.playerStats.maxHealth);
            this.previousMaxHealth = this.playerStats.maxHealth;
        }
        
        const maxSegments = this.playerStats.maxHealth;
        const currentSegments = this.playerStats.health;
        const segmentWidth = (HUD_BAR.width - (maxSegments - 1) * HUD_BAR.segmentGap) / maxSegments;
        
        // Calculate health percentage for color
        const healthPercent = currentSegments / maxSegments;
        
        // Color based on health percentage
        let color = 0x00FF00; // Green
        if (healthPercent < 0.5) color = 0xFFFF00; // Yellow
        if (healthPercent < 0.25) color = 0xFF0000; // Red
        
        this.healthBar.fillStyle(color, 1);
        
        // Draw filled segments
        for (let i = 0; i < currentSegments; i++) {
            const segmentX = 12 + i * (segmentWidth + HUD_BAR.segmentGap);
            this.healthBar.fillRect(segmentX, 12, segmentWidth, 6);
        }
    }

    updateShieldsBar() {
        this.shieldBar.clear();
        
        // Only redraw background if maxShields changed (e.g., from upgrades)
        if (this.playerStats.maxShields !== this.previousMaxShields) {
            this.createSegmentedBarBackground(this.shieldBarBg, HUD_BAR.xPos, HUD_BAR.shieldsYPos, this.playerStats.maxShields);
            this.previousMaxShields = this.playerStats.maxShields;
        }
        
        const maxSegments = this.playerStats.maxShields;
        const currentSegments = this.playerStats.shields;
        const segmentWidth = (HUD_BAR.width - (maxSegments - 1) * HUD_BAR.segmentGap) / maxSegments;
        
        // Calculate shields percentage for color
        const shieldsPercent = currentSegments / maxSegments;
        
        // Color based on shields percentage
        let color = 0x00FFFF; // Cyan (LCARS style)
        if (shieldsPercent < 0.5) color = 0x9999FF; // Light blue
        if (shieldsPercent < 0.25) color = 0xFF00FF; // Magenta
        
        this.shieldBar.fillStyle(color, 1);
        
        // Draw filled segments
        for (let i = 0; i < currentSegments; i++) {
            const segmentX = 12 + i * (segmentWidth + HUD_BAR.segmentGap);
            this.shieldBar.fillRect(segmentX, 24, segmentWidth, 6);
        }
    }

    update(time, delta) {
        // Scroll background (infinite vertical scrolling)
        this.starsLayer.tilePositionY -= 0.5; // Slow movement
        this.nebulaLayer.tilePositionY -= 1.5; // Faster movement for parallax
        
        // Handle invulnerability visual feedback
        this.handleInvulnerabilityVisuals();
        
        // Handle shield regeneration
        this.handleShieldRegeneration(time);
        
        // Handle point defense system
        this.handlePointDefense(time);
        
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
    
    handlePointDefense(time) {
        // Point defense system - destroys incoming enemy torpedoes
        if (!this.pointDefenseStats || !this.pointDefenseStats.enabled) return
        
        // Check if point defense is ready
        if (time < this.pointDefenseLastFired + this.pointDefenseStats.cooldown) return
        
        // Find closest enemy bullet
        let closestBullet = null
        let closestDistance = Infinity
        const detectionRange = 200 // Detection range for point defense
        
        this.enemyBullets.children.each(bullet => {
            if (bullet.active && bullet.visible) {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    bullet.x, bullet.y
                )
                
                if (distance < detectionRange && distance < closestDistance) {
                    closestDistance = distance
                    closestBullet = bullet
                }
            }
        })
        
        // Destroy closest bullet if found
        if (closestBullet) {
            // Create visual effect (beam from player to bullet)
            const beam = this.add.line(
                0, 0,
                this.player.x, this.player.y,
                closestBullet.x, closestBullet.y,
                0x00FFFF, 0.8
            )
            beam.setLineWidth(2)
            
            // Remove beam after short delay
            this.time.delayedCall(100, () => {
                beam.destroy()
            })
            
            // Destroy the bullet
            closestBullet.setActive(false)
            closestBullet.setVisible(false)
            
            // Create small explosion at bullet location
            this.createExplosion(closestBullet.x, closestBullet.y, 0.3)
            
            this.playSound('hit')
            this.pointDefenseLastFired = time
            
            console.log('Point defense activated!')
        }
    }
    
    handleInvulnerabilityVisuals() {
        // Fade out player ship slightly during invulnerability period
        if (this.time.now < this.invincibleUntil) {
            // Invulnerable - set to semi-transparent
            this.player.setAlpha(0.5);
        } else {
            // Not invulnerable - restore full opacity
            this.player.setAlpha(1.0);
        }
    }

    handleShooting(time) {
        const canFire = time > this.lastFired + this.playerStats.fireRate;
        
        if ((this.spaceKey.isDown || this.isFiring || this.autoFire) && canFire) {
            this.fireBullet();
            this.lastFired = time;
            
            // Fire pulse cannons if unlocked and ready
            if (this.pulseCannonsStats && this.pulseCannonsStats.enabled) {
                if (time > this.pulseCannonsLastFired + this.pulseCannonsStats.cooldown) {
                    this.firePulseCannons()
                    this.pulseCannonsLastFired = time
                }
            }
            
            // Fire quantum torpedos if unlocked and ready
            if (this.quantumTorpedosStats && this.quantumTorpedosStats.enabled) {
                if (time > this.quantumTorpedosLastFired + this.quantumTorpedosStats.cooldown) {
                    this.fireQuantumTorpedo()
                    this.quantumTorpedosLastFired = time
                }
            }
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
    
    firePulseCannons() {
        // Fire bursts from two cannons offset from player position
        const leftCannonX = this.player.x - 25
        const rightCannonX = this.player.x + 25
        const cannonY = this.player.y
        const burstsPerCannon = this.pulseCannonsStats.burstsPerCannon
        
        // Fire bursts from left cannon
        for (let i = 0; i < burstsPerCannon; i++) {
            this.time.delayedCall(i * 100, () => {
                const bullet = this.bullets.get(leftCannonX, cannonY, 'bullet')
                if (bullet) {
                    this.enableBulletPhysics(bullet)
                    bullet.setTint(0xFFFF00) // Yellow tint to match primary weapon
                    bullet.body.setVelocity(0, -PlayerConfig.bulletSpeed)
                }
            })
        }
        
        // Fire bursts from right cannon
        for (let i = 0; i < burstsPerCannon; i++) {
            this.time.delayedCall(i * 100, () => {
                const bullet = this.bullets.get(rightCannonX, cannonY, 'bullet')
                if (bullet) {
                    this.enableBulletPhysics(bullet)
                    bullet.setTint(0xFFFF00) // Yellow tint to match primary weapon
                    bullet.body.setVelocity(0, -PlayerConfig.bulletSpeed)
                }
            })
        }
        
        this.playSound('phaser')
    }
    
    fireQuantumTorpedo() {
        // Find the most powerful enemy (highest health)
        let target = null
        let maxHealth = 0
        
        this.enemies.children.each(enemy => {
            if (enemy.active && enemy.visible && enemy.health > maxHealth) {
                maxHealth = enemy.health
                target = enemy
            }
        })
        
        // Also check boss if active
        if (this.boss && this.boss.active && this.boss.visible && this.boss.health > maxHealth) {
            target = this.boss
        }
        
        if (!target) return // No enemies to target
        
        // Create torpedo
        const torpedo = this.bullets.get(this.player.x, this.player.y - 20, 'bullet')
        if (torpedo) {
            // Play torpedo sound
            this.playSound('torpedo')
            
            this.enableBulletPhysics(torpedo)
            torpedo.setTint(0x0000FF) // Blue tint for quantum torpedoes
            torpedo.setScale(1.5) // Make torpedoes larger
            
            // Store torpedo data
            torpedo.damage = this.quantumTorpedosStats.damage
            torpedo.isQuantumTorpedo = true
            torpedo.target = target
            
            // Calculate velocity towards target
            const dx = target.x - torpedo.x
            const dy = target.y - torpedo.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const speed = PlayerConfig.bulletSpeed * 0.8 // Slightly slower than regular bullets
            
            torpedo.body.setVelocity(
                (dx / distance) * speed,
                (dy / distance) * speed
            )
            
            this.playSound('phaser')
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
        this.scoreText.setText(`SCORE: ${this.score}`);
        this.waveText.setText(`WAVE: ${this.currentWave}`);
        this.multiplierText.setText(`MULTIPLIER: x${this.scoreMultiplier.toFixed(1)}`);
        this.podsText.setText(`PODS: ${this.podsRescued}`);
        this.updateHealthBar();
        this.updateShieldsBar();
        this.updatePlayerHealthBar(); // Update health bar above player ship
    }

    // Method for taking damage (to be used when enemies are implemented)
    takeDamage(amount) {
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < this.invincibleUntil) {
            return; // Still invincible, ignore damage
        }
        
        // Haptic feedback on damage
        this.triggerHaptic('medium');
        
        // Play hit sound when player takes damage
        this.playSound('hit');
        
        if (this.playerStats.shields > 0) {
            // Show shield impact effect before taking damage
            this.showShieldImpact();
            
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
    
    showShieldImpact() {
        // Create a shield impact bubble around the player ship
        const shieldBubble = this.add.circle(
            this.player.x, 
            this.player.y, 
            SHIELD_IMPACT.radius, 
            SHIELD_IMPACT.color, 
            0
        );
        shieldBubble.setStrokeStyle(
            SHIELD_IMPACT.strokeWidth, 
            SHIELD_IMPACT.color, 
            SHIELD_IMPACT.strokeAlpha
        );
        shieldBubble.setDepth(10); // Render above player
        
        // Animate the shield bubble expanding and fading out
        this.tweens.add({
            targets: shieldBubble,
            scaleX: SHIELD_IMPACT.scale,
            scaleY: SHIELD_IMPACT.scale,
            alpha: 0,
            duration: SHIELD_IMPACT.duration,
            ease: 'Power2.easeOut',
            onComplete: () => {
                shieldBubble.destroy();
            }
        });
    }
    
    showShieldImpactAt(x, y) {
        // Create a shield impact bubble at specified position
        const shieldBubble = this.add.circle(
            x, 
            y, 
            SHIELD_IMPACT.radius, 
            SHIELD_IMPACT.color, 
            0
        );
        shieldBubble.setStrokeStyle(
            SHIELD_IMPACT.strokeWidth, 
            SHIELD_IMPACT.color, 
            SHIELD_IMPACT.strokeAlpha
        );
        shieldBubble.setDepth(10); // Render above other objects
        
        // Animate the shield bubble expanding and fading out
        this.tweens.add({
            targets: shieldBubble,
            scaleX: SHIELD_IMPACT.scale,
            scaleY: SHIELD_IMPACT.scale,
            alpha: 0,
            duration: SHIELD_IMPACT.duration,
            ease: 'Power2.easeOut',
            onComplete: () => {
                shieldBubble.destroy();
            }
        });
    }
    
    setupCollisions() {
        // Player bullets vs enemies
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        
        // Player bullets vs boss components (generators and turrets)
        this.physics.add.overlap(this.bullets, this.bossComponents, this.hitBossComponent, null, this);
        
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
        
        // Calculate damage - quantum torpedoes do more damage
        let damage = 1 // Default bullet damage
        if (bullet.isQuantumTorpedo) {
            damage = bullet.damage // Torpedoes use configured damage value
        }
        
        // Apply damage to shields first, then health
        if (enemy.shields > 0) {
            // Show shield impact effect
            this.showShieldImpactAt(enemy.x, enemy.y);
            
            enemy.shields -= damage;
            if (enemy.shields < 0) {
                // Overflow damage goes to health
                const overflow = Math.abs(enemy.shields);
                enemy.shields = 0;
                enemy.health -= overflow;
            }
        } else {
            // No shields, damage health directly
            enemy.health -= damage;
        }
        
        // Set invincibility after taking damage
        enemy.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.enemy;
        
        // Play hit sound when enemy is damaged
        this.playSound('hit');
        
        // Update health bar
        this.updateHealthBar(enemy);
        
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
        
        // Clean up health bar
        this.destroyHealthBar(enemy);
        
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.destroy();
        
        // Check if victory condition is met after destroying enemy
        this.checkVictoryCondition();
    }
    
    createHealthBar(enemy) {
        // Don't create health bars for asteroids
        if (enemy.enemyType === 'asteroid') {
            return;
        }
        
        // Get enemy configuration to determine max health
        const config = EnemyConfig[enemy.enemyType];
        if (!config) {
            return; // Skip if enemy type is not recognized
        }
        
        // Create health bar graphics
        const healthBar = this.add.graphics();
        
        // Store reference to the health bar
        this.enemyHealthBars.set(enemy, healthBar);
        
        // Initial draw
        this.updateHealthBar(enemy);
    }
    
    updateHealthBar(enemy) {
        const healthBar = this.enemyHealthBars.get(enemy);
        if (!healthBar || !enemy.active) {
            return;
        }
        
        // Get enemy configuration
        const config = EnemyConfig[enemy.enemyType];
        if (!config) {
            return; // Skip if enemy type is not recognized
        }
        
        const maxHealth = config.health + (config.shields || 0);
        const currentHealth = enemy.health + (enemy.shields || 0);
        
        // Validate maxHealth to prevent division by zero
        if (maxHealth <= 0) {
            return;
        }
        
        // Health bar dimensions
        const barWidth = ENEMY_HEALTH_BAR.width;
        const barHeight = ENEMY_HEALTH_BAR.height;
        const barX = enemy.x - barWidth / 2;
        const barY = enemy.y - enemy.displayHeight / 2 - ENEMY_HEALTH_BAR.yOffset; // Position above enemy
        
        // Clear previous drawing
        healthBar.clear();
        
        // Draw background (black)
        healthBar.fillStyle(0x000000, 0.8);
        healthBar.fillRect(barX, barY, barWidth, barHeight);
        
        // Calculate health percentage
        const healthPercent = currentHealth / maxHealth;
        
        // Choose color based on health percentage
        let healthColor;
        if (healthPercent > 0.6) {
            healthColor = 0x00ff00; // Green
        } else if (healthPercent > 0.3) {
            healthColor = 0xffff00; // Yellow
        } else {
            healthColor = 0xff0000; // Red
        }
        
        // Draw health bar (colored based on health)
        healthBar.fillStyle(healthColor, 1);
        healthBar.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Draw border (white)
        healthBar.lineStyle(1, 0xffffff, 0.8);
        healthBar.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    destroyHealthBar(enemy) {
        const healthBar = this.enemyHealthBars.get(enemy);
        if (healthBar) {
            healthBar.destroy();
            this.enemyHealthBars.delete(enemy);
        }
    }
    
    updatePlayerHealthBar() {
        if (!this.playerHealthBar || !this.player || !this.player.active) {
            return;
        }
        
        // Calculate health bar dimensions and position (similar to enemy health bars)
        const barWidth = 40; // Slightly wider than enemies for visibility
        const barHeight = ENEMY_HEALTH_BAR.height;
        const barX = this.player.x - barWidth / 2;
        const barY = this.player.y - this.player.displayHeight / 2 - ENEMY_HEALTH_BAR.yOffset - 5; // Extra offset above player
        
        // Clear previous drawing
        this.playerHealthBar.clear();
        
        // Draw background (black)
        this.playerHealthBar.fillStyle(0x000000, 0.8);
        this.playerHealthBar.fillRect(barX, barY, barWidth, barHeight);
        
        // Calculate health percentage
        const healthPercent = this.playerStats.health / this.playerStats.maxHealth;
        
        // Choose color based on health percentage (same as HUD bars)
        let healthColor;
        if (healthPercent > 0.5) {
            healthColor = 0x00ff00; // Green
        } else if (healthPercent > 0.25) {
            healthColor = 0xffff00; // Yellow
        } else {
            healthColor = 0xff0000; // Red
        }
        
        // Draw health bar (colored based on health)
        this.playerHealthBar.fillStyle(healthColor, 1);
        this.playerHealthBar.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Draw border (white)
        this.playerHealthBar.lineStyle(1, 0xffffff, 0.8);
        this.playerHealthBar.strokeRect(barX, barY, barWidth, barHeight);
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
                    endTime: this.time.now + config.duration
                });
                this.playerStats.fireRate = this.baseFireRate * (1 - config.amount);
                break;
            case 'increase_speed':
                this.activePowerUps.push({
                    type: type,
                    effect: config.effect,
                    endTime: this.time.now + config.duration
                });
                this.playerStats.speed = this.baseSpeed * config.amount;
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
        const levelKey = `level${this.levelNumber}`
        const levelConfig = WaveConfig[levelKey]
        
        if (!levelConfig) {
            console.warn(`No wave config found for ${levelKey}`)
            this.victory()
            return
        }
        
        const waveConfig = levelConfig[waveKey];
        
        if (!waveConfig) {
            // Check for boss wave
            if (levelConfig.bossWave && this.currentWave > levelConfig.bossWave.threshold) {
                this.startBossFight(levelConfig.bossWave.type);
                return;
            }
            // No more waves - mark this as the final wave
            // Victory will trigger when all enemies are defeated
            this.isFinalWave = true;
            this.checkVictoryCondition();
            return;
        }
        
        this.isWaveActive = true;
        this.enemiesSpawned = 0;
        
        // Initialize wave spawn pool based on shipCounts
        this.waveSpawnPool = [];
        if (waveConfig.shipCounts) {
            // Build spawn pool from shipCounts specification
            for (const [shipType, count] of Object.entries(waveConfig.shipCounts)) {
                for (let i = 0; i < count; i++) {
                    this.waveSpawnPool.push(shipType);
                }
            }
            // Shuffle the spawn pool for variety
            Phaser.Utils.Array.Shuffle(this.waveSpawnPool);
        } else {
            // Fallback to old behavior if shipCounts not specified
            this.waveSpawnPool = null;
        }
        
        console.log(`Starting Wave ${this.currentWave}`, waveConfig.shipCounts || waveConfig.enemyTypes);
        
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
        
        // Spawn escape pods during wave (except for level 11 - testing level)
        if (this.levelNumber !== 11) {
            this.podTimer = this.time.addEvent({
                delay: PodConfig.spawnRate,
                callback: () => {
                    this.spawnEscapePod();
                },
                loop: true
            });
        }
        
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
        this.time.delayedCall(WaveConfig.betweenWaveDelay, () => {
            this.startNextWave();
        });
    }
    
    skipToNextWave() {
        console.log('Level1Scene: Skipping to next wave (testing feature)');
        
        // Clear all enemies and enemy bullets
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        
        // Clear escape pods
        this.escapePods.clear(true, true);
        
        // Clear power-ups
        this.powerUps.clear(true, true);
        
        // Clear boss components if any
        if (this.bossComponents) {
            this.bossComponents.clear(true, true);
        }
        
        // Clear boss if in boss fight
        if (this.boss) {
            this.boss.destroy();
            this.boss = null;
        }
        
        // Clear boss phase text if any
        if (this.bossPhaseText) {
            this.bossPhaseText.destroy();
            this.bossPhaseText = null;
        }
        
        // Clear wave timers
        if (this.waveTimer) {
            this.waveTimer.remove();
            this.waveTimer = null;
        }
        if (this.podTimer) {
            this.podTimer.remove();
            this.podTimer = null;
        }
        
        // Reset boss fight flag
        this.isBossFight = false;
        
        // End current wave and immediately start next wave
        this.isWaveActive = false;
        this.startNextWave();
    }
    
    spawnEnemy(waveConfig) {
        // Pick enemy type from spawn pool if available, otherwise random from enemyTypes
        let enemyType;
        if (this.waveSpawnPool && this.waveSpawnPool.length > 0) {
            enemyType = this.waveSpawnPool.pop();
        } else {
            enemyType = Phaser.Utils.Array.GetRandom(waveConfig.enemyTypes);
        }
        
        const config = EnemyConfig[enemyType];
        
        // Special handling for scout formations
        if (enemyType === 'scout') {
            this.spawnScoutFormation(config);
            return;
        }
        
        // Random spawn position at top
        const x = Phaser.Math.Between(50, this.cameraWidth - 50);
        const y = -50;
        
        let texture = 'enemy-fighter';
        if (enemyType === 'cruiser') texture = 'enemy-cruiser';
        if (enemyType === 'battleship') texture = 'enemy-battleship';
        if (enemyType === 'weaponPlatform') texture = 'weapon-platform';
        if (enemyType === 'asteroid') texture = 'asteroid';
        if (enemyType === 'crystalNode') texture = 'crystal-node';
        
        const enemy = this.enemies.get(x, y, texture);
        
        if (enemy) {
            enemy.setActive(true);
            enemy.setVisible(true);
            enemy.enemyType = enemyType;
            enemy.health = config.health;
            enemy.shields = config.shields || 0; // Initialize shields
            enemy.points = config.points;
            enemy.fireRate = config.fireRate;
            enemy.lastFired = 0;
            enemy.invincibleUntil = 0; // Initialize invincibility timer
            enemy.movementPattern = config.movementPattern;
            enemy.patternOffset = Math.random() * Math.PI * 2; // Random phase for patterns
            enemy.hasEnteredScreen = false; // Track if enemy has entered visible area
            enemy.initialSpeed = config.speed; // Store initial speed for when body is enabled
            
            // Scale enemy sprites to correct size while maintaining aspect ratio
            if ((enemyType === 'fighter' || enemyType === 'cruiser' || enemyType === 'battleship' || enemyType === 'weaponPlatform' || enemyType === 'asteroid' || enemyType === 'crystalNode') && enemy.width > 0) {
                let targetWidth = config.size.width;
                
                // For asteroids, randomly assign a size variant (small, medium, large)
                // This overrides the base config values (health: 3, points: 10) to provide variety
                if (enemyType === 'asteroid') {
                    const sizeType = Phaser.Utils.Array.GetRandom(['small', 'medium', 'large']);
                    enemy.asteroidSize = sizeType;
                    
                    // Set size-based properties
                    switch (sizeType) {
                        case 'small':
                            targetWidth = 25; // Small asteroids
                            enemy.health = 1;
                            enemy.points = 5;
                            break;
                        case 'medium':
                            targetWidth = 40; // Medium asteroids (base config size)
                            enemy.health = 3;
                            enemy.points = 10;
                            break;
                        case 'large':
                            targetWidth = 60; // Large asteroids
                            enemy.health = 5;
                            enemy.points = 20;
                            break;
                    }
                }
                
                // Scale sprites to their configured target width
                // Fighter: 651x1076px → 25px, Cruiser: 811x790px → 60px, Battleship: large PNG → 120px
                // WeaponPlatform: 1227x1219px → 40px
                // Asteroids: Size variant determines width (small: 25px, medium: 40px, large: 60px)
                const scale = targetWidth / enemy.width;
                enemy.setScale(scale);
            }
            
            // Add rotation for asteroids
            if (enemyType === 'asteroid') {
                enemy.rotationSpeed = Phaser.Math.FloatBetween(-0.5, 0.5); // Random rotation speed
            }
            
            // Set initial velocity so enemy moves onto screen
            // For stationary enemies (speed=0), use a default scroll speed so they enter the screen
            const verticalSpeed = config.speed > 0 ? config.speed : DEFAULT_VERTICAL_SCROLL_SPEED;
            enemy.body.setVelocity(0, verticalSpeed);
            
            // Disable collision detection initially - will be enabled when enemy enters screen
            enemy.body.checkCollision.none = true;
            
            // Create health bar for this enemy (excludes asteroids)
            this.createHealthBar(enemy);
        }
    }
    
    spawnScoutFormation(config) {
        // Spawn scouts in a formation with consistent horizontal position
        const formationSize = config.formationSize || 3;
        const formationSpacing = config.formationSpacing || 30;
        const x = Phaser.Math.Between(50, this.cameraWidth - 50);
        
        // Choose one diagonal direction for the entire formation
        const formationDiagonalDirection = Math.random() < 0.5 ? -1 : 1;
        
        // Get unique formation ID for this group
        const formationId = this.scoutFormationId++;
        
        // Store formation members for efficient communication
        const formationMembers = [];
        
        for (let i = 0; i < formationSize; i++) {
            const y = -50 - (i * formationSpacing); // Each scout spawns slightly above the previous one
            const scout = this.enemies.get(x, y, 'enemy-fighter'); // Use fighter texture
            
            if (scout) {
                scout.setActive(true);
                scout.setVisible(true);
                scout.enemyType = 'scout';
                scout.health = config.health;
                scout.shields = config.shields || 0;
                scout.points = config.points;
                scout.fireRate = config.fireRate;
                scout.lastFired = 0;
                scout.invincibleUntil = 0;
                scout.movementPattern = config.movementPattern;
                scout.patternOffset = Math.random() * Math.PI * 2;
                scout.hasEnteredScreen = false;
                scout.initialSpeed = config.speed;
                scout.formationIndex = i; // Track position in formation
                scout.formationId = formationId; // Unique ID for this formation group
                
                // Scout formation flight phases
                scout.formationPhase = 'straight'; // 'straight', 'circle', 'diagonal'
                scout.circleStartAngle = 0;
                scout.circleCenter = { x: 0, y: 0 };
                scout.circleRadius = 50;
                scout.diagonalDirection = formationDiagonalDirection; // Shared direction for entire formation
                scout.leaderCircleStartY = undefined; // Will be set by the formation leader
                scout.formationMembers = formationMembers; // Reference to all members in formation
                scout.hasNotifiedFollowers = false; // Track if leader has notified followers
                
                // Scale scout to half the size of fighter
                if (scout.width > 0) {
                    const targetWidth = config.size.width;
                    const scale = targetWidth / scout.width;
                    scout.setScale(scale);
                }
                
                // Set initial velocity
                scout.body.setVelocity(0, config.speed);
                
                // Disable collision detection initially
                scout.body.checkCollision.none = true;
                
                // Create health bar for this scout
                this.createHealthBar(scout);
                
                // Add to formation members array
                formationMembers.push(scout);
            }
        }
    }
    
    spawnEscapePod() {
        const x = Phaser.Math.Between(50, this.cameraWidth - 50);
        const y = ESCAPE_POD_SPAWN_Y; // Spawn from top of screen
        
        const pod = this.escapePods.get(x, y, 'escape-pod');
        
        if (pod) {
            pod.setActive(true);
            pod.setVisible(true);
            pod.setScale(PodConfig.scale);
            pod.setAlpha(1); // Fully visible at all times
            pod.health = PodConfig.health;
            pod.body.setVelocity(0, PodConfig.speed);
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
            
            // Rotate asteroids
            if (enemy.enemyType === 'asteroid' && enemy.rotationSpeed) {
                enemy.rotation += enemy.rotationSpeed * ASTEROID_ROTATION_FACTOR;
            }
            
            // Pulsing effect for crystalNode
            if (enemy.enemyType === 'crystalNode') {
                if (enemy.pulseScale === undefined) {
                    enemy.pulseScale = 1.0;
                    enemy.pulseDirection = 1;
                    enemy.baseScale = enemy.scaleX || 1.0; // Store base scale from spawn
                }
                
                // Update pulse scale with boundary checking
                const newScale = enemy.pulseScale + (enemy.pulseDirection * CRYSTAL_PULSE.speed);
                if (newScale >= CRYSTAL_PULSE.maxScale) {
                    enemy.pulseScale = CRYSTAL_PULSE.maxScale;
                    enemy.pulseDirection = -1;
                } else if (newScale <= CRYSTAL_PULSE.minScale) {
                    enemy.pulseScale = CRYSTAL_PULSE.minScale;
                    enemy.pulseDirection = 1;
                } else {
                    enemy.pulseScale = newScale;
                }
                
                // Apply pulse as a multiplier on the base scale
                enemy.setScale(enemy.baseScale * enemy.pulseScale);
            }
            
            // Update movement pattern
            this.updateEnemyMovement(enemy);
            
            // Enemy shooting - only if on screen and has weapons (scouts and asteroids don't shoot)
            if (enemy.enemyType !== 'scout' && enemy.enemyType !== 'asteroid' && enemy.fireRate && enemy.y < this.cameraHeight && time > enemy.lastFired + enemy.fireRate) {
                this.enemyFire(enemy);
                enemy.lastFired = time;
            }
            
            // Target escape pods - only if on screen and has weapons
            const nearestPod = this.findNearestPod(enemy);
            if (enemy.enemyType !== 'scout' && enemy.enemyType !== 'asteroid' && enemy.fireRate && enemy.y < this.cameraHeight && nearestPod && Phaser.Math.Distance.Between(enemy.x, enemy.y, nearestPod.x, nearestPod.y) < 200) {
                // Shoot at pod only if fire rate allows
                if (time > enemy.lastFired + enemy.fireRate) {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, nearestPod.x, nearestPod.y);
                    const bullet = this.enemyBullets.get(enemy.x, enemy.y, 'enemy-bullet');
                    
                    if (bullet) {
                        bullet.setActive(true);
                        bullet.setVisible(true);
                        // Re-enable physics body if it was disabled
                        if (bullet.body) {
                            bullet.body.enable = true;
                        }
                        const speed = EnemyConfig[enemy.enemyType].bulletSpeed;
                        bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                        enemy.lastFired = time;
                    }
                }
            }
            
            // Update health bar position
            this.updateHealthBar(enemy);
        });
    }
    
    findNearbyAsteroids(enemy, searchRadius = 150) {
        // Only check for asteroid avoidance if this is not an asteroid itself
        if (enemy.enemyType === 'asteroid') {
            return [];
        }
        
        const nearbyAsteroids = [];
        this.enemies.children.each((other) => {
            if (!other.active || other.enemyType !== 'asteroid') return;
            
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y);
            
            // Adjust search radius based on asteroid size
            let effectiveSearchRadius = searchRadius;
            if (other.asteroidSize === 'large') {
                effectiveSearchRadius = searchRadius * 1.3;
            } else if (other.asteroidSize === 'small') {
                effectiveSearchRadius = searchRadius * 0.8;
            }
            
            if (distance < effectiveSearchRadius) {
                nearbyAsteroids.push({
                    asteroid: other,
                    distance: distance,
                    angle: Phaser.Math.Angle.Between(enemy.x, enemy.y, other.x, other.y),
                    size: other.asteroidSize || 'medium'
                });
            }
        });
        
        return nearbyAsteroids;
    }
    
    applyAsteroidAvoidance(enemy) {
        // Skip avoidance for asteroids themselves and scouts in formation phase
        if (enemy.enemyType === 'asteroid') return;
        if (enemy.enemyType === 'scout' && enemy.formationPhase && enemy.formationPhase !== 'straight') return;
        
        const nearbyAsteroids = this.findNearbyAsteroids(enemy, ASTEROID_AVOIDANCE_RADIUS);
        
        if (nearbyAsteroids.length > 0) {
            // Calculate avoidance vector by summing repulsion from all nearby asteroids
            let avoidanceX = 0;
            let avoidanceY = 0;
            
            nearbyAsteroids.forEach(({ asteroid, distance, angle, size }) => {
                // Stronger avoidance for closer asteroids
                let baseStrength = (ASTEROID_AVOIDANCE_RADIUS - distance) / ASTEROID_AVOIDANCE_RADIUS;
                
                // Adjust avoidance strength based on asteroid size
                if (size === 'large') {
                    baseStrength *= 1.5; // Larger asteroids have stronger avoidance
                } else if (size === 'small') {
                    baseStrength *= 0.7; // Smaller asteroids have weaker avoidance
                }
                
                const avoidAngle = angle + Math.PI; // Opposite direction
                
                avoidanceX += Math.cos(avoidAngle) * baseStrength * ASTEROID_AVOIDANCE_FORCE;
                avoidanceY += Math.sin(avoidAngle) * baseStrength * ASTEROID_AVOIDANCE_FORCE;
            });
            
            // Apply avoidance to velocity
            const currentVelX = enemy.body.velocity.x;
            const currentVelY = enemy.body.velocity.y;
            
            enemy.body.setVelocity(
                currentVelX + avoidanceX,
                currentVelY + avoidanceY
            );
        }
    }
    
    updateEnemyMovement(enemy) {
        const config = EnemyConfig[enemy.enemyType];
        
        // Apply asteroid avoidance before normal movement pattern
        this.applyAsteroidAvoidance(enemy);
        
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
                // Once battleship reaches or passes y=100, stop vertical movement and start horizontal pattern
                if (enemy.y >= 100) {
                    enemy.body.setVelocityY(0);
                    if (enemy.x < 100 || enemy.x > this.cameraWidth - 100) {
                        enemy.body.setVelocityX(-enemy.body.velocity.x);
                    }
                    if (enemy.body.velocity.x === 0) {
                        enemy.body.setVelocityX(config.speed);
                    }
                }
                // Otherwise, let it continue moving down (velocity already set in spawn)
                break;
            case 'stationary':
                // Weapon platform - stays in place horizontally, moves down with screen scroll only
                enemy.body.setVelocityX(0);
                // Keep default downward velocity for scrolling effect
                break;
            case 'formation':
                // Scouts fly in formation with three phases
                // Phase 1: Straight down until 1/3 of screen
                // Phase 2: Circle pattern once
                // Phase 3: Diagonal towards bottom
                
                if (enemy.formationPhase === 'straight') {
                    // Keep moving straight down
                    enemy.body.setVelocityX(0);
                    
                    // Leader (formationIndex = 0) triggers transition for the formation
                    if (enemy.formationIndex === 0 && enemy.y >= this.cameraHeight / SCOUT_CIRCLE_TRIGGER_FRACTION) {
                        // Leader initiates circle transition
                        enemy.formationPhase = 'circle';
                        // Set circle center so current position is at the top of the circle
                        enemy.circleCenter.x = enemy.x;
                        enemy.circleCenter.y = enemy.y + enemy.circleRadius;
                        
                        // Store the leader's Y position when starting circle for followers
                        enemy.leaderCircleStartY = enemy.y;
                        
                        // Calculate starting angle based on current position relative to center
                        // Since we're moving down, we want to start from the top of the circle
                        enemy.circleCurrentAngle = -Math.PI / 2;
                        
                        // Zero out velocity so body.reset works smoothly
                        enemy.body.setVelocity(0, 0);
                        
                        // Notify other scouts in formation (only once)
                        if (!enemy.hasNotifiedFollowers && enemy.formationMembers) {
                            enemy.hasNotifiedFollowers = true; // Set flag first for idempotency
                            enemy.formationMembers.forEach((member) => {
                                if (member.active && member !== enemy) {
                                    member.leaderCircleStartY = enemy.leaderCircleStartY;
                                }
                            });
                        }
                    } else if (enemy.formationIndex > 0 && enemy.leaderCircleStartY !== undefined) {
                        // Follower scouts transition when they reach the same Y position where leader started
                        if (enemy.y >= enemy.leaderCircleStartY) {
                            enemy.formationPhase = 'circle';
                            // Set circle center so current position is at the top of the circle
                            enemy.circleCenter.x = enemy.x;
                            enemy.circleCenter.y = enemy.y + enemy.circleRadius;
                            
                            // Start at top of circle for smooth continuation
                            enemy.circleCurrentAngle = -Math.PI / 2;
                            
                            // Zero out velocity so body.reset works smoothly
                            enemy.body.setVelocity(0, 0);
                        }
                    }
                } else if (enemy.formationPhase === 'circle') {
                    // Fly in a circle once with smooth movement
                    const angularSpeed = 0.03; // Slower for smoother movement
                    enemy.circleCurrentAngle += angularSpeed;
                    
                    // Calculate position on circle
                    const newX = enemy.circleCenter.x + Math.cos(enemy.circleCurrentAngle) * enemy.circleRadius;
                    const newY = enemy.circleCenter.y + Math.sin(enemy.circleCurrentAngle) * enemy.circleRadius;
                    
                    // Update physics body position to maintain proper collision detection
                    enemy.body.reset(newX, newY);
                    
                    // Check if completed one full circle (from -PI/2 to 3*PI/2)
                    if (enemy.circleCurrentAngle >= Math.PI * 1.5) {
                        // Transition to diagonal phase
                        enemy.formationPhase = 'diagonal';
                    }
                } else if (enemy.formationPhase === 'diagonal') {
                    // Fly diagonally towards bottom of screen
                    // Use the shared diagonal direction for the whole formation
                    const diagonalSpeed = config.speed;
                    const horizontalSpeed = diagonalSpeed * 0.5 * enemy.diagonalDirection;
                    enemy.body.setVelocity(horizontalSpeed, diagonalSpeed);
                }
                break;
        }
    }
    
    enemyFire(enemy) {
        const config = EnemyConfig[enemy.enemyType];
        
        // Check if this enemy has scattershot ability
        if (config.scattershot) {
            // Fire bullets in all directions (360 degrees)
            const bulletCount = config.scattershotCount || 6;
            const angleStep = (Math.PI * 2) / bulletCount;
            
            for (let i = 0; i < bulletCount; i++) {
                const angle = angleStep * i;
                const bullet = this.enemyBullets.get(enemy.x, enemy.y, 'enemy-bullet');
                
                if (bullet) {
                    bullet.setActive(true);
                    bullet.setVisible(true);
                    
                    // Re-enable physics body if it was disabled
                    if (bullet.body) {
                        bullet.body.enable = true;
                    }
                    
                    const speed = config.bulletSpeed;
                    bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                }
            }
        } else {
            // Standard targeting fire
            const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20, 'enemy-bullet');
            
            if (bullet) {
                bullet.setActive(true);
                bullet.setVisible(true);
                
                // Re-enable physics body if it was disabled
                if (bullet.body) {
                    bullet.body.enable = true;
                }
                
                // Aim at player
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                const speed = config.bulletSpeed;
                bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            }
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
        // CRITICAL: Deactivate immediately to prevent further updates in the same frame
        // This prevents race conditions when rescuing pods at the safe zone boundary
        pod.setActive(false);
        pod.setVisible(false);
        
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
                        // Check if there are other active fire rate power-ups
                        const otherFireRatePowerUps = this.activePowerUps.filter(
                            p => p.effect === 'increase_fire_rate' && p !== powerUp
                        );
                        if (otherFireRatePowerUps.length === 0) {
                            // No other fire rate power-ups, reset to base
                            this.playerStats.fireRate = this.baseFireRate;
                        }
                        break;
                    case 'increase_speed':
                        // Check if there are other active speed power-ups
                        const otherSpeedPowerUps = this.activePowerUps.filter(
                            p => p.effect === 'increase_speed' && p !== powerUp
                        );
                        if (otherSpeedPowerUps.length === 0) {
                            // No other speed power-ups, reset to base
                            this.playerStats.speed = this.baseSpeed;
                        }
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
        // Use disableBulletPhysics to properly disable physics bodies, preventing
        // recycled bullets from causing unintended collisions
        this.bullets.children.each((bullet) => {
            if (bullet.active && bullet.y < -20) {
                this.disableBulletPhysics(bullet);
            }
        });
        
        this.enemyBullets.children.each((bullet) => {
            if (bullet.active && (bullet.y > this.cameraHeight + 20 || bullet.y < -20 || bullet.x < -20 || bullet.x > this.cameraWidth + 20)) {
                this.disableBulletPhysics(bullet);
            }
        });
        
        // Clean up off-screen enemies
        this.enemies.children.each((enemy) => {
            if (enemy.active && enemy.y > this.cameraHeight + 50) {
                this.destroyHealthBar(enemy);
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
    
    skipToBossFight() {
        // Clear all enemies, bullets, and power-ups
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        this.powerUps.clear(true, true);
        this.escapePods.clear(true, true);
        
        // Stop any wave spawning
        if (this.waveSpawnEvent) {
            this.waveSpawnEvent.remove();
        }
        
        // Reset player to full health
        this.playerStats.health = this.playerStats.maxHealth;
        this.playerStats.shields = this.playerStats.maxShields;
        
        // Give player temporary invincibility for boss fight testing
        this.invincibleUntil = this.time.now + CHEAT_INVINCIBILITY_DURATION;
        this.playerStats.fireRate = CHEAT_FIRE_RATE;
        
        this.updateHUD();
        
        // Jump to boss fight
        this.currentWave = 5;
        this.startBossFight();
    }
    
    startBossFight(bossType = 'boss') {
        // Prevent duplicate boss spawns
        if (this.isBossFight && this.boss) {
            return;
        }
        
        this.isBossFight = true;
        this.currentBossType = bossType;
        
        // Play boss alert sound
        this.playSound('boss');
        
        // Get boss config
        const bossConfig = EnemyConfig[bossType];
        
        // Spawn boss
        const x = this.cameraWidth / 2;
        const y = -100;
        
        // Use appropriate texture for boss type
        let bossTexture = 'boss-core';
        if (bossType === 'crystalNode') {
            bossTexture = 'crystal-node';
        }
        
        this.boss = this.physics.add.sprite(x, y, bossTexture);
        this.boss.setActive(true);
        this.boss.setVisible(true);
        // Ensure boss is rendered behind its components (generators/turrets)
        this.boss.setDepth(RENDER_DEPTH.BOSS);
        
        // Configure physics body for boss
        if (this.boss.body) {
            this.boss.body.enable = true;
            this.boss.body.setSize(bossConfig.size.width, bossConfig.size.height);
            this.boss.body.checkCollision.none = false;
        }
        
        // Initialize boss stats
        this.boss.phase = 0;
        this.boss.maxHealth = bossConfig.health;
        this.boss.health = bossConfig.health;
        this.boss.phaseHealth = bossConfig.phases[0].health;
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
        
        // Start appropriate phase based on boss type
        this.time.delayedCall(3000, () => {
            if (bossType === 'crystalNode') {
                this.startCrystalNodePhase();
            } else {
                this.startBossPhase1();
            }
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
            const generator = this.bossComponents.get(
                this.boss.x + pos.x,
                this.boss.y + pos.y,
                'boss-generator-yellow' // Use yellow texture for active generators
            );
            
            if (generator) {
                generator.setActive(true);
                generator.setVisible(true);
                generator.setScale(0.5);
                generator.setDepth(RENDER_DEPTH.COMPONENT); // Render above boss
                generator.health = EnemyConfig.boss.phases[0].generatorHealth;
                generator.invincibleUntil = 0; // Initialize invincibility timer
                generator.isBossComponent = true;
                generator.isGenerator = true; // Mark as generator for collision routing
                
                // Ensure physics body is properly configured
                if (generator.body) {
                    generator.body.enable = true;
                    generator.body.checkCollision.none = false;
                }
                
                this.boss.generators.push(generator);
            }
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
            const turret = this.bossComponents.get(
                this.boss.x + Math.cos(angle) * radius,
                this.boss.y + Math.sin(angle) * radius,
                'boss-turret-yellow' // Use yellow texture for active turrets
            );
            
            if (turret) {
                turret.setActive(true);
                turret.setVisible(true);
                turret.setScale(0.7);
                turret.setDepth(RENDER_DEPTH.COMPONENT); // Render above boss
                turret.health = EnemyConfig.boss.phases[1].turretHealth;
                turret.invincibleUntil = 0; // Initialize invincibility timer
                turret.isBossComponent = true;
                turret.isTurret = true; // Mark as turret for collision routing
                turret.angle = angle;
                
                // Ensure physics body is properly configured
                if (turret.body) {
                    turret.body.enable = true;
                    turret.body.checkCollision.none = false;
                }
                
                this.boss.turrets.push(turret);
            }
        }
    }
    
    startBossPhase3() {
        console.log('Boss Phase 3: Core Exposed');
        this.boss.phase = 3;
        this.boss.phaseHealth = EnemyConfig.boss.phases[2].health;
        
        // Change boss core to yellow to indicate it's now damageable
        this.boss.setTexture('boss-core-yellow');
        this.boss.setVisible(true);
        
        // Ensure physics body is properly enabled for collisions in phase 3
        if (this.boss.body) {
            this.boss.body.enable = true;
            this.boss.body.checkCollision.none = false;
            // Body size already set at spawn (200x200)
        }
        
        // Boss becomes more aggressive
        this.boss.attackRate = 1000;
    }
    
    startCrystalNodePhase() {
        console.log('Crystal Node Boss: Communication Jammer');
        this.boss.phase = 1;
        this.boss.phaseHealth = EnemyConfig.crystalNode.phases[0].health;
        
        // Crystal node is immediately damageable (no shield generators)
        if (this.boss.body) {
            this.boss.body.enable = true;
            this.boss.body.checkCollision.none = false;
        }
        
        // Add pulsing effect
        this.boss.pulseScale = 1.0;
        this.boss.pulseDirection = 1;
        
        // Fires twice as fast (1250ms instead of 2500ms)
        this.boss.attackRate = 1250;
    }
    
    updateBoss(time) {
        if (!this.boss || !this.boss.active) return;
        
        // Crystal node pulsing effect
        if (this.currentBossType === 'crystalNode' && this.boss.pulseScale !== undefined) {
            const newScale = this.boss.pulseScale + (this.boss.pulseDirection * CRYSTAL_PULSE.speed);
            if (newScale >= CRYSTAL_PULSE.maxScale) {
                this.boss.pulseScale = CRYSTAL_PULSE.maxScale;
                this.boss.pulseDirection = -1;
            } else if (newScale <= CRYSTAL_PULSE.minScale) {
                this.boss.pulseScale = CRYSTAL_PULSE.minScale;
                this.boss.pulseDirection = 1;
            } else {
                this.boss.pulseScale = newScale;
            }
            this.boss.setScale(this.boss.pulseScale);
        }
        
        // Boss horizontal movement
        // Use config speed for movement (crystalNode has speed: 40)
        const moveSpeed = EnemyConfig[this.currentBossType]?.speed || 2;
        this.boss.x += this.boss.moveDirection * (moveSpeed / BOSS_MOVEMENT_DIVISOR);
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
        // CrystalNode fires bursts of 3 shots straight down (like pulse cannons)
        if (this.currentBossType === 'crystalNode') {
            const config = EnemyConfig.crystalNode;
            const burstCount = config.burstCount || 3;
            const burstDelay = config.burstDelay || 200;
            
            // Fire 3 bullets straight down with spacing (similar to pulse cannons)
            for (let burst = 0; burst < burstCount; burst++) {
                this.time.delayedCall(burst * burstDelay, () => {
                    // Check if boss is still active before firing
                    if (!this.boss || !this.boss.active) return;
                    
                    // Fire single bullet straight down
                    const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 50, 'enemy-bullet');
                    if (bullet) {
                        bullet.setActive(true);
                        bullet.setVisible(true);
                        // Re-enable physics body if it was disabled
                        if (bullet.body) {
                            bullet.body.enable = true;
                            bullet.body.setVelocity(0, config.bulletSpeed);
                        }
                    }
                });
            }
            return;
        }
        
        if (this.boss.phase === 1 || this.boss.phase === 3) {
            // Beam attack - spread of bullets
            for (let i = -2; i <= 2; i++) {
                const angle = Math.PI / 2 + (i * 0.2);
                const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 50, 'enemy-bullet');
                if (bullet) {
                    bullet.setActive(true);
                    bullet.setVisible(true);
                    // Re-enable physics body if it was disabled
                    if (bullet.body) {
                        bullet.body.enable = true;
                    }
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
                        // Re-enable physics body if it was disabled
                        if (bullet.body) {
                            bullet.body.enable = true;
                        }
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
    
    hitBossComponent(bullet, component) {
        // Route to appropriate handler based on component type
        if (component.isGenerator) {
            this.hitBossGenerator(bullet, component);
        } else if (component.isTurret) {
            this.hitBossTurret(bullet, component);
        }
    }
    
    hitBoss(bullet, boss) {
        // Check if bullet is already inactive (already processed by another collision handler)
        if (!bullet.active) {
            return;
        }
        
        // FIX: Use this.boss instead of the boss parameter
        // The collision callback parameter may not preserve custom properties reliably
        const actualBoss = this.boss;
        
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < (actualBoss.invincibleUntil || 0)) {
            return; // Still invincible, ignore damage
        }
        
        // Disable bullet using helper function
        this.disableBulletPhysics(bullet);
        
        // CrystalNode boss is immediately damageable (no shield phases)
        // Regular boss is only damageable in phase 3 (core exposed)
        const isDamageable = this.currentBossType === 'crystalNode' || actualBoss.phase === 3;
        
        if (isDamageable) {
            actualBoss.health -= 10;
            actualBoss.phaseHealth -= 10;
            
            // Play hit sound effect
            this.playSound('hit');
            
            // Set invincibility after taking damage
            actualBoss.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.enemy;
            
            if (actualBoss.phaseHealth <= 0 || actualBoss.health <= 0) {
                this.defeatBoss();
            }
        }
    }
    
    hitBossGenerator(bullet, generator) {
        // Check if bullet is already inactive (already processed by another collision handler)
        if (!bullet.active) {
            return;
        }
        
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < (generator.invincibleUntil || 0)) {
            return; // Still invincible, ignore damage
        }
        
        // Disable bullet using helper function
        this.disableBulletPhysics(bullet);
        
        generator.health -= 10;
        
        // Play hit sound effect
        this.playSound('hit');
        
        // Set invincibility after taking damage
        generator.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.enemy;
        
        if (generator.health <= 0) {
            // Play explosion sound effect
            this.playSound('explosion');
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
        // Check if bullet is already inactive (already processed by another collision handler)
        if (!bullet.active) {
            return;
        }
        
        // Check invincibility (prevents multiple hits in rapid succession)
        if (this.time.now < (turret.invincibleUntil || 0)) {
            return; // Still invincible, ignore damage
        }
        
        // Only allow damage to turrets if in phase 2 or later (generators must be destroyed first)
        if (this.boss.phase < 2) {
            // Disable bullet but don't damage turret
            this.disableBulletPhysics(bullet);
            return;
        }
        
        // Disable bullet using helper function
        this.disableBulletPhysics(bullet);
        
        turret.health -= 10;
        
        // Play hit sound effect
        this.playSound('hit');
        
        // Set invincibility after taking damage
        turret.invincibleUntil = this.time.now + INVINCIBILITY_DURATION.enemy;
        
        if (turret.health <= 0) {
            // Play explosion sound effect
            this.playSound('explosion');
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
        
        // First, destroy any remaining components (turrets and generators) with staggered timing
        let componentDelay = 0;
        const componentExplosionInterval = 150;
        
        // Destroy remaining generators first
        if (this.boss.generators && this.boss.generators.length > 0) {
            this.boss.generators.forEach((generator) => {
                if (generator && generator.active) {
                    this.time.delayedCall(componentDelay, () => {
                        this.createExplosion(generator.x, generator.y);
                        generator.setActive(false);
                        generator.setVisible(false);
                        generator.destroy();
                    });
                    componentDelay += componentExplosionInterval;
                }
            });
            this.boss.generators = [];
        }
        
        // Then destroy remaining turrets
        if (this.boss.turrets && this.boss.turrets.length > 0) {
            this.boss.turrets.forEach((turret) => {
                if (turret && turret.active) {
                    this.time.delayedCall(componentDelay, () => {
                        this.createExplosion(turret.x, turret.y);
                        turret.setActive(false);
                        turret.setVisible(false);
                        turret.destroy();
                    });
                    componentDelay += componentExplosionInterval;
                }
            });
            this.boss.turrets = [];
        }
        
        // Finally, destroy boss body with massive explosions AFTER components
        const bossExplosionStart = componentDelay + 200; // Small delay after last component
        
        // Hide boss immediately but don't destroy yet (for proper cleanup)
        this.boss.setVisible(false);
        
        // Massive explosion using captured position - starts after components are destroyed
        for (let i = 0; i < 10; i++) {
            this.time.delayedCall(bossExplosionStart + (i * 200), () => {
                const x = bossX + Phaser.Math.Between(-100, 100);
                const y = bossY + Phaser.Math.Between(-100, 100);
                this.createExplosion(x, y);
            });
        }
        
        // Award points
        this.addScore(EnemyConfig.boss.points);
        
        // Destroy boss and transition to victory after all explosions
        const totalExplosionTime = bossExplosionStart + 2000;
        this.time.delayedCall(totalExplosionTime, () => {
            if (this.boss) {
                this.boss.destroy();
            }
            this.victory();
        });
    }
    
    checkVictoryCondition() {
        // Only check victory if we're in the final wave
        if (!this.isFinalWave) {
            return;
        }
        
        // Count active enemies (enemies that are alive and visible)
        const activeEnemies = this.enemies.getChildren().filter(enemy => enemy.active).length;
        
        // Victory condition: final wave AND no active enemies
        if (activeEnemies === 0) {
            this.victory();
        }
    }
    
    victory() {
        console.log('Level1Scene: Victory!');
        
        // Stop all timers
        if (this.waveTimer) this.waveTimer.remove();
        if (this.podTimer) this.podTimer.remove();
        
        // Save high score before transitioning
        this.saveHighScore();
        
        // Award and save session points (roguelite style)
        const saveData = ProgressConfig.loadProgress();
        const pointsEarned = ProgressConfig.addSessionPoints(
            this.score,
            this.podsRescued,
            this.currentWave,
            saveData
        );
        
        // Check for level outro dialog
        if (DialogConfig.hasDialog(this.levelNumber, 'outro')) {
            // Show outro dialog before transitioning to victory scene
            this.showCommunication('outro', () => {
                this.scene.start('VictoryScene', {
                    score: this.score,
                    wave: this.currentWave,
                    podsRescued: this.podsRescued,
                    enemiesKilled: this.enemiesKilled,
                    levelNumber: this.levelNumber,
                    pointsEarned: pointsEarned
                });
            });
        } else {
            // Transition to victory scene immediately if no dialog
            this.scene.start('VictoryScene', {
                score: this.score,
                wave: this.currentWave,
                podsRescued: this.podsRescued,
                enemiesKilled: this.enemiesKilled,
                levelNumber: this.levelNumber,
                pointsEarned: pointsEarned
            });
        }
    }

    applyUpgrades() {
        console.log('Applying upgrades...', this.saveData.upgrades)
        
        // Apply Primary Phasers upgrade (fire rate)
        const phasersLevel = this.saveData.upgrades.primaryPhasers || 0
        if (phasersLevel > 0) {
            const phasersStats = UpgradesConfig.getUpgradeStats('primaryPhasers', phasersLevel)
            this.playerStats.fireRate = phasersStats.fireRate
        }
        
        // Apply Primary Shields upgrade
        const shieldsLevel = this.saveData.upgrades.primaryShields || 0
        if (shieldsLevel > 0) {
            const shieldsStats = UpgradesConfig.getUpgradeStats('primaryShields', shieldsLevel)
            this.playerStats.shields = shieldsStats.shields
            this.playerStats.maxShields = shieldsStats.shields
        }
        
        // Apply Ablative Armor upgrade
        const armorLevel = this.saveData.upgrades.ablativeArmor || 0
        if (armorLevel > 0) {
            const armorStats = UpgradesConfig.getUpgradeStats('ablativeArmor', armorLevel)
            this.playerStats.health = armorStats.health
            this.playerStats.maxHealth = armorStats.health
        }
        
        // Apply Impulse Engines upgrade
        const enginesLevel = this.saveData.upgrades.impulseEngines || 0
        if (enginesLevel > 0) {
            const enginesStats = UpgradesConfig.getUpgradeStats('impulseEngines', enginesLevel)
            this.playerStats.speed = enginesStats.speed
        }
        
        // Initialize weapon systems
        this.initializeWeaponSystems()
    }
    
    initializeWeaponSystems() {
        // Pulse Cannons
        const pulseCannonsLevel = this.saveData.upgrades.pulseCannons || 0
        this.pulseCannonsStats = UpgradesConfig.getUpgradeStats('pulseCannons', pulseCannonsLevel)
        this.pulseCannonsReady = true
        // Initialize to allow immediate firing if enabled
        if (this.pulseCannonsStats && this.pulseCannonsStats.enabled) {
            this.pulseCannonsLastFired = -this.pulseCannonsStats.cooldown
        } else {
            this.pulseCannonsLastFired = 0
        }
        
        // Quantum Torpedos
        const torpedosLevel = this.saveData.upgrades.quantumTorpedos || 0
        this.quantumTorpedosStats = UpgradesConfig.getUpgradeStats('quantumTorpedos', torpedosLevel)
        this.quantumTorpedosReady = true
        // Initialize to allow immediate firing if enabled
        if (this.quantumTorpedosStats && this.quantumTorpedosStats.enabled) {
            this.quantumTorpedosLastFired = -this.quantumTorpedosStats.cooldown
        } else {
            this.quantumTorpedosLastFired = 0
        }
        
        // Point Defense
        const pointDefenseLevel = this.saveData.upgrades.pointDefense || 0
        this.pointDefenseStats = UpgradesConfig.getUpgradeStats('pointDefense', pointDefenseLevel)
        this.pointDefenseReady = true
        // Initialize to allow immediate firing if enabled
        if (this.pointDefenseStats && this.pointDefenseStats.enabled) {
            this.pointDefenseLastFired = -this.pointDefenseStats.cooldown
        } else {
            this.pointDefenseLastFired = 0
        }
    }


    gameOver() {
        console.log('Level1Scene: Game Over!');
        
        // Stop all timers
        if (this.waveTimer) this.waveTimer.remove();
        if (this.podTimer) this.podTimer.remove();
        
        // Save high score before transitioning
        this.saveHighScore();
        
        // Award and save session points (roguelite style - earn points even on death!)
        const saveData = ProgressConfig.loadProgress();
        const pointsEarned = ProgressConfig.addSessionPoints(
            this.score,
            this.podsRescued,
            this.currentWave,
            saveData
        );
        
        // Transition to game over scene
        this.scene.start('GameOverScene', {
            score: this.score,
            wave: this.currentWave,
            podsRescued: this.podsRescued,
            levelNumber: this.levelNumber,
            pointsEarned: pointsEarned
        });
    }

    // ========================================
    // COMMUNICATION SYSTEM
    // ========================================

    showCommunication(trigger, onComplete) {
        console.log(`Showing communication dialog: ${trigger} for level ${this.levelNumber}`);
        
        const dialogData = DialogConfig.getDialog(this.levelNumber, trigger);
        if (!dialogData) {
            console.warn(`No dialog found for level ${this.levelNumber}, trigger: ${trigger}`);
            if (onComplete) onComplete();
            return;
        }

        // Pause game during communication
        this.physics.pause();
        
        // Store original camera zoom
        this.originalCameraZoom = this.cameras.main.zoom;
        
        // Apply camera zoom effect
        this.cameras.main.zoomTo(
            DialogConfig.camera.communicationZoom,
            DialogConfig.camera.zoomDuration,
            'Sine.easeInOut'
        );
        
        // Center camera on player if configured
        if (DialogConfig.camera.focusOnPlayer && this.playerShip) {
            this.cameras.main.pan(
                this.playerShip.x,
                this.playerShip.y,
                DialogConfig.camera.zoomDuration,
                'Sine.easeInOut'
            );
        }
        
        // Initialize communication state
        this.communicationState = {
            dialogData: dialogData,
            currentIndex: 0,
            onComplete: onComplete,
            isTyping: false,
            skipPressed: false,
            hudElements: null
        };
        
        // Show first message after camera zoom
        this.time.delayedCall(DialogConfig.camera.zoomDuration, () => {
            this.showNextMessage();
        });
    }

    showNextMessage() {
        const state = this.communicationState;
        if (!state || state.currentIndex >= state.dialogData.sequence.length) {
            this.closeCommunication();
            return;
        }

        const message = state.dialogData.sequence[state.currentIndex];
        this.displayCommunicationHUD(message);
    }

    displayCommunicationHUD(message) {
        // Clear previous HUD elements if any
        this.clearCommunicationHUD();

        const isMobile = this.cameraWidth < 600 || this.cameraHeight < 600;
        const config = DialogConfig.hud;
        
        // Calculate dimensions based on device
        const hudWidth = isMobile ? config.mobileWidth : config.width;
        const hudHeight = isMobile ? config.mobileHeight : config.height;
        const portraitSize = isMobile ? config.mobilePortraitSize : config.portraitSize;
        const speakerFontSize = isMobile ? config.mobileSpeakerFontSize : config.speakerFontSize;
        const textFontSize = isMobile ? config.mobileTextFontSize : config.textFontSize;
        const lineHeight = isMobile ? config.mobileLineHeight : config.lineHeight;
        
        // Create container for all HUD elements
        const hudElements = {
            graphics: [],
            texts: [],
            images: []
        };

        // Background panel
        const bg = this.add.graphics();
        bg.fillStyle(config.backgroundColor, config.backgroundAlpha);
        bg.fillRect(config.x, config.y, hudWidth, hudHeight);
        bg.lineStyle(config.borderWidth, config.borderColor, 1);
        bg.strokeRect(config.x, config.y, hudWidth, hudHeight);
        bg.setScrollFactor(0);
        bg.setDepth(1000);
        hudElements.graphics.push(bg);

        // Title bar
        const titleBg = this.add.graphics();
        titleBg.fillStyle(config.borderColor, 0.3);
        titleBg.fillRect(config.x, config.y - 25, hudWidth, 25);
        titleBg.setScrollFactor(0);
        titleBg.setDepth(1000);
        hudElements.graphics.push(titleBg);

        const titleText = this.add.text(
            config.x + hudWidth / 2,
            config.y - 12,
            this.communicationState.dialogData.title || 'COMMUNICATION',
            {
                fontSize: '12px',
                color: config.borderColor,
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold'
            }
        );
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);
        titleText.setDepth(1001);
        hudElements.texts.push(titleText);

        // Portrait/Ship image (left side)
        const portraitKey = DialogConfig.portraits[message.portrait];
        if (portraitKey && this.textures.exists(portraitKey)) {
            const portrait = this.add.image(
                config.x + config.portraitPadding + portraitSize / 2,
                config.y + hudHeight / 2,
                portraitKey
            );
            portrait.setDisplaySize(portraitSize, portraitSize);
            portrait.setScrollFactor(0);
            portrait.setDepth(1001);
            hudElements.images.push(portrait);
        } else {
            // Fallback: simple colored circle if image not found
            const portraitCircle = this.add.graphics();
            portraitCircle.fillStyle(0x00FFFF, 0.5);
            portraitCircle.fillCircle(
                config.x + config.portraitPadding + portraitSize / 2,
                config.y + hudHeight / 2,
                portraitSize / 2
            );
            portraitCircle.setScrollFactor(0);
            portraitCircle.setDepth(1001);
            hudElements.graphics.push(portraitCircle);
        }

        // Text area (right side)
        const textX = config.x + config.portraitPadding * 2 + portraitSize + config.textPadding;
        const textWidth = hudWidth - portraitSize - config.portraitPadding * 2 - config.textPadding * 2;

        // Speaker name and ship
        const speakerLabel = `${message.speaker}${message.ship ? ` - ${message.ship}` : ''}`;
        const speakerText = this.add.text(
            textX,
            config.y + config.textPadding,
            speakerLabel,
            {
                fontSize: speakerFontSize,
                color: config.speakerColor,
                fontFamily: 'Courier New, monospace',
                fontStyle: 'bold',
                wordWrap: { width: textWidth }
            }
        );
        speakerText.setScrollFactor(0);
        speakerText.setDepth(1001);
        hudElements.texts.push(speakerText);

        // Dialog text (will be shown with typewriter effect)
        const dialogTextY = config.y + config.textPadding + lineHeight + 5;
        const dialogText = this.add.text(
            textX,
            dialogTextY,
            '',
            {
                fontSize: textFontSize,
                color: config.textColor,
                fontFamily: 'Courier New, monospace',
                wordWrap: { width: textWidth },
                lineSpacing: 3
            }
        );
        dialogText.setScrollFactor(0);
        dialogText.setDepth(1001);
        hudElements.texts.push(dialogText);

        // Advance prompt
        const advanceText = isMobile ? config.mobileAdvanceText : config.advanceText;
        const advancePrompt = this.add.text(
            config.x + hudWidth - config.textPadding,
            config.y + hudHeight - config.textPadding,
            advanceText,
            {
                fontSize: config.advanceFontSize,
                color: config.advanceColor,
                fontFamily: 'Courier New, monospace'
            }
        );
        advancePrompt.setOrigin(1, 1);
        advancePrompt.setScrollFactor(0);
        advancePrompt.setDepth(1001);
        advancePrompt.setAlpha(0); // Hidden until typewriter is done
        hudElements.texts.push(advancePrompt);

        // Store elements
        this.communicationState.hudElements = hudElements;
        this.communicationState.dialogText = dialogText;
        this.communicationState.advancePrompt = advancePrompt;
        this.communicationState.fullText = message.text;

        // Start typewriter effect
        this.startTypewriterEffect(message.text, dialogText, advancePrompt);

        // Setup input for advancing
        this.setupCommunicationInput();
    }

    startTypewriterEffect(fullText, textObject, advancePrompt) {
        this.communicationState.isTyping = true;
        this.communicationState.skipPressed = false;
        
        let currentChar = 0;
        const typewriterSpeed = DialogConfig.hud.typewriterSpeed;

        const typeNextChar = () => {
            if (this.communicationState.skipPressed || currentChar >= fullText.length) {
                // Show full text immediately
                textObject.setText(fullText);
                this.communicationState.isTyping = false;
                advancePrompt.setAlpha(1);
                
                // Make advance prompt blink
                this.tweens.add({
                    targets: advancePrompt,
                    alpha: 0.3,
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
                return;
            }

            textObject.setText(fullText.substring(0, currentChar + 1));
            currentChar++;

            this.time.delayedCall(typewriterSpeed, typeNextChar);
        };

        typeNextChar();
    }

    setupCommunicationInput() {
        // Remove previous input listeners if any
        if (this.communicationSpaceKey) {
            this.communicationSpaceKey.off('down');
        }
        if (this.communicationInputZone) {
            this.communicationInputZone.destroy();
        }

        // Space key to advance/skip
        this.communicationSpaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.communicationSpaceKey.on('down', () => {
            this.handleCommunicationAdvance();
        });

        // Touch/click anywhere to advance/skip
        this.communicationInputZone = this.add.rectangle(
            0, 0,
            this.cameraWidth,
            this.cameraHeight,
            0x000000,
            0
        );
        this.communicationInputZone.setOrigin(0, 0);
        this.communicationInputZone.setScrollFactor(0);
        this.communicationInputZone.setDepth(999);
        this.communicationInputZone.setInteractive();
        this.communicationInputZone.on('pointerdown', () => {
            this.handleCommunicationAdvance();
        });
    }

    handleCommunicationAdvance() {
        if (!this.communicationState) return;

        if (this.communicationState.isTyping) {
            // Skip typewriter effect
            this.communicationState.skipPressed = true;
        } else {
            // Advance to next message
            this.communicationState.currentIndex++;
            this.showNextMessage();
        }
    }

    clearCommunicationHUD() {
        if (!this.communicationState || !this.communicationState.hudElements) return;

        const elements = this.communicationState.hudElements;
        
        // Destroy all graphics
        elements.graphics.forEach(g => g.destroy());
        
        // Destroy all texts
        elements.texts.forEach(t => t.destroy());
        
        // Destroy all images
        elements.images.forEach(i => i.destroy());

        this.communicationState.hudElements = null;
    }

    closeCommunication() {
        console.log('Closing communication dialog');

        // Clear HUD
        this.clearCommunicationHUD();

        // Clean up input listeners
        if (this.communicationSpaceKey) {
            this.communicationSpaceKey.off('down');
            this.communicationSpaceKey = null;
        }
        if (this.communicationInputZone) {
            this.communicationInputZone.destroy();
            this.communicationInputZone = null;
        }

        // Restore camera zoom and position
        this.cameras.main.zoomTo(
            this.originalCameraZoom || DialogConfig.camera.normalZoom,
            DialogConfig.camera.zoomDuration,
            'Sine.easeInOut'
        );

        // Reset camera to follow player
        if (this.playerShip) {
            this.cameras.main.stopFollow();
            // Re-center on middle of screen
            this.cameras.main.pan(
                this.cameraWidth / 2,
                this.cameraHeight / 2,
                DialogConfig.camera.zoomDuration,
                'Sine.easeInOut'
            );
        }

        // Resume game after camera restoration
        this.time.delayedCall(DialogConfig.camera.zoomDuration, () => {
            this.physics.resume();
            
            // Call completion callback
            const onComplete = this.communicationState.onComplete;
            this.communicationState = null;
            
            if (onComplete) {
                onComplete();
            }
        });
    }
}
