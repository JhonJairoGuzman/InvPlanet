// js/ventas.js - Sistema de ventas completo y funcional
// Versión 2.0.0

class VentasManager {
    constructor() {
        this.carrito = [];
        this.currentVenta = null;
        this.init();
    }
    
    init() {
        // Inicializar eventos si estamos en la vista de ventas
        if (window.app && app.currentView === 'ventas') {
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        // Configurar eventos específicos de ventas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('finalizar-venta-btn')) {
                this.finalizarVenta();
            }
        });
    }
    
    // Gestión del carrito
    agregarAlCarrito(productoId) {
        const producto = storage.getProducto(productoId);
        if (!producto) {
            app.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }
        
        if (producto.unidades <= 0) {
            app.mostrarMensaje('Producto agotado', 'error');
            return;
        }
        
        // Buscar si ya está en el carrito
        const itemIndex = this.carrito.findIndex(item => item.productoId === productoId);
        
        if (itemIndex !== -1) {
            // Verificar stock disponible
            if (this.carrito[itemIndex].cantidad >= producto.unidades) {
                app.mostrarMensaje('No hay suficiente stock', 'error');
                return;
            }
            this.carrito[itemIndex].cantidad += 1;
            this.carrito[itemIndex].subtotal = this.carrito[itemIndex].cantidad * this.carrito[itemIndex].precioUnitario;
        } else {
            // Agregar nuevo item al carrito
            this.carrito.push({
                productoId: productoId,
                nombre: producto.nombre,
                codigo: producto.codigo,
                precioUnitario: producto.precioVenta,
                cantidad: 1,
                subtotal: producto.precioVenta,
                stockDisponible: producto.unidades
            });
        }
        
        this.actualizarCarrito();
        app.mostrarMensaje('Producto agregado al carrito', 'success');
    }
    
    actualizarCarrito() {
        const carritoItems = document.getElementById('carritoItems');
        const subtotalElement = document.getElementById('subtotalCarrito');
        const impuestoElement = document.getElementById('impuestoCarrito');
        const totalElement = document.getElementById('totalCarrito');
        
        if (!carritoItems) return;
        
        if (this.carrito.length === 0) {
            carritoItems.innerHTML = '<p class="text-muted text-center">No hay productos en el carrito</p>';
            if (subtotalElement) subtotalElement.textContent = '$0.00';
            if (impuestoElement) impuestoElement.textContent = '$0.00';
            if (totalElement) totalElement.textContent = '$0.00';
            return;
        }
        
        let html = '';
        let subtotal = 0;
        
        this.carrito.forEach((item, index) => {
            subtotal += item.subtotal;
            
            html += `
                <div class="carrito-item">
                    <div class="item-info">
                        <h5>${item.nombre}</h5>
                        <p class="text-muted">${item.codigo || 'Sin código'}</p>
                        <p><strong>${app.formatCurrency(item.precioUnitario)} c/u</strong></p>
                    </div>
                    
                    <div class="item-cantidad">
                        <button class="btn btn-sm btn-secondary" onclick="ventasManager.disminuirCantidad(${index})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cantidad">${item.cantidad}</span>
                        <button class="btn btn-sm btn-secondary" onclick="ventasManager.aumentarCantidad(${index})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="item-subtotal">
                        <strong>${app.formatCurrency(item.subtotal)}</strong>
                    </div>
                    
                    <div class="item-acciones">
                        <button class="btn btn-sm btn-danger" onclick="ventasManager.eliminarDelCarrito(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        carritoItems.innerHTML = html;
        
        // Calcular impuestos y total
        const config = storage.getConfig();
        const tasaImpuesto = (config.impuesto || 0) / 100;
        const impuesto = subtotal * tasaImpuesto;
        const total = subtotal + impuesto;
        
        if (subtotalElement) subtotalElement.textContent = app.formatCurrency(subtotal);
        if (impuestoElement) impuestoElement.textContent = app.formatCurrency(impuesto);
        if (totalElement) totalElement.textContent = app.formatCurrency(total);
    }
    
    aumentarCantidad(index) {
        const item = this.carrito[index];
        const producto = storage.getProducto(item.productoId);
        
        if (!producto) {
            app.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }
        
        if (item.cantidad >= producto.unidades) {
            app.mostrarMensaje('No hay suficiente stock', 'error');
            return;
        }
        
        this.carrito[index].cantidad += 1;
        this.carrito[index].subtotal = this.carrito[index].cantidad * this.carrito[index].precioUnitario;
        this.actualizarCarrito();
    }
    
    disminuirCantidad(index) {
        if (this.carrito[index].cantidad > 1) {
            this.carrito[index].cantidad -= 1;
            this.carrito[index].subtotal = this.carrito[index].cantidad * this.carrito[index].precioUnitario;
            this.actualizarCarrito();
        }
    }
    
    eliminarDelCarrito(index) {
        this.carrito.splice(index, 1);
        this.actualizarCarrito();
        app.mostrarMensaje('Producto eliminado del carrito', 'info');
    }
    
    limpiarCarrito() {
        if (this.carrito.length === 0) {
            app.mostrarMensaje('El carrito ya está vacío', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de limpiar el carrito?')) {
            this.carrito = [];
            this.actualizarCarrito();
            app.mostrarMensaje('Carrito limpiado', 'success');
        }
    }
    
    // Finalizar venta
    finalizarVenta() {
        if (this.carrito.length === 0) {
            app.mostrarMensaje('El carrito está vacío', 'error');
            return;
        }
        
        const clienteNombre = document.getElementById('clienteNombre')?.value || '';
        const metodoPago = document.getElementById('metodoPago')?.value || 'efectivo';
        
        // Calcular totales
        const subtotal = this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
        const config = storage.getConfig();
        const tasaImpuesto = (config.impuesto || 0) / 100;
        const impuesto = subtotal * tasaImpuesto;
        const total = subtotal + impuesto;
        
        // Generar número de venta
        const ventas = storage.getVentas();
        const numeroVenta = `V-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(ventas.length + 1).padStart(4, '0')}`;
        
        // Crear objeto de venta
        const nuevaVenta = {
            id: Date.now().toString(),
            numero: numeroVenta,
            fecha: new Date().toISOString(),
            cliente: clienteNombre,
            productos: this.carrito.map(item => ({
                productoId: item.productoId,
                nombre: item.nombre,
                precioUnitario: item.precioUnitario,
                cantidad: item.cantidad,
                subtotal: item.subtotal
            })),
            subtotal: subtotal,
            impuesto: impuesto,
            total: total,
            metodoPago: metodoPago,
            estado: 'completada',
            usuario: getCurrentUser()?.nombre || 'Sistema'
        };
        
        // Verificar stock antes de proceder
        const stockSuficiente = this.verificarStock();
        if (!stockSuficiente) {
            app.mostrarMensaje('No hay suficiente stock para algunos productos', 'error');
            return;
        }
        
        // Actualizar stock de productos
        this.actualizarStockProductos();
        
        // Guardar venta
        storage.addVenta(nuevaVenta);
        
        // Limpiar carrito
        this.carrito = [];
        this.actualizarCarrito();
        
        // Mostrar comprobante
        this.mostrarComprobante(nuevaVenta);
        
        app.mostrarMensaje('Venta registrada exitosamente', 'success');
        app.cerrarModal('modalNuevaVenta');
        
        // Recargar vista de ventas
        if (app.currentView === 'ventas') {
            app.loadResumenVentas();
            app.loadVentas();
        }
    }
    
    verificarStock() {
        for (const item of this.carrito) {
            const producto = storage.getProducto(item.productoId);
            if (!producto || producto.unidades < item.cantidad) {
                return false;
            }
        }
        return true;
    }
    
    actualizarStockProductos() {
        this.carrito.forEach(item => {
            const producto = storage.getProducto(item.productoId);
            if (producto) {
                producto.unidades -= item.cantidad;
                storage.updateProducto(producto.id, { unidades: producto.unidades });
                
                // Registrar movimiento
                const movimiento = {
                    id: Date.now().toString(),
                    productoId: producto.id,
                    productoNombre: producto.nombre,
                    tipo: 'salida',
                    cantidad: item.cantidad,
                    motivo: 'venta',
                    fecha: new Date().toISOString(),
                    usuario: getCurrentUser()?.nombre || 'Sistema'
                };
                
                const movimientos = storage.getAll('invplanet_movimientos') || [];
                movimientos.push(movimiento);
                storage.save('invplanet_movimientos', movimientos);
            }
        });
    }
    
    mostrarComprobante(venta) {
        const fecha = new Date(venta.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalComprobante">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-receipt"></i> Comprobante de Venta</h3>
                        <button class="close-modal" onclick="app.cerrarModal('modalComprobante')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="comprobante">
                            <div class="comprobante-header">
                                <h4>${storage.getConfig().nombreNegocio || 'InvPlanet'}</h4>
                                <p>Venta #${venta.numero}</p>
                                <p>${fechaFormateada} ${horaFormateada}</p>
                            </div>
                            
                            <div class="comprobante-cliente">
                                <p><strong>Cliente:</strong> ${venta.cliente || 'Consumidor Final'}</p>
                            </div>
                            
                            <div class="comprobante-productos">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cant</th>
                                            <th>Precio</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${venta.productos.map(producto => `
                                            <tr>
                                                <td>${producto.nombre}</td>
                                                <td>${producto.cantidad}</td>
                                                <td>${app.formatCurrency(producto.precioUnitario)}</td>
                                                <td>${app.formatCurrency(producto.subtotal)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="comprobante-totales">
                                <div class="total-item">
                                    <span>Subtotal:</span>
                                    <span>${app.formatCurrency(venta.subtotal)}</span>
                                </div>
                                <div class="total-item">
                                    <span>Impuesto:</span>
                                    <span>${app.formatCurrency(venta.impuesto)}</span>
                                </div>
                                <div class="total-item total">
                                    <span>TOTAL:</span>
                                    <span>${app.formatCurrency(venta.total)}</span>
                                </div>
                            </div>
                            
                            <div class="comprobante-pago">
                                <p><strong>Método de Pago:</strong> ${venta.metodoPago}</p>
                                <p><strong>Estado:</strong> <span class="badge badge-success">${venta.estado}</span></p>
                            </div>
                            
                            <div class="comprobante-footer">
                                <p>¡Gracias por su compra!</p>
                                <small class="text-muted">Comprobante generado por InvPlanet</small>
                            </div>
                        </div>
                        
                        <div class="comprobante-acciones">
                            <button class="btn btn-primary" onclick="ventasManager.imprimirComprobante()">
                                <i class="fas fa-print"></i> Imprimir
                            </button>
                            <button class="btn btn-secondary" onclick="app.cerrarModal('modalComprobante')">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }
    
    imprimirComprobante() {
        const comprobante = document.querySelector('.comprobante');
        if (!comprobante) return;
        
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <html>
            <head>
                <title>Comprobante de Venta</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .comprobante { width: 80mm; }
                    .comprobante-header { text-align: center; margin-bottom: 20px; }
                    .comprobante-header h4 { margin: 0; font-size: 16px; }
                    .comprobante-cliente { margin-bottom: 15px; }
                    .comprobante-productos table { width: 100%; border-collapse: collapse; }
                    .comprobante-productos th, .comprobante-productos td { border: 1px solid #000; padding: 5px; font-size: 12px; }
                    .comprobante-totales { margin-top: 15px; text-align: right; }
                    .total-item { margin: 5px 0; }
                    .total { font-weight: bold; font-size: 14px; }
                    .comprobante-footer { margin-top: 20px; text-align: center; font-size: 11px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                ${comprobante.outerHTML}
            </body>
            </html>
        `);
        ventanaImpresion.document.close();
        
        setTimeout(() => {
            ventanaImpresion.print();
            ventanaImpresion.close();
        }, 500);
    }
    
    // Gestión de ventas existentes
    verDetalleVenta(ventaId) {
        const ventas = storage.getVentas();
        const venta = ventas.find(v => v.id === ventaId);
        
        if (!venta) {
            app.mostrarMensaje('Venta no encontrada', 'error');
            return;
        }
        
        const fecha = new Date(venta.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalDetalleVenta">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-invoice"></i> Detalle de Venta #${venta.numero}</h3>
                        <button class="close-modal" onclick="app.cerrarModal('modalDetalleVenta')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="venta-detalle">
                            <div class="venta-info-general">
                                <div class="info-item">
                                    <strong>Fecha:</strong>
                                    <span>${fechaFormateada} ${horaFormateada}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Cliente:</strong>
                                    <span>${venta.cliente || 'Cliente no especificado'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Método de Pago:</strong>
                                    <span>${venta.metodoPago || 'No especificado'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Estado:</strong>
                                    <span class="badge ${venta.estado === 'completada' ? 'badge-success' : 'badge-danger'}">${venta.estado || 'desconocido'}</span>
                                </div>
                            </div>
                            
                            <div class="venta-productos">
                                <h4>Productos</h4>
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unitario</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${venta.productos ? venta.productos.map(producto => `
                                            <tr>
                                                <td>${producto.nombre || 'Sin nombre'}</td>
                                                <td>${producto.cantidad || 0}</td>
                                                <td>${app.formatCurrency(producto.precioUnitario || 0)}</td>
                                                <td>${app.formatCurrency(producto.subtotal || 0)}</td>
                                            </tr>
                                        `).join('') : ''}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                                            <td><strong>${app.formatCurrency(venta.subtotal || 0)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-right"><strong>Impuesto:</strong></td>
                                            <td><strong>${app.formatCurrency(venta.impuesto || 0)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-right"><strong>Total:</strong></td>
                                            <td><strong class="text-success">${app.formatCurrency(venta.total || 0)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <div class="venta-acciones">
                                <button class="btn btn-secondary" onclick="app.cerrarModal('modalDetalleVenta')">
                                    Cerrar
                                </button>
                                ${venta.estado !== 'anulada' ? `
                                <button class="btn btn-danger" onclick="ventasManager.anularVenta('${venta.id}')">
                                    <i class="fas fa-ban"></i> Anular Venta
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }
    
    anularVenta(ventaId) {
        if (!confirm('¿Estás seguro de anular esta venta? Esta acción no se puede deshacer.')) {
            return;
        }
        
        const ventas = storage.getVentas();
        const ventaIndex = ventas.findIndex(v => v.id === ventaId);
        
        if (ventaIndex === -1) {
            app.mostrarMensaje('Venta no encontrada', 'error');
            return;
        }
        
        const venta = ventas[ventaIndex];
        
        // Revertir stock de productos
        if (venta.productos) {
            venta.productos.forEach(producto => {
                const productoActual = storage.getProducto(producto.productoId);
                if (productoActual) {
                    productoActual.unidades += producto.cantidad;
                    storage.updateProducto(productoActual.id, { unidades: productoActual.unidades });
                    
                    // Registrar movimiento de reversión
                    const movimiento = {
                        id: Date.now().toString(),
                        productoId: productoActual.id,
                        productoNombre: productoActual.nombre,
                        tipo: 'entrada',
                        cantidad: producto.cantidad,
                        motivo: 'anulacion_venta',
                        fecha: new Date().toISOString(),
                        usuario: getCurrentUser()?.nombre || 'Sistema'
                    };
                    
                    const movimientos = storage.getAll('invplanet_movimientos') || [];
                    movimientos.push(movimiento);
                    storage.save('invplanet_movimientos', movimientos);
                }
            });
        }
        
        // Actualizar estado de la venta
        ventas[ventaIndex].estado = 'anulada';
        ventas[ventaIndex].fechaAnulacion = new Date().toISOString();
        storage.saveVentas(ventas);
        
        app.mostrarMensaje('Venta anulada exitosamente', 'success');
        app.cerrarModal('modalDetalleVenta');
        
        // Recargar vistas
        if (app.currentView === 'ventas') {
            app.loadResumenVentas();
            app.loadVentas();
        }
        
        if (app.currentView === 'dashboard') {
            app.updateUltimasVentas();
            app.updateStats();
        }
    }
    
    // Búsqueda de productos para venta
    buscarProductoVenta() {
        const searchInput = document.getElementById('buscarProductoVenta');
        if (!searchInput) return;
        
        const query = searchInput.value.toLowerCase();
        const productosList = document.getElementById('productosDisponiblesList');
        if (!productosList) return;
        
        const productos = storage.getInventario()
            .filter(p => p.activo && p.unidades > 0);
        
        if (query === '') {
            this.loadProductosParaVenta();
            return;
        }
        
        const productosFiltrados = productos.filter(producto => {
            return (
                (producto.nombre && producto.nombre.toLowerCase().includes(query)) ||
                (producto.codigo && producto.codigo.toLowerCase().includes(query)) ||
                (producto.descripcion && producto.descripcion.toLowerCase().includes(query))
            );
        });
        
        if (productosFiltrados.length === 0) {
            productosList.innerHTML = '<p class="text-muted text-center">No se encontraron productos</p>';
            return;
        }
        
        let html = '';
        
        productosFiltrados.forEach(producto => {
            html += `
                <div class="producto-item" onclick="ventasManager.agregarAlCarrito('${producto.id}')">
                    <div class="producto-info">
                        <h5>${producto.nombre || 'Sin nombre'}</h5>
                        <p class="text-muted">${producto.codigo || 'Sin código'}</p>
                        <p><strong>${app.formatCurrency(producto.precioVenta || 0)}</strong></p>
                    </div>
                    <div class="producto-stock">
                        <span class="badge ${producto.unidades <= (producto.stockMinimo || 10) ? 'badge-warning' : 'badge-success'}">
                            ${producto.unidades || 0} disponibles
                        </span>
                    </div>
                </div>
            `;
        });
        
        productosList.innerHTML = html;
    }
    
    loadProductosParaVenta() {
        const productosList = document.getElementById('productosDisponiblesList');
        if (!productosList) return;
        
        const productos = storage.getInventario()
            .filter(p => p.activo && p.unidades > 0);
        
        if (productos.length === 0) {
            productosList.innerHTML = '<p class="text-muted text-center">No hay productos disponibles</p>';
            return;
        }
        
        let html = '';
        
        productos.forEach(producto => {
            html += `
                <div class="producto-item" onclick="ventasManager.agregarAlCarrito('${producto.id}')">
                    <div class="producto-info">
                        <h5>${producto.nombre || 'Sin nombre'}</h5>
                        <p class="text-muted">${producto.codigo || 'Sin código'}</p>
                        <p><strong>${app.formatCurrency(producto.precioVenta || 0)}</strong></p>
                    </div>
                    <div class="producto-stock">
                        <span class="badge ${producto.unidades <= (producto.stockMinimo || 10) ? 'badge-warning' : 'badge-success'}">
                            ${producto.unidades || 0} disponibles
                        </span>
                    </div>
                </div>
            `;
        });
        
        productosList.innerHTML = html;
    }
}

// Crear instancia global
const ventasManager = new VentasManager();

// Exportar funciones al ámbito global
window.ventasManager = ventasManager;
window.agregarAlCarrito = (id) => ventasManager.agregarAlCarrito(id);
window.limpiarCarrito = () => ventasManager.limpiarCarrito();
window.finalizarVenta = () => ventasManager.finalizarVenta();
window.verDetalleVenta = (id) => ventasManager.verDetalleVenta(id);
window.anularVenta = (id) => ventasManager.anularVenta(id);