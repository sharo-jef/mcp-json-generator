# MCP JSON Generator

> [!Important]
> This project is written by AI agent.

A modern web application for managing and generating JSON configurations for [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers.

## Features

- 🔧 **MCP Server Management** - Browse and manage MCP server configurations
- 📋 **Multiple Editor Support** - Generate configs for VS Code, Cline, Claude Desktop, and Zed
- 🎨 **Dark/Light Mode** - Built-in theme switcher
- 💾 **Import/Export** - Save and share your custom MCP server configurations
- 📊 **Interactive Table** - Filter, sort, and search through available servers
- 🎯 **Preview Mode** - View generated JSON configurations before copying
- ⌨️ **Keyboard Shortcuts** - Quick access via Cmd/Ctrl+Shift+P

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/sharo-jef/mcp-json-generator.git
cd mcp-json-generator

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Build

Build the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

### Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check code quality
npm run lint

# Format code
npm run format
```

## Usage

1. **Select Editor** - Choose your target editor from the top navigation bar
2. **Browse Servers** - View available MCP servers in the table
3. **Toggle Servers** - Click on servers to include/exclude them from the configuration
4. **Add Custom Servers** - Use the "Add Custom" button to create your own MCP server configurations
5. **Copy Configuration** - Use Cmd/Ctrl+Shift+P or the copy button to copy the JSON configuration
6. **Import/Export** - Save your custom servers and import them later

## Tech Stack

- **Framework** - [Next.js 16](https://nextjs.org/) with React 19
- **Styling** - [Tailwind CSS](https://tailwindcss.com/)
- **UI Components** - [shadcn/ui](https://ui.shadcn.com/)
- **Code Quality** - [Biome](https://biomejs.dev/)
- **TypeScript** - Full type safety
- **React Compiler** - Optimized performance

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Custom components
├── contexts/        # React contexts
├── data/            # Static data (MCP servers)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

## License

MIT
