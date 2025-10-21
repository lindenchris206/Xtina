# AI Crew Commander Suite - Build & Development Setup

## Build Configuration Files

### Root package.json (Workspace Configuration)
```json
{
  "name": "@crew/ai-commander-suite",
  "version": "1.0.0",
  "private": true,
  "description": "AI Crew Commander Suite - Modular Multi-Agent System",
  "workspaces": [
    "packages/*",
    "packages/plugins/*",
    "packages/plugins/media-editor/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:core\" \"npm run dev:backend\"",
    "dev:core": "cd packages/core && npm run dev",
    "dev:backend": "cd backend && python -m uvicorn main:app --reload --port 8000",
    "build": "npm run build:modules && npm run build:core",
    "build:modules": "npm run build:agents && npm run build:voice && npm run build:avatars && npm run build:backgrounds && npm run build:tasks && npm run build:plugins",
    "build:core": "cd packages/core && npm run build",
    "build:agents": "cd packages/agents && npm run build",
    "build:voice": "cd packages/voice && npm run build",
    "build:avatars": "cd packages/avatars && npm run build",
    "build:backgrounds": "cd packages/backgrounds && npm run build",
    "build:tasks": "cd packages/tasks && npm run build",
    "build:plugins": "npm run build:terminal && npm run build:media && npm run build:automation && npm run build:analytics",
    "build:terminal": "cd packages/plugins/terminal && npm run build",
    "build:media": "npm run build:video && npm run build:image && npm run build:pdf",
    "build:video": "cd packages/plugins/media-editor/video && npm run build",
    "build:image": "cd packages/plugins/media-editor/image && npm run build",
    "build:pdf": "cd packages/plugins/media-editor/pdf && npm run build",
    "build:automation": "cd packages/plugins/automation && npm run build",
    "build:analytics": "cd packages/plugins/analytics && npm run build",
    "test": "npm run test:core && npm run test:modules",
    "test:core": "cd packages/core && npm test",
    "test:modules": "npm run test:agents && npm run test:voice",
    "test:agents": "cd packages/agents && npm test",
    "test:voice": "cd packages/voice && npm test",
    "lint": "eslint packages/*/src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "clean": "rimraf packages/*/dist packages/*/node_modules/.cache",
    "setup": "npm install && npm run setup:env && npm run setup:backend",
    "setup:env": "cp .env.example .env",
    "setup:backend": "cd backend && pip install -r requirements.txt",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up",
    "docker:prod": "docker-compose -f docker-compose.yml up",
    "create-module": "node scripts/create-module.js"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "concurrently": "^8.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.0.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Vite Base Configuration (config/vite.config.base.ts)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export const createViteConfig = (options: {
  entry: string;
  name: string;
  external?: string[];
  globals?: Record<string, string>;
}) => {
  return defineConfig({
    plugins: [
      react(),
      dts({
        insertTypesEntry: true,
      }),
    ],
    build: {
      lib: {
        entry: resolve(process.cwd(), options.entry),
        name: options.name,
        formats: ['es', 'umd'],
        fileName: (format) => `index.${format}.js`,
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@crew/core',
          '@crew/shared',
          ...(options.external || [])
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
            '@crew/core': 'CrewCore',
            '@crew/shared': 'CrewShared',
            ...(options.globals || {})
          },
        },
      },
      sourcemap: true,
      target: 'esnext',
      minify: 'esbuild',
    },
    resolve: {
      alias: {
        '@': resolve(process.cwd(), './src'),
        '@crew/core': resolve(process.cwd(), '../../core/src'),
        '@crew/shared': resolve(process.cwd(), '../../shared/src'),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  });
};
```

### Core Application Vite Config (packages/core/vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@crew/shared': resolve(__dirname, '../shared/src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'zustand',
      'framer-motion',
      'lucide-react',
      'socket.io-client',
    ],
  },
});
```

### Module-Specific Vite Configs

#### Agents Module (packages/agents/vite.config.ts)
```typescript
import { createViteConfig } from '../../config/vite.config.base';

export default createViteConfig({
  entry: 'src/index.ts',
  name: 'CrewAgents',
  external: ['socket.io-client'],
  globals: {
    'socket.io-client': 'io'
  }
});
```

#### Voice Module (packages/voice/vite.config.ts)
```typescript
import { createViteConfig } from '../../config/vite.config.base';

export default createViteConfig({
  entry: 'src/index.ts',
  name: 'CrewVoice'
});
```

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@crew/core": ["./packages/core/src"],
      "@crew/core/*": ["./packages/core/src/*"],
      "@crew/shared": ["./packages/shared/src"],
      "@crew/shared/*": ["./packages/shared/src/*"],
      "@crew/agents": ["./packages/agents/src"],
      "@crew/voice": ["./packages/voice/src"],
      "@crew/avatars": ["./packages/avatars/src"],
      "@crew/backgrounds": ["./packages/backgrounds/src"],
      "@crew/tasks": ["./packages/tasks/src"],
      "@crew/plugins/terminal": ["./packages/plugins/terminal/src"],
      "@crew/plugins/media-editor/video": ["./packages/plugins/media-editor/video/src"],
      "@crew/plugins/media-editor/image": ["./packages/plugins/media-editor/image/src"],
      "@crew/plugins/media-editor/pdf": ["./packages/plugins/media-editor/pdf/src"],
      "@crew/plugins/automation": ["./packages/plugins/automation/src"],
      "@crew/plugins/analytics": ["./packages/plugins/analytics/src"]
    }
  },
  "include": [
    "packages/*/src/**/*",
    "backend/**/*.py"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/shared" },
    { "path": "./packages/agents" },
    { "path": "./packages/voice" },
    { "path": "./packages/avatars" },
    { "path": "./packages/backgrounds" },
    { "path": "./packages/tasks" }
  ]
}
```

### Tailwind Configuration (config/tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./packages/*/src/**/*.{js,ts,jsx,tsx}",
    "./packages/*/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk color scheme
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#4EC5FF', // Primary blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        violet: {
          500: '#AE71FF',
          600: '#9333EA',
        },
        accent: {
          silver: '#E2E8F0',
          pink: '#FF6B9D',
        },
        cyber: {
          dark: '#0A0E1A',
          slate: '#1E293B',
          blue: '#4EC5FF',
          purple: '#9333EA',
          violet: '#AE71FF',
          pink: '#FF6B9D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        glow: {
          from: {
            'text-shadow': '0 0 20px #4EC5FF, 0 0 30px #4EC5FF, 0 0 40px #4EC5FF',
          },
          to: {
            'text-shadow': '0 0 10px #4EC5FF, 0 0 20px #4EC5FF, 0 0 30px #4EC5FF',
          },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(78, 197, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(78, 197, 255, 0.1) 1px, transparent 1px)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(78, 197, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(78, 197, 255, 0.4)',
        'cyber': '0 0 0 1px rgba(78, 197, 255, 0.2), 0 4px 20px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
};
```

### Development Scripts

#### Create Module Script (scripts/create-module.js)
```javascript
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function createModule(moduleName, moduleType = 'feature') {
  const modulePath = moduleType === 'plugin' 
    ? path.join('packages/plugins', moduleName)
    : path.join('packages', moduleName);

  console.log(`Creating ${moduleType} module: ${moduleName}`);

  // Create directory structure
  await fs.ensureDir(path.join(modulePath, 'src'));
  await fs.ensureDir(path.join(modulePath, 'src/components'));
  await fs.ensureDir(path.join(modulePath, 'src/hooks'));
  await fs.ensureDir(path.join(modulePath, 'src/services'));
  await fs.ensureDir(path.join(modulePath, 'src/types'));

  // Create package.json
  const packageJson = {
    name: `@crew/${moduleName}`,
    version: '1.0.0',
    main: 'dist/index.js',
    module: 'dist/index.es.js',
    types: 'dist/index.d.ts',
    scripts: {
      dev: 'vite build --watch',
      build: 'vite build && tsc --emitDeclarationOnly',
      test: 'vitest',
      lint: 'eslint src --ext .ts,.tsx'
    },
    peerDependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      '@crew/core': '^1.0.0',
      '@crew/shared': '^1.0.0'
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
      vite: '^4.0.0',
      vitest: '^0.34.0',
      typescript: '^5.0.0'
    }
  };

  await fs.writeJSON(path.join(modulePath, 'package.json'), packageJson, { spaces: 2 });

  // Create vite.config.ts
  const viteConfig = `import { createViteConfig } from '../../config/vite.config.base';

export default createViteConfig({
  entry: 'src/index.ts',
  name: 'Crew${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}'
});
`;

  await fs.writeFile(path.join(modulePath, 'vite.config.ts'), viteConfig);

  // Create index.ts
  const indexContent = `// ${moduleName} module exports
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';

// Module definition for registry
export const moduleDefinition = {
  id: '${moduleName}',
  name: '${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Module',
  version: '1.0.0',
  dependencies: ['core'],
  lazy: true
};
`;

  await fs.writeFile(path.join(modulePath, 'src/index.ts'), indexContent);

  // Create basic component
  const componentName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const componentContent = `import React from 'react';

export interface ${componentName}Props {
  // Define props here
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">${componentName} Module</h2>
      <p className="text-gray-600">Module content goes here</p>
    </div>
  );
};
`;

  await fs.writeFile(
    path.join(modulePath, 'src/components', `${componentName}.tsx`),
    componentContent
  );

  // Create components index
  const componentsIndex = `export * from './${componentName}';
`;

  await fs.writeFile(
    path.join(modulePath, 'src/components/index.ts'),
    componentsIndex
  );

  // Create hooks, services, and types index files
  await fs.writeFile(path.join(modulePath, 'src/hooks/index.ts'), '// Export hooks here\n');
  await fs.writeFile(path.join(modulePath, 'src/services/index.ts'), '// Export services here\n');
  await fs.writeFile(path.join(modulePath, 'src/types/index.ts'), '// Export types here\n');

  console.log(`✅ Module ${moduleName} created successfully at ${modulePath}`);
  console.log(`Next steps:`);
  console.log(`1. cd ${modulePath}`);
  console.log(`2. npm install`);
  console.log(`3. npm run dev`);
}

// Get module name from command line
const moduleName = process.argv[2];
const moduleType = process.argv[3] || 'feature';

if (!moduleName) {
  console.error('Usage: npm run create-module <module-name> [plugin]');
  process.exit(1);
}

createModule(moduleName, moduleType);
```

#### Development Setup Script (scripts/dev.sh)
```bash
#!/bin/bash

# AI Crew Commander Suite Development Setup

echo "🚀 Setting up AI Crew Commander Suite development environment..."

# Check Node.js version
node_version=$(node -v)
required_version="v18"

if [[ "$node_version" < "$required_version" ]]; then
    echo "❌ Node.js $required_version or higher is required. Current version: $node_version"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
if [ ! -f .env ]; then
    echo "🔧 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please configure your API keys in .env file"
fi

# Setup backend
echo "🐍 Setting up Python backend..."
if [ ! -d "backend/venv" ]; then
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Build shared dependencies
echo "🔨 Building shared modules..."
cd packages/shared && npm run build && cd ../..
cd packages/core && npm run build && cd ../..

# Start development servers
echo "🚀 Starting development servers..."
npm run dev

echo "✅ Development environment ready!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
```

This comprehensive build system provides a scalable foundation for the modular AI Crew Commander Suite, with proper TypeScript support, module hot-reloading, and development tools.
