# Game Data for Mina's PVP Fighting Game
# This file contains all the weapons, abilities, and game settings
# Created by Mina & Ava

# =============================================================================
# GAME SETTINGS
# =============================================================================
# These are "constants" - values that don't change during the game
# Using ALL_CAPS is a Python tradition for constants

# Screen size
SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 700

# Physics (how players move)
GRAVITY = 0.8           # How fast you fall
JUMP_STRENGTH = -15     # Negative = up! Higher number = higher jump
PLAYER_SPEED = 5        # How fast you walk
PLAYER_SPEED_BOOSTED = 10  # Speed with the Speed ability

# Player size
PLAYER_WIDTH = 40
PLAYER_HEIGHT = 60

# Combat
STARTING_HP = 100
ATTACK_COOLDOWN = 60    # Frames (60 frames = 1 second at 60 FPS)

# Game speed
FPS = 60  # Frames per second


# =============================================================================
# STORE PRICES
# =============================================================================

STORE_PRICES = {
    "mystery_box": 100,   # Random weapon
    "ability": 200,       # Random ability (replaces old one)
    "skin": 10,           # Each skin costs $10
}

# How much you earn
WIN_REWARD = 100  # Coins for winning a battle


# =============================================================================
# PLAYER SKINS
# =============================================================================
# Each player has different color options

SKINS = {
    "player1": [
        {"name": "Default Blue", "color": "#3498db"},
        {"name": "Purple", "color": "#9b59b6"},
        {"name": "Teal", "color": "#1abc9c"},
        {"name": "Orange", "color": "#f39c12"},
    ],
    "player2": [
        {"name": "Default Red", "color": "#e74c3c"},
        {"name": "Dark Orange", "color": "#e67e22"},
        {"name": "Dark Red", "color": "#c0392b"},
        {"name": "Dark Purple", "color": "#8e44ad"},
    ],
}


# =============================================================================
# WEAPONS
# =============================================================================
# Each weapon is a "dictionary" - it stores information with labels
# For example: {"name": "Sword", "damage": 5} means the sword does 5 damage
#
# The weapons are organized in a "list" by tier (1-5)
# Tier 1 = weakest, Tier 5 = strongest

WEAPONS = {
    # TIER 1 - Starter weapons (5-8 damage)
    1: [
        {"name": "Sword", "damage": 5, "type": "melee"},
        {"name": "Banana Sword", "damage": 7, "type": "melee"},
        {"name": "Bow", "damage": 8, "type": "ranged"},
        {"name": "Fish", "damage": 5, "type": "melee"},
        {"name": "Water Gun", "damage": 6, "type": "ranged"},
        {"name": "Snowball Launcher", "damage": 7, "type": "ranged"},
    ],

    # TIER 2 - Better weapons (10-15 damage)
    2: [
        {"name": "Sword", "damage": 10, "type": "melee"},
        {"name": "Gun", "damage": 12, "type": "ranged"},
        {"name": "Bow", "damage": 15, "type": "ranged"},
        {"name": "Frying Pan", "damage": 10, "type": "melee"},
        {"name": "Confetti Cannon", "damage": 11, "type": "ranged"},
        {"name": "Boomerang", "damage": 12, "type": "ranged"},
    ],

    # TIER 3 - Strong weapons (15-18 damage)
    3: [
        {"name": "Giant Lollipop", "damage": 15, "type": "melee"},
        {"name": "Firework Launcher", "damage": 17, "type": "ranged"},
    ],

    # TIER 4 - Very strong weapons (20-25 damage)
    4: [
        {"name": "Disco Ball", "damage": 20, "type": "ranged"},  # Added by Mina!
        {"name": "Lightsaber", "damage": 22, "type": "melee"},
        {"name": "Chainsaw", "damage": 23, "type": "melee"},
        {"name": "Bomb Thrower", "damage": 24, "type": "ranged"},
    ],

    # TIER 5 - LEGENDARY weapons (30+ damage)
    5: [
        {"name": "Electric Guitar", "damage": 32, "type": "melee"},
        {"name": "Bazooka", "damage": 35, "type": "ranged"},
    ],
}


# =============================================================================
# ABILITIES
# =============================================================================
# Each ability has:
#   - name: what it's called
#   - duration: how long it lasts (in seconds)
#   - cooldown: how long before you can use it again (in seconds)
#   - description: what it does

ABILITIES = [
    {
        "name": "Invisibility",
        "duration": 10,
        "cooldown": 10,
        "description": "Become 20% visible - enemies can't hit you!"
    },
    {
        "name": "Shield",
        "duration": 10,
        "cooldown": 10,
        "description": "Blue bubble blocks ALL damage"
    },
    {
        "name": "Speed",
        "duration": 10,
        "cooldown": 10,
        "description": "Move 2x faster!"
    },
    {
        "name": "Teleport",
        "duration": 10,  # Can keep teleporting for 10 seconds
        "cooldown": 2,   # Short cooldown - can use often!
        "description": "Instantly move to a random safe spot"
    },
]


# =============================================================================
# MAPS
# =============================================================================
# Each map has:
#   - name: what it's called
#   - hazards: list of dangerous things on the map
#   - description: what makes it special
#   - platforms: where players can stand (x, y, width, height)

MAPS = [
    {
        "name": "Normal",
        "description": "Just platforms, no hazards. Good for beginners!",
        "hazards": [],
        "platforms": [
            {"x": 0, "y": 650, "width": 1200, "height": 50},      # Ground
            {"x": 200, "y": 550, "width": 200, "height": 20},     # Lower left
            {"x": 800, "y": 550, "width": 200, "height": 20},     # Lower right
            {"x": 100, "y": 430, "width": 150, "height": 20},     # Mid left
            {"x": 500, "y": 400, "width": 200, "height": 20},     # Middle
            {"x": 950, "y": 430, "width": 150, "height": 20},     # Mid right
            {"x": 500, "y": 250, "width": 200, "height": 20},     # Top
        ]
    },
    {
        "name": "Comet Field",
        "description": "Watch out! Comets fall from the sky!",
        "hazards": [
            {"type": "comet", "damage": 30, "spawn_rate": "every few seconds"}
        ],
        "platforms": [
            {"x": 0, "y": 650, "width": 1200, "height": 50},
            {"x": 150, "y": 520, "width": 180, "height": 20},
            {"x": 870, "y": 520, "width": 180, "height": 20},
            {"x": 450, "y": 450, "width": 300, "height": 20},
            {"x": 200, "y": 320, "width": 150, "height": 20},
            {"x": 850, "y": 320, "width": 150, "height": 20},
            {"x": 500, "y": 200, "width": 200, "height": 20},
        ]
    },
    {
        "name": "Volcano",
        "description": "Lava rises from below! Get to high ground!",
        "hazards": [
            {
                "type": "lava",
                "damage": 5,  # Per frame while touching!
                "start_height": 50,
                "rise_rate": 100,  # Pixels every 20 seconds
                "max_height": 400
            }
        ],
        "platforms": [
            {"x": 0, "y": 650, "width": 1200, "height": 50},
            {"x": 100, "y": 550, "width": 200, "height": 20},
            {"x": 900, "y": 550, "width": 200, "height": 20},
            {"x": 400, "y": 480, "width": 400, "height": 20},
            {"x": 150, "y": 380, "width": 180, "height": 20},
            {"x": 870, "y": 380, "width": 180, "height": 20},
            {"x": 450, "y": 280, "width": 300, "height": 20},
            {"x": 500, "y": 150, "width": 200, "height": 20},  # Safe zone!
        ]
    },
    {
        "name": "Ice",
        "description": "Slippery platforms! Icicles fall from above!",
        "hazards": [
            {
                "type": "icicle",
                "damage_min": 1,
                "damage_max": 20,
                "spawn_rate": "3-5 every 2-3 seconds"
            },
            {
                "type": "slippery",
                "description": "Players slide after stopping"
            }
        ],
        "platforms": [
            {"x": 0, "y": 650, "width": 1200, "height": 50},
            {"x": 100, "y": 530, "width": 200, "height": 20},
            {"x": 900, "y": 530, "width": 200, "height": 20},
            {"x": 350, "y": 450, "width": 150, "height": 20},
            {"x": 700, "y": 450, "width": 150, "height": 20},
            {"x": 500, "y": 200, "width": 200, "height": 20},  # High icicle platform!
        ]
    },
    {
        "name": "Alien Invasion",
        "description": "Spaceships beam you up! Don't fall in the crater!",
        "hazards": [
            {
                "type": "spaceship",
                "count": 5,
                "description": "Hover at different heights, beam pulls you in"
            },
            {
                "type": "crater",
                "damage": "instant death",
                "location": "middle of map"
            }
        ],
        "platforms": [
            {"x": 0, "y": 650, "width": 450, "height": 50},      # Left ground
            {"x": 750, "y": 650, "width": 450, "height": 50},    # Right ground
            # GAP IN MIDDLE = CRATER!
            {"x": 50, "y": 520, "width": 180, "height": 20},
            {"x": 970, "y": 520, "width": 180, "height": 20},
            {"x": 250, "y": 400, "width": 150, "height": 20},
            {"x": 800, "y": 400, "width": 150, "height": 20},
            {"x": 500, "y": 300, "width": 200, "height": 20},    # Over the crater!
        ]
    },
]


def get_random_map():
    """Pick a random map for battle"""
    import random
    return random.choice(MAPS)


# =============================================================================
# EASTER EGG (SHHH... IT'S A SECRET!)
# =============================================================================
# Press G, G, G quickly to trigger!
# Don't tell anyone about this... ;)

EASTER_EGG = {
    "trigger": ["G", "G", "G"],  # Keys to press
    "cooldown": 5,  # Seconds before you can trigger again

    # Two possible appearances (picked randomly)
    "appearances": [
        {
            "name": "Abominable Snowman",
            "sign_text": "Mina is the Beast",
            "behavior": "walks in slowly, pauses 3 seconds, walks out slowly",
            "speed": 2,
        },
        {
            "name": "Yeti on Snowboard",
            "sign_text": "DEFEATED",
            "behavior": "rides across screen fast",
            "speed": 5,
        },
    ],

    # What the Yeti looks like
    "yeti_design": {
        "fur_color": "white with blue tint",
        "eyes": "red and glowing",
        "features": ["fangs", "claws", "muscular"],
        "height": 120,  # Pixels tall - bigger than players!
    },
}


def get_random_easter_egg():
    """Pick which easter egg appearance to show"""
    import random
    appearance = random.choice(EASTER_EGG["appearances"])
    return {
        "appearance": appearance,
        "design": EASTER_EGG["yeti_design"],
        "cooldown": EASTER_EGG["cooldown"],
    }


# =============================================================================
# TIEBREAKER MINIGAME
# =============================================================================
# When both players hit 0 HP at the same time, they play this dodge game!
# Split screen - each player dodges falling objects
# First one to get hit LOSES, the other wins $100

TIEBREAKER = {
    "description": "Dodge the falling objects! First hit loses!",

    # Objects that can fall from the sky
    "falling_objects": [
        {"name": "Rock", "size": 30, "speed": 5, "color": "gray"},
        {"name": "Meteor", "size": 40, "speed": 7, "color": "orange"},
        {"name": "Bomb", "size": 35, "speed": 6, "color": "black"},
        {"name": "Anvil", "size": 50, "speed": 8, "color": "darkgray"},
    ],

    # Difficulty ramps up over time
    "spawn_rate": {
        "start": 120,        # Frames between spawns at start (2 seconds)
        "after_10_sec": 20,  # Frames between spawns after 10 seconds (3+ per second!)
        "ramp_time": 10,     # Seconds to reach max difficulty
    },

    # Screen layout
    "split_screen": True,  # Each player has their own side
    "player_area_width": 300,  # Width of each player's dodge zone
}


def get_random_falling_object():
    """Get a random object for the tiebreaker minigame"""
    import random
    return random.choice(TIEBREAKER["falling_objects"]).copy()


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_all_weapons():
    """Returns a flat list of ALL weapons with their tier included"""
    all_weapons = []
    for tier, weapons in WEAPONS.items():
        for weapon in weapons:
            # Add the tier to each weapon
            weapon_with_tier = weapon.copy()
            weapon_with_tier["tier"] = tier
            all_weapons.append(weapon_with_tier)
    return all_weapons


def get_random_tier1_weapon():
    """Get a random Tier 1 weapon (for starting the game)"""
    import random
    weapon = random.choice(WEAPONS[1]).copy()
    weapon["tier"] = 1
    return weapon


def get_random_weapon_for_mystery_box():
    """Get a random weapon from any tier (weighted by rarity)"""
    import random

    # Tier chances: Tier 1 = common, Tier 5 = rare
    tier_weights = {
        1: 40,  # 40% chance
        2: 30,  # 30% chance
        3: 15,  # 15% chance
        4: 10,  # 10% chance
        5: 5,   # 5% chance - LEGENDARY!
    }

    # Pick a tier based on weights
    tiers = list(tier_weights.keys())
    weights = list(tier_weights.values())
    chosen_tier = random.choices(tiers, weights=weights)[0]

    # Pick a random weapon from that tier
    weapon = random.choice(WEAPONS[chosen_tier]).copy()
    weapon["tier"] = chosen_tier
    return weapon


def count_weapons():
    """Count total number of weapons"""
    total = 0
    for tier, weapons in WEAPONS.items():
        total += len(weapons)
    return total


def get_random_ability():
    """Get a random ability (for the store)"""
    import random
    return random.choice(ABILITIES).copy()


# =============================================================================
# TEST IT OUT!
# =============================================================================
# This code only runs if you run this file directly (python game_data.py)
# It won't run when we import this file into app.py

if __name__ == "__main__":
    print("=" * 50)
    print("  MINA'S WEAPON ARSENAL")
    print("=" * 50)
    print()
    print(f"Total weapons: {count_weapons()}")
    print()

    for tier, weapons in WEAPONS.items():
        print(f"TIER {tier}:")
        for w in weapons:
            print(f"  - {w['name']} ({w['damage']} damage, {w['type']})")
        print()

    print("=" * 50)
    print("Testing Mystery Box...")
    print("=" * 50)
    for i in range(5):
        weapon = get_random_weapon_for_mystery_box()
        print(f"  You got: {weapon['name']} (Tier {weapon['tier']}, {weapon['damage']} damage)")

    print()
    print("=" * 50)
    print("  ABILITIES")
    print("=" * 50)
    for ability in ABILITIES:
        print(f"  {ability['name']}")
        print(f"    - {ability['description']}")
        print(f"    - Lasts {ability['duration']}s, cooldown {ability['cooldown']}s")
        print()

    print("Buying a random ability...")
    ability = get_random_ability()
    print(f"  You got: {ability['name']}!")

    print()
    print("=" * 50)
    print("  BATTLE MAPS")
    print("=" * 50)
    for map_data in MAPS:
        print(f"  {map_data['name']}")
        print(f"    {map_data['description']}")
        if map_data['hazards']:
            print(f"    Hazards: ", end="")
            hazard_names = [h['type'] for h in map_data['hazards']]
            print(", ".join(hazard_names))
        print()

    print("Random map selected for battle...")
    battle_map = get_random_map()
    print(f"  You're fighting on: {battle_map['name']}!")

    print()
    print("=" * 50)
    print("  GAME SETTINGS")
    print("=" * 50)
    print(f"  Screen: {SCREEN_WIDTH} x {SCREEN_HEIGHT}")
    print(f"  Player HP: {STARTING_HP}")
    print(f"  Gravity: {GRAVITY}")
    print(f"  Jump Strength: {JUMP_STRENGTH}")
    print(f"  Player Speed: {PLAYER_SPEED} (boosted: {PLAYER_SPEED_BOOSTED})")
    print()
    print("  STORE PRICES:")
    print(f"    Mystery Box: ${STORE_PRICES['mystery_box']}")
    print(f"    Ability: ${STORE_PRICES['ability']}")
    print(f"    Skin: ${STORE_PRICES['skin']}")
    print(f"    Win Reward: ${WIN_REWARD}")
    print()
    print("  PLAYER SKINS:")
    print("    Player 1:", ", ".join([s['name'] for s in SKINS['player1']]))
    print("    Player 2:", ", ".join([s['name'] for s in SKINS['player2']]))

    print()
    print("=" * 50)
    print("  TIEBREAKER MINIGAME")
    print("=" * 50)
    print(f"  {TIEBREAKER['description']}")
    print()
    print("  Falling objects:")
    for obj in TIEBREAKER["falling_objects"]:
        print(f"    - {obj['name']} (size: {obj['size']}, speed: {obj['speed']})")
    print()
    print(f"  Difficulty ramps up over {TIEBREAKER['spawn_rate']['ramp_time']} seconds!")
    print(f"  Starts slow, then 3+ objects per second!")

    print()
    print("=" * 50)
    print("  ??? SECRET ???")
    print("=" * 50)
    print("  There's a hidden easter egg in this game...")
    print("  Press a certain key 3 times quickly to find it!")
    print()
    egg = get_random_easter_egg()
    print(f"  [DEBUG] If triggered, you'd see: {egg['appearance']['name']}")
    print(f"  [DEBUG] Sign says: \"{egg['appearance']['sign_text']}\"")
