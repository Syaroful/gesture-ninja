# Gesture Ninja 🥷

A Fruit Ninja-style browser game where you slice fruits with hand gestures!

![Preview](https://via.placeholder.com/800x400/0a0a0f/00f3ff?text=Gesture+Ninja)

## How to Play

1. Click **START GAME**
2. Allow camera access when prompted
3. **Slice fruits** with hand movements to score points!
4. **Avoid bombs** 💣 - they cost lives!
5. Build **combos** by slicing multiple fruits in one slash

## Controls

- **Hand Movement** - Slice! Move your hand across the screen to cut objects
- The faster you move, the better the slice

## Object Types

| Object | Points | Effect |
|--------|--------|--------|
| 🍎 Apple | 10 | +10 points |
| 🍉 Watermelon | 10 | +10 points |
| 🍊 Orange | 10 | +10 points |
| 🍍 Pineapple | 10 | +10 points |
| ⭐ Golden Fruit | 50 | +50 points |
| ❄️ Freeze Fruit | 20 | +20 points |
| 💣 Bomb | -1 life | Game over if lives = 0 |

## Features

- Real-time hand tracking with MediaPipe
- Slash trail visualization
- Juice particle effects
- Screen shake on bomb hits
- Combo system
- High score persistence (localStorage)
- Progressive difficulty

## Tech Stack

- **Three.js** - WebGL rendering
- **MediaPipe Hands** - Hand tracking
- **TypeScript** - Type safety
- **Vite** - Build tool

## Run Locally

```bash
cd gesture-ninja
npm install
npm run dev
```

Open http://localhost:3001

## Project Structure

```
src/
├── main.ts              # Entry point
├── game/
│   ├── GameLoop.ts      # 60 FPS game loop
│   └── GameState.ts     # State management
├── entities/
│   ├── GameObject.ts    # Base entity
│   ├── Fruit.ts         # Fruit types
│   ├── Bomb.ts          # Bomb entity
│   └── SlashTrail.ts   # Hand trail effect
├── systems/
│   ├── SpawnSystem.ts   # Object spawning
│   ├── CollisionSystem.ts # Slash detection
│   └── ParticleSystem.ts  # Juice effects
```

## Tips

- Slice multiple fruits in one motion for combo bonuses!
- Golden fruits appear randomly - catch them!
- Bombs get more frequent as difficulty increases

---

Built with 🗡️ using Three.js + MediaPipe
