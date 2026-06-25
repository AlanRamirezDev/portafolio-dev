import { useState } from 'react';
import reporteriaApi from '../../lib/reporteriaApi';

export default function ReporteriaDashboard() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [downloadCount, setDownloadCount] = useState(0);

    // Datos demo para el backend
    const mockTransactions = [
        { id: 'TXN-001', monto: 2868.60, estado: 'Aprobado', detalle: 'Conversión MXN a BTC' },
        { id: 'TXN-002', monto: 5000.00, estado: 'Pendiente', detalle: 'Fondeo programado Cetes' },
        { id: 'TXN-003', monto: 1500.00, estado: 'Aprobado', detalle: 'Liquidación USDC' },
        { id: 'TXN-004', monto: 320.50,  estado: 'Rechazado', detalle: 'Retiro a cuenta externa' }
    ];

    const handleDownload = async (formato) => {
        if (downloadCount >= 3) {
            setError(
                "Nota: Por la naturaleza de esta demo, la generación de reportes está limitada a 3 descargas por sesión para proteger la memoria del servidor. En un entorno de producción, este límite sería gestionado en el API Gateway."
            );
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const payload = {
                formato: formato,
                data: { items: mockTransactions }
            };

            // Petición HTTP
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
            setError("Error de red: No se pudo conectar con el motor de reportería. Verifica que el backend esté en ejecución.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <section className="bg-surface border border-white/10 rounded-2xl p-6 md:p-8 shadow-lg w-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white font-sans">Panel de Auditoría</h2>
                    <p className="text-text mt-1 text-sm">
                        Generación asíncrona de reportes binarios (PDF/CSV) procesados en memoria.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleDownload('csv')}
                        disabled={isGenerating}
                        className="bg-transparent border border-white/20 text-white hover:bg-white/5 disabled:opacity-50 px-4 py-2 rounded-lg font-mono text-sm transition-colors cursor-pointer"
                    >
                        {isGenerating ? 'Procesando...' : '.CSV'}
                    </button>
                    <button 
                        onClick={() => handleDownload('pdf')}
                        disabled={isGenerating}
                        className="bg-accent text-white hover:bg-accent/90 disabled:opacity-50 px-4 py-2 rounded-lg font-mono text-sm transition-colors shadow-lg shadow-accent/20 cursor-pointer"
                    >
                        {isGenerating ? 'Generando PDF...' : 'Generar PDF'}
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm font-mono leading-relaxed">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider">ID Ref</th>
                            <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Detalle</th>
                            <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Monto</th>
                            <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {mockTransactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-white/5 transition-colors group">
                                <td className="py-3 px-4 font-mono text-sm text-text">{txn.id}</td>
                                <td className="py-3 px-4 text-sm text-white">{txn.detalle}</td>
                                <td className="py-3 px-4 font-mono text-sm text-text">${txn.monto.toFixed(2)}</td>
                                <td className="py-3 px-4">
                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${
                                        txn.estado === 'Aprobado' ? 'bg-green-500/10 text-green-400' : 
                                        txn.estado === 'Pendiente' ? 'bg-yellow-500/10 text-yellow-400' : 
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                        {txn.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}