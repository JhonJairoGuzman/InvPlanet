// js/creditos.js - MÓDULO DE CRÉDITOS
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarCreditos = function() {
    this.creditos = JSON.parse(localStorage.getItem('invplanet_creditos') || '[]');
    console.log(`💳 Créditos cargados: ${this.creditos.length}`);
};

InvPlanetApp.prototype.guardarCreditos = function() {
    localStorage.setItem('invplanet_creditos', JSON.stringify(this.creditos));
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalCreditos = function() {
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
                    <button class="btn btn-sm btn-success" onclick="app.abonarCredito('${c.id}')">
                        <i class="fas fa-money-bill"></i> Abonar
                    </button>
                    <button class="btn btn-sm btn-info" onclick="app.verDetalleCredito('${c.id}')">
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
                    <button class="close-modal" onclick="cerrarModal('modalCreditos')">&times;</button>
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
    this.modalOpen = true;
};

// ============================================
// CREAR CRÉDITO
// ============================================

InvPlanetApp.prototype.crearCredito = function(venta, clienteId, plazoDias = 30) {
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
};

// ============================================
// ABONAR CRÉDITO
// ============================================

InvPlanetApp.prototype.abonarCredito = function(id) {
    const credito = this.creditos.find(c => c.id === id);
    if (!credito) return;
    
    if (credito.saldo <= 0) {
        mostrarMensaje('⚠️ Este crédito ya está pagado', 'warning');
        return;
    }
    
    const monto = prompt(`Monto a abonar (Saldo: $${credito.saldo.toLocaleString()})`, credito.saldo);
    if (!monto) return;
    
    const montoNum = parseFloat(monto);
    if (montoNum <= 0 || montoNum > credito.saldo) {
        mostrarMensaje('❌ Monto inválido', 'error');
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
    mostrarMensaje(`✅ Abono de $${montoNum.toLocaleString()} registrado`, 'success');
    this.mostrarModalCreditos();
};

// ============================================
// VER DETALLE CRÉDITO
// ============================================

InvPlanetApp.prototype.verDetalleCredito = function(id) {
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
                    <button class="close-modal" onclick="cerrarModal('modalDetalleCredito')">&times;</button>
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
};

console.log('✅ Módulo de Créditos cargado');