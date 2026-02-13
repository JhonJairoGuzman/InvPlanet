// js/inventario.js - Sistema de gestión de inventario completo
// Versión 2.0.0

class InventarioManager {
    constructor() {
        this.currentProducto = null;
        this.init();
    }
    
    init() {
        // Inicializar eventos si estamos en la vista de inventario
        if (window.app && app.currentView === 'inventario') {
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        // Configurar eventos específicos de inventario
        document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('searchProducto');
            if (searchInput) {
                searchInput.addEventListener('keyup', () => this.buscarProductos());
            }
            
            const filterCategoria = document.getElementById('filterCategoria');
            if (filterCategoria) {
                filterCategoria.addEventListener('change', () => this.filtrarProductos());
            }
            
            const filterStock = document.getElementById('filterStock');
            if (filterStock) {
                filterStock.addEventListener('change', () => this.filtrarProductos());
            }
        });
    }
    
    // Búsqueda y filtrado
    buscarProductos() {
        const searchInput = document.getElementById('searchProducto');
        const tabla = document.getElementById('tablaProductos');
        
        if (!searchInput || !tabla) return;
        
        const query = searchInput.value.toLowerCase();
        const productos = storage.getInventario();
        const categorias = storage.getCategorias();
        
        if (query === '') {
            this.loadProductosTabla(productos, categorias);
            return;
        }
        
        const productosFiltrados = productos.filter(producto => {
            return (
                (producto.nombre && producto.nombre.toLowerCase().includes(query)) ||
                (producto.codigo && producto.codigo.toLowerCase().includes(query)) ||
                (producto.descripcion && producto.descripcion.toLowerCase().includes(query)) ||
                (producto.proveedor && producto.proveedor.toLowerCase().includes(query))
            );
        });
        
        this.loadProductosTabla(productosFiltrados, categorias);
    }
    
    filtrarProductos() {
        const filterCategoria = document.getElementById('filterCategoria');
        const filterStock = document.getElementById('filterStock');
        const tabla = document.getElementById('tablaProductos');
        
        if (!filterCategoria || !filterStock || !tabla) return;
        
        const categoriaId = filterCategoria.value;
        const stockFilter = filterStock.value;
        const productos = storage.getInventario();
        const categorias = storage.getCategorias();
        
        let productosFiltrados = productos;
        
        // Filtrar por categoría
        if (categoriaId) {
            productosFiltrados = productosFiltrados.filter(p => p.categoriaId === categoriaId);
        }
        
        // Filtrar por stock
        switch(stockFilter) {
            case 'bajo':
                productosFiltrados = productosFiltrados.filter(p => 
                    p.activo && p.unidades > 0 && p.unidades <= (p.stockMinimo || 10)
                );
                break;
            case 'agotado':
                productosFiltrados = productosFiltrados.filter(p => 
                    p.activo && p.unidades === 0
                );
                break;
        }
        
        this.loadProductosTabla(productosFiltrados, categorias);
    }
    
    loadProductosTabla(productos, categorias) {
        const tabla = document.getElementById('tablaProductos');
        const contador = document.getElementById('productosCount');
        
        if (!tabla) return;
        
        if (productos.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <i class="fas fa-search fa-3x mb-3" style="color: #ddd;"></i>
                        <h4>No se encontraron productos</h4>
                        <p>Intenta con otros términos de búsqueda</p>
                    </td>
                </tr>
            `;
            if (contador) contador.textContent = '0';
            return;
        }
        
        let html = '';
        
        productos.forEach(producto => {
            const categoria = categorias.find(c => c.id === producto.categoriaId);
            const estado = producto.activo === false ? 'Inactivo' : 
                          producto.unidades === 0 ? 'Agotado' : 
                          producto.unidades <= (producto.stockMinimo || 10) ? 'Bajo' : 'Normal';
            
            const badgeClass = estado === 'Agotado' ? 'badge-danger' : 
                              estado === 'Bajo' ? 'badge-warning' : 
                              estado === 'Inactivo' ? 'badge-secondary' : 'badge-success';
            
            html += `
                <tr>
                    <td>${producto.codigo || 'N/A'}</td>
                    <td>${producto.nombre || 'Sin nombre'}</td>
                    <td>${categoria ? categoria.nombre : 'Sin categoría'}</td>
                    <td>${producto.unidades || 0}</td>
                    <td>${calculos.formatearMoneda(producto.precioVenta || 0)}</td>
                    <td>${calculos.formatearMoneda(producto.costoUnitario || 0)}</td>
                    <td><span class="badge ${badgeClass}">${estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="inventarioManager.editarProducto('${producto.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="inventarioManager.verMovimientos('${producto.id}')">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="inventarioManager.eliminarProducto('${producto.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tabla.innerHTML = html;
        if (contador) contador.textContent = productos.length;
    }
    
    // Gestión de productos
    editarProducto(productoId) {
        const producto = storage.getProducto(productoId);
        if (!producto) {
            app.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }
        
        this.currentProducto = producto;
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalEditarProducto">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit"></i> Editar Producto</h3>
                        <button class="close-modal" onclick="app.cerrarModal('modalEditarProducto')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarProducto">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editCodigo"><i class="fas fa-barcode"></i> Código</label>
                                    <input type="text" id="editCodigo" class="form-control" value="${producto.codigo || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="editNombre"><i class="fas fa-box"></i> Nombre *</label>
                                    <input type="text" id="editNombre" class="form-control" value="${producto.nombre || ''}" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editCategoria"><i class="fas fa-tag"></i> Categoría</label>
                                    <select id="editCategoria" class="form-control">
                                        <option value="">Sin categoría</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editUnidades"><i class="fas fa-box"></i> Stock Actual</label>
                                    <input type="number" id="editUnidades" class="form-control" value="${producto.unidades || 0}" min="0">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editCosto"><i class="fas fa-dollar-sign"></i> Costo Unitario *</label>
                                    <input type="number" id="editCosto" class="form-control" value="${producto.costoUnitario || 0}" min="0" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label for="editPrecio"><i class="fas fa-tag"></i> Precio de Venta *</label>
                                    <input type="number" id="editPrecio" class="form-control" value="${producto.precioVenta || 0}" min="0" step="0.01" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editStockMinimo"><i class="fas fa-exclamation-triangle"></i> Stock Mínimo</label>
                                    <input type="number" id="editStockMinimo" class="form-control" value="${producto.stockMinimo || 10}" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="editProveedor"><i class="fas fa-truck"></i> Proveedor</label>
                                    <input type="text" id="editProveedor" class="form-control" value="${producto.proveedor || ''}">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="editDescripcion"><i class="fas fa-align-left"></i> Descripción</label>
                                <textarea id="editDescripcion" class="form-control" rows="3">${producto.descripcion || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="editActivo" ${producto.activo !== false ? 'checked' : ''}>
                                    <span>Producto activo</span>
                                </label>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="app.cerrarModal('modalEditarProducto')">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.loadCategoriasModalEditar();
        
        document.getElementById('formEditarProducto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarCambiosProducto();
        });
    }
    
    loadCategoriasModalEditar() {
        const categorias = storage.getCategorias();
        const select = document.getElementById('editCategoria');
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre || 'Sin nombre';
            if (this.currentProducto.categoriaId === categoria.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
    
    guardarCambiosProducto() {
        if (!this.currentProducto) return;
        
        const updates = {
            codigo: document.getElementById('editCodigo').value,
            nombre: document.getElementById('editNombre').value,
            categoriaId: document.getElementById('editCategoria').value || null,
            unidades: parseInt(document.getElementById('editUnidades').value) || 0,
            costoUnitario: parseFloat(document.getElementById('editCosto').value) || 0,
            precioVenta: parseFloat(document.getElementById('editPrecio').value) || 0,
            stockMinimo: parseInt(document.getElementById('editStockMinimo').value) || 10,
            proveedor: document.getElementById('editProveedor').value,
            descripcion: document.getElementById('editDescripcion').value,
            activo: document.getElementById('editActivo').checked
        };
        
        const success = storage.updateProducto(this.currentProducto.id, updates);
        
        if (success) {
            app.mostrarMensaje('Producto actualizado exitosamente', 'success');
            app.cerrarModal('modalEditarProducto');
            this.currentProducto = null;
            
            // Recargar tabla de productos
            if (app.currentView === 'inventario') {
                app.loadProductos();
            }
        } else {
            app.mostrarMensaje('Error al actualizar producto', 'error');
        }
    }
    
    eliminarProducto(productoId) {
        const producto = storage.getProducto(productoId);
        if (!producto) {
            app.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }
        
        // Verificar si el producto tiene ventas asociadas
        const ventas = storage.getVentas();
        const ventasProducto = ventas.filter(v => 
            v.productos && v.productos.some(p => p.productoId === productoId)
        );
        
        if (ventasProducto.length > 0) {
            app.mostrarMensaje('No se puede eliminar el producto porque tiene ventas asociadas', 'error');
            return;
        }
        
        if (confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
            const success = storage.deleteProducto(productoId);
            
            if (success) {
                app.mostrarMensaje('Producto eliminado exitosamente', 'success');
                
                // Recargar tabla de productos
                if (app.currentView === 'inventario') {
                    app.loadProductos();
                }
                
                // Recargar dashboard si está activo
                if (app.currentView === 'dashboard') {
                    app.updateStats();
                    app.updateAlertas();
                }
            } else {
                app.mostrarMensaje('Error al eliminar producto', 'error');
            }
        }
    }
    
    // Movimientos de inventario
    verMovimientos(productoId) {
        const producto = storage.getProducto(productoId);
        if (!producto) {
            app.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }
        
        const movimientos = storage.getAll('invplanet_movimientos') || [];
        const movimientosProducto = movimientos.filter(m => m.productoId === productoId)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalMovimientos">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-history"></i> Movimientos: ${producto.nombre}</h3>
                        <button class="close-modal" onclick="app.cerrarModal('modalMovimientos')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="movimientos-info">
                            <div class="info-item">
                                <strong>Stock Actual:</strong>
                                <span class="badge ${producto.unidades <= (producto.stockMinimo || 10) ? 'badge-warning' : 'badge-success'}">
                                    ${producto.unidades || 0} unidades
                                </span>
                            </div>
                            <div class="info-item">
                                <strong>Stock Mínimo:</strong>
                                <span>${producto.stockMinimo || 10}</span>
                            </div>
                            <div class="info-item">
                                <button class="btn btn-sm btn-primary" onclick="inventarioManager.agregarStock('${producto.id}')">
                                    <i class="fas fa-plus"></i> Agregar Stock
                                </button>
                            </div>
                        </div>
                        
                        <div class="movimientos-table">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Cantidad</th>
                                        <th>Motivo</th>
                                        <th>Usuario</th>
                                        <th>Detalles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${movimientosProducto.length > 0 ? 
                                        movimientosProducto.map(mov => `
                                            <tr>
                                                <td>${new Date(mov.fecha).toLocaleString()}</td>
                                                <td>
                                                    <span class="badge ${mov.tipo === 'entrada' ? 'badge-success' : 'badge-danger'}">
                                                        ${mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                                    </span>
                                                </td>
                                                <td>${mov.cantidad || 0}</td>
                                                <td>${mov.motivo || 'No especificado'}</td>
                                                <td>${mov.usuario || 'Sistema'}</td>
                                                <td>${mov.detalles || ''}</td>
                                            </tr>
                                        `).join('') : `
                                        <tr>
                                            <td colspan="6" class="text-center">
                                                No hay movimientos registrados
                                            </td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }
    
    agregarStock(productoId) {
        const producto = storage.getProducto(productoId);
        if (!producto) {
            app.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalAgregarStock">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Agregar Stock a ${producto.nombre}</h3>
                        <button class="close-modal" onclick="app.cerrarModal('modalAgregarStock')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formAgregarStock">
                            <div class="form-group">
                                <label for="cantidadAgregar"><i class="fas fa-box"></i> Cantidad a Agregar *</label>
                                <input type="number" id="cantidadAgregar" class="form-control" min="1" value="1" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="costoUnitario"><i class="fas fa-dollar-sign"></i> Costo Unitario</label>
                                <input type="number" id="costoUnitario" class="form-control" min="0" step="0.01" value="${producto.costoUnitario || 0}">
                            </div>
                            
                            <div class="form-group">
                                <label for="proveedorStock"><i class="fas fa-truck"></i> Proveedor</label>
                                <input type="text" id="proveedorStock" class="form-control" value="${producto.proveedor || ''}" placeholder="Nombre del proveedor">
                            </div>
                            
                            <div class="form-group">
                                <label for="motivoStock"><i class="fas fa-sticky-note"></i> Motivo</label>
                                <select id="motivoStock" class="form-control">
                                    <option value="reabastecimiento">Reabastecimiento</option>
                                    <option value="compra">Compra</option>
                                    <option value="devolucion">Devolución</option>
                                    <option value="ajuste">Ajuste de inventario</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="detallesStock"><i class="fas fa-align-left"></i> Detalles (opcional)</label>
                                <textarea id="detallesStock" class="form-control" rows="2" placeholder="Detalles adicionales"></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="app.cerrarModal('modalAgregarStock')">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
        
        document.getElementById('formAgregarStock').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarAgregarStock(productoId);
        });
    }
    
    guardarAgregarStock(productoId) {
        const producto = storage.getProducto(productoId);
        if (!producto) return;
        
        const cantidad = parseInt(document.getElementById('cantidadAgregar').value) || 0;
        const costo = parseFloat(document.getElementById('costoUnitario').value) || producto.costoUnitario;
        const proveedor = document.getElementById('proveedorStock').value || producto.proveedor;
        const motivo = document.getElementById('motivoStock').value;
        const detalles = document.getElementById('detallesStock').value;
        const usuario = getCurrentUser()?.nombre || 'Sistema';
        
        if (cantidad <= 0) {
            app.mostrarMensaje('La cantidad debe ser mayor a 0', 'error');
            return;
        }
        
        // Actualizar stock del producto
        const nuevasUnidades = (producto.unidades || 0) + cantidad;
        const updates = {
            unidades: nuevasUnidades,
            costoUnitario: costo,
            proveedor: proveedor || producto.proveedor
        };
        
        const successUpdate = storage.updateProducto(productoId, updates);
        
        if (successUpdate) {
            // Registrar movimiento
            const movimiento = {
                id: Date.now().toString(),
                productoId: productoId,
                productoNombre: producto.nombre,
                tipo: 'entrada',
                cantidad: cantidad,
                costoUnitario: costo,
                total: cantidad * costo,
                motivo: motivo,
                proveedor: proveedor,
                detalles: detalles,
                fecha: new Date().toISOString(),
                usuario: usuario
            };
            
            const movimientos = storage.getAll('invplanet_movimientos') || [];
            movimientos.push(movimiento);
            storage.save('invplanet_movimientos', movimientos);
            
            app.mostrarMensaje(`Stock actualizado: ${cantidad} unidades agregadas`, 'success');
            app.cerrarModal('modalAgregarStock');
            
            // Recargar vistas
            if (app.currentView === 'inventario') {
                app.loadProductos();
            }
            
            if (app.currentView === 'dashboard') {
                app.updateStats();
                app.updateAlertas();
                app.updateStockBajo();
            }
        } else {
            app.mostrarMensaje('Error al actualizar stock', 'error');
        }
    }
    
    // Exportación de inventario
    exportarInventario() {
        const success = storage.exportInventario();
        
        if (success) {
            app.mostrarMensaje('Inventario exportado exitosamente', 'success');
        } else {
            app.mostrarMensaje('Error al exportar inventario', 'error');
        }
    }
    
    // Análisis de inventario
    generarReporteInventario() {
        const inventario = storage.getInventario();
        const categorias = storage.getCategorias();
        
        const analisis = calculos.analizarStock(inventario);
        const productosBajos = inventario.filter(p => 
            p.activo && p.unidades <= (p.stockMinimo || 10)
        );
        
        const modalHTML = `
            <div class="modal-overlay active" id="modalReporteInventario">
                <div class="modal-content" style="max-width: 900px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-chart-bar"></i> Reporte de Inventario</h3>
                        <button class="close-modal" onclick="app.cerrarModal('modalReporteInventario')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="reporte-resumen">
                            <div class="resumen-card">
                                <i class="fas fa-boxes"></i>
                                <div>
                                    <h4>${analisis.totalProductos}</h4>
                                    <p>Total Productos</p>
                                </div>
                            </div>
                            
                            <div class="resumen-card">
                                <i class="fas fa-check-circle"></i>
                                <div>
                                    <h4>${analisis.productosActivos}</h4>
                                    <p>Productos Activos</p>
                                </div>
                            </div>
                            
                            <div class="resumen-card">
                                <i class="fas fa-exclamation-triangle"></i>
                                <div>
                                    <h4>${analisis.productosStockBajo}</h4>
                                    <p>Stock Bajo</p>
                                </div>
                            </div>
                            
                            <div class="resumen-card">
                                <i class="fas fa-dollar-sign"></i>
                                <div>
                                    <h4>${calculos.formatearMoneda(analisis.valorTotalInventario)}</h4>
                                    <p>Valor Inventario</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="reporte-detalle">
                            <h4>Productos que Requieren Atención</h4>
                            ${productosBajos.length > 0 ? `
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Categoría</th>
                                            <th>Stock Actual</th>
                                            <th>Stock Mínimo</th>
                                            <th>Estado</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${productosBajos.slice(0, 10).map(producto => {
                                            const categoria = categorias.find(c => c.id === producto.categoriaId);
                                            return `
                                                <tr>
                                                    <td>${producto.nombre || 'Sin nombre'}</td>
                                                    <td>${categoria ? categoria.nombre : 'Sin categoría'}</td>
                                                    <td>${producto.unidades || 0}</td>
                                                    <td>${producto.stockMinimo || 10}</td>
                                                    <td>
                                                        <span class="badge ${producto.unidades === 0 ? 'badge-danger' : 'badge-warning'}">
                                                            ${producto.unidades === 0 ? 'Agotado' : 'Bajo'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button class="btn btn-sm btn-primary" onclick="inventarioManager.agregarStock('${producto.id}')">
                                                            <i class="fas fa-plus"></i> Reabastecer
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                                ${productosBajos.length > 10 ? `<p class="text-muted">Mostrando 10 de ${productosBajos.length} productos</p>` : ''}
                            ` : `
                                <div class="alert alert-success">
                                    <i class="fas fa-check-circle"></i> No hay productos que requieran atención inmediata
                                </div>
                            `}
                        </div>
                        
                        <div class="reporte-acciones">
                            <button class="btn btn-primary" onclick="inventarioManager.imprimirReporte()">
                                <i class="fas fa-print"></i> Imprimir Reporte
                            </button>
                            <button class="btn btn-success" onclick="inventarioManager.exportarReporte()">
                                <i class="fas fa-file-export"></i> Exportar a CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modalHTML;
    }
    
    imprimirReporte() {
        const ventanaImpresion = window.open('', '_blank');
        
        const inventario = storage.getInventario();
        const categorias = storage.getCategorias();
        const analisis = calculos.analizarStock(inventario);
        
        const productosBajos = inventario.filter(p => 
            p.activo && p.unidades <= (p.stockMinimo || 10)
        ).slice(0, 20);
        
        let contenidoHTML = `
            <html>
            <head>
                <title>Reporte de Inventario</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #333; }
                    .resumen { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                    .resumen-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 5px; }
                    .resumen-item h3 { margin: 0; font-size: 24px; }
                    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .table th { background-color: #f2f2f2; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${storage.getConfig().nombreNegocio || 'InvPlanet'}</h1>
                    <h2>Reporte de Inventario</h2>
                    <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
                </div>
                
                <div class="resumen">
                    <div class="resumen-item">
                        <h3>${analisis.totalProductos}</h3>
                        <p>Total Productos</p>
                    </div>
                    <div class="resumen-item">
                        <h3>${analisis.productosActivos}</h3>
                        <p>Productos Activos</p>
                    </div>
                    <div class="resumen-item">
                        <h3>${analisis.productosStockBajo}</h3>
                        <p>Stock Bajo</p>
                    </div>
                    <div class="resumen-item">
                        <h3>${calculos.formatearMoneda(analisis.valorTotalInventario)}</h3>
                        <p>Valor Inventario</p>
                    </div>
                </div>
                
                <h3>Productos que Requieren Atención</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosBajos.map(producto => {
                            const categoria = categorias.find(c => c.id === producto.categoriaId);
                            const estado = producto.unidades === 0 ? 'Agotado' : 'Bajo';
                            return `
                                <tr>
                                    <td>${producto.nombre || 'Sin nombre'}</td>
                                    <td>${categoria ? categoria.nombre : 'Sin categoría'}</td>
                                    <td>${producto.unidades || 0}</td>
                                    <td>${producto.stockMinimo || 10}</td>
                                    <td>${estado}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Reporte generado por InvPlanet Sistema de Gestión</p>
                    <p>${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `;
        
        ventanaImpresion.document.write(contenidoHTML);
        ventanaImpresion.document.close();
        
        setTimeout(() => {
            ventanaImpresion.print();
        }, 500);
    }
    
    exportarReporte() {
        const inventario = storage.getInventario();
        const categorias = storage.getCategorias();
        const productosBajos = inventario.filter(p => 
            p.activo && p.unidades <= (p.stockMinimo || 10)
        );
        
        const data = productosBajos.map(producto => {
            const categoria = categorias.find(c => c.id === producto.categoriaId);
            const estado = producto.unidades === 0 ? 'Agotado' : 'Bajo';
            
            return {
                Codigo: producto.codigo || '',
                Nombre: producto.nombre || '',
                Categoria: categoria ? categoria.nombre : 'Sin categoría',
                'Stock Actual': producto.unidades || 0,
                'Stock Minimo': producto.stockMinimo || 10,
                Estado: estado,
                'Precio Venta': producto.precioVenta || 0,
                'Costo Unitario': producto.costoUnitario || 0,
                Proveedor: producto.proveedor || ''
            };
        });
        
        const headers = Object.keys(data[0] || {});
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        app.mostrarMensaje('Reporte exportado exitosamente', 'success');
    }
}

// Crear instancia global
const inventarioManager = new InventarioManager();

// Exportar funciones al ámbito global
window.inventarioManager = inventarioManager;
window.buscarProductos = () => inventarioManager.buscarProductos();
window.filtrarProductos = () => inventarioManager.filtrarProductos();
window.editarProducto = (id) => inventarioManager.editarProducto(id);
window.eliminarProducto = (id) => inventarioManager.eliminarProducto(id);
window.verMovimientos = (id) => inventarioManager.verMovimientos(id);
window.agregarStock = (id) => inventarioManager.agregarStock(id);
window.exportarInventario = () => inventarioManager.exportarInventario();