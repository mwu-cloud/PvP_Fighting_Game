import pygame
import random
import string
import sys

# Initialize Pygame
pygame.init()

# Screen dimensions
SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 700
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("PVP Fighting Game")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 100, 255)
GREEN = (0, 255, 0)
BROWN = (139, 69, 19)
GRAY = (128, 128, 128)
YELLOW = (255, 255, 0)
LIGHT_BLUE = (173, 216, 230)
DARK_GREEN = (0, 100, 0)

# Game settings
FPS = 60
GRAVITY = 0.8
JUMP_STRENGTH = -15

# Player class
class Player:
    def __init__(self, x, y, color, controls, name):
        self.x = x
        self.y = y
        self.width = 40
        self.height = 60
        self.color = color
        self.vel_x = 0
        self.vel_y = 0
        self.speed = 5
        self.on_ground = False
        self.facing_right = True
        self.health = 100
        self.max_health = 100
        self.controls = controls
        self.name = name
        
        # Weapon system
        self.weapons = []  # Up to 3 weapons for battle
        self.current_weapon_index = 0
        self.attack_cooldown = 0
        self.is_attacking = False
        self.attack_timer = 0
        
    def get_current_weapon(self):
        if self.weapons:
            return self.weapons[self.current_weapon_index]
        return None
        
    def switch_weapon(self, index):
        if 0 <= index < len(self.weapons):
            self.current_weapon_index = index
            
    def move(self, keys, platforms):
        # Horizontal movement
        self.vel_x = 0
        if keys[self.controls['left']]:
            self.vel_x = -self.speed
            self.facing_right = False
        if keys[self.controls['right']]:
            self.vel_x = self.speed
            self.facing_right = True
            
        # Jump
        if keys[self.controls['jump']] and self.on_ground:
            self.vel_y = JUMP_STRENGTH
            self.on_ground = False
            
        # Apply gravity
        self.vel_y += GRAVITY
        
        # Update position
        self.x += self.vel_x
        self.y += self.vel_y
        
        # Check ground collision
        self.on_ground = False
        for platform in platforms:
            if self.check_platform_collision(platform):
                self.on_ground = True
                
        # Screen boundaries
        if self.x < 0:
            self.x = 0
        if self.x > SCREEN_WIDTH - self.width:
            self.x = SCREEN_WIDTH - self.width
        if self.y > SCREEN_HEIGHT:
            self.y = SCREEN_HEIGHT - self.height
            self.vel_y = 0
            self.on_ground = True
            
    def check_platform_collision(self, platform):
        # Check if player is falling onto platform
        if self.vel_y >= 0:
            if (self.x + self.width > platform.x and 
                self.x < platform.x + platform.width and
                self.y + self.height <= platform.y and
                self.y + self.height + self.vel_y >= platform.y):
                self.y = platform.y - self.height
                self.vel_y = 0
                return True
        return False
        
    def attack(self):
        if self.attack_cooldown == 0 and self.weapons:
            self.is_attacking = True
            self.attack_timer = 15  # Attack animation frames
            self.attack_cooldown = 60  # 1 second cooldown at 60 FPS
            return self.get_current_weapon()
        return None
        
    def update_timers(self):
        if self.attack_cooldown > 0:
            self.attack_cooldown -= 1
        if self.attack_timer > 0:
            self.attack_timer -= 1
        else:
            self.is_attacking = False
            
    def take_damage(self, damage):
        self.health -= damage
        if self.health < 0:
            self.health = 0
            
    def draw(self, screen):
        # Draw oval body
        pygame.draw.ellipse(screen, self.color, 
                          (self.x, self.y + 10, self.width, self.height - 10))
        
        # Draw head (face)
        pygame.draw.circle(screen, self.color, 
                         (int(self.x + self.width/2), int(self.y + 15)), 12)
        
        # Draw simple face
        eye_y = int(self.y + 12)
        if self.facing_right:
            pygame.draw.circle(screen, BLACK, (int(self.x + self.width/2 + 4), eye_y), 2)
        else:
            pygame.draw.circle(screen, BLACK, (int(self.x + self.width/2 - 4), eye_y), 2)
            
        # Draw weapon if equipped
        weapon = self.get_current_weapon()
        if weapon:
            weapon.draw(screen, self)
            
        # Draw health bar above player
        health_bar_width = 50
        health_bar_height = 5
        health_x = self.x - 5
        health_y = self.y - 15
        
        # Background (red)
        pygame.draw.rect(screen, RED, (health_x, health_y, health_bar_width, health_bar_height))
        # Health (green)
        current_health_width = (self.health / self.max_health) * health_bar_width
        pygame.draw.rect(screen, GREEN, (health_x, health_y, current_health_width, health_bar_height))
        
# Weapon classes
class Weapon:
    def __init__(self, name, damage, weapon_type, tier, range_val=50):
        self.name = name
        self.damage = damage
        self.weapon_type = weapon_type  # 'melee' or 'ranged'
        self.tier = tier
        self.range = range_val
        
    def draw(self, screen, player):
        pass  # Override in subclasses
        
class MeleeWeapon(Weapon):
    def __init__(self, name, damage, tier, color=GRAY):
        super().__init__(name, damage, 'melee', tier)
        self.color = color
        
    def draw(self, screen, player):
        if player.is_attacking:
            # Draw swinging animation
            weapon_length = 30
            if player.facing_right:
                start_x = player.x + player.width
                end_x = start_x + weapon_length
                angle_offset = (15 - player.attack_timer) * 6  # Swing animation
            else:
                start_x = player.x
                end_x = start_x - weapon_length
                angle_offset = -(15 - player.attack_timer) * 6
                
            mid_y = player.y + player.height // 2
            pygame.draw.line(screen, self.color, 
                           (start_x, mid_y), 
                           (end_x, mid_y - angle_offset), 4)
        else:
            # Draw weapon at side
            if player.facing_right:
                weapon_x = player.x + player.width
            else:
                weapon_x = player.x - 20
            weapon_y = player.y + player.height // 2
            pygame.draw.line(screen, self.color, 
                           (weapon_x, weapon_y), 
                           (weapon_x, weapon_y + 20), 4)
                           
    def check_hit(self, attacker, defender):
        if not attacker.is_attacking:
            return False
            
        # Check if in range and facing target
        if attacker.facing_right:
            in_range = (defender.x > attacker.x and 
                       defender.x < attacker.x + self.range + attacker.width)
        else:
            in_range = (defender.x < attacker.x and 
                       defender.x > attacker.x - self.range - defender.width)
                       
        # Check vertical alignment
        vertical_align = abs((attacker.y + attacker.height/2) - 
                           (defender.y + defender.height/2)) < 40
                           
        return in_range and vertical_align and attacker.attack_timer == 14
        
class Projectile:
    def __init__(self, x, y, direction, damage, color, speed=10):
        self.x = x
        self.y = y
        self.direction = direction  # 1 for right, -1 for left
        self.damage = damage
        self.color = color
        self.speed = speed
        self.active = True
        self.width = 10
        self.height = 5
        
    def update(self):
        self.x += self.direction * self.speed
        # Remove if off screen
        if self.x < 0 or self.x > SCREEN_WIDTH:
            self.active = False
            
    def draw(self, screen):
        pygame.draw.rect(screen, self.color, (self.x, self.y, self.width, self.height))
        
    def check_hit(self, player):
        return (self.x < player.x + player.width and
                self.x + self.width > player.x and
                self.y < player.y + player.height and
                self.y + self.height > player.y)
                
class RangedWeapon(Weapon):
    def __init__(self, name, damage, tier, color=YELLOW):
        super().__init__(name, damage, 'ranged', tier)
        self.color = color
        
    def draw(self, screen, player):
        # Draw bow/gun
        weapon_size = 15
        if player.facing_right:
            weapon_x = player.x + player.width - 5
        else:
            weapon_x = player.x + 5
        weapon_y = player.y + player.height // 2
        pygame.draw.rect(screen, self.color, 
                        (weapon_x - weapon_size//2, weapon_y - weapon_size//2, 
                         weapon_size, weapon_size))
                         
    def create_projectile(self, player):
        if player.facing_right:
            proj_x = player.x + player.width
            direction = 1
        else:
            proj_x = player.x
            direction = -1
        proj_y = player.y + player.height // 2
        return Projectile(proj_x, proj_y, direction, self.damage, self.color)

# Platform class
class Platform:
    def __init__(self, x, y, width, height, color=BROWN):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.color = color
        
    def draw(self, screen):
        pygame.draw.rect(screen, self.color, (self.x, self.y, self.width, self.height))

# Create some weapons for testing
def create_starter_weapons():
    weapons_pool = [
        MeleeWeapon("Sword", 5, 1, GRAY),
        MeleeWeapon("Banana Sword", 7, 1, YELLOW),
        RangedWeapon("Bow", 8, 1, BROWN),
        MeleeWeapon("Sword", 10, 2, GRAY),
        RangedWeapon("Gun", 12, 2, BLACK),
    ]
    return weapons_pool

# Generate random game code
def generate_game_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Create platforms for the map
def create_map():
    platforms = [
        # Ground
        Platform(0, SCREEN_HEIGHT - 50, SCREEN_WIDTH, 50, DARK_GREEN),
        # Lower platforms
        Platform(200, SCREEN_HEIGHT - 150, 200, 20, BROWN),
        Platform(700, SCREEN_HEIGHT - 150, 200, 20, BROWN),
        # Middle platforms
        Platform(100, SCREEN_HEIGHT - 300, 150, 20, BROWN),
        Platform(500, SCREEN_HEIGHT - 280, 250, 20, BROWN),
        Platform(900, SCREEN_HEIGHT - 300, 150, 20, BROWN),
        # High platform
        Platform(450, SCREEN_HEIGHT - 450, 200, 20, BROWN),
    ]
    return platforms

# Draw props/decorations
def draw_props(screen):
    # Trees
    pygame.draw.rect(screen, BROWN, (50, SCREEN_HEIGHT - 150, 20, 100))
    pygame.draw.circle(screen, GREEN, (60, SCREEN_HEIGHT - 150), 40)
    
    pygame.draw.rect(screen, BROWN, (1100, SCREEN_HEIGHT - 150, 20, 100))
    pygame.draw.circle(screen, GREEN, (1110, SCREEN_HEIGHT - 150), 40)
    
    # Clouds
    pygame.draw.circle(screen, WHITE, (300, 100), 30)
    pygame.draw.circle(screen, WHITE, (330, 100), 35)
    pygame.draw.circle(screen, WHITE, (360, 100), 30)
    
    pygame.draw.circle(screen, WHITE, (800, 150), 25)
    pygame.draw.circle(screen, WHITE, (825, 150), 30)
    pygame.draw.circle(screen, WHITE, (850, 150), 25)

# Main game function
def main():
    clock = pygame.time.Clock()
    
    # Generate game code
    game_code = generate_game_code()
    
    # Create players
    player1 = Player(100, 100, BLUE, {
        'left': pygame.K_a,
        'right': pygame.K_d,
        'jump': pygame.K_w,
        'attack': pygame.K_s,
        'weapon1': pygame.K_1,
        'weapon2': pygame.K_2,
        'weapon3': pygame.K_3
    }, "Player 1")
    
    player2 = Player(1000, 100, RED, {
        'left': pygame.K_LEFT,
        'right': pygame.K_RIGHT,
        'jump': pygame.K_UP,
        'attack': pygame.K_DOWN,
        'weapon1': pygame.K_KP1,
        'weapon2': pygame.K_KP2,
        'weapon3': pygame.K_KP3
    }, "Player 2")
    
    # Give players some starting weapons
    weapons_pool = create_starter_weapons()
    player1.weapons = random.sample(weapons_pool, 3)
    player2.weapons = random.sample(weapons_pool, 3)
    
    # Create map
    platforms = create_map()
    
    # Projectiles list
    projectiles = []
    
    # Game state
    game_over = False
    winner = None
    
    # Fonts
    font = pygame.font.Font(None, 36)
    small_font = pygame.font.Font(None, 24)
    
    running = True
    while running:
        clock.tick(FPS)
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                
            # Weapon switching and attacking
            if not game_over:
                if event.type == pygame.KEYDOWN:
                    # Player 1 weapon switching
                    if event.key == player1.controls['weapon1']:
                        player1.switch_weapon(0)
                    elif event.key == player1.controls['weapon2']:
                        player1.switch_weapon(1)
                    elif event.key == player1.controls['weapon3']:
                        player1.switch_weapon(2)
                    # Player 1 attack
                    elif event.key == player1.controls['attack']:
                        weapon = player1.attack()
                        if weapon and weapon.weapon_type == 'ranged':
                            projectiles.append(weapon.create_projectile(player1))
                    
                    # Player 2 weapon switching (numpad)
                    if event.key == pygame.K_KP1:
                        player2.switch_weapon(0)
                    elif event.key == pygame.K_KP2:
                        player2.switch_weapon(1)
                    elif event.key == pygame.K_KP3:
                        player2.switch_weapon(2)
                    # Player 2 attack
                    elif event.key == player2.controls['attack']:
                        weapon = player2.attack()
                        if weapon and weapon.weapon_type == 'ranged':
                            projectiles.append(weapon.create_projectile(player2))
        
        if not game_over:
            # Get keys
            keys = pygame.key.get_pressed()
            
            # Move players
            player1.move(keys, platforms)
            player2.move(keys, platforms)
            
            # Update timers
            player1.update_timers()
            player2.update_timers()
            
            # Update projectiles
            for proj in projectiles[:]:
                proj.update()
                if not proj.active:
                    projectiles.remove(proj)
                    continue
                    
                # Check hits
                if proj.check_hit(player1):
                    player1.take_damage(proj.damage)
                    projectiles.remove(proj)
                elif proj.check_hit(player2):
                    player2.take_damage(proj.damage)
                    projectiles.remove(proj)
            
            # Check melee hits
            weapon1 = player1.get_current_weapon()
            weapon2 = player2.get_current_weapon()
            
            if weapon1 and weapon1.weapon_type == 'melee':
                if weapon1.check_hit(player1, player2):
                    player2.take_damage(weapon1.damage)
                    
            if weapon2 and weapon2.weapon_type == 'melee':
                if weapon2.check_hit(player2, player1):
                    player1.take_damage(weapon2.damage)
            
            # Check for winner
            if player1.health <= 0:
                game_over = True
                winner = player2.name
            elif player2.health <= 0:
                game_over = True
                winner = player1.name
        
        # Drawing
        screen.fill(LIGHT_BLUE)  # Sky background
        
        # Draw props
        draw_props(screen)
        
        # Draw platforms
        for platform in platforms:
            platform.draw(screen)
        
        # Draw projectiles
        for proj in projectiles:
            proj.draw(screen)
        
        # Draw players
        player1.draw(screen)
        player2.draw(screen)
        
        # Draw UI
        # Game code
        code_text = small_font.render(f"Game Code: {game_code}", True, BLACK)
        screen.blit(code_text, (10, 10))
        
        # Player names and current weapon
        p1_weapon = player1.get_current_weapon()
        p1_weapon_name = p1_weapon.name if p1_weapon else "No Weapon"
        p1_text = small_font.render(f"{player1.name}: {p1_weapon_name} (Tier {p1_weapon.tier if p1_weapon else 0})", True, BLACK)
        screen.blit(p1_text, (10, 40))
        
        p2_weapon = player2.get_current_weapon()
        p2_weapon_name = p2_weapon.name if p2_weapon else "No Weapon"
        p2_text = small_font.render(f"{player2.name}: {p2_weapon_name} (Tier {p2_weapon.tier if p2_weapon else 0})", True, BLACK)
        screen.blit(p2_text, (SCREEN_WIDTH - 350, 40))
        
        # Instructions
        controls_text = small_font.render("P1: WASD + S=Attack + 1,2,3=Weapons | P2: Arrows + Down=Attack + Numpad 1,2,3=Weapons", True, BLACK)
        screen.blit(controls_text, (150, SCREEN_HEIGHT - 25))
        
        # Game over screen
        if game_over:
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
            overlay.set_alpha(128)
            overlay.fill(BLACK)
            screen.blit(overlay, (0, 0))
            
            winner_text = font.render(f"{winner} WINS!", True, YELLOW)
            restart_text = small_font.render("Press ESC to quit", True, WHITE)
            
            screen.blit(winner_text, (SCREEN_WIDTH//2 - winner_text.get_width()//2, 
                                     SCREEN_HEIGHT//2 - 50))
            screen.blit(restart_text, (SCREEN_WIDTH//2 - restart_text.get_width()//2, 
                                      SCREEN_HEIGHT//2 + 10))
            
            keys = pygame.key.get_pressed()
            if keys[pygame.K_ESCAPE]:
                running = False
        
        pygame.display.flip()
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
