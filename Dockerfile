FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./

# Force cache invalidation by running a harmless echo or reordering
RUN echo "Installing dependencies..." && npm install

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

# Install Python and hwp5html for HWP conversion
# py3-lxml is required to avoid compiling lxml from source which takes long and often fails on Alpine
RUN apk add --no-cache python3 py3-pip py3-lxml libxml2 libxslt
# Install hwp5html (using system lxml to save time)
RUN pip3 install --no-cache-dir --break-system-packages hwp5html

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

RUN npm install -g prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

CMD ["/bin/sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
