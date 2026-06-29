import { setupWorker } from 'msw/browser';
import { appEnv } from '../../app/config/env';
import { handlers } from './handlers';

const worker = setupWorker(...handlers);

let workerStarted = false;

export async function startMockWorker() {
  if (!appEnv.enableMsw || workerStarted || typeof window === 'undefined') {
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    workerStarted = true;
  } catch (error) {
    console.warn('MSW worker could not be started.', error);
  }
}
