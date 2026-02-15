// Escape Pod Configuration
// Configuration for rescue pod mechanics

const PodConfig = {
    health: 3, // Takes 3 hits to destroy
    maxHealth: 3,
    speed: 30, // Slow drift downward
    spawnRate: 15000, // Spawn a pod every 15 seconds during waves
    points: 500, // Bonus points for rescue
    multiplier: 1.5, // Score multiplier bonus
    size: { width: 20, height: 20 },
    scale: 0.07, // Scale factor for sprite (279x461 -> ~20x32)
    safeZoneY: 0.9, // 90% down the screen = safe zone
    flashRate: 500 // Flash every 500ms for visual cue
};
