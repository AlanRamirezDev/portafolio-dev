import { useState } from 'react';

export default function HeroDual() {
  const [isDevMode, setIsDevMode] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto pt-12 pb-2 px-6 flex flex-col gap-6">

      <div className="flex justify-end w-full">
        <div className="flex items-center gap-3 bg-surface border border-white/10 px-4 py-2 rounded-full shadow-md">
          <span className={`text-sm font-mono transition-colors duration-300 ${!isDevMode ? 'text-white font-bold' : 'text-gray-500'}`}>
            Perfil
          </span>
          
          <button
            role="switch"
            aria-checked={isDevMode}
            aria-label="Alternar vista entre Perfil y Terminal"
            onClick={() => setIsDevMode(!isDevMode)}
            className="relative inline-flex h-6 w-12 items-center rounded-full bg-white/10 border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
            title="Alternar vista"
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-accent transition-transform duration-300 ease-in-out ${isDevMode ? 'translate-x-7' : 'translate-x-1'}`} 
            />
          </button>
          
          <span className={`text-sm font-mono transition-colors duration-300 ${isDevMode ? 'text-accent font-bold' : 'text-gray-500'}`}>
            Terminal
          </span>
        </div>
      </div>

      {/* Contenedor Contenido */}
      <div className="w-full transition-all duration-500">
        
        {!isDevMode ? (
          // === MODO PERFIL ===
          <div className="animate-fade-in flex flex-col items-start text-left">
            <div className="inline-block px-3 py-1 bg-surface border border-white/10 rounded-md text-xs font-mono text-gray-400 mb-4 shadow-sm">
              Perfil Profesional
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none mb-8">
              ¡Hola! Soy <span className="text-accent drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">Alan Ramírez</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-300 font-medium mb-4">
              Ingeniero en Informática <span className="text-accent/60">|</span> Full Stack Developer
            </h2>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mb-2">
              Especializado en el diseño y construcción de soluciones de software robustas y escalables. Priorizo el código limpio, las mejores prácticas de ingeniería y una visión completa del ciclo de vida, desde el desarrollo local hasta la producción.
            </p>
          </div>
        ) : (
          // === MODO TERMINAL (Código) ===
          <div className="bg-surface border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl font-mono text-sm md:text-base animate-fade-in w-full overflow-x-auto relative">
            
            {/* Cabecera de la terminal (Botones OSX) */}
            <div className="flex gap-2 mb-6 pb-4 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.4)]"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.4)]"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.4)]"></div>
            </div>

            {/* Contenido de la terminal */}
            <pre className="text-gray-300 space-y-1 m-0 p-0 overflow-visible font-mono">
              <code>
                <div className="mb-4 text-accent font-semibold">
                  {`> system.environment === "production"`}
                </div>

                <div>
                  <span className="text-accent">alan@dev-env</span>:<span className="text-blue-400">~/portafolio</span>$ cat profile.json
                </div>
                <div className="pl-4 pt-2">
                  <span className="text-gray-400">{`{`}</span>
                  <div className="pl-4">
                    <span className="text-blue-300">"name"</span>: <span className="text-yellow-300">"Alan Michel Ramírez Juárez"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-300">"role"</span>: <span className="text-yellow-300">"Ingeniero en Informática | Full Stack Developer"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-300">"focus"</span>: <span className="text-yellow-300">"Clean Code & Scalable Architectures"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-300">"stack"</span>: <span className="text-gray-400">[</span>
                    <div className="pl-4 text-yellow-300">
                      "Java (Spring Boot 3)",<br/>
                      "PHP (Laravel)",<br/>
                      "JavaScript (Astro, React)",<br/>
                      "Tailwind CSS"
                    </div>
                    <span className="text-gray-400">]</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-300">"environments"</span>: <span className="text-gray-400">[</span><span className="text-yellow-300">"Windows"</span>, <span className="text-yellow-300">"Linux"</span><span className="text-gray-400">]</span>
                  </div>
                  <span className="text-gray-400">{`}`}</span>
                </div>
                
                {/* Cursor parpadeante */}
                <div className="pt-4 flex items-center gap-2">
                  <span className="text-accent">alan@dev-env</span>:<span className="text-blue-400">~/portafolio</span>$ 
                  <span className="w-2.5 h-5 bg-gray-400/80 animate-pulse inline-block shadow-[0_0_8px_rgba(156,163,175,0.5)]"></span>
                </div>
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}