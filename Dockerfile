# ---------- Build Stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copia dependências primeiro (melhora cache do Docker)
COPY package.json package-lock.json ./

# Instala dependências
RUN npm ci

# Copia restante do projeto
COPY . .

# Variáveis de ambiente do Supabase
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Build do Vite
RUN npm run build


# ---------- Production Stage ----------
FROM nginx:stable-alpine

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia build
COPY --from=build /app/dist /usr/share/nginx/html

# Copia config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]