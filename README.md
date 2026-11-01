# Yellow Skipper Games Merch Store

Official merch store for [Yellow Skipper Games](https://king-tajin.dev/yellow-skipper-games), powered by Fourthwall. Live at https://store.king-tajin.dev.

## Stack

- React 19, Vite, Tailwind CSS 4
- Cloudflare Pages with Pages Functions (`functions/`)
- Fourthwall Storefront API for products and checkout

The functions proxy the Fourthwall API so the token stays server-side, hide unlisted products, add per-product meta tags and JSON-LD, serve `/sitemap.xml`, and forward order webhooks to Discord. Product share images are generated at build time.

## Environment variables

| Variable                     | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| `FW_TOKEN`                   | Fourthwall storefront token                       |
| `UNLISTED_CODE`              | Code that reveals unlisted products               |
| `UNLISTED_COLLECTION_HANDLE` | Collection holding unlisted products (`unlisted`) |
| `FW_WEBHOOK_SECRET`          | Verifies Fourthwall webhook signatures (optional) |
| `DISCORD_WEBHOOK_URL`        | Receives order notifications (optional)           |
| `DISCORD_WEBHOOK_SECRET`     | Secret sent with Discord notifications (optional) |
