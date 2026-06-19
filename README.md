# Vortex Tales — Immersive Narrative Engine

Vortex Tales es un motor de juegos web del estilo **"Elige tu propia aventura"** (Choose Your Own Adventure) altamente optimizado para ejecutarse en Servidores Virtuales Privados (VPS) de muy bajos recursos. 

El diseño se centra en la eficiencia absoluta de recursos (RAM/CPU) en el servidor y una experiencia premium, oscura e inmersiva para el jugador en el cliente.

---

## 🚀 Arquitectura y Tecnologías

### Backend (Ligero y Eficiente)
- **Runtime & Servidor**: Node.js + TypeScript + Express.
- **Base de Datos**: SQLite (almacenamiento en un solo archivo local).
- **ORM**: Drizzle ORM con el driver `@libsql/client` (evita problemas de compilación nativa y minimiza consumo).
- **Almacenamiento de Historias**: Archivos JSON estáticos cargados bajo demanda desde el disco.

### Frontend (Premium e Inmersivo)
- **Core**: React + TypeScript.
- **Bundler & Dev Server**: Vite (compilado a archivos HTML/JS/CSS estáticos de alto rendimiento para ser servido por Nginx).
- **Diseño Visual**: CSS Vanilla con variables, diseño adaptado a móviles (responsive), efectos de parpadeo, sacudidas de cámara, destellos carmesí de muerte y estética glassmorphism.
- **Sistema de Audio**: Transiciones fluidas (fade-out/fade-in) para loops ambientales y efectos sintetizados en tiempo real mediante la **Web Audio API** en JavaScript (evita descargas de audio y ahorra RAM).

---

## 📂 Estructura de Directorios

```text
vortex-tales/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts        # Inicialización de Drizzle y SQLite
│   │   │   ├── schema.ts       # Esquemas de tablas (Usuarios, Progreso, Trofeos)
│   │   │   └── migrate.ts      # Ejecutor programático de migraciones
│   │   ├── middleware/
│   │   │   └── auth.ts         # Middleware JWT
│   │   ├── routes/
│   │   │   ├── auth.ts         # Registro, Login y validación de sesión
│   │   │   ├── game.ts         # Estado del juego, navegación, trofeos y tiempo de juego
│   │   │   └── index.ts        # Ensamblador de rutas
│   │   └── services/
│   │       └── story.ts        # Lector bajo demanda de JSON con caché en memoria
│   ├── stories/
│   │   └── terror-sanatorio/   # Primera historia de Terror (Vórtice del Silencio)
│   │       ├── chapter1.json
│   │       ├── chapter2.json
│   │       └── chapter3.json
│   ├── package.json
│   ├── tsconfig.json
│   └── drizzle.config.ts       # Configuración del CLI Drizzle Kit
├── frontend/
│   ├── src/
│   │   ├── components/         # Auth, Dashboard, Console, TrophyRoom, Notification
│   │   ├── hooks/              # useAudio (fades), usePlaytime (sync en segundo plano)
│   │   ├── index.css           # Tokens CSS, temas y micro-animaciones
│   │   ├── App.tsx             # Enrutador principal y control de estados
│   │   ├── main.tsx            # Punto de entrada
│   │   └── vite-env.d.ts
│   ├── public/                 # Archivos estáticos de música loop
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 💾 Esquema de Base de Datos (SQLite)

El backend mantiene un estado mínimo persistido en base de datos para no saturar memoria:

1. **`users`**: Registra cuentas para guardar el progreso y los logros asociados.
   - `id` (Text / UUID) - Clave primaria.
   - `username` (Text) - Nombre único de usuario.
   - `password_hash` (Text) - Hash seguro de contraseña.
2. **`progress`**: Guarda en qué punto exacto del grafo se encuentra el usuario por cada historia.
   - `id` (Text / UUID) - Clave primaria.
   - `user_id` (Text) - Clave foránea.
   - `story_id` (Text) - Identificador de la historia (ej: `terror-sanatorio`).
   - `current_chapter` (Integer) - Capítulo activo (1, 2 o 3).
   - `current_node_id` (Text) - ID del nodo actual en el grafo.
   - `playtime_seconds` (Integer) - Tiempo total acumulado jugando esa historia.
3. **`user_trophies`**: Trofeos/Logros desbloqueados por los usuarios.
   - `id` (Text / UUID) - Clave primaria.
   - `user_id` (Text) - Clave foránea.
   - `story_id` (Text) - ID de la historia.
   - `trophy_id` (Text) - ID del logro desbloqueado.
   - `unlocked_at` (Text) - Fecha y hora del desbloqueo.

---

## 📖 Estructura del Grafo de Historias (JSON)

Para evitar que el cliente haga spoiler del juego inspeccionando el código, **el frontend solo recibe la información del nodo actual**. El cliente no conoce los nodos futuros ni las ramificaciones hasta que navega a ellos y el servidor las valida.

### Formato de Nodo
Cada nodo de un capítulo contiene:
- `text`: Narrativa principal.
- `ambient_sound` (Opcional): Ruta del archivo de música loop.
- `visual_effect` (Opcional): Efecto para el frontend (`flicker`, `shake`, `red_flash`, `fade_to_black`, o `none`).
- `unlock_trophy_id` (Opcional): Código del logro que se desbloquea al entrar al nodo.
- `is_death_node` (Opcional): Indica si causa la muerte del jugador (ofrece reintentar desde el inicio del capítulo).
- `checkpoint` (Opcional): Si es `true`, el nodo finaliza el capítulo y permite avanzar al siguiente.
- `options`: Lista de botones con su respectivo `next_node_id` para navegar.

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior).
- npm o yarn.

### 1. Levantar el Backend
1. Navega a la carpeta de backend:
   ```bash
   cd backend
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Genera y ejecuta las migraciones iniciales de SQLite:
   ```bash
   # Generar archivo de migración SQL
   npm run db:generate
   
   # Ejecutar migración sobre la base de datos local.db
   npm run db:migrate
   ```
4. Inicia el servidor de desarrollo API (corre por defecto en `http://localhost:3001`):
   ```bash
   npm run dev
   ```

### 2. Levantar el Frontend
1. Abre una nueva terminal en la raíz del proyecto y navega a la carpeta de frontend:
   ```bash
   cd frontend
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite (corre por defecto en `http://localhost:5173`):
   ```bash
   npm run dev
   ```

---

## 🌍 Despliegue en VPS (Nginx)

Para producción en un VPS de bajos recursos, Vite compila el frontend en archivos estáticos que Nginx sirve de forma ultra rápida y sin consumir CPU. El backend se ejecuta mediante un gestor de procesos como `pm2` para redirigir las llamadas de `/api` usando Nginx como Proxy Inverso.

### 1. Compilar Frontend
En la carpeta `frontend`:
```bash
npm run build
```
Esto creará la carpeta `dist/` con los archivos compilados listos para subir al servidor.

### 2. Configuración Recomendada de Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Servir Frontend Estático
    location / {
        root /var/www/vortex-tales/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Servir archivos de audio con caché fuerte
    location /audio/ {
        root /var/www/vortex-tales/frontend/dist;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy Inverso para la API Backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
