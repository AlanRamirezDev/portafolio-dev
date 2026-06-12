---
title: "Motor ETL Asíncrono"
description: "Microservicio de alto rendimiento para la ingesta masiva de telemetría logística. Arquitectura tolerante a fallos con procesamiento por lotes (chunks) y concurrencia optimizada."
tech: ["Java 21", "Spring Boot 3", "Spring Batch", "PostgreSQL", "React", "Astro", "Tailwind CSS"]
status: "En desarrollo"
---

## El Desafío Arquitectónico

El procesamiento de archivos masivos en aplicaciones web tradicionales suele provocar bloqueos en el hilo principal del servidor (timeouts) y saturación de memoria RAM, degradando la experiencia del usuario. En sistemas logísticos, donde miles de vehículos transmiten coordenadas y telemetría constantemente, es vital procesar esta información sin interrumpir la operatividad del sistema central ni sobrecargar la base de datos con inserciones individuales.

## Solución Técnica y Rendimiento

Para resolver este cuello de botella, se construyó un microservicio especializado en la extracción, transformación y carga (ETL) de datos:

1. **Procesamiento Asíncrono (Virtual Threads):** Desarrollado en Java 21 y Spring Boot 3, el motor delega la lectura de archivos a hilos virtuales, liberando el controlador REST inmediatamente (`202 Accepted`) para mantener la interfaz de usuario reactiva.
2. **Gestión de Memoria (Spring Batch):** Se implementó una arquitectura de lectura en disco mediante Java NIO y procesamiento en lotes (*chunks*). El sistema fragmenta archivos de cientos de miles de registros en bloques controlados, optimizando las inserciones masivas en PostgreSQL y previniendo el desbordamiento de memoria (OOM).
3. **Resiliencia:** El procesador (ItemProcessor) incluye validaciones estrictas que descartan filas corruptas de forma silenciosa, garantizando que un error aislado en la telemetría no detenga la ejecución completa del lote.

## Fragmento de Implementación (Configuración de Lotes)

```java
@Bean
public Step importTelemetryStep(JobRepository jobRepository, 
                                PlatformTransactionManager transactionManager,
                                FlatFileItemReader<TelemetryCsvRecord> reader,
                                TelemetryItemProcessor processor,
                                RepositoryItemWriter<LogiflowTelemetry> writer) {
    
    return new StepBuilder("importTelemetryStep", jobRepository)
            // Procesamiento eficiente en bloques de 500 registros demo
            .<TelemetryCsvRecord, LogiflowTelemetry>chunk(500, transactionManager) 
            .reader(reader)
            .processor(processor)
            .writer(writer)
            .build();
}