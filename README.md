🎯 Amaç

Ürün tanıtım editörü

Kullanıcı bilgisayarında çalışacak (Windows .exe)

Uygulama içinden fotoğraf, video, ses dosyaları eklenip düzenlenecek

Çıkış: tek MP4 tanıtım videosu

🔹 Özellikler

Fotoğraf Ekleme

Bilgisayardan fotoğraf yüklenir.

Foto altına otomatik etiket (template) gelir (örn: Ürün Adı + Fiyat kutusu).

Etiket kısmındaki yazılar biz değiştiriyoruz.

Kullanıcı ok tuşlarıyla / sağ-sol butonlarıyla veya thumbnail’e tıklayarak fotoğraflar arasında navigate edecek.

Sıralama / Düzenleme

Fotoğraflar sağda thumbnail listesine düşer.

Sürükle-bırak ile sırası değiştirilebilir.

Yeni foto eklenebilir.

Video Çekme (Uygulama içinden)

F4’e bas → kamera + mikrofon açılır, kayıt başlar.

Tekrar F4 → kayıt durur, timeline’a video olarak eklenir.

Ses Dosyası Ekleme / Değiştirme

Dışarıdan ses dosyası yüklenebilir.

Timeline üzerinde sürükle-bırak ile yeri değiştirilebilir.

Export

FFmpeg kullanılarak fotoğraf + etiket + ses + video birleştirilir.

Çıktı: .mp4 tanıtım videosu.

🔹 Kullanacağımız Teknolojiler
⚙️ Uygulama Çatısı

Electron → masaüstü uygulaması (Windows için .exe çıkışı alacağız)

React (TSX) → UI yönetimi (fotoğraf listesi, drag-drop, input alanları)

🎨 Arayüz & Düzenleme

React-Beautiful-DnD → sürükle-bırak sıralama

Konva.js / Fabric.js → fotoğraf üstüne template (etiket + yazılar)

🎥 Medya İşleme

MediaRecorder API → uygulama içinden video + ses kaydı

Electron globalShortcut → F4 tuşunu yakalayıp kayıt başlat/durdur

FFmpeg → tüm medya dosyalarını (foto+etiket+video+ses) tek MP4’e render etme

🔹 Çalışma Akışı

Fotoğraf ekle → Etiket otomatik geliyor.

Sağdaki listeden sürükle-bırak → sırasını değiştiriyoruz.

F4 ile kayıt → Kamera kaydı timeline’a ekleniyor.

Ses ekleme → ses dosyası timeline’a düşüyor, yeri değiştirilebiliyor.

Export → FFmpeg ile tek MP4 video çıkıyor.

⚡️ Özetle:
Senin istediğin uygulama bir Electron tabanlı masaüstü editör olacak.
İçinde React ile UI, Konva ile etiketleme, MediaRecorder + F4 shortcut ile video kaydı, FFmpeg ile export var.

.

  },
])
```
