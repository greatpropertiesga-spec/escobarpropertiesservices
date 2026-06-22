FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
	    index index.html;\n\
	    add_header X-Frame-Options DENY always;\n\
	    add_header X-Content-Type-Options nosniff always;\n\
	    add_header Referrer-Policy strict-origin-when-cross-origin always;\n\
	    add_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;\n\
	    location / {\n\
	        try_files $uri $uri/ $uri.html /index.html =404;\n\
	    }\n\
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
