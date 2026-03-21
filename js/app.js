document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const navTitle = document.getElementById('navTitle');
    const toastContainer = document.getElementById('toast-container');
    const viewCache = {};
    let chartInstance = null;

    const titles = {
        'panel': 'Panel de Control',
        'add': 'Registrar Sesión',
        'nutricion': 'Plan de Nutrición',
        'coach': 'Coach IA Personal',
        'progreso': 'Evolución',
        'historial': 'Mis Entrenos',
        'perfil': 'Mi Perfil',
        'pro': 'Premium Access',
        'ejercicios': 'Biblioteca de Ejercicios'
    };

    /**
     * Toast System
     */
    window.showToast = (message, type = 'ok') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    /**
     * View Loading with Transitions
     */
    async function loadView(viewName) {
        if (!viewName) viewName = 'panel';

        try {
            // Out transition
            appContent.style.opacity = '0';
            appContent.style.transform = 'translateY(10px)';
            appContent.style.transition = 'all 0.2s ease-in';
            
            await new Promise(r => setTimeout(r, 200));

            let html = viewCache[viewName];
            if (!html) {
                const response = await fetch(`views/${viewName}.html`);
                if (!response.ok) throw new Error('Vista no encontrada');
                html = await response.text();
                viewCache[viewName] = html;
            }

            appContent.innerHTML = html;
            navTitle.textContent = titles[viewName] || 'KO95FIT';
            window.scrollTo(0, 0);

            // In transition
            appContent.style.opacity = '1';
            appContent.style.transform = 'translateY(0)';
            appContent.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            
            updateNavigationState(viewName);

            // Specific View Init
            if (viewName === 'progreso') setTimeout(initChart, 100);
            
        } catch (error) {
            console.error("Error al cargar la vista:", error);
            appContent.innerHTML = `
                <div class="p-8 text-center">
                    <span class="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
                    <p class="text-xl font-bold">Error de carga</p>
                    <p class="text-ios-label2 mt-2">No se pudo encontrar la vista: ${viewName}</p>
                    <button onclick="location.hash='#panel'" class="ios-btn mt-6">Volver al inicio</button>
                </div>`;
            appContent.style.opacity = '1';
            appContent.style.transform = 'translateY(0)';
        }
    }

    /**
     * Navigation State Sync
     */
    function updateNavigationState(activeView) {
        document.querySelectorAll('.tab-item').forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (href === activeView) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Chart.js Evolution
     */
    function initChart() {
        const ctx = document.getElementById('myChart');
        if (!ctx) return;

        if (chartInstance) chartInstance.destroy();

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(48, 209, 88, 0.4)');
        gradient.addColorStop(1, 'rgba(48, 209, 88, 0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['01 Mar', '05 Mar', '10 Mar', '15 Mar', '20 Mar'],
                datasets: [{
                    label: 'Peso Corporal (kg)',
                    data: [78.2, 77.8, 77.4, 76.9, 76.5],
                    borderColor: '#30d158',
                    borderWidth: 4,
                    backgroundColor: gradient,
                    fill: true,
                    pointBackgroundColor: '#30d158',
                    pointBorderColor: '#1c1c1e',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.45
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(28, 28, 30, 0.9)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(235,235,245,0.6)', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.06)' },
                        ticks: { color: 'rgba(235,235,245,0.6)', font: { size: 11 } }
                    }
                }
            }
        });
    }

    // Router & Global Events
    window.addEventListener('hashchange', () => {
        loadView(window.location.hash.replace('#', ''));
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        const anchor = e.target.closest('a');

        if (anchor && anchor.getAttribute('href')?.startsWith('#')) return;

        if (btn?.id === 'btnNotifications') {
            showToast("Sincronización completada ✅", "ok");
        }
        
        if (btn?.id === 'btnSave' || btn?.id === 'btnAddEx') {
            showToast("Guardado con éxito", "ok");
            if (btn.id === 'btnSave') {
                setTimeout(() => window.location.hash = '#panel', 500);
            }
        }
        
        // Modal toggles (simplified)
        const modalTrigger = e.target.closest('[data-modal]');
        if (modalTrigger) {
            const modalId = modalTrigger.getAttribute('data-modal');
            document.getElementById(modalId)?.classList.toggle('active');
        }
    });

    // Initial View Load
    loadView(window.location.hash.replace('#', '') || 'panel');
});

