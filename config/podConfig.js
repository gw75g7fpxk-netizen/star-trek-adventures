// Escape Pod Configuration
// Configuration for rescue pod mechanics

const PodConfig = {
    health: 3, // Takes 3 hits to destroy
    maxHealth: 3,
    speed: 30, // Slow drift downward
    spawnRate: 15000, // Spawn a pod every 15 seconds during waves
    spawnLevels: [2, 3, 6], // Levels where escape pods should spawn
    points: 500, // Bonus points for rescue
    multiplier: 1.5, // Score multiplier bonus
    size: { width: 10, height: 16 }, // Display size after scaling
    scale: 0.035, // Scale factor for sprite (279x461 -> ~10x16) - reduced by half
    safeZoneY: 0.9 // 90% down the screen = safe zone
};
