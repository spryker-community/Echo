import { useCallback } from 'react';
import { toast } from '../components/ui/use-toast';

export function useToast() {
  const showToast = useCallback(({ title, description, variant }: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => {
    toast({
      title,
      description,
      ...(variant ? { variant } : {})
    });
  }, []);

  return { showToast };
}
