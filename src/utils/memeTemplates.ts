import { MemeTemplate } from '../types/meme';

// Interface for Reddit post data
interface RedditPost {
  id: string;
  title: string;
  url: string;
  author: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  thumbnail: string;
  is_video: boolean;
  post_hint?: string;
  media?: {
    reddit_video?: {
      fallback_url: string;
    };
  };
  secure_media?: {
    reddit_video?: {
      fallback_url: string;
    };
  };
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
  error?: string;
}

// Function to fetch Reddit posts and convert them to meme templates
export const fetchRedditMemeTemplates = async (subreddit: string = 'memes', limit: number = 15): Promise<MemeTemplate[]> => {
  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`);
    const data: RedditResponse = await response.json();
    
    if (data.error) {
      throw new Error('Failed to fetch Reddit posts');
    }

    const memeTemplates: MemeTemplate[] = data.data.children
      .map((child) => child.data)
      .filter((post: RedditPost) => 
        post.post_hint === 'image' || 
        post.post_hint === 'video' ||
        post.is_video ||
        post.url.includes('i.redd.it') || 
        post.url.includes('imgur.com') ||
        post.url.includes('v.redd.it')
      )
      .slice(0, limit)
      .map((post: RedditPost) => {
        // Extract video URL properly
        let videoUrl = '';
        if (post.is_video && post.media?.reddit_video?.fallback_url) {
          videoUrl = post.media.reddit_video.fallback_url;
        } else if (post.is_video && post.secure_media?.reddit_video?.fallback_url) {
          videoUrl = post.secure_media.reddit_video.fallback_url;
        } else if (post.url.includes('v.redd.it')) {
          videoUrl = post.url;
        }

        // Determine template URL
        let templateUrl = post.url;
        if (post.is_video) {
          templateUrl = post.thumbnail !== 'self' ? post.thumbnail : '/placeholder.svg';
        } else {
          if (post.url.includes('i.redd.it') || post.url.includes('imgur.com')) {
            templateUrl = post.url;
          } else if (post.thumbnail && post.thumbnail !== 'self') {
            templateUrl = post.thumbnail;
          } else {
            templateUrl = '/placeholder.svg';
          }
        }

        return {
          id: `reddit-${post.id}`,
          name: `Reddit: ${post.title.substring(0, 40)}${post.title.length > 40 ? '...' : ''}`,
          url: templateUrl,
          width: 500,
          height: 500,
          isVideo: post.is_video,
          videoUrl: videoUrl
        };
      });

    return memeTemplates;
  } catch (error) {
    console.error('Error fetching Reddit meme templates:', error);
    // Return fallback templates if Reddit API fails
    return getFallbackTemplates();
  }
};

// Fallback templates in case Reddit API fails
const getFallbackTemplates = (): MemeTemplate[] => [
  {
    id: 'fallback-1',
    name: 'Classic Meme Template',
    url: '/placeholder.svg',
    width: 500,
    height: 400,
  },
  {
    id: 'fallback-2',
    name: 'Another Template',
    url: '/placeholder.svg',
    width: 500,
    height: 400,
  },
];

// Legacy static templates (kept for backward compatibility)
export const popularMemeTemplates: MemeTemplate[] = [
  {
    id: 'reddit-meme-1',
    name: 'Reddit: Drake Hotline Bling',
    url: 'https://i.imgur.com/8tBXd6Q.jpg',
    width: 700,
    height: 468,
  },
  {
    id: 'reddit-meme-2',
    name: 'Reddit: Distracted Boyfriend',
    url: 'https://i.imgur.com/4uX4tja.jpg',
    width: 500,
    height: 400,
  },
  {
    id: 'reddit-meme-3',
    name: 'Reddit: Woman Yelling at Cat',
    url: 'https://i.imgur.com/345VuXr.jpg',
    width: 500,
    height: 300,
  },
  {
    id: 'reddit-meme-4',
    name: 'Reddit: Expanding Brain',
    url: 'https://i.imgur.com/8tBXd6Q.jpg',
    width: 500,
    height: 600,
  },
  {
    id: 'reddit-meme-5',
    name: 'Reddit: This is Fine Dog',
    url: 'https://i.imgur.com/4uX4tja.jpg',
    width: 500,
    height: 400,
  },
  {
    id: 'reddit-meme-6',
    name: 'Reddit: Two Buttons',
    url: 'https://i.imgur.com/345VuXr.jpg',
    width: 500,
    height: 500,
  },
  {
    id: 'reddit-meme-7',
    name: 'Reddit: Change My Mind',
    url: 'https://i.imgur.com/8tBXd6Q.jpg',
    width: 500,
    height: 400,
  },
  {
    id: 'reddit-meme-8',
    name: 'Reddit: Surprised Pikachu',
    url: 'https://i.imgur.com/4uX4tja.jpg',
    width: 500,
    height: 400,
  },
  {
    id: 'reddit-video-1',
    name: 'Reddit: Funny Cat Video',
    url: 'https://i.imgur.com/345VuXr.jpg',
    width: 500,
    height: 400,
    isVideo: true,
    videoUrl: 'https://v.redd.it/funny-cat-video.mp4',
  },
  {
    id: 'reddit-video-2',
    name: 'Reddit: Epic Fail Compilation',
    url: 'https://i.imgur.com/8tBXd6Q.jpg',
    width: 500,
    height: 400,
    isVideo: true,
    videoUrl: 'https://v.redd.it/epic-fail-video.mp4',
  },
  {
    id: 'reddit-video-3',
    name: 'Reddit: Dog Tricks',
    url: 'https://i.imgur.com/4uX4tja.jpg',
    width: 500,
    height: 400,
    isVideo: true,
    videoUrl: 'https://v.redd.it/dog-tricks-video.mp4',
  },
  {
    id: 'reddit-meme-9',
    name: 'Reddit: Wojak Pointing',
    url: 'https://i.imgur.com/345VuXr.jpg',
    width: 500,
    height: 400,
  },
  {
    id: 'reddit-meme-10',
    name: 'Reddit: Success Kid',
    url: 'https://i.imgur.com/8tBXd6Q.jpg',
    width: 500,
    height: 400,
  },
  {
    id: 'reddit-meme-11',
    name: 'Reddit: One Does Not Simply',
    url: 'https://i.imgur.com/4uX4tja.jpg',
    width: 500,
    height: 400,
  },
  {
    id: 'reddit-meme-12',
    name: 'Reddit: Ancient Aliens',
    url: 'https://i.imgur.com/345VuXr.jpg',
    width: 500,
    height: 400,
  },
];
