window.requestAnimationFrame =
    window.__requestAnimationFrame ||
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        (function () {
            return function (callback, element) {
                var lastTime = element.__lastTime;
                if (lastTime === undefined) {
                    lastTime = 0;
                }
                var currTime = Date.now();
                var timeToCall = Math.max(1, 33 - (currTime - lastTime));
                window.setTimeout(callback, timeToCall);
                element.__lastTime = currTime + timeToCall;
            };
        })();
window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()));

var mobile = window.isDevice;
var koef = mobile ? 0.5 : 1;
var valentineInitialized = false;

// Game variables
var gameActive = false; // Start as false (intro screen)
var score = 0;
var basket;
var gameArea;
var basketX = 50; // percentage
var cursorEffectEnabled = true; // Control cursor particle effect

// Initialize game
window.addEventListener('DOMContentLoaded', function() {
    basket = document.getElementById('basket');
    gameArea = document.getElementById('game-area');
    
    // Initialize cursor particle effect from the start
    initializeCursorEffect();
    
    // Handle start button click
    var startButton = document.getElementById('startButton');
    var introScreen = document.getElementById('intro-screen');
    var gameContainer = document.getElementById('game-container');
    
    startButton.addEventListener('click', function() {
        introScreen.style.display = 'none';
        gameContainer.style.display = 'flex';
        // Disable cursor effect during game
        cursorEffectEnabled = false;
        gameActive = true;
        // Start spawning hearts
        startGame();
    });
    
    // Basket controls with mouse
    document.addEventListener('mousemove', function(e) {
        if (!gameActive) return;
        basketX = Math.max(0, Math.min(100, (e.clientX / window.innerWidth) * 100));
        basket.style.left = basketX + '%';
    });
    
    // Basket controls with keyboard
    document.addEventListener('keydown', function(e) {
        if (!gameActive) return;
        if (e.key === 'ArrowLeft') {
            basketX = Math.max(0, basketX - 3);
            basket.style.left = basketX + '%';
        } else if (e.key === 'ArrowRight') {
            basketX = Math.min(100, basketX + 3);
            basket.style.left = basketX + '%';
        }
    });
});

function startGame() {
    setInterval(function() {
        // Spawn 4-6 hearts at once
        var heartCount = 4 + Math.floor(Math.random() * 3);
        for (var i = 0; i < heartCount; i++) {
            // Slight delay between each heart in the batch
            setTimeout(createFallingHeart, i * 100);
        }
    }, 1000); // Reduced from 1000ms to 500ms
}

function createFallingHeart() {
    if (!gameActive) return;
    
    var heart = document.createElement('div');
    heart.className = 'falling-heart';
    
    // 70% chance of broken heart
    var isBroken = Math.random() < 0.75;
    if (isBroken) {
        heart.classList.add('broken');
        heart.textContent = '💔';
        heart.dataset.broken = 'true';
    } else {
        heart.textContent = '❤';
        heart.dataset.broken = 'false';
    }
    
    // Random size (1.5rem to 3.5rem)
    var size = 1.5 + Math.random() * 2;
    heart.style.fontSize = size + 'rem';
    
    // Random horizontal position across full screen width
    heart.style.left = Math.random() * 95 + '%';
    heart.style.top = '-50px';
    
    // Random fall speed (0.5s to 1.5s)
    var duration = 0.8 + Math.random() * 0.9;
    
    // Append to body instead of gameArea to span full width
    document.body.appendChild(heart);
    
    var startTime = Date.now();
    var fallInterval = setInterval(function() {
        if (!gameActive) {
            clearInterval(fallInterval);
            heart.remove();
            return;
        }
        
        var elapsed = (Date.now() - startTime) / 1000;
        var progress = elapsed / duration;
        
        if (progress >= 1) {
            clearInterval(fallInterval);
            heart.remove();
            return;
        }
        
        // Fall across full screen height
        var newTop = progress * (window.innerHeight + 50);
        heart.style.top = newTop + 'px';
        
        // Check collision
        if (checkCollision(heart, basket)) {
            clearInterval(fallInterval);
            heart.remove();
            if (heart.dataset.broken === 'true') {
                decrementScore();
            } else {
                incrementScore();
            }
        }
    }, 16);
}

function checkCollision(heart, basket) {
    var heartRect = heart.getBoundingClientRect();
    var basketRect = basket.getBoundingClientRect();
    
    return !(heartRect.right < basketRect.left || 
             heartRect.left > basketRect.right || 
             heartRect.bottom < basketRect.top || 
             heartRect.top > basketRect.bottom);
}

function incrementScore() {
    score++;
    
    // Fill the corresponding heart in progress bar
    var progressHearts = document.querySelectorAll('.progress-heart');
    if (progressHearts[score - 1]) {
        progressHearts[score - 1].classList.add('filled');
        progressHearts[score - 1].textContent = '❤';
    }
    
    if (score >= 10) {
        endGame();
    }
}

function decrementScore() {
    if (score > 0) {
        score--;
        
        // Unfill the corresponding heart in progress bar
        var progressHearts = document.querySelectorAll('.progress-heart');
        if (progressHearts[score]) {
            progressHearts[score].classList.remove('filled');
            progressHearts[score].textContent = '♡';
        }
    }
}

function endGame() {
    gameActive = false;
    
    // Remove all remaining hearts (both regular and broken)
    var hearts = document.querySelectorAll('.falling-heart');
    hearts.forEach(function(heart) {
        heart.remove();
    });
    
    // Re-enable cursor effect when game ends
    cursorEffectEnabled = true;
    
    // Hide game container
    setTimeout(function() {
        document.getElementById('game-container').style.display = 'none';
        showValentine();
    }, 500);
}

// Initialize cursor particle effect
function initializeCursorEffect() {
    // Create custom heart cursor
    var cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.textContent = '❤';
    document.body.appendChild(cursor);
    
    // Cursor particle effect
    var lastTime = Date.now();
    document.addEventListener('mousemove', function(e) {
        // Only show cursor effect when enabled
        if (!cursorEffectEnabled) {
            cursor.style.display = 'none';
            return;
        }
        
        cursor.style.display = 'block';
        
        // Update custom cursor position
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        var currentTime = Date.now();
        if (currentTime - lastTime < 30) return; // Throttle particle creation
        lastTime = currentTime;
        
        // Create 3-5 particles per mouse move
        var particleCount = 3 + Math.floor(Math.random() * 3);
        for (var i = 0; i < particleCount; i++) {
            var particle = document.createElement('div');
            particle.className = 'cursor-particle';
            particle.textContent = '❤';
            
            // Add slight random offset to starting position
            var offsetX = (Math.random() - 0.5) * 10;
            var offsetY = (Math.random() - 0.5) * 10;
            particle.style.left = (e.clientX + offsetX) + 'px';
            particle.style.top = (e.clientY + offsetY) + 'px';
            
            // Random direction for particle movement (full 360 degrees)
            var angle = Math.random() * Math.PI * 2;
            var distance = 40 + Math.random() * 50;
            var tx = Math.cos(angle) * distance;
            var ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(function() {
                particle.remove();
            }, 1500);
        }
    });
}

// Function to show and initialize Valentine content
function showValentine() {
    if (valentineInitialized) return;
    valentineInitialized = true;
    
    // Show the Valentine content
    document.getElementById('valentine-content').style.display = 'block';
    
    // Animate Valentine's text character by character
    var valentineText = document.querySelector('.valentine-text');
    if (valentineText) {
        var text = valentineText.textContent;
        valentineText.textContent = '';
        
        text.split('').forEach(function(char, index) {
            var span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = (index * 0.035) + 's';
            valentineText.appendChild(span);
        });
    }
    
    // Show buttons after text animation completes
    // Text has 38 characters, each with 0.035s delay, plus 0.05s fadeIn = 1.38s total
    setTimeout(function() {
        var yesBtn = document.getElementById('yesBtn');
        var noBtn = document.getElementById('noBtn');
        yesBtn.style.animation = 'showButton 0.8s forwards';
        noBtn.style.animation = 'showButton 0.8s forwards';
    }, 1380);
    
    // Button interactions
    var yesBtn = document.getElementById('yesBtn');
    var noBtn = document.getElementById('noBtn');
    var noClickCount = 0;
    
    yesBtn.addEventListener('click', function() {
        showLoveLetterModal();
    });
    
    noBtn.addEventListener('click', function() {
        noClickCount++;
        
        // Fixed corner positions - away from YES button (which is at 20%, 60%)
        var cornerPositions = [
            { x: 75, y: 20 },  // Click 1: Top-right corner
            { x: 25, y: 25 },  // Click 2: Top-left corner
            { x: 75, y: 75 },  // Click 3: Bottom-right corner
            { x: 20, y: 75 },  // Click 4: Bottom-left corner (with shrink)
            { x: 80, y: 25 },  // Click 5: Top-right area
            { x: 75, y: 70 },  // Click 6: Bottom-right area
            { x: 25, y: 25 }   // Click 7: Top-left area
        ];
        
        if (noClickCount <= 2) {
            // Move to fixed corner positions
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
            noBtn.style.right = 'auto';
        } else if (noClickCount === 3) {
            noBtn.textContent = 'Really ??';
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
            noBtn.style.right = 'auto';
        } else if (noClickCount === 4) {
            noBtn.textContent = 'Are you sure ?';
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
        } else if (noClickCount === 5) {
            noBtn.textContent = 'Please think again !';
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
        } else if (noClickCount === 6) {
            noBtn.textContent = 'No pleaseeee 🥺';
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
        } else if (noClickCount >= 7) {
            noBtn.textContent = 'Hahaha you have no choice but to say Yes ❤️';
            noBtn.style.fontSize = '2.5rem';
            noBtn.style.cursor = 'default';
            // Center it in the heart
            noBtn.style.left = '50%';
            noBtn.style.top = '50%';
            noBtn.style.transform = 'translate(-50%, -50%)';
            // Make it act like yes button
            noBtn.removeEventListener('click', arguments.callee);
            noBtn.addEventListener('click', function() {
                showLoveLetterModal();
            });
        }
    });
    
    // Initialize heart animation
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = koef * innerWidth;
    var height = canvas.height = koef * innerHeight;
    var height = canvas.height = koef * innerHeight;
    var rand = Math.random;

    var heartPosition = function (rad) {
        //return [Math.sin(rad), Math.cos(rad)];
        return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };
    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    window.addEventListener('resize', function () {
        width = canvas.width = koef * innerWidth;
        height = canvas.height = koef * innerHeight;
    });

    var traceCount = mobile ? 20 : 50;
    var pointsOrigin = [];
    var i;
    var dr = mobile ? 0.3 : 0.1;
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    var heartPointsCount = pointsOrigin.length;

    var targetPoints = [];
    var pulse = function (kx, ky) {
        for (i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
        }
    };

    var e = [];
    for (i = 0; i < heartPointsCount; i++) {
        var x = rand() * width;
        var y = rand() * height;
        e[i] = {
            vx: 0,
            vy: 0,
            R: 2,
            speed: rand() + 5,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * rand() + 0.7,
            f: "hsla(330," + ~~(20 * rand() + 80) + "%," + ~~(15 * rand() + 80) + "%,.6)",
            trace: []
        };
        for (var k = 0; k < traceCount; k++) e[i].trace[k] = {x: x, y: y};
    }

    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    var time = 0;
    var loop = function () {
        var n = -Math.cos(time);
        pulse((1 + n) * .5, (1 + n) * .5);
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;
        ctx.clearRect(0, 0, width, height);
        for (i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];
            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);
            if (10 > length) {
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount);
                }
                else {
                    if (0.99 < rand()) {
                        u.D *= -1;
                    }
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (0 > u.q) {
                        u.q += heartPointsCount;
                    }
                }
            }
            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force;
            u.vy *= u.force;
            for (k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }
            ctx.fillStyle = u.f;
            for (k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }

        window.requestAnimationFrame(loop, canvas);
    };
    loop();
}

// Love Letter Modal Functions
function showLoveLetterModal() {
    var modal = document.getElementById('loveLetterModal');
    modal.classList.add('show');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeLoveLetterModal() {
    var modal = document.getElementById('loveLetterModal');
    modal.classList.remove('show');
    
    // Restore body scroll
    document.body.style.overflow = 'hidden'; // Keep hidden since we're in fixed layout
}

// Modal close button event listener
document.addEventListener('DOMContentLoaded', function() {
    var modalClose = document.getElementById('modalClose');
    var modal = document.getElementById('loveLetterModal');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeLoveLetterModal);
    }
    
    // Close modal when clicking outside the modal content
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeLoveLetterModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLoveLetterModal();
        }
    });
});
