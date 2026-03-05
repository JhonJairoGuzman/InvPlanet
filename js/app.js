// js/app.js - VERSIÓN COMPLETA CON SISTEMA DE RECETAS MANUALES Y FIDELIZACIÓN
// CORREGIDO: Cálculo de ventas y domicilio
// ============================================
// INCLUYE: Dashboard, Inventario, Categorías, Ventas (con puntos y canje),
// Recetas MANUALES (ingredientes con nombre, precio y cantidad), Gastos, 
// Reportes, Configuración, Clientes, Proveedores, Mesas y Usuarios
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
        this.configEnvio = { metodo: 'whatsapp', numeroWhatsApp: '+573243898130' };
        this.scanTimeout = null;
        this.barcodeBuffer = '';
        this.ventaEnModificacion = null;
        this.usuarioActual = null;
        this.mesas = [];
        this.clientes = [];
        this.proveedores = [];
        this.promociones = [];
        
        // ============================================
        // SISTEMA DE RECETAS MANUALES
        // ============================================
        this.recetas = [];

        // ============================================
        // CONFIGURACIÓN DEL SISTEMA DE FIDELIZACIÓN
        // ============================================
        this.configFidelizacion = {
            puntosPorCada: 1000,
            valorPuntoEnPesos: 100,
            productosGratis: []
        };
        this.puntosACanjear = 0;
        this.productoGratisSeleccionado = null;

        console.log('%c🔥 InvPlanet App v4.1 - CON SISTEMA DE RECETAS MANUALES (CORREGIDO)', 'background: #9b59b6; color: white; padding: 5px 10px; border-radius: 5px;');
        console.log('✅ Módulos Activos: Dashboard, Inventario, Categorías, Ventas, Recetas Manuales, Fidelización');

        this.verificarStorage();
        this.cargarNombreNegocio();
        this.cargarConfiguracionEnvio();
        this.cargarConfiguracionFidelizacion();
        this.cargarRecetas();
        this.inicializarLectorBarra();
        this.cargarUsuarios();
        this.cargarClientes();
        this.cargarProveedores();
        this.cargarPromociones();
        this.cargarMesas();
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
    // RECETAS MANUALES - NUEVO SISTEMA MEJORADO
    // ============================================

    cargarRecetas() {
        this.recetas = JSON.parse(localStorage.getItem('invplanet_recetas') || '[]');
        console.log(`📝 Recetas cargadas: ${this.recetas.length}`);
    }

    guardarRecetas() {
        localStorage.setItem('invplanet_recetas', JSON.stringify(this.recetas));
    }

    calcularCostoProduccion(productoId) {
        const receta = this.recetas.find(r => r.productoId === productoId);
        if (!receta) return null;

        let costoTotalInsumos = 0;
        
        receta.ingredientes.forEach(ing => {
            costoTotalInsumos += (ing.precioUnitario || 0) * ing.cantidad;
        });

        const costoPorUnidad = costoTotalInsumos / (receta.rinde || 1);
        
        return {
            costoTotalInsumos: costoTotalInsumos,
            costoPorUnidad: costoPorUnidad,
            receta: receta
        };
    }

    verificarStockIngredientes(productoId, cantidadSolicitada = 1) {
        const receta = this.recetas.find(r => r.productoId === productoId);
        if (!receta) return { suficiente: true, faltantes: [] };

        const faltantes = [];
        
        receta.ingredientes.forEach(ing => {
            const ingrediente = storage.getProducto(ing.productoId);
            if (!ingrediente) {
                return;
            }
            
            const cantidadNecesaria = ing.cantidad * cantidadSolicitada;
            if (ingrediente.unidades < cantidadNecesaria) {
                faltantes.push({ 
                    nombre: ing.nombre, 
                    cantidadRequerida: cantidadNecesaria, 
                    disponible: ingrediente.unidades 
                });
            }
        });

        return { 
            suficiente: faltantes.length === 0, 
            faltantes: faltantes
        };
    }

    agregarIngredienteManual(ingredienteData = null) {
        const container = document.getElementById('listaIngredientesReceta');
        if (!container) return;

        const ingredientRow = document.createElement('div');
        ingredientRow.className = 'ingrediente-row mb-3 p-3 border rounded';
        ingredientRow.style.backgroundColor = '#f9f9f9';
        ingredientRow.style.borderLeft = '4px solid #27ae60';
        
        const nombre = ingredienteData ? ingredienteData.nombre : '';
        const precio = ingredienteData ? ingredienteData.precioUnitario : '';
        const cantidad = ingredienteData ? ingredienteData.cantidad : '1';
        const productoId = ingredienteData ? ingredienteData.productoId || '' : '';

        ingredientRow.innerHTML = `
            <div style="display: grid; grid-template-columns: 3fr 1fr 1fr 40px; gap: 10px; align-items: center;">
                <div>
                    <input type="text" class="form-control ingrediente-nombre" placeholder="Nombre del ingrediente" value="${nombre}" style="font-size: 14px;">
                    <input type="hidden" class="ingrediente-productoid" value="${productoId}">
                </div>
                <div>
                    <input type="number" class="form-control ingrediente-precio" placeholder="Precio unitario $" value="${precio}" min="0" step="100" style="font-size: 14px;" oninput="window.app.calcularCostosReceta()">
                </div>
                <div>
                    <input type="number" class="form-control ingrediente-cantidad" placeholder="Cantidad" value="${cantidad}" min="0" step="0.001" style="font-size: 14px;" oninput="window.app.calcularCostosReceta()">
                </div>
                <div>
                    <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.ingrediente-row').remove(); window.app.calcularCostosReceta();">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="ingrediente-subtotal" style="text-align: right; margin-top: 5px; font-size: 13px; color: #27ae60;">
                Subtotal: $<span class="subtotal-valor">0</span>
            </div>
        `;
        
        container.appendChild(ingredientRow);
        
        if (productoId) {
            const producto = storage.getProducto(productoId);
            if (producto) {
                const nombreInput = ingredientRow.querySelector('.ingrediente-nombre');
                if (nombreInput) nombreInput.value = producto.nombre;
            }
        }
        
        this.calcularCostosReceta();
    }

    buscarProductoParaIngrediente(inputElement) {
        const query = inputElement.value.toLowerCase();
        if (query.length < 2) return;
        
        const inventario = storage.getInventario();
        const productos = inventario.filter(p => 
            p.nombre.toLowerCase().includes(query) && 
            !p.esKit
        );
        
        let suggestions = '';
        productos.slice(0, 5).forEach(p => {
            suggestions += `<div class="suggestion-item" onclick="window.app.seleccionarProductoIngrediente('${p.id}', '${p.nombre}', ${p.costoUnitario || 0})">${p.nombre} - $${p.costoUnitario || 0}</div>`;
        });
        
        const row = inputElement.closest('.ingrediente-row');
        let suggestionsDiv = row.querySelector('.ingrediente-suggestions');
        if (!suggestionsDiv) {
            suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'ingrediente-suggestions';
            suggestionsDiv.style.cssText = 'position: absolute; background: white; border: 1px solid #ddd; max-height: 200px; overflow-y: auto; z-index: 1000;';
            row.style.position = 'relative';
            row.appendChild(suggestionsDiv);
        }
        suggestionsDiv.innerHTML = suggestions;
        suggestionsDiv.style.display = 'block';
    }

    seleccionarProductoIngrediente(productoId, nombre, precio) {
        const activeRow = document.querySelector('.ingrediente-row:hover');
        if (activeRow) {
            const nombreInput = activeRow.querySelector('.ingrediente-nombre');
            const precioInput = activeRow.querySelector('.ingrediente-precio');
            const productoIdInput = activeRow.querySelector('.ingrediente-productoid');
            
            if (nombreInput) nombreInput.value = nombre;
            if (precioInput) precioInput.value = precio;
            if (productoIdInput) productoIdInput.value = productoId;
            
            const suggestionsDiv = activeRow.querySelector('.ingrediente-suggestions');
            if (suggestionsDiv) suggestionsDiv.style.display = 'none';
            
            this.calcularCostosReceta();
        }
    }

    calcularCostosReceta() {
        const rows = document.querySelectorAll('.ingrediente-row');
        let costoTotal = 0;
        
        rows.forEach(row => {
            const nombreInput = row.querySelector('.ingrediente-nombre');
            const precioInput = row.querySelector('.ingrediente-precio');
            const cantidadInput = row.querySelector('.ingrediente-cantidad');
            const subtotalSpan = row.querySelector('.subtotal-valor');
            
            if (nombreInput && precioInput && cantidadInput) {
                const nombre = nombreInput.value.trim();
                const precio = parseFloat(precioInput.value) || 0;
                const cantidad = parseFloat(cantidadInput.value) || 0;
                
                if (nombre && precio > 0 && cantidad > 0) {
                    const subtotal = precio * cantidad;
                    costoTotal += subtotal;
                    if (subtotalSpan) subtotalSpan.textContent = subtotal.toFixed(0);
                    
                    row.style.backgroundColor = '#f9f9f9';
                } else {
                    row.style.backgroundColor = '#fff3cd';
                    if (subtotalSpan) subtotalSpan.textContent = '0';
                }
            }
        });
        
        const rinde = parseFloat(document.getElementById('recetaRinde')?.value) || 1;
        const costoPorUnidad = costoTotal / rinde;
        
        document.getElementById('costoTotalInsumos').textContent = costoTotal.toFixed(0);
        document.getElementById('costoPorUnidad').textContent = costoPorUnidad.toFixed(0);

        const productoId = document.getElementById('recetaProductoId')?.value;
        if (productoId) {
            const producto = storage.getProducto(productoId);
            if (producto) {
                const margen = producto.precioVenta - costoPorUnidad;
                const margenPorcentaje = ((margen / producto.precioVenta) * 100).toFixed(1);
                const margenDiv = document.getElementById('margenGanancia');
                if (margenDiv) {
                    margenDiv.innerHTML = `
                        <div style="background: ${margen >= 0 ? '#d4edda' : '#f8d7da'}; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <strong style="color: ${margen >= 0 ? '#155724' : '#721c24'}">
                                Precio Venta: $${producto.precioVenta} | 
                                Margen: $${margen.toFixed(0)} (${margenPorcentaje}%)
                            </strong>
                        </div>
                    `;
                }
            }
        }
    }

    mostrarModalNuevaReceta(productoVentaId = null) {
        console.log('🍳 Abriendo modal de receta manual...');
        
        const inventario = storage.getInventario();
        const productosVenta = inventario.filter(p => p.activo);
        
        let productoSeleccionado = null;
        if (productoVentaId) {
            productoSeleccionado = inventario.find(p => p.id === productoVentaId);
        }

        let productosVentaOptions = '<option value="">🔍 Selecciona un producto del inventario</option>';
        productosVenta.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(p => {
            const selected = (productoSeleccionado && productoSeleccionado.id === p.id) ? 'selected' : '';
            const tipoIcono = p.esKit ? '🍳' : '📦';
            productosVentaOptions += `<option value="${p.id}" data-precio="${p.precioVenta}" ${selected}>${tipoIcono} ${p.nombre} - $${p.precioVenta}</option>`;
        });

        const recetaExistente = productoVentaId ? this.recetas.find(r => r.productoId === productoVentaId) : null;

        const modalHTML = `
            <div class="modal-overlay active" id="modalNuevaReceta">
                <div class="modal-content" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white;">
                        <h3 style="color: white;"><i class="fas fa-utensils"></i> ${recetaExistente ? '✏️ Editar Receta: ' + productoSeleccionado?.nombre : '🍳 Crear Nueva Receta'}</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalNuevaReceta')" style="color: white;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formReceta" onsubmit="return false;">
                            <div class="card mb-4 p-4" style="background: #f0f7ff; border-left: 4px solid #3498db; border-radius: 8px;">
                                <h4 style="margin-top:0; color:#2980b9;"><i class="fas fa-shopping-cart"></i> Paso 1: ¿Qué producto preparas?</h4>
                                <div class="form-group">
                                    <label>Producto *</label>
                                    <select id="recetaProductoId" class="form-control" required onchange="window.app.calcularCostosReceta()">
                                        ${productosVentaOptions}
                                    </select>
                                    <small class="text-muted">Selecciona el producto que aparece en tu menú</small>
                                </div>
                            </div>

                            <div class="card mb-4 p-4" style="background: #f5f0ff; border-left: 4px solid #9b59b6; border-radius: 8px;">
                                <h4 style="margin-top:0; color:#8e44ad;"><i class="fas fa-cubes"></i> Paso 2: ¿Cuánto produces?</h4>
                                <div class="form-group">
                                    <label>Rinde para (cantidad de productos finales)</label>
                                    <input type="number" id="recetaRinde" class="form-control" value="${recetaExistente ? recetaExistente.rinde : 1}" min="1" oninput="window.app.calcularCostosReceta()">
                                    <small class="text-muted">Ej: 1 = para 1 unidad, 10 = para 10 unidades (lote, bandeja)</small>
                                </div>
                            </div>

                            <div class="card mb-4 p-4" style="background: #f0fff0; border-left: 4px solid #27ae60; border-radius: 8px;">
                                <h4 style="margin-top:0; color:#27ae60;"><i class="fas fa-carrot"></i> Paso 3: Agrega los ingredientes manualmente</h4>
                                <p class="text-muted mb-3">Escribe el nombre del ingrediente, su costo unitario y la cantidad que usas</p>
                                
                                <div id="listaIngredientesReceta" class="mb-3">
                                    ${recetaExistente ? '' : '<p class="text-center text-muted py-4">Haz clic en "Agregar Ingrediente" para comenzar</p>'}
                                </div>
                                
                                <button type="button" class="btn btn-success" onclick="window.app.agregarIngredienteManual()">
                                    <i class="fas fa-plus-circle"></i> Agregar Ingrediente
                                </button>
                                
                                <button type="button" class="btn btn-info ml-2" onclick="window.app.cargarIngredientesDesdeInventario()">
                                    <i class="fas fa-box"></i> Cargar desde Inventario
                                </button>
                            </div>

                            <div class="card mb-4 p-4" style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; border-radius: 8px;">
                                <h4 style="margin-top:0; color: white;"><i class="fas fa-chart-line"></i> 📊 Resumen de Costos</h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px;">
                                        <p style="margin:0; opacity:0.8; font-size: 14px;">Costo Total de Insumos:</p>
                                        <h2 style="margin:5px 0 0; font-size: 32px; font-weight: bold;" id="costoTotalInsumos">$0</h2>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px;">
                                        <p style="margin:0; opacity:0.8; font-size: 14px;">Costo por Unidad:</p>
                                        <h2 style="margin:5px 0 0; font-size: 32px; font-weight: bold;" id="costoPorUnidad">$0</h2>
                                    </div>
                                </div>
                                <div id="margenGanancia" class="mt-3"></div>
                            </div>

                            <div class="form-actions mt-4">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevaReceta')">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarRecetaManual()">
                                    <i class="fas fa-save"></i> Guardar Receta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.modalOpen = true;

        setTimeout(() => {
            if (recetaExistente) {
                recetaExistente.ingredientes.forEach(ing => {
                    this.agregarIngredienteManual({
                        nombre: ing.nombre,
                        precioUnitario: ing.precioUnitario,
                        cantidad: ing.cantidad,
                        productoId: ing.productoId || ''
                    });
                });
            }
            
            document.getElementById('recetaProductoId')?.addEventListener('change', () => this.calcularCostosReceta());
            document.getElementById('recetaRinde')?.addEventListener('input', () => this.calcularCostosReceta());
            
            this.calcularCostosReceta();
        }, 100);
    }

    cargarIngredientesDesdeInventario() {
        const inventario = storage.getInventario();
        const ingredientes = inventario.filter(p => !p.esKit && p.activo);
        
        if (ingredientes.length === 0) {
            this.mostrarMensaje('No hay ingredientes en el inventario', 'warning');
            return;
        }
        
        let ingredientesHTML = '<div style="max-height: 400px; overflow-y: auto;">';
        ingredientes.forEach(ing => {
            ingredientesHTML += `
                <div class="p-2 border-bottom" style="cursor: pointer;" onclick="window.app.seleccionarIngredienteInventario('${ing.id}', '${ing.nombre}', ${ing.costoUnitario || 0})">
                    <strong>${ing.nombre}</strong> - $${ing.costoUnitario || 0} (Stock: ${ing.unidades})
                </div>
            `;
        });
        ingredientesHTML += '</div>';
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalSeleccionarIngrediente">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-box"></i> Seleccionar Ingrediente</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalSeleccionarIngrediente')">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${ingredientesHTML}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML += modalHTML;
    }

    seleccionarIngredienteInventario(id, nombre, precio) {
        this.cerrarModal('modalSeleccionarIngrediente');
        this.agregarIngredienteManual({
            nombre: nombre,
            precioUnitario: precio,
            cantidad: 1,
            productoId: id
        });
    }

    guardarRecetaManual() {
        const productoId = document.getElementById('recetaProductoId')?.value;
        const rinde = parseInt(document.getElementById('recetaRinde')?.value) || 1;

        if (!productoId) {
            this.mostrarMensaje('❌ Debes seleccionar un producto', 'error');
            return;
        }

        const ingredientes = [];
        const rows = document.querySelectorAll('.ingrediente-row');
        
        for (const row of rows) {
            const nombreInput = row.querySelector('.ingrediente-nombre');
            const precioInput = row.querySelector('.ingrediente-precio');
            const cantidadInput = row.querySelector('.ingrediente-cantidad');
            const productoIdInput = row.querySelector('.ingrediente-productoid');
            
            const nombre = nombreInput?.value.trim();
            const precio = parseFloat(precioInput?.value);
            const cantidad = parseFloat(cantidadInput?.value);
            const prodId = productoIdInput?.value || '';
            
            if (nombre && precio > 0 && cantidad > 0) {
                ingredientes.push({
                    productoId: prodId,
                    nombre: nombre,
                    precioUnitario: precio,
                    cantidad: cantidad
                });
            }
        }

        if (ingredientes.length === 0) {
            this.mostrarMensaje('❌ La receta debe tener al menos un ingrediente válido', 'error');
            return;
        }

        const indexExistente = this.recetas.findIndex(r => r.productoId === productoId);
        
        const nuevaReceta = {
            id: productoId,
            productoId: productoId,
            rinde: rinde,
            ingredientes: ingredientes,
            fechaActualizacion: new Date().toISOString()
        };

        if (indexExistente > -1) {
            this.recetas[indexExistente] = nuevaReceta;
            this.mostrarMensaje('✅ Receta actualizada correctamente', 'success');
        } else {
            this.recetas.push(nuevaReceta);
            this.mostrarMensaje('✅ Receta guardada correctamente', 'success');
        }

        this.guardarRecetas();
        this.cerrarModal('modalNuevaReceta');
        
        if (this.currentView === 'inventario') {
            this.loadInventarioView();
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

    mostrarModalUsuarios() {
        const usuarios = this.usuarios || [];
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
            password: btoa(password),
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

    // ============================================
    // CLIENTES
    // ============================================

    cargarClientes() {
        let clientesGuardados = JSON.parse(localStorage.getItem('invplanet_clientes') || '[]');
        this.clientes = clientesGuardados.map(c => ({
            ...c,
            puntos: c.puntos || 0,
            totalCompras: c.totalCompras || 0,
            ultimaCompra: c.ultimaCompra || null
        }));
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
                    <td><span class="badge badge-points">${c.puntos || 0} pts</span></td>
                    <td>$${(c.totalCompras || 0).toLocaleString()}</td>
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
                <div class="modal-content" style="max-width: 1200px;">
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
                                        <th>Total Compras</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaClientes">
                                    ${clientesHTML || '<tr><td colspan="7" class="text-center">No hay clientes</td></tr>'}
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
                    <td><span class="badge badge-points">${c.puntos || 0} pts</span></td>
                    <td>$${(c.totalCompras || 0).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="window.app.editarCliente('${c.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        document.getElementById('tablaClientes').innerHTML = html || '<tr><td colspan="7" class="text-center">No hay resultados</td></tr>';
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
            puntos: 0,
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
                                <label>Puntos</label>
                                <input type="number" id="editClientePuntos" class="form-control" value="${cliente.puntos || 0}" min="0">
                                <small class="text-muted">Puntos acumulados</small>
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
                puntos: parseInt(document.getElementById('editClientePuntos')?.value) || this.clientes[index].puntos,
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
        this.mostrarMensaje('Función de proveedores - implementar según necesidad', 'info');
    }

    mostrarModalNuevoProveedor() {
        this.mostrarMensaje('Función de nuevo proveedor - implementar según necesidad', 'info');
    }

    // ============================================
    // PROMOCIONES
    // ============================================

    cargarPromociones() {
        this.promociones = JSON.parse(localStorage.getItem('invplanet_promociones') || '[]');
        console.log(`🎁 Promociones cargadas: ${this.promociones.length}`);
    }

    guardarPromociones() {
        localStorage.setItem('invplanet_promociones', JSON.stringify(this.promociones));
    }

    mostrarModalPromociones() {
        this.mostrarMensaje('Función de promociones - implementar según necesidad', 'info');
    }

    mostrarModalNuevaPromocion() {
        this.mostrarMensaje('Función de nueva promoción - implementar según necesidad', 'info');
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
            }
        }

        return { precioFinal, promocion: null };
    }

    // ============================================
    // MESAS
    // ============================================

    cargarMesas() {
        this.mesas = JSON.parse(localStorage.getItem('invplanet_mesas') || '[]');
        if (this.mesas.length === 0) {
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
        this.mesas.forEach(mesa => {
            const estadoColor = mesa.estado === 'disponible' ? 'success' : 
                               mesa.estado === 'ocupada' ? 'warning' : 'danger';
            mesasHTML += `
                <div class="mesa-card" style="border: 2px solid var(--${estadoColor}); padding: 15px; border-radius: 8px; text-align: center; cursor: pointer;" onclick="window.app.abrirMesa('${mesa.id}')">
                    <i class="fas fa-utensils"></i>
                    <h4>Mesa ${mesa.numero}</h4>
                    <span class="badge badge-${estadoColor}">${mesa.estado}</span>
                    ${mesa.comensales > 0 ? `<p>${mesa.comensales} comensales</p>` : ''}
                </div>
            `;
        });

        const modalHTML = `
            <div class="modal-overlay active" id="modalMapaMesas">
                <div class="modal-content" style="max-width: 900px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-utensils"></i> Mapa de Mesas</h3>
                        <button class="close-modal" onclick="window.app.cerrarModal('modalMapaMesas')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
                            ${mesasHTML}
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
        if (mesa) {
            if (mesa.estado === 'disponible') {
                const numComensales = prompt(`¿Cuántos comensales en mesa ${mesa.numero}?`, '2');
                if (numComensales) {
                    this.mostrarModalNuevaVenta();
                    setTimeout(() => {
                        const radioMesa = document.querySelector('input[name="tipoEntrega"][value="mesa"]');
                        if (radioMesa) radioMesa.click();
                        document.getElementById('mesaNumero').value = mesa.numero;
                        document.getElementById('comensalesMesa').value = numComensales;
                    }, 500);
                }
            } else {
                this.mostrarMensaje(`La mesa ${mesa.numero} está ${mesa.estado}`, 'warning');
            }
        }
    }

    // ============================================
    // CONFIGURACIÓN DE FIDELIZACIÓN
    // ============================================

    cargarConfiguracionFidelizacion() {
        const configGuardada = localStorage.getItem('invplanet_config_fidelizacion');
        if (configGuardada) {
            try {
                const config = JSON.parse(configGuardada);
                this.configFidelizacion = { ...this.configFidelizacion, ...config };
            } catch (e) {
                console.warn("Error cargando configuración de fidelización");
            }
        }
    }

    guardarConfiguracionFidelizacion(puntosPorCada, valorPuntoEnPesos, productosGratis) {
        this.configFidelizacion = {
            puntosPorCada: puntosPorCada,
            valorPuntoEnPesos: valorPuntoEnPesos,
            productosGratis: productosGratis || []
        };
        localStorage.setItem('invplanet_config_fidelizacion', JSON.stringify(this.configFidelizacion));
        this.mostrarMensaje('✅ Configuración de fidelización guardada', 'success');
    }

    agregarProductoGratisConfig(productoId, puntosNecesarios) {
        const producto = storage.getProducto(productoId);
        if (!producto) {
            this.mostrarMensaje('❌ Producto no encontrado', 'error');
            return;
        }
        this.configFidelizacion.productosGratis.push({
            productoId: productoId,
            nombre: producto.nombre,
            puntosNecesarios: puntosNecesarios
        });
        this.guardarConfiguracionFidelizacion(
            this.configFidelizacion.puntosPorCada,
            this.configFidelizacion.valorPuntoEnPesos,
            this.configFidelizacion.productosGratis
        );
    }

    eliminarProductoGratisConfig(index) {
        this.configFidelizacion.productosGratis.splice(index, 1);
        this.guardarConfiguracionFidelizacion(
            this.configFidelizacion.puntosPorCada,
            this.configFidelizacion.valorPuntoEnPesos,
            this.configFidelizacion.productosGratis
        );
    }

    // ============================================
    // CONFIGURACIÓN DE ENVÍO
    // ============================================

    cargarConfiguracionEnvio() {
        const configGuardada = localStorage.getItem('invplanet_config_envio');
        if (configGuardada) {
            try {
                this.configEnvio = JSON.parse(configGuardada);
                this.numeroWhatsApp = this.configEnvio.numeroWhatsApp || '+573243898130';
            } catch (e) {
                console.warn("Error cargando configuración de envío");
            }
        }
    }

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

            const user = this.getUsuarioActual();
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
                    localStorage.removeItem('invplanet_session');
                    window.location.href = 'index.html';
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
                            <button class="btn btn-recipe btn-block mt-2" onclick="window.app.mostrarModalNuevaReceta()">
                                <i class="fas fa-utensils"></i> Nueva Receta
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
    // INVENTARIO (ACTUALIZADO CON RECETAS)
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
                        <button class="btn btn-recipe" onclick="window.app.mostrarModalNuevaReceta()">
                            <i class="fas fa-utensils"></i> Nueva Receta
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
                                <th>Costo Prod.</th>
                                <th>Margen</th>
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

            const tipo = p.esKit ? '🍳 Kit' : '📦 Producto';
            
            const costoProduccion = this.calcularCostoProduccion(p.id);
            let costoDisplay = '-';
            let margenDisplay = '-';
            let margenClass = '';
            
            if (costoProduccion) {
                costoDisplay = `$${costoProduccion.costoPorUnidad.toFixed(0)}`;
                const margen = p.precioVenta - costoProduccion.costoPorUnidad;
                const margenPorcentaje = ((margen / p.precioVenta) * 100).toFixed(1);
                margenDisplay = `$${margen.toFixed(0)} (${margenPorcentaje}%)`;
                margenClass = margen >= 0 ? 'text-success' : 'text-danger';
            }

            html += `
                <tr>
                    <td>${p.codigo || 'N/A'}</td>
                    <td>
                        ${p.nombre}
                        ${this.recetas.some(r => r.productoId === p.id) ? '<span class="badge badge-recipe ml-2">🍳 Receta</span>' : ''}
                    </td>
                    <td>${categoria ? categoria.nombre : 'Sin categoría'}</td>
                    <td>${p.unidades}</td>
                    <td>$${p.precioVenta || 0}</td>
                    <td>${costoDisplay}</td>
                    <td class="${margenClass}">${margenDisplay}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="window.app.mostrarModalEditarProducto('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-recipe" onclick="window.app.mostrarModalNuevaReceta('${p.id}')">
                            <i class="fas fa-utensils"></i>
                        </button>
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
    // EDITAR PRODUCTO (con información de receta)
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

        let costoProduccionHTML = '';
        const costo = this.calcularCostoProduccion(producto.id);
        if (costo) {
            const margen = producto.precioVenta - costo.costoPorUnidad;
            const margenPorcentaje = ((margen / producto.precioVenta) * 100).toFixed(1);
            costoProduccionHTML = `
                <div class="alert alert-recipe mt-3">
                    <p><strong>🍳 Costo de Producción (según receta):</strong></p>
                    <p>Costo Insumos: $${costo.costoTotalInsumos.toFixed(0)} (rinde para ${costo.receta.rinde} uds)</p>
                    <p><strong>Costo por Unidad: $${costo.costoPorUnidad.toFixed(0)}</strong></p>
                    <p class="${margen >= 0 ? 'text-success' : 'text-danger'}">
                        Margen Bruto: $${margen.toFixed(0)} (${margenPorcentaje}%)
                    </p>
                    <button class="btn btn-sm btn-recipe" onclick="window.app.mostrarModalNuevaReceta('${producto.id}')">
                        <i class="fas fa-edit"></i> Editar Receta
                    </button>
                </div>
            `;
        }

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
                            
                            ${costoProduccionHTML}
                            
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
                            <div class="form-check mb-3">
                                <input type="checkbox" id="productoEsKit" class="form-check-input">
                                <label class="form-check-label">Es un kit (producto compuesto por varios ingredientes)</label>
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
            esKit: document.getElementById('productoEsKit')?.checked || false,
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
            const tieneReceta = this.recetas.some(r => r.productoId === id);
            if (tieneReceta) {
                if (confirm('Este producto tiene una receta asociada. ¿Eliminar también la receta?')) {
                    this.recetas = this.recetas.filter(r => r.productoId !== id);
                    this.guardarRecetas();
                }
            }
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
    // CATEGORÍAS
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
    // VENTAS (con verificación de recetas)
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
    // MODIFICAR VENTA (CORREGIDO)
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

        this.carritoModificacion = ventaOriginal.productos.map(p => ({
            productoId: p.productoId,
            nombre: p.nombre,
            codigo: p.codigo,
            precioUnitario: p.precioUnitario,
            cantidad: p.cantidad,
            subtotal: p.subtotal,
            stockDisponible: storage.getProducto(p.productoId)?.unidades || 0,
            nota: p.nota || '',
            adiciones: p.adiciones || [],
            esCanjePuntos: p.esCanjePuntos || false
        }));

        this.mostrarModalModificarVenta();
    }

    mostrarModalModificarVenta() {
        const productosDisponibles = storage.getInventario().filter(p => p.activo && p.unidades > 0);

        let productosHTML = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        productosDisponibles.forEach(producto => {
            productosHTML += `
                <div style="background: white; border: 2px solid #f39c12; border-radius: 12px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin:0;">${producto.nombre}</h4>
                            <small>Código: ${producto.codigo} | Stock: ${producto.unidades}</small>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.3em; color: #f39c12;">$${producto.precioVenta}</div>
                            <button class="btn btn-sm btn-warning" onclick="window.app.agregarAlCarritoModificacion('${producto.id}')">
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        productosHTML += '</div>';

        const modalHTML = `
            <div class="modal-overlay active" id="modalModificarVenta">
                <div class="modal-content" style="max-width: 1400px; width: 95%; height: 95vh;">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit" style="color: #f39c12;"></i> Modificar Venta #${this.ventaEnModificacion.numero}</h3>
                        <button class="close-modal" onclick="window.app.cancelarModificacion()">&times;</button>
                    </div>
                    <div class="modal-body" style="height: calc(95vh - 80px); padding: 25px; overflow-y: auto;">
                        <div style="display: flex; gap: 30px; height: 100%;">
                            <div style="flex: 1.5; display: flex; flex-direction: column; height: 100%; border-right: 2px solid #ecf0f1; padding-right: 25px;">
                                <h4 style="margin-bottom: 20px;">Agregar Productos</h4>
                                <div style="margin-bottom: 15px;">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-barcode"></i></span>
                                        <input type="text" class="form-control" id="codigoBarrasModificacion" placeholder="Escanear código de barras...">
                                        <button class="btn btn-warning" onclick="window.app.buscarPorCodigoBarrasModificacion()">Buscar</button>
                                    </div>
                                </div>
                                <div id="productosDisponiblesModificacion" style="flex: 1; overflow-y: auto; padding-right: 10px;">
                                    ${productosHTML}
                                </div>
                            </div>
                            <div style="flex: 1.5; display: flex; flex-direction: column; height: 100%;">
                                <div style="flex: 1; display: flex; flex-direction: column;">
                                    <h4>Carrito de Modificación</h4>
                                    <div id="carritoModificacionItems" style="flex: 1; overflow-y: auto; background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                        ${this.renderCarritoModificacion()}
                                    </div>
                                    <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 25px; border-radius: 16px; margin-bottom: 20px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                            <span>Subtotal:</span>
                                            <span style="font-weight: bold;" id="subtotalModificacion">$${this.calcularSubtotalModificacion().toLocaleString()}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: bold; border-top: 2px solid rgba(255,255,255,0.2); padding-top: 20px;">
                                            <span>TOTAL:</span>
                                            <span id="totalModificacion">$${this.calcularTotalModificacion().toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 15px;">
                                        <button class="btn btn-secondary" style="flex: 1;" onclick="window.app.cancelarModificacion()">Cancelar</button>
                                        <button class="btn btn-success" style="flex: 2;" onclick="window.app.guardarModificacionVenta()">Guardar Cambios</button>
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

    renderCarritoModificacion() {
        if (this.carritoModificacion.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-4x mb-3" style="color: #dcdde1;"></i>
                    <h5 style="color: #7f8c8d;">El carrito está vacío</h5>
                </div>
            `;
        }

        let html = '';
        this.carritoModificacion.forEach((item, i) => {
            let canjeHTML = item.esCanjePuntos ? '<span class="badge badge-points ml-2">🎁 Canje</span>' : '';

            html += `
                <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 10px; border: 1px solid #ecf0f1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 2;">
                            <strong style="font-size: 1.1em;">${item.nombre} ${canjeHTML}</strong><br>
                            <small style="color: #7f8c8d;">$${item.precioUnitario} c/u</small>
                            ${item.nota ? `<div style="font-size: 0.85em; color: #3498db;">📝 ${item.nota}</div>` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button class="btn btn-sm btn-outline-secondary" onclick="window.app.disminuirCantidadModificacion(${i})" style="width: 35px; height: 35px;" ${item.cantidad <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span style="font-weight: bold; min-width: 30px; text-align: center;">${item.cantidad}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="window.app.aumentarCantidadModificacion(${i})" style="width: 35px; height: 35px;" ${item.cantidad >= item.stockDisponible ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div style="text-align: right; min-width: 100px;">
                            <strong style="font-size: 1.2em; color: #27ae60;">$${item.subtotal}</strong>
                            <button class="btn btn-sm btn-link text-danger" onclick="window.app.eliminarDelCarritoModificacion(${i})">
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

    calcularTotalModificacion() {
        const subtotal = this.calcularSubtotalModificacion();
        const config = storage.getConfig?.() || {};
        const impuestoPorcentaje = (config.impuesto || 0) / 100;
        const impuesto = subtotal * impuestoPorcentaje;
        const valorDomicilio = this.ventaEnModificacion?.valorDomicilio || 0;
        return subtotal + impuesto + valorDomicilio;
    }

    actualizarCarritoModificacion() {
        const carritoItems = document.getElementById('carritoModificacionItems');
        if (carritoItems) {
            carritoItems.innerHTML = this.renderCarritoModificacion();
        }
        
        const subtotalEl = document.getElementById('subtotalModificacion');
        const totalEl = document.getElementById('totalModificacion');
        
        if (subtotalEl) subtotalEl.textContent = `$${this.calcularSubtotalModificacion().toLocaleString()}`;
        if (totalEl) totalEl.textContent = `$${this.calcularTotalModificacion().toLocaleString()}`;
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

        const existe = this.carritoModificacion.findIndex(i => i.productoId === productoId);

        if (existe !== -1) {
            if (this.carritoModificacion[existe].cantidad >= producto.unidades) {
                this.mostrarMensaje('⚠️ Stock máximo alcanzado', 'warning');
                return;
            }
            this.carritoModificacion[existe].cantidad++;
            this.carritoModificacion[existe].subtotal = this.carritoModificacion[existe].cantidad * this.carritoModificacion[existe].precioUnitario;
            this.mostrarMensaje(`✓ +1 ${producto.nombre}`, 'success');
        } else {
            const nota = prompt(`¿Nota para ${producto.nombre}?`, '');
            this.carritoModificacion.push({
                productoId: producto.id,
                nombre: producto.nombre,
                codigo: producto.codigo,
                precioUnitario: producto.precioVenta,
                cantidad: 1,
                subtotal: producto.precioVenta,
                stockDisponible: producto.unidades,
                nota: nota || '',
                adiciones: []
            });
            this.mostrarMensaje(`✓ ${producto.nombre} agregado`, 'success');
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
        this.mostrarMensaje(`🗑️ ${item.nombre} eliminado`, 'info');
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

        const productosOriginales = ventaOriginal.productos || [];
        const productosNuevos = this.carritoModificacion;

        const cantidadesOriginales = {};
        productosOriginales.forEach(p => {
            cantidadesOriginales[p.productoId] = p.cantidad;
        });

        const cantidadesNuevas = {};
        productosNuevos.forEach(item => {
            cantidadesNuevas[item.productoId] = (cantidadesNuevas[item.productoId] || 0) + item.cantidad;
        });

        for (const productoId in cantidadesNuevas) {
            const cantidadNueva = cantidadesNuevas[productoId];
            const cantidadOriginal = cantidadesOriginales[productoId] || 0;
            
            if (cantidadNueva > cantidadOriginal) {
                const diferencia = cantidadNueva - cantidadOriginal;
                const producto = storage.getProducto(productoId);
                if (producto) {
                    if (producto.unidades < diferencia) {
                        this.mostrarMensaje(`❌ Stock insuficiente de ${producto.nombre}`, 'error');
                        return;
                    }
                    producto.unidades -= diferencia;
                    storage.updateProducto(producto.id, { unidades: producto.unidades });
                }
            }
        }

        for (const productoId in cantidadesOriginales) {
            const cantidadOriginal = cantidadesOriginales[productoId];
            const cantidadNueva = cantidadesNuevas[productoId] || 0;
            
            if (cantidadNueva < cantidadOriginal) {
                const diferencia = cantidadOriginal - cantidadNueva;
                const producto = storage.getProducto(productoId);
                if (producto) {
                    producto.unidades += diferencia;
                    storage.updateProducto(producto.id, { unidades: producto.unidades });
                }
            }
        }

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
                adiciones: item.adiciones || [],
                esCanjePuntos: item.esCanjePuntos || false
            })),
            subtotal: subtotal,
            impuesto: impuesto,
            total: total,
            estado: 'modificada',
            fechaModificacion: new Date().toISOString(),
            modificacionDe: ventaOriginal.id
        };

        const nuevaVenta = {
            ...ventaModificada,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `${ventaOriginal.numero}-MOD`,
            fecha: new Date().toISOString()
        };

        storage.updateVenta?.(ventaOriginal.id, {
            estado: 'modificada',
            modificadaPor: nuevaVenta.id
        });

        const ventas = storage.getVentas?.() || [];
        ventas.push(nuevaVenta);
        storage.saveVentas?.(ventas);

        this.mostrarMensaje('✅ Venta modificada exitosamente', 'success');

        if (this.configEnvio.metodo === 'whatsapp' && this.configEnvio.numeroWhatsApp) {
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
    // ANULAR VENTA
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

        if (!confirm('¿Estás seguro de anular esta venta? Se devolverá el stock a inventario.')) {
            return;
        }

        venta.productos?.forEach(item => {
            const producto = storage.getProducto(item.productoId);
            if (producto) {
                producto.unidades += item.cantidad;
                storage.updateProducto(producto.id, { unidades: producto.unidades });
            }
        });

        if (venta.clienteId) {
            const cliente = this.clientes.find(c => c.id === venta.clienteId);
            if (cliente) {
                const puntosGanados = Math.floor(venta.total / this.configFidelizacion.puntosPorCada);
                cliente.puntos = Math.max(0, (cliente.puntos || 0) - puntosGanados);
                this.guardarClientes();
            }
        }

        venta.estado = 'anulada';
        venta.fechaAnulacion = new Date().toISOString();
        storage.updateVenta?.(id, { estado: 'anulada', fechaAnulacion: venta.fechaAnulacion });

        if (venta.tipoEntrega === 'mesa' && venta.mesaId) {
            const mesa = this.mesas.find(m => m.id === venta.mesaId);
            if (mesa) {
                mesa.estado = 'disponible';
                mesa.comensales = 0;
                mesa.pedidoActual = null;
                this.guardarMesas();
            }
        }

        this.mostrarMensaje('✅ Venta anulada exitosamente', 'success');
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
            if (p.esCanjePuntos) {
                mensaje += `   🎁 *Producto canjeado por puntos*\n`;
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

        if (venta.descuentoPuntos > 0) {
            mensaje += `\n🎁 *Descuento por puntos:* -$${venta.descuentoPuntos.toLocaleString()}`;
        }

        mensaje += `\n💵 *TOTAL:* $${venta.total.toLocaleString()}`;
        mensaje += `\n💳 *Método de pago:* ${venta.metodoPago}`;

        if (venta.estado === 'modificada') {
            mensaje += `\n\n⚠️ *ESTA ORDEN HA SIDO MODIFICADA*`;
        }

        mensaje += `\n\n✅ *Gracias por su compra!*`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const url = `https://wa.me/${this.numeroWhatsApp}?text=${mensajeCodificado}`;
        window.open(url, '_blank');

        this.mostrarMensaje('📱 Orden enviada por WhatsApp', 'success');
    }

    // ============================================
    // MODAL NUEVA VENTA (CORREGIDO - Cálculo de totales y domicilio)
    // ============================================

    mostrarModalNuevaVenta() {
        console.log('🛒 Abriendo modal de venta...');

        this.carritoVenta = [];
        this.puntosACanjear = 0;
        this.productoGratisSeleccionado = null;

        const inventario = storage.getInventario();
        const productosDisponibles = inventario.filter(p => p.activo === true && p.unidades > 0);

        let clientesOptions = '<option value="">Seleccionar o crear cliente</option>';
        this.clientes.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
            const puntos = c.puntos || 0;
            clientesOptions += `<option value="${c.id}" data-puntos="${puntos}">${c.nombre} (${puntos} pts)</option>`;
        });
        clientesOptions += '<option value="nuevo">-- Crear nuevo cliente --</option>';

        let productosHTML = '<div style="display: flex; flex-direction: column; gap: 15px;">';

        productosDisponibles.forEach((producto, index) => {
            let stockColor = '#27ae60';
            let stockText = `${producto.unidades} disponibles`;
            let advertenciaReceta = '';

            if (producto.esKit) {
                const tieneReceta = this.recetas.some(r => r.productoId === producto.id);
                if (!tieneReceta) {
                    stockColor = '#e74c3c';
                    stockText = `⚠️ Sin receta`;
                    advertenciaReceta = `<br><small class="text-danger">No tiene receta definida</small>`;
                }
            }

            productosHTML += `
                <div style="background: white; border: 2px solid #27ae60; border-radius: 12px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin:0;">${producto.nombre}</h4>
                            <small>Código: ${producto.codigo} | <span style="color: ${stockColor};">${stockText}</span>${advertenciaReceta}</small>
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

                            <div style="flex: 1.5; display: flex; flex-direction: column; height: 100%;">
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
                                    
                                    <div id="beneficiosClienteSection" style="margin-top: 15px; background: #f0f8ff; padding: 15px; border-radius: 10px; display: none;">
                                        <h5 style="color: #2c3e50;"><i class="fas fa-gift"></i> Beneficios del Cliente</h5>
                                        <p><strong>Puntos disponibles:</strong> <span id="puntosClienteDisplay">0</span></p>
                                        <div class="form-group" style="display: flex; gap: 10px;">
                                            <input type="number" id="puntosACanjearInput" class="form-control" placeholder="Puntos a canjear" min="0">
                                            <button class="btn btn-sm btn-primary" onclick="window.app.canjearPuntos()">Aplicar</button>
                                        </div>
                                    </div>
                                </div>

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

                                <div id="camposEntrega">
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
                                            <input type="number" id="valorDomicilio" class="form-control" value="0" min="0" step="500">
                                        </div>
                                    </div>
                                </div>

                                <div style="margin-bottom: 20px;">
                                    <label>Nota General</label>
                                    <textarea id="notaGeneral" class="form-control" rows="2" placeholder="Ej: Sin cebolla, salsa aparte..."></textarea>
                                </div>

                                <div style="flex: 1; display: flex; flex-direction: column;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                        <h4 style="margin:0;">Carrito</h4>
                                        <span class="badge badge-success" id="carritoItemsCount">0</span>
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
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; opacity: 0.9;" id="valorDomicilioDisplay">
                                            <span>Domicilio:</span>
                                            <span id="domicilioCarrito">$0</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; opacity: 0.9;">
                                            <span>Descuento puntos:</span>
                                            <span id="descuentoPuntosDisplay">-$0</span>
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

        document.getElementById('clienteVentaSelect')?.addEventListener('change', (e) => {
            const isNuevo = e.target.value === 'nuevo';
            document.getElementById('camposNuevoClienteVenta').style.display = isNuevo ? 'block' : 'none';
            if (!isNuevo && e.target.value) {
                this.actualizarBeneficiosCliente(e.target.value);
            } else {
                document.getElementById('beneficiosClienteSection').style.display = 'none';
            }
        });

        document.getElementById('valorDomicilio')?.addEventListener('input', () => {
            this.actualizarCarrito();
        });

        setTimeout(() => {
            document.getElementById('codigoBarrasInput')?.focus();
        }, 500);
    }

    // ============================================
    // FUNCIONES DE FIDELIZACIÓN
    // ============================================

    actualizarBeneficiosCliente(clienteId) {
        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        const puntos = cliente.puntos || 0;
        document.getElementById('puntosClienteDisplay').textContent = puntos;
        document.getElementById('puntosACanjearInput').value = '';
        document.getElementById('puntosACanjearInput').max = puntos;

        document.getElementById('beneficiosClienteSection').style.display = 'block';
    }

    canjearPuntos() {
        const puntosInput = document.getElementById('puntosACanjearInput');
        const puntosACanjear = parseInt(puntosInput.value);
        if (isNaN(puntosACanjear) || puntosACanjear <= 0) {
            this.mostrarMensaje('❌ Ingresa una cantidad válida de puntos', 'error');
            return;
        }

        const clienteSelect = document.getElementById('clienteVentaSelect');
        const clienteId = clienteSelect.value;
        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) {
            this.mostrarMensaje('❌ Selecciona un cliente primero', 'error');
            return;
        }

        if (puntosACanjear > (cliente.puntos || 0)) {
            this.mostrarMensaje('❌ El cliente no tiene suficientes puntos', 'error');
            return;
        }

        this.puntosACanjear = puntosACanjear;
        const descuento = puntosACanjear * this.configFidelizacion.valorPuntoEnPesos;
        document.getElementById('descuentoPuntosDisplay').textContent = `-$${descuento.toLocaleString()}`;

        this.actualizarCarrito();
        this.mostrarMensaje(`🎉 Descuento de $${descuento.toLocaleString()} aplicado`, 'success');
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

        if (producto.esKit) {
            const tieneReceta = this.recetas.some(r => r.productoId === producto.id);
            if (!tieneReceta) {
                this.mostrarMensaje('⚠️ Este producto no tiene receta definida', 'warning');
            }
        }

        const nota = prompt(`¿Nota para ${producto.nombre}?`, '');

        const existe = this.carritoVenta.findIndex(i => i.productoId === productoId);

        if (existe !== -1) {
            if (this.carritoVenta[existe].cantidad >= producto.unidades) {
                this.mostrarMensaje('⚠️ Stock máximo alcanzado', 'warning');
                return;
            }
            this.carritoVenta[existe].cantidad++;
            this.carritoVenta[existe].subtotal = this.carritoVenta[existe].cantidad * this.carritoVenta[existe].precioUnitario;
            if (nota) this.carritoVenta[existe].nota = nota;
            this.mostrarMensaje(`✓ +1 ${producto.nombre}`, 'success');
        } else {
            this.carritoVenta.push({
                productoId: producto.id,
                nombre: producto.nombre,
                codigo: producto.codigo,
                precioUnitario: producto.precioVenta,
                cantidad: 1,
                subtotal: producto.precioVenta,
                stockDisponible: producto.unidades,
                esKit: producto.esKit || false,
                nota: nota || '',
                esCanjePuntos: false
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
        const descuentoPuntosEl = document.getElementById('descuentoPuntosDisplay');
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
            if (descuentoPuntosEl) descuentoPuntosEl.textContent = '-$0';
            if (totalEl) totalEl.textContent = '$0';
            return;
        }

        let html = '';
        let subtotal = 0;

        this.carritoVenta.forEach((item, i) => {
            subtotal += item.subtotal;

            html += `
                <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 10px; border: 1px solid #ecf0f1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 2;">
                            <strong style="font-size: 1.1em;">${item.nombre}</strong><br>
                            <small style="color: #7f8c8d;">$${item.precioUnitario} c/u</small>
                            ${item.nota ? `<div style="font-size: 0.85em; color: #3498db;">📝 ${item.nota}</div>` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button class="btn btn-sm btn-outline-secondary" onclick="window.app.disminuirCantidad(${i})" style="width: 35px; height: 35px;" ${item.cantidad <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span style="font-weight: bold; min-width: 30px; text-align: center;">${item.cantidad}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="window.app.aumentarCantidad(${i})" style="width: 35px; height: 35px;" ${item.cantidad >= item.stockDisponible ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div style="text-align: right; min-width: 100px;">
                            <strong style="font-size: 1.2em; color: #27ae60;">$${item.subtotal}</strong>
                            <button class="btn btn-sm btn-link text-danger" onclick="window.app.eliminarDelCarrito(${i})">
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
        
        const valorDomicilio = document.querySelector('input[name="tipoEntrega"]:checked')?.value === 'domicilio' 
            ? parseFloat(document.getElementById('valorDomicilio')?.value) || 0 
            : 0;
        
        const descuentoPuntos = this.puntosACanjear * (this.configFidelizacion.valorPuntoEnPesos || 100);
        const total = subtotal + impuesto + valorDomicilio - descuentoPuntos;

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
        if (impuestoEl) impuestoEl.textContent = `$${impuesto.toLocaleString()}`;
        if (domicilioEl) domicilioEl.textContent = `$${valorDomicilio.toLocaleString()}`;
        if (descuentoPuntosEl) descuentoPuntosEl.textContent = `-$${descuentoPuntos.toLocaleString()}`;
        if (totalEl) totalEl.textContent = `$${Math.max(0, total).toLocaleString()}`;
    }

    aumentarCantidad(index) {
        const item = this.carritoVenta[index];
        if (item.cantidad < item.stockDisponible) {
            item.cantidad++;
            item.subtotal = item.cantidad * item.precioUnitario;
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
            this.puntosACanjear = 0;
            this.actualizarCarrito();
            document.getElementById('descuentoPuntosDisplay').textContent = '-$0';
            this.mostrarMensaje('🧹 Carrito limpiado', 'success');
        }
    }

    finalizarVenta() {
        if (this.carritoVenta.length === 0) {
            this.mostrarMensaje('❌ El carrito está vacío', 'error');
            return;
        }

        const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked')?.value || 'mesa';

        if (tipoEntrega === 'domicilio') {
            const direccion = document.getElementById('domicilioDireccion')?.value;
            const telefono = document.getElementById('domicilioTelefono')?.value;
            if (!direccion || !telefono) {
                this.mostrarMensaje('❌ Completa los campos obligatorios del domicilio', 'error');
                return;
            }
        }

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
                puntos: 0,
                totalCompras: 0,
                ultimaCompra: null,
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

        if (!confirm('¿Confirmar la venta?')) {
            return;
        }

        const config = storage.getConfig?.() || {};
        const impuestoPorcentaje = (config.impuesto || 0) / 100;

        const metodoPago = document.getElementById('metodoPago')?.value || 'efectivo';
        const notaGeneral = document.getElementById('notaGeneral')?.value || '';
        const direccion = document.getElementById('domicilioDireccion')?.value || '';
        const referencia = document.getElementById('domicilioReferencia')?.value || '';
        const telefono = document.getElementById('domicilioTelefono')?.value || '';
        const valorDomicilio = tipoEntrega === 'domicilio' ? parseFloat(document.getElementById('valorDomicilio')?.value) || 0 : 0;
        const mesaNumero = document.getElementById('mesaNumero')?.value || '';
        const comensales = parseInt(document.getElementById('comensalesMesa')?.value) || 1;

        const subtotal = this.carritoVenta.reduce((sum, item) => sum + item.subtotal, 0);
        const impuesto = subtotal * impuestoPorcentaje;
        const descuentoPuntos = this.puntosACanjear * (this.configFidelizacion.valorPuntoEnPesos || 100);
        const total = subtotal + impuesto + valorDomicilio - descuentoPuntos;

        const venta = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            numero: `FAC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String((storage.getVentas?.() || []).length + 1).padStart(5, '0')}`,
            fecha: new Date().toISOString(),
            cliente: clienteNombre,
            clienteId: clienteId,
            tipoEntrega: tipoEntrega,
            direccion: direccion,
            referencia: referencia,
            telefono: telefono,
            valorDomicilio: valorDomicilio,
            mesa: mesaNumero,
            comensales: comensales,
            productos: this.carritoVenta.map(item => ({
                productoId: item.productoId,
                nombre: item.nombre,
                codigo: item.codigo,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.subtotal,
                nota: item.nota || '',
                esCanjePuntos: item.esCanjePuntos || false
            })),
            notaGeneral: notaGeneral,
            subtotal: subtotal,
            impuesto: impuesto,
            descuentoPuntos: descuentoPuntos,
            puntosCanjeados: this.puntosACanjear,
            total: total,
            metodoPago: metodoPago,
            estado: 'completada'
        };

        this.carritoVenta.forEach(item => {
            if (item.esCanjePuntos) return;
            const producto = storage.getProducto(item.productoId);
            if (producto) {
                producto.unidades -= item.cantidad;
                storage.updateProducto(producto.id, { unidades: producto.unidades });
            }
        });

        const ventas = storage.getVentas?.() || [];
        ventas.push(venta);
        storage.saveVentas?.(ventas);

        if (clienteId) {
            const cliente = this.clientes.find(c => c.id === clienteId);
            if (cliente) {
                const puntosGanados = Math.floor(total / this.configFidelizacion.puntosPorCada);
                cliente.puntos = (cliente.puntos || 0) + puntosGanados;
                if (this.puntosACanjear > 0) {
                    cliente.puntos -= this.puntosACanjear;
                }
                cliente.totalCompras = (cliente.totalCompras || 0) + total;
                cliente.ultimaCompra = new Date().toISOString();
                this.guardarClientes();
                this.mostrarMensaje(`🎉 ¡Ganaste ${puntosGanados} puntos! Total: ${cliente.puntos} puntos`, 'success');
            }
        }

        this.mostrarMensaje('✅ Venta realizada exitosamente', 'success');

        if (this.configEnvio.metodo === 'whatsapp' && this.configEnvio.numeroWhatsApp) {
            if (confirm('¿Enviar orden por WhatsApp?')) {
                this.enviarWhatsApp(venta.id);
            }
        }

        setTimeout(() => {
            this.generarFactura(venta);
            this.cerrarModal('modalNuevaVenta');
            this.carritoVenta = [];
            this.puntosACanjear = 0;
            this.loadVentasView();
        }, 1500);
    }

    // ============================================
    // FACTURACIÓN
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
                            <p><strong>Estado:</strong> <span class="badge badge-${venta.estado}">${venta.estado}</span></p>
                            ${venta.descuentoPuntos > 0 ? `<p><strong>Descuento por puntos:</strong> $${venta.descuentoPuntos.toLocaleString()}</p>` : ''}
                        </div>

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
                                ${venta.productos.map(p => `
                                    <tr>
                                        <td>${p.nombre} ${p.esCanjePuntos ? '🎁' : ''}</td>
                                        <td>${p.cantidad}</td>
                                        <td>$${p.precioUnitario}</td>
                                        <td>$${p.subtotal}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div style="margin-top: 20px; text-align: right;">
                            <p><strong>Subtotal:</strong> $${venta.subtotal.toLocaleString()}</p>
                            ${venta.impuesto > 0 ? `<p><strong>Impuesto:</strong> $${venta.impuesto.toLocaleString()}</p>` : ''}
                            ${venta.descuentoPuntos > 0 ? `<p><strong>Descuento por puntos:</strong> $${venta.descuentoPuntos.toLocaleString()}</p>` : ''}
                            <h3><strong>TOTAL:</strong> $${venta.total.toLocaleString()}</h3>
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
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .totales { text-align: right; }
                    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="empresa">${nombreNegocio}</div>
                </div>
                <div class="factura-info">
                    <h2>FACTURA</h2>
                    <p><strong>Número:</strong> ${venta.numero}</p>
                    <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}</p>
                    <p><strong>Cliente:</strong> ${venta.cliente}</p>
                </div>
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
                        ${venta.productos.map(p => `
                            <tr>
                                <td>${p.nombre}</td>
                                <td>${p.cantidad}</td>
                                <td>$${p.precioUnitario}</td>
                                <td>$${p.subtotal}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totales">
                    <p><strong>Subtotal:</strong> $${venta.subtotal.toLocaleString()}</p>
                    ${venta.impuesto > 0 ? `<p><strong>Impuesto:</strong> $${venta.impuesto.toLocaleString()}</p>` : ''}
                    ${venta.descuentoPuntos > 0 ? `<p><strong>Descuento por puntos:</strong> $${venta.descuentoPuntos.toLocaleString()}</p>` : ''}
                    <h2><strong>TOTAL:</strong> $${venta.total.toLocaleString()}</h2>
                </div>
                <div class="footer">
                    <p>¡Gracias por su compra!</p>
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
        this.mostrarMensaje(`📧 Factura enviada (simulación)`, 'success');
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
        `;
    }

    renderTablaGastos(gastos) {
        if (gastos.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center">
                        <i class="fas fa-money-bill-wave fa-3x mb-3" style="color: #ddd;"></i>
                        <h4>No hay gastos registrados</h4>
                        <button class="btn btn-primary" onclick="window.app.mostrarModalNuevoGasto()">
                            <i class="fas fa-plus"></i> Nuevo Gasto
                        </button>
                    </td>
                </tr>
            `;
        }

        let html = '';
        gastos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(g => {
            const fecha = new Date(g.fecha);
            html += `
                <tr>
                    <td>${fecha.toLocaleDateString()}</td>
                    <td>${g.descripcion}</td>
                    <td><span class="badge badge-info">${g.categoria}</span></td>
                    <td>$${g.monto.toLocaleString()}</td>
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
            g.descripcion?.toLowerCase().includes(query)
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
                                <input type="text" id="gastoDescripcion" class="form-control" required>
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
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalNuevoGasto')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarNuevoGasto()">Guardar</button>
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
            fechaRegistro: new Date().toISOString()
        };

        storage.addGasto?.(nuevoGasto);
        this.mostrarMensaje('✅ Gasto registrado', 'success');
        this.cerrarModal('modalNuevoGasto');
        setTimeout(() => this.loadGastosView(), 300);
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
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="window.app.cerrarModal('modalEditarGasto')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="window.app.guardarEdicionGasto()">Guardar Cambios</button>
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
            fechaActualizacion: new Date().toISOString()
        };

        storage.updateGasto?.(id, gastoActualizado);
        this.mostrarMensaje('✅ Gasto actualizado', 'success');
        this.cerrarModal('modalEditarGasto');
        setTimeout(() => this.loadGastosView(), 300);
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
    // REPORTES (actualizado con recetas)
    // ============================================

    loadReportesView() {
        const ventas = storage.getVentas?.() || [];
        const gastos = storage.getGastos?.() || [];
        const inventario = storage.getInventario();

        const ventasCompletadas = ventas.filter(v => v.estado === 'completada');
        const ventasModificadas = ventas.filter(v => v.estado === 'modificada');
        
        const totalVentas = [...ventasCompletadas, ...ventasModificadas].reduce((s, v) => s + (v.total || 0), 0);
        const totalGastos = gastos.reduce((s, g) => s + (g.monto || 0), 0);
        const utilidad = totalVentas - totalGastos;

        let recetasHTML = '';
        this.recetas.forEach(receta => {
            const producto = storage.getProducto(receta.productoId);
            if (!producto) return;
            
            const costo = this.calcularCostoProduccion(receta.productoId);
            if (!costo) return;
            
            const margen = producto.precioVenta - costo.costoPorUnidad;
            const margenPorcentaje = ((margen / producto.precioVenta) * 100).toFixed(1);
            
            recetasHTML += `
                <div class="receta-reporte-card">
                    <div class="receta-reporte-header">
                        <div class="receta-reporte-icon">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <div class="receta-reporte-info">
                            <h4>${producto.nombre}</h4>
                            <small>${receta.ingredientes.length} ingredientes</small>
                        </div>
                    </div>
                    <div class="receta-reporte-stats">
                        <div class="stat-item">
                            <span class="label">Precio Venta</span>
                            <span class="value">$${producto.precioVenta}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">Costo Unit.</span>
                            <span class="value">$${costo.costoPorUnidad.toFixed(0)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">Margen</span>
                            <span class="value ${margen >= 0 ? 'positive' : 'negative'}">$${margen.toFixed(0)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">% Margen</span>
                            <span class="value ${margen >= 0 ? 'positive' : 'negative'}">${margenPorcentaje}%</span>
                        </div>
                    </div>
                </div>
            `;
        });

        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="reportes-view">
                <h2 class="section-title">
                    <i class="fas fa-chart-line"></i> Reportes
                </h2>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #3498db;">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3>$${totalVentas.toLocaleString()}</h3>
                            <p>Total Ventas</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #e74c3c;">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="stat-info">
                            <h3>$${totalGastos.toLocaleString()}</h3>
                            <p>Total Gastos</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: ${utilidad >= 0 ? '#2ecc71' : '#e74c3c'};">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3>$${utilidad.toLocaleString()}</h3>
                            <p>Utilidad Neta</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-section">
                    <h3><i class="fas fa-utensils" style="color: #9b59b6;"></i> Análisis de Recetas</h3>
                    <div class="recetas-reporte">
                        ${recetasHTML || '<p class="text-center">No hay recetas registradas</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // CONFIGURACIÓN
    // ============================================

    loadConfiguracionView() {
        const config = storage.getConfig?.() || {};

        const contentArea = document.getElementById('mainContent');
        contentArea.innerHTML = `
            <div class="configuracion-view">
                <h2 class="section-title">
                    <i class="fas fa-cog"></i> Configuración
                </h2>

                <div class="config-grid">
                    <div class="config-card">
                        <h3><i class="fas fa-store"></i> Negocio</h3>
                        <div class="form-group">
                            <label>Nombre</label>
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
                        <button class="btn btn-primary" onclick="window.app.guardarConfigNegocio()">Guardar</button>
                    </div>

                    <div class="config-card">
                        <h3><i class="fas fa-dollar-sign"></i> Finanzas</h3>
                        <div class="form-group">
                            <label>Impuesto (%)</label>
                            <input type="number" id="configImpuesto" class="form-control" value="${config.impuesto || 0}">
                        </div>
                        <div class="form-group">
                            <label>Stock Mínimo</label>
                            <input type="number" id="configStockMinimo" class="form-control" value="${config.stockMinimoDefault || 10}">
                        </div>
                        <button class="btn btn-primary" onclick="window.app.guardarConfigFinanzas()">Guardar</button>
                    </div>

                    <div class="config-card">
                        <h3><i class="fas fa-gift" style="color: #9b59b6;"></i> Puntos</h3>
                        <div class="form-group">
                            <label>Puntos por cada $</label>
                            <input type="number" id="configPuntosPorCada" class="form-control" value="${this.configFidelizacion.puntosPorCada}">
                        </div>
                        <div class="form-group">
                            <label>Valor por punto ($)</label>
                            <input type="number" id="configValorPunto" class="form-control" value="${this.configFidelizacion.valorPuntoEnPesos}">
                        </div>
                        <button class="btn btn-primary" onclick="window.app.guardarConfigFidelizacion()">Guardar Puntos</button>
                    </div>

                    <div class="config-card">
                        <h3><i class="fas fa-paper-plane"></i> Envío</h3>
                        <div class="form-group">
                            <label>Método</label>
                            <select id="configMetodoEnvio" class="form-control">
                                <option value="whatsapp" ${this.configEnvio.metodo === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                                <option value="impresora" ${this.configEnvio.metodo === 'impresora' ? 'selected' : ''}>Impresora</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Número WhatsApp</label>
                            <input type="text" id="configNumeroWhatsApp" class="form-control" value="${this.configEnvio.numeroWhatsApp || ''}">
                        </div>
                        <button class="btn btn-primary" onclick="window.app.guardarConfigEnvio()">Guardar</button>
                    </div>
                </div>
            </div>
        `;
    }

    guardarConfigNegocio() {
        const config = {
            nombreNegocio: document.getElementById('configNombre')?.value,
            direccion: document.getElementById('configDireccion')?.value,
            telefono: document.getElementById('configTelefono')?.value
        };
        storage.updateConfig?.(config);
        this.cargarNombreNegocio();
        this.mostrarMensaje('✅ Configuración guardada', 'success');
    }

    guardarConfigFinanzas() {
        const config = {
            impuesto: parseInt(document.getElementById('configImpuesto')?.value) || 0,
            stockMinimoDefault: parseInt(document.getElementById('configStockMinimo')?.value) || 10
        };
        storage.updateConfig?.(config);
        this.mostrarMensaje('✅ Configuración financiera guardada', 'success');
    }

    guardarConfigFidelizacion() {
        const puntosPorCada = parseInt(document.getElementById('configPuntosPorCada')?.value) || 1000;
        const valorPunto = parseInt(document.getElementById('configValorPunto')?.value) || 100;
        this.guardarConfiguracionFidelizacion(puntosPorCada, valorPunto, this.configFidelizacion.productosGratis);
    }

    guardarConfigEnvio() {
        const metodo = document.getElementById('configMetodoEnvio')?.value || 'whatsapp';
        const numeroWhatsApp = document.getElementById('configNumeroWhatsApp')?.value;
        this.guardarConfiguracionEnvio(metodo, numeroWhatsApp);
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    exportarVentas() {
        if (storage.exportVentas) {
            storage.exportVentas();
            this.mostrarMensaje('✅ Ventas exportadas', 'success');
        }
    }

    mostrarAyudaLectorBarra() {
        alert('Coloca el cursor en el campo de código de barras y escanea el producto.');
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        console.log(`📢 ${tipo}: ${mensaje}`);

        const anteriores = document.querySelectorAll('.mensaje-flotante');
        anteriores.forEach(a => a.remove());

        const div = document.createElement('div');
        div.className = `mensaje-flotante ${tipo}`;
        div.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensaje}</span>
        `;

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

window.initializeApp = initializeApp;

// Funciones globales
window.mostrarModalNuevoProducto = () => app.mostrarModalNuevoProducto();
window.mostrarModalEditarProducto = (id) => app.mostrarModalEditarProducto(id);
window.mostrarModalNuevaCategoria = () => app.mostrarModalNuevaCategoria();
window.mostrarModalEditarCategoria = (id) => app.mostrarModalEditarCategoria(id);
window.mostrarModalNuevaVenta = () => app.mostrarModalNuevaVenta();
window.mostrarModalNuevoGasto = () => app.mostrarModalNuevoGasto();
window.mostrarModalEditarGasto = (id) => app.mostrarModalEditarGasto(id);
window.mostrarModalUsuarios = () => app.mostrarModalUsuarios();
window.mostrarModalClientes = () => app.mostrarModalClientes();
window.mostrarModalNuevoCliente = () => app.mostrarModalNuevoCliente();
window.mostrarModalProveedores = () => app.mostrarModalProveedores();
window.mostrarModalNuevoProveedor = () => app.mostrarModalNuevoProveedor();
window.mostrarModalPromociones = () => app.mostrarModalPromociones();
window.mostrarModalNuevaPromocion = () => app.mostrarModalNuevaPromocion();
window.mostrarMapaMesas = () => app.mostrarMapaMesas();
window.mostrarModalNuevaReceta = (productoId) => app.mostrarModalNuevaReceta(productoId);

console.log('%c✅ InvPlanet App v4.1 - CORREGIDO (Ventas y Domicilio)', 'background: #9b59b6; color: white; padding: 10px; border-radius: 5px;');