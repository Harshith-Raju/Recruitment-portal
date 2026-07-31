# Multi-stage build: frontend + backend in one container

# --- Frontend build ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Same-origin API in production (backend serves frontend)
ENV VITE_API_URL=
RUN npm run build

# --- Backend ---
FROM node:20-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
