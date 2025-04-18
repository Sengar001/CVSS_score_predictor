# Stage 1: Build the application
FROM node:18 as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install required polyfills and vite plugin
RUN npm install crypto-browserify stream-browserify assert buffer process vite-plugin-node-polyfills

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]