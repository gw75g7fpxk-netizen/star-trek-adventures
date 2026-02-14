// Wave Configuration
// This file contains enemy wave configurations for Level 1

const WaveConfig = {
    betweenWaveDelay: 1500, // Delay between waves in milliseconds (reduced from 3000ms)
    level1: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000 // 20 seconds
        },
        wave2: { 
            enemyCount: 8, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 8 },
            spawnRate: 1500, 
            difficulty: 1.5,
            duration: 25000
        },
        wave3: { 
            enemyCount: 11, 
            enemyTypes: ['fighter', 'cruiser', 'weaponPlatform'],
            shipCounts: { fighter: 7, cruiser: 3, weaponPlatform: 1 },
            spawnRate: 1200, 
            difficulty: 2,
            duration: 30000
        },
        wave4: {
            enemyCount: 14,
            enemyTypes: ['fighter', 'cruiser', 'weaponPlatform'],
            shipCounts: { fighter: 7, cruiser: 5, weaponPlatform: 2 },
            spawnRate: 1000,
            difficulty: 2.5,
            duration: 35000
        },
        wave5: {
            enemyCount: 17,
            enemyTypes: ['fighter', 'cruiser', 'battleship', 'weaponPlatform'],
            shipCounts: { fighter: 8, cruiser: 5, battleship: 2, weaponPlatform: 2 },
            spawnRate: 900,
            difficulty: 3,
            duration: 40000
        },
        bossWave: {
            threshold: 5, // Boss appears after wave 5
            type: 'boss'
        }
    },
    // Levels 2-10: Placeholder wave configurations (single wave with 5 fighters)
    // These will be expanded with proper content later
    level2: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    },
    level3: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    },
    level4: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    },
    level5: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    },
    level6: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    },
    level7: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    },
    level8: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    },
    level9: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    },
    level10: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 5 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000
        }
    }
};
