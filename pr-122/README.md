# Star Trek Aurora

A vertical scrolling space shooter game inspired by Star Trek, built with Phaser 3. Command the USS Aurora against waves of Crystalis forces in fast-paced arcade action.

## Play the Game

🎮 **[Play Star Trek Aurora](https://gw75g7fpxk-netizen.github.io/star-trek-adventures/)**

## Features

### Core Gameplay
- **10 Mission Campaign**: Progress through a complete story-driven campaign across 10 unique missions
- **Wave-based Combat**: Battle through increasingly difficult waves of enemy fighters, cruisers, and battleships
- **Boss Battles**: Multi-phase boss fights with shield generators, turrets, and vulnerable core mechanics
- **Rescue Missions**: Save Federation escape pods while defending them from enemy fire for bonus score multipliers
- **Power-ups**: Collect upgrades to enhance your ship's capabilities
- **Dynamic Difficulty**: Enemy waves scale in speed, quantity, and aggression
- **Story Dialog System**: Cinematic communication sequences with crew members that advance the narrative
- **Mission Select**: Visual space route map showing all missions with progress tracking
- **Ship Upgrades**: Spend upgrade points earned from missions to enhance your ship (coming soon)

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

### Story & Campaign
The game features a complete 10-mission storyline where the USS Aurora encounters the mysterious Crystalis forces. Each mission builds on the previous one with:
- **Narrative Dialog**: Intro and outro communication sequences with your crew
- **Progressive Unlocking**: Complete missions to unlock the next in the campaign
- **Story Continuity**: Discover the truth about the Crystalline Entity and the Crystalis civilization
- **Save System**: Your progress is automatically saved via localStorage

### Menu System
- **Main Menu**: Choose between Mission Select and Ship Upgrades
- **Mission Select**: Visual space route map showing all 10 missions
  - Level nodes color-coded: Yellow (unlocked), Green (completed ★), Gray (locked 🔒)
  - Info panel displays mission details and completion stats
  - Must complete previous level to unlock next
- **Ship Upgrades**: Spend points earned from missions (coming soon)

### Player Ship (USS Aurora)
- Health and shield system
- Shield regeneration over time
- Invulnerability period after taking damage with visual feedback
- Upgradeable weapons and abilities via power-ups

### Enemies
- **Fighters**: Fast, light attack ships
- **Cruisers**: Medium warships with balanced stats
- **Battleships**: Heavy units with high health
- **Boss**: Massive Crystalis battleship with three distinct phases

### Scoring System
- Points awarded for destroying enemies
- Score multiplier system tied to pod rescues
- Bonus points for completing waves
- Upgrade points earned: 1 point per 100 score
- Progress saved between sessions via localStorage

## Development

The game uses a modular architecture with separate configuration files:
- `gameConfig.js` - Core game settings
- `playerConfig.js` - Player ship stats
- `enemyConfig.js` - Enemy types and behaviors
- `waveConfig.js` - Wave progression for all 10 levels
- `podConfig.js` - Escape pod mechanics
- `powerUpConfig.js` - Power-up system
- `progressConfig.js` - Level unlocks and save system
- `upgradesConfig.js` - Ship upgrade system (coming soon)
- `dialogConfig.js` - Story dialog and communications

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
│   ├── powerUpConfig.js
│   ├── progressConfig.js
│   ├── upgradesConfig.js
│   └── dialogConfig.js
└── scenes/             # Game scenes
    ├── BootScene.js
    ├── PreloadScene.js
    ├── MainMenuScene.js
    ├── LevelSelectScene.js
    ├── UpgradesScene.js
    ├── Level1Scene.js
    ├── GameOverScene.js
    └── VictoryScene.js
```

## Contributing & Testing

### PR Preview Deployments

This repository includes automated PR preview deployments! When you open a pull request:
- A preview deployment is automatically created at `https://gw75g7fpxk-netizen.github.io/star-trek-adventures/pr-{number}/`
- The GitHub Actions bot will comment on your PR with the preview link
- The preview updates automatically as you push new commits
- The preview is automatically cleaned up when the PR is closed or merged

This allows you to test changes in a live environment before merging to the main branch, without affecting the production site.

## Asset Credits

The game currently uses procedurally generated placeholder graphics. For production, consider these free asset resources:
- **Ships**: [OpenGameArt Top-Down Spaceships](https://opengameart.org/content/top-down-spaceships)
- **Backgrounds**: [Seamless Space Backgrounds](https://opengameart.org/content/seamless-space-backgrounds)
- **Sound Effects**: [Digital Sound Effects Pack](https://opengameart.org/content/63-digital-sound-effects-lasers-phasers-space-etc)

## Future Enhancements

- Complete wave content for levels 3-10 with unique challenges per storyline
- Implement ship upgrade system with purchasable enhancements using earned upgrade points
- Add more diverse enemy types and attack patterns
- Expand power-up variety and effects
- Full sprite replacements for production-quality graphics
- Enhanced sound effects and background music
- Multiplayer leaderboard system

## License

See LICENSE file for details.
