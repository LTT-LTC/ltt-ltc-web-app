FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Install dependencies
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /workspace
# Copy deps from previous stage
COPY --from=deps /workspace/node_modules ./node_modules
# Copy all project files
COPY . .

# Pass build arg to environment variable so Next.js embeds it
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the project (output: "standalone" is in next.config.ts)
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /workspace

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone Next.js server and static files
COPY --from=builder --chown=nextjs:nodejs /workspace/public ./public
COPY --from=builder --chown=nextjs:nodejs /workspace/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/.next/static ./.next/static

USER nextjs

EXPOSE 4200

ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

# Note: server.js is created by Next.js from the standalone output
CMD ["node", "server.js"]
