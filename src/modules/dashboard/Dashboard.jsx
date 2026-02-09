import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({ patrols: 0, tickets: 0, employees: 0 });
  const [recentPatrols, setRecentPatrols] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const patrolSnap = await getDocs(collection(db, 'patrolEntries'));
        const ticketSnap = await getDocs(collection(db, 'serviceTickets'));
        const empSnap = await getDocs(collection(db, 'employees'));
        setStats({ patrols: patrolSnap.size, tickets: ticketSnap.size, employees: empSnap.size });
        const q = query(collection(db, 'patrolEntries'), orderBy('createdAt', 'desc'), limit(5));
        const recent = await getDocs(q);
        setRecentPatrols(recent.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
    };
    loadData();
  }, []);

  const cards = [
    { label: 'Prospectos/Fallas', value: stats.patrols, color: 'bg-primary' },
    { label: 'Tickets Activos', value: stats.tickets, color: 'bg-secondary' },
    { label: 'Empleados', value: stats.employees, color: 'bg-dark' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-6">Dashboard</h1>
      <p className="text-gray-500 mb-8">Bienvenido, {user?.displayName || 'Usuario'}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`${c.color} text-white rounded-xl p-6 shadow-lg`}>
            <p className="text-sm opacity-80">{c.label}</p>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-dark mb-4">Reportes Recientes</h2>
        {recentPatrols.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay reportes aun.</p>
        ) : (
          <div className="space-y-3">
            {recentPatrols.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${p.entryType === 'prospect' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                    {p.entryType === 'prospect' ? 'Prospecto' : 'Falla'}
                  </span>
                  <p className="text-sm text-dark mt-1">{p.signDescription || 'Sin descripcion'}</p>
                </div>
                <span className="text-xs text-gray-400">{p.clientName || 'N/A'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
