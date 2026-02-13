# Star Trek Adventures

A vertical scrolling space shooter game inspired by Star Trek, built with Phaser 3. Command the USS Defiant against waves of Dominion forces in fast-paced arcade action.

## Play the Game

🎮 **[Play Star Trek Adventures](https://gw75g7fpxk-netizen.github.io/star-trek-adventures/)**

## Features

### Core Gameplay
- **Wave-based Combat**: Battle through increasingly difficult waves of enemy fighters, cruisers, and battleships
- **Boss Battles**: Multi-phase boss fight with shield generators, turrets, and vulnerable core mechanics
- **Rescue Missions**: Save Federation escape pods while defending them from enemy fire for bonus score multipliers
- **Power-ups**: Collect upgrades to enhance your ship's capabilities
- **Dynamic Difficulty**: Enemy waves scale in speed, quantity, and aggression

### Controls
- **Desktop**: WASD or Arrow keys for movement, Spacebar to fire
- **Mobile**: Virtual joystick for movement, dedicated fire button
- **Cheat Code**: Press 'B' to skip to boss fight (for testing)

### Technical Features
- Built with Phaser 3.80.1 game framework
- Responsive design that works on desktop and mobile
- Touch controls automatically hidden on desktop
- Procedural sound effects using Web Audio API
- Modular configuration system for easy balancing
- Auto-scaling for different screen resolutions (Phaser.Scale.FIT)

## Game Mechanics

### Player Ship (USS Defiant)
- Health and shield system
- Shield regeneration over time
- Invulnerability period after taking damage with visual feedback
- Upgradeable weapons and abilities via power-ups

### Enemies
- **Fighters**: Fast, light attack ships
- **Cruisers**: Medium warships with balanced stats
- **Battleships**: Heavy units with high health
- **Boss**: Massive Dominion battleship with three distinct phases

### Scoring System
- Points awarded for destroying enemies
- Score multiplier system tied to pod rescues
- Bonus points for completing waves

## Development

The game uses a modular architecture with separate configuration files:
- `gameConfig.js` - Core game settings
- `playerConfig.js` - Player ship stats
- `enemyConfig.js` - Enemy types and behaviors
- `waveConfig.js` - Wave progression
- `podConfig.js` - Escape pod mechanics
- `powerUpConfig.js` - Power-up system

### Project Structure
```
├── index.html          # Main HTML file
├── main.js             # Game initialization
├── phaser.min.js       # Phaser 3 framework
├── config/             # Game configuration files
│   ├── gameConfig.js
│   ├── playerConfig.js
│   ├── enemyConfig.js
│   ├── waveConfig.js
│   ├── podConfig.js
│   └── powerUpConfig.js
└── scenes/             # Game scenes
    ├── BootScene.js
    ├── PreloadScene.js
    ├── Level1Scene.js
    ├── GameOverScene.js
    └── VictoryScene.js
```

## Asset Credits

The game currently uses procedurally generated placeholder graphics. For production, consider these free asset resources:
- **Ships**: [OpenGameArt Top-Down Spaceships](https://opengameart.org/content/top-down-spaceships)
- **Backgrounds**: [Seamless Space Backgrounds](https://opengameart.org/content/seamless-space-backgrounds)
- **Sound Effects**: [Digital Sound Effects Pack](https://opengameart.org/content/63-digital-sound-effects-lasers-phasers-space-etc)

## Future Enhancements

- Additional levels with unique environments
- More enemy types and attack patterns
- Expanded power-up system
- Local high score persistence
- Full sprite replacements for production graphics
- Enhanced sound effects and background music

## License

See LICENSE file for details.
