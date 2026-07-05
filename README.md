# Arreglo de Exhibidores

Aplicación web para organizar el **Arreglo de Predicación Pública - Exhibidores**.

## Características

- **Dos ubicaciones:**
  - Av. Vollmer (Lunes a Viernes)
  - Eloy Alfaro (Lunes a Domingo)

- **Turnos:** 8:00-10:00, 10:00-12:00, 12:00-14:00, 14:00-16:00

- **Gestión de participantes:**
  - Agregar, editar y eliminar participantes
  - Autocompletado al asignar a turnos
  - Máximo 3 participantes por turno

- **Generación de PDF:**
  - Tamaño media carta
  - Nombres completos sin truncar
  - Formato profesional con colores

- **Respaldo y compartición:**
  - Enviar por WhatsApp
  - Guardar/cargar archivos JSON
  - Sincronizar entre dispositivos

- **PWA (Progressive Web App):**
  - Se puede instalar en celulares
  - Funciona sin internet
  - Acceso rápido desde pantalla de inicio

## Instalación

### Opción 1: Usar directamente
1. Descarga o clona esta carpeta
2. Abre `index.html` en tu navegador
3. ¡Listo!

### Opción 2: Instalar como app en celular
1. Abre la app en Chrome/Safari
2. Toca el menú (3 puntos)
3. Selecciona "Agregar a pantalla de inicio"

### Opción 3: Subir a GitHub Pages
1. Crea un repositorio en GitHub
2. Sube todos los archivos
3. Ve a Settings > Pages
4. Selecciona la rama `main`
5. Tu app estará disponible en: `https://tuusuario.github.io/nombre-repo/`

## Uso

1. **Agregar participantes:** En la sección "Gestión de Participantes"
2. **Crear arreglo:** Selecciona ubicación y fecha de inicio
3. **Llenar turnos:** Usa el autocompletado o escribe nombres
4. **Guardar:** Haz clic en "Guardar"
5. **Descargar PDF:** Haz clic en "Vista Previa" y luego "Confirmar e Imprimir PDF"
6. **Compartir:** Usa "Enviar por WhatsApp" o "Guardar Archivo"

## Tecnologías

- HTML5
- CSS3
- JavaScript vanilla
- jsPDF (para generar PDFs)
- Service Worker (para offline)
- LocalStorage (para persistencia)

## Estructura

```
arreglo-exhibidores/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos
├── js/
│   └── app.js          # Funcionalidad
├── manifest.json       # Configuración PWA
├── service-worker.js   # Offline support
└── README.md           # Este archivo
```

## Licencia

Uso gratuito para fines no comerciales.
