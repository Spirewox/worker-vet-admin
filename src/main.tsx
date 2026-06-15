import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

async function bootstrap() {
  // Dev-only: serve sample data with no backend when VITE_USE_MOCKS=true.
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { installMockApi } = await import('./app/lib/mockApi');
    installMockApi();
  }

  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

bootstrap();