# Next.js Self Hosting Example

Based on [Nextjs guide](https://nextjs.org/docs/app/guides/self-hosting)

- DB schema with circular dependency
- One entity type for api, db and client
- API requests. Pagination, filtering
- Self-hosted playground (Swagger)

## TODO
- Images optimization
- Auth provider
- CI\CD

## Quickstart

1. **SSH into your server**:

   ```bash
   ssh root@your_server_ip
   ```

2. **Download the deployment script**:

   ```bash
   curl -o ~/deploy.sh https://raw.githubusercontent.com/4-life/hello-world/main/deploy.sh
   ```

3. **Run the deployment script**:

   ```bash
   chmod +x ~/deploy.sh
   ./deploy.sh
   ```
