# GitHub Copilot Instructions for Star Trek Adventures

## Project Overview

Star Trek Adventures is a vertical scrolling space shooter game built with Phaser 3. The player commands the USS Defiant against waves of Dominion forces in fast-paced arcade action. The game features wave-based combat, boss battles, rescue missions, power-ups, and responsive controls for both desktop and mobile.

## Tech Stack

- **Game Framework**: Phaser 3.80.1 (local file: `phaser.min.js`)
- **Language**: Vanilla JavaScript (ES6+)
- **Platform**: Browser-based (HTML5 Canvas/WebGL)
- **Physics**: Phaser Arcade Physics
- **Deployment**: GitHub Pages
- **No build tools**: Direct HTML/JS without bundlers

## Project Structure

```
├── index.html          # Main HTML entry point
├── main.js             # Game initialization and scene configuration
├── phaser.min.js       # Phaser 3 framework (DO NOT MODIFY)
├── config/             # Game configuration modules
│   ├── gameConfig.js       # Core game settings
│   ├── playerConfig.js     # Player ship stats
│   ├── enemyConfig.js      # Enemy types and behaviors
│   ├── waveConfig.js       # Wave progression
│   ├── podConfig.js        # Escape pod mechanics
│   └── powerUpConfig.js    # Power-up system
└── scenes/             # Phaser game scenes
    ├── BootScene.js        # System initialization
    ├── PreloadScene.js     # Asset loading
    ├── Level1Scene.js      # Main gameplay scene
    ├── GameOverScene.js    # Game over screen
    └── VictoryScene.js     # Victory screen
```

## Architecture Principles

### Modular Configuration System
- **All game values** (stats, speeds, damage, timings) must be externalized to appropriate config files
- **No magic numbers** in scene files - use config constants
- Config files use object literal exports with descriptive property names
- Easy game balancing without touching scene logic

### Scene Structure
- Scenes follow Phaser lifecycle: `init()` → `preload()` → `create()` → `update()`
- Keep scene files focused on game logic, not configuration
- Use Phaser's event system for communication between scenes
- Clean up resources in scene shutdown

### Code Organization
- One class or major system per file
- Clear separation of concerns: config, scenes, and core game systems
- Use consistent naming conventions (see below)

## Code Style and Conventions

### JavaScript Style
- Use `const` and `let`, never `var`
- Use ES6+ features: arrow functions, destructuring, template literals
- Use clear, descriptive variable and function names
- No semicolons required (project uses ASI - Automatic Semicolon Insertion)
- 4-space indentation (verify existing files for consistency)

### Naming Conventions
- **Files**: PascalCase for scenes (`Level1Scene.js`), camelCase for configs (`gameConfig.js`)
- **Classes**: PascalCase (`class Level1Scene extends Phaser.Scene`)
- **Constants/Configs**: PascalCase object names, camelCase properties (`PlayerConfig.maxHealth`)
- **Variables/Functions**: camelCase (`playerShip`, `handleCollision()`)
- **Scene Keys**: Lowercase with hyphens (`'boot-scene'`, `'level-1'`)

### Comments
- Use inline comments sparingly - code should be self-documenting
- Document complex algorithms or non-obvious game mechanics
- Include section headers in large files for organization
- Keep comments concise and up-to-date

### Phaser-Specific Patterns
- Use `this.add.sprite()` for visual elements
- Use `this.physics.add.sprite()` for physics-enabled objects
- Implement object pooling for bullets, enemies, particles
- Always cleanup event listeners and timers in scene shutdown
- Use groups for managing multiple similar objects

## Game Development Guidelines

### Performance
- Target 60 FPS on modern browsers
- Use object pooling for frequently created/destroyed objects (bullets, enemies)
- Limit particle effects and visual flourishes
- Clean up off-screen objects promptly
- Test on mobile devices for performance

### Responsive Design
- Game uses `Phaser.Scale.RESIZE` for responsive scaling
- Support desktop (800x600) and mobile (min 320x480)
- Touch controls should be hidden on desktop
- Ensure UI elements scale appropriately
- Test controls on both keyboard and touch

### Asset Management
- Use procedurally generated graphics for placeholders
- Assets should be loaded in `PreloadScene`
- Sound effects use Web Audio API (procedural)
- Keep asset files optimized and compressed

## Testing and Development

### How to Test
1. Open `index.html` in a web browser (or use local HTTP server)
2. For local server: `python -m http.server 8000` or `npx serve`
3. Test on desktop with keyboard controls (Arrow/WASD + Space)
4. Test on mobile device or DevTools mobile emulation
5. Verify responsive scaling on different resolutions

### Debugging
- Use browser DevTools console for debugging
- Enable Phaser debug mode: Set `physics.arcade.debug: true` in `gameConfig.js`
- Add console.log statements for game state tracking
- Use Phaser's built-in debugging overlays

### Cheat Codes
- Press 'B' during gameplay to skip to boss fight (testing only)

## Boundaries and Safety

### DO NOT Modify
- `phaser.min.js` - Never modify the Phaser library
- `LICENSE` file - Legal content
- `.gitignore` - Version control configuration
- Production deployment settings

### Security Requirements
- Never commit secrets, API keys, or credentials
- No eval() or Function() calls with user input
- Sanitize any user-generated content (high scores, names)
- Use HTTPS for any external resources

### Git Workflow
- Work in feature branches, not main
- Use descriptive commit messages: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep commits focused and atomic
- Test thoroughly before opening pull requests

## Common Tasks

### Adding a New Enemy Type
1. Add configuration to `config/enemyConfig.js`
2. Update enemy spawn logic in `Level1Scene.js`
3. Add collision detection if needed
4. Test with various wave configurations

### Adding a New Scene
1. Create new scene file in `scenes/` directory
2. Extend `Phaser.Scene` class
3. Add to scene list in `main.js`
4. Implement lifecycle methods: `init()`, `preload()`, `create()`, `update()`

### Balancing Game Difficulty
1. Modify values in appropriate config files (`enemyConfig.js`, `waveConfig.js`, etc.)
2. Test changes thoroughly
3. Avoid touching scene logic unless absolutely necessary

### Adding Mobile Controls
1. Create touch input handlers in relevant scene
2. Add visual touch controls (joystick, buttons)
3. Hide touch controls on desktop using media queries or JS detection
4. Test on actual mobile devices

## Deployment

- Game is deployed via GitHub Pages
- Any push to main triggers deployment automatically
- Test locally before pushing to main
- Ensure all assets load correctly on GitHub Pages

## Future Enhancement Ideas

See README.md for planned features:
- Additional levels with unique environments
- More enemy types and attack patterns
- Expanded power-up system
- Local high score persistence
- Full sprite replacements for production graphics
- Enhanced sound effects and background music

## Questions and Clarifications

When instructions are unclear or you need to make architectural decisions:
1. Check existing code patterns in similar files
2. Refer to Phaser 3 documentation: https://photonstorm.github.io/phaser3-docs/
3. Ask for clarification in PR comments or issues
4. Default to simpler, more maintainable solutions

## Review Checklist

Before submitting changes, ensure:
- [ ] Code follows project style conventions
- [ ] No magic numbers - values externalized to configs
- [ ] Tested on both desktop and mobile
- [ ] Performance is acceptable (60 FPS target)
- [ ] Scene cleanup prevents memory leaks
- [ ] Documentation updated if needed
- [ ] Commit messages are descriptive
- [ ] No console errors or warnings

---

**Remember**: This is a fun, arcade-style game. Keep the code clean, performant, and maintainable. Prioritize gameplay feel and player experience over complex features.
