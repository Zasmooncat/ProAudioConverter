# Usa una imagen oficial de Python ligera
FROM python:3.11-slim

# Evitar que Python genere archivos .pyc y forzar logs directos a la consola
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instalar FFmpeg (imprescindible para procesar audio)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Crear y moverse a la carpeta de la app en el contenedor
WORKDIR /app

# Copiar el archivo de dependencias primero para optimizar el caché de Docker
# Forzar a Render a recompilar las dependencias
ENV CACHE_BUSTER=2026-04-02-1
COPY requirements.txt .

# Instalar las librerías de Python (incluyendo gunicorn)
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código del backend
COPY . .

# Exponer el puerto por el que escuchará Render
EXPOSE 10000

# Comando para iniciar la aplicación en producción con gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--timeout", "120", "app:app"]
