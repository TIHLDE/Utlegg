FROM node:current-alpine AS builder

RUN apk add openssl

RUN npm install -g pnpm

WORKDIR /build

COPY . .

RUN pnpm i --frozen-lockfile

ARG SKIP_ENV_VALIDATION=1

RUN pnpm build

FROM node:current-alpine AS runner

WORKDIR /app

RUN apk add openssl

COPY --from=builder /build/.next/standalone ./
RUN rm -f .env
COPY --from=builder /build/.next/static ./.next/static/
# UNCOMMENT IF YOU ARE USING PRISMA
#COPY --from=builder /build/prisma ./prisma/
COPY --from=builder /build/public ./public/

EXPOSE 3000
ENV PORT=3000

ENV NEXT_TELEMETRY_DISABLED=1

CMD [ "node", "server.js" ]
