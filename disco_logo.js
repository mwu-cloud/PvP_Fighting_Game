// ============================================================
// disco_logo.js  —  shared disco ball + yeti drawing code
// Used by both index.html (large) and multiplayer.html (small)
// ============================================================

/**
 * Draw the disco ball on a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx      - horizontal centre of ball
 * @param {number} ballY   - vertical centre of ball
 * @param {number} ballR   - radius of ball
 * @param {number} angle   - current shimmer rotation angle (incremented by caller)
 */
function drawDiscoBall(ctx, cx, ballY, ballR, angle) {
    // String from top
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = Math.max(1, ballR * 0.025);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, ballY - ballR);
    ctx.stroke();

    // Iridescent glow
    const t = Date.now() / 800;
    const glowR = (Math.sin(t) + 1) / 2;
    const glowG = (Math.sin(t + 2) + 1) / 2;
    const glowB = (Math.sin(t + 4) + 1) / 2;
    const grd = ctx.createRadialGradient(cx, ballY, ballR * 0.3, cx, ballY, ballR * 2.2);
    grd.addColorStop(0, `rgba(${Math.floor(glowR*255)},${Math.floor(glowG*255)},${Math.floor(glowB*255)},0.35)`);
    grd.addColorStop(0.5, `rgba(${Math.floor(glowR*200)},${Math.floor(glowB*255)},${Math.floor(glowG*200)},0.15)`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, ballY, ballR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Ball base (silver sphere)
    const ballGrd = ctx.createRadialGradient(cx - ballR * 0.28, ballY - ballR * 0.28, ballR * 0.07, cx, ballY, ballR);
    ballGrd.addColorStop(0, '#ffffff');
    ballGrd.addColorStop(0.3, '#c0c8d8');
    ballGrd.addColorStop(0.7, '#7080a0');
    ballGrd.addColorStop(1, '#303850');
    ctx.fillStyle = ballGrd;
    ctx.beginPath();
    ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
    ctx.fill();

    // Mirror tiles
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
    ctx.clip();

    const TILE = Math.max(4, Math.floor(ballR * 0.2));
    const cols = Math.ceil((ballR * 2) / TILE) + 2;
    const rows = Math.ceil((ballR * 2) / TILE) + 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tx = cx - ballR - TILE + col * TILE;
            const ty = ballY - ballR - TILE + row * TILE;
            const shimmer = (Math.sin(angle + col * 0.8 + row * 0.6) + 1) / 2;
            const bright = Math.floor(100 + shimmer * 155);
            const hue = (angle * 40 + col * 25 + row * 35) % 360;
            const sat = shimmer > 0.7 ? 60 : 10;
            ctx.fillStyle = `hsl(${hue}, ${sat}%, ${Math.floor(bright * 0.6)}%)`;
            ctx.fillRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
            if (shimmer > 0.85) {
                ctx.fillStyle = `rgba(255,255,255,${(shimmer - 0.85) * 4})`;
                ctx.fillRect(tx + 2, ty + 2, TILE - 4, TILE - 4);
            }
        }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 0.5;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tx = cx - ballR - TILE + col * TILE;
            const ty = ballY - ballR - TILE + row * TILE;
            ctx.strokeRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
        }
    }
    ctx.restore();

    // Specular highlight
    const spec = ctx.createRadialGradient(cx - ballR * 0.3, ballY - ballR * 0.3, ballR * 0.03, cx - ballR * 0.2, ballY - ballR * 0.2, ballR * 0.4);
    spec.addColorStop(0, 'rgba(255,255,255,0.9)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draw the cute yeti peeking out the top of the disco ball.
 * The yeti is fully round and chibi — huge happy eyes, big smile, rosy cheeks.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx      - horizontal centre (same as ball)
 * @param {number} topY    - top edge of the ball (ballY - ballR)
 * @param {number} scale   - 1.0 for large (index.html), 0.4 for small (multiplayer.html)
 */
function drawYeti(ctx, cx, topY, scale) {
    const s = scale;
    // head sits centred above the ball top
    const headR = 22 * s;
    const headX = cx;
    const headY = topY - headR * 0.6; // overlaps ball slightly so it looks like peeking

    // --- shoulders / body stub peeking over ball ---
    ctx.fillStyle = '#dce8f5';
    ctx.beginPath();
    ctx.ellipse(headX, topY + headR * 0.3, headR * 1.4, headR * 0.8, 0, Math.PI, 0);
    ctx.fill();

    // --- fluffy ear puffs (drawn before head so head sits on top) ---
    // outer white puff
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(headX - headR * 0.95, headY - headR * 0.5, headR * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headX + headR * 0.95, headY - headR * 0.5, headR * 0.42, 0, Math.PI * 2); ctx.fill();
    // inner tinted puff
    ctx.fillStyle = '#dce8f5';
    ctx.beginPath(); ctx.arc(headX - headR * 0.95, headY - headR * 0.5, headR * 0.26, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headX + headR * 0.95, headY - headR * 0.5, headR * 0.26, 0, Math.PI * 2); ctx.fill();

    // --- head (round, slightly taller than wide — chibi proportion) ---
    ctx.fillStyle = '#dce8f5';
    ctx.beginPath();
    ctx.ellipse(headX, headY, headR * 1.0, headR * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // subtle fur tuft on top of head
    ctx.fillStyle = '#c8d8ed';
    ctx.beginPath();
    ctx.ellipse(headX, headY - headR * 0.95, headR * 0.4, headR * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- rosy cheeks (draw before eyes so eyes sit on top) ---
    ctx.fillStyle = 'rgba(255, 160, 170, 0.45)';
    ctx.beginPath(); ctx.ellipse(headX - headR * 0.6, headY + headR * 0.18, headR * 0.35, headR * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX + headR * 0.6, headY + headR * 0.18, headR * 0.35, headR * 0.22, 0, 0, Math.PI * 2); ctx.fill();

    // --- big cute eyes ---
    // white sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(headX - headR * 0.32, headY - headR * 0.1, headR * 0.28, headR * 0.33, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX + headR * 0.32, headY - headR * 0.1, headR * 0.28, headR * 0.33, 0, 0, Math.PI * 2); ctx.fill();
    // blue iris
    ctx.fillStyle = '#5BC8F5';
    ctx.beginPath(); ctx.ellipse(headX - headR * 0.32, headY - headR * 0.08, headR * 0.2, headR * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX + headR * 0.32, headY - headR * 0.08, headR * 0.2, headR * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    // dark pupil
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.ellipse(headX - headR * 0.30, headY - headR * 0.06, headR * 0.11, headR * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX + headR * 0.34, headY - headR * 0.06, headR * 0.11, headR * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    // eye shine (little sparkle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(headX - headR * 0.24, headY - headR * 0.16, headR * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headX + headR * 0.40, headY - headR * 0.16, headR * 0.06, 0, Math.PI * 2); ctx.fill();

    // --- tiny round nose ---
    ctx.fillStyle = '#7a5c4a';
    ctx.beginPath();
    ctx.ellipse(headX, headY + headR * 0.22, headR * 0.13, headR * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- big happy smile ---
    ctx.strokeStyle = '#7a5c4a';
    ctx.lineWidth = Math.max(1.2, 2 * s);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(headX, headY + headR * 0.18, headR * 0.42, 0.25, Math.PI - 0.25);
    ctx.stroke();
}

/**
 * Draw light beams radiating from the disco ball onto a full-screen canvas.
 * @param {CanvasRenderingContext2D} bctx   - beam canvas context
 * @param {number} bw    - beam canvas width
 * @param {number} bh    - beam canvas height
 * @param {number} ballX - ball centre X in page coords
 * @param {number} ballY - ball centre Y in page coords
 * @param {number} ballR - ball radius (in canvas px)
 * @param {Array}  beams - beam state array (mutated in place)
 */
function drawBeams(bctx, bw, bh, ballX, ballY, ballR, beams) {
    bctx.clearRect(0, 0, bw, bh);
    for (const b of beams) {
        b.angle += b.speed * 0.012;
        const maxLen = Math.max(bw, bh) * b.length;
        const endX = ballX + Math.cos(b.angle) * maxLen;
        const endY = ballY + Math.sin(b.angle) * maxLen;

        const hex = b.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const bl = parseInt(hex.slice(5, 7), 16);

        const grd = bctx.createLinearGradient(ballX, ballY, endX, endY);
        grd.addColorStop(0, `rgba(${r},${g},${bl},${b.alpha})`);
        grd.addColorStop(1, `rgba(${r},${g},${bl},0)`);
        bctx.strokeStyle = grd;
        bctx.lineWidth = b.width;
        bctx.beginPath();
        bctx.moveTo(ballX, ballY);
        bctx.lineTo(endX, endY);
        bctx.stroke();

        const flash = (Math.sin(Date.now() / 150 + b.angle * 3) + 1) / 2;
        bctx.fillStyle = `rgba(${r},${g},${bl},${flash * 0.9})`;
        bctx.beginPath();
        bctx.arc(ballX + Math.cos(b.angle) * (ballR + 5), ballY + Math.sin(b.angle) * (ballR + 5), 3 + flash * 3, 0, Math.PI * 2);
        bctx.fill();
    }
}

/**
 * Create a fresh array of beam state objects.
 */
function makeBeams() {
    const beamColors = ['#ff00ff','#00ffff','#ff4500','#00ff88','#ffff00','#ff69b4','#00bfff'];
    const beams = [];
    for (let i = 0; i < 12; i++) {
        beams.push({
            angle: (i / 12) * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.5,
            color: beamColors[i % beamColors.length],
            length: 0.5 + Math.random() * 0.7,
            width: 3 + Math.random() * 5,
            alpha: 0.15 + Math.random() * 0.25,
        });
    }
    return beams;
}
