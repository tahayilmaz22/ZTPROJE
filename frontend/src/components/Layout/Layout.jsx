import Sidebar from '../Sidebar/Sidebar';
import GlobalSearch from '../GlobalSearch/GlobalSearch';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-area">
        <header className="header">
          <div className="header-title">Staj Proje Yönetim Sistemi</div>
          <GlobalSearch />
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
