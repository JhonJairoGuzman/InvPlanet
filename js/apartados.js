// js/apartados.js - MÓDULO DE APARTADOS
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarApartados = function() {
    this.apartados = JSON.parse(localStorage.getItem('invplanet_apartados') || '[]');
    console.log(`📦 Apartados cargados: ${this.apartados.length}`);
};

InvPlanetApp.prototype.guardarApartados = function() {
    localStorage.setItem('invplanet_apartados', JSON.stringify(this.apartados));
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalApartados = function() {
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
                    <button class="btn btn-sm btn-success" onclick="app.cobrarApartado('${a.id}')">
                        <i class="fas fa-cash-register"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.cancelarApartado('${a.id}')">
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
                    <button class="close-modal" onclick="cerrarModal('modalApartados')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevoApartado()">
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
    this.modalOpen = true;
};

// ============================================
// NUEVO APARTADO
// ============================================

InvPlanetApp.prototype.mostrarModalNuevoApartado = function() {
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
                    <button class="close-modal" onclick="cerrarModal('modalNuevoApartado')">&times;</button>
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
                        
                        <button type="button" class="btn btn-info mb-3" onclick="app.agregarProductoApartado()">
                            <i class="fas fa-plus"></i> Agregar producto
                        </button>
                        
                        <div class="form-group">
                            <label>Seña ($) *</label>
                            <input type="number" id="apartadoSena" class="form-control" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Fecha límite</label>
                            <input type="date" id="apartadoFechaLimite" class="form-control" value="${sumarDias(new Date(), 30).toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevoApartado')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevoApartado()">Guardar Apartado</button>
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
};

InvPlanetApp.prototype.agregarProductoApartado = function() {
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
};

InvPlanetApp.prototype.guardarNuevoApartado = function() {
    let clienteId = document.getElementById('apartadoClienteId')?.value;
    let clienteNombre = '';
    
    if (clienteId === 'nuevo') {
        const nombre = document.getElementById('apartadoNuevoCliente')?.value;
        if (!nombre) {
            mostrarMensaje('❌ Ingresa el nombre del cliente', 'error');
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
            if (producto.unidades < cantidad) {
                mostrarMensaje(`❌ Stock insuficiente para ${producto.nombre}`, 'error');
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
    mostrarMensaje('✅ Apartado guardado', 'success');
    cerrarModal('modalNuevoApartado');
    this.mostrarModalApartados();
};

// ============================================
// COBRAR APARTADO
// ============================================

InvPlanetApp.prototype.cobrarApartado = function(id) {
    const apartado = this.apartados.find(a => a.id === id);
    if (!apartado) return;
    
    if (apartado.pagado) {
        mostrarMensaje('⚠️ Este apartado ya fue pagado', 'warning');
        return;
    }
    
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
    
    mostrarMensaje('✅ Apartado cobrado exitosamente', 'success');
    this.mostrarModalApartados();
};

// ============================================
// CANCELAR APARTADO
// ============================================

InvPlanetApp.prototype.cancelarApartado = function(id) {
    const apartado = this.apartados.find(a => a.id === id);
    if (!apartado) return;
    
    if (apartado.pagado) {
        mostrarMensaje('⚠️ No se puede cancelar un apartado pagado', 'error');
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
    
    mostrarMensaje('✅ Apartado cancelado', 'success');
    this.mostrarModalApartados();
};

console.log('✅ Módulo de Apartados cargado');