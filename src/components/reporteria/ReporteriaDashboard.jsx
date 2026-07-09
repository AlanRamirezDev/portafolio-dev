import { useState } from 'react';
import reporteriaApi from '../../lib/reporteria/reporteriaApi';

    // Datos demo para el backend
    const initialDemoData = {
        es: [
            { id: 'TXN-001', monto: 2868.60, estado: 'Aprobado', detalle: 'Conversión MXN a BTC' },
            { id: 'TXN-002', monto: 5000.00, estado: 'Pendiente', detalle: 'Fondeo programado Cetes' },
            { id: 'TXN-003', monto: 1500.00, estado: 'Aprobado', detalle: 'Liquidación USDC' },
            { id: 'TXN-004', monto: 320.50,  estado: 'Rechazado', detalle: 'Retiro a cuenta externa' },
            { id: 'TXN-005', monto: 12500.00, estado: 'En Revision', detalle: 'Depósito inusual en ventanilla' },
            { id: 'TXN-006', monto: 450.00, estado: 'Aprobado', detalle: 'Pago de servicios' },
            { id: 'TXN-007', monto: 890.00, estado: 'Pendiente', detalle: 'Transferencia SPEI' },
            { id: 'TXN-008', monto: 120.00, estado: 'Aprobado', detalle: 'Compra de tarjeta de regalo' },
            { id: 'TXN-009', monto: 55.00, estado: 'Rechazado', detalle: 'Cobro de comisión fallido' },
            { id: 'TXN-010', monto: 3000.00, estado: 'Aprobado', detalle: 'Nómina quincenal' },
            { id: 'TXN-011', monto: 75.50, estado: 'En Revision', detalle: 'Movimiento de fondos' },
            { id: 'TXN-012', monto: 400.00, estado: 'Aprobado', detalle: 'Pago a proveedor de nube' },
            { id: 'TXN-013', monto: 990.00, estado: 'Aprobado', detalle: 'Mensualidad de seguro' },
            { id: 'TXN-014', monto: 2100.00, estado: 'Rechazado', detalle: 'Cargo internacional declinado' },
            { id: 'TXN-015', monto: 600.00, estado: 'Aprobado', detalle: 'Retiro en cajero automático' },
        ],
        en: [
            { id: 'TXN-001', monto: 2868.60, estado: 'Approved', detalle: 'MXN to BTC conversion' },
            { id: 'TXN-002', monto: 5000.00, estado: 'Pending', detalle: 'Scheduled Cetes funding' },
            { id: 'TXN-003', monto: 1500.00, estado: 'Approved', detalle: 'USDC settlement' },
            { id: 'TXN-004', monto: 320.50,  estado: 'Rejected', detalle: 'Withdrawal to external account' },
            { id: 'TXN-005', monto: 12500.00, estado: 'Under Review', detalle: 'Unusual teller deposit' },
            { id: 'TXN-006', monto: 450.00, estado: 'Approved', detalle: 'Utility bill payment' },
            { id: 'TXN-007', monto: 890.00, estado: 'Pending', detalle: 'Wire transfer' },
            { id: 'TXN-008', monto: 120.00, estado: 'Approved', detalle: 'Gift card purchase' },
            { id: 'TXN-009', monto: 55.00, estado: 'Rejected', detalle: 'Failed fee collection' },
            { id: 'TXN-010', monto: 3000.00, estado: 'Approved', detalle: 'Bi-weekly payroll' },
            { id: 'TXN-011', monto: 75.50, estado: 'Under Review', detalle: 'Fund movement' },
            { id: 'TXN-012', monto: 400.00, estado: 'Approved', detalle: 'Cloud provider payment' },
            { id: 'TXN-013', monto: 990.00, estado: 'Approved', detalle: 'Insurance monthly premium' },
            { id: 'TXN-014', monto: 2100.00, estado: 'Rejected', detalle: 'Declined international charge' },
            { id: 'TXN-015', monto: 600.00, estado: 'Approved', detalle: 'ATM withdrawal' },
        ]
    };

    // Diccionario
    const ui = {
        es: {
            title: "Panel de Generación de Reportes",
            description: "Este módulo empaqueta datos transaccionales en formato JSON y los envía al backend para generar documentos. Puedes usar los datos de prueba de la tabla inferior o descargar la plantilla para cargar tu propia información. Selecciona un formato (CSV o PDF) para que el servidor compile los datos y puedas ver su funcionamiento.",
            serverOffline: "Encender Servidor",
            serverWaking: "Encendiendo el servidor...",
            serverWakingNote: "⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.",
            serverReady: "Servidor Listo",
            csvTitle: "Exportar .CSV (Crudo)",
            csvDescStart: "Procesamiento optimizado vía streams en memoria (",
            csvDescEnd: "). Ideal para ingesta ágil de datos, ya que evita el uso del disco del servidor para garantizar máxima velocidad.",
            csvProcessing: "Procesando datos...",
            pdfTitle: "Generar Reporte .PDF",
            pdfDesc: "Renderizado de plantillas con cálculo dinámico de KPIs en el backend. Optimizado para generar documentos PDF de alta fidelidad y calidad gráfica.",
            pdfProcessing: "Compilando vista y calculando KPIs...",
            tableTitle: "Información Demo a procesar (JSON)",
            customDataBadge: "DATOS PERSONALIZADOS CARGADOS",
            restoreBtn: "Restaurar Datos Originales",
            templateBtn: "Plantilla (.CSV)",
            uploadBtn: "Cargar Datos",
            thId: "ID",
            thDetail: "Detalle Operativo",
            thAmount: "Monto",
            thStatus: "Estado",
            tipTitle: "Tip de prueba:",
            tipDesc: "Descarga la plantilla, modifícala en cualquier editor manteniendo estrictamente las 4 columnas (id, detalle, monto, estado) y vuelve a cargarla para ver cómo el backend procesa tus datos cargados.",
            errFormat: "Formato inválido. Por favor, asegúrate de cargar un archivo con extensión .CSV.",
            errEmpty: "El archivo está vacío o no respeta la estructura de la plantilla.",
            errServerOffline: "El servidor debe estar encendido primero antes de generar reportes.",
            errLimit: "Nota: Por la naturaleza de esta demo, la generación de reportes está limitada a 5 descargas por sesión para proteger la memoria del servidor. En un entorno de producción, este límite sería gestionado en el API Gateway.",
            err429: "Has excedido el límite de seguridad de red (10 peticiones/minuto). Por favor, espera un momento para proteger los recursos del servidor.",
            err500: "Error interno del servidor.",
            errNoResponse: "El servidor entró en suspensión por inactividad o no hay conexión de red. Por favor, haz clic en 'Encender Servidor' para reactivarlo.",
            errUnexpected: "Ocurrió un error inesperado al procesar el documento.",
            errPing: "Error: No se pudo encender el servidor. Contacta al administrador",
            downloadFileName: "Auditoria_Financiera",
            templateContent: "id,detalle,monto,estado\nTXN-USER,\"Ejemplo de carga, con coma\",100.00,Pendiente",
            templateFileName: "plantilla_datos.csv"
        },
        en: {
            title: "Report Generation Dashboard",
            description: "This module packages transactional data into JSON format and sends it to the backend to generate documents. You can use the test data from the table below or download the template to upload your own information. Select a format (CSV or PDF) for the server to compile the data and see its operation.",
            serverOffline: "Turn on Server",
            serverWaking: "Waking up server...",
            serverWakingNote: "⏳ Note: The backend uses a free tier in the cloud. If it is the first load after a period of inactivity, the server can take up to 60 seconds to start. Thank you for your patience.",
            serverReady: "Server Ready",
            csvTitle: "Export .CSV (Raw)",
            csvDescStart: "Optimized processing via in-memory streams (",
            csvDescEnd: "). Ideal for fast data ingestion, as it avoids using the server disk to ensure maximum speed.",
            csvProcessing: "Processing data...",
            pdfTitle: "Generate .PDF Report",
            pdfDesc: "Template rendering with dynamic KPI calculation on the backend. Optimized for generating high-fidelity documents and graphic quality.",
            pdfProcessing: "Compiling view and calculating KPIs...",
            tableTitle: "Demo Information to Process (JSON)",
            customDataBadge: "CUSTOM DATA LOADED",
            restoreBtn: "Restore Original Data",
            templateBtn: "Template (.CSV)",
            uploadBtn: "Upload Data",
            thId: "ID",
            thDetail: "Operational Detail",
            thAmount: "Amount",
            thStatus: "Status",
            tipTitle: "Testing Tip:",
            tipDesc: "Download the template, modify it in any editor keeping strictly the 4 columns (id, detail, amount, status) and upload it again to see how the backend processes your uploaded data.",
            errFormat: "Invalid format. Please make sure to upload a file with a .CSV extension.",
            errEmpty: "The file is empty or does not follow the template structure.",
            errServerOffline: "The server must be turned on first before generating reports.",
            errLimit: "Note: Due to the nature of this demo, report generation is limited to 5 downloads per session to protect server memory. In a production environment, this limit would be managed in the API Gateway.",
            err429: "You have exceeded the network security limit (10 requests/minute). Please wait a moment to protect server resources.",
            err500: "Internal server error.",
            errNoResponse: "The server went into sleep mode due to inactivity or there is no network connection. Please click 'Turn on Server' to reactivate it.",
            errUnexpected: "An unexpected error occurred while processing the document.",
            errPing: "Error: Could not start the server. Contact the administrator",
            downloadFileName: "Financial_Audit",
            templateContent: "id,detail,amount,status\nTXN-USER,\"Upload example, with comma\",100.00,Pending",
            templateFileName: "data_template.csv"
        }
    };

export default function ReporteriaDashboard({ lang = 'es' }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [downloadCount, setDownloadCount] = useState(0);
    const [lastAction, setLastAction] = useState(null);
    const [serverStatus, setServerStatus] = useState('offline');
    
    const [transactionsData, setTransactionsData] = useState(initialDemoData[lang] || initialDemoData['es']);
    const [isCustomData, setIsCustomData] = useState(false);

    const t = (key) => ui[lang][key] || ui['es'][key];

    // Función para despertar el servidor (backend)
    const wakeUpServer = async () => {
        setServerStatus('waking');
        setError(null);
        try {
            await reporteriaApi.get('ping');
            setServerStatus('online');
        } catch (err) {
            setServerStatus('offline');
            setError(t('errPing'));
        }
    };

    const downloadTemplate = () => {
        const templateContent = t('templateContent');
        const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', t('templateFileName')); 
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        event.target.value = null;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError(t('errFormat'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n').map(row => row.trim()).filter(row => row !== '');
            
            const parsedData = rows.slice(1).map(row => {
                // Ignora las comas que estén dentro de comillas dobles
                const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
                if (columns.length !== 4) return null;
                
                return {
                    id: columns[0],
                    detalle: columns[1],
                    monto: parseFloat(columns[2]) || 0,
                    estado: columns[3]
                };
            }).filter(item => item !== null);

            if (parsedData.length === 0) {
                setError(t('errEmpty'));
                return;
            }

            setTransactionsData(parsedData);
            setIsCustomData(true);
            setError(null);
        };
        reader.readAsText(file);
    };

    const handleDownload = async (formato) => {
        if (serverStatus !== 'online') {
            setError(t('errServerOffline'));
            return;
        }

        if (downloadCount >= 5) {
            setError(t('errLimit'));
            return;
        }

        setIsGenerating(true);
        setError(null);
        setLastAction(formato);

        window.dispatchEvent(new CustomEvent('reporteria-action', { detail: { active: true } }));

        try {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            const payload = { 
                formato, 
                timezone: userTimezone,
                data: { items: transactionsData } 
            };

            const response = await reporteriaApi.post('reportes/generar', payload, {
                responseType: 'blob',
                headers: {
                    'Accept-Language': lang
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${t('downloadFileName')}_${new Date().getTime()}.${formato}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setDownloadCount(prev => prev + 1);
        } catch (err) {
            if (err.response?.status === 429) {
                setError(t('err429'));
            } else if (err.response?.status >= 500) {
                setError(t('err500'));
            } else if (!err.response) {
                setServerStatus('offline');
                setError(t('errNoResponse'));
            } else {
                setError(t('errUnexpected'));
            }
        } finally {
            setIsGenerating(false);
            window.dispatchEvent(new CustomEvent('reporteria-action', { detail: { active: false } }));
            setTimeout(() => setLastAction(null), 3000);
        }
    };

    // Mapeador para las etiquetas de estado de la tabla
    const obtenerEtiquetaEstado = (estadoRaw) => {
        const est = (estadoRaw || '').toLowerCase().trim();
        if (lang === 'es') return estadoRaw;
        
        const mapeo = {
            'aprobado': 'Approved',
            'pendiente': 'Pending',
            'rechazado': 'Rejected',
            'en revision': 'Under Review'
        };
        return mapeo[est] || estadoRaw;
    };

    if (serverStatus === 'waking') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 bg-surface rounded-xl border border-white/5 shadow-2xl mt-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                <div className="space-y-2 animate-pulse">
                    <h3 className="text-xl font-semibold text-white">{t('serverWaking')}</h3>
                    <p className="text-xs text-text/50 max-w-md mx-auto leading-relaxed">
                        {t('serverWakingNote')}
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
                        <svg aria-hidden="true" className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {t('title')}
                    </h2>
                    <p className="text-text mt-1 text-sm max-w-xl">
                        {t('description')}
                    </p>
                </div>
                
                {/* Botón dinámico */}
                {serverStatus === 'offline' ? (
                    <button 
                        onClick={wakeUpServer}
                        className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30 transition-colors cursor-pointer group w-full sm:w-auto sm:min-w-[220px]"
                    >
                        <div className="relative flex h-3 w-3 shrink-0">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 group-hover:scale-110 transition-transform"></span>
                        </div>
                        <span className="text-xs font-mono text-red-400 uppercase tracking-wide">{t('serverOffline')}</span>
                    </button>
                ) : (
                    <div className="flex items-center justify-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30 w-full sm:w-auto sm:min-w-[220px]">
                        <div className="relative flex h-3 w-3 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </div>
                        <span className="text-xs font-mono text-green-400 uppercase tracking-wide">{t('serverReady')}</span>
                    </div>
                )}
            </div>

            {/* Tarjetas de Acción Interactivas */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Botón CSV */}
                <button 
                    onClick={() => handleDownload('csv')}
                    disabled={isGenerating || serverStatus !== 'online'}
                    className="relative text-left group bg-surface border border-green-500/20 hover:border-green-500/50 p-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:hover:border-green-500/20 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg aria-hidden="true" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{t('csvTitle')}</h3>
                        <p className="text-xs text-text leading-relaxed">
                            {t('csvDescStart')}
                            <code className="text-green-400 bg-green-500/10 px-1 rounded">php://temp</code>
                            {t('csvDescEnd')}
                        </p>
                        {lastAction === 'csv' && isGenerating && <span className="mt-4 block text-xs font-mono text-green-400 animate-pulse">{t('csvProcessing')}</span>}
                    </div>
                </button>

                {/* Botón PDF */}
                <button 
                    onClick={() => handleDownload('pdf')}
                    disabled={isGenerating || serverStatus !== 'online'}
                    className="relative text-left group bg-surface border border-red-500/20 hover:border-red-500/50 p-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:hover:border-red-500/20 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_15px_rgba(0,128,255,0.05)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="bg-red-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg aria-hidden="true" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{t('pdfTitle')}</h3>
                        <p className="text-xs text-text leading-relaxed">
                            {t('pdfDesc')}
                        </p>
                        {lastAction === 'pdf' && isGenerating && <span className="mt-4 block text-xs font-mono text-red-400 animate-pulse">{t('pdfProcessing')}</span>}
                    </div>
                </button>
            </div>

            {/* Manejador de Errores */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-mono leading-relaxed flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <svg aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                    <button 
                        onClick={() => setError(null)} 
                        className="text-red-400 hover:text-red-300 transition-colors shrink-0 p-1 rounded-md hover:bg-red-500/20 cursor-pointer"
                    >
                        <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Tabla de Previsualización */}
            <div className={`bg-surface border border-white/10 rounded-2xl p-6 shadow-lg transition-all duration-500 ${
                serverStatus !== 'online' ? 'opacity-40 grayscale pointer-events-none' : ''
            }`}>
                <div className="flex flex-col mb-6 border-b border-white/10 pb-4 gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
                        <div className="flex flex-col items-center gap-2 pt-1 w-full sm:w-auto">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider opacity-90 text-center w-full">
                                {t('tableTitle')}
                            </h3>
                            {isCustomData && (
                                <span className="inline-flex items-center justify-center w-full sm:w-fit bg-accent/10 text-accent text-[10px] px-2.5 py-0.5 rounded-full border border-accent/20 font-bold tracking-wide text-center">
                                    {t('customDataBadge')}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            {isCustomData && (
                                <button 
                                    onClick={() => {
                                        setTransactionsData(initialDemoData[lang] || initialDemoData['es']);
                                        setIsCustomData(false);
                                        setError(null);
                                    }}
                                    className="w-full flex justify-center items-center gap-1.5 text-xs text-slate-300 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 px-3 py-2 rounded-md font-mono transition-colors cursor-pointer shadow-sm"
                                >
                                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {t('restoreBtn')}
                                </button>
                            )}
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:justify-end">
                                <button 
                                    onClick={downloadTemplate}
                                    className="w-full sm:w-auto justify-center flex items-center gap-1.5 text-xs text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-md font-mono transition-colors cursor-pointer"
                                >
                                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {t('templateBtn')}
                                </button>
                                
                                <label className="w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer flex items-center gap-2">
                                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    {t('uploadBtn')}
                                    <input 
                                        type="file" 
                                        accept=".csv" 
                                        className="hidden" 
                                        onChange={handleFileUpload} 
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider">{t('thId')}</th>
                                <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider">{t('thDetail')}</th>
                                <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider text-right">{t('thAmount')}</th>
                                <th className="py-3 px-4 text-xs font-mono text-gray-400 uppercase tracking-wider text-center">{t('thStatus')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {transactionsData.map((txn, index) => {
                                const rawEst = txn.estado || '';
                                const estNormalizado = rawEst.toLowerCase().trim();
                                
                                const isValid = ['aprobado', 'pendiente', 'rechazado', 'approved', 'pending', 'rejected'].includes(estNormalizado);
                                const estFinal = isValid ? rawEst : (lang === 'es' ? 'No clasificado' : 'Unclassified');
                                
                                let badgeClass = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                                if (['aprobado', 'approved'].includes(estNormalizado)) badgeClass = 'bg-green-500/10 text-green-400 border border-green-500/20';
                                else if (['pendiente', 'pending'].includes(estNormalizado)) badgeClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
                                else if (['rechazado', 'rejected'].includes(estNormalizado)) badgeClass = 'bg-red-500/10 text-red-400 border border-red-500/20';
                                return (
                                    <tr key={`${txn.id}-${index}`} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-mono text-sm text-text whitespace-nowrap">{txn.id}</td>
                                        <td className="py-3 px-4 text-sm text-white">{txn.detalle}</td>
                                        <td className="py-3 px-4 font-mono text-sm text-text text-right">${txn.monto.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold uppercase ${badgeClass}`}>
                                                {estFinal}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>                
            </div>
            <div className="flex items-start gap-3 px-4 py-2 opacity-80 max-w-3xl">
                <span className="text-lg">💡</span>
                <p className="text-xs text-text/70 leading-relaxed mt-0.5">
                    <strong>{t('tipTitle')}</strong> {t('tipDesc')}
                </p>
            </div>
        </div>
    );
}