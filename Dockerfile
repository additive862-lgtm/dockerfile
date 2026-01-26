FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./

# Force cache invalidation and clean install
# Timestamp: 2026-01-25 23:22
RUN rm -rf node_modules package-lock.json && npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ARG DATABASE_URL
ARG NEXTAUTH_URL
ARG AUTH_SECRET
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG TURNSTILE_SECRET_KEY

# Prisma Generate
RUN npx prisma generate

# Next.js Build
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Set environment variables for Korean support
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Install Python, dependencies, and shell tools
RUN apk add --no-cache python3 py3-pip py3-lxml libxml2 libxslt bash ghostscript

# Install hwp5html (via pyhwp package) and its dependency 'six'
RUN pip3 install --no-cache-dir --break-system-packages pyhwp six

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Install prisma globally to avoid npx downloads
# Copy standalone build to root
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set home to a writable directory for npx/npm cache
ENV HOME=/tmp
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

# Install prisma locally in runner to ensure npx uses it instantly
RUN npm install prisma@6.19.1

COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Ensure the nextjs user owns the app directory
RUN chown -R nextjs:nodejs /app

# Switch to nextjs user at the very end
USER nextjs

# Expose port and start
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use --skip-generate to avoid permission issues with writing to node_modules at runtime
CMD ["/bin/sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && (node server.js || node .next/standalone/server.js)"]
