# Alan Michel Ramírez Juárez - Portafolio de Desarrollo

¡Bienvenido a mi repositorio!

---

**Motor Transaccional para Inversiones**
Este proyecto está diseñado bajo una arquitectura modular y estática utilizando **Astro**, sirviendo como hub central para mostrar mi experiencia, habilidades y proyectos de ingeniería de software.

## 🚀 Características del Proyecto

- **Arquitectura Híbrida:** Generación de sitio estático (SSG) con Astro para un rendimiento óptimo y tiempos de carga instantáneos.
- **Componentes Reactivos:** Integración modular de **React** para islas de interactividad dinámicas dentro del sitio estático.
- **Estilos Modernos:** Diseñado con Tailwind CSS enfocado en la legibilidad y un aspecto profesional, minimalista y limpio.
- **Despliegue Continuo (CI/CD):** Configurado y desplegado automáticamente en **Vercel** con cada actualización del repositorio.

---

## 📈 Proyectos Destacados e Integraciones

### 1. Sandbox Interactivo: Motor Transaccional de Inversiones

Ecosistema Fullstack integrado directamente como un componente modular dentro del portafolio.

- **Integración Viva en la Nube:** Realiza peticiones asíncronas reales (`fetch`) hacia un backend robusto en **Spring Boot 3** desplegado en Render.
- **Persistencia Real:** Conectado a una base de datos PostgreSQL Serverless (**Neon DB**) que refleja la persistencia de datos en tiempo real entre múltiples sesiones.
- **UI Reactiva Defensiva:** Desarrollado con **React**. Cuenta con una gestión de estados resiliente que intercepta códigos de estado HTTP para autogestionar la inicialización de registros de forma transparente para el usuario.
- **Logger de Red Integrado:** Emula una terminal técnica en la interfaz que despliega visualmente el ciclo de vida de cada petición (HTTP Requests/Responses).

---

## 🛠️ Comandos de Desarrollo

Todos los comandos se ejecutan desde la raíz del proyecto utilizando `pnpm`:

| Comando | Acción |
| :--- | :--- |
| `pnpm install` | Instala las dependencias del proyecto |
| `pnpm dev` | Inicia el servidor de desarrollo local en `localhost:4321` |
| `pnpm build` | Compila el sitio optimizado para producción en `./dist/` |
| `pnpm preview` | Previsualiza la compilación de producción localmente |
