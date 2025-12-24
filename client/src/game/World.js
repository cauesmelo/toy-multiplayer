import { Platform } from "./Platform";

export class World {
  constructor() {
    this.gravity = 2000; // px/s²
    this.width = 3200;
    this.height = 1800;

    this.platforms = [
      // Ground floor sections
      new Platform(0, 1750, 800, 50),
      new Platform(900, 1750, 600, 50),
      new Platform(1600, 1750, 800, 50),
      new Platform(2500, 1750, 700, 50),

      // Lower platforms
      new Platform(200, 1620, 200, 20),
      new Platform(500, 1550, 150, 20),
      new Platform(750, 1480, 200, 20),
      new Platform(1100, 1620, 250, 20),
      new Platform(1450, 1550, 180, 20),
      new Platform(1750, 1620, 220, 20),
      new Platform(2050, 1550, 200, 20),
      new Platform(2350, 1620, 250, 20),
      new Platform(2700, 1550, 200, 20),

      // Mid platforms
      new Platform(150, 1350, 180, 20),
      new Platform(400, 1250, 200, 20),
      new Platform(700, 1180, 150, 20),
      new Platform(950, 1280, 200, 20),
      new Platform(1250, 1200, 180, 20),
      new Platform(1500, 1320, 220, 20),
      new Platform(1800, 1220, 200, 20),
      new Platform(2100, 1300, 250, 20),
      new Platform(2450, 1200, 180, 20),
      new Platform(2750, 1280, 200, 20),

      // High platforms
      new Platform(250, 1050, 150, 20),
      new Platform(500, 950, 180, 20),
      new Platform(800, 880, 200, 20),
      new Platform(1100, 1000, 150, 20),
      new Platform(1350, 920, 200, 20),
      new Platform(1650, 1050, 180, 20),
      new Platform(1950, 950, 200, 20),
      new Platform(2250, 880, 220, 20),
      new Platform(2600, 1000, 180, 20),

      // Top platforms
      new Platform(400, 750, 200, 20),
      new Platform(750, 650, 150, 20),
      new Platform(1050, 750, 180, 20),
      new Platform(1400, 680, 200, 20),
      new Platform(1750, 750, 220, 20),
      new Platform(2100, 680, 200, 20),
      new Platform(2450, 750, 180, 20),

      // Walls (optional - for boundaries)
      new Platform(0, 0, 20, 1800),        // Left wall
      new Platform(3180, 0, 20, 1800),     // Right wall
    ];
  }
}

