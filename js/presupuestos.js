// js/presupuestos.js - MÓDULO DE PRESUPUESTOS
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarPresupuestos = function() {
    this.presupuestos = JSON.parse(localStorage.getItem('invplanet_presupuestos') || '[]');
    console.log(`📋 Presupuestos cargados: ${this.presupuestos.length}`);
};

InvPlanetApp.prototype.guardarPresupuestos = function() {
    localStorage.setItem('invplanet_presupuestos', JSON.stringify(this.presupuestos));
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalPresupuestos = function() {
    let presupuestosHTML = '';
    this.presupuestos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(p => {
        const fecha = new Date(p.fecha).toLocaleDateString();
        const vencimiento = p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString() : '';
        
        presupuestosHTML += `
            <tr>
                <td>${p.numero}</td>
                <td>${fecha}</td>
                <td>${p.cliente}</td>
                <td>${p.productos.length}</td>
                <td>$${p.total.toLocaleString()}</td>
                <td>${vencimiento}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="app.convertirPresupuestoAVenta('${p.id}')">
                        <i class="fas fa-cash-register"></i> Vender
                    </button>
                    <button class="btn btn-sm btn-info" onclick="app.verPresupuesto('${p.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="app.imprimirPresupuesto('${p.id}')">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalPresupuestos">
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file-signature"></i> Presupuestos</h3>
                    <button class="close-modal" onclick="cerrarModal('modalPresupuestos')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevoPresupuesto()">
                        <i class="fas fa-plus"></i> Nuevo Presupuesto
                    </button>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Número</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Productos</th>
                                    <th>Total</th>
                                    <th>Vencimiento</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${presupuestosHTML || '<tr><td colspan="7" class="text-center">No hay presupuestos</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    this.modalOpen = true;
};

// ============================================
// NUEVO PRESUPUESTO
// ============================================

InvPlanetApp.prototype.mostrarModalNuevoPresupuesto = function() {
    const productos = storage.getInventario().filter(p => p.activo);
    let productosOptions = '';
    productos.forEach(p => {
        productosOptions += `<option value="${p.id}">${p.nombre} - $${p.precioVenta} (Stock: ${p.unidades})</option>`;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalNuevoPresupuesto">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file-signature"></i> Nuevo Presupuesto</h3>
                    <button class="close-modal" onclick="cerrarModal('modalNuevoPresupuesto')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNuevoPresupuesto" onsubmit="return false;">
                        <div class="form-group">
                            <label>Cliente</label>
                            <input type="text" id="presupuestoCliente" class="form-control" value="Cliente">
                        </div>
                        
                        <h5>Productos</h5>
                        <div id="productosPresupuesto">
                            <div class="row mb-2">
                                <div class="col-md-6">
                                    <select class="form-control presupuesto-producto" name="presupuestoProducto[]">
                                        ${productosOptions}
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <input type="number" class="form-control presupuesto-cantidad" name="presupuestoCantidad[]" value="1" min="1">
                                </div>
                                <div class="col-md-3">
                                    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <button type="button" class="btn btn-info mb-3" onclick="app.agregarProductoPresupuesto()">
                            <i class="fas fa-plus"></i> Agregar producto
                        </button>
                        
                        <div class="form-group">
                            <label>Fecha de vencimiento</label>
                            <input type="date" id="presupuestoVencimiento" class="form-control" value="${sumarDias(new Date(), 15).toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea id="presupuestoNotas" class="form-control" rows="2"></textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevoPresupuesto')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevoPresupuesto()">Guardar Presupuesto</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

InvPlanetApp.prototype.agregarProductoPresupuesto = function() {
    const productos = storage.getInventario().filter(p => p.activo);
    let productosOptions = '';
    productos.forEach(p => {
        productosOptions += `<option value="${p.id}">${p.nombre} - $${p.precioVenta} (Stock: ${p.unidades})</option>`;
    });
    
    const div = document.createElement('div');
    div.className = 'row mb-2';
    div.innerHTML = `
        <div class="col-md-6">
            <select class="form-control presupuesto-producto" name="presupuestoProducto[]">
                ${productosOptions}
            </select>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control presupuesto-cantidad" name="presupuestoCantidad[]" value="1" min="1">
        </div>
        <div class="col-md-3">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    document.getElementById('productosPresupuesto').appendChild(div);
};

InvPlanetApp.prototype.guardarNuevoPresupuesto = function() {
    const cliente = document.getElementById('presupuestoCliente')?.value || 'Cliente';
    
    const productosSelects = document.querySelectorAll('.presupuesto-producto');
    const cantidades = document.querySelectorAll('.presupuesto-cantidad');
    
    if (productosSelects.length === 0) {
        mostrarMensaje('❌ Agrega al menos un producto', 'error');
        return;
    }
    
    const productos = [];
    let total = 0;
    
    for (let i = 0; i < productosSelects.length; i++) {
        const productoId = productosSelects[i].value;
        const cantidad = parseInt(cantidades[i].value) || 1;
        const producto = storage.getProducto(productoId);
        
        if (producto) {
            productos.push({
                productoId: productoId,
                nombre: producto.nombre,
                cantidad: cantidad,
                precioUnitario: producto.precioVenta,
                subtotal: producto.precioVenta * cantidad
            });
            
            total += producto.precioVenta * cantidad;
        }
    }
    
    const presupuesto = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        numero: `PRE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(this.presupuestos.length + 1).padStart(4, '0')}`,
        fecha: new Date().toISOString(),
        cliente: cliente,
        productos: productos,
        total: total,
        fechaVencimiento: document.getElementById('presupuestoVencimiento')?.value || null,
        notas: document.getElementById('presupuestoNotas')?.value || '',
        convertido: false
    };
    
    this.presupuestos.push(presupuesto);
    this.guardarPresupuestos();
    
    mostrarMensaje('✅ Presupuesto guardado', 'success');
    cerrarModal('modalNuevoPresupuesto');
    this.mostrarModalPresupuestos();
};

// ============================================
// CONVERTIR PRESUPUESTO A VENTA
// ============================================

InvPlanetApp.prototype.convertirPresupuestoAVenta = function(id) {
    const presupuesto = this.presupuestos.find(p => p.id === id);
    if (!presupuesto) return;
    
    if (presupuesto.convertido) {
        mostrarMensaje('⚠️ Este presupuesto ya fue convertido', 'warning');
        return;
    }
    
    for (const p of presupuesto.productos) {
        const producto = storage.getProducto(p.productoId);
        if (!producto || producto.unidades < p.cantidad) {
            mostrarMensaje(`❌ Stock insuficiente para ${p.nombre}`, 'error');
            return;
        }
    }
    
    this.carritoVenta = presupuesto.productos.map(p => ({
        productoId: p.productoId,
        nombre: p.nombre,
        codigo: storage.getProducto(p.productoId)?.codigo || '',
        precioUnitario: p.precioUnitario,
        cantidad: p.cantidad,
        subtotal: p.subtotal,
        stockDisponible: storage.getProducto(p.productoId)?.unidades || 0
    }));
    
    presupuesto.convertido = true;
    presupuesto.fechaConversion = new Date().toISOString();
    this.guardarPresupuestos();
    
    this.mostrarModalNuevaVenta();
};

// ============================================
// VER PRESUPUESTO
// ============================================

InvPlanetApp.prototype.verPresupuesto = function(id) {
    const presupuesto = this.presupuestos.find(p => p.id === id);
    if (!presupuesto) return;
    
    const fecha = new Date(presupuesto.fecha);
    
    let productosHTML = '';
    presupuesto.productos.forEach(p => {
        productosHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.cantidad}</td>
                <td>$${p.precioUnitario}</td>
                <td>$${p.subtotal}</td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalVerPresupuesto">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file-signature"></i> Presupuesto ${presupuesto.numero}</h3>
                    <button class="close-modal" onclick="cerrarModal('modalVerPresupuesto')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
                    <p><strong>Cliente:</strong> ${presupuesto.cliente}</p>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosHTML}
                        </tbody>
                    </table>
                    
                    <h3 class="text-right">Total: $${presupuesto.total.toLocaleString()}</h3>
                    
                    ${presupuesto.notas ? `<p><strong>Notas:</strong> ${presupuesto.notas}</p>` : ''}
                    
                    <button class="btn btn-success" onclick="app.convertirPresupuestoAVenta('${presupuesto.id}')">
                        Convertir a Venta
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

// ============================================
// IMPRIMIR PRESUPUESTO
// ============================================

InvPlanetApp.prototype.imprimirPresupuesto = function(id) {
    const presupuesto = this.presupuestos.find(p => p.id === id);
    if (!presupuesto) return;
    
    const fecha = new Date(presupuesto.fecha);
    const config = storage.getConfig?.() || {};
    const nombreNegocio = config.nombreNegocio || 'Mi Negocio';
    
    let productosHTML = '';
    presupuesto.productos.forEach(p => {
        productosHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.cantidad}</td>
                <td>$${p.precioUnitario}</td>
                <td>$${p.subtotal}</td>
            </tr>
        `;
    });
    
    const facturaHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Presupuesto ${presupuesto.numero}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .empresa { font-size: 24px; font-weight: bold; color: #27ae60; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .totales { text-align: right; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="empresa">${nombreNegocio}</div>
                <h2>PRESUPUESTO</h2>
                <p>${presupuesto.numero}</p>
            </div>
            
            <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
            <p><strong>Cliente:</strong> ${presupuesto.cliente}</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
            </table>
            
            <div class="totales">
                <h3>TOTAL: $${presupuesto.total.toLocaleString()}</h3>
            </div>
            
            ${presupuesto.notas ? `<p><strong>Notas:</strong> ${presupuesto.notas}</p>` : ''}
            
            <div class="footer">
                <p>Presupuesto válido hasta: ${new Date(presupuesto.fechaVencimiento).toLocaleDateString()}</p>
            </div>
        </body>
        </html>
    `;
    
    const ventana = window.open('', '_blank');
    ventana.document.write(facturaHTML);
    ventana.document.close();
};

console.log('✅ Módulo de Presupuestos cargado');