import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { getRedirectPath } from '@/lib/redirect-logic';

export default function PosPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }

      const redirectPath = getRedirectPath(user);
      if (redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
        <p className="font-black uppercase tracking-widest text-muted-foreground text-xs italic">Cargando Terminal...</p>
      </div>
    </div>
  );
}
