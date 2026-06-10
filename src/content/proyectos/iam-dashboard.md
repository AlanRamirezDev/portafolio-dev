---
title: "Gestión de Identidad y Accesos (IAM)"
description: "Plataforma modular con seguridad JWT y control de acceso basado en roles (RBAC). Desarrollada con arquitectura de islas y consumiendo una API RESTful protegida."
tech: ["PHP 8.3", "Laravel 13", "PostgreSQL (Neon)", "React", "Astro", "Tailwind CSS"]
status: "Completado"
---

## El Desafío Arquitectónico

En plataformas que manejan información sensible, el control de acceso y la trazabilidad de los usuarios presentan un desafío crítico de seguridad. La gestión inconsistente de sesiones, la falta de jerarquía de roles o la ausencia de auditoría inmutable pueden derivar en vulnerabilidades severas y accesos no autorizados. El objetivo fue diseñar un motor de identidades capaz de orquestar la autenticación garantizando un control estricto (RBAC) y exponerlo a través de un panel interactivo para su administración.

## Solución Técnica Multicapa

Para resolver este desafío de manera integral, se diseñó e integró un ecosistema de dos capas completamente independiente pero sincronizado:

1. **Backend (Motor de Identidad y Seguridad):** Arquitectura construida sobre Laravel 13. El núcleo aísla la lógica de autenticación (JWT) y protege los endpoints mediante un middleware personalizado (`CheckRole`), asegurando que solo usuarios con privilegios específicos interactúen con la base de datos. Además, implementa un registro de auditoría automático para cada operación.

2. **Frontend (Panel Administrativo IAM):** Una interfaz reactiva integrada dentro de Astro utilizando componentes de React bajo la arquitectura de islas. Este dashboard simula un centro de control de accesos, consume la API REST del backend inyectando los tokens correspondientes, gestiona estados de autorización y provee una bitácora en tiempo real de las acciones y flujos de red.

## Guía de Pruebas (RBAC)

El Sandbox incluye tres perfiles preconfigurados para evaluar las restricciones del middleware:

* **Administrador:** Acceso total. Puede crear/eliminar usuarios e inyectar tráfico de prueba.
* **Auditor:** Acceso de solo lectura. Puede visualizar la bitácora inmutable, pero no puede alterar registros.
* **Operador:** Acceso denegado. Perfil básico sin privilegios para interactuar con los módulos administrativos.

### Fragmento de Implementación

```php
class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'No autenticado.'], 401);
        }

        $hasAccess = $user->roles->whereIn('name', $roles)->isNotEmpty();

        if (!$hasAccess) {
            return response()->json([
                'error' => 'Acceso denegado. Privilegios insuficientes para esta acción.'
            ], 403);
        }

        return $next($request);
    }
}