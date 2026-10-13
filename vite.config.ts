import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function jsonDatabasePlugin(): Plugin {
  return {
    name: 'json-database-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        if (url === '/api/data' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const dataPath = path.resolve(__dirname, 'public/data.json');
            const content = fs.readFileSync(dataPath, 'utf-8');
            res.end(content);
          } catch {
            const fallbackPath = path.resolve(__dirname, 'data.json');
            const content = fs.existsSync(fallbackPath) ? fs.readFileSync(fallbackPath, 'utf-8') : '{}';
            res.end(content);
          }
          return;
        }

        if (url === '/api/data' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const formatted = JSON.stringify(parsed, null, 2);
              fs.writeFileSync(path.resolve(__dirname, 'public/data.json'), formatted, 'utf-8');
              fs.writeFileSync(path.resolve(__dirname, 'data.json'), formatted, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Données sauvegardées avec succès.' }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: String(err) }));
            }
          });
          return;
        }

        if (url === '/api/register' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const regData = JSON.parse(body);
              const dataPath = path.resolve(__dirname, 'public/data.json');
              let currentData: any = {};
              if (fs.existsSync(dataPath)) {
                currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
              }
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
                visaAssistance: !!regData.visaAssistance,
                badgeCode,
                status: 'Confirmé',
                registeredAt: new Date().toISOString()
              };

              currentData.registrations.unshift(newReg);
              const formatted = JSON.stringify(currentData, null, 2);
              fs.writeFileSync(dataPath, formatted, 'utf-8');
              fs.writeFileSync(path.resolve(__dirname, 'data.json'), formatted, 'utf-8');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, registration: newReg }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: String(err) }));
            }
          });
          return;
        }

        if (url === '/api/press-accreditation' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const pressData = JSON.parse(body);
              const dataPath = path.resolve(__dirname, 'public/data.json');
              let currentData: any = {};
              if (fs.existsSync(dataPath)) {
                currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
              }
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
              const formatted = JSON.stringify(currentData, null, 2);
              fs.writeFileSync(dataPath, formatted, 'utf-8');
              fs.writeFileSync(path.resolve(__dirname, 'data.json'), formatted, 'utf-8');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, accreditation: newAccreditation }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: String(err) }));
            }
          });
          return;
        }

        if (url === '/api/contact' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const contactData = JSON.parse(body);
              const dataPath = path.resolve(__dirname, 'public/data.json');
              let currentData: any = {};
              if (fs.existsSync(dataPath)) {
                currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
              }
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
              const formatted = JSON.stringify(currentData, null, 2);
              fs.writeFileSync(dataPath, formatted, 'utf-8');
              fs.writeFileSync(path.resolve(__dirname, 'data.json'), formatted, 'utf-8');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: newMsg }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: String(err) }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), jsonDatabasePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html'),
          mentionsLegales: path.resolve(__dirname, 'mentions-legales.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
