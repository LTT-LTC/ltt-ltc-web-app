# ----------- Build Stage -----------
FROM node:22-alpine AS builder
WORKDIR /app

ARG ENV_FILE
COPY package*.json ./
RUN yarn install

COPY . .
#RUN npm run build
RUN npx env-cmd -f $ENV_FILE npm run build

# ----------- Production Stage -----------
FROM node:22-alpine
WORKDIR /app
RUN mkdir .next

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 4200

ENV PORT=4200

CMD ["node", "server.js"]
#