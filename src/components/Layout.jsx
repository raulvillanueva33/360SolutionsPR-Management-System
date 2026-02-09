import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../firebase';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3' },
  { to: '/patrol', label: 'Patrullero', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/tickets', label: 'Tickets', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
  { to: '/employees', label: 'Empleados', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857' },
  { to: '/dispatch', label: 'Despacho', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/permits', label: 'Permisos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
];

export default function Layout({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="lg:hidden bg-dark text-light px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-light">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-primary">360SolutionsPR</h1>
        <img src={user?.photoURL || ''} alt="" className="w-8 h-8 rounded-full" />
      </header>
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark text-light transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6"><h2 className="text-xl font-bold text-primary">360SolutionsPR</h2><p className="text-xs text-gray-400 mt-1">Management System</p></div>
          <nav className="mt-2 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/10'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <img src={user?.photoURL || ''} alt="" className="w-9 h-9 rounded-full" />
              <div className="truncate"><p className="text-sm font-medium truncate">{user?.displayName}</p><p className="text-xs text-gray-400 truncate">{user?.email}</p></div>
            </div>
            <button onClick={handleLogout} className="w-full text-sm text-secondary hover:text-orange-400">Cerrar sesion</button>
          </div>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 p-4 lg:p-8 min-h-screen"><Outlet /></main>
      </div>
    </div>
  );
}
