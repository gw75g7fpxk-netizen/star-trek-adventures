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
    
    // Boss - Massive Crystalis Battleship
    boss: {
        health: 1000,
        speed: 30,
        phases: [
            {
                name: 'shields',
                health: 300,
                generators: 4,
                generatorHealth: 200,
                attacks: ['beam', 'missiles']
            },
            {
                name: 'turrets',
                health: 400,
                turrets: 6,
                turretHealth: 200,
                attacks: ['rapid_fire', 'minions'],
                minionSpawnChance: 0.3 // 30% chance per attack cycle
            },
            {
                name: 'core',
                health: 200,
                attacks: ['beam', 'missiles', 'rapid_fire']
            }
        ],
        size: { width: 200, height: 200 },
        points: 5000
    },
    
    // Crystal Node - Mid-boss for Level 2 (Communication Jammer)
    crystalNode: {
        health: 600,
        shields: 0,
        speed: 20,
        fireRate: 2500, // Shoots less frequently than regular enemies
        bulletSpeed: 200,
        damage: 2,
        movementPattern: 'stationary', // Stays in place
        phases: [
            {
                name: 'core',
                health: 600,
                attacks: ['pulse_wave', 'energy_bolts']
            }
        ],
        size: { width: 120, height: 120 },
        points: 2500,
        pulsing: true // Visual effect - node pulses periodically
    }
};
