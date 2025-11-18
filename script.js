// JavaScript
// console.log('Hello world!');
const map = L.map('map').setView([33.590156491126606, 130.42071667111063], 16);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
L.marker([33.590156491126606, 130.42071667111063]).addTo(map).bindPopup('博多駅').openPopup();

//アイコン
// const whiteIcon = L.icon({
//     iconUrl: 'images/ico.png',
//     shadowUrl: 'images/ico_shadow.png',

//     iconSize: [40, 40], // size of the icon
//     shadowSize: [40, 40], // size of the shadow
//     iconAnchor: [20, 40], // point of the icon which will correspond to marker's location
//     shadowAnchor: [20, 40],  // the same for the shadow
//     popupAnchor: [0, -42] // point from which the popup should open relative to the iconAnchor
// });
//複数アイコンをまとめて定義
const circleIcon = L.Icon.extend({
    options: {
        shadowUrl: 'images/ico_shadow.png',
        iconSize: [40, 40],
        shadowSize: [40, 40],
        iconAnchor: [20, 40],
        shadowAnchor: [20, 40],
        popupAnchor: [0, -42]
    }
});

const whiteIcon = new circleIcon({ iconUrl: 'images/ico.png' }),
    pinkIcon = new circleIcon({ iconUrl: 'images/ico_pink.png' });

L.marker([33.590156491126606, 130.42071667111063], { icon: whiteIcon }).addTo(map).bindPopup('こんにちは！');

L.marker([33.58672450152075, 130.42251911554536], { icon: pinkIcon }).addTo(map).bindPopup('こんにちは！');

/* -----------------------------
     Cursor particle effect
     - Creates a canvas overlay, spawns particles on pointer move and click
     - Responsive and uses devicePixelRatio for crispness
------------------------------*/
(function() {
    const canvas = document.getElementById('effect-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let DPR = window.devicePixelRatio || 1;
    function resize() {
        DPR = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const MAX = 400;

    function spawn(x, y, count, spread) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * spread;
            particles.push({
                x: x + (Math.random()-0.5) * 4,
                y: y + (Math.random()-0.5) * 4,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                size: 2 + Math.random() * 10,
                life: 40 + Math.random() * 50,
                age: 0,
                hue: 180 + Math.random() * 80
            });
            if (particles.length > MAX) particles.shift();
        }
    }

    let lastMove = 0;
    window.addEventListener('pointermove', (e) => {
        const now = performance.now();
        // throttle spawn on high-frequency moves
        if (now - lastMove > 8) {
            spawn(e.clientX, e.clientY, 2, 1.8);
            lastMove = now;
        }
    }, {passive: true});

    window.addEventListener('pointerdown', (e) => {
        spawn(e.clientX, e.clientY, 30, 6);
    });

    function step() {
        requestAnimationFrame(step);
        ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.vy += 0.06; // gravity
            p.vx *= 0.995;
            p.vy *= 0.995;
            p.x += p.vx;
            p.y += p.vy;
            p.age++;
            const t = p.age / p.life;
            const alpha = Math.max(0, 1 - t);
            const size = p.size * (1 - t * 0.7);

            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
            g.addColorStop(0, `hsla(${p.hue},90%,60%,${alpha})`);
            g.addColorStop(0.5, `hsla(${p.hue + 30},80%,55%,${alpha * 0.6})`);
            g.addColorStop(1, `hsla(${p.hue + 60},80%,50%,0)`);

            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.1, size), 0, Math.PI * 2);
            ctx.fill();

            if (p.age >= p.life) particles.splice(i, 1);
        }
    }
    step();

})();