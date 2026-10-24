# Run from the repository root or from ft_transcendence/.
.DEFAULT_GOAL := up
.PHONY: up down logs ps check
up down logs ps check:
	$(MAKE) -C ft_transcendence $@
