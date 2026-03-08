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
- Deployed at: https://pvp-fighting-game.onrender.com
- GitHub repo: mwu-cloud/PvP_Fighting_Game
- Local dev: run `python app.py` then open http://localhost:5050

---

## File Structure

```
/Users/QueenMina/PVP Game/
├── app.py               # Python Flask server (multiplayer backend)
├── game_data.py         # All game data: weapons, maps, abilities, etc.
├── game.html            # Local 2-player game (same keyboard, main game)
├── multiplayer.html     # Online multiplayer lobby + store
├── multiplayer_game.html# Online battle page
├── requirements.txt     # flask, flask-socketio, gunicorn, gevent, gevent-websocket, eventlet
├── render.yaml          # Render deployment config
└── CLAUDE.md            # This file - auto-read by Claude Code each session
```

---

## How the Game Works

### Local 2-Player (game.html)
- Two players share one keyboard
- P1: WASD to move, S to attack, 1/2/3 for weapons, SPACE for ability
- P2: Arrow keys to move, Down to attack, 4/5/6 for weapons, ENTER for ability
- Both players pick weapons from a store before the battle starts
- Fight until one player's HP hits 0
- Easter egg: press G, G, G quickly — a Yeti walks across the screen
- Tiebreaker minigame: if both players hit 0 HP at once, dodge falling objects

### Online Multiplayer (multiplayer.html → multiplayer_game.html)
- Player 1 creates a room, gets a 6-character code (e.g. "ABC123")
- Player 2 enters the code to join
- Both click "I'M READY" → random map is chosen → battle starts
- Each player is on their own device/screen
- Winner gets 100 coins, redirected back to lobby with ?reward=100

### Store (multiplayer.html)
- Coins stored in localStorage (key: mp_coins), start with 200
- Mystery Box: 100 coins → random weapon (tier 1-5, weighted toward lower tiers)
- Random Ability: 200 coins → one of 4 abilities
- Weapons stored in localStorage (key: mp_weapons)
- Ability stored in localStorage (key: mp_ability)
- Before a battle starts, inventory is saved to mp_game_weapons / mp_game_ability

---

## Maps (6 total, chosen randomly for online, selectable locally)

1. **Normal** - Plain platforms, no hazards
2. **Comet Field** - Comets fall from the sky (30 damage each)
3. **Volcano** - Rising lava, get to high ground
4. **Ice** - VERY slippery platforms (slide forever!), icicles fall from the high middle platform
5. **Alien Invasion** - Spaceships beam you up, crater in the middle = instant death
6. **Breakable Cubes** - Platforms made of breakable cubes (break after 1s, reform after 1s), acid floor = instant death

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
2. Run: `rsync -avz -e ssh app.py game_data.py game.html multiplayer.html multiplayer_game.html requirements.txt droplet:~/pvp-game/`
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

1. **Multiplayer tested and working** - Movement syncs between players, comets spawn and deal damage,
   health bars update correctly. Tested with two browser tabs on Digital Ocean host.

4. **Recent changes from chat session (game.html only)**:
   - P2 weapon keys changed from 7/8/9 to 4/5/6
   - New Breakable Cubes map added (6th map)
   - Ice map is now much slipperier (near-zero friction)
   - Attack recoil added (weapon damage × 0.15 pushes attacker backward)
   - Hit detection improved: registers during frames 10-14, one hit per swing

2. **No persistent accounts** - Player data only lives in localStorage.
   If you clear browser data or use a different browser, you lose everything.
   Good future project: save to a JSON file or database on the server.

3. **Multiplayer store not wired to server** - The store on the lobby page uses
   localStorage only. The server has buy_item/item_purchased socket events
   but they're not connected to the frontend store.

---

## Mina's Additions to the Game

- Added the **Disco Ball** weapon (Tier 4, 20 damage, ranged) — it's her signature weapon!
- The Yeti easter egg says "Mina is the Beast" on its sign
- Co-created all the maps and weapon ideas
