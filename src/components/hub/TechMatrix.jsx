import { useState } from 'react';

// Se extraen las constantes estáticas fuera del componente para optimizar la memoria
const categorias = ['Todos', 'Backend', 'Frontend', 'Infra & Herramientas'];

const tecnologias = [
  { nombre: 'Java', categoria: 'Backend' },
  { nombre: 'Spring Boot', categoria: 'Backend' },
  { nombre: 'PHP', categoria: 'Backend' },
  { nombre: 'Laravel', categoria: 'Backend' },
  { nombre: 'Astro', categoria: 'Frontend' },
  { nombre: 'React', categoria: 'Frontend' },
  { nombre: 'JavaScript', categoria: 'Frontend' },
  { nombre: 'HTML5 / CSS3', categoria: 'Frontend' },
  { nombre: 'Tailwind CSS', categoria: 'Frontend' },
  { nombre: 'PostgreSQL', categoria: 'Infra & Herramientas' },
  { nombre: 'Neon DB (Serverless)', categoria: 'Infra & Herramientas' },
  { nombre: 'Docker', categoria: 'Infra & Herramientas' },
  { nombre: 'Render', categoria: 'Infra & Herramientas' },
  { nombre: 'Linux / Windows', categoria: 'Infra & Herramientas' },
  { nombre: 'Git', categoria: 'Infra & Herramientas' },
];

export default function TechMatrix() {
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [isAnimating, setIsAnimating] = useState(false);

  // Función para coordinar el estado del filtro y la animación temporal
  const manejarFiltro = (categoria) => {
    if (categoria === filtroActivo) return;
    
    setFiltroActivo(categoria);
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold mb-8 border-b border-white/10 pb-4 text-white flex items-center gap-2">
        <span className="text-accent font-mono text-lg">01.</span> Stack Tecnológico
      </h2>

      {/* Botones de Filtro */}
      <div className="flex flex-wrap gap-3 mb-8" role="group" aria-label="Filtros de tecnologías">
        {categorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => manejarFiltro(categoria)}
            aria-pressed={filtroActivo === categoria}
            className={`px-4 py-2 rounded-full font-mono text-sm transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer ${
              filtroActivo === categoria
                ? 'bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-surface border-white/10 text-gray-400 hover:border-accent hover:text-accent hover:scale-110'
            }`}
          >
            {categoria}
          </button>
        ))}
      </div>

      {/* Matriz de Tecnologías */}
      <ul className="flex flex-wrap gap-4 list-none p-0 m-0">
        {tecnologias.map((tech) => {
          const isActivo = filtroActivo === 'Todos' || filtroActivo === tech.categoria;
          const isPopping = isActivo && isAnimating;
          
          return (
            <li
              key={tech.nombre}
              aria-hidden={!isActivo}
              className={`px-5 py-3 rounded-xl font-medium transition-all duration-400 border backdrop-blur-md relative ${
                isPopping
                  ? 'bg-accent/10 border-accent text-white scale-110 shadow-[0_0_25px_rgba(99,102,241,0.5)] z-10 cursor-default'
                  : isActivo
                    ? 'bg-accent/10 border-accent/50 text-white scale-100 shadow-[0_0_15px_rgba(99,102,241,0.2)] z-0 cursor-default'
                    : 'bg-white/5 border-white/5 text-gray-500 scale-95 opacity-50 grayscale pointer-events-none z-0'
              }`}
            >
              {tech.nombre}
            </li>
          );
        })}
      </ul>
    </section>
  );
}