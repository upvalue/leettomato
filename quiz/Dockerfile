# Stage 1: Build frontend
FROM node:25-slim@sha256:ec5e27581e578ec3d25b81f4d9f9088fc2efa3087a78d1bf278f051db67c5b5b AS frontend
RUN npm install -g pnpm
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm run build

# Stage 2: Build database
FROM python:3.13-slim@sha256:51e1a0a317fdb6e170dc791bbeae63fac5272c82f43958ef74a34e170c6f8b18 AS dbbuilder
WORKDIR /app
COPY scripts/ scripts/
RUN python3 scripts/build_db.py --download --db ./problems.db

# Stage 3: Build Go binary
FROM golang:1.25-bookworm@sha256:2f768d462dbffbb0f0b3a5171009f162945b086f326e0b2a8fd5d29c3219ff14 AS gobuilder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY main.go .
COPY internal/ internal/
RUN CGO_ENABLED=0 go build -o quiz .

# Stage 4: Runtime
FROM debian:bookworm-slim@sha256:56ff6d36d4eb3db13a741b342ec466f121480b5edded42e4b7ee850ce7a418ee
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=gobuilder /app/quiz .
COPY --from=frontend /app/frontend/dist ./frontend/dist
COPY --from=dbbuilder /app/problems.db .
ENV STATIC_DIR=./frontend/dist
ENV DB_PATH=./problems.db
EXPOSE 8080
CMD ["./quiz", "server"]
