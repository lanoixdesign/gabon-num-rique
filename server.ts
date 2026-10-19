import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helpers pour la gestion de la base data.json
function getDataFilePath() {
  const publicPath = path.resolve(__dirname, 'public/data.json');
  if (fs.existsSync(publicPath)) return publicPath;
  const distPublicPath = path.resolve(__dirname, 'dist/data.json');
  if (fs.existsSync(distPublicPath)) return distPublicPath;
  return path.resolve(__dirname, 'data.json');
}

function readData(): any {
  try {
    const filePath = getDataFilePath();
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

function writeData(data: any): void {
  const formatted = JSON.stringify(data, null, 2);
  const targets = [
    path.resolve(__dirname, 'public/data.json'),
    path.resolve(__dirname, 'data.json'),
  ];
  const distFolder = path.resolve(__dirname, 'dist');
  if (fs.existsSync(distFolder)) {
    targets.push(path.resolve(distFolder, 'data.json'));
  }
  for (const t of targets) {
    try {
      fs.writeFileSync(t, formatted, 'utf-8');
    } catch {}
  }
}

// -------------------------------------------------------------
// ROUTES D'API REST OFFICIELLES (NODE.JS EXPRESS)
// -------------------------------------------------------------

// 1. Consultation des données de l'événement
app.get('/api/data', (_req, res) => {
  const data = readData();
  res.json(data);
});

// 2. Mise à jour des données (depuis le panneau admin /admin.html)
app.post('/api/data', (req, res) => {
  try {
    writeData(req.body);
    res.json({ success: true, message: 'Données sauvegardées avec succès.' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 3. Enregistrement d'inscription et génération du badge officiel
app.post('/api/register', (req, res) => {
  try {
    const regData = req.body;
    const currentData = readData();
    if (!currentData.registrations) {
      currentData.registrations = [];
    }

    const nextNum = currentData.registrations.length + 1;
    const id = `GDW-2026-${String(nextNum).padStart(3, '0')}`;
    const typeCode = (regData.type || 'VIS').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
    const badgeCode = `GDW-${typeCode || 'PART'}-${String(nextNum).padStart(3, '0')}`;

    const newReg = {
      id,
      name: `${regData.firstName || ''} ${regData.lastName || ''}`.trim() || regData.name || 'Participant',
      firstName: regData.firstName || '',
      lastName: regData.lastName || '',
      email: regData.email || '',
      phone: regData.phone || '',
      country: regData.country || 'Gabon',
      organization: regData.organization || 'Indépendant',
      role: regData.role || regData.function || 'Participant',
      type: regData.type || 'Autre',
      visaAssistance: Boolean(regData.visaAssistance),
      badgeCode,
      status: 'Confirmé',
      registeredAt: new Date().toISOString()
    };

    currentData.registrations.unshift(newReg);
    writeData(currentData);
    res.json({ success: true, registration: newReg });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 4. Dépôt d'accréditation médias & journalistes
app.post('/api/press-accreditation', (req, res) => {
  try {
    const pressData = req.body;
    const currentData = readData();
    if (!currentData.pressAccreditations) {
      currentData.pressAccreditations = [];
    }

    const nextNum = currentData.pressAccreditations.length + 1;
    const id = `PRESS-2026-${String(nextNum).padStart(3, '0')}`;

    const newAccreditation = {
      id,
      name: pressData.name || '',
      media: pressData.media || '',
      role: pressData.role || pressData.function || '',
      mediaType: pressData.mediaType || 'Presse écrite',
      country: pressData.country || 'Gabon',
      email: pressData.email || '',
      phone: pressData.phone || '',
      days: pressData.days || 'Du 26 au 30 octobre',
      proofFile: pressData.proofFile || 'justificatif_presse.pdf',
      status: 'En attente',
      submittedAt: new Date().toISOString()
    };

    currentData.pressAccreditations.unshift(newAccreditation);
    writeData(currentData);
    res.json({ success: true, accreditation: newAccreditation });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 5. Formulaire de contact officiel / demandes de stands
app.post('/api/contact', (req, res) => {
  try {
    const contactData = req.body;
    const currentData = readData();
    if (!currentData.contactMessages) {
      currentData.contactMessages = [];
    }

    const nextNum = currentData.contactMessages.length + 1;
    const id = `MSG-2026-${String(nextNum).padStart(3, '0')}`;

    const newMsg = {
      id,
      name: contactData.name || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      organization: contactData.organization || '',
      subject: contactData.subject || 'Renseignement général',
      message: contactData.message || '',
      date: new Date().toISOString(),
      status: 'Nouveau'
    };

    currentData.contactMessages.unshift(newMsg);
    writeData(currentData);
    res.json({ success: true, message: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// -------------------------------------------------------------
// SERVEUR STATIQUE & DISTRIBUTION (VITE OU DIST)
// -------------------------------------------------------------
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('/admin', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'admin.html'));
    });
    app.get('/admin.html', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'admin.html'));
    });
    app.get('/mentions-legales', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'mentions-legales.html'));
    });
    app.get('/mentions-legales.html', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'mentions-legales.html'));
    });
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Node.js Server] Gabon Digital Week actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
