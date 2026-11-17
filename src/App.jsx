import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './site/Layout';
import { ColorModeProvider } from './theme/color-mode';
import { firstCategory } from './library/registry';
import HomePage from './site/pages/HomePage';
import CategoryPage from './site/pages/CategoryPage';
import ComponentPage from './site/pages/ComponentPage';
import DocsPage from './site/pages/DocsPage';
import ToolsPage from './site/pages/ToolsPage';
import NotFoundPage from './site/pages/NotFoundPage';

export default function App() {
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/c" element={<Navigate to={`/c/${firstCategory?.slug ?? ''}`} replace />} />
            <Route path="/c/:category" element={<CategoryPage />} />
            <Route path="/c/:category/:component" element={<ComponentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ColorModeProvider>
  );
}
