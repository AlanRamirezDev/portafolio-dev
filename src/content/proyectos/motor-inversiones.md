---
title: "Motor Transaccional para Inversiones"
description: "Ecosistema Fullstack para la gestión de portafolios financieros en tiempo real, con un simulador interactivo e inyección automática de capital."
tech: ["Java 21", "Spring Boot 3", "PostgreSQL", "React", "Astro", "Docker"]
githubUrl: "https://github.com/AlanRamirezDev/motor-inversiones-api"
docsUrl: "https://alan-ramirez-dev.mintlify.site/transaccional/introduccion"
status: "Completado"
---

## El Desafío Arquitectónico

En plataformas de inversión distribuidas, procesar inyecciones de capital y operaciones de intercambio de divisas presenta un desafío crítico de concurrencia y consistencia de datos. La falta de aislamiento transaccional estricto ante peticiones HTTP simultáneas puede provocar Race Conditions, derivando en balances inconsistentes o pérdida de integridad financiera. El objetivo principal fue diseñar un motor transaccional robusto alineado con las propiedades ACID, capaz de mitigar mutaciones concurrentes a nivel de infraestructura y exponer un Sandbox interactivo de alta fidelidad sin comprometer la estabilidad del hardware.

## Solución Técnica Multicapa

Para resolver este desafío de manera integral, se estructuró un ecosistema desacoplado y blindado en ambas capas operativas:

1. **Backend (Motor de Alta Disponibilidad y Concurrencia):** Arquitectura empresarial basada en Spring Boot 3 y Java 21. El servicio implementa un esquema de **Bloqueo Pesimista** (`PESSIMISTIC_WRITE`) mediante Spring Data JPA, forzando a PostgreSQL a congelar la fila del registro financiero durante las mutaciones, garantizando consistencia absoluta ante tráfico paralelo masivo. El perímetro HTTP está asegurado mediante validaciones declarativas estrictas (`@Valid` de Jakarta), procesadas por un interceptor global de excepciones (`@ControllerAdvice`) que formatea respuestas limpias para el cliente. La capa de infraestructura optimiza el pool de conexiones mediante **HikariCP** y empaqueta el entorno en imágenes optimizadas con *Multi-stage Alpine Docker* para reducir drásticamente el tiempo de inicio.

2. **Frontend (Sandbox de Observabilidad y UX Defensiva):** Una interfaz SPA reactiva integrada de forma nativa en Astro mediante componentes aislados de React. El dashboard implementa estados de envío restrictivos (`isSubmitting`) y filtros lógicos por expresiones regulares en inputs de texto, bloqueando caracteres no paramétricos desde la interfaz de usuario. El control asíncrono gestiona de forma preventiva las Race Conditions mediante la emisión de *Custom Events* en el DOM que congelan la barra de navegación de Astro durante las transacciones de red. Además, el flujo de actualización separa el renderizado inicial de los actualizaciones de datos en segundo plano, previniendo el colapso del árbol de componentes.

### Fragmento de Implementación

```java
    @Transactional
    public Portafolio comprarUsdc(Long usuarioId, BigDecimal montoMxn, BigDecimal tipoCambio) {
        if (montoMxn.compareTo(BigDecimal.ZERO) <= 0 || tipoCambio.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto y el tipo de cambio deben ser mayores a cero.");
        }

        // Bloqueo a nivel de BD:
        // Evita que el saldo mute entre la lectura y la deducción del Swap
        Portafolio portafolio = portafolioRepository.findByUsuarioIdForUpdate(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró un portafolio activo para el usuario: " + usuarioId));

        if (portafolio.getBalanceMxn().compareTo(montoMxn) < 0) {
            throw new IllegalStateException("Saldo insuficiente para realizar la compra.");
        }

        // Ejecución de transacciones
        BigDecimal nuevoBalanceMxn = portafolio.getBalanceMxn().subtract(montoMxn);
        portafolio.setBalanceMxn(nuevoBalanceMxn);

        BigDecimal usdcComprados = montoMxn.divide(tipoCambio, 4, RoundingMode.HALF_UP);
        BigDecimal nuevoBalanceUsdc = portafolio.getBalanceUsdc().add(usdcComprados);
        portafolio.setBalanceUsdc(nuevoBalanceUsdc);

        return portafolioRepository.save(portafolio);
    }