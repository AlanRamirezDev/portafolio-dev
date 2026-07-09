import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../lib/transaccional/transaccionalApi';

const ui = {
  es: {
    logCleared: 'Consola limpiada.',
    logFetching: 'Obteniendo datos...',
    logNotReady: 'Portafolio no listo (Status 404). Inicializando...',
    logSync: '200 OK - Datos sincronizados',
    logErrConn: 'ERR_CONNECTION - Revisar consola',
    logPayloadInj: 'PUT /api/v1/portafolios/1/inyeccion - Payload: { monto: ',
    logBadRequest: '400 BAD REQUEST - ',
    logInjSuccess: '200 OK - Capital inyectado',
    logNetError: '500 INTERNAL_ERROR - Falla de red',
    logPayloadBuy: 'PUT /api/v1/portafolios/1/comprar-usdc - Payload: { montoMxn: ',
    logSwapSuccess: '200 OK - Swap ejecutado exitosamente',
    logResetting: 'PUT /api/v1/portafolios/1/reiniciar - Limpieza...',
    logResetSuccess: '200 OK - Base de datos restablecida',
    logResetError: '500 INTERNAL_ERROR - No se pudo reiniciar',
    notifInvalidFund: 'Por favor, ingrese un monto válido para fondear.',
    notifInjSuccess: 'Capital inyectado exitosamente',
    notifError: 'Ocurrió un error',
    notifNetError: 'Error de conexión con el servidor',
    notifInvalidBuy: 'Por favor, ingrese un monto válido para comprar.',
    notifBuySuccess: 'Compra de USDC exitosa',
    notifResetSuccess: 'Balances reiniciados',
    loadingTitle: 'Conectando con el motor transaccional...',
    loadingNote: '⏳ Nota: El backend utiliza una capa gratuita en la nube. Si es la primera carga tras un periodo de inactividad, el servidor puede tardar hasta 60 segundos en iniciar. Agradezco tu paciencia.',
    titleDemo: 'Portafolio Demo',
    btnResetting: '[ Limpiando... ]',
    btnReset: '[ Resetear Datos ]',
    tooltipReset: 'Reiniciar balances a cero',
    lblBalanceMxn: 'Balance (MXN)',
    lblBalanceUsdc: 'Cripto (USDC)',
    titleOps: 'Ejecutar Operaciones',
    lblAddFunds: '1. AGREGAR FONDOS',
    phAddFunds: 'Monto a inyectar',
    btnProcessing: 'Procesando...',
    btnInject: 'Inyectar',
    lblBuyUsdc: '2. CONVERTIR A USDC (T.C. 18.50)',
    phBuyUsdc: 'Cantidad USDC',
    btnBuy: 'Comprar',
    titleLogs: 'Bitácora de Red (Logs)',
    descLogs: '* Módulo de observabilidad integrado para auditar el flujo cliente-servidor.',
    btnClearLogs: '[ Limpiar ]',
    tooltipClear: 'Limpiar consola'
  },
  en: {
    logCleared: 'Console cleared.',
    logFetching: 'Fetching data...',
    logNotReady: 'Portfolio not ready (Status 404). Initializing...',
    logSync: '200 OK - Data synchronized',
    logErrConn: 'ERR_CONNECTION - Check console',
    logPayloadInj: 'PUT /api/v1/portafolios/1/inyeccion - Payload: { monto: ',
    logBadRequest: '400 BAD REQUEST - ',
    logInjSuccess: '200 OK - Capital injected',
    logNetError: '500 INTERNAL_ERROR - Network failure',
    logPayloadBuy: 'PUT /api/v1/portafolios/1/comprar-usdc - Payload: { montoMxn: ',
    logSwapSuccess: '200 OK - Swap executed successfully',
    logResetting: 'PUT /api/v1/portafolios/1/reiniciar - Cleaning...',
    logResetSuccess: '200 OK - Database reset',
    logResetError: '500 INTERNAL_ERROR - Could not reset',
    notifInvalidFund: 'Please enter a valid amount to fund.',
    notifInjSuccess: 'Capital injected successfully',
    notifError: 'An error occurred',
    notifNetError: 'Server connection error',
    notifInvalidBuy: 'Please enter a valid amount to buy.',
    notifBuySuccess: 'USDC purchase successful',
    notifResetSuccess: 'Balances reset',
    loadingTitle: 'Connecting to the transactional engine...',
    loadingNote: '⏳ Note: The backend uses a free cloud tier. If it is the first load after a period of inactivity, the server may take up to 60 seconds to start. Thank you for your patience.',
    titleDemo: 'Demo Portfolio',
    btnResetting: '[ Cleaning... ]',
    btnReset: '[ Reset Data ]',
    tooltipReset: 'Reset balances to zero',
    lblBalanceMxn: 'Balance (MXN)',
    lblBalanceUsdc: 'Crypto (USDC)',
    titleOps: 'Execute Operations',
    lblAddFunds: '1. ADD FUNDS',
    phAddFunds: 'Amount to inject',
    btnProcessing: 'Processing...',
    btnInject: 'Inject',
    lblBuyUsdc: '2. CONVERT TO USDC (EX. RATE 18.50)',
    phBuyUsdc: 'USDC Amount',
    btnBuy: 'Buy',
    titleLogs: 'Network Log (Logs)',
    descLogs: '* Integrated observability module to audit client-server flow.',
    btnClearLogs: '[ Clear ]',
    tooltipClear: 'Clear console'
  }
};

export default function InversionesDashboard({ lang = 'es' }) {
  const [balances, setBalances] = useState({ mxn: 0, usdc: 0 });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [montoInyeccion, setMontoInyeccion] = useState('');
  const [montoCompra, setMontoCompra] = useState('');

  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });
  const [logs, setLogs] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const timerRef = useRef(null);

  const t = (key) => ui[lang][key] || ui['es'][key];
  const locale = lang === 'es' ? 'es-MX' : 'en-US';

  // Función para registrar eventos en la terminal
  const agregarLog = (mensaje, tipo = 'info') => {
    const hora = new Date().toLocaleTimeString(locale, { hour12: false });
    setLogs(prevLogs => {
      const nuevosLogs = [...prevLogs, { id: Date.now() + Math.random(), hora, mensaje, tipo }];
      return nuevosLogs.slice(-8); 
    });
  };

  const limpiarLogs = () => {
    const hora = new Date().toLocaleTimeString(locale, { hour12: false });
    setLogs([{ id: Date.now(), hora, tipo: 'info', mensaje: t('logCleared') }]);
  };

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
      agregarLog(`GET ${API_BASE_URL}/api/v1/portafolios/1 - ${t('logFetching')}`, 'info');
      let response = await fetch(`${API_BASE_URL}/api/v1/portafolios/1`, {
        headers: { 'Accept-Language': lang }
      });

      if (response.status === 404) {
        agregarLog(t('logNotReady'), 'warning');
        await fetch(`${API_BASE_URL}/api/v1/portafolios/inicializar/1`, { 
            method: 'POST',
            headers: { 'Accept-Language': lang }
        });
        response = await fetch(`${API_BASE_URL}/api/v1/portafolios/1`, {
            headers: { 'Accept-Language': lang }
        });
      }

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setBalances({ 
        mxn: data.balanceMxn != null ? data.balanceMxn : 0, 
        usdc: data.balanceUsdc != null ? data.balanceUsdc : 0 
      });      
      agregarLog(t('logSync'), 'success');
    } catch (error) {
      agregarLog(t('logErrConn'), 'error');
    } finally {
      if (isInitialLoad) setLoading(false);
      window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: false } }));
    }
  };

  const inyectarCapital = async () => {
    if (!montoInyeccion || isNaN(montoInyeccion) || Number(montoInyeccion) <= 0) {
      mostrarNotificacion(t('notifInvalidFund'), 'error');
      return;
    }
    setIsSubmitting(true);
    setLastAction('inyectar');
    window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: true } }));
    try {
      agregarLog(`${t('logPayloadInj')}${montoInyeccion} }`, 'info');
      const response = await fetch(`${API_BASE_URL}/api/v1/portafolios/1/inyeccion`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Accept-Language': lang 
          },
          body: JSON.stringify({ monto: Number(montoInyeccion) })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        agregarLog(`${t('logBadRequest')}${data.error}`, 'error');
        mostrarNotificacion(data.error || t('notifError'), 'error');
        return;
      }

      agregarLog(t('logInjSuccess'), 'success');
      setMontoInyeccion('');
      mostrarNotificacion(t('notifInjSuccess'), 'exito');
      await obtenerPortafolio();
    } catch (error) {
      agregarLog(t('logNetError'), 'error');
      mostrarNotificacion(t('notifNetError'), 'error');
    } finally {
      setIsSubmitting(false);
      setLastAction(null);
      window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: false } }));
    }
  };

  // Función para comprar simulando tipo de cambio a 18.50
  const comprarUsdc = async () => {
    if (!montoCompra || isNaN(montoCompra) || Number(montoCompra) <= 0) {
      mostrarNotificacion(t('notifInvalidBuy'), 'error');
      return;
    }
    setIsSubmitting(true);
    setLastAction('comprar');
    window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: true } }));
    try {
      agregarLog(`${t('logPayloadBuy')}${montoCompra} }`, 'info');
      const response = await fetch(`${API_BASE_URL}/api/v1/portafolios/1/comprar-usdc`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Accept-Language': lang
          },
          body: JSON.stringify({ montoMxn: Number(montoCompra), tipoCambio: 18.50 })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        agregarLog(`${t('logBadRequest')}${data.error}`, 'error');
        mostrarNotificacion(data.error || t('notifError'), 'error');
        return;
      }

      agregarLog(t('logSwapSuccess'), 'success');
      setMontoCompra('');
      mostrarNotificacion(t('notifBuySuccess'), 'exito');
      await obtenerPortafolio();
    } catch (error) {
      agregarLog(t('logNetError'), 'error');
      mostrarNotificacion(t('notifNetError'), 'error');
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
      agregarLog(t('logResetting'), 'warning');
      await fetch(`${API_BASE_URL}/api/v1/portafolios/1/reiniciar`, { 
        method: 'PUT',
        headers: { 'Accept-Language': lang } 
      });
      agregarLog(t('logResetSuccess'), 'success');
      mostrarNotificacion(t('notifResetSuccess'), 'exito');
      await obtenerPortafolio();
    } catch (error) {
      agregarLog(t('logResetError'), 'error');
    } finally {
      setIsSubmitting(false);
      setLastAction(null);
      window.dispatchEvent(new CustomEvent('transaccional-action', { detail: { active: false } }));
    }
  };

  useEffect(() => {
    obtenerPortafolio(true);
  }, [lang]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 bg-surface rounded-xl border border-white/5 shadow-2xl mt-8">
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
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('titleDemo')}</h2>
          <button 
            onClick={reiniciarPortafolio}
            disabled={isSubmitting}
            className={`text-sm font-mono text-text border border-white/10 hover:border-red-400 hover:text-red-400 px-3 py-1 rounded-md whitespace-nowrap transition-all ${
              isSubmitting && lastAction === 'reset' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={t('tooltipReset')}
          >
            {isSubmitting && lastAction === 'reset' ? t('btnResetting') : t('btnReset')}
          </button>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background p-6 rounded-xl border border-white/5 text-center shadow-inner">
            <span className="text-sm font-mono text-text uppercase tracking-widest">{t('lblBalanceMxn')}</span>
            <p className="text-4xl font-bold mt-3 text-white truncate" title={`$${balances.mxn.toFixed(2)}`}>
              ${balances.mxn.toFixed(2)}
            </p>
          </div>
          <div className="bg-background p-6 rounded-xl border border-white/5 text-center shadow-inner">
            <span className="text-sm font-mono text-text uppercase tracking-widest">{t('lblBalanceUsdc')}</span>
            <p className="text-4xl font-bold mt-3 text-accent truncate" title={`${balances.usdc.toFixed(2)} USDC`}>
              {balances.usdc.toFixed(2)} USDC
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-6">
        <h3 className="text-lg font-semibold text-white mb-6">{t('titleOps')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel de Inyección */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-mono text-text uppercase tracking-wider">{t('lblAddFunds')}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={t('phAddFunds')}
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
                {isSubmitting && lastAction === 'inyectar' ? t('btnProcessing') : t('btnInject')}
              </button>
            </div>
          </div>

          {/* Panel de Compra USDC */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-mono text-text uppercase tracking-wider">{t('lblBuyUsdc')}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={t('phBuyUsdc')}
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
                {isSubmitting && lastAction === 'comprar' ? t('btnProcessing') : t('btnBuy')}
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
            {t('titleLogs')}
          </h3>
          <span className="text-xs text-gray-500 font-sans italic text-right">
            {t('descLogs')}
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
            title={t('tooltipClear')}
          >
            {t('btnClearLogs')}
          </button>
        </div>
      </div>
      
    </div>
  );
}