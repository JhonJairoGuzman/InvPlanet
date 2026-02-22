// js/kits.js - MÓDULO DE KITS Y COMBOS
// ============================================

// ============================================
// MODAL NUEVO KIT
// ============================================

InvPlanetApp.prototype.mostrarModalNuevoKit = function() {
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
                    <button class="close-modal" onclick="cerrarModal('modalNuevoKit')">&times;</button>
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
                        
                        <button type="button" class="btn btn-info mb-3" onclick="app.agregarProductoKit()">
                            <i class="fas fa-plus"></i> Agregar producto
                        </button>
                        
                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea id="kitDescripcion" class="form-control" rows="2"></textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn btn-secondary" onclick="cerrarModal('modalNuevoKit')">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="app.guardarNuevoKit()">Guardar Kit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    this.modalOpen = true;
};

InvPlanetApp.prototype.agregarProductoKit = function() {
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
};

InvPlanetApp.prototype.guardarNuevoKit = function() {
    const nombre = document.getElementById('kitNombre')?.value;
    if (!nombre) {
        mostrarMensaje('❌ El nombre es obligatorio', 'error');
        return;
    }
    
    const productosSelects = document.querySelectorAll('.kit-producto');
    const cantidades = document.querySelectorAll('.kit-cantidad');
    
    if (productosSelects.length === 0) {
        mostrarMensaje('❌ Agrega al menos un producto', 'error');
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
    mostrarMensaje('✅ Kit creado exitosamente', 'success');
    cerrarModal('modalNuevoKit');
};

console.log('✅ Módulo de Kits cargado');