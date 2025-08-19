FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built app from build stage
COPY --from=build --chown=node:node /app/dist ./dist

# Use existing non-root user
USER node

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3001, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

CMD ["npm", "start"]
