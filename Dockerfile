# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 — Build (Vite + React + TypeScript)
# As variaveis VITE_* sao compiladas AQUI (build-time).
# O Vite le automaticamente o .env na raiz do projeto.
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependencias com cache eficiente
COPY package*.json ./
RUN npm ci

# Copia o restante do projeto (inclui .env e public/ com as midias)
COPY . .

# Gera o build de producao em /app/dist
RUN npm run build

# ============================================================
# Stage 2 — Runtime (servidor estatico Nginx)
# A imagem final contem apenas os arquivos estaticos.
# Nenhum .env ou codigo-fonte e incluido aqui.
# ============================================================
FROM nginx:alpine AS runtime

# Configuracao customizada (SPA fallback, gzip, cache)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estaticos gerados no stage de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
