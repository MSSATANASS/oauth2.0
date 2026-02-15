# DocMX MCP Workflow Strategy

Este documento define el flujo de trabajo automatizado que combina los servidores MCP instalados (**Linear Local**, **GitHub**, **Knowledge Graph**) para optimizar el ciclo de desarrollo.

## 🔄 The "DocMX Dev Loop"

Este flujo conecta la gestión de proyectos (Linear) con la ejecución técnica (GitHub) y la memoria del proyecto (Knowledge Graph).

### Prerrequisitos
- Linear MCP configurado (local).
- GitHub MCP activo.
- Knowledge Graph activo.

### Fase 1: Selección y Contexto (Linear + KG)

1.  **Identificar Tarea**:
    - El agente utiliza `linear_get_user_issues` para encontrar tareas asignadas con alta prioridad.
    - *Alternativa:* Ejecutar `node scripts/start-task.js` para automatizar la creación de ramas.

2.  **Consultar Memoria**:
    - Antes de codificar, el agente usa `mcp_Persistent_Knowledge_Graph_search_nodes` con palabras clave del ticket de Linear.
    - *Objetivo:* Recuperar decisiones arquitectónicas previas, patrones de código o reglas de negocio relevantes.

### Fase 2: Ejecución (Coding + KG)

1.  **Actualizar Grafo de Conocimiento**:
    - Si se descubren nuevos conceptos o decisiones durante el análisis, usar `mcp_Persistent_Knowledge_Graph_create_entities` para registrarlos.

2.  **Implementación**:
    - Desarrollo estándar en la rama creada (ej. `feat/LIN-123-oauth`).

### Fase 3: Entrega y Sincronización (GitHub + Linear)

1.  **Gestión de Código**:
    - `mcp_GitHub_create_branch` (si no se usó el script).
    - `mcp_GitHub_push_files` para subir cambios.
    - `mcp_GitHub_create_pull_request` con el título "[LIN-123] Título de la tarea".

2.  **Cierre de Ciclo**:
    - El agente usa `linear_update_issue` para mover el ticket a "In Review" o "Done".
    - `linear_add_comment` para pegar el enlace del PR automáticamente en el ticket.

---

## 🛠 Herramientas de Automatización

### Script: `start-task.js`

Se ha creado un script en `scripts/start-task.js` que utiliza el SDK de Linear (del MCP local) para:
1.  Listar tus tareas activas.
2.  Crear automáticamente una rama de git con el formato `feat/ID-titulo`.
3.  Generar un archivo de especificación `docs/specs/ID.md` con la descripción del ticket.

**Uso:**
```bash
node scripts/start-task.js
```

## Ejemplo de Prompt para el Agente

*"Agente, inicia el flujo de trabajo para el ticket LIN-45. Busca contexto en el Knowledge Graph sobre 'autenticación', crea la rama y genera un plan de implementación."*
