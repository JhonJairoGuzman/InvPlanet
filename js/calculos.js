// js/calculos.js - Sistema de cálculos financieros y de inventario
// Versión 2.0.0

class CalculosManager {
    constructor() {
        this.config = storage.getConfig();
    }
    
    // Cálculos financieros
    calcularSubtotal(items) {
        if (!Array.isArray(items)) return 0;
        
        return items.reduce((total, item) => {
            const precio = parseFloat(item.precioUnitario) || 0;
            const cantidad = parseInt(item.cantidad) || 0;
            return total + (precio * cantidad);
        }, 0);
    }
    
    calcularImpuesto(subtotal) {
        const tasaImpuesto = (this.config.impuesto || 0) / 100;
        return subtotal * tasaImpuesto;
    }
    
    calcularTotal(subtotal, impuesto) {
        return subtotal + impuesto;
    }
    
    calcularMargenGanancia(costo, precioVenta) {
        if (costo === 0) return 0;
        return ((precioVenta - costo) / costo) * 100;
    }
    
    calcularPrecioVenta(costo, margenPorcentaje) {
        return costo * (1 + (margenPorcentaje / 100));
    }
    
    calcularCostoVenta(productosVendidos) {
        if (!Array.isArray(productosVendidos)) return 0;
        
        return productosVendidos.reduce((total, item) => {
            const producto = storage.getProducto(item.productoId);
            if (producto) {
                const costo = parseFloat(producto.costoUnitario) || 0;
                const cantidad = parseInt(item.cantidad) || 0;
                return total + (costo * cantidad);
            }
            return total;
        }, 0);
    }
    
    calcularUtilidadBruta(ventaTotal, costoVenta) {
        return ventaTotal - costoVenta;
    }
    
    calcularMargenBruto(ventaTotal, utilidadBruta) {
        if (ventaTotal === 0) return 0;
        return (utilidadBruta / ventaTotal) * 100;
    }
    
    // Cálculos de inventario
    calcularValorInventario() {
        const inventario = storage.getInventario();
        const productosActivos = inventario.filter(p => p.activo !== false);
        
        return productosActivos.reduce((total, producto) => {
            const costo = parseFloat(producto.costoUnitario) || 0;
            const unidades = parseInt(producto.unidades) || 0;
            return total + (costo * unidades);
        }, 0);
    }
    
    calcularValorVentaInventario() {
        const inventario = storage.getInventario();
        const productosActivos = inventario.filter(p => p.activo !== false);
        
        return productosActivos.reduce((total, producto) => {
            const precio = parseFloat(producto.precioVenta) || 0;
            const unidades = parseInt(producto.unidades) || 0;
            return total + (precio * unidades);
        }, 0);
    }
    
    calcularGananciaPotencialInventario() {
        const valorVenta = this.calcularValorVentaInventario();
        const valorCosto = this.calcularValorInventario();
        return valorVenta - valorCosto;
    }
    
    // Cálculos de rotación
    calcularRotacionInventario(costoVentasPeriodo, inventarioPromedio) {
        if (inventarioPromedio === 0) return 0;
        return costoVentasPeriodo / inventarioPromedio;
    }
    
    calcularDiasInventario(rotacion) {
        if (rotacion === 0) return 0;
        return 365 / rotacion;
    }
    
    // Cálculos de promedios
    calcularTicketPromedio(ventas) {
        if (!Array.isArray(ventas) || ventas.length === 0) return 0;
        
        const ventasValidas = ventas.filter(v => v.estado !== 'anulada');
        const totalVentas = ventasValidas.reduce((sum, v) => sum + (v.total || 0), 0);
        
        return totalVentas / ventasValidas.length;
    }
    
    calcularProductosPorVenta(ventas) {
        if (!Array.isArray(ventas) || ventas.length === 0) return 0;
        
        const ventasValidas = ventas.filter(v => v.estado !== 'anulada');
        const totalProductos = ventasValidas.reduce((sum, v) => {
            return sum + (v.productos ? v.productos.length : 0);
        }, 0);
        
        return totalProductos / ventasValidas.length;
    }
    
    // Métodos de formato
    formatearMoneda(monto) {
        const simbolo = this.config.simboloMoneda || '$';
        return `${simbolo}${parseFloat(monto || 0).toFixed(2)}`;
    }
    
    formatearPorcentaje(valor) {
        return `${parseFloat(valor || 0).toFixed(2)}%`;
    }
    
    formatearNumero(valor, decimales = 2) {
        return parseFloat(valor || 0).toFixed(decimales);
    }
    
    // Métodos de análisis
    analizarStock(productos) {
        if (!Array.isArray(productos)) return {};
        
        const analisis = {
            totalProductos: productos.length,
            productosActivos: 0,
            productosInactivos: 0,
            productosStockBajo: 0,
            productosAgotados: 0,
            productosStockNormal: 0,
            valorTotalInventario: 0
        };
        
        productos.forEach(producto => {
            if (producto.activo === false) {
                analisis.productosInactivos++;
            } else {
                analisis.productosActivos++;
                
                const unidades = parseInt(producto.unidades) || 0;
                const stockMinimo = parseInt(producto.stockMinimo) || 10;
                const costo = parseFloat(producto.costoUnitario) || 0;
                
                // Valor del inventario
                analisis.valorTotalInventario += costo * unidades;
                
                // Análisis de stock
                if (unidades === 0) {
                    analisis.productosAgotados++;
                } else if (unidades <= stockMinimo) {
                    analisis.productosStockBajo++;
                } else {
                    analisis.productosStockNormal++;
                }
            }
        });
        
        return analisis;
    }
    
    analizarVentas(ventas, periodo = 'mes') {
        if (!Array.isArray(ventas)) return {};
        
        const ventasValidas = ventas.filter(v => v.estado !== 'anulada');
        const ahora = new Date();
        
        let fechaLimite;
        switch(periodo) {
            case 'dia':
                fechaLimite = new Date(ahora.setDate(ahora.getDate() - 1));
                break;
            case 'semana':
                fechaLimite = new Date(ahora.setDate(ahora.getDate() - 7));
                break;
            case 'mes':
                fechaLimite = new Date(ahora.setMonth(ahora.getMonth() - 1));
                break;
            case 'año':
                fechaLimite = new Date(ahora.setFullYear(ahora.getFullYear() - 1));
                break;
            default:
                fechaLimite = new Date(0); // Todas las ventas
        }
        
        const ventasPeriodo = ventasValidas.filter(v => new Date(v.fecha) >= fechaLimite);
        
        const analisis = {
            totalVentas: ventasPeriodo.length,
            totalIngresos: 0,
            totalProductosVendidos: 0,
            ticketPromedio: 0,
            ventasPorMetodoPago: {},
            ventasPorHora: Array(24).fill(0),
            productosMasVendidos: {}
        };
        
        ventasPeriodo.forEach(venta => {
            // Total ingresos
            analisis.totalIngresos += venta.total || 0;
            
            // Productos vendidos
            if (venta.productos) {
                venta.productos.forEach(producto => {
                    analisis.totalProductosVendidos += producto.cantidad || 0;
                    
                    // Productos más vendidos
                    if (!analisis.productosMasVendidos[producto.productoId]) {
                        analisis.productosMasVendidos[producto.productoId] = {
                            nombre: producto.nombre,
                            cantidadVendida: 0,
                            totalVendido: 0
                        };
                    }
                    analisis.productosMasVendidos[producto.productoId].cantidadVendida += producto.cantidad || 0;
                    analisis.productosMasVendidos[producto.productoId].totalVendido += producto.subtotal || 0;
                });
            }
            
            // Ventas por método de pago
            const metodo = venta.metodoPago || 'No especificado';
            if (!analisis.ventasPorMetodoPago[metodo]) {
                analisis.ventasPorMetodoPago[metodo] = 0;
            }
            analisis.ventasPorMetodoPago[metodo] += venta.total || 0;
            
            // Ventas por hora
            const fechaVenta = new Date(venta.fecha);
            const hora = fechaVenta.getHours();
            analisis.ventasPorHora[hora]++;
        });
        
        // Ticket promedio
        if (analisis.totalVentas > 0) {
            analisis.ticketPromedio = analisis.totalIngresos / analisis.totalVentas;
        }
        
        // Ordenar productos más vendidos
        analisis.productosMasVendidos = Object.values(analisis.productosMasVendidos)
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
            .slice(0, 10);
        
        return analisis;
    }
    
    // Métodos de proyección
    proyectarVentas(ventasHistoricas, periodoProyeccion = 30) {
        if (!Array.isArray(ventasHistoricas) || ventasHistoricas.length === 0) {
            return {
                proyeccionDiaria: 0,
                proyeccionTotal: 0,
                tendencia: 'estable'
            };
        }
        
        const ventasValidas = ventasHistoricas.filter(v => v.estado !== 'anulada');
        
        if (ventasValidas.length === 0) {
            return {
                proyeccionDiaria: 0,
                proyeccionTotal: 0,
                tendencia: 'estable'
            };
        }
        
        // Ventas de los últimos 30 días
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        
        const ventasRecientes = ventasValidas.filter(v => new Date(v.fecha) >= fechaLimite);
        const totalReciente = ventasRecientes.reduce((sum, v) => sum + (v.total || 0), 0);
        
        const promedioDiario = totalReciente / 30;
        const proyeccionTotal = promedioDiario * periodoProyeccion;
        
        // Determinar tendencia
        let tendencia = 'estable';
        if (ventasRecientes.length >= 2) {
            const ventasPrimeraMitad = ventasRecientes.slice(0, Math.floor(ventasRecientes.length / 2));
            const ventasSegundaMitad = ventasRecientes.slice(Math.floor(ventasRecientes.length / 2));
            
            const totalPrimera = ventasPrimeraMitad.reduce((sum, v) => sum + (v.total || 0), 0);
            const totalSegunda = ventasSegundaMitad.reduce((sum, v) => sum + (v.total || 0), 0);
            
            const promedioPrimera = totalPrimera / (ventasPrimeraMitad.length || 1);
            const promedioSegunda = totalSegunda / (ventasSegundaMitad.length || 1);
            
            const cambio = ((promedioSegunda - promedioPrimera) / promedioPrimera) * 100;
            
            if (cambio > 10) {
                tendencia = 'creciente';
            } else if (cambio < -10) {
                tendencia = 'decreciente';
            }
        }
        
        return {
            proyeccionDiaria: promedioDiario,
            proyeccionTotal: proyeccionTotal,
            tendencia: tendencia,
            confianza: ventasRecientes.length > 7 ? 'alta' : 'baja'
        };
    }
    
    proyectarStock(producto, ventasHistoricas) {
        if (!producto) return null;
        
        const ventasValidas = ventasHistoricas.filter(v => v.estado !== 'anulada');
        const ventasProducto = ventasValidas.filter(v => 
            v.productos && v.productos.some(p => p.productoId === producto.id)
        );
        
        if (ventasProducto.length === 0) {
            return {
                demandaDiaria: 0,
                diasRestantes: producto.unidades > 0 ? 999 : 0,
                fechaAgotamiento: null,
                recomendacion: 'monitorear'
            };
        }
        
        // Calcular demanda diaria promedio
        const totalVendido = ventasProducto.reduce((sum, venta) => {
            const item = venta.productos.find(p => p.productoId === producto.id);
            return sum + (item ? item.cantidad : 0);
        }, 0);
        
        const diasAnalizados = ventasProducto.length;
        const demandaDiaria = totalVendido / diasAnalizados;
        
        // Calcular días restantes
        const unidadesActuales = parseInt(producto.unidades) || 0;
        const diasRestantes = demandaDiaria > 0 ? Math.floor(unidadesActuales / demandaDiaria) : 999;
        
        // Calcular fecha de agotamiento
        let fechaAgotamiento = null;
        if (demandaDiaria > 0 && diasRestantes < 365) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + diasRestantes);
            fechaAgotamiento = fecha.toLocaleDateString('es-ES');
        }
        
        // Generar recomendación
        let recomendacion = 'monitorear';
        if (diasRestantes <= 7) {
            recomendacion = 'reabastecer_urgente';
        } else if (diasRestantes <= 30) {
            recomendacion = 'reabastecer_pronto';
        } else if (diasRestantes > 90) {
            recomendacion = 'stock_adecuado';
        }
        
        return {
            demandaDiaria: demandaDiaria,
            diasRestantes: diasRestantes,
            fechaAgotamiento: fechaAgotamiento,
            recomendacion: recomendacion,
            confianza: diasAnalizados > 7 ? 'alta' : 'baja'
        };
    }
    
    // Métodos de optimización
    calcularPuntoReorden(demandaPromedio, tiempoEntrega, stockSeguridad) {
        return (demandaPromedio * tiempoEntrega) + stockSeguridad;
    }
    
    calcularStockSeguridad(demandaPromedio, desviacionDemanda, nivelServicio) {
        // Nivel de servicio común: 1.65 para 95%, 2.33 para 99%
        const z = nivelServicio === 0.99 ? 2.33 : 1.65;
        return z * desviacionDemanda * Math.sqrt(demandaPromedio);
    }
    
    calcularCantidadEconomicaPedido(demandaAnual, costoPedido, costoMantenimiento) {
        if (costoMantenimiento === 0) return 0;
        return Math.sqrt((2 * demandaAnual * costoPedido) / costoMantenimiento);
    }
}

// Crear instancia global
const calculos = new CalculosManager();

// Exportar funciones al ámbito global
window.calculos = calculos;
window.calcularSubtotal = (items) => calculos.calcularSubtotal(items);
window.calcularImpuesto = (subtotal) => calculos.calcularImpuesto(subtotal);
window.calcularTotal = (subtotal, impuesto) => calculos.calcularTotal(subtotal, impuesto);
window.formatearMoneda = (monto) => calculos.formatearMoneda(monto);