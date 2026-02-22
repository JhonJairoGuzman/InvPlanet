// js/clientes.js - MÓDULO DE CLIENTES
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarClientes = function() {
    this.clientes = JSON.parse(localStorage.getItem('invplanet_clientes') || '[]');
    console.log(`👤 Clientes cargados: ${this.clientes.length}`);
};

InvPlanetApp.prototype.guardarClientes = function() {
    localStorage.setItem('invplanet_clientes', JSON.stringify(this.clientes));
};

// ============================================
// MODALES PRINCIPALES
// ============================================

InvPlanetApp.prototype.mostrarModalClientes = function() {
    let clientesHTML = '';
    this.clientes.forEach(c => {
        clientesHTML += `
            <tr>
                <td>${c.nombre}</td>
                <td>${c.telefono || ''}</td>
                <td>${c.email || ''}</td>
                <td>${c.direccion || ''}</td>
                <td>${c.puntos || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editarCliente('${c.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="app.verHistorialCliente('${c.id}')">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.verVehiculosCliente('${c.id}')">
                        <i class="fas fa-car"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalClientes">
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3><i class="fas fa-users"></i> Clientes</h3>
                    <button class="close-modal" onclick="cerrarModal('modalClientes')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevoCliente()">
                        <i class="fas fa-plus"></i> Nuevo Cliente
                    </button>
                    
                    <div class="mb-3">
                        <input type="text" class="form-control" id="buscarCliente" placeholder="Buscar cliente...">
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Dirección</th>
                                    <th>Puntos</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tablaClientes">
                                ${clientesHTML || '<tr><td colspan="6" class="text-center">No hay clientes</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    this.modalOpen = true;
    
    document.getElementById('buscarCliente')?.addEventListener('keyup', () => this.buscarClientes());
};

InvPlanetApp.prototype.buscarClientes = function() {
    const query = document.getElementById('buscarCliente')?.value.toLowerCase() || '';
    const filtrados = this.clientes.filter(c => 
        c.nombre?.toLowerCase().includes(query) || 
        c.telefono?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
    );
    
    let html = '';
    filtrados.forEach(c => {
        html += `
            <tr>
                <td>${c.nombre}</td>
                <td>${c.telefono || ''}</td>
                <td>${c.email || ''}</td>
                <td>${c.direccion || ''}</td>
                <td>${c.puntos || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.editarCliente('${c.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="app.verHistorialCliente('${c.id}')">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.verVehiculosCliente('${c.id}')">
                        <i class="fas fa-car"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('tablaClientes').innerHTML = html || '<tr><td colspan="6" class="text-center">No hay resultados</td></tr>';
};

// ============================================
// NUEVO CLIENTE
// ============================================

InvPlanetApp.prototype.mostrarModalNuevoCliente = function() {
    const modalHTML = `
        <div class="modal-overlay active" id="modalNuevoCliente">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Nuevo Cliente</h3>
                    <button class="close-modal" onclick="cerrarModal('modalNuevoCliente')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNuevoCliente" onsubmit="return false;">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" id="clienteNombre" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="clienteTelefono" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="clienteEmail" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Dirección</label>
                            <input type="text" id="clienteDireccion" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Fecha de nacimiento</label>
                            <input type="date" id="clienteNacimiento" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Puntos iniciales</label>
                            <input type="number" id="clientePuntos" class="form-control" value="0" min="0">
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea id="clienteNotas" class="form-control" rows="2"></textarea>
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevoCliente')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevoCliente()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

InvPlanetApp.prototype.guardarNuevoCliente = function() {
    const nombre = document.getElementById('clienteNombre')?.value;
    
    if (!nombre) {
        mostrarMensaje('❌ El nombre es obligatorio', 'error');
        return;
    }
    
    const nuevoCliente = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        nombre: nombre,
        telefono: document.getElementById('clienteTelefono')?.value || '',
        email: document.getElementById('clienteEmail')?.value || '',
        direccion: document.getElementById('clienteDireccion')?.value || '',
        fechaNacimiento: document.getElementById('clienteNacimiento')?.value || '',
        puntos: parseInt(document.getElementById('clientePuntos')?.value) || 0,
        notas: document.getElementById('clienteNotas')?.value || '',
        totalCompras: 0,
        ultimaCompra: null,
        fechaCreacion: new Date().toISOString()
    };
    
    this.clientes.push(nuevoCliente);
    this.guardarClientes();
    mostrarMensaje('✅ Cliente guardado', 'success');
    cerrarModal('modalNuevoCliente');
    this.mostrarModalClientes();
};

// ============================================
// EDITAR CLIENTE
// ============================================

InvPlanetApp.prototype.editarCliente = function(id) {
    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) return;
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalEditarCliente">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-user-edit"></i> Editar Cliente</h3>
                    <button class="close-modal" onclick="cerrarModal('modalEditarCliente')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formEditarCliente" onsubmit="return false;">
                        <input type="hidden" id="editClienteId" value="${cliente.id}">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" id="editClienteNombre" class="form-control" value="${cliente.nombre}" required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="editClienteTelefono" class="form-control" value="${cliente.telefono || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="editClienteEmail" class="form-control" value="${cliente.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Dirección</label>
                            <input type="text" id="editClienteDireccion" class="form-control" value="${cliente.direccion || ''}">
                        </div>
                        <div class="form-group">
                            <label>Fecha de nacimiento</label>
                            <input type="date" id="editClienteNacimiento" class="form-control" value="${cliente.fechaNacimiento || ''}">
                        </div>
                        <div class="form-group">
                            <label>Puntos</label>
                            <input type="number" id="editClientePuntos" class="form-control" value="${cliente.puntos || 0}" min="0">
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea id="editClienteNotas" class="form-control" rows="2">${cliente.notas || ''}</textarea>
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalEditarCliente')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarEdicionCliente()">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

InvPlanetApp.prototype.guardarEdicionCliente = function() {
    const id = document.getElementById('editClienteId')?.value;
    const nombre = document.getElementById('editClienteNombre')?.value;
    
    if (!nombre) {
        mostrarMensaje('❌ El nombre es obligatorio', 'error');
        return;
    }
    
    const index = this.clientes.findIndex(c => c.id === id);
    if (index !== -1) {
        this.clientes[index] = {
            ...this.clientes[index],
            nombre: nombre,
            telefono: document.getElementById('editClienteTelefono')?.value || '',
            email: document.getElementById('editClienteEmail')?.value || '',
            direccion: document.getElementById('editClienteDireccion')?.value || '',
            fechaNacimiento: document.getElementById('editClienteNacimiento')?.value || '',
            puntos: parseInt(document.getElementById('editClientePuntos')?.value) || 0,
            notas: document.getElementById('editClienteNotas')?.value || '',
            fechaActualizacion: new Date().toISOString()
        };
        
        this.guardarClientes();
        mostrarMensaje('✅ Cliente actualizado', 'success');
        cerrarModal('modalEditarCliente');
        this.mostrarModalClientes();
    }
};

// ============================================
// HISTORIAL DEL CLIENTE
// ============================================

InvPlanetApp.prototype.verHistorialCliente = function(id) {
    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) return;
    
    const ventas = storage.getVentas?.() || [];
    const ventasCliente = ventas.filter(v => v.cliente === cliente.nombre || v.clienteId === id);
    const ordenes = this.ordenesTrabajo.filter(o => o.clienteId === id);
    const vehiculos = this.vehiculos.filter(v => v.clienteId === id);
    
    let historialHTML = '';
    ventasCliente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(v => {
        const fecha = new Date(v.fecha);
        historialHTML += `
            <tr>
                <td>Venta</td>
                <td>${v.numero}</td>
                <td>${fecha.toLocaleDateString()}</td>
                <td>$${v.total.toLocaleString()}</td>
            </tr>
        `;
    });
    
    ordenes.forEach(o => {
        const fecha = new Date(o.fecha);
        historialHTML += `
            <tr>
                <td>Taller</td>
                <td>${o.numero}</td>
                <td>${fecha.toLocaleDateString()}</td>
                <td>$${o.total.toLocaleString()}</td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalHistorialCliente">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-history"></i> Historial de ${cliente.nombre}</h3>
                    <button class="close-modal" onclick="cerrarModal('modalHistorialCliente')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Total compras:</strong> ${ventasCliente.length}</p>
                    <p><strong>Total gastado:</strong> $${ventasCliente.reduce((s, v) => s + v.total, 0).toLocaleString()}</p>
                    <p><strong>Órdenes taller:</strong> ${ordenes.length}</p>
                    <p><strong>Vehículos registrados:</strong> ${vehiculos.length}</p>
                    <p><strong>Puntos actuales:</strong> ${cliente.puntos || 0}</p>
                    
                    <h5>Historial de transacciones</h5>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Número</th>
                                <th>Fecha</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historialHTML || '<tr><td colspan="4" class="text-center">No hay transacciones</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

// ============================================
// VEHÍCULOS DEL CLIENTE
// ============================================

InvPlanetApp.prototype.verVehiculosCliente = function(id) {
    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) return;
    
    const vehiculos = this.vehiculos.filter(v => v.clienteId === id);
    
    let vehiculosHTML = '';
    vehiculos.forEach(v => {
        vehiculosHTML += `
            <tr>
                <td><strong>${v.placa}</strong></td>
                <td>${v.marca} ${v.modelo} (${v.año || 'N/A'})</td>
                <td>${v.color || 'N/A'}</td>
                <td>${v.kilometraje || 0} km</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="app.verHistorialVehiculo('${v.id}')">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    const modalHTML = `
        <div class="modal-overlay active" id="modalVehiculosCliente">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3><i class="fas fa-car"></i> Vehículos de ${cliente.nombre}</h3>
                    <button class="close-modal" onclick="cerrarModal('modalVehiculosCliente')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevoVehiculo('${cliente.id}')">
                        <i class="fas fa-plus"></i> Registrar Nuevo Vehículo
                    </button>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Vehículo</th>
                                <th>Color</th>
                                <th>Kilometraje</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vehiculosHTML || '<tr><td colspan="5" class="text-center">No hay vehículos registrados</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

console.log('✅ Módulo de Clientes cargado');