# PVP Fighting Game Server
# Created by Mina & Ava (with help from Claude)
#
# This server handles:
# - Serving the game to browsers
# - Multiplayer rooms with CODEs
# - Real-time game state sync between players

import random
import string
from flask import Flask, render_template, send_from_directory, request
from flask_socketio import SocketIO, emit, join_room, leave_room

# Import our game data
from game_data import (
    get_random_tier1_weapon,
    get_random_weapon_for_mystery_box,
    get_random_ability,
    get_random_map,
    STORE_PRICES,
    WIN_REWARD,
)

# Create the Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'minas-secret-game-key'

# Create the SocketIO instance for real-time multiplayer
socketio = SocketIO(app, cors_allowed_origins="*")


# =============================================================================
# GAME ROOMS - Where players connect with CODEs
# =============================================================================
# This dictionary stores all active game rooms
# Key = room code, Value = room data

game_rooms = {}


def generate_room_code():
    """Generate a random 6-character room code like 'ABC123'"""
    characters = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(characters, k=6))
    # Make sure it's unique
    while code in game_rooms:
        code = ''.join(random.choices(characters, k=6))
    return code


def create_new_room(code):
    """Create a new game room with default settings"""
    return {
        "code": code,
        "players": {},  # player_id -> player data
        "state": "waiting",  # waiting, playing, finished
        "current_map": None,
        "created_at": None,
    }


def create_new_player(player_num):
    """Create a new player with starting equipment"""
    starter_weapon = get_random_tier1_weapon()
    return {
        "number": player_num,  # 1 or 2
        "coins": 0,
        "inventory": [starter_weapon],
        "selected_weapons": [starter_weapon],
        "ability": None,
        "skin": None,
        "ready": False,
    }


# =============================================================================
# WEB ROUTES - Pages people can visit
# =============================================================================

@app.route('/')
def home():
    """When someone visits the main page, send them the game!"""
    return send_from_directory('.', 'game.html')


@app.route('/multiplayer')
def multiplayer():
    """Multiplayer lobby page"""
    return send_from_directory('.', 'multiplayer.html')


@app.route('/multiplayer_game')
def multiplayer_game():
    """Multiplayer game page - the actual battle"""
    return send_from_directory('.', 'multiplayer_game.html')


# =============================================================================
# WEBSOCKET EVENTS - Real-time multiplayer communication
# =============================================================================
# These functions handle messages between the server and browsers
# Think of it like a phone call - both sides can talk anytime!

@socketio.on('connect')
def handle_connect():
    """When a player connects to the server"""
    print(f"Player connected: {request.sid}")
    emit('connected', {'message': 'Welcome to Mina\'s PVP Game!'})


@socketio.on('disconnect')
def handle_disconnect():
    """When a player disconnects"""
    print(f"Player disconnected: {request.sid}")
    # Remove them from any room they were in
    for code, room in list(game_rooms.items()):
        if request.sid in room['players']:
            del room['players'][request.sid]
            # Tell the other player
            emit('player_left', {'message': 'Other player disconnected'}, room=code)
            # Delete empty rooms
            if len(room['players']) == 0:
                del game_rooms[code]
                print(f"Room {code} deleted (empty)")


@socketio.on('create_room')
def handle_create_room():
    """Player wants to create a new game room"""
    code = generate_room_code()
    game_rooms[code] = create_new_room(code)

    # Add the player to the room
    game_rooms[code]['players'][request.sid] = create_new_player(1)
    join_room(code)

    print(f"Room {code} created by {request.sid}")
    emit('room_created', {
        'code': code,
        'player_number': 1,
        'message': f'Room created! Share code: {code}'
    })


@socketio.on('join_game_room')
def handle_join_room(data):
    """Player wants to join an existing room with a CODE"""
    code = data.get('code', '').upper()

    # Check if room exists
    if code not in game_rooms:
        emit('join_error', {'message': 'Room not found! Check the code.'})
        return

    room = game_rooms[code]

    # Check if room is full
    if len(room['players']) >= 2:
        emit('join_error', {'message': 'Room is full!'})
        return

    # Add the player
    room['players'][request.sid] = create_new_player(2)
    join_room(code)

    print(f"Player {request.sid} joined room {code}")

    # Tell the new player they joined
    emit('room_joined', {
        'code': code,
        'player_number': 2,
        'message': 'Joined the game!'
    })

    # Tell everyone the room is ready
    emit('room_ready', {
        'message': 'Both players connected! Ready to battle!'
    }, room=code)


@socketio.on('player_ready')
def handle_player_ready(data):
    """Player is ready to start the battle"""
    code = data.get('code')
    if code not in game_rooms:
        return

    room = game_rooms[code]
    if request.sid in room['players']:
        room['players'][request.sid]['ready'] = True

        # Check if both players are ready
        all_ready = all(p['ready'] for p in room['players'].values())
        if all_ready and len(room['players']) == 2:
            # Pick a random map and start!
            room['current_map'] = get_random_map()
            room['state'] = 'playing'
            emit('game_start', {
                'map': room['current_map'],
                'message': 'FIGHT!'
            }, room=code)


@socketio.on('rejoin_game')
def handle_rejoin_game(data):
    """Player reconnects to game after page redirect"""
    code = data.get('code')
    player_num = data.get('player')

    if code not in game_rooms:
        emit('join_error', {'message': 'Room no longer exists!'})
        return

    room = game_rooms[code]

    # Add the player back to the room
    room['players'][request.sid] = create_new_player(player_num)
    join_room(code)

    print(f"Player {player_num} rejoined room {code}")


@socketio.on('player_action')
def handle_player_action(data):
    """Player did something (moved, attacked, etc.)"""
    code = data.get('code')
    action = data.get('action')  # 'move', 'attack', 'ability', etc.

    if code not in game_rooms:
        return

    # Send the action to the other player
    emit('opponent_action', {
        'action': action,
        'data': data.get('action_data', {})
    }, room=code, include_self=False)


@socketio.on('buy_item')
def handle_buy_item(data):
    """Player wants to buy something from the store"""
    code = data.get('code')
    item_type = data.get('item_type')  # 'mystery_box', 'ability', 'skin'

    if code not in game_rooms:
        return

    room = game_rooms[code]
    player = room['players'].get(request.sid)
    if not player:
        return

    price = STORE_PRICES.get(item_type, 0)

    # Check if they can afford it
    if player['coins'] < price:
        emit('buy_error', {'message': 'Not enough coins!'})
        return

    # Process the purchase
    player['coins'] -= price

    if item_type == 'mystery_box':
        new_weapon = get_random_weapon_for_mystery_box()
        player['inventory'].append(new_weapon)
        emit('item_purchased', {
            'item_type': 'weapon',
            'item': new_weapon,
            'coins_left': player['coins']
        })

    elif item_type == 'ability':
        new_ability = get_random_ability()
        player['ability'] = new_ability  # Replaces old ability
        emit('item_purchased', {
            'item_type': 'ability',
            'item': new_ability,
            'coins_left': player['coins']
        })


@socketio.on('game_over')
def handle_game_over(data):
    """Battle ended - someone won!"""
    code = data.get('code')
    winner = data.get('winner')  # 1 or 2

    if code not in game_rooms:
        return

    room = game_rooms[code]
    room['state'] = 'finished'

    # Give the winner their reward
    for sid, player in room['players'].items():
        if player['number'] == winner:
            player['coins'] += WIN_REWARD

    # Reset ready status for next round
    for player in room['players'].values():
        player['ready'] = False

    emit('battle_result', {
        'winner': winner,
        'reward': WIN_REWARD
    }, room=code)


# =============================================================================
# START THE SERVER
# =============================================================================

if __name__ == '__main__':
    print("=" * 50)
    print("  MINA'S PVP FIGHTING GAME SERVER")
    print("  🎮 MULTIPLAYER ENABLED! 🎮")
    print("=" * 50)
    print()
    print("  Open your browser and go to:")
    print("  http://localhost:5050")
    print()
    print("  For multiplayer:")
    print("  http://localhost:5050/multiplayer")
    print()
    print("  Press Ctrl+C to stop the server")
    print("=" * 50)

    # Run the server!
    socketio.run(app, debug=True, port=5050, allow_unsafe_werkzeug=True)
