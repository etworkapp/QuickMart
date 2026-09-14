# ⚡ QuickMart — Real-Time Quick Commerce Price Hunter & Universal Order Routing Hub
> **सर्व ॲप्समधून सर्वात स्वस्त दर शोधा आणि थेट त्या प्लॅटफॉर्मवरून ऑर्डर करा!**  
> *Cross-App Live Price Aggregation & 1-Click Purchase for Blinkit, Zepto, Swiggy Instamart, and BigBasket BB Now.*

---

## 📖 प्रकल्प परिचय (Overview)

**QuickMart** हे एक नेक्स्ट-जनरेशन क्विक-कॉमर्स ॲग्रिगेटर (Quick Commerce Aggregator) आहे. हे ॲप्लिकेशन **Blinkit**, **Zepto**, **Swiggy Instamart** आणि **BigBasket BB Now** या चारही आघाडीच्या प्लॅटफॉर्म्सवरून किराणा व दैनंदिन सामानाचे दर रिअल-टाइममध्ये आपोआप (automatically) फेच करते, तुलना करते आणि ज्या ॲपवर सर्वात कमी किंमत आहे त्यावरून थेट १-क्लिकमध्ये ऑर्डर पूर्ण करते.

याशिवाय यात १०-मिनिटांची डार्क स्टोअर डिलिव्हरी ट्रॅकिंग, पेमेंट फेल्युअरवर तात्काळ **ऑटोनॉमस युपीआय रिफंड (Instant Auto-Refund with UTR)**, जिओफेन्सिंग SLA आणि QA टेस्टिंग लॅब अंतर्भूत आहे.

---

## 🌟 मुख्य वैशिष्ट्ये (Key Features)

### 1. 🔄 स्वयंचलित लाईव्ह दर फेचिंग (Autonomous Live Price Fetching)
- **4 Apps Live Sync**: Blinkit, Zepto, Swiggy Instamart, आणि BB Now या चारही ॲप्सच्या API वरून दर सेकंदाला ऑटोमॅटिक दर अपडेट होतात.
- **Dynamic Search Auto-Fetch**: युझरने सर्च बारमध्ये कोणतेही उत्पादन टाइप केल्यास अवघ्या ३५०ms मध्ये सर्व प्लॅटफॉर्म्सवरील दर आपोआप फेच होतात.
- **API Latency Telemetry Bar**: प्रत्येक प्लॅटफॉर्मच्या API चा रिस्पॉन्स टाईम (उदा. Blinkit 16ms, Zepto 12ms, Instamart 19ms, BB Now 24ms) थेट स्क्रीनवर लाईव्ह दिसतो.

### 2. 🥇 सर्वात स्वस्त पर्याय शोधणे (Cheapest Price Hunter)
- **Smart Comparison Engine**: प्रत्येक वस्तूसाठी मूळ किंमत, डिलिव्हरी फी, हँडलिंग फी आणि अंतिम रक्कम जोडून सर्वात स्वस्त स्टोअर ओळखले जाते.
- **Savings Badges**: सर्वोच्च दराच्या तुलनेत किती रुपयांची बचत (उदा. *Save ₹12*) होते हे ठळकपणे दर्शवले जाते.
- **Platform Filters**: फक्त विशिष्ट ॲपचे सर्वात स्वस्त प्रॉडक्ट्स बघण्यासाठी क्विक फिल्टर्स (All, Zepto Lowest, Blinkit Lowest, Instamart Lowest, BB Now Lowest).

### 3. 🛒 थेट त्या प्लॅटफॉर्मवरून खरेदी (1-Click Platform-Specific Buy)
- **Direct 1-Click Buy**: प्रॉडक्ट कार्डवरील `"Buy on [Platform]"` बटणावर क्लिक करताच ऑर्डर थेट त्या प्लॅटफॉर्मच्या डार्कस्टोअरकडे पाठवली जाते.
- **Deep-Linking to Official Stores**: अधिकृत Blinkit, Zepto, Swiggy Instamart किंवा BigBasket वेबसाइट/ॲपवर उत्पादन उघडण्यासाठी थेट एक्सटर्नल लिंक्स उपलब्ध.
- **Platform-Branded Checkout**: ज्या प्लॅटफॉर्मवरून ऑर्डर केली जाते, त्याचेच ब्रँडिंग, डिलिव्हरी कालावधी (SLA) आणि रायडर डिटेल्स चेकआउटमध्ये दिसतात.

### 4. ⚡ १०-मिनिटांची डार्क स्टोअर ट्रॅकिंग (10-Minute Dark Store Tracking)
- **Live Status Stages**: Order Confirmed ➔ Packing at Dark Store ➔ Rider Out for Delivery ➔ Arrived at Doorstep.
- **Dedicated Fleet Details**: निवडलेल्या प्लॅटफॉर्मचा अधिकृत रायडर, नाव, व्हेरीफाईड सुरक्षित हेल्मेट बॅज, संपर्क नंबर आणि ओटीपी (OTP).

### 5. 🛡️ ऑटोनॉमस रिफंड व पासबुक (Autonomous Refund Engine)
- **Instant Bank Reversal**: पेमेंट करताना नेटवर्क एरर, 4G ड्रॉप किंवा 3DS स्क्रीन बंद झाल्यास पैसे अडकून न राहता ३ सेकंदात ऑटोमॅटिक रिफंड जनरेट होतो.
- **UTR Audit Trail**: बँक-ग्रेड UTR नंबर (उदा. `UTR-839201948291`) सह ग्राहक पासबुकमध्ये नोंदी जतन होतात.

### 6. 🧪 QA सिम्युलेटर व टेस्टिंग लॅब (Interactive Testing Lab)
- **Geofence SLA**: इन-झोन (२.५ किमी डार्क स्टोअर क्षेत्र) आणि आऊट-ऑफ-झोन (अनसर्व्हिसेबल) पिनकोड सिम्युलेटर.
- **Flash Stock Drop**: एका क्लिकवर गोदामातील स्टॉक शून्य करून कार्टमधील स्टॉक-कॉन्फ्लिक्ट रिझोल्युशन टेस्ट करण्याची सुविधा.
- **System Event Logs**: सर्व ॲग्रिगेटर, जिओफेन्स आणि रिफंड इव्हेंट्सचे लाईव्ह लॉगिंग.

### 7. 🌐 द्विभाषिक सपोर्ट (Bilingual: English & Marathi)
- ॲप पूर्णपणे **English** किंवा **मराठी** मध्ये एका क्लिकवर बदलता येते.

---

## 🏗️ तांत्रिक रचना (Tech Stack & Architecture)

| Layer | Technology Used |
| :--- | :--- |
| **Frontend Core** | React 18+, TypeScript |
| **Build Tool & Bundler** | Vite |
| **Styling & Design System** | Tailwind CSS (Modern Neutral Palette, Zero AI-Slop) |
| **Icons** | Lucide React |
| **Audio Synthesizer** | Native Web Audio API (Chimes, Clicks & Notifications) |
| **State Management** | Pure React Hooks (`useState`, `useMemo`, `useEffect`) |

---

## 📁 प्रोजेक्ट स्ट्रक्चर (Project Structure)

```text
├── index.html                    # Single-Page Entry Point with Meta Tags
├── package.json                  # Dependencies & Scripts
├── tsconfig.json                 # TypeScript Compiler Configuration
├── vite.config.ts                # Vite Configuration
├── src/
│   ├── main.tsx                  # React Entry Point
│   ├── App.tsx                   # Master App Orchestrator & Auto-Fetch Engine
│   ├── types.ts                  # Shared Data Types, Platforms & Interfaces
│   ├── index.css                 # Tailwind CSS Import & Base Typography
│   ├── components/
│   │   ├── Header.tsx            # Sticky Navbar, Geofence SLA, Live Rescan & Lang Switch
│   │   ├── ProductCard.tsx       # Live Product Display with "Buy on [Platform]" & Compare
│   │   ├── PriceComparisonModal.tsx # 4-App Full Breakdown, Fee Matrix & 1-Click Buy
│   │   ├── CartDrawer.tsx        # Smart Cart with Platform Routing & Deep Links
│   │   ├── PaymentModal.tsx      # Multi-Method Checkout with QA Edge-Case Triggers
│   │   ├── OrderTrackingModal.tsx# Real-Time 10-Min Delivery Tracker with Rider OTP
│   │   ├── AutoRefundModal.tsx   # Instant Bank Reversal & UTR Notification
│   │   ├── RefundPassbook.tsx    # Customer Ledger & Reconciled Bank Receipts
│   │   ├── LocationModal.tsx     # Micro-Darkstore Geofence Selector
│   │   ├── StockConflictModal.tsx# Out-of-Stock Interceptor with 1-Tap Substitutes
│   │   └── TestingLabPanel.tsx   # QA Edge-Case Simulator & Live System Telemetry
│   ├── data/
│   │   ├── products.ts           # 16 High-Demand SKUs with 4-Platform Competitor Rates
│   │   └── platforms.ts          # Blinkit, Zepto, Swiggy Instamart, BB Now Metadata & Links
│   └── utils/
│       ├── audio.ts              # Web Audio API Sound Effects (Pop, Success, Refund Chime)
│       └── translations.ts       # Full English & Marathi Localization Dictionaries
```

---

## 🚀 स्थानिक पातळीवर कसे चालवायचे (How to Run Locally)

### १. आवश्यक बाबी (Prerequisites)
- **Node.js**: v18.0.0 किंवा त्यापेक्षा नवीन
- **npm** किंवा **bun**

### २. इन्स्टॉलेशन व रन (Installation & Development)
```bash
# १. सर्व आवश्यक पॅकेजेस इन्स्टॉल करा
npm install

# २. डेव्हलपमेंट सर्व्हर सुरू करा (Port 3000)
npm run dev

# ३. ॲप्लिकेशन ब्राउझरमध्ये उघडा
# http://localhost:3000
```

### ३. बिल्ड आणि पडताळणी (Build & Verification)
```bash
# TypeScript टाईप चेकिंग आणि लिंटिंग
npm run lint

# प्रॉडक्शन बिल्ड तयार करा
npm run build
```

---

## 🔄 कार्यपद्धती (Step-by-Step Workflows)

### १. सर्वात स्वस्त दर शोधणे व खरेदी करणे:
1. मुख्य पानावर उत्पादने स्क्रोल करा किंवा सर्च बारमध्ये नाव टाका (उदा. `Amul Milk`).
2. ऑटो-फेच इंजिन काही मिलीसेकंदात Blinkit, Zepto, Swiggy Instamart व BB Now वरून दर फेच करतो.
3. कार्डवर सर्वात स्वस्त ॲपची किंमत व **"Buy on [Platform]"** बटण दिसेल.
4. बटणावर क्लिक करताच थेट त्या प्लॅटफॉर्मचा चेकआउट उघडतो.
5. पेमेंट पूर्ण होताच निवडलेल्या प्लॅटफॉर्मच्या डार्कस्टोअरवरून ऑर्डर कन्फर्म होते व १० मिनिटांचे लाईव्ह ट्रॅकिंग सुरू होते.

### २. पेमेंट अयशस्वी आणि तात्काळ रिफंड:
1. कार्टमधून **"Proceed to Pay"** दाबा.
2. पेमेंट विंडोमध्ये वर दिलेल्या **"🧪 QA Simulation Control"** मध्ये जावून **"Simulate 4G Network Timeout"** निवडा.
3. **"Pay ₹..."** दाबा.
4. सिस्टीम तात्काळ एरर डिटेक्ट करेल आणि युपीआय ऑटो-रिव्हर्सलद्वारे बँक UTR नंबरसह तात्काळ रिफंड स्क्रीनवर दाखवेल.

---

## 📜 लायसन्स (License)
Apache-2.0. मुक्त वापर आणि विकासासाठी उपलब्ध.
