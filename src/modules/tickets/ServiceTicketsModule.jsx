import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../App';

export default function ServiceTicketsModule() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    clientName: '', location: '', description: '', signType: '',
    priority: 'normal', status: 'pending'
  });

  useEffect(() => {
    const q = query(collection(db, 'serviceTickets'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'serviceTickets'), {
      ...formData,
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    setFormData({ clientName: '', location: '', description: '', signType: '', priority: 'normal', status: 'pending' });
    setShowForm(false);
  };

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, 'serviceTickets', id), { status: newStatus, updatedAt: serverTimestamp() });
  };

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Ordenes de Servicio</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90">
          {showForm ? 'Cancelar' : '+ Nueva Orden'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cliente</label>
              <input type="text" required value={formData.clientName}
                onChange={e => setFormData({...formData, clientName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ubicacion</label>
              <input type="text" required value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de Rotulo</label>
              <select value={formData.signType}
                onChange={e => setFormData({...formData, signType: e.target.value})}
                className="w-full border rounded-lg px-3 py-2">
                <option value="">Seleccionar...</option>
                <option value="channel_letters">Channel Letters</option>
                <option value="monument">Monumento</option>
                <option value="pylon">Pylon</option>
                <option value="banner">Banner</option>
                <option value="vinyl">Vinil</option>
                <option value="neon">Neon/LED</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Prioridad</label>
              <select value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full border rounded-lg px-3 py-2">
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripcion del trabajo</label>
            <textarea required value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" rows="3" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90">
            Crear Orden
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','pending','in_progress','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendientes' : s === 'in_progress' ? 'En Progreso' : s === 'completed' ? 'Completadas' : 'Canceladas'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(ticket => (
          <div key={ticket.id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{ticket.clientName}</h3>
                <p className="text-sm text-gray-500">{ticket.location}</p>
                <p className="text-sm mt-1">{ticket.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status] || ''}`}>
                  {ticket.status === 'pending' ? 'Pendiente' : ticket.status === 'in_progress' ? 'En Progreso' : ticket.status === 'completed' ? 'Completada' : 'Cancelada'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[ticket.priority] || ''}`}>
                  {ticket.priority === 'low' ? 'Baja' : ticket.priority === 'normal' ? 'Normal' : ticket.priority === 'high' ? 'Alta' : 'Urgente'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {ticket.status !== 'in_progress' && ticket.status !== 'completed' && (
                <button onClick={() => updateStatus(ticket.id, 'in_progress')}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">Iniciar</button>
              )}
              {ticket.status === 'in_progress' && (
                <button onClick={() => updateStatus(ticket.id, 'completed')}
                  className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-lg">Completar</button>
              )}
              {ticket.status !== 'cancelled' && ticket.status !== 'completed' && (
                <button onClick={() => updateStatus(ticket.id, 'cancelled')}
                  className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg">Cancelar</button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No hay ordenes de servicio</p>
        )}
      </div>
    </div>
  );
}
