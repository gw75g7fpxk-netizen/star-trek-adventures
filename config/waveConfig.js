// Wave Configuration
// This file contains enemy wave configurations for Level 1

const WaveConfig = {
    betweenWaveDelay: 1500, // Delay between waves in milliseconds (reduced from 3000ms)
    level1: {
        wave1: { 
            enemyCount: 8, 
            enemyTypes: ['fighter', 'scout'],
            shipCounts: { fighter: 5, scout: 3 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000 // 20 seconds
        },
        wave2: { 
            enemyCount: 11, 
            enemyTypes: ['fighter', 'scout'],
            shipCounts: { fighter: 8, scout: 3 },
            spawnRate: 1500, 
            difficulty: 1.5,
            duration: 25000
        },
        wave3: { 
            enemyCount: 14, 
            enemyTypes: ['fighter', 'cruiser', 'weaponPlatform', 'scout'],
            shipCounts: { fighter: 7, cruiser: 3, weaponPlatform: 1, scout: 3 },
            spawnRate: 1200, 
            difficulty: 2,
            duration: 30000
        },
        wave4: {
            enemyCount: 17,
            enemyTypes: ['fighter', 'cruiser', 'weaponPlatform', 'scout'],
            shipCounts: { fighter: 7, cruiser: 5, weaponPlatform: 2, scout: 3 },
            spawnRate: 1000,
            difficulty: 2.5,
            duration: 35000
        },
        wave5: {
            enemyCount: 20,
            enemyTypes: ['fighter', 'cruiser', 'battleship', 'weaponPlatform', 'scout'],
            shipCounts: { fighter: 8, cruiser: 5, battleship: 2, weaponPlatform: 2, scout: 3 },
            spawnRate: 900,
            difficulty: 3,
            duration: 40000
        }
        // Boss wave disabled - player progresses to next level after wave 5
        // bossWave: {
        //     threshold: 5, // Boss appears after wave 5
        //     type: 'boss'
        // }
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
    },
    // Level 11: Secret Testing Level - One wave for each enemy type (no escape pods)
    level11: {
        wave1: { 
            enemyCount: 1, 
            enemyTypes: ['fighter'],
            shipCounts: { fighter: 1 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 10000
        },
        wave2: { 
            enemyCount: 1, 
            enemyTypes: ['scout'],
            shipCounts: { scout: 1 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 10000
        },
        wave3: { 
            enemyCount: 1, 
            enemyTypes: ['cruiser'],
            shipCounts: { cruiser: 1 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 10000
        },
        wave4: { 
            enemyCount: 1, 
            enemyTypes: ['battleship'],
            shipCounts: { battleship: 1 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 10000
        },
        wave5: { 
            enemyCount: 1, 
            enemyTypes: ['weaponPlatform'],
            shipCounts: { weaponPlatform: 1 },
            spawnRate: 2000, 
            difficulty: 1,
            duration: 10000
        }
    }
};
