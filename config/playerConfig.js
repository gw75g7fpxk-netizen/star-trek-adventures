// Player Configuration
// This file contains player stats and can be easily modified for game balancing

const PlayerConfig = {
    // USS Aurora Stats
    health: 3, // 3 hits at 1 damage each
    maxHealth: 3,
    shields: 3, // 3 hits at 1 damage each
    maxShields: 3,
    speed: 200,
    fireRate: 250, // milliseconds between shots (reduced fire rate)
    
    // Weapon Configuration
    bulletSpeed: 400, // pixels per second (upward)
    
    // Visual Configuration
    scale: 0.0625, // Scale factor for player ship sprite (image is 468x960, scaled to ~60px tall)
    
    // Torpedo Configuration
    torpedoCooldown: 5000, // milliseconds between torpedo shots (5 seconds)
    torpedoDamage: 3,      // damage per torpedo hit
    sentinelTorpedoVolleyCount: 5, // Number of torpedoes the USS Sentinel fires per volley
    
    // Starting position (will be calculated relative to screen size)
    startX: 0.5, // 50% of screen width
    startY: 0.75  // 75% of screen height (adjusted for mobile safe area)
};
