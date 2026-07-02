# Alan Michel Ramírez Juárez - Portafolio de Desarrollo

![Astro](https://img.shields.io/badge/Astro-0C111A?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Spring_Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

¡Te doy la bienvenida a mi repositorio del portafolio personal!

Este proyecto actúa como un HUB central interactivo diseñado bajo una arquitectura estática y modular para demostrar mis capacidades en ingeniería de software, patrones de diseño y despliegues fullstack integrando múltiples tecnologías.

## 🚀 Características del Proyecto & UX Avanzada

* **Arquitectura Híbrida Estática:** Generación de sitio estático (SSG) con Astro para asegurar tiempos de carga casi instantáneos y un rendimiento óptimo.
* **Islas de Interactividad (React):** Integración de componentes reactivos dinámicos hidratados mediante la directiva `client:load` y `client:only` de Astro para un manejo eficiente del estado del lado del cliente.
* **Estandarización de APIs RESTful:** Contratos de comunicación homologados bajo el versionado estricto (`/api/v1/`) en todo el ecosistema de microservicios, garantizando una evolución segura de las interfaces.
* **Accesibilidad Web (a11y):** Implementación de atributos ARIA y semántica HTML nativa para soportar navegación por teclado y lectores de pantalla, cumpliendo con estándares modernos de usabilidad.
* **Historial Estilo Git Branch:** Línea de tiempo interactiva que emula un flujo de `git log` para exponer de forma reactiva mediante acordeones mis logros técnicos y experiencia profesional.
* **Estilos Globales Unificados:** Diseñado con Tailwind CSS utilizando un tema de variables CSS puras bajo una paleta de colores oscuros y sobrios.

---

## 📈 Casos de Estudio Destacados

### 1. Sandbox Interactivo: Motor Transaccional de Inversiones
Ecosistema Fullstack integrado como un componente modular vivo dentro de la arquitectura del portafolio.
* **Integración Viva en la Nube:** Consumo de peticiones asíncronas reales hacia un backend robusto en Spring Boot 3 (Java 21) desplegado en Render.
* **Persistencia Real:** Sincronizado con una base de datos PostgreSQL Serverless (Neon DB) que refleja los balances y mutaciones de datos en tiempo real bajo estrictas propiedades ACID.
* **UI Reactiva Defensiva:** Desarrollado con React. Intercepta códigos de estado HTTP anómalos (500/404) para autogestionar la inicialización transparente de registros de prueba ante bases de datos vacías.
* **Logger de Red Integrado:** Emula una terminal financiera en la interfaz que despliega visualmente el ciclo de vida completo de las peticiones (HTTP Requests/Responses).

### 2. Micro-Frontend: Gestión de Identidad y Accesos (IAM)
Sistema de control de seguridad integrado al Hub mediante enrutamiento aislado y consumo de una API RESTful protegida.
* **Seguridad y Control (RBAC):** Backend construido en PHP 8.3 y Laravel 13, gestionando emisión de tokens JWT y validando privilegios de acceso de forma estricta desde middlewares personalizados.
* **Cliente HTTP Inteligente:** Configuración centralizada con Axios implementando interceptores de red para la inyección automática y segura de credenciales de autorización.
* **Acciones por Rol:** Registro de acciones, direcciones IP (anonimizadas) y cargas útiles en PostgreSQL, expuesto a perfiles con diferentes roles y acciones correspondientes en el panel de control.
* **Experiencia Integrada:** Componentes de autenticación y paneles administrativos desarrollados en React, operando como una aplicación de una sola página (SPA) fluida.

### 3. Pipeline ETL Logístico: Ingesta Asíncrona de información
Microservicio de alto rendimiento para demostrar el procesamiento masivo de archivos y resiliencia de datos.
* **Procesamiento por Lotes y Concurrencia:** Desarrollado con Spring Batch y Virtual Threads (Java 21) para ingerir miles de registros transaccionales en PostgreSQL sin bloquear el hilo principal, manteniendo la interfaz reactiva (`202 Accepted`).
* **Resiliencia y Tolerancia a Fallos:** Implementación estricta de políticas `SkipPolicy` para encapsular y descartar de forma estructurada datos corruptos, asegurando que los fallos aislados no detengan la carga del lote.
* **Sincronización Inteligente de Red:** Frontend defensivo que consulta activamente la salud del motor backend, implementando tolerancias de latencia dinámicas para mitigar los retrasos de red.
* **Terminal SQL y Simulador WAF/RBAC:** Consola interactiva embebida con acciones rápidas que evalúa la robustez del sistema filtrando inyecciones SQL destructivas y bloqueando peticiones fuera de los roles permitidos.

### 4. Generador Dinámico de Reportes: Generación y Extracción de Datos
Microservicio independiente diseñado para consolidar y exportar información crítica del ecosistema.
* **Arquitectura Stateless:** Backend desarrollado en PHP 8.3 y Laravel, operando y consumiendo recursos de generación bajo demanda.

---

## 🛠️ Comandos de Desarrollo

Todos los comandos se ejecutan desde la raíz del proyecto utilizando `pnpm`:

| Comando | Acción |
| :--- | :--- |
| `pnpm install` | Instala las dependencias del proyecto |
| `pnpm dev` | Inicia el servidor de desarrollo local en `localhost:4321` |
| `pnpm build` | Compila el sitio optimizado para producción en `./dist/` |
| `pnpm preview` | Previsualiza la compilación de producción localmente |

---

## 🧑‍💻 Perfil e Identidad Profesional

Soy Ingeniero en Informática Titulado (Cédula Profesional N° 13385449) egresado del IPN "UPIICSA". Como desarrollador de software, aplico una lógica técnica agnóstica; mi enfoque no se limita a un único stack o framework, sino a mantener una mentalidad de crecimiento continuo para seleccionar y dominar la mejor tecnología que resuelva el problema de negocio. 

Cuento con experiencia sólida diseñando desde aplicaciones web de alto impacto bajo el patrón MVC con PHP (Laravel) y JavaScript, hasta la construcción de soluciones concurrentes, seguras y de alta disponibilidad utilizando Java (Spring Boot 3). Opero bajo una infraestructura ágil, transitando eficientemente el ciclo de vida del desarrollo entre entornos locales en Windows y despliegues en servidores Linux y contenedores Docker.