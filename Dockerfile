FROM node:22-alpine
WORKDIR /workspace

# Install deps first (cached layer)
COPY package.json yarn.lock ./
RUN corepack enable && yarn install

# Copy source
COPY . .

# Build args for Next.js public env vars
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN yarn build

EXPOSE 4200
CMD ["yarn", "start", "-p", "4200"]