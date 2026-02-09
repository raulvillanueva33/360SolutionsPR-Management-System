import { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

export default function PatrolModule({ user }) {
  const [entryType, setEntryType] = useState('prospect');
  const [clientName, setClientName] = useState('');
  const [signDescription, setSignDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('Geolocalizacion no soportada'); return; }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLoadingLocation(false); },
      (err) => { console.error(err); alert('No se pudo obtener la ubicacion'); setLoadingLocation(false); },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng) { alert('Primero guarda la ubicacion del rotulo.'); return; }
    setSaving(true);
    try {
      let photoUrl = null;
      if (photoFile) {
        const storageRef = ref(storage, `patrol_photos/${user.uid}/${Date.now()}-${photoFile.name}`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'patrolEntries'), {
        createdBy: user.uid, createdByEmail: user.email, entryType,
        clientName: clientName || null, signDescription, notes, photoUrl, location,
        createdAt: serverTimestamp()
      });
      setClientName(''); setSignDescription(''); setNotes(''); setPhotoFile(null); setPhotoPreview(null);
      alert('Reporte guardado correctamente');
    } catch (err) { console.error(err); alert('Error guardando el reporte'); }
    finally { setSaving(false); }
  };

  const googleMapsLink = location.lat && location.lng ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : null;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Patrullero - Ronda Nocturna</h1>
        <span className="text-xs text-gray-300">{user?.email}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setEntryType('prospect')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${entryType === 'prospect' ? 'bg-primary text-black' : 'bg-gray-800 text-gray-300'}`}>Prospecto</button>
          <button type="button" onClick={() => setEntryType('falla')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${entryType === 'falla' ? 'bg-secondary text-black' : 'bg-gray-800 text-gray-300'}`}>Falla</button>
        </div>
        <div><label className="block text-xs text-gray-300 mb-1">Cliente (si aplica)</label><input type="text" className="input-dark" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del negocio" /></div>
        <div><label className="block text-xs text-gray-300 mb-1">Descripcion del rotulo</label><textarea className="input-dark" rows={3} value={signDescription} onChange={(e) => setSignDescription(e.target.value)} placeholder="Ej: Rotulo de LED frontal, 2 modulos apagados..." required /></div>
        <div><label className="block text-xs text-gray-300 mb-1">Notas adicionales</label><textarea className="input-dark" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Informacion que ayude al diagnostico." /></div>
        <div><label className="block text-xs text-gray-300 mb-1">Foto del rotulo</label><input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="w-full text-xs text-gray-300" />{photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 rounded-lg border border-gray-700 max-h-48 object-cover" />}</div>
        <div className="space-y-2">
          <button type="button" onClick={handleGetLocation} className="w-full py-2 rounded-lg text-sm font-semibold bg-primary text-black" disabled={loadingLocation}>{loadingLocation ? 'Obteniendo ubicacion...' : 'Guardar ubicacion actual'}</button>
          {location.lat && location.lng && <div className="text-xs text-gray-300"><p>Lat: {location.lat.toFixed(5)}</p><p>Lng: {location.lng.toFixed(5)}</p>{googleMapsLink && <a href={googleMapsLink} target="_blank" rel="noreferrer" className="text-secondary underline">Ver en Google Maps</a>}</div>}
        </div>
        <button type="submit" disabled={saving} className="w-full mt-2 py-2 rounded-lg text-sm font-semibold bg-secondary text-black disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar reporte'}</button>
      </form>
    </div>
  );
}
