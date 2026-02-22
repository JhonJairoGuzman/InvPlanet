// js/app-core.js - NÚCLEO DE LA APLICACIÓN
// ============================================

class InvPlanetApp {
    constructor() {
        this.currentView = 'dashboard';
        this.carritoVenta = [];
        this.carritoModificacion = [];
        this.currentProducto = null;
        this.currentCategoria = null;
        this.currentVenta = null;
        this.currentGasto = null;
        this.isInitialized = false;
        this.modalOpen = false;
        this.ventasRealizadas = [];
        this.gastosRegistrados = [];
        this.numeroWhatsApp = '+573243898130';
        this.scanTimeout = null;
        this.barcodeBuffer = '';
        this.ventaEnModificacion = null;
        this.usuarioActual = null;
        this.turnoActual = null;
        
        // Arrays que serán llenados por los módulos
        this.usuarios = [];
        this.clientes = [];
        this.proveedores = [];
        this.promociones = [];
        this.mesas = [];
        this.comisiones = [];
        this.apartados = [];
        this.creditos = [];
        this.presupuestos = [];
        this.series = [];
        this.lotes = [];
        this.ordenesTrabajo = [];
        this.tecnicos = [];
        this.recetasMedicas = [];
        this.vehiculos = [];
        this.ordenesCompra = [];
        this.pedidosEspeciales = [];
        this.devoluciones = [];
        this.garantias = [];
        this.currentOrdenTrabajo = null;
        this.currentPedidoEspecial = null;
        this.currentDevolucion = null;
        
        console.log('%c🔥 InvPlanet App - Core Inicializado', 'background: #27ae60; color: white; padding: 5px;');
    }

    // ============================================
    // MÉTODOS FUNDAMENTALES
    // ============================================

    initializeApp() {
        console.log('📱 Inicializando aplicación...');
        
        if (this.isInitialized) {
            console.log('✅ App ya inicializada');
            return true;
        }
        
        if (!this.verifySession()) {
            console.log('❌ Sesión no válida');
            window.location.href = 'index.html';
            return false;
        }
        
        try {
            this.setupNavigation();
            this.setupEventListeners();
            this.updateDateTime();
            this.cargarNombreNegocio();
            
            const user = this.getUsuarioActual();
            if (user && document.getElementById('userName')) {
                document.getElementById('userName').textContent = `Bienvenido, ${user.nombre || user.username || 'Usuario'}`;
            }
            
            this.loadView('dashboard');
            this.isInitialized = true;
            console.log('✅ Aplicación inicializada');
            return true;
        } catch (error) {
            console.error('❌ Error:', error);
            return false;
        }
    }

    verifySession() {
        try {
            if (typeof checkSession === 'function') {
                return checkSession();
            }
            const session = localStorage.getItem('invplanet_session');
            return session !== null && session !== 'null' && session !== '';
        } catch {
            return false;
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-view]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const view = link.getAttribute('data-view');
                if (view) this.loadView(view);
            });
        });
        console.log('✓ Navegación configurada');
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('¿Estás seguro que deseas salir?')) {
                    if (typeof logout === 'function') {
                        logout();
                    } else {
                        localStorage.removeItem('invplanet_session');
                        window.location.href = 'index.html';
                    }
                }
            });
        }
        console.log('✓ Event listeners configurados');
    }

    updateDateTime() {
        const update = () => {
            const now = new Date();
            const dateEl = document.getElementById('currentDate');
            const timeEl = document.getElementById('currentTime');
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        };
        update();
        setInterval(update, 1000);
        console.log('✓ Fecha y hora configuradas');
    }

    cargarNombreNegocio() {
        const config = storage.getConfig?.() || {};
        const nombreNegocio = config.nombreNegocio || 'Mi Negocio';
        document.title = `${nombreNegocio} - InvPlanet`;
        const negocioNombre = document.getElementById('businessName');
        if (negocioNombre) {
            negocioNombre.textContent = nombreNegocio;
        }
    }

    loadView(view) {
        this.currentView = view;
        console.log(`📂 Cargando vista: ${view}`);
        
        const contentArea = document.getElementById('mainContent');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando ${view}...</p>
            </div>
        `;
        
        setTimeout(() => {
            try {
                switch(view) {
                    case 'dashboard':
                        this.loadDashboard();
                        break;
                    case 'inventario':
                        this.loadInventarioView();
                        break;
                    case 'categorias':
                        this.loadCategoriasView();
                        break;
                    case 'ventas':
                        this.loadVentasView();
                        break;
                    case 'reportes':
                        this.loadReportesView();
                        break;
                    case 'gastos':
                        this.loadGastosView();
                        break;
                    case 'configuracion':
                        this.loadConfiguracionView();
                        break;
                    default:
                        contentArea.innerHTML = this.getErrorView('Vista no encontrada');
                }
            } catch (error) {
                console.error('❌ Error cargando vista:', error);
                contentArea.innerHTML = this.getErrorView(error.message);
            }
        }, 100);
    }

    getErrorView(message) {
        return `
            <div class="error-view" style="text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle fa-3x mb-3" style="color: #e74c3c;"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary mt-4" onclick="window.app.loadView('dashboard')">
                    <i class="fas fa-home"></i> Dashboard
                </button>
            </div>
        `;
    }

    // ============================================
    // DASHBOARD
    // ============================================

    loadDashboard() {
        const inventario = storage.getInventario();
        const productosActivos = inventario.filter(p => p.activo === true);
        const productosBajos = productosActivos.filter(p => p.unidades <= (p.stockMinimo || 10));
        const ventas = storage.getVentas?.() || [];
        const ventasCompletadas = ventas.filter(v => v.estado === 'completada');
        const ventasHoy = ventasCompletadas.filter(v => {
            try {
                return new Date(v.fecha).toDateString() === new Date().toDateString();
            } catch {
                return false;
            }
        });
        const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
        const gastos = storage.getGastos?.() || [];
        const gastosHoy = gastos.filter(g => {
            try {
                return new Date(g.fecha).toDateString() === new Date().toDateString();
            } catch {
                return false;
            }
        });
        const totalGastosHoy = gastosHoy.reduce((sum, g) => sum + (g.monto || 0), 0);
        
        // Alertas de lotes próximos a vencer
        const hoy = new Date();
        const lotesProximosVencer = this.lotes.filter(l => {
            if (!l.fechaVencimiento) return false;
            const vencimiento = new Date(l.fechaVencimiento);
            const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
            return diasRestantes <= 30 && diasRestantes > 0 && l.cantidad > 0;
        });

        // Órdenes de trabajo pendientes
        const ordenesPendientes = this.ordenesTrabajo.filter(o => o.estado === 'pendiente' || o.estado === 'en_proceso').length;

        // Pedidos especiales pendientes
        const pedidosPendientes = this.pedidosEspeciales.filter(p => p.estado === 'pendiente').length;

        const config = storage.getConfig?.() || {};
        const nombreNegocio = config.nombreNegocio || 'Mi Negocio';
        
        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="dashboard-view">
                <h2 class="section-title">
                    <i class="fas fa-tachometer-alt"></i> Dashboard - ${nombreNegocio}
                </h2>
                
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="stat-card" style="background: #3498db; color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2em;">${productosActivos.length}</div>
                        <div>Productos Totales</div>
                    </div>
                    
                    <div class="stat-card" style="background: #e74c3c; color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2em;">${productosBajos.length}</div>
                        <div>Stock Bajo</div>
                    </div>
                    
                    <div class="stat-card" style="background: #f39c12; color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2em;">${lotesProximosVencer.length}</div>
                        <div>Lotes por Vencer</div>
                    </div>
                    
                    <div class="stat-card" style="background: #9b59b6; color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2em;">${ordenesPendientes}</div>
                        <div>Órdenes Taller</div>
                    </div>
                    
                    <div class="stat-card" style="background: #2ecc71; color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2em;">${ventasHoy.length}</div>
                        <div>Ventas Hoy</div>
                    </div>
                    
                    <div class="stat-card" style="background: #f39c12; color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2em;">$${totalVentasHoy.toLocaleString()}</div>
                        <div>Ingresos Hoy</div>
                    </div>

                    <div class="stat-card" style="background: #e67e22; color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2em;">$${totalGastosHoy.toLocaleString()}</div>
                        <div>Gastos Hoy</div>
                    </div>

                    <div class="stat-card" style="background: #1abc9c; color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2em;">${pedidosPendientes}</div>
                        <div>Pedidos Especiales</div>
                    </div>
                </div>
                
                <div class="dashboard-sections" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div class="dashboard-section" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3><i class="fas fa-exclamation-triangle text-warning"></i> Alertas Críticas</h3>
                        <div id="alertasList">
                            ${this.renderAlertasDashboard(productosBajos, lotesProximosVencer, ordenesPendientes, pedidosPendientes)}
                        </div>
                    </div>
                    
                    <div class="dashboard-section" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3><i class="fas fa-clock"></i> Acciones Rápidas</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button class="btn btn-success btn-block" onclick="app.mostrarModalNuevaVenta()">
                                <i class="fas fa-cash-register"></i> Nueva Venta
                            </button>
                            <button class="btn btn-primary btn-block" onclick="app.mostrarModalNuevaOrdenTrabajo()">
                                <i class="fas fa-tools"></i> Nueva Orden Taller
                            </button>
                            <button class="btn btn-info btn-block" onclick="app.mostrarModalNuevoPedidoEspecial()">
                                <i class="fas fa-box-open"></i> Nuevo Pedido Especial
                            </button>
                            <button class="btn btn-warning btn-block" onclick="app.mostrarModalNuevaDevolucion()">
                                <i class="fas fa-undo-alt"></i> Nueva Devolución
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAlertasDashboard(productosBajos, lotesProximosVencer, ordenesPendientes, pedidosPendientes) {
        let alertas = '';
        
        if (productosBajos.length > 0) {
            alertas += `
                <div style="padding: 10px; margin-bottom: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <strong>${productosBajos.length} productos con stock bajo</strong>
                    <br><small>Revisa el inventario</small>
                </div>
            `;
        }
        
        if (lotesProximosVencer.length > 0) {
            alertas += `
                <div style="padding: 10px; margin-bottom: 10px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 5px;">
                    <i class="fas fa-calendar-times text-danger"></i>
                    <strong>${lotesProximosVencer.length} lotes próximos a vencer</strong>
                    <br><small>Revisa control de lotes</small>
                </div>
            `;
        }
        
        if (ordenesPendientes > 0) {
            alertas += `
                <div style="padding: 10px; margin-bottom: 10px; background: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 5px;">
                    <i class="fas fa-tools text-info"></i>
                    <strong>${ordenesPendientes} órdenes de taller pendientes</strong>
                    <br><small>Revisa el taller</small>
                </div>
            `;
        }
        
        if (pedidosPendientes > 0) {
            alertas += `
                <div style="padding: 10px; margin-bottom: 10px; background: #cce5ff; border-left: 4px solid #007bff; border-radius: 5px;">
                    <i class="fas fa-box-open text-primary"></i>
                    <strong>${pedidosPendientes} pedidos especiales pendientes</strong>
                    <br><small>Revisa pedidos</small>
                </div>
            `;
        }
        
        if (alertas === '') {
            alertas = `
                <div style="padding: 10px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 5px;">
                    <i class="fas fa-check-circle text-success"></i>
                    Todo está en orden
                </div>
            `;
        }
        
        return alertas;
    }
}

// Exportar la clase al ámbito global
window.InvPlanetApp = InvPlanetApp;