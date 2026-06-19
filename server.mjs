import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Notion config
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || 'ba82018d-8ba0-405e-91d1-7df1602cd28d';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Submit story to Notion via REST API
app.post('/api/submit-story', async (req, res) => {
  try {
    if (!NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY environment variable is not set');
    }

    const { properties } = req.body;

    // Build Notion page properties
    const notionProperties = {
      'Name': {
        title: [{ text: { content: properties.Name?.title?.[0]?.text?.content || 'Anonymous' } }]
      }
    };

    // Email
    const email = properties.Email?.email;
    if (email) notionProperties['Email'] = { email };

    // Rich text fields
    const richTextFields = ['Country', 'State/Province/Region', 'Story', 'Looking Back'];
    for (const field of richTextFields) {
      const val = properties[field]?.rich_text?.[0]?.text?.content;
      if (val) {
        notionProperties[field] = { rich_text: [{ text: { content: val } }] };
      }
    }

    // Select fields
    const selectFields = ['Case Status', 'Self-Represented', 'Accommodation Asked', 'Accommodation Result', 'Story Permission'];
    for (const field of selectFields) {
      const val = properties[field]?.select?.name;
      if (val) {
        notionProperties[field] = { select: { name: val } };
      }
    }

    // Multi-select fields
    const multiSelectFields = ['Case Type', 'Participation Barriers'];
    for (const field of multiSelectFields) {
      const items = properties[field]?.multi_select;
      if (items && items.length > 0) {
        notionProperties[field] = { multi_select: items };
      }
    }

    // Consent checkbox
    notionProperties['Consent'] = { checkbox: properties.Consent?.checkbox === true };

    // Call Notion API
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: notionProperties
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion API error:', data);
      throw new Error(data.message || 'Notion API returned an error');
    }

    console.log('Story submitted successfully, page ID:', data.id);
    res.json({ success: true, message: 'Story submitted successfully', id: data.id });

  } catch (error) {
    console.error('Error submitting story:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit story'
    });
  }
});

// Serve the frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
