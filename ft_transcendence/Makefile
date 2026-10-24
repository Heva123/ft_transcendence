.DEFAULT_GOAL := up
COMPOSE = docker compose --env-file .env -f compose.yml
.PHONY: init up down logs ps check
init:
	@sh docker/init-env.sh
up: init
	$(COMPOSE) build backend web migrate
	$(COMPOSE) up -d --wait --wait-timeout 180 database
	$(COMPOSE) run --rm migrate
	$(COMPOSE) up -d --wait --wait-timeout 180 backend web
	@echo "Open https://localhost:$$(sed -n 's/^HTTPS_PORT=//p' .env)"
	@echo "Local certificate: see DOCKER.md for the browser trust step."
down: init
	$(COMPOSE) down
logs: init
	$(COMPOSE) logs --tail=100 -f
ps: init
	$(COMPOSE) ps
check: init
	@sh docker/check.sh
