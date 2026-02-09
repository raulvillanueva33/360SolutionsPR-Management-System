# 360SolutionsPR Management System

PWA (Progressive Web App) para la gestion integral de una compania de mantenimiento de rotulos en Puerto Rico.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Estilos:** Tailwind CSS (colores corporativos)
- **Backend/DB:** Firebase (Auth, Firestore, Storage)
- **PWA:** vite-plugin-pwa (instalable, offline)

## Colores Corporativos

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | #00A3A5 | Botones, links, acentos |
| Secondary | #FF6B35 | Alertas, highlights |
| Dark | #1B4965 | Textos, sidebar |
| Light | #FFFFFF | Fondos |

## Modulos

1. **Dashboard** - Resumen con metricas en tiempo real
2. **El Patrullero** - Ronda nocturna (mobile first, dark mode, fotos, geolocalizacion, Google Maps)
3. **Ordenes de Servicio** - CRUD de tickets con filtros por estado y prioridad
4. **Empleados** - Clock-in/Clock-out con geolocalizacion GPS
5. **Calendario/Despacho** - Vista semanal con drag-and-drop
6. **Permisos (OGPe/ARPE)** - Seguimiento de permisos gubernamentales

## Estructura del Proyecto

```
360SolutionsPR-Management-System/
|-- index.html
|-- package.json
|-- vite.config.js
|-- tailwind.config.js
|-- postcss.config.js
|-- .env.example
|-- src/
    |-- main.jsx
    |-- index.css
    |-- firebase.js
    |-- App.jsx
    |-- components/
    |   |-- Layout.jsx
    |-- modules/
        |-- auth/LoginPage.jsx
        |-- dashboard/Dashboard.jsx
        |-- patrol/PatrolModule.jsx
        |-- tickets/ServiceTicketsModule.jsx
        |-- employees/EmployeesModule.jsx
        |-- dispatch/DispatchCalendar.jsx
        |-- permits/PermitsModule.jsx
```

## Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/raulvillanueva33/360SolutionsPR-Management-System.git
cd 360SolutionsPR-Management-System

# 2. Instalar dependencias
npm install

# 3. Configurar Firebase
# Copia .env.example a .env y agrega tus credenciales de Firebase
cp .env.example .env

# 4. Iniciar desarrollo
npm run dev
```

## Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Activa **Authentication** > Google Sign-In
4. Activa **Cloud Firestore** en modo test
5. Activa **Storage**
6. Copia las credenciales del proyecto al archivo `.env`

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de produccion
npm run preview  # Preview del build
```

## Deploy (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Selecciona 'dist' como directorio publico
# Configura como SPA (single-page app)
npm run build
firebase deploy
```

## Licencia

Privado - 360SolutionsPR
