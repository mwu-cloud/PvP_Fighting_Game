# PVP Fighting Game - Design Summary
**Created by: Mina (11) & Ava**

## Core Gameplay
- 2D multiplayer fighting game (local split-keyboard)
- Players: P1 (Blue, WASD) vs P2 (Red, Arrows)
- Win condition: Reduce opponent to 0 HP
- Start HP: 100

## Controls
**Player 1:** WASD (move), S (attack), 1/2/3 (switch weapons), SPACE (ability)
**Player 2:** Arrows (move), Down (attack), 4/5/6 (switch weapons), ENTER (ability)

## Store/Progression System
- Start: $0, 1 random Tier 1 weapon, no ability
- Win battle: +$100
- Purchase options:
  - Mystery Box (random weapon): $100
  - Ability (random, replaces old): $200
  - Skins: $10 each
- Inventory: Unlimited weapons, select 3 for each battle
- Players keep weapons/coins between battles

## 5 Maps (Random Selection Each Battle)
1. **Normal** - Just platforms, no hazards
2. **Comet Field** - Falling comets (30 damage)
3. **Volcano** - Rising lava (starts at 50px, rises 100px every 20 sec, max 400px, 5 damage/frame)
4. **Ice** - Slippery platforms, very high middle platform drops 3-5 icicles every 2-3 seconds (1-20 damage each)
5. **Alien Invasion** - 5 spaceships with beams (hover at different heights, exit by pressing left/right), big crater in middle (instant death)

## Tiebreaker Minigame
- Triggers when both players hit 0 HP simultaneously
- Split screen dodge game
- Random objects fall (rocks, meteors, bombs, anvils)
- Starts slow, ramps up to 3+ objects/second after 10 seconds
- First hit loses, other wins $100

## Weapons (23 Total)
**Tier 1 (5-8 damage):**
- Sword (5, melee)
- Banana Sword (7, melee)
- Bow (8, ranged)
- Fish (5, melee)
- Water Gun (6, ranged)
- Snowball Launcher (7, ranged)

**Tier 2 (10-12 damage):**
- Sword (10, melee)
- Gun (12, ranged)
- Bow (15, ranged) *note: listed as T2 in code*
- Frying Pan (10, melee)
- Confetti Cannon (11, ranged)
- Boomerang (12, ranged)

**Tier 3 (15-18 damage):**
- Giant Lollipop (15, melee)
- Firework Launcher (17, ranged)

**Tier 4 (20-25 damage):**
- Lightsaber (22, melee)
- Chainsaw (23, melee)
- Bomb Thrower (24, ranged)

**Tier 5 (30+ damage):**
- Electric Guitar (32, melee) - shows lightning when attacking
- Bazooka (35, ranged)

Each weapon has unique visual design.

## Abilities (4 Types)
- **Invisibility** - 20% opacity, can't be hit (10 sec active, 10 sec cooldown)
- **Shield** - Blue bubble, blocks all damage (10 sec active, 10 sec cooldown)
- **Speed** - 2x movement speed (10 sec active, 10 sec cooldown)
- **Teleport** - Random safe location (10 sec active, 2 sec cooldown)

## Platform Design
- All platforms reachable (max 120 pixel vertical gaps)
- Different layouts per map type
- Ice map platforms are slippery (slide a few steps after stopping)

## Easter Egg (SECRET - Don't mention!)
- Trigger: Press G, G, G quickly
- 5 second cooldown between activations
- Random choice:
  1. Abominable Snowman holds sign "Mina is the Beast" - enters slowly, pauses 3 sec, exits slowly
  2. Yeti on snowboard with "DEFEATED" - rides across screen at speed 5
- Works on any screen (store, battle, minigame)
- Yeti design: Furry white/blue, red eyes, fangs, claws, muscular

## Technical Notes
- Canvas: 1200x700
- 60 FPS
- Jump strength: -15
- Gravity: 0.8
- Player speed: 5 (10 with speed ability)
- Player size: 40x60 (oval shaped with face)
- Attack cooldown: 1 second (60 frames)
- Simultaneous hits allowed

## Player Skins Available
**P1:** Default Blue, Purple, Teal, Orange
**P2:** Default Red, Dark Orange, Dark Red, Dark Purple

## Key Design Decisions
- One-question-at-a-time design methodology
- Start with weak weapons, build up collection
- Can replace abilities (not collect multiple)
- Tiebreaker instead of declaring tie
- Random map each battle for variety
- Slippery ice = slides after stopping, not while moving
