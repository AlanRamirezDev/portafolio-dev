---
title: "Pipeline de Ingesta Asíncrona (ETL)"
description: "Microservicio de alto rendimiento para la ingesta masiva de telemetría logística. Arquitectura tolerante a fallos, procesamiento distribuido con Hilos Virtuales, JDBC Batching y defensas multicapa."
tech: ["Java 21", "Spring Boot 3", "Spring Batch", "PostgreSQL", "React", "Astro", "Tailwind CSS"]
githubUrl: "https://github.com/AlanRamirezDev/logiflow"
docsUrl: "https://alan-ramirez-dev.mintlify.site/logiflow/introduccion"
status: "Completado"
---

## El Desafío Arquitectónico

El procesamiento de archivos masivos en aplicaciones web tradicionales suele provocar bloqueos en el hilo principal del servidor (timeouts) y saturación de memoria RAM, degradando la experiencia del usuario. En sistemas logísticos, por ejemplo, sistemas con miles de vehículos que transmiten coordenadas y telemetría constantemente, es vital procesar esta información sin interrumpir la operatividad del sistema central ni sobrecargar la base de datos con inserciones individuales.

## Solución Técnica y Rendimiento

Para resolver este cuello de botella y garantizar un entorno de producción sólido, se construyó un microservicio especializado en la extracción, transformación y carga (ETL) de datos.

1. **Concurrencia con Hilos Virtuales (Java 21):** El motor ETL delega la ejecución de los lotes de procesamiento a un `TaskExecutorAdapter` acoplado a hilos virtuales. Esto permite procesar fragmentos del archivo en paralelo sin agotar el pool de hilos físicos del contenedor, manteniendo la interfaz de usuario 100% reactiva.
2. **Bulk Inserts (JDBC Batching):** Optimización de la capa ORM (Hibernate) y el Driver PostgreSQL para agrupar inserciones. Alineación del tamaño del lote (`chunk(500)`) con el pre-asignador de secuencias (`allocationSize=500`) para reescribir sentencias por lotes.
3. **Seguridad y Resiliencia Multicapa:** * **Bloqueo de Colisiones (TOCTOU):** Intercepción y bloqueo peticiones simultáneas (Race Conditions).
   * **WAF Simulado:** Defensa activa contra ataques de Inyección SQL en la terminal interactiva de lectura mediante expresiones regulares y aislamiento transaccional (`readOnly = true`).
   * **Tolerancia a Fallos:** El procesador incluye validaciones estrictas (`SkipPolicy`) que aíslan y descartan filas corruptas sin abortar el *Job* completo, garantizando una carga transparente y continua.

## Fragmento de Implementación

```java
@Bean
public Step importTelemetryStep(JobRepository jobRepository, 
                                PlatformTransactionManager transactionManager,
                                FlatFileItemReader<TelemetryCsvRecord> reader,
                                TelemetryItemProcessor processor,
                                RepositoryItemWriter<LogiflowTelemetry> writer,
                                TaskExecutor taskExecutor) {
    
    return new StepBuilder("importTelemetryStep", jobRepository)
            // Procesamiento eficiente en bloques de 500 registros
            .<TelemetryCsvRecord, LogiflowTelemetry>chunk(500, transactionManager) 
            .reader(reader)
            .processor(processor)
            .writer(writer)
            // Inyección de hilos virtuales para procesamiento paralelo de los Chunks
            .taskExecutor(taskExecutor)
            // Arquitectura Fault-Tolerant: Salta registros corruptos sin abortar el Job
            .faultTolerant()
            .skip(FlatFileParseException.class)
            .skip(Exception.class)
            .skipLimit(500) 
            .build();
}