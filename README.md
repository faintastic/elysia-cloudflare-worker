# Discord Interactions

A modern Discord bot framework built with [Elysia](https://elysiajs.com/) and TypeScript, designed to run on Cloudflare Workers with local development powered by Bun.

## Features

- ⚡ **Fast & Lightweight** - Built on Elysia for optimal performance
- 🌐 **Edge-Ready** - Deploys to Cloudflare Workers for global low-latency
- 🔄 **Dual Loading System** - Dynamic file scanning (local) + static manifest (production)
- 📝 **Type-Safe** - Full TypeScript support with discord-api-types
- 🔧 **Auto-Generation** - Manifest auto-generates from your handler files
- 🎯 **Handler-Based Architecture** - Organize by commands, buttons, modals, and select menus
- 🔌 **WebSocket Support** - Custom WebSocket implementation for real-time features
- 🔐 **Privacy-First** - IP address hashing for client privacy
- 📊 **Logging** - Colored console logging with timestamps

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Node.js](https://nodejs.org/) >= 18 (for Wrangler)
- [Cloudflare Workers account](https://workers.cloudflare.com/) (for deployment)
- [Discord Application](https://discord.com/developers/applications)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd discord-interactions
bun install
```

### 2. Configure Your Bot

Update `src/app.ts` with your bot credentials:

```typescript
export const customBots = {
  "YOUR_CLIENT_ID": {
    clientId: "YOUR_CLIENT_ID",
    botToken: "YOUR_BOT_TOKEN",
    botSecret: "YOUR_CLIENT_SECRET",
    publicKey: "YOUR_PUBLIC_KEY"
  }
}
```

### 3. Run Locally

```bash
bun run dev
# Server starts at http://localhost:3000
```

#### Testing with Cloudflare Tunnel (Development)

To test Discord interactions locally without deploying, use Cloudflare's free tunnel service:

```bash
# In a separate terminal, expose your local server
cloudflared tunnel --url http://localhost:3000
```

This will give you a public URL like `https://random-name.trycloudflare.com` that you can use as your Discord Interactions Endpoint URL during development.

**Note:** The tunnel URL changes each time you restart `cloudflared`. You'll need to update the Discord Developer Portal with the new URL each time.

### 4. Deploy to Cloudflare Workers

```bash
bun run deploy
```

## Project Structure

```
discord-interactions/
├── src/
│   ├── app.ts              # Main Elysia app configuration
│   ├── index.ts            # Cloudflare Workers entry point
│   ├── commands/           # Slash command handlers
│   │   ├── ping.ts
│   │   ├── greet.ts
│   │   └── ...
│   ├── buttons/            # Button interaction handlers
│   ├── modals/             # Modal submit handlers
│   ├── select-menus/       # Select menu handlers
│   ├── lib/
│   │   ├── discord/
│   │   │   ├── loader.ts   # Handler loader (dynamic/static)
│   │   │   └── manifest.ts # Auto-generated handler manifest
│   │   ├── log.ts          # Logging utility
│   │   ├── ws.ts           # WebSocket handler
│   │   └── respond.ts      # Response helpers
│   └── routes/
│       └── main.ts         # Discord interaction endpoint
├── scripts/
│   └── generate-manifest.ts # Manifest generator
├── wrangler.toml           # Cloudflare Workers config
└── package.json
```

## Creating Handlers

### Command Handler

Create a file in `src/commands/`:

```typescript
// src/commands/hello.ts
import { InteractionResponseType } from 'discord-api-types/v10';
import type { APIApplicationCommandInteraction } from 'discord-api-types/v10';
import type { Command } from '../lib/discord/loader';

export default {
  name: "hello",
  description: "Says hello!",
  
  async execute(interaction: APIApplicationCommandInteraction) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `Hello, ${interaction.member?.user.username}!`
      }
    };
  }
} satisfies Command;
```

### Button Handler

Create a file in `src/buttons/`:

```typescript
// src/buttons/confirm.ts
import { InteractionResponseType } from 'discord-api-types/v10';
import type { APIMessageComponentButtonInteraction } from 'discord-api-types/v10';
import type { Button } from '../lib/discord/loader';

export default {
  customId: "confirm",
  
  async execute(interaction: APIMessageComponentButtonInteraction) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "Confirmed! ✅"
      }
    };
  }
} satisfies Button;
```

### Modal Handler

Create a file in `src/modals/`:

```typescript
// src/modals/feedback.ts
import { InteractionResponseType } from 'discord-api-types/v10';
import type { APIModalSubmitInteraction } from 'discord-api-types/v10';
import type { Modal } from '../lib/discord/loader';

export default {
  customId: "feedback",
  
  async execute(interaction: APIModalSubmitInteraction) {
    const feedback = interaction.data.components[0].components[0].value;
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `Thanks for your feedback: ${feedback}`
      }
    };
  }
} satisfies Modal;
```

### Select Menu Handler

Create a file in `src/select-menus/`:

```typescript
// src/select-menus/roles.ts
import { InteractionResponseType } from 'discord-api-types/v10';
import type { APIMessageComponentSelectMenuInteraction } from 'discord-api-types/v10';
import type { SelectMenu } from '../lib/discord/loader';

export default {
  customId: "roles",
  
  async execute(interaction: APIMessageComponentSelectMenuInteraction) {
    const selected = interaction.data.values.join(', ');
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `You selected: ${selected}`
      }
    };
  }
} satisfies SelectMenu;
```

## How It Works

### Dual Loading System

The bot uses two different loading mechanisms:

#### 🔧 **Local Development** (Dynamic Loading)
- Uses `Bun.Glob` to scan handler directories at runtime
- Automatically picks up new files without rebuilding
- Fast iteration during development

#### 🚀 **Production** (Static Manifest)
- Uses pre-generated `manifest.ts` with explicit imports
- Cloudflare Workers don't support file system access
- Manifest auto-generates before deployment

### Automatic Manifest Generation

When you run `bun run deploy`, the manifest generator:

1. Scans all handler directories
2. Generates import statements for each file
3. Exports handlers in organized arrays
4. Handles naming conflicts automatically
5. Deploys to Cloudflare Workers

**You never need to manually edit the manifest!** 🎉

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start local development server with hot reload |
| `bun run generate-manifest` | Manually regenerate the handler manifest |
| `bun run deploy` | Generate manifest and deploy to Cloudflare Workers |
| `bun run deploy:check` | Preview deployment without publishing |

## Configuration

### Cloudflare Workers

Edit `wrangler.toml`:

```toml
name = "discord-interactions"
compatibility_date = "2025-05-16"
compatibility_flags = ["nodejs_compat"]

[observability]
enabled = true
head_sampling_rate = 1

# Add environment variables
[vars]
MY_VAR = "my-value"

# Add KV namespaces
[[kv_namespaces]]
binding = "MY_KV"
id = "your-kv-namespace-id"
```

### Discord Interaction Endpoint

**Important:** Before Discord will accept your interactions endpoint URL, you must first add your bot credentials to `src/app.ts` (Client ID, Public Key, Client Secret, and Bot Token). Discord validates the endpoint by sending a test request, which requires your public key for signature verification.

After deployment and configuring your bot credentials, configure your Discord application:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to "General Information"
4. Set **Interactions Endpoint URL** to:
   - **Production:** `https://your-worker.your-subdomain.workers.dev/interactions`
   - **Development (Cloudflare Tunnel):** `https://your-tunnel-url.trycloudflare.com/interactions`
5. Discord will send a test request to verify the endpoint - this will only succeed if your bot credentials are correctly configured in the code

## Environment Detection

The loader automatically detects the environment:

```typescript
if (typeof Bun === 'undefined') {
  // Running in Cloudflare Workers → use static manifest
  return this.loadFromManifest();
} else {
  // Running locally with Bun → use dynamic file scanning
  return this.loadAll();
}
```

## Logging

Built-in colored console logging:

```typescript
import log from './lib/log';

log.info('Information message');
log.warn('Warning message');
log.error('Error message');
log.success('Success message');
```

## Type Safety

Full TypeScript support with discord-api-types:

```typescript
import type { 
  APIApplicationCommandInteraction,
  APIMessageComponentButtonInteraction,
  APIModalSubmitInteraction
} from 'discord-api-types/v10';
```

## Troubleshooting

### `import.meta.glob is not a function`

This happens when running with Bun. The code now uses `Bun.Glob` for local development and falls back to the static manifest for Cloudflare Workers.

### Handlers not loading in production

Make sure to run `bun run deploy` (not just `wrangler deploy`). This ensures the manifest is regenerated before deployment.

### 401 Unauthorized from Discord

Check that:
- Your bot's public key in `src/app.ts` matches Discord Developer Portal
- The interaction endpoint URL is correctly configured in Discord
- Request signature verification is working

### WebSocket Connection Issues

1. Ensure your development server is running with `bun run dev`
2. Check that the WebSocket path matches a defined route
3. Verify that event listeners are attached before connection acceptance

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests (if available): `bun test`
5. Commit: `git commit -am 'Add feature'`
6. Push: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Discord Developer Portal](https://discord.com/developers/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Elysia Documentation](https://elysiajs.com/)
- [Bun Documentation](https://bun.sh/docs)

## Support

- 📖 Check the [scripts/README.md](scripts/README.md) for tooling documentation
- 🐛 Report issues on GitHub

---

Built with ❤️ using Elysia, TypeScript, and Cloudflare Workers