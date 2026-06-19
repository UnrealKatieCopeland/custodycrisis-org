# Rights Require Routes: custodycrisis.org

A Manus webdev project for collecting and preserving family court stories for research, advocacy, and systemic change.

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your Notion API key to `.env`

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Build for production:**
   ```bash
   pnpm build
   ```

## Features

- **Story intake form** with accessibility-focused design
- **Notion database integration** for automatic story submission
- **Responsive design** optimized for all devices
- **High contrast** and readable typography for accessibility
- **Social media links** to connect with Katie

## Form Fields

- Name (optional)
- Email (optional)
- Country (required)
- State/Province/Region (optional)
- Case Type (required)
- Case Status (required)
- Self-Represented Status (required)
- Participation Barriers (multi-select)
- Story (required)
- Consent (required)

## Notion Integration

Form submissions are automatically sent to the "Rights Require Routes: Story Intake" Notion database.

Database ID: `ba82018d-8ba0-405e-91d1-7df1602cd28d`

## Deployment

This project is designed to be deployed on Manus webdev hosting.

## License

© 2026 Katie Copeland. All rights reserved.
