---
title: "Motor Transaccional para Inversiones"
description: "Ecosistema Fullstack para la gestión de portafolios financieros en tiempo real, con un simulador interactivo e inyección automática de capital."
tech: ["Java 21", "Spring Boot 3", "PostgreSQL", "React", "Astro", "Docker"]
status: "Completado"
---

## El Desafío Arquitectónico

En plataformas de inversión, procesar inyecciones de capital programadas y conversiones de divisas presenta un desafío crítico de concurrencia. La gestión inconsistente de transacciones distribuidas o la falta de bloqueos adecuados durante la volatilidad del tipo de cambio pueden generar desbalances en los portafolios de los usuarios. El objetivo fue diseñar un motor capaz de orquestar estos flujos garantizando consistencia absoluta y exponerlo a través de un Sandbox interactivo de alta fidelidad.

## Solución Técnica Multicapa

Para resolver este desafío de manera integral, se diseñó e integró un ecosistema de dos capas completamente independiente pero sincronizado:

1. **Backend (Motor de Inversión):** Arquitectura limpia basada en Spring Boot 3. El motor aísla la lógica de negocio de las integraciones externas y asegura propiedades ACID mediante el manejo estricto del contexto transaccional (`@Transactional`). Para garantizar la integridad financiera en las conversiones de divisas, se utilizó aritmética de precisión arbitraria (`BigDecimal`) con políticas de redondeo estrictas (`RoundingMode.HALF_UP`), evitando la pérdida de centavos típica con decimales.

2. **Frontend (Sandbox Interactivo):** Una SPA reactiva integrada dentro de Astro utilizando componentes de React. Este tablero simula una terminal financiera real, consume la API REST del backend de forma asíncrona, gestiona estados defensivos frente a caídas del servidor y provee un log en tiempo real de los flujos de red (HTTP Requests/Responses).

### Fragmento de Implementación

```java
    @Transactional
    public Portafolio comprarUsdc(Long usuarioId, BigDecimal montoMxn, BigDecimal tipoCambio) {
        if (montoMxn.compareTo(BigDecimal.ZERO) <= 0 || tipoCambio.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto y el tipo de cambio deben ser mayores a cero.");
        }

        Portafolio portafolio = obtenerPortafolio(usuarioId);

        if (portafolio.getBalanceMxn().compareTo(montoMxn) < 0) {
            throw new IllegalStateException("Saldo insuficiente para realizar la compra.");
        }

        BigDecimal nuevoBalanceMxn = portafolio.getBalanceMxn().subtract(montoMxn);
        portafolio.setBalanceMxn(nuevoBalanceMxn);

        BigDecimal usdcComprados = montoMxn.divide(tipoCambio, 4, RoundingMode.HALF_UP);

        BigDecimal nuevoBalanceUsdc = portafolio.getBalanceUsdc().add(usdcComprados);
        portafolio.setBalanceUsdc(nuevoBalanceUsdc);

        return portafolioRepository.save(portafolio);
    }