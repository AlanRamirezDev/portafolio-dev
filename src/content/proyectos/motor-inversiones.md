---
title: "Motor Transaccional para Inversiones"
description: "API RESTful en Java para gestión de portafolios, automatización de inyecciones de capital y simulación de conversión de activos (MXN a USDC)."
tech: ["Java 21", "Spring Boot 3", "PostgreSQL", "Docker", "JUnit 5"]
status: "En desarrollo"
---

## El Desafío Arquitectónico

En plataformas de inversión, procesar inyecciones de capital programadas y conversiones de divisas presenta un desafío crítico de concurrencia. La gestión inconsistente de transacciones distribuidas o la falta de bloqueos adecuados durante la volatilidad del tipo de cambio pueden generar desbalances en los portafolios de los usuarios. El objetivo fue diseñar un motor capaz de orquestar estos flujos garantizando consistencia absoluta.

## Solución Técnica

Implementación de una arquitectura hexagonal utilizando el ecosistema Spring. El motor aísla la lógica de negocio de las integraciones externas (APIs de cotización) y asegura propiedades ACID mediante el manejo estricto del contexto transaccional.

Para la conversión de MXN a USDC, se implementó un servicio que bloquea el registro del balance del usuario a nivel de base de datos (`PESSIMISTIC_WRITE` en JPA) para evitar condiciones de carrera durante la ejecución periódica de inyecciones.

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