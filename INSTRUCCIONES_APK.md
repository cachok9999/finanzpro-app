# 📱 Guía para Instalar y Compilar la APK de FinanzPro en Android

FinanzPro está diseñada como una aplicación móvil universal de alto rendimiento. Tienes **dos formas** sencillas de tenerla instalada en tu teléfono Android:

---

## 🚀 Método 1: Instalación Instantánea como PWA Nativa (Recomendado y más rápido)

No necesitas instalar herramientas de desarrollo pesadas (como Android Studio). La app incluye soporte completo para **Progressive Web App (PWA)** y funciona 100% offline.

### Pasos:
1. Inicia la aplicación en tu computadora ejecutando:
   ```bash
   node server.js
   ```
2. Conecta tu teléfono Android a la misma red Wi-Fi que tu PC.
3. Abre Google Chrome en tu Android e ingresa la dirección IP de tu PC en el puerto 3000 (ejemplo: `http://192.168.1.50:3000`).
4. En Chrome, toca el menú de **tres puntos (⋮)** arriba a la derecha y selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
5. ¡Listo! FinanzPro aparecerá en tu cajón de aplicaciones con su icono nativo, pantalla completa sin barra de navegación del navegador y funcionamiento 100% offline.

---

## 🛠️ Método 2: Generar archivo `.APK` Nativo con Capacitor & Gradle

Si deseas compilar directamente el archivo binario `.apk` para distribuirlo o instalarlo manualmente:

### Requisitos previos:
- Node.js instalado (ya verificado).
- Android Studio / Android SDK instalado en tu equipo.

### Pasos de compilación:
1. Abre tu terminal en la carpeta del proyecto `finanzas_personales_app`:
   ```bash
   cd C:\Users\PC\.gemini\antigravity\scratch\finanzas_personales_app
   ```
2. Prepara los archivos compilados:
   ```bash
   node scripts/build.js
   ```
3. Instala las dependencias de Capacitor (solo la primera vez):
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
4. Agrega la plataforma Android y sincroniza:
   ```bash
   npx cap add android
   npx cap sync android
   ```
5. Compila el APK directamente con Gradle:
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```
   *El archivo `.apk` generado se ubicará en:*
   `android/app/build/outputs/apk/debug/app-debug.apk`

6. Pasa el archivo `app-debug.apk` a tu teléfono Android y ábrelo para instalar.

---

## 💡 Características Financieras Incluidas en FinanzPro:
- **Patrimonio Neto**: Cálculo en tiempo real de Activos Totales menos Pasivos Totales.
- **Regla 50/30/20**: Diagnóstico automático de Necesidades, Deseos y Ahorro.
- **Score de Salud Financiera**: Puntuación de 0 a 100 con recomendaciones personalizadas.
- **Fondo de Emergencia**: Contador de meses de supervivencia (*Runway*).
- **Simulador de Deudas**: Estrategia Bola de Nieve vs. Avalancha con cálculo de intereses ahorrados.
- **Libro Diario Minucioso**: Gastos e ingresos con comercios, categorías, cuentas, etiquetas y recurrencia.
- **Gráficos Interactivos**: Desglose por dona, proyección de flujo de caja a 30 días y balance mensual P&L.
- **Privacidad y Resguardo**: Modo de ocultar saldos, exportación a CSV/Excel y Copia de Seguridad JSON.
