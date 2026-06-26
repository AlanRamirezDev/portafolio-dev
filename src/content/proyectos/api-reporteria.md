---
title: "Generador Dinámico de Reportes (PDF/CSV)"
description: "Microservicio para la generación de reportes binarios estructurados en PDF y CSV."
tech: ["PHP 8.3", "Laravel 13", "React", "Astro", "Pest", "Tailwind CSS"]
status: "En desarrollo"
---

## El Desafío Arquitectónico

En ecosistemas de microservicios distribuidos, la consolidación de datos para la generación de auditorías y estados de cuenta presenta un desafío crítico de infraestructura. Forzar al servidor a escribir archivos físicos en el disco duro o compilar documentos pesados utilizando herramientas dependientes de binarios externos puede provocar cuellos de botella por latencia de I/O y excepciones de desbordamiento de memoria. El objetivo fue diseñar un generador de reportes, capaz de transformar estructuras JSON dinámicas en archivos binarios de descarga nativa sin comprometer la persistencia ni los límites de hardware del entorno.

## Solución Técnica Multicapa

Para resolver este desafío de manera integral, se diseñó e integró un flujo de procesamiento de datos en memoria dividido en dos capas independientes:

1. **Backend (Generador de Reportes):** Arquitectura limpia basada en Laravel 13 y PHP 8.3. El servicio implementa de forma estricta el principio SOLID mediante el patrón **Strategy**, aislando la lógica de renderizado para cada tipo de extensión. Para anular el uso del almacenamiento local, la estrategia de CSV procesa el flujo de datos a través de *streams* en la memoria temporal del sistema (`php://temp`), mientras que la estrategia de PDF renderiza plantillas Blade optimizadas a nivel de memoria RAM con cálculos e indicadores matemáticos auditados automáticamente mediante flujos de pruebas unitarias con **Pest**.

2. **Frontend (Panel de Auditoría):** Componente modular e interactivo desarrollado en React 19. Este tablero intercepta los bytes puros devueltos por la API REST y manipula de forma asíncrona la API de objetos binarios grandes (**Blob**) del navegador, abstrayendo la descarga nativa mediante la inyección y ejecución programática temporal de elementos en el DOM, complementado con un sistema defensivo de límites de cuota (Rate Limiting) en la interfaz gráfica.

### Fragmento de Implementación

```php
<?php

namespace App\Services\Reporting\Strategies;

use App\Services\Reporting\Contracts\ReportStrategy;

class CsvReportStrategy implements ReportStrategy
{
    public function generate(array $data): string
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, ['ID', 'Monto', 'Estado']);
        
        $total = 0;
        foreach ($data['items'] ?? [] as $item) {
            $monto = $item['monto'] ?? 0;
            $total += $monto;

            fputcsv($handle, [
                $item['id'] ?? 'N/A',
                $monto,
                $item['estado'] ?? 'N/A'
            ]);
        }

        fputcsv($handle, ['-', 'Total', $total]);
        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return $csvContent;
    }
}