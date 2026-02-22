// js/proveedores.js - MÓDULO DE PROVEEDORES
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarProveedores = function() {
    this.proveedores = JSON.parse(localStorage.getItem('invplanet_proveedores') || '[]');
    console.log(`📦 Proveedores cargados: ${this.proveedores.length}`);
};

InvPlanetApp.prototype.guardarProveedores = function() {
    localStorage.setItem('invplanet_proveedores', JSON.stringify(this.proveedores));
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalProveedores = function() {
    let proveedoresHTML = '';
    this.proveedores.forEach(p => {
        proveedoresHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.contacto || ''}</td>
                <td>${p.telefono || ''}</td>
                <td>${p.email || ''}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editarProveedor('${p.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="app.verProductosProveedor('${p.id}')">
                        <i class="fas fa-boxes"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.mostrarModalNuevaOrdenCompra('${p.id}')">
                        <i class="fas fa-shopping-cart"></i> OC
                    </button>
                </td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalProveedores">
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3><i class="fas fa-truck"></i> Proveedores</h3>
                    <button class="close-modal" onclick="cerrarModal('modalProveedores')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevoProveedor()">
                        <i class="fas fa-plus"></i> Nuevo Proveedor
                    </button>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Contacto</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${proveedoresHTML || '<tr><td colspan="5" class="text-center">No hay proveedores</td></tr>'}
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
// NUEVO PROVEEDOR
// ============================================

InvPlanetApp.prototype.mostrarModalNuevoProveedor = function() {
    const modalHTML = `
        <div class="modal-overlay active" id="modalNuevoProveedor">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-truck-plus"></i> Nuevo Proveedor</h3>
                    <button class="close-modal" onclick="cerrarModal('modalNuevoProveedor')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNuevoProveedor" onsubmit="return false;">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" id="proveedorNombre" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Persona de contacto</label>
                            <input type="text" id="proveedorContacto" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="proveedorTelefono" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="proveedorEmail" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Dirección</label>
                            <input type="text" id="proveedorDireccion" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea id="proveedorNotas" class="form-control" rows="2"></textarea>
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevoProveedor')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevoProveedor()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

InvPlanetApp.prototype.guardarNuevoProveedor = function() {
    const nombre = document.getElementById('proveedorNombre')?.value;
    
    if (!nombre) {
        mostrarMensaje('❌ El nombre es obligatorio', 'error');
        return;
    }
    
    const nuevoProveedor = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        nombre: nombre,
        contacto: document.getElementById('proveedorContacto')?.value || '',
        telefono: document.getElementById('proveedorTelefono')?.value || '',
        email: document.getElementById('proveedorEmail')?.value || '',
        direccion: document.getElementById('proveedorDireccion')?.value || '',
        notas: document.getElementById('proveedorNotas')?.value || '',
        fechaCreacion: new Date().toISOString()
    };
    
    this.proveedores.push(nuevoProveedor);
    this.guardarProveedores();
    mostrarMensaje('✅ Proveedor guardado', 'success');
    cerrarModal('modalNuevoProveedor');
    this.mostrarModalProveedores();
};

// ============================================
// EDITAR PROVEEDOR
// ============================================

InvPlanetApp.prototype.editarProveedor = function(id) {
    const proveedor = this.proveedores.find(p => p.id === id);
    if (!proveedor) return;
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalEditarProveedor">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-truck-edit"></i> Editar Proveedor</h3>
                    <button class="close-modal" onclick="cerrarModal('modalEditarProveedor')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formEditarProveedor" onsubmit="return false;">
                        <input type="hidden" id="editProveedorId" value="${proveedor.id}">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" id="editProveedorNombre" class="form-control" value="${proveedor.nombre}" required>
                        </div>
                        <div class="form-group">
                            <label>Persona de contacto</label>
                            <input type="text" id="editProveedorContacto" class="form-control" value="${proveedor.contacto || ''}">
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="editProveedorTelefono" class="form-control" value="${proveedor.telefono || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="editProveedorEmail" class="form-control" value="${proveedor.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Dirección</label>
                            <input type="text" id="editProveedorDireccion" class="form-control" value="${proveedor.direccion || ''}">
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea id="editProveedorNotas" class="form-control" rows="2">${proveedor.notas || ''}</textarea>
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalEditarProveedor')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarEdicionProveedor()">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

InvPlanetApp.prototype.guardarEdicionProveedor = function() {
    const id = document.getElementById('editProveedorId')?.value;
    const nombre = document.getElementById('editProveedorNombre')?.value;
    
    if (!nombre) {
        mostrarMensaje('❌ El nombre es obligatorio', 'error');
        return;
    }
    
    const index = this.proveedores.findIndex(p => p.id === id);
    if (index !== -1) {
        this.proveedores[index] = {
            ...this.proveedores[index],
            nombre: nombre,
            contacto: document.getElementById('editProveedorContacto')?.value || '',
            telefono: document.getElementById('editProveedorTelefono')?.value || '',
            email: document.getElementById('editProveedorEmail')?.value || '',
            direccion: document.getElementById('editProveedorDireccion')?.value || '',
            notas: document.getElementById('editProveedorNotas')?.value || '',
            fechaActualizacion: new Date().toISOString()
        };
        
        this.guardarProveedores();
        mostrarMensaje('✅ Proveedor actualizado', 'success');
        cerrarModal('modalEditarProveedor');
        this.mostrarModalProveedores();
    }
};

// ============================================
// VER PRODUCTOS DEL PROVEEDOR
// ============================================

InvPlanetApp.prototype.verProductosProveedor = function(id) {
    const proveedor = this.proveedores.find(p => p.id === id);
    if (!proveedor) return;
    
    const inventario = storage.getInventario();
    const productos = inventario.filter(p => p.proveedorId === id || p.proveedor === proveedor.nombre);
    
    let productosHTML = '';
    productos.forEach(p => {
        productosHTML += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.unidades}</td>
                <td>$${p.costoUnitario}</td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalProductosProveedor">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-boxes"></i> Productos de ${proveedor.nombre}</h3>
                    <button class="close-modal" onclick="cerrarModal('modalProductosProveedor')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Total productos:</strong> ${productos.length}</p>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th>Stock</th>
                                <th>Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosHTML || '<tr><td colspan="4" class="text-center">No hay productos de este proveedor</td></tr>'}
                        </tbody>
                    </table>
                    
                    <button class="btn btn-primary mt-3" onclick="app.mostrarModalNuevaOrdenCompra('${id}')">
                        <i class="fas fa-shopping-cart"></i> Crear Orden de Compra
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

console.log('✅ Módulo de Proveedores cargado');