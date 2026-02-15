# Integración de Linear MCP Server

Este documento detalla la instalación y configuración del servidor MCP para Linear, permitiendo a la IA interactuar con tu gestor de proyectos.

## 1. Estado de la Instalación

- **Repositorio**: `jerhadf/linear-mcp-server` clonado en `linear-mcp/`
- **Estado**: Construido y verificado correctamente via `npm run build`.
- **Autenticación**: API Key configurada y validada.
  - Usuario: Yam Melendez Gongora (270803ggiztheking@gmail.com)
  - Conexión: Exitosa (Issues accesibles).

## 2. Configuración en Trae (o tu IDE)

Para que el asistente pueda usar las herramientas de Linear (crear issues, buscar, etc.), debes agregar la siguiente configuración a tu archivo de configuración de MCP en el IDE (generalmente en `Settings > MCP Servers` o `claude_desktop_config.json` si usas Claude Desktop, pero en Trae busca la sección de servidores MCP).

### Configuración JSON

```json
{
  "mcpServers": {
    "linear": {
      "command": "node",
      "args": [
        "C:/Users/Fix/Documents/trae_projects/docmx/linear-mcp/build/index.js"
      ],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key_here"
      }
    }
  }
}
```

> **Nota:** La API Key ya está guardada en `linear-mcp/.env` para pruebas locales, pero para la integración con el IDE es mejor pasarla en la configuración como se muestra arriba.

## 3. Herramientas Disponibles

Una vez configurado, tendrás acceso a las siguientes herramientas:

1.  **`linear_create_issue`**: Crear nuevos tickets.
    - *Ejemplo:* "Crea un ticket urgente para arreglar el login en el equipo de Frontend"
2.  **`linear_update_issue`**: Modificar tickets existentes.
3.  **`linear_search_issues`**: Buscar tickets por texto, estado o asignado.
    - *Ejemplo:* "Busca todos los bugs asignados a mí"
4.  **`linear_get_user_issues`**: Ver tus tareas asignadas.
5.  **`linear_add_comment`**: Comentar en un ticket.

## 4. Verificación Manual

Si deseas verificar la conexión nuevamente, puedes ejecutar el script de prueba incluido:

```bash
cd linear-mcp
node verify-linear.js
```

Esto imprimirá tu usuario actual y el número de issues encontrados, confirmando que la API Key y la red funcionan correctamente.
