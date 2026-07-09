import { useState, useRef, useEffect } from 'react';
import logiflowApi from '../../lib/logiflow/logiflowApi';

const ui = {
    es: {
        gamePoints: 'Puntos:',
        gameLegend: '🚚/🚙 Normal:10 | 🚑 Urgente:50',
        gameTitle: 'Intercepta los vehículos en movimiento',
        gameSub: 'Demostración ininterrumpida durante carga masiva de información',
        logDbConn: 'Conexión segura establecida con la Base de Datos.',
        logTable: 'INFO: Tabla principal detectada -> logiflow_telemetry',
        logCols: 'INFO: Columnas -> trip_id, vehicle_vin, driver_id, timestamp_utc, odometer_km, fuel_consumed_l, vehicle_status, route_code',
        logPrompt: 'Escribe una consulta SQL o utiliza los comandos de prueba rápida para evaluar la seguridad del sistema.',
        logCleared: 'Consola limpiada.',
        logEmptyDb: 'La base de datos está vacía.',
        logQSuccess: 'Consulta exitosa. Se renderizó la tabla visual con ',
        logQSuccess2: ' registros.',
        logDbErr: 'Error conectando con la base de datos.',
        logSecAlert: '[SECURITY ALERT] Consulta no permitida o posible inyección SQL destructiva detectada. Petición bloqueada.',
        logRbacAlert: 'Restricción de RBAC: Su perfil solo tiene permisos de lectura (SELECT) en este entorno.',
        logQZero: 'Consulta ejecutada. (0 filas devueltas)',
        logQRows: 'Consulta exitosa. Retornando ',
        logQRows2: ' registros en consola:',
        logQFail: 'Error ejecutando consulta de BD.',
        errInvalidExt: 'Extensión no válida. Por favor, asegúrate de subir un archivo .csv válido',
        errBigFile: 'Archivo demasiado grande (',
        errBigFile2: 'MB). Por restricciones de memoria en esta Demo, el límite es ',
        errMem: 'Error crítico al procesar el archivo en memoria.',
        errEmptyFile: 'El archivo está vacío o es inválido.',
        titleCase: 'El Caso de Uso: Flotilla Logística',
        descCase1: 'Imagina una empresa de transporte a nivel nacional. Al final del día, los encargados descargan una bitácora masiva con las rutas, kilometraje y consumo de combustible de sus vehículos.',
        descCase2: 'Cargar este archivo en un servidor tradicional saturaría la memoria RAM y bloquearía o entorpecería el uso de la plataforma a otros usuarios que interactuen simultáneamente.',
        titleSol: 'La Solución Técnica',
        descSol: <>Este pipeline delega el trabajo pesado a <strong>Hilos Virtuales de Java 21</strong>, procesando lotes en segundo plano para mantener la interfaz de usuario 100% responsiva.</>,
        reqTitle: 'Requisito de Archivo (CSV)',
        reqDesc: <>Para realizar la prueba, puedes subir tu propio archivo asegurándote de que tenga <strong>exactamente estas 8 columnas indicadas abajo</strong>. Si no tienes uno, usa el botón para generarlo al instante (información Demo).</>,
        demoTitle: 'Bitácora DEMO',
        btnUpload: 'Cargar archivo',
        noFile: '¿No tienes archivo? Genera uno de prueba:',
        btnGenNormal: '📄 Generar y descargar Bitácora de Prueba (50k registros)',
        btnGenErr: '⚠️ Generar y descargar Bitácora Corrupta (50k registros con errores)',
        btnDiscard: 'Descartar',
        btnStart: 'Iniciar',
        reg: 'reg.',
        prepTitle: 'Preparando entorno de base de datos...',
        prepSub: 'Limpiando la base para iniciar la demostración.',
        prepWait: 'Por favor espere...',
        prepNote: '⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga o la base contiene demasiados registros previos, el servidor en la nube puede tardar hasta 60 segundos en arrancar y purgar los datos. Agradezco tu paciencia.',
        lockTitle: 'Motor Ocupado',
        lockSub: 'El servidor está terminando de procesar un lote previo en segundo plano.',
        lockWait: 'Monitoreando estado... Esta pantalla desaparecerá automáticamente.',
        procTitle: 'Inyectando datos logísticos...',
        procIns: 'Registros Insertados',
        procWarn: '⚠️ Por favor, mantenga esta pestaña abierta hasta que finalice el proceso.',
        doneTitle: 'Proceso Completado',
        doneDesc1: 'Se integraron ',
        doneDesc2: ' de ',
        doneDesc3: ' viajes en la BD.',
        doneSkip1: 'Se omitieron ',
        doneSkip2: ' registros corruptos por tolerancia a fallos.',
        btnQuerying: 'Consultando...',
        btnFinishing: 'Finalizando inserciones...',
        btnAutoQuery: 'Generar consulta automática (5 registros)',
        tableTitle: 'Resultados de la consulta automática ejecutada:',
        thTrip: 'Viaje',
        thState: 'Estado',
        termTitle: 'Terminal de Consultas (SQL)',
        termSub: '* Consola interactuando directo con el servidor.',
        termCases: 'Casos de prueba:',
        termC1: '📊 CONSULTA SIMPLE',
        termC2: '🛡️ PROBAR RBAC',
        termC3: '💥 PROBAR WAF',
        termC4: '⚠️ ERROR SINTAXIS',
        termPh: 'Escribe un SELECT válido...',
        btnClear: '[ Limpiar Terminal ]',
        btnNew: 'Realizar nueva carga',
        abortTitle: 'Proceso Abortado',
        abortDesc: 'El motor ha detenido la carga. Esto ocurre cuando el archivo tiene un formato inválido, le faltan columnas o superó el límite de registros corruptos tolerados.',
        abortBtn: 'Revisar archivo e intentar de nuevo',
        errTitle: 'Conexión Rechazada',
        errDesc: 'Hubo un error al conectar con la base de datos. Si el problema persiste contacta al Administrador.',
        errBtn: 'Reintentar',
        fileNormal: 'bitacora_flotilla_demo.csv',
        fileError: 'bitacora_corrupta_demo.csv'
    },
    en: {
        gamePoints: 'Score:',
        gameLegend: '🚚/🚙 Normal:10 | 🚑 Urgent:50',
        gameTitle: 'Intercept moving vehicles',
        gameSub: 'Uninterrupted demo during massive data load',
        logDbConn: 'Secure connection to the Database established.',
        logTable: 'INFO: Main table detected -> logiflow_telemetry',
        logCols: 'INFO: Columns -> trip_id, vehicle_vin, driver_id, timestamp_utc, odometer_km, fuel_consumed_l, vehicle_status, route_code',
        logPrompt: 'Write a SQL query or use the quick test commands to evaluate system security.',
        logCleared: 'Console cleared.',
        logEmptyDb: 'The database is empty.',
        logQSuccess: 'Query successful. Visual table rendered with ',
        logQSuccess2: ' records.',
        logDbErr: 'Error connecting to the database.',
        logSecAlert: '[SECURITY ALERT] Unauthorized query or possible destructive SQL injection detected. Request blocked.',
        logRbacAlert: 'RBAC Restriction: Your profile only has read (SELECT) permissions in this environment.',
        logQZero: 'Query executed. (0 rows returned)',
        logQRows: 'Query successful. Returning ',
        logQRows2: ' records in console:',
        logQFail: 'Error executing DB query.',
        errInvalidExt: 'Invalid extension. Please ensure you upload a valid .csv file',
        errBigFile: 'File too large (',
        errBigFile2: 'MB). Due to memory restrictions in this Demo, the limit is ',
        errMem: 'Critical error processing the file in memory.',
        errEmptyFile: 'The file is empty or invalid.',
        titleCase: 'The Use Case: Logistics Fleet',
        descCase1: 'Imagine a nationwide transportation company. At the end of the day, managers download a massive log with routes, mileage, and fuel consumption of their vehicles.',
        descCase2: 'Loading this file on a traditional server would saturate RAM and block or hinder the platform\'s use for other users interacting simultaneously.',
        titleSol: 'The Technical Solution',
        descSol: <>This pipeline delegates the heavy lifting to <strong>Java 21 Virtual Threads</strong>, processing batches in the background to keep the UI 100% responsive.</>,
        reqTitle: 'File Requirement (CSV)',
        reqDesc: <>To run the test, you can upload your own file making sure it has <strong>exactly these 8 columns indicated below</strong>. If you don't have one, use the button to generate it instantly (Demo info).</>,
        demoTitle: 'DEMO Log',
        btnUpload: 'Upload file',
        noFile: "Don't have a file? Generate a test one:",
        btnGenNormal: '📄 Generate and download Test Log (50k records)',
        btnGenErr: '⚠️ Generate and download Corrupted Log (50k records with errors)',
        btnDiscard: 'Discard',
        btnStart: 'Start',
        reg: 'rec.',
        prepTitle: 'Preparing database environment...',
        prepSub: 'Clearing the database to start the demo.',
        prepWait: 'Please wait...',
        prepNote: '⏳ Note: The backend uses a free cloud tier. If it is the first load or the database contains too many previous records, the cloud server may take up to 60 seconds to start and purge data. Thank you for your patience.',
        lockTitle: 'Engine Busy',
        lockSub: 'The server is finishing processing a previous batch in the background.',
        lockWait: 'Monitoring status... This screen will disappear automatically.',
        procTitle: 'Injecting logistics data...',
        procIns: 'Records Inserted',
        procWarn: '⚠️ Please keep this tab open until the process finishes.',
        doneTitle: 'Process Completed',
        doneDesc1: 'Integrated ',
        doneDesc2: ' out of ',
        doneDesc3: ' trips into the DB.',
        doneSkip1: 'Skipped ',
        doneSkip2: ' corrupted records due to fault tolerance.',
        btnQuerying: 'Querying...',
        btnFinishing: 'Finishing insertions...',
        btnAutoQuery: 'Generate automatic query (5 records)',
        tableTitle: 'Results of the executed automatic query:',
        thTrip: 'Trip',
        thState: 'State',
        termTitle: 'Query Terminal (SQL)',
        termSub: '* Console interacting directly with the server.',
        termCases: 'Test cases:',
        termC1: '📊 SIMPLE QUERY',
        termC2: '🛡️ TEST RBAC',
        termC3: '💥 TEST WAF',
        termC4: '⚠️ SYNTAX ERROR',
        termPh: 'Write a valid SELECT...',
        btnClear: '[ Clear Terminal ]',
        btnNew: 'Perform new load',
        abortTitle: 'Process Aborted',
        abortDesc: 'The engine has stopped loading. This occurs when the file has an invalid format, is missing columns, or exceeded the limit of tolerated corrupt records.',
        abortBtn: 'Check file and try again',
        errTitle: 'Connection Refused',
        errDesc: 'There was an error connecting to the database. If the problem persists, contact the Administrator.',
        errBtn: 'Retry',
        fileNormal: 'fleet_log_demo.csv',
        fileError: 'corrupted_log_demo.csv'
    }
};

const SimuladorDespacho = ({ t }) => {
    const [score, setScore] = useState(0);
    const [trucks, setTrucks] = useState([]);

    useEffect(() => {
        const spawnInterval = setInterval(() => {
            const isUrgent = Math.random() > 0.85; 
            const isCar = Math.random() > 0.6;
            
            // Balance de velocidades
            let speed = 2; 
            if (isCar) speed = 3.2; 
            if (isUrgent) speed = 4.2; 

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
                <span className="whitespace-nowrap flex-shrink-0">{t('gamePoints')} <span className="text-accent font-bold text-base">{score}</span></span>
                <span className="text-xs text-text border-l border-white/10 pl-4 hidden sm:block whitespace-nowrap overflow-hidden text-ellipsis">{t('gameLegend')}</span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pt-12 sm:pt-0 opacity-30 pointer-events-none">
                <p className="text-white font-sans text-center px-4 text-xs sm:text-sm">
                    <strong>{t('gameTitle')}</strong> <br/>
                    <span className="text-[10px] sm:text-sm text-text">{t('gameSub')}</span>
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

export default function LogiflowDashboard({ lang = 'es' }) {
    const t = (key) => ui[lang][key] || ui['es'][key];
    const locale = lang === 'es' ? 'es-MX' : 'en-US';

    const getInitialLogs = () => [
        { id: 1, hora: new Date().toLocaleTimeString(locale, { hour12: false }), tipo: 'info', mensaje: t('logDbConn') },
        { id: 2, hora: new Date().toLocaleTimeString(locale, { hour12: false }), tipo: 'success', mensaje: t('logTable') },
        { id: 3, hora: new Date().toLocaleTimeString(locale, { hour12: false }), tipo: 'success', mensaje: t('logCols') },
        { id: 4, hora: new Date().toLocaleTimeString(locale, { hour12: false }), tipo: 'info', mensaje: t('logPrompt') }
    ];

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); 
    const [jobId, setJobId] = useState(null);
    const [processedRecords, setProcessedRecords] = useState(0); 
    const [totalRecords, setTotalRecords] = useState(0); 
    const [fileError, setFileError] = useState(null); 
    
    const [safeToClick, setSafeToClick] = useState(false);

    // Estados Híbridos: Tabla y Terminal
    const [previewData, setPreviewData] = useState(null);
    const [logs, setLogs] = useState(getInitialLogs());
    const [isQuerying, setIsQuerying] = useState(false);
    const [terminalInput, setTerminalInput] = useState('');
    const terminalRef = useRef(null); 
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        if (fileError) {
            const timer = setTimeout(() => setFileError(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [fileError]);

    // Evitar clics accidentales post-carga
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => setSafeToClick(true), 1500);
            return () => clearTimeout(timer);
        } else {
            setSafeToClick(false);
        }
    }, [status]);

    const addLog = (tipo, mensaje) => {
        setLogs(prev => [...prev, { id: Date.now() + Math.random(), hora: new Date().toLocaleTimeString(locale, { hour12: false }), tipo, mensaje }]);
    };

    const limpiarLogs = () => {
        setLogs([{ id: Date.now(), hora: new Date().toLocaleTimeString(locale, { hour12: false }), tipo: 'info', mensaje: t('logCleared') }]);
    };

    const downloadMassiveCSV = (withErrors = false) => {
        let csvContent = "tripId,vehicleVin,driverId,timestampUtc,odometerKm,fuelConsumedL,vehicleStatus,routeCode\n";
        const statuses = lang === 'en' 
            ? ['ACTIVE', 'IN_REPAIR', 'INACTIVE'] 
            : ['ACTIVO', 'EN_REPARACION', 'INACTIVO'];
        const routes = ['RT-CDMX-QRO', 'RT-MTY-LDO', 'RT-GDL-MAN', 'RT-PUE-VER'];
        const EXACT_RECORDS = 50000;
        
        // Errores intencionales
        const errorIndices = withErrors ? [10000, 20000, 30000, 40000, 49000] : [];
        
        for (let i = 1; i <= EXACT_RECORDS; i++) {
            const trip = `TRIP-${10000 + i}`;
            const vin = `1FM5K8GC7HZA${String(i).padStart(5, '0')}`;
            const driver = `DRV-${Math.floor(Math.random() * 900) + 100}`;
            const time = `2026-06-12T14:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
            
            let odo = errorIndices.includes(i) ? "TEXTO_CORRUPTO" : (Math.random() * 100000).toFixed(1);
            let fuel = (Math.random() * 50).toFixed(1);
            
            const statusStr = statuses[Math.floor(Math.random() * statuses.length)];
            const route = routes[Math.floor(Math.random() * routes.length)];
            
            csvContent += `${trip},${vin},${driver},${time},${odo},${fuel},${statusStr},${route}\n`;
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', withErrors ? t('fileError') : t('fileNormal'));
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processSelectedFile = async (selectedFile) => {
        setFileError(null);
        if (!selectedFile) return;
        
        if (!selectedFile.name.endsWith('.csv')) {
            setFileError(t('errInvalidExt'));
            if (fileInputRef.current) fileInputRef.current.value = ''; 
            return;
        }

        const MAX_FILE_SIZE_MB = 5;
        if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setFileError(`${t('errBigFile')}${(selectedFile.size / (1024*1024)).toFixed(1)}${t('errBigFile2')}${MAX_FILE_SIZE_MB}MB.`);
            if (fileInputRef.current) fileInputRef.current.value = ''; 
            return;
        }

        // Lectura por Chunks para evitar desbordamiento de RAM
        let lineCount = 0;
        let offset = 0;
        const CHUNK_SIZE = 1024 * 512; // 512 KB por iteración
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            for (let i = 0; i < text.length; i++) {
                if (text[i] === '\n') lineCount++;
            }
            offset += CHUNK_SIZE;
            if (offset < selectedFile.size) {
                readNextChunk();
            } else {
                setTotalRecords(lineCount > 0 ? lineCount - 1 : 0);
                setFile(selectedFile);
                setStatus('idle');
                setProcessedRecords(0);
            }
        };

        reader.onerror = () => {
            setFileError(t('errMem'));
        };

        const readNextChunk = () => {
            const slice = selectedFile.slice(offset, offset + CHUNK_SIZE);
            reader.readAsText(slice);
        };
        readNextChunk();
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
        let stagnantPings = 0;

        if (status === 'processing') {
            pollInterval = setInterval(async () => {
                try {
                    const response = await logiflowApi.get('/status', {
                        headers: { 'Accept-Language': lang }
                    });
                    const count = response.data.processedRecords;
                    const isRunning = response.data.isRunning;
                    
                    setProcessedRecords(count);

                    if (!isRunning) {
                        if (count > 0) {
                            setStatus('success');
                            clearInterval(pollInterval);
                        } else {
                            stagnantPings++;
                            if (stagnantPings > 5) {
                                setStatus('format_error');
                                clearInterval(pollInterval);
                            }
                        }
                    } else {
                        stagnantPings = 0;
                        if (count >= totalRecords && totalRecords > 0) {
                            setStatus('success');
                            clearInterval(pollInterval);
                        }
                    }
                } catch (error) {
                    setStatus('error'); 
                    clearInterval(pollInterval); 
                }
            }, 1000);
        }
        return () => clearInterval(pollInterval);
    }, [status, totalRecords, lang]);

    useEffect(() => {
        let recoveryInterval;
        if (status === 'locked') {
            recoveryInterval = setInterval(async () => {
                try {
                    const response = await logiflowApi.get('/status', {
                        headers: { 'Accept-Language': lang }
                    });
                    if (!response.data.isRunning) {
                        setStatus('idle');
                        clearInterval(recoveryInterval);
                    }
                } catch (error) {
                    setStatus('error');
                    clearInterval(recoveryInterval);
                }
            }, 1000);
        }
        return () => clearInterval(recoveryInterval);
    }, [status, lang]);

    const handleUpload = async () => {
        if (!file || totalRecords === 0) {
            setFileError(t('errEmptyFile'));
            return;
        }
        
        setStatus('preparing');
        setProcessedRecords(0);
        setPreviewData(null)
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            await logiflowApi.delete('/reset', {
                headers: { 'Accept-Language': lang }
            });
            const response = await logiflowApi.post('/upload', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Accept-Language': lang
                }
            });

            if (response.status === 202) {
                setJobId(response.data.jobId);
                setStatus('processing'); 
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setStatus('locked');
            } else {
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
        setLogs(getInitialLogs()); 
    };

    // FLUJO (Muestra Tabla + Terminal)
    const handleInitialQuery = async () => {
        if (isQuerying) return;
        setIsQuerying(true);
        addLog('info', '>_ SELECT * FROM logiflow_telemetry ORDER BY id DESC LIMIT 5;');
        
        try {
            const response = await logiflowApi.get('/preview', {
                headers: { 'Accept-Language': lang }
            });
            const data = response.data;
            setPreviewData(data);
            
            if (data.length === 0) addLog('warning', t('logEmptyDb'));
            else addLog('success', `${t('logQSuccess')}${data.length}${t('logQSuccess2')}`);
        } catch (error) {
            addLog('error', t('logDbErr'));
        }
        setIsQuerying(false);
    };

    // FLUJO 2: Terminal Interactiva
    const ejecutarConsultaRapida = async (queryText) => {
        await procesarConsulta(queryText);
    };

    const handleTerminalSubmit = async (e) => {
        if (e.key === 'Enter') {
            const query = terminalInput.trim();
            if (!query) return;
            setTerminalInput('');
            await procesarConsulta(query);
        }
    };

    const procesarConsulta = async (queryText) => {
        addLog('info', `>_ ${queryText}`);
        setIsQuerying(true);
        const upperQuery = queryText.toUpperCase();

        if (upperQuery.includes('DROP') || upperQuery.includes('DELETE') || upperQuery.includes('TRUNCATE') || upperQuery.includes('ALTER')) {
            addLog('error', t('logSecAlert'));
            setIsQuerying(false);
            return;
        }

        if (!upperQuery.startsWith('SELECT')) {
            addLog('warning', t('logRbacAlert'));
            setIsQuerying(false);
            return;
        }

        try {
            const response = await logiflowApi.post('/query', { query: queryText }, {
                headers: { 'Accept-Language': lang }
            });
            const data = response.data;
            
            if (data.length === 0) {
                addLog('warning', t('logQZero'));
            } else {
                addLog('success', `${t('logQRows')}${data.length}${t('logQRows2')}`);
                data.forEach(row => {
                    const rowString = Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(' | ');
                    addLog('success', `>> { ${rowString} }`);
                });
            }
        } catch (error) {
            if (error.response?.data?.error) {
                addLog('db_error', `[DB ERROR] ${error.response.data.error}`);
            } else {
                addLog('error', t('logQFail'));
            }
        }
        setIsQuerying(false);
    };

    const progressPercentage = totalRecords > 0 ? Math.min((processedRecords / totalRecords) * 100, 100).toFixed(0) : 0;
    const skippedRecords = totalRecords - processedRecords;

    return (
        <div className="w-full mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-lg h-full">
                    <h3 className="text-xl font-bold text-white font-sans mb-4 border-b border-white/10 pb-2">
                        {t('titleCase')}
                    </h3>
                    <p className="text-text text-sm leading-relaxed mb-4">
                        {t('descCase1')}
                    </p>
                    <p className="text-text text-sm leading-relaxed mb-4">
                        {t('descCase2')}
                    </p>
                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl mt-6">
                        <p className="text-accent text-xs font-mono mb-2 uppercase tracking-wider">{t('titleSol')}</p>
                        <p className="text-white text-sm">
                            {t('descSol')}
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
                                    <span>⚠️</span> {t('reqTitle')}
                                </h5>
                                <p className="text-text text-xs mb-2 leading-relaxed">
                                    {t('reqDesc')}
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
                                        <h4 className="text-white font-bold text-lg">{t('demoTitle')}</h4>
                                        <button onClick={() => fileInputRef.current?.click()} className="bg-accent/10 text-accent font-mono text-sm px-6 py-2 rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors">
                                            {t('btnUpload')}
                                        </button>
                                        <div className="mt-4 pt-4 border-t border-white/5 w-full flex flex-col gap-2">
                                            <p className="text-text text-xs mb-1">{t('noFile')}</p>
                                            <button onClick={() => downloadMassiveCSV(false)} className="text-xs bg-white/5 text-white px-4 py-2 rounded hover:bg-white/10 transition-colors border border-white/10 shadow-sm">
                                                {t('btnGenNormal')}
                                            </button>
                                            <button onClick={() => downloadMassiveCSV(true)} className="text-xs bg-orange-500/10 text-orange-400 px-4 py-2 rounded hover:bg-orange-500/20 transition-colors border border-orange-500/20 shadow-sm">
                                                {t('btnGenErr')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 mt-4">
                                        <span className="text-4xl text-accent">📁</span>
                                        <div className="w-full max-w-[200px] sm:max-w-xs px-2 text-center">
                                            <p className="text-white font-bold text-lg truncate w-full" title={file.name}>{file.name}</p>
                                            <p className="text-text text-sm truncate w-full">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; <span className="text-accent">{totalRecords.toLocaleString()} {t('reg')}</span>
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                                            <button onClick={discardFile} className="bg-transparent text-text font-mono text-sm px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5">{t('btnDiscard')}</button>
                                            <button onClick={handleUpload} className="bg-accent text-white text-sm px-8 py-2 rounded-lg hover:bg-accent/80">{t('btnStart')}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {status === 'preparing' && (
                        <div className="flex flex-col justify-center items-center h-full min-h-[300px] gap-6 flex-1">
                            <div className="w-16 h-16 border-4 border-white/10 border-t-accent rounded-full animate-spin"></div>
                            <div className="text-center px-4">
                                <p className="text-white font-bold text-lg mb-1">{t('prepTitle')}</p>
                                <p className="text-text font-mono text-sm mb-6">{t('prepSub')}</p>
                                <p className="text-accent font-mono text-sm mb-4 animate-pulse">{t('prepWait')}</p>
                                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed animate-pulse">
                                    {t('prepNote')}
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'locked' && (
                        <div className="flex flex-col justify-center items-center h-full min-h-[300px] gap-6 flex-1 text-center animate-in fade-in duration-300">
                            <div className="w-16 h-16 border-4 border-white/10 border-t-yellow-500 rounded-full animate-spin"></div>
                            <div className="text-center px-4">
                                <h4 className="text-white font-bold text-xl mb-2">{t('lockTitle')}</h4>
                                <p className="text-text text-sm mb-4 max-w-md">{t('lockSub')}</p>
                                <p className="text-yellow-500 font-mono text-xs animate-pulse">{t('lockWait')}</p>
                            </div>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="flex flex-col h-full flex-1 min-h-[400px]">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-white font-bold text-lg">{t('procTitle')}</p>
                                    <p className="text-accent font-mono text-sm">HTTP 202 Accepted</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-text text-sm">{t('procIns')}</p>
                                    <p className="text-white font-mono text-xl">{processedRecords.toLocaleString()} / {totalRecords.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-background rounded-full h-3 border border-white/10 overflow-hidden mb-2">
                                <div className="bg-accent h-3 transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                            </div>

                            <p className="text-yellow-500 font-mono text-[10px] text-center animate-pulse -mb-2">
                                {t('procWarn')}
                            </p>
                            
                            <SimuladorDespacho t={t} />
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col h-full flex-1 py-4 animate-in fade-in zoom-in duration-300">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="bg-green-500/10 text-green-400 w-12 h-12 flex items-center justify-center rounded-full mb-2 border border-green-500/20"><span className="text-xl">✓</span></div>
                                <h4 className="text-white font-bold text-xl mb-1">{t('doneTitle')}</h4>
                                <p className="text-text text-sm">{t('doneDesc1')}<strong>{processedRecords.toLocaleString()}</strong>{t('doneDesc2')}{totalRecords.toLocaleString()}{t('doneDesc3')}</p>
                                
                                {skippedRecords > 0 && (
                                    <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/90 text-xs px-4 py-2 rounded-lg flex items-center gap-2">
                                        <span>⚠️</span>
                                        <span>{t('doneSkip1')}<strong>{skippedRecords.toLocaleString()}</strong>{t('doneSkip2')}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* TABLA VISUAL */}
                            {!previewData ? (
                                <div className="flex justify-center mb-6">
                                    <button 
                                        onClick={handleInitialQuery}
                                        disabled={isQuerying || !safeToClick}
                                        className={`text-sm font-mono bg-surface text-accent/80 px-5 py-2 rounded border border-accent/30 transition-all flex items-center gap-2 ${
                                            (!safeToClick || isQuerying) ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:bg-accent/10 hover:scale-105 cursor-pointer'
                                        }`}
                                    >
                                        🔍 {isQuerying ? t('btnQuerying') : !safeToClick ? t('btnFinishing') : t('btnAutoQuery')}
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full bg-background border border-white/5 rounded-xl p-4 mb-6 overflow-hidden">
                                    <p className="text-accent font-mono text-xs mb-3 text-left">{t('tableTitle')}</p>
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs text-text font-mono">
                                            <thead className="bg-surface border-b border-white/5 text-white">
                                                <tr>
                                                    <th className="p-2">{t('thTrip')}</th>
                                                    <th className="p-2">VIN</th>
                                                    <th className="p-2 text-accent">{t('thTrip')}</th>
                                                    <th className="p-2">{t('thState')}</th>
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
                                        {t('termTitle')}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-sans italic text-right">
                                        {t('termSub')}
                                    </span>
                                </div>

                                {/* BOTONES DE PRUEBA RÁPIDA */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-[10px] font-mono text-gray-500 flex items-center mr-1">{t('termCases')}</span>
                                    <button 
                                        onClick={() => ejecutarConsultaRapida("SELECT vehicle_status, COUNT(*) FROM logiflow_telemetry GROUP BY vehicle_status;")} 
                                        disabled={!safeToClick || isQuerying}
                                        className="text-[10px] font-mono bg-surface hover:bg-green-500/20 text-green-400/70 px-2 py-1 rounded border border-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('termC1')}
                                    </button>
                                    <button 
                                        onClick={() => ejecutarConsultaRapida("INSERT INTO logiflow_telemetry (trip_id) VALUES ('TRIP-999');")} 
                                        disabled={!safeToClick || isQuerying}
                                        className="text-[10px] font-mono bg-surface hover:bg-yellow-500/20 text-yellow-500/70 px-2 py-1 rounded border border-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('termC2')}
                                    </button>
                                    <button 
                                        onClick={() => ejecutarConsultaRapida("DROP TABLE logiflow_telemetry;")} 
                                        disabled={!safeToClick || isQuerying}
                                        className="text-[10px] font-mono bg-surface hover:bg-red-500/20 text-red-500/70 px-2 py-1 rounded border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('termC3')}
                                    </button>
                                    <button 
                                        onClick={() => ejecutarConsultaRapida("SELECT * FROM tabla_fantasma;")} 
                                        disabled={!safeToClick || isQuerying}
                                        className="text-[10px] font-mono bg-surface hover:bg-orange-500/20 text-orange-400/70 px-2 py-1 rounded border border-orange-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('termC4')}
                                    </button>
                                </div>
                                
                                <div ref={terminalRef} className="bg-[#0a0a0a] rounded-t-lg border border-white/5 border-b-0 font-mono text-xs overflow-y-auto h-32 flex flex-col shadow-inner">
                                    <div className="p-4 flex flex-col">
                                        {logs.map((log) => (
                                            <div key={log.id} className="py-1 flex gap-3 opacity-90">
                                                <span className="text-gray-500 shrink-0">[{log.hora}]</span>
                                                <span className={`
                                                    ${log.tipo === 'success' ? 'text-green-400' : ''}
                                                    ${log.tipo === 'error' ? 'text-red-400' : ''}
                                                    ${log.tipo === 'warning' ? 'text-yellow-400' : ''}
                                                    ${log.tipo === 'info' ? 'text-accent' : ''}
                                                    ${log.tipo === 'db_error' ? 'text-orange-400' : ''}
                                                `}>
                                                    {log.mensaje}
                                                </span>
                                            </div>
                                        ))}
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
                                        placeholder={t('termPh')}
                                        spellCheck="false"
                                        autoComplete="off"
                                    />
                                </div>
                                
                                <div className="flex justify-between items-center mt-3">
                                    <button onClick={limpiarLogs} className="text-xs font-mono text-text hover:text-red-400 transition-colors px-2 py-1">
                                        {t('btnClear')}
                                    </button>
                                    <button onClick={resetDashboard} className="text-xs font-mono text-text border border-white/10 hover:bg-white/5 transition-colors px-4 py-2 rounded">
                                        {t('btnNew')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'format_error' && (
                        <div className="flex flex-col justify-center items-center h-full flex-1 text-center">
                            <div className="bg-orange-500/10 text-orange-400 w-16 h-16 flex items-center justify-center rounded-full mb-4 border border-orange-500/20"><span className="text-2xl">⚠️</span></div>
                            <h4 className="text-white font-bold text-xl mb-2">{t('abortTitle')}</h4>
                            <p className="text-text text-sm mb-6 max-w-md">{t('abortDesc')}</p>
                            <button onClick={resetDashboard} className="bg-orange-500/20 text-orange-400 font-mono text-sm px-6 py-2 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
                                {t('abortBtn')}
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col justify-center items-center h-full flex-1 text-center">
                            <div className="bg-red-500/10 text-red-400 w-16 h-16 flex items-center justify-center rounded-full mb-4 border border-red-500/20"><span className="text-2xl">✗</span></div>
                            <h4 className="text-white font-bold text-xl mb-2">{t('errTitle')}</h4>
                            <p className="text-text text-sm mb-4">{t('errDesc')}</p>
                            <button onClick={resetDashboard} className="mt-4 bg-red-500/20 text-red-400 font-mono text-sm px-6 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors">{t('errBtn')}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}