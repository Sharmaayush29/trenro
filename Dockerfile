# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV NEXT_PUBLIC_SUPABASE_URL="https://vocmdrglskcxzjqdbqvz.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_FAZpjIO2SWm5k8N6Ht-0iA_N6O5QPqH"
ENV NEXT_PUBLIC_APP_URL="https://trenro.fly.dev"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY . .

# Build application
RUN npx next build --experimental-build-mode compile

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

ENV HOSTNAME="0.0.0.0"
ENV PORT="3000"

# Copy built application
COPY --from=build /app /app

# Entrypoint sets up the container with node directly
ENTRYPOINT [ "node", "/app/docker-entrypoint.js" ]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
