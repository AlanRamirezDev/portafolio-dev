---
title: "Motor Transaccional para Inversiones"
description: "Ecosistema Fullstack para la gestión de portafolios financieros en tiempo real, con un simulador interactivo e inyección automática de capital."
tech: ["Java 21", "Spring Boot 3", "PostgreSQL (Neon)", "React", "Astro", "Docker"]
status: "Completado"
---

## El Desafío Arquitectónico

En plataformas de inversión, procesar inyecciones de capital programadas y conversiones de divisas presenta un desafío crítico de concurrencia. La gestión inconsistente de transacciones distribuidas o la falta de bloqueos adecuados durante la volatilidad del tipo de cambio pueden generar desbalances en los portafolios de los usuarios. El objetivo fue diseñar un motor capaz de orquestar estos flujos garantizando consistencia absoluta y exponerlo a través de un Sandbox interactivo de alta fidelidad.

## Solución Técnica Multicapa

Para resolver este desafío de manera integral, se diseñó e integró un ecosistema de dos capas completamente independiente pero sincronizado:

1. **Backend (Motor de Inversión):** Arquitectura limpia basada en Spring Boot 3. El motor aísla la lógica de negocio de las integraciones externas y asegura propiedades ACID mediante el manejo estricto del contexto transaccional. Para la conversión de MXN a USDC, se implementó un bloqueo pesimista a nivel de base de datos (`PESSIMISTIC_WRITE` en JPA/PostgreSQL) para evitar condiciones de carrera durante inyecciones concurrentes.

2. **Frontend (Sandbox Interactivo):** Una SPA reactiva integrada dentro de Astro utilizando componentes de React. Este tablero simula una terminal financiera real, consume la API REST del backend de forma asíncrona, gestiona estados defensivos frente a caídas del servidor y provee un log en tiempo real de los flujos de red (HTTP Requests/Responses).

### Fragmento de Implementación

```java
@Service
@RequiredArgsConstructor
public class CurrencyConversionService {

    private final PortfolioRepository portfolioRepository;
    private final ExchangeRateClient exchangeRateClient;

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public ConversionResult executeConversion(Long userId, BigDecimal amountMxn) {
        // Bloqueo pesimista para evitar colisiones durante inyecciones concurrentes
        Portfolio portfolio = portfolioRepository.findByIdForUpdate(userId)
            .orElseThrow(() -> new PortfolioNotFoundException(userId));

        portfolio.deductBalance(Currency.MXN, amountMxn);
        
        BigDecimal currentRate = exchangeRateClient.getRate(Currency.MXN, Currency.USDC);
        BigDecimal amountUsdc = amountMxn.multiply(currentRate);
        
        portfolio.addBalance(Currency.USDC, amountUsdc);
        portfolioRepository.save(portfolio);

        return new ConversionResult(amountMxn, amountUsdc, currentRate);
    }
}