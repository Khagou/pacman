# Utiliser une image légère nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copier les fichiers de l'application dans le répertoire de nginx
COPY index.html /usr/share/nginx/html/
COPY pacman.js /usr/share/nginx/html/
COPY sounds/ /usr/share/nginx/html/sounds/
COPY *.png /usr/share/nginx/html/

# Exposer le port 8080
EXPOSE 8080
