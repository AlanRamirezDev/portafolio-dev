import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../lib/transaccional/transaccionalApi';

export default function InversionesDashboard() {
  const [balances, setBalances] = useState({ mxn: 0, usdc: 0 });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [montoInyeccion, setMontoInyeccion] = useState('');
  const [montoCompra, setMontoCompra] = useState('');

  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });
  const [logs, setLogs] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const timerRef = useRef(null);

  // Función para registrar eventos en la terminal
  const agregarLog = (mensaje, tipo = 'info') => {
    const hora = new Date().toLocaleTimeString('es-MX', { hour12: false });
    setLogs(prevLogs => {
      const nuevosLogs = [...prevLogs, { id: Date.now() + Math.random(), hora, mensaje, tipo }];
      return nuevosLogs.slice(-8); 
    });
  };

  const limpiarLogs = () => setLogs([]);

  const mostrarNotificacion = (mensaje, tipo) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotificacion({ visible: true, mensaje, tipo });
    timerRef.current = setTimeout(() => {
      setNotificacion({ visible: false, mensaje: '', tipo: '' });
    }, 4000);
  };

  // Función auxiliar para sanitizar inputs de moneda
  const manejarCambioInputMoneda = (valor, setter) => {
    const regexValida = /^\d*\.?\d*$/;
      if (regexValida.test(valor)) {
          setter(valor);
      }
  };


  const obtenerPortafolio = async (isInitialLoad = false) => {

    if (isInitialLoad) setLoading(true);

    window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: true } }));
    try {
      agregarLog(`GET ${API_BASE_URL}/api/v1/portafolios/1 - Obteniendo datos...`, 'info');
      let response = await fetch(`${API_BASE_URL}/api/v1/portafolios/1`);

      if (response.status === 404) {
        agregarLog(`Portafolio no listo (Status 404). Inicializando...`, 'warning');
        await fetch(`${API_BASE_URL}/api/v1/portafolios/inicializar/1`, { method: 'POST' });
        response = await fetch(`${API_BASE_URL}/api/v1/portafolios/1`);
      }

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setBalances({ 
        mxn: data.balanceMxn != null ? data.balanceMxn : 0, 
        usdc: data.balanceUsdc != null ? data.balanceUsdc : 0 
      });      
      agregarLog('200 OK - Datos sincronizados', 'success');
    } catch (error) {
      agregarLog('ERR_CONNECTION - Revisar consola', 'error');
    } finally {
      if (isInitialLoad) setLoading(false);
      window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: false } }));
    }
  };

  const inyectarCapital = async () => {
    if (!montoInyeccion || isNaN(montoInyeccion) || Number(montoInyeccion) <= 0) {
      mostrarNotificacion('Por favor, ingrese un monto válido para fondear.', 'error');
      return;
    }
    setIsSubmitting(true);
    setLastAction('inyectar');
    window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: true } }));
    try {
      agregarLog(`PUT /api/v1/portafolios/1/inyeccion - Payload: { monto: ${montoInyeccion} }`, 'info');
      const response = await fetch(`${API_BASE_URL}/api/v1/portafolios/1/inyeccion`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monto: Number(montoInyeccion) })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        agregarLog(`400 BAD REQUEST - ${data.error}`, 'error');
        mostrarNotificacion(data.error || 'Ocurrió un error', 'error');
        return;
      }

      agregarLog(`200 OK - Capital inyectado`, 'success');
      setMontoInyeccion('');
      mostrarNotificacion('Capital inyectado exitosamente', 'exito');
      await obtenerPortafolio();
    } catch (error) {
      agregarLog('500 INTERNAL_ERROR - Falla de red', 'error');
      mostrarNotificacion('Error de conexión con el servidor', 'error');
    } finally {
      setIsSubmitting(false);
      setLastAction(null);
      window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: false } }));
    }
  };

  // Función para comprar simulando tipo de cambio a 18.50
  const comprarUsdc = async () => {
    if (!montoCompra || isNaN(montoCompra) || Number(montoCompra) <= 0) {
      mostrarNotificacion('Por favor, ingrese un monto válido para comprar.', 'error');
      return;
    }
    setIsSubmitting(true);
    setLastAction('comprar');
    window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: true } }));
    try {
      agregarLog(`PUT /api/v1/portafolios/1/comprar-usdc - Payload: { montoMxn: ${montoCompra} }`, 'info');
      const response = await fetch(`${API_BASE_URL}/api/v1/portafolios/1/comprar-usdc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ montoMxn: Number(montoCompra), tipoCambio: 18.50 })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        agregarLog(`400 BAD REQUEST - ${data.error}`, 'error');
        mostrarNotificacion(data.error || 'Ocurrió un error', 'error');
        return;
      }

      agregarLog(`200 OK - Swap ejecutado exitosamente`, 'success');
      setMontoCompra('');
      mostrarNotificacion('Compra de USDC exitosa', 'exito');
      await obtenerPortafolio();
    } catch (error) {
      agregarLog('500 INTERNAL_ERROR - Falla de red', 'error');
      mostrarNotificacion('Error de conexión con el servidor', 'error');
    } finally {
      setIsSubmitting(false);
      setLastAction(null);
      window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: false } }));
    }
  };

  const reiniciarPortafolio = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLastAction('reset');
    window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: true } }));
    try {
      agregarLog('PUT /api/v1/portafolios/1/reiniciar - Limpieza...', 'warning');
      await fetch(`${API_BASE_URL}/api/v1/portafolios/1/reiniciar`, { method: 'PUT' });
      agregarLog('200 OK - Base de datos restablecida', 'success');
      mostrarNotificacion('Balances reiniciados', 'exito');
      await obtenerPortafolio();
    } catch (error) {
      agregarLog('500 INTERNAL_ERROR - No se pudo reiniciar', 'error');
    } finally {
      setIsSubmitting(false);
      setLastAction(null);
      window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: false } }));
    }
  };

  useEffect(() => {
    obtenerPortafolio(true);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 bg-surface rounded-xl border border-white/5 shadow-2xl mt-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <div className="space-y-2 animate-pulse">
          <h3 className="text-xl font-semibold text-white">Conectando con el motor transaccional...</h3>
          <p className="text-xs text-text/50 max-w-md mx-auto leading-relaxed">
            ⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface p-8 rounded-2xl border border-white/5 mt-8 shadow-lg relative overflow-hidden flex flex-col gap-8">

      {/*Toast de Notificaciones */}
      {notificacion.visible && (
        <div className={`
            absolute top-4 left-1/2 -translate-x-1/2 
            flex items-center gap-2.5 px-5 py-2.5 
            rounded-full font-mono text-sm font-medium tracking-wide
            z-50 backdrop-blur-xl border shadow-lg
            transition-all duration-300 ease-out
            ${notificacion.tipo === 'error' 
            ? 'bg-red-500/15 border-red-400/40 text-red-50 shadow-red-500/20 ring-1 ring-red-400/20' 
            : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-50 shadow-emerald-500/20 ring-1 ring-emerald-400/20'
            }
        `}>
            {notificacion.tipo === 'error' ? (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            ) : (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            )}
            <span>{notificacion.mensaje}</span>
        </div>
      )}

      {/* Botón para resetear valores */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Portafolio Demo</h2>
          <button 
            onClick={reiniciarPortafolio}
            disabled={isSubmitting}
            className={`text-sm font-mono text-text border border-white/10 hover:border-red-400 hover:text-red-400 px-3 py-1 rounded-md whitespace-nowrap transition-all ${
              isSubmitting && lastAction === 'reset' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Reiniciar balances a cero"
          >
            {isSubmitting && lastAction === 'reset' ? '[ Limpiando... ]' : '[ Resetear Datos ]'}
          </button>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background p-6 rounded-xl border border-white/5 text-center shadow-inner">
            <span className="text-sm font-mono text-text uppercase tracking-widest">Balance (MXN)</span>
            <p className="text-4xl font-bold mt-3 text-white truncate" title={`$${balances.mxn.toFixed(2)}`}>
              ${balances.mxn.toFixed(2)}
            </p>
          </div>
          <div className="bg-background p-6 rounded-xl border border-white/5 text-center shadow-inner">
            <span className="text-sm font-mono text-text uppercase tracking-widest">Cripto (USDC)</span>
            <p className="text-4xl font-bold mt-3 text-accent truncate" title={`${balances.usdc.toFixed(2)} USDC`}>
              {balances.usdc.toFixed(2)} USDC
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-6">
        <h3 className="text-lg font-semibold text-white mb-6">Ejecutar Operaciones</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel de Inyección */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-mono text-text uppercase tracking-wider">1. AGREGAR FONDOS</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="MXN to convert" 
                value={montoInyeccion}
                disabled={isSubmitting}
                onChange={(e) => manejarCambioInputMoneda(e.target.value, setMontoInyeccion)}
                className="bg-background border border-white/10 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:border-accent transition-all disabled:opacity-50"
              />
              <button 
                onClick={inyectarCapital}
                disabled={isSubmitting}
                className="bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-gray-200 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && lastAction === 'inyectar' ? 'Procesando...' : 'Inyectar'}
              </button>
            </div>
          </div>

          {/* Panel de Compra USDC */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-mono text-text uppercase tracking-wider">2. CONVERTIR A USDC (T.C. 18.50)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Cantidad USDC" 
                value={montoCompra}
                disabled={isSubmitting}
                onChange={(e) => manejarCambioInputMoneda(e.target.value, setMontoCompra)}
                className="bg-background border border-white/10 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:border-accent transition-all disabled:opacity-50"
              />
              <button 
                onClick={comprarUsdc}
                disabled={isSubmitting}
                className="bg-accent text-background font-bold px-4 py-2 rounded-lg hover:bg-accent/80 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && lastAction === 'comprar' ? 'Procesando...' : 'Comprar'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Terminal de Logs */}
      <div className="border-t border-white/5 pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3 gap-2">
          <h3 className="text-sm font-mono text-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Bitácora de Red (Logs)
          </h3>
          <span className="text-xs text-gray-500 font-sans italic text-right">
            * Módulo de observabilidad integrado para auditar el flujo cliente-servidor.
          </span>
        </div>
        
        <div className="bg-black/50 p-4 rounded-lg border border-white/5 font-mono text-xs overflow-y-auto h-48 flex flex-col shadow-inner">
          {logs.map((log) => (
            <div key={log.id} className="py-1 flex gap-3 border-b border-white/5 last:border-0 opacity-90 hover:opacity-100 transition-opacity whitespace-pre-wrap">
              <span className="text-gray-500 shrink-0">[{log.hora}]</span>
              <span className={`
                ${log.tipo === 'success' ? 'text-emerald-400' : ''}
                ${log.tipo === 'error' ? 'text-red-400' : ''}
                ${log.tipo === 'warning' ? 'text-yellow-400' : ''}
                ${log.tipo === 'info' ? 'text-blue-300' : ''}
              `}>
                {log.mensaje}
              </span>
            </div>
          ))}
        </div>
      {/* Botón para limpiar logs */}
      <div className="flex justify-end mt-2">
          <button 
            onClick={limpiarLogs}
            className="text-xs font-mono text-text hover:text-red-400 transition-colors border border-white/10 hover:border-red-400 px-2 py-1 rounded"
            title="Limpiar consola"
          >
            [ Limpiar ]
          </button>
        </div>
      </div>
      
    </div>
  );
}