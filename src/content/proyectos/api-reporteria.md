---
title: "Generador Dinámico de Reportes (PDF/CSV)"
description: "Microservicio para la generación de reportes binarios estructurados en PDF y CSV."
tech: ["PHP 8.3", "Laravel 13", "React", "Astro", "Pest", "Tailwind CSS"]
githubUrl: "https://github.com/AlanRamirezDev/api-reporteria"
status: "Completado"
---

## El Desafío Arquitectónico

En ecosistemas de microservicios distribuidos, la consolidación de datos para la generación de auditorías y estados de cuenta presenta un desafío crítico de infraestructura. Forzar al servidor a escribir archivos físicos en el disco duro o compilar documentos pesados utilizando herramientas dependientes de binarios externos puede provocar cuellos de botella por latencia de I/O, excepciones de desbordamiento de memoria y vulnerabilidades de agotamiento de recursos (ataques DoS). El objetivo fue diseñar un generador de reportes resiliente y seguro, capaz de transformar estructuras JSON dinámicas en archivos binarios de descarga nativa sin comprometer la persistencia ni los límites de hardware del entorno.

## Solución Técnica Multicapa

Para resolver este desafío de manera integral, se diseñó e integró un flujo de procesamiento de datos en memoria dividido en dos capas independientes:

1. **Backend (Renderizado y Seguridad):** Arquitectura limpia basada en Laravel 13 y PHP 8.3. El servicio implementa de forma estricta el principio SOLID mediante el patrón **Strategy**, aislando la lógica de renderizado. La estrategia de CSV procesa el flujo de datos a través de *streams* en la memoria temporal del sistema (`php://temp`). La estrategia de PDF renderiza plantillas calculando métricas con normalización de datos y sincronización dinámica de la zona horaria (*Timezone*). Todo el servicio está perimetrado por un middleware de *Rate Limiting* (Throttle) para repeler abusos de red.

2. **Frontend (Panel de Auditoría):** Componente modular e interactivo desarrollado en React. Este tablero manipula de forma asíncrona la API de objetos binarios grandes (**Blob**) del navegador para forzar la descarga nativa. Además, implementa un parser robusto basado en Expresiones Regulares (Regex) para la lectura segura de CSVs, intercepta proactivamente códigos de error, y despliega un sistema de "Bloqueo Perimetral" emitiendo *Custom Events* para congelar el DOM y prevenir las Race Conditions durante la espera de respuesta del servidor.

### Fragmento de Implementación

```php
<?php

namespace App\Services\Reporting\Strategies;

use App\Services\Reporting\Contracts\ReportStrategy;

class CsvReportStrategy implements ReportStrategy
{
    public function generate(array $data, ?string $timezone = null): string
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, ['ID Ref', 'Detalle Operativo', 'Monto', 'Estado']);
        
        $total = 0;
        foreach ($data['items'] ?? [] as $item) {
            $monto = $item['monto'] ?? 0;
            $total += $monto;

            $rawEst = $item['estado'] ?? '';
            $estNormalizado = strtolower(trim($rawEst));
            
            $estFinal = in_array($estNormalizado, ['aprobado', 'pendiente', 'rechazado']) 
                ? ucfirst($estNormalizado) 
                : 'No clasificado';

            fputcsv($handle, [
                $item['id'] ?? 'N/A',
                $item['detalle'] ?? 'Sin detalle registrado',
                $monto,
                $estFinal
            ]);
        }

        fputcsv($handle, ['-', 'Total Acumulado', $total, '-']);
        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return $csvContent;
    }
}