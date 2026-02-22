// js/turnos.js - MÓDULO DE TURNOS
// ============================================

// ============================================
// CARGA Y GUARDADO
// ============================================

InvPlanetApp.prototype.cargarTurnoActual = function() {
    this.turnoActual = JSON.parse(localStorage.getItem('invplanet_turno_actual') || 'null');
    console.log(`🕒 Turno actual: ${this.turnoActual ? 'Abierto' : 'Cerrado'}`);
};

InvPlanetApp.prototype.guardarTurnoActual = function() {
    if (this.turnoActual) {
        localStorage.setItem('invplanet_turno_actual', JSON.stringify(this.turnoActual));
    } else {
        localStorage.removeItem('invplanet_turno_actual');
    }
};

// ============================================
// MODAL PRINCIPAL
// ============================================

InvPlanetApp.prototype.mostrarModalTurnos = function() {
    const usuario = this.getUsuarioActual();
    if (!usuario) {
        mostrarMensaje('❌ Debes iniciar sesión', 'error');
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
                    <button class="close-modal" onclick="cerrarModal('modalTurnos')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        ${this.turnoActual ? `
                            <button class="btn btn-danger" onclick="app.cerrarTurno()">
                                <i class="fas fa-power-off"></i> Cerrar Turno Actual
                            </button>
                        ` : `
                            <button class="btn btn-success" onclick="app.abrirTurno()">
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
};

// ============================================
// ABRIR TURNO
// ============================================

InvPlanetApp.prototype.abrirTurno = function() {
    const usuario = this.getUsuarioActual();
    if (!usuario) {
        mostrarMensaje('❌ Debes iniciar sesión', 'error');
        return;
    }
    
    if (this.turnoActual) {
        mostrarMensaje('⚠️ Ya hay un turno abierto', 'warning');
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
    
    mostrarMensaje('✅ Turno abierto', 'success');
    this.mostrarModalTurnos();
};

// ============================================
// CERRAR TURNO
// ============================================

InvPlanetApp.prototype.cerrarTurno = function() {
    if (!this.turnoActual) {
        mostrarMensaje('❌ No hay turno abierto', 'error');
        return;
    }
    
    const efectivoFinal = prompt('Efectivo final en caja:', this.turnoActual.efectivoInicial + this.turnoActual.totalVentas - this.turnoActual.totalGastos);
    if (efectivoFinal === null) return;
    
    this.turnoActual.fechaCierre = new Date().toISOString();
    this.turnoActual.efectivoFinal = parseFloat(efectivoFinal) || 0;
    this.turnoActual.activo = false;
    
    const turnos = JSON.parse(localStorage.getItem('invplanet_turnos') || '[]');
    const index = turnos.findIndex(t => t.id === this.turnoActual.id);
    if (index !== -1) {
        turnos[index] = this.turnoActual;
        localStorage.setItem('invplanet_turnos', JSON.stringify(turnos));
    }
    
    this.turnoActual = null;
    this.guardarTurnoActual();
    
    mostrarMensaje('✅ Turno cerrado', 'success');
    this.mostrarModalTurnos();
};

console.log('✅ Módulo de Turnos cargado');