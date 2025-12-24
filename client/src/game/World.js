import { Platform } from "./Platform";

export class World {
  constructor() {
    this.gravity = 2000; // px/s²
    this.width = 3200;
    this.height = 1800;

    this.platforms = [
      // === STARTING AREA === 
      // Main ground
      new Platform(0, 1750, 400, 50),
      
      // First staircase up
      new Platform(350, 1650, 150, 20),
      new Platform(500, 1550, 150, 20),
      new Platform(650, 1450, 150, 20),
      
      // === MID SECTION - FLOATING ISLANDS ===
      // Island chain 1
      new Platform(850, 1450, 200, 20),
      new Platform(1100, 1400, 180, 20),
      new Platform(1330, 1450, 150, 20),
      
      // Drop down to lower path
      new Platform(1530, 1550, 200, 20),
      new Platform(1780, 1600, 250, 20),
      
      // === CHALLENGE SECTION - VERTICAL ===
      // Tower climb
      new Platform(2050, 1700, 200, 30),  // Base
      new Platform(2150, 1550, 120, 20),  // Step 1
      new Platform(2080, 1400, 120, 20),  // Step 2 (left)
      new Platform(2180, 1250, 120, 20),  // Step 3 (right)
      new Platform(2080, 1100, 150, 20),  // Step 4 (left)
      new Platform(2280, 950, 150, 20),   // Top platform
      
      // === HIGH PATH ===
      // Sky bridge
      new Platform(2480, 900, 200, 20),
      new Platform(2730, 950, 200, 20),
      new Platform(2950, 1000, 200, 20),
      
      // === RETURN PATH ===
      // Descending stairs back
      new Platform(2850, 1150, 150, 20),
      new Platform(2700, 1300, 150, 20),
      new Platform(2550, 1450, 150, 20),
      new Platform(2400, 1600, 150, 20),
      
      // === LOWER ALTERNATE PATH ===
      // Ground level continuation
      new Platform(600, 1750, 400, 50),
      new Platform(1100, 1750, 300, 50),
      new Platform(1500, 1750, 400, 50),
      
      // Shortcuts and platforms
      new Platform(250, 1550, 120, 20),
      new Platform(450, 1350, 120, 20),
      new Platform(1300, 1300, 150, 20),
      new Platform(1650, 1400, 120, 20),
      
      // Secret high platform
      new Platform(200, 1200, 180, 20),
      new Platform(50, 1050, 150, 20),
      
      // Walls (boundaries)
      new Platform(0, 0, 20, 1800),        // Left wall
      new Platform(3180, 0, 20, 1800),     // Right wall
    ];
  }
}

