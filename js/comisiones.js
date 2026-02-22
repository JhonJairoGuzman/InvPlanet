// js/comisiones.js - MÓDULO DE COMISIONES
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarComisiones = function() {
    this.comisiones = JSON.parse(localStorage.getItem('invplanet_comisiones') || '[]');
    console.log(`💰 Comisiones cargadas: ${this.comisiones.length}`);
};

InvPlanetApp.prototype.guardarComisiones = function() {
    localStorage.setItem('invplanet_comisiones', JSON.stringify(this.comisiones));
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalComisiones = function() {
    const usuarios = this.usuarios || [];
    let usuariosOptions = '<option value="">Seleccionar usuario</option>';
    usuarios.forEach(u => {
        if (u.role !== 'admin') {
            usuariosOptions += `<option value="${u.id}">${u.nombre || u.username}</option>`;
        }
    });
    
    let comisionesHTML = '';
    this.comisiones.forEach(c => {
        comisionesHTML += `
            <tr>
                <td>${c.usuarioNombre}</td>
                <td>${c.tipo}</td>
                <td>${c.valor}${c.tipo === 'porcentaje' ? '%' : ''}</td>
                <td>${c.activa ? 'Sí' : 'No'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editarComision('${c.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.eliminarComision('${c.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalComisiones">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-hand-holding-usd"></i> Comisiones</h3>
                    <button class="close-modal" onclick="cerrarModal('modalComisiones')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevaComision()">
                        <i class="fas fa-plus"></i> Nueva Comisión
                    </button>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                                <th>Activa</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${comisionesHTML || '<tr><td colspan="5" class="text-center">No hay comisiones configuradas</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    this.modalOpen = true;
};

// ============================================
// NUEVA COMISIÓN
// ============================================

InvPlanetApp.prototype.mostrarModalNuevaComision = function() {
    const usuarios = this.usuarios || [];
    let usuariosOptions = '<option value="">Seleccionar usuario</option>';
    usuarios.forEach(u => {
        if (u.role !== 'admin') {
            usuariosOptions += `<option value="${u.id}">${u.nombre || u.username}</option>`;
        }
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalNuevaComision">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-percent"></i> Nueva Comisión</h3>
                    <button class="close-modal" onclick="cerrarModal('modalNuevaComision')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNuevaComision" onsubmit="return false;">
                        <div class="form-group">
                            <label>Usuario *</label>
                            <select id="comisionUsuarioId" class="form-control">
                                ${usuariosOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Tipo</label>
                            <select id="comisionTipo" class="form-control">
                                <option value="porcentaje">Porcentaje sobre venta</option>
                                <option value="fijo">Monto fijo por venta</option>
                                <option value="producto">Por producto específico</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Valor</label>
                            <input type="number" id="comisionValor" class="form-control" min="0" step="0.01" required>
                            <small class="text-muted">Si es porcentaje, ingresa % (ej: 10 para 10%)</small>
                        </div>
                        
                        <div class="form-group" id="campoProductoComision" style="display:none;">
                            <label>Producto</label>
                            <select id="comisionProductoId" class="form-control">
                                ${this.generarOptionsProductos()}
                            </select>
                        </div>
                        
                        <div class="form-check mb-3">
                            <input type="checkbox" id="comisionActiva" class="form-check-input" checked>
                            <label class="form-check-label">Activa</label>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevaComision')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevaComision()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    document.getElementById('comisionTipo')?.addEventListener('change', (e) => {
        document.getElementById('campoProductoComision').style.display = e.target.value === 'producto' ? 'block' : 'none';
    });
};

InvPlanetApp.prototype.guardarNuevaComision = function() {
    const usuarioId = document.getElementById('comisionUsuarioId')?.value;
    const tipo = document.getElementById('comisionTipo')?.value;
    const valor = document.getElementById('comisionValor')?.value;
    
    if (!usuarioId || !tipo || !valor) {
        mostrarMensaje('❌ Completa todos los campos', 'error');
        return;
    }
    
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    
    const nuevaComision = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        usuarioId: usuarioId,
        usuarioNombre: usuario?.nombre || usuario?.username || '',
        tipo: tipo,
        valor: parseFloat(valor),
        productoId: document.getElementById('comisionProductoId')?.value || null,
        activa: document.getElementById('comisionActiva')?.checked || false,
        fechaCreacion: new Date().toISOString()
    };
    
    this.comisiones.push(nuevaComision);
    this.guardarComisiones();
    mostrarMensaje('✅ Comisión guardada', 'success');
    cerrarModal('modalNuevaComision');
    this.mostrarModalComisiones();
};

// ============================================
// CALCULAR COMISIÓN
// ============================================

InvPlanetApp.prototype.calcularComision = function(venta, usuarioId) {
    let totalComision = 0;
    
    for (const c of this.comisiones) {
        if (!c.activa) continue;
        if (c.usuarioId !== usuarioId) continue;
        
        if (c.tipo === 'porcentaje') {
            totalComision += venta.total * (c.valor / 100);
        } else if (c.tipo === 'fijo') {
            totalComision += c.valor;
        } else if (c.tipo === 'producto' && c.productoId) {
            const producto = venta.productos.find(p => p.productoId === c.productoId);
            if (producto) {
                totalComision += c.valor * producto.cantidad;
            }
        }
    }
    
    return totalComision;
};

console.log('✅ Módulo de Comisiones cargado');