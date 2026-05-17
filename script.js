// ========== VARIABEL GLOBAL ==========
const imgBMerah = new Image();
imgBMerah.src = 'asset/b-merah.png';
const imgBPutih = new Image();
imgBPutih.src = 'asset/b-putih.png';
const imgKoin = new Image();
imgKoin.src = 'asset/koin.png';
const imgLoncat = new Image();
imgLoncat.src = 'asset/loncat.png';
const imgMaju1 = new Image();
imgMaju1.src = 'asset/maju-frame1.png';
const imgMaju2 = new Image();
imgMaju2.src = 'asset/maju-frame2.png';
const imgJalan = new Image();
imgJalan.src = 'asset/jalan.png';

let playerFacingRight = true;

function showCustomAlert(msg) {
    document.getElementById('custom-alert-text').innerHTML = msg;
    document.getElementById('custom-alert-overlay').style.display = 'flex';
}

function closeCustomAlert() {
    document.getElementById('custom-alert-overlay').style.display = 'none';
}

const bgm = document.getElementById('bgm');
let soundEnabled = true;

let totalKoin = parseInt(localStorage.getItem('jhonRunKoin')) || 0;
let totalEfek = parseInt(localStorage.getItem('jhonRunEfek')) || 0;

let originalEfek = parseInt(localStorage.getItem('jhonRunOriginalEfek')) || 0;
let originalKoin = parseInt(localStorage.getItem('jhonRunOriginalKoin')) || 0;
let isAdminMode = localStorage.getItem('jhonRunAdmin') === 'true';

if (isAdminMode) {
    document.getElementById('admin-badge').style.display = 'inline';
}

function masukMenuPlay() {
    switchScreen('screen-menu');
    if (soundEnabled) {
        bgm.volume = 0.4;
        bgm.play().catch(e => {});
    }
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'screen-shop') {
        document.getElementById('shop-koin').textContent = `KOIN: ${isAdminMode ? '999+' : totalKoin}`;
        document.getElementById('shop-efek').textContent = `EFEK DIMILIKI: ${isAdminMode ? '999+' : totalEfek}`;
    } else if (screenId === 'screen-game') {
        document.getElementById('start-overlay').style.display = 'flex';
        resizeCanvas();
        renderInitialFrame();
    } else {
        stopGame();
    }
}

function quitGame() {
    stopGame();
    document.getElementById('popup-overlay').style.display = 'none';
    isDead = false;
    isPaused = false;
    switchScreen('screen-menu');
}

function beliEfek() {
    if (totalKoin >= 5) {
        if (!isAdminMode) {
            totalKoin -= 5;
            totalEfek += 1;
            localStorage.setItem('jhonRunKoin', totalKoin);
            localStorage.setItem('jhonRunEfek', totalEfek);
        }
        document.getElementById('shop-koin').textContent = `KOIN: ${isAdminMode ? '999+' : totalKoin}`;
        document.getElementById('shop-efek').textContent = `EFEK DIMILIKI: ${isAdminMode ? '999+' : totalEfek}`;
    } else {
        showCustomAlert("KOIN KUNING LU KURANG BANG!<br><span style='font-size:20px; color:white; text-shadow:2px 2px 0 #000;'>MAIN LAGI CARI KOIN!</span>");
    }
}

function cekKey() {
    const key = document.getElementById('input-key').value.trim().toUpperCase();
    if (key === 'JHON338') {
        if (!isAdminMode) {
            originalEfek = totalEfek;
            originalKoin = totalKoin;
            localStorage.setItem('jhonRunOriginalEfek', originalEfek);
            localStorage.setItem('jhonRunOriginalKoin', originalKoin);

            isAdminMode = true;
            localStorage.setItem('jhonRunAdmin', 'true');

            totalEfek = 9999;
            totalKoin = 9999;
            localStorage.setItem('jhonRunEfek', totalEfek);
            localStorage.setItem('jhonRunKoin', totalKoin);

            document.getElementById('admin-badge').style.display = 'inline';
            showCustomAlert("MODE ADMIN AKTIF!<br><span style='font-size:20px; color:white; text-shadow:2px 2px 0 #000;'>EFEK & KOIN UNLIMITED (999+)</span>");
        } else {
            showCustomAlert("MODE ADMIN SUDAH AKTIF BANG!");
        }
    } else if (key === 'JHON') {
        if (isAdminMode) {
            isAdminMode = false;
            localStorage.setItem('jhonRunAdmin', 'false');

            totalEfek = originalEfek;
            totalKoin = originalKoin;
            localStorage.setItem('jhonRunEfek', totalEfek);
            localStorage.setItem('jhonRunKoin', totalKoin);

            document.getElementById('admin-badge').style.display = 'none';
            showCustomAlert("KEMBALI KE MODE NORMAL!");
        } else {
            showCustomAlert("LU BELUM MASUK MODE ADMIN!");
        }
    } else if (key === 'JHONFREE') {
        totalEfek += 10;
        localStorage.setItem('jhonRunEfek', totalEfek);
        showCustomAlert("MANTAP!<br><span style='font-size:20px; color:white; text-shadow:2px 2px 0 #000;'>DAPAT 10 EFEK GRATIS!</span>");
    } else {
        showCustomAlert("KEY SALAH BANG!");
    }
    document.getElementById('input-key').value = '';
}

const btnSuaraOn = document.getElementById('btn-suara-on');
const btnSuaraOff = document.getElementById('btn-suara-off');

function setSound(isOn) {
    soundEnabled = isOn;
    if (soundEnabled) {
        btnSuaraOn.style.backgroundColor = '#ff3131';
        btnSuaraOn.style.color = 'white';
        btnSuaraOff.style.backgroundColor = 'white';
        btnSuaraOff.style.color = 'black';
        if (!document.getElementById('screen-splash').classList.contains('active')) bgm.play().catch(e => {});
    } else {
        btnSuaraOff.style.backgroundColor = '#ff3131';
        btnSuaraOff.style.color = 'white';
        btnSuaraOn.style.backgroundColor = 'white';
        btnSuaraOn.style.color = 'black';
        bgm.pause();
    }
}
setSound(true);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const uiScore = document.getElementById('ui-score');
const uiHigh = document.getElementById('ui-high');
const uiJarak = document.getElementById('ui-jarak');
const uiKoin = document.getElementById('ui-koin');
const btnUseEffect = document.getElementById('btn-use-effect');

const popupOverlay = document.getElementById('popup-overlay');
const popupMainText = document.getElementById('popup-main-text');
const popupSubText = document.getElementById('popup-sub-text');
const btnLanjut = document.getElementById('btn-lanjut');

let highScore = localStorage.getItem('jhonRunScoreV3') || 0;
uiHigh.textContent = `HIGH: ${highScore}`;

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);

let frameCount = 0;
let animationId;
let gameRunning = false;
let isPaused = false;
let isDead = false;
let distance_meters = 0;
let totalScore = 0;

let effectActive = false;
let effectTimer = 0;

const player = {
    x: 50,
    y: 0,
    r: 20,
    vx: 0,
    vy: 0,
    speed: 4.5,
    jumpPower: -12,
    onGround: false,
    isClimbing: false
};
const gravity = 0.6;
let obstacles = [];
let platforms = [];
let points = [];

let blockCounter = 0;
let nextCoinBlock = 4;

function renderInitialFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imgJalan.complete && imgJalan.naturalHeight !== 0) {
        ctx.drawImage(imgJalan, 0, canvas.height - 30, canvas.width, 30);
    } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 30);
        ctx.lineTo(canvas.width, canvas.height - 30);
        ctx.stroke();
    }

    uiKoin.textContent = `KOIN: ${isAdminMode ? '999+' : totalKoin}`;
    btnUseEffect.textContent = `PAKAI EFEK (${isAdminMode ? '999+' : totalEfek})`;
    btnUseEffect.style.background = "transparent";
}

function gameLoop() {
    if (!gameRunning) return;
    updateGame();
    animationId = requestAnimationFrame(gameLoop);
}

function startGameFlow() {
    document.getElementById('start-overlay').style.display = 'none';

    gameRunning = true;
    isPaused = false;
    isDead = false;
    popupOverlay.style.display = 'none';

    distance_meters = 0;
    totalScore = 0;
    frameCount = 0;
    blockCounter = 0;
    nextCoinBlock = 4;

    effectActive = false;
    effectTimer = 0;
    btnUseEffect.textContent = `PAKAI EFEK (${isAdminMode ? '999+' : totalEfek})`;
    btnUseEffect.style.background = "transparent";

    uiScore.textContent = `SCOR: 0`;
    uiJarak.textContent = `JARAK: 0M`;
    uiKoin.textContent = `KOIN: ${isAdminMode ? '999+' : totalKoin}`;

    obstacles = [];
    platforms = [];
    points = [];
    player.x = 50;
    player.y = canvas.height - 30 - (player.r * 2);
    player.vy = 0;
    playerFacingRight = true;

    if (soundEnabled) bgm.play().catch(e => {});
    cancelAnimationFrame(animationId);
    gameLoop();
}

function stopGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
}

function pakaiEfek() {
    if (!gameRunning || isPaused || isDead || effectActive) return;
    if (totalEfek > 0) {
        if (!isAdminMode) {
            totalEfek -= 1;
            localStorage.setItem('jhonRunEfek', totalEfek);
        }
        effectActive = true;
        effectTimer = 600;
        btnUseEffect.style.background = "transparent";
    }
}

function togglePause() {
    if (isDead) return;
    isPaused = !isPaused;
    if (isPaused) {
        popupMainText.textContent = "JEDA";
        popupMainText.style.color = "white";
        popupSubText.textContent = "";
        btnLanjut.style.display = "block";
        popupOverlay.style.display = 'flex';
        if (gameRunning) bgm.pause();
    } else {
        popupOverlay.style.display = 'none';
        if (soundEnabled) bgm.play();
    }
}

function gameOver() {
    stopGame();
    isDead = true;

    popupMainText.textContent = "MATI KAU BANG!";
    popupMainText.style.color = "#ff3131";
    popupSubText.textContent = "COBA LAGI!";

    btnLanjut.style.display = "none";
    popupOverlay.style.display = 'flex';

    if (totalScore > highScore) {
        highScore = totalScore;
        localStorage.setItem('jhonRunScoreV3', highScore);
        uiHigh.textContent = `HIGH: ${highScore}`;
    }
}

function generateWorld() {
    if (platforms.length === 0 || platforms[platforms.length - 1].x < canvas.width - 200) {
        blockCounter++;
        let pX = canvas.width + Math.random() * 50;
        let pY = canvas.height - 30 - 60 - Math.random() * 30;
        let pW = 80;
        platforms.push({
            x: pX,
            y: pY,
            w: pW,
            h: 20
        });

        if (blockCounter === nextCoinBlock) {
            let numCoins = Math.random() < 0.5 ? 1 : 2;
            points.push({
                x: pX + (pW / 2) - (numCoins === 2 ? 15 : 0),
                y: pY - 20,
                r: 12,
                collected: false
            });
            if (numCoins === 2) {
                points.push({
                    x: pX + (pW / 2) + 15,
                    y: pY - 20,
                    r: 12,
                    collected: false
                });
            }
            nextCoinBlock += Math.floor(Math.random() * 2) + 2;
        }
    }

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 250) {
        obstacles.push({
            x: canvas.width + 100 + Math.random() * 100,
            y: canvas.height - 30 - 35,
            w: 35,
            h: 35
        });
    }
}

function rectIntersect(r1, r2) {
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function updateGame() {
    if (isPaused || isDead) return;

    let bgSpeed = 2.5;
    let obsSpeed = 3.5;

    if (effectActive) {
        effectTimer--;
        bgSpeed = 5.0;
        obsSpeed = 6.0;
        player.speed = 8;
        btnUseEffect.textContent = `EFEK AKTIF! (${Math.ceil(effectTimer / 60)}s)`;

        if (effectTimer <= 0) {
            effectActive = false;
            player.speed = 4.5;
            btnUseEffect.style.background = "transparent";
            btnUseEffect.textContent = `PAKAI EFEK (${isAdminMode ? '999+' : totalEfek})`;
        }
    }

    if (!player.isClimbing) player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    if (player.x - player.r < 0) player.x = player.r;
    if (player.x + player.r > canvas.width) player.x = canvas.width - player.r;

    const floorY = canvas.height - 30;
    if (player.y + player.r > floorY) {
        player.y = floorY - player.r;
        player.vy = 0;
        player.onGround = true;
        player.isClimbing = false;
    }

    distance_meters += (effectActive ? 0.1 : 0.05);
    totalScore = Math.floor(distance_meters * 15);
    uiJarak.textContent = `JARAK: ${Math.floor(distance_meters)}M`;
    uiScore.textContent = `SCOR: ${totalScore}`;

    let pRect = {
        left: player.x - player.r,
        right: player.x + player.r,
        top: player.y - player.r,
        bottom: player.y + player.r
    };

    platforms.forEach(plat => {
        let platRect = {
            left: plat.x,
            right: plat.x + plat.w,
            top: plat.y,
            bottom: plat.y + plat.h
        };
        plat.x -= bgSpeed;

        if (rectIntersect(pRect, platRect)) {
            if (player.vy > 0 && player.y < plat.y) {
                player.y = plat.y - player.r;
                player.vy = 0;
                player.onGround = true;
                player.isClimbing = false;
            } else if (player.vy < 0 && player.y > plat.y) {
                player.y = plat.y + plat.h + player.r;
                player.vy = 0;
            }
        }
    });

    points.forEach((pt, index) => {
        pt.x -= bgSpeed;
        let ptRect = {
            left: pt.x - pt.r,
            right: pt.x + pt.r,
            top: pt.y - pt.r,
            bottom: pt.y + pt.r
        };
        if (!pt.collected && rectIntersect(pRect, ptRect)) {
            pt.collected = true;
            if (!isAdminMode) {
                totalKoin += 1;
                localStorage.setItem('jhonRunKoin', totalKoin);
            }
            uiKoin.textContent = `KOIN: ${isAdminMode ? '999+' : totalKoin}`;
        }
    });

    obstacles.forEach(obs => {
        obs.x -= obsSpeed;
        let obsRect = {
            left: obs.x,
            right: obs.x + obs.w,
            top: obs.y,
            bottom: obs.y + obs.h
        };
        if (!effectActive && rectIntersect(pRect, obsRect)) gameOver();
    });

    platforms = platforms.filter(p => p.x + p.w > 0);
    obstacles = obstacles.filter(o => o.x + o.w > 0);
    points = points.filter(pt => pt.x + pt.r > 0 && !pt.collected);

    generateWorld();
    drawGame();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imgJalan.complete && imgJalan.naturalHeight !== 0) {
        ctx.drawImage(imgJalan, 0, canvas.height - 30, canvas.width, 30);
    } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 30);
        ctx.lineTo(canvas.width, canvas.height - 30);
        ctx.stroke();
    }

    platforms.forEach(p => {
        if (imgBPutih.complete && imgBPutih.naturalHeight !== 0) {
            ctx.drawImage(imgBPutih, p.x, p.y, p.w, p.h);
        } else {
            ctx.fillStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.strokeRect(p.x, p.y, p.w, p.h);
        }
    });

    points.forEach(pt => {
        if (!pt.collected) {
            if (imgKoin.complete && imgKoin.naturalHeight !== 0) {
                ctx.drawImage(imgKoin, pt.x - pt.r, pt.y - pt.r, pt.r * 2, pt.r * 2);
            } else {
                ctx.fillStyle = '#ffde59';
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }
    });

    obstacles.forEach(o => {
        if (imgBMerah.complete && imgBMerah.naturalHeight !== 0) {
            ctx.drawImage(imgBMerah, o.x, o.y, o.w, o.h);
        } else {
            ctx.fillStyle = '#ff3131';
            ctx.lineWidth = 4;
            ctx.fillRect(o.x, o.y, o.w, o.h);
            ctx.strokeRect(o.x, o.y, o.w, o.h);
        }
    });

    if (effectActive) {
        ctx.save();
        ctx.font = '80px "Luckiest Guy", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffde59';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000';
        let sisaWaktu = Math.ceil(effectTimer / 60);
        ctx.strokeText(sisaWaktu, canvas.width / 2, canvas.height / 3);
        ctx.fillText(sisaWaktu, canvas.width / 2, canvas.height / 3);
        ctx.restore();
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    if (!playerFacingRight) {
        ctx.scale(-1, 1);
    }

    let currentImg = imgMaju1;

    if (!player.onGround && !player.isClimbing) {
        currentImg = imgLoncat;
    } else {
        if (player.vx !== 0) {
            currentImg = (Math.floor(frameCount / 8) % 2 === 0) ? imgMaju1 : imgMaju2;
        } else {
            currentImg = imgMaju1;
        }
    }

    if (currentImg.complete && currentImg.naturalHeight !== 0) {
        let imgSize = player.r * 2.5;
        ctx.drawImage(currentImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
    } else {
        ctx.beginPath();
        ctx.arc(0, 0, player.r, 0, Math.PI * 2);
        ctx.fillStyle = effectActive ? (frameCount % 10 < 5 ? '#38b6ff' : '#000') : '#000';
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();

    frameCount++;
}

function doMove(dir) {
    if (!gameRunning || isPaused || isDead) return;
    if (dir === 'left') {
        player.vx = -player.speed;
        playerFacingRight = false;
    }
    if (dir === 'right') {
        player.vx = player.speed;
        playerFacingRight = true;
    }
    player.isClimbing = false;
}

function stopMove() {
    player.vx = 0;
}

function doJumpOrClimb() {
    if (!gameRunning || isPaused || isDead) return;

    let pRect = {
        left: player.x - player.r,
        right: player.x + player.r,
        top: player.y - player.r,
        bottom: player.y + player.r
    };
    let isNearPlatform = false;

    platforms.forEach(plat => {
        let platRect = {
            left: plat.x,
            right: plat.x + plat.w,
            top: plat.y,
            bottom: plat.y + plat.h
        };
        if (rectIntersect(pRect, platRect)) isNearPlatform = true;
    });

    if (isNearPlatform) {
        if (player.vy >= -2) {
            player.isClimbing = true;
            player.vy = -4.5;
            player.onGround = false;
        }
    } else if (player.onGround) {
        player.vy = player.jumpPower;
        player.onGround = false;
        player.isClimbing = false;
    }
}

function bindBtn(id, startFunc, endFunc) {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startFunc();
    }, {
        passive: false
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        endFunc();
    }, {
        passive: false
    });
    btn.addEventListener('mousedown', startFunc);
    btn.addEventListener('mouseup', endFunc);
    btn.addEventListener('mouseleave', endFunc);
}

bindBtn('btn-left', () => doMove('left'), stopMove);
bindBtn('btn-right', () => doMove('right'), stopMove);
bindBtn('btn-jump', doJumpOrClimb, () => {
    player.isClimbing = false;
});