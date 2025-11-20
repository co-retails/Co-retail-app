
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const manualChunks = (id: string) => {
  const normalizedId = id.replace(/\\/g, '/');

  if (normalizedId.includes('node_modules')) {
    // Keep React and React-DOM together to prevent loading order issues
    if (
      normalizedId.includes('/react/') ||
      normalizedId.includes('/react-dom/') ||
      normalizedId.includes('/scheduler/')
    ) {
      return 'vendor-react';
    }
    
    // Ensure React is loaded before other dependencies that need it
    if (normalizedId.includes('react/jsx-runtime') || normalizedId.includes('react/jsx-dev-runtime')) {
      return 'vendor-react';
    }

    if (normalizedId.includes('@radix-ui')) {
      return 'vendor-radix';
    }

    if (normalizedId.includes('recharts')) {
      return 'vendor-recharts';
    }

    if (normalizedId.includes('embla-carousel')) {
      return 'vendor-embla';
    }

    if (normalizedId.includes('lucide-react')) {
      return 'vendor-icons';
    }

    if (normalizedId.includes('sonner')) {
      return 'vendor-notifications';
    }

    return 'vendor';
  }

  if (normalizedId.includes('/components/Showroom')) {
    return 'feature-showroom';
  }

  if (normalizedId.includes('/components/Buyer')) {
    return 'feature-buyer';
  }

  if (
    normalizedId.includes('/components/Partner') ||
    normalizedId.includes('/components/Portal')
  ) {
    return 'feature-partner';
  }

  if (
    normalizedId.includes('/components/Delivery') ||
    normalizedId.includes('/components/Return') ||
    normalizedId.includes('/components/Shipping') ||
    normalizedId.includes('/components/Stock')
  ) {
    return 'feature-operations';
  }

  return undefined;
};

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'vaul@1.1.2': 'vaul',
      'sonner@2.0.3': 'sonner',
      'recharts@2.15.2': 'recharts',
      'react-resizable-panels@2.1.7': 'react-resizable-panels',
      'react-hook-form@7.55.0': 'react-hook-form',
      'react-day-picker@8.10.1': 'react-day-picker',
      'next-themes@0.4.6': 'next-themes',
      'lucide-react@0.487.0': 'lucide-react',
      'input-otp@1.4.2': 'input-otp',
      'figma:asset/d67b89ccdf219dc9d4490a242209ba107113e9ee.png': path.resolve(
        __dirname,
        './src/assets/d67b89ccdf219dc9d4490a242209ba107113e9ee.png',
      ),
      'figma:asset/bccf40ef0d51ade359900027c9bd416d09e9658d.png': path.resolve(
        __dirname,
        './src/assets/bccf40ef0d51ade359900027c9bd416d09e9658d.png',
      ),
      'figma:asset/b3d1ddd5e2f45e0b9bc268fdce137872ef362a36.png': path.resolve(
        __dirname,
        './src/assets/b3d1ddd5e2f45e0b9bc268fdce137872ef362a36.png',
      ),
      'figma:asset/a3d724d72dde4a46e02daa7ef171eff42c4ef9ba.png': path.resolve(
        __dirname,
        './src/assets/a3d724d72dde4a46e02daa7ef171eff42c4ef9ba.png',
      ),
      'figma:asset/91aae0881b4de478c432bd663b59bca268df6dec.png': path.resolve(
        __dirname,
        './src/assets/91aae0881b4de478c432bd663b59bca268df6dec.png',
      ),
      'figma:asset/23b3e3e209f94ca75138170170d2cb9e94d43304.png': path.resolve(
        __dirname,
        './src/assets/23b3e3e209f94ca75138170170d2cb9e94d43304.png',
      ),
      'embla-carousel-react@8.6.0': 'embla-carousel-react',
      'cmdk@1.1.1': 'cmdk',
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
      '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
      '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
      '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
      '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
      '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
      '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
      '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
      '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
      '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
      '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
      '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
      '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
      '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
      '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
      '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
      '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
      '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
      '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
      '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
      '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks,
        // Ensure proper chunk ordering - React must load first
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'vendor-react') {
            return 'assets/vendor-react-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});