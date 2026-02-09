import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../App';

export default function EmployeesModule() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', phone: '', email: '' });
  const [clockingIn, setClockingIn] = useState(false);

  useEffect(() => {
    const unsub1 = onSnapshot(query(collection(db, 'employees'), orderBy('name')), (snap) => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unsub2 = onSnapshot(query(collection(db, 'timeEntries'), orderBy('clockIn', 'desc')), (snap) => {
      setTimeEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const addEmployee = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'employees'), {
      ...newEmployee, createdBy: user.uid, createdAt: serverTimestamp(), active: true
    });
    setNewEmployee({ name: '', role: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  const handleClockIn = async (employeeId, employeeName) => {
    setClockingIn(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });
      await addDoc(collection(db, 'timeEntries'), {
        employeeId, employeeName,
        clockIn: serverTimestamp(),
        clockInLocation: { lat: position.coords.latitude, lng: position.coords.longitude },
        clockOut: null, clockOutLocation: null,
        createdBy: user.uid
      });
      alert('Entrada registrada correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al registrar entrada. Verifica permisos de ubicacion.');
    } finally { setClockingIn(false); }
  };

  const handleClockOut = async (entryId) => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });
      await updateDoc(doc(db, 'timeEntries', entryId), {
        clockOut: serverTimestamp(),
        clockOutLocation: { lat: position.coords.latitude, lng: position.coords.longitude }
      });
      alert('Salida registrada correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al registrar salida.');
    }
  };

  const getActiveEntry = (employeeId) => {
    return timeEntries.find(e => e.employeeId === employeeId && !e.clockOut);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleTimeString('es-PR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Empleados</h1>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90">
          {showAddForm ? 'Cancelar' : '+ Agregar Empleado'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addEmployee} className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
              <input type="text" required value={newEmployee.name}
                onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rol</label>
              <select value={newEmployee.role}
                onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                className="w-full border rounded-lg px-3 py-2">
                <option value="">Seleccionar...</option>
                <option value="installer">Instalador</option>
                <option value="technician">Tecnico</option>
                <option value="driver">Chofer</option>
                <option value="designer">Disenador</option>
                <option value="admin">Administrativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telefono</label>
              <input type="tel" value={newEmployee.phone}
                onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" value={newEmployee.email}
                onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">
            Guardar Empleado
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => {
          const activeEntry = getActiveEntry(emp.id);
          return (
            <div key={emp.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{emp.name}</h3>
                  <p className="text-sm text-gray-500">
                    {emp.role === 'installer' ? 'Instalador' : emp.role === 'technician' ? 'Tecnico' : emp.role === 'driver' ? 'Chofer' : emp.role === 'designer' ? 'Disenador' : 'Admin'}
                  </p>
                </div>
                <span className={`w-3 h-3 rounded-full ${activeEntry ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              {emp.phone && <p className="text-sm text-gray-600">Tel: {emp.phone}</p>}
              {activeEntry && (
                <p className="text-xs text-green-600 mt-1">Entrada: {formatTime(activeEntry.clockIn)}</p>
              )}
              <div className="flex gap-2 mt-3">
                {!activeEntry ? (
                  <button onClick={() => handleClockIn(emp.id, emp.name)} disabled={clockingIn}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50">
                    Clock In
                  </button>
                ) : (
                  <button onClick={() => handleClockOut(activeEntry.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600">
                    Clock Out
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {employees.length === 0 && (
        <p className="text-center text-gray-400 py-8">No hay empleados registrados</p>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-dark mb-4">Registro de Hoy</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Empleado</th>
                <th className="text-left p-3">Entrada</th>
                <th className="text-left p-3">Salida</th>
                <th className="text-left p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.slice(0, 20).map(entry => (
                <tr key={entry.id} className="border-t">
                  <td className="p-3">{entry.employeeName}</td>
                  <td className="p-3">{formatTime(entry.clockIn)}</td>
                  <td className="p-3">{formatTime(entry.clockOut)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${entry.clockOut ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                      {entry.clockOut ? 'Completado' : 'Activo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {timeEntries.length === 0 && (
            <p className="text-center text-gray-400 py-4">No hay registros</p>
          )}
        </div>
      </div>
    </div>
  );
}
