import { createRoot } from 'react-dom/client';
import App from './app/App';
import { startMockWorker } from './core/msw/browser';

async function bootstrap() {
  await startMockWorker();
  createRoot(document.getElementById('root')!).render(<App />);
}

void bootstrap();
