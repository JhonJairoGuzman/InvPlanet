// js/lotes.js - MÓDULO DE CONTROL POR LOTES
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarLotes = function() {
    this.lotes = JSON.parse(localStorage.getItem('invplanet_lotes') || '[]');
    console.log(`📦 Lotes cargados: ${this.lotes.length}`);
};

InvPlanetApp.prototype.guardarLotes = function() {
    localStorage.setItem('invplanet_lotes', JSON.stringify(this.lotes));
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalLotes = function() {
    const productos = storage.getInventario().filter(p => p.activo);
    let productosOptions = '<option value="">Todos los productos</option>';
    productos.forEach(p => {
        productosOptions += `<option value="${p.id}">${p.nombre}</option>`;
    });

    const hoy = new Date();
    const lotesProximosVencer = this.lotes.filter(l => {
        if (!l.fechaVencimiento) return false;
        const vencimiento = new Date(l.fechaVencimiento);
        const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 30 && diasRestantes > 0 && l.cantidad > 0;
    });

    let lotesHTML = '';
    this.lotes.sort((a, b) => {
        if (!a.fechaVencimiento) return 1;
        if (!b.fechaVencimiento) return -1;
        return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
    }).forEach(l => {
        const producto = storage.getProducto(l.productoId);
        const fechaVencimiento = l.fechaVencimiento ? new Date(l.fechaVencimiento).toLocaleDateString() : 'Sin vencimiento';
        
        let diasRestantes = null;
        let badgeClass = 'badge-success';
        if (l.fechaVencimiento) {
            const vencimiento = new Date(l.fechaVencimiento);
            diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
            if (diasRestantes < 0) {
                badgeClass = 'badge-danger';
            } else if (diasRestantes <= 7) {
                badgeClass = 'badge-danger';
            } else if (diasRestantes <= 15) {
                badgeClass = 'badge-warning';
            } else if (diasRestantes <= 30) {
                badgeClass = 'badge-info';
            }
        }

        lotesHTML += `
            <tr>
                <td>${producto ? producto.nombre : 'Producto eliminado'}</td>
                <td><strong>${l.numeroLote}</strong></td>
                <td>${l.cantidad}</td>
                <td>${fechaVencimiento}</td>
                <td>
                    <span class="badge ${badgeClass}">
                        ${l.fechaVencimiento ? (diasRestantes < 0 ? 'Vencido' : diasRestantes + ' días') : 'N/A'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="app.verDetalleLote('${l.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="app.ajustarStockLote('${l.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    const modalHTML = `
        <div class="modal-overlay active" id="modalLotes">
            <div class="modal-content" style="max-width: 1200px;">
                <div class="modal-header">
                    <h3><i class="fas fa-layer-group"></i> Control de Lotes</h3>
                    <button class="close-modal" onclick="cerrarModal('modalLotes')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevoLote()">
                        <i class="fas fa-plus"></i> Nuevo Lote
                    </button>

                    ${lotesProximosVencer.length > 0 ? `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>¡Atención!</strong> ${lotesProximosVencer.length} lotes próximos a vencer
                    </div>
                    ` : ''}
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Número de Lote</th>
                                    <th>Cantidad</th>
                                    <th>Fecha Vencimiento</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lotesHTML || '<tr><td colspan="6" class="text-center">No hay lotes registrados</td></tr>'}
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
// NUEVO LOTE
// ============================================

InvPlanetApp.prototype.mostrarModalNuevoLote = function() {
    const productos = storage.getInventario().filter(p => p.activo);
    let productosOptions = '<option value="">Seleccionar producto</option>';
    productos.forEach(p => {
        productosOptions += `<option value="${p.id}">${p.nombre} (Stock: ${p.unidades})</option>`;
    });

    const modalHTML = `
        <div class="modal-overlay active" id="modalNuevoLote">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-plus-circle"></i> Nuevo Lote</h3>
                    <button class="close-modal" onclick="cerrarModal('modalNuevoLote')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNuevoLote" onsubmit="return false;">
                        <div class="form-group">
                            <label>Producto *</label>
                            <select id="loteProductoId" class="form-control" required>
                                ${productosOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Número de Lote *</label>
                            <input type="text" id="loteNumero" class="form-control" required placeholder="Ej: LOTE-2024-001">
                        </div>
                        <div class="form-group">
                            <label>Cantidad *</label>
                            <input type="number" id="loteCantidad" class="form-control" required min="1" value="1">
                        </div>
                        <div class="form-group">
                            <label>Fecha de Vencimiento</label>
                            <input type="date" id="loteVencimiento" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Proveedor</label>
                            <select id="loteProveedorId" class="form-control">
                                <option value="">Seleccionar proveedor</option>
                                ${this.proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Costo por unidad</label>
                            <input type="number" id="loteCosto" class="form-control" min="0" step="100">
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevoLote')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevoLote()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

InvPlanetApp.prototype.guardarNuevoLote = function() {
    const productoId = document.getElementById('loteProductoId')?.value;
    const numeroLote = document.getElementById('loteNumero')?.value;
    const cantidad = document.getElementById('loteCantidad')?.value;
    
    if (!productoId || !numeroLote || !cantidad) {
        mostrarMensaje('❌ Completa los campos obligatorios', 'error');
        return;
    }

    const existe = this.lotes.find(l => l.productoId === productoId && l.numeroLote === numeroLote);
    if (existe) {
        mostrarMensaje('❌ Este número de lote ya existe para este producto', 'error');
        return;
    }

    const nuevoLote = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        productoId: productoId,
        numeroLote: numeroLote,
        cantidad: parseInt(cantidad),
        cantidadOriginal: parseInt(cantidad),
        fechaVencimiento: document.getElementById('loteVencimiento')?.value || null,
        proveedorId: document.getElementById('loteProveedorId')?.value || null,
        costoUnitario: parseFloat(document.getElementById('loteCosto')?.value) || 0,
        fechaIngreso: new Date().toISOString(),
        movimientos: [{
            fecha: new Date().toISOString(),
            tipo: 'ingreso',
            cantidad: parseInt(cantidad),
            usuario: this.getUsuarioActual()?.nombre || 'Sistema'
        }]
    };

    this.lotes.push(nuevoLote);
    this.guardarLotes();

    const producto = storage.getProducto(productoId);
    if (producto) {
        producto.unidades += parseInt(cantidad);
        storage.updateProducto(productoId, { unidades: producto.unidades });
    }

    mostrarMensaje('✅ Lote registrado exitosamente', 'success');
    cerrarModal('modalNuevoLote');
    this.mostrarModalLotes();
};

// ============================================
// VER DETALLE DE LOTE
// ============================================

InvPlanetApp.prototype.verDetalleLote = function(id) {
    const lote = this.lotes.find(l => l.id === id);
    if (!lote) return;

    const producto = storage.getProducto(lote.productoId);
    const proveedor = lote.proveedorId ? this.proveedores.find(p => p.id === lote.proveedorId) : null;

    let movimientosHTML = '';
    lote.movimientos.forEach(m => {
        const fecha = new Date(m.fecha);
        movimientosHTML += `
            <tr>
                <td>${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}</td>
                <td>${m.tipo === 'ingreso' ? '📦 Ingreso' : '🛒 Venta'}</td>
                <td>${m.cantidad}</td>
                <td>${m.usuario}</td>
                <td>${m.nota || ''}</td>
            </tr>
        `;
    });

    const modalHTML = `
        <div class="modal-overlay active" id="modalDetalleLote">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-layer-group"></i> Detalle del Lote: ${lote.numeroLote}</h3>
                    <button class="close-modal" onclick="cerrarModal('modalDetalleLote')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Producto:</strong> ${producto ? producto.nombre : 'N/A'}</p>
                    <p><strong>Cantidad original:</strong> ${lote.cantidadOriginal}</p>
                    <p><strong>Cantidad actual:</strong> ${lote.cantidad}</p>
                    <p><strong>Fecha vencimiento:</strong> ${lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Proveedor:</strong> ${proveedor ? proveedor.nombre : 'N/A'}</p>
                    
                    <h5>Historial de movimientos</h5>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Cantidad</th>
                                <th>Usuario</th>
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movimientosHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

// ============================================
// AJUSTAR STOCK DE LOTE
// ============================================

InvPlanetApp.prototype.ajustarStockLote = function(id) {
    const lote = this.lotes.find(l => l.id === id);
    if (!lote) return;

    const nuevaCantidad = prompt(`Nueva cantidad para lote ${lote.numeroLote} (Actual: ${lote.cantidad})`, lote.cantidad);
    if (!nuevaCantidad) return;

    const cantidadNum = parseInt(nuevaCantidad);
    if (isNaN(cantidadNum) || cantidadNum < 0) {
        mostrarMensaje('❌ Cantidad inválida', 'error');
        return;
    }

    const diferencia = cantidadNum - lote.cantidad;
    
    lote.cantidad = cantidadNum;
    lote.movimientos.push({
        fecha: new Date().toISOString(),
        tipo: diferencia > 0 ? 'ingreso' : 'ajuste',
        cantidad: Math.abs(diferencia),
        nota: diferencia > 0 ? 'Ajuste manual (+)' : 'Ajuste manual (-)',
        usuario: this.getUsuarioActual()?.nombre || 'Sistema'
    });

    this.guardarLotes();

    const producto = storage.getProducto(lote.productoId);
    if (producto) {
        producto.unidades += diferencia;
        storage.updateProducto(lote.productoId, { unidades: producto.unidades });
    }

    mostrarMensaje('✅ Lote actualizado', 'success');
    this.mostrarModalLotes();
};

console.log('✅ Módulo de Lotes cargado');