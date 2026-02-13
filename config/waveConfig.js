// Wave Configuration
// This file contains enemy wave configurations for Level 1
// Currently not implemented, but ready for future enemy system integration

const WaveConfig = {
    level1: {
        wave1: { 
            enemyCount: 5, 
            enemyType: 'fighter', 
            spawnRate: 2000, 
            difficulty: 1 
        },
        wave2: { 
            enemyCount: 8, 
            enemyType: 'fighter', 
            spawnRate: 1500, 
            difficulty: 1.5 
        },
        wave3: { 
            enemyCount: 10, 
            enemyType: 'mixed', 
            spawnRate: 1200, 
            difficulty: 2 
        }
    }
};
