FROM node:20-alpine AS dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS runtime
ENV NODE_ENV=production \
    PORT=5000 \
    HOST=0.0.0.0
WORKDIR /app/backend
RUN addgroup -S queueit && adduser -S queueit -G queueit
COPY --from=dependencies --chown=queueit:queueit /app/backend/node_modules ./node_modules
COPY --chown=queueit:queueit backend/package*.json ./
COPY --chown=queueit:queueit backend/src ./src
COPY --chown=queueit:queueit backend/uploads ./uploads
COPY --chown=queueit:queueit docs /app/docs
RUN mkdir -p logs && chown -R queueit:queueit /app/backend/logs /app/backend/uploads /app/docs
USER queueit
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/v1/live').then((r) => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1));"
CMD ["npm", "start"]
