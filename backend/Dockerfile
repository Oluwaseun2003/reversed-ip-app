FROM node:18-alpine AS base
# ...base setup

FROM base AS build
COPY . .
RUN npm install
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

# Copy production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy Prisma schema
COPY prisma ./prisma/
RUN npx prisma generate

# **Copy built files from build stage**
COPY --from=build /app/dist ./dist

USER node
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
CMD ["npm", "start"]
