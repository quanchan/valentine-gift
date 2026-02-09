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

// Animate Valentine's text character by character
window.addEventListener('DOMContentLoaded', function() {
    var valentineText = document.querySelector('.valentine-text');
    if (valentineText) {
        var text = valentineText.textContent;
        valentineText.textContent = '';
        
        text.split('').forEach(function(char, index) {
            var span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = (index * 0.1) + 's';
            valentineText.appendChild(span);
        });
    }
    
    // Create custom heart cursor
    var cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.textContent = '❤';
    document.body.appendChild(cursor);
    
    // Cursor particle effect
    var lastTime = Date.now();
    document.addEventListener('mousemove', function(e) {
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
});

// Button interactions
window.addEventListener('DOMContentLoaded', function() {
    var yesBtn = document.getElementById('yesBtn');
    var noBtn = document.getElementById('noBtn');
    var noClickCount = 0;
    
    yesBtn.addEventListener('click', function() {
        alert('YAY! I knew you\'d say yes! ❤️');
    });
    
    noBtn.addEventListener('click', function() {
        noClickCount++;
        
        // Fixed corner positions - away from YES button (which is at 20%, 60%)
        var cornerPositions = [
            { x: 75, y: 20 },  // Click 1: Top-right corner
            { x: 20, y: 20 },  // Click 2: Top-left corner
            { x: 75, y: 75 },  // Click 3: Bottom-right corner
            { x: 20, y: 75 },  // Click 4: Bottom-left corner (with shrink)
            { x: 80, y: 25 },  // Click 5: Top-right area
            { x: 75, y: 70 },  // Click 6: Bottom-right area
            { x: 25, y: 25 }   // Click 7: Top-left area
        ];
        
        if (noClickCount <= 3) {
            // Move to fixed corner positions
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
            noBtn.style.right = 'auto';
        } else if (noClickCount === 4) {
            // Shrink it
            noBtn.style.fontSize = '1.5rem';
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
            noBtn.style.right = 'auto';
        } else if (noClickCount === 5) {
            noBtn.textContent = 'No (are you sure ?)';
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
        } else if (noClickCount === 6) {
            noBtn.textContent = 'No (please think again)';
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
        } else if (noClickCount === 7) {
            noBtn.textContent = 'No (pleaseeee 🥺)';
            var pos = cornerPositions[noClickCount - 1];
            noBtn.style.left = pos.x + '%';
            noBtn.style.top = pos.y + '%';
        } else if (noClickCount >= 8) {
            noBtn.textContent = 'Yes hahaha you have no choice';
            noBtn.style.fontSize = '2.5rem';
            noBtn.style.cursor = 'default';
            // Center it in the heart
            noBtn.style.left = '50%';
            noBtn.style.top = '50%';
            noBtn.style.transform = 'translate(-50%, -50%)';
            // Make it act like yes button
            noBtn.removeEventListener('click', arguments.callee);
            noBtn.addEventListener('click', function() {
                alert('YAY! I knew you\'d say yes! ❤️');
            });
        }
    });
});

var loaded = false;
var init = function () {
    if (loaded) return;
    loaded = true;
    var mobile = window.isDevice;
    var koef = mobile ? 0.5 : 1;
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = koef * innerWidth;
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
};

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);