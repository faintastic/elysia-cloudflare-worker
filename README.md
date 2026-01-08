# Elysia Cloudflare Worker

A high-performance web server built with [Elysia](https://elysiajs.com/) and optimized for deployment on Cloudflare Workers, with full WebSocket support for both development and production environments (custom implementation).

## Features

- 🚀 **Fast & Lightweight**: Built with Elysia and Bun for maximum performance
- ☁️ **Cloudflare Workers Ready**: Optimized for serverless deployment
- 🔌 **WebSocket Support**: Custom WebSocket implementation that works in both development and production
- 🔒 **Type-Safe**: Full TypeScript support with strict type checking
- 🎯 **Route Caching**: Optimized WebSocket route matching with O(1) lookups
- 🛡️ **Error Handling**: Comprehensive error handling for both HTTP and WebSocket connections
- 🔐 **Privacy-First**: IP address hashing for client privacy
- 📊 **Logging**: Colored console logging with timestamps

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (included as dependency)
- Cloudflare account (for deployment)

## Installation

```bash
# Install dependencies
bun install
```

## Development

Run the development server with hot-reload:

```bash
bun run dev
```

The server will start on `http://localhost:3000`

## Deployment

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

Or use Wrangler directly:

```bash
wrangler deploy --minify src/index.ts
```

## Project Structure

```
cloudflare-elysia/
├── src/
│   ├── index.ts           # Entry point with WebSocket handling
│   ├── app.ts             # Main Elysia app configuration
│   ├── lib/
│   │   ├── ws.ts          # Custom WebSocket handler
│   │   ├── log.ts         # Colored logging utility
│   │   ├── ip.ts          # IP address detection
│   │   └── respond.ts     # JSON response helper
│   └── routes/
│       └── main.ts        # HTTP route controllers
├── package.json
├── tsconfig.json
└── wrangler.toml         # Cloudflare Workers configuration
```

## API Endpoints

### HTTP Routes

- `GET /` - Returns a welcome message

### WebSocket Routes

- `ws://localhost:3000/ws` - WebSocket echo server
- `ws://localhost:3000/ws2` - Second WebSocket echo server

Example WebSocket connection:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  console.log('Connected');
  ws.send('Hello Server!');
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};
```

## Configuration

### Wrangler Configuration

Edit `wrangler.toml` to configure your Cloudflare Worker:

```toml
name = "elysia-cf-worker"
compatibility_date = "2025-05-16"
compatibility_flags = ["nodejs_compat"]
```

### TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:

- Strict mode enabled
- No unused locals/parameters
- No unchecked indexed access
- Latest ESNext features

## Adding New Routes

### HTTP Routes

Create a new controller in `src/routes/`:

```typescript
import { Elysia } from 'elysia';
import { respond } from '../lib/respond';

const myController = new Elysia()
  .get("/my-route", async () => {
    return respond(200, { message: "Hello!" });
  });

export default myController;
```

Then add it to `src/app.ts`:

```typescript
import myController from './routes/my-controller';

export const app = new Elysia({ aot: false })
  // ... other middleware
  .use(myController);
```

### WebSocket Routes

Add a new route to the `websocketRoutes` array in `src/app.ts`:

```typescript
export const websocketRoutes: WebSocketRoute[] = [
  {
    path: "/my-ws",
    message(ws: CustomWebSocket, message: string | Buffer) {
      // Handle incoming messages
      ws.send(\`Echo: \${message}\`);
    },
    open(ws: CustomWebSocket) {
      // Handle connection open
      ws.send("Welcome!");
    },
    close(_ws: CustomWebSocket, _code: number, _reason: string) {
      // Handle connection close
    },
  },
];
```

## Features Explained

### Custom WebSocket Implementation

Due to limitations with Elysia's WebSocket handling when AOT (Ahead-of-Time compilation) is disabled (required for Cloudflare Workers), this project implements a custom WebSocket handler that works in both environments:

- **Development (Bun)**: Uses Bun's native WebSocket support
- **Production (Cloudflare)**: Uses WebSocketPair API

### Route Caching

WebSocket routes are cached in a Map for O(1) lookups instead of repeatedly searching through arrays, improving performance for high-traffic applications.

### IP Privacy

Client IP addresses are hashed using SHA-1 before logging to protect user privacy while still allowing for traffic analysis.

## Environment Variables

Configure environment variables in `wrangler.toml`:

```toml
[vars]
MY_VAR = "my-variable"
```

Access them in your code through the `env` parameter (when not omitted for development).

## Troubleshooting

### WebSocket Connection Issues

1. Ensure your development server is running with `bun run dev`
2. Check that the WebSocket path matches a defined route
3. Verify that event listeners are attached before connection acceptance

### Deployment Issues

1. Ensure you're logged into Wrangler: `wrangler login`
2. Check your `wrangler.toml` configuration
3. Verify Cloudflare account permissions

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Elysia](https://elysiajs.com/) - Fast and ergonomic web framework
- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless execution environment
