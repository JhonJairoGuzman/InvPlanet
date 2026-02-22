// js/ui-utils.js - UTILIDADES DE INTERFAZ
// ============================================

// ============================================
// FUNCIONES UTILITARIAS GLOBALES
// ============================================

function mostrarMensaje(mensaje, tipo = 'info') {
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

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
        if (window.app) window.app.modalOpen = false;
    }
}

function formatCurrency(amount) {
    return `$${parseInt(amount || 0).toLocaleString()}`;
}

function sumarDias(fecha, dias) {
    const result = new Date(fecha);
    result.setDate(result.getDate() + dias);
    return result;
}

// ============================================
// MÉTODOS DEL LECTOR DE CÓDIGO DE BARRAS
// ============================================

InvPlanetApp.prototype.inicializarLectorBarra = function() {
    document.addEventListener('keydown', (e) => {
        if (!this.modalOpen || (this.currentView !== 'ventas' && this.currentView !== 'modificacion')) return;
        
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
};

InvPlanetApp.prototype.procesarCodigoBarras = function(codigo) {
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
        mostrarMensaje(`✅ Producto encontrado: ${producto.nombre}`, 'success');
    } else {
        mostrarMensaje(`❌ Producto no encontrado: ${codigo}`, 'error');
    }
};

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================

window.mostrarMensaje = mostrarMensaje;
window.cerrarModal = cerrarModal;
window.formatCurrency = formatCurrency;
window.sumarDias = sumarDias;

console.log('✅ Utilidades de UI cargadas');