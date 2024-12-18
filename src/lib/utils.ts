import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import createDOMPurify from 'dompurify';

const DOMPurify = createDOMPurify(window);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  // If dateString is missing, return a placeholder
  if (!dateString) {
    return 'No date';
  }

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) {
    return 'No date';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return formatDate(dateString);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export function formatForumContent(html: string): string {
  if (!html) return '';

  // First decode HTML entities
  let content = decodeHtmlEntities(html);

  // Define allowed HTML tags and attributes
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'div', 'span', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'strong', 'em', 'i', 'b',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false
  };

  // Sanitize HTML content
  content = DOMPurify.sanitize(content, config);

  // Add Tailwind classes to elements
  content = content
    // Style blockquotes
    .replace(/<blockquote>/g, '<blockquote class="my-4 pl-4 border-l-4 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">')
    
    // Style paragraphs
    .replace(/<p>/g, '<p class="mb-4 last:mb-0">')
    
    // Style code blocks
    .replace(/<pre><code>/g, '<pre class="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto"><code>')
    
    // Style inline code
    .replace(/<code>/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm">')
    
    // Style lists
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2">')
    .replace(/<li>/g, '<li class="text-gray-700 dark:text-gray-300">')
    
    // Style headings
    .replace(/<h1>/g, '<h1 class="text-2xl font-bold mb-4">')
    .replace(/<h2>/g, '<h2 class="text-xl font-bold mb-3">')
    .replace(/<h3>/g, '<h3 class="text-lg font-bold mb-2">')
    
    // Style links
    .replace(/<a /g, '<a class="text-[#00AEEF] hover:text-[#EC008C] hover:underline" target="_blank" rel="noopener noreferrer" ')
    
    // Style images
    .replace(/<img /g, '<img class="rounded-lg max-w-full h-auto my-4" loading="lazy" ');

  return content;
}
