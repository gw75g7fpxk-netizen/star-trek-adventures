// Progress Configuration and Management
// Handles level unlocks, stats tracking, and save/load functionality

const ProgressConfig = {
    // Default save data structure
    defaultSaveData: {
        unlockedLevels: [1], // Start with only level 1 unlocked
        levelStats: {
            // Stats for each level when completed
            // Example: level1: { completed: true, highScore: 1000, enemiesKilled: 50, podsRescued: 3 }
        },
        upgradePoints: 0, // Points earned from missions for upgrades
        upgrades: {
            // Placeholder for future upgrade system
            // Example: maxHealth: 0, fireRate: 0, shieldCapacity: 0
        }
    },

    // Level metadata for display in level select
    levelInfo: {
        1: { name: 'First Contact', description: 'Encounter initial Dominion forces' },
        2: { name: 'Defensive Line', description: 'Defend the Federation outpost' },
        3: { name: 'Supply Run', description: 'Protect the convoy through hostile space' },
        4: { name: 'Deep Space Patrol', description: 'Patrol the frontier sectors' },
        5: { name: 'Enemy Territory', description: 'Strike behind enemy lines' },
        6: { name: 'The Badlands', description: 'Navigate treacherous plasma storms' },
        7: { name: 'Battle of Sector 001', description: 'Defend Earth from invasion' },
        8: { name: 'Wormhole Defense', description: 'Secure the Bajoran wormhole' },
        9: { name: 'Final Stand', description: 'Hold the line at all costs' },
        10: { name: 'Endgame', description: 'Face the Dominion flagship' }
    },

    // Save game data to localStorage
    saveProgress(data) {
        try {
            localStorage.setItem('starTrekAdventuresProgress', JSON.stringify(data))
            console.log('Progress saved successfully')
            return true
        } catch (e) {
            console.warn('Failed to save progress:', e)
            return false
        }
    },

    // Load game data from localStorage
    loadProgress() {
        try {
            const saved = localStorage.getItem('starTrekAdventuresProgress')
            if (saved) {
                const data = JSON.parse(saved)
                console.log('Progress loaded successfully')
                return data
            }
        } catch (e) {
            console.warn('Failed to load progress:', e)
        }
        // Return default save data if no save exists or error occurred
        return JSON.parse(JSON.stringify(this.defaultSaveData))
    },

    // Check if a level is unlocked
    isLevelUnlocked(levelNumber, saveData) {
        return saveData.unlockedLevels.includes(levelNumber)
    },

    // Unlock a level
    unlockLevel(levelNumber, saveData) {
        if (!saveData.unlockedLevels.includes(levelNumber)) {
            saveData.unlockedLevels.push(levelNumber)
            saveData.unlockedLevels.sort((a, b) => a - b)
            this.saveProgress(saveData)
            console.log(`Level ${levelNumber} unlocked!`)
        }
    },

    // Save level completion stats
    saveLevelStats(levelNumber, stats, saveData) {
        saveData.levelStats[`level${levelNumber}`] = {
            completed: true,
            highScore: Math.max(stats.score || 0, saveData.levelStats[`level${levelNumber}`]?.highScore || 0),
            enemiesKilled: stats.enemiesKilled || 0,
            podsRescued: stats.podsRescued || 0,
            wave: stats.wave || 0
        }
        
        // Unlock next level if it exists
        if (levelNumber < 10) {
            this.unlockLevel(levelNumber + 1, saveData)
        }
        
        // Award upgrade points based on performance
        const pointsEarned = Math.floor(stats.score / 100)
        saveData.upgradePoints += pointsEarned
        
        this.saveProgress(saveData)
        console.log(`Level ${levelNumber} stats saved. Points earned: ${pointsEarned}`)
    },

    // Get level stats if completed
    getLevelStats(levelNumber, saveData) {
        return saveData.levelStats[`level${levelNumber}`] || null
    },

    // Reset all progress (for testing)
    resetProgress() {
        try {
            localStorage.removeItem('starTrekAdventuresProgress')
            console.log('Progress reset successfully')
            return true
        } catch (e) {
            console.warn('Failed to reset progress:', e)
            return false
        }
    }
}
