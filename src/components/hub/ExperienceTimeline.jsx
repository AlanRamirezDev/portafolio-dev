import { useState } from 'react';

// El arreglo se declara fuera del componente para optimizar la memoria
const logros = [
  {
    id: 'logro-3',
    hash: 'a3d4e12',
    titulo: 'Full Stack & DevOps Developer',
    entidad: 'Centro Federal de Conciliación y Registro Laboral',
    periodo: 'Feb 2023 - Actual',
    descripcionCorta: 'Modernización de la interfaz de Conciliación Colectiva y desarrollo de lógicas de negocio bajo el patrón MVC.',
    detalles: [
      'Optimización y refactorización de consultas complejas en PostgreSQL y MySQL, logrando una reducción comprobada del 62% en los tiempos de respuesta.',
      'Desarrollo de nuevas funcionalidades integrando APIs RESTful con PHP (Laravel) y JavaScript (ES6+), garantizando escalabilidad.',
      "Documentación de procedimientos y validación del roles para el acceso a distintos módulos del sistema (RBAC).",
      'Implementación de flujos de automatización (CI/CD) para QA y Producción.',
    ],
    tags: ['PHP', 'Laravel', 'Docker', 'CI/CD', 'PostgreSQL']
  },
  {
    id: 'logro-2',
    hash: 'e5f6g78',
    titulo: 'Ingeniero de Infraestructura y Soporte Técnico',
    entidad: 'DTEP RAM S.A. DE C.V.',
    periodo: 'Abr 2021 - Ene 2023',
    descripcionCorta: 'Aseguramiento de la continuidad operativa, administración de servidores y automatización de procesos operativos.',
    detalles: [
      'Automatización de tareas administrativas y operativas mediante la creación de scripts en Bash y PowerShell, mejorando la eficiencia del equipo.',
      'Mantenimiento de la integridad referencial en esquemas relacionales (MySQL) mediante ejecución continua de consultas SQL.',
      'Configuración de túneles VPN y arreglos RAID en la infraestructura tecnológica para garantizar la redundancia de datos.',
      'Diagnóstico e instalación de configuraciones en servidores web.'
    ],
    tags: ['Bash', 'PowerShell', 'MySQL', 'VPN/RAID', 'Linux/Windows']
  },
  {
    id: 'logro-1',
    hash: 'b1c2d34',
    titulo: 'Ingeniero en Informática (Titulado)',
    entidad: 'Instituo Politécnico Nacional "IPN UPIICSA"',
    periodo: 'Concluido',
    descripcionCorta: 'Formación profesional integral con enfoque en lógica de programación, algoritmos eficientes y diseño arquitectónico.',
    detalles: [
      'Cédula Profesional N° 13385449.',
      'Cursos y Certificaciones: Programación con Java (Servicio público), Google AI y Data Analytics (Google/Coursera).',
      'Idiomas: Español (Nativo), Inglés B2 (CEFR) (Intermedio-Avanzado).',
      'Dominio de fundamentos de ingeniería: diseño de modelos entidad-relación, normalización y aplicación de patrones de diseño.'
    ],
    tags: ['Ingeniería de Software', 'Java', 'SQL', 'Arquitectura']
  }
];

export default function ExperienceTimeline() {
  const [nodoExpandido, setNodoExpandido] = useState(null);

  const toggleNodo = (id) => {
    setNodoExpandido(nodoExpandido === id ? null : id);
  };

  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold mb-12 border-b border-white/10 pb-4 text-white flex items-center gap-2">
        <span className="text-accent font-mono text-lg">03.</span> Historial de Logros & Experiencia
      </h2>

      <div className="relative border-l-2 border-white/10 ml-4 md:ml-6 pl-6 md:pl-8 space-y-12">
        {logros.map((logro) => {
          const isOpen = nodoExpandido === logro.id;
          return (
            <div key={logro.id} className="relative group">
              
              <button
                onClick={() => toggleNodo(logro.id)}
                aria-expanded={isOpen}
                aria-label={`Ver más detalles sobre ${logro.titulo} en ${logro.entidad}`}
                className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-300 focus:outline-none cursor-pointer ${
                  isOpen 
                    ? 'bg-accent border-accent scale-125 shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                    : 'bg-background border-white/30 group-hover:border-accent group-hover:scale-110 focus:border-accent'
                }`}
                title="Haga clic para expandir detalles del commit"
              />

              <div 
                onClick={() => toggleNodo(logro.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleNodo(logro.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-label={`Tarjeta de experiencia: ${logro.titulo} en ${logro.entidad}`}
                className={`bg-surface p-6 rounded-2xl border transition-all duration-300 cursor-pointer select-none focus:outline-none focus:border-accent/40 group-hover:scale-105 origin-left group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] ${
                  isOpen ? 'border-accent/40 bg-surface/90 shadow-lg' : 'border-white/5 group-hover:border-accent/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      commit {logro.hash}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                      {logro.titulo}
                    </h3>
                  </div>
                  <span className="font-mono text-sm text-gray-500">{logro.periodo}</span>
                </div>

                <h4 className="text-sm font-medium text-gray-400 mb-4 font-mono">
                  {`// ${logro.entidad}`}
                </h4>

                <p className="text-gray-300 leading-relaxed mb-4">
                  {logro.descripcionCorta}
                </p>

                <div className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-white/10' : 'grid-rows-[0fr] opacity-0'
                }`}>
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-accent mb-3 font-bold">
                      Impacto Técnico e Implementaciones:
                    </h5>
                    <ul className="space-y-2.5 text-gray-400 text-sm list-inside list-disc pl-1">
                      {logro.detalles.map((detalle, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="text-gray-300">{detalle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {logro.tags.map((tag) => (
                    <span key={tag} className="bg-background text-gray-400 font-mono text-xs px-2.5 py-1 rounded border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}