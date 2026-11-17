import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import SearchDialog from './SearchDialog';
import SiteBackground from './SiteBackground';
import { Sidebar } from './Sidebar';

/** 文档/组件页带侧栏，首页等页面占满宽度 */
export default function Layout({ children }) {
  const { pathname } = useLocation();
  const withSidebar = pathname.startsWith('/c/') || pathname === '/c';
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = event => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      setSearchOpen(open => !open);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <SiteBackground />

      <div className="app-layer">
        <Navbar onOpenSearch={() => setSearchOpen(true)} />

        {withSidebar ? (
          <div className="sn-shell">
            <Sidebar />
            <main className="sn-main">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
