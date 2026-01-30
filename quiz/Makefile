.PHONY: build-db grade dev-backend dev-frontend build deploy

build-db:
	python3 scripts/build_db.py

grade:
	go run . grade $(ARGS)

dev-backend:
	go run . server

dev-frontend:
	cd frontend && pnpm dev

build: build-db
	cd frontend && pnpm install && pnpm run build
	go build -o quiz .

deploy:
	fly deploy
