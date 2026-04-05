// =============================================================================
// MINA'S PVP GAME ENGINE
// game_engine.js — Shared code for game.html and multiplayer_game.html
//
// If you fix a bug here, it's fixed in BOTH games automatically!
// =============================================================================

// NOTE: This file uses the following globals set by the HTML files:
//   ctx, canvas — the 2D drawing context and canvas element
//   GRAVITY, JUMP_STRENGTH, PLAYER_SPEED, ATTACK_COOLDOWN — physics constants
//   gameState — master game state object (has .breakableCubes, .currentMap, etc.)
//   keys — keyboard state dictionary

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function buildMapsFromGameData(mapsData) {
    // Convert game_data.py format → the format multiplayer_game.html expects
    // game_data.py hazards look like: [{type: "comet", ...}, {type: "lava", ...}]
    const result = {};
    for (const m of mapsData) {
        result[m.name] = {
            platforms: m.platforms || [],
            hazards: (m.hazards || []).map(h => h.type)
        };
    }
    return result;
}

// =============================================================================
// PLATFORM CLASS
// =============================================================================

class Platform {
    constructor(x, y, width, height, color = '#8B4513') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    checkCollision(player) {
        // Check if player is falling down
        if (player.velY >= 0) {
            // Check horizontal overlap
            if (player.x + player.width > this.x &&
                player.x < this.x + this.width) {
                // Check if player's feet are at or below platform top
                // and were above it in the previous frame
                if (player.y + player.height >= this.y &&
                    player.y + player.height - player.velY <= this.y) {
                    player.y = this.y - player.height;
                    player.velY = 0;
                    return true;
                }
            }
        }
        return false;
    }
}

// =============================================================================
// WEAPON CLASS
// =============================================================================

class Weapon {
    constructor(name, damage, type, tier) {
        this.name = name;
        this.damage = damage;
        this.type = type; // 'melee' or 'ranged'
        this.tier = tier;
    }
}

// =============================================================================
// COMET CLASS
// =============================================================================

class Comet {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.radius = 15;
        this.speed = 5 + Math.random() * 3;
        this.damage = 30;
        this.active = true;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.active = false;
        }
    }

    draw() {
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 20, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 35, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    checkHit(player) {
        if (player.isInvisible()) return false;
        const px = player.x + (player.width || 40) / 2;
        const py = player.y + (player.height || 60) / 2;
        const distance = Math.sqrt(
            Math.pow(this.x - px, 2) +
            Math.pow(this.y - py, 2)
        );
        return distance < this.radius + 20;
    }
}

// =============================================================================
// ICICLE CLASS
// =============================================================================

class Icicle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 25;
        this.speed = 6;
        this.damage = Math.floor(Math.random() * 20) + 1; // 1-20 damage
        this.active = true;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.active = false;
        }
    }

    draw() {
        ctx.fillStyle = '#B0E0E6';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.width / 2, this.y - this.height);
        ctx.lineTo(this.x + this.width / 2, this.y - this.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(this.x - 2, this.y - 5);
        ctx.lineTo(this.x - 2, this.y - 15);
        ctx.lineTo(this.x + 2, this.y - 10);
        ctx.closePath();
        ctx.fill();
    }

    checkHit(player) {
        if (player.isInvisible()) return false;
        return this.x > player.x &&
               this.x < player.x + (player.width || 40) &&
               this.y > player.y &&
               this.y < player.y + (player.height || 60);
    }
}

// =============================================================================
// BREAKABLE CUBE CLASS
// =============================================================================

class BreakableCube {
    constructor(x, y, size = 40) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.isBroken = false;
        this.breakTimer = 0;
        this.reformTimer = 0;
        this.isBeingSteppedOn = false;
    }

    update(player1, player2) {
        this.isBeingSteppedOn = false;

        if (!this.isBroken) {
            if (this.checkPlayerOn(player1)) this.isBeingSteppedOn = true;
            if (player2 && this.checkPlayerOn(player2)) this.isBeingSteppedOn = true;

            if (this.isBeingSteppedOn) {
                this.breakTimer++;
                if (this.breakTimer >= 60) {
                    this.isBroken = true;
                    this.breakTimer = 0;
                }
            } else {
                this.breakTimer = 0;
            }
        } else {
            this.reformTimer++;
            if (this.reformTimer >= 60) {
                this.isBroken = false;
                this.reformTimer = 0;
                this.breakTimer = 0;
            }
        }
    }

    checkPlayerOn(player) {
        if (!player) return false;
        if (player.velY < 0) return false;
        return player.x + (player.width || 40) > this.x &&
               player.x < this.x + this.size &&
               player.y + (player.height || 60) >= this.y &&
               player.y + (player.height || 60) <= this.y + 10;
    }

    checkCollision(player) {
        if (this.isBroken) return false;
        if (player.velY >= 0 &&
            player.x + (player.width || 40) > this.x &&
            player.x < this.x + this.size &&
            player.y + (player.height || 60) >= this.y &&
            player.y + (player.height || 60) - player.velY <= this.y) {
            player.y = this.y - (player.height || 60);
            player.velY = 0;
            if (player.onGround !== undefined) player.onGround = true;
            return true;
        }
        return false;
    }

    draw() {
        if (this.isBroken) return;

        const flashIntensity = this.breakTimer / 60;

        if (this.isBeingSteppedOn && this.breakTimer > 0) {
            const flashFrame = Math.floor(this.breakTimer / 5) % 2;
            if (flashFrame === 0) {
                ctx.fillStyle = `rgb(${139 + flashIntensity * 116}, ${69 - flashIntensity * 69}, ${19 - flashIntensity * 19})`;
            } else {
                ctx.fillStyle = `rgb(255, 0, 0)`;
            }
        } else {
            ctx.fillStyle = '#8B4513';
        }

        ctx.fillRect(this.x, this.y, this.size, this.size);

        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 2, this.y + 2);
        ctx.lineTo(this.x + this.size - 2, this.y + 2);
        ctx.moveTo(this.x + 2, this.y + 2);
        ctx.lineTo(this.x + 2, this.y + this.size - 2);
        ctx.stroke();
    }
}

// =============================================================================
// SPACESHIP CLASS
// =============================================================================

class Spaceship {
    constructor(x, y, beamHeight) {
        this.x = x;
        this.y = y;
        this._baseY = y;
        this.width = 60;
        this.height = 30;
        this.beamHeight = beamHeight || 200;
        this.beamWidth = 40;
        this.wobble = 0;
    }

    update() {
        this.wobble += 0.03;
        this.y = this._baseY + Math.sin(this.wobble) * 8;
    }

    draw() {
        const drawY = this.y;

        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.ellipse(this.x, drawY, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#A0A0A0';
        ctx.beginPath();
        ctx.ellipse(this.x, drawY - 10, this.width / 3, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(this.x - 15, drawY + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 15, drawY + 5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(this.x - this.beamWidth / 2, drawY + this.height / 2);
        ctx.lineTo(this.x + this.beamWidth / 2, drawY + this.height / 2);
        ctx.lineTo(this.x + this.beamWidth / 2, canvas.height - 50);
        ctx.lineTo(this.x - this.beamWidth / 2, canvas.height - 50);
        ctx.closePath();
        ctx.fill();
    }

    checkBeamHit(player) {
        const playerCenterX = player.x + (player.width || 40) / 2;
        return playerCenterX > this.x - this.beamWidth / 2 &&
               playerCenterX < this.x + this.beamWidth / 2 &&
               player.y + (player.height || 60) >= this.y + this.height / 2;
    }
}

// =============================================================================
// PROJECTILE CLASS
// =============================================================================

class Projectile {
    constructor(x, y, direction, damage, color) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.damage = damage;
        this.color = color;
        this.speed = 10;
        this.active = true;
        this.width = 10;
        this.height = 5;
    }

    update() {
        this.x += this.direction * this.speed;
        if (this.x < 0 || this.x > canvas.width) {
            this.active = false;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    checkHit(player) {
        if (player.isInvisible()) return false;
        const pw = player.width || 40;
        const ph = player.height || 60;
        return this.x < player.x + pw &&
               this.x + this.width > player.x &&
               this.y < player.y + ph &&
               this.y + this.height > player.y;
    }
}

// =============================================================================
// PLAYER CLASS
// =============================================================================

class Player {
    constructor(x, y, color, name, controls) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.color = color;
        this.velX = 0;
        this.velY = 0;
        this.facingRight = true;
        this.onGround = false;
        this.health = 100;
        this.maxHealth = 100;
        this.name = name;
        this.controls = controls || {};

        this.weapons = [];
        this.currentWeaponIndex = 0;
        this.attackCooldown = 0;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.hasHitThisAttack = false;

        // Abilities
        this.ability = null;
        this.abilityActive = false;
        this.abilityDuration = 0;
        this.abilityCooldown = 0;

        // Ice sliding
        this.slideVel = 0;

        // Ice special moves
        this.isSpinJumping = false;
        this.spinAngle = 0;
        this.isDucking = false;
        this.duckSlideVel = 0;

        // Alien beam
        this.isBeamed = false;
        this.beamTargetY = 0;

        // Multiplayer puppet interpolation
        this.isPuppet = false;
        this.prevState = null;
        this.targetState = null;
        this.interpAlpha = 0;
    }

    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex] || null;
    }

    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.currentWeaponIndex = index;
        }
    }

    move(platforms) {
        // If beamed by alien spaceship, handle beam physics
        if (this.isBeamed) {
            if (this.y > this.beamTargetY) {
                this.y -= 3;
            } else if (this.y < this.beamTargetY) {
                this.y = this.beamTargetY;
                this.velY = 0;
            }

            this.velX = 0;
            const speed = (this.hasSpeed() ? PLAYER_SPEED * 2 : PLAYER_SPEED) * 0.5;
            if (keys[this.controls.left]) {
                this.velX = -speed;
                this.facingRight = false;
                this.isBeamed = false;
            }
            if (keys[this.controls.right]) {
                this.velX = speed;
                this.facingRight = true;
                this.isBeamed = false;
            }

            this.x += this.velX;
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
            return;
        }

        // Normal movement
        this.velX = 0;

        const speed = this.hasSpeed() ? PLAYER_SPEED * 2 : PLAYER_SPEED;
        const isIce = gameState.currentMap === 'ice';

        if (keys[this.controls.left]) {
            this.velX = -speed;
            this.facingRight = false;
            if (isIce && this.onGround) {
                this.slideVel = -speed * 2.0;
            }
        }
        if (keys[this.controls.right]) {
            this.velX = speed;
            this.facingRight = true;
            if (isIce && this.onGround) {
                this.slideVel = speed * 2.0;
            }
        }

        if (isIce && this.onGround && this.velX === 0 && this.slideVel !== 0) {
            this.x += this.slideVel;
            this.slideVel *= 0.98;
            if (Math.abs(this.slideVel) < 0.1) this.slideVel = 0;
        } else if (!isIce) {
            this.slideVel = 0;
        }

        if (keys[this.controls.jump] && this.onGround && !this.isDucking) {
            this.velY = JUMP_STRENGTH;
            this.onGround = false;
            if (isIce) {
                this.isSpinJumping = true;
                this.spinAngle = 0;
            }
        }

        if (this.isSpinJumping) {
            this.spinAngle += (Math.PI * 6) / 40;
            if (this.onGround) {
                this.isSpinJumping = false;
                this.spinAngle = 0;
            }
        }

        if (this.isDucking) {
            this.x += this.duckSlideVel;
            this.duckSlideVel *= 0.96;
            if (Math.abs(this.duckSlideVel) < 0.5 || !this.onGround) {
                this.isDucking = false;
                this.duckSlideVel = 0;
            }
        }

        this.velY += GRAVITY;
        this.x += this.velX;
        this.y += this.velY;

        // Platform collision
        this.onGround = false;
        for (let platform of platforms) {
            if (platform.checkCollision(this)) {
                this.onGround = true;
            }
        }

        // Breakable cube collision
        if (gameState.currentMap === 'breakable_cubes') {
            for (let cube of gameState.breakableCubes) {
                if (cube.checkCollision(this)) {
                    this.onGround = true;
                }
            }
        }

        // Ground collision
        if (this.y + this.height >= canvas.height - 50) {
            this.y = canvas.height - 50 - this.height;
            this.velY = 0;
            this.onGround = true;
        }

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        // Minigame boundary (local game only)
        if (gameState.inMinigame) {
            const midX = canvas.width / 2;
            if (this.name === 'Player 1' && this.x + this.width > midX) {
                this.x = midX - this.width;
            }
            if (this.name === 'Player 2' && this.x < midX) {
                this.x = midX;
            }
        }
    }

    attack() {
        if (this.attackCooldown === 0 && this.weapons.length > 0) {
            this.isAttacking = true;
            this.attackTimer = 15;
            this.attackCooldown = ATTACK_COOLDOWN;

            const weapon = this.getCurrentWeapon();

            // Attack recoil
            if (weapon && this.onGround) {
                const isIce = gameState.currentMap === 'ice';
                const recoilMultiplier = isIce ? 0.3 : 0.15;
                const recoilForce = weapon.damage * recoilMultiplier;
                const recoilDirection = this.facingRight ? -1 : 1;
                this.slideVel = recoilDirection * recoilForce;
            }

            return weapon;
        }
        return null;
    }

    updateTimers() {
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.attackTimer > 0) {
            this.attackTimer--;
        } else {
            this.isAttacking = false;
            this.hasHitThisAttack = false;
        }

        if (this.abilityActive && this.abilityDuration > 0) {
            this.abilityDuration--;
            if (this.abilityDuration === 0) {
                this.abilityActive = false;
                this.abilityCooldown = this.ability === 'teleport' ? 60 : 600;
            }
        }

        if (this.abilityCooldown > 0) this.abilityCooldown--;
    }

    activateAbility() {
        if (!this.ability || this.abilityActive || this.abilityCooldown > 0) {
            return false;
        }
        this.abilityActive = true;
        this.abilityDuration = this.ability === 'teleport' ? 1 : 600;
        return true;
    }

    isInvisible() {
        return this.abilityActive && this.ability === 'invisibility';
    }

    hasShield() {
        return this.abilityActive && this.ability === 'shield';
    }

    hasSpeed() {
        return this.abilityActive && this.ability === 'speed';
    }

    takeDamage(damage, knockbackDir = 0) {
        if (this.hasShield()) return;
        this.health -= damage;
        if (this.health < 0) this.health = 0;

        if (knockbackDir !== 0 && gameState.currentMap === 'ice') {
            this.slideVel = knockbackDir * damage * 0.3;
        }
    }

    // Multiplayer puppet: smooth interpolation toward received network state
    updatePuppet() {
        if (!this.targetState) return;

        this.interpAlpha = Math.min(this.interpAlpha + 0.2, 1.0);

        if (this.prevState) {
            this.x = lerp(this.prevState.x, this.targetState.x, this.interpAlpha);
            this.y = lerp(this.prevState.y, this.targetState.y, this.interpAlpha);
        } else {
            this.x = this.targetState.x;
            this.y = this.targetState.y;
        }

        this.facingRight = this.targetState.facingRight;
        this.isAttacking = this.targetState.isAttacking;
        this.currentWeaponIndex = this.targetState.currentWeapon !== undefined
            ? this.targetState.currentWeapon
            : this.currentWeaponIndex;
        this.health = this.targetState.hp !== undefined ? this.targetState.hp : this.health;
        this.isSpinJumping = this.targetState.isSpinJumping || false;
        this.spinAngle = this.targetState.spinAngle || 0;
        this.isDucking = this.targetState.isDucking || false;

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.isAttacking) {
            this.attackTimer++;
            if (this.attackTimer > 15) {
                this.isAttacking = false;
                this.attackTimer = 0;
            }
        }

        this.updateTimers();
    }

    // Multiplayer: get serializable state to send over network
    getState() {
        return {
            x: this.x,
            y: this.y,
            velX: this.velX,
            velY: this.velY,
            hp: this.health,
            facingRight: this.facingRight,
            isAttacking: this.isAttacking,
            currentWeapon: this.currentWeaponIndex,
            isSpinJumping: this.isSpinJumping,
            spinAngle: this.spinAngle,
            isDucking: this.isDucking
        };
    }

    // Multiplayer: receive network state for interpolation
    setState(state) {
        this.prevState = this.targetState ? { ...this.targetState } : { ...state };
        this.targetState = state;
        this.interpAlpha = 0;
    }

    draw() {
        if (this.isInvisible()) ctx.globalAlpha = 0.2;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        if (this.isSpinJumping) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.spinAngle);
            ctx.translate(-cx, -cy);
        }

        ctx.fillStyle = this.color;

        if (this.isDucking) {
            // Duck crouch
            ctx.beginPath();
            ctx.ellipse(cx, this.y + this.height - 15, this.width / 2 + 8, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, this.y + this.height - 32, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            const duckEyeX = this.facingRight ? cx + 4 : cx - 4;
            ctx.beginPath();
            ctx.arc(duckEyeX, this.y + this.height - 35, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Normal body (oval)
            ctx.beginPath();
            ctx.ellipse(cx, cy + 5, this.width / 2, this.height / 2 - 5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx, this.y + 15, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'black';
            const eyeX = this.facingRight ? cx + 4 : cx - 4;
            ctx.beginPath();
            ctx.arc(eyeX, this.y + 12, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;

        if (this.hasShield()) {
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 40, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (!this.isDucking) {
            this.drawWeapon();
        }

        if (this.isSpinJumping) {
            ctx.restore();
        }

        // Name tag (above player)
        ctx.fillStyle = '#fff';
        ctx.font = '14px VT323, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, cx, this.y - 28);

        // Health bar
        const barWidth = 50, barHeight = 5;
        const barX = this.x - 5, barY = this.y - 15;
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(barX, barY, (this.health / this.maxHealth) * barWidth, barHeight);

        // Ability bar
        if (this.ability) {
            const abilityBarY = this.y - 25;
            const maxCooldown = this.ability === 'teleport' ? 60 : 600;

            if (this.abilityActive && this.ability !== 'teleport') {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
                ctx.fillRect(barX, abilityBarY, (this.abilityDuration / 600) * barWidth, 3);
            } else if (this.abilityCooldown > 0) {
                ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
                ctx.fillRect(barX, abilityBarY, ((maxCooldown - this.abilityCooldown) / maxCooldown) * barWidth, 3);
            } else {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                ctx.fillRect(barX, abilityBarY, barWidth, 3);
            }
        }
    }

    drawWeapon() {
        const weapon = this.getCurrentWeapon();
        if (!weapon) return;

        const offset = this.facingRight ? this.width : 0;
        const direction = this.facingRight ? 1 : -1;
        const handX = this.x + offset;
        const handY = this.y + this.height / 2;
        const angleOffset = this.isAttacking ? (15 - this.attackTimer) * 6 : 0;

        if (weapon.name === "Sword") {
            ctx.strokeStyle = '#C0C0C0'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(handX, handY);
            ctx.lineTo(handX + direction * 35, handY - angleOffset); ctx.stroke();
            ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 8;
            ctx.beginPath(); ctx.moveTo(handX - direction * 5, handY);
            ctx.lineTo(handX + direction * 5, handY); ctx.stroke();

        } else if (weapon.name === "Banana Sword") {
            ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(handX + direction * 15, handY - 10 - angleOffset / 2, 20,
                   direction > 0 ? 0.5 : 2.6, direction > 0 ? 2.6 : 0.5);
            ctx.stroke();

        } else if (weapon.name === "Fish") {
            ctx.fillStyle = '#4682B4';
            ctx.beginPath();
            ctx.ellipse(handX + direction * 15, handY - angleOffset / 2, 18, 8,
                       direction > 0 ? 0 : Math.PI, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(handX + direction * 30, handY - angleOffset / 2);
            ctx.lineTo(handX + direction * 35, handY - 5 - angleOffset / 2);
            ctx.lineTo(handX + direction * 35, handY + 5 - angleOffset / 2);
            ctx.closePath();
            ctx.fill();

        } else if (weapon.name === "Frying Pan") {
            ctx.fillStyle = '#708090';
            ctx.beginPath(); ctx.arc(handX + direction * 25, handY - angleOffset / 2, 12, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handX + direction * 15, handY - angleOffset / 3); ctx.stroke();

        } else if (weapon.name === "Giant Lollipop") {
            const lcols = ['#FF69B4', '#FF1493', '#FFC0CB'];
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = lcols[i]; ctx.beginPath();
                ctx.arc(handX + direction * 25, handY - angleOffset / 2, 12 - i * 4, i * Math.PI / 3, (i + 2) * Math.PI / 3); ctx.fill();
            }
            ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handX + direction * 18, handY - angleOffset / 3); ctx.stroke();

        } else if (weapon.name === "Lightsaber") {
            ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 8;
            ctx.shadowBlur = 10; ctx.shadowColor = '#00FFFF';
            ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handX + direction * 40, handY - angleOffset); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#808080'; ctx.fillRect(handX - direction * 8, handY - 3, direction * 10, 6);

        } else if (weapon.name === "Chainsaw") {
            ctx.fillStyle = '#FF4500'; ctx.fillRect(handX + direction * 5, handY - 8 - angleOffset / 3, direction * 25, 16);
            ctx.fillStyle = '#C0C0C0';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(handX + direction * (8 + i * 5), handY - 8 - angleOffset / 3);
                ctx.lineTo(handX + direction * (10 + i * 5), handY - 12 - angleOffset / 3);
                ctx.lineTo(handX + direction * (12 + i * 5), handY - 8 - angleOffset / 3);
                ctx.fill();
            }

        } else if (weapon.name === "Electric Guitar") {
            ctx.fillStyle = '#8B008B';
            ctx.beginPath(); ctx.ellipse(handX + direction * 20, handY - angleOffset / 2, 15, 10, direction > 0 ? -0.3 : 0.3, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handX + direction * 35, handY - 5 - angleOffset / 2); ctx.stroke();
            if (this.isAttacking) {
                ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath(); ctx.moveTo(handX + direction * 20, handY - 10);
                    ctx.lineTo(handX + direction * (25 + i * 5), handY - 15 - i * 3); ctx.stroke();
                }
            }

        } else if (weapon.name === "Bow") {
            ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(handX + direction * 10, handY, 15,
                   direction > 0 ? -Math.PI / 2 : Math.PI / 2,
                   direction > 0 ? Math.PI / 2 : -Math.PI / 2);
            ctx.stroke();
            if (this.isAttacking) {
                ctx.strokeStyle = '#D2691E'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(handX + direction * 10, handY); ctx.lineTo(handX + direction * 30, handY); ctx.stroke();
            }

        } else if (weapon.name === "Gun") {
            ctx.fillStyle = '#2F4F4F'; ctx.fillRect(handX, handY - 5, direction * 20, 10);
            ctx.fillStyle = '#000000'; ctx.fillRect(handX + direction * 20, handY - 3, direction * 8, 6);

        } else if (weapon.name === "Water Gun") {
            ctx.fillStyle = '#00BFFF'; ctx.fillRect(handX, handY - 6, direction * 22, 12);
            ctx.fillStyle = '#FFD700'; ctx.fillRect(handX + direction * 22, handY - 3, direction * 6, 6);
            if (this.isAttacking) {
                ctx.fillStyle = 'rgba(0, 191, 255, 0.5)';
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath(); ctx.arc(handX + direction * (28 + i * 5), handY + (Math.random() - 0.5) * 10, 2, 0, Math.PI * 2); ctx.fill();
                }
            }

        } else if (weapon.name === "Snowball Launcher") {
            ctx.fillStyle = '#ADD8E6'; ctx.fillRect(handX, handY - 7, direction * 25, 14);
            if (this.isAttacking) {
                ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(handX + direction * 30, handY, 5, 0, Math.PI * 2); ctx.fill();
            }

        } else if (weapon.name === "Confetti Cannon") {
            ctx.fillStyle = '#FFD700'; ctx.fillRect(handX, handY - 8, direction * 20, 16);
            if (this.isAttacking) {
                const ccols = ['#FF69B4', '#00FF00', '#FFFF00', '#FF0000', '#0000FF'];
                for (let i = 0; i < 8; i++) {
                    ctx.fillStyle = ccols[i % ccols.length];
                    ctx.fillRect(handX + direction * (22 + i * 3), handY + (Math.random() - 0.5) * 15, 3, 3);
                }
            }

        } else if (weapon.name === "Boomerang") {
            ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(handX + direction * 5, handY - 10 - angleOffset / 3);
            ctx.lineTo(handX + direction * 15, handY - angleOffset / 3);
            ctx.lineTo(handX + direction * 5, handY + 10 - angleOffset / 3);
            ctx.stroke();

        } else if (weapon.name === "Firework Launcher") {
            ctx.fillStyle = '#DC143C'; ctx.fillRect(handX, handY - 10, direction * 28, 20);
            if (this.isAttacking) {
                ctx.fillStyle = '#FFD700';
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath(); ctx.arc(handX + direction * (30 + i * 4), handY + (Math.random() - 0.5) * 12, 3, 0, Math.PI * 2); ctx.fill();
                }
            }

        } else if (weapon.name === "Bomb Thrower") {
            ctx.fillStyle = '#2F4F4F'; ctx.fillRect(handX, handY - 9, direction * 25, 18);
            if (this.isAttacking) {
                ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(handX + direction * 30, handY, 6, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#FF4500'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(handX + direction * 30, handY - 6); ctx.lineTo(handX + direction * 32, handY - 12); ctx.stroke();
            }

        } else if (weapon.name === "Bazooka") {
            ctx.fillStyle = '#556B2F'; ctx.fillRect(handX - direction * 5, handY - 12, direction * 40, 24);
            ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(handX + direction * 35, handY, 13, 0, Math.PI * 2); ctx.fill();
            if (this.isAttacking) {
                ctx.fillStyle = '#FF4500'; ctx.fillRect(handX + direction * 38, handY - 5, direction * 15, 10);
                ctx.fillStyle = '#FFA500';
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(handX + direction * (38 - i * 5), handY - 3 + (Math.random() - 0.5) * 8, direction * 5, 6);
                }
            }

        } else if (weapon.name === "Disco Ball") {
            // Mina's weapon! Rainbow sparkle ball
            const hue = (Date.now() / 10) % 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            ctx.beginPath(); ctx.arc(handX + direction * 20, handY - angleOffset / 2, 14, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'white'; ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(handX + direction * 20 + Math.cos(a) * 6, handY - angleOffset / 2 + Math.sin(a) * 6);
                ctx.lineTo(handX + direction * 20 + Math.cos(a) * 14, handY - angleOffset / 2 + Math.sin(a) * 14);
                ctx.stroke();
            }

        } else {
            // Default weapon
            ctx.strokeStyle = weapon.type === 'melee' ? '#888' : '#FFD700';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(handX, handY);
            if (this.isAttacking) ctx.lineTo(handX + direction * 30, handY - angleOffset);
            else ctx.lineTo(handX, handY + 20);
            ctx.stroke();
        }
    }

    checkMeleeHit(other) {
        if (!this.isAttacking) return false;
        if (other.isInvisible()) return false;

        const weapon = this.getCurrentWeapon();
        if (!weapon || weapon.type !== 'melee') return false;

        const distance = Math.abs(this.x - other.x);
        if (distance > 60) return false;

        if (this.facingRight && other.x < this.x) return false;
        if (!this.facingRight && other.x > this.x) return false;

        const verticalAlign = Math.abs((this.y + this.height / 2) - (other.y + other.height / 2)) < 40;

        if (verticalAlign && this.attackTimer >= 10 && this.attackTimer <= 14) {
            if (!this.hasHitThisAttack) {
                this.hasHitThisAttack = true;
                return true;
            }
        }

        return false;
    }
}

// =============================================================================
// DRAWING HELPERS
// =============================================================================

function drawTree(x, y) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, 20, 100);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x + 10, y, 40, 0, Math.PI * 2);
    ctx.fill();
}

function drawCloud(x, y) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 30, y, 35, 0, Math.PI * 2);
    ctx.arc(x + 60, y, 30, 0, Math.PI * 2);
    ctx.fill();
}

// drawBackground — works for both local (uses gameState.currentMap snake_case)
// and multiplayer (uses mapName Title Case). Pass whichever you have.
function drawBackground(mapIdentifier) {
    // Normalize: accept either 'ice' or 'Ice', 'alien_invasion' or 'Alien Invasion', etc.
    const m = (mapIdentifier || '').toLowerCase().replace(/ /g, '_');

    if (m === 'ice') {
        ctx.fillStyle = '#E0F6FF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#B0C4DE';
        ctx.beginPath(); ctx.moveTo(0, canvas.height - 150); ctx.lineTo(200, canvas.height - 350); ctx.lineTo(400, canvas.height - 150); ctx.fill();
        ctx.beginPath(); ctx.moveTo(300, canvas.height - 150); ctx.lineTo(500, canvas.height - 400); ctx.lineTo(700, canvas.height - 150); ctx.fill();
        ctx.beginPath(); ctx.moveTo(600, canvas.height - 150); ctx.lineTo(800, canvas.height - 380); ctx.lineTo(1000, canvas.height - 150); ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.moveTo(180, canvas.height - 330); ctx.lineTo(200, canvas.height - 350); ctx.lineTo(220, canvas.height - 330); ctx.fill();
        ctx.beginPath(); ctx.moveTo(480, canvas.height - 380); ctx.lineTo(500, canvas.height - 400); ctx.lineTo(520, canvas.height - 380); ctx.fill();
        ctx.beginPath(); ctx.moveTo(780, canvas.height - 360); ctx.lineTo(800, canvas.height - 380); ctx.lineTo(820, canvas.height - 360); ctx.fill();
        ctx.fillStyle = '#F0F8FF';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    } else if (m === 'alien_invasion') {
        ctx.fillStyle = '#0a0a20';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            ctx.fillRect((i * 73) % canvas.width, (i * 127) % (canvas.height - 100), 2, 2);
        }
        ctx.fillStyle = '#1a1a30';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    } else if (m === 'volcano') {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#8B4513'); grad.addColorStop(1, '#CD5C5C');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    } else if (m === 'breakable_cubes') {
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(0, 0, canvas.width, canvas.height - 50);
        const acidGrad = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
        acidGrad.addColorStop(0, '#00FF00'); acidGrad.addColorStop(1, '#32CD32');
        ctx.fillStyle = acidGrad;
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 10; i++) {
            const bx = (i * 120 + Date.now() / 20) % canvas.width;
            const bs = 5 + Math.sin(Date.now() / 100 + i) * 3;
            ctx.beginPath(); ctx.arc(bx, canvas.height - 25, bs, 0, Math.PI * 2); ctx.fill();
        }

    } else {
        // Normal / Comet Field / fallback — bright sky with trees and clouds
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        drawTree(50, canvas.height - 150);
        drawTree(1100, canvas.height - 150);
        drawCloud(300, 100);
        drawCloud(800, 150);
    }
}
