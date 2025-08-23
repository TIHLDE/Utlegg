.PHONY: prod
prod:
	docker build -t utlegg.tihlde.org .
	- docker rm -f utlegg.tihlde.org
	docker run --env-file .env -p 2000:3000 --name utlegg.tihlde.org --restart unless-stopped -d utlegg.tihlde.org

