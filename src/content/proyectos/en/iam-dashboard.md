---
title: "Identity and Access Management (IAM)"
description: "Modular platform with JWT security and role-based access control (RBAC). Developed with islands architecture and consuming a protected RESTful API."
tech: ["PHP 8.3", "Laravel 13", "PostgreSQL", "React", "Astro", "Tailwind CSS"]
status: "Completed"
---

## The Architectural Challenge

In platforms handling sensitive information, access control and user traceability present a critical security challenge. Inconsistent session management, lack of role hierarchy, or the absence of an immutable audit trail can lead to severe vulnerabilities and unauthorized access. The objective was to design an identity engine capable of orchestrating authentication, guaranteeing strict control (RBAC), and exposing it through an interactive, resilient, and secure administrative dashboard.

## Multi-layer Technical Solution

To comprehensively resolve this challenge, a completely independent yet synchronized two-layer ecosystem was designed and integrated:

1. **Backend (Identity and Security Engine):** Architecture built on Laravel 13. The core isolates the authentication logic (JWT) and protects endpoints using a custom middleware (`CheckRole`), ensuring that only users with specific privileges interact with the database. Furthermore, it implements an immutable audit log that anonymizes IP addresses using *Traits* (DRY) to ensure compliance with privacy regulations for the user interacting with it (demo mode).

2. **Frontend (IAM Administrative Dashboard):** A reactive interface integrated into Astro using React components under the islands architecture. This dashboard simulates an access control center, consumes the backend's REST API by injecting tokens via HTTP interceptors, and employs perimeter state locks (Custom Events) to prevent *Race Conditions* during asynchronous operations.

## Testing Guide (RBAC)

The Microservice includes three preconfigured profiles to evaluate the middleware restrictions:

* **Administrator:** Full access. Can create, deactivate, or restore users and inject test traffic.
* **Auditor:** Read-only access. Can view the audit log but cannot alter records.
* **Operator:** Access denied. Basic profile without privileges to interact with administrative modules.

### Implementation Snippet

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