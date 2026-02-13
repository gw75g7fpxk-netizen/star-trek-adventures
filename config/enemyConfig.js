// Enemy Configuration
// This file contains enemy stats and configurations for all enemy types

const EnemyConfig = {
    // Dominion Fighter - Small, fast attack ship
    fighter: {
        health: 20,
        speed: 150,
        fireRate: 2000, // milliseconds between shots
        bulletSpeed: 300,
        damage: 10,
        points: 100,
        movementPattern: 'weaving', // 'straight', 'weaving', 'zigzag'
        size: { width: 30, height: 30 }
    },
    
    // Dominion Cruiser - Medium warship
    cruiser: {
        health: 50,
        speed: 80,
        fireRate: 1500,
        bulletSpeed: 250,
        damage: 20,
        points: 250,
        movementPattern: 'straight',
        size: { width: 50, height: 50 }
    },
    
    // Dominion Battleship (Mini-boss)
    battleship: {
        health: 150,
        speed: 40,
        fireRate: 1000,
        bulletSpeed: 200,
        damage: 30,
        points: 500,
        movementPattern: 'horizontal',
        size: { width: 80, height: 80 }
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
                generatorHealth: 50,
                attacks: ['beam', 'missiles']
            },
            {
                name: 'turrets',
                health: 400,
                turrets: 6,
                turretHealth: 30,
                attacks: ['rapid_fire', 'minions'],
                minionSpawnChance: 0.3 // 30% chance per attack cycle
            },
            {
                name: 'core',
                health: 300,
                attacks: ['beam', 'missiles', 'rapid_fire']
            }
        ],
        size: { width: 200, height: 200 },
        points: 5000
    }
};
