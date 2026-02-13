// js/auth.js - Sistema de autenticación completo y funcional
// Versión 3.0.0 - COMPLETAMENTE SOLUCIONADO Y COMPATIBLE

class AuthSystem {
    constructor() {
        this.STORAGE_KEYS = {
            AUTH: 'invplanet_auth',
            SESSION: 'invplanet_session',
            CONFIG: 'invplanet_config',
            FIRST_TIME: 'invplanet_first_time',
            USERS: 'invplanet_users'
        };
        
        this.DEFAULT_USERS = [
            {
                id: '1',
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                nombre: 'Administrador',
                email: 'admin@invplanet.com',
                telefono: '',
                fechaCreacion: new Date().toISOString(),
                activo: true,
                lastLogin: null
            },
            {
                id: '2',
                username: 'usuario',
                password: 'usuario123',
                role: 'usuario',
                nombre: 'Usuario Demo',
                email: 'usuario@invplanet.com',
                telefono: '',
                fechaCreacion: new Date().toISOString(),
                activo: true,
                lastLogin: null
            }
        ];
        
        this.DEFAULT_CONFIG = {
            nombreNegocio: 'InvPlanet Sistema',
            horaApertura: '08:00',
            horaCierre: '22:00',
            moneda: 'COP',
            simboloMoneda: '$',
            impuesto: 19,
            margenGanancia: 30,
            telefono: '',
            direccion: '',
            stockMinimoDefault: 10,
            metodoPagoDefault: 'efectivo',
            notificaciones: {
                stockBajo: true,
                ventas: true
            }
        };
        
        console.log('AuthSystem instanciado');
    }
    
    // ============================================
    // MÉTODOS PÚBLICOS - EXPORTADOS INMEDIATAMENTE
    // ============================================
    
    // Método para inicializar el sistema
    initialize() {
        console.log('Inicializando AuthSystem...');
        
        if (!this.checkFirstTime()) {
            console.log('Primera ejecución, creando datos por defecto...');
            return this.initializeSystem();
        }
        
        console.log('Sistema ya inicializado');
        return true;
    }
    
    // Función hash simple para contraseñas
    hashPassword(password) {
        if (!password) return '0';
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    
    // Verificar si es la primera vez
    checkFirstTime() {
        return localStorage.getItem(this.STORAGE_KEYS.FIRST_TIME) === 'true';
    }
    
    // Inicializar el sistema por primera vez
    initializeSystem() {
        try {
            console.log('Creando configuración inicial del sistema...');
            
            // 1. Crear usuarios con hash de contraseñas
            const usersWithHash = this.DEFAULT_USERS.map(user => ({
                ...user,
                password: this.hashPassword(user.password)
            }));
            
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(usersWithHash));
            localStorage.setItem(this.STORAGE_KEYS.AUTH, JSON.stringify(usersWithHash));
            console.log('✓ Usuarios por defecto creados');
            
            // 2. Crear configuración por defecto
            localStorage.setItem(this.STORAGE_KEYS.CONFIG, JSON.stringify(this.DEFAULT_CONFIG));
            console.log('✓ Configuración por defecto creada');
            
            // 3. Crear almacenamientos vacíos para otras partes del sistema
            const emptyStorages = {
                'invplanet_inventario': [],
                'invplanet_categorias': [],
                'invplanet_ventas': [],
                'invplanet_gastos': [],
                'invplanet_clientes': [],
                'invplanet_proveedores': [],
                'invplanet_movimientos': []
            };
            
            Object.keys(emptyStorages).forEach(key => {
                localStorage.setItem(key, JSON.stringify(emptyStorages[key]));
            });
            console.log('✓ Almacenamientos vacíos creados');
            
            // 4. Marcar como inicializado
            localStorage.setItem(this.STORAGE_KEYS.FIRST_TIME, 'true');
            console.log('✓ Sistema marcado como inicializado');
            
            console.log('✅ Sistema inicializado exitosamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando sistema:', error);
            return false;
        }
    }
    
    // Login de usuario
    login(username, password, rememberMe = false) {
        console.log(`Intentando login para usuario: ${username}`);
        
        // Validación básica
        if (!username || !password) {
            console.log('Login fallido: Campos vacíos');
            return { 
                success: false, 
                message: 'Por favor completa todos los campos' 
            };
        }
        
        try {
            // Obtener usuarios del almacenamiento
            const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || 
                                    localStorage.getItem(this.STORAGE_KEYS.AUTH) || '[]');
            
            // Buscar usuario activo
            const user = users.find(u => 
                u.username === username && 
                u.activo !== false
            );
            
            if (!user) {
                console.log('Login fallido: Usuario no encontrado');
                return { 
                    success: false, 
                    message: 'Usuario no encontrado o inactivo' 
                };
            }
            
            // Verificar contraseña
            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                console.log('Login fallido: Contraseña incorrecta');
                return { 
                    success: false, 
                    message: 'Contraseña incorrecta' 
                };
            }
            
            // Calcular duración de sesión
            const sessionDuration = rememberMe ? 
                30 * 24 * 60 * 60 * 1000 : // 30 días
                8 * 60 * 60 * 1000;        // 8 horas
            
            const expires = new Date(Date.now() + sessionDuration);
            
            // Crear objeto de sesión
            const session = {
                userId: user.username,
                nombre: user.nombre,
                role: user.role,
                loginTime: new Date().toISOString(),
                expires: expires.toISOString(),
                rememberMe: rememberMe
            };
            
            // Guardar sesión
            localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
            console.log('✓ Sesión guardada');
            
            // Actualizar último login del usuario
            user.lastLogin = new Date().toISOString();
            const updatedUsers = users.map(u => 
                u.id === user.id ? user : u
            );
            
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
            localStorage.setItem(this.STORAGE_KEYS.AUTH, JSON.stringify(updatedUsers));
            
            console.log(`✅ Login exitoso para: ${username}`);
            
            return { 
                success: true, 
                user: {
                    id: user.id,
                    username: user.username,
                    nombre: user.nombre,
                    role: user.role,
                    email: user.email
                }, 
                session: session 
            };
            
        } catch (error) {
            console.error('Error en login:', error);
            return { 
                success: false, 
                message: 'Error interno del sistema' 
            };
        }
    }
    
    // Verificar si hay una sesión activa
    checkSession() {
        try {
            const sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION);
            
            if (!sessionData) {
                console.log('No hay sesión activa');
                return false;
            }
            
            const session = JSON.parse(sessionData);
            
            // Verificar expiración
            const expires = new Date(session.expires);
            const now = new Date();
            
            if (expires < now) {
                console.log('Sesión expirada');
                localStorage.removeItem(this.STORAGE_KEYS.SESSION);
                return false;
            }
            
            // Si es "rememberMe", extender la sesión
            if (session.rememberMe) {
                const newExpires = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
                session.expires = newExpires.toISOString();
                localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
                console.log('Sesión extendida (rememberMe)');
            }
            
            console.log('Sesión activa válida');
            return true;
            
        } catch (error) {
            console.error('Error verificando sesión:', error);
            return false;
        }
    }
    
    // Obtener usuario actual
    getCurrentUser() {
        try {
            const sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION);
            
            if (!sessionData) {
                console.log('No hay sesión, no se puede obtener usuario');
                return null;
            }
            
            const session = JSON.parse(sessionData);
            
            // Obtener lista de usuarios
            const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || 
                                    localStorage.getItem(this.STORAGE_KEYS.AUTH) || '[]');
            
            // Buscar usuario
            const user = users.find(u => u.username === session.userId);
            
            if (!user) {
                console.log('Usuario no encontrado en la base de datos');
                return null;
            }
            
            // Retornar información básica del usuario
            return {
                id: user.id,
                username: user.username,
                nombre: user.nombre || session.nombre,
                role: user.role || session.role,
                email: user.email || '',
                telefono: user.telefono || ''
            };
            
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            return null;
        }
    }
    
    // Logout
    logout() {
        console.log('Cerrando sesión...');
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        
        // Redirigir al login después de un breve retardo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
    
    // Resetear sistema completo
    resetSystem() {
        if (confirm('⚠️ ¿ESTÁS SEGURO DE RESETEAR TODO EL SISTEMA?\n\nSe perderán TODOS los datos:\n- Usuarios\n- Productos\n- Ventas\n- Configuración\n\nEsta acción NO se puede deshacer.')) {
            console.log('Reseteando sistema...');
            localStorage.clear();
            
            // Mostrar mensaje y redirigir
            setTimeout(() => {
                alert('✅ Sistema reseteado exitosamente. Redirigiendo...');
                window.location.href = 'index.html';
            }, 1000);
        }
    }
    
    // Verificar si el usuario es administrador
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
    
    // Crear nuevo usuario (solo admin)
    createUser(userData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo administradores pueden crear usuarios' };
        }
        
        try {
            const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
            
            // Verificar si el usuario ya existe
            const exists = users.find(u => u.username === userData.username);
            if (exists) {
                return { success: false, message: 'El usuario ya existe' };
            }
            
            // Crear nuevo usuario
            const newUser = {
                id: Date.now().toString(),
                username: userData.username,
                password: this.hashPassword(userData.password),
                role: userData.role || 'usuario',
                nombre: userData.nombre || userData.username,
                email: userData.email || '',
                telefono: userData.telefono || '',
                fechaCreacion: new Date().toISOString(),
                activo: true,
                lastLogin: null
            };
            
            users.push(newUser);
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
            localStorage.setItem(this.STORAGE_KEYS.AUTH, JSON.stringify(users));
            
            console.log(`✅ Usuario creado: ${userData.username}`);
            return { success: true, user: newUser };
            
        } catch (error) {
            console.error('Error creando usuario:', error);
            return { success: false, message: 'Error interno' };
        }
    }
}

// ============================================
// CREACIÓN DE INSTANCIA Y EXPORTACIÓN
// ============================================

console.log('=== Inicializando AuthSystem ===');

// Crear instancia global
const authSystem = new AuthSystem();

// ============================================
// EXPORTACIÓN INMEDIATA - CRÍTICO PARA COMPATIBILIDAD
// ============================================

// Exportar funciones inmediatamente al ámbito global
window.login = (username, password, rememberMe) => {
    return authSystem.login(username, password, rememberMe);
};

window.logout = () => {
    authSystem.logout();
};

window.checkSession = () => {
    return authSystem.checkSession();
};

window.getCurrentUser = () => {
    return authSystem.getCurrentUser();
};

window.resetSystem = () => {
    authSystem.resetSystem();
};

window.initAuth = () => {
    return authSystem.initialize();
};

// Funciones adicionales
window.isAdmin = () => {
    return authSystem.isAdmin();
};

window.createUser = (userData) => {
    return authSystem.createUser(userData);
};

// ============================================
// VERIFICACIÓN DE EXPORTACIÓN
// ============================================

console.log('=== Funciones exportadas ===');
console.log('✓ login() disponible:', typeof window.login === 'function');
console.log('✓ logout() disponible:', typeof window.logout === 'function');
console.log('✓ checkSession() disponible:', typeof window.checkSession === 'function');
console.log('✓ getCurrentUser() disponible:', typeof window.getCurrentUser === 'function');
console.log('✓ resetSystem() disponible:', typeof window.resetSystem === 'function');
console.log('✓ initAuth() disponible:', typeof window.initAuth === 'function');
console.log('✓ isAdmin() disponible:', typeof window.isAdmin === 'function');

// ============================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================

// Inicializar el sistema cuando la página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM cargado - Inicializando AuthSystem...');
        authSystem.initialize();
    });
} else {
    console.log('DOM ya cargado - Inicializando AuthSystem...');
    authSystem.initialize();
}

// También inicializar después de un breve retardo para asegurar
setTimeout(() => {
    if (!authSystem.checkFirstTime()) {
        console.log('Inicialización retardada del sistema...');
        authSystem.initialize();
    }
}, 1000);

console.log('✅ Auth.js cargado y listo para usar');
console.log('====================================');