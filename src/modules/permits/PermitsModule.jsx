import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../App';

export default function PermitsModule() {
  const { user } = useAuth();
  const [permits, setPermits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    clientName: '', projectName: '', permitType: 'OGPe',
    location: '', description: '', status: 'draft',
    submissionDate: '', expirationDate: '', permitNumber: '', notes: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'permits'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPermits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'permits'), {
      ...formData,
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    setFormData({
      clientName: '', projectName: '', permitType: 'OGPe',
      location: '', description: '', status: 'draft',
      submissionDate: '', expirationDate: '', permitNumber: '', notes: ''
    });
    setShowForm(false);
  };

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, 'permits', id), {
      status: newStatus, updatedAt: serverTimestamp()
    });
  };

  const filtered = filter === 'all' ? permits : permits.filter(p => p.status === filter);

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
    submitted: { label: 'Sometido', color: 'bg-blue-100 text-blue-700' },
    in_review: { label: 'En Revision', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Aprobado', color: 'bg-green-100 text-green-700' },
    denied: { label: 'Denegado', color: 'bg-red-100 text-red-700' },
    expired: { label: 'Expirado', color: 'bg-orange-100 text-orange-700' }
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const exp = new Date(date);
    const now = new Date();
    const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Permisos (OGPe / ARPE)</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90">
          {showForm ? 'Cancelar' : '+ Nuevo Permiso'}
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
              <label className="block text-sm text-gray-600 mb-1">Nombre del proyecto</label>
              <input type="text" required value={formData.projectName}
                onChange={e => setFormData({...formData, projectName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de permiso</label>
              <select value={formData.permitType}
                onChange={e => setFormData({...formData, permitType: e.target.value})}
                className="w-full border rounded-lg px-3 py-2">
                <option value="OGPe">OGPe - Oficina de Gerencia de Permisos</option>
                <option value="ARPE">ARPE - Junta de Planificacion</option>
                <option value="Municipal">Permiso Municipal</option>
                <option value="DTOP">DTOP - Carreteras</option>
                <option value="Other">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ubicacion</label>
              <input type="text" value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Numero de permiso</label>
              <input type="text" value={formData.permitNumber}
                onChange={e => setFormData({...formData, permitNumber: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" placeholder="Si aplica" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha de sometimiento</label>
              <input type="date" value={formData.submissionDate}
                onChange={e => setFormData({...formData, submissionDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha de expiracion</label>
              <input type="date" value={formData.expirationDate}
                onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripcion</label>
            <textarea value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" rows="2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notas</label>
            <textarea value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" rows="2" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">
            Guardar Permiso
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','draft','submitted','in_review','approved','denied','expired'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s === 'all' ? 'Todos' : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(permit => (
          <div key={permit.id} className={`bg-white p-4 rounded-xl shadow ${isExpiringSoon(permit.expirationDate) ? 'border-l-4 border-orange-500' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-dark text-white rounded text-xs font-medium">
                    {permit.permitType}
                  </span>
                  <h3 className="font-semibold text-lg">{permit.projectName}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">{permit.clientName} - {permit.location}</p>
                {permit.permitNumber && (
                  <p className="text-xs text-gray-400 mt-1">No. {permit.permitNumber}</p>
                )}
                {permit.description && (
                  <p className="text-sm mt-2">{permit.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[permit.status]?.color || ''}`}>
                  {statusConfig[permit.status]?.label || permit.status}
                </span>
                {isExpiringSoon(permit.expirationDate) && (
                  <span className="text-xs text-orange-600 font-medium">Expira pronto!</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              {permit.submissionDate && <span>Sometido: {permit.submissionDate}</span>}
              {permit.expirationDate && <span>Expira: {permit.expirationDate}</span>}
            </div>
            <div className="flex gap-2 mt-3">
              {permit.status === 'draft' && (
                <button onClick={() => updateStatus(permit.id, 'submitted')}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">Marcar Sometido</button>
              )}
              {permit.status === 'submitted' && (
                <button onClick={() => updateStatus(permit.id, 'in_review')}
                  className="text-xs bg-yellow-50 text-yellow-600 px-3 py-1 rounded-lg">En Revision</button>
              )}
              {permit.status === 'in_review' && (
                <>
                  <button onClick={() => updateStatus(permit.id, 'approved')}
                    className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-lg">Aprobar</button>
                  <button onClick={() => updateStatus(permit.id, 'denied')}
                    className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg">Denegar</button>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No hay permisos registrados</p>
        )}
      </div>
    </div>
  );
}
