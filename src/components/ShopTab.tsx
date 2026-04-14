import React from 'react';
import img1 from '../../f1_shop/41G1rKZuCrL.jpg';
import img2 from '../../f1_shop/61fpC4twhuL._SX522_.jpg';
import img3 from '../../f1_shop/61xXCp+GqTL._SX522_.jpg';
import exDrop1 from '../../f1_shop/Gemini_Generated_Image_cpdylvcpdylvcpdy.png';
import exDrop2 from '../../f1_shop/Gemini_Generated_Image_xtzuhxxtzuhxxtzu.png';

export default function ShopTab() {
  const standardItems = [
    { id: 1, name: 'Scuderia Ferrari Jacket 2026', price: '$45.00', image: img1 },
    { id: 2, name: 'Mercedes-AMG Official Race Poster', price: '$120.00', image: img2 },
    { id: 3, name: 'Ferrari Race Car Frame', price: '$65.00', image: img3 },
    { id: 4, name: 'F1 Racing Gloves', price: '$40.00', image: exDrop2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 pt-10 flex flex-col gap-12 pb-32 font-body animate-in fade-in duration-500 text-left">
      {/* Header */}
      <h1 className="text-4xl font-headline font-black text-on-surface uppercase italic tracking-tight">F1 Shop</h1>

      {/* Exclusive Drops Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <h2 className="font-headline font-bold text-lg uppercase tracking-wider text-on-surface">
            Exclusive Drops
          </h2>
        </div>

        <div className="relative rounded-2xl p-[2px] overflow-hidden group cursor-pointer mb-2">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-primary opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-[spin_3s_linear_infinite]" style={{ backgroundImage: 'conic-gradient(from 0deg, #e10600, #ff8c00, #e10600, #8b0000)' }} />

          <div className="relative bg-surface rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(225,6,0,0.2)] group-hover:shadow-[0_0_30px_rgba(225,6,0,0.5)] transition-shadow duration-300">
            <div className="absolute top-3 left-3 bg-error text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md z-10 shadow-lg border border-white/20">
              Limited Edition
            </div>
            <img
              src={exDrop1}
              alt="Exclusive Drop"
              className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="p-4 bg-gradient-to-t from-surface via-surface/90 to-transparent absolute bottom-0 w-full pt-12">
              <h3 className="font-bold text-on-surface">Driver's Signed Jacket</h3>
              <p className="text-primary font-bold mt-1">$450.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Standard Items Section */}
      <section>
        <h2 className="font-headline font-bold text-lg uppercase tracking-wider text-on-surface mb-6">
          Official Merchandise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {standardItems.map(item => (
            <div key={item.id} className="bg-surface-low rounded-xl overflow-hidden border border-surface-high hover:border-surface-highest transition-colors cursor-pointer group flex flex-col">
              <div className="h-32 overflow-hidden bg-white/5 flex items-center justify-center p-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h4 className="text-sm font-bold text-on-surface mb-4 line-clamp-2 leading-tight">
                  {item.name}
                </h4>
                <div className="flex flex-col gap-3 mt-auto">
                  <span className="text-lg font-black tracking-tight text-on-surface-variant mb-1">{item.price}</span>
                  <div className="flex justify-between gap-3">
                    <button onClick={(e) => e.stopPropagation()} className="flex-1 py-3 text-xs font-bold uppercase tracking-wider bg-surface border border-white/5 hover:bg-surface-high text-on-surface rounded-xl transition-all shadow-md">Add to Cart</button>
                    <button onClick={(e) => e.stopPropagation()} className="flex-1 py-3 text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded-xl transition-all shadow-[0_5px_15px_rgba(225,6,0,0.3)]">Buy Now</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
