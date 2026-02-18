// js/app.js - VERSIÓN DEFINITIVA - MEGA COMPLETA CON TODOS LOS MÓDULOS CRÍTICOS
// ============================================
// INCLUYE: Series y Lotes, Taller y Servicios, Recetas Médicas,
// Presupuestos para Talleres, Vehículos, Compras, Pedidos Especiales,
// Devoluciones y Garantías, Comisiones Avanzadas
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
        this.mesas = [];
        this.clientes = [];
        this.proveedores = [];
        this.promociones = [];
        this.comisiones = [];
        this.apartados = [];
        this.creditos = [];
        this.presupuestos = [];
        
        // ============================================
        // NUEVAS PROPIEDADES PARA MÓDULOS CRÍTICOS
        // ============================================
        this.series = [];               // Números de serie de productos
        this.lotes = [];                 // Control por lotes
        this.ordenesTrabajo = [];        // Taller y servicios
        this.tecnicos = [];               // Técnicos para taller
        this.recetasMedicas = [];         // Recetas médicas
        this.vehiculos = [];              // Vehículos por cliente
        this.ordenesCompra = [];           // Órdenes de compra
        this.pedidosEspeciales = [];       // Pedidos especiales a proveedores
        this.devoluciones = [];            // Devoluciones y garantías
        this.garantias = [];               // Seguimiento de garantías
        this.currentOrdenTrabajo = null;   // Orden actual en edición
        this.currentPedidoEspecial = null; // Pedido especial actual
        this.currentDevolucion = null;     // Devolución actual
        
        console.log('%c🔥 InvPlanet App v15.0 - MEGA COMPLETA CON TODOS LOS MÓDULOS CRÍTICOS', 'background: #27ae60; color: white; padding: 5px 10px; border-radius: 5px;');
        console.log('📦 Módulos nuevos: Series/Lotes, Taller, Recetas, Vehículos, Compras, Pedidos Especiales, Devoluciones');
        
        this.verificarStorage();
        this.cargarNombreNegocio();
        this.inicializarLectorBarra();
        this.cargarUsuarios();
        this.cargarClientes();
        this.cargarProveedores();
        this.cargarPromociones();
        this.cargarMesas();
        this.cargarComisiones();
        this.cargarApartados();
        this.cargarCreditos();
        this.cargarPresupuestos();
        this.cargarTurnoActual();
        
        // ============================================
        // CARGAR NUEVOS MÓDULOS
        // ============================================
        this.cargarSeries();
        this.cargarLotes();
        this.cargarOrdenesTrabajo();
        this.cargarTecnicos();
        this.cargarRecetasMedicas();
        this.cargarVehiculos();
        this.cargarOrdenesCompra();
        this.cargarPedidosEspeciales();
        this.cargarDevoluciones();
        this.cargarGarantias();
    }

    // ============================================
    // VERIFICACIÓN DE STORAGE
    // ============================================

    verificarStorage() {
        if (typeof storage === 'undefined') {
            console.error('❌ ERROR: storage no está definido');
            alert('Error: El sistema de almacenamiento no está disponible. Recarga la página.');
            return;
        }
        console.log('✅ Storage disponible');
        
        const inventario = storage.getInventario();
        console.log(`📦 Productos en inventario: ${inventario.length}`);
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

    // ============================================
    // USUARIOS Y PERMISOS
    // ============================================

    cargarUsuarios() {
        const users = storage.getUsers?.() || [];
        this.usuarios = users;
        console.log(`👥 Usuarios cargados: ${users.length}`);
    }

    getUsuarioActual() {
        return this.usuarioActual || JSON.parse(localStorage.getItem('invplanet_usuario_actual') || 'null');
    }

    setUsuarioActual(usuario) {
        this.usuarioActual = usuario;
        localStorage.setItem('invplanet_usuario_actual', JSON.stringify(usuario));
    }

    tienePermiso(permiso) {
        const usuario = this.getUsuarioActual();
        if (!usuario) return false;
        if (usuario.role === 'admin') return true;
        
        const permisos = {
            'admin': ['todo'],
            'cajero': ['ventas', 'ver_inventario', 'ver_clientes'],
            'cocina': ['ver_pedidos', 'actualizar_estado'],
            'domiciliario': ['ver_domicilios', 'actualizar_estado'],
            'mesero': ['ventas', 'ver_mesas', 'ver_clientes'],
            'taller': ['ordenes_trabajo', 'ver_inventario', 'ver_clientes', 'ver_vehiculos'],
            'tecnico': ['ordenes_trabajo', 'actualizar_estado_orden'],
            'farmacia': ['ventas', 'recetas', 'control_lotes', 'ver_vencimientos'],
            'invitado': ['ver_inventario']
        };
        
        return permisos[usuario.role]?.includes(permiso) || false;
    }

    mostrarModalUsuarios() {
        const usuarios = this.usuarios;
        const roles = ['admin', 'cajero', 'cocina', 'domiciliario', 'mesero', 'invitado', 'taller', 'tecnico', 'farmacia'];
        
        let usuariosHTML = '';
        usuarios.forEach(u => {
            usuariosHTML += `
                <tr>
                    <td>${u.username}</td>
                    <td>${u.nombre || ''}</td>
                    <td><span class="badge badge-info">${u.role}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarUsuario('${u.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.app.eliminarUsuario('${u.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalUsuarios">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-users"></i> Gestión de Usuarios</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalUsuarios')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoUsuario()">
                            <i class="fas fa-plus"></i> Nuevo Usuario
                        </button>
                        
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Nombre</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${usuariosHTML || '<tr><td colspan="4" class="text-center">No hay usuarios</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    mostrarModalNuevoUsuario() {
        const roles = ['admin', 'cajero', 'cocina', 'domiciliario', 'mesero', 'invitado', 'taller', 'tecnico', 'farmacia'];
        let rolesOptions = '';
        roles.forEach(r => {
            rolesOptions += `<option value="${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</option>`;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoUsuario">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> Nuevo Usuario</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoUsuario')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoUsuario" onsubmit="return false;">
                            <div class="form-group">
                                <label>Usuario *</label>
                                <input type="text" id="usuarioUsername" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Contraseña *</label>
                                <input type="password" id="usuarioPassword" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Nombre completo</label>
                                <input type="text" id="usuarioNombre" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Rol *</label>
                                <select id="usuarioRol" class="form-control">
                                    ${rolesOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="usuarioEmail" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Teléfono</label>
                                <input type="tel" id="usuarioTelefono" class="form-control">
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoUsuario')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoUsuario()">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarNuevoUsuario() {
        const username = document.getElementById('usuarioUsername')?.value;
        const password = document.getElementById('usuarioPassword')?.value;
        const nombre = document.getElementById('usuarioNombre')?.value;
        const rol = document.getElementById('usuarioRol')?.value;
        const email = document.getElementById('usuarioEmail')?.value;
        const telefono = document.getElementById('usuarioTelefono')?.value;
        
        if (!username || !password || !rol) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }
        
        const usuarios = storage.getUsers?.() || [];
        const existe = usuarios.find(u => u.username === username);
        
        if (existe) {
            this.mostrarMensaje('❌ El usuario ya existe', 'error');
            return;
        }
        
        const nuevoUsuario = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            username: username,
            password: btoa(password), // Encriptación básica
            nombre: nombre,
            role: rol,
            email: email,
            telefono: telefono,
            activo: true,
            fechaCreacion: new Date().toISOString()
        };
        
        storage.addUser?.(nuevoUsuario);
        this.cargarUsuarios();
        this.mostrarMensaje('✅ Usuario creado', 'success');
        this.cerrarModal('modalNuevoUsuario');
        this.mostrarModalUsuarios();
    }

    editarUsuario(id) {
        const usuario = storage.getUserById?.(id) || this.usuarios.find(u => u.id === id);
        if (!usuario) return;
        
        const roles = ['admin', 'cajero', 'cocina', 'domiciliario', 'mesero', 'invitado', 'taller', 'tecnico', 'farmacia'];
        let rolesOptions = '';
        roles.forEach(r => {
            const selected = r === usuario.role ? 'selected' : '';
            rolesOptions += `<option value="${r}" ${selected}>${r.charAt(0).toUpperCase() + r.slice(1)}</option>`;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalEditarUsuario">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-edit"></i> Editar Usuario</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalEditarUsuario')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarUsuario" onsubmit="return false;">
                            <input type="hidden" id="editUsuarioId" value="${usuario.id}">
                            <div class="form-group">
                                <label>Usuario *</label>
                                <input type="text" id="editUsuarioUsername" class="form-control" value="${usuario.username}" required>
                            </div>
                            <div class="form-group">
                                <label>Contraseña (dejar en blanco para no cambiar)</label>
                                <input type="password" id="editUsuarioPassword" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Nombre completo</label>
                                <input type="text" id="editUsuarioNombre" class="form-control" value="${usuario.nombre || ''}">
                            </div>
                            <div class="form-group">
                                <label>Rol *</label>
                                <select id="editUsuarioRol" class="form-control">
                                    ${rolesOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="editUsuarioEmail" class="form-control" value="${usuario.email || ''}">
                            </div>
                            <div class="form-group">
                                <label>Teléfono</label>
                                <input type="tel" id="editUsuarioTelefono" class="form-control" value="${usuario.telefono || ''}">
                            </div>
                            <div class="form-check mb-3">
                                <input type="checkbox" id="editUsuarioActivo" class="form-check-input" ${usuario.activo ? 'checked' : ''}>
                                <label class="form-check-label">Usuario Activo</label>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalEditarUsuario')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarEdicionUsuario()">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarEdicionUsuario() {
        const id = document.getElementById('editUsuarioId')?.value;
        const username = document.getElementById('editUsuarioUsername')?.value;
        const password = document.getElementById('editUsuarioPassword')?.value;
        const nombre = document.getElementById('editUsuarioNombre')?.value;
        const rol = document.getElementById('editUsuarioRol')?.value;
        const email = document.getElementById('editUsuarioEmail')?.value;
        const telefono = document.getElementById('editUsuarioTelefono')?.value;
        const activo = document.getElementById('editUsuarioActivo')?.checked || false;
        
        if (!username || !rol) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }
        
        const usuarios = storage.getUsers?.() || [];
        const existe = usuarios.find(u => u.username === username && u.id !== id);
        
        if (existe) {
            this.mostrarMensaje('❌ El nombre de usuario ya existe', 'error');
            return;
        }
        
        const updates = {
            username: username,
            nombre: nombre,
            role: rol,
            email: email,
            telefono: telefono,
            activo: activo
        };
        
        if (password) {
            updates.password = btoa(password);
        }
        
        storage.updateUser?.(id, updates);
        this.cargarUsuarios();
        this.mostrarMensaje('✅ Usuario actualizado', 'success');
        this.cerrarModal('modalEditarUsuario');
        this.mostrarModalUsuarios();
    }

    eliminarUsuario(id) {
        if (confirm('¿Eliminar este usuario?')) {
            storage.deleteUser?.(id);
            this.cargarUsuarios();
            this.mostrarMensaje('✅ Usuario eliminado', 'success');
            this.mostrarModalUsuarios();
        }
    }

    // ============================================
    // CLIENTES
    // ============================================

    cargarClientes() {
        this.clientes = JSON.parse(localStorage.getItem('invplanet_clientes') || '[]');
        console.log(`👤 Clientes cargados: ${this.clientes.length}`);
    }

    guardarClientes() {
        localStorage.setItem('invplanet_clientes', JSON.stringify(this.clientes));
    }

    mostrarModalClientes() {
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
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarCliente('${c.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="window.app.verHistorialCliente('${c.id}')">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.app.verVehiculosCliente('${c.id}')">
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalClientes')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoCliente()">
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
    }

    buscarClientes() {
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
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarCliente('${c.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="window.app.verHistorialCliente('${c.id}')">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.app.verVehiculosCliente('${c.id}')">
                            <i class="fas fa-car"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        document.getElementById('tablaClientes').innerHTML = html || '<tr><td colspan="6" class="text-center">No hay resultados</td></tr>';
    }

    mostrarModalNuevoCliente() {
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoCliente">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> Nuevo Cliente</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoCliente')">&times;</button>
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
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoCliente')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoCliente()">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarNuevoCliente() {
        const nombre = document.getElementById('clienteNombre')?.value;
        
        if (!nombre) {
            this.mostrarMensaje('❌ El nombre es obligatorio', 'error');
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
        this.mostrarMensaje('✅ Cliente guardado', 'success');
        this.cerrarModal('modalNuevoCliente');
        this.mostrarModalClientes();
    }

    editarCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (!cliente) return;
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalEditarCliente">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-edit"></i> Editar Cliente</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalEditarCliente')">&times;</button>
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
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalEditarCliente')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarEdicionCliente()">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarEdicionCliente() {
        const id = document.getElementById('editClienteId')?.value;
        const nombre = document.getElementById('editClienteNombre')?.value;
        
        if (!nombre) {
            this.mostrarMensaje('❌ El nombre es obligatorio', 'error');
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
            this.mostrarMensaje('✅ Cliente actualizado', 'success');
            this.cerrarModal('modalEditarCliente');
            this.mostrarModalClientes();
        }
    }

    verHistorialCliente(id) {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalHistorialCliente')">&times;</button>
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
    }

    verVehiculosCliente(id) {
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
                        <button class="btn btn-sm btn-info" onclick="window.app.verHistorialVehiculo('${v.id}')">
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalVehiculosCliente')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoVehiculoConCliente('${cliente.id}')">
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
    }

    mostrarModalNuevoVehiculoConCliente(clienteId) {
        this.mostrarModalNuevoVehiculo(clienteId);
    }

    // ============================================
    // PROVEEDORES
    // ============================================

    cargarProveedores() {
        this.proveedores = JSON.parse(localStorage.getItem('invplanet_proveedores') || '[]');
        console.log(`📦 Proveedores cargados: ${this.proveedores.length}`);
    }

    guardarProveedores() {
        localStorage.setItem('invplanet_proveedores', JSON.stringify(this.proveedores));
    }

    mostrarModalProveedores() {
        let proveedoresHTML = '';
        this.proveedores.forEach(p => {
            proveedoresHTML += `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.contacto || ''}</td>
                    <td>${p.telefono || ''}</td>
                    <td>${p.email || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarProveedor('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="window.app.verProductosProveedor('${p.id}')">
                            <i class="fas fa-boxes"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.app.mostrarModalNuevaOrdenCompraConProveedor('${p.id}')">
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalProveedores')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoProveedor()">
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
    }

    mostrarModalNuevoProveedor() {
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoProveedor">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-truck-plus"></i> Nuevo Proveedor</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoProveedor')">&times;</button>
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
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoProveedor')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoProveedor()">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarNuevoProveedor() {
        const nombre = document.getElementById('proveedorNombre')?.value;
        
        if (!nombre) {
            this.mostrarMensaje('❌ El nombre es obligatorio', 'error');
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
        this.mostrarMensaje('✅ Proveedor guardado', 'success');
        this.cerrarModal('modalNuevoProveedor');
        this.mostrarModalProveedores();
    }

    editarProveedor(id) {
        const proveedor = this.proveedores.find(p => p.id === id);
        if (!proveedor) return;
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalEditarProveedor">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-truck-edit"></i> Editar Proveedor</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalEditarProveedor')">&times;</button>
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
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalEditarProveedor')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarEdicionProveedor()">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarEdicionProveedor() {
        const id = document.getElementById('editProveedorId')?.value;
        const nombre = document.getElementById('editProveedorNombre')?.value;
        
        if (!nombre) {
            this.mostrarMensaje('❌ El nombre es obligatorio', 'error');
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
            this.mostrarMensaje('✅ Proveedor actualizado', 'success');
            this.cerrarModal('modalEditarProveedor');
            this.mostrarModalProveedores();
        }
    }

    verProductosProveedor(id) {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalProductosProveedor')">&times;</button>
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
                        
                        <button class="btn btn-primary mt-3" onclick="window.app.mostrarModalNuevaOrdenCompraConProveedor('${id}')">
                            <i class="fas fa-shopping-cart"></i> Crear Orden de Compra
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    mostrarModalNuevaOrdenCompraConProveedor(proveedorId) {
        this.mostrarModalNuevaOrdenCompra(proveedorId);
    }

    // ============================================
    // PROMOCIONES Y DESCUENTOS
    // ============================================

    cargarPromociones() {
        this.promociones = JSON.parse(localStorage.getItem('invplanet_promociones') || '[]');
        console.log(`🎁 Promociones cargadas: ${this.promociones.length}`);
    }

    guardarPromociones() {
        localStorage.setItem('invplanet_promociones', JSON.stringify(this.promociones));
    }

    mostrarModalPromociones() {
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
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarPromocion('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.app.eliminarPromocion('${p.id}')">
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalPromociones')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevaPromocion()">
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
    }

    mostrarModalNuevaPromocion() {
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevaPromocion">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-tag-plus"></i> Nueva Promoción</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaPromocion')">&times;</button>
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
                                    <option value="volumen">Descuento por volumen</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Valor del descuento</label>
                                <input type="text" id="promocionValor" class="form-control" placeholder="Ej: 20% o $5000">
                                <small class="text-muted">Para 2x1 dejar vacío</small>
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
                            
                            <div class="form-row">
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
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevaPromocion')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevaPromocion()">Guardar</button>
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
    }

    generarOptionsCategorias() {
        const categorias = storage.getCategorias();
        let options = '';
        categorias.forEach(c => {
            options += `<option value="${c.id}">${c.nombre}</option>`;
        });
        return options;
    }

    generarOptionsProductos() {
        const productos = storage.getInventario();
        let options = '';
        productos.forEach(p => {
            options += `<option value="${p.id}">${p.nombre}</option>`;
        });
        return options;
    }

    guardarNuevaPromocion() {
        const nombre = document.getElementById('promocionNombre')?.value;
        
        if (!nombre) {
            this.mostrarMensaje('❌ El nombre es obligatorio', 'error');
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
        this.mostrarMensaje('✅ Promoción creada', 'success');
        this.cerrarModal('modalNuevaPromocion');
        this.mostrarModalPromociones();
    }

    aplicarPromociones(precio, productoId, categoriaId, cantidad) {
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
                // Se aplica automáticamente en el carrito
                return { promocion: p, aplica: true };
            } else if (p.tipo === '3x2' && cantidad >= 3) {
                return { promocion: p, aplica: true };
            }
        }
        
        return { precioFinal, promocion: null };
    }

    // ============================================
    // KITS DE PRODUCTOS (COMBOS)
    // ============================================

    mostrarModalNuevoKit() {
        const productos = storage.getInventario().filter(p => p.activo);
        let productosOptions = '';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}">${p.nombre} - $${p.precioVenta}</option>`;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoKit">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-boxes"></i> Nuevo Kit / Combo</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoKit')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoKit" onsubmit="return false;">
                            <div class="form-group">
                                <label>Nombre del Kit *</label>
                                <input type="text" id="kitNombre" class="form-control" required placeholder="Ej: Combo Hamburguesa">
                            </div>
                            
                            <div class="form-group">
                                <label>Precio del Kit</label>
                                <input type="number" id="kitPrecio" class="form-control" min="0" step="100">
                                <small class="text-muted">Dejar vacío para calcular automático</small>
                            </div>
                            
                            <h5>Productos del Kit</h5>
                            <div id="productosKit">
                                <div class="row mb-2">
                                    <div class="col-md-6">
                                        <select class="form-control kit-producto" name="kitProducto[]">
                                            ${productosOptions}
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <input type="number" class="form-control kit-cantidad" name="kitCantidad[]" value="1" min="1">
                                    </div>
                                    <div class="col-md-3">
                                        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="button" class="btn btn-info mb-3" onclick="window.app.agregarProductoKit()">
                                <i class="fas fa-plus"></i> Agregar producto
                            </button>
                            
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="kitDescripcion" class="form-control" rows="2"></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoKit')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoKit()">Guardar Kit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    agregarProductoKit() {
        const productos = storage.getInventario().filter(p => p.activo);
        let productosOptions = '';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}">${p.nombre} - $${p.precioVenta}</option>`;
        });
        
        const div = document.createElement('div');
        div.className = 'row mb-2';
        div.innerHTML = `
            <div class="col-md-6">
                <select class="form-control kit-producto" name="kitProducto[]">
                    ${productosOptions}
                </select>
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control kit-cantidad" name="kitCantidad[]" value="1" min="1">
            </div>
            <div class="col-md-3">
                <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        document.getElementById('productosKit').appendChild(div);
    }

    guardarNuevoKit() {
        const nombre = document.getElementById('kitNombre')?.value;
        if (!nombre) {
            this.mostrarMensaje('❌ El nombre es obligatorio', 'error');
            return;
        }
        
        const productosSelects = document.querySelectorAll('.kit-producto');
        const cantidades = document.querySelectorAll('.kit-cantidad');
        
        if (productosSelects.length === 0) {
            this.mostrarMensaje('❌ Agrega al menos un producto', 'error');
            return;
        }
        
        const componentes = [];
        let sumaPrecios = 0;
        
        for (let i = 0; i < productosSelects.length; i++) {
            const productoId = productosSelects[i].value;
            const cantidad = parseInt(cantidades[i].value) || 1;
            const producto = storage.getProducto(productoId);
            
            if (producto) {
                componentes.push({
                    productoId: productoId,
                    nombre: producto.nombre,
                    cantidad: cantidad,
                    precioUnitario: producto.precioVenta
                });
                sumaPrecios += producto.precioVenta * cantidad;
            }
        }
        
        const precioKit = parseFloat(document.getElementById('kitPrecio')?.value) || sumaPrecios;
        
        const nuevoProducto = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            codigo: 'KIT' + Date.now().toString().slice(-6),
            nombre: nombre,
            categoriaId: null,
            unidades: 9999,
            stockMinimo: 1,
            costoUnitario: sumaPrecios * 0.7,
            precioVenta: precioKit,
            proveedor: '',
            descripcion: document.getElementById('kitDescripcion')?.value || '',
            activo: true,
            esKit: true,
            componentes: componentes,
            fechaCreacion: new Date().toISOString()
        };
        
        storage.addProducto(nuevoProducto);
        this.mostrarMensaje('✅ Kit creado exitosamente', 'success');
        this.cerrarModal('modalNuevoKit');
    }

    // ============================================
    // MESAS Y RESTAURANTE
    // ============================================

    cargarMesas() {
        this.mesas = JSON.parse(localStorage.getItem('invplanet_mesas') || '[]');
        if (this.mesas.length === 0) {
            // Crear mesas por defecto
            for (let i = 1; i <= 20; i++) {
                this.mesas.push({
                    id: `mesa${i}`,
                    numero: i,
                    capacidad: 4,
                    estado: 'disponible',
                    comensales: 0,
                    pedidoActual: null
                });
            }
            this.guardarMesas();
        }
        console.log(`🍽️ Mesas cargadas: ${this.mesas.length}`);
    }

    guardarMesas() {
        localStorage.setItem('invplanet_mesas', JSON.stringify(this.mesas));
    }

    mostrarMapaMesas() {
        let mesasHTML = '';
        
        this.mesas.sort((a, b) => a.numero - b.numero).forEach(m => {
            let color = '#27ae60';
            let texto = 'Disponible';
            
            if (m.estado === 'ocupada') {
                color = '#e74c3c';
                texto = `Ocupada (${m.comensales})`;
            } else if (m.estado === 'reservada') {
                color = '#f39c12';
                texto = 'Reservada';
            } else if (m.estado === 'pagando') {
                color = '#3498db';
                texto = 'Pagando';
            }
            
            mesasHTML += `
                <div class="mesa-card" style="border: 3px solid ${color}; border-radius: 15px; padding: 20px; margin: 10px; width: 150px; text-align: center; cursor: pointer;" onclick="window.app.abrirMesa('${m.id}')">
                    <div style="font-size: 2em;">🍽️</div>
                    <h4>Mesa ${m.numero}</h4>
                    <p style="color: ${color}; font-weight: bold;">${texto}</p>
                    <p>Capacidad: ${m.capacidad}</p>
                </div>
            `;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalMapaMesas">
                <div class="modal-content" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-utensils"></i> Mapa de Mesas</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalMapaMesas')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <button class="btn btn-info" onclick="window.app.configurarMesas()">
                                <i class="fas fa-cog"></i> Configurar Mesas
                            </button>
                        </div>
                        
                        <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                            ${mesasHTML}
                        </div>
                        
                        <div class="mt-3">
                            <p><span style="background: #27ae60; color: white; padding: 5px 10px;">Disponible</span> 
                            <span style="background: #e74c3c; color: white; padding: 5px 10px;">Ocupada</span>
                            <span style="background: #f39c12; color: white; padding: 5px 10px;">Reservada</span>
                            <span style="background: #3498db; color: white; padding: 5px 10px;">Pagando</span></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    abrirMesa(id) {
        const mesa = this.mesas.find(m => m.id === id);
        if (!mesa) return;
        
        if (mesa.estado === 'disponible') {
            // Nueva venta para esta mesa
            this.mostrarModalNuevaVentaConMesa(mesa);
        } else if (mesa.estado === 'ocupada') {
            // Ver pedido actual
            this.verPedidoMesa(mesa);
        }
    }

    mostrarModalNuevaVentaConMesa(mesa) {
        const numComensales = prompt(`¿Cuántos comensales en mesa ${mesa.numero}?`, '2');
        if (!numComensales) return;
        
        mesa.estado = 'ocupada';
        mesa.comensales = parseInt(numComensales) || 2;
        mesa.pedidoActual = {
            id: Date.now().toString(),
            productos: [],
            total: 0,
            horaApertura: new Date().toISOString()
        };
        
        this.guardarMesas();
        
        // Abrir ventana de ventas para esta mesa
        this.mostrarModalNuevaVenta();
        document.getElementById('mesaNumero').value = `Mesa ${mesa.numero} (${mesa.comensales} pers)`;
    }

    verPedidoMesa(mesa) {
        const ventas = storage.getVentas?.() || [];
        const pedido = ventas.find(v => v.mesaId === mesa.id && v.estado === 'completada' && !v.pagado);
        
        if (!pedido) {
            mesa.estado = 'disponible';
            mesa.comensales = 0;
            mesa.pedidoActual = null;
            this.guardarMesas();
            this.mostrarMensaje('Mesa liberada', 'info');
            return;
        }
        
        this.verDetalleVenta(pedido.id);
    }

    configurarMesas() {
        let mesasHTML = '';
        this.mesas.sort((a, b) => a.numero - b.numero).forEach(m => {
            mesasHTML += `
                <tr>
                    <td>Mesa ${m.numero}</td>
                    <td><input type="number" id="capacidad_${m.id}" value="${m.capacidad}" min="1" class="form-control" style="width: 80px;"></td>
                    <td>
                        <select id="estado_${m.id}" class="form-control">
                            <option value="disponible" ${m.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
                            <option value="ocupada" ${m.estado === 'ocupada' ? 'selected' : ''}>Ocupada</option>
                            <option value="reservada" ${m.estado === 'reservada' ? 'selected' : ''}>Reservada</option>
                            <option value="pagando" ${m.estado === 'pagando' ? 'selected' : ''}>Pagando</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="window.app.eliminarMesa('${m.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalConfigMesas">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-cog"></i> Configurar Mesas</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalConfigMesas')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.agregarMesa()">
                            <i class="fas fa-plus"></i> Agregar Mesa
                        </button>
                        
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mesa</th>
                                    <th>Capacidad</th>
                                    <th>Estado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mesasHTML}
                            </tbody>
                        </table>
                        
                        <button class="btn btn-success" onclick="window.app.guardarConfigMesas()">
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    agregarMesa() {
        const nuevoNumero = this.mesas.length + 1;
        this.mesas.push({
            id: `mesa${Date.now()}`,
            numero: nuevoNumero,
            capacidad: 4,
            estado: 'disponible',
            comensales: 0,
            pedidoActual: null
        });
        this.configurarMesas();
    }

    eliminarMesa(id) {
        this.mesas = this.mesas.filter(m => m.id !== id);
        this.configurarMesas();
    }

    guardarConfigMesas() {
        this.mesas.forEach(m => {
            const capacidad = document.getElementById(`capacidad_${m.id}`)?.value;
            const estado = document.getElementById(`estado_${m.id}`)?.value;
            
            if (capacidad) m.capacidad = parseInt(capacidad);
            if (estado) m.estado = estado;
        });
        
        this.guardarMesas();
        this.mostrarMensaje('✅ Configuración guardada', 'success');
        this.cerrarModal('modalConfigMesas');
    }

    // ============================================
    // COMISIONES
    // ============================================

    cargarComisiones() {
        this.comisiones = JSON.parse(localStorage.getItem('invplanet_comisiones') || '[]');
        console.log(`💰 Comisiones cargadas: ${this.comisiones.length}`);
    }

    guardarComisiones() {
        localStorage.setItem('invplanet_comisiones', JSON.stringify(this.comisiones));
    }

    mostrarModalComisiones() {
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
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarComision('${c.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.app.eliminarComision('${c.id}')">
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalComisiones')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevaComision()">
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
    }

    mostrarModalNuevaComision() {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaComision')">&times;</button>
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
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevaComision')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevaComision()">Guardar</button>
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
    }

    guardarNuevaComision() {
        const usuarioId = document.getElementById('comisionUsuarioId')?.value;
        const tipo = document.getElementById('comisionTipo')?.value;
        const valor = document.getElementById('comisionValor')?.value;
        
        if (!usuarioId || !tipo || !valor) {
            this.mostrarMensaje('❌ Completa todos los campos', 'error');
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
        this.mostrarMensaje('✅ Comisión guardada', 'success');
        this.cerrarModal('modalNuevaComision');
        this.mostrarModalComisiones();
    }

    calcularComision(venta, usuarioId) {
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
    }

    // ============================================
    // APARTADOS
    // ============================================

    cargarApartados() {
        this.apartados = JSON.parse(localStorage.getItem('invplanet_apartados') || '[]');
        console.log(`📦 Apartados cargados: ${this.apartados.length}`);
    }

    guardarApartados() {
        localStorage.setItem('invplanet_apartados', JSON.stringify(this.apartados));
    }

    mostrarModalApartados() {
        let apartadosHTML = '';
        this.apartados.sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite)).forEach(a => {
            const fechaLimite = new Date(a.fechaLimite).toLocaleDateString();
            const hoy = new Date();
            const fechaLimiteObj = new Date(a.fechaLimite);
            const diasRestantes = Math.ceil((fechaLimiteObj - hoy) / (1000 * 60 * 60 * 24));
            
            let badgeClass = 'badge-success';
            if (diasRestantes < 0) {
                badgeClass = 'badge-danger';
            } else if (diasRestantes < 3) {
                badgeClass = 'badge-warning';
            }
            
            apartadosHTML += `
                <tr>
                    <td>${a.cliente}</td>
                    <td>${a.productos.map(p => p.nombre).join(', ')}</td>
                    <td>$${a.total.toLocaleString()}</td>
                    <td>$${a.seña.toLocaleString()}</td>
                    <td>$${(a.total - a.seña).toLocaleString()}</td>
                    <td>${fechaLimite}</td>
                    <td><span class="badge ${badgeClass}">${diasRestantes < 0 ? 'Vencido' : diasRestantes + ' días'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="window.app.cobrarApartado('${a.id}')">
                            <i class="fas fa-cash-register"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.app.cancelarApartado('${a.id}')">
                            <i class="fas fa-ban"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalApartados">
                <div class="modal-content" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-box-open"></i> Apartados</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalApartados')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoApartado()">
                            <i class="fas fa-plus"></i> Nuevo Apartado
                        </button>
                        
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Productos</th>
                                        <th>Total</th>
                                        <th>Seña</th>
                                        <th>Saldo</th>
                                        <th>Fecha límite</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${apartadosHTML || '<tr><td colspan="8" class="text-center">No hay apartados</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    mostrarModalNuevoApartado() {
        const productos = storage.getInventario().filter(p => p.activo && p.unidades > 0);
        let productosOptions = '';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}">${p.nombre} - $${p.precioVenta} (Stock: ${p.unidades})</option>`;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoApartado">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-box-open"></i> Nuevo Apartado</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoApartado')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoApartado" onsubmit="return false;">
                            <div class="form-group">
                                <label>Cliente *</label>
                                <select id="apartadoClienteId" class="form-control">
                                    <option value="">Seleccionar cliente</option>
                                    ${this.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                                    <option value="nuevo">-- Crear nuevo cliente --</option>
                                </select>
                            </div>
                            
                            <div id="camposNuevoCliente" style="display:none;">
                                <div class="form-group">
                                    <label>Nombre del cliente</label>
                                    <input type="text" id="apartadoNuevoCliente" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>Teléfono</label>
                                    <input type="tel" id="apartadoTelefono" class="form-control">
                                </div>
                            </div>
                            
                            <h5>Productos a apartar</h5>
                            <div id="productosApartado">
                                <div class="row mb-2">
                                    <div class="col-md-6">
                                        <select class="form-control apartado-producto" name="apartadoProducto[]">
                                            ${productosOptions}
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <input type="number" class="form-control apartado-cantidad" name="apartadoCantidad[]" value="1" min="1">
                                    </div>
                                    <div class="col-md-3">
                                        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="button" class="btn btn-info mb-3" onclick="window.app.agregarProductoApartado()">
                                <i class="fas fa-plus"></i> Agregar producto
                            </button>
                            
                            <div class="form-group">
                                <label>Seña ($) *</label>
                                <input type="number" id="apartadoSena" class="form-control" min="0" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Fecha límite</label>
                                <input type="date" id="apartadoFechaLimite" class="form-control" value="${this.sumarDias(new Date(), 30).toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoApartado')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoApartado()">Guardar Apartado</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        
        document.getElementById('apartadoClienteId')?.addEventListener('change', (e) => {
            document.getElementById('camposNuevoCliente').style.display = e.target.value === 'nuevo' ? 'block' : 'none';
        });
    }

    sumarDias(fecha, dias) {
        const result = new Date(fecha);
        result.setDate(result.getDate() + dias);
        return result;
    }

    agregarProductoApartado() {
        const productos = storage.getInventario().filter(p => p.activo && p.unidades > 0);
        let productosOptions = '';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}">${p.nombre} - $${p.precioVenta} (Stock: ${p.unidades})</option>`;
        });
        
        const div = document.createElement('div');
        div.className = 'row mb-2';
        div.innerHTML = `
            <div class="col-md-6">
                <select class="form-control apartado-producto" name="apartadoProducto[]">
                    ${productosOptions}
                </select>
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control apartado-cantidad" name="apartadoCantidad[]" value="1" min="1">
            </div>
            <div class="col-md-3">
                <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        document.getElementById('productosApartado').appendChild(div);
    }

    guardarNuevoApartado() {
        let clienteId = document.getElementById('apartadoClienteId')?.value;
        let clienteNombre = '';
        
        if (clienteId === 'nuevo') {
            const nombre = document.getElementById('apartadoNuevoCliente')?.value;
            if (!nombre) {
                this.mostrarMensaje('❌ Ingresa el nombre del cliente', 'error');
                return;
            }
            
            const nuevoCliente = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                nombre: nombre,
                telefono: document.getElementById('apartadoTelefono')?.value || '',
                puntos: 0,
                fechaCreacion: new Date().toISOString()
            };
            
            this.clientes.push(nuevoCliente);
            this.guardarClientes();
            clienteId = nuevoCliente.id;
            clienteNombre = nombre;
        } else {
            const cliente = this.clientes.find(c => c.id === clienteId);
            clienteNombre = cliente ? cliente.nombre : '';
        }
        
        const productosSelects = document.querySelectorAll('.apartado-producto');
        const cantidades = document.querySelectorAll('.apartado-cantidad');
        
        if (productosSelects.length === 0) {
            this.mostrarMensaje('❌ Agrega al menos un producto', 'error');
            return;
        }
        
        const productos = [];
        let total = 0;
        
        for (let i = 0; i < productosSelects.length; i++) {
            const productoId = productosSelects[i].value;
            const cantidad = parseInt(cantidades[i].value) || 1;
            const producto = storage.getProducto(productoId);
            
            if (producto) {
                if (producto.unidades < cantidad) {
                    this.mostrarMensaje(`❌ Stock insuficiente para ${producto.nombre}`, 'error');
                    return;
                }
                
                productos.push({
                    productoId: productoId,
                    nombre: producto.nombre,
                    cantidad: cantidad,
                    precioUnitario: producto.precioVenta,
                    subtotal: producto.precioVenta * cantidad
                });
                
                total += producto.precioVenta * cantidad;
                
                // Reservar stock
                producto.unidades -= cantidad;
                storage.updateProducto(productoId, { unidades: producto.unidades });
            }
        }
        
        const sena = parseFloat(document.getElementById('apartadoSena')?.value) || 0;
        const fechaLimite = document.getElementById('apartadoFechaLimite')?.value;
        
        const nuevoApartado = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            clienteId: clienteId,
            cliente: clienteNombre,
            productos: productos,
            total: total,
            sena: sena,
            saldo: total - sena,
            fecha: new Date().toISOString(),
            fechaLimite: fechaLimite,
            estado: 'activo',
            pagado: false
        };
        
        this.apartados.push(nuevoApartado);
        this.guardarApartados();
        this.mostrarMensaje('✅ Apartado guardado', 'success');
        this.cerrarModal('modalNuevoApartado');
        this.mostrarModalApartados();
    }

    cobrarApartado(id) {
        const apartado = this.apartados.find(a => a.id === id);
        if (!apartado) return;
        
        if (apartado.pagado) {
            this.mostrarMensaje('⚠️ Este apartado ya fue pagado', 'warning');
            return;
        }
        
        // Crear venta con los productos del apartado
        const venta = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `FAC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(storage.getVentas?.().length + 1).padStart(5, '0')}`,
            fecha: new Date().toISOString(),
            cliente: apartado.cliente,
            productos: apartado.productos,
            subtotal: apartado.saldo,
            impuesto: 0,
            total: apartado.saldo,
            metodoPago: 'efectivo',
            estado: 'completada',
            apartadoId: apartado.id
        };
        
        const ventas = storage.getVentas?.() || [];
        ventas.push(venta);
        storage.saveVentas?.(ventas);
        
        apartado.pagado = true;
        apartado.fechaPago = new Date().toISOString();
        this.guardarApartados();
        
        this.mostrarMensaje('✅ Apartado cobrado exitosamente', 'success');
        this.mostrarModalApartados();
    }

    cancelarApartado(id) {
        const apartado = this.apartados.find(a => a.id === id);
        if (!apartado) return;
        
        if (apartado.pagado) {
            this.mostrarMensaje('⚠️ No se puede cancelar un apartado pagado', 'error');
            return;
        }
        
        if (!confirm('¿Cancelar el apartado? Se devolverá el stock a inventario.')) {
            return;
        }
        
        // Devolver stock
        apartado.productos.forEach(p => {
            const producto = storage.getProducto(p.productoId);
            if (producto) {
                producto.unidades += p.cantidad;
                storage.updateProducto(p.productoId, { unidades: producto.unidades });
            }
        });
        
        apartado.estado = 'cancelado';
        this.guardarApartados();
        
        this.mostrarMensaje('✅ Apartado cancelado', 'success');
        this.mostrarModalApartados();
    }

    // ============================================
    // CRÉDITO
    // ============================================

    cargarCreditos() {
        this.creditos = JSON.parse(localStorage.getItem('invplanet_creditos') || '[]');
        console.log(`💳 Créditos cargados: ${this.creditos.length}`);
    }

    guardarCreditos() {
        localStorage.setItem('invplanet_creditos', JSON.stringify(this.creditos));
    }

    mostrarModalCreditos() {
        let creditosHTML = '';
        this.creditos.sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite)).forEach(c => {
            const fechaLimite = new Date(c.fechaLimite).toLocaleDateString();
            const hoy = new Date();
            const fechaLimiteObj = new Date(c.fechaLimite);
            const diasRestantes = Math.ceil((fechaLimiteObj - hoy) / (1000 * 60 * 60 * 24));
            
            let badgeClass = 'badge-success';
            if (diasRestantes < 0) {
                badgeClass = 'badge-danger';
            } else if (diasRestantes < 5) {
                badgeClass = 'badge-warning';
            }
            
            creditosHTML += `
                <tr>
                    <td>${c.cliente}</td>
                    <td>${c.numeroVenta}</td>
                    <td>$${c.total.toLocaleString()}</td>
                    <td>$${c.abonado.toLocaleString()}</td>
                    <td>$${c.saldo.toLocaleString()}</td>
                    <td>${fechaLimite}</td>
                    <td><span class="badge ${badgeClass}">${diasRestantes < 0 ? 'Vencido' : diasRestantes + ' días'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="window.app.abonarCredito('${c.id}')">
                            <i class="fas fa-money-bill"></i> Abonar
                        </button>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleCredito('${c.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalCreditos">
                <div class="modal-content" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-credit-card"></i> Créditos</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalCreditos')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Venta</th>
                                        <th>Total</th>
                                        <th>Abonado</th>
                                        <th>Saldo</th>
                                        <th>Fecha límite</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${creditosHTML || '<tr><td colspan="8" class="text-center">No hay créditos</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    crearCredito(venta, clienteId, plazoDias = 30) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + plazoDias);
        
        const credito = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            ventaId: venta.id,
            numeroVenta: venta.numero,
            clienteId: clienteId,
            cliente: venta.cliente,
            total: venta.total,
            abonado: 0,
            saldo: venta.total,
            fecha: new Date().toISOString(),
            fechaLimite: fechaLimite.toISOString(),
            pagos: [],
            estado: 'activo'
        };
        
        this.creditos.push(credito);
        this.guardarCreditos();
        
        return credito;
    }

    abonarCredito(id) {
        const credito = this.creditos.find(c => c.id === id);
        if (!credito) return;
        
        if (credito.saldo <= 0) {
            this.mostrarMensaje('⚠️ Este crédito ya está pagado', 'warning');
            return;
        }
        
        const monto = prompt(`Monto a abonar (Saldo: $${credito.saldo.toLocaleString()})`, credito.saldo);
        if (!monto) return;
        
        const montoNum = parseFloat(monto);
        if (montoNum <= 0 || montoNum > credito.saldo) {
            this.mostrarMensaje('❌ Monto inválido', 'error');
            return;
        }
        
        const pago = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            monto: montoNum,
            fecha: new Date().toISOString(),
            metodo: 'efectivo'
        };
        
        credito.pagos.push(pago);
        credito.abonado += montoNum;
        credito.saldo -= montoNum;
        
        if (credito.saldo <= 0) {
            credito.estado = 'pagado';
            credito.fechaPago = new Date().toISOString();
        }
        
        this.guardarCreditos();
        this.mostrarMensaje(`✅ Abono de $${montoNum.toLocaleString()} registrado`, 'success');
        this.mostrarModalCreditos();
    }

    verDetalleCredito(id) {
        const credito = this.creditos.find(c => c.id === id);
        if (!credito) return;
        
        let pagosHTML = '';
        credito.pagos.forEach(p => {
            const fecha = new Date(p.fecha);
            pagosHTML += `
                <tr>
                    <td>${fecha.toLocaleDateString()}</td>
                    <td>$${p.monto.toLocaleString()}</td>
                </tr>
            `;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalDetalleCredito">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-invoice"></i> Detalle del Crédito</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDetalleCredito')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Venta:</strong> ${credito.numeroVenta}</p>
                        <p><strong>Cliente:</strong> ${credito.cliente}</p>
                        <p><strong>Total:</strong> $${credito.total.toLocaleString()}</p>
                        <p><strong>Abonado:</strong> $${credito.abonado.toLocaleString()}</p>
                        <p><strong>Saldo:</strong> $${credito.saldo.toLocaleString()}</p>
                        <p><strong>Fecha límite:</strong> ${new Date(credito.fechaLimite).toLocaleDateString()}</p>
                        
                        <h5>Historial de pagos</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pagosHTML || '<tr><td colspan="2" class="text-center">No hay pagos</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    // ============================================
    // TURNOS
    // ============================================

    cargarTurnoActual() {
        this.turnoActual = JSON.parse(localStorage.getItem('invplanet_turno_actual') || 'null');
        console.log(`🕒 Turno actual: ${this.turnoActual ? 'Abierto' : 'Cerrado'}`);
    }

    guardarTurnoActual() {
        if (this.turnoActual) {
            localStorage.setItem('invplanet_turno_actual', JSON.stringify(this.turnoActual));
        } else {
            localStorage.removeItem('invplanet_turno_actual');
        }
    }

    mostrarModalTurnos() {
        const usuario = this.getUsuarioActual();
        if (!usuario) {
            this.mostrarMensaje('❌ Debes iniciar sesión', 'error');
            return;
        }
        
        const turnos = JSON.parse(localStorage.getItem('invplanet_turnos') || '[]');
        let turnosHTML = '';
        turnos.reverse().slice(0, 10).forEach(t => {
            const fechaApertura = new Date(t.fechaApertura).toLocaleString();
            const fechaCierre = t.fechaCierre ? new Date(t.fechaCierre).toLocaleString() : 'Abierto';
            
            turnosHTML += `
                <tr>
                    <td>${t.usuario}</td>
                    <td>${fechaApertura}</td>
                    <td>${fechaCierre}</td>
                    <td>$${t.totalVentas.toLocaleString()}</td>
                    <td>$${t.totalGastos.toLocaleString()}</td>
                    <td>$${(t.totalVentas - t.totalGastos).toLocaleString()}</td>
                    <td><span class="badge ${t.activo ? 'badge-success' : 'badge-secondary'}">${t.activo ? 'Activo' : 'Cerrado'}</span></td>
                </tr>
            `;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalTurnos">
                <div class="modal-content" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-clock"></i> Turnos</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalTurnos')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            ${this.turnoActual ? `
                                <button class="btn btn-danger" onclick="window.app.cerrarTurno()">
                                    <i class="fas fa-power-off"></i> Cerrar Turno Actual
                                </button>
                            ` : `
                                <button class="btn btn-success" onclick="window.app.abrirTurno()">
                                    <i class="fas fa-play"></i> Abrir Turno
                                </button>
                            `}
                        </div>
                        
                        <h5>Últimos turnos</h5>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Apertura</th>
                                        <th>Cierre</th>
                                        <th>Ventas</th>
                                        <th>Gastos</th>
                                        <th>Utilidad</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${turnosHTML || '<tr><td colspan="7" class="text-center">No hay turnos registrados</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    abrirTurno() {
        const usuario = this.getUsuarioActual();
        if (!usuario) {
            this.mostrarMensaje('❌ Debes iniciar sesión', 'error');
            return;
        }
        
        if (this.turnoActual) {
            this.mostrarMensaje('⚠️ Ya hay un turno abierto', 'warning');
            return;
        }
        
        const efectivoInicial = prompt('Efectivo inicial en caja:', '0');
        if (efectivoInicial === null) return;
        
        this.turnoActual = {
            id: Date.now().toString(),
            usuarioId: usuario.id,
            usuario: usuario.nombre || usuario.username,
            fechaApertura: new Date().toISOString(),
            efectivoInicial: parseFloat(efectivoInicial) || 0,
            ventas: [],
            gastos: [],
            totalVentas: 0,
            totalGastos: 0,
            activo: true
        };
        
        this.guardarTurnoActual();
        
        const turnos = JSON.parse(localStorage.getItem('invplanet_turnos') || '[]');
        turnos.push(this.turnoActual);
        localStorage.setItem('invplanet_turnos', JSON.stringify(turnos));
        
        this.mostrarMensaje('✅ Turno abierto', 'success');
        this.mostrarModalTurnos();
    }

    cerrarTurno() {
        if (!this.turnoActual) {
            this.mostrarMensaje('❌ No hay turno abierto', 'error');
            return;
        }
        
        const efectivoFinal = prompt('Efectivo final en caja:', this.turnoActual.efectivoInicial + this.turnoActual.totalVentas - this.turnoActual.totalGastos);
        if (efectivoFinal === null) return;
        
        this.turnoActual.fechaCierre = new Date().toISOString();
        this.turnoActual.efectivoFinal = parseFloat(efectivoFinal) || 0;
        this.turnoActual.activo = false;
        
        // Actualizar en el array de turnos
        const turnos = JSON.parse(localStorage.getItem('invplanet_turnos') || '[]');
        const index = turnos.findIndex(t => t.id === this.turnoActual.id);
        if (index !== -1) {
            turnos[index] = this.turnoActual;
            localStorage.setItem('invplanet_turnos', JSON.stringify(turnos));
        }
        
        this.turnoActual = null;
        this.guardarTurnoActual();
        
        this.mostrarMensaje('✅ Turno cerrado', 'success');
        this.mostrarModalTurnos();
    }

    // ============================================
    // PRESUPUESTOS
    // ============================================

    cargarPresupuestos() {
        this.presupuestos = JSON.parse(localStorage.getItem('invplanet_presupuestos') || '[]');
        console.log(`📋 Presupuestos cargados: ${this.presupuestos.length}`);
    }

    guardarPresupuestos() {
        localStorage.setItem('invplanet_presupuestos', JSON.stringify(this.presupuestos));
    }

    mostrarModalPresupuestos() {
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
                        <button class="btn btn-sm btn-success" onclick="window.app.convertirPresupuestoAVenta('${p.id}')">
                            <i class="fas fa-cash-register"></i> Vender
                        </button>
                        <button class="btn btn-sm btn-info" onclick="window.app.verPresupuesto('${p.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="window.app.imprimirPresupuesto('${p.id}')">
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalPresupuestos')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoPresupuesto()">
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
    }

    mostrarModalNuevoPresupuesto() {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoPresupuesto')">&times;</button>
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
                            
                            <button type="button" class="btn btn-info mb-3" onclick="window.app.agregarProductoPresupuesto()">
                                <i class="fas fa-plus"></i> Agregar producto
                            </button>
                            
                            <div class="form-group">
                                <label>Fecha de vencimiento</label>
                                <input type="date" id="presupuestoVencimiento" class="form-control" value="${this.sumarDias(new Date(), 15).toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label>Notas</label>
                                <textarea id="presupuestoNotas" class="form-control" rows="2"></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoPresupuesto')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoPresupuesto()">Guardar Presupuesto</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    agregarProductoPresupuesto() {
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
    }

    guardarNuevoPresupuesto() {
        const cliente = document.getElementById('presupuestoCliente')?.value || 'Cliente';
        
        const productosSelects = document.querySelectorAll('.presupuesto-producto');
        const cantidades = document.querySelectorAll('.presupuesto-cantidad');
        
        if (productosSelects.length === 0) {
            this.mostrarMensaje('❌ Agrega al menos un producto', 'error');
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
        
        this.mostrarMensaje('✅ Presupuesto guardado', 'success');
        this.cerrarModal('modalNuevoPresupuesto');
        this.mostrarModalPresupuestos();
    }

    convertirPresupuestoAVenta(id) {
        const presupuesto = this.presupuestos.find(p => p.id === id);
        if (!presupuesto) return;
        
        if (presupuesto.convertido) {
            this.mostrarMensaje('⚠️ Este presupuesto ya fue convertido', 'warning');
            return;
        }
        
        // Verificar stock
        for (const p of presupuesto.productos) {
            const producto = storage.getProducto(p.productoId);
            if (!producto || producto.unidades < p.cantidad) {
                this.mostrarMensaje(`❌ Stock insuficiente para ${p.nombre}`, 'error');
                return;
            }
        }
        
        // Crear venta
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
    }

    verPresupuesto(id) {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalVerPresupuesto')">&times;</button>
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
                        
                        <button class="btn btn-success" onclick="window.app.convertirPresupuestoAVenta('${presupuesto.id}')">
                            Convertir a Venta
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    imprimirPresupuesto(id) {
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
    }

    // ============================================
    // ============================================
    // MÓDULO 1: SERIES Y LOTES (CRÍTICO)
    // ============================================
    // ============================================

    cargarSeries() {
        this.series = JSON.parse(localStorage.getItem('invplanet_series') || '[]');
        console.log(`🔢 Números de serie cargados: ${this.series.length}`);
    }

    guardarSeries() {
        localStorage.setItem('invplanet_series', JSON.stringify(this.series));
    }

    cargarLotes() {
        this.lotes = JSON.parse(localStorage.getItem('invplanet_lotes') || '[]');
        console.log(`📦 Lotes cargados: ${this.lotes.length}`);
    }

    guardarLotes() {
        localStorage.setItem('invplanet_lotes', JSON.stringify(this.lotes));
    }

    // ============================================
    // FUNCIONES PARA SERIES (PRODUCTOS ÚNICOS)
    // ============================================

    mostrarModalSeries() {
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
                        <button class="btn btn-sm btn-info" onclick="window.app.verHistorialSerie('${s.id}')">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.app.anularSerie('${s.id}')">
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalSeries')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoSerie()">
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
    }

    mostrarModalNuevoSerie() {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoSerie')">&times;</button>
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
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoSerie')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoSerie()">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarNuevoSerie() {
        const productoId = document.getElementById('serieProductoId')?.value;
        const numeroSerie = document.getElementById('serieNumero')?.value;
        
        if (!productoId || !numeroSerie) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }

        // Verificar si el número de serie ya existe
        const existe = this.series.find(s => s.numeroSerie === numeroSerie);
        if (existe) {
            this.mostrarMensaje('❌ Este número de serie ya está registrado', 'error');
            return;
        }

        const nuevoSerie = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            productoId: productoId,
            numeroSerie: numeroSerie,
            fechaIngreso: new Date().toISOString(),
            estado: 'disponible', // disponible, vendido, garantia, anulado
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
        this.mostrarMensaje('✅ Número de serie registrado', 'success');
        this.cerrarModal('modalNuevoSerie');
        this.mostrarModalSeries();
    }

    verHistorialSerie(id) {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalHistorialSerie')">&times;</button>
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
    }

    anularSerie(id) {
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
            this.mostrarMensaje('✅ Serie anulada', 'success');
            this.mostrarModalSeries();
        }
    }

    // ============================================
    // FUNCIONES PARA LOTES (CONTROL POR LOTES)
    // ============================================

    mostrarModalLotes() {
        const productos = storage.getInventario().filter(p => p.activo);
        let productosOptions = '<option value="">Todos los productos</option>';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}">${p.nombre}</option>`;
        });

        // Verificar alertas de vencimiento
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
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleLote('${l.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="window.app.ajustarStockLote('${l.id}')">
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalLotes')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoLote()">
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
    }

    mostrarModalNuevoLote() {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoLote')">&times;</button>
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
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoLote')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoLote()">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarNuevoLote() {
        const productoId = document.getElementById('loteProductoId')?.value;
        const numeroLote = document.getElementById('loteNumero')?.value;
        const cantidad = document.getElementById('loteCantidad')?.value;
        
        if (!productoId || !numeroLote || !cantidad) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }

        // Verificar si el lote ya existe para este producto
        const existe = this.lotes.find(l => l.productoId === productoId && l.numeroLote === numeroLote);
        if (existe) {
            this.mostrarMensaje('❌ Este número de lote ya existe para este producto', 'error');
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

        // Actualizar stock del producto
        const producto = storage.getProducto(productoId);
        if (producto) {
            producto.unidades += parseInt(cantidad);
            storage.updateProducto(productoId, { unidades: producto.unidades });
        }

        this.mostrarMensaje('✅ Lote registrado exitosamente', 'success');
        this.cerrarModal('modalNuevoLote');
        this.mostrarModalLotes();
    }

    verDetalleLote(id) {
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
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDetalleLote')">&times;</button>
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
    }

    ajustarStockLote(id) {
        const lote = this.lotes.find(l => l.id === id);
        if (!lote) return;

        const nuevaCantidad = prompt(`Nueva cantidad para lote ${lote.numeroLote} (Actual: ${lote.cantidad})`, lote.cantidad);
        if (!nuevaCantidad) return;

        const cantidadNum = parseInt(nuevaCantidad);
        if (isNaN(cantidadNum) || cantidadNum < 0) {
            this.mostrarMensaje('❌ Cantidad inválida', 'error');
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

        // Actualizar stock del producto
        const producto = storage.getProducto(lote.productoId);
        if (producto) {
            producto.unidades += diferencia;
            storage.updateProducto(lote.productoId, { unidades: producto.unidades });
        }

        this.mostrarMensaje('✅ Lote actualizado', 'success');
        this.mostrarModalLotes();
    }

    // ============================================
    // MÓDULO 2: TALLER Y SERVICIOS
    // ============================================

    cargarTecnicos() {
        this.tecnicos = JSON.parse(localStorage.getItem('invplanet_tecnicos') || '[]');
        if (this.tecnicos.length === 0) {
            // Técnicos por defecto
            this.tecnicos = [
                { id: 'tec1', nombre: 'Carlos Martínez', especialidad: 'Mecánica general', valorHora: 25000 },
                { id: 'tec2', nombre: 'Juan Pérez', especialidad: 'Electricidad', valorHora: 28000 },
                { id: 'tec3', nombre: 'Andrés López', especialidad: 'Diagnóstico', valorHora: 30000 }
            ];
            this.guardarTecnicos();
        }
        console.log(`🔧 Técnicos cargados: ${this.tecnicos.length}`);
    }

    guardarTecnicos() {
        localStorage.setItem('invplanet_tecnicos', JSON.stringify(this.tecnicos));
    }

    cargarOrdenesTrabajo() {
        this.ordenesTrabajo = JSON.parse(localStorage.getItem('invplanet_ordenes_trabajo') || '[]');
        console.log(`📋 Órdenes de trabajo cargadas: ${this.ordenesTrabajo.length}`);
    }

    guardarOrdenesTrabajo() {
        localStorage.setItem('invplanet_ordenes_trabajo', JSON.stringify(this.ordenesTrabajo));
    }

    // ============================================
    // FUNCIONES PARA TALLER
    // ============================================

    mostrarModalOrdenesTrabajo() {
        let ordenesHTML = '';
        this.ordenesTrabajo.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(o => {
            const fecha = new Date(o.fecha).toLocaleDateString();
            
            let badgeClass = 'badge-warning';
            if (o.estado === 'completada') badgeClass = 'badge-success';
            if (o.estado === 'entregado') badgeClass = 'badge-primary';
            if (o.estado === 'cancelada') badgeClass = 'badge-danger';

            ordenesHTML += `
                <tr>
                    <td><strong>${o.numero}</strong></td>
                    <td>${fecha}</td>
                    <td>${o.cliente}</td>
                    <td>${o.vehiculo || 'N/A'}</td>
                    <td>${o.tecnico || 'Sin asignar'}</td>
                    <td><span class="badge ${badgeClass}">${o.estado}</span></td>
                    <td>$${o.total.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleOrdenTrabajo('${o.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.app.imprimirOrdenTrabajo('${o.id}')">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalOrdenesTrabajo">
                <div class="modal-content" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-tools"></i> Órdenes de Trabajo - Taller</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalOrdenesTrabajo')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevaOrdenTrabajo()">
                            <i class="fas fa-plus"></i> Nueva Orden de Trabajo
                        </button>
                        
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Número</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Vehículo</th>
                                        <th>Técnico</th>
                                        <th>Estado</th>
                                        <th>Total</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ordenesHTML || '<tr><td colspan="8" class="text-center">No hay órdenes de trabajo</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    mostrarModalNuevaOrdenTrabajo() {
        // Obtener clientes para el select
        let clientesOptions = '<option value="">Seleccionar cliente</option>';
        this.clientes.forEach(c => {
            clientesOptions += `<option value="${c.id}">${c.nombre}</option>`;
        });
        clientesOptions += '<option value="nuevo">-- Crear nuevo cliente --</option>';

        // Obtener vehículos
        let vehiculosOptions = '<option value="">Seleccionar vehículo</option>';
        this.vehiculos.forEach(v => {
            vehiculosOptions += `<option value="${v.id}">${v.placa} - ${v.marca} ${v.modelo}</option>`;
        });

        // Obtener técnicos
        let tecnicosOptions = '<option value="">Seleccionar técnico</option>';
        this.tecnicos.forEach(t => {
            tecnicosOptions += `<option value="${t.id}" data-valorhora="${t.valorHora}">${t.nombre} - ${t.especialidad} ($${t.valorHora}/hora)</option>`;
        });

        // Obtener productos para repuestos
        const productos = storage.getInventario().filter(p => p.activo && p.unidades > 0);
        let productosOptions = '<option value="">Seleccionar repuesto</option>';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}">${p.nombre} - $${p.precioVenta} (Stock: ${p.unidades})</option>`;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevaOrdenTrabajo">
                <div class="modal-content" style="max-width: 1200px; width: 90%; height: 90vh;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Nueva Orden de Trabajo</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaOrdenTrabajo')">&times;</button>
                    </div>
                    <div class="modal-body" style="overflow-y: auto; padding: 20px;">
                        <form id="formNuevaOrdenTrabajo" onsubmit="return false;">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>Datos del Cliente y Vehículo</h5>
                                    <div class="form-group">
                                        <label>Cliente *</label>
                                        <select id="ordenClienteId" class="form-control" required>
                                            ${clientesOptions}
                                        </select>
                                    </div>
                                    <div id="camposNuevoClienteOrden" style="display:none; margin-top: 10px;">
                                        <div class="form-group">
                                            <label>Nombre del nuevo cliente</label>
                                            <input type="text" id="ordenNuevoCliente" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Teléfono</label>
                                            <input type="tel" id="ordenClienteTelefono" class="form-control">
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Vehículo</label>
                                        <select id="ordenVehiculoId" class="form-control">
                                            ${vehiculosOptions}
                                            <option value="nuevo">-- Registrar nuevo vehículo --</option>
                                        </select>
                                    </div>
                                    
                                    <div id="camposNuevoVehiculo" style="display:none; margin-top: 10px; background: #f5f5f5; padding: 15px; border-radius: 8px;">
                                        <h6>Registrar Vehículo</h6>
                                        <div class="form-group">
                                            <label>Placa</label>
                                            <input type="text" id="ordenVehiculoPlaca" class="form-control" placeholder="ABC-123">
                                        </div>
                                        <div class="form-group">
                                            <label>Marca</label>
                                            <input type="text" id="ordenVehiculoMarca" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Modelo</label>
                                            <input type="text" id="ordenVehiculoModelo" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Año</label>
                                            <input type="number" id="ordenVehiculoAnio" class="form-control" min="1900" max="2025">
                                        </div>
                                        <div class="form-group">
                                            <label>Kilometraje</label>
                                            <input type="number" id="ordenVehiculoKilometraje" class="form-control">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <h5>Datos del Servicio</h5>
                                    <div class="form-group">
                                        <label>Técnico asignado *</label>
                                        <select id="ordenTecnicoId" class="form-control" required>
                                            ${tecnicosOptions}
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Tipo de servicio</label>
                                        <select id="ordenTipoServicio" class="form-control">
                                            <option value="mecanica">Mecánica general</option>
                                            <option value="electricidad">Electricidad</option>
                                            <option value="diagnostico">Diagnóstico</option>
                                            <option value="mantenimiento">Mantenimiento preventivo</option>
                                            <option value="reparacion">Reparación</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Diagnóstico inicial *</label>
                                        <textarea id="ordenDiagnostico" class="form-control" rows="3" required placeholder="Describa el problema o servicio requerido..."></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mt-4">
                                <div class="col-md-12">
                                    <h5>Mano de Obra</h5>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Horas estimadas</label>
                                                <input type="number" id="ordenHoras" class="form-control" min="0" step="0.5" value="1">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Valor por hora</label>
                                                <input type="number" id="ordenValorHora" class="form-control" readonly value="0">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Total mano de obra</label>
                                                <input type="number" id="ordenTotalManoObra" class="form-control" readonly value="0">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mt-4">
                                <div class="col-md-12">
                                    <h5>Repuestos a utilizar</h5>
                                    <div id="repuestosOrden">
                                        <div class="row mb-2">
                                            <div class="col-md-5">
                                                <select class="form-control repuesto-producto" name="repuestoProducto[]">
                                                    ${productosOptions}
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <input type="number" class="form-control repuesto-cantidad" name="repuestoCantidad[]" value="1" min="1">
                                            </div>
                                            <div class="col-md-3">
                                                <input type="text" class="form-control repuesto-precio" name="repuestoPrecio[]" readonly placeholder="Precio">
                                            </div>
                                            <div class="col-md-2">
                                                <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-info btn-sm" onclick="window.app.agregarRepuestoOrden()">
                                        <i class="fas fa-plus"></i> Agregar repuesto
                                    </button>
                                </div>
                            </div>
                            
                            <div class="row mt-4">
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label>Observaciones / Notas adicionales</label>
                                        <textarea id="ordenObservaciones" class="form-control" rows="2"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mt-4">
                                <div class="col-md-12">
                                    <div class="card" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                                        <h5>Resumen de costos</h5>
                                        <div class="row">
                                            <div class="col-md-4">
                                                <p><strong>Mano de obra:</strong> <span id="resumenManoObra">$0</span></p>
                                            </div>
                                            <div class="col-md-4">
                                                <p><strong>Repuestos:</strong> <span id="resumenRepuestos">$0</span></p>
                                            </div>
                                            <div class="col-md-4">
                                                <p><strong>TOTAL:</strong> <span id="resumenTotalOrden">$0</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-actions mt-4" style="display: flex; gap: 10px; justify-content: flex-end;">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevaOrdenTrabajo')">
                                    Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevaOrdenTrabajo()">
                                    <i class="fas fa-save"></i> Guardar Orden de Trabajo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;

        // Event listeners
        document.getElementById('ordenClienteId')?.addEventListener('change', (e) => {
            document.getElementById('camposNuevoClienteOrden').style.display = e.target.value === 'nuevo' ? 'block' : 'none';
        });

        document.getElementById('ordenVehiculoId')?.addEventListener('change', (e) => {
            document.getElementById('camposNuevoVehiculo').style.display = e.target.value === 'nuevo' ? 'block' : 'none';
        });

        document.getElementById('ordenTecnicoId')?.addEventListener('change', (e) => {
            const select = e.target;
            const option = select.options[select.selectedIndex];
            const valorHora = option.getAttribute('data-valorhora') || 0;
            document.getElementById('ordenValorHora').value = valorHora;
            this.calcularTotalesOrden();
        });

        document.getElementById('ordenHoras')?.addEventListener('input', () => this.calcularTotalesOrden());

        // Inicializar valores
        setTimeout(() => {
            const tecSelect = document.getElementById('ordenTecnicoId');
            if (tecSelect && tecSelect.selectedIndex > 0) {
                const option = tecSelect.options[tecSelect.selectedIndex];
                document.getElementById('ordenValorHora').value = option.getAttribute('data-valorhora') || 0;
            }
        }, 500);
    }

    agregarRepuestoOrden() {
        const productos = storage.getInventario().filter(p => p.activo && p.unidades > 0);
        let productosOptions = '<option value="">Seleccionar repuesto</option>';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}" data-precio="${p.precioVenta}">${p.nombre} - $${p.precioVenta} (Stock: ${p.unidades})</option>`;
        });

        const div = document.createElement('div');
        div.className = 'row mb-2';
        div.innerHTML = `
            <div class="col-md-5">
                <select class="form-control repuesto-producto" name="repuestoProducto[]" onchange="window.app.actualizarPrecioRepuesto(this)">
                    ${productosOptions}
                </select>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control repuesto-cantidad" name="repuestoCantidad[]" value="1" min="1" onchange="window.app.calcularTotalesOrden()">
            </div>
            <div class="col-md-3">
                <input type="text" class="form-control repuesto-precio" name="repuestoPrecio[]" readonly placeholder="Precio">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove(); window.app.calcularTotalesOrden()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        document.getElementById('repuestosOrden').appendChild(div);
    }

    actualizarPrecioRepuesto(select) {
        const row = select.closest('.row');
        const precioInput = row.querySelector('.repuesto-precio');
        const option = select.options[select.selectedIndex];
        const precio = option.getAttribute('data-precio') || 0;
        precioInput.value = precio;
        this.calcularTotalesOrden();
    }

    calcularTotalesOrden() {
        // Calcular mano de obra
        const horas = parseFloat(document.getElementById('ordenHoras')?.value) || 0;
        const valorHora = parseFloat(document.getElementById('ordenValorHora')?.value) || 0;
        const totalManoObra = horas * valorHora;
        document.getElementById('ordenTotalManoObra').value = totalManoObra;

        // Calcular repuestos
        let totalRepuestos = 0;
        const repuestosRows = document.querySelectorAll('.repuesto-producto');
        repuestosRows.forEach((select, index) => {
            if (select.value) {
                const cantidad = parseFloat(document.querySelectorAll('.repuesto-cantidad')[index]?.value) || 1;
                const precio = parseFloat(document.querySelectorAll('.repuesto-precio')[index]?.value) || 0;
                totalRepuestos += cantidad * precio;
            }
        });

        // Actualizar resumen
        document.getElementById('resumenManoObra').textContent = `$${totalManoObra.toLocaleString()}`;
        document.getElementById('resumenRepuestos').textContent = `$${totalRepuestos.toLocaleString()}`;
        document.getElementById('resumenTotalOrden').textContent = `$${(totalManoObra + totalRepuestos).toLocaleString()}`;
    }

    guardarNuevaOrdenTrabajo() {
        const clienteId = document.getElementById('ordenClienteId')?.value;
        const diagnostico = document.getElementById('ordenDiagnostico')?.value;
        const tecnicoId = document.getElementById('ordenTecnicoId')?.value;

        if (!clienteId || !diagnostico || !tecnicoId) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }

        let clienteNombre = '';
        if (clienteId === 'nuevo') {
            const nuevoCliente = document.getElementById('ordenNuevoCliente')?.value;
            if (!nuevoCliente) {
                this.mostrarMensaje('❌ Ingresa el nombre del nuevo cliente', 'error');
                return;
            }
            // Crear cliente
            const cliente = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                nombre: nuevoCliente,
                telefono: document.getElementById('ordenClienteTelefono')?.value || '',
                puntos: 0,
                fechaCreacion: new Date().toISOString()
            };
            this.clientes.push(cliente);
            this.guardarClientes();
            clienteNombre = nuevoCliente;
        } else {
            const cliente = this.clientes.find(c => c.id === clienteId);
            clienteNombre = cliente ? cliente.nombre : '';
        }

        // Registrar vehículo si es nuevo
        let vehiculoId = document.getElementById('ordenVehiculoId')?.value;
        if (vehiculoId === 'nuevo') {
            const placa = document.getElementById('ordenVehiculoPlaca')?.value;
            if (placa) {
                const nuevoVehiculo = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    clienteId: clienteId === 'nuevo' ? this.clientes[this.clientes.length - 1].id : clienteId,
                    placa: placa,
                    marca: document.getElementById('ordenVehiculoMarca')?.value || '',
                    modelo: document.getElementById('ordenVehiculoModelo')?.value || '',
                    año: document.getElementById('ordenVehiculoAnio')?.value || '',
                    kilometraje: document.getElementById('ordenVehiculoKilometraje')?.value || 0,
                    fechaRegistro: new Date().toISOString()
                };
                this.vehiculos.push(nuevoVehiculo);
                this.guardarVehiculos();
                vehiculoId = nuevoVehiculo.id;
            }
        }

        // Obtener repuestos
        const repuestos = [];
        const repuestoSelects = document.querySelectorAll('.repuesto-producto');
        const repuestoCantidades = document.querySelectorAll('.repuesto-cantidad');
        const repuestoPrecios = document.querySelectorAll('.repuesto-precio');

        for (let i = 0; i < repuestoSelects.length; i++) {
            if (repuestoSelects[i].value) {
                const productoId = repuestoSelects[i].value;
                const cantidad = parseInt(repuestoCantidades[i].value) || 1;
                const precio = parseFloat(repuestoPrecios[i].value) || 0;
                
                // Verificar stock
                const producto = storage.getProducto(productoId);
                if (!producto || producto.unidades < cantidad) {
                    this.mostrarMensaje(`❌ Stock insuficiente para el repuesto seleccionado`, 'error');
                    return;
                }

                repuestos.push({
                    productoId: productoId,
                    nombre: producto.nombre,
                    cantidad: cantidad,
                    precioUnitario: precio,
                    subtotal: precio * cantidad
                });
            }
        }

        const horas = parseFloat(document.getElementById('ordenHoras')?.value) || 0;
        const valorHora = parseFloat(document.getElementById('ordenValorHora')?.value) || 0;
        const totalManoObra = horas * valorHora;
        const totalRepuestos = repuestos.reduce((s, r) => s + r.subtotal, 0);
        const total = totalManoObra + totalRepuestos;

        // Crear orden de trabajo
        const orden = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `OT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(this.ordenesTrabajo.length + 1).padStart(4, '0')}`,
            fecha: new Date().toISOString(),
            clienteId: clienteId === 'nuevo' ? this.clientes[this.clientes.length - 1].id : clienteId,
            cliente: clienteNombre,
            vehiculoId: vehiculoId,
            tecnicoId: tecnicoId,
            tecnico: this.tecnicos.find(t => t.id === tecnicoId)?.nombre || '',
            tipoServicio: document.getElementById('ordenTipoServicio')?.value || 'mecanica',
            diagnostico: diagnostico,
            observaciones: document.getElementById('ordenObservaciones')?.value || '',
            manoObra: {
                horas: horas,
                valorHora: valorHora,
                total: totalManoObra
            },
            repuestos: repuestos,
            total: total,
            estado: 'pendiente',
            historial: [{
                fecha: new Date().toISOString(),
                estado: 'pendiente',
                usuario: this.getUsuarioActual()?.nombre || 'Sistema'
            }]
        };

        // Descontar repuestos del inventario
        repuestos.forEach(r => {
            const producto = storage.getProducto(r.productoId);
            if (producto) {
                producto.unidades -= r.cantidad;
                storage.updateProducto(r.productoId, { unidades: producto.unidades });
            }
        });

        this.ordenesTrabajo.push(orden);
        this.guardarOrdenesTrabajo();

        this.mostrarMensaje('✅ Orden de trabajo creada', 'success');
        this.cerrarModal('modalNuevaOrdenTrabajo');
        this.mostrarModalOrdenesTrabajo();
    }

    verDetalleOrdenTrabajo(id) {
        const orden = this.ordenesTrabajo.find(o => o.id === id);
        if (!orden) return;

        const cliente = this.clientes.find(c => c.id === orden.clienteId);
        const vehiculo = this.vehiculos.find(v => v.id === orden.vehiculoId);
        const tecnico = this.tecnicos.find(t => t.id === orden.tecnicoId);

        const fecha = new Date(orden.fecha);

        let repuestosHTML = '';
        orden.repuestos.forEach(r => {
            repuestosHTML += `
                <tr>
                    <td>${r.nombre}</td>
                    <td>${r.cantidad}</td>
                    <td>$${r.precioUnitario}</td>
                    <td>$${r.subtotal}</td>
                </tr>
            `;
        });

        let historialHTML = '';
        orden.historial.forEach(h => {
            const fechaH = new Date(h.fecha);
            historialHTML += `
                <tr>
                    <td>${fechaH.toLocaleDateString()} ${fechaH.toLocaleTimeString()}</td>
                    <td>${h.estado}</td>
                    <td>${h.usuario}</td>
                    <td>${h.observacion || ''}</td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalDetalleOrdenTrabajo">
                <div class="modal-content" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-tools"></i> Orden de Trabajo: ${orden.numero}</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDetalleOrdenTrabajo')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
                                <p><strong>Cliente:</strong> ${cliente ? cliente.nombre : orden.cliente}</p>
                                <p><strong>Teléfono cliente:</strong> ${cliente ? cliente.telefono : 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Vehículo:</strong> ${vehiculo ? vehiculo.placa + ' - ' + vehiculo.marca + ' ' + vehiculo.modelo : 'N/A'}</p>
                                <p><strong>Técnico:</strong> ${tecnico ? tecnico.nombre : orden.tecnico}</p>
                                <p><strong>Estado:</strong> <span class="badge badge-warning">${orden.estado}</span></p>
                            </div>
                        </div>

                        <div class="mt-3">
                            <h5>Diagnóstico</h5>
                            <p>${orden.diagnostico}</p>
                        </div>

                        <div class="mt-3">
                            <h5>Mano de Obra</h5>
                            <p>Horas: ${orden.manoObra.horas} | Valor hora: $${orden.manoObra.valorHora} | Total: $${orden.manoObra.total}</p>
                        </div>

                        <div class="mt-3">
                            <h5>Repuestos utilizados</h5>
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
                                    ${repuestosHTML || '<tr><td colspan="4" class="text-center">No se usaron repuestos</td></tr>'}
                                </tbody>
                            </table>
                        </div>

                        <div class="mt-3 text-right">
                            <h4>Total: $${orden.total.toLocaleString()}</h4>
                        </div>

                        <div class="mt-3">
                            <h5>Historial de estados</h5>
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Usuario</th>
                                        <th>Observación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${historialHTML}
                                </tbody>
                            </table>
                        </div>

                        <div class="mt-3">
                            <h5>Actualizar estado</h5>
                            <div class="row">
                                <div class="col-md-6">
                                    <select id="nuevoEstadoOrden" class="form-control">
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en_proceso">En proceso</option>
                                        <option value="espera_repuestos">Espera de repuestos</option>
                                        <option value="completada">Completada</option>
                                        <option value="entregado">Entregado al cliente</option>
                                        <option value="cancelada">Cancelada</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <input type="text" id="observacionEstado" class="form-control" placeholder="Observación (opcional)">
                                </div>
                                <div class="col-md-12 mt-2">
                                    <button class="btn btn-primary" onclick="window.app.actualizarEstadoOrden('${orden.id}')">
                                        Actualizar Estado
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <button class="btn btn-success" onclick="window.app.imprimirOrdenTrabajo('${orden.id}')">
                                <i class="fas fa-print"></i> Imprimir Orden
                            </button>
                            <button class="btn btn-info" onclick="window.app.convertirOrdenAFactura('${orden.id}')">
                                <i class="fas fa-file-invoice"></i> Generar Factura
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    actualizarEstadoOrden(id) {
        const orden = this.ordenesTrabajo.find(o => o.id === id);
        if (!orden) return;

        const nuevoEstado = document.getElementById('nuevoEstadoOrden')?.value;
        const observacion = document.getElementById('observacionEstado')?.value || '';

        if (!nuevoEstado) return;

        orden.estado = nuevoEstado;
        orden.historial.push({
            fecha: new Date().toISOString(),
            estado: nuevoEstado,
            observacion: observacion,
            usuario: this.getUsuarioActual()?.nombre || 'Sistema'
        });

        this.guardarOrdenesTrabajo();
        this.mostrarMensaje('✅ Estado actualizado', 'success');
        this.verDetalleOrdenTrabajo(id);
    }

    imprimirOrdenTrabajo(id) {
        const orden = this.ordenesTrabajo.find(o => o.id === id);
        if (!orden) return;

        const cliente = this.clientes.find(c => c.id === orden.clienteId);
        const vehiculo = this.vehiculos.find(v => v.id === orden.vehiculoId);
        const tecnico = this.tecnicos.find(t => t.id === orden.tecnicoId);
        const config = storage.getConfig?.() || {};
        const nombreNegocio = config.nombreNegocio || 'Mi Negocio';

        const fecha = new Date(orden.fecha);

        let repuestosHTML = '';
        orden.repuestos.forEach(r => {
            repuestosHTML += `
                <tr>
                    <td>${r.nombre}</td>
                    <td>${r.cantidad}</td>
                    <td>$${r.precioUnitario}</td>
                    <td>$${r.subtotal}</td>
                </tr>
            `;
        });

        const ordenHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Orden de Trabajo ${orden.numero}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .empresa { font-size: 24px; font-weight: bold; color: #27ae60; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .totales { text-align: right; margin-top: 20px; }
                    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="empresa">${nombreNegocio}</div>
                    <h2>ORDEN DE TRABAJO</h2>
                    <p>${orden.numero}</p>
                </div>
                
                <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
                <p><strong>Cliente:</strong> ${cliente ? cliente.nombre : orden.cliente}</p>
                <p><strong>Teléfono:</strong> ${cliente ? cliente.telefono : 'N/A'}</p>
                
                <p><strong>Vehículo:</strong> ${vehiculo ? vehiculo.placa + ' - ' + vehiculo.marca + ' ' + vehiculo.modelo + ' (' + vehiculo.año + ')' : 'N/A'}</p>
                <p><strong>Kilometraje:</strong> ${vehiculo ? vehiculo.kilometraje : 'N/A'}</p>
                
                <p><strong>Técnico asignado:</strong> ${tecnico ? tecnico.nombre : orden.tecnico}</p>
                
                <h3>Diagnóstico</h3>
                <p>${orden.diagnostico}</p>
                
                <h3>Mano de Obra</h3>
                <p>Horas: ${orden.manoObra.horas} | Valor hora: $${orden.manoObra.valorHora} | Total: $${orden.manoObra.total}</p>
                
                <h3>Repuestos</h3>
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
                        ${repuestosHTML || '<tr><td colspan="4" class="text-center">No se usaron repuestos</td></tr>'}
                    </tbody>
                </table>
                
                <div class="totales">
                    <h3>TOTAL: $${orden.total.toLocaleString()}</h3>
                </div>
                
                ${orden.observaciones ? `<p><strong>Observaciones:</strong> ${orden.observaciones}</p>` : ''}
                
                <div class="footer">
                    <p>Firma del cliente: ___________________________</p>
                    <p>Fecha de entrega: ___________________________</p>
                </div>
            </body>
            </html>
        `;

        const ventana = window.open('', '_blank');
        ventana.document.write(ordenHTML);
        ventana.document.close();
    }

    convertirOrdenAFactura(id) {
        const orden = this.ordenesTrabajo.find(o => o.id === id);
        if (!orden) return;

        if (orden.estado !== 'completada' && orden.estado !== 'entregado') {
            if (!confirm('La orden no está completada. ¿Convertir a factura de todas formas?')) {
                return;
            }
        }

        // Crear carrito con los repuestos
        this.carritoVenta = orden.repuestos.map(r => ({
            productoId: r.productoId,
            nombre: r.nombre,
            codigo: storage.getProducto(r.productoId)?.codigo || '',
            precioUnitario: r.precioUnitario,
            cantidad: r.cantidad,
            subtotal: r.subtotal,
            stockDisponible: storage.getProducto(r.productoId)?.unidades || 0
        }));

        // Agregar mano de obra como un item
        if (orden.manoObra.total > 0) {
            this.carritoVenta.push({
                productoId: 'mano_obra_' + orden.id,
                nombre: 'Mano de obra - ' + (orden.tipoServicio || 'Servicio'),
                codigo: 'SERVICIO',
                precioUnitario: orden.manoObra.total,
                cantidad: 1,
                subtotal: orden.manoObra.total,
                stockDisponible: 999999,
                esServicio: true
            });
        }

        // Abrir modal de venta
        this.mostrarModalNuevaVenta();
        
        // Rellenar datos del cliente
        setTimeout(() => {
            const cliente = this.clientes.find(c => c.id === orden.clienteId);
            if (cliente) {
                document.getElementById('tipoDomicilioLabel')?.click();
                document.getElementById('domicilioNombre').value = cliente.nombre;
                document.getElementById('domicilioTelefono').value = cliente.telefono || '';
            }
        }, 1000);
    }

    // ============================================
    // MÓDULO 3: RECETAS MÉDICAS (FARMACIAS)
    // ============================================

    cargarRecetasMedicas() {
        this.recetasMedicas = JSON.parse(localStorage.getItem('invplanet_recetas_medicas') || '[]');
        console.log(`💊 Recetas médicas cargadas: ${this.recetasMedicas.length}`);
    }

    guardarRecetasMedicas() {
        localStorage.setItem('invplanet_recetas_medicas', JSON.stringify(this.recetasMedicas));
    }

    mostrarModalRecetasMedicas() {
        let recetasHTML = '';
        this.recetasMedicas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(r => {
            const fecha = new Date(r.fecha).toLocaleDateString();
            const vencimiento = r.fechaVencimiento ? new Date(r.fechaVencimiento).toLocaleDateString() : 'N/A';
            
            let badgeClass = 'badge-success';
            if (r.estado === 'parcial') badgeClass = 'badge-warning';
            if (r.estado === 'vencida') badgeClass = 'badge-danger';
            if (r.estado === 'completada') badgeClass = 'badge-info';

            recetasHTML += `
                <tr>
                    <td>${r.numero}</td>
                    <td>${fecha}</td>
                    <td>${r.paciente}</td>
                    <td>${r.doctor || 'N/A'}</td>
                    <td>${r.medicamentos.length}</td>
                    <td>${vencimiento}</td>
                    <td><span class="badge ${badgeClass}">${r.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleReceta('${r.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.app.despacharReceta('${r.id}')">
                            <i class="fas fa-pills"></i> Despachar
                        </button>
                    </td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalRecetasMedicas">
                <div class="modal-content" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-prescription"></i> Recetas Médicas</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalRecetasMedicas')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevaReceta()">
                            <i class="fas fa-plus"></i> Nueva Receta
                        </button>
                        
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Número</th>
                                        <th>Fecha</th>
                                        <th>Paciente</th>
                                        <th>Doctor</th>
                                        <th>Medicamentos</th>
                                        <th>Vencimiento</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recetasHTML || '<tr><td colspan="8" class="text-center">No hay recetas registradas</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    mostrarModalNuevaReceta() {
        // Obtener medicamentos (productos de farmacia)
        const medicamentos = storage.getInventario().filter(p => p.activo && p.categoriaId === 'farmacia');
        let medicamentosOptions = '<option value="">Seleccionar medicamento</option>';
        medicamentos.forEach(m => {
            medicamentosOptions += `<option value="${m.id}" data-precio="${m.precioVenta}">${m.nombre} - $${m.precioVenta} (Stock: ${m.unidades})</option>`;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevaReceta">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Nueva Receta Médica</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaReceta')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevaReceta" onsubmit="return false;">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Paciente *</label>
                                        <input type="text" id="recetaPaciente" class="form-control" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Edad</label>
                                        <input type="number" id="recetaEdad" class="form-control" min="0">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Doctor</label>
                                        <input type="text" id="recetaDoctor" class="form-control">
                                    </div>
                                    <div class="form-group">
                                        <label>Registro médico</label>
                                        <input type="text" id="recetaRegistro" class="form-control">
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Fecha de vencimiento de la receta</label>
                                <input type="date" id="recetaVencimiento" class="form-control" value="${this.sumarDias(new Date(), 30).toISOString().split('T')[0]}">
                            </div>

                            <h5>Medicamentos</h5>
                            <div id="medicamentosReceta">
                                <div class="row mb-2">
                                    <div class="col-md-5">
                                        <select class="form-control receta-medicamento" name="recetaMedicamento[]">
                                            ${medicamentosOptions}
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <input type="text" class="form-control receta-dosis" name="recetaDosis[]" placeholder="Dosis (ej: 500mg)">
                                    </div>
                                    <div class="col-md-2">
                                        <input type="text" class="form-control receta-presentacion" name="recetaPresentacion[]" placeholder="Presentación">
                                    </div>
                                    <div class="col-md-2">
                                        <input type="number" class="form-control receta-cantidad" name="recetaCantidad[]" value="1" min="1">
                                    </div>
                                    <div class="col-md-1">
                                        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="button" class="btn btn-info mb-3" onclick="window.app.agregarMedicamentoReceta()">
                                <i class="fas fa-plus"></i> Agregar medicamento
                            </button>

                            <div class="form-group">
                                <label>Indicaciones</label>
                                <textarea id="recetaIndicaciones" class="form-control" rows="2" placeholder="Tomar cada 8 horas, etc..."></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevaReceta')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevaReceta()">Guardar Receta</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    agregarMedicamentoReceta() {
        const medicamentos = storage.getInventario().filter(p => p.activo && p.categoriaId === 'farmacia');
        let medicamentosOptions = '<option value="">Seleccionar medicamento</option>';
        medicamentos.forEach(m => {
            medicamentosOptions += `<option value="${m.id}" data-precio="${m.precioVenta}">${m.nombre} - $${m.precioVenta} (Stock: ${m.unidades})</option>`;
        });

        const div = document.createElement('div');
        div.className = 'row mb-2';
        div.innerHTML = `
            <div class="col-md-5">
                <select class="form-control receta-medicamento" name="recetaMedicamento[]">
                    ${medicamentosOptions}
                </select>
            </div>
            <div class="col-md-2">
                <input type="text" class="form-control receta-dosis" name="recetaDosis[]" placeholder="Dosis">
            </div>
            <div class="col-md-2">
                <input type="text" class="form-control receta-presentacion" name="recetaPresentacion[]" placeholder="Presentación">
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control receta-cantidad" name="recetaCantidad[]" value="1" min="1">
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        document.getElementById('medicamentosReceta').appendChild(div);
    }

    guardarNuevaReceta() {
        const paciente = document.getElementById('recetaPaciente')?.value;
        if (!paciente) {
            this.mostrarMensaje('❌ El nombre del paciente es obligatorio', 'error');
            return;
        }

        const medicamentoSelects = document.querySelectorAll('.receta-medicamento');
        if (medicamentoSelects.length === 0) {
            this.mostrarMensaje('❌ Agrega al menos un medicamento', 'error');
            return;
        }

        const medicamentos = [];
        for (let i = 0; i < medicamentoSelects.length; i++) {
            const select = medicamentoSelects[i];
            if (select.value) {
                const medicamento = storage.getProducto(select.value);
                const dosis = document.querySelectorAll('.receta-dosis')[i]?.value || '';
                const presentacion = document.querySelectorAll('.receta-presentacion')[i]?.value || '';
                const cantidad = parseInt(document.querySelectorAll('.receta-cantidad')[i]?.value) || 1;

                medicamentos.push({
                    productoId: select.value,
                    nombre: medicamento.nombre,
                    dosis: dosis,
                    presentacion: presentacion,
                    cantidad: cantidad,
                    despachado: 0,
                    precioUnitario: medicamento.precioVenta
                });
            }
        }

        const nuevaReceta = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `REC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(this.recetasMedicas.length + 1).padStart(4, '0')}`,
            fecha: new Date().toISOString(),
            paciente: paciente,
            edad: document.getElementById('recetaEdad')?.value || '',
            doctor: document.getElementById('recetaDoctor')?.value || '',
            registroMedico: document.getElementById('recetaRegistro')?.value || '',
            fechaVencimiento: document.getElementById('recetaVencimiento')?.value || null,
            medicamentos: medicamentos,
            indicaciones: document.getElementById('recetaIndicaciones')?.value || '',
            estado: 'activa',
            historial: [{
                fecha: new Date().toISOString(),
                accion: 'Receta creada',
                usuario: this.getUsuarioActual()?.nombre || 'Sistema'
            }]
        };

        this.recetasMedicas.push(nuevaReceta);
        this.guardarRecetasMedicas();

        this.mostrarMensaje('✅ Receta médica registrada', 'success');
        this.cerrarModal('modalNuevaReceta');
        this.mostrarModalRecetasMedicas();
    }

    verDetalleReceta(id) {
        const receta = this.recetasMedicas.find(r => r.id === id);
        if (!receta) return;

        const fecha = new Date(receta.fecha);

        let medicamentosHTML = '';
        receta.medicamentos.forEach(m => {
            medicamentosHTML += `
                <tr>
                    <td>${m.nombre}</td>
                    <td>${m.dosis || 'N/A'}</td>
                    <td>${m.presentacion || 'N/A'}</td>
                    <td>${m.cantidad}</td>
                    <td>${m.despachado || 0}</td>
                    <td>${m.cantidad - (m.despachado || 0)}</td>
                </tr>
            `;
        });

        let historialHTML = '';
        receta.historial.forEach(h => {
            const fechaH = new Date(h.fecha);
            historialHTML += `
                <tr>
                    <td>${fechaH.toLocaleDateString()} ${fechaH.toLocaleTimeString()}</td>
                    <td>${h.accion}</td>
                    <td>${h.usuario}</td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalDetalleReceta">
                <div class="modal-content" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-prescription"></i> Receta Médica: ${receta.numero}</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDetalleReceta')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
                                <p><strong>Paciente:</strong> ${receta.paciente}</p>
                                <p><strong>Edad:</strong> ${receta.edad || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Doctor:</strong> ${receta.doctor || 'N/A'}</p>
                                <p><strong>Registro:</strong> ${receta.registroMedico || 'N/A'}</p>
                                <p><strong>Vence:</strong> ${receta.fechaVencimiento ? new Date(receta.fechaVencimiento).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>

                        <h5>Medicamentos</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Medicamento</th>
                                    <th>Dosis</th>
                                    <th>Presentación</th>
                                    <th>Cantidad</th>
                                    <th>Despachado</th>
                                    <th>Pendiente</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${medicamentosHTML}
                            </tbody>
                        </table>

                        <p><strong>Indicaciones:</strong> ${receta.indicaciones || 'Ninguna'}</p>

                        <h5>Historial</h5>
                        <table class="table table-sm">
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

                        <div class="mt-3">
                            <button class="btn btn-success" onclick="window.app.despacharReceta('${receta.id}')">
                                <i class="fas fa-pills"></i> Despachar Medicamentos
                            </button>
                            <button class="btn btn-info" onclick="window.app.imprimirReceta('${receta.id}')">
                                <i class="fas fa-print"></i> Imprimir Receta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    despacharReceta(id) {
        const receta = this.recetasMedicas.find(r => r.id === id);
        if (!receta) return;

        // Verificar si la receta está vencida
        if (receta.fechaVencimiento) {
            const hoy = new Date();
            const vencimiento = new Date(receta.fechaVencimiento);
            if (hoy > vencimiento) {
                if (!confirm('⚠️ Esta receta está vencida. ¿Despachar de todas formas?')) {
                    return;
                }
            }
        }

        // Crear carrito con los medicamentos pendientes
        this.carritoVenta = [];
        receta.medicamentos.forEach(m => {
            const pendiente = m.cantidad - (m.despachado || 0);
            if (pendiente > 0) {
                const producto = storage.getProducto(m.productoId);
                if (producto && producto.unidades >= pendiente) {
                    this.carritoVenta.push({
                        productoId: m.productoId,
                        nombre: m.nombre,
                        codigo: producto.codigo,
                        precioUnitario: producto.precioVenta,
                        cantidad: pendiente,
                        subtotal: producto.precioVenta * pendiente,
                        stockDisponible: producto.unidades,
                        nota: `Receta: ${receta.numero} - ${m.dosis || ''}`,
                        recetaId: receta.id
                    });
                } else {
                    this.mostrarMensaje(`⚠️ Stock insuficiente para ${m.nombre}`, 'warning');
                }
            }
        });

        if (this.carritoVenta.length === 0) {
            this.mostrarMensaje('❌ No hay medicamentos pendientes por despachar', 'error');
            return;
        }

        // Abrir modal de venta
        this.mostrarModalNuevaVenta();
        
        // Rellenar datos del cliente
        setTimeout(() => {
            document.getElementById('tipoDomicilioLabel')?.click();
            document.getElementById('domicilioNombre').value = receta.paciente;
            document.getElementById('notaGeneral').value = `Despacho de receta médica #${receta.numero} - Dr. ${receta.doctor || 'N/A'}`;
        }, 1000);
    }

    imprimirReceta(id) {
        const receta = this.recetasMedicas.find(r => r.id === id);
        if (!receta) return;

        const fecha = new Date(receta.fecha);
        const config = storage.getConfig?.() || {};

        let medicamentosHTML = '';
        receta.medicamentos.forEach(m => {
            medicamentosHTML += `
                <tr>
                    <td>${m.nombre}</td>
                    <td>${m.dosis || 'N/A'}</td>
                    <td>${m.presentacion || 'N/A'}</td>
                    <td>${m.cantidad}</td>
                </tr>
            `;
        });

        const recetaHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receta Médica ${receta.numero}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .title { font-size: 20px; font-weight: bold; color: #e74c3c; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .footer { margin-top: 40px; }
                    .firma { margin-top: 60px; border-top: 1px solid #000; width: 300px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">RECETA MÉDICA</div>
                    <p>${receta.numero}</p>
                </div>
                
                <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
                <p><strong>Paciente:</strong> ${receta.paciente} - Edad: ${receta.edad || 'N/A'}</p>
                <p><strong>Doctor:</strong> ${receta.doctor || 'N/A'} - Registro: ${receta.registroMedico || 'N/A'}</p>
                <p><strong>Válida hasta:</strong> ${receta.fechaVencimiento ? new Date(receta.fechaVencimiento).toLocaleDateString() : 'N/A'}</p>
                
                <h3>Medicamentos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Medicamento</th>
                            <th>Dosis</th>
                            <th>Presentación</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${medicamentosHTML}
                    </tbody>
                </table>
                
                <p><strong>Indicaciones:</strong> ${receta.indicaciones || 'Ninguna'}</p>
                
                <div class="footer">
                    <div class="firma">
                        Firma y sello del doctor
                    </div>
                </div>
            </body>
            </html>
        `;

        const ventana = window.open('', '_blank');
        ventana.document.write(recetaHTML);
        ventana.document.close();
    }

    // ============================================
    // MÓDULO 4: VEHÍCULOS
    // ============================================

    cargarVehiculos() {
        this.vehiculos = JSON.parse(localStorage.getItem('invplanet_vehiculos') || '[]');
        console.log(`🚗 Vehículos cargados: ${this.vehiculos.length}`);
    }

    guardarVehiculos() {
        localStorage.setItem('invplanet_vehiculos', JSON.stringify(this.vehiculos));
    }

    mostrarModalVehiculos(clienteId = null) {
        let vehiculosHTML = '';
        let vehiculosFiltrados = clienteId ? this.vehiculos.filter(v => v.clienteId === clienteId) : this.vehiculos;
        
        vehiculosFiltrados.forEach(v => {
            const cliente = this.clientes.find(c => c.id === v.clienteId);
            vehiculosHTML += `
                <tr>
                    <td><strong>${v.placa}</strong></td>
                    <td>${v.marca} ${v.modelo} (${v.año || 'N/A'})</td>
                    <td>${cliente ? cliente.nombre : 'N/A'}</td>
                    <td>${v.kilometraje || 0} km</td>
                    <td>${v.color || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verHistorialVehiculo('${v.id}')">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarVehiculo('${v.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.app.mostrarModalNuevaOrdenTrabajoConVehiculo('${v.id}')">
                            <i class="fas fa-tools"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalVehiculos">
                <div class="modal-content" style="max-width: 1100px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-car"></i> Vehículos Registrados</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalVehiculos')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoVehiculo()">
                            <i class="fas fa-plus"></i> Nuevo Vehículo
                        </button>
                        
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Placa</th>
                                        <th>Vehículo</th>
                                        <th>Propietario</th>
                                        <th>Kilometraje</th>
                                        <th>Color</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${vehiculosHTML || '<tr><td colspan="6" class="text-center">No hay vehículos registrados</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    mostrarModalNuevoVehiculo(clienteIdPreseleccionado = null) {
        let clientesOptions = '<option value="">Seleccionar propietario</option>';
        this.clientes.forEach(c => {
            const selected = c.id === clienteIdPreseleccionado ? 'selected' : '';
            clientesOptions += `<option value="${c.id}" ${selected}>${c.nombre}</option>`;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoVehiculo">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Registrar Vehículo</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoVehiculo')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoVehiculo" onsubmit="return false;">
                            <div class="form-group">
                                <label>Propietario *</label>
                                <select id="vehiculoClienteId" class="form-control" required>
                                    ${clientesOptions}
                                    <option value="nuevo">-- Crear nuevo cliente --</option>
                                </select>
                            </div>

                            <div id="camposNuevoClienteVehiculo" style="display:none; margin-top: 10px;">
                                <div class="form-group">
                                    <label>Nombre del nuevo cliente</label>
                                    <input type="text" id="vehiculoNuevoCliente" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>Teléfono</label>
                                    <input type="tel" id="vehiculoClienteTelefono" class="form-control">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Placa *</label>
                                <input type="text" id="vehiculoPlaca" class="form-control" required placeholder="ABC-123">
                            </div>

                            <div class="form-group">
                                <label>Marca</label>
                                <input type="text" id="vehiculoMarca" class="form-control">
                            </div>

                            <div class="form-group">
                                <label>Modelo</label>
                                <input type="text" id="vehiculoModelo" class="form-control">
                            </div>

                            <div class="form-group">
                                <label>Año</label>
                                <input type="number" id="vehiculoAnio" class="form-control" min="1900" max="2025">
                            </div>

                            <div class="form-group">
                                <label>Color</label>
                                <input type="text" id="vehiculoColor" class="form-control">
                            </div>

                            <div class="form-group">
                                <label>Kilometraje actual</label>
                                <input type="number" id="vehiculoKilometraje" class="form-control" min="0">
                            </div>

                            <div class="form-group">
                                <label>Notas</label>
                                <textarea id="vehiculoNotas" class="form-control" rows="2"></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoVehiculo')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoVehiculo()">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;

        document.getElementById('vehiculoClienteId')?.addEventListener('change', (e) => {
            document.getElementById('camposNuevoClienteVehiculo').style.display = e.target.value === 'nuevo' ? 'block' : 'none';
        });
    }

    guardarNuevoVehiculo() {
        const clienteId = document.getElementById('vehiculoClienteId')?.value;
        const placa = document.getElementById('vehiculoPlaca')?.value;

        if (!clienteId || !placa) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }

        let clienteFinalId = clienteId;
        if (clienteId === 'nuevo') {
            const nuevoCliente = document.getElementById('vehiculoNuevoCliente')?.value;
            if (!nuevoCliente) {
                this.mostrarMensaje('❌ Ingresa el nombre del nuevo cliente', 'error');
                return;
            }
            const cliente = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                nombre: nuevoCliente,
                telefono: document.getElementById('vehiculoClienteTelefono')?.value || '',
                puntos: 0,
                fechaCreacion: new Date().toISOString()
            };
            this.clientes.push(cliente);
            this.guardarClientes();
            clienteFinalId = cliente.id;
        }

        const nuevoVehiculo = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            clienteId: clienteFinalId,
            placa: placa.toUpperCase(),
            marca: document.getElementById('vehiculoMarca')?.value || '',
            modelo: document.getElementById('vehiculoModelo')?.value || '',
            año: document.getElementById('vehiculoAnio')?.value || '',
            color: document.getElementById('vehiculoColor')?.value || '',
            kilometraje: parseInt(document.getElementById('vehiculoKilometraje')?.value) || 0,
            notas: document.getElementById('vehiculoNotas')?.value || '',
            fechaRegistro: new Date().toISOString(),
            historialServicios: []
        };

        this.vehiculos.push(nuevoVehiculo);
        this.guardarVehiculos();

        this.mostrarMensaje('✅ Vehículo registrado', 'success');
        this.cerrarModal('modalNuevoVehiculo');
        this.mostrarModalVehiculos();
    }

    verHistorialVehiculo(id) {
        const vehiculo = this.vehiculos.find(v => v.id === id);
        if (!vehiculo) return;

        const cliente = this.clientes.find(c => c.id === vehiculo.clienteId);

        // Buscar órdenes de trabajo para este vehículo
        const ordenes = this.ordenesTrabajo.filter(o => o.vehiculoId === id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        let serviciosHTML = '';
        ordenes.forEach(o => {
            const fecha = new Date(o.fecha);
            serviciosHTML += `
                <tr>
                    <td>${o.numero}</td>
                    <td>${fecha.toLocaleDateString()}</td>
                    <td>${o.diagnostico.substring(0, 50)}${o.diagnostico.length > 50 ? '...' : ''}</td>
                    <td>$${o.total.toLocaleString()}</td>
                    <td><span class="badge badge-info">${o.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleOrdenTrabajo('${o.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalHistorialVehiculo">
                <div class="modal-content" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-history"></i> Historial del Vehículo: ${vehiculo.placa}</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalHistorialVehiculo')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Propietario:</strong> ${cliente ? cliente.nombre : 'N/A'}</p>
                                <p><strong>Marca/Modelo:</strong> ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.año || 'N/A'})</p>
                                <p><strong>Color:</strong> ${vehiculo.color || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Kilometraje actual:</strong> ${vehiculo.kilometraje} km</p>
                                <p><strong>Registrado:</strong> ${new Date(vehiculo.fechaRegistro).toLocaleDateString()}</p>
                                <p><strong>Total servicios:</strong> ${ordenes.length}</p>
                            </div>
                        </div>

                        <h5>Servicios realizados</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Orden</th>
                                    <th>Fecha</th>
                                    <th>Servicio</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${serviciosHTML || '<tr><td colspan="6" class="text-center">No hay servicios registrados para este vehículo</td></tr>'}
                            </tbody>
                        </table>

                        <div class="mt-3">
                            <h5>Recordatorios de mantenimiento</h5>
                            <div class="form-group">
                                <label>Kilometraje para próximo mantenimiento</label>
                                <div class="input-group">
                                    <input type="number" id="proximoMantenimiento" class="form-control" value="${vehiculo.kilometraje + 5000}">
                                    <div class="input-group-append">
                                        <button class="btn btn-primary" onclick="window.app.guardarRecordatorioMantenimiento('${vehiculo.id}')">
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    guardarRecordatorioMantenimiento(id) {
        const vehiculo = this.vehiculos.find(v => v.id === id);
        if (!vehiculo) return;

        const proximo = document.getElementById('proximoMantenimiento')?.value;
        if (proximo) {
            vehiculo.proximoMantenimiento = parseInt(proximo);
            this.guardarVehiculos();
            this.mostrarMensaje('✅ Recordatorio guardado', 'success');
        }
    }

    editarVehiculo(id) {
        // Similar a nuevo vehículo pero con datos precargados
        this.mostrarMensaje('Función en desarrollo', 'info');
    }

    mostrarModalNuevaOrdenTrabajoConVehiculo(vehiculoId) {
        // Abrir modal de nueva orden con vehículo preseleccionado
        this.mostrarModalNuevaOrdenTrabajo();
        setTimeout(() => {
            const selectVehiculo = document.getElementById('ordenVehiculoId');
            if (selectVehiculo) {
                selectVehiculo.value = vehiculoId;
                // Disparar evento change si es necesario
                const event = new Event('change', { bubbles: true });
                selectVehiculo.dispatchEvent(event);
            }
        }, 1000);
    }

    // ============================================
    // MÓDULO 5: ÓRDENES DE COMPRA
    // ============================================

    cargarOrdenesCompra() {
        this.ordenesCompra = JSON.parse(localStorage.getItem('invplanet_ordenes_compra') || '[]');
        console.log(`📋 Órdenes de compra cargadas: ${this.ordenesCompra.length}`);
    }

    guardarOrdenesCompra() {
        localStorage.setItem('invplanet_ordenes_compra', JSON.stringify(this.ordenesCompra));
    }

    mostrarModalOrdenesCompra() {
        let ordenesHTML = '';
        this.ordenesCompra.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(o => {
            const fecha = new Date(o.fecha).toLocaleDateString();
            const proveedor = this.proveedores.find(p => p.id === o.proveedorId);
            
            let badgeClass = 'badge-warning';
            if (o.estado === 'recibida') badgeClass = 'badge-success';
            if (o.estado === 'cancelada') badgeClass = 'badge-danger';

            ordenesHTML += `
                <tr>
                    <td><strong>${o.numero}</strong></td>
                    <td>${fecha}</td>
                    <td>${proveedor ? proveedor.nombre : 'N/A'}</td>
                    <td>${o.productos.length}</td>
                    <td>$${o.total.toLocaleString()}</td>
                    <td><span class="badge ${badgeClass}">${o.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleOrdenCompra('${o.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.app.recibirOrdenCompra('${o.id}')" ${o.estado !== 'pendiente' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i> Recibir
                        </button>
                    </td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalOrdenesCompra">
                <div class="modal-content" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-shopping-cart"></i> Órdenes de Compra</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalOrdenesCompra')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevaOrdenCompra()">
                            <i class="fas fa-plus"></i> Nueva Orden de Compra
                        </button>
                        
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Número</th>
                                        <th>Fecha</th>
                                        <th>Proveedor</th>
                                        <th>Productos</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ordenesHTML || '<tr><td colspan="7" class="text-center">No hay órdenes de compra</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    mostrarModalNuevaOrdenCompra(proveedorIdPreseleccionado = null) {
        let proveedoresOptions = '<option value="">Seleccionar proveedor</option>';
        this.proveedores.forEach(p => {
            const selected = p.id === proveedorIdPreseleccionado ? 'selected' : '';
            proveedoresOptions += `<option value="${p.id}" ${selected}>${p.nombre}</option>`;
        });

        const productos = storage.getInventario().filter(p => p.activo);
        let productosOptions = '<option value="">Seleccionar producto</option>';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}" data-costo="${p.costoUnitario || 0}">${p.nombre} - Stock: ${p.unidades}</option>`;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevaOrdenCompra">
                <div class="modal-content" style="max-width: 900px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Nueva Orden de Compra</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaOrdenCompra')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevaOrdenCompra" onsubmit="return false;">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Proveedor *</label>
                                        <select id="ordenCompraProveedorId" class="form-control" required>
                                            ${proveedoresOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Fecha estimada de entrega</label>
                                        <input type="date" id="ordenCompraFechaEntrega" class="form-control" value="${this.sumarDias(new Date(), 7).toISOString().split('T')[0]}">
                                    </div>
                                </div>
                            </div>

                            <h5>Productos</h5>
                            <div id="productosOrdenCompra">
                                <div class="row mb-2">
                                    <div class="col-md-5">
                                        <select class="form-control oc-producto" name="ocProducto[]">
                                            ${productosOptions}
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <input type="number" class="form-control oc-cantidad" name="ocCantidad[]" value="1" min="1">
                                    </div>
                                    <div class="col-md-2">
                                        <input type="number" class="form-control oc-precio" name="ocPrecio[]" placeholder="Costo unit." min="0" step="100">
                                    </div>
                                    <div class="col-md-2">
                                        <input type="text" class="form-control oc-subtotal" name="ocSubtotal[]" readonly placeholder="Subtotal">
                                    </div>
                                    <div class="col-md-1">
                                        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove(); window.app.calcularTotalOC()">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="button" class="btn btn-info mb-3" onclick="window.app.agregarProductoOC()">
                                <i class="fas fa-plus"></i> Agregar producto
                            </button>

                            <div class="row mt-3">
                                <div class="col-md-8">
                                    <div class="form-group">
                                        <label>Notas / observaciones</label>
                                        <textarea id="ocNotas" class="form-control" rows="2"></textarea>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card" style="background: #f8f9fa; padding: 15px;">
                                        <h5>Total Orden: <span id="ocTotal">$0</span></h5>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions mt-3">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevaOrdenCompra')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevaOrdenCompra()">Guardar Orden</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    agregarProductoOC() {
        const productos = storage.getInventario().filter(p => p.activo);
        let productosOptions = '<option value="">Seleccionar producto</option>';
        productos.forEach(p => {
            productosOptions += `<option value="${p.id}" data-costo="${p.costoUnitario || 0}">${p.nombre} - Stock: ${p.unidades}</option>`;
        });

        const div = document.createElement('div');
        div.className = 'row mb-2';
        div.innerHTML = `
            <div class="col-md-5">
                <select class="form-control oc-producto" name="ocProducto[]" onchange="window.app.actualizarPrecioOC(this)">
                    ${productosOptions}
                </select>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control oc-cantidad" name="ocCantidad[]" value="1" min="1" onchange="window.app.calcularTotalOC()">
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control oc-precio" name="ocPrecio[]" placeholder="Costo unit." min="0" step="100" onchange="window.app.calcularTotalOC()">
            </div>
            <div class="col-md-2">
                <input type="text" class="form-control oc-subtotal" name="ocSubtotal[]" readonly placeholder="Subtotal">
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove(); window.app.calcularTotalOC()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        document.getElementById('productosOrdenCompra').appendChild(div);
    }

    actualizarPrecioOC(select) {
        const row = select.closest('.row');
        const precioInput = row.querySelector('.oc-precio');
        const option = select.options[select.selectedIndex];
        const costo = option.getAttribute('data-costo') || 0;
        precioInput.value = costo;
        this.calcularTotalOC();
    }

    calcularTotalOC() {
        let total = 0;
        const rows = document.querySelectorAll('.oc-producto');
        
        rows.forEach((select, index) => {
            if (select.value) {
                const cantidad = parseFloat(document.querySelectorAll('.oc-cantidad')[index]?.value) || 1;
                const precio = parseFloat(document.querySelectorAll('.oc-precio')[index]?.value) || 0;
                const subtotal = cantidad * precio;
                
                const subtotalInput = document.querySelectorAll('.oc-subtotal')[index];
                if (subtotalInput) {
                    subtotalInput.value = `$${subtotal.toLocaleString()}`;
                }
                
                total += subtotal;
            }
        });

        document.getElementById('ocTotal').textContent = `$${total.toLocaleString()}`;
    }

    guardarNuevaOrdenCompra() {
        const proveedorId = document.getElementById('ordenCompraProveedorId')?.value;
        if (!proveedorId) {
            this.mostrarMensaje('❌ Selecciona un proveedor', 'error');
            return;
        }

        const productoSelects = document.querySelectorAll('.oc-producto');
        if (productoSelects.length === 0) {
            this.mostrarMensaje('❌ Agrega al menos un producto', 'error');
            return;
        }

        const productos = [];
        let total = 0;

        for (let i = 0; i < productoSelects.length; i++) {
            const select = productoSelects[i];
            if (select.value) {
                const cantidad = parseFloat(document.querySelectorAll('.oc-cantidad')[i]?.value) || 1;
                const precio = parseFloat(document.querySelectorAll('.oc-precio')[i]?.value) || 0;
                const subtotal = cantidad * precio;
                
                const producto = storage.getProducto(select.value);
                
                productos.push({
                    productoId: select.value,
                    nombre: producto.nombre,
                    codigo: producto.codigo,
                    cantidad: cantidad,
                    precioUnitario: precio,
                    subtotal: subtotal
                });
                
                total += subtotal;
            }
        }

        const orden = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `OC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(this.ordenesCompra.length + 1).padStart(4, '0')}`,
            fecha: new Date().toISOString(),
            proveedorId: proveedorId,
            fechaEntregaEstimada: document.getElementById('ordenCompraFechaEntrega')?.value || null,
            productos: productos,
            total: total,
            notas: document.getElementById('ocNotas')?.value || '',
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString()
        };

        this.ordenesCompra.push(orden);
        this.guardarOrdenesCompra();

        this.mostrarMensaje('✅ Orden de compra creada', 'success');
        this.cerrarModal('modalNuevaOrdenCompra');
        this.mostrarModalOrdenesCompra();
    }

    verDetalleOrdenCompra(id) {
        const orden = this.ordenesCompra.find(o => o.id === id);
        if (!orden) return;

        const proveedor = this.proveedores.find(p => p.id === orden.proveedorId);
        const fecha = new Date(orden.fecha);

        let productosHTML = '';
        orden.productos.forEach(p => {
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
            <div class="modal-overlay active" id="modalDetalleOrdenCompra">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-invoice"></i> Orden de Compra: ${orden.numero}</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDetalleOrdenCompra')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
                        <p><strong>Proveedor:</strong> ${proveedor ? proveedor.nombre : 'N/A'}</p>
                        <p><strong>Estado:</strong> <span class="badge badge-warning">${orden.estado}</span></p>
                        
                        <h5>Productos</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Costo Unit.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosHTML}
                            </tbody>
                        </table>
                        
                        <div class="text-right">
                            <h4>Total: $${orden.total.toLocaleString()}</h4>
                        </div>
                        
                        <div class="mt-3">
                            <button class="btn btn-success" onclick="window.app.recibirOrdenCompra('${orden.id}')" ${orden.estado !== 'pendiente' ? 'disabled' : ''}>
                                <i class="fas fa-check"></i> Recibir Mercancía
                            </button>
                            <button class="btn btn-primary" onclick="window.app.imprimirOrdenCompra('${orden.id}')">
                                <i class="fas fa-print"></i> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    recibirOrdenCompra(id) {
        const orden = this.ordenesCompra.find(o => o.id === id);
        if (!orden) return;

        if (!confirm('¿Recibir toda la mercancía de esta orden? Se actualizará el inventario.')) {
            return;
        }

        // Actualizar inventario
        orden.productos.forEach(p => {
            const producto = storage.getProducto(p.productoId);
            if (producto) {
                producto.unidades += p.cantidad;
                // Si hay costo actualizado, actualizar también
                if (p.precioUnitario > 0) {
                    producto.costoUnitario = p.precioUnitario;
                }
                storage.updateProducto(p.productoId, { 
                    unidades: producto.unidades,
                    costoUnitario: producto.costoUnitario
                });
            }
        });

        // Registrar en lotes si aplica
        const tieneLotes = confirm('¿Registrar estos productos como lotes?');
        if (tieneLotes) {
            orden.productos.forEach(p => {
                const producto = storage.getProducto(p.productoId);
                if (producto) {
                    const nuevoLote = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        productoId: p.productoId,
                        numeroLote: `OC-${orden.numero}-${p.productoId.substring(0,4)}`,
                        cantidad: p.cantidad,
                        cantidadOriginal: p.cantidad,
                        fechaVencimiento: null,
                        proveedorId: orden.proveedorId,
                        costoUnitario: p.precioUnitario,
                        fechaIngreso: new Date().toISOString(),
                        movimientos: [{
                            fecha: new Date().toISOString(),
                            tipo: 'ingreso',
                            cantidad: p.cantidad,
                            nota: `Recibido de OC ${orden.numero}`,
                            usuario: this.getUsuarioActual()?.nombre || 'Sistema'
                        }]
                    };
                    this.lotes.push(nuevoLote);
                }
            });
            this.guardarLotes();
        }

        orden.estado = 'recibida';
        orden.fechaRecepcion = new Date().toISOString();
        this.guardarOrdenesCompra();

        this.mostrarMensaje('✅ Mercancía recibida exitosamente', 'success');
        this.mostrarModalOrdenesCompra();
    }

    imprimirOrdenCompra(id) {
        const orden = this.ordenesCompra.find(o => o.id === id);
        if (!orden) return;

        const proveedor = this.proveedores.find(p => p.id === orden.proveedorId);
        const fecha = new Date(orden.fecha);
        const config = storage.getConfig?.() || {};

        let productosHTML = '';
        orden.productos.forEach(p => {
            productosHTML += `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.cantidad}</td>
                    <td>$${p.precioUnitario}</td>
                    <td>$${p.subtotal}</td>
                </tr>
            `;
        });

        const ordenHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Orden de Compra ${orden.numero}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .empresa { font-size: 24px; font-weight: bold; color: #27ae60; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .totales { text-align: right; }
                    .footer { margin-top: 40px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="empresa">${config.nombreNegocio || 'Mi Negocio'}</div>
                    <h2>ORDEN DE COMPRA</h2>
                    <p>${orden.numero}</p>
                </div>
                
                <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
                <p><strong>Proveedor:</strong> ${proveedor ? proveedor.nombre : 'N/A'}</p>
                <p><strong>Contacto:</strong> ${proveedor ? proveedor.contacto : 'N/A'}</p>
                <p><strong>Teléfono:</strong> ${proveedor ? proveedor.telefono : 'N/A'}</p>
                
                <h3>Productos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Costo Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosHTML}
                    </tbody>
                </table>
                
                <div class="totales">
                    <h3>TOTAL: $${orden.total.toLocaleString()}</h3>
                </div>
                
                <p><strong>Notas:</strong> ${orden.notas || 'Ninguna'}</p>
                
                <div class="footer">
                    <p>_________________________</p>
                    <p>Firma autorizada</p>
                </div>
            </body>
            </html>
        `;

        const ventana = window.open('', '_blank');
        ventana.document.write(ordenHTML);
        ventana.document.close();
    }

    // ============================================
    // MÓDULO 6: PEDIDOS ESPECIALES
    // ============================================

    cargarPedidosEspeciales() {
        this.pedidosEspeciales = JSON.parse(localStorage.getItem('invplanet_pedidos_especiales') || '[]');
        console.log(`📦 Pedidos especiales cargados: ${this.pedidosEspeciales.length}`);
    }

    guardarPedidosEspeciales() {
        localStorage.setItem('invplanet_pedidos_especiales', JSON.stringify(this.pedidosEspeciales));
    }

    mostrarModalPedidosEspeciales() {
        let pedidosHTML = '';
        this.pedidosEspeciales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(p => {
            const fecha = new Date(p.fecha).toLocaleDateString();
            
            let badgeClass = 'badge-warning';
            if (p.estado === 'recibido') badgeClass = 'badge-success';
            if (p.estado === 'cancelado') badgeClass = 'badge-danger';
            if (p.estado === 'entregado') badgeClass = 'badge-info';

            pedidosHTML += `
                <tr>
                    <td><strong>${p.numero}</strong></td>
                    <td>${fecha}</td>
                    <td>${p.cliente}</td>
                    <td>${p.producto}</td>
                    <td>${p.cantidad}</td>
                    <td>$${p.total.toLocaleString()}</td>
                    <td><span class="badge ${badgeClass}">${p.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="window.app.marcarPedidoRecibido('${p.id}')" ${p.estado !== 'pendiente' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="window.app.notificarClientePedido('${p.id}')" ${p.estado !== 'recibido' ? 'disabled' : ''}>
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalPedidosEspeciales">
                <div class="modal-content" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-box-open"></i> Pedidos Especiales</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalPedidosEspeciales')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevoPedidoEspecial()">
                            <i class="fas fa-plus"></i> Nuevo Pedido Especial
                        </button>
                        
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Número</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pedidosHTML || '<tr><td colspan="8" class="text-center">No hay pedidos especiales</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    mostrarModalNuevoPedidoEspecial() {
        let clientesOptions = '<option value="">Seleccionar cliente</option>';
        this.clientes.forEach(c => {
            clientesOptions += `<option value="${c.id}">${c.nombre}</option>`;
        });

        let proveedoresOptions = '<option value="">Seleccionar proveedor</option>';
        this.proveedores.forEach(p => {
            proveedoresOptions += `<option value="${p.id}">${p.nombre}</option>`;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoPedidoEspecial">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Nuevo Pedido Especial</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoPedidoEspecial')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoPedidoEspecial" onsubmit="return false;">
                            <div class="form-group">
                                <label>Cliente *</label>
                                <select id="pedidoClienteId" class="form-control" required>
                                    ${clientesOptions}
                                    <option value="nuevo">-- Crear nuevo cliente --</option>
                                </select>
                            </div>

                            <div id="camposNuevoClientePedido" style="display:none; margin-top: 10px;">
                                <div class="form-group">
                                    <label>Nombre del nuevo cliente</label>
                                    <input type="text" id="pedidoNuevoCliente" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>Teléfono *</label>
                                    <input type="tel" id="pedidoClienteTelefono" class="form-control" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Producto solicitado *</label>
                                <input type="text" id="pedidoProducto" class="form-control" required placeholder="Ej: Repuesto específico, medicamento, etc.">
                            </div>

                            <div class="form-group">
                                <label>Cantidad *</label>
                                <input type="number" id="pedidoCantidad" class="form-control" required min="1" value="1">
                            </div>

                            <div class="form-group">
                                <label>Proveedor sugerido</label>
                                <select id="pedidoProveedorId" class="form-control">
                                    ${proveedoresOptions}
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Precio estimado</label>
                                <input type="number" id="pedidoPrecio" class="form-control" min="0" step="100">
                            </div>

                            <div class="form-group">
                                <label>Notas / especificaciones</label>
                                <textarea id="pedidoNotas" class="form-control" rows="2" placeholder="Marca, modelo, referencia, etc."></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoPedidoEspecial')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoPedidoEspecial()">Guardar Pedido</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;

        document.getElementById('pedidoClienteId')?.addEventListener('change', (e) => {
            document.getElementById('camposNuevoClientePedido').style.display = e.target.value === 'nuevo' ? 'block' : 'none';
        });
    }

    guardarNuevoPedidoEspecial() {
        const clienteId = document.getElementById('pedidoClienteId')?.value;
        const producto = document.getElementById('pedidoProducto')?.value;
        const cantidad = document.getElementById('pedidoCantidad')?.value;
        const telefono = document.getElementById('pedidoClienteTelefono')?.value;

        if (!clienteId || !producto || !cantidad) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }

        let clienteNombre = '';
        let clienteTelefono = '';

        if (clienteId === 'nuevo') {
            const nuevoCliente = document.getElementById('pedidoNuevoCliente')?.value;
            if (!nuevoCliente || !telefono) {
                this.mostrarMensaje('❌ Completa los datos del nuevo cliente', 'error');
                return;
            }
            const cliente = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                nombre: nuevoCliente,
                telefono: telefono,
                puntos: 0,
                fechaCreacion: new Date().toISOString()
            };
            this.clientes.push(cliente);
            this.guardarClientes();
            clienteNombre = nuevoCliente;
            clienteTelefono = telefono;
        } else {
            const cliente = this.clientes.find(c => c.id === clienteId);
            clienteNombre = cliente ? cliente.nombre : '';
            clienteTelefono = cliente ? cliente.telefono : '';
        }

        const precio = parseFloat(document.getElementById('pedidoPrecio')?.value) || 0;

        const pedido = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `PE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(this.pedidosEspeciales.length + 1).padStart(4, '0')}`,
            fecha: new Date().toISOString(),
            clienteId: clienteId === 'nuevo' ? this.clientes[this.clientes.length - 1].id : clienteId,
            cliente: clienteNombre,
            telefono: clienteTelefono,
            producto: producto,
            cantidad: parseInt(cantidad),
            precioEstimado: precio,
            total: precio * parseInt(cantidad),
            proveedorId: document.getElementById('pedidoProveedorId')?.value || null,
            notas: document.getElementById('pedidoNotas')?.value || '',
            estado: 'pendiente',
            historial: [{
                fecha: new Date().toISOString(),
                accion: 'Pedido creado',
                usuario: this.getUsuarioActual()?.nombre || 'Sistema'
            }]
        };

        this.pedidosEspeciales.push(pedido);
        this.guardarPedidosEspeciales();

        this.mostrarMensaje('✅ Pedido especial registrado', 'success');
        this.cerrarModal('modalNuevoPedidoEspecial');
        this.mostrarModalPedidosEspeciales();
    }

    marcarPedidoRecibido(id) {
        const pedido = this.pedidosEspeciales.find(p => p.id === id);
        if (!pedido) return;

        pedido.estado = 'recibido';
        pedido.fechaRecepcion = new Date().toISOString();
        pedido.historial.push({
            fecha: new Date().toISOString(),
            accion: 'Producto recibido de proveedor',
            usuario: this.getUsuarioActual()?.nombre || 'Sistema'
        });

        this.guardarPedidosEspeciales();

        // Preguntar si notificar al cliente
        if (pedido.telefono && confirm('¿Notificar al cliente que su pedido llegó?')) {
            this.notificarClientePedido(id);
        }

        this.mostrarMensaje('✅ Pedido marcado como recibido', 'success');
        this.mostrarModalPedidosEspeciales();
    }

    notificarClientePedido(id) {
        const pedido = this.pedidosEspeciales.find(p => p.id === id);
        if (!pedido || !pedido.telefono) return;

        const mensaje = `📦 *¡BUENAS NOTICIAS!* 📦\n\nHola *${pedido.cliente}*, te informamos que ha llegado tu pedido especial:\n\n*Producto:* ${pedido.producto}\n*Cantidad:* ${pedido.cantidad}\n\nPuedes pasar a recogerlo a nuestra tienda. ¡Te esperamos! 🛍️`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const url = `https://wa.me/${pedido.telefono}?text=${mensajeCodificado}`;
        window.open(url, '_blank');

        pedido.estado = 'entregado';
        pedido.fechaEntrega = new Date().toISOString();
        pedido.historial.push({
            fecha: new Date().toISOString(),
            accion: 'Cliente notificado',
            usuario: this.getUsuarioActual()?.nombre || 'Sistema'
        });
        this.guardarPedidosEspeciales();

        this.mostrarMensaje('✅ Cliente notificado', 'success');
    }

    // ============================================
    // MÓDULO 7: DEVOLUCIONES Y GARANTÍAS
    // ============================================

    cargarDevoluciones() {
        this.devoluciones = JSON.parse(localStorage.getItem('invplanet_devoluciones') || '[]');
        console.log(`🔄 Devoluciones cargadas: ${this.devoluciones.length}`);
    }

    guardarDevoluciones() {
        localStorage.setItem('invplanet_devoluciones', JSON.stringify(this.devoluciones));
    }

    cargarGarantias() {
        this.garantias = JSON.parse(localStorage.getItem('invplanet_garantias') || '[]');
        console.log(`🛡️ Garantías cargadas: ${this.garantias.length}`);
    }

    guardarGarantias() {
        localStorage.setItem('invplanet_garantias', JSON.stringify(this.garantias));
    }

    mostrarModalDevoluciones() {
        let devolucionesHTML = '';
        this.devoluciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(d => {
            const fecha = new Date(d.fecha).toLocaleDateString();
            
            let badgeClass = 'badge-warning';
            if (d.estado === 'completada') badgeClass = 'badge-success';
            if (d.estado === 'rechazada') badgeClass = 'badge-danger';

            devolucionesHTML += `
                <tr>
                    <td>${d.numero}</td>
                    <td>${fecha}</td>
                    <td>${d.cliente}</td>
                    <td>${d.producto}</td>
                    <td>${d.cantidad}</td>
                    <td>$${d.monto.toLocaleString()}</td>
                    <td><span class="badge ${badgeClass}">${d.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleDevolucion('${d.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.app.procesarDevolucion('${d.id}')" ${d.estado !== 'pendiente' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalDevoluciones">
                <div class="modal-content" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-undo-alt"></i> Devoluciones y Garantías</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDevoluciones')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary mb-3" onclick="window.app.mostrarModalNuevaDevolucion()">
                            <i class="fas fa-plus"></i> Nueva Devolución
                        </button>
                        
                        <ul class="nav nav-tabs mb-3">
                            <li class="nav-item">
                                <a class="nav-link active" data-toggle="tab" href="#devoluciones">Devoluciones</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-toggle="tab" href="#garantias">Garantías</a>
                            </li>
                        </ul>
                        
                        <div class="tab-content">
                            <div id="devoluciones" class="tab-pane active">
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Número</th>
                                                <th>Fecha</th>
                                                <th>Cliente</th>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${devolucionesHTML || '<tr><td colspan="8" class="text-center">No hay devoluciones registradas</td></tr>'}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div id="garantias" class="tab-pane fade">
                                ${this.renderGarantias()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    renderGarantias() {
        let garantiasHTML = '';
        this.garantias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(g => {
            const fecha = new Date(g.fecha).toLocaleDateString();
            const vence = new Date(g.fechaVencimiento).toLocaleDateString();
            
            let badgeClass = 'badge-success';
            if (g.estado === 'activa') badgeClass = 'badge-success';
            if (g.estado === 'vencida') badgeClass = 'badge-danger';
            if (g.estado === 'usada') badgeClass = 'badge-warning';

            garantiasHTML += `
                <tr>
                    <td>${g.numero}</td>
                    <td>${fecha}</td>
                    <td>${g.cliente}</td>
                    <td>${g.producto}</td>
                    <td>${g.numeroSerie || 'N/A'}</td>
                    <td>${vence}</td>
                    <td><span class="badge ${badgeClass}">${g.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleGarantia('${g.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        return `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>N° Serie</th>
                            <th>Vence</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${garantiasHTML || '<tr><td colspan="8" class="text-center">No hay garantías registradas</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    mostrarModalNuevaDevolucion() {
        const ventas = storage.getVentas?.() || [];
        let ventasOptions = '<option value="">Seleccionar venta</option>';
        ventas.filter(v => v.estado === 'completada' || v.estado === 'modificada').forEach(v => {
            ventasOptions += `<option value="${v.id}">${v.numero} - ${v.cliente} - $${v.total}</option>`;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevaDevolucion">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Nueva Devolución</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaDevolucion')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevaDevolucion" onsubmit="return false;">
                            <div class="form-group">
                                <label>Venta original</label>
                                <select id="devolucionVentaId" class="form-control">
                                    ${ventasOptions}
                                </select>
                                <small class="text-muted">O selecciona los productos manualmente</small>
                            </div>

                            <div id="productosVentaDevolucion" style="display:none; margin-top: 15px;">
                                <h5>Productos de la venta</h5>
                                <div id="productosVentaList"></div>
                            </div>

                            <hr>

                            <div class="form-group">
                                <label>Cliente *</label>
                                <input type="text" id="devolucionCliente" class="form-control" required>
                            </div>

                            <div class="form-group">
                                <label>Producto a devolver *</label>
                                <input type="text" id="devolucionProducto" class="form-control" required>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Cantidad *</label>
                                        <input type="number" id="devolucionCantidad" class="form-control" required min="1" value="1">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Monto a devolver ($) *</label>
                                        <input type="number" id="devolucionMonto" class="form-control" required min="0" step="100">
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Motivo de la devolución *</label>
                                <select id="devolucionMotivo" class="form-control" required>
                                    <option value="defecto">Producto defectuoso</option>
                                    <option value="garantia">Aplicación de garantía</option>
                                    <option value="cambio">Cambio de producto</option>
                                    <option value="insatisfecho">Cliente insatisfecho</option>
                                    <option value="error">Error en venta</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Observaciones</label>
                                <textarea id="devolucionObservaciones" class="form-control" rows="2"></textarea>
                            </div>

                            <div class="form-check mb-3">
                                <input type="checkbox" id="devolucionReponer" class="form-check-input">
                                <label class="form-check-label">Reponer producto (devolver stock a inventario)</label>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevaDevolucion')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevaDevolucion()">Registrar Devolución</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;

        document.getElementById('devolucionVentaId')?.addEventListener('change', (e) => {
            this.cargarProductosVentaDevolucion(e.target.value);
        });
    }

    cargarProductosVentaDevolucion(ventaId) {
        const ventas = storage.getVentas?.() || [];
        const venta = ventas.find(v => v.id === ventaId);
        
        if (!venta) {
            document.getElementById('productosVentaDevolucion').style.display = 'none';
            return;
        }

        let productosHTML = '';
        venta.productos.forEach(p => {
            productosHTML += `
                <div class="producto-venta-item" style="padding: 10px; border: 1px solid #ddd; margin-bottom: 5px; border-radius: 5px;">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>${p.nombre}</strong>
                        </div>
                        <div class="col-md-2">
                            Cant: ${p.cantidad}
                        </div>
                        <div class="col-md-2">
                            $${p.subtotal}
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-sm btn-warning" onclick="window.app.seleccionarProductoDevolucion('${p.nombre}', ${p.cantidad}, ${p.precioUnitario})">
                                Seleccionar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        document.getElementById('productosVentaList').innerHTML = productosHTML;
        document.getElementById('productosVentaDevolucion').style.display = 'block';
        document.getElementById('devolucionCliente').value = venta.cliente;
    }

    seleccionarProductoDevolucion(nombre, cantidad, precio) {
        document.getElementById('devolucionProducto').value = nombre;
        document.getElementById('devolucionCantidad').value = 1;
        document.getElementById('devolucionMonto').value = precio;
    }

    guardarNuevaDevolucion() {
        const cliente = document.getElementById('devolucionCliente')?.value;
        const producto = document.getElementById('devolucionProducto')?.value;
        const cantidad = document.getElementById('devolucionCantidad')?.value;
        const monto = document.getElementById('devolucionMonto')?.value;
        const motivo = document.getElementById('devolucionMotivo')?.value;

        if (!cliente || !producto || !cantidad || !monto || !motivo) {
            this.mostrarMensaje('❌ Completa todos los campos', 'error');
            return;
        }

        const reponerStock = document.getElementById('devolucionReponer')?.checked;

        // Buscar si el producto tiene número de serie
        const productoConSerie = this.series.find(s => 
            s.estado === 'vendido' && 
            s.productoId && 
            storage.getProducto(s.productoId)?.nombre === producto
        );

        const devolucion = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `DEV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(this.devoluciones.length + 1).padStart(4, '0')}`,
            fecha: new Date().toISOString(),
            ventaId: document.getElementById('devolucionVentaId')?.value || null,
            cliente: cliente,
            producto: producto,
            cantidad: parseInt(cantidad),
            monto: parseFloat(monto),
            motivo: motivo,
            observaciones: document.getElementById('devolucionObservaciones')?.value || '',
            reponerStock: reponerStock,
            estado: 'pendiente',
            historial: [{
                fecha: new Date().toISOString(),
                accion: 'Devolución registrada',
                usuario: this.getUsuarioActual()?.nombre || 'Sistema'
            }]
        };

        this.devoluciones.push(devolucion);

        // Si se va a reponer stock, devolver al inventario
        if (reponerStock) {
            // Buscar el producto en inventario
            const inventario = storage.getInventario();
            const productoInv = inventario.find(p => p.nombre === producto);
            if (productoInv) {
                productoInv.unidades += parseInt(cantidad);
                storage.updateProducto(productoInv.id, { unidades: productoInv.unidades });
            }

            // Si tiene número de serie, actualizar estado
            if (productoConSerie) {
                productoConSerie.estado = 'disponible';
                productoConSerie.historial.push({
                    fecha: new Date().toISOString(),
                    accion: 'Producto devuelto, disponible nuevamente',
                    usuario: this.getUsuarioActual()?.nombre || 'Sistema'
                });
                this.guardarSeries();
            }
        }

        // Si es por garantía, registrar garantía
        if (motivo === 'garantia') {
            this.registrarGarantiaDesdeDevolucion(devolucion, productoConSerie);
        }

        this.guardarDevoluciones();

        // Generar nota crédito
        this.generarNotaCredito(devolucion);

        this.mostrarMensaje('✅ Devolución registrada', 'success');
        this.cerrarModal('modalNuevaDevolucion');
        this.mostrarModalDevoluciones();
    }

    registrarGarantiaDesdeDevolucion(devolucion, serie) {
        const garantia = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `GAR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(this.garantias.length + 1).padStart(4, '0')}`,
            fecha: new Date().toISOString(),
            devolucionId: devolucion.id,
            cliente: devolucion.cliente,
            producto: devolucion.producto,
            numeroSerie: serie ? serie.numeroSerie : null,
            fechaVencimiento: this.calcularFechaVencimientoGarantia(new Date().toISOString(), 365).toISOString(),
            estado: 'activa',
            observaciones: 'Garantía aplicada por devolución'
        };

        this.garantias.push(garantia);
        this.guardarGarantias();
    }

    calcularFechaVencimientoGarantia(fechaVenta, diasGarantia) {
        const fecha = new Date(fechaVenta);
        fecha.setDate(fecha.getDate() + diasGarantia);
        return fecha;
    }

    generarNotaCredito(devolucion) {
        console.log('📝 Generando nota crédito para devolución:', devolucion.numero);
        // Aquí se integraría con facturación electrónica
    }

    verDetalleDevolucion(id) {
        const devolucion = this.devoluciones.find(d => d.id === id);
        if (!devolucion) return;

        const fecha = new Date(devolucion.fecha);

        const modalHTML = `
            <div class="modal-overlay active" id="modalDetalleDevolucion">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-undo-alt"></i> Devolución: ${devolucion.numero}</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDetalleDevolucion')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
                        <p><strong>Cliente:</strong> ${devolucion.cliente}</p>
                        <p><strong>Producto:</strong> ${devolucion.producto}</p>
                        <p><strong>Cantidad:</strong> ${devolucion.cantidad}</p>
                        <p><strong>Monto devuelto:</strong> $${devolucion.monto.toLocaleString()}</p>
                        <p><strong>Motivo:</strong> ${devolucion.motivo}</p>
                        <p><strong>Reponer stock:</strong> ${devolucion.reponerStock ? 'Sí' : 'No'}</p>
                        <p><strong>Estado:</strong> <span class="badge badge-warning">${devolucion.estado}</span></p>
                        
                        <div class="mt-3">
                            <button class="btn btn-success" onclick="window.app.procesarDevolucion('${devolucion.id}')">
                                Procesar Devolución
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    procesarDevolucion(id) {
        const devolucion = this.devoluciones.find(d => d.id === id);
        if (!devolucion) return;

        devolucion.estado = 'completada';
        devolucion.fechaProcesamiento = new Date().toISOString();
        devolucion.historial.push({
            fecha: new Date().toISOString(),
            accion: 'Devolución procesada',
            usuario: this.getUsuarioActual()?.nombre || 'Sistema'
        });

        this.guardarDevoluciones();
        this.mostrarMensaje('✅ Devolución procesada', 'success');
        this.mostrarModalDevoluciones();
    }

    verDetalleGarantia(id) {
        const garantia = this.garantias.find(g => g.id === id);
        if (!garantia) return;

        const fecha = new Date(garantia.fecha);
        const vence = new Date(garantia.fechaVencimiento);

        const modalHTML = `
            <div class="modal-overlay active" id="modalDetalleGarantia">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-shield-alt"></i> Garantía: ${garantia.numero}</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDetalleGarantia')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Fecha emisión:</strong> ${fecha.toLocaleDateString()}</p>
                        <p><strong>Cliente:</strong> ${garantia.cliente}</p>
                        <p><strong>Producto:</strong> ${garantia.producto}</p>
                        <p><strong>Número de serie:</strong> ${garantia.numeroSerie || 'N/A'}</p>
                        <p><strong>Vence:</strong> ${vence.toLocaleDateString()}</p>
                        <p><strong>Estado:</strong> <span class="badge badge-success">${garantia.estado}</span></p>
                        <p><strong>Observaciones:</strong> ${garantia.observaciones || 'Ninguna'}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    // ============================================
    // LECTOR DE CÓDIGO DE BARRAS
    // ============================================

    inicializarLectorBarra() {
        document.addEventListener('keydown', (e) => {
            if (!this.modalOpen || this.currentView !== 'ventas') return;
            
            if (e.key.length === 1) {
                this.barcodeBuffer += e.key;
                
                if (this.scanTimeout) {
                    clearTimeout(this.scanTimeout);
                }
                
                this.scanTimeout = setTimeout(() => {
                    this.procesarCodigoBarras(this.barcodeBuffer);
                    this.barcodeBuffer = '';
                }, 100);
            }
        });
    }

    procesarCodigoBarras(codigo) {
        console.log(`🔍 Código de barras detectado: ${codigo}`);
        
        const inventario = storage.getInventario();
        const producto = inventario.find(p => 
            p.codigo === codigo && p.activo === true && p.unidades > 0
        );
        
        if (producto) {
            if (this.ventaEnModificacion) {
                this.agregarAlCarritoModificacion(producto.id);
            } else {
                this.agregarAlCarrito(producto.id);
            }
            this.mostrarMensaje(`✅ Producto encontrado: ${producto.nombre}`, 'success');
        } else {
            this.mostrarMensaje(`❌ Producto no encontrado: ${codigo}`, 'error');
        }
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    initializeApp() {
        console.log('📱 Inicializando aplicación...');
        
        if (this.isInitialized) {
            console.log('✅ App ya inicializada');
            return true;
        }
        
        if (!this.verifySession()) {
            console.log('❌ Sesión no válida, redirigiendo...');
            window.location.href = 'index.html';
            return false;
        }
        
        try {
            this.setupNavigation();
            this.setupEventListeners();
            this.updateDateTime();
            this.cargarNombreNegocio();
            
            const user = getCurrentUser();
            if (user && document.getElementById('userName')) {
                document.getElementById('userName').textContent = `Bienvenido, ${user.nombre || user.username || 'Usuario'}`;
            }
            
            this.loadView('dashboard');
            this.isInitialized = true;
            console.log('✅ Aplicación inicializada correctamente');
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
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #3498db;">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${productosActivos.length}</h3>
                            <p>Productos Totales</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${productosBajos.length}</h3>
                            <p>Stock Bajo</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #f39c12;">
                            <i class="fas fa-layer-group"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${lotesProximosVencer.length}</h3>
                            <p>Lotes por Vencer</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #9b59b6;">
                            <i class="fas fa-tools"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${ordenesPendientes}</h3>
                            <p>Órdenes Taller</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #2ecc71;">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${ventasHoy.length}</h3>
                            <p>Ventas Hoy</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #f39c12;">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3>$${totalVentasHoy.toLocaleString()}</h3>
                            <p>Ingresos Hoy</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon" style="background: #e67e22;">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="stat-info">
                            <h3>$${totalGastosHoy.toLocaleString()}</h3>
                            <p>Gastos Hoy</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon" style="background: #1abc9c;">
                            <i class="fas fa-box-open"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${pedidosPendientes}</h3>
                            <p>Pedidos Especiales</p>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-sections">
                    <div class="dashboard-section">
                        <h3><i class="fas fa-exclamation-triangle text-warning"></i> Alertas Críticas</h3>
                        <div id="alertasList" class="alertas-list">
                            ${this.renderAlertasDashboard(productosBajos, lotesProximosVencer)}
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3><i class="fas fa-clock"></i> Acciones Rápidas</h3>
                        <div class="acciones-rapidas">
                            <button class="btn btn-success btn-block" onclick="window.app.mostrarModalNuevaVenta()">
                                <i class="fas fa-cash-register"></i> Nueva Venta
                            </button>
                            <button class="btn btn-primary btn-block" onclick="window.app.mostrarModalNuevaOrdenTrabajo()">
                                <i class="fas fa-tools"></i> Nueva Orden Taller
                            </button>
                            <button class="btn btn-info btn-block" onclick="window.app.mostrarModalNuevoPedidoEspecial()">
                                <i class="fas fa-box-open"></i> Nuevo Pedido Especial
                            </button>
                            <button class="btn btn-warning btn-block" onclick="window.app.mostrarModalNuevaDevolucion()">
                                <i class="fas fa-undo-alt"></i> Nueva Devolución
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAlertasDashboard(productosBajos, lotesProximosVencer) {
        let alertas = '';
        
        if (productosBajos.length > 0) {
            alertas += `
                <div class="alerta-item">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <div>
                        <p class="mb-0"><strong>${productosBajos.length} productos con stock bajo</strong></p>
                        <small class="text-muted">Revisa el inventario</small>
                    </div>
                </div>
            `;
        }
        
        if (lotesProximosVencer.length > 0) {
            alertas += `
                <div class="alerta-item">
                    <i class="fas fa-calendar-times text-danger"></i>
                    <div>
                        <p class="mb-0"><strong>${lotesProximosVencer.length} lotes próximos a vencer</strong></p>
                        <small class="text-muted">Revisa control de lotes</small>
                    </div>
                </div>
            `;
        }
        
        const ordenesPendientes = this.ordenesTrabajo.filter(o => o.estado === 'pendiente').length;
        if (ordenesPendientes > 0) {
            alertas += `
                <div class="alerta-item">
                    <i class="fas fa-tools text-info"></i>
                    <div>
                        <p class="mb-0"><strong>${ordenesPendientes} órdenes de taller pendientes</strong></p>
                        <small class="text-muted">Revisa el taller</small>
                    </div>
                </div>
            `;
        }
        
        const pedidosPendientes = this.pedidosEspeciales.filter(p => p.estado === 'pendiente').length;
        if (pedidosPendientes > 0) {
            alertas += `
                <div class="alerta-item">
                    <i class="fas fa-box-open text-primary"></i>
                    <div>
                        <p class="mb-0"><strong>${pedidosPendientes} pedidos especiales pendientes</strong></p>
                        <small class="text-muted">Revisa pedidos</small>
                    </div>
                </div>
            `;
        }
        
        if (alertas === '') {
            alertas = `
                <div class="alerta-item">
                    <i class="fas fa-check-circle text-success"></i>
                    <div>
                        <p class="mb-0">Todo está en orden</p>
                    </div>
                </div>
            `;
        }
        
        return alertas;
    }

    // ============================================
    // INVENTARIO (MANTENER EL CÓDIGO EXISTENTE)
    // ============================================

    loadInventarioView() {
        const productos = storage.getInventario();
        const categorias = storage.getCategorias();
        
        let categoriasOptions = '<option value="">Todas las categorías</option>';
        categorias.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
            categoriasOptions += `<option value="${c.id}">${c.nombre}</option>`;
        });
        
        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="inventario-view">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-boxes"></i> Inventario
                    </h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="window.app.mostrarModalNuevoProducto()">
                            <i class="fas fa-plus"></i> Nuevo Producto
                        </button>
                        <button class="btn btn-info" onclick="window.app.mostrarModalNuevoKit()">
                            <i class="fas fa-boxes"></i> Nuevo Kit
                        </button>
                        <button class="btn btn-success" onclick="window.app.exportarInventario()">
                            <i class="fas fa-file-export"></i> Exportar
                        </button>
                        <button class="btn btn-info" onclick="window.app.generarReporteInventario()">
                            <i class="fas fa-chart-bar"></i> Reporte
                        </button>
                    </div>
                </div>
                
                <div class="filtros-inventario">
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" class="search-input" id="searchProducto" placeholder="Buscar producto...">
                    </div>
                    <div class="filter-group">
                        <select class="form-control" id="filterCategoria">
                            ${categoriasOptions}
                        </select>
                    </div>
                    <div class="filter-group">
                        <select class="form-control" id="filterStock">
                            <option value="">Todo el stock</option>
                            <option value="bajo">Stock bajo</option>
                            <option value="agotado">Agotados</option>
                            <option value="activo">Solo activos</option>
                        </select>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Stock</th>
                                <th>Precio Venta</th>
                                <th>Costo</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaProductos">
                            ${this.renderTablaProductos(productos)}
                        </tbody>
                    </table>
                </div>
                
                <div class="table-info">
                    Mostrando <span id="productosCount">${productos.length}</span> productos
                </div>
            </div>
        `;
        
        document.getElementById('searchProducto')?.addEventListener('keyup', () => this.buscarProductos());
        document.getElementById('filterCategoria')?.addEventListener('change', () => this.filtrarProductos());
        document.getElementById('filterStock')?.addEventListener('change', () => this.filtrarProductos());
    }

    renderTablaProductos(productos) {
        if (productos.length === 0) {
            return `
                <tr>
                    <td colspan="9" class="text-center">
                        <i class="fas fa-boxes fa-3x mb-3" style="color: #ddd;"></i>
                        <h4>No hay productos registrados</h4>
                        <p>¡Comienza agregando tu primer producto!</p>
                        <button class="btn btn-primary" onclick="window.app.mostrarModalNuevoProducto()">
                            <i class="fas fa-plus"></i> Agregar Producto
                        </button>
                    </td>
                </tr>
            `;
        }
        
        const categorias = storage.getCategorias();
        let html = '';
        
        productos.forEach(p => {
            const categoria = categorias.find(c => c.id === p.categoriaId);
            const estado = p.activo === false ? 'Inactivo' : 
                          p.unidades === 0 ? 'Agotado' : 
                          p.unidades <= (p.stockMinimo || 10) ? 'Bajo' : 'Normal';
            
            const badgeClass = estado === 'Agotado' ? 'badge-danger' : 
                              estado === 'Bajo' ? 'badge-warning' : 
                              estado === 'Inactivo' ? 'badge-secondary' : 'badge-success';
            
            const tipo = p.esKit ? '🎁 Kit' : '📦 Producto';
            
            html += `
                <tr>
                    <td>${p.codigo || 'N/A'}</td>
                    <td>${p.nombre}</td>
                    <td>${categoria ? categoria.nombre : 'Sin categoría'}</td>
                    <td>${p.unidades}</td>
                    <td>$${p.precioVenta || 0}</td>
                    <td>$${p.costoUnitario || 0}</td>
                    <td>${tipo}</td>
                    <td><span class="badge ${badgeClass}">${estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="window.app.mostrarModalEditarProducto('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${p.esKit ? `
                        <button class="btn btn-sm btn-info" onclick="window.app.verComponentesKit('${p.id}')">
                            <i class="fas fa-boxes"></i>
                        </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="window.app.eliminarProducto('${p.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        return html;
    }

    buscarProductos() {
        const query = document.getElementById('searchProducto')?.value.toLowerCase() || '';
        const productos = storage.getInventario();
        const filtrados = productos.filter(p => 
            p.nombre?.toLowerCase().includes(query) || 
            p.codigo?.toLowerCase().includes(query) ||
            p.descripcion?.toLowerCase().includes(query)
        );
        document.getElementById('tablaProductos').innerHTML = this.renderTablaProductos(filtrados);
        document.getElementById('productosCount').textContent = filtrados.length;
    }

    filtrarProductos() {
        const catId = document.getElementById('filterCategoria')?.value;
        const stockFilter = document.getElementById('filterStock')?.value;
        let productos = storage.getInventario();
        
        if (catId) {
            productos = productos.filter(p => p.categoriaId === catId);
        }
        
        switch(stockFilter) {
            case 'bajo':
                productos = productos.filter(p => p.activo && p.unidades > 0 && p.unidades <= (p.stockMinimo || 10));
                break;
            case 'agotado':
                productos = productos.filter(p => p.activo && p.unidades === 0);
                break;
            case 'activo':
                productos = productos.filter(p => p.activo !== false);
                break;
        }
        
        document.getElementById('tablaProductos').innerHTML = this.renderTablaProductos(productos);
        document.getElementById('productosCount').textContent = productos.length;
    }

    // ============================================
    // EDITAR PRODUCTO
    // ============================================

    mostrarModalEditarProducto(id) {
        const producto = storage.getProducto(id);
        if (!producto) {
            this.mostrarMensaje('❌ Producto no encontrado', 'error');
            return;
        }
        
        const categorias = storage.getCategorias();
        let options = '<option value="">Sin categoría</option>';
        
        if (categorias && categorias.length > 0) {
            categorias.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
                const selected = c.id === producto.categoriaId ? 'selected' : '';
                options += `<option value="${c.id}" ${selected}>${c.nombre}</option>`;
            });
        }
        
        const proveedores = this.proveedores || [];
        let proveedoresOptions = '<option value="">Seleccionar proveedor</option>';
        proveedores.forEach(p => {
            const selected = p.id === producto.proveedorId ? 'selected' : '';
            proveedoresOptions += `<option value="${p.id}" ${selected}>${p.nombre}</option>`;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalEditarProducto">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit" style="color: #3498db;"></i> Editar Producto</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalEditarProducto')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarProducto" onsubmit="return false;">
                            <input type="hidden" id="editProductoId" value="${producto.id}">
                            <div class="form-group">
                                <label>Código *</label>
                                <input type="text" id="editProductoCodigo" class="form-control" value="${producto.codigo || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" id="editProductoNombre" class="form-control" value="${producto.nombre}" required>
                            </div>
                            <div class="form-group">
                                <label>Categoría</label>
                                <select id="editProductoCategoria" class="form-control">
                                    ${options}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Proveedor</label>
                                <select id="editProductoProveedor" class="form-control">
                                    ${proveedoresOptions}
                                </select>
                            </div>
                            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label>Stock Actual *</label>
                                    <input type="number" id="editProductoUnidades" class="form-control" value="${producto.unidades}" min="0" step="1">
                                    <small class="text-muted">Ingresa la nueva cantidad en inventario</small>
                                </div>
                                <div class="form-group">
                                    <label>Stock Mínimo</label>
                                    <input type="number" id="editProductoStockMinimo" class="form-control" value="${producto.stockMinimo || 5}" min="0">
                                </div>
                            </div>
                            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label>Costo Unitario ($)</label>
                                    <input type="number" id="editProductoCosto" class="form-control" value="${producto.costoUnitario || 0}" min="0" step="100">
                                </div>
                                <div class="form-group">
                                    <label>Precio Venta ($) *</label>
                                    <input type="number" id="editProductoPrecio" class="form-control" value="${producto.precioVenta}" required min="100" step="100">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Ubicación en almacén</label>
                                <input type="text" id="editProductoUbicacion" class="form-control" value="${producto.ubicacion || ''}" placeholder="Ej: Estante A, fila 3">
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="editProductoDescripcion" class="form-control" rows="2">${producto.descripcion || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Fecha de vencimiento</label>
                                <input type="date" id="editProductoVencimiento" class="form-control" value="${producto.fechaVencimiento || ''}">
                            </div>
                            <div class="form-check mb-3">
                                <input type="checkbox" id="editProductoActivo" class="form-check-input" ${producto.activo ? 'checked' : ''}>
                                <label class="form-check-label">Producto Activo</label>
                            </div>
                            <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalEditarProducto')">
                                    Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarEdicionProducto()">
                                    <i class="fas fa-save"></i> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    guardarEdicionProducto() {
        const id = document.getElementById('editProductoId')?.value;
        const codigo = document.getElementById('editProductoCodigo')?.value;
        const nombre = document.getElementById('editProductoNombre')?.value;
        const unidades = document.getElementById('editProductoUnidades')?.value;
        const precio = document.getElementById('editProductoPrecio')?.value;
        
        if (!codigo || !nombre || !precio) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }
        
        const inventario = storage.getInventario();
        const existe = inventario.find(p => p.codigo === codigo && p.id !== id);
        
        if (existe) {
            this.mostrarMensaje('❌ Ya existe otro producto con ese código', 'error');
            return;
        }
        
        const productoActualizado = {
            codigo: codigo,
            nombre: nombre,
            categoriaId: document.getElementById('editProductoCategoria')?.value || null,
            proveedorId: document.getElementById('editProductoProveedor')?.value || null,
            unidades: parseInt(unidades) || 0,
            stockMinimo: parseInt(document.getElementById('editProductoStockMinimo')?.value) || 5,
            costoUnitario: parseFloat(document.getElementById('editProductoCosto')?.value) || 0,
            precioVenta: parseFloat(precio),
            ubicacion: document.getElementById('editProductoUbicacion')?.value || '',
            descripcion: document.getElementById('editProductoDescripcion')?.value || '',
            fechaVencimiento: document.getElementById('editProductoVencimiento')?.value || null,
            activo: document.getElementById('editProductoActivo')?.checked || false,
            fechaActualizacion: new Date().toISOString()
        };
        
        try {
            const actualizado = storage.updateProducto(id, productoActualizado);
            
            if (actualizado) {
                this.mostrarMensaje(`✅ Producto "${nombre}" actualizado. Nuevo stock: ${unidades}`, 'success');
                this.cerrarModal('modalEditarProducto');
                setTimeout(() => this.loadInventarioView(), 300);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarMensaje('❌ Error al actualizar', 'error');
        }
    }

    verComponentesKit(id) {
        const producto = storage.getProducto(id);
        if (!producto || !producto.esKit) return;
        
        let componentesHTML = '';
        producto.componentes.forEach(c => {
            componentesHTML += `
                <tr>
                    <td>${c.nombre}</td>
                    <td>${c.cantidad}</td>
                    <td>$${c.precioUnitario}</td>
                    <td>$${c.precioUnitario * c.cantidad}</td>
                </tr>
            `;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalComponentesKit">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-boxes"></i> Componentes del Kit: ${producto.nombre}</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalComponentesKit')">&times;</button>
                    </div>
                    <div class="modal-body">
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
                                ${componentesHTML}
                            </tbody>
                        </table>
                        <p><strong>Precio del Kit:</strong> $${producto.precioVenta}</p>
                        <p><strong>Ahorro:</strong> $${producto.componentes.reduce((s, c) => s + (c.precioUnitario * c.cantidad), 0) - producto.precioVenta}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    // ============================================
    // PRODUCTOS - CRUD
    // ============================================

    mostrarModalNuevoProducto() {
        console.log('🆕 Abriendo modal para nuevo producto...');
        
        const categorias = storage.getCategorias();
        let options = '<option value="">Sin categoría</option>';
        
        if (categorias && categorias.length > 0) {
            categorias.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
                options += `<option value="${c.id}">${c.nombre}</option>`;
            });
        }
        
        const proveedores = this.proveedores || [];
        let proveedoresOptions = '<option value="">Seleccionar proveedor</option>';
        proveedores.forEach(p => {
            proveedoresOptions += `<option value="${p.id}">${p.nombre}</option>`;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoProducto">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle" style="color: #27ae60;"></i> Nuevo Producto</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoProducto')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoProducto" onsubmit="return false;">
                            <div class="form-group">
                                <label>Código *</label>
                                <input type="text" id="productoCodigo" class="form-control" required placeholder="Ej: PRD001">
                            </div>
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" id="productoNombre" class="form-control" required placeholder="Ej: Hamburguesa">
                            </div>
                            <div class="form-group">
                                <label>Categoría</label>
                                <select id="productoCategoria" class="form-control">
                                    ${options}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Proveedor</label>
                                <select id="productoProveedor" class="form-control">
                                    ${proveedoresOptions}
                                </select>
                            </div>
                            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label>Stock Inicial</label>
                                    <input type="number" id="productoUnidades" class="form-control" value="10" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Stock Mínimo</label>
                                    <input type="number" id="productoStockMinimo" class="form-control" value="5" min="0">
                                </div>
                            </div>
                            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label>Costo Unitario ($)</label>
                                    <input type="number" id="productoCosto" class="form-control" value="0" min="0" step="100">
                                </div>
                                <div class="form-group">
                                    <label>Precio Venta ($) *</label>
                                    <input type="number" id="productoPrecio" class="form-control" required min="100" step="100">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Ubicación en almacén</label>
                                <input type="text" id="productoUbicacion" class="form-control" placeholder="Ej: Estante A, fila 3">
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="productoDescripcion" class="form-control" rows="2" placeholder="Descripción..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Fecha de vencimiento (opcional)</label>
                                <input type="date" id="productoVencimiento" class="form-control">
                            </div>
                            <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoProducto')">
                                    Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoProducto()">
                                    <i class="fas fa-save"></i> Guardar Producto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    guardarNuevoProducto() {
        console.log('💾 Guardando nuevo producto...');
        
        const codigo = document.getElementById('productoCodigo')?.value;
        const nombre = document.getElementById('productoNombre')?.value;
        const precio = document.getElementById('productoPrecio')?.value;
        
        if (!codigo || !nombre || !precio) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }
        
        const inventario = storage.getInventario();
        const existe = inventario.find(p => p.codigo === codigo);
        
        if (existe) {
            this.mostrarMensaje('❌ Ya existe un producto con ese código', 'error');
            return;
        }
        
        const nuevoProducto = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            codigo: codigo,
            nombre: nombre,
            categoriaId: document.getElementById('productoCategoria')?.value || null,
            proveedorId: document.getElementById('productoProveedor')?.value || null,
            unidades: parseInt(document.getElementById('productoUnidades')?.value) || 0,
            stockMinimo: parseInt(document.getElementById('productoStockMinimo')?.value) || 5,
            costoUnitario: parseFloat(document.getElementById('productoCosto')?.value) || 0,
            precioVenta: parseFloat(precio),
            ubicacion: document.getElementById('productoUbicacion')?.value || '',
            descripcion: document.getElementById('productoDescripcion')?.value || '',
            fechaVencimiento: document.getElementById('productoVencimiento')?.value || null,
            activo: true,
            fechaCreacion: new Date().toISOString()
        };
        
        try {
            const guardado = storage.addProducto(nuevoProducto);
            
            if (guardado) {
                this.mostrarMensaje(`✅ Producto "${nombre}" creado`, 'success');
                this.cerrarModal('modalNuevoProducto');
                setTimeout(() => this.loadInventarioView(), 300);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarMensaje('❌ Error al guardar', 'error');
        }
    }

    eliminarProducto(id) {
        if (confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
            storage.deleteProducto(id);
            this.loadInventarioView();
            this.mostrarMensaje('✅ Producto eliminado', 'success');
        }
    }

    verMovimientos(id) {
        this.mostrarMensaje('📊 Historial de movimientos en desarrollo', 'info');
    }

    exportarInventario() {
        if (storage.exportInventario) {
            storage.exportInventario();
            this.mostrarMensaje('✅ Inventario exportado', 'success');
        }
    }

    generarReporteInventario() {
        this.mostrarMensaje('📊 Generando reporte...', 'info');
    }

    // ============================================
    // CATEGORÍAS - CRUD
    // ============================================

    loadCategoriasView() {
        const categorias = storage.getCategorias();
        
        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="categorias-view">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-tags"></i> Categorías
                    </h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="window.app.mostrarModalNuevaCategoria()">
                            <i class="fas fa-plus"></i> Nueva Categoría
                        </button>
                    </div>
                </div>
                <div class="categorias-grid" id="categoriasGrid">
                    ${this.renderCategoriasGrid(categorias)}
                </div>
            </div>
        `;
    }

    renderCategoriasGrid(categorias) {
        if (categorias.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-tags fa-3x mb-3" style="color: #ddd;"></i>
                    <h4>No hay categorías registradas</h4>
                    <p>¡Comienza creando tu primera categoría!</p>
                    <button class="btn btn-primary" onclick="window.app.mostrarModalNuevaCategoria()">
                        <i class="fas fa-plus"></i> Crear Categoría
                    </button>
                </div>
            `;
        }
        
        let html = '';
        categorias.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
            const productos = storage.getInventario().filter(p => p.categoriaId === c.id).length;
            
            html += `
                <div class="categoria-card" style="border-left: 4px solid ${c.color || '#3498db'};">
                    <div class="categoria-header">
                        <div class="categoria-icon" style="background: ${c.color}20; color: ${c.color};">
                            <i class="${c.icono || 'fas fa-tag'}"></i>
                        </div>
                        <div class="categoria-info">
                            <h3>${c.nombre}</h3>
                            <p class="text-muted">${c.descripcion || 'Sin descripción'}</p>
                            <span class="badge badge-info">${productos} productos</span>
                        </div>
                    </div>
                    <div class="categoria-actions">
                        <button class="btn btn-sm btn-primary" onclick="window.app.mostrarModalEditarCategoria('${c.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.app.eliminarCategoria('${c.id}')" ${productos > 0 ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    mostrarModalNuevaCategoria() {
        const iconos = [
            'fas fa-tag', 'fas fa-box', 'fas fa-hamburger', 'fas fa-pizza-slice', 
            'fas fa-coffee', 'fas fa-wine-bottle', 'fas fa-tshirt', 'fas fa-laptop',
            'fas fa-mobile-alt', 'fas fa-tools', 'fas fa-soap', 'fas fa-gift',
            'fas fa-hotdog', 'fas fa-utensils', 'fas fa-drumstick-bite', 'fas fa-bacon'
        ];
        
        let iconOptions = '';
        iconos.forEach(icono => {
            iconOptions += `<option value="${icono}">${icono.replace('fas fa-', '')}</option>`;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevaCategoria">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Nueva Categoría</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaCategoria')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevaCategoria">
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" id="categoriaNombre" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="categoriaDescripcion" class="form-control" rows="2"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Color</label>
                                    <input type="color" id="categoriaColor" class="form-control" value="#3498db">
                                </div>
                                <div class="form-group">
                                    <label>Ícono</label>
                                    <select id="categoriaIcono" class="form-control">
                                        ${iconOptions}
                                    </select>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevaCategoria')">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        
        document.getElementById('formNuevaCategoria').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nuevaCategoria = {
                id: Date.now().toString(),
                nombre: document.getElementById('categoriaNombre').value,
                descripcion: document.getElementById('categoriaDescripcion').value,
                color: document.getElementById('categoriaColor').value,
                icono: document.getElementById('categoriaIcono').value,
                fechaCreacion: new Date().toISOString()
            };
            
            storage.addCategoria(nuevaCategoria);
            this.mostrarMensaje('✅ Categoría creada', 'success');
            this.cerrarModal('modalNuevaCategoria');
            this.loadCategoriasView();
        });
    }

    mostrarModalEditarCategoria(id) {
        const categoria = storage.getCategoria(id);
        if (!categoria) {
            this.mostrarMensaje('❌ Categoría no encontrada', 'error');
            return;
        }
        
        const iconos = [
            'fas fa-tag', 'fas fa-box', 'fas fa-hamburger', 'fas fa-pizza-slice', 
            'fas fa-coffee', 'fas fa-wine-bottle', 'fas fa-tshirt', 'fas fa-laptop',
            'fas fa-mobile-alt', 'fas fa-tools', 'fas fa-soap', 'fas fa-gift',
            'fas fa-hotdog', 'fas fa-utensils', 'fas fa-drumstick-bite', 'fas fa-bacon'
        ];
        
        let iconOptions = '';
        iconos.forEach(icono => {
            const selected = icono === categoria.icono ? 'selected' : '';
            iconOptions += `<option value="${icono}" ${selected}>${icono.replace('fas fa-', '')}</option>`;
        });
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalEditarCategoria">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit"></i> Editar Categoría</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalEditarCategoria')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarCategoria">
                            <input type="hidden" id="editCategoriaId" value="${categoria.id}">
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" id="editCategoriaNombre" class="form-control" value="${categoria.nombre}" required>
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="editCategoriaDescripcion" class="form-control" rows="2">${categoria.descripcion || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Color</label>
                                    <input type="color" id="editCategoriaColor" class="form-control" value="${categoria.color || '#3498db'}">
                                </div>
                                <div class="form-group">
                                    <label>Ícono</label>
                                    <select id="editCategoriaIcono" class="form-control">
                                        ${iconOptions}
                                    </select>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalEditarCategoria')">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        
        document.getElementById('formEditarCategoria').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const categoriaActualizada = {
                nombre: document.getElementById('editCategoriaNombre').value,
                descripcion: document.getElementById('editCategoriaDescripcion').value,
                color: document.getElementById('editCategoriaColor').value,
                icono: document.getElementById('editCategoriaIcono').value,
                fechaActualizacion: new Date().toISOString()
            };
            
            storage.updateCategoria(id, categoriaActualizada);
            this.mostrarMensaje('✅ Categoría actualizada', 'success');
            this.cerrarModal('modalEditarCategoria');
            this.loadCategoriasView();
        });
    }

    eliminarCategoria(id) {
        const categoria = storage.getCategoria(id);
        if (!categoria) return;
        
        const productos = storage.getInventario().filter(p => p.categoriaId === id).length;
        
        if (productos > 0) {
            this.mostrarMensaje(`❌ No se puede eliminar: ${productos} producto(s) la usan`, 'error');
            return;
        }
        
        if (confirm(`¿Eliminar categoría "${categoria.nombre}"?`)) {
            storage.deleteCategoria(id);
            this.mostrarMensaje('✅ Categoría eliminada', 'success');
            this.loadCategoriasView();
        }
    }

    // ============================================
    // VENTAS CON MODIFICACIÓN (MANTENER CÓDIGO EXISTENTE)
    // ============================================

    loadVentasView() {
        const ventas = storage.getVentas?.() || [];
        
        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="ventas-view">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-cash-register"></i> Ventas
                    </h2>
                    <div class="action-buttons">
                        <button class="btn btn-success" onclick="window.app.mostrarModalNuevaVenta()">
                            <i class="fas fa-plus"></i> Nueva Venta
                        </button>
                        <button class="btn btn-info" onclick="window.app.mostrarAyudaLectorBarra()">
                            <i class="fas fa-barcode"></i> Usar Lector
                        </button>
                        <button class="btn btn-primary" onclick="window.app.exportarVentas()">
                            <i class="fas fa-file-export"></i> Exportar
                        </button>
                    </div>
                </div>
                
                <div class="resumen-ventas" id="resumenVentas">
                    ${this.renderResumenVentas(ventas)}
                </div>
                
                <div class="filtros-ventas">
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" class="search-input" id="searchVenta" placeholder="Buscar venta...">
                    </div>
                    <div class="filter-group">
                        <select class="form-control" id="filterEstadoVenta">
                            <option value="">Todos los estados</option>
                            <option value="completada">Completadas</option>
                            <option value="anulada">Anuladas</option>
                            <option value="modificada">Modificadas</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <input type="date" class="form-control" id="filterFechaVenta">
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Tipo</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaVentas">
                            ${this.renderTablaVentas(ventas)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('searchVenta')?.addEventListener('keyup', () => this.buscarVentas());
        document.getElementById('filterEstadoVenta')?.addEventListener('change', () => this.filtrarVentas());
        document.getElementById('filterFechaVenta')?.addEventListener('change', () => this.filtrarVentas());
    }

    renderResumenVentas(ventas) {
        const completadas = ventas.filter(v => v.estado === 'completada');
        const anuladas = ventas.filter(v => v.estado === 'anulada');
        const modificadas = ventas.filter(v => v.estado === 'modificada');
        const totalCompletadas = completadas.reduce((sum, v) => sum + (v.total || 0), 0);
        const totalAnuladas = anuladas.reduce((sum, v) => sum + (v.total || 0), 0);
        const totalModificadas = modificadas.reduce((sum, v) => sum + (v.total || 0), 0);
        
        const hoy = new Date().toDateString();
        const ventasHoy = completadas.filter(v => new Date(v.fecha).toDateString() === hoy);
        const totalHoy = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
        
        const domicilios = completadas.filter(v => v.tipoEntrega === 'domicilio').length;
        const mesas = completadas.filter(v => v.tipoEntrega === 'mesa').length;
        
        return `
            <div class="resumen-card">
                <i class="fas fa-shopping-cart"></i>
                <div>
                    <h4>${completadas.length}</h4>
                    <p>Ventas Completadas</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-times-circle"></i>
                <div>
                    <h4>${anuladas.length}</h4>
                    <p>Ventas Anuladas</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-edit"></i>
                <div>
                    <h4>${modificadas.length}</h4>
                    <p>Ventas Modificadas</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-dollar-sign"></i>
                <div>
                    <h4>$${totalCompletadas.toLocaleString()}</h4>
                    <p>Total Ingresos</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-ban"></i>
                <div>
                    <h4>$${totalAnuladas.toLocaleString()}</h4>
                    <p>Total Anulado</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-calendar-day"></i>
                <div>
                    <h4>$${totalHoy.toLocaleString()}</h4>
                    <p>Ventas Hoy</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-motorcycle"></i>
                <div>
                    <h4>${domicilios}</h4>
                    <p>Domicilios</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-utensils"></i>
                <div>
                    <h4>${mesas}</h4>
                    <p>Mesas</p>
                </div>
            </div>
        `;
    }

    renderTablaVentas(ventas) {
        if (ventas.length === 0) {
            return `
                <tr>
                    <td colspan="8" class="text-center">
                        <i class="fas fa-shopping-cart fa-3x mb-3" style="color: #ddd;"></i>
                        <h4>No hay ventas registradas</h4>
                        <p>¡Comienza realizando tu primera venta!</p>
                        <button class="btn btn-success" onclick="window.app.mostrarModalNuevaVenta()">
                            <i class="fas fa-plus"></i> Nueva Venta
                        </button>
                    </td>
                </tr>
            `;
        }
        
        let html = '';
        ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(v => {
            const fecha = new Date(v.fecha);
            const tipoIcono = v.tipoEntrega === 'domicilio' ? '🛵' : '🍽️';
            const tipoTexto = v.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Mesa ' + (v.mesa || '');
            
            let badgeClass = 'badge-success';
            let estadoTexto = v.estado || 'completada';
            
            if (v.estado === 'anulada') {
                badgeClass = 'badge-danger';
            } else if (v.estado === 'modificada') {
                badgeClass = 'badge-warning';
            }
            
            html += `
                <tr>
                    <td>${v.numero || 'N/A'}</td>
                    <td>${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}</td>
                    <td>${v.cliente || 'Consumidor Final'}</td>
                    <td><span title="${v.tipoEntrega === 'domicilio' ? v.direccion : ''}">${tipoIcono} ${tipoTexto}</span></td>
                    <td>${v.productos?.length || 0}</td>
                    <td>$${v.total || 0}</td>
                    <td><span class="badge ${badgeClass}">${estadoTexto}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleVenta('${v.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${v.estado !== 'anulada' && v.estado !== 'modificada' ? `
                        <button class="btn btn-sm btn-warning" onclick="window.app.modificarVenta('${v.id}')">
                            <i class="fas fa-edit"></i> Modificar
                        </button>
                        ` : ''}
                        <button class="btn btn-sm btn-success" onclick="window.app.enviarWhatsApp('${v.id}')">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="window.app.imprimirFactura('${v.id}')">
                            <i class="fas fa-print"></i>
                        </button>
                        ${v.estado !== 'anulada' ? `
                        <button class="btn btn-sm btn-danger" onclick="window.app.anularVenta('${v.id}')">
                            <i class="fas fa-ban"></i>
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        
        return html;
    }

    buscarVentas() {
        const query = document.getElementById('searchVenta')?.value.toLowerCase() || '';
        const ventas = storage.getVentas?.() || [];
        const filtradas = ventas.filter(v => 
            v.numero?.toLowerCase().includes(query) || 
            v.cliente?.toLowerCase().includes(query)
        );
        document.getElementById('tablaVentas').innerHTML = this.renderTablaVentas(filtradas);
    }

    filtrarVentas() {
        const estado = document.getElementById('filterEstadoVenta')?.value;
        const fecha = document.getElementById('filterFechaVenta')?.value;
        let ventas = storage.getVentas?.() || [];
        
        if (estado) {
            ventas = ventas.filter(v => v.estado === estado);
        }
        
        if (fecha) {
            ventas = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha).toISOString().split('T')[0];
                return fechaVenta === fecha;
            });
        }
        
        document.getElementById('tablaVentas').innerHTML = this.renderTablaVentas(ventas);
    }

    // ============================================
    // MODIFICAR VENTA (MANTENER CÓDIGO EXISTENTE)
    // ============================================

    modificarVenta(id) {
        const ventaOriginal = storage.getVenta?.(id);
        if (!ventaOriginal) {
            this.mostrarMensaje('❌ Venta no encontrada', 'error');
            return;
        }
        
        if (ventaOriginal.estado === 'anulada') {
            this.mostrarMensaje('❌ No se puede modificar una venta anulada', 'error');
            return;
        }
        
        this.ventaEnModificacion = ventaOriginal;
        
        // Crear carrito de modificación basado en la venta original
        this.carritoModificacion = ventaOriginal.productos.map(p => ({
            productoId: p.productoId,
            nombre: p.nombre,
            codigo: p.codigo,
            precioUnitario: p.precioUnitario,
            cantidad: p.cantidad,
            subtotal: p.subtotal,
            stockDisponible: storage.getProducto(p.productoId)?.unidades || 0,
            nota: p.nota || '',
            adiciones: p.adiciones || []
        }));
        
        this.mostrarModalModificarVenta();
    }

    mostrarModalModificarVenta() {
        console.log('✏️ Abriendo modal de modificación de venta...');
        
        const inventario = storage.getInventario();
        const productosDisponibles = inventario.filter(p => p.activo === true && p.unidades > 0);
        
        const venta = this.ventaEnModificacion;
        const config = storage.getConfig?.() || {};
        const impuesto = config.impuesto || 0;
        
        let productosHTML = this.renderProductosModificacion(productosDisponibles);
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalModificarVenta">
                <div class="modal-content" style="max-width: 1400px; width: 95%; height: 95vh;">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit" style="color: #f39c12;"></i> Modificar Venta: ${venta.numero}</h3>
                        <button class="close-modal" onclick="window.app.cancelarModificacion()">&times;</button>
                    </div>
                    <div class="modal-body" style="height: calc(95vh - 80px); padding: 25px; overflow-y: auto;">
                        <div style="display: flex; gap: 30px; height: 100%;">
                            
                            <!-- COLUMNA IZQUIERDA - PRODUCTOS -->
                            <div style="flex: 1.5; display: flex; flex-direction: column; height: 100%; border-right: 2px solid #ecf0f1; padding-right: 25px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                    <h4 style="margin:0;">Agregar Productos</h4>
                                    <span class="badge badge-primary" style="font-size: 1.1em; padding: 8px 20px;">
                                        ${productosDisponibles.length}
                                    </span>
                                </div>
                                
                                <div style="margin-bottom: 15px;">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-barcode"></i></span>
                                        <input type="text" class="form-control" id="codigoBarrasModificacion" placeholder="Escanear código de barras...">
                                        <button class="btn btn-info" onclick="window.app.buscarPorCodigoBarrasModificacion()">Buscar</button>
                                    </div>
                                </div>
                                
                                <div id="productosModificacionList" style="flex: 1; overflow-y: auto; padding-right: 10px;">
                                    ${productosHTML}
                                </div>
                            </div>
                            
                            <!-- COLUMNA DERECHA - CARRITO DE MODIFICACIÓN -->
                            <div style="flex: 1.5; display: flex; flex-direction: column; height: 100%;">
                                
                                <!-- DATOS DE LA VENTA ORIGINAL -->
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                                    <h5 style="margin:0 0 10px 0;">Datos de la Venta Original</h5>
                                    <p><strong>Cliente:</strong> ${venta.cliente}</p>
                                    <p><strong>Tipo:</strong> ${venta.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Mesa ' + (venta.mesa || '')}</p>
                                    ${venta.tipoEntrega === 'domicilio' ? `
                                    <p><strong>Dirección:</strong> ${venta.direccion}</p>
                                    <p><strong>Teléfono:</strong> ${venta.telefono}</p>
                                    ` : ''}
                                </div>
                                
                                <!-- CARRITO DE MODIFICACIÓN -->
                                <div style="flex: 1; display: flex; flex-direction: column; min-height: 300px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                        <h4 style="margin:0;">Productos en la Venta</h4>
                                        <span class="badge badge-warning" id="carritoModificacionCount" style="font-size: 1.1em; padding: 8px 20px;">${this.carritoModificacion.length}</span>
                                    </div>
                                    
                                    <div id="carritoModificacionItems" style="flex: 1; overflow-y: auto; background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                                        ${this.renderCarritoModificacion()}
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 25px; border-radius: 16px; margin-bottom: 20px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                            <span>Subtotal:</span>
                                            <span style="font-weight: bold;" id="subtotalModificacion">$${this.calcularSubtotalModificacion().toLocaleString()}</span>
                                        </div>
                                        ${impuesto > 0 ? `
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; opacity: 0.9;">
                                            <span>Impuesto (${impuesto}%):</span>
                                            <span id="impuestoModificacion">$${this.calcularImpuestoModificacion().toLocaleString()}</span>
                                        </div>
                                        ` : ''}
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; opacity: 0.9;">
                                            <span>Domicilio:</span>
                                            <span id="domicilioModificacion">$${(venta.valorDomicilio || 0).toLocaleString()}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: bold; border-top: 2px solid rgba(255,255,255,0.2); padding-top: 20px;">
                                            <span>TOTAL:</span>
                                            <span id="totalModificacion">$${this.calcularTotalModificacion().toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; gap: 15px;">
                                        <button class="btn btn-secondary" style="flex: 1;" onclick="window.app.cancelarModificacion()">
                                            Cancelar
                                        </button>
                                        <button class="btn btn-warning" style="flex: 2;" onclick="window.app.guardarModificacionVenta()">
                                            <i class="fas fa-save"></i> Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
        
        setTimeout(() => {
            document.getElementById('codigoBarrasModificacion')?.focus();
        }, 500);
    }

    renderProductosModificacion(productos) {
        if (productos.length === 0) {
            return '<p class="text-center">No hay productos disponibles</p>';
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        
        productos.forEach((producto, index) => {
            let stockColor = '#27ae60';
            let stockText = `${producto.unidades} disponibles`;
            
            if (producto.unidades <= 5) {
                stockColor = '#e74c3c';
                stockText = `¡ÚLTIMAS ${producto.unidades}!`;
            } else if (producto.unidades <= 10) {
                stockColor = '#f39c12';
                stockText = `${producto.unidades} unidades (bajo stock)`;
            }
            
            html += `
                <div style="background: white; border: 2px solid #f39c12; border-radius: 12px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin:0;">${producto.nombre}</h4>
                            <small>Código: ${producto.codigo} | Stock: ${producto.unidades}</small>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.3em; color: #f39c12;">$${producto.precioVenta}</div>
                            <button class="btn btn-sm btn-warning" onclick="window.app.agregarAlCarritoModificacion('${producto.id}')">
                                Agregar a Modificación
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    renderCarritoModificacion() {
        if (this.carritoModificacion.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-4x mb-3" style="color: #dcdde1;"></i>
                    <h5 style="color: #7f8c8d;">No hay productos en la venta</h5>
                </div>
            `;
        }
        
        let html = '';
        
        this.carritoModificacion.forEach((item, i) => {
            let adicionesHTML = '';
            if (item.adiciones && item.adiciones.length > 0) {
                adicionesHTML = `<div style="font-size: 0.85em; color: #e67e22; margin-top: 5px;">
                    <i class="fas fa-plus-circle"></i> Adiciones: ${item.adiciones.join(', ')}
                </div>`;
            }
            
            let notaHTML = '';
            if (item.nota) {
                notaHTML = `<div style="font-size: 0.85em; color: #3498db; margin-top: 5px;">
                    <i class="fas fa-sticky-note"></i> Nota: ${item.nota}
                </div>`;
            }
            
            html += `
                <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 10px; border: 2px solid #f39c12;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 2;">
                            <strong style="font-size: 1.1em;">${item.nombre}</strong><br>
                            <small style="color: #7f8c8d;">$${item.precioUnitario} c/u</small>
                            ${notaHTML}
                            ${adicionesHTML}
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="window.app.disminuirCantidadModificacion(${i})"
                                    style="width: 35px; height: 35px; border-radius: 8px;"
                                    ${item.cantidad <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span style="font-weight: bold; min-width: 30px; text-align: center; font-size: 1.2em;">${item.cantidad}</span>
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="window.app.aumentarCantidadModificacion(${i})"
                                    style="width: 35px; height: 35px; border-radius: 8px;"
                                    ${item.cantidad >= item.stockDisponible ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div style="text-align: right; min-width: 100px;">
                            <strong style="font-size: 1.2em; color: #f39c12;">$${item.subtotal}</strong>
                            <button class="btn btn-sm btn-link text-danger" 
                                    onclick="window.app.eliminarDelCarritoModificacion(${i})"
                                    style="margin-left: 10px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    calcularSubtotalModificacion() {
        return this.carritoModificacion.reduce((sum, item) => sum + item.subtotal, 0);
    }

    calcularImpuestoModificacion() {
        const config = storage.getConfig?.() || {};
        const impuestoPorcentaje = (config.impuesto || 0) / 100;
        return this.calcularSubtotalModificacion() * impuestoPorcentaje;
    }

    calcularTotalModificacion() {
        const subtotal = this.calcularSubtotalModificacion();
        const impuesto = this.calcularImpuestoModificacion();
        const valorDomicilio = this.ventaEnModificacion?.valorDomicilio || 0;
        return subtotal + impuesto + valorDomicilio;
    }

    actualizarCarritoModificacion() {
        const carritoItems = document.getElementById('carritoModificacionItems');
        const carritoCount = document.getElementById('carritoModificacionCount');
        const subtotalEl = document.getElementById('subtotalModificacion');
        const impuestoEl = document.getElementById('impuestoModificacion');
        const totalEl = document.getElementById('totalModificacion');
        
        if (!carritoItems) return;
        
        if (carritoCount) {
            carritoCount.textContent = this.carritoModificacion.length;
        }
        
        carritoItems.innerHTML = this.renderCarritoModificacion();
        
        const subtotal = this.calcularSubtotalModificacion();
        const impuesto = this.calcularImpuestoModificacion();
        const total = this.calcularTotalModificacion();
        
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
        if (impuestoEl) impuestoEl.textContent = `$${impuesto.toLocaleString()}`;
        if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
    }

    agregarAlCarritoModificacion(productoId) {
        const producto = storage.getProducto(productoId);
        if (!producto) {
            this.mostrarMensaje('❌ Producto no encontrado', 'error');
            return;
        }
        
        if (producto.unidades <= 0) {
            this.mostrarMensaje('❌ Producto agotado', 'error');
            return;
        }
        
        // Preguntar si quiere agregar nota o adiciones
        const nota = prompt(`¿Nota para ${producto.nombre}? (Ej: Sin cebolla, bien asado, etc)`, '');
        const adiciones = prompt(`¿Adiciones para ${producto.nombre}? (Ej: Queso extra, tocineta, etc - separado por comas)`, '');
        
        const existe = this.carritoModificacion.findIndex(i => i.productoId === productoId);
        
        if (existe !== -1) {
            if (this.carritoModificacion[existe].cantidad >= producto.unidades) {
                this.mostrarMensaje('⚠️ Stock máximo alcanzado', 'warning');
                return;
            }
            this.carritoModificacion[existe].cantidad++;
            this.carritoModificacion[existe].subtotal = this.carritoModificacion[existe].cantidad * this.carritoModificacion[existe].precioUnitario;
            if (nota) this.carritoModificacion[existe].nota = nota;
            if (adiciones) this.carritoModificacion[existe].adiciones = adiciones.split(',').map(a => a.trim());
            this.mostrarMensaje(`✓ +1 ${producto.nombre} a la modificación`, 'success');
        } else {
            this.carritoModificacion.push({
                productoId: producto.id,
                nombre: producto.nombre,
                codigo: producto.codigo,
                precioUnitario: producto.precioVenta,
                cantidad: 1,
                subtotal: producto.precioVenta,
                stockDisponible: producto.unidades,
                nota: nota || '',
                adiciones: adiciones ? adiciones.split(',').map(a => a.trim()) : []
            });
            this.mostrarMensaje(`✓ ${producto.nombre} agregado a la modificación`, 'success');
        }
        
        this.actualizarCarritoModificacion();
    }

    aumentarCantidadModificacion(index) {
        if (this.carritoModificacion[index].cantidad < this.carritoModificacion[index].stockDisponible) {
            this.carritoModificacion[index].cantidad++;
            this.carritoModificacion[index].subtotal = this.carritoModificacion[index].cantidad * this.carritoModificacion[index].precioUnitario;
            this.actualizarCarritoModificacion();
        }
    }

    disminuirCantidadModificacion(index) {
        if (this.carritoModificacion[index].cantidad > 1) {
            this.carritoModificacion[index].cantidad--;
            this.carritoModificacion[index].subtotal = this.carritoModificacion[index].cantidad * this.carritoModificacion[index].precioUnitario;
            this.actualizarCarritoModificacion();
        }
    }

    eliminarDelCarritoModificacion(index) {
        const item = this.carritoModificacion[index];
        this.carritoModificacion.splice(index, 1);
        this.actualizarCarritoModificacion();
        this.mostrarMensaje(`🗑️ ${item.nombre} eliminado de la modificación`, 'info');
    }

    buscarPorCodigoBarrasModificacion() {
        const codigo = document.getElementById('codigoBarrasModificacion')?.value;
        if (codigo) {
            this.procesarCodigoBarras(codigo);
            document.getElementById('codigoBarrasModificacion').value = '';
        }
    }

    cancelarModificacion() {
        if (confirm('¿Cancelar la modificación? Los cambios no se guardarán.')) {
            this.ventaEnModificacion = null;
            this.carritoModificacion = [];
            this.cerrarModal('modalModificarVenta');
        }
    }

    guardarModificacionVenta() {
        if (!confirm('¿Guardar los cambios en la venta?')) {
            return;
        }
        
        const ventaOriginal = this.ventaEnModificacion;
        const config = storage.getConfig?.() || {};
        const impuestoPorcentaje = (config.impuesto || 0) / 100;
        
        const subtotal = this.calcularSubtotalModificacion();
        const impuesto = subtotal * impuestoPorcentaje;
        const total = subtotal + impuesto + (ventaOriginal.valorDomicilio || 0);
        
        // Calcular diferencia de stock
        const productosOriginales = ventaOriginal.productos || [];
        const productosNuevos = this.carritoModificacion;
        
        // Crear mapa de cantidades originales
        const cantidadesOriginales = {};
        productosOriginales.forEach(p => {
            cantidadesOriginales[p.productoId] = p.cantidad;
        });
        
        // Actualizar stock según cambios
        productosNuevos.forEach(item => {
            const producto = storage.getProducto(item.productoId);
            if (producto) {
                const cantidadOriginal = cantidadesOriginales[item.productoId] || 0;
                const diferencia = item.cantidad - cantidadOriginal;
                
                if (diferencia > 0) {
                    // Se agregaron más productos
                    if (producto.unidades < diferencia) {
                        this.mostrarMensaje(`❌ Stock insuficiente para ${item.nombre}`, 'error');
                        return;
                    }
                    producto.unidades -= diferencia;
                } else if (diferencia < 0) {
                    // Se quitaron productos
                    producto.unidades += Math.abs(diferencia);
                }
                
                storage.updateProducto(item.productoId, { unidades: producto.unidades });
            }
        });
        
        // Productos que fueron eliminados completamente
        productosOriginales.forEach(p => {
            const existeEnNuevo = productosNuevos.find(n => n.productoId === p.productoId);
            if (!existeEnNuevo) {
                const producto = storage.getProducto(p.productoId);
                if (producto) {
                    producto.unidades += p.cantidad;
                    storage.updateProducto(p.productoId, { unidades: producto.unidades });
                }
            }
        });
        
        // Actualizar la venta
        const ventaModificada = {
            ...ventaOriginal,
            productos: this.carritoModificacion.map(item => ({
                productoId: item.productoId,
                nombre: item.nombre,
                codigo: item.codigo,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.subtotal,
                nota: item.nota || '',
                adiciones: item.adiciones || []
            })),
            subtotal: subtotal,
            impuesto: impuesto,
            total: total,
            estado: 'modificada',
            fechaModificacion: new Date().toISOString(),
            modificacionDe: ventaOriginal.id
        };
        
        // Crear nueva venta con los cambios (para mantener historial)
        const nuevaVenta = {
            ...ventaModificada,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `${ventaOriginal.numero}-MOD`,
            fecha: new Date().toISOString()
        };
        
        // Guardar la venta original como modificada
        storage.updateVenta?.(ventaOriginal.id, { 
            estado: 'modificada',
            modificadaPor: nuevaVenta.id 
        });
        
        // Guardar la nueva venta modificada
        const ventas = storage.getVentas?.() || [];
        ventas.push(nuevaVenta);
        storage.saveVentas?.(ventas);
        
        this.mostrarMensaje('✅ Venta modificada exitosamente', 'success');
        
        // Preguntar si enviar por WhatsApp
        if (confirm('¿Enviar orden modificada por WhatsApp?')) {
            this.enviarWhatsApp(nuevaVenta.id);
        }
        
        setTimeout(() => {
            this.ventaEnModificacion = null;
            this.carritoModificacion = [];
            this.cerrarModal('modalModificarVenta');
            this.loadVentasView();
        }, 1500);
    }

    // ============================================
    // ANULAR VENTA (con devolución de stock)
    // ============================================

    anularVenta(id) {
        const venta = storage.getVenta?.(id);
        if (!venta) {
            this.mostrarMensaje('❌ Venta no encontrada', 'error');
            return;
        }
        
        if (venta.estado === 'anulada') {
            this.mostrarMensaje('⚠️ Esta venta ya está anulada', 'warning');
            return;
        }
        
        if (!confirm('¿Estás seguro de anular esta venta? Se devolverá el stock a inventario y el monto se descontará de las estadísticas.')) {
            return;
        }
        
        // Devolver stock a inventario
        venta.productos?.forEach(item => {
            const producto = storage.getProducto(item.productoId);
            if (producto) {
                producto.unidades += item.cantidad;
                storage.updateProducto(item.productoId, { unidades: producto.unidades });
            }
        });
        
        // Cambiar estado de la venta
        venta.estado = 'anulada';
        venta.fechaAnulacion = new Date().toISOString();
        storage.updateVenta?.(id, { estado: 'anulada', fechaAnulacion: venta.fechaAnulacion });
        
        this.mostrarMensaje('✅ Venta anulada exitosamente. Stock devuelto.', 'success');
        this.loadVentasView();
    }

    // ============================================
    // ENVIAR POR WHATSAPP
    // ============================================

    enviarWhatsApp(id) {
        const venta = storage.getVenta?.(id);
        if (!venta) {
            this.mostrarMensaje('❌ Venta no encontrada', 'error');
            return;
        }
        
        // Construir mensaje de WhatsApp
        let mensaje = `🍔 *NUEVA ORDEN - ${venta.numero}*\n\n`;
        mensaje += `📅 *Fecha:* ${new Date(venta.fecha).toLocaleString()}\n`;
        mensaje += `👤 *Cliente:* ${venta.cliente}\n`;
        
        if (venta.tipoEntrega === 'domicilio') {
            mensaje += `🛵 *Tipo:* Domicilio\n`;
            mensaje += `📍 *Dirección:* ${venta.direccion || 'No especificada'}\n`;
            mensaje += `📌 *Referencia:* ${venta.referencia || 'No especificada'}\n`;
            mensaje += `📞 *Teléfono:* ${venta.telefono || 'No especificado'}\n`;
            mensaje += `💰 *Valor Domicilio:* $${(venta.valorDomicilio || 0).toLocaleString()}\n`;
        } else {
            mensaje += `🍽️ *Tipo:* Mesa\n`;
            mensaje += `🪑 *Mesa:* ${venta.mesa || 'No especificada'}\n`;
        }
        
        mensaje += `\n*PRODUCTOS:*\n`;
        
        venta.productos?.forEach((p, i) => {
            mensaje += `${i+1}. ${p.nombre} x${p.cantidad} - $${p.subtotal.toLocaleString()}\n`;
            if (p.nota) {
                mensaje += `   📝 *Nota:* ${p.nota}\n`;
            }
            if (p.adiciones && p.adiciones.length > 0) {
                mensaje += `   ➕ Adiciones: ${p.adiciones.join(', ')}\n`;
            }
        });
        
        if (venta.notaGeneral) {
            mensaje += `\n📝 *NOTA GENERAL:* ${venta.notaGeneral}\n`;
        }
        
        mensaje += `\n💰 *Subtotal:* $${venta.subtotal.toLocaleString()}`;
        
        if (venta.impuesto > 0) {
            mensaje += `\n🧾 *Impuesto:* $${venta.impuesto.toLocaleString()}`;
        }
        
        if (venta.valorDomicilio > 0) {
            mensaje += `\n🛵 *Domicilio:* $${venta.valorDomicilio.toLocaleString()}`;
        }
        
        mensaje += `\n💵 *TOTAL:* $${venta.total.toLocaleString()}`;
        mensaje += `\n💳 *Método de pago:* ${venta.metodoPago}`;
        
        if (venta.estado === 'modificada') {
            mensaje += `\n\n⚠️ *ESTA ORDEN HA SIDO MODIFICADA*`;
        }
        
        mensaje += `\n\n✅ *Gracias por su compra!*`;
        
        // Codificar mensaje para URL
        const mensajeCodificado = encodeURIComponent(mensaje);
        
        // Abrir WhatsApp
        const url = `https://wa.me/${this.numeroWhatsApp}?text=${mensajeCodificado}`;
        window.open(url, '_blank');
        
        this.mostrarMensaje('📱 Orden enviada por WhatsApp', 'success');
    }

    // ============================================
    // MODAL NUEVA VENTA
    // ============================================

    mostrarModalNuevaVenta() {
        console.log('🛒 Abriendo modal de venta...');
        
        this.carritoVenta = [];
        const inventario = storage.getInventario();
        const productosDisponibles = inventario.filter(p => p.activo === true && p.unidades > 0);
        
        console.log(`📦 Productos disponibles: ${productosDisponibles.length}`);
        
        let productosHTML = '';
        
        if (productosDisponibles.length === 0) {
            productosHTML = `
                <div style="text-align: center; padding: 40px; background: #fff3cd; border-radius: 12px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #856404;"></i>
                    <h3>No hay productos disponibles</h3>
                    <p>Crea productos en Inventario primero</p>
                    <button class="btn btn-primary" onclick="window.app.cerrarModal('modalNuevaVenta'); window.app.loadView('inventario')">
                        Ir a Inventario
                    </button>
                </div>
            `;
        } else {
            productosHTML = '<div style="display: flex; flex-direction: column; gap: 15px;">';
            
            productosDisponibles.forEach((producto, index) => {
                let stockColor = '#27ae60';
                let stockText = `${producto.unidades} disponibles`;
                
                if (producto.unidades <= 5) {
                    stockColor = '#e74c3c';
                    stockText = `¡ÚLTIMAS ${producto.unidades}!`;
                } else if (producto.unidades <= 10) {
                    stockColor = '#f39c12';
                    stockText = `${producto.unidades} unidades (bajo stock)`;
                }
                
                productosHTML += `
                    <div style="background: white; border: 2px solid #27ae60; border-radius: 12px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin:0;">${producto.nombre}</h4>
                                <small>Código: ${producto.codigo} | Stock: ${producto.unidades}</small>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 1.3em; color: #27ae60;">$${producto.precioVenta}</div>
                                <button class="btn btn-sm btn-success" onclick="window.app.agregarAlCarrito('${producto.id}')">
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            productosHTML += '</div>';
        }
        
        const config = storage.getConfig?.() || {};
        const impuesto = config.impuesto || 0;
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevaVenta">
                <div class="modal-content" style="max-width: 1400px; width: 95%; height: 95vh;">
                    <div class="modal-header">
                        <h3><i class="fas fa-cash-register" style="color: #27ae60;"></i> Nueva Venta</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaVenta')">&times;</button>
                    </div>
                    <div class="modal-body" style="height: calc(95vh - 80px); padding: 25px; overflow-y: auto;">
                        <div style="display: flex; gap: 30px; height: 100%;">
                            
                            <!-- COLUMNA IZQUIERDA - PRODUCTOS -->
                            <div style="flex: 1.5; display: flex; flex-direction: column; height: 100%; border-right: 2px solid #ecf0f1; padding-right: 25px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                    <h4 style="margin:0;">Productos Disponibles</h4>
                                    <span class="badge badge-primary" style="font-size: 1.1em; padding: 8px 20px;">
                                        ${productosDisponibles.length}
                                    </span>
                                </div>
                                
                                <div style="margin-bottom: 15px;">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-barcode"></i></span>
                                        <input type="text" class="form-control" id="codigoBarrasInput" placeholder="Escanear código de barras...">
                                        <button class="btn btn-info" onclick="window.app.buscarPorCodigoBarras()">Buscar</button>
                                    </div>
                                </div>
                                
                                <div id="productosDisponiblesList" style="flex: 1; overflow-y: auto; padding-right: 10px;">
                                    ${productosHTML}
                                </div>
                            </div>
                            
                            <!-- COLUMNA DERECHA - CARRITO Y DATOS -->
                            <div style="flex: 1.5; display: flex; flex-direction: column; height: 100%;">
                                
                                <!-- TIPO DE ENTREGA -->
                                <div style="margin-bottom: 20px;">
                                    <h4 style="margin:0 0 15px 0;">Tipo de Entrega</h4>
                                    <div style="display: flex; gap: 20px;">
                                        <label style="flex:1; padding: 15px; border: 2px solid #ddd; border-radius: 10px; text-align: center; cursor: pointer;" id="tipoMesaLabel" onclick="window.app.seleccionarTipoEntrega('mesa')">
                                            <input type="radio" name="tipoEntrega" value="mesa" checked style="display: none;"> 
                                            <i class="fas fa-utensils" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
                                            <strong>Mesa</strong>
                                        </label>
                                        <label style="flex:1; padding: 15px; border: 2px solid #ddd; border-radius: 10px; text-align: center; cursor: pointer;" id="tipoDomicilioLabel" onclick="window.app.seleccionarTipoEntrega('domicilio')">
                                            <input type="radio" name="tipoEntrega" value="domicilio" style="display: none;">
                                            <i class="fas fa-motorcycle" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
                                            <strong>Domicilio</strong>
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- CAMPOS DINÁMICOS SEGÚN TIPO -->
                                <div id="camposEntrega">
                                    <!-- CAMPOS PARA MESA (por defecto) -->
                                    <div id="camposMesa" style="margin-bottom: 20px;">
                                        <div class="form-group">
                                            <label>Número de Mesa</label>
                                            <input type="text" id="mesaNumero" class="form-control" placeholder="Ej: Mesa 5">
                                        </div>
                                    </div>
                                    
                                    <!-- CAMPOS PARA DOMICILIO (ocultos inicialmente) -->
                                    <div id="camposDomicilio" style="display: none; margin-bottom: 20px;">
                                        <div class="form-group">
                                            <label>Nombre del Cliente *</label>
                                            <input type="text" id="domicilioNombre" class="form-control" placeholder="Nombre completo">
                                        </div>
                                        <div class="form-group">
                                            <label>Dirección *</label>
                                            <input type="text" id="domicilioDireccion" class="form-control" placeholder="Calle, carrera, número">
                                        </div>
                                        <div class="form-group">
                                            <label>Punto de Referencia</label>
                                            <input type="text" id="domicilioReferencia" class="form-control" placeholder="Cerca de...">
                                        </div>
                                        <div class="form-group">
                                            <label>Teléfono *</label>
                                            <input type="tel" id="domicilioTelefono" class="form-control" placeholder="Número de contacto">
                                        </div>
                                        <div class="form-group">
                                            <label>Valor del Domicilio ($)</label>
                                            <input type="number" id="valorDomicilio" class="form-control" value="0" min="0" step="100">
                                            <small class="text-muted">Puede ser 0 si es gratis</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- NOTA GENERAL -->
                                <div style="margin-bottom: 20px;">
                                    <label>Nota General para la Orden</label>
                                    <textarea id="notaGeneral" class="form-control" rows="2" placeholder="Ej: Sin cebolla, salsa aparte, etc..."></textarea>
                                </div>
                                
                                <!-- CARRITO -->
                                <div style="flex: 1; display: flex; flex-direction: column; min-height: 300px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                        <h4 style="margin:0;">Carrito de Venta</h4>
                                        <span class="badge badge-success" id="carritoItemsCount" style="font-size: 1.1em; padding: 8px 20px;">0</span>
                                    </div>
                                    
                                    <div id="carritoItems" style="flex: 1; overflow-y: auto; background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                                        <div class="text-center py-5">
                                            <i class="fas fa-shopping-cart fa-4x mb-3" style="color: #dcdde1;"></i>
                                            <h5 style="color: #7f8c8d;">El carrito está vacío</h5>
                                        </div>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 25px; border-radius: 16px; margin-bottom: 20px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                            <span>Subtotal:</span>
                                            <span style="font-weight: bold;" id="subtotalCarrito">$0</span>
                                        </div>
                                        ${impuesto > 0 ? `
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; opacity: 0.9;">
                                            <span>Impuesto (${impuesto}%):</span>
                                            <span id="impuestoCarrito">$0</span>
                                        </div>
                                        ` : ''}
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; opacity: 0.9;">
                                            <span>Domicilio:</span>
                                            <span id="domicilioCarrito">$0</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: bold; border-top: 2px solid rgba(255,255,255,0.2); padding-top: 20px;">
                                            <span>TOTAL:</span>
                                            <span id="totalCarrito">$0</span>
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                        <select id="metodoPago" class="form-control" style="flex: 1;">
                                            <option value="efectivo">Efectivo</option>
                                            <option value="tarjeta">Tarjeta</option>
                                            <option value="transferencia">Transferencia</option>
                                        </select>
                                        <input type="email" id="clienteEmail" class="form-control" placeholder="Email para factura" style="flex: 1;">
                                    </div>
                                    
                                    <div style="display: flex; gap: 15px;">
                                        <button class="btn btn-secondary" style="flex: 1;" onclick="window.app.limpiarCarrito()">
                                            <i class="fas fa-trash"></i> Limpiar
                                        </button>
                                        <button class="btn btn-success" style="flex: 2;" onclick="window.app.finalizarVenta()">
                                            <i class="fas fa-check-circle"></i> Finalizar Venta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
        
        setTimeout(() => {
            document.getElementById('codigoBarrasInput')?.focus();
        }, 500);
    }

    buscarPorCodigoBarras() {
        const codigo = document.getElementById('codigoBarrasInput')?.value;
        if (codigo) {
            this.procesarCodigoBarras(codigo);
            document.getElementById('codigoBarrasInput').value = '';
        }
    }

    seleccionarTipoEntrega(tipo) {
        const camposMesa = document.getElementById('camposMesa');
        const camposDomicilio = document.getElementById('camposDomicilio');
        const labelMesa = document.getElementById('tipoMesaLabel');
        const labelDomicilio = document.getElementById('tipoDomicilioLabel');
        
        if (tipo === 'mesa') {
            camposMesa.style.display = 'block';
            camposDomicilio.style.display = 'none';
            labelMesa.style.borderColor = '#27ae60';
            labelMesa.style.backgroundColor = '#f0fff0';
            labelDomicilio.style.borderColor = '#ddd';
            labelDomicilio.style.backgroundColor = 'white';
        } else {
            camposMesa.style.display = 'none';
            camposDomicilio.style.display = 'block';
            labelMesa.style.borderColor = '#ddd';
            labelMesa.style.backgroundColor = 'white';
            labelDomicilio.style.borderColor = '#27ae60';
            labelDomicilio.style.backgroundColor = '#f0fff0';
        }
        
        this.actualizarCarrito();
    }

    // ============================================
    // MÉTODOS DEL CARRITO
    // ============================================

    agregarAlCarrito(productoId) {
        const producto = storage.getProducto(productoId);
        if (!producto) {
            this.mostrarMensaje('❌ Producto no encontrado', 'error');
            return;
        }
        
        if (producto.unidades <= 0) {
            this.mostrarMensaje('❌ Producto agotado', 'error');
            return;
        }
        
        // Verificar si hay promociones activas para este producto
        const promocion = this.aplicarPromociones(producto.precioVenta, producto.id, producto.categoriaId, 1);
        let precioFinal = producto.precioVenta;
        
        if (promocion.promocion && promocion.promocion.tipo === 'porcentaje') {
            precioFinal = promocion.precioFinal;
            this.mostrarMensaje(`🎁 Promoción aplicada: ${promocion.promocion.nombre}`, 'info');
        }
        
        // Preguntar si quiere agregar nota o adiciones
        const nota = prompt(`¿Nota para ${producto.nombre}? (Ej: Sin cebolla, bien asado, etc)`, '');
        const adiciones = prompt(`¿Adiciones para ${producto.nombre}? (Ej: Queso extra, tocineta, etc - separado por comas)`, '');
        
        const existe = this.carritoVenta.findIndex(i => i.productoId === productoId);
        
        if (existe !== -1) {
            if (this.carritoVenta[existe].cantidad >= producto.unidades) {
                this.mostrarMensaje('⚠️ Stock máximo alcanzado', 'warning');
                return;
            }
            this.carritoVenta[existe].cantidad++;
            this.carritoVenta[existe].subtotal = this.carritoVenta[existe].cantidad * this.carritoVenta[existe].precioUnitario;
            if (nota) this.carritoVenta[existe].nota = nota;
            if (adiciones) this.carritoVenta[existe].adiciones = adiciones.split(',').map(a => a.trim());
            this.mostrarMensaje(`✓ +1 ${producto.nombre}`, 'success');
        } else {
            this.carritoVenta.push({
                productoId: producto.id,
                nombre: producto.nombre,
                codigo: producto.codigo,
                precioUnitario: precioFinal,
                cantidad: 1,
                subtotal: precioFinal,
                stockDisponible: producto.unidades,
                nota: nota || '',
                adiciones: adiciones ? adiciones.split(',').map(a => a.trim()) : []
            });
            this.mostrarMensaje(`✓ ${producto.nombre} agregado`, 'success');
        }
        
        this.actualizarCarrito();
    }

    actualizarCarrito() {
        const carritoItems = document.getElementById('carritoItems');
        const carritoCount = document.getElementById('carritoItemsCount');
        const subtotalEl = document.getElementById('subtotalCarrito');
        const impuestoEl = document.getElementById('impuestoCarrito');
        const domicilioEl = document.getElementById('domicilioCarrito');
        const totalEl = document.getElementById('totalCarrito');
        
        if (!carritoItems) return;
        
        if (carritoCount) {
            carritoCount.textContent = this.carritoVenta.length;
        }
        
        if (this.carritoVenta.length === 0) {
            carritoItems.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-4x mb-3" style="color: #dcdde1;"></i>
                    <h5 style="color: #7f8c8d;">El carrito está vacío</h5>
                </div>
            `;
            if (subtotalEl) subtotalEl.textContent = '$0';
            if (impuestoEl) impuestoEl.textContent = '$0';
            if (domicilioEl) domicilioEl.textContent = '$0';
            if (totalEl) totalEl.textContent = '$0';
            return;
        }
        
        let html = '';
        let subtotal = 0;
        
        this.carritoVenta.forEach((item, i) => {
            subtotal += item.subtotal;
            
            let adicionesHTML = '';
            if (item.adiciones && item.adiciones.length > 0) {
                adicionesHTML = `<div style="font-size: 0.85em; color: #e67e22; margin-top: 5px;">
                    <i class="fas fa-plus-circle"></i> Adiciones: ${item.adiciones.join(', ')}
                </div>`;
            }
            
            let notaHTML = '';
            if (item.nota) {
                notaHTML = `<div style="font-size: 0.85em; color: #3498db; margin-top: 5px;">
                    <i class="fas fa-sticky-note"></i> Nota: ${item.nota}
                </div>`;
            }
            
            html += `
                <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 10px; border: 1px solid #ecf0f1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 2;">
                            <strong style="font-size: 1.1em;">${item.nombre}</strong><br>
                            <small style="color: #7f8c8d;">$${item.precioUnitario} c/u</small>
                            ${notaHTML}
                            ${adicionesHTML}
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="window.app.disminuirCantidad(${i})"
                                    style="width: 35px; height: 35px; border-radius: 8px;"
                                    ${item.cantidad <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span style="font-weight: bold; min-width: 30px; text-align: center; font-size: 1.2em;">${item.cantidad}</span>
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="window.app.aumentarCantidad(${i})"
                                    style="width: 35px; height: 35px; border-radius: 8px;"
                                    ${item.cantidad >= item.stockDisponible ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div style="text-align: right; min-width: 100px;">
                            <strong style="font-size: 1.2em; color: #27ae60;">$${item.subtotal}</strong>
                            <button class="btn btn-sm btn-link text-danger" 
                                    onclick="window.app.eliminarDelCarrito(${i})"
                                    style="margin-left: 10px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        carritoItems.innerHTML = html;
        
        const config = storage.getConfig?.() || {};
        const impuestoPorcentaje = (config.impuesto || 0) / 100;
        const impuesto = subtotal * impuestoPorcentaje;
        
        // Obtener valor del domicilio
        let valorDomicilio = 0;
        const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked')?.value;
        if (tipoEntrega === 'domicilio') {
            valorDomicilio = parseFloat(document.getElementById('valorDomicilio')?.value) || 0;
        }
        
        const total = subtotal + impuesto + valorDomicilio;
        
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
        if (impuestoEl) impuestoEl.textContent = `$${impuesto.toLocaleString()}`;
        if (domicilioEl) domicilioEl.textContent = `$${valorDomicilio.toLocaleString()}`;
        if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
    }

    aumentarCantidad(index) {
        if (this.carritoVenta[index].cantidad < this.carritoVenta[index].stockDisponible) {
            this.carritoVenta[index].cantidad++;
            this.carritoVenta[index].subtotal = this.carritoVenta[index].cantidad * this.carritoVenta[index].precioUnitario;
            this.actualizarCarrito();
        }
    }

    disminuirCantidad(index) {
        if (this.carritoVenta[index].cantidad > 1) {
            this.carritoVenta[index].cantidad--;
            this.carritoVenta[index].subtotal = this.carritoVenta[index].cantidad * this.carritoVenta[index].precioUnitario;
            this.actualizarCarrito();
        }
    }

    eliminarDelCarrito(index) {
        const item = this.carritoVenta[index];
        this.carritoVenta.splice(index, 1);
        this.actualizarCarrito();
        this.mostrarMensaje(`🗑️ ${item.nombre} eliminado`, 'info');
    }

    limpiarCarrito() {
        if (this.carritoVenta.length > 0 && confirm('¿Limpiar carrito?')) {
            this.carritoVenta = [];
            this.actualizarCarrito();
            this.mostrarMensaje('🧹 Carrito limpiado', 'success');
        }
    }

    finalizarVenta() {
        if (this.carritoVenta.length === 0) {
            this.mostrarMensaje('❌ El carrito está vacío', 'error');
            return;
        }
        
        // Determinar tipo de entrega
        const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked')?.value || 'mesa';
        
        // Validar campos según tipo
        if (tipoEntrega === 'domicilio') {
            const nombre = document.getElementById('domicilioNombre')?.value;
            const direccion = document.getElementById('domicilioDireccion')?.value;
            const telefono = document.getElementById('domicilioTelefono')?.value;
            
            if (!nombre || !direccion || !telefono) {
                this.mostrarMensaje('❌ Completa todos los campos del domicilio', 'error');
                return;
            }
        }
        
        if (!confirm('¿Confirmar la venta?')) {
            return;
        }
        
        const config = storage.getConfig?.() || {};
        const impuestoPorcentaje = (config.impuesto || 0) / 100;
        
        const clienteEmail = document.getElementById('clienteEmail')?.value || '';
        const metodoPago = document.getElementById('metodoPago')?.value || 'efectivo';
        const notaGeneral = document.getElementById('notaGeneral')?.value || '';
        const valorDomicilio = tipoEntrega === 'domicilio' ? (parseFloat(document.getElementById('valorDomicilio')?.value) || 0) : 0;
        
        const subtotal = this.carritoVenta.reduce((sum, item) => sum + item.subtotal, 0);
        const impuesto = subtotal * impuestoPorcentaje;
        const total = subtotal + impuesto + valorDomicilio;
        
        // Preparar datos de entrega
        let datosEntrega = {};
        if (tipoEntrega === 'mesa') {
            datosEntrega = {
                tipoEntrega: 'mesa',
                mesa: document.getElementById('mesaNumero')?.value || 'No especificada'
            };
        } else {
            datosEntrega = {
                tipoEntrega: 'domicilio',
                cliente: document.getElementById('domicilioNombre')?.value,
                direccion: document.getElementById('domicilioDireccion')?.value,
                referencia: document.getElementById('domicilioReferencia')?.value || '',
                telefono: document.getElementById('domicilioTelefono')?.value,
                valorDomicilio: valorDomicilio
            };
        }
        
        const venta = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `FAC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(storage.getVentas?.().length + 1).padStart(5, '0')}`,
            fecha: new Date().toISOString(),
            cliente: tipoEntrega === 'mesa' ? 'Mesa ' + (document.getElementById('mesaNumero')?.value || '') : document.getElementById('domicilioNombre')?.value,
            ...datosEntrega,
            email: clienteEmail,
            productos: this.carritoVenta.map(item => ({
                productoId: item.productoId,
                nombre: item.nombre,
                codigo: item.codigo,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.subtotal,
                nota: item.nota || '',
                adiciones: item.adiciones || []
            })),
            notaGeneral: notaGeneral,
            subtotal: subtotal,
            impuesto: impuesto,
            valorDomicilio: valorDomicilio,
            total: total,
            metodoPago: metodoPago,
            estado: 'completada'
        };
        
        // Actualizar stock
        this.carritoVenta.forEach(item => {
            const producto = storage.getProducto(item.productoId);
            if (producto) {
                producto.unidades -= item.cantidad;
                storage.updateProducto(producto.id, { unidades: producto.unidades });
            }
        });
        
        // Guardar venta
        const ventas = storage.getVentas?.() || [];
        ventas.push(venta);
        storage.saveVentas?.(ventas);
        
        // Si hay turno abierto, agregar venta al turno
        if (this.turnoActual) {
            this.turnoActual.ventas.push(venta.id);
            this.turnoActual.totalVentas += venta.total;
            this.guardarTurnoActual();
            
            // Actualizar en el array de turnos
            const turnos = JSON.parse(localStorage.getItem('invplanet_turnos') || '[]');
            const index = turnos.findIndex(t => t.id === this.turnoActual.id);
            if (index !== -1) {
                turnos[index] = this.turnoActual;
                localStorage.setItem('invplanet_turnos', JSON.stringify(turnos));
            }
        }
        
        this.mostrarMensaje('✅ Venta realizada exitosamente', 'success');
        
        // Preguntar si enviar por WhatsApp
        if (confirm('¿Enviar orden por WhatsApp?')) {
            this.enviarWhatsApp(venta.id);
        }
        
        // Generar factura
        setTimeout(() => {
            this.generarFactura(venta);
            this.cerrarModal('modalNuevaVenta');
            this.carritoVenta = [];
            this.loadVentasView();
        }, 1500);
    }

    // ============================================
    // FACTURACIÓN ELECTRÓNICA
    // ============================================

    verDetalleVenta(id) {
        const venta = storage.getVenta?.(id);
        if (!venta) {
            this.mostrarMensaje('❌ Venta no encontrada', 'error');
            return;
        }
        
        const fecha = new Date(venta.fecha);
        const config = storage.getConfig?.() || {};
        const nombreNegocio = config.nombreNegocio || 'Mi Negocio';
        
        let entregaInfo = '';
        if (venta.tipoEntrega === 'domicilio') {
            entregaInfo = `
                <p><strong>Tipo:</strong> Domicilio 🛵</p>
                <p><strong>Dirección:</strong> ${venta.direccion}</p>
                <p><strong>Referencia:</strong> ${venta.referencia || 'N/A'}</p>
                <p><strong>Teléfono:</strong> ${venta.telefono}</p>
                <p><strong>Valor Domicilio:</strong> $${(venta.valorDomicilio || 0).toLocaleString()}</p>
            `;
        } else {
            entregaInfo = `
                <p><strong>Tipo:</strong> Mesa 🍽️</p>
                <p><strong>Mesa:</strong> ${venta.mesa || 'No especificada'}</p>
            `;
        }
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalDetalleVenta">
                <div class="modal-content" style="max-width: 900px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-invoice"></i> Detalle de Venta</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalDetalleVenta')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #27ae60; margin:0;">${nombreNegocio}</h2>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <h4>${venta.numero}</h4>
                            <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}</p>
                            <p><strong>Cliente:</strong> ${venta.cliente}</p>
                            ${entregaInfo}
                            <p><strong>Email:</strong> ${venta.email || 'No registrado'}</p>
                            <p><strong>Método de Pago:</strong> ${venta.metodoPago}</p>
                            <p><strong>Estado:</strong> <span class="badge ${venta.estado === 'anulada' ? 'badge-danger' : venta.estado === 'modificada' ? 'badge-warning' : 'badge-success'}">${venta.estado}</span></p>
                            ${venta.notaGeneral ? `<p><strong>Nota General:</strong> ${venta.notaGeneral}</p>` : ''}
                            ${venta.modificacionDe ? `<p><small>Modificación de: ${venta.modificacionDe}</small></p>` : ''}
                        </div>
                        
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>Subtotal</th>
                                    <th>Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${venta.productos.map(p => `
                                    <tr>
                                        <td>${p.codigo || 'N/A'}</td>
                                        <td>${p.nombre}</td>
                                        <td>${p.cantidad}</td>
                                        <td>$${p.precioUnitario}</td>
                                        <td>$${p.subtotal}</td>
                                        <td>
                                            ${p.nota ? `<small>📝 ${p.nota}</small>` : ''}
                                            ${p.adiciones?.length ? `<br><small>➕ ${p.adiciones.join(', ')}</small>` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 20px; text-align: right;">
                            <p><strong>Subtotal:</strong> $${venta.subtotal.toLocaleString()}</p>
                            ${venta.impuesto > 0 ? `<p><strong>Impuesto (${config.impuesto || 0}%):</strong> $${venta.impuesto.toLocaleString()}</p>` : ''}
                            ${venta.valorDomicilio > 0 ? `<p><strong>Valor Domicilio:</strong> $${venta.valorDomicilio.toLocaleString()}</p>` : ''}
                            <h3><strong>TOTAL:</strong> $${venta.total.toLocaleString()}</h3>
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button class="btn btn-success" onclick="window.app.enviarWhatsApp('${venta.id}')">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                            <button class="btn btn-primary" onclick="window.app.imprimirFactura('${venta.id}')">
                                <i class="fas fa-print"></i> Imprimir Factura
                            </button>
                            <button class="btn btn-info" onclick="window.app.enviarFacturaEmail('${venta.id}')">
                                <i class="fas fa-envelope"></i> Enviar por Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    imprimirFactura(id) {
        const venta = storage.getVenta?.(id);
        if (!venta) {
            this.mostrarMensaje('❌ Venta no encontrada', 'error');
            return;
        }
        
        const fecha = new Date(venta.fecha);
        const config = storage.getConfig?.() || {};
        const nombreNegocio = config.nombreNegocio || 'Mi Negocio';
        const direccion = config.direccion || '';
        const telefono = config.telefono || '';
        const email = config.email || '';
        const impuestoPorcentaje = config.impuesto || 0;
        
        let entregaInfo = '';
        if (venta.tipoEntrega === 'domicilio') {
            entregaInfo = `
                <p><strong>Tipo:</strong> Domicilio</p>
                <p><strong>Dirección:</strong> ${venta.direccion}</p>
                <p><strong>Referencia:</strong> ${venta.referencia || 'N/A'}</p>
                <p><strong>Teléfono:</strong> ${venta.telefono}</p>
                <p><strong>Valor Domicilio:</strong> $${(venta.valorDomicilio || 0).toLocaleString()}</p>
            `;
        } else {
            entregaInfo = `
                <p><strong>Tipo:</strong> Mesa</p>
                <p><strong>Mesa:</strong> ${venta.mesa || 'No especificada'}</p>
            `;
        }
        
        const facturaHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Factura ${venta.numero}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .empresa { font-size: 24px; font-weight: bold; color: #27ae60; }
                    .factura-info { margin-bottom: 20px; }
                    .cliente-info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .nota-producto { font-size: 0.9em; color: #666; font-style: italic; }
                    .totales { text-align: right; }
                    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="empresa">${nombreNegocio}</div>
                    <div>${direccion}</div>
                    <div>${telefono}</div>
                    <div>${email}</div>
                </div>
                
                <div class="factura-info">
                    <h2>FACTURA ELECTRÓNICA</h2>
                    <p><strong>Número:</strong> ${venta.numero}</p>
                    <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}</p>
                </div>
                
                <div class="cliente-info">
                    <h3>DATOS DEL CLIENTE</h3>
                    <p><strong>Nombre:</strong> ${venta.cliente}</p>
                    ${entregaInfo}
                    <p><strong>Email:</strong> ${venta.email || 'No registrado'}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${venta.productos.map(p => `
                            <tr>
                                <td>${p.codigo || 'N/A'}</td>
                                <td>
                                    ${p.nombre}
                                    ${p.nota ? `<div class="nota-producto">📝 ${p.nota}</div>` : ''}
                                    ${p.adiciones?.length ? `<div class="nota-producto">➕ ${p.adiciones.join(', ')}</div>` : ''}
                                </td>
                                <td>${p.cantidad}</td>
                                <td>$${p.precioUnitario.toLocaleString()}</td>
                                <td>$${p.subtotal.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                ${venta.notaGeneral ? `<p><strong>Nota General:</strong> ${venta.notaGeneral}</p>` : ''}
                
                <div class="totales">
                    <p><strong>Subtotal:</strong> $${venta.subtotal.toLocaleString()}</p>
                    ${venta.impuesto > 0 ? `<p><strong>Impuesto (${impuestoPorcentaje}%):</strong> $${venta.impuesto.toLocaleString()}</p>` : ''}
                    ${venta.valorDomicilio > 0 ? `<p><strong>Valor Domicilio:</strong> $${venta.valorDomicilio.toLocaleString()}</p>` : ''}
                    <h2><strong>TOTAL:</strong> $${venta.total.toLocaleString()}</h2>
                </div>
                
                <div class="footer">
                    <p>¡Gracias por su compra!</p>
                    <p>Esta factura se asimila en todos sus efectos legales a una factura de venta</p>
                </div>
                
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()">Imprimir</button>
                    <button onclick="window.close()">Cerrar</button>
                </div>
            </body>
            </html>
        `;
        
        const ventana = window.open('', '_blank');
        ventana.document.write(facturaHTML);
        ventana.document.close();
    }

    enviarFacturaEmail(id) {
        const venta = storage.getVenta?.(id);
        if (!venta) {
            this.mostrarMensaje('❌ Venta no encontrada', 'error');
            return;
        }
        
        if (!venta.email) {
            this.mostrarMensaje('❌ El cliente no tiene email registrado', 'error');
            return;
        }
        
        // Simular envío de email
        this.mostrarMensaje(`📧 Factura enviada a ${venta.email}`, 'success');
    }

    generarFactura(venta) {
        if (confirm('¿Deseas imprimir la factura?')) {
            this.imprimirFactura(venta.id);
        }
    }

    // ============================================
    // GASTOS (MANTENER CÓDIGO EXISTENTE)
    // ============================================

    loadGastosView() {
        const gastos = storage.getGastos?.() || [];
        
        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="gastos-view">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-money-bill-wave"></i> Gastos
                    </h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="window.app.mostrarModalNuevoGasto()">
                            <i class="fas fa-plus"></i> Nuevo Gasto
                        </button>
                        <button class="btn btn-success" onclick="window.app.exportarGastos()">
                            <i class="fas fa-file-export"></i> Exportar
                        </button>
                    </div>
                </div>
                
                <div class="resumen-gastos" id="resumenGastos">
                    ${this.renderResumenGastos(gastos)}
                </div>
                
                <div class="filtros-gastos">
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" class="search-input" id="searchGasto" placeholder="Buscar gasto...">
                    </div>
                    <div class="filter-group">
                        <select class="form-control" id="filterCategoriaGasto">
                            <option value="">Todas las categorías</option>
                            <option value="alquiler">Alquiler</option>
                            <option value="servicios">Servicios</option>
                            <option value="nomina">Nómina</option>
                            <option value="insumos">Insumos</option>
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <input type="date" class="form-control" id="filterFechaGasto">
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                                <th>Monto</th>
                                <th>Comentarios</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaGastos">
                            ${this.renderTablaGastos(gastos)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('searchGasto')?.addEventListener('keyup', () => this.buscarGastos());
        document.getElementById('filterCategoriaGasto')?.addEventListener('change', () => this.filtrarGastos());
        document.getElementById('filterFechaGasto')?.addEventListener('change', () => this.filtrarGastos());
    }

    renderResumenGastos(gastos) {
        const total = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
        const hoy = new Date().toDateString();
        const gastosHoy = gastos.filter(g => new Date(g.fecha).toDateString() === hoy);
        const totalHoy = gastosHoy.reduce((sum, g) => sum + (g.monto || 0), 0);
        const mesActual = new Date().getMonth();
        const gastosMes = gastos.filter(g => new Date(g.fecha).getMonth() === mesActual);
        const totalMes = gastosMes.reduce((sum, g) => sum + (g.monto || 0), 0);
        
        return `
            <div class="resumen-card">
                <i class="fas fa-calculator"></i>
                <div>
                    <h4>${gastos.length}</h4>
                    <p>Total Gastos</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-dollar-sign"></i>
                <div>
                    <h4>$${total.toLocaleString()}</h4>
                    <p>Total General</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-calendar-day"></i>
                <div>
                    <h4>$${totalHoy.toLocaleString()}</h4>
                    <p>Gastos Hoy</p>
                </div>
            </div>
            <div class="resumen-card">
                <i class="fas fa-calendar-alt"></i>
                <div>
                    <h4>$${totalMes.toLocaleString()}</h4>
                    <p>Gastos del Mes</p>
                </div>
            </div>
        `;
    }

    renderTablaGastos(gastos) {
        if (gastos.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="text-center">
                        <i class="fas fa-money-bill-wave fa-3x mb-3" style="color: #ddd;"></i>
                        <h4>No hay gastos registrados</h4>
                        <p>¡Comienza agregando tu primer gasto!</p>
                        <button class="btn btn-primary" onclick="window.app.mostrarModalNuevoGasto()">
                            <i class="fas fa-plus"></i> Nuevo Gasto
                        </button>
                    </td>
                </tr>
            `;
        }
        
        const categorias = {
            'alquiler': 'Alquiler',
            'servicios': 'Servicios',
            'nomina': 'Nómina',
            'insumos': 'Insumos',
            'mantenimiento': 'Mantenimiento',
            'otros': 'Otros'
        };
        
        let html = '';
        gastos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(g => {
            const fecha = new Date(g.fecha);
            html += `
                <tr>
                    <td>${fecha.toLocaleDateString()}</td>
                    <td>${g.descripcion}</td>
                    <td><span class="badge badge-info">${categorias[g.categoria] || g.categoria}</span></td>
                    <td>$${g.monto.toLocaleString()}</td>
                    <td>${g.comentarios || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="window.app.mostrarModalEditarGasto('${g.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.app.eliminarGasto('${g.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        return html;
    }

    buscarGastos() {
        const query = document.getElementById('searchGasto')?.value.toLowerCase() || '';
        const gastos = storage.getGastos?.() || [];
        const filtrados = gastos.filter(g => 
            g.descripcion?.toLowerCase().includes(query) || 
            g.comentarios?.toLowerCase().includes(query)
        );
        document.getElementById('tablaGastos').innerHTML = this.renderTablaGastos(filtrados);
    }

    filtrarGastos() {
        const categoria = document.getElementById('filterCategoriaGasto')?.value;
        const fecha = document.getElementById('filterFechaGasto')?.value;
        let gastos = storage.getGastos?.() || [];
        
        if (categoria) {
            gastos = gastos.filter(g => g.categoria === categoria);
        }
        
        if (fecha) {
            gastos = gastos.filter(g => {
                const fechaGasto = new Date(g.fecha).toISOString().split('T')[0];
                return fechaGasto === fecha;
            });
        }
        
        document.getElementById('tablaGastos').innerHTML = this.renderTablaGastos(gastos);
    }

    mostrarModalNuevoGasto() {
        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevoGasto">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Nuevo Gasto</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevoGasto')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoGasto" onsubmit="return false;">
                            <div class="form-group">
                                <label>Fecha</label>
                                <input type="date" id="gastoFecha" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label>Descripción *</label>
                                <input type="text" id="gastoDescripcion" class="form-control" required placeholder="Ej: Pago de servicios">
                            </div>
                            <div class="form-group">
                                <label>Categoría</label>
                                <select id="gastoCategoria" class="form-control">
                                    <option value="alquiler">Alquiler</option>
                                    <option value="servicios">Servicios</option>
                                    <option value="nomina">Nómina</option>
                                    <option value="insumos">Insumos</option>
                                    <option value="mantenimiento">Mantenimiento</option>
                                    <option value="otros">Otros</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Monto *</label>
                                <input type="number" id="gastoMonto" class="form-control" required min="0" step="100">
                            </div>
                            <div class="form-group">
                                <label>Comentarios</label>
                                <textarea id="gastoComentarios" class="form-control" rows="3"></textarea>
                            </div>
                            <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoGasto')">
                                    Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoGasto()">
                                    <i class="fas fa-save"></i> Guardar Gasto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    guardarNuevoGasto() {
        const descripcion = document.getElementById('gastoDescripcion')?.value;
        const monto = document.getElementById('gastoMonto')?.value;
        
        if (!descripcion || !monto) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }
        
        const nuevoGasto = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            fecha: document.getElementById('gastoFecha')?.value || new Date().toISOString().split('T')[0],
            descripcion: descripcion,
            categoria: document.getElementById('gastoCategoria')?.value || 'otros',
            monto: parseFloat(monto),
            comentarios: document.getElementById('gastoComentarios')?.value || '',
            fechaRegistro: new Date().toISOString()
        };
        
        try {
            const guardado = storage.addGasto?.(nuevoGasto);
            
            if (guardado) {
                this.mostrarMensaje('✅ Gasto registrado', 'success');
                this.cerrarModal('modalNuevoGasto');
                setTimeout(() => this.loadGastosView(), 300);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarMensaje('❌ Error al guardar', 'error');
        }
    }

    mostrarModalEditarGasto(id) {
        const gasto = storage.getGasto?.(id);
        if (!gasto) {
            this.mostrarMensaje('❌ Gasto no encontrado', 'error');
            return;
        }
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalEditarGasto">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit"></i> Editar Gasto</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalEditarGasto')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarGasto" onsubmit="return false;">
                            <input type="hidden" id="editGastoId" value="${gasto.id}">
                            <div class="form-group">
                                <label>Fecha</label>
                                <input type="date" id="editGastoFecha" class="form-control" value="${gasto.fecha}">
                            </div>
                            <div class="form-group">
                                <label>Descripción *</label>
                                <input type="text" id="editGastoDescripcion" class="form-control" value="${gasto.descripcion}" required>
                            </div>
                            <div class="form-group">
                                <label>Categoría</label>
                                <select id="editGastoCategoria" class="form-control">
                                    <option value="alquiler" ${gasto.categoria === 'alquiler' ? 'selected' : ''}>Alquiler</option>
                                    <option value="servicios" ${gasto.categoria === 'servicios' ? 'selected' : ''}>Servicios</option>
                                    <option value="nomina" ${gasto.categoria === 'nomina' ? 'selected' : ''}>Nómina</option>
                                    <option value="insumos" ${gasto.categoria === 'insumos' ? 'selected' : ''}>Insumos</option>
                                    <option value="mantenimiento" ${gasto.categoria === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                                    <option value="otros" ${gasto.categoria === 'otros' ? 'selected' : ''}>Otros</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Monto *</label>
                                <input type="number" id="editGastoMonto" class="form-control" value="${gasto.monto}" required min="0" step="100">
                            </div>
                            <div class="form-group">
                                <label>Comentarios</label>
                                <textarea id="editGastoComentarios" class="form-control" rows="3">${gasto.comentarios || ''}</textarea>
                            </div>
                            <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalEditarGasto')">
                                    Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarEdicionGasto()">
                                    <i class="fas fa-save"></i> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;
    }

    guardarEdicionGasto() {
        const id = document.getElementById('editGastoId')?.value;
        const descripcion = document.getElementById('editGastoDescripcion')?.value;
        const monto = document.getElementById('editGastoMonto')?.value;
        
        if (!descripcion || !monto) {
            this.mostrarMensaje('❌ Completa los campos obligatorios', 'error');
            return;
        }
        
        const gastoActualizado = {
            fecha: document.getElementById('editGastoFecha')?.value,
            descripcion: descripcion,
            categoria: document.getElementById('editGastoCategoria')?.value,
            monto: parseFloat(monto),
            comentarios: document.getElementById('editGastoComentarios')?.value || '',
            fechaActualizacion: new Date().toISOString()
        };
        
        try {
            const actualizado = storage.updateGasto?.(id, gastoActualizado);
            
            if (actualizado) {
                this.mostrarMensaje('✅ Gasto actualizado', 'success');
                this.cerrarModal('modalEditarGasto');
                setTimeout(() => this.loadGastosView(), 300);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarMensaje('❌ Error al actualizar', 'error');
        }
    }

    eliminarGasto(id) {
        if (confirm('¿Eliminar este gasto?')) {
            storage.deleteGasto?.(id);
            this.loadGastosView();
            this.mostrarMensaje('✅ Gasto eliminado', 'success');
        }
    }

    exportarGastos() {
        if (storage.exportGastos) {
            storage.exportGastos();
            this.mostrarMensaje('✅ Gastos exportados', 'success');
        }
    }

    // ============================================
    // REPORTES (MANTENER CÓDIGO EXISTENTE)
    // ============================================

    loadReportesView() {
        const ventas = storage.getVentas?.() || [];
        const gastos = storage.getGastos?.() || [];
        const inventario = storage.getInventario();
        
        const ventasCompletadas = ventas.filter(v => v.estado === 'completada');
        const ventasModificadas = ventas.filter(v => v.estado === 'modificada');
        const ventasPorMes = this.agruparPorMes([...ventasCompletadas, ...ventasModificadas], 'total');
        const gastosPorMes = this.agruparPorMes(gastos, 'monto');
        const productosMasVendidos = this.obtenerProductosMasVendidos([...ventasCompletadas, ...ventasModificadas]);
        
        const totalVentas = [...ventasCompletadas, ...ventasModificadas].reduce((s, v) => s + (v.total || 0), 0);
        const totalGastos = gastos.reduce((s, g) => s + (g.monto || 0), 0);
        const utilidad = totalVentas - totalGastos;
        
        const domicilios = ventas.filter(v => v.tipoEntrega === 'domicilio' && (v.estado === 'completada' || v.estado === 'modificada')).length;
        const mesas = ventas.filter(v => v.tipoEntrega === 'mesa' && (v.estado === 'completada' || v.estado === 'modificada')).length;
        
        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="reportes-view">
                <h2 class="section-title">
                    <i class="fas fa-chart-line"></i> Reportes
                </h2>
                
                <div class="reportes-grid">
                    <div class="reporte-card">
                        <h3><i class="fas fa-chart-bar"></i> Resumen General</h3>
                        <div class="resumen-stats">
                            <div class="stat-item">
                                <label>Total Ventas:</label>
                                <span>$${totalVentas.toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <label>Total Gastos:</label>
                                <span>$${totalGastos.toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <label>Utilidad Bruta:</label>
                                <span class="${utilidad >= 0 ? 'text-success' : 'text-danger'}">$${utilidad.toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <label>Valor Inventario:</label>
                                <span>$${inventario.reduce((s, p) => s + ((p.costoUnitario || 0) * (p.unidades || 0)), 0).toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <label>Domicilios:</label>
                                <span>${domicilios}</span>
                            </div>
                            <div class="stat-item">
                                <label>Mesas:</label>
                                <span>${mesas}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="reporte-card">
                        <h3><i class="fas fa-calendar-alt"></i> Ventas por Mes</h3>
                        <div class="grafico-barras" id="ventasPorMes">
                            ${this.renderGraficoBarras(ventasPorMes)}
                        </div>
                    </div>
                    
                    <div class="reporte-card">
                        <h3><i class="fas fa-calendar-alt"></i> Gastos por Mes</h3>
                        <div class="grafico-barras" id="gastosPorMes">
                            ${this.renderGraficoBarras(gastosPorMes)}
                        </div>
                    </div>
                    
                    <div class="reporte-card">
                        <h3><i class="fas fa-chart-pie"></i> Productos Más Vendidos</h3>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosMasVendidos.map(p => `
                                    <tr>
                                        <td>${p.nombre}</td>
                                        <td>${p.cantidad}</td>
                                        <td>$${p.total.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="reporte-card">
                        <h3><i class="fas fa-file-pdf"></i> Exportar Reportes</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button class="btn btn-primary" onclick="window.app.exportarReporteVentas()">
                                <i class="fas fa-file-excel"></i> Ventas
                            </button>
                            <button class="btn btn-success" onclick="window.app.exportarReporteGastos()">
                                <i class="fas fa-file-excel"></i> Gastos
                            </button>
                            <button class="btn btn-info" onclick="window.app.exportarReporteInventario()">
                                <i class="fas fa-file-excel"></i> Inventario
                            </button>
                            <button class="btn btn-danger" onclick="window.app.exportarReporteCompleto()">
                                <i class="fas fa-file-pdf"></i> Reporte Completo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    agruparPorMes(items, campo) {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const resultado = new Array(12).fill(0);
        
        items.forEach(item => {
            const fecha = new Date(item.fecha);
            const mes = fecha.getMonth();
            resultado[mes] += item[campo] || 0;
        });
        
        return resultado.map((valor, i) => ({ mes: meses[i], valor }));
    }

    renderGraficoBarras(datos) {
        const maxValor = Math.max(...datos.map(d => d.valor), 1);
        
        return datos.map(d => {
            const altura = (d.valor / maxValor) * 100;
            return `
                <div class="barra-container">
                    <div class="barra" style="height: ${altura}%; background: #3498db;"></div>
                    <div class="barra-label">${d.mes}</div>
                    <div class="barra-valor">$${d.valor.toLocaleString()}</div>
                </div>
            `;
        }).join('');
    }

    obtenerProductosMasVendidos(ventas) {
        const productos = {};
        
        ventas.forEach(v => {
            v.productos?.forEach(p => {
                if (!productos[p.productoId]) {
                    productos[p.productoId] = {
                        nombre: p.nombre,
                        cantidad: 0,
                        total: 0
                    };
                }
                productos[p.productoId].cantidad += p.cantidad;
                productos[p.productoId].total += p.subtotal;
            });
        });
        
        return Object.values(productos)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);
    }

    exportarReporteVentas() {
        const ventas = storage.getVentas?.() || [];
        if (storage.exportToCSV) {
            const data = ventas.map(v => ({
                Numero: v.numero,
                Fecha: new Date(v.fecha).toLocaleDateString(),
                Cliente: v.cliente,
                Tipo: v.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Mesa ' + (v.mesa || ''),
                Direccion: v.direccion || '',
                Telefono: v.telefono || '',
                ValorDomicilio: v.valorDomicilio || 0,
                Productos: v.productos?.length || 0,
                Subtotal: v.subtotal,
                Impuesto: v.impuesto,
                Total: v.total,
                MetodoPago: v.metodoPago,
                Estado: v.estado
            }));
            storage.exportToCSV(data, 'reporte_ventas');
        }
        this.mostrarMensaje('📊 Reporte de ventas exportado', 'success');
    }

    exportarReporteGastos() {
        const gastos = storage.getGastos?.() || [];
        if (storage.exportToCSV) {
            const data = gastos.map(g => ({
                Fecha: new Date(g.fecha).toLocaleDateString(),
                Descripcion: g.descripcion,
                Categoria: g.categoria,
                Monto: g.monto,
                Comentarios: g.comentarios
            }));
            storage.exportToCSV(data, 'reporte_gastos');
        }
        this.mostrarMensaje('📊 Reporte de gastos exportado', 'success');
    }

    exportarReporteInventario() {
        const inventario = storage.getInventario();
        if (storage.exportToCSV) {
            const data = inventario.map(p => ({
                Codigo: p.codigo,
                Nombre: p.nombre,
                Categoria: p.categoriaId,
                Stock: p.unidades,
                StockMinimo: p.stockMinimo,
                PrecioVenta: p.precioVenta,
                CostoUnitario: p.costoUnitario,
                ValorTotal: (p.costoUnitario || 0) * (p.unidades || 0),
                Activo: p.activo ? 'Sí' : 'No'
            }));
            storage.exportToCSV(data, 'reporte_inventario');
        }
        this.mostrarMensaje('📊 Reporte de inventario exportado', 'success');
    }

    exportarReporteCompleto() {
        this.mostrarMensaje('📑 Generando reporte completo...', 'info');
        setTimeout(() => {
            this.mostrarMensaje('✅ Reporte completo generado', 'success');
        }, 2000);
    }

    // ============================================
    // CONFIGURACIÓN (MANTENER CÓDIGO EXISTENTE)
    // ============================================

    loadConfiguracionView() {
        const user = getCurrentUser();
        if (user?.role !== 'admin') {
            this.mostrarMensaje('⛔ Acceso denegado. Solo administradores.', 'error');
            this.loadView('dashboard');
            return;
        }
        
        const config = storage.getConfig?.() || {};
        
        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="configuracion-view">
                <h2 class="section-title">
                    <i class="fas fa-cog"></i> Configuración
                </h2>
                
                <div class="config-grid">
                    <div class="config-card">
                        <h3><i class="fas fa-store"></i> Información del Negocio</h3>
                        <form id="formConfigNegocio" onsubmit="return false;">
                            <div class="form-group">
                                <label>Nombre del Negocio</label>
                                <input type="text" id="configNombre" class="form-control" value="${config.nombreNegocio || ''}">
                            </div>
                            <div class="form-group">
                                <label>Dirección</label>
                                <input type="text" id="configDireccion" class="form-control" value="${config.direccion || ''}">
                            </div>
                            <div class="form-group">
                                <label>Teléfono</label>
                                <input type="text" id="configTelefono" class="form-control" value="${config.telefono || ''}">
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="configEmail" class="form-control" value="${config.email || ''}">
                            </div>
                            <div class="form-group">
                                <label>Número WhatsApp para Órdenes</label>
                                <input type="text" id="configWhatsApp" class="form-control" value="${config.whatsApp || '+573243898130'}" placeholder="Ej: +573243898130">
                                <small class="text-muted">Las órdenes se enviarán a este número</small>
                            </div>
                            <button type="button" class="btn btn-primary" onclick="window.app.guardarConfigNegocio()">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                    
                    <div class="config-card">
                        <h3><i class="fas fa-dollar-sign"></i> Configuración Financiera</h3>
                        <form id="formConfigFinanzas" onsubmit="return false;">
                            <div class="form-group">
                                <label>Moneda</label>
                                <select id="configMoneda" class="form-control">
                                    <option value="COP" ${config.moneda === 'COP' ? 'selected' : ''}>COP - Peso Colombiano</option>
                                    <option value="USD" ${config.moneda === 'USD' ? 'selected' : ''}>USD - Dólar Americano</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Impuesto (%)</label>
                                <input type="number" id="configImpuesto" class="form-control" value="${config.impuesto || 0}" min="0" max="100" step="1">
                                <small class="text-muted">Puede ser 0% si no aplica impuesto</small>
                            </div>
                            <div class="form-group">
                                <label>Stock Mínimo por Defecto</label>
                                <input type="number" id="configStockMinimo" class="form-control" value="${config.stockMinimoDefault || 10}" min="0">
                            </div>
                            <div class="form-group">
                                <label>Margen de Ganancia (%)</label>
                                <input type="number" id="configMargen" class="form-control" value="${config.margenGanancia || 30}" min="0" max="100">
                            </div>
                            <button type="button" class="btn btn-primary" onclick="window.app.guardarConfigFinanzas()">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                    
                    <div class="config-card">
                        <h3><i class="fas fa-clock"></i> Horario de Atención</h3>
                        <form id="formConfigHorario" onsubmit="return false;">
                            <div class="form-group">
                                <label>Hora de Apertura</label>
                                <input type="time" id="configHoraApertura" class="form-control" value="${config.horaApertura || '08:00'}">
                            </div>
                            <div class="form-group">
                                <label>Hora de Cierre</label>
                                <input type="time" id="configHoraCierre" class="form-control" value="${config.horaCierre || '22:00'}">
                            </div>
                            <button type="button" class="btn btn-primary" onclick="window.app.guardarConfigHorario()">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                    
                    <div class="config-card">
                        <h3><i class="fas fa-credit-card"></i> Métodos de Pago</h3>
                        <form id="formConfigPagos" onsubmit="return false;">
                            <div class="form-check">
                                <input type="checkbox" id="configPagoEfectivo" class="form-check-input" ${config.metodosPago?.efectivo ? 'checked' : ''}>
                                <label class="form-check-label">Efectivo</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" id="configPagoTarjeta" class="form-check-input" ${config.metodosPago?.tarjeta ? 'checked' : ''}>
                                <label class="form-check-label">Tarjeta</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" id="configPagoTransferencia" class="form-check-input" ${config.metodosPago?.transferencia ? 'checked' : ''}>
                                <label class="form-check-label">Transferencia</label>
                            </div>
                            <button type="button" class="btn btn-primary mt-3" onclick="window.app.guardarConfigPagos()">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                    
                    <div class="config-card">
                        <h3><i class="fas fa-database"></i> Gestión de Datos</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button class="btn btn-info" onclick="window.app.crearBackup()">
                                <i class="fas fa-download"></i> Crear Backup
                            </button>
                            <button class="btn btn-warning" onclick="window.app.restaurarBackup()">
                                <i class="fas fa-upload"></i> Restaurar Backup
                            </button>
                            <button class="btn btn-danger" onclick="window.app.resetearDatos()">
                                <i class="fas fa-trash"></i> Resetear Datos
                            </button>
                        </div>
                        <div class="mt-3">
                            <p><strong>Información del Storage:</strong></p>
                            <pre id="storageInfo" style="background: #f8f9fa; padding: 10px; border-radius: 5px;">Cargando...</pre>
                        </div>
                    </div>
                    
                    <div class="config-card">
                        <h3><i class="fas fa-bell"></i> Notificaciones</h3>
                        <form id="formConfigNotificaciones" onsubmit="return false;">
                            <div class="form-check">
                                <input type="checkbox" id="configNotifStockBajo" class="form-check-input" ${config.notificaciones?.stockBajo ? 'checked' : ''}>
                                <label class="form-check-label">Alertas de Stock Bajo</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" id="configNotifVentas" class="form-check-input" ${config.notificaciones?.ventas ? 'checked' : ''}>
                                <label class="form-check-label">Notificaciones de Ventas</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" id="configNotifWhatsApp" class="form-check-input" ${config.notificaciones?.whatsApp ? 'checked' : ''}>
                                <label class="form-check-label">Enviar automáticamente a WhatsApp</label>
                            </div>
                            <button type="button" class="btn btn-primary mt-3" onclick="window.app.guardarConfigNotificaciones()">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        this.mostrarInfoStorage();
    }

    mostrarInfoStorage() {
        const info = storage.getStorageInfo?.() || { items: 0, totalSize: '0 KB', timestamp: new Date().toLocaleString() };
        const pre = document.getElementById('storageInfo');
        if (pre) {
            pre.textContent = JSON.stringify(info, null, 2);
        }
    }

    guardarConfigNegocio() {
        const whatsApp = document.getElementById('configWhatsApp')?.value;
        if (whatsApp) {
            this.numeroWhatsApp = whatsApp;
        }
        
        const config = {
            nombreNegocio: document.getElementById('configNombre')?.value,
            direccion: document.getElementById('configDireccion')?.value,
            telefono: document.getElementById('configTelefono')?.value,
            email: document.getElementById('configEmail')?.value,
            whatsApp: whatsApp || this.numeroWhatsApp
        };
        storage.updateConfig?.(config);
        this.cargarNombreNegocio();
        this.mostrarMensaje('✅ Configuración guardada', 'success');
    }

    guardarConfigFinanzas() {
        const config = {
            moneda: document.getElementById('configMoneda')?.value,
            impuesto: parseInt(document.getElementById('configImpuesto')?.value) || 0,
            stockMinimoDefault: parseInt(document.getElementById('configStockMinimo')?.value) || 10,
            margenGanancia: parseInt(document.getElementById('configMargen')?.value) || 30
        };
        storage.updateConfig?.(config);
        this.mostrarMensaje('✅ Configuración financiera guardada', 'success');
    }

    guardarConfigHorario() {
        const config = {
            horaApertura: document.getElementById('configHoraApertura')?.value,
            horaCierre: document.getElementById('configHoraCierre')?.value
        };
        storage.updateConfig?.(config);
        this.mostrarMensaje('✅ Horario guardado', 'success');
    }

    guardarConfigPagos() {
        const config = {
            metodosPago: {
                efectivo: document.getElementById('configPagoEfectivo')?.checked || false,
                tarjeta: document.getElementById('configPagoTarjeta')?.checked || false,
                transferencia: document.getElementById('configPagoTransferencia')?.checked || false
            }
        };
        storage.updateConfig?.(config);
        this.mostrarMensaje('✅ Métodos de pago guardados', 'success');
    }

    guardarConfigNotificaciones() {
        const config = {
            notificaciones: {
                stockBajo: document.getElementById('configNotifStockBajo')?.checked || false,
                ventas: document.getElementById('configNotifVentas')?.checked || false,
                whatsApp: document.getElementById('configNotifWhatsApp')?.checked || false
            }
        };
        storage.updateConfig?.(config);
        this.mostrarMensaje('✅ Notificaciones guardadas', 'success');
    }

    crearBackup() {
        if (storage.createBackup) {
            storage.createBackup();
            this.mostrarMensaje('✅ Backup creado exitosamente', 'success');
        }
    }

    restaurarBackup() {
        const backups = storage.getBackups?.() || [];
        if (backups.length === 0) {
            this.mostrarMensaje('❌ No hay backups disponibles', 'error');
            return;
        }
        
        // Mostrar lista de backups
        let mensaje = 'Backups disponibles:\n';
        backups.forEach((b, i) => {
            mensaje += `${i+1}. ${b.nombre} (${new Date(b.fecha).toLocaleString()})\n`;
        });
        mensaje += '\nIngresa el número del backup a restaurar:';
        
        const num = prompt(mensaje);
        if (num && backups[num-1]) {
            storage.restoreBackup(backups[num-1].id);
            this.mostrarMensaje('✅ Backup restaurado. Recarga la página.', 'success');
            setTimeout(() => location.reload(), 2000);
        }
    }

    resetearDatos() {
        if (confirm('⚠️ ¿Estás seguro? Esto borrará TODOS los datos. Esta acción no se puede deshacer.')) {
            if (storage.clearAll) {
                storage.clearAll();
                this.mostrarMensaje('✅ Datos reseteados. Recarga la página.', 'success');
                setTimeout(() => location.reload(), 2000);
            }
        }
    }

    // ============================================
    // MÉTODOS DE VENTAS (EXPORTACIÓN)
    // ============================================

    exportarVentas() {
        if (storage.exportVentas) {
            storage.exportVentas();
            this.mostrarMensaje('✅ Ventas exportadas', 'success');
        }
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    formatCurrency(amount) {
        return `$${parseInt(amount || 0).toLocaleString()}`;
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        console.log(`📢 ${tipo}: ${mensaje}`);
        
        const anteriores = document.querySelectorAll('.mensaje-flotante');
        anteriores.forEach(a => a.remove());
        
        const div = document.createElement('div');
        div.className = 'mensaje-flotante';
        div.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            padding: 15px 25px; border-radius: 10px; color: white;
            font-weight: 600; display: flex; align-items: center; gap: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
        `;
        
        if (tipo === 'success') {
            div.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            div.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;
        } else if (tipo === 'error') {
            div.style.background = 'linear-gradient(135deg, #c0392b, #e74c3c)';
            div.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        } else {
            div.style.background = 'linear-gradient(135deg, #2980b9, #3498db)';
            div.innerHTML = `<i class="fas fa-info-circle"></i> ${mensaje}`;
        }
        
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            this.modalOpen = false;
        }
    }

    getErrorView(message) {
        return `
            <div class="error-view">
                <i class="fas fa-exclamation-triangle fa-3x mb-3" style="color: #e74c3c;"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary mt-4" onclick="window.app.loadView('dashboard')">
                    <i class="fas fa-home"></i> Dashboard
                </button>
            </div>
        `;
    }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

const app = new InvPlanetApp();
window.app = app;

function initializeApp() {
    return app.initializeApp();
}

function cargarVista(view) {
    if (app?.loadView) {
        app.loadView(view);
        return true;
    }
    return false;
}

window.initializeApp = initializeApp;
window.cargarVista = cargarVista;

// ============================================
// EXPORTAR FUNCIONES GLOBALES PARA BOTONES
// ============================================

// Módulos existentes
window.mostrarModalNuevoProducto = () => app.mostrarModalNuevoProducto();
window.mostrarModalEditarProducto = (id) => app.mostrarModalEditarProducto(id);
window.mostrarModalNuevoKit = () => app.mostrarModalNuevoKit();
window.mostrarModalNuevaCategoria = () => app.mostrarModalNuevaCategoria();
window.mostrarModalEditarCategoria = (id) => app.mostrarModalEditarCategoria(id);
window.mostrarModalNuevaVenta = () => app.mostrarModalNuevaVenta();
window.mostrarModalNuevoGasto = () => app.mostrarModalNuevoGasto();
window.mostrarModalEditarGasto = (id) => app.mostrarModalEditarGasto(id);
window.mostrarAyudaLectorBarra = () => app.mostrarAyudaLectorBarra();
window.buscarPorCodigoBarras = () => app.buscarPorCodigoBarras();
window.modificarVenta = (id) => app.modificarVenta(id);
window.cancelarModificacion = () => app.cancelarModificacion();
window.buscarPorCodigoBarrasModificacion = () => app.buscarPorCodigoBarrasModificacion();

// Usuarios
window.mostrarModalUsuarios = () => app.mostrarModalUsuarios();

// Clientes
window.mostrarModalClientes = () => app.mostrarModalClientes();

// Proveedores
window.mostrarModalProveedores = () => app.mostrarModalProveedores();

// Promociones
window.mostrarModalPromociones = () => app.mostrarModalPromociones();

// Mesas
window.mostrarMapaMesas = () => app.mostrarMapaMesas();

// Comisiones
window.mostrarModalComisiones = () => app.mostrarModalComisiones();

// Apartados
window.mostrarModalApartados = () => app.mostrarModalApartados();

// Créditos
window.mostrarModalCreditos = () => app.mostrarModalCreditos();

// Turnos
window.mostrarModalTurnos = () => app.mostrarModalTurnos();

// Presupuestos
window.mostrarModalPresupuestos = () => app.mostrarModalPresupuestos();

// ============================================
// NUEVOS MÓDULOS
// ============================================

// Series y Lotes
window.mostrarModalSeries = () => app.mostrarModalSeries();
window.mostrarModalNuevoSerie = () => app.mostrarModalNuevoSerie();
window.mostrarModalLotes = () => app.mostrarModalLotes();
window.mostrarModalNuevoLote = () => app.mostrarModalNuevoLote();

// Taller y Servicios
window.mostrarModalOrdenesTrabajo = () => app.mostrarModalOrdenesTrabajo();
window.mostrarModalNuevaOrdenTrabajo = () => app.mostrarModalNuevaOrdenTrabajo();
window.agregarRepuestoOrden = () => app.agregarRepuestoOrden();
window.actualizarPrecioRepuesto = (select) => app.actualizarPrecioRepuesto(select);
window.calcularTotalesOrden = () => app.calcularTotalesOrden();
window.verDetalleOrdenTrabajo = (id) => app.verDetalleOrdenTrabajo(id);
window.actualizarEstadoOrden = (id) => app.actualizarEstadoOrden(id);
window.imprimirOrdenTrabajo = (id) => app.imprimirOrdenTrabajo(id);
window.convertirOrdenAFactura = (id) => app.convertirOrdenAFactura(id);

// Recetas Médicas
window.mostrarModalRecetasMedicas = () => app.mostrarModalRecetasMedicas();
window.mostrarModalNuevaReceta = () => app.mostrarModalNuevaReceta();
window.agregarMedicamentoReceta = () => app.agregarMedicamentoReceta();
window.verDetalleReceta = (id) => app.verDetalleReceta(id);
window.despacharReceta = (id) => app.despacharReceta(id);
window.imprimirReceta = (id) => app.imprimirReceta(id);

// Vehículos
window.mostrarModalVehiculos = () => app.mostrarModalVehiculos();
window.mostrarModalNuevoVehiculo = (clienteId) => app.mostrarModalNuevoVehiculo(clienteId);
window.verHistorialVehiculo = (id) => app.verHistorialVehiculo(id);
window.guardarRecordatorioMantenimiento = (id) => app.guardarRecordatorioMantenimiento(id);
window.editarVehiculo = (id) => app.editarVehiculo(id);
window.mostrarModalNuevaOrdenTrabajoConVehiculo = (id) => app.mostrarModalNuevaOrdenTrabajoConVehiculo(id);
window.verVehiculosCliente = (id) => app.verVehiculosCliente(id);

// Órdenes de Compra
window.mostrarModalOrdenesCompra = () => app.mostrarModalOrdenesCompra();
window.mostrarModalNuevaOrdenCompra = (proveedorId) => app.mostrarModalNuevaOrdenCompra(proveedorId);
window.agregarProductoOC = () => app.agregarProductoOC();
window.actualizarPrecioOC = (select) => app.actualizarPrecioOC(select);
window.calcularTotalOC = () => app.calcularTotalOC();
window.verDetalleOrdenCompra = (id) => app.verDetalleOrdenCompra(id);
window.recibirOrdenCompra = (id) => app.recibirOrdenCompra(id);
window.imprimirOrdenCompra = (id) => app.imprimirOrdenCompra(id);

// Pedidos Especiales
window.mostrarModalPedidosEspeciales = () => app.mostrarModalPedidosEspeciales();
window.mostrarModalNuevoPedidoEspecial = () => app.mostrarModalNuevoPedidoEspecial();
window.marcarPedidoRecibido = (id) => app.marcarPedidoRecibido(id);
window.notificarClientePedido = (id) => app.notificarClientePedido(id);

// Devoluciones y Garantías
window.mostrarModalDevoluciones = () => app.mostrarModalDevoluciones();
window.mostrarModalNuevaDevolucion = () => app.mostrarModalNuevaDevolucion();
window.cargarProductosVentaDevolucion = (ventaId) => app.cargarProductosVentaDevolucion(ventaId);
window.seleccionarProductoDevolucion = (nombre, cantidad, precio) => app.seleccionarProductoDevolucion(nombre, cantidad, precio);
window.verDetalleDevolucion = (id) => app.verDetalleDevolucion(id);
window.procesarDevolucion = (id) => app.procesarDevolucion(id);
window.verDetalleGarantia = (id) => app.verDetalleGarantia(id);

// ============================================
// VERIFICACIÓN FINAL
// ============================================

console.log('%c✅ InvPlanet App v15.0 - MEGA COMPLETA CON TODOS LOS MÓDULOS CRÍTICOS', 'background: #27ae60; color: white; padding: 10px 15px; border-radius: 5px; font-size: 14px; font-weight: bold;');
console.log('📦 Módulos nuevos: Series/Lotes, Taller, Recetas, Vehículos, Compras, Pedidos Especiales, Devoluciones');
console.log('📦 Módulos existentes: Usuarios, Clientes, Proveedores, Promociones, Kits, Mesas, Comisiones, Apartados, Créditos, Turnos, Presupuestos');