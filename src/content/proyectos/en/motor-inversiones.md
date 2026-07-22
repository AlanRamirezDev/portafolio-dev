---
title: "Investment Transaction Engine"
description: "Fullstack ecosystem for real-time financial portfolio management, featuring an interactive simulator and automated capital injection."
tech: ["Java 21", "Spring Boot 3", "PostgreSQL", "React", "Astro", "Docker"]
status: "Completed"
githubUrl: "https://github.com/AlanRamirezDev/motor-inversiones-api"
---

## The Architectural Challenge

In distributed investment platforms, processing capital injections and currency exchange operations presents a critical challenge for concurrency and data consistency. The lack of strict transactional isolation under simultaneous HTTP requests can cause Race Conditions, leading to inconsistent balances or loss of financial integrity. The main objective was to design a robust transactional engine aligned with ACID properties, capable of mitigating concurrent mutations at the infrastructure level and exposing a high-fidelity interactive Sandbox without compromising hardware stability.

## Multi-layer Technical Solution

To resolve this challenge comprehensively, a decoupled and shielded ecosystem was structured across both operational layers:

1. **Backend (High Availability and Concurrency Engine):** Enterprise architecture based on Spring Boot 3 and Java 21. The service implements a **Pessimistic Locking** (`PESSIMISTIC_WRITE`) scheme via Spring Data JPA, forcing PostgreSQL to freeze the financial record row during mutations, guaranteeing absolute consistency against massive parallel traffic. The HTTP perimeter is secured using strict declarative validations (Jakarta `@Valid`), processed by a global exception interceptor (`@ControllerAdvice`) that formats clean responses for the client. The infrastructure layer optimizes the connection pool using **HikariCP** and packages the environment in optimized *Multi-stage Alpine Docker* images to drastically reduce startup time.

2. **Frontend (Observability Sandbox and Defensive UX):** A reactive SPA interface natively integrated into Astro via isolated React components. The dashboard implements restrictive submission states (`isSubmitting`) and logical filters using regular expressions in text inputs, blocking non-parametric characters from the user interface. Async control preemptively manages Race Conditions by emitting *Custom Events* in the DOM that freeze Astro's navigation bar during network transactions. Furthermore, the update flow separates the initial rendering from background data updates, preventing the component tree from collapsing.

### Implementation Snippet

```java
    @Transactional
    public Portafolio comprarUsdc(Long usuarioId, BigDecimal montoMxn, BigDecimal tipoCambio) {
        if (montoMxn.compareTo(BigDecimal.ZERO) <= 0 || tipoCambio.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto y el tipo de cambio deben ser mayores a cero.");
        }

        // Database-level lock:
        // Prevents balance mutations between reading and deducting the Swap
        Portafolio portafolio = portafolioRepository.findByUsuarioIdForUpdate(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró un portafolio activo para el usuario: " + usuarioId));

        if (portafolio.getBalanceMxn().compareTo(montoMxn) < 0) {
            throw new IllegalStateException("Saldo insuficiente para realizar la compra.");
        }

        // Transaction execution
        BigDecimal nuevoBalanceMxn = portafolio.getBalanceMxn().subtract(montoMxn);
        portafolio.setBalanceMxn(nuevoBalanceMxn);

        BigDecimal usdcComprados = montoMxn.divide(tipoCambio, 4, RoundingMode.HALF_UP);
        BigDecimal nuevoBalanceUsdc = portafolio.getBalanceUsdc().add(usdcComprados);
        portafolio.setBalanceUsdc(nuevoBalanceUsdc);

        return portafolioRepository.save(portafolio);
    }