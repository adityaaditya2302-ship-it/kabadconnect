document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Navigation
    const menuItems = document.querySelectorAll('#sidebarMenu li[data-target]');
    const sections = document.querySelectorAll('.section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Trigger specific animations if needed
            if(targetId === 'earnings') {
                animateChart();
            }
        });
    });

    // 2. Job Data and Rendering
    const jobs = [
        { id: 1, name: 'Sharma Ji', dist: '0.8 km', addr: 'B-42, Vasant Kunj', type: 'dry', typeLabel: 'Dry', weight: '15 kg', price: '₹210', time: 'Today, 4:00 - 6:00 PM', posted: '12 min ago', tags: ['nearby'] },
        { id: 2, name: 'Gupta Traders', dist: '2.1 km', addr: 'Shop 14, Dwarka Sec 12', type: 'metal', typeLabel: 'Metals', weight: '45 kg', price: '₹1250', time: 'Today, 2:00 - 4:00 PM', posted: '25 min ago', tags: ['high-value'] },
        { id: 3, name: 'Apollo Clinic', dist: '3.5 km', addr: 'Main Rd, Rohini', type: 'special', typeLabel: 'Special Care', weight: '5 kg', price: '₹150', time: 'ASAP', posted: '40 min ago', tags: ['urgent', 'high-value'] },
        { id: 4, name: 'RWA Saket', dist: '1.2 km', addr: 'Block J, Saket', type: 'dry', typeLabel: 'Mixed Dry', weight: '30 kg', price: '₹420', time: 'Tomorrow, 9:00 AM', posted: '1 hr ago', tags: ['nearby'] },
        { id: 5, name: 'Mehta Electronics', dist: '4.0 km', addr: 'Janakpuri Dist. Center', type: 'special', typeLabel: 'E-Waste', weight: '12 kg', price: '₹600', time: 'Today, 5:00 PM', posted: '2 hrs ago', tags: ['high-value'] },
        { id: 6, name: 'Verma House', dist: '0.5 km', addr: 'Lajpat Nagar 4', type: 'dry', typeLabel: 'Paper', weight: '8 kg', price: '₹110', time: 'Today, 3:30 PM', posted: 'Just now', tags: ['nearby', 'urgent'] }
    ];

    const jobGrid = document.getElementById('jobGrid');

    function renderJobs(filter = 'all') {
        jobGrid.innerHTML = '';
        jobs.forEach(job => {
            if (filter !== 'all' && !job.tags.includes(filter)) return;

            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <div class="job-header">
                    <div>
                        <h4>${job.name}</h4>
                        <div class="job-meta">
                            <i data-lucide="map-pin" size="14"></i> ${job.dist}
                        </div>
                    </div>
                    <span>${job.posted}</span>
                </div>
                
                <div style="font-size: 0.9rem; color: #B0B0C0; margin-bottom: 5px;">
                    ${job.addr}
                </div>
                
                <div class="pill-container">
                    <span class="pill ${job.type}"><i data-lucide="package" size="12"></i> ${job.typeLabel}</span>
                    <span style="font-size: 0.85rem; color: #B0B0C0; display:flex; align-items:center; margin-left: auto;">
                        ~${job.weight}
                    </span>
                </div>
                
                <div class="job-footer">
                    <span style="font-size: 0.85rem; color: #B0B0C0; display:flex; align-items:center; gap:4px;">
                        <i data-lucide="clock" size="14"></i> ${job.time}
                    </span>
                    <span class="price">${job.price}</span>
                </div>
                
                <div class="job-actions" id="actions-${job.id}">
                    <button class="btn btn-primary" onclick="acceptJob(${job.id})">Accept</button>
                    <button class="btn btn-outline" onclick="declineJob(${job.id})">Decline</button>
                </div>
            `;
            jobGrid.appendChild(card);
        });
        // Re-init lucide icons for new elements
        if(window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Initial render
    renderJobs('all');

    // 3. Job Filters
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderJobs(e.target.getAttribute('data-filter'));
        });
    });

    // 4. Job Actions
    window.acceptJob = function(id) {
        const actionsDiv = document.getElementById(`actions-${id}`);
        actionsDiv.innerHTML = `
            <button class="btn btn-primary" style="width:100%; background:rgba(0,200,83,0.1); border:1px solid #00C853; color:#00C853;">
                <i data-lucide="check-circle-2" size="18"></i> Accepted
            </button>
        `;
        window.lucide.createIcons();
    };

    window.declineJob = function(id) {
        const actionsDiv = document.getElementById(`actions-${id}`);
        const card = actionsDiv.closest('.job-card');
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.remove();
        }, 400);
    };

    // 5. Stat Counters Animation
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // lower = faster

    counters.forEach(counter => {
        const animate = () => {
            const value = +counter.getAttribute('data-target');
            const data = +counter.innerText.replace(/,/g, '');
            const time = value / speed;
            if(data < value) {
                counter.innerText = Math.ceil(data + time);
                setTimeout(animate, 20);
            } else {
                // Formatting with commas if large
                counter.innerText = value > 999 ? value.toLocaleString() : value;
            }
        }
        animate();
    });

    // 6. Chart Rendering (CSS based)
    function animateChart() {
        const chartContainer = document.querySelector('.chart-container');
        if(chartContainer.innerHTML.trim() !== '') return; // Already rendered

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const values = [1200, 1800, 1400, 2200, 1900, 3100, 2920];
        const maxVal = Math.max(...values);

        days.forEach((day, index) => {
            const col = document.createElement('div');
            col.className = 'bar-col';
            
            const percentage = (values[index] / maxVal) * 100;
            
            col.innerHTML = `
                <div class="bar" data-val="₹${values[index]}" style="height: 0%;"></div>
                <div class="day-label">${day}</div>
            `;
            chartContainer.appendChild(col);

            // Animate height after a small delay
            setTimeout(() => {
                col.querySelector('.bar').style.height = `${percentage}%`;
            }, 100 * index);
        });
    }
});
