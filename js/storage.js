// js/storage.js - Sistema de almacenamiento local
// Versión 3.1.0 - COMPLETO CON CATEGORÍAS AMPLIADAS

class StorageManager {
    constructor() {
        this.storageKeys = {
            INVENTARIO: 'invplanet_inventario',
            CATEGORIAS: 'invplanet_categorias',
            VENTAS: 'invplanet_ventas',
            GASTOS: 'invplanet_gastos',
            CLIENTES: 'invplanet_clientes',
            PROVEEDORES: 'invplanet_proveedores',
            MOVIMIENTOS: 'invplanet_movimientos',
            CONFIG: 'invplanet_config',
            USERS: 'invplanet_users',
            AUTH: 'invplanet_auth',
            SESSION: 'invplanet_session',
            BACKUPS: 'invplanet_backups'
        };
        
        console.log('StorageManager instanciado');
        this.initializeStorage();
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    initializeStorage() {
        console.log('Inicializando almacenamiento...');
        
        const defaultData = {
            [this.storageKeys.INVENTARIO]: [],
            [this.storageKeys.CATEGORIAS]: this.getDefaultCategorias(),
            [this.storageKeys.VENTAS]: [],
            [this.storageKeys.GASTOS]: [],
            [this.storageKeys.CLIENTES]: [],
            [this.storageKeys.PROVEEDORES]: [],
            [this.storageKeys.MOVIMIENTOS]: [],
            [this.storageKeys.CONFIG]: this.getDefaultConfig(),
            [this.storageKeys.USERS]: [],
            [this.storageKeys.AUTH]: [],
            [this.storageKeys.SESSION]: null,
            [this.storageKeys.BACKUPS]: []
        };
        
        Object.entries(defaultData).forEach(([key, defaultValue]) => {
            if (!localStorage.getItem(key) || localStorage.getItem(key) === 'null') {
                localStorage.setItem(key, JSON.stringify(defaultValue));
                console.log(`✓ Creado: ${key}`);
            }
        });
        
        this.checkDataIntegrity();
        console.log('✅ Almacenamiento inicializado correctamente');
    }

    // ============================================
    // CONFIGURACIÓN POR DEFECTO
    // ============================================

    getDefaultConfig() {
        return {
            nombreNegocio: 'Mi Negocio',
            moneda: 'COP',
            simboloMoneda: '$',
            impuesto: 19,
            direccion: '',
            telefono: '',
            email: '',
            horaApertura: '08:00',
            horaCierre: '22:00',
            margenGanancia: 30,
            stockMinimoDefault: 10,
            metodosPago: {
                efectivo: true,
                tarjeta: true,
                transferencia: true
            },
            notificaciones: {
                stockBajo: true,
                ventas: true
            },
            fechaActualizacion: new Date().toISOString()
        };
    }

    // ============================================
    // CATEGORÍAS POR DEFECTO - COMPLETAS Y AMPLIADAS
    // ============================================

    getDefaultCategorias() {
        return [
            // ============================================
            // 🍔 COMIDAS RÁPIDAS Y RESTAURANTES
            // ============================================
            { 
                id: 'cat1', 
                nombre: 'Perros Calientes', 
                descripcion: 'Perros sencillos, especiales, rancheros, hawaianos, superperros', 
                color: '#e67e22', 
                icono: 'fas fa-hotdog',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat2', 
                nombre: 'Hamburguesas', 
                descripcion: 'Sencillas, dobles, con queso, hawaianas, mexicanas, de pollo', 
                color: '#d35400', 
                icono: 'fas fa-hamburger',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat3', 
                nombre: 'Salchipapas', 
                descripcion: 'Salchipapas sencillas, mixtas, ranchera, con queso, hawaiana', 
                color: '#f39c12', 
                icono: 'fas fa-french-fries',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat4', 
                nombre: 'Salvajadas', 
                descripcion: 'Combinados familiares, mega porciones, platos especiales', 
                color: '#c0392b', 
                icono: 'fas fa-utensils',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat5', 
                nombre: 'Picadas', 
                descripcion: 'Picadas mixtas, de pollo, de cerdo, de res, familiares', 
                color: '#e74c3c', 
                icono: 'fas fa-drumstick-bite',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat6', 
                nombre: 'Pizzas', 
                descripcion: 'Pizzas personales, familiares, especiales, de la casa', 
                color: '#27ae60', 
                icono: 'fas fa-pizza-slice',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat7', 
                nombre: 'Arepas', 
                descripcion: 'Arepas rellenas, con queso, con huevo, de choclo', 
                color: '#f1c40f', 
                icono: 'fas fa-bread-slice',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat8', 
                nombre: 'Empanadas', 
                descripcion: 'Empanadas de carne, pollo, mixtas, de queso', 
                color: '#e67e22', 
                icono: 'fas fa-pastafarianism',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat9', 
                nombre: 'Choripanes', 
                descripcion: 'Choripán, lomito, chivito, bondiola', 
                color: '#bdc3c7', 
                icono: 'fas fa-bread-slice',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat10', 
                nombre: 'Tacos', 
                descripcion: 'Tacos al pastor, de carne, de pollo, vegetarianos', 
                color: '#f39c12', 
                icono: 'fas fa-taco',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat11', 
                nombre: 'Burritos', 
                descripcion: 'Burritos de carne, pollo, mixtos, vegetarianos', 
                color: '#d35400', 
                icono: 'fas fa-wrap',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat12', 
                nombre: 'Nachos', 
                descripcion: 'Nachos con queso, con carne, mixtos', 
                color: '#e67e22', 
                icono: 'fas fa-utensil-spoon',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat13', 
                nombre: 'Sándwiches', 
                descripcion: 'Sándwiches de jamón, pollo, mixtos, especiales', 
                color: '#95a5a6', 
                icono: 'fas fa-bread-slice',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat14', 
                nombre: 'Perro Caliente', 
                descripcion: 'Variedad de perros calientes', 
                color: '#e67e22', 
                icono: 'fas fa-hotdog',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 🥤 BEBIDAS Y LICORES
            // ============================================
            { 
                id: 'cat15', 
                nombre: 'Bebidas Calientes', 
                descripcion: 'Café, chocolate, aromática, té, capuchino', 
                color: '#8e44ad', 
                icono: 'fas fa-coffee',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat16', 
                nombre: 'Bebidas Frías', 
                descripcion: 'Gaseosas, jugos naturales, malteadas, granizados', 
                color: '#2980b9', 
                icono: 'fas fa-wine-bottle',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat17', 
                nombre: 'Jugos Naturales', 
                descripcion: 'Jugos de naranja, mango, fresa, lulo, maracuyá', 
                color: '#f39c12', 
                icono: 'fas fa-lemon',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat18', 
                nombre: 'Malteadas', 
                descripcion: 'Malteadas de chocolate, fresa, vainilla, oreo', 
                color: '#e84393', 
                icono: 'fas fa-ice-cream',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat19', 
                nombre: 'Granizados', 
                descripcion: 'Granizados de tutti frutti, fresa, limón', 
                color: '#00cec9', 
                icono: 'fas fa-snowflake',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat20', 
                nombre: 'Gaseosas', 
                descripcion: 'Coca Cola, Pepsi, Seven Up, Colombiana', 
                color: '#e74c3c', 
                icono: 'fas fa-wine-bottle',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat21', 
                nombre: 'Aguas', 
                descripcion: 'Agua sin gas, con gas, saborizada', 
                color: '#3498db', 
                icono: 'fas fa-water',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat22', 
                nombre: 'Cervezas', 
                descripcion: 'Cervezas nacionales, importadas, artesanales, sin alcohol', 
                color: '#f39c12', 
                icono: 'fas fa-beer',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat23', 
                nombre: 'Cervezas Nacionales', 
                descripcion: 'Águila, Poker, Club Colombia, Costeña', 
                color: '#f1c40f', 
                icono: 'fas fa-beer',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat24', 
                nombre: 'Cervezas Importadas', 
                descripcion: 'Corona, Heineken, Budweiser, Stella Artois', 
                color: '#e67e22', 
                icono: 'fas fa-beer',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat25', 
                nombre: 'Cervezas Artesanales', 
                descripcion: 'IPA, Stout, Porter, Ale', 
                color: '#9b59b6', 
                icono: 'fas fa-beer',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat26', 
                nombre: 'Licores', 
                descripcion: 'Aguardiente, ron, whisky, vodka, tequila', 
                color: '#c0392b', 
                icono: 'fas fa-wine-glass-alt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat27', 
                nombre: 'Aguardiente', 
                descripcion: 'Aguardiente Antioqueño, Néctar, Caucano', 
                color: '#27ae60', 
                icono: 'fas fa-wine-glass-alt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat28', 
                nombre: 'Ron', 
                descripcion: 'Ron Viejo de Caldas, Medellín, Santa Fe', 
                color: '#8e44ad', 
                icono: 'fas fa-wine-glass-alt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat29', 
                nombre: 'Whisky', 
                descripcion: 'Johnnie Walker, Buchanan, Old Parr', 
                color: '#f39c12', 
                icono: 'fas fa-wine-glass-alt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat30', 
                nombre: 'Vodka', 
                descripcion: 'Smirnoff, Absolut, Grey Goose', 
                color: '#3498db', 
                icono: 'fas fa-wine-glass-alt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat31', 
                nombre: 'Tequila', 
                descripcion: 'José Cuervo, Don Julio, Patrón', 
                color: '#e67e22', 
                icono: 'fas fa-wine-glass-alt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat32', 
                nombre: 'Vinos', 
                descripcion: 'Vino tinto, blanco, rosado, espumoso', 
                color: '#c0392b', 
                icono: 'fas fa-wine-bottle',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 🏠 ASEO Y HOGAR
            // ============================================
            { 
                id: 'cat33', 
                nombre: 'Aseo Personal', 
                descripcion: 'Jabón, shampoo, crema dental, desodorante, papel higiénico', 
                color: '#3498db', 
                icono: 'fas fa-soap',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat34', 
                nombre: 'Aseo Hogar', 
                descripcion: 'Detergente, limpia pisos, lava loza, desinfectante', 
                color: '#1abc9c', 
                icono: 'fas fa-pump-soap',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat35', 
                nombre: 'Detergentes', 
                descripcion: 'Detergente en polvo, líquido, para ropa de color', 
                color: '#3498db', 
                icono: 'fas fa-jug-detergent',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat36', 
                nombre: 'Desinfectantes', 
                descripcion: 'Limpia pisos, alcohol, cloro, jabón líquido', 
                color: '#2ecc71', 
                icono: 'fas fa-spray-can',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat37', 
                nombre: 'Papelería', 
                descripcion: 'Cuadernos, lapiceros, lápices, colores, cartulina', 
                color: '#9b59b6', 
                icono: 'fas fa-book',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat38', 
                nombre: 'Mascotas', 
                descripcion: 'Comida para perros, gatos, accesorios, juguetes', 
                color: '#e67e22', 
                icono: 'fas fa-dog',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat39', 
                nombre: 'Comida para Perros', 
                descripcion: 'Concentrado, snacks, huesos, premios', 
                color: '#e67e22', 
                icono: 'fas fa-dog',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat40', 
                nombre: 'Comida para Gatos', 
                descripcion: 'Concentrado, snacks, arena sanitaria', 
                color: '#f39c12', 
                icono: 'fas fa-cat',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 🧸 MINIATURAS, DULCES Y VARIEDADES
            // ============================================
            { 
                id: 'cat41', 
                nombre: 'Miniaturas', 
                descripcion: 'Juguetes pequeños, coleccionables, detalles, sorpresas', 
                color: '#f1c40f', 
                icono: 'fas fa-gift',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat42', 
                nombre: 'Dulces y Confites', 
                descripcion: 'Bombones, caramelos, chicles, gomitas, chupetas', 
                color: '#e84393', 
                icono: 'fas fa-candy-cane',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat43', 
                nombre: 'Chocolates', 
                descripcion: 'Chocolatinas Jet, Jumbo, Hershey, Ferrero', 
                color: '#8e44ad', 
                icono: 'fas fa-candy-cane',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat44', 
                nombre: 'Mecato', 
                descripcion: 'Papas fritas, chicharrones, platanitos, maní, galletas', 
                color: '#d35400', 
                icono: 'fas fa-cookie-bite',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat45', 
                nombre: 'Galletas', 
                descripcion: 'Galletas dulces, saladas, rellenas, integrales', 
                color: '#f39c12', 
                icono: 'fas fa-cookie',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat46', 
                nombre: 'Papas Fritas', 
                descripcion: 'Margarita, Super Ricas, Ruffles, Pringles', 
                color: '#e67e22', 
                icono: 'fas fa-french-fries',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat47', 
                nombre: 'Chicles', 
                descripcion: 'Bubble Gum, Trident, Adams, Tutti Frutti', 
                color: '#e84393', 
                icono: 'fas fa-circle',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat48', 
                nombre: 'Cigarrería', 
                descripcion: 'Cigarrillos, tabaco, encendedores, fósforos, papel', 
                color: '#7f8c8d', 
                icono: 'fas fa-smoking',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 🛠️ FERRETERÍA Y HERRAMIENTAS
            // ============================================
            { 
                id: 'cat49', 
                nombre: 'Ferretería', 
                descripcion: 'Martillos, destornilladores, alicates, clavos, tornillos', 
                color: '#95a5a6', 
                icono: 'fas fa-tools',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat50', 
                nombre: 'Electricidad', 
                descripcion: 'Cables, bombillos, tomacorrientes, interruptores', 
                color: '#f39c12', 
                icono: 'fas fa-bolt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat51', 
                nombre: 'Pinturas', 
                descripcion: 'Vinilos, esmaltes, brochas, rodillos, thinner', 
                color: '#3498db', 
                icono: 'fas fa-paint-brush',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat52', 
                nombre: 'Tornillería', 
                descripcion: 'Tornillos, tuercas, arandelas, pernos', 
                color: '#7f8c8d', 
                icono: 'fas fa-cog',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat53', 
                nombre: 'Pegantes', 
                descripcion: 'Bóxer, bóxer instantáneo, silicona, pegastic', 
                color: '#f1c40f', 
                icono: 'fas fa-flask',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 🥩 CARNES Y FRÍOS
            // ============================================
            { 
                id: 'cat54', 
                nombre: 'Carnes Frías', 
                descripcion: 'Jamón, salchicha, mortadela, tocineta', 
                color: '#e74c3c', 
                icono: 'fas fa-bacon',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat55', 
                nombre: 'Lácteos', 
                descripcion: 'Leche, queso, yogur, mantequilla', 
                color: '#3498db', 
                icono: 'fas fa-cheese',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat56', 
                nombre: 'Huevos', 
                descripcion: 'Huevos de gallina, codorniz', 
                color: '#f39c12', 
                icono: 'fas fa-egg',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 🥗 ABARROTES Y DESPENSA
            // ============================================
            { 
                id: 'cat57', 
                nombre: 'Granos', 
                descripcion: 'Arroz, frijol, lenteja, garbanzo', 
                color: '#d35400', 
                icono: 'fas fa-seedling',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat58', 
                nombre: 'Enlatados', 
                descripcion: 'Atún, sardinas, verduras, frutas en lata', 
                color: '#7f8c8d', 
                icono: 'fas fa-can-food',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat59', 
                nombre: 'Pastas', 
                descripcion: 'Espagueti, macarrones, lasaña, tallarines', 
                color: '#f1c40f', 
                icono: 'fas fa-utensils',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat60', 
                nombre: 'Aceites', 
                descripcion: 'Aceite vegetal, de oliva, canola', 
                color: '#f39c12', 
                icono: 'fas fa-oil-can',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 🍞 PANADERÍA
            // ============================================
            { 
                id: 'cat61', 
                nombre: 'Panadería', 
                descripcion: 'Pan blandito, campesino, alargado, integral', 
                color: '#d35400', 
                icono: 'fas fa-bread-slice',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat62', 
                nombre: 'Repostería', 
                descripcion: 'Pasteles, tortas, ponqués', 
                color: '#e84393', 
                icono: 'fas fa-cake',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 👕 ROPA Y ACCESORIOS
            // ============================================
            { 
                id: 'cat63', 
                nombre: 'Ropa', 
                descripcion: 'Camisetas, pantalones, jeans, vestidos', 
                color: '#3498db', 
                icono: 'fas fa-tshirt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat64', 
                nombre: 'Calzado', 
                descripcion: 'Tenis, zapatos, sandalias, botas', 
                color: '#e67e22', 
                icono: 'fas fa-shoe-prints',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat65', 
                nombre: 'Accesorios', 
                descripcion: 'Gorras, gafas, relojes, joyería', 
                color: '#f1c40f', 
                icono: 'fas fa-glasses',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 📱 TECNOLOGÍA
            // ============================================
            { 
                id: 'cat66', 
                nombre: 'Tecnología', 
                descripcion: 'Celulares, audífonos, cargadores, memorias', 
                color: '#2c3e50', 
                icono: 'fas fa-laptop',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat67', 
                nombre: 'Accesorios Tecnología', 
                descripcion: 'Forros, protectores, cables, adaptadores', 
                color: '#34495e', 
                icono: 'fas fa-headphones',
                fechaCreacion: new Date().toISOString()
            },

            // ============================================
            // 🎁 OTROS
            // ============================================
            { 
                id: 'cat68', 
                nombre: 'Regalos', 
                descripcion: 'Detalles, cajas sorpresa, artículos para regalo', 
                color: '#e84393', 
                icono: 'fas fa-gift',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat69', 
                nombre: 'Temporada', 
                descripcion: 'Navidad, Halloween, Amor y Amistad', 
                color: '#e74c3c', 
                icono: 'fas fa-calendar-alt',
                fechaCreacion: new Date().toISOString()
            },
            { 
                id: 'cat70', 
                nombre: 'Otros', 
                descripcion: 'Productos varios no clasificados', 
                color: '#95a5a6', 
                icono: 'fas fa-tag',
                fechaCreacion: new Date().toISOString()
            }
        ];
    }

    // ============================================
    // MÉTODOS CRUD GENÉRICOS
    // ============================================

    getAll(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data || data === 'null' || data === 'undefined') {
                if (key === this.storageKeys.CONFIG) {
                    return this.getDefaultConfig();
                }
                if (key === this.storageKeys.CATEGORIAS) {
                    return this.getDefaultCategorias();
                }
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error obteniendo datos de ${key}:`, error);
            if (key === this.storageKeys.CONFIG) {
                return this.getDefaultConfig();
            }
            if (key === this.storageKeys.CATEGORIAS) {
                return this.getDefaultCategorias();
            }
            return [];
        }
    }

    getById(key, id) {
        const data = this.getAll(key);
        if (Array.isArray(data)) {
            return data.find(item => item.id === id);
        }
        return null;
    }

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error guardando datos en ${key}:`, error);
            return false;
        }
    }

    add(key, item) {
        const data = this.getAll(key);
        if (Array.isArray(data)) {
            if (!item.id) {
                item.id = this.generateId();
            }
            if (!item.fechaCreacion) {
                item.fechaCreacion = new Date().toISOString();
            }
            data.push(item);
            return this.save(key, data);
        }
        return false;
    }

    update(key, id, updates) {
        const data = this.getAll(key);
        if (Array.isArray(data)) {
            const index = data.findIndex(item => item.id === id);
            if (index !== -1) {
                updates.fechaActualizacion = new Date().toISOString();
                data[index] = { ...data[index], ...updates };
                return this.save(key, data);
            }
        }
        return false;
    }

    delete(key, id) {
        const data = this.getAll(key);
        if (Array.isArray(data)) {
            const filteredData = data.filter(item => item.id !== id);
            return this.save(key, filteredData);
        }
        return false;
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS PARA CONFIGURACIÓN
    // ============================================

    getConfig() {
        try {
            const config = this.getAll(this.storageKeys.CONFIG);
            const defaultConfig = this.getDefaultConfig();
            const mergedConfig = { ...defaultConfig, ...config };
            
            mergedConfig.metodosPago = { ...defaultConfig.metodosPago, ...config.metodosPago };
            mergedConfig.notificaciones = { ...defaultConfig.notificaciones, ...config.notificaciones };
            
            return mergedConfig;
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            return this.getDefaultConfig();
        }
    }

    saveConfig(config) {
        try {
            const currentConfig = this.getConfig();
            const newConfig = { ...currentConfig, ...config, fechaActualizacion: new Date().toISOString() };
            return this.save(this.storageKeys.CONFIG, newConfig);
        } catch (error) {
            console.error('Error guardando configuración:', error);
            return false;
        }
    }

    updateConfig(updates) {
        try {
            const config = this.getConfig();
            const newConfig = { ...config, ...updates, fechaActualizacion: new Date().toISOString() };
            return this.save(this.storageKeys.CONFIG, newConfig);
        } catch (error) {
            console.error('Error actualizando configuración:', error);
            return false;
        }
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS PARA CATEGORÍAS
    // ============================================

    getCategorias() {
        return this.getAll(this.storageKeys.CATEGORIAS);
    }

    saveCategorias(categorias) {
        return this.save(this.storageKeys.CATEGORIAS, categorias);
    }

    addCategoria(categoria) {
        return this.add(this.storageKeys.CATEGORIAS, categoria);
    }

    getCategoria(id) {
        return this.getById(this.storageKeys.CATEGORIAS, id);
    }

    updateCategoria(id, updates) {
        return this.update(this.storageKeys.CATEGORIAS, id, updates);
    }

    deleteCategoria(id) {
        return this.delete(this.storageKeys.CATEGORIAS, id);
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS PARA INVENTARIO
    // ============================================

    getInventario() {
        return this.getAll(this.storageKeys.INVENTARIO);
    }

    saveInventario(inventario) {
        return this.save(this.storageKeys.INVENTARIO, inventario);
    }

    getProducto(id) {
        return this.getById(this.storageKeys.INVENTARIO, id);
    }

    addProducto(producto) {
        return this.add(this.storageKeys.INVENTARIO, producto);
    }

    updateProducto(id, updates) {
        return this.update(this.storageKeys.INVENTARIO, id, updates);
    }

    deleteProducto(id) {
        return this.delete(this.storageKeys.INVENTARIO, id);
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS PARA VENTAS
    // ============================================

    getVentas() {
        return this.getAll(this.storageKeys.VENTAS);
    }

    saveVentas(ventas) {
        return this.save(this.storageKeys.VENTAS, ventas);
    }

    addVenta(venta) {
        return this.add(this.storageKeys.VENTAS, venta);
    }

    getVenta(id) {
        return this.getById(this.storageKeys.VENTAS, id);
    }

    updateVenta(id, updates) {
        return this.update(this.storageKeys.VENTAS, id, updates);
    }

    deleteVenta(id) {
        return this.delete(this.storageKeys.VENTAS, id);
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS PARA GASTOS
    // ============================================

    getGastos() {
        return this.getAll(this.storageKeys.GASTOS);
    }

    saveGastos(gastos) {
        return this.save(this.storageKeys.GASTOS, gastos);
    }

    addGasto(gasto) {
        return this.add(this.storageKeys.GASTOS, gasto);
    }

    getGasto(id) {
        return this.getById(this.storageKeys.GASTOS, id);
    }

    updateGasto(id, updates) {
        return this.update(this.storageKeys.GASTOS, id, updates);
    }

    deleteGasto(id) {
        return this.delete(this.storageKeys.GASTOS, id);
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS PARA MOVIMIENTOS
    // ============================================

    getMovimientos() {
        return this.getAll(this.storageKeys.MOVIMIENTOS);
    }

    saveMovimientos(movimientos) {
        return this.save(this.storageKeys.MOVIMIENTOS, movimientos);
    }

    addMovimiento(movimiento) {
        return this.add(this.storageKeys.MOVIMIENTOS, movimiento);
    }

    getMovimientosByProducto(productoId) {
        const movimientos = this.getMovimientos();
        return movimientos.filter(m => m.productoId === productoId)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS PARA USUARIOS
    // ============================================

    getUsers() {
        return this.getAll(this.storageKeys.USERS);
    }

    saveUsers(users) {
        return this.save(this.storageKeys.USERS, users);
    }

    addUser(user) {
        return this.add(this.storageKeys.USERS, user);
    }

    getUserByUsername(username) {
        const users = this.getUsers();
        return users.find(user => user.username === username);
    }

    getAuthUsers() {
        return this.getAll(this.storageKeys.AUTH);
    }

    saveAuthUsers(users) {
        return this.save(this.storageKeys.AUTH, users);
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS PARA SESIONES
    // ============================================

    getSession() {
        const session = this.getAll(this.storageKeys.SESSION);
        return session || null;
    }

    saveSession(session) {
        return this.save(this.storageKeys.SESSION, session);
    }

    clearSession() {
        return this.save(this.storageKeys.SESSION, null);
    }

    // ============================================
    // MÉTODOS DE BÚSQUEDA
    // ============================================

    searchInventario(query) {
        const inventario = this.getInventario();
        const queryLower = query.toLowerCase();
        
        return inventario.filter(producto => {
            return (
                (producto.nombre && producto.nombre.toLowerCase().includes(queryLower)) ||
                (producto.codigo && producto.codigo.toLowerCase().includes(queryLower)) ||
                (producto.descripcion && producto.descripcion.toLowerCase().includes(queryLower)) ||
                (producto.proveedor && producto.proveedor.toLowerCase().includes(queryLower))
            );
        });
    }

    searchVentas(query) {
        const ventas = this.getVentas();
        const queryLower = query.toLowerCase();
        
        return ventas.filter(venta => {
            return (
                (venta.numero && venta.numero.toLowerCase().includes(queryLower)) ||
                (venta.cliente && venta.cliente.toLowerCase().includes(queryLower))
            );
        });
    }

    searchGastos(query) {
        const gastos = this.getGastos();
        const queryLower = query.toLowerCase();
        
        return gastos.filter(gasto => {
            return (
                (gasto.descripcion && gasto.descripcion.toLowerCase().includes(queryLower)) ||
                (gasto.comentarios && gasto.comentarios.toLowerCase().includes(queryLower))
            );
        });
    }

    // ============================================
    // MÉTODOS DE ESTADÍSTICAS
    // ============================================

    getStats() {
        try {
            const inventario = this.getInventario();
            const ventas = this.getVentas().filter(v => v.estado !== 'anulada');
            const gastos = this.getGastos();
            
            const productosActivos = inventario.filter(p => p.activo !== false);
            const productosBajos = productosActivos.filter(p => p.unidades <= (p.stockMinimo || 10));
            
            const valorInventario = productosActivos.reduce((sum, p) => {
                return sum + ((p.costoUnitario || 0) * (p.unidades || 0));
            }, 0);
            
            const hoy = new Date().toLocaleDateString('es-ES');
            const ventasHoy = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha).toLocaleDateString('es-ES');
                return fechaVenta === hoy;
            });
            const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
            
            const mesActual = new Date().getMonth();
            const ventasMes = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta.getMonth() === mesActual;
            });
            const totalVentasMes = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);
            
            const gastosMes = gastos.filter(g => {
                const fechaGasto = new Date(g.fecha || g.fechaRegistro);
                return fechaGasto.getMonth() === mesActual;
            });
            const totalGastosMes = gastosMes.reduce((sum, g) => sum + (g.monto || 0), 0);
            
            return {
                totalProductos: inventario.length,
                productosActivos: productosActivos.length,
                productosBajos: productosBajos.length,
                valorInventario: valorInventario,
                totalVentas: ventas.length,
                ventasHoy: ventasHoy.length,
                totalVentasHoy: totalVentasHoy,
                ventasMes: ventasMes.length,
                totalVentasMes: totalVentasMes,
                totalGastosMes: totalGastosMes,
                balanceMes: totalVentasMes - totalGastosMes
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                totalProductos: 0,
                productosActivos: 0,
                productosBajos: 0,
                valorInventario: 0,
                totalVentas: 0,
                ventasHoy: 0,
                totalVentasHoy: 0,
                ventasMes: 0,
                totalVentasMes: 0,
                totalGastosMes: 0,
                balanceMes: 0
            };
        }
    }

    // ============================================
    // MÉTODOS DE EXPORTACIÓN
    // ============================================

    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            console.warn('No hay datos para exportar');
            return false;
        }
        
        try {
            const headers = Object.keys(data[0] || {});
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => {
                    const value = row[header];
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'string') {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(','))
            ].join('\n');
            
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error exportando a CSV:', error);
            return false;
        }
    }

    exportInventario() {
        const inventario = this.getInventario();
        const categorias = this.getCategorias();
        
        const data = inventario.map(producto => {
            const categoria = categorias.find(c => c.id === producto.categoriaId);
            return {
                Codigo: producto.codigo || '',
                Nombre: producto.nombre || '',
                Categoria: categoria ? categoria.nombre : 'Sin categoría',
                Stock: producto.unidades || 0,
                'Stock Minimo': producto.stockMinimo || 10,
                'Precio Venta': producto.precioVenta || 0,
                'Costo Unitario': producto.costoUnitario || 0,
                Proveedor: producto.proveedor || '',
                Descripcion: producto.descripcion || '',
                Activo: producto.activo !== false ? 'Sí' : 'No'
            };
        });
        
        return this.exportToCSV(data, 'inventario');
    }

    exportVentas() {
        const ventas = this.getVentas().filter(v => v.estado !== 'anulada');
        
        const data = ventas.map(venta => {
            const fecha = new Date(venta.fecha);
            return {
                Numero: venta.numero || '',
                Fecha: fecha.toLocaleDateString('es-ES'),
                Hora: fecha.toLocaleTimeString('es-ES'),
                Cliente: venta.cliente || 'Consumidor Final',
                Productos: venta.productos ? venta.productos.length : 0,
                Subtotal: venta.subtotal || 0,
                Impuesto: venta.impuesto || 0,
                Total: venta.total || 0,
                'Metodo Pago': venta.metodoPago || 'efectivo',
                Estado: venta.estado || 'completada'
            };
        });
        
        return this.exportToCSV(data, 'ventas');
    }

    exportGastos() {
        const gastos = this.getGastos();
        
        const categorias = {
            'alquiler': 'Alquiler',
            'servicios': 'Servicios',
            'nomina': 'Nómina',
            'insumos': 'Insumos',
            'mantenimiento': 'Mantenimiento',
            'otros': 'Otros'
        };
        
        const data = gastos.map(gasto => {
            const fecha = new Date(gasto.fecha || gasto.fechaRegistro);
            return {
                Fecha: fecha.toLocaleDateString('es-ES'),
                Descripcion: gasto.descripcion || '',
                Categoria: categorias[gasto.categoria] || gasto.categoria || 'Otros',
                Monto: gasto.monto || 0,
                Comentarios: gasto.comentarios || ''
            };
        });
        
        return this.exportToCSV(data, 'gastos');
    }

    // ============================================
    // MÉTODOS DE BACKUP Y RESTAURACIÓN
    // ============================================

    createBackup() {
        try {
            const backup = {};
            Object.values(this.storageKeys).forEach(key => {
                backup[key] = localStorage.getItem(key);
            });
            
            const backups = this.getAll(this.storageKeys.BACKUPS);
            backups.push({
                id: this.generateId(),
                fecha: new Date().toISOString(),
                data: backup,
                nombre: `Backup ${new Date().toLocaleDateString('es-ES')}`
            });
            
            while (backups.length > 10) {
                backups.shift();
            }
            
            this.save(this.storageKeys.BACKUPS, backups);
            console.log('✅ Backup creado exitosamente');
            return true;
        } catch (error) {
            console.error('Error creando backup:', error);
            return false;
        }
    }

    restoreBackup(backupId) {
        try {
            const backups = this.getAll(this.storageKeys.BACKUPS);
            const backup = backups.find(b => b.id === backupId);
            
            if (backup) {
                Object.keys(backup.data).forEach(key => {
                    localStorage.setItem(key, backup.data[key]);
                });
                console.log('✅ Backup restaurado exitosamente');
                return true;
            }
            console.error('❌ Backup no encontrado');
            return false;
        } catch (error) {
            console.error('Error restaurando backup:', error);
            return false;
        }
    }

    getBackups() {
        return this.getAll(this.storageKeys.BACKUPS)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    deleteBackup(backupId) {
        return this.delete(this.storageKeys.BACKUPS, backupId);
    }

    // ============================================
    // MÉTODOS DE INTEGRIDAD
    // ============================================

    checkDataIntegrity() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                const data = localStorage.getItem(key);
                if (data && data !== 'null') {
                    JSON.parse(data);
                }
            });
            return true;
        } catch (error) {
            console.error('Error en integridad de datos:', error);
            this.fixCorruptedData();
            return false;
        }
    }

    fixCorruptedData() {
        console.log('Reparando datos corruptos...');
        Object.values(this.storageKeys).forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    JSON.parse(data);
                }
            } catch (error) {
                console.log(`Reparando ${key}...`);
                let defaultValue = [];
                if (key === this.storageKeys.CONFIG) {
                    defaultValue = this.getDefaultConfig();
                } else if (key === this.storageKeys.CATEGORIAS) {
                    defaultValue = this.getDefaultCategorias();
                } else if (key === this.storageKeys.SESSION) {
                    defaultValue = null;
                }
                localStorage.setItem(key, JSON.stringify(defaultValue));
            }
        });
    }

    // ============================================
    // MÉTODOS UTILITARIOS
    // ============================================

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    clearAll() {
        if (confirm('⚠️ ¿Estás seguro de borrar TODOS los datos? Esta acción no se puede deshacer.')) {
            try {
                Object.values(this.storageKeys).forEach(key => {
                    localStorage.removeItem(key);
                });
                this.initializeStorage();
                console.log('✅ Todos los datos han sido limpiados');
                return true;
            } catch (error) {
                console.error('Error limpiando datos:', error);
                return false;
            }
        }
        return false;
    }

    getStorageInfo() {
        let totalSize = 0;
        let itemCount = 0;
        
        Object.values(this.storageKeys).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += new Blob([data]).size;
                itemCount++;
            }
        });
        
        return {
            items: itemCount,
            totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
            timestamp: new Date().toLocaleString('es-ES')
        };
    }

    resetToDefaults() {
        if (confirm('⚠️ ¿Restablecer a valores por defecto? Se perderán los datos personalizados.')) {
            try {
                Object.values(this.storageKeys).forEach(key => {
                    localStorage.removeItem(key);
                });
                this.initializeStorage();
                console.log('✅ Sistema restablecido a valores por defecto');
                return true;
            } catch (error) {
                console.error('Error restableciendo sistema:', error);
                return false;
            }
        }
        return false;
    }

    migrateFromOldStorage() {
        const oldKeys = [
            'inventario',
            'categorias',
            'ventas',
            'gastos',
            'configuracion'
        ];
        
        oldKeys.forEach(oldKey => {
            const data = localStorage.getItem(oldKey);
            if (data) {
                const newKey = `invplanet_${oldKey}`;
                if (!localStorage.getItem(newKey)) {
                    localStorage.setItem(newKey, data);
                    console.log(`Migrado: ${oldKey} -> ${newKey}`);
                }
            }
        });
    }
}

// ============================================
// CREAR INSTANCIA GLOBAL
// ============================================

if (typeof window.storage === 'undefined') {
    console.log('Creando instancia de StorageManager...');
    const storage = new StorageManager();
    window.storage = storage;

    // ============================================
    // EXPORTAR FUNCIONES AL ÁMBITO GLOBAL
    // ============================================

    // Inventario
    window.getInventario = () => storage.getInventario();
    window.saveInventario = (data) => storage.saveInventario(data);
    window.getProducto = (id) => storage.getProducto(id);
    window.addProducto = (producto) => storage.addProducto(producto);
    window.updateProducto = (id, updates) => storage.updateProducto(id, updates);
    window.deleteProducto = (id) => storage.deleteProducto(id);

    // Categorías - AMPLIADAS
    window.getCategorias = () => storage.getCategorias();
    window.saveCategorias = (data) => storage.saveCategorias(data);
    window.addCategoria = (categoria) => storage.addCategoria(categoria);
    window.getCategoria = (id) => storage.getCategoria(id);
    window.updateCategoria = (id, updates) => storage.updateCategoria(id, updates);
    window.deleteCategoria = (id) => storage.deleteCategoria(id);
    window.getDefaultCategorias = () => storage.getDefaultCategorias();

    // Ventas
    window.getVentas = () => storage.getVentas();
    window.saveVentas = (data) => storage.saveVentas(data);
    window.addVenta = (venta) => storage.addVenta(venta);
    window.getVenta = (id) => storage.getVenta(id);
    window.updateVenta = (id, updates) => storage.updateVenta(id, updates);
    window.deleteVenta = (id) => storage.deleteVenta(id);

    // Gastos
    window.getGastos = () => storage.getGastos();
    window.saveGastos = (data) => storage.saveGastos(data);
    window.addGasto = (gasto) => storage.addGasto(gasto);
    window.getGasto = (id) => storage.getGasto(id);
    window.updateGasto = (id, updates) => storage.updateGasto(id, updates);
    window.deleteGasto = (id) => storage.deleteGasto(id);

    // Movimientos
    window.getMovimientos = () => storage.getMovimientos();
    window.addMovimiento = (movimiento) => storage.addMovimiento(movimiento);
    window.getMovimientosByProducto = (productoId) => storage.getMovimientosByProducto(productoId);

    // Configuración
    window.getConfig = () => storage.getConfig();
    window.saveConfig = (config) => storage.saveConfig(config);
    window.updateConfig = (updates) => storage.updateConfig(updates);

    // Usuarios y Sesiones
    window.getUsers = () => storage.getUsers();
    window.addUser = (user) => storage.addUser(user);
    window.getUserByUsername = (username) => storage.getUserByUsername(username);
    window.getSession = () => storage.getSession();
    window.saveSession = (session) => storage.saveSession(session);
    window.clearSession = () => storage.clearSession();

    // Búsqueda
    window.searchInventario = (query) => storage.searchInventario(query);
    window.searchVentas = (query) => storage.searchVentas(query);
    window.searchGastos = (query) => storage.searchGastos(query);

    // Estadísticas
    window.getStats = () => storage.getStats();

    // Exportación
    window.exportInventario = () => storage.exportInventario();
    window.exportVentas = () => storage.exportVentas();
    window.exportGastos = () => storage.exportGastos();

    // Backup
    window.createBackup = () => storage.createBackup();
    window.getBackups = () => storage.getBackups();
    window.restoreBackup = (id) => storage.restoreBackup(id);
    window.deleteBackup = (id) => storage.deleteBackup(id);

    // Utilidades
    window.clearStorage = () => storage.clearAll();
    window.resetToDefaults = () => storage.resetToDefaults();
    window.getStorageInfo = () => storage.getStorageInfo();
    window.generateId = () => storage.generateId();

    console.log('✅ StorageManager inicializado y exportado correctamente');
    console.log('📋 Categorías disponibles:', storage.getDefaultCategorias().length);
    console.log('   ✓ Comidas rápidas, Bebidas, Licores');
    console.log('   ✓ Aseo, Hogar, Mascotas, Papelería');
    console.log('   ✓ Miniaturas, Dulces, Mecato, Cigarrería');
    console.log('   ✓ Ferretería, Tecnología, Ropa');
    console.log('   ✓ Carnes, Lácteos, Abarrotes, Panadería');
    console.log('   ✓ Y muchas más...');

} else {
    console.warn('⚠️ StorageManager ya estaba inicializado, usando instancia existente');
}

// Migrar datos de versiones anteriores
setTimeout(() => {
    if (window.storage) {
        window.storage.migrateFromOldStorage();
    }
}, 500);