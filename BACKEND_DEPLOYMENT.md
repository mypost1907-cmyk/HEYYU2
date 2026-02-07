# HEYYU2 Backend Deployment Rehberi

Backend'inizi ücretsiz olarak deploy etmek için 3 seçeneğiniz var:
1. **Railway** (Önerilen - En kolay)
2. **Render** (Ücretsiz, biraz daha yavaş)
3. **Heroku** (Ücretli oldu, önerilmez)

## 🚀 Railway ile Deployment (Önerilen)

### Adım 1: MongoDB Atlas Kurulumu

#### 1.1. MongoDB Atlas Hesabı Oluştur
1. https://www.mongodb.com/cloud/atlas adresine git
2. "Try Free" butonuna tıkla
3. Email, şifre ile kayıt ol (veya Google ile giriş)

#### 1.2. Cluster Oluştur
1. "Build a Database" → "M0 FREE" seç
2. **Provider:** AWS
3. **Region:** Frankfurt (eu-central-1) - Türkiye'ye en yakın
4. **Cluster Name:** HEYYU2-Cluster
5. "Create" butonuna tıkla

#### 1.3. Database User Oluştur
1. Sol menüden **Database Access** seç
2. "Add New Database User" tıkla
3. **Username:** `heyyu2admin`
4. **Password:** Güçlü bir şifre oluştur (kaydet!)
5. **Database User Privileges:** "Read and write to any database"
6. "Add User" tıkla

#### 1.4. Network Access Ayarla
1. Sol menüden **Network Access** seç
2. "Add IP Address" tıkla
3. **"Allow Access from Anywhere"** seç (0.0.0.0/0)
4. "Confirm" tıkla

#### 1.5. Connection String Al
1. Sol menüden **Database** seç
2. Cluster'ınızda "Connect" butonuna tıkla
3. "Connect your application" seç
4. **Driver:** Node.js, **Version:** 4.1 or later
5. Connection string'i kopyala:
```
mongodb+srv://heyyu2admin:<password>@heyyu2-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
6. `<password>` kısmını gerçek şifrenle değiştir

---

### Adım 2: Railway Deployment

#### 2.1. Railway Hesabı Oluştur
1. https://railway.app adresine git
2. "Login" → "Login with GitHub" seç
3. GitHub hesabınla giriş yap

#### 2.2. Yeni Proje Oluştur
1. Dashboard'da "New Project" tıkla
2. "Deploy from GitHub repo" seç
3. **HEYYU2** repository'sini seç
4. "Deploy Now" tıkla

#### 2.3. Root Directory Ayarla
Railway tüm projeyi görür, sadece backend'i istiyoruz:

1. Proje'de backend service'e tıkla
2. **Settings** sekmesine git
3. **Root Directory** ayarını bul
4. **Backend** klasör yolunu gir: `backend`
5. **Start Command:** `node server.js` (otomatik tanır)
6. **Save** tıkla

#### 2.4. Environment Variables Ekle
1. **Variables** sekmesine git
2. Aşağıdaki değişkenleri ekle:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://heyyu2admin:YOURPASSWORD@heyyu2-cluster.xxxxx.mongodb.net/heyyu2?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://heyyu2-backend.up.railway.app/api/auth/google/callback
```

**Önemli:**
- `MONGODB_URI`: MongoDB Atlas connection string'inizi yapıştırın
- `JWT_SECRET`: Güvenli bir random string oluşturun
- `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET`: Google Cloud Console'dan alın
- `GOOGLE_CALLBACK_URL`: Railway'in size vereceği URL + `/api/auth/google/callback`

#### 2.5. Deploy ve URL Al
1. **Deployments** sekmesinden deployment'ı izle
2. Build tamamlandığında **Settings** → **Domains**
3. "Generate Domain" tıkla
4. Railway size bir URL verecek: `https://heyyu2-backend.up.railway.app`

**Backend URL'iniz hazır! 🎉**

---

### Adım 3: Frontend'i Backend'e Bağla

#### 3.1. Frontend .env Dosyasını Güncelle
```bash
cd frontend
```

`.env` dosyası oluştur:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=https://heyyu2-backend.up.railway.app
```

#### 3.2. Local'de Test Et
```bash
npm run dev
```

Tarayıcıda aç: http://localhost:5173  
Backend'e bağlandığını kontrol et (Network tab)

#### 3.3. GitHub'a Push Et
```bash
git add .
git commit -m "feat: Connect to Railway backend"
git push origin main
```

GitHub Actions otomatik olarak yeniden deploy edecek!

---

## 🔄 Alternatif: Render ile Deployment

### Adım 1: MongoDB Atlas (Yukarıdakiyle aynı)

### Adım 2: Render Kurulumu

#### 2.1. Render Hesabı
1. https://render.com adresine git
2. "Get Started" → GitHub ile giriş

#### 2.2. Web Service Oluştur
1. "New +" → "Web Service"
2. HEYYU2 repository'sini bağla
3. Ayarlar:
   - **Name:** heyyu2-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

#### 2.3. Environment Variables
"Advanced" → "Add Environment Variable":

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Not:** Render free plan'de PORT 10000 olmalı!

#### 2.4. Deploy
"Create Web Service" tıkla - deployment başlar.

**URL:** `https://heyyu2-backend.onrender.com`

**⚠️ Uyarı:** Free plan 15 dakika inaktif kalırsa sleep mode'a girer. İlk istek 30-60 saniye sürebilir.

---

## 📦 Deployment Script (Opsiyonel)

Backend klasöründe deployment için script oluştur:

**`backend/package.json`**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build needed for Node.js'",
    "railway:deploy": "railway up"
  }
}
```

---

## 🔐 Google OAuth Production Ayarları

Backend deploy edince Google OAuth ayarlarını güncelle:

1. https://console.cloud.google.com → OAuth Credentials
2. **Authorized JavaScript origins** ekle:
   ```
   https://mypost1907-cmyk.github.io
   https://heyyu2-backend.up.railway.app
   ```
3. **Authorized redirect URIs** ekle:
   ```
   https://heyyu2-backend.up.railway.app/api/auth/google/callback
   ```

---

## ✅ Deployment Checklist

### MongoDB Atlas
- [ ] Cluster oluşturuldu
- [ ] Database user oluşturuldu
- [ ] IP whitelist (0.0.0.0/0) eklendi
- [ ] Connection string alındı

### Railway/Render
- [ ] Hesap oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Root directory `backend` olarak ayarlandı
- [ ] Environment variables eklendi
- [ ] Deploy başarılı
- [ ] Backend URL alındı

### Frontend Integration
- [ ] `VITE_API_URL` environment variable eklendi
- [ ] Local'de test edildi
- [ ] GitHub'a push edildi
- [ ] GitHub Pages'de test edildi

### Google OAuth
- [ ] Production URLs eklendi
- [ ] Callback URL güncellendi
- [ ] Test edildi

---

## 🧪 Backend Test

Deployment'ı test et:

```bash
# Health check
curl https://heyyu2-backend.up.railway.app/

# API test
curl https://heyyu2-backend.up.railway.app/api/posts/feed
```

Tarayıcıda aç:
```
https://heyyu2-backend.up.railway.app/api/posts/feed
```

Beklenen: `{"success": true, "posts": []}`

---

## 🐛 Troubleshooting

### "Application Error" Hatası
**Sebep:** Environment variables eksik veya MongoDB bağlanamıyor  
**Çözüm:** 
- Railway/Render logs'u kontrol et
- `MONGODB_URI` doğru mu?
- MongoDB Atlas'ta IP whitelist var mı?

### "Cannot connect to MongoDB"
**Sebep:** Connection string yanlış veya network access kapalı  
**Çözüm:**
- Connection string'de `<password>` değiştirildi mi?
- MongoDB Atlas Network Access 0.0.0.0/0 var mı?
- Database user oluşturuldu mu?

### Frontend Backend'e Bağlanamıyor (CORS)
**Sebep:** CORS ayarları eksik  
**Çözüm:** Backend `server.js` dosyasında CORS açık olmalı:
```javascript
app.use(cors({
  origin: '*', // veya spesifik domain
  credentials: true
}));
```

### Render Sleep Mode
**Sebep:** 15 dakika inaktif kalınca sleep mode  
**Çözüm:** 
- Her 10 dakikada bir health check ping at
- Veya Railway kullan (sleep yok)

---

## 💰 Maliyet

### Railway
- **Free Tier:** $5 credit/month
- **Yeterli mi?** Evet, düşük trafik için
- **Sleep mode?** Yok

### Render
- **Free Tier:** Ücretsiz
- **Yeterli mi?** Evet, ama sleep mode var
- **Sleep mode?** 15 dakika sonra

### MongoDB Atlas
- **M0 Free Tier:** Ücretsiz
- **Limit:** 512 MB storage
- **Yeterli mi?** Evet, 1000+ kullanıcı için yeterli

---

## 🚀 Hızlı Başlangıç (TL;DR)

```bash
# 1. MongoDB Atlas
# - Cluster oluştur
# - Connection string al

# 2. Railway
# - GitHub'dan deploy
# - Root: backend
# - Environment variables ekle
# - Deploy et

# 3. Frontend'i Güncelle
cd frontend
echo "VITE_API_URL=https://your-backend-url.railway.app" > .env
git add .
git commit -m "Connect to production backend"
git push

# 4. Test
# GitHub Pages'i aç ve test et
```

---

## 📚 Kaynaklar

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- HEYYU2 Repo: https://github.com/mypost1907-cmyk/HEYYU2

---

**Sorular?** GitHub Issues'da soru açabilirsiniz!

🎉 **Backend deployment'ınız hazır!**
