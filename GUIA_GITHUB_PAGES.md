# 🌐 Guía para Alojar FinanzPro en GitHub Pages (Acceso Universal 24/7)

Sigue estos sencillos pasos para publicar tu aplicación en **GitHub Pages** de forma gratuita. Obtendrás un enlace web seguro (`https://`) para abrirla desde cualquier computadora, teléfono o tablet en cualquier parte del mundo.

---

## 📌 Paso 1: Crear un nuevo repositorio en GitHub

1. Entra a [https://github.com](https://github.com) e inicia sesión (o regístrate gratis si no tienes cuenta).
2. Haz clic en el botón verde **"New"** (o **"+"** arriba a la derecha → **"New repository"**).
3. Configura lo siguiente:
   - **Repository name:** `finanzpro-app` (o el nombre que prefieras).
   - **Visibility:** Selecciona **Public** (necesario para GitHub Pages gratuito).
   - **NO marques** las opciones de "Add a README file", ".gitignore" ni "license" (el proyecto local ya los incluye).
4. Haz clic en **"Create repository"**.

---

## 💻 Paso 2: Subir el proyecto desde tu computadora

Abre la consola / terminal en tu computadora (PowerShell o CMD) y ejecuta estos comandos (reemplazando `TU_USUARIO` por tu nombre de usuario de GitHub):

```bash
# 1. Entra a la carpeta del proyecto
cd C:\Users\PC\.gemini\antigravity\scratch\finanzas_personales_app

# 2. Conecta con tu repositorio de GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/finanzpro-app.git

# 3. Sube todos los archivos
git push -u origin main
```
*(GitHub te solicitará iniciar sesión o autorizar con tu navegador/token personal).*

---

## ⚙️ Paso 3: Activar GitHub Pages (2 clics)

1. En la página de tu repositorio en GitHub, ve a la pestaña **Settings** (Configuración ⚙️ arriba a la derecha).
2. En el menú de la izquierda, haz clic en **Pages**.
3. En la sección **"Build and deployment"** / **"Branch"**:
   - Cambia `None` por **`main`**.
   - Deja la carpeta en **`/(root)`**.
   - Haz clic en el botón **"Save"** (Guardar).

¡Listo! En 1 a 2 minutos, GitHub generará tu enlace público:
👉 **`https://TU_USUARIO.github.io/finanzpro-app/`**

---

## 📱 Paso 4: Abrir e Instalar en tu Celular (Android / iPhone)

1. Abre el enlace `https://TU_USUARIO.github.io/finanzpro-app/` en tu celular (Google Chrome o Safari).
2. **En Android (Chrome)**:
   - Toca el menú de tres puntos `(⋮)` arriba a la derecha.
   - Selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
3. **En iPhone (Safari)**:
   - Toca el botón de **Compartir** (icono cuadrado con flecha hacia arriba).
   - Selecciona **"Agregar a pantalla de inicio"**.

### 🎉 ¡Resultado!
- Tendrás el icono de **FinanzPro** en tu pantalla de inicio como cualquier app descargada.
- Funcionará a pantalla completa, **100% offline** y con guardado seguro en tu dispositivo.
