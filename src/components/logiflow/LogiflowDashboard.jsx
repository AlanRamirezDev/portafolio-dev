import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://logiflow-api.onrender.com'  // Cambiar después
  : 'http://localhost:8081';

// Minijuego Demo
const SimuladorDespacho = () => {
    const [score, setScore] = useState(0);
    const [trucks, setTrucks] = useState([]);

    useEffect(() => {
        const spawnInterval = setInterval(() => {
            const isUrgent = Math.random() > 0.85; 
            const isCar = Math.random() > 0.6;
            
            // Balance de velocidades
            let speed = 2; // Camión
            if (isCar) speed = 3.2; // Carro 
            if (isUrgent) speed = 4.2; // Urgente

            let emoji = '🚚';
            if (isUrgent) emoji = '🚑​';
            else if (isCar) emoji = '🚙';

            setTrucks(prev => [...prev, { 
                id: Date.now(), 
                left: Math.random() * 80 + 10, 
                top: -10, 
                speed: speed, 
                wobble: Math.random() * 3, 
                urgent: isUrgent,
                emoji: emoji
            }]);
        }, 700);

        const moveInterval = setInterval(() => {
            setTrucks(prev => prev.map(t => ({ 
                ...t, 
                top: t.top + t.speed,
                currentLeft: t.left + Math.sin(t.top / 10) * t.wobble 
            })).filter(t => t.top < 110));
        }, 50); 

        return () => { clearInterval(spawnInterval); clearInterval(moveInterval); };
    }, []);

    const dispatchTruck = (id, urgent, e) => {
        e.stopPropagation();
        setScore(s => s + (urgent ? 50 : 10)); 
        setTrucks(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="relative w-full flex-1 min-h-[250px] bg-background border border-white/10 rounded-xl overflow-hidden mt-6 cursor-crosshair shadow-inner">
            
            {/* PUNTUACIÓN */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-surface px-4 py-2 rounded-full text-sm font-mono text-white border border-white/5 z-10 shadow-sm flex items-center justify-center gap-4 w-auto max-w-[90%]">
                <span className="whitespace-nowrap flex-shrink-0">Puntos: <span className="text-accent font-bold text-base">{score}</span></span>
                <span className="text-xs text-text border-l border-white/10 pl-4 hidden sm:block whitespace-nowrap overflow-hidden text-ellipsis">🚚/🚙 Normal:10 | 🚑 Urgente:50</span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pt-12 sm:pt-0 opacity-30 pointer-events-none">
                <p className="text-white font-sans text-center px-4 text-xs sm:text-sm">
                    <strong>Intercepta los vehículos en movimiento</strong> <br/>
                    <span className="text-[10px] sm:text-sm text-text">Demostración ininterrumpida durante carga masiva de información</span>
                </p>
            </div>
            {trucks.map(truck => (
                <div
                    key={truck.id}
                    onMouseDown={(e) => dispatchTruck(truck.id, truck.urgent, e)}
                    className="absolute transition-transform drop-shadow-2xl cursor-pointer select-none"
                    style={{ 
                        left: `${truck.currentLeft || truck.left}%`, 
                        top: `${truck.top}%`,
                        fontSize: truck.urgent ? '2.5rem' : '2rem',
                        filter: truck.urgent ? 'drop-shadow(0 0 8px rgba(255,0,0,0.5))' : 'none'
                    }}
                >
                    {truck.emoji}
                </div>
            ))}
        </div>
    );
};

export default function LogiflowDashboard() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); 
    const [jobId, setJobId] = useState(null);
    const [processedRecords, setProcessedRecords] = useState(0); 
    const [totalRecords, setTotalRecords] = useState(0); 
    const [fileError, setFileError] = useState(null); 
    
    // Estados Híbridos: Tabla y Terminal
    const [previewData, setPreviewData] = useState(null);
    const [logs, setLogs] = useState([
        { id: 1, hora: new Date().toLocaleTimeString(), tipo: 'info', mensaje: 'Conexión segura establecida con la base de datos.' },
        { id: 2, hora: new Date().toLocaleTimeString(), tipo: 'info', mensaje: 'Escribe una consulta SQL o utiliza el botón superior para generar una automática.' }
    ]);
    const [isQuerying, setIsQuerying] = useState(false);
    const [terminalInput, setTerminalInput] = useState('');
    const logsEndRef = useRef(null); 
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    useEffect(() => {
        if (fileError) {
            const timer = setTimeout(() => {
                setFileError(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [fileError]);

    const addLog = (tipo, mensaje) => {
        setLogs(prev => [...prev, { id: Date.now() + Math.random(), hora: new Date().toLocaleTimeString(), tipo, mensaje }]);
    };

    const limpiarLogs = () => {
        setLogs([{ id: Date.now(), hora: new Date().toLocaleTimeString(), tipo: 'info', mensaje: 'Consola limpiada.' }]);
    };

    const downloadMassiveCSV = () => {
        let csvContent = "tripId,vehicleVin,driverId,timestampUtc,odometerKm,fuelConsumedL,vehicleStatus,routeCode\n";
        const statuses = ['ACTIVO', 'EN_REPARACION', 'INACTIVO'];
        const routes = ['RT-CDMX-QRO', 'RT-MTY-LDO', 'RT-GDL-MAN', 'RT-PUE-VER'];
        const EXACT_RECORDS = 50000;
        
        for (let i = 1; i <= EXACT_RECORDS; i++) {
            const trip = `TRIP-${10000 + i}`;
            const vin = `1FM5K8GC7HZA${String(i).padStart(5, '0')}`;
            const driver = `DRV-${Math.floor(Math.random() * 900) + 100}`;
            const time = `2026-06-12T14:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
            const odo = (Math.random() * 100000).toFixed(1);
            const fuel = (Math.random() * 50).toFixed(1);
            const statusStr = statuses[Math.floor(Math.random() * statuses.length)];
            const route = routes[Math.floor(Math.random() * routes.length)];
            
            csvContent += `${trip},${vin},${driver},${time},${odo},${fuel},${statusStr},${route}\n`;
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'bitacora_flotilla_demo.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processSelectedFile = async (selectedFile) => {
        setFileError(null);
        if (!selectedFile) return;
        
        if (!selectedFile.name.endsWith('.csv')) {
            setFileError('Extensión no válida. Por favor, asegúrate de subir un archivo .csv válido');
            if (fileInputRef.current) fileInputRef.current.value = ''; 
            return;
        }

        try {
            const text = await selectedFile.text();
            const lines = text.split('\n').filter(line => line.trim().length > 0).length - 1;
            setTotalRecords(lines > 0 ? lines : 0);
            setFile(selectedFile);
            setStatus('idle');
            setProcessedRecords(0);
        } catch (err) {
            console.error("Error leyendo archivo local:", err);
            setFileError('No se pudo leer el archivo. Intenta de nuevo.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processSelectedFile(e.dataTransfer.files[0]);
    };

    const discardFile = () => {
        setFile(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; 
    };

    useEffect(() => {
        let pollInterval;
        let lastCount = -1;
        let stagnantPings = 0;

        if (status === 'processing') {
            pollInterval = setInterval(async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/v1/etl/status`);
                    const count = response.data.processedRecords;
                    setProcessedRecords(count);

                    if (count >= totalRecords && totalRecords > 0) {
                        setStatus('success');
                        clearInterval(pollInterval);
                    } 
                    else if (count === lastCount) {
                        stagnantPings++;
                        if (stagnantPings > 5) {
                            setStatus('format_error');
                            clearInterval(pollInterval);
                        }
                    } 
                    else {
                        lastCount = count;
                        stagnantPings = 0;
                    }
                } catch (error) {
                    console.error("Error crítico de red consultando el estado:", error);
                    setStatus('error');
                    clearInterval(pollInterval);
                }
            }, 1000);
        }
        return () => clearInterval(pollInterval);
    }, [status, totalRecords]);

    const handleUpload = async () => {
        if (!file || totalRecords === 0) {
            setFileError("El archivo está vacío o es inválido.");
            return;
        }
        
        setStatus('preparing');
        setProcessedRecords(0);
        setPreviewData(null)
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.delete(`${API_BASE_URL}/api/v1/etl/reset`);
            
            const response = await axios.post(`${API_BASE_URL}/api/v1/etl/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 202) {
                setJobId(response.data.jobId);
                setStatus('processing'); 
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setFileError(error.response.data.error || "Proceso denegado por políticas de concurrencia.");
                setStatus('idle');
            } else {
                console.error('Error al comunicar con Logiflow:', error);
                setStatus('error');
            }
        }
    };

    const resetDashboard = () => {
        discardFile();
        setJobId(null);
        setStatus('idle');
        setProcessedRecords(0);
        setTotalRecords(0);
        setTerminalInput('');
        setPreviewData(null);
        limpiarLogs();
    };

    // FLUJO (Muestra Tabla + Terminal)
    const handleInitialQuery = async () => {
        if (isQuerying) return;
        setIsQuerying(true);
        addLog('info', '>_ SELECT * FROM logiflow_telemetry ORDER BY id DESC LIMIT 5;');
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/etl/preview`);
            const data = response.data;
            setPreviewData(data);
            
            if (data.length === 0) {
                addLog('warning', 'La base de datos está vacía.');
            } else {
                addLog('success', `Consulta exitosa. Se renderizó la tabla visual con ${data.length} registros.`);
            }
        } catch (error) {
            addLog('error', 'Error conectando con la base de datos.');
        }
        setIsQuerying(false);
    };

    // FLUJO 2: Terminal Interactiva
    const handleTerminalSubmit = async (e) => {
        if (e.key === 'Enter') {
            const query = terminalInput.trim();
            if (!query) return;

            addLog('info', `>_ ${query}`);
            setTerminalInput(''); 
            setIsQuerying(true);

            const upperQuery = query.toUpperCase();

            if (upperQuery.includes('DROP') || upperQuery.includes('DELETE') || upperQuery.includes('TRUNCATE') || upperQuery.includes('UPDATE') || upperQuery.includes('INSERT')) {
                addLog('error', '[SECURITY ALERT] Consulta no permitida o posible inyección SQL destructiva detectada. Petición bloqueada por reglas de seguridad.');
                setIsQuerying(false);
                return;
            }

            if (!upperQuery.startsWith('SELECT')) {
                addLog('warning', 'Restricción de RBAC: Su perfil solo tiene permisos de lectura (SELECT) en este entorno.');
                setIsQuerying(false);
                return;
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/api/v1/etl/query`, { query: query });
                const data = response.data;
                
                if (data.length === 0) {
                    addLog('warning', 'Consulta ejecutada. (0 filas devueltas)');
                } else {
                    addLog('success', `Consulta exitosa. Retornando ${data.length} registros en consola:`);

                    data.forEach(row => {
                        const rowString = Object.entries(row)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' | ');
                        addLog('success', `>> { ${rowString} }`);
                    });
                }
            } catch (error) {
                if (error.response && error.response.data && error.response.data.error) {
                    addLog('error', `[DB ERROR] ${error.response.data.error}`);
                } else {
                    addLog('error', 'Error ejecutando consulta: Conexión rechazada o timeout de BD.');
                }
            }
            setIsQuerying(false);
        }
    };

    const progressPercentage = totalRecords > 0 ? Math.min((processedRecords / totalRecords) * 100, 100).toFixed(0) : 0;

    return (
        <div className="w-full mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-lg h-full">
                    <h3 className="text-xl font-bold text-white font-sans mb-4 border-b border-white/10 pb-2">
                        El Caso de Uso: Flotilla Logística
                    </h3>
                    <p className="text-text text-sm leading-relaxed mb-4">
                        Imagina una empresa de transporte a nivel nacional. Al final del día, los encargados descargan una bitácora masiva con las rutas, kilometraje y consumo de combustible de sus vehículos.
                    </p>
                    <p className="text-text text-sm leading-relaxed mb-4">
                        Cargar este archivo (decenas de miles de filas) en un servidor tradicional saturaría la memoria RAM y bloquearía o entorpecería el uso de la plataforma a otros usuarios que interactuen simultáneamente.
                    </p>
                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl mt-6">
                        <p className="text-accent text-xs font-mono mb-2 uppercase tracking-wider">La Solución Técnica</p>
                        <p className="text-white text-sm">
                            Este motor delega el trabajo pesado a <strong>Hilos Virtuales de Java 21</strong>, fragmentando el archivo en lotes y procesándolo en segundo plano para mantener la interfaz de usuario siempre responsiva.
                        </p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 flex flex-col">
                <div className="bg-surface p-8 rounded-2xl border border-white/5 shadow-lg relative flex-1 flex flex-col">
                    
                    {status === 'idle' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 bg-accent/5 border border-accent/20 rounded-lg p-4">
                                <h5 className="text-accent font-bold text-sm mb-2 flex items-center gap-2">
                                    <span>⚠️</span> Requisito de Archivo (CSV)
                                </h5>
                                <p className="text-text text-xs mb-2 leading-relaxed">
                                    Para realizar la prueba, puedes subir tu propio archivo asegurándote de que tenga <strong>exactamente estas 8 columnas indicadas abajo</strong>. Si no tienes uno, usa el botón para generarlo al instante (información Demo).
                                </p>
                                <code className="block bg-background text-white/70 text-[10px] sm:text-xs p-3 rounded border border-white/5 overflow-x-auto whitespace-nowrap mt-2">
                                    tripId, vehicleVin, driverId, timestampUtc, odometerKm, fuelConsumedL, vehicleStatus, routeCode
                                </code>
                            </div>

                            <div 
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`flex-1 flex flex-col justify-center border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 min-h-[250px] relative ${
                                    isDragging ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/50'
                                } ${fileError ? 'border-red-500/50 bg-red-500/5' : ''}`}
                            >
                                <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={(e) => processSelectedFile(e.target.files[0])} />
                                
                                {fileError && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md flex justify-between items-center text-red-400 text-sm font-mono bg-[#3a1a1a] px-4 py-2 rounded-lg border border-red-500/30 shadow-lg z-20 transition-opacity animate-in fade-in slide-in-from-top-2">
                                        <span>{fileError}</span>
                                        <button onClick={() => setFileError(null)} className="text-red-400 hover:text-white ml-3 font-bold text-lg leading-none">&times;</button>
                                    </div>
                                )}

                                {!file ? (
                                    <div className="flex flex-col items-center gap-3 mt-4">
                                        <span className="text-4xl mb-2">⬇️​</span>
                                        <h4 className="text-white font-bold text-lg">Bitácora DEMO</h4>
                                        <button onClick={() => fileInputRef.current?.click()} className="bg-accent/10 text-accent font-mono text-sm px-6 py-2 rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors">
                                            Cargar archivo
                                        </button>
                                        
                                        <div className="mt-4 pt-4 border-t border-white/5 w-full">
                                            <p className="text-text text-xs mb-3">¿Prefieres ver el máximo potencial directamente?</p>
                                            <button onClick={downloadMassiveCSV} className="text-xs bg-white/5 text-white px-4 py-2 rounded hover:bg-white/10 transition-colors border border-white/10 shadow-sm">
                                                Generar y descargar Bitácora de Prueba (50k registros)
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 mt-4">
                                        <span className="text-4xl text-accent">📁</span>
                                        <div className="w-full max-w-[200px] sm:max-w-xs px-2 text-center">
                                            <p className="text-white font-bold text-lg truncate w-full" title={file.name}>{file.name}</p>
                                            <p className="text-text text-sm truncate w-full">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; <span className="text-accent">{totalRecords.toLocaleString()} reg.</span>
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                                            <button onClick={discardFile} className="bg-transparent text-text font-mono text-sm px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5">Descartar</button>
                                            <button onClick={handleUpload} className="bg-accent text-white font-mono text-sm px-8 py-2 rounded-lg hover:bg-accent/80 shadow-lg shadow-accent/20">Iniciar con el proceso</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {status === 'preparing' && (
                        <div className="flex flex-col justify-center items-center h-full min-h-[300px] gap-6 flex-1">
                            <div className="w-16 h-16 border-4 border-white/10 border-t-accent rounded-full animate-spin"></div>
                            <div className="text-center">
                                <p className="text-white font-bold text-lg mb-1">Preparando entorno de base de datos...</p>
                                <p className="text-accent font-mono text-sm mb-4">Por favor espere...</p>
                                <p className="text-text font-mono text-sm animate-pulse mb-2">Limpiando la base para iniciar la demostración.</p>
                            </div>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="flex flex-col h-full flex-1 min-h-[400px]">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-white font-bold text-lg">Inyectando datos logísticos...</p>
                                    <p className="text-accent font-mono text-sm">HTTP 202 Accepted (Pipeline asíncrono)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-text text-sm">Registros Insertados</p>
                                    <p className="text-white font-mono text-xl">{processedRecords.toLocaleString()} / {totalRecords.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-background rounded-full h-3 border border-white/10 overflow-hidden mb-2">
                                <div className="bg-accent h-3 transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                            </div>

                            <p className="text-yellow-500 font-mono text-[10px] text-center animate-pulse -mb-2">
                                ⚠️ Por favor, mantenga esta pestaña abierta hasta que finalice el proceso.
                            </p>
                            
                            <SimuladorDespacho />
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col h-full flex-1 py-4">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="bg-green-500/10 text-green-400 w-12 h-12 flex items-center justify-center rounded-full mb-2 border border-green-500/20"><span className="text-xl">✓</span></div>
                                <h4 className="text-white font-bold text-xl mb-1">Proceso de Ingesta de Datos Completo</h4>
                                <p className="text-text text-xs">Se integraron <strong>{totalRecords.toLocaleString()} viajes</strong> en la base de datos.</p>
                            </div>
                            
                            {/* TABLA VISUAL */}
                            {!previewData ? (
                                <div className="flex justify-center mb-6">
                                    <button 
                                        onClick={handleInitialQuery}
                                        disabled={isQuerying}
                                        className="bg-surface border border-white/10 text-white font-mono text-sm px-6 py-2 rounded-lg hover:border-accent hover:text-accent transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        🔍 {isQuerying ? 'Consultando...' : 'Generar consulta automática (5 registros)'}
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full bg-background border border-white/5 rounded-xl p-4 mb-6 overflow-hidden">
                                    <p className="text-accent font-mono text-xs mb-3 text-left">Resultados de la consulta automática ejecutada:</p>
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs text-text font-mono">
                                            <thead className="bg-surface border-b border-white/5 text-white">
                                                <tr>
                                                    <th className="p-2">Viaje</th>
                                                    <th className="p-2">VIN</th>
                                                    <th className="p-2">Km</th>
                                                    <th className="p-2">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.map((row, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-surface/50 transition-colors">
                                                        <td className="p-2">{row.tripId}</td>
                                                        <td className="p-2">{row.vehicleVin}</td>
                                                        <td className="p-2 text-accent">{row.odometerKm}</td>
                                                        <td className="p-2">{row.vehicleStatus}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TERMINAL DE CONSULTAS INTERACTIVA */}
                            <div className="border-t border-white/10 pt-4 flex-1 flex flex-col">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3 gap-2">
                                    <h3 className="text-sm font-mono text-text flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                                        Terminal de Consultas (SQL)
                                    </h3>
                                    <span className="text-xs text-gray-500 font-sans italic text-right">
                                        * Consola interactuando directo con el servidor.
                                    </span>
                                </div>
                                
                                <div className="bg-[#0a0a0a] rounded-t-lg border border-white/5 border-b-0 font-mono text-xs overflow-y-auto h-32 flex flex-col shadow-inner">
                                    <div className="p-4 flex flex-col">
                                        {logs.map((log) => (
                                            <div key={log.id} className="py-1 flex gap-3 opacity-90">
                                                <span className="text-gray-500 shrink-0">[{log.hora}]</span>
                                                <span className={`
                                                    ${log.tipo === 'success' ? 'text-green-400' : ''}
                                                    ${log.tipo === 'error' ? 'text-red-400' : ''}
                                                    ${log.tipo === 'warning' ? 'text-yellow-400' : ''}
                                                    ${log.tipo === 'info' ? 'text-accent' : ''}
                                                `}>
                                                    {log.mensaje}
                                                </span>
                                            </div>
                                        ))}
                                        <div ref={logsEndRef} />
                                    </div>
                                </div>
                                
                                <div className="bg-[#111] rounded-b-lg border border-white/5 p-2 flex items-center gap-2 overflow-hidden w-full">
                                    <span className="text-green-400 font-mono text-xs sm:text-sm ml-1 sm:ml-2 shrink-0">
                                        <span className="hidden sm:inline">logiflow@db:~#</span>
                                        <span className="sm:hidden">db:~#</span>
                                    </span>
                                    <input 
                                        type="text" 
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        onKeyDown={handleTerminalSubmit}
                                        disabled={isQuerying}
                                        className="bg-transparent border-none outline-none text-white font-mono text-xs sm:text-sm flex-1 min-w-0 ml-1 sm:ml-2 disabled:opacity-50"
                                        placeholder="Escribe un SELECT válido..."
                                        spellCheck="false"
                                        autoComplete="off"
                                    />
                                </div>
                                
                                <div className="flex justify-between items-center mt-3">
                                    <button onClick={limpiarLogs} className="text-xs font-mono text-text hover:text-red-400 transition-colors px-2 py-1">
                                        [ Limpiar Terminal ]
                                    </button>
                                    <button onClick={resetDashboard} className="text-xs font-mono text-text border border-white/10 hover:bg-white/5 transition-colors px-4 py-2 rounded">
                                        Realizar nueva carga
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'format_error' && (
                        <div className="flex flex-col justify-center items-center h-full flex-1 text-center">
                            <div className="bg-orange-500/10 text-orange-400 w-16 h-16 flex items-center justify-center rounded-full mb-4 border border-orange-500/20"><span className="text-2xl">⚠️</span></div>
                            <h4 className="text-white font-bold text-xl mb-2">Proceso Abortado por Seguridad</h4>
                            <p className="text-text text-sm mb-6 max-w-md">
                                El motor backend ha detenido la carga silenciosamente. Esto ocurre cuando el archivo tiene un formato inválido o le faltan columnas obligatorias.
                            </p>
                            <button onClick={resetDashboard} className="bg-orange-500/20 text-orange-400 font-mono text-sm px-6 py-2 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
                                Revisar archivo e intentar de nuevo
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col justify-center items-center h-full flex-1 text-center">
                            <div className="bg-red-500/10 text-red-400 w-16 h-16 flex items-center justify-center rounded-full mb-4 border border-red-500/20"><span className="text-2xl">✗</span></div>
                            <h4 className="text-white font-bold text-xl mb-2">Conexión Rechazada</h4>
                            <p className="text-text text-sm mb-4">Hubo un error al conectar con la base de datos. Si el problema persiste contacta al Administrador.</p>
                            <button onClick={resetDashboard} className="mt-4 bg-red-500/20 text-red-400 font-mono text-sm px-6 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors">Reintentar</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}