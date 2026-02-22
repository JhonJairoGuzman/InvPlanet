// js/series.js - MÓDULO DE NÚMEROS DE SERIE
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarSeries = function() {
    this.series = JSON.parse(localStorage.getItem('invplanet_series') || '[]');
    console.log(`🔢 Números de serie cargados: ${this.series.length}`);
};

InvPlanetApp.prototype.guardarSeries = function() {
    localStorage.setItem('invplanet_series', JSON.stringify(this.series));
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalSeries = function() {
    const productos = storage.getInventario().filter(p => p.activo);
    let productosOptions = '<option value="">Seleccionar producto</option>';
    productos.forEach(p => {
        productosOptions += `<option value="${p.id}">${p.nombre} (Código: ${p.codigo})</option>`;
    });

    let seriesHTML = '';
    this.series.sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso)).forEach(s => {
        const producto = storage.getProducto(s.productoId);
        const fechaVenta = s.fechaVenta ? new Date(s.fechaVenta).toLocaleDateString() : 'No vendido';
        const garantiaVence = s.fechaVenta ? this.calcularFechaVencimientoGarantia(s.fechaVenta, s.diasGarantia) : null;
        
        seriesHTML += `
            <tr>
                <td>${producto ? producto.nombre : 'Producto eliminado'}</td>
                <td><strong>${s.numeroSerie}</strong></td>
                <td>${new Date(s.fechaIngreso).toLocaleDateString()}</td>
                <td>${s.estado}</td>
                <td>${fechaVenta}</td>
                <td>${garantiaVence ? garantiaVence.toLocaleDateString() : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="app.verHistorialSerie('${s.id}')">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.anularSerie('${s.id}')">
                        <i class="fas fa-ban"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    const modalHTML = `
        <div class="modal-overlay active" id="modalSeries">
            <div class="modal-content" style="max-width: 1200px;">
                <div class="modal-header">
                    <h3><i class="fas fa-fingerprint"></i> Números de Serie</h3>
                    <button class="close-modal" onclick="cerrarModal('modalSeries')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevoSerie()">
                        <i class="fas fa-plus"></i> Registrar Número de Serie
                    </button>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Número de Serie</th>
                                    <th>Fecha Ingreso</th>
                                    <th>Estado</th>
                                    <th>Fecha Venta</th>
                                    <th>Vencimiento Garantía</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${seriesHTML || '<tr><td colspan="7" class="text-center">No hay números de serie registrados</td></tr>'}
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
// NUEVO SERIE
// ============================================

InvPlanetApp.prototype.mostrarModalNuevoSerie = function() {
    const productos = storage.getInventario().filter(p => p.activo);
    let productosOptions = '<option value="">Seleccionar producto</option>';
    productos.forEach(p => {
        productosOptions += `<option value="${p.id}">${p.nombre} (Código: ${p.codigo})</option>`;
    });

    const modalHTML = `
        <div class="modal-overlay active" id="modalNuevoSerie">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-plus-circle"></i> Registrar Número de Serie</h3>
                    <button class="close-modal" onclick="cerrarModal('modalNuevoSerie')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNuevoSerie" onsubmit="return false;">
                        <div class="form-group">
                            <label>Producto *</label>
                            <select id="serieProductoId" class="form-control" required>
                                ${productosOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Número de Serie *</label>
                            <input type="text" id="serieNumero" class="form-control" required placeholder="Ej: SN-2024-0001">
                        </div>
                        <div class="form-group">
                            <label>Días de Garantía</label>
                            <input type="number" id="serieGarantia" class="form-control" value="365" min="0">
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea id="serieNotas" class="form-control" rows="2"></textarea>
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevoSerie')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevoSerie()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

InvPlanetApp.prototype.guardarNuevoSerie = function() {
    const productoId = document.getElementById('serieProductoId')?.value;
    const numeroSerie = document.getElementById('serieNumero')?.value;
    
    if (!productoId || !numeroSerie) {
        mostrarMensaje('❌ Completa los campos obligatorios', 'error');
        return;
    }

    const existe = this.series.find(s => s.numeroSerie === numeroSerie);
    if (existe) {
        mostrarMensaje('❌ Este número de serie ya está registrado', 'error');
        return;
    }

    const nuevoSerie = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        productoId: productoId,
        numeroSerie: numeroSerie,
        fechaIngreso: new Date().toISOString(),
        estado: 'disponible',
        diasGarantia: parseInt(document.getElementById('serieGarantia')?.value) || 365,
        notas: document.getElementById('serieNotas')?.value || '',
        historial: [{
            fecha: new Date().toISOString(),
            accion: 'Registro inicial',
            usuario: this.getUsuarioActual()?.nombre || 'Sistema'
        }]
    };

    this.series.push(nuevoSerie);
    this.guardarSeries();
    mostrarMensaje('✅ Número de serie registrado', 'success');
    cerrarModal('modalNuevoSerie');
    this.mostrarModalSeries();
};

// ============================================
// VER HISTORIAL DE SERIE
// ============================================

InvPlanetApp.prototype.verHistorialSerie = function(id) {
    const serie = this.series.find(s => s.id === id);
    if (!serie) return;

    const producto = storage.getProducto(serie.productoId);
    
    let historialHTML = '';
    serie.historial.forEach(h => {
        const fecha = new Date(h.fecha);
        historialHTML += `
            <tr>
                <td>${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}</td>
                <td>${h.accion}</td>
                <td>${h.usuario || 'Sistema'}</td>
            </tr>
        `;
    });

    const modalHTML = `
        <div class="modal-overlay active" id="modalHistorialSerie">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3><i class="fas fa-history"></i> Historial de Serie: ${serie.numeroSerie}</h3>
                    <button class="close-modal" onclick="cerrarModal('modalHistorialSerie')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Producto:</strong> ${producto ? producto.nombre : 'N/A'}</p>
                    <p><strong>Estado actual:</strong> ${serie.estado}</p>
                    <p><strong>Garantía:</strong> ${serie.diasGarantia} días</p>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Acción</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historialHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

// ============================================
// ANULAR SERIE
// ============================================

InvPlanetApp.prototype.anularSerie = function(id) {
    if (!confirm('¿Anular este número de serie?')) return;
    
    const index = this.series.findIndex(s => s.id === id);
    if (index !== -1) {
        this.series[index].estado = 'anulado';
        this.series[index].historial.push({
            fecha: new Date().toISOString(),
            accion: 'Serie anulada',
            usuario: this.getUsuarioActual()?.nombre || 'Sistema'
        });
        this.guardarSeries();
        mostrarMensaje('✅ Serie anulada', 'success');
        this.mostrarModalSeries();
    }
};

// ============================================
// CALCULAR FECHA VENCIMIENTO GARANTÍA
// ============================================

InvPlanetApp.prototype.calcularFechaVencimientoGarantia = function(fechaVenta, diasGarantia) {
    const fecha = new Date(fechaVenta);
    fecha.setDate(fecha.getDate() + diasGarantia);
    return fecha;
};

console.log('✅ Módulo de Series cargado');