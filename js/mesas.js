// js/mesas.js - MÓDULO DE MESAS Y RESTAURANTE
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarMesas = function() {
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
};

InvPlanetApp.prototype.guardarMesas = function() {
    localStorage.setItem('invplanet_mesas', JSON.stringify(this.mesas));
};

// ============================================
// MAPA DE MESAS
// ============================================

InvPlanetApp.prototype.mostrarMapaMesas = function() {
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
            <div class="mesa-card" style="border: 3px solid ${color}; border-radius: 15px; padding: 20px; margin: 10px; width: 150px; text-align: center; cursor: pointer;" onclick="app.abrirMesa('${m.id}')">
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
                    <button class="close-modal" onclick="cerrarModal('modalMapaMesas')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <button class="btn btn-info" onclick="app.configurarMesas()">
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
};

// ============================================
// ABRIR MESA
// ============================================

InvPlanetApp.prototype.abrirMesa = function(id) {
    const mesa = this.mesas.find(m => m.id === id);
    if (!mesa) return;
    
    if (mesa.estado === 'disponible') {
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
        this.mostrarModalNuevaVenta();
        setTimeout(() => {
            const mesaInput = document.getElementById('mesaNumero');
            if (mesaInput) {
                mesaInput.value = `Mesa ${mesa.numero} (${mesa.comensales} pers)`;
            }
        }, 1000);
    } else if (mesa.estado === 'ocupada') {
        this.verPedidoMesa(mesa);
    }
};

InvPlanetApp.prototype.verPedidoMesa = function(mesa) {
    const ventas = storage.getVentas?.() || [];
    const pedido = ventas.find(v => v.mesaId === mesa.id && v.estado === 'completada' && !v.pagado);
    
    if (!pedido) {
        mesa.estado = 'disponible';
        mesa.comensales = 0;
        mesa.pedidoActual = null;
        this.guardarMesas();
        mostrarMensaje('Mesa liberada', 'info');
        return;
    }
    
    this.verDetalleVenta(pedido.id);
};

// ============================================
// CONFIGURAR MESAS
// ============================================

InvPlanetApp.prototype.configurarMesas = function() {
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
                    <button class="btn btn-sm btn-danger" onclick="app.eliminarMesa('${m.id}')">
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
                    <button class="close-modal" onclick="cerrarModal('modalConfigMesas')">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary mb-3" onclick="app.agregarMesa()">
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
                    
                    <button class="btn btn-success" onclick="app.guardarConfigMesas()">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
};

InvPlanetApp.prototype.agregarMesa = function() {
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
};

InvPlanetApp.prototype.eliminarMesa = function(id) {
    this.mesas = this.mesas.filter(m => m.id !== id);
    this.configurarMesas();
};

InvPlanetApp.prototype.guardarConfigMesas = function() {
    this.mesas.forEach(m => {
        const capacidad = document.getElementById(`capacidad_${m.id}`)?.value;
        const estado = document.getElementById(`estado_${m.id}`)?.value;
        
        if (capacidad) m.capacidad = parseInt(capacidad);
        if (estado) m.estado = estado;
    });
    
    this.guardarMesas();
    mostrarMensaje('✅ Configuración guardada', 'success');
    cerrarModal('modalConfigMesas');
};

console.log('✅ Módulo de Mesas cargado');