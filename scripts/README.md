# Scripts

Utility scripts for Discord Interactions bot development and deployment.

## generate-manifest.ts

Automatically generates `src/lib/discord/manifest.ts` by scanning handler directories.

### What it does:
- Scans `src/commands/`, `src/buttons/`, `src/modals/`, `src/select-menus/`
- Generates import statements for all handler files
- Creates export arrays for each handler type
- Handles naming conflicts (e.g., `delete.ts` becomes `deleteButton`)
- Converts file names to valid JavaScript identifiers

### Usage:

```bash
# Run manually
bun run generate-manifest

# Or use the script directly
./scripts/generate-manifest.ts

# Or it runs automatically before deployment
bun run deploy  # runs generate-manifest first
```

### Output:
```
🔍 Scanning handler directories...

Found handlers:
  📋 Commands: 5
  🔘 Buttons: 6
  📝 Modals: 3
  📑 Select menus: 4
  ━━━━━━━━━━━━━━━━━━━━
  📦 Total: 18

✍️  Generating manifest.ts...
✅ Successfully generated: /path/to/manifest.ts
```

### Why it's needed:
Cloudflare Workers don't have file system access, so we can't use dynamic imports. This script pre-generates a manifest with all imports at build time.

### Adding new handlers:
1. Create your handler file: `src/commands/my-command.ts`
2. Run `bun run deploy` (manifest regenerates automatically!)

No manual manifest editing required! 🎉