---
title: "Motor Transaccional para Inversiones"
description: "API RESTful en Java para gestión de portafolios, automatización de inyecciones de capital y simulación de conversión de activos (MXN a USDC)."
tech: ["Java 21", "Spring Boot 3", "PostgreSQL", "Docker", "JUnit 5"]
status: "En desarrollo"
---

## El Desafío
En plataformas de inversión, la gestión inconsistente de transacciones distribuidas puede generar pérdida de capital o desbalances en los portafolios de los usuarios. El objetivo fue diseñar un sistema capaz de procesar rebalanceos e inyecciones periódicas sin colisiones de datos.

## Solución Técnica
Implementación de una arquitectura limpia utilizando el ecosistema Spring. El motor procesa la simulación de compras de instrumentos de renta fija asegurando propiedades ACID en la base de datos para mantener la integridad de cada transacción.

## Impacto
* **Seguridad:** Autenticación stateless mediante JWT.
* **Integridad:** Cero pérdida de datos en transacciones concurrentes gracias al manejo estricto de bloqueos en PostgreSQL.