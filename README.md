# star-trek-adventures

Phaser.js framework, USS Defiant player ship (using a suitable free sprite like a compact federation-style from OpenGameArt packs), Level 1 Dominion enemies (small attack ships/fighters, larger warships/cruisers, massive battleships as escalating waves and end boss). Core Sky Force features including high-priority rescue mechanics (adapted as vulnerable Federation escape pods that spawn during waves, slowly drift toward a safe “home base” zone at the bottom; protect them from enemy fire for bonus score/multipliers—enemies prioritize targeting them). Waves ramp up in difficulty (more/faster enemies, mixed types). End with a massive Dominion battleship boss fight (multi-phase: shields, turrets, weak points). Basic sound effects (phaser fire, explosions from free packs). Touch controls: left joystick for movement, right fire button (auto-fire option). Auto-scaling for all resolutions (Phaser.Scale.FIT + dynamic HUD). Upgrades setup as modular (e.g., JSON config) for future levels but not fully implemented. Single-level MVP, extensible via scene configs.
Recommended Free Assets (placeholders can be simple shapes initially; replace with these CC0/royalty-free for prototype):
•  Ships:
	•  Player (Defiant-like): https://opengameart.org/content/top-down-spaceships or https://opengameart.org/content/2d-spaceships (pick compact saucer/nacelle style).
	•  Enemies (Dominion): https://opengameart.org/content/alien-spaceship-sprite-pack (buggy/angular aliens for small/medium/large).
•  Background: https://opengameart.org/content/seamless-space-backgrounds (seamless tiling space/nebulae).
•  Escape Pods: Use small ship from above or improvise circle sprite.
•  Sounds: https://opengameart.org/content/63-digital-sound-effects-lasers-phasers-space-etc (phasers/lasers for fire, explosions/zaps).
•  Load via Phaser preload; optimize with sprite atlases for mobile perf.