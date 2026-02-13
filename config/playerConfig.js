// Player Configuration
// This file contains player stats and can be easily modified for game balancing

const PlayerConfig = {
    // USS Defiant Stats
    health: 30, // 3 hits at 10 damage each
    maxHealth: 30,
    shields: 50, // 5 hits at 10 damage each
    maxShields: 50,
    speed: 200,
    fireRate: 200, // milliseconds between shots
    
    // Weapon Configuration
    bulletSpeed: 400, // pixels per second (upward)
    
    // Starting position (will be calculated relative to screen size)
    startX: 0.5, // 50% of screen width
    startY: 0.75  // 75% of screen height (adjusted for mobile safe area)
};
