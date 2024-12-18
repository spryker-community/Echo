# Echo - Content Aggregator

Echo is a modern content aggregator built with Astro, TypeScript, and Tailwind CSS. It aggregates content from various sources including Gartner reviews, RSS feeds, YouTube videos, forum posts, and BlueSky posts into a unified dashboard.

## Features

- 🔄 Automatic content aggregation from multiple sources
- 📊 Source-specific filters and status indicators
- 🌓 Dark/light mode support
- 🎯 Content filtering and organization
- 🔄 GitHub Actions automation for content fetching
- 📱 Responsive design

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Echo.git
cd Echo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and configure your environment variables:
```bash
cp .env.example .env
```

4. Configure your content sources in `src/config/sources.ts`

## Development

Start the development server:
```bash
npm run dev
```

## Content Sources

### Gartner Reviews
- Reviews are automatically fetched every 6 hours via GitHub Actions
- Manual fetch can be triggered from the GitHub Actions tab
- Reviews are stored in `public/data/gartner-reviews.json`

### RSS Feeds
- Configure RSS feeds in your `.env` file:
```env
VITE_RSS_FEED_1_NAME="Feed Name"
VITE_RSS_FEED_1_URL="https://feed-url.com/feed.xml"
```

### Other Sources
- YouTube: Requires YouTube API credentials
- BlueSky: Requires BlueSky authentication
- Forum: Requires forum API configuration

## Deployment

The project is configured for deployment on Netlify in Static mode. Push to your main branch to trigger automatic deployments.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
