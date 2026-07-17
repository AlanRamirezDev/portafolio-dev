🌐 **Leer en otro idioma:** [Español](README.md)

# Alan Michel Ramírez Juárez - Software Development Portfolio

![Astro](https://img.shields.io/badge/Astro-0C111A?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring_Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 📚 Technical Documentation
👉 **[Explore Full Architecture and Documentation](https://alan-ramirez-dev.mintlify.site/en/hub/introduccion)**

---

Welcome to my professional portfolio repository!

This project acts as an interactive central HUB designed under a static and modular architecture to demonstrate my capabilities in software engineering, design patterns, and full-stack deployments integrating multiple technologies.

## 🚀 Project Features & Advanced UX

* **Static Hybrid Architecture:** Static Site Generation (SSG) with Astro to ensure near-instant load times and optimal performance.
* **Islands of Interactivity (React):** Integration of dynamic reactive components hydrated via Astro's `client:load` and `client:only` directives for efficient client-side state management.
* **RESTful API Standardization:** Homogenized communication contracts under strict versioning (`/api/v1/`) across the microservices ecosystem, ensuring safe interface evolution.
* **Web Accessibility (a11y):** Implementation of ARIA attributes and native HTML semantics to support keyboard navigation and screen readers, complying with modern usability standards.
* **Git Branch Style History:** Interactive timeline emulating a `git log` flow to reactively showcase my technical achievements and professional experience through accordions.
* **Unified Global Styles:** Designed with Tailwind CSS using a pure CSS variables theme under a dark and sober color palette.

---

## 📈 Highlighted Case Studies

### 1. Interactive Sandbox: Investment Transactional Engine
Full-stack ecosystem integrated as a living modular component within the portfolio architecture.
* **Live Cloud Integration:** Consumption of asynchronous requests under REST semantics (`PUT`/`POST`) to a robust backend in Spring Boot 3 (Java 21) optimized with HikariCP.
* **ACID Persistence and Concurrency:** Synchronized with a PostgreSQL database implementing a **Pessimistic Locking (`PESSIMISTIC_WRITE`)** schema, mitigating Race Conditions against simultaneous balance mutations.
* **Secure Perimeter and Error Handling:** Input data sanitized in real-time via regular expressions on the client and shielded on the server with Jakarta validations (`@Valid`). Centralized through a global exception interceptor (`@ControllerAdvice`).
* **Defensive Reactive UI and Perimeter UX:** Developed in React and Astro. Emits *Custom Events* to freeze global portfolio navigation during active network cycles and separates initial loading from background data updates, preventing DOM collapse and ensuring scroll stability.
* **Integrated Network Logger:** Observability module coupled to the interface emulating a financial terminal, visually deploying the full lifecycle of exchanges (HTTP Requests/Responses).

### 2. Micro-Frontend: Identity and Access Management (IAM)
Security control system integrated into the Hub via isolated routing and consumption of a protected RESTful API.
* **Security and Control (RBAC):** Backend built in PHP 8.3 and Laravel 13, managing JWT token issuance and strictly validating access privileges from custom middlewares.
* **Smart HTTP Client:** Centralized configuration with Axios implementing network interceptors for the safe and automatic injection of authorization credentials.
* **Actions by Role:** Logging of actions, IP addresses (anonymized), and payloads in PostgreSQL, exposed to profiles with different roles and corresponding actions in the control panel.
* **Seamless Experience:** Authentication components and administrative panels developed in React, operating as a fluid Single Page Application (SPA).

### 3. Logistic ETL Pipeline: Asynchronous Data Ingestion
High-performance microservice to demonstrate massive file processing and data resilience.
* **Batch Processing and Concurrency:** Developed with Spring Batch and Virtual Threads (Java 21) to ingest thousands of transactional records into PostgreSQL without blocking the main thread, keeping the interface reactive (`202 Accepted`).
* **Resilience and Fault Tolerance:** Strict implementation of `SkipPolicy` policies to encapsulate and structurally discard corrupted data, ensuring isolated failures do not stop the batch load.
* **Smart Network Synchronization:** Defensive frontend that actively polls the backend engine's health, implementing dynamic latency tolerances to mitigate network delays.
* **SQL Terminal and WAF/RBAC Simulator:** Embedded interactive console with quick actions that evaluates system robustness by filtering destructive SQL injections and blocking requests outside permitted roles.

### 4. Dynamic Report Generator: Extraction and Rendering
Microservice designed to consolidate and export critical ecosystem information on demand, demonstrating high proficiency in data manipulation and cloud resilience.
* **Strategy Pattern and Clean Architecture:** Backend developed in PHP 8.3 and Laravel, implementing the *Strategy* pattern for polymorphic document generation (PDF/CSV), adhering to the Open/Closed Principle of SOLID.
* **Optimal In-Memory Processing:** Manipulation of data streams directly in memory (`php://temp`) for raw exports, avoiding disk writes and maximizing server response speed.
* **Rate Limiting and Perimeter Security:** Strict infrastructure protection via `throttle` middlewares to prevent abuse and resource exhaustion (DoS). Synchronized with an interface that intercepts HTTP 429 codes.
* **Context Consistency and Defensive UX:** Dynamic injection of the client's timezone into the rendering engine, and application of perimeter DOM locks via *Custom Events* to prevent Race Conditions during heavy asynchronous processes.

---

## 🛠️ Development Commands

All commands are run from the root of the project using `pnpm`:

| Command | Action |
| :--- | :--- |
| `pnpm install` | Installs project dependencies |
| `pnpm dev` | Starts the local development server at `localhost:4321` |
| `pnpm build` | Builds the optimized production site into `./dist/` |
| `pnpm preview` | Previews the production build locally |

---

## 🧑‍💻 Professional Profile and Identity

I am a graduated Computer Engineer (Professional License No. 13385449) from IPN "UPIICSA". As a software developer, I apply an agnostic technical logic; my focus is not limited to a single stack or framework, but rather on maintaining a continuous growth mindset to select and master the best technology that solves the business problem. 

I have solid experience designing everything from high-impact web applications under the MVC pattern with PHP (Laravel) and JavaScript, to building concurrent, secure, and high-availability solutions using Java (Spring Boot). I operate under an agile infrastructure, efficiently transitioning the software development lifecycle between local environments on Windows and deployments on Linux servers and Docker containers.