# Lumen Path

![Lumen Path Banner](https://img.shields.io/badge/Three.js-Game-gold?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A calm, visually stunning 3D exploration game built with Three.js**

> *Explore floating islands suspended in the sky and restore light to the world by activating ancient beacons.*

## 🎮 Game Concept

**Genre:** Atmospheric exploration / puzzle  
**Vibe:** Journey + Monument Valley + indie web art  
**Session length:** 5–10 minutes

## ✨ Features

- **Beautiful Low-Poly 3D Graphics** with high-quality lighting
- **Atmospheric Post-Processing** including bloom effects and fog
- **Smooth Third-Person Camera** follow system
- **Interactive Beacons** - activate ancient light sources to restore the world
- **Dynamic World Reactions** - islands glow and light bridges appear as you progress
- **Procedural Audio** - ambient soundscapes and activation sound effects
- **Particle System** - floating dust particles for atmosphere
- **Responsive Controls** - WASD or Arrow keys for movement

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KillerCroc9/Lumen_Path.git
cd Lumen_Path
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in terminal)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## 🎯 How to Play

1. **Click "Begin Journey"** on the start screen
2. **Use WASD or Arrow Keys** to move your character
3. **Approach the glowing beacons** on each island
4. **Press E** when prompted to activate a beacon
5. **Watch as bridges of light** appear to connect the islands
6. **Activate all 5 beacons** to fully restore the world

## 🏗️ Technical Stack

- **Three.js** - 3D rendering engine
- **Vite** - Fast build tool and dev server
- **Web Audio API** - Procedural sound generation
- **Post-Processing:**
  - EffectComposer
  - UnrealBloomPass (for glow effects)
  - RenderPass

## 📁 Project Structure

```
Lumen_Path/
├── src/
│   ├── main.js          # Main game loop and scene setup
│   ├── player.js        # Player controller
│   ├── island.js        # Island generation
│   ├── beacon.js        # Beacon objects and activation
│   └── audio.js         # Audio manager
├── index.html           # Entry point
├── package.json         # Dependencies
└── README.md           # This file
```

## 🎨 Visual Style

- **Low-poly aesthetic** with clean geometry
- **Soft fog** for depth and atmosphere
- **Warm/cool color contrast** (golden beacons vs. cool islands)
- **Emissive materials** for natural glow
- **Bloom post-processing** for magical feel

## 🎵 Audio Design

- **Ambient pad** - Layered sine waves for atmosphere
- **Wind sounds** - Filtered noise for environmental feel
- **Beacon activation** - Harmonic chimes (C major triad)
- **Victory theme** - Chord progression on completion

## 🔧 Development Timeline

This MVP was built following a structured approach:

- **Day 1:** Scene setup, player movement, camera follow
- **Day 2:** Island creation, beacon interaction, lighting
- **Day 3:** Post-processing, particles, audio, polish
- **Day 4:** Performance optimization, documentation

## 🌟 Future Enhancements

- Day/night cycle
- Hidden secret island
- Procedural floating rocks
- Story elements told through symbols
- Mobile touch controls
- VR support
- Additional puzzles
- More islands and biomes

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by games like **Journey** and **Monument Valley**
- Built with the amazing [Three.js](https://threejs.org/) library
- Special thanks to the Three.js community

## 📧 Contact

Created by [@KillerCroc9](https://github.com/KillerCroc9)

---

**Enjoy your journey through the Lumen Path! ✨**
