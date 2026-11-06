.DEFAULT_GOAL := up
.PHONY: up down logs ps check
up down logs ps check:
	$(MAKE) -C ft_transcendence $@
