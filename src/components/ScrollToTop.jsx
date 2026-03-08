import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  // useLocation akan mendeteksi path URL saat ini (contoh: /home, /products)
  const { pathname } = useLocation();

  useEffect(() => {
    // Setiap kali 'pathname' berubah, tarik layar ke atas secara instan
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Komponen ini tidak merender UI/HTML apapun
  return null; 
}
