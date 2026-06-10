import { useEffect, useState, useMemo } from 'react';
import api from "../../lib/api";

export default function AuditLogsTable() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [simulating, setSimulating] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [feedback, setFeedback] = useState('');

    const fetchLogs = async () => {
        try {
            const response = await api.get('/audit-logs');
            setLogs(response.data.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('FORBIDDEN');
            } else {
                setError(err.response?.data?.error || 'No se pudieron cargar los logs de auditoría.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

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
        try {
            await api.post('/demo/simulate');
            await fetchLogs(); 
            setFeedback('✅ 3 eventos aleatorios inyectados');
        } catch (err) {
            console.error("Error al simular tráfico", err);
            setFeedback('❌ Error de inyección');
        } finally {
            setSimulating(false);
            setTimeout(() => setFeedback(''), 5000);
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
            
            // Formato de fecha para que el usuario pueda buscarla tal cual la lee
            const dateStr = new Date(log.created_at).toLocaleString('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).toLowerCase();
            
            return actorName.includes(lowerTerm) || 
                   actorEmail.includes(lowerTerm) || 
                   action.includes(lowerTerm) || 
                   targetEmail.includes(lowerTerm) || 
                   ip.includes(lowerTerm) ||
                   agent.includes(lowerTerm) ||
                   dateStr.includes(lowerTerm);
        });
    }, [logs, searchTerm]);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 bg-surface rounded-xl border border-white/5 shadow-2xl mt-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">Consultando bitácora...</h3>
                    <p className="text-xs text-text/50 max-w-md mx-auto leading-relaxed">
                        ⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.
                    </p>
                </div>
            </div>
        );
    }
    if (error === 'FORBIDDEN') {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 bg-surface border border-red-500/10 rounded-2xl text-center shadow-2xl mt-4">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
                <h3 className="text-xl font-bold text-white mb-2">Sección Restringida</h3>
                <p className="text-text text-sm leading-relaxed max-w-md mx-auto">
                    Acceso denegado. Tu rol en el sistema no tiene privilegios para visualizar la bitácora de auditoría.
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
                            <h4 className="text-sm font-bold text-white">Modo Demostración</h4>
                            <p className="text-xs text-text/80 leading-relaxed max-w-3xl mt-1">
                                En un entorno de producción real, esta bitácora es estricta e inmutable. El sistema cuenta con 5 registros históricos pre-cargados para demostrar los estados de la interfaz, y tu actividad actual ya se está registrando. Además, esta función te permite inyectar tráfico masivo para evaluación técnica.
                            </p>
                        </div>
                    </div>
                    {/* Contenedor del botón ajustado para responsividad */}
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
                            {simulating ? 'Inyectando...' : 'Simular Tráfico'}
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
                        placeholder="Buscador"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent text-sm transition-colors"
                    />
                </div>
                <div className="text-xs text-text font-mono">
                    Mostrando: <span className="text-white">{filteredLogs.length}</span> registro(s)
                </div>
            </div>

            {/* --- TABLA PRINCIPAL --- */}
            <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[500px] border-b border-white/5 pb-2 relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-background/90 backdrop-blur-sm sticky top-0 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-text z-10">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Acción</th>
                                <th className="px-6 py-4">Dirección IP</th>
                                <th className="px-6 py-4">Detalles del Dispositivo</th>
                                <th className="px-6 py-4">Fecha/Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-text">
                                        No se encontraron registros que coincidan con la búsqueda.
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
                                                    <div className="font-medium text-red-400/80 italic text-xs">Registro Nulo</div>
                                                    <div className="text-xs text-text font-mono mt-0.5 opacity-50">Se hizo un Hard Delete</div>
                                                </>
                                            )}
                                        </td>
                                        
                                        {/* Acción */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-mono rounded-md border ${getActionBadgeStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                            
                                            {/* Renderizado condicional del usuario afectado extraído del payload */}
                                            {log.payload?.target_email && (
                                                <div className="mt-1.5 flex items-center text-[11px] font-mono">
                                                    <span className="text-text/70 mr-1.5">Usuario:</span>
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
                                            {log.payload?.user_agent || 'Desconocido'}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-xs text-text font-mono">
                                            {new Date(log.created_at).toLocaleString('es-MX', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
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