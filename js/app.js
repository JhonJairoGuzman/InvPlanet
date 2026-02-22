// js/app.js - VERSIÓN LIMPIA - SOLO MÓDULOS ESENCIALES
// ============================================
// INCLUYE: Dashboard, Inventario, Categorías, Ventas, Gastos, Reportes, Configuración,
// Clientes, Proveedores, Mesas y Usuarios (Gestión básica)
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
        this.numeroWhatsApp = '+573243898130'; // Número por defecto
        this.configEnvio = { metodo: 'whatsapp', numeroWhatsApp: '+573243898130' }; // <-- NUEVA CONFIGURACIÓN
        this.scanTimeout = null;
        this.barcodeBuffer = '';
        this.ventaEnModificacion = null;
        this.usuarioActual = null;
        this.mesas = [];
        this.clientes = [];
        this.proveedores = [];
        this.promociones = [];

        console.log('%c🔥 InvPlanet App v16.0 - VERSIÓN LIMPIA (Mesas y Clientes integrados)', 'background: #27ae60; color: white; padding: 5px 10px; border-radius: 5px;');
        console.log('✅ Módulos Activos: Dashboard, Inventario, Categorías, Ventas, Gastos, Reportes, Configuración, Usuarios, Clientes, Proveedores, Mesas.');
        console.log('🔄 Mesas y Clientes ahora se actualizan automáticamente desde las ventas.');

        this.verificarStorage();
        this.cargarNombreNegocio();
        this.cargarConfiguracionEnvio(); // <-- Cargar la nueva config
        this.inicializarLectorBarra();
        this.cargarUsuarios();
        this.cargarClientes();
        this.cargarProveedores();
        this.cargarPromociones();
        this.cargarMesas();
    }

    // ============================================
    // NUEVA FUNCIÓN PARA CARGAR CONFIGURACIÓN DE ENVÍO
    // ============================================
    cargarConfiguracionEnvio() {
        const configGuardada = localStorage.getItem('invplanet_config_envio');
        if (configGuardada) {
            try {
                this.configEnvio = JSON.parse(configGuardada);
                this.numeroWhatsApp = this.configEnvio.numeroWhatsApp || '+573243898130';
            } catch (e) {
                console.warn("Error cargando configuración de envío, usando valores por defecto.");
            }
        }
        console.log(`📤 Configuración de envío cargada: Método=${this.configEnvio.metodo}, WhatsApp=${this.numeroWhatsApp}`);
    }

    // ============================================
    // NUEVA FUNCIÓN PARA GUARDAR CONFIGURACIÓN DE ENVÍO
    // ============================================
    guardarConfiguracionEnvio(metodo, numeroWhatsApp) {
        this.configEnvio = {
            metodo: metodo,
            numeroWhatsApp: numeroWhatsApp || this.numeroWhatsApp
        };
        if (metodo === 'whatsapp') {
            this.numeroWhatsApp = numeroWhatsApp;
        }
        localStorage.setItem('invplanet_config_envio', JSON.stringify(this.configEnvio));
        this.mostrarMensaje('✅ Configuración de envío guardada', 'success');
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

    // Funciones de gestión de usuarios (mantenidas pero se puede acceder desde config)
    mostrarModalUsuarios() {
        const usuarios = this.usuarios;
        const roles = ['admin', 'cajero', 'cocina', 'domiciliario', 'mesero', 'invitado'];

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
        const roles = ['admin', 'cajero', 'cocina', 'domiciliario', 'mesero', 'invitado'];
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

        const roles = ['admin', 'cajero', 'cocina', 'domiciliario', 'mesero', 'invitado'];
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
    // CLIENTES (INTEGRADOS CON VENTAS)
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
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarCliente('${c.id}')">
                            <i class="fas fa-edit"></i>
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
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaClientes">
                                    ${clientesHTML || '<tr><td colspan="5" class="text-center">No hay clientes</td></tr>'}
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
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarCliente('${c.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        document.getElementById('tablaClientes').innerHTML = html || '<tr><td colspan="5" class="text-center">No hay resultados</td></tr>';
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
                fechaActualizacion: new Date().toISOString()
            };

            this.guardarClientes();
            this.mostrarMensaje('✅ Cliente actualizado', 'success');
            this.cerrarModal('modalEditarCliente');
            this.mostrarModalClientes();
        }
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
                fechaActualizacion: new Date().toISOString()
            };

            this.guardarProveedores();
            this.mostrarMensaje('✅ Proveedor actualizado', 'success');
            this.cerrarModal('modalEditarProveedor');
            this.mostrarModalProveedores();
        }
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
        this.modalOpen = true;
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
                return { promocion: p, aplica: true };
            }
        }

        return { precioFinal, promocion: null };
    }

    // ============================================
    // MESAS (INTEGRADAS CON VENTAS)
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
        this.modalOpen = true;
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

        // No marcamos la mesa como ocupada aquí, se hará al finalizar la venta.
        // Simplemente abrimos el modal de venta con la mesa preseleccionada.
        this.mostrarModalNuevaVenta();
        setTimeout(() => {
            const radioMesa = document.querySelector('input[name="tipoEntrega"][value="mesa"]');
            if (radioMesa) {
                radioMesa.click(); // Selecciona la opción mesa
            }
            document.getElementById('mesaNumero').value = mesa.numero;
            document.getElementById('comensalesMesa').value = numComensales; // Necesitas añadir este campo en el HTML del modal
        }, 500);
    }

    verPedidoMesa(mesa) {
        const ventas = storage.getVentas?.() || [];
        // Buscar una venta activa para esta mesa (no pagada, estado completada)
        const pedido = ventas.find(v => v.mesaId === mesa.id && v.estado === 'completada' && v.pagado !== true);

        if (!pedido) {
            // Si no hay pedido, la mesa debería estar disponible, pero no lo está. Corregimos.
            mesa.estado = 'disponible';
            mesa.comensales = 0;
            mesa.pedidoActual = null;
            this.guardarMesas();
            this.mostrarMensaje('Mesa liberada (no se encontró pedido)', 'info');
            this.mostrarMapaMesas(); // Refrescar
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
                </div>

                <div class="dashboard-sections">
                    <div class="dashboard-section">
                        <h3><i class="fas fa-exclamation-triangle text-warning"></i> Alertas</h3>
                        <div id="alertasList" class="alertas-list">
                            ${this.renderAlertasDashboard(productosBajos)}
                        </div>
                    </div>

                    <div class="dashboard-section">
                        <h3><i class="fas fa-clock"></i> Acciones Rápidas</h3>
                        <div class="acciones-rapidas">
                            <button class="btn btn-success btn-block" onclick="window.app.mostrarModalNuevaVenta()">
                                <i class="fas fa-cash-register"></i> Nueva Venta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAlertasDashboard(productosBajos) {
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
    // INVENTARIO
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
                    <td colspan="8" class="text-center">
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
                                <label>Descripción</label>
                                <textarea id="editProductoDescripcion" class="form-control" rows="2">${producto.descripcion || ''}</textarea>
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
            descripcion: document.getElementById('editProductoDescripcion')?.value || '',
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
                                <label>Descripción</label>
                                <textarea id="productoDescripcion" class="form-control" rows="2" placeholder="Descripción..."></textarea>
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
            descripcion: document.getElementById('productoDescripcion')?.value || '',
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

    exportarInventario() {
        if (storage.exportInventario) {
            storage.exportInventario();
            this.mostrarMensaje('✅ Inventario exportado', 'success');
        }
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
    // VENTAS (CON INTEGRACIÓN DE MESAS Y CLIENTES)
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
        const totalCompletadas = completadas.reduce((sum, v) => sum + (v.total || 0), 0);

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
                <i class="fas fa-dollar-sign"></i>
                <div>
                    <h4>$${totalCompletadas.toLocaleString()}</h4>
                    <p>Total Ingresos</p>
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
                    <td><span title="${v.direccion || ''}">${tipoIcono} ${tipoTexto}</span></td>
                    <td>${v.productos?.length || 0}</td>
                    <td>$${v.total || 0}</td>
                    <td><span class="badge ${badgeClass}">${estadoTexto}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.app.verDetalleVenta('${v.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${v.estado !== 'anulada' && v.estado !== 'modificada' ? `
                        <button class="btn btn-sm btn-warning" onclick="window.app.modificarVenta('${v.id}')">
                            <i class="fas fa-edit"></i>
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

        // Preguntar si enviar por WhatsApp según configuración
        if (this.configEnvio.metodo === 'whatsapp' && this.configEnvio.numeroWhatsApp) {
            this.enviarWhatsApp(nuevaVenta.id);
        } else {
            alert('Venta modificada. (Simulación: Conectar con impresora térmica)');
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

        // Si la venta era de una mesa, liberarla
        if (venta.tipoEntrega === 'mesa' && venta.mesaId) {
            const mesa = this.mesas.find(m => m.id === venta.mesaId);
            if (mesa) {
                mesa.estado = 'disponible';
                mesa.comensales = 0;
                mesa.pedidoActual = null;
                this.guardarMesas();
            }
        }

        this.mostrarMensaje('✅ Venta anulada exitosamente. Stock devuelto.', 'success');
        this.loadVentasView();
    }

    // ============================================
    // ENVIAR POR WHATSAPP (MODIFICADO PARA USAR CONFIGURACIÓN)
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

        // Abrir WhatsApp con el número configurado
        const url = `https://wa.me/${this.numeroWhatsApp}?text=${mensajeCodificado}`;
        window.open(url, '_blank');

        this.mostrarMensaje('📱 Orden enviada por WhatsApp', 'success');
    }

    // ============================================
    // MODAL NUEVA VENTA (MODIFICADO PARA INTEGRAR MESAS Y CLIENTES)
    // ============================================

    mostrarModalNuevaVenta() {
        console.log('🛒 Abriendo modal de venta...');

        this.carritoVenta = [];
        const inventario = storage.getInventario();
        const productosDisponibles = inventario.filter(p => p.activo === true && p.unidades > 0);

        console.log(`📦 Productos disponibles: ${productosDisponibles.length}`);

        // Opciones de clientes para el select
        let clientesOptions = '<option value="">Seleccionar o crear cliente</option>';
        this.clientes.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
            clientesOptions += `<option value="${c.id}">${c.nombre}</option>`;
        });
        clientesOptions += '<option value="nuevo">-- Crear nuevo cliente --</option>';

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

                                <!-- SELECCIÓN DE CLIENTE -->
                                <div style="margin-bottom: 20px;">
                                    <h4 style="margin:0 0 15px 0;">Cliente</h4>
                                    <div class="form-group">
                                        <select id="clienteVentaSelect" class="form-control">
                                            ${clientesOptions}
                                        </select>
                                    </div>
                                    <div id="camposNuevoClienteVenta" style="display: none; margin-top: 10px;">
                                        <div class="form-group">
                                            <label>Nombre del nuevo cliente *</label>
                                            <input type="text" id="nuevoClienteVentaNombre" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Teléfono</label>
                                            <input type="tel" id="nuevoClienteVentaTelefono" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Dirección</label>
                                            <input type="text" id="nuevoClienteVentaDireccion" class="form-control">
                                        </div>
                                    </div>
                                </div>

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
                                            <input type="text" id="mesaNumero" class="form-control" placeholder="Ej: 5">
                                        </div>
                                        <div class="form-group">
                                            <label>Comensales</label>
                                            <input type="number" id="comensalesMesa" class="form-control" value="2" min="1">
                                        </div>
                                    </div>

                                    <!-- CAMPOS PARA DOMICILIO (ocultos inicialmente) -->
                                    <div id="camposDomicilio" style="display: none; margin-bottom: 20px;">
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

        // Evento para mostrar/ocultar campos de nuevo cliente
        document.getElementById('clienteVentaSelect')?.addEventListener('change', (e) => {
            document.getElementById('camposNuevoClienteVenta').style.display = e.target.value === 'nuevo' ? 'block' : 'none';
        });

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

        const promocion = this.aplicarPromociones(producto.precioVenta, producto.id, producto.categoriaId, 1);
        let precioFinal = producto.precioVenta;

        if (promocion.promocion && promocion.promocion.tipo === 'porcentaje') {
            precioFinal = promocion.precioFinal;
            this.mostrarMensaje(`🎁 Promoción aplicada: ${promocion.promocion.nombre}`, 'info');
        }

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
            const direccion = document.getElementById('domicilioDireccion')?.value;
            const telefono = document.getElementById('domicilioTelefono')?.value;

            if (!direccion || !telefono) {
                this.mostrarMensaje('❌ Completa los campos obligatorios del domicilio', 'error');
                return;
            }
        } else { // Mesa
            const mesaNumero = document.getElementById('mesaNumero')?.value;
            if (!mesaNumero) {
                this.mostrarMensaje('❌ Ingresa el número de mesa', 'error');
                return;
            }
        }

        // --- PROCESAMIENTO DEL CLIENTE ---
        const clienteSelect = document.getElementById('clienteVentaSelect')?.value;
        let clienteNombre = 'Consumidor Final';
        let clienteId = null;

        if (clienteSelect === 'nuevo') {
            const nuevoNombre = document.getElementById('nuevoClienteVentaNombre')?.value;
            if (!nuevoNombre) {
                this.mostrarMensaje('❌ Ingresa el nombre del nuevo cliente', 'error');
                return;
            }
            const nuevoCliente = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                nombre: nuevoNombre,
                telefono: document.getElementById('nuevoClienteVentaTelefono')?.value || '',
                direccion: document.getElementById('nuevoClienteVentaDireccion')?.value || '',
                fechaCreacion: new Date().toISOString()
            };
            this.clientes.push(nuevoCliente);
            this.guardarClientes();
            clienteNombre = nuevoNombre;
            clienteId = nuevoCliente.id;
        } else if (clienteSelect && clienteSelect !== '') {
            const clienteExistente = this.clientes.find(c => c.id === clienteSelect);
            if (clienteExistente) {
                clienteNombre = clienteExistente.nombre;
                clienteId = clienteExistente.id;
            }
        }

        // --- FIN PROCESAMIENTO CLIENTE ---

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
        let mesaId = null;
        if (tipoEntrega === 'mesa') {
            const mesaNumero = document.getElementById('mesaNumero')?.value;
            const mesa = this.mesas.find(m => m.numero == mesaNumero); // Buscar por número de mesa
            if (mesa) {
                mesaId = mesa.id;
                mesa.estado = 'ocupada';
                mesa.comensales = parseInt(document.getElementById('comensalesMesa')?.value) || 2;
                mesa.pedidoActual = { id: Date.now().toString(), productos: this.carritoVenta }; // Guardar referencia del pedido
                this.guardarMesas();
            }
            datosEntrega = {
                tipoEntrega: 'mesa',
                mesa: mesaNumero,
                mesaId: mesaId,
                comensales: parseInt(document.getElementById('comensalesMesa')?.value) || 2
            };
        } else {
            datosEntrega = {
                tipoEntrega: 'domicilio',
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
            cliente: clienteNombre,
            clienteId: clienteId, // Guardar el ID del cliente si existe
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

        this.mostrarMensaje('✅ Venta realizada exitosamente', 'success');

        // Enviar según configuración
        if (this.configEnvio.metodo === 'whatsapp' && this.configEnvio.numeroWhatsApp) {
            if (confirm('¿Enviar orden por WhatsApp?')) {
                this.enviarWhatsApp(venta.id);
            }
        } else {
            alert('Venta finalizada. (Simulación: Conectar con impresora térmica)');
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
                <p><strong>Comensales:</strong> ${venta.comensales || 'N/A'}</p>
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
                <p><strong>Comensales:</strong> ${venta.comensales || 'N/A'}</p>
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

        this.mostrarMensaje(`📧 Factura enviada a ${venta.email}`, 'success');
    }

    generarFactura(venta) {
        if (confirm('¿Deseas imprimir la factura?')) {
            this.imprimirFactura(venta.id);
        }
    }

    // ============================================
    // GASTOS
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
    // REPORTES
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

    // ============================================
    // CONFIGURACIÓN (MODIFICADA)
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

                    <!-- NUEVA SECCIÓN: ENVÍO DE PEDIDOS -->
                    <div class="config-card">
                        <h3><i class="fas fa-paper-plane"></i> Envío de Pedidos</h3>
                        <form id="formConfigEnvio" onsubmit="return false;">
                            <div class="form-group">
                                <label>Método de envío</label>
                                <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                                    <label style="flex:1; padding: 10px; border: 2px solid ${this.configEnvio.metodo === 'whatsapp' ? '#25D366' : '#ddd'}; border-radius: 10px; text-align: center; cursor: pointer;" id="metodoWhatsAppLabel" onclick="window.app.seleccionarMetodoEnvio('whatsapp')">
                                        <input type="radio" name="metodoEnvio" value="whatsapp" ${this.configEnvio.metodo === 'whatsapp' ? 'checked' : ''} style="display: none;">
                                        <i class="fab fa-whatsapp" style="font-size: 24px; display: block; margin-bottom: 5px; color: #25D366;"></i>
                                        <strong>WhatsApp</strong>
                                    </label>
                                    <label style="flex:1; padding: 10px; border: 2px solid ${this.configEnvio.metodo === 'impresora' ? '#3498db' : '#ddd'}; border-radius: 10px; text-align: center; cursor: pointer;" id="metodoImpresoraLabel" onclick="window.app.seleccionarMetodoEnvio('impresora')">
                                        <input type="radio" name="metodoEnvio" value="impresora" ${this.configEnvio.metodo === 'impresora' ? 'checked' : ''} style="display: none;">
                                        <i class="fas fa-print" style="font-size: 24px; display: block; margin-bottom: 5px; color: #3498db;"></i>
                                        <strong>Impresora Térmica</strong>
                                    </label>
                                </div>
                            </div>
                            <div id="campoNumeroWhatsApp" style="display: ${this.configEnvio.metodo === 'whatsapp' ? 'block' : 'none'};">
                                <div class="form-group">
                                    <label>Número de WhatsApp para envío *</label>
                                    <input type="text" id="configNumeroWhatsApp" class="form-control" value="${this.configEnvio.numeroWhatsApp || ''}" placeholder="Ej: +573243898130">
                                    <small class="text-muted">Las órdenes se enviarán a este número</small>
                                </div>
                            </div>
                            <button type="button" class="btn btn-primary" onclick="window.app.guardarConfigEnvio()">
                                Guardar Configuración de Envío
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

    // NUEVOS MÉTODOS PARA CONFIGURACIÓN DE ENVÍO
    seleccionarMetodoEnvio(metodo) {
        const labelWhatsApp = document.getElementById('metodoWhatsAppLabel');
        const labelImpresora = document.getElementById('metodoImpresoraLabel');
        const campoNumero = document.getElementById('campoNumeroWhatsApp');

        if (metodo === 'whatsapp') {
            labelWhatsApp.style.borderColor = '#25D366';
            labelImpresora.style.borderColor = '#ddd';
            campoNumero.style.display = 'block';
        } else {
            labelWhatsApp.style.borderColor = '#ddd';
            labelImpresora.style.borderColor = '#3498db';
            campoNumero.style.display = 'none';
        }
    }

    guardarConfigEnvio() {
        const metodo = document.querySelector('input[name="metodoEnvio"]:checked')?.value || 'whatsapp';
        const numeroWhatsApp = document.getElementById('configNumeroWhatsApp')?.value;

        if (metodo === 'whatsapp' && !numeroWhatsApp) {
            this.mostrarMensaje('❌ Ingresa el número de WhatsApp', 'error');
            return;
        }

        this.guardarConfiguracionEnvio(metodo, numeroWhatsApp);
    }

    mostrarInfoStorage() {
        const info = storage.getStorageInfo?.() || { items: 0, totalSize: '0 KB', timestamp: new Date().toLocaleString() };
        const pre = document.getElementById('storageInfo');
        if (pre) {
            pre.textContent = JSON.stringify(info, null, 2);
        }
    }

    guardarConfigNegocio() {
        const config = {
            nombreNegocio: document.getElementById('configNombre')?.value,
            direccion: document.getElementById('configDireccion')?.value,
            telefono: document.getElementById('configTelefono')?.value,
            email: document.getElementById('configEmail')?.value,
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

    mostrarAyudaLectorBarra() {
        alert('Coloca el cursor en el campo de código de barras y escanea el producto. Se agregará automáticamente al carrito.');
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

// ============================================
// VERIFICACIÓN FINAL
// ============================================

console.log('%c✅ InvPlanet App v16.0 - VERSIÓN LIMPIA Y COMPLETA', 'background: #27ae60; color: white; padding: 10px 15px; border-radius: 5px; font-size: 14px; font-weight: bold;');
console.log('📦 Módulos Activos: Dashboard, Inventario, Categorías, Ventas, Gastos, Reportes, Configuración, Usuarios, Clientes, Proveedores, Mesas.');
console.log('🔄 Mesas y Clientes ahora se actualizan automáticamente desde las ventas.');
console.log('📤 Nueva configuración de envío: WhatsApp o Impresora Térmica.');