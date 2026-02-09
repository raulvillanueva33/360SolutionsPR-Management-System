import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { subscribeToAuth } from './firebase';
import Layout from './components/Layout';
import LoginPage from './modules/auth/LoginPage';
import Dashboard from './modules/dashboard/Dashboard';
import PatrolModule from './modules/patrol/PatrolModule';
import ServiceTicketsModule from './modules/tickets/ServiceTicketsModule';
import EmployeesModule from './modules/employees/EmployeesModule';
import DispatchCalendar from './modules/dispatch/DispatchCalendar';
import PermitsModule from './modules/permits/PermitsModule';

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-light text-lg">Cargando 360SolutionsPR...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute user={user}><Layout user={user} /></PrivateRoute>}>
        <Route index element={<Dashboard user={user} />} />
        <Route path="patrol" element={<PatrolModule user={user} />} />
        <Route path="tickets" element={<ServiceTicketsModule user={user} />} />
        <Route path="employees" element={<EmployeesModule user={user} />} />
        <Route path="dispatch" element={<DispatchCalendar user={user} />} />
        <Route path="permits" element={<PermitsModule user={user} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
