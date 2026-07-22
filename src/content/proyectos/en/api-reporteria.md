---
title: "Dynamic Report Generator (PDF/CSV)"
description: "Microservice for generating structured binary reports in PDF and CSV."
tech: ["PHP 8.3", "Laravel 13", "React", "Astro", "Pest", "Tailwind CSS"]
status: "Completed"
githubUrl: "https://github.com/AlanRamirezDev/api-reporteria"
---

## The Architectural Challenge

In distributed microservice ecosystems, consolidating data for generating audits and account statements presents a critical infrastructure challenge. Forcing the server to write physical files to the hard drive or compiling heavy documents using external binary-dependent tools can cause I/O latency bottlenecks, memory overflow exceptions, and resource exhaustion vulnerabilities (DoS attacks). The objective was to design a resilient and secure report generator capable of transforming dynamic JSON structures into natively downloadable binary files without compromising persistence or the environment's hardware limits.

## Multi-layer Technical Solution

To comprehensively resolve this challenge, an in-memory data processing flow was designed and integrated, divided into two independent layers:

1. **Backend (Rendering and Security):** Clean architecture based on Laravel 13 and PHP 8.3. The service strictly implements the SOLID principle using the **Strategy** pattern, isolating the rendering logic. The CSV strategy processes the data stream through memory *streams* in the system's temporary memory (`php://temp`). The PDF strategy renders templates by calculating metrics with data normalization and dynamic Timezone synchronization. The entire service is perimeter-secured by a Rate Limiting (Throttle) middleware to repel network abuse.

2. **Frontend (Audit Dashboard):** Modular and interactive component developed in React. This dashboard asynchronously manipulates the browser's large binary object (**Blob**) API to force native downloads. Furthermore, it implements a robust Regex-based parser for safe CSV reading, proactively intercepts error codes, and deploys a "Perimeter Lock" system emitting *Custom Events* to freeze the DOM and prevent Race Conditions while waiting for the server's response.

### Implementation Snippet

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