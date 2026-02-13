// Power-Up Configuration
// Configuration for power-ups and collectibles

const PowerUpConfig = {
    spawnChance: 0.15, // 15% chance to drop from destroyed enemies
    
    types: {
        shieldRestore: {
            name: 'Shield Restore',
            effect: 'restore_shields',
            amount: 50,
            duration: 0, // Instant effect
            color: 0x00FFFF,
            points: 50
        },
        fireUpgrade: {
            name: 'Fire Rate Upgrade',
            effect: 'increase_fire_rate',
            amount: 0.5, // 50% faster
            duration: 10000, // 10 seconds
            color: 0xFFFF00,
            points: 100
        },
        speedBoost: {
            name: 'Speed Boost',
            effect: 'increase_speed',
            amount: 1.5, // 50% faster movement
            duration: 8000, // 8 seconds
            color: 0x00FF00,
            points: 75
        },
        dilithium: {
            name: 'Dilithium Crystal',
            effect: 'score_multiplier',
            amount: 2.0, // 2x score multiplier
            duration: 15000, // 15 seconds
            color: 0xFF00FF,
            points: 200
        },
        tractorBeam: {
            name: 'Tractor Beam',
            effect: 'magnet',
            amount: 200, // Attraction radius
            duration: 10000, // 10 seconds
            color: 0x0088FF,
            points: 150
        }
    },
    
    size: { width: 24, height: 24 },
    speed: 100 // Drift downward
};
