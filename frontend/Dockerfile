# Stage 1: Build React App
FROM node:18-alpine AS builder
 
WORKDIR /app
 
COPY package*.json ./
 
RUN npm install
 
COPY . .
 
ARG ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
 
RUN npm run build
 
# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
 
RUN rm /etc/nginx/conf.d/default.conf
 
COPY nginx.conf /etc/nginx/conf.d/
 
COPY --from=builder /app/dist /usr/share/nginx/html
 
EXPOSE 80
 
CMD ["nginx", "-g", "daemon off;"]
