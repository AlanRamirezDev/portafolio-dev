import { useState } from 'react';

export default function TechMatrix() {
  const [filtroActivo, setFiltroActivo] = useState('Todos');

  const categorias = ['Todos', 'Backend', 'Frontend', 'Infra & Herramientas'];

  const tecnologias = [
    { nombre: 'Java', categoria: 'Backend' },
    { nombre: 'Spring Boot 3', categoria: 'Backend' },
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

  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold mb-8 border-b border-white/10 pb-4 text-white flex items-center gap-2">
        <span className="text-accent font-mono text-lg">01.</span> Stack Tecnológico
      </h2>

      {/* Botones de Filtro */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => setFiltroActivo(categoria)}
            className={`px-4 py-2 rounded-full font-mono text-sm transition-all duration-300 border ${
              filtroActivo === categoria
                ? 'bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-surface border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
            }`}
          >
            {categoria}
          </button>
        ))}
      </div>

      {/* Matriz de Tecnologías */}
      <div className="flex flex-wrap gap-4">
        {tecnologias.map((tech) => {
          const isActivo = filtroActivo === 'Todos' || filtroActivo === tech.categoria;
          
          return (
            <div
              key={tech.nombre}
              className={`px-5 py-3 rounded-xl font-medium transition-all duration-500 border ${
                isActivo
                  ? 'bg-surface border-white/10 text-white shadow-lg scale-100 opacity-100'
                  : 'bg-surface/30 border-transparent text-gray-600 scale-95 opacity-40 grayscale'
              }`}
            >
              {tech.nombre}
            </div>
          );
        })}
      </div>
    </section>
  );
}