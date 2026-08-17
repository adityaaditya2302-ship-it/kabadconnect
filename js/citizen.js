// Navigation logic
const navLinks = document.querySelectorAll('.nav-link[data-target]');
const sections = document.querySelectorAll('.section-container');

function switchTab(targetId) {
    // Update active nav link
    navLinks.forEach(link => {
        if(link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Show target section, hide others
    sections.forEach(section => {
        if(section.id === targetId) {
            section.classList.add('active');
            
            // Trigger animations if entering specific tabs
            if (targetId === 'points') {
                animatePoints();
            } else if (targetId === 'impact') {
                animateImpact();
            }
        } else {
            section.classList.remove('active');
        }
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        switchTab(link.getAttribute('data-target'));
    });
});

// AI Scanner logic
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const scanLoader = document.getElementById('scan-loader');
const scanResult = document.getElementById('scan-result');

const demoResults = [
    { name: "Plastic Bottle", confidence: "94%", type: "dry", typeText: "🔵 DRY WASTE", instr: "Rinse and flatten. Hand to kabadiwala or place in DRY bin.", img: "https://images.unsplash.com/photo-1528323273322-d81458248d40?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
    { name: "Banana Peel", confidence: "98%", type: "wet", typeText: "🟢 WET WASTE", instr: "Compost it or place in the WET bin for organic processing.", img: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
    { name: "Used Diaper", confidence: "91%", type: "sanitary", typeText: "🟡 SANITARY WASTE", instr: "Wrap securely in newspaper with a red cross mark. Dispose in SANITARY bin.", img: "https://images.unsplash.com/photo-1557002665-c552e1832483?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
    { name: "Old Battery", confidence: "89%", type: "special", typeText: "🔴 SPECIAL CARE", instr: "Do not throw in general bins. Keep aside for e-waste pickup.", img: "https://images.unsplash.com/photo-1585223681423-f2277d3f114c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" }
];

let scanIndex = 0;

// Drag and drop visuals
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    processScan();
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        processScan();
    }
});

function processScan() {
    // Hide UI elements to show loader
    const children = uploadZone.children;
    for(let i=0; i<children.length; i++) {
        if(children[i].id !== 'scan-loader') {
            children[i].style.display = 'none';
        }
    }
    scanLoader.style.display = 'block';
    scanResult.style.display = 'none';

    // Simulate 2s processing
    setTimeout(() => {
        scanLoader.style.display = 'none';
        
        // Show demo result
        const result = demoResults[scanIndex];
        scanIndex = (scanIndex + 1) % demoResults.length;

        document.getElementById('result-img').src = result.img;
        document.getElementById('result-item-name').innerText = result.name;
        
        const badge = document.getElementById('result-badge');
        badge.className = `badge ${result.type}`;
        badge.innerText = result.typeText;
        
        document.getElementById('result-instruction').innerText = result.instr;
        
        // Hide upload zone totally
        uploadZone.style.display = 'none';
        
        // Reveal result
        scanResult.style.display = 'block';
        scanResult.style.animation = 'fadeIn 0.5s ease forwards';
        
    }, 2000);
}

// Ensure function is in global scope
window.resetScan = function() {
    scanResult.style.display = 'none';
    uploadZone.style.display = 'flex';
    
    const children = uploadZone.children;
    for(let i=0; i<children.length; i++) {
        if(children[i].id !== 'scan-loader') {
            children[i].style.display = '';
        }
    }
    fileInput.value = '';
}


// Pickup logic
const weightSlider = document.getElementById('weight-slider');
const weightVal = document.getElementById('weight-val');
const estEarnings = document.getElementById('est-earnings');
const avgRate = 14; // Avg rate for estimation

weightSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    weightVal.innerText = val;
    estEarnings.innerText = Math.round(val * avgRate);
});

window.selectKabadiwala = function(btn) {
    const card = btn.parentElement;
    const name = card.querySelector('h4').innerText;
    
    document.getElementById('pickup-form').parentElement.style.display = 'none';
    card.parentElement.parentElement.style.display = 'none';
    
    const conf = document.getElementById('booking-confirmation');
    document.getElementById('selected-k-name').innerText = name;
    document.getElementById('final-earnings').innerText = estEarnings.innerText;
    
    conf.style.display = 'block';
    conf.style.animation = 'fadeIn 0.5s ease forwards';
}

// Points Counter Animation
let pointsAnimated = false;
function animatePoints() {
    if(pointsAnimated) return;
    pointsAnimated = true;
    
    const counter = document.getElementById('points-counter');
    const target = 2340;
    const duration = 1500;
    const steps = 50;
    const stepTime = Math.abs(Math.floor(duration / steps));
    
    let current = 0;
    const timer = setInterval(() => {
        current += target / steps;
        if(current >= target) {
            counter.innerText = target.toLocaleString();
            clearInterval(timer);
        } else {
            counter.innerText = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

// Impact Animation
let impactAnimated = false;
function animateImpact() {
    if(impactAnimated) return;
    impactAnimated = true;
    
    // Animate circular progress
    const circle = document.getElementById('segregation-circle');
    circle.style.animation = 'none';
    circle.offsetHeight; // trigger reflow
    circle.style.animation = 'progress 1.5s ease-out forwards';
    
    // Animate bars
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        const height = bar.style.height;
        bar.style.height = '0';
        setTimeout(() => {
            bar.style.height = height;
        }, index * 100);
    });
}
