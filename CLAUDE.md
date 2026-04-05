# Mina's PVP Game - Claude Notes
# Read this at the start of every new session!

---

## Instructions for Claude

**At the end of every session, update this file before closing.**
Specifically, update:
- "Known Issues / TODO" if any bugs were fixed or new ones found
- "File Structure" if any new files were added
- "How the Game Works" if any features changed
- "Mina's Additions" if Mina added or requested something new
- Any section that is now out of date

Do this automatically — don't wait to be asked.

---

## The Project

Mina (11 years old) and her dad are building a PVP fighting game.
- The game itself is HTML5/JavaScript (canvas-based)
- The server is Python/Flask with Flask-SocketIO for multiplayer
- Deployed at: https://mina.burtonair.com
- GitHub repo: mwu-cloud/PvP_Fighting_Game
- Local dev: run `python app.py` then open http://localhost:5050
- Routes: `/` = landing page, `/game` = local 2-player, `/multiplayer` = online lobby

---

## File Structure

```
/Users/QueenMina/PVP Game/
├── app.py               # Python Flask server (multiplayer backend)
├── game_data.py         # All game data: weapons, maps, abilities, etc.
├── game_engine.js       # Shared JS engine: Player, Platform, hazards, drawing — loaded by multiplayer_game.html
├── disco_logo.js        # Shared disco ball + cute yeti drawing (used by index.html and multiplayer.html)
├── index.html           # Landing page - choose Local or Online mode
├── game.html            # Local 2-player game (same keyboard, main game)
├── multiplayer.html     # Online multiplayer lobby + store
├── multiplayer_game.html# Online battle page (now uses game_engine.js)
├── requirements.txt     # flask, flask-socketio, gunicorn, gevent, gevent-websocket, eventlet
├── render.yaml          # Render deployment config
└── CLAUDE.md            # This file - auto-read by Claude Code each session
```

---

## How the Game Works

### Local 2-Player (game.html)
- Two players share one keyboard
- P1: WASD to move, S to attack, 1/2/3 for weapons, SPACE for ability, CMD to toggle pet sit/stand
- P2: Arrow keys to move, Down to attack, 8/9/0 for weapons, ENTER for ability, Right Ctrl to toggle pet sit/stand
- Both players pick weapons from a store before the battle starts
- **Game mode selector** in the store: ⚔️ Normal, 🏔️ King of the Hill, or 🐾 Pet Battle
- Fight until one player's HP hits 0
- Easter egg: press G, G, G quickly — a Yeti walks across the screen (now with cute blue eyes!)
- Tiebreaker minigame: if both players hit 0 HP at once, dodge falling objects

### King of the Hill Mode
- A glowing zone with a 👑 crown appears in the center of the map
- Stand on it alone to fill your progress bar — if both players are on it, nobody scores
- First to hold it for **10 seconds total** wins
- Dying still ends the game — combat matters!
- Progress bars shown above the hill zone; countdown shown in HUD
- Works on all 6 maps with all weapons, abilities, pets, and spells

### Online Multiplayer (multiplayer.html → multiplayer_game.html)
- Player 1 creates a room, gets a 6-character code (e.g. "ABC123")
- Player 2 enters the code to join
- Both click "I'M READY" → random map is chosen → battle starts
- Each player is on their own device/screen
- Winner gets 100 coins, redirected back to lobby with ?reward=100
- Graphics match the local game: oval-body characters, full weapon art, proper terrain backgrounds
- All 6 maps available including Breakable Cubes (acid floor, cubes break after 1s and reform after 1s)
- Players now have ice sliding, spin jumps, duck slides, and attack recoil (same as local game)
- No starting ability — must buy one from the store

### Town Hub (game.html — local game only)
- When you open the local game, you start in a **top-down split-screen island town**
- Left half = Player 1's view (WASD to walk), Right half = Player 2's view (Arrow keys)
- The island has: a store house, battle arena, KOTH hill, pet arena, witch race track, spell duel house — plus a **Prep Hut** next to each battle station
- Walk up to a building and press **SPACE (P1) or ENTER (P2)** to interact
- **Store building** — either player can enter alone; shows a half-screen store overlay on their side
- **Prep Huts** — both players walk into the same hut → weapon selection screen appears → battle starts when both are ready
- **Large buildings (Arena, Track, Hill)** — have enlarged entrance zones (full bounding box + 40px padding) so it's easy to trigger
- **"Go to Store" buttons** in the bottom corners are shortcuts
- **"Back to Town" button** in the store screen returns both players to the town
- After a battle ends, players return to the town (walkers reset to starting positions)
- Town world is 2400×1600 pixels — larger than the 1200×700 viewport, so it scrolls
- Pixel-art style: grass, cobblestone paths, trees, rocks, lampposts, beach + water
- Each main station has a decorative building (arena, oval track, grassy hill, houses) PLUS a small thatched-roof **Prep Hut** next to it
- Huts glow with a colored outline when a player is standing inside their entrance zone

#### Town Hub — Buildings Layout (TOWN_BUILDINGS array)
| id | label | mode | position | notes |
|----|-------|------|----------|-------|
| store | STORE | — | (200, 200) | Standard house, gold roof |
| clothes | CLOTHES SHOP | — | (600, 200) | Pink boutique (isClothes); buy skins |
| normal_arena | BATTLE ARENA | — | (180, 580) | Decorative arena (isArena), red |
| normal | PREP HUT ⚔️ | normal | (420, 620) | isHut; enter to pick weapons |
| koth | KING OF HILL | — | (2050, 260) | Grassy hill ellipse (isHill) |
| koth_hut | PREP HUT 👑 | koth | (2280, 290) | isHut; green hut |
| petbattle_arena | PET ARENA | — | (1060, 660) | Circular arena (isArena), purple |
| petbattle | PREP HUT 🐾 | petbattle | (1380, 700) | isHut; purple hut |
| witch_track | RACE TRACK | — | (900, 1370) | Oval racetrack (isTrack) |
| witch | PREP HUT 🧹 | witch_duel | (1340, 1370) | isHut; blue hut |
| spell_house | SPELL HOUSE | — | (1780, 580) | Standard house, purple |
| spell | PREP HUT 🔮 | spell_duel | (1990, 620) | isHut; dark purple hut |

`const HUT_IDS = new Set(...)` — fast Set of all hut ids for quick lookup.

#### Town Hub — Key State Variables
- `inTown` (on gameState) — true when town is active; gameLoop skips all battle logic
- `townLoopRunning` — prevents stacked rAF loops; reset to false in showTown() before calling townLoop()
- `townWalkers` — `{ p1: { x, y, facing, walkFrame, walkTimer, inBuilding }, p2: {...} }`
- `townCam` — `{ p1: { x, y }, p2: { x, y } }` — each camera clamped to world bounds (2400×1600)
- `townStorePlayer` — which player ('p1'/'p2') opened the store overlay; null when closed
- `townInteractingPlayer` — tracks which player last pressed SPACE/ENTER
- `hutState` — null when not in a hut; `{ mode, needsWeapons, p1Ready, p2Ready, p1Cursor, p2Cursor, launching }` when inside

#### Town Hub — Key Functions
- `townLoop()` — rAF loop: updateTownWalkers → updateTownCamera → draw both halves → draw divider → draw tooltips → draw prompt. Calls `drawHutInterior()` on top when hutState is active.
- `showTown()` — resets walker positions to (320,450)/(400,450), hides all other screens, sets inTown=true, starts townLoop
- `showStoreFromTown(player)` — shows `#storeOverlay` as a half-screen panel (left for p1, right for p2); town canvas keeps running behind it
- `showClothesShopFromTown(player)` — reuses `#storeOverlay` for the clothes shop; sets title to "CLOTHES SHOP" and renders costume tiers
- `renderClothesShopOverlay(pk)` — builds HTML for 3 costume tiers (T1 $150, T2 $400, T3 $800); shows price diff / refund; "Default" button to remove costume
- `closeTownStore()` — hides storeOverlay, resumes normal town
- `checkTownInteraction()` — called ONLY from keydown (SPACE=p1, ENTER=p2), never per-frame; detects inBuilding matches and routes to store or enterHut
- `buildingEntranceRect(b)` — returns entrance zone; isTrack/isArena/isHill get full bbox+40px, huts/houses get a 80×60 door zone at bottom center
- `enterHut(mode)` — validates both players are in the same hut, inits hutState, clears prior weapon selections
- `drawHutInterior()` — draws full 1200×700 canvas weapon-select screen over the town; each player picks up to 3 weapons from the owned list
- `drawHutPlayerHalf(ctx, pk, offsetX, halfW, H)` — each player's 600px half: weapon list with cursor, READY button, instructions
- `hutKeyPress(player)` — toggle weapon at cursor position (SPACE=p1, ENTER=p2)
- `hutCursorMove(player, dir)` — move cursor up/down (W/S for p1, ArrowUp/ArrowDown for p2)
- `hutMarkReady(player)` — mark player ready; auto-selects a weapon if none chosen; when BOTH ready → launchFromHut()
- `hutLeave()` — clears hutState; called on Escape
- `launchFromHut()` — clears hutState, calls startBattle()
- `startGameModeFromTown(mode)` — now just calls `enterHut(mode)`
- `refreshStoreUI(player)` — routes to `renderTownStoreOverlay()` if in town, or `updateStoreUI()` if in full store

#### Town Hub — Store Overlay
- `#storeOverlay` — absolutely-positioned HTML div, 600px wide, sits on top of town canvas
- `.p1-side` class → left:0 (left half); `.p2-side` → right:0 (right half)
- Town canvas + loop keep running behind it — the walker can still be seen on the other half
- All buy functions (`buyMysteryBox`, `buyAbility`, `buyWand`, `buyPet`, `buyCostume`) call `refreshStoreUI(player)` instead of `updateStoreUI()` so the overlay updates correctly

#### Town Hub — NPC Houses (added this session)
- 4 new town houses scattered across the island, each with a unique NPC inside
- **Baker's House** 🍞 (840, 200) — Brioche the Baker (chef hat, bread shelf, oven decor)
- **Scholar's Tower** 📚 (1560, 220) — Aldric the Scholar (wizard hat, tall stone tower with 3 arched windows, bookshelf + globe inside)
- **Pirate's Den** ☠️ (420, 1050) — Captain Rox the Pirate (tricorn hat, treasure chest + map decor)
- **Knight's Hall** 🛡️ (1700, 850) — Sir Pummel the Knight (metal helmet w/ plume, sword + shield on wall)
- Each house has `isNpcHouse: true` and a `npc` object with name, job, bodyColor, hatType, and 4 lines of dialogue
- Either player can enter a house alone (SPACE for P1, ENTER for P2)
- Interior draws: dimmed room panel, colored back wall, floor planks, center window with curtains, 2 flickering torches, house-specific decor on walls, large NPC character, speech bubble with dialogue, visitor character
- SPACE/ENTER cycles through 4 dialogue lines (loops). ESC leaves the house.
- Walker movement is frozen while inside an NPC house (same as hut)
- Scholar's Tower uses `isTower: true` — drawn as a tall stone tower with battlements, flag, conical roof, arched windows
- NPC heads peek out of windows on the town map as a visual hint
- Extra trees, rocks, and lampposts added near all 4 new houses for atmosphere
- `npcHouseState` — null or `{ player, houseId, npc, lineIndex, lineTimer }`
- `enterNpcHouse(player, building)`, `leaveNpcHouse()`, `npcHouseAdvance()` — state management
- `drawNpcHouseInterior()` — main room scene renderer (uses `tctx`)
- `drawNpcCharacter(ctx, npc, cx, cy)` — draws NPC with hat type (chef/wizard/pirate/knight)
- `drawNpcSpeechBubble(ctx, cx, topY, text)` — rounded bubble with tail pointing down toward NPC
- `drawNpcHouseDecor(ctx, b, rx, ry, rw, rh)` — house-specific wall decorations
- `drawTownTorch(ctx, tx, ty)` — flickering animated torch (shared with hut; now defined earlier)
- `buildingEntranceRect` updated to allow `isNpcHouse` buildings (previously only store/clothes/huts)
- Tooltip updated: shows "[PRESS SPACE(P1) or ENTER(P2) to visit <NPC name>!]" when near a house

#### Town Hub — Bugs Fixed This Session
- Store was covering town → replaced full-screen store with half-screen storeOverlay div
- "Back to Town" not working → townLoopRunning flag reset in showTown() before calling townLoop()
- checkTownInteraction firing every frame → moved to keydown handler only
- Witch race/arena entrance zones too small → buildingEntranceRect enlarged for isTrack/isArena/isHill
- KOTH hill drawn upside-down → changed ellipse arc anticlockwise from true → false
- Game not starting when both in zone → replaced two-step confirm with hut interior system
- Repeat game bug (walkers still in building after battle) → showTown() resets walker positions

### Store (multiplayer.html and game.html)
- Coins stored in localStorage (key: mp_coins), start with 200
- Mystery Box: 100 coins → random weapon (tier 1-5, weighted toward lower tiers)
- Random Ability: 200 coins → one of 4 abilities
- **Magic Wand: 300 coins → one-time-use wand with a random spell (see Spells below)**
- **Pet: 600 coins → a random pet companion that fights alongside you (see Pets below)**
- Weapons stored in localStorage (key: mp_weapons)
- Ability stored in localStorage (key: mp_ability)
- Wand stored in localStorage (key: mp_wand)
- Before a battle starts, inventory is saved to mp_game_weapons / mp_game_ability
- localStorage is cleared after each game so old ability values don't carry over

---

## Maps (6 total, chosen randomly for online, selectable locally)

1. **Normal** - Plain platforms, no hazards
2. **Comet Field** - Comets fall from the sky (30 damage each)
3. **Volcano** - Rising lava, get to high ground. Players spawn high up.
4. **Ice** - VERY slippery platforms (slide forever!), icicles fall from the high middle platform
5. **Alien Invasion** - Spaceships beam you up, crater in the middle = instant death
6. **Breakable Cubes** - Platforms made of breakable cubes (break after 1s, reform after 1s), acid floor = instant death. Players spawn high up.

---

## Weapons (by tier)

- Tier 1 (5-8 dmg): Sword, Banana Sword, Bow, Fish, Water Gun, Snowball Launcher
- Tier 2 (10-15 dmg): Sword, Gun, Bow, Frying Pan, Confetti Cannon, Boomerang
- Tier 3 (15-17 dmg): Giant Lollipop, Firework Launcher
- Tier 4 (20-24 dmg): Disco Ball (Mina's weapon!), Lightsaber, Chainsaw, Bomb Thrower
- Tier 5 (32-35 dmg): Electric Guitar, Bazooka

Mystery box odds: 40% T1, 30% T2, 15% T3, 10% T4, 5% T5

---

## Abilities (4 total)

- **Shield** - Blocks all damage for 10s
- **Speed** - 2x movement speed for 10s
- **Invisibility** - 20% visible for 10s
- **Teleport** - Random safe position, 2s cooldown, 10s duration

Note: game_engine.js stores ability names in lowercase ('shield', 'speed', 'invisibility', 'teleport').
The store saves them in Title Case — conversion happens in initGame().

---

## Magic Wand Spells (4 spells, randomly assigned on purchase)

Cost: **300 coins** in both local store and multiplayer lobby. One-time use — consumed on cast.
Equip it like any weapon (1/2/3 or 4/5/6), then press attack. Spell fires mid-swing.

- **Blast** 💥 — Launches enemy toward the nearest wall (velX=22, velY=-10), deals 25 HP. Enemy bounces off.
- **Freeze** ❄️ — Freezes enemy completely for 5 seconds (300 frames). They can't move at all; gravity still applies. Can hit them repeatedly while frozen.
- **Fire Ring** 🔥 — 8 orbiting fireballs surround the *caster* for 10 seconds. Anyone walking into the ring takes ~2 dmg/frame every 4 frames (~30 dmg/sec). Only jumping over it escapes.
- **Rainstorm** ⛈️ — Storm clouds follow the *target* (enemy). Zaps them for 8 dmg every 40 frames (12 dmg/sec) for 10 seconds. Enemy slows to half-speed in the rain.
- **Animation** 🌀 — Effect depends on the current map:
  - Alien Invasion: Black hole appears center-screen, sucks enemy in for instant kill
  - Comet Field: All comets home in and chase the enemy
  - Ice: All icicles steer toward the enemy
  - Volcano: Lava surges up super fast
  - Breakable Cubes: All cubes instantly shatter (enemy falls into acid)
  - Normal: Barrage of 10 comets rains down on the enemy
  - Admin-only spell (use `add wand animation` in admin panel)

Spell state lives on `player.spellEffect = { type, timer, ... }`.
Status check methods: `player.isFrozen()`, `player.hasFireRing()`, `player.isInRainstorm()`.
Wand drawing in `drawWeapon()`: purple wand, colored star tip + glow based on spell type.
Spell visuals drawn in `player.drawSpellEffects()`: ice overlay, orbiting flames, rain clouds + lightning.
Spell logic: `castWandSpell(caster, target)`, `applySpell(spell, caster, target)`, `updateSpellEffects(player, otherPlayer)` — called from gameLoop each frame.

---

## Pets (local game only so far)

Cost: **600 coins** in the local store. Persists between games until it dies in battle.

- **3 tiers** (60% T1, 30% T2, 10% T3)
- **Tier 1** (5 dmg): Dog, Rabbit, Sparrow, Cat
- **Tier 2** (10 dmg): Dog, Cat, Squirrel, Bear
- **Tier 3** (20 dmg): Phoenix, Dragon, Griffin

### How pets work:
- Pet spawns next to its owner at the start of battle
- Automatically runs toward the enemy and attacks every 1.5 seconds
- Has 50 HP — if it dies in battle, it comes back next battle with full HP (never permanently lost)
- If the owner dies, the pet dies too (but comes back next battle)
- Press **CMD** (P1) or **Right Ctrl** (P2) to toggle the pet between sit (idle) and stand (fighting)
- Pet health shown in the HUD and above the pet with a colored health bar
- Each pet has unique drawn art: quadrupeds (Dog, Cat, Squirrel), Rabbit, Bird (Sparrow, Phoenix, Griffin), Bear, Dragon

### Pet class structure:
- `new Pet(petData, owner, ownerKey)` — created in `initializeGame()` as `gameState.pet1` / `gameState.pet2`
- `pet.update(enemy, platforms)` — AI movement, gravity, platform landing, attack logic
- `pet.draw()` — health bar, name/tier, sitting indicator, custom art per species
- `pet.takeDamage(amount)` — flash red, reduce HP, set `alive = false` if HP ≤ 0
- `pet.sit()` / `pet.stand()` — toggle sitting state
- Pet survival synced in `returnToStore()`: dead pet → `playerData.pX.pet = null`

---

## Deployment

### Primary: Digital Ocean (mina.burtonair.com) — ACTIVE
- **URL**: https://mina.burtonair.com
- **Server**: Digital Ocean droplet at 104.131.42.200 (user: deploy)
- **Game files**: `/home/deploy/pvp-game/`
- **Start command**: `gunicorn --worker-class eventlet -w 1 --bind 127.0.0.1:5050 app:app`
- **Service**: runs as systemd service `pvp-game` (auto-starts on reboot)
- **Nginx**: proxies mina.burtonair.com → port 5050, with WebSocket upgrade support
- **HTTPS**: Let's Encrypt cert (auto-renews, expires 2026-05-30)
- **Python version**: 3.12.3

#### To deploy updates:
1. Make changes locally
2. Run: `rsync -avz -e ssh app.py game_data.py game_engine.js game.html multiplayer.html multiplayer_game.html requirements.txt droplet:~/pvp-game/`
3. Run: `ssh droplet "sudo systemctl restart pvp-game"`

#### Useful commands on droplet:
- Check status: `ssh droplet "sudo systemctl status pvp-game"`
- View logs: `ssh droplet "sudo journalctl -u pvp-game -n 50"`
- Restart server: `ssh droplet "sudo systemctl restart pvp-game"`

### SSH Access
- Key: ~/.ssh/id_ed25519_droplet
- Config: ~/.ssh/config has `Host droplet` entry
- Test with: `ssh droplet "whoami"` → should print `deploy`

### Backup: Render (may still be running)
- URL: https://pvp-fighting-game.onrender.com
- Had WebSocket timeout issues on free tier — replaced by Digital Ocean

---

## Git Workflow

Mina uses **GitHub Desktop** (not command line) to commit and push.
Steps:
1. Check boxes next to changed files in GitHub Desktop
2. Write a commit message
3. Click "Commit to main"
4. Click "Push origin"

---

## Known Issues / TODO

13. **Combo attack system** ✅
    - Press attack rapidly (within 0.75s) to chain a combo — each hit increments the combo counter
    - +20% bonus damage per extra hit (2x = 1.2x dmg, 3x = 1.4x, etc.)
    - 4+ hit combo launches the enemy flying (velX=18, velY=-10)
    - Getting hit breaks your combo
    - Attack cooldown reduced from 60 frames (1s) to 15 frames (0.25s) for fast chaining
    - Combo animations change by tier: 1x = normal arc, 2–4x = wide slash (100° sweep + yellow trails), 5–9x = straight jab (lunge + speed lines), 10x+ = downward strike (slam from above + shockwave ring)
    - Floating combo popup above attacker: white text, turns gold + glowing at 4x+

1. **game_engine.js now wired into multiplayer_game.html** ✅
   - Duplicate class conflict fixed: multiplayer's Projectile renamed to MPProjectile
   - Both games now share: Player, Platform, Comet, Icicle, BreakableCube, Spaceship, drawBackground
   - game_engine.js is served via /game_engine.js route in app.py
   - game.html still has its own duplicate classes — wiring it up is a future task

2. **Multiplayer spin jump + duck sync fixed** ✅
   - `isSpinJumping`, `spinAngle`, and `isDucking` were missing from `getState()` / `updatePuppet()` in game_engine.js
   - Opponent's screen never saw the spin jump animation on the Ice map
   - Fixed by adding all three fields to the network state packet

3. **Multiplayer hazard syncing fully fixed** ✅
   - Player 1 is authority for all hazard spawning (comets, icicles)
   - Comets and icicles have unique IDs — when one hits a player, a hazard_remove event
     is sent so both screens remove the same hazard
   - Breakable cube state (break/reform timers) broadcast from Player 1 every 3 frames
   - Volcano/Breakable Cubes spawn positions fixed (players spawn at y=200, not in lava/acid)

3. **No starting ability** ✅ - Players start with nothing, must buy from store.
   localStorage cleared after each game.

4. **Ice map platforms fixed** ✅ - game_data.py now has correct platform layout.

5. **Multiplayer now has full movement physics** ✅
   - Ice sliding, spin jumps, duck slides, attack recoil all work in multiplayer
   - Shared via game_engine.js Player.move()

6. **Cute yeti + shared disco logo** ✅
   - Created `disco_logo.js` with shared `drawDiscoBall()`, `drawYeti()`, `drawBeams()`, `makeBeams()`
   - Both index.html and multiplayer.html now load it via `<script src="/disco_logo.js">` instead of duplicate inline code
   - Edit the yeti or disco ball in one place → both pages update automatically
   - Yeti redesigned: chibi/round style, big oval blue eyes, big happy smile, rosy cheeks, fluffy ear puffs
   - G-G-G easter egg (game.html): was broken due to undefined `drawFur` — FIXED (changed to `drawFluffyFur`)

7. **Pet bugs + freeze bug fully fixed** ✅
   - **Wrong property name:** Pet's `_landOnFloorOrPlatform` was checking `cube.broken` (always `undefined`) instead of `cube.isBroken` — fixed
   - **Long-range hit bug:** Pet attack only checked horizontal distance (`distX`), ignoring vertical. Pet could deal damage from a platform above/below. Now checks both X and Y distance before attacking
   - **Canvas state leak:** `drawWeapon()` wasn't wrapped in `ctx.save()/restore()`, so `shadowBlur` set by Lightsaber/Magic Wand could leak and make all subsequent drawing very slow. Now wrapped with safety reset
   - **try-catch in gameLoop:** Any JS error now logs to browser console instead of silently killing the game loop
   - **Yeti ctx swap fixed:** `globalAnimationLoop` swaps `window.ctx` to an overlay canvas for the Yeti easter egg in the store. Fixed with `try/finally` to guarantee `ctx` is always restored.
   - **Stale setTimeout protection:** `showGameOver` now tracks its timeout ID; `startBattle` cancels any pending timeout from the previous game so it can't fire mid-game and call `returnToStore` unexpectedly.
   - **gameLoop started at page load:** `gameLoop()` is now called once at page load (next to `globalAnimationLoop()`). Guards inside the try block skip logic while inStore but always reschedule rAF — the loop never dies.
   - **ROOT CAUSE OF FREEZE FOUND AND FIXED:** `Pet` class was missing `isInvisible()` and `hasShield()` methods. When a comet or icicle hit a pet on the Comet Field or Ice map, `checkHit()` called `pet.isInvisible()` which crashed every frame. The try/catch kept the loop alive but `ctx.clearRect` never ran so the last frame stayed frozen. Fixed by adding `isInvisible: () => false` and `hasShield: () => false` to the Pet constructor.
   - **Debug frame counter:** Removed from normal display. The div is still in the DOM (hidden) and will show if the game crashes, but won't appear during normal play.

8. **Pet jump + damage bugs fixed** ✅
   - **Dumb jumping:** Pets only jumped when the enemy was directly above. Now they also jump when a platform is blocking their horizontal path, so they can navigate multi-level maps correctly.
   - **Invincible pets:** Player melee attacks and projectiles never checked if they hit a pet. Added pet hit checks: melee (player1 can hit pet2, player2 can hit pet1) and projectiles (any projectile can now hit the opposing team's pet).

9. **No persistent accounts** - Player data only lives in localStorage.
   Good future project: save to a JSON file or database on the server.

8. **Multiplayer store not wired to server** - Store uses localStorage only.

9. **game.html not yet using game_engine.js** - game.html still has its own duplicate
   class definitions. Future task: wire up game_engine.js to game.html too and remove
   the duplicates.

10. **Pet Battle mode** ✅
    - Arena with crowd, players sit in stands, pets are player-controlled
    - SPACE/ENTER/S/ArrowDown = attack anytime (short rate limiter); when special cooldown hits 0, next press fires special instead
    - Sparrow feather shoots straight forward
    - Cat has passive 2x speed + 1.7x jump (no button needed)
    - Simultaneous pet death → tiebreaker minigame
    - Flying pets (Phoenix, Dragon, Griffin, Sparrow) knocked to ground for 3s when HP < 25
      - `pb.pet1GroundedTimer` / `pb.pet2GroundedTimer` (180 frames = 3s)
      - `pb.pet1GroundedTriggered` / `pb.pet2GroundedTriggered` — prevents re-triggering while still low HP
      - While grounded: gravity applies, can't fly, shows 💫 DOWNED! Xs above pet
    - Flying pet controls: W/ArrowUp = flap up, gravity pulls down, S/ArrowDown = attack

11. **Witch Duel mode** ✅
    - Side-scrolling broomstick race through a purple night sky
    - Both witches face right, drawn in player colors with pointy hats and brooms
    - Screen auto-scrolls right — fall off left edge and you die
    - W/ArrowUp = flap up; gravity pulls down; S/ArrowDown = cast spell; A/D or Left/Right = move horizontally
    - Each player gets a random spell (blast/freeze/fire/rain); after casting, immediately get a new random one
    - Projectiles fire toward enemy at speed 7; fire ring and rain cast on self/enemy directly
    - Obstacles: 🔵 blue cloud (slow + 1 dmg/0.5s), 🐦 bird (10 dmg, knock back), 🪨 rock (15 dmg, solid), 🌲 tree (15 dmg, at ground level)
    - Wind currents: 💨 TAILWIND (green tunnel, pushes you forward/faster), 🌬️ HEADWIND (blue tunnel, pushes you backward/slower) — thin horizontal bands at random heights, must fly into them to get the effect, spawn every ~3s, push strength ±8px/frame, arrows + streaks show direction
    - 1s invincibility frames after obstacle damage so you don't get chain-hit
    - Scroll speed ramps from 2 → 6 over time
    - `gameState.witchDuel` — scrollX, scrollSpeed, p1/p2 (x,y,velY,hp,spell,castTimer,slowTimer,hitTimer), projectiles, obstacles, fireEffects, rainEffects
    - No weapons needed — witch_duel is exempt from the "select a weapon" check in startBattle()

12. **Spell Duel mode** ✅
    - Both witches stand still on opposite sides; bubbles float across the screen carrying spells
    - P1 types WASD (mapped to ↑←↓→), P2 types Arrow Keys to enter spell sequences
    - Typing a full sequence fires that bubble at the enemy; wrong key = reset and try again
    - Keys in the bubble glow red arrow-by-arrow as they are typed (partial matches across all bubbles)
    - 10 spells: Freeze, Blast, Fire Ring, Rainstorm, Lightning, Vortex, Meteor, Shield (heals!), Poison, Time Stop
    - Shield spell heals the caster instead of damaging the enemy
    - 100 HP each, first to 0 loses
    - No weapons needed — exempt from weapon check in startBattle()

14. **Costume / Skin system** ✅ (local game only)
    - 9 costumes in 3 tiers, bought from the store in the "🎭 Costumes" section
    - **Tier 1 ($150):** Ninja (mask + headband + shuriken), Pizza (slice hat + pepperoni body + cheese drip), Gardener (straw hat + flower + green apron)
    - **Tier 2 ($400):** Wizard (tall pointy hat + robe), Cat Person (cat ears + tail + paw pads), Superhero (mask + cape + chest emblem)
    - **Tier 3 ($800):** Ball Gown (tiara + poofy skirt), Vampire (cape + fangs + widow's peak), Royalty (crown + ermine-collar robe)
    - Costume is drawn on top of the player body using `drawSkin(cx, cy)` — doesn't replace the base character
    - Switching costs the **price difference** only (refund if going to a cheaper skin, free if same tier)
    - `playerData.p1.skin` / `playerData.p2.skin` store the active skin name (null = Default)
    - `SKIN_COSTS` and `SKIN_LABELS` lookup objects; `buyCostume(player, skinName)` handles purchase
    - Store buttons highlight green (`.costumeBtn.equipped`) when that skin is active; disabled if unaffordable
    - `p1SkinInfo` / `p2SkinInfo` divs show "Wearing: [skin name]"

16. **Town Hub** ✅
    - Top-down split-screen island world; replaces the store screen as the main hub
    - P1 uses WASD, P2 uses Arrow Keys to walk around the pixel-art island (2400×1600 world)
    - Decorative stations: Battle Arena (red), KOTH Hill (grassy ellipse), Pet Arena (purple circular), Race Track (oval), Spell House (purple)
    - Each battle station has a **Prep Hut** next to it (thatched-roof, glows when near)
    - Both players walk into same hut → **full hut interior room scene** → pick weapons at your table → both press ready → battle starts
    - **Hut interior** draws a proper pixel-art room: themed floor planks, back wall with planks, two wall torches (flickering), two banners, a center window, and a mode-specific NPC standing at the back
    - Each hut has a unique **theme** (wall color, floor, accent color, torches, banners) and a unique **NPC master** (Arena Master, The Herald, Lion Tamer, Grand Witch, Archmage)
    - Each player has a **battle table** with a parchment scroll listing their weapons — W/S (P1) or ArrowUp/Down (P2) scroll the list, SPACE/ENTER toggles selection, A/ArrowLeft marks ready
    - No-weapons modes (witch_duel, spell_duel) show "No weapons needed" on the parchment and use SPACE/ENTER to ready up
    - The NPC has a **speech bubble** with a mode-specific quote
    - Both ready → black overlay + big "⚔️ FIGHT! ⚔️" flash → battle starts 0.9s later
    - Decorative buildings (arenas, hill, track, spell house) have **no entrance zone** — players can't enter them; only huts and the store are interactable
    - Store is a half-screen overlay (left for P1, right for P2) — town canvas keeps running behind it
    - All buy functions updated to use refreshStoreUI() so overlay updates correctly
    - After battle ends, returnToStore() now calls showTown() instead of showing storeScreen
    - Walker positions reset to starting road on showTown() so no stuck-in-building bug after battle
    - ✅ **Hut interior keyboard wiring fixed** — `drawHutInterior()` is now called in `townLoop`; dedicated town keydown handler added for hut controls (W/S = P1 cursor, SPACE = P1 select, A = P1 ready; ArrowUp/Down = P2 cursor, ENTER = P2 select, ArrowLeft = P2 ready, Escape = leave)
    - ✅ **Walker movement frozen while in hut** — `updateTownWalkers()` is skipped when `hutState` is active so W/S don't also move the character
    - ✅ **Decorative buildings no longer launch battles** — buildings with `mode: null` (arenas, hill, track) now show a "head to the prep hut" prompt instead of calling `enterHut(null)`
    - ✅ **`townBuildingConfirm` declared** — was referenced but never declared; now `let townBuildingConfirm = null` near other town state vars
    - ✅ **Clothes Shop added** — pink boutique at (600, 200); either player can browse and buy/switch costumes via `showClothesShopFromTown` / `renderClothesShopOverlay`; reuses the `#storeOverlay` div; `buyCostume` simplified (no more alert() popups)
    - ✅ **Store overlay inventory selection removed** — store overlay was showing a clickable weapon list that did nothing; replaced with read-only display + note to use Prep Huts
    - ✅ **Clothes Shop entrance fixed** — `buildingEntranceRect` was missing `b.id !== 'clothes'` in its allowlist, so the building had no entrance zone and `inBuilding` was never set to `'clothes'`; SPACE/ENTER did nothing

15. **Projectile deflection + collision** ✅
    - Tier 3+ melee weapons deflect incoming projectiles while mid-swing (flip direction + swap owner + "DEFLECT! ✨" popup)
    - Same-tier projectiles collide and both disappear
    - Different-tier projectiles both bounce back (directions reversed)
    - Projectile constructor now takes `tier` parameter

---

## Mina's Additions to the Game

- Added the **Disco Ball** weapon (Tier 4, 20 damage, ranged) — it's her signature weapon!
- The Yeti easter egg says "Mina is the Beast" on its sign
- Co-created all the maps and weapon ideas
- Requested the multiplayer graphics upgrade — online game now looks just as good as local!
- Requested the cute yeti redesign — blue eyes, rosy cheeks, no scary stuff!
- Requested no starting ability in multiplayer — must earn it from the store
- Designed the Magic Wand item with 4 unique spells: Blast, Freeze, Fire Ring, Rainstorm
- Designed the Pet system with 3 tiers and 11 pet types: Dog, Rabbit, Sparrow, Cat, Squirrel, Bear, Phoenix, Dragon, Griffin
- Designed the **Animation** admin wand spell — map-specific hazard chaos (black hole, comet barrage, lava surge, etc.)
- Requested **King of the Hill** game mode — hold the crown zone for 10 seconds to win
- Designed **Pet Battle** game mode — player-controlled pets fight in an arena, owners sit in the stands
- Requested cat passive agility (2x speed, 1.7x jump) in Pet Battle — no button press needed
- Requested sparrow feather shoots straight forward (not diagonal)
- Redesigned attack system: SPACE/ENTER = attack anytime; special fires automatically when cooldown is ready
- Requested Pet Battle tiebreaker minigame when both pets die simultaneously
- Requested flying pets get knocked to the ground for 3 seconds when HP drops below 25
- Designed **Witch Duel** game mode — side-scrolling broomstick race with spell combat
- Designed **Spell Duel** game mode — type key sequences to cast spells from floating bubbles
- Requested wind currents in Witch Race — tailwinds speed you up, headwinds slow you down
- Requested combo attacks — chain hits fast for bonus damage and special swing animations
- Requested faster attack cooldown (0.25s) for easier combo chaining
- Requested projectile deflection — tier 3+ melee weapons deflect projectiles back at the shooter mid-swing
- Requested comical stuck arrows — Bow hits leave arrows sticking on the player body for 3 seconds
- Designed **Costume system** — 9 skins in 3 tiers (Ninja, Pizza, Gardener / Wizard, Cat Person, Superhero / Ball Gown, Vampire, Royalty) bought from the store; switching refunds the cost difference
- Designed **Town Hub** — top-down split-screen scrolling island world that replaces the old store screen; walk to Prep Huts to pick weapons and start battles; store appears as a half-screen overlay; pixel-art style with arena, race track, grassy KOTH hill, and spell house
- Added **Clothes Shop** building in town — pink boutique next to the store; either player walks up and presses SPACE/ENTER to browse all 9 costumes with price-diff/refund pricing
- Added **4 NPC Town Houses** to make the island feel populated — Baker's House 🍞, Scholar's Tower 📚, Pirate's Den ☠️, Knight's Hall 🛡️; walk up and press SPACE/ENTER to visit; each NPC has 4 lines of dialogue you can cycle through; each interior has unique pixel-art decorations (oven, bookshelf, treasure chest, sword & shield)
