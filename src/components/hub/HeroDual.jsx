import { useState } from 'react';
import { ui } from '../../i18n/ui';

export default function HeroDual({ lang = 'es' }) {
  const [isDevMode, setIsDevMode] = useState(false);

  // Helper local de traducción
  const t = (key) => ui[lang][key] || ui['es'][key];

  const toggleLanguage = () => {
    if (lang === 'es') {
      window.location.href = '/en/';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      <style>{`
        @keyframes neon-flicker-sharp {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            color: var(--color-accent, #6366f1); 
            text-shadow: 
              0 0 1px var(--color-accent, #6366f1),
              0 0 4px color-mix(in srgb, var(--color-accent, #6366f1) 80%, transparent),
              0 0 8px color-mix(in srgb, var(--color-accent, #6366f1) 60%, transparent);
            opacity: 1;
          }
          20%, 24%, 55% {
            text-shadow: none;
            color: color-mix(in srgb, var(--color-accent, #6366f1) 30%, transparent); 
            opacity: 0.9;
          }
        }
        .neon-text-sharp {
          animation: neon-flicker-sharp 3s infinite alternate;
        }

        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down-fade {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        .animate-mode-enter {
          animation: slide-up-fade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-mode-exit {
          animation: slide-down-fade 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      <div className="w-full max-w-4xl mx-auto pt-12 pb-2 px-6 flex flex-col gap-6 relative z-10">

        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
          
          {/* SWITCH DE IDIOMA */}
          <div className="flex items-center gap-3 bg-surface border border-white/10 px-4 py-2 rounded-full shadow-md">
            <span className={`text-sm font-mono transition-colors duration-250 ${lang === 'es' ? 'text-white font-bold' : 'text-gray-500'}`}>
              ES
            </span>
            
            <button
              role="switch"
              aria-checked={lang === 'en'}
              aria-label="Alternar idioma entre Español e Inglés"
              onClick={toggleLanguage}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-white/10 border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
              title="Change language / Cambiar idioma"
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-accent transition-transform duration-250 ease-in-out ${lang === 'en' ? 'translate-x-7' : 'translate-x-1'}`} 
              />
            </button>
            
            <span className={`text-sm font-mono transition-colors duration-250 ${lang === 'en' ? 'text-white font-bold' : 'text-gray-500'}`}>
              EN
            </span>
          </div>

          {/* SWITCH DE MODO VISTA */}
          <div className="flex items-center gap-3 bg-surface border border-white/10 px-4 py-2 rounded-full shadow-md">
            <span className={`text-sm font-mono transition-colors duration-250 ${!isDevMode ? 'text-white font-bold' : 'text-gray-500'}`}>
              {t('hero.profile')}
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
                className={`inline-block h-4 w-4 transform rounded-full bg-accent transition-transform duration-250 ease-in-out ${isDevMode ? 'translate-x-7' : 'translate-x-1'}`} 
              />
            </button>
            
            <span className={`text-sm font-mono transition-colors duration-250 ${isDevMode ? 'text-accent font-bold' : 'text-gray-500'}`}>
              {t('hero.terminal')}
            </span>
          </div>
        </div>

        {/* Contenedor Contenido */}
        <div className="w-full relative min-h-[400px]">
          
          {!isDevMode ? (
            // === MODO PERFIL ===
            <div key="profile" className="animate-mode-enter flex flex-col items-start text-left w-full">
              <div className="inline-block px-3 py-1 bg-surface border border-white/10 rounded-md text-xs font-mono text-gray-400 mb-4 shadow-sm">
                {t('hero.profileBadge')}
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none mb-8">
                {t('hero.greeting')} <span className="neon-text-sharp">Alan Ramírez</span>
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-300 font-medium mb-4">
                {t('hero.role')}
              </h2>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mb-2">
                {t('hero.description')}
              </p>
            </div>
          ) : (
            // === MODO TERMINAL (Código) ===
            <div key="terminal" className="animate-mode-enter bg-surface border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl font-mono text-sm md:text-base w-full overflow-x-auto relative">
              
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
                      <span className="text-blue-300">"role"</span>: <span className="text-yellow-300">"{t('hero.role')}"</span>,
                    </div>
                    <div className="pl-4">
                      <span className="text-blue-300">"focus"</span>: <span className="text-yellow-300">"Clean Code & Scalable Architectures"</span>,
                    </div>
                    <div className="pl-4">
                      <span className="text-blue-300">"stack"</span>: <span className="text-gray-400">[</span>
                      <div className="pl-4 text-yellow-300">
                        "Java (Spring Boot)",<br/>
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
    </>
  );
}