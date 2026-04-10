# Use a lightweight web server
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static HTML file
COPY index.html /usr/share/nginx/html/index.html
COPY catalog.html /usr/share/nginx/html/catalog.html
COPY swarm-dashboard.html /usr/share/nginx/html/swarm-dashboard.html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]