import { useEffect, useState, useMemo, useRef } from 'react';
import iamApi from "../../lib/iam/iamApi";

// Se extrae la función fuera del componente para evitar que se vuelva a instanciar en memoria.
// Helper para colores dinámicos en las burbujas de acción
const getActionBadgeStyle = (action) => {
    switch(action) {
        case 'LOGIN_SUCCESS': 
            return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
        case 'USER_CREATED': 
            return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
        case 'USER_DELETED': 
            return 'bg-red-400/10 text-red-400 border-red-400/20';
        case 'USER_RESTORED':
            return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
        default: 
            return 'bg-white/5 text-text border-white/10';
    }
};

// Diccionario
const ui = {
    es: {
        errFetch: 'No se pudieron cargar los logs de auditoría.',
        loadingTitle: 'Consultando bitácora...',
        loadingNote: '⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.',
        restrictedTitle: 'Sección Restringida',
        restrictedDesc: 'Acceso denegado. Tu rol en el sistema no tiene privilegios para visualizar la bitácora de auditoría.',
        demoTitle: 'Modo Demostración',
        demoDesc: 'En un entorno de producción real, esta bitácora debe ser estricta e inmutable. El sistema cuenta con 5 registros históricos pre-cargados (inalterables) para demostrar los estados de la interfaz. Tu actividad real ya se está registrando bajo un estricto protocolo de anonimización en la IP. Al usar la función de',
        demoSimulateText: 'Simular Tráfico',
        demoDescEnd: ', el sistema inyectará eventos aleatorios con direcciones IP ficticias visibles para fines didácticos.',
        simInjecting: 'Inyectando...',
        simBtn: 'Simular Tráfico',
        feedbackSuccess: '✅ 3 eventos aleatorios inyectados',
        feedbackError: '❌ Error de inyección',
        searchPlaceholder: 'Buscador',
        showing: 'Mostrando:',
        records: 'registro(s)',
        thId: 'ID',
        thUser: 'Usuario',
        thAction: 'Acción',
        thIp: 'Dirección IP',
        thDevice: 'Detalles del Dispositivo',
        thDate: 'Fecha/Hora',
        noRecords: 'No se encontraron registros que coincidan con la búsqueda.',
        nullRecord: 'Registro Nulo',
        hardDelete: 'Se hizo un Hard Delete',
        targetUser: 'Usuario:',
        unknownDevice: 'Desconocido'
    },
    en: {
        errFetch: 'Could not load audit logs.',
        loadingTitle: 'Querying audit log...',
        loadingNote: '⏳ Note: The backend uses a free cloud tier. If it is the first load after a period of inactivity, the server may take up to 60 seconds to start. Thank you for your patience.',
        restrictedTitle: 'Restricted Section',
        restrictedDesc: 'Access denied. Your system role does not have privileges to view the audit log.',
        demoTitle: 'Demonstration Mode',
        demoDesc: 'In a real production environment, this log must be strict and immutable. The system has 5 pre-loaded historical records (unalterable) to demonstrate interface states. Your real activity is already being logged under a strict IP anonymization protocol. By using the',
        demoSimulateText: 'Simulate Traffic',
        demoDescEnd: 'feature, the system will inject random events with fictional IP addresses visible for educational purposes.',
        simInjecting: 'Injecting...',
        simBtn: 'Simulate Traffic',
        feedbackSuccess: '✅ 3 random events injected',
        feedbackError: '❌ Injection error',
        searchPlaceholder: 'Search',
        showing: 'Showing:',
        records: 'record(s)',
        thId: 'ID',
        thUser: 'User',
        thAction: 'Action',
        thIp: 'IP Address',
        thDevice: 'Device Details',
        thDate: 'Date/Time',
        noRecords: 'No records found matching the search.',
        nullRecord: 'Null Record',
        hardDelete: 'A Hard Delete was performed',
        targetUser: 'User:',
        unknownDevice: 'Unknown'
    }
};

export default function AuditLogsTable({ lang = 'es' }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [simulating, setSimulating] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [feedback, setFeedback] = useState('');

    const timeoutRef = useRef(null);

    const t = (key) => ui[lang][key] || ui['es'][key];

    const fetchLogs = async () => {
        try {
            const response = await iamApi.get('/audit-logs');
            
            // Adaptación del formato de fecha
            const locales = lang === 'es' ? 'es-MX' : 'en-US';
            
            const logsProcesados = response.data.data.map(log => ({
                ...log,
                displayDate: new Date(log.created_at).toLocaleString(locales, {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                })
            }));

            setLogs(logsProcesados);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('FORBIDDEN');
            } else {
                setError(err.response?.data?.error || t('errFetch'));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [lang]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const hasAdminRole = user.roles?.some(role => role.name === 'admin');
            setIsAdmin(hasAdminRole);
        }
    }, []);

    // Función para inyectar tráfico y recargar la tabla automáticamente
    const handleSimulate = async () => {
        setSimulating(true);
        setFeedback('');
        
        window.dispatchEvent(new CustomEvent('iam-simulation', { detail: { active: true } }));
        
        try {
            await iamApi.post('/demo/simulate');
            await fetchLogs(); 
            setFeedback(t('feedbackSuccess'));
        } catch (err) {
            console.error("Error al simular tráfico", err);
            setFeedback(t('feedbackError'));
        } finally {
            setSimulating(false);
            
            window.dispatchEvent(new CustomEvent('iam-simulation', { detail: { active: false } }));
            
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setFeedback(''), 5000);
        }
    };

    const filteredLogs = useMemo(() => {
        if (!searchTerm) return logs;
        
        const lowerTerm = searchTerm.toLowerCase();
        return logs.filter(log => {
            const actorName = log.user?.name?.toLowerCase() || '';
            const actorEmail = log.user?.email?.toLowerCase() || '';
            const action = log.action?.toLowerCase() || '';
            const targetEmail = log.payload?.target_email?.toLowerCase() || '';
            const ip = log.ip_address?.toLowerCase() || '';
            const agent = log.payload?.user_agent?.toLowerCase() || '';
            const dateStr = log.displayDate.toLowerCase();
            
            return actorName.includes(lowerTerm) || 
                   actorEmail.includes(lowerTerm) || 
                   action.includes(lowerTerm) || 
                   targetEmail.includes(lowerTerm) || 
                   ip.includes(lowerTerm) ||
                   agent.includes(lowerTerm) ||
                   dateStr.includes(lowerTerm);
        });
    }, [logs, searchTerm]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 bg-surface rounded-xl border border-white/5 shadow-2xl mt-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">{t('loadingTitle')}</h3>
                    <p className="text-xs text-text/50 max-w-md mx-auto leading-relaxed animate-pulse">
                        {t('loadingNote')}
                    </p>
                </div>
            </div>
        );
    }

    if (error === 'FORBIDDEN') {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 bg-surface border border-red-500/10 rounded-2xl text-center shadow-2xl mt-4">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
                <h3 className="text-xl font-bold text-white mb-2">{t('restrictedTitle')}</h3>
                <p className="text-text text-sm leading-relaxed max-w-md mx-auto">
                    {t('restrictedDesc')}
                </p>
            </div>
        );
    }

    if (error) return <div className="p-4 bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl font-medium">{error}</div>;

    return (
        <div className="space-y-4">
            {/* --- AVISO Y CONTROLES DE MODO DEMO --- */}
            {isAdmin && (
                <div className="bg-surface p-4 rounded-xl border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_15px_rgba(0,128,255,0.05)] mt-4">
                    <div className="flex items-start gap-3">
                        <span className="text-accent mt-0.5 text-lg">ℹ️</span>
                        <div>
                            <h4 className="text-sm font-bold text-white">{t('demoTitle')}</h4>
                            <p className="text-xs text-text/80 leading-relaxed max-w-3xl mt-1">
                                {t('demoDesc')} <strong>{t('demoSimulateText')}</strong>{t('demoDescEnd')}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
                        {feedback && (
                            <span className="text-xs font-medium text-emerald-400 animate-pulse bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20 text-center w-full sm:w-auto">
                                {feedback}
                            </span>
                        )}
                        <button
                            onClick={handleSimulate}
                            disabled={simulating}
                            className="w-full sm:w-auto whitespace-nowrap px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {simulating ? t('simInjecting') : t('simBtn')}
                        </button>
                    </div>
                </div>
            )}
    
            {/* --- COMPONENTE DEL BUSCADOR --- */}
            <div className="bg-surface p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text/50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent text-sm transition-colors"
                    />
                </div>
                <div className="text-xs text-text font-mono">
                    {t('showing')} <span className="text-white">{filteredLogs.length}</span> {t('records')}
                </div>
            </div>

            {/* --- TABLA PRINCIPAL --- */}
            <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[500px] border-b border-white/5 pb-2 relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-background/90 backdrop-blur-sm sticky top-0 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-text z-10">
                            <tr>
                                <th className="px-6 py-4">{t('thId')}</th>
                                <th className="px-6 py-4">{t('thUser')}</th>
                                <th className="px-6 py-4">{t('thAction')}</th>
                                <th className="px-6 py-4">{t('thIp')}</th>
                                <th className="px-6 py-4">{t('thDevice')}</th>
                                <th className="px-6 py-4">{t('thDate')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-text">
                                        {t('noRecords')}
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-text/70">#{log.id}</td>
                                        
                                        {/* Usuario */}
                                        <td className="px-6 py-4">
                                            {log.user ? (
                                                <>
                                                    <div className="font-medium text-white">{log.user.name}</div>
                                                    <div className="text-xs text-text font-mono mt-0.5">{log.user.email}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="font-medium text-red-400/80 italic text-xs">{t('nullRecord')}</div>
                                                    <div className="text-xs text-text font-mono mt-0.5 opacity-50">{t('hardDelete')}</div>
                                                </>
                                            )}
                                        </td>
                                        
                                        {/* Acción */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-mono rounded-md border ${getActionBadgeStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                            {/* Renderizado del usuario afectado */}
                                            {log.payload?.target_email && (
                                                <div className="mt-1.5 flex items-center text-[11px] font-mono">
                                                    <span className="text-text/70 mr-1.5">{t('targetUser')}</span>
                                                    <span 
                                                        className="text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/10 truncate max-w-[120px] inline-block align-bottom" 
                                                        title={log.payload.target_email}
                                                    >
                                                        {log.payload.target_email}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4 font-mono text-xs text-text">{log.ip_address}</td>
                                        
                                        {/* Detalles del dispositivo */}
                                        <td className="px-6 py-4 text-xs text-text font-mono truncate max-w-[200px]" title={log.payload?.user_agent}>
                                            {log.payload?.user_agent || t('unknownDevice')}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-xs text-text font-mono">
                                            {log.displayDate}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}