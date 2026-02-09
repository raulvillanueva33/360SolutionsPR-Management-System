import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../App';

export default function DispatchCalendar() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  });
  const [formData, setFormData] = useState({
    title: '', client: '', location: '', assignedTo: '', date: '', timeSlot: 'morning', notes: ''
  });
  const [draggedJob, setDraggedJob] = useState(null);

  useEffect(() => {
    const unsub1 = onSnapshot(query(collection(db, 'dispatchJobs'), orderBy('date')), (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(query(collection(db, 'employees'), orderBy('name')), (snap) => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const getWeekDays = () => {
    const start = new Date(currentWeekStart + 'T12:00:00');
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'dispatchJobs'), {
      ...formData, status: 'scheduled',
      createdBy: user.uid, createdAt: serverTimestamp()
    });
    setFormData({ title: '', client: '', location: '', assignedTo: '', date: '', timeSlot: 'morning', notes: '' });
    setShowForm(false);
  };

  const handleDrop = async (date, timeSlot) => {
    if (!draggedJob) return;
    await updateDoc(doc(db, 'dispatchJobs', draggedJob.id), { date, timeSlot });
    setDraggedJob(null);
  };

  const deleteJob = async (id) => {
    if (confirm('Eliminar este trabajo?')) {
      await deleteDoc(doc(db, 'dispatchJobs', id));
    }
  };

  const navigateWeek = (direction) => {
    const d = new Date(currentWeekStart + 'T12:00:00');
    d.setDate(d.getDate() + (direction * 7));
    setCurrentWeekStart(d.toISOString().split('T')[0]);
  };

  const weekDays = getWeekDays();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const timeSlots = [
    { key: 'morning', label: 'Manana (6AM-12PM)' },
    { key: 'afternoon', label: 'Tarde (12PM-6PM)' },
    { key: 'evening', label: 'Noche (6PM-12AM)' }
  ];

  const slotColors = {
    morning: 'bg-yellow-50 border-yellow-200',
    afternoon: 'bg-blue-50 border-blue-200',
    evening: 'bg-purple-50 border-purple-200'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Calendario / Despacho</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90">
          {showForm ? 'Cancelar' : '+ Nuevo Trabajo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Titulo del trabajo</label>
              <input type="text" required value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cliente</label>
              <input type="text" required value={formData.client}
                onChange={e => setFormData({...formData, client: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ubicacion</label>
              <input type="text" value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Asignar a</label>
              <select value={formData.assignedTo}
                onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                className="w-full border rounded-lg px-3 py-2">
                <option value="">Sin asignar</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input type="date" required value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Turno</label>
              <select value={formData.timeSlot}
                onChange={e => setFormData({...formData, timeSlot: e.target.value})}
                className="w-full border rounded-lg px-3 py-2">
                <option value="morning">Manana</option>
                <option value="afternoon">Tarde</option>
                <option value="evening">Noche</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notas</label>
            <textarea value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" rows="2" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">
            Programar Trabajo
          </button>
        </form>
      )}

      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigateWeek(-1)} className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
          &larr; Semana anterior
        </button>
        <span className="font-medium text-dark">
          {new Date(weekDays[0] + 'T12:00:00').toLocaleDateString('es-PR', { month: 'long', day: 'numeric' })} - {new Date(weekDays[6] + 'T12:00:00').toLocaleDateString('es-PR', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <button onClick={() => navigateWeek(1)} className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
          Semana siguiente &rarr;
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8 gap-1">
            <div className="p-2"></div>
            {weekDays.map((day, i) => (
              <div key={day} className={`p-2 text-center rounded-t-lg ${day === new Date().toISOString().split('T')[0] ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                <div className="font-medium text-sm">{dayNames[i]}</div>
                <div className="text-lg font-bold">{new Date(day + 'T12:00:00').getDate()}</div>
              </div>
            ))}

            {timeSlots.map(slot => (
              <>
                <div key={slot.key + '-label'} className="p-2 text-xs font-medium text-gray-500 flex items-start">
                  {slot.label}
                </div>
                {weekDays.map(day => {
                  const dayJobs = jobs.filter(j => j.date === day && j.timeSlot === slot.key);
                  return (
                    <div key={day + slot.key}
                      className={`p-1 min-h-[80px] border rounded-lg ${slotColors[slot.key]} cursor-pointer`}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(day, slot.key)}>
                      {dayJobs.map(job => (
                        <div key={job.id}
                          draggable
                          onDragStart={() => setDraggedJob(job)}
                          className="bg-white p-2 rounded shadow-sm mb-1 text-xs cursor-grab active:cursor-grabbing border-l-4 border-primary">
                          <div className="font-semibold truncate">{job.title}</div>
                          <div className="text-gray-500 truncate">{job.client}</div>
                          {job.assignedTo && (
                            <div className="text-primary mt-1">{job.assignedTo}</div>
                          )}
                          <button onClick={() => deleteJob(job.id)}
                            className="text-red-400 hover:text-red-600 mt-1">x</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
