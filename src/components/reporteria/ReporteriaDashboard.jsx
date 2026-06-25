import { useState } from 'react';
import reporteriaApi from '../../lib/reporteriaApi';

export default function ReporteriaDashboard() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [downloadCount, setDownloadCount] = useState(0);
    const [lastAction, setLastAction] = useState(null);
    const [serverStatus, setServerStatus] = useState('offline');

    // Datos demo para el backend
    const mockTransactions = [
        { id: 'TXN-001', monto: 2868.60, estado: 'Aprobado', detalle: 'Conversión MXN a BTC' },
        { id: 'TXN-002', monto: 5000.00, estado: 'Pendiente', detalle: 'Fondeo programado Cetes' },
        { id: 'TXN-003', monto: 1500.00, estado: 'Aprobado', detalle: 'Liquidación USDC' },
        { id: 'TXN-004', monto: 320.50,  estado: 'Rechazado', detalle: 'Retiro a cuenta externa' }
    ];

    // Función para despertar el servidor (backend)
    const wakeUpServer = async () => {
        setServerStatus('waking');
        setError(null);
        try {
            await reporteriaApi.get('/ping');
            setServerStatus('online');
        } catch (err) {
            setServerStatus('offline');
            setError("Error: No se pudo encender el servidor. Contacta al administrador");
        }
    };

    const handleDownload = async (formato) => {
        if (serverStatus !== 'online') {
            setError("El servidor debe estar encendido primero antes de generar reportes.");
            return;
        }

        if (downloadCount >= 3) {
            setError(
                "Nota: Por la naturaleza de esta demo, la generación de reportes está limitada a 3 descargas por sesión para proteger la memoria del servidor. En un entorno de producción, este límite sería gestionado en el API Gateway."
            );
            return;
        }

        setIsGenerating(true);
        setError(null);
        setLastAction(formato);

        try {
            const payload = { formato, data: { items: mockTransactions } };
            const response = await reporteriaApi.post('/reportes/generar', payload, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Auditoria_Financiera_${new Date().getTime()}.${formato}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setDownloadCount(prev => prev + 1);
        } catch (err) {
            setServerStatus('offline');
            setError("💤 El servidor entró en suspensión por inactividad. Por favor, haz clic en 'Encender Servidor' para reactivarlo.");
        } finally {
            setIsGenerating(false);
            setTimeout(() => setLastAction(null), 3000);
        }
    };

    if (serverStatus === 'waking') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 bg-surface rounded-xl border border-white/5 shadow-2xl mt-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">Encendiendo el servidor...</h3>
                    <p className="text-xs text-text/50 max-w-md mx-auto leading-relaxed">
                        ⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full mt-4">
            {/* Banner de Contexto y Estado */}
            <div className="bg-surface border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
                <div>
                    <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Panel de Generación de Reportes
                    </h2>
                    <p className="text-text mt-1 text-sm max-w-xl">
                        Este módulo empaqueta los datos transaccionales de prueba de la tabla inferior en formato JSON, y los envía al backend. Selecciona un formato para que el servidor compile la información y puedas ver su funcionamiento.
                    </p>
                </div>
                
                {/* Botón dinámico */}
                {serverStatus === 'offline' ? (
                    <button 
                        onClick={wakeUpServer}
                        className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30 transition-colors cursor-pointer group min-w-[220px]"
                    >
                        <div className="relative flex h-3 w-3 shrink-0">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 group-hover:scale-110 transition-transform"></span>
                        </div>
                        <span className="text-xs font-mono text-red-400 uppercase tracking-wide">Encender Servidor</span>
                    </button>
                ) : (
                    <div className="flex items-center justify-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30 min-w-[220px]">
                        <div className="relative flex h-3 w-3 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </div>
                        <span className="text-xs font-mono text-green-400 uppercase tracking-wide">Servidor Listo</span>
                    </div>
                )}
            </div>

            {/* Tarjetas de Acción Interactivas */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Botón CSV */}
                <button 
                    onClick={() => handleDownload('csv')}
                    disabled={isGenerating || serverStatus !== 'online'}
                    className="relative text-left group bg-surface border border-white/10 hover:border-accent/50 p-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:hover:border-white/10 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Exportar .CSV (Crudo)</h3>
                        <p className="text-xs text-text leading-relaxed">
                            Procesamiento vía <code className="text-accent bg-accent/10 px-1 rounded">php://temp</code>. Ideal para ingesta de datos. Escribe flujos directamente en memoria de manera ágil (sin tocar el disco del servidor).
                        </p>
                        {lastAction === 'csv' && isGenerating && <span className="mt-4 block text-xs font-mono text-accent animate-pulse">Generando...</span>}
                    </div>
                </button>

                {/* Botón PDF */}
                <button 
                    onClick={() => handleDownload('pdf')}
                    disabled={isGenerating || serverStatus !== 'online'}
                    className="relative text-left group bg-surface border border-white/10 hover:border-accent/50 p-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:hover:border-white/10 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_15px_rgba(0,128,255,0.05)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="bg-accent/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Generar Reporte .PDF</h3>
                        <p className="text-xs text-text leading-relaxed">
                            Renderizado de plantillas. Aplica aritmética en el backend para calcular KPIs e inyecta la vista gráfica optimizada para archivos PDF.
                        </p>
                        {lastAction === 'pdf' && isGenerating && <span className="mt-4 block text-xs font-mono text-accent animate-pulse">Compilando vista y calculando KPIs...</span>}
                    </div>
                </button>
            </div>

            {/* Manejador de Errores */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-mono leading-relaxed flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Tabla de Previsualización (Payload) */}
            <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider opacity-80 border-b border-white/10 pb-3">
                    Información Demo para procesar (JSON)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider">ID Ref</th>
                                <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Detalle Operativo</th>
                                <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider text-right">Monto</th>
                                <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockTransactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-4 font-mono text-sm text-text whitespace-nowrap">{txn.id}</td>
                                    <td className="py-3 px-4 text-sm text-white">{txn.detalle}</td>
                                    <td className="py-3 px-4 font-mono text-sm text-text text-right">${txn.monto.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${
                                            txn.estado === 'Aprobado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                            txn.estado === 'Pendiente' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {txn.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}