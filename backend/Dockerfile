FROM node:18-alpine AS base
WORKDIR /app

RUN apk add --no-cache \
    openssl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --only=production && npm cache clean --force

RUN npx prisma generate

FROM base AS development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM base AS build
COPY . .
RUN npm install
RUN npm run build
RUN npx prisma generate

FROM build AS production

WORKDIR /app

COPY --from=build --chown=1000:1000 /app/dist ./dist
COPY --from=build --chown=1000:1000 /app/package*.json ./
COPY --from=build --chown=1000:1000 /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3001

USER 1000:1000

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3001, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

CMD ["npm", "start"]
