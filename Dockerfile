# ----------- Build Stage -----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

RUN yarn build

# ----------- Production Stage -----------
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 4200

CMD ["node", "server.js"]