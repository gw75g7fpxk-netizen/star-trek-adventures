// Wave Configuration
// This file contains enemy wave configurations for Level 1

const WaveConfig = {
    level1: {
        wave1: { 
            enemyCount: 5, 
            enemyTypes: ['fighter'], 
            spawnRate: 2000, 
            difficulty: 1,
            duration: 20000 // 20 seconds
        },
        wave2: { 
            enemyCount: 8, 
            enemyTypes: ['fighter'], 
            spawnRate: 1500, 
            difficulty: 1.5,
            duration: 25000
        },
        wave3: { 
            enemyCount: 10, 
            enemyTypes: ['fighter', 'cruiser'], 
            spawnRate: 1200, 
            difficulty: 2,
            duration: 30000
        },
        wave4: {
            enemyCount: 12,
            enemyTypes: ['fighter', 'cruiser'],
            spawnRate: 1000,
            difficulty: 2.5,
            duration: 35000
        },
        wave5: {
            enemyCount: 15,
            enemyTypes: ['fighter', 'cruiser', 'battleship'],
            spawnRate: 900,
            difficulty: 3,
            duration: 40000
        },
        bossWave: {
            threshold: 5, // Boss appears after wave 5
            type: 'boss'
        }
    }
};
