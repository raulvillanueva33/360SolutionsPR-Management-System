import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase';

export default function LoginPage() {
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error iniciando sesion con Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="w-full max-w-sm bg-light rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-dark">360Solutions<span className="text-primary">PR</span></h1>
          <p className="text-sm text-gray-500 mt-2">Management System</p>
        </div>
        <p className="text-sm text-gray-600 mb-6 text-center">Inicia sesion con tu cuenta corporativa de Google.</p>
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 btn-secondary py-3">
          Continuar con Google
        </button>
        <p className="text-xs text-gray-400 mt-6 text-center">Sistema exclusivo para empleados de 360SolutionsPR</p>
      </div>
    </div>
  );
}
