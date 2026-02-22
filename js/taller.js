// js/taller.js - MÓDULO DE TALLER Y SERVICIOS
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarTecnicos = function() {
    this.tecnicos = JSON.parse(localStorage.getItem('invplanet_tecnicos') || '[]');
    if (this.tecnicos.length === 0) {
        this.tecnicos = [
            { id: 'tec1', nombre: 'Carlos Martínez', especialidad: 'Mecánica general', valorHora: 25000 },
            { id: 'tec2', nombre: 'Juan Pérez', especialidad: 'Electricidad', valorHora: 28000 },
            { id: 'tec3', nombre: 'Andrés López', especialidad: 'Diagnóstico', valorHora: 30000 }
        ];
        this.guardarTecnicos();
    }
    console.log(`🔧 Técnicos cargados: ${this.tecnicos.length}`);
};

InvPlanetApp.prototype.guardarTecnicos = function() {
    localStorage.setItem('invplanet_tecnicos', JSON.stringify(this.tecnicos));
};

InvPlanetApp.prototype.cargarOrdenesTrabajo = function() {
    this.ordenesTrabajo = JSON.parse(localStorage.getItem('invplanet_ordenes_trabajo') || '[]');
    console.log(`📋 Órdenes de trabajo cargadas: ${this.ordenesTrabajo.length}`);
};

InvPlanetApp.prototype.guardarOrdenesTrabajo = function() {
    localStorage.setItem('invplanet_ordenes_trabajo', JSON.stringify(this.ordenesTrabajo));
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalOrdenesTrabajo = function() {
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
                    <button class="btn btn-sm btn-info" onclick="app.verDetalleOrdenTrabajo('${o.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.imprimirOrdenTrabajo('${o.id}')">
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
                    <button class="close-modal" onclick="cerrarModal('modalOrdenesTrabajo')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.mostrarModalNuevaOrdenTrabajo()">
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
};

// ============================================
// NUEVA ORDEN DE TRABAJO
// ============================================

InvPlanetApp.prototype.mostrarModalNuevaOrdenTrabajo = function() {
    let clientesOptions = '<option value="">Seleccionar cliente</option>';
    this.clientes.forEach(c => {
        clientesOptions += `<option value="${c.id}">${c.nombre}</option>`;
    });
    clientesOptions += '<option value="nuevo">-- Crear nuevo cliente --</option>';

    let vehiculosOptions = '<option value="">Seleccionar vehículo</option>';
    this.vehiculos.forEach(v => {
        vehiculosOptions += `<option value="${v.id}">${v.placa} - ${v.marca} ${v.modelo}</option>`;
    });

    let tecnicosOptions = '<option value="">Seleccionar técnico</option>';
    this.tecnicos.forEach(t => {
        tecnicosOptions += `<option value="${t.id}" data-valorhora="${t.valorHora}">${t.nombre} - ${t.especialidad} ($${t.valorHora}/hora)</option>`;
    });

    const productos = storage.getInventario().filter(p => p.activo && p.unidades > 0);
    let productosOptions = '<option value="">Seleccionar repuesto</option>';
    productos.forEach(p => {
        productosOptions += `<option value="${p.id}" data-precio="${p.precioVenta}">${p.nombre} - $${p.precioVenta} (Stock: ${p.unidades})</option>`;
    });

    const modalHTML = `
        <div class="modal-overlay active" id="modalNuevaOrdenTrabajo">
            <div class="modal-content" style="max-width: 1200px; width: 90%; height: 90vh;">
                <div class="modal-header">
                    <h3><i class="fas fa-plus-circle"></i> Nueva Orden de Trabajo</h3>
                    <button class="close-modal" onclick="cerrarModal('modalNuevaOrdenTrabajo')">&times;</button>
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
                                <button type="button" class="btn btn-info btn-sm" onclick="app.agregarRepuestoOrden()">
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
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevaOrdenTrabajo')">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevaOrdenTrabajo()">
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
};

InvPlanetApp.prototype.agregarRepuestoOrden = function() {
    const productos = storage.getInventario().filter(p => p.activo && p.unidades > 0);
    let productosOptions = '<option value="">Seleccionar repuesto</option>';
    productos.forEach(p => {
        productosOptions += `<option value="${p.id}" data-precio="${p.precioVenta}">${p.nombre} - $${p.precioVenta} (Stock: ${p.unidades})</option>`;
    });

    const div = document.createElement('div');
    div.className = 'row mb-2';
    div.innerHTML = `
        <div class="col-md-5">
            <select class="form-control repuesto-producto" name="repuestoProducto[]" onchange="app.actualizarPrecioRepuesto(this)">
                ${productosOptions}
            </select>
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control repuesto-cantidad" name="repuestoCantidad[]" value="1" min="1" onchange="app.calcularTotalesOrden()">
        </div>
        <div class="col-md-3">
            <input type="text" class="form-control repuesto-precio" name="repuestoPrecio[]" readonly placeholder="Precio">
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove(); app.calcularTotalesOrden()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    document.getElementById('repuestosOrden').appendChild(div);
};

InvPlanetApp.prototype.actualizarPrecioRepuesto = function(select) {
    const row = select.closest('.row');
    const precioInput = row.querySelector('.repuesto-precio');
    const option = select.options[select.selectedIndex];
    const precio = option.getAttribute('data-precio') || 0;
    precioInput.value = precio;
    this.calcularTotalesOrden();
};

InvPlanetApp.prototype.calcularTotalesOrden = function() {
    const horas = parseFloat(document.getElementById('ordenHoras')?.value) || 0;
    const valorHora = parseFloat(document.getElementById('ordenValorHora')?.value) || 0;
    const totalManoObra = horas * valorHora;
    document.getElementById('ordenTotalManoObra').value = totalManoObra;

    let totalRepuestos = 0;
    const repuestosRows = document.querySelectorAll('.repuesto-producto');
    repuestosRows.forEach((select, index) => {
        if (select.value) {
            const cantidad = parseFloat(document.querySelectorAll('.repuesto-cantidad')[index]?.value) || 1;
            const precio = parseFloat(document.querySelectorAll('.repuesto-precio')[index]?.value) || 0;
            totalRepuestos += cantidad * precio;
        }
    });

    document.getElementById('resumenManoObra').textContent = `$${totalManoObra.toLocaleString()}`;
    document.getElementById('resumenRepuestos').textContent = `$${totalRepuestos.toLocaleString()}`;
    document.getElementById('resumenTotalOrden').textContent = `$${(totalManoObra + totalRepuestos).toLocaleString()}`;
};

InvPlanetApp.prototype.guardarNuevaOrdenTrabajo = function() {
    const clienteId = document.getElementById('ordenClienteId')?.value;
    const diagnostico = document.getElementById('ordenDiagnostico')?.value;
    const tecnicoId = document.getElementById('ordenTecnicoId')?.value;

    if (!clienteId || !diagnostico || !tecnicoId) {
        mostrarMensaje('❌ Completa los campos obligatorios', 'error');
        return;
    }

    let clienteNombre = '';
    if (clienteId === 'nuevo') {
        const nuevoCliente = document.getElementById('ordenNuevoCliente')?.value;
        if (!nuevoCliente) {
            mostrarMensaje('❌ Ingresa el nombre del nuevo cliente', 'error');
            return;
        }
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

    const repuestos = [];
    const repuestoSelects = document.querySelectorAll('.repuesto-producto');
    const repuestoCantidades = document.querySelectorAll('.repuesto-cantidad');
    const repuestoPrecios = document.querySelectorAll('.repuesto-precio');

    for (let i = 0; i < repuestoSelects.length; i++) {
        if (repuestoSelects[i].value) {
            const productoId = repuestoSelects[i].value;
            const cantidad = parseInt(repuestoCantidades[i].value) || 1;
            const precio = parseFloat(repuestoPrecios[i].value) || 0;
            
            const producto = storage.getProducto(productoId);
            if (!producto || producto.unidades < cantidad) {
                mostrarMensaje(`❌ Stock insuficiente para el repuesto seleccionado`, 'error');
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

    repuestos.forEach(r => {
        const producto = storage.getProducto(r.productoId);
        if (producto) {
            producto.unidades -= r.cantidad;
            storage.updateProducto(r.productoId, { unidades: producto.unidades });
        }
    });

    this.ordenesTrabajo.push(orden);
    this.guardarOrdenesTrabajo();

    mostrarMensaje('✅ Orden de trabajo creada', 'success');
    cerrarModal('modalNuevaOrdenTrabajo');
    this.mostrarModalOrdenesTrabajo();
};

// ============================================
// VER DETALLE ORDEN
// ============================================

InvPlanetApp.prototype.verDetalleOrdenTrabajo = function(id) {
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
                    <button class="close-modal" onclick="cerrarModal('modalDetalleOrdenTrabajo')">&times;</button>
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
                                <button class="btn btn-primary" onclick="app.actualizarEstadoOrden('${orden.id}')">
                                    Actualizar Estado
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <button class="btn btn-success" onclick="app.imprimirOrdenTrabajo('${orden.id}')">
                            <i class="fas fa-print"></i> Imprimir Orden
                        </button>
                        <button class="btn btn-info" onclick="app.convertirOrdenAFactura('${orden.id}')">
                            <i class="fas fa-file-invoice"></i> Generar Factura
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

// ============================================
// ACTUALIZAR ESTADO
// ============================================

InvPlanetApp.prototype.actualizarEstadoOrden = function(id) {
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
    mostrarMensaje('✅ Estado actualizado', 'success');
    this.verDetalleOrdenTrabajo(id);
};

// ============================================
// IMPRIMIR ORDEN
// ============================================

InvPlanetApp.prototype.imprimirOrdenTrabajo = function(id) {
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
};

// ============================================
// CONVERTIR ORDEN A FACTURA
// ============================================

InvPlanetApp.prototype.convertirOrdenAFactura = function(id) {
    const orden = this.ordenesTrabajo.find(o => o.id === id);
    if (!orden) return;

    if (orden.estado !== 'completada' && orden.estado !== 'entregado') {
        if (!confirm('La orden no está completada. ¿Convertir a factura de todas formas?')) {
            return;
        }
    }

    this.carritoVenta = orden.repuestos.map(r => ({
        productoId: r.productoId,
        nombre: r.nombre,
        codigo: storage.getProducto(r.productoId)?.codigo || '',
        precioUnitario: r.precioUnitario,
        cantidad: r.cantidad,
        subtotal: r.subtotal,
        stockDisponible: storage.getProducto(r.productoId)?.unidades || 0
    }));

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

    this.mostrarModalNuevaVenta();
    
    setTimeout(() => {
        const cliente = this.clientes.find(c => c.id === orden.clienteId);
        if (cliente) {
            document.getElementById('tipoDomicilioLabel')?.click();
            document.getElementById('domicilioNombre').value = cliente.nombre;
            document.getElementById('domicilioTelefono').value = cliente.telefono || '';
        }
    }, 1000);
};

console.log('✅ Módulo de Taller cargado');