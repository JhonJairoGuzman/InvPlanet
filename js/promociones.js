// js/promociones.js - MÓDULO DE PROMOCIONES Y DESCUENTOS
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarPromociones = function() {
    this.promociones = JSON.parse(localStorage.getItem('invplanet_promociones') || '[]');
    console.log(`🎁 Promociones cargadas: ${this.promociones.length}`);
};

InvPlanetApp.prototype.guardarPromociones = function() {
    localStorage.setItem('invplanet_promociones', JSON.stringify(this.promociones));
};

// ============================================
// GENERAR OPTIONS
// ============================================

InvPlanetApp.prototype.generarOptionsCategorias = function() {
    const categorias = storage.getCategorias();
    let options = '';
    categorias.forEach(c => {
        options += `<option value="${c.id}">${c.nombre}</option>`;
    });
    return options;
};

InvPlanetApp.prototype.generarOptionsProductos = function() {
    const productos = storage.getInventario();
    let options = '';
    productos.forEach(p => {
        options += `<option value="${p.id}">${p.nombre}</option>`;
    });
    return options;
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalPromociones = function() {
    let promocionesHTML = '';
    this.promociones.forEach(p => {
        const fechaInicio = p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString() : '';
        const fechaFin = p.fechaFin ? new Date(p.fechaFin).toLocaleDateString() : '';
        const activa = p.activa ? 'Sí' : 'No';
        
        promocionesHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.tipo}</td>
                <td>${p.valor}</td>
                <td>${fechaInicio}</td>
                <td>${fechaFin}</td>
                <td>${activa}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editarPromocion('${p.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.eliminarPromocion('${p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalPromociones">
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3><i class="fas fa-tags"></i> Promociones y Descuentos</h3>
                    <button class="close-modal" onclick="cerrarModal('modalPromociones')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevaPromocion()">
                        <i class="fas fa-plus"></i> Nueva Promoción
                    </button>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Valor</th>
                                    <th>Inicio</th>
                                    <th>Fin</th>
                                    <th>Activa</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${promocionesHTML || '<tr><td colspan="7" class="text-center">No hay promociones</td></tr>'}
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
// NUEVA PROMOCIÓN
// ============================================

InvPlanetApp.prototype.mostrarModalNuevaPromocion = function() {
    const modalHTML = `
        <div class="modal-overlay active" id="modalNuevaPromocion">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-tag-plus"></i> Nueva Promoción</h3>
                    <button class="close-modal" onclick="cerrarModal('modalNuevaPromocion')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNuevaPromocion" onsubmit="return false;">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" id="promocionNombre" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Tipo de promoción</label>
                            <select id="promocionTipo" class="form-control">
                                <option value="porcentaje">Porcentaje de descuento</option>
                                <option value="monto">Monto fijo de descuento</option>
                                <option value="2x1">2x1</option>
                                <option value="3x2">3x2</option>
                                <option value="combo">Combo especial</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Valor del descuento</label>
                            <input type="text" id="promocionValor" class="form-control" placeholder="Ej: 20% o $5000">
                        </div>
                        
                        <div class="form-group">
                            <label>Aplicar a</label>
                            <select id="promocionAplica" class="form-control">
                                <option value="todos">Todos los productos</option>
                                <option value="categoria">Categoría específica</option>
                                <option value="producto">Producto específico</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="campoCategoria" style="display:none;">
                            <label>Categoría</label>
                            <select id="promocionCategoria" class="form-control">
                                ${this.generarOptionsCategorias()}
                            </select>
                        </div>
                        
                        <div class="form-group" id="campoProducto" style="display:none;">
                            <label>Producto</label>
                            <select id="promocionProducto" class="form-control">
                                ${this.generarOptionsProductos()}
                            </select>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label>Fecha inicio</label>
                                <input type="date" id="promocionFechaInicio" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Fecha fin</label>
                                <input type="date" id="promocionFechaFin" class="form-control">
                            </div>
                        </div>
                        
                        <div class="form-check mb-3">
                            <input type="checkbox" id="promocionActiva" class="form-check-input" checked>
                            <label class="form-check-label">Activa</label>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevaPromocion')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevaPromocion()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    document.getElementById('promocionAplica')?.addEventListener('change', (e) => {
        const valor = e.target.value;
        document.getElementById('campoCategoria').style.display = valor === 'categoria' ? 'block' : 'none';
        document.getElementById('campoProducto').style.display = valor === 'producto' ? 'block' : 'none';
    });
};

InvPlanetApp.prototype.guardarNuevaPromocion = function() {
    const nombre = document.getElementById('promocionNombre')?.value;
    
    if (!nombre) {
        mostrarMensaje('❌ El nombre es obligatorio', 'error');
        return;
    }
    
    const nuevaPromocion = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        nombre: nombre,
        tipo: document.getElementById('promocionTipo')?.value || 'porcentaje',
        valor: document.getElementById('promocionValor')?.value || '',
        aplica: document.getElementById('promocionAplica')?.value || 'todos',
        categoriaId: document.getElementById('promocionCategoria')?.value || null,
        productoId: document.getElementById('promocionProducto')?.value || null,
        fechaInicio: document.getElementById('promocionFechaInicio')?.value || null,
        fechaFin: document.getElementById('promocionFechaFin')?.value || null,
        activa: document.getElementById('promocionActiva')?.checked || false,
        fechaCreacion: new Date().toISOString()
    };
    
    this.promociones.push(nuevaPromocion);
    this.guardarPromociones();
    mostrarMensaje('✅ Promoción creada', 'success');
    cerrarModal('modalNuevaPromocion');
    this.mostrarModalPromociones();
};

// ============================================
// APLICAR PROMOCIONES
// ============================================

InvPlanetApp.prototype.aplicarPromociones = function(precio, productoId, categoriaId, cantidad) {
    let precioFinal = precio;
    const ahora = new Date();
    
    for (const p of this.promociones) {
        if (!p.activa) continue;
        
        if (p.fechaInicio && new Date(p.fechaInicio) > ahora) continue;
        if (p.fechaFin && new Date(p.fechaFin) < ahora) continue;
        
        if (p.aplica === 'producto' && p.productoId !== productoId) continue;
        if (p.aplica === 'categoria' && p.categoriaId !== categoriaId) continue;
        
        if (p.tipo === 'porcentaje') {
            const descuento = parseFloat(p.valor) / 100;
            precioFinal = precio * (1 - descuento);
        } else if (p.tipo === 'monto') {
            const descuento = parseFloat(p.valor);
            precioFinal = precio - descuento;
        } else if (p.tipo === '2x1' && cantidad >= 2) {
            return { promocion: p, aplica: true };
        } else if (p.tipo === '3x2' && cantidad >= 3) {
            return { promocion: p, aplica: true };
        }
    }
    
    return { precioFinal, promocion: null };
};

console.log('✅ Módulo de Promociones cargado');