// Cloudflare Worker — handles /api/submit-story and /api/health
// All other requests are served by Cloudflare Pages (static files)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/health') {
      return Response.json({ status: 'ok' }, { headers: corsHeaders });
    }

    if (url.pathname === '/api/submit-story' && request.method === 'POST') {
      try {
        const { properties } = await request.json();

        const NOTION_API_KEY = env.NOTION_API_KEY;
        const NOTION_DATABASE_ID = env.NOTION_DATABASE_ID || '9483eb53-9bc8-45e0-bba4-b5be3b33f399';

        if (!NOTION_API_KEY) {
          return Response.json({ success: false, error: 'Notion API key not configured' }, { status: 500, headers: corsHeaders });
        }

        // Build Notion page properties
        const notionProperties = {
          'Name': {
            title: [{ text: { content: properties.Name?.title?.[0]?.text?.content || 'Anonymous' } }]
          }
        };

        const email = properties.Email?.email;
        if (email) notionProperties['Email'] = { email };

        const richTextFields = ['Country', 'State/Province/Region', 'Story', 'Looking Back'];
        for (const field of richTextFields) {
          const val = properties[field]?.rich_text?.[0]?.text?.content;
          if (val) notionProperties[field] = { rich_text: [{ text: { content: val } }] };
        }

        const selectFields = ['Case Status', 'Self-Represented', 'Accommodation Asked', 'Accommodation Result', 'Story Permission'];
        for (const field of selectFields) {
          const val = properties[field]?.select?.name;
          if (val) notionProperties[field] = { select: { name: val } };
        }

        const multiSelectFields = ['Case Type', 'Participation Barriers'];
        for (const field of multiSelectFields) {
          const items = properties[field]?.multi_select;
          if (items && items.length > 0) notionProperties[field] = { multi_select: items };
        }

        notionProperties['Consent'] = { checkbox: properties.Consent?.checkbox === true };

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
          return Response.json({ success: false, error: data.message || 'Notion API error' }, { status: 500, headers: corsHeaders });
        }

        return Response.json({ success: true, message: 'Story submitted successfully', id: data.id }, { headers: corsHeaders });

      } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};
