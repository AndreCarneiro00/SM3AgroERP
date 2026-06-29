import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AppRoutes } from './routes';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}
