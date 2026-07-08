import { useEffect, useState } from 'react';
import iamApi from "../../lib/iam/iamApi";

const ROLE_DICTIONARY = {
    es: {
        'admin': 'Administrador',
        'auditor': 'Auditor',
        'operador': 'Operador'
    },
    en: {
        'admin': 'Administrator',
        'auditor': 'Auditor',
        'operador': 'Operator'
    }
};

// Diccionario
const ui = {
    es: {
        errPrivileges: 'Privilegios insuficientes. Tu rol actual no tiene autorización para acceder a este módulo.',
        errConnection: 'Error al cargar los datos. Por favor, verifica tu conexión con el servidor.',
        errPwdSec: 'La contraseña no cumple con todos los requisitos de seguridad.',
        errCreateUser: 'Error al crear el usuario.',
        errDeleteUser: 'Error al procesar la baja del usuario.',
        errRestoreUser: 'Error al reactivar el usuario.',
        msgCreateSuccess: 'Usuario registrado exitosamente.',
        msgDeleteSuccess: 'Usuario dado de baja correctamente.',
        msgRestoreSuccess: 'Usuario reactivado exitosamente.',
        pwdLength: '8+ Caracteres',
        pwdUpper: 'Mayúscula',
        pwdLower: 'Minúscula',
        pwdNumber: 'Número',
        pwdSymbol: 'Caracter especial',
        loadingTitle: 'Cargando directorio de usuarios...',
        loadingNote: '⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.',
        restrictedTitle: 'Sección Restringida',
        newUserTitle: 'Nuevo Usuario',
        lblName: 'Nombre',
        lblEmail: 'Correo',
        lblPwd: 'Contraseña',
        lblRole: 'Rol del Sistema',
        btnSubmit: 'Registrar Cuenta',
        btnProcessing: 'Procesando...',
        readModeTitle: 'Modo Lectura',
        readModeDesc: 'Tu rol en el sistema solo permite visualizar el directorio de usuarios. No tienes privilegios para crear o modificar accesos.',
        thUser: 'Usuario',
        thStatusRole: 'Estado / Rol',
        thDate: 'Fecha de Alta',
        thActions: 'Acciones',
        statusActive: 'Activo',
        statusInactive: 'Inactivo',
        btnRestore: 'Reactivar',
        btnDelete: 'Dar de baja',
        modalDeleteTitle: 'Confirmar acción',
        modalDeleteDesc1: 'Estás a punto de revocar el acceso y dar de baja lógicamente al usuario',
        modalDeleteDesc2: '. ¿Deseas continuar?',
        modalRestoreTitle: 'Confirmar reactivación',
        modalRestoreDesc1: 'Estás a punto de restaurar el acceso al usuario',
        modalRestoreDesc2: '. ¿Deseas continuar?',
        btnCancel: 'Cancelar',
        btnConfirmDelete: 'Sí, dar de baja',
        btnConfirmRestore: 'Sí, reactivar'
    },
    en: {
        errPrivileges: 'Insufficient privileges. Your current role is not authorized to access this module.',
        errConnection: 'Error loading data. Please check your connection to the server.',
        errPwdSec: 'The password does not meet all security requirements.',
        errCreateUser: 'Error creating user.',
        errDeleteUser: 'Error processing user deactivation.',
        errRestoreUser: 'Error reactivating user.',
        msgCreateSuccess: 'User registered successfully.',
        msgDeleteSuccess: 'User deactivated successfully.',
        msgRestoreSuccess: 'User reactivated successfully.',
        pwdLength: '8+ Characters',
        pwdUpper: 'Uppercase',
        pwdLower: 'Lowercase',
        pwdNumber: 'Number',
        pwdSymbol: 'Special Character',
        loadingTitle: 'Loading user directory...',
        loadingNote: '⏳ Note: The backend uses a free cloud tier. If it is the first load after a period of inactivity, the server may take up to 60 seconds to start. Thank you for your patience.',
        restrictedTitle: 'Restricted Section',
        newUserTitle: 'New User',
        lblName: 'Name',
        lblEmail: 'Email',
        lblPwd: 'Password',
        lblRole: 'System Role',
        btnSubmit: 'Register Account',
        btnProcessing: 'Processing...',
        readModeTitle: 'Read-Only Mode',
        readModeDesc: 'Your system role only allows viewing the user directory. You do not have privileges to create or modify accesses.',
        thUser: 'User',
        thStatusRole: 'Status / Role',
        thDate: 'Registration Date',
        thActions: 'Actions',
        statusActive: 'Active',
        statusInactive: 'Inactive',
        btnRestore: 'Reactivate',
        btnDelete: 'Deactivate',
        modalDeleteTitle: 'Confirm action',
        modalDeleteDesc1: 'You are about to revoke access and logically deactivate the user',
        modalDeleteDesc2: '. Do you wish to continue?',
        modalRestoreTitle: 'Confirm reactivation',
        modalRestoreDesc1: 'You are about to restore access to the user',
        modalRestoreDesc2: '. Do you wish to continue?',
        btnCancel: 'Cancel',
        btnConfirmDelete: 'Yes, deactivate',
        btnConfirmRestore: 'Yes, reactivate'
    }
};

export default function UserManagement({ lang = 'es' }) {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [globalError, setGlobalError] = useState('');
    const [isForbidden, setIsForbidden] = useState(false);
    const [notification, setNotification] = useState({ type: '', message: '' });
    
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToRestore, setUserToRestore] = useState(null);

    const [showValidationErrors, setShowValidationErrors] = useState(false);

    const t = (key) => ui[lang][key] || ui['es'][key];

    const pwd = formData.password;
    const pwdValidations = [
        { id: 'length', label: t('pwdLength'), isValid: pwd.length >= 8 },
        { id: 'upper', label: t('pwdUpper'), isValid: /[A-Z]/.test(pwd) },
        { id: 'lower', label: t('pwdLower'), isValid: /[a-z]/.test(pwd) },
        { id: 'number', label: t('pwdNumber'), isValid: /[0-9]/.test(pwd) },
        { id: 'symbol', label: t('pwdSymbol'), isValid: /[^A-Za-z0-9]/.test(pwd) }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ type: '', message: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes, authRes] = await Promise.all([
                iamApi.get('/users'),
                iamApi.get('/roles'),
                iamApi.get('/auth/me')
            ]);
            
            setUsers(usersRes.data.data); 
            setRoles(rolesRes.data);
            setCurrentUser(authRes.data);

            if (rolesRes.data.length > 0) {
                setFormData(prev => ({ ...prev, role: rolesRes.data[0].name }));
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setIsForbidden(true);
                setGlobalError(t('errPrivileges'));
            } else {
                setGlobalError(t('errConnection'));
            }
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = currentUser?.roles?.some(r => r.name === 'admin');

    const handleCreateUser = async (e) => {
        e.preventDefault();
        
        const isPasswordValid = pwdValidations.every(v => v.isValid);
        if (!isPasswordValid) {
            setShowValidationErrors(true);
            setNotification({ type: 'error', message: t('errPwdSec') });
            return;
        }

        setIsSubmitting(true);
        setNotification({ type: '', message: '' });
        setShowValidationErrors(false);

        window.dispatchEvent(new CustomEvent('iam-user-creation', { detail: { active: true } }));

        try {
            const response = await iamApi.post('/users', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                roles: [formData.role] 
            });
            
            setUsers(prevUsers => [response.data, ...prevUsers]);

            setNotification({ type: 'success', message: t('msgCreateSuccess') });
            setFormData({ name: '', email: '', password: '', role: roles[0]?.name || '' });
        } catch (err) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                const errorKeys = Object.keys(err.response.data.errors);
                const firstErrorMessage = err.response.data.errors[errorKeys[0]][0];
                setNotification({ type: 'error', message: firstErrorMessage });
            } else {
                setNotification({ type: 'error', message: err.response?.data?.message || t('errCreateUser') });
            }
        } finally {
            setIsSubmitting(false);
            window.dispatchEvent(new CustomEvent('iam-user-creation', { detail: { active: false } }));
        }
    };

    const confirmDelete = async () => {
        if (!userToDelete || isSubmitting) return;
        
        setIsSubmitting(true);
        const targetId = userToDelete.id;
        
        try {
            await iamApi.delete(`/users/${targetId}`);
            
            setUsers(prevUsers => prevUsers.map(user => 
                user.id === targetId 
                ? { ...user, deleted_at: new Date().toISOString() } 
                : user
            ));

            setUserToDelete(null);
            setNotification({ type: 'success', message: t('msgDeleteSuccess') });
        } catch (err) {
            setUserToDelete(null);
            setNotification({ type: 'error', message: err.response?.data?.error || t('errDeleteUser') });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reactivar usuario
    const handleRestoreUser = (user) => {
        setUserToRestore(user);
    };

    const confirmRestore = async () => {
        if (!userToRestore || isSubmitting) return;
        
        setIsSubmitting(true);
        const targetId = userToRestore.id;
        
        try {
            await iamApi.post(`/users/${targetId}/restore`);
            
            setUsers(prevUsers => prevUsers.map(user => 
                user.id === targetId 
                ? { ...user, deleted_at: null } 
                : user
            ));

            setUserToRestore(null);
            setNotification({ type: 'success', message: t('msgRestoreSuccess') });
        } catch (err) {
            setUserToRestore(null);
            setNotification({ type: 'error', message: err.response?.data?.error || t('errRestoreUser') });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 bg-surface rounded-xl border border-white/5 shadow-2xl mt-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                <div className="space-y-2 animate-pulse">
                    <h3 className="text-xl font-semibold text-white">{t('loadingTitle')}</h3>
                    <p className="text-xs text-text/50 max-w-md mx-auto leading-relaxed">
                        {t('loadingNote')}
                    </p>
                </div>
            </div>
        );
    }

    if (isForbidden) {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 bg-surface border border-red-500/10 rounded-2xl text-center shadow-2xl mt-4">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
                <h3 className="text-xl font-bold text-white mb-2">{t('restrictedTitle')}</h3>
                <p className="text-text text-sm leading-relaxed max-w-md mx-auto">{globalError}</p>
            </div>
        );
    }

    if (globalError) return <div className="p-4 bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl font-medium font-mono text-sm">{globalError}</div>;

    const currentRoleDict = ROLE_DICTIONARY[lang] || ROLE_DICTIONARY['es'];

    return (
        <div className="relative">
            {notification.message && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
                    notification.type === 'error' 
                    ? 'bg-red-400/10 border-red-400/20 text-red-400' 
                    : 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                }`}>
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification({ type: '', message: '' })} className="hover:opacity-70 transition-opacity ml-4 font-bold">✕</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Se oculta el formulario si no es Admin y se muestra tarjeta informativa */}
                <div className="lg:col-span-1">
                    {isAdmin ? (
                        <div className="bg-surface border border-white/5 rounded-xl p-6 h-fit shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">{t('newUserTitle')}</h3>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label htmlFor="createName" className="block text-xs font-medium text-text mb-1 uppercase tracking-wider">{t('lblName')}</label>
                                    <input id="createName" type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="createEmail" className="block text-xs font-medium text-text mb-1 uppercase tracking-wider">{t('lblEmail')}</label>
                                    <input id="createEmail" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent font-mono text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="createPassword" className="block text-xs font-medium text-text mb-1 uppercase tracking-wider">{t('lblPwd')}</label>
                                    <input 
                                        id="createPassword"
                                        type="password" 
                                        required 
                                        value={formData.password} 
                                        onChange={(e) => {
                                            setFormData({...formData, password: e.target.value});
                                            setShowValidationErrors(false);
                                        }} 
                                        className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent font-mono text-sm" 
                                    />
                                    
                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                        {pwdValidations.map(req => (
                                            <span 
                                                key={req.id} 
                                                className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors duration-300 ${
                                                    req.isValid 
                                                    ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' 
                                                    : (showValidationErrors 
                                                        ? 'bg-red-400/10 border-red-400/20 text-red-400' 
                                                        : 'bg-white/5 border-white/10 text-text/50')
                                                }`}
                                            >
                                                {req.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="createRole" className="block text-xs font-medium text-text mb-1 uppercase tracking-wider mt-2">{t('lblRole')}</label>
                                    <select id="createRole" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent text-sm">
                                        {roles.map(r => (
                                            <option key={r.id} value={r.name}>{currentRoleDict[r.name] || r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full py-2.5 mt-4 bg-accent text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-sm">
                                    {isSubmitting ? t('btnProcessing') : t('btnSubmit')}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-surface border border-white/5 rounded-xl p-6 h-fit shadow-2xl text-center">
                            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">👁️</div>
                            <h3 className="text-lg font-bold text-white mb-2">{t('readModeTitle')}</h3>
                            <p className="text-text text-sm leading-relaxed">
                                {t('readModeDesc')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 bg-surface border border-white/5 rounded-xl overflow-hidden shadow-2xl h-fit">
                    <div className="overflow-x-auto overflow-y-auto max-h-[500px] border-b border-white/5 pb-2 relative">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-background/90 backdrop-blur-sm sticky top-0 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-text z-10">
                                <tr>
                                    <th className="px-6 py-4">{t('thUser')}</th>
                                    <th className="px-6 py-4">{t('thStatusRole')}</th>
                                    <th className="px-6 py-4">{t('thDate')}</th>
                                    {isAdmin && <th className="px-6 py-4 text-right">{t('thActions')}</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {users.map((user) => {
                                    const isInactive = !!user.deleted_at;
                                    const locales = lang === 'es' ? 'es-MX' : 'en-US';
                                    
                                    return (
                                        <tr key={user.id} className={`transition-colors ${isInactive ? 'bg-black/20 opacity-70' : 'hover:bg-white/5'}`}>
                                            <td className="px-6 py-4">
                                                <div className={`font-medium ${isInactive ? 'text-text/70 line-through' : 'text-white'}`}>{user.name}</div>
                                                <div className="text-xs text-text font-mono mt-0.5">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    {/* Badge de Estado Activo/Inactivo */}
                                                    <span className={`inline-flex px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border ${
                                                        isInactive 
                                                        ? 'bg-red-400/10 text-red-400 border-red-400/20' 
                                                        : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                                                    }`}>
                                                        {isInactive ? t('statusInactive') : t('statusActive')}
                                                    </span>
                                                    
                                                    {/* Badge de Rol */}
                                                    {user.roles?.map(role => (
                                                        <span key={role.id} className={`inline-flex px-2.5 py-1 text-xs font-mono rounded-md border ${
                                                            isInactive ? 'bg-white/5 text-text border-white/10' : 'bg-accent/10 text-accent border-accent/20'
                                                        }`}>
                                                            {currentRoleDict[role.name] || role.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-text font-mono">
                                                {new Date(user.created_at).toLocaleDateString(locales, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </td>
                                            
                                            {/* Columna de Acciones (Admin) */}
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-right">
                                                    {isInactive ? (
                                                        <button 
                                                            disabled={isSubmitting} 
                                                            onClick={() => handleRestoreUser(user)} 
                                                            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                                        >
                                                            {t('btnRestore')}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            disabled={isSubmitting} 
                                                            onClick={() => setUserToDelete(user)} 
                                                            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                                        >
                                                            {t('btnDelete')}
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación para Baja */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h4 className="text-lg font-bold text-white mb-2">{t('modalDeleteTitle')}</h4>
                        <p className="text-sm text-text mb-6">
                            {t('modalDeleteDesc1')} <span className="text-white font-mono bg-white/5 px-1 rounded">{userToDelete.email}</span>{t('modalDeleteDesc2')}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button disabled={isSubmitting} onClick={() => setUserToDelete(null)} className="px-4 py-2 text-sm font-medium text-text hover:text-white transition-colors disabled:opacity-50">{t('btnCancel')}</button>
                            <button disabled={isSubmitting} onClick={confirmDelete} className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
                                {isSubmitting ? t('btnProcessing') : t('btnConfirmDelete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Reactivación */}
            {userToRestore && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h4 className="text-lg font-bold text-white mb-2">{t('modalRestoreTitle')}</h4>
                        <p className="text-sm text-text mb-6">
                            {t('modalRestoreDesc1')} <span className="text-white font-mono bg-white/5 px-1 rounded">{userToRestore.email}</span>{t('modalRestoreDesc2')}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button disabled={isSubmitting} onClick={() => setUserToRestore(null)} className="px-4 py-2 text-sm font-medium text-text hover:text-white transition-colors disabled:opacity-50">{t('btnCancel')}</button>
                            <button disabled={isSubmitting} onClick={confirmRestore} className="px-4 py-2 text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                                {isSubmitting ? t('btnProcessing') : t('btnConfirmRestore')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}