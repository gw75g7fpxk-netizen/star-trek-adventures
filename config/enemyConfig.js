// Enemy Configuration
// This file contains enemy stats and configurations for all enemy types

const EnemyConfig = {
    // Crystalis Fighter - Small, fast attack ship
    fighter: {
        health: 1,
        shields: 0,
        speed: 150,
        fireRate: 2000, // milliseconds between shots
        bulletSpeed: 300,
        damage: 1,
        points: 100,
        movementPattern: 'weaving', // 'straight', 'weaving', 'zigzag'
        size: { width: 25, height: 25 }
    },
    
    // Scout - Small, unarmed ship that flies in formation
    scout: {
        health: 1,
        shields: 0,
        speed: 150,
        fireRate: null, // Scouts don't fire weapons
        bulletSpeed: null,
        damage: 1, // Collision damage
        points: 50,
        movementPattern: 'formation', // Flies in formation with other scouts
        size: { width: 15, height: 15 }, // 15x15 size
        formationSize: 3, // Default number of scouts in a formation
        formationSpacing: 36 // Vertical spacing between scouts in formation
    },
    
    // Crystalis Cruiser - Medium warship
    cruiser: {
        health: 3,
        shields: 3,
        speed: 80,
        fireRate: 1500,
        bulletSpeed: 250,
        damage: 1,
        points: 250,
        movementPattern: 'straight',
        size: { width: 60, height: 60 }
    },
    
    // Crystalis Battleship (Mini-boss)
    battleship: {
        health: 8,
        shields: 8,
        speed: 40,
        fireRate: 1000,
        bulletSpeed: 200,
        damage: 1,
        points: 500,
        movementPattern: 'horizontal',
        size: { width: 120, height: 120 }
    },
    
    // Weapon Platform - Stationary turret with scattershot
    weaponPlatform: {
        health: 1,
        shields: 5,
        speed: 0, // Stationary horizontally (moves vertically with screen scroll)
        fireRate: 3000, // Fires slowly (every 3 seconds)
        bulletSpeed: 200,
        damage: 1,
        points: 150,
        movementPattern: 'stationary',
        scattershot: true, // Fires in all directions
        scattershotCount: 6, // Number of bullets per shot
        size: { width: 40, height: 40 }
    },
    
    // Asteroid - Passive obstacle in asteroid field
    asteroid: {
        health: 3,
        shields: 0,
        speed: 0, // Stationary horizontally (moves vertically with screen scroll)
        fireRate: null, // Asteroids don't fire weapons
        bulletSpeed: null,
        damage: 1, // Collision damage
        points: 10, // Small points for destroying obstacles
        movementPattern: 'stationary',
        size: { width: 40, height: 40 },
        rotation: true // Asteroids slowly rotate
    },
    
    // Shard Vanguard - Level 1 Boss (First contact enemy leader)
    vanguard: {
        health: 75,
        shields: 0,
        speed: 50,
        fireRate: 1800, // Time between attacks (slower than crystalNode)
        bulletSpeed: 180,
        damage: 1,
        movementPattern: 'horizontal',
        spreadShot: true, // Fires spread pattern
        spreadCount: 3, // Fires 3 bullets per shot
        size: { width: 100, height: 100 },
        points: 1500
    },
    
    // Boss - Massive Crystalis Battleship (Simplified to be a stronger enemy)
    boss: {
        health: 500,
        shields: 0,
        speed: 30,
        fireRate: 1500, // milliseconds between shots
        bulletSpeed: 200,
        damage: 2,
        points: 5000,
        movementPattern: 'horizontal',
        spreadShot: true, // Fires multiple bullets in a spread pattern
        spreadCount: 5, // Number of bullets per shot
        size: { width: 200, height: 200 }
    },
    
    // Crystal Node - Mid-boss for Level 2 (Communication Jammer)
    crystalNode: {
        health: 150,
        shields: 0,
        speed: 40,
        fireRate: 1250, // Time between burst attacks
        bulletSpeed: 200,
        damage: 2,
        movementPattern: 'horizontal', // Moves like battleships
        burstCount: 3, // Number of shots per burst attack
        burstDelay: 200, // Milliseconds between shots in a burst
        size: { width: 120, height: 120 },
        points: 2500,
        pulsing: true // Visual effect - node pulses periodically
    },
    
    // Destroyer - Medium ship that fires straight down and moves horizontally
    destroyer: {
        health: 4,
        shields: 4,
        speed: 200, // Moves as fast as player ship
        fireRate: 1800, // milliseconds between shots
        bulletSpeed: 300,
        damage: 1,
        points: 300,
        movementPattern: 'horizontal',
        straightFire: true, // Fires bullets straight down instead of targeting player
        size: { width: 70, height: 70 }
    }
};
