import { useMemo } from 'react';
import ultraWoman50 from '@/assets/products/ultra-woman-50.jpeg';
import ultraMan50 from '@/assets/products/ultra-man-50.jpeg';
import ultraManPalmetto from '@/assets/products/ultra-man-palmetto.jpeg';
import ashwagandha from '@/assets/products/ashwagandha.jpeg';
import ultraWoman from '@/assets/products/ultra-woman.jpeg';
import magnesiumZinc from '@/assets/products/magnesium-zinc.jpeg';

const WHATSAPP_NUMBER = '252614838149';

const products = [
  { id: 1, image: ultraWoman50, name: 'Ultra Woman 50+' },
  { id: 2, image: ultraMan50, name: 'Ultra Man 50+' },
  { id: 3, image: ultraManPalmetto, name: 'Ultra Man Multivits' },
  { id: 4, image: ashwagandha, name: 'Ashwagandha KSM-66' },
  { id: 5, image: ultraWoman, name: 'Ultra Woman Multivits' },
  { id: 6, image: magnesiumZinc, name: 'Magnesium & Zinc' },
];

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ProductAds = () => {
  const shuffledProducts = useMemo(() => shuffleArray(products), []);
  const handleProductClick = (productName: string) => {
    const message = encodeURIComponent(
      `Salaan! Waxaan xiiseynayaa badeecadan: ${productName}. Fadlan ii soo dir macluumaad dheeraad ah.`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-semibold mb-2">Badeecada Caafimaadka</h2>
        <p className="text-muted-foreground text-sm">Riix si aad nagu soo xiriirato WhatsApp</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {shuffledProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product.name)}
            className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-primary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
