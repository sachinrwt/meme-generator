import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ExternalLink, ArrowUp, MessageCircle, Eye, Play, Image } from 'lucide-react';
import { MemeTemplate } from '../types/meme';

interface RedditMeme {
  id: string;
  title: string;
  url: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  created: number;
  thumbnail: string;
  isVideo: boolean;
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
  videoUrl?: string;
}

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

interface TrendingMemesProps {
  onTemplateSelect?: (template: MemeTemplate) => void;
}

const TrendingMemes: React.FC<TrendingMemesProps> = ({ onTemplateSelect }) => {
  const [memes, setMemes] = useState<RedditMeme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState('memes');
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());

  const subreddits = [
    { name: 'memes', label: 'Memes' },
    { name: 'dankmemes', label: 'Dank Memes' },
    { name: 'funny', label: 'Funny' },
    { name: 'meirl', label: 'Me IRL' },
    { name: 'wholesomememes', label: 'Wholesome' },
    { name: 'IndianMemeTemplates', label: 'Indian Templates' }
  ];

  const handlePlayVideo = (memeId: string) => {
    setPlayingVideos(prev => new Set(prev).add(memeId));
  };

  const handleVideoEnd = (memeId: string) => {
    setPlayingVideos(prev => {
      const newSet = new Set(prev);
      newSet.delete(memeId);
      return newSet;
    });
  };

  const handleUseAsTemplate = (meme: RedditMeme) => {
    if (!onTemplateSelect) return;
    
    // For Reddit images, try to get the direct image URL
    let templateUrl = meme.url;
    let videoUrl = '';
    
    if (meme.isVideo) {
      templateUrl = meme.thumbnail !== 'self' ? meme.thumbnail : '/placeholder.svg';
      videoUrl = meme.videoUrl || '';
      
      // If no video URL found, try to construct one from the original URL
      if (!videoUrl && meme.url.includes('v.redd.it')) {
        videoUrl = meme.url;
      }
    } else {
      // For images, try to ensure we have a direct image URL
      if (meme.url.includes('i.redd.it') || meme.url.includes('imgur.com')) {
        templateUrl = meme.url;
      } else if (meme.thumbnail && meme.thumbnail !== 'self') {
        templateUrl = meme.thumbnail;
      } else {
        templateUrl = '/placeholder.svg';
      }
    }
    
    console.log('Creating template from Reddit meme:', {
      id: meme.id,
      title: meme.title,
      isVideo: meme.isVideo,
      originalUrl: meme.url,
      thumbnail: meme.thumbnail,
      templateUrl: templateUrl,
      videoUrl: videoUrl,
      memeData: meme
    });
    
    const template: MemeTemplate = {
      id: `reddit-${meme.id}`,
      name: `Reddit: ${meme.title.substring(0, 30)}${meme.title.length > 30 ? '...' : ''}`,
      url: templateUrl,
      width: 500,
      height: 500,
      isVideo: meme.isVideo,
      videoUrl: videoUrl
    };
    
    console.log('Final template:', template);
    onTemplateSelect(template);
  };

  const fetchMemes = async (subreddit: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Using Reddit's JSON API
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=12`);
      const data: RedditResponse = await response.json();
      
      if (data.error) {
        throw new Error('Failed to fetch memes');
      }

      const memePosts = data.data.children
        .map((child) => child.data)
        .filter((post: RedditPost) => 
          post.post_hint === 'image' || 
          post.post_hint === 'video' ||
          post.is_video ||
          post.url.includes('i.redd.it') || 
          post.url.includes('imgur.com') ||
          post.url.includes('v.redd.it')
        )
        .slice(0, 12)
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

          // Debug logging
          if (post.is_video || post.url.includes('v.redd.it')) {
            console.log('Video post found:', {
              id: post.id,
              title: post.title,
              is_video: post.is_video,
              url: post.url,
              videoUrl: videoUrl,
              media: post.media,
              secure_media: post.secure_media
            });
          }

          return {
            id: post.id,
            title: post.title,
            url: post.url,
            author: post.author,
            subreddit: post.subreddit,
            score: post.score,
            numComments: post.num_comments,
            created: post.created_utc,
            thumbnail: post.thumbnail,
            isVideo: post.is_video || post.url.includes('v.redd.it'),
            media: post.media,
            secure_media: post.secure_media,
            videoUrl: videoUrl
          };
        });

      setMemes(memePosts);
    } catch (err) {
      setError('Failed to load trending memes. Please try again later.');
      console.error('Error fetching memes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemes(selectedSubreddit);
  }, [selectedSubreddit]);

  const formatTime = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const formatScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
    return score.toString();
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchMemes(selectedSubreddit)}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subreddit Selector */}
      <div className="flex flex-wrap gap-2">
        {subreddits.map((sub) => (
          <Button
            key={sub.name}
            variant={selectedSubreddit === sub.name ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSubreddit(sub.name)}
            className="text-sm"
          >
            r/{sub.name}
          </Button>
        ))}
      </div>

      {/* Memes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          memes.map((meme) => (
            <Card key={meme.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative group aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {meme.isVideo ? (
                  playingVideos.has(meme.id) ? (
                    <video
                      src={meme.videoUrl}
                      className="w-full h-full object-contain p-2"
                      controls
                      autoPlay
                      onEnded={() => handleVideoEnd(meme.id)}
                      onError={(e) => {
                        console.log('Video failed to load:', meme.videoUrl);
                        handleVideoEnd(meme.id);
                      }}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={meme.videoUrl}
                        className="w-full h-full object-contain p-2"
                        preload="metadata"
                        muted
                        onLoadedData={(e) => {
                          const video = e.target as HTMLVideoElement;
                          video.currentTime = 0.1; // Set to first frame
                        }}
                        onError={(e) => {
                          // Fallback to Reddit thumbnail if video fails
                          const target = e.target as HTMLVideoElement;
                          const img = document.createElement('img');
                          img.src = meme.thumbnail !== 'self' ? meme.thumbnail : '/placeholder.svg';
                          img.className = 'w-full h-full object-contain p-2';
                          target.parentNode?.replaceChild(img, target);
                        }}
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={() => handlePlayVideo(meme.id)}
                      >
                        <div className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <img
                    src={meme.url}
                    alt={meme.title}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                    loading="lazy"
                  />
                )}
                {meme.isVideo && !playingVideos.has(meme.id) && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs bg-black bg-opacity-70 text-white">
                      Video
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <CardTitle className="text-sm font-medium line-clamp-2 mb-3 min-h-[2.5rem]">
                  {meme.title}
                </CardTitle>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      <span>{formatScore(meme.score)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{formatScore(meme.numComments)}</span>
                    </div>
                  </div>
                  <span>{formatTime(meme.created)}</span>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="secondary" className="text-xs">
                    u/{meme.author}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    r/{meme.subreddit}
                  </Badge>
                </div>
                
                {onTemplateSelect && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUseAsTemplate(meme)}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Use as Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button 
          onClick={() => fetchMemes(selectedSubreddit)}
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Loading...' : 'Refresh Memes'}
        </Button>
      </div>
    </div>
  );
};

export default TrendingMemes; 