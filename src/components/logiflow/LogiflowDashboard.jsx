import { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://logiflow-api.onrender.com' // Cambiar después
  : 'http://localhost:8081';

export default function LogiflowDashboard() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [jobId, setJobId] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith('.csv')) {
            setFile(droppedFile);
            setStatus('idle');
        } else {
            alert('Formato inválido. Por favor, sube únicamente un archivo .csv');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('processing');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/etl/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 202) {
                setJobId(response.data.jobId);
                setStatus('success');
            }
        } catch (error) {
            console.error('Error al comunicar con Logiflow:', error);
            setStatus('error');
        }
    };

    const resetDashboard = () => {
        setFile(null);
        setJobId(null);
        setStatus('idle');
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="bg-surface p-8 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
                
                {/* Cabecera */}
                <div className="mb-6 border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
                        <span className="text-accent font-mono">⚡</span> Motor de Ingesta Masiva
                    </h3>
                    <p className="text-text text-sm mt-2">
                        Sube un archivo de telemetría CSV para iniciar el procesamiento asíncrono en segundo plano.
                    </p>
                </div>

                {/* Zona de Drop */}
                {status === 'idle' && (
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                            isDragging 
                                ? 'border-accent bg-accent/5' 
                                : 'border-white/10 hover:border-accent/50'
                        }`}
                    >
                        <input 
                            type="file" 
                            accept=".csv" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={(e) => {
                                setFile(e.target.files[0]);
                                setStatus('idle');
                            }}
                        />
                        
                        {!file ? (
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-4xl">📄</span>
                                <p className="text-text font-mono text-sm">
                                    Arrastra tu archivo CSV aquí o
                                </p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-accent/10 text-accent font-mono text-sm px-4 py-2 rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors"
                                >
                                    Explorar archivos
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-4xl">✅</span>
                                <p className="text-white font-bold">{file.name}</p>
                                <p className="text-text text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                                
                                <button 
                                    onClick={handleUpload}
                                    className="mt-2 bg-accent text-white font-mono text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors"
                                >
                                    Procesar Lote
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Estado de Procesamiento */}
                {status === 'processing' && (
                    <div className="flex flex-col items-center py-10 gap-4">
                        <div className="w-10 h-10 border-4 border-white/10 border-t-accent rounded-full animate-spin"></div>
                        <p className="text-text font-mono text-sm animate-pulse">
                            Transmitiendo al motor ETL...
                        </p>
                    </div>
                )}

                {/* Estado de Éxito */}
                {status === 'success' && (
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 text-center">
                        <span className="text-4xl block mb-3">🚀</span>
                        <h4 className="text-white font-bold mb-2">¡Archivo Aceptado (202)!</h4>
                        <p className="text-text text-sm mb-4">
                            El hilo virtual de Java ha tomado el archivo y el Job Batch está procesando los registros.
                        </p>
                        <div className="bg-background border border-white/5 rounded-lg p-3 inline-block mb-6">
                            <span className="text-xs text-text block mb-1">ID de Rastreo del Lote:</span>
                            <span className="text-accent font-mono text-xs">{jobId}</span>
                        </div>
                        <div>
                            <button 
                                onClick={resetDashboard}
                                className="text-sm text-text hover:text-white underline decoration-white/20 transition-colors"
                            >
                                Subir otro archivo
                            </button>
                        </div>
                    </div>
                )}

                {/* Estado de Error */}
                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                        <span className="text-4xl block mb-3">⚠️</span>
                        <h4 className="text-white font-bold mb-2">Error de conexión</h4>
                        <p className="text-text text-sm mb-4">
                            No se pudo comunicar con el motor en Java. Verifica que el servidor esté encendido en el puerto 8081.
                        </p>
                        <button 
                            onClick={resetDashboard}
                            className="bg-red-500/20 text-red-400 font-mono text-sm px-6 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}