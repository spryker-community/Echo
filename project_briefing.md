# Community Echo

## Project Overview
A web application that automatically collects, filters, and generates internal posts about activities in our community for internal communication and engagement.

### Business Goals
- Streamline the process of monitoring community engagement across platforms
- Generate consistent, engaging internal communications about community activities
- Save time by automating content curation, segmentation and initial post drafting
- Increase internal awareness of community activities
- Encourage employee interaction with community content

## Technical Architecture

### Frontend Architecture
1. **Framework & UI**
   - React with Vite for build tooling
   - TypeScript for type safety
   - ShadCN UI component library for consistent design
   - TailwindCSS for styling (Dark Mode only)

2. **State Management**
   - React Context for global state
   - Browser's LocalStorage for persistence
   - React Query for data fetching and caching

3. **Key Components**
   - SourceManager: Manages content source configurations
   - FeedViewer: Displays aggregated content in cards
   - MessageGenerator: Handles AI post generation
   - ContentFilter: Filters content by source/type
   - AudienceSelector: Manages target audience selection
   - .env file for environment variables like API keys and company-specific settings
   - configuration file(S) for more generic configuration like prompt templates

### Integration Layer
1. **Content Sources**
   - REST API clients for:
     - Vanilla Forum API (start implementation here)
     - YouTube Data API
     - GitHub API
   - RSS/Atom feed parser for generic sources

2. **AI Integration**
   - OpenRouter API client
   - Prompt template management (in config file)
   - Error handling and retry logic

### Data Model
```typescript
interface ContentItem {
  id: string;
  source: string;
  type: 'forum' | 'youtube' | 'github' | 'rss';
  title: string;
  description: string;
  url: string;
  date: string;
  image?: string;
  metadata: Record<string, unknown>;
}

interface GeneratedPost {
  content: string;
  targetAudiences: string[];
  sourceItem: ContentItem;
  generatedAt: string;
}

interface SourceConfig {
  id: string;
  type: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
}
```

## Core Features

### Content Ingestion
- Configurable source management in a settings file. Frontend users should be able to enable/disable sources, but not add sources
- Automated content fetching on page load
- Preview capabilities
- Error handling and logging

### Content Filtering
- Filter by source (show each source in the frontend that the users can toggle on/off)

### Message Generation
1. **Audience Analysis**
   - AI-powered audience targeting
   - Before creating the message, first use AI to determine the ideal audience(s) (e.g. team(s) within Spryker) for this message:
Cloud Operations
Customer Succes
Partner Success
Community Team
Strategy & Operations
Academy/Training
Engineering
Architecture
Sales
Marketing
Talent Acquisition
Product
Security
Customer Support

2. **Post Generation**
   - Context-aware message creation
   - Tailored message towards the determined audience(s)
   - Emoji integration
   - Source attribution
   - Link inclusion
   - Tone adherence to guidelines
   - Prohibited phrase filtering
   - Allow for custom instructions
   - in the configuration file, add a list of prohibited word.
  
### User Interface
- Clean, responsive design based on shadcn/ui
- Card-based content display
- Quick actions (regenerate, edit, copy)
- Source filtering
- Preview capabilities
- Well formatted generated text, for easy reading and copy-pasting

## Technical Requirements
- Serverless deployment on Netlify
- Client-side storage only (no database)
- Environment-based configuration
- OpenRouter API integration
- Responsive design
- Error boundaries

## Development Guidelines
1. **Code Organization**
   - Feature-based folder structure
   - Shared components library
   - Utility functions
   - Custom hooks
   - Type definitions

2. **Best Practices**
   - TypeScript strict mode
   - ESLint configuration
   - Prettier for formatting
   - Git commit conventions
   - Component documentation

3. **Testing Strategy**
   - Unit tests for utilities
   - Component testing with React Testing Library
   - Integration tests for key flows
   - E2E testing with Cypress

## Deployment
1. **Build Process**
   - Environment-specific builds
   - Asset optimization
   - Code splitting
   - Bundle analysis

2. **CI/CD Pipeline**
   - Automated testing
   - Preview deployments
   - Production deployments
   - Environment variable management

3. Environmental Variables
**AI API Configuration**
AI_MODEL
OPENROUTER_API_KEY

**Spryker RSS Feed Configuration**
RSS_FEED_1_NAME=GA Alert - Spryker
RSS_FEED_1_URL=https://www.google.com/alerts/feeds/04288146559899557404/6943053902213031207
RSS_FEED_2_NAME=GA Alert - CQ
RSS_FEED_2_URL=https://www.google.com/alerts/feeds/04288146559899557404/13185436793153929684
RSS_FEED_3_NAME=Basecom
RSS_FEED_3_URL=https://www.basecom.de/feed/
Dynamically continue with more items

**Vanilla Forum V2 API Keys**
VITE_FORUM_API_URL=https://forum.commercequest.space
VITE_FORUM_API_KEY

**Spryker YouTube Configuration**
YOUTUBE_API_TOKEN
YOUTUBE_CHANNEL_ID

**Ingest filter**
KEYWORDS

# Message examples we manually created previously:

A community member posted some nice lines about Sprykers GPTs :) German though but cool nevertheless. https://www.linkedin.com/posts/evgeny-nekhamkin-b63312247_spryker-customgpts-ecommerce-activity-7269646868710625281-dhIm?utm_source=share&utm_medium=member_android share your love :two_hearts:

We have been mentioned in a report of OpenCommerce that analyzed the Dutch/Western European commerce market :muscle: https://spryker.slack.com/archives/C03MVLL5N6Q/p1732010618040949

For those that sometimes ask "What happened at previous hackathons": https://commercequest.space/event-recap/ has been updated with the EXCITE hackathon, EXCITE Devstage and Siemens hackathon. When available we've added links to the Github Repositories, the Video recordings and I've now also added links to the photoalbums for most events. All public, so feel free to share where needed with customers/partners

Hi fellow Developer Sprykees! :heart_hands::skin-tone-3: we will be hosting a virtual hackathon-lite experience from the 14th-18th of October for our community. It's basically a week in which our community can contribute to what we do: from small bug fixes to major innovation lab ideas :slightly_smiling_face: everything is possible. A few more information can be found here: https://forum.commercequest.space/discussion/28994/hackweek-is-coming/p1?new=1
If you're in contact with any customer/partner developer, feel free to let them know about it! :partying_face:

@antonio.mansilla shared a nice post about his recent community contributions. Let's show him some SPRYKER LOVE :heart_hands::skin-tone-2: https://www.linkedin.com/posts/amansilla_innovation-ai-opensource-activity-7196811169897029632-MpqR?utm_source=share&utm_medium=member_desktop