// jest.config.js
export default {
  // ... diğer ayarlarınız ...

  collectCoverageFrom: [
    // TÜM kaynak kod dosyalarını dahil et (src klasörü altındaki her şey)
    'src/**/*.{js,jsx,ts,tsx}',
    
    // Test dosyalarını KESİNLİKLE hariç tut (yoksa test kodunun kendisi de hesaplanır)
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}',
    
    // Konfigürasyon ve tip dosyalarını hariç tut (genelde test edilmezler)
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.d.ts', // TypeScript tip dosyaları
    '!**/index.{js,ts}', // Sadece export yapan ana dosyaları test etmek istemeyebilirsiniz (isteğe bağlı)
  ],
};