import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENQUIRIES_FILE = path.join(__dirname, 'enquiries.json');
// Owner email to receive all enquiries (will be updated when provided)
const OWNER_EMAIL = process.env.OWNER_EMAIL || '';

interface EnquiryEntry {
  id: string;
  createdAt: string;
  name: string;
  gmail: string;
  phoneNumber: string;
  purposeCategory: string;
  purposeDetails: string;
}

function loadEnquiries(): EnquiryEntry[] {
  try {
    if (fs.existsSync(ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read enquiries.json:', err);
  }
  return [];
}

function saveEnquiries(list: EnquiryEntry[]) {
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write enquiries.json:', err);
  }
}

async function sendEnquiryToOwnerEmail(entry: EnquiryEntry) {
  if (!OWNER_EMAIL) return;
  try {
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(OWNER_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `New target.in Booking Enquiry from ${entry.name}`,
        Name: entry.name,
        Gmail: entry.gmail,
        Phone: entry.phoneNumber,
        Plan_Purpose: entry.purposeCategory,
        Details: entry.purposeDetails || 'N/A',
        Submitted_At: entry.createdAt,
      }),
    });
  } catch (err) {
    console.error('Email forwarding error:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/enquiry', async (req, res) => {
    try {
      const {
        name = '',
        gmail = '',
        phoneNumber = '',
        purposeCategory = '',
        purposeDetails = '',
      } = req.body || {};

      if (!name || !gmail || !phoneNumber || !purposeCategory) {
        res.status(400).json({ error: 'Name, Gmail, Phone Number, and Purpose are required.' });
        return;
      }

      const entry: EnquiryEntry = {
        id: `enq-${Date.now()}`,
        createdAt: new Date().toISOString(),
        name: name.trim(),
        gmail: gmail.trim(),
        phoneNumber: phoneNumber.trim(),
        purposeCategory: purposeCategory.trim(),
        purposeDetails: purposeDetails ? purposeDetails.trim() : '',
      };

      const existing = loadEnquiries();
      existing.unshift(entry);
      saveEnquiries(existing);

      await sendEnquiryToOwnerEmail(entry);

      res.json({
        success: true,
        entry,
      });
    } catch (error) {
      console.error('Enquiry endpoint error:', error);
      res.status(500).json({ error: 'Failed to submit enquiry.' });
    }
  });

  app.get('/api/enquiries', (_req, res) => {
    res.json({ enquiries: loadEnquiries() });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
