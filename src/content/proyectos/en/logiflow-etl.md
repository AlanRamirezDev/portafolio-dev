---
title: "Asynchronous Ingestion Pipeline (ETL)"
description: "High-performance microservice for massive logistics telemetry ingestion. Fault-tolerant architecture, distributed processing with Virtual Threads, JDBC Batching, and multi-layer defenses."
tech: ["Java 21", "Spring Boot 3", "Spring Batch", "PostgreSQL", "React", "Astro", "Tailwind CSS"]
githubUrl: "https://github.com/AlanRamirezDev/logiflow"
docsUrl: "https://alan-ramirez-dev.mintlify.site/en/logiflow/introduccion"
status: "Completed"
---

## The Architectural Challenge

Processing massive files in traditional web applications often causes bottlenecks in the server's main thread (timeouts) and RAM saturation, degrading the user experience. In logistics systems, for example, systems with thousands of vehicles constantly transmitting coordinates and telemetry, it is vital to process this information without interrupting the core system's operability or overloading the database with individual inserts.

## Technical Solution and Performance

To resolve this bottleneck and ensure a solid production environment, a specialized microservice for data extraction, transformation, and loading (ETL) was built.

1. **Concurrency with Virtual Threads (Java 21):** The ETL engine delegates the execution of processing batches to a `TaskExecutorAdapter` coupled to virtual threads. This allows processing file chunks in parallel without exhausting the container's physical thread pool, keeping the user interface 100% reactive.
2. **Bulk Inserts (JDBC Batching):** Optimization of the ORM layer (Hibernate) and the PostgreSQL Driver to group inserts. Alignment of the chunk size (`chunk(500)`) with the sequence pre-allocator (`allocationSize=500`) to rewrite batch statements.
3. **Multi-layer Security and Resilience:** * **Collision Blocking (TOCTOU):** Interception and blocking of simultaneous requests (Race Conditions).
   * **Simulated WAF:** Active defense against SQL Injection attacks in the interactive read terminal using regular expressions and transactional isolation (`readOnly = true`).
   * **Fault Tolerance:** The processor includes strict validations (`SkipPolicy`) that isolate and discard corrupt rows without aborting the entire *Job*, guaranteeing transparent and continuous loading.

## Implementation Snippet

```java
@Bean
public Step importTelemetryStep(JobRepository jobRepository, 
                                PlatformTransactionManager transactionManager,
                                FlatFileItemReader<TelemetryCsvRecord> reader,
                                TelemetryItemProcessor processor,
                                RepositoryItemWriter<LogiflowTelemetry> writer,
                                TaskExecutor taskExecutor) {
    
    return new StepBuilder("importTelemetryStep", jobRepository)
            // Efficient processing in blocks of 500 records
            .<TelemetryCsvRecord, LogiflowTelemetry>chunk(500, transactionManager) 
            .reader(reader)
            .processor(processor)
            .writer(writer)
            // Injection of virtual threads for parallel processing of Chunks
            .taskExecutor(taskExecutor)
            // Fault-Tolerant Architecture: Skips corrupt records without aborting the Job
            .faultTolerant()
            .skip(FlatFileParseException.class)
            .skip(Exception.class)
            .skipLimit(500) 
            .build();
}