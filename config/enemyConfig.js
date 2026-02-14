// Enemy Configuration
// This file contains enemy stats and configurations for all enemy types

const EnemyConfig = {
    // Dominion Fighter - Small, fast attack ship
    fighter: {
        health: 10,
        speed: 150,
        fireRate: 2000, // milliseconds between shots
        bulletSpeed: 300,
        damage: 1,
        points: 100,
        movementPattern: 'weaving', // 'straight', 'weaving', 'zigzag'
        size: { width: 25, height: 25 }
    },
    
    // Dominion Cruiser - Medium warship
    cruiser: {
        health: 50,
        speed: 80,
        fireRate: 1500,
        bulletSpeed: 250,
        damage: 1,
        points: 250,
        movementPattern: 'straight',
        size: { width: 60, height: 60 }
    },
    
    // Dominion Battleship (Mini-boss)
    battleship: {
        health: 150,
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
        health: 5,
        speed: 0, // Stationary (only moves with screen scroll)
        fireRate: 3000, // Fires slowly (every 3 seconds)
        bulletSpeed: 200,
        damage: 1,
        points: 150,
        movementPattern: 'stationary',
        scattershot: true, // Fires in all directions
        scattershotCount: 6, // Number of bullets per shot
        size: { width: 30, height: 30 }
    },
    
    // Boss - Massive Dominion Battleship
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
    }
};
