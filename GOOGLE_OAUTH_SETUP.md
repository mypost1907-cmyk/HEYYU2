# Google OAuth Setup - HEYYU2

## 🔑 Google OAuth Nasıl Yapılandırılır

Google hesabı ile giriş yapmak için Google Cloud Console'dan API anahtarları almanız gerekiyor.

### 1️⃣ Google Cloud Console'a Gidin

1. https://console.cloud.google.com adresine gidin
2. Google hesabınızla giriş yapın
3. Yeni bir proje oluşturun veya mevcut projeyi seçin

### 2️⃣ OAuth Consent Screen Yapılandırın

1. Sol menüden **APIs & Services** > **OAuth consent screen** seçin
2. **User Type**: External seçin
3. **App information**:
   - App name: `HEYYU2`
   - User support email: Email adresiniz
   - Developer contact: Email adresiniz
4. **Scopes**: Ekran ve kaydet butonuna basın (varsayılan scope'lar yeterli)
5. **Test users**: Email adresinizi ekleyin
6. **Save and Continue** ile devam edin

### 3️⃣ OAuth Client ID Oluşturun

1. Sol menüden **APIs & Services** > **Credentials** seçin
2. **+ CREATE CREDENTIALS** > **OAuth client ID** tıklayın
3. **Application type**: Web application
4. **Name**: HEYYU2 Web Client
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. **CREATE** butonuna basın
8. **Client ID** ve **Client Secret** görünecek - bunları kaydedin!

### 4️⃣ Backend .env Dosyasını Güncelleyin

`backend/.env` dosyasını açın (yoksa `.env.example`'ı kopyalayın):

```bash
cd C:\Users\GÖKHAN\vibe-social\backend
copy .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Google OAuth
GOOGLE_CLIENT_ID=aldığınız-client-id-buraya
GOOGLE_CLIENT_SECRET=aldığınız-client-secret-buraya
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 5️⃣ Frontend .env Dosyasını Güncelleyin

`frontend/.env` dosyasını oluşturun:

```bash
cd C:\Users\GÖKHAN\vibe-social\frontend
```

`.env` dosyasını oluşturun ve içine:

```env
VITE_GOOGLE_CLIENT_ID=aldığınız-client-id-buraya
```

**ÖNEMLİ**: Backend ve frontend'de AYNI Client ID'yi kullanın!

### 6️⃣ Server'ları Yeniden Başlatın

Her iki sunucuyu da yeniden başlatın:

**Backend:**
```bash
cd C:\Users\GÖKHAN\vibe-social\backend
# Terminal'de Ctrl+C ile durdurun
npm run dev
```

**Frontend:**
```bash
cd C:\Users\GÖKHAN\vibe-social\frontend
# Terminal'de Ctrl+C ile durdurun
npm run dev
```

### 7️⃣ Test Edin!

1. Tarayıcınızda http://localhost:5173 açın
2. Mikrofon butonuna tıklayın (veya giriş yapma ekranına gidin)
3. **"Sign in with Google"** butonunu göreceksiniz
4. Butona tıklayın ve Google hesabınızla giriş yapın

## ✅ Tam Kurulum Kontrol Listesi

- [ ] Google Cloud Console'da proje oluşturuldu
- [ ] OAuth consent screen yapılandırıldı
- [ ] OAuth Client ID oluşturuldu
- [ ] Client ID ve Secret kaydedildi
- [ ] `backend/.env` dosyası güncellendi
- [ ] `frontend/.env` dosyası oluşturuldu
- [ ] Her iki sunucu yeniden başlatıldı
- [ ] Google ile giriş butonu görünüyor
- [ ] Google ile giriş yapma testi edildi

## 🔧 Sorun Giderme

### "Error: idpiframe_initialization_failed"
- Google Client ID'nin doğru olduğundan emin olun
- Frontend `.env` dosyasında `VITE_GOOGLE_CLIENT_ID` prefix'i var mı kontrol edin
- Sunucuları yeniden başlatın

### "Unauthorized"
- Authorized JavaScript origins listesinde `http://localhost:5173` var mı?
- Backend `.env` dosyasında Google Client ID doğru mu?

### Google butonu görünmüyor
- Frontend paketleri kuruldu mu? (`npm install` çalıştırın)
- Konsol hatalarını kontrol edin (F12)
- `.env` dosyası frontend klasöründe mi?

## 📝 Önemli Notlar

1. **Production'da**: 
   - `Authorized JavaScript origins` listesine gerçek domain'inizi ekleyin
   - `Authorized redirect URIs` listesine production callback URL'inizi ekleyin

2. **Güvenlik**:
   - `.env` dosyaları GitHub'a yüklenmemeli (`.gitignore`'da)
   - Client Secret'ı kimseyle paylaşmayın

3. **Test Kullanıcıları**:
   - OAuth consent screen "Test" modundayken sadece eklediğiniz email'ler giriş yapabilir
   - Production'a geçmek için Google'dan onay almanız gerekir

---

Kurulum tamamlandı! 🎉 Artık HEYYU2'da Google hesabı ile giriş yapabilirsiniz!
