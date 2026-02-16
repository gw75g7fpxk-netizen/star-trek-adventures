// Wave Configuration
// This file contains enemy wave configurations for Level 1

const WaveConfig = {
    betweenWaveDelay: 1500, // Delay between waves in milliseconds (reduced from 3000ms)
    // Level 1: Shards of First Contact - Introduction level
    // Simple waves with scouts, fighters, and cruisers only
    level1: {
        wave1: { 
            enemyCount: 6, 
            enemyTypes: ['fighter', 'scout'],
            shipCounts: { fighter: 4, scout: 2 },
            spawnRate: 2200, 
            difficulty: 1,
            duration: 18000
        },
        wave2: { 
            enemyCount: 9, 
            enemyTypes: ['fighter', 'scout'],
            shipCounts: { fighter: 6, scout: 3 },
            spawnRate: 1800, 
            difficulty: 1.3,
            duration: 22000
        },
        wave3: { 
            enemyCount: 10, 
            enemyTypes: ['fighter', 'cruiser', 'scout'],
            shipCounts: { fighter: 5, cruiser: 2, scout: 3 },
            spawnRate: 1600, 
            difficulty: 1.7,
            duration: 26000
        },
        wave4: {
            enemyCount: 12,
            enemyTypes: ['fighter', 'cruiser', 'scout'],
            shipCounts: { fighter: 6, cruiser: 3, scout: 3 },
            spawnRate: 1400,
            difficulty: 2,
            duration: 30000
        },
        bossWave: {
            threshold: 4, // Boss appears after wave 4
            type: 'vanguard'
        }
    },
    // Level 2: Echoes of the Entity - Asteroid field with rescue missions
    level2: {
        wave1: { 
            enemyCount: 16, 
            enemyTypes: ['fighter', 'scout', 'asteroid'],
            shipCounts: { fighter: 4, scout: 2, asteroid: 12 },
            spawnRate: 2000, 
            difficulty: 1.2,
            duration: 25000
        },
        wave2: { 
            enemyCount: 23, 
            enemyTypes: ['fighter', 'scout', 'asteroid'],
            shipCounts: { fighter: 5, scout: 3, asteroid: 15 },
            spawnRate: 1800, 
            difficulty: 1.5,
            duration: 28000
        },
        wave3: { 
            enemyCount: 26, 
            enemyTypes: ['fighter', 'cruiser', 'asteroid', 'scout'],
            shipCounts: { fighter: 6, cruiser: 2, asteroid: 15, scout: 3 },
            spawnRate: 1600, 
            difficulty: 2,
            duration: 32000
        },
        wave4: {
            enemyCount: 31,
            enemyTypes: ['fighter', 'cruiser', 'asteroid', 'scout'],
            shipCounts: { fighter: 7, cruiser: 3, asteroid: 18, scout: 3 },
            spawnRate: 1400,
            difficulty: 2.5,
            duration: 35000
        },
        wave5: {
            enemyCount: 39,
            enemyTypes: ['fighter', 'cruiser', 'asteroid', 'scout'],
            shipCounts: { fighter: 8, cruiser: 4, asteroid: 18, scout: 3 },
            spawnRate: 1200,
            difficulty: 3,
            duration: 38000
        },
        bossWave: {
            threshold: 5, // Boss appears after wave 5
            type: 'crystalNode'
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
            enemyTypes: ['crystalNode'],
            shipCounts: { crystalNode: 1 },
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
