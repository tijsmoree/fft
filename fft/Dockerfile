# Use bare nginx image
FROM nginx:1.23-alpine

# Set the working directory
WORKDIR /var/www/html

# Copy router config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY dist .

# Expose the 8000 port to the host
EXPOSE 8000

# Setup healthcheck functionality
HEALTHCHECK CMD wget -nv -t1 --spider http://0.0.0.0:8000 || exit 1
