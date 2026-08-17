document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Navigation Logic
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.dashboard-section');
    
    let chartsRendered = false; // Prevent re-drawing every time

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-section');
            if (!targetId) return; // Ignore back link
            
            e.preventDefault();
            
            // Update Active Link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update Active Section
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Render charts if analytics is opened
            if (targetId === 'analytics-section' && !chartsRendered) {
                renderCharts();
                chartsRendered = true;
            }

            // Fix map sizing issue if map was hidden initially
            if (targetId === 'map-section' && window.wardMap) {
                setTimeout(() => window.wardMap.invalidateSize(), 100);
            }
        });
    });

    // 2. Leaflet Map Initialization
    initMap();

    // 3. Resolve Alert Logic
    const resolveBtns = document.querySelectorAll('.btn-resolve');
    const alertCountSpan = document.getElementById('active-alert-count');
    let activeAlerts = 14; // Start count based on UI

    resolveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.alert-card');
            card.classList.add('resolved');
            activeAlerts--;
            alertCountSpan.textContent = activeAlerts;
        });
    });

    // 4. Animate Stat Counters
    const statValues = document.querySelectorAll('.stat-value[data-count]');
    statValues.forEach(el => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1500;
        const steps = 30;
        const stepTime = duration / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += Math.ceil(target / steps);
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.innerHTML = current.toLocaleString() + (el.innerHTML.includes('Tonnes') ? ' <span style="font-size: 14px; color: var(--text-muted); font-weight: normal;">Tonnes</span>' : '');
        }, stepTime);
    });

});

function initMap() {
    // Center of Delhi
    const map = L.map('wardMap').setView([28.6139, 77.2090], 11);
    window.wardMap = map; // expose to window for resizing

    // Dark theme tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Ward Data
    const wards = [
        { name: "Vasant Kunj", lat: 28.5213, lng: 77.1560, seg: 85, vol: 320, kabs: 450, comp: "None" },
        { name: "Dwarka", lat: 28.5921, lng: 77.0460, seg: 72, vol: 410, kabs: 520, comp: "BWG Notice" },
        { name: "Rohini", lat: 28.7325, lng: 77.1167, seg: 45, vol: 530, kabs: 610, comp: "Dhalao Overflow" },
        { name: "Saket", lat: 28.5245, lng: 77.2066, seg: 78, vol: 290, kabs: 380, comp: "Missed Pickup" },
        { name: "Janakpuri", lat: 28.6219, lng: 77.0812, seg: 82, vol: 340, kabs: 470, comp: "None" },
        { name: "Lajpat Nagar", lat: 28.5700, lng: 77.2373, seg: 55, vol: 420, kabs: 580, comp: "Mixed Dumping" },
        { name: "Chandni Chowk", lat: 28.6506, lng: 77.2303, seg: 38, vol: 610, kabs: 890, comp: "Mixed Dumping" },
        { name: "Karol Bagh", lat: 28.6514, lng: 77.1907, seg: 67, vol: 380, kabs: 510, comp: "Late Collection" },
        { name: "Nehru Place", lat: 28.5491, lng: 77.2533, seg: 73, vol: 250, kabs: 310, comp: "E-waste pile" },
        { name: "Shahdara", lat: 28.6735, lng: 77.2943, seg: 42, vol: 580, kabs: 720, comp: "Missed Pickup" },
        { name: "Greater Kailash", lat: 28.5416, lng: 77.2432, seg: 88, vol: 210, kabs: 280, comp: "None" },
        { name: "Pitampura", lat: 28.7026, lng: 77.1311, seg: 61, vol: 460, kabs: 550, comp: "Stray Animals" }
    ];

    const colors = {
        green: '#00C853',
        yellow: '#FFD600',
        red: '#FF1744'
    };

    wards.forEach(w => {
        let color = colors.green;
        if (w.seg < 80) color = colors.yellow;
        if (w.seg < 50) color = colors.red;

        const circle = L.circleMarker([w.lat, w.lng], {
            radius: 8,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.6
        }).addTo(map);

        const popupContent = `
            <div style="font-family: 'Inter', sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #fff; font-size: 16px;">${w.name}</h4>
                <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                    <span style="color:#B0B0C0;">Segregation:</span>
                    <strong style="color:${color}">${w.seg}%</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                    <span style="color:#B0B0C0;">Collection:</span>
                    <strong style="color:#fff">${w.vol} T</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                    <span style="color:#B0B0C0;">Kabadiwalas:</span>
                    <strong style="color:#fff">${w.kabs}</strong>
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <span style="color:#B0B0C0; font-size: 12px;">Top Issue: </span>
                    <span style="color:${w.comp === 'None' ? colors.green : colors.red}; font-size: 12px;">${w.comp}</span>
                </div>
            </div>
        `;
        
        circle.bindPopup(popupContent);
    });
}

// Custom Native Canvas Charts (No frameworks)
function renderCharts() {
    drawDonutChart();
    drawLineChart();
    drawCircularProgress();
    drawStackedBarChart();
}

function drawDonutChart() {
    const canvas = document.getElementById('donutChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Setup for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const cw = rect.width;
    const ch = rect.height;
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = Math.min(cw, ch) / 2.5;

    const data = [
        { val: 52, color: '#00C853' }, // Wet
        { val: 28, color: '#448AFF' }, // Dry
        { val: 12, color: '#FFD600' }, // Sanitary
        { val: 8, color: '#FF1744' }   // Special
    ];

    let currentAngle = -0.5 * Math.PI; // Start at top
    
    // Animate drawing
    let progress = 0;
    const animate = () => {
        progress += 0.05;
        if(progress > 1) progress = 1;
        
        ctx.clearRect(0,0,cw,ch);
        let angle = -0.5 * Math.PI;
        
        data.forEach(d => {
            const sliceAngle = (d.val / 100) * 2 * Math.PI * progress;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
            ctx.lineWidth = 30;
            ctx.strokeStyle = d.color;
            ctx.stroke();
            angle += sliceAngle;
        });

        // Draw inner text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('100%', cx, cy - 10);
        ctx.font = '12px Inter';
        ctx.fillStyle = '#B0B0C0';
        ctx.fillText('Total Waste', cx, cy + 15);

        if(progress < 1) requestAnimationFrame(animate);
    };
    animate();
}

function drawLineChart() {
    const canvas = document.getElementById('lineChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const cw = rect.width;
    const ch = rect.height;
    
    const data = [8100, 8300, 8050, 8500, 8200, 8600, 8420];
    const max = 9000;
    const min = 7500;
    
    const padding = 40;
    const w = cw - padding * 2;
    const h = ch - padding * 2;
    
    let progress = 0;
    
    const draw = () => {
        progress += 0.05;
        if(progress > 1) progress = 1;
        
        ctx.clearRect(0,0,cw,ch);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<=3; i++) {
            const y = padding + (h/3)*i;
            ctx.moveTo(padding, y);
            ctx.lineTo(cw-padding, y);
        }
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#B0B0C0';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('9k', padding-10, padding+5);
        ctx.fillText('8k', padding-10, padding + h/2 + 5);
        ctx.fillText('7.5k', padding-10, padding + h + 5);
        
        const days = ['M','T','W','T','F','S','S'];
        ctx.textAlign = 'center';
        days.forEach((day, i) => {
            const x = padding + (w/6)*i;
            ctx.fillText(day, x, ch - 10);
        });

        // Draw Line
        ctx.beginPath();
        ctx.strokeStyle = '#448AFF';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        
        const drawPoints = Math.ceil(data.length * progress);
        
        for(let i=0; i<drawPoints; i++) {
            const x = padding + (w/(data.length-1)) * i;
            const y = padding + h - ((data[i]-min)/(max-min)) * h;
            if(i===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Fill gradient
        if(progress === 1) {
            ctx.lineTo(padding + w, padding + h);
            ctx.lineTo(padding, padding + h);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, padding, 0, padding + h);
            grad.addColorStop(0, 'rgba(68,138,255,0.3)');
            grad.addColorStop(1, 'rgba(68,138,255,0)');
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Draw points
            ctx.fillStyle = '#0a0a0f';
            ctx.strokeStyle = '#448AFF';
            ctx.lineWidth = 2;
            data.forEach((val, i) => {
                const x = padding + (w/(data.length-1)) * i;
                const y = padding + h - ((val-min)/(max-min)) * h;
                ctx.beginPath();
                ctx.arc(x,y,4,0,Math.PI*2);
                ctx.fill();
                ctx.stroke();
            });
        }
        
        if(progress < 1) requestAnimationFrame(draw);
    };
    draw();
}

function drawCircularProgress() {
    const canvas = document.getElementById('circularProgress');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const cw = canvas.width;
    const ch = canvas.height;
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = 90;

    let progress = 0;
    const target = 0.684; // 68.4%
    
    const animate = () => {
        progress += 0.02;
        if(progress > target) progress = target;
        
        ctx.clearRect(0,0,cw,ch);
        
        // Background track
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2*Math.PI);
        ctx.lineWidth = 15;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.stroke();
        
        // Progress
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -0.5*Math.PI, (-0.5*Math.PI) + (progress*2*Math.PI));
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#00C853';
        ctx.stroke();
        
        // Target line
        const targetAngle = (-0.5*Math.PI) + (0.9*2*Math.PI);
        const tx = cx + (radius - 20) * Math.cos(targetAngle);
        const ty = cy + (radius - 20) * Math.sin(targetAngle);
        const tx2 = cx + (radius + 20) * Math.cos(targetAngle);
        const ty2 = cy + (radius + 20) * Math.sin(targetAngle);
        
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx2, ty2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        if(progress < target) requestAnimationFrame(animate);
    };
    animate();
}

function drawStackedBarChart() {
    const canvas = document.getElementById('stackedBarChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const cw = rect.width;
    const ch = rect.height;
    
    const plants = [
        { name: 'Tehkhand', cap: 2000, act: 1850 },
        { name: 'Okhla', cap: 1950, act: 1900 },
        { name: 'Narela', cap: 1500, act: 1200 },
        { name: 'Ghazipur', cap: 1300, act: 900 }
    ];

    const padding = 30;
    const w = cw - padding * 2;
    const h = ch - padding * 2;
    const barWidth = 40;
    const gap = (w - (barWidth * plants.length)) / (plants.length + 1);
    
    const max = 2200;

    let progress = 0;
    const animate = () => {
        progress += 0.05;
        if(progress > 1) progress = 1;
        
        ctx.clearRect(0,0,cw,ch);
        
        plants.forEach((p, i) => {
            const x = padding + gap + (barWidth + gap) * i;
            
            // Draw Capacity (Background)
            const capH = (p.cap / max) * h;
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(x, padding + h - capH, barWidth, capH);
            
            // Draw Actual (Foreground)
            const actH = (p.act / max) * h * progress;
            ctx.fillStyle = '#448AFF';
            ctx.fillRect(x, padding + h - actH, barWidth, actH);
            
            // Label
            ctx.fillStyle = '#B0B0C0';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, x + barWidth/2, ch - 5);
        });

        if(progress < 1) requestAnimationFrame(animate);
    };
    animate();
}
