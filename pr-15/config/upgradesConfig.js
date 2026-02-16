// Upgrades Configuration
// Defines all available ship upgrades, their costs, and effects

const UpgradesConfig = {
    // Upgrade categories
    categories: {
        offensive: {
            name: 'OFFENSIVE',
            color: '#FF6600',
            upgrades: ['primaryPhasers', 'pulseCannons', 'quantumTorpedos']
        },
        defensive: {
            name: 'DEFENSIVE', 
            color: '#00AAFF',
            upgrades: ['primaryShields', 'pointDefense', 'ablativeArmor']
        },
        movement: {
            name: 'MOVEMENT',
            color: '#FFFF00',
            upgrades: ['impulseEngines']
        }
    },

    // Individual upgrade definitions
    upgrades: {
        // OFFENSIVE UPGRADES
        primaryPhasers: {
            name: 'Primary Phasers',
            description: 'Increases fire rate of primary weapon',
            category: 'offensive',
            maxLevel: 5,
            costPerLevel: 10,
            levels: {
                0: { fireRate: 250 }, // Base fire rate (ms between shots)
                1: { fireRate: 225 },
                2: { fireRate: 200 },
                3: { fireRate: 175 },
                4: { fireRate: 150 },
                5: { fireRate: 125 }
            }
        },

        pulseCannons: {
            name: 'Pulse Cannons',
            description: 'Two additional cannons firing burst shots',
            category: 'offensive',
            maxLevel: 5,
            costPerLevel: 15,
            levels: {
                0: { enabled: false, cooldown: 0, burstsPerCannon: 0 },
                1: { enabled: true, cooldown: 10000, burstsPerCannon: 3 }, // Cooldown in ms
                2: { enabled: true, cooldown: 8000, burstsPerCannon: 3 },
                3: { enabled: true, cooldown: 6000, burstsPerCannon: 3 },
                4: { enabled: true, cooldown: 4000, burstsPerCannon: 3 },
                5: { enabled: true, cooldown: 2000, burstsPerCannon: 3 }
            }
        },

        quantumTorpedos: {
            name: 'Quantum Torpedoes',
            description: 'Heavy guided torpedoes targeting strongest enemy',
            category: 'offensive',
            maxLevel: 5,
            costPerLevel: 20,
            levels: {
                0: { enabled: false, cooldown: 0, damage: 0 },
                1: { enabled: true, cooldown: 60000, damage: 5 }, // Cooldown in ms
                2: { enabled: true, cooldown: 50000, damage: 5 },
                3: { enabled: true, cooldown: 40000, damage: 5 },
                4: { enabled: true, cooldown: 30000, damage: 5 },
                5: { enabled: true, cooldown: 20000, damage: 5 }
            }
        },

        // DEFENSIVE UPGRADES
        primaryShields: {
            name: 'Primary Shields',
            description: 'Additional shield hit points',
            category: 'defensive',
            maxLevel: 5,
            costPerLevel: 8,
            levels: {
                0: { shields: 3 }, // Base shields
                1: { shields: 4 },
                2: { shields: 5 },
                3: { shields: 6 },
                4: { shields: 7 },
                5: { shields: 8 }
            }
        },

        pointDefense: {
            name: 'Point Defense Phasers',
            description: 'Destroys incoming enemy torpedoes',
            category: 'defensive',
            maxLevel: 5,
            costPerLevel: 12,
            levels: {
                0: { enabled: false, cooldown: 0 },
                1: { enabled: true, cooldown: 50000 }, // Cooldown in ms
                2: { enabled: true, cooldown: 40000 },
                3: { enabled: true, cooldown: 30000 },
                4: { enabled: true, cooldown: 20000 },
                5: { enabled: true, cooldown: 10000 }
            }
        },

        ablativeArmor: {
            name: 'Ablative Armor',
            description: 'Additional hull hit points',
            category: 'defensive',
            maxLevel: 5,
            costPerLevel: 10,
            levels: {
                0: { health: 3 }, // Base health
                1: { health: 4 },
                2: { health: 5 },
                3: { health: 6 },
                4: { health: 7 },
                5: { health: 8 }
            }
        },

        // MOVEMENT UPGRADES
        impulseEngines: {
            name: 'Impulse Engines',
            description: 'Increases ship speed',
            category: 'movement',
            maxLevel: 5,
            costPerLevel: 10,
            levels: {
                0: { speed: 200 }, // Base speed
                1: { speed: 220 },
                2: { speed: 240 },
                3: { speed: 260 },
                4: { speed: 280 },
                5: { speed: 300 }
            }
        }
    },

    // Helper function to get upgrade level stats
    getUpgradeStats(upgradeKey, level) {
        const upgrade = this.upgrades[upgradeKey]
        if (!upgrade) return null
        
        // Clamp level to valid range
        const clampedLevel = Math.max(0, Math.min(level, upgrade.maxLevel))
        return upgrade.levels[clampedLevel] || null
    },

    // Calculate cost to upgrade from current level to next
    getCostToUpgrade(upgradeKey, currentLevel) {
        const upgrade = this.upgrades[upgradeKey]
        if (!upgrade) return null
        if (currentLevel >= upgrade.maxLevel) return null // Already at max
        
        return upgrade.costPerLevel
    },

    // Get all upgrades for a category
    getUpgradesByCategory(category) {
        const categoryConfig = this.categories[category]
        if (!categoryConfig) return []
        
        return categoryConfig.upgrades.map(key => ({
            key,
            ...this.upgrades[key]
        }))
    }
}
