import { useState, useEffect, useRef } from 'react';

export default function SimuladorInversiones() {
  // Guardamos el estado de los balances. Inicialmente están en 0.
  const [balances, setBalances] = useState({ mxn: 0, usdc: 0 });
  const [cargando, setCargando] = useState(true);
  
  // Estados para capturar los inputs del usuario
  const [montoInyeccion, setMontoInyeccion] = useState('');
  const [montoCompra, setMontoCompra] = useState('');

  // Estado para manejar alertas visuales
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });
  const timerRef = useRef(null);
  const mostrarNotificacion = (mensaje, tipo) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setNotificacion({ visible: true, mensaje, tipo });

    timerRef.current = setTimeout(() => {
        setNotificacion({ visible: false, mensaje: '', tipo: '' });
      }, 4000);
    };

  // Conexión con el backend
  const obtenerPortafolio = async () => {
    try {
      // Consulta al usuario con ID 1  
      let response = await fetch('http://localhost:8080/api/v1/portafolios/1');

      // Si la respuesta es 404 (no existe), lo inicializamos
      if (response.status === 404) {
        await fetch('http://localhost:8080/api/v1/portafolios/inicializar/1', { method: 'POST' });
        // Volvemos a consultar los datos ahora que ya está creado
        response = await fetch('http://localhost:8080/api/v1/portafolios/1');
      }

      // Extraemos los datos y actualizamos la interfaz
      const data = await response.json();
      setBalances({ mxn: data.balanceMxn, usdc: data.balanceUsdc });
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función para inyectar capital
  const inyectarCapital = async () => {
    if (!montoInyeccion || isNaN(montoInyeccion) || Number(montoInyeccion) <= 0) {
      mostrarNotificacion('Por favor, ingrese un monto válido para fondear.', 'error');
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/api/v1/portafolios/1/inyeccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: Number(montoInyeccion) })
      });
      
      const data = await response.json();
      
      // Si el backend responde con un error 400
      if (!response.ok) {
        mostrarNotificacion(data.error || 'Ocurrió un error', 'error');
        return;
      }

      setMontoInyeccion('');
      mostrarNotificacion('Capital inyectado exitosamente', 'exito');
      obtenerPortafolio();
    } catch (error) {
      mostrarNotificacion('Error de conexión con el servidor', 'error');
    }
  };

  // Función para comprar USDC simulando un tipo de cambio de 18.50
  const comprarUsdc = async () => {
    if (!montoCompra || isNaN(montoCompra) || Number(montoCompra) <= 0) {
      mostrarNotificacion('Por favor, ingrese un monto válido para comprar.', 'error');
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/api/v1/portafolios/1/comprar-usdc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montoMxn: Number(montoCompra), tipoCambio: 18.50 })
      });
      
      const data = await response.json();
      
      // Capturar el error
      if (!response.ok) {
        mostrarNotificacion(data.error || 'Ocurrió un error', 'error');
        return;
      }

      setMontoCompra('');
      mostrarNotificacion('Compra de USDC exitosa', 'exito');
      obtenerPortafolio();
    } catch (error) {
      mostrarNotificacion('Error de conexión con el servidor', 'error');
    }
  };

  // Función para dejar el portafolio en 0 (reinicio)
  const reiniciarPortafolio = async () => {
    try {
      await fetch('http://localhost:8080/api/v1/portafolios/1/reiniciar', { method: 'POST' });
      mostrarNotificacion('Balances reiniciados', 'exito');
      obtenerPortafolio();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    obtenerPortafolio();
  }, []);

  if (cargando) return <div className="text-accent text-center p-4 font-mono animate-pulse">Conectando con el motor de inversiones...</div>;

  return (
    <div className="bg-surface p-8 rounded-2xl border border-white/5 mt-8 shadow-lg relative overflow-hidden">

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
            {/* Icono contextual */}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-4">
        <h2 className="text-2xl font-bold text-white">Portafolio Demo</h2>
        <button 
          onClick={reiniciarPortafolio}
          className="text-sm font-mono text-text hover:text-red-400 transition-colors border border-white/10 hover:border-red-400 px-3 py-1 rounded-md whitespace-nowrap"
          title="Reiniciar balances a cero"
        >
          [ Resetear Datos ]
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#121212] p-6 rounded-xl border border-white/10 text-center shadow-inner">
          <span className="text-sm font-mono text-text uppercase tracking-widest">Balance (MXN)</span>
          <p className="text-4xl font-bold mt-3 text-white truncate" title={`$${balances.mxn.toFixed(2)}`}>
            ${balances.mxn.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#121212] p-6 rounded-xl border border-white/10 text-center shadow-inner">
          <span className="text-sm font-mono text-text uppercase tracking-widest">Cripto (USDC)</span>
          <p className="text-4xl font-bold mt-3 text-accent truncate" title={`${balances.usdc.toFixed(2)} USDC`}>
            {balances.usdc.toFixed(2)} USDC
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-6">Ejecutar Operaciones</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel de Inyección */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-mono text-text">1. AGREGAR FONDOS</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Cantidad en MXN" 
                value={montoInyeccion}
                onChange={(e) => setMontoInyeccion(e.target.value)}
                className="bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:border-accent transition-colors"
              />
              <button 
                onClick={inyectarCapital}
                className="bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Inyectar
              </button>
            </div>
          </div>

          {/* Panel de Compra USDC */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-mono text-text">2. CONVERTIR A USDC (T.C. 18.50)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Monto a usar (MXN)" 
                value={montoCompra}
                onChange={(e) => setMontoCompra(e.target.value)}
                className="bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:border-accent transition-colors"
              />
              <button 
                onClick={comprarUsdc}
                className="bg-accent text-background font-bold px-4 py-2 rounded-lg hover:bg-accent/80 transition-colors whitespace-nowrap"
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}