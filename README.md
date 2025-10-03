# IndMon.in Landing Page (Local Development Guide)

यह प्रोजेक्ट आपकी AI-powered algorithmic trading waitlist वेबसाइट का static (HTML/CSS/JS) संस्करण है। नीचे step-by-step तरीके दिए गए हैं जिससे आप इसे अपने सिस्टम पर चला, टेस्ट और आगे maintain कर सकते हैं।

---
## 🚀 जल्दी शुरू करें (सबसे आसान तरीका)
1. इस फ़ोल्डर में जाएँ:
   - `C:\Users\lenovo\OneDrive\Desktop\IndMon.in`
2. `index.html` पर डबल-क्लिक करें (Browser में खुल जाएगा)।
   - Simple viewing OK है, लेकिन form submission / future API behavior के लिए local server बेहतर है।

---
## 🖥 विकल्प 1: PowerShell Static Server (Provided Script)
हमने एक custom server script दिया है: `serve.ps1`

चलाने के लिए (PowerShell):
```powershell
Set-Location 'C:\Users\lenovo\OneDrive\Desktop\IndMon.in'
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 5510
```
फिर खोलें: http://localhost:5510

रोकना हो तो: Ctrl + C

नया पोर्ट: `-Port 5555` (या कोई दूसरा free port)

---
## 🐍 विकल्प 2: Python (अगर install कर लें)
```powershell
Set-Location 'C:\Users\lenovo\OneDrive\Desktop\IndMon.in'
python -m http.server 5500
```
Visit: http://localhost:5500

---
## 🟢 विकल्प 3: Node.js (अगर Node install है)
```powershell
npm install -g serve
serve -l 5500 .
```
या:
```powershell
npx http-server -p 5500
```

---
## 🔐 Waitlist Form Backend (Google Apps Script)
फ़ॉर्म अभी `script.js` में placeholder URL उपयोग कर रहा है:
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```
इसे अपने deployed Google Apps Script Web App URL से बदलें।

### 📄 Apps Script कोड (सुझावित)
```javascript
function doPost(e) {
  try {
    var sheetId = 'YOUR_SHEET_ID';
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Sheet1');
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.email || '',
      data.name || '',
      data.phone || '',
      data.broker || 'Not Selected',
      data.experience || 'Not Specified',
      'Active'
    ]);
    return ContentService.createTextOutput(JSON.stringify({success:true,message:'OK'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err){
    return ContentService.createTextOutput(JSON.stringify({success:false,message:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### ✅ Deploy Steps
1. Google Drive → New → Apps Script
2. Code paste करें → sheetId बदलें
3. एक sheet बनाएं (`Sheet1`) और (optional) header row डालें:
   - Timestamp | Email | Name | Phone | Broker | Experience | Status
4. Deploy → New deployment → Type: *Web app*
   - Execute as: *Me*
   - Who has access: *Anyone*
5. Deploy → URL कॉपी करें → `script.js` में replace करें → Save.
6. Local server चलाकर form submit test करें (Network tab में 200 OK जाँचें)।

---
## 📂 Project Structure
```
IndMon.in/
├─ index.html        # Main single-page layout
├─ styles.css        # Styling (glassmorphism + responsive)
├─ script.js         # UI logic + form submission
├─ serve.ps1         # Minimal PowerShell static server
└─ README.md         # This guide
```

---
## 🧪 Form Validation Logic
Fields (all required): Email, Name, Phone, Broker, Experience
- Email Regex: basic format check
- Phone: `+` optional, digits/spaces/hyphens allowed
- Errors inline `<small>` elements में दिखते हैं
- Submit पर loading state + success / failure message

---
## 🛠 Common Troubleshooting
| समस्या | कारण | समाधान |
|--------|-------|--------|
| Browser में सिर्फ़ लोड होता रहता | Port busy / server hang | नया पोर्ट: `-Port 5510` या पुराना process kill करें (`taskkill /PID <pid> /F`) |
| Form submit नहीं जा रहा | Apps Script URL नहीं बदला | `APPS_SCRIPT_URL` सही करें |
| 404 assets | गलत फ़ोल्डर से server run | पहले `Set-Location` सही path करें |
| CORS error | HTTPS + HTTP mismatch (remote) | Deploy पर दोनों origin align करें |

---
## 🌐 Deployment (Recommended)
| Platform | Steps |
|----------|-------|
| Netlify | Drag & drop folder / `netlify deploy` CLI |
| Vercel  | `vercel` → project import → root select |
| GitHub Pages | Repo push → Settings → Pages → root `/` |

Add optional `_headers` (Netlify) या security meta tags later if needed.

---
## 🔒 Future Enhancements (Optional)
- Honeypot hidden field for spam
- Rate-limit (client cooldown)
- Phone normalization (`+91` prefix handling)
- Analytics (Plausible / GA4)
- Open Graph & social previews (meta tags)
- Favicon set (multi-size PNG + manifest)
- Light/Dark theme toggle

---
## 🧼 Clean Up Old Servers
Use:
```powershell
netstat -ano | findstr :5500
# फिर
taskkill /PID <PID> /F
```

---
## ❓ Quick Reference Commands
```powershell
# Go to project
Set-Location 'C:\Users\lenovo\OneDrive\Desktop\IndMon.in'

# Run PowerShell server (custom)
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 5510

# Python simple (if installed)
python -m http.server 5500

# Node (serve)
serve -l 5500 .
```

---
## ✅ Checklist Before Going Live
- [ ] Apps Script URL set
- [ ] Form tested (row in Sheet)
- [ ] Meta description present (already added)
- [ ] Favicon added
- [ ] OG tags (title / description / image)
- [ ] SSL (handled by host)
- [ ] Performance audit (Lighthouse)

---
अगर आपको अगला step (deployment / anti-spam / SEO tags) चाहिए तो बताइए – मैं सीधे add कर दूँ।

Happy Building! 🚀
