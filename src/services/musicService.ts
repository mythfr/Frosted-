import { Song } from '../types';
import { logger } from './logger';

const API_BASE_URL = 'https://jiosaavn-api-eight-lovat.vercel.app/api';

const trimMetadata = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\(Original Motion Picture Soundtrack\)/gi, '')
    .replace(/\(From ".*"\)/gi, '')
    .replace(/\[From ".*"\]/gi, '')
    .replace(/\(feat\..*\)/gi, '')
    .replace(/\[feat\..*\]/gi, '')
    .replace(/\(Remix\)/gi, '')
    .replace(/\[Remix\]/gi, '')
    .replace(/\(Lyrical\)/gi, '')
    .replace(/\(Video\)/gi, '')
    .replace(/\(Audio\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const mapApiSong = (item: any): Song => {
  // Get highest quality image (usually last in array)
  const imageArray = item.image || [];
  const coverUrl = imageArray[imageArray.length - 1]?.url || 
                   imageArray[0]?.url || 
                   'https://picsum.photos/seed/music/600/600';
  
  // Get highest quality download URL (usually last in array, 320kbps)
  const downloadArray = item.downloadUrl || [];
  const previewUrl = downloadArray[downloadArray.length - 1]?.url || 
                     downloadArray[0]?.url ||
                     downloadArray[downloadArray.length - 1]?.link ||
                     downloadArray[0]?.link;

  // Extract artist name and ID from the nested structure
  const primaryArtistObj = item.artists?.primary?.[0] || {};
  const primaryArtist = primaryArtistObj.name || item.primaryArtists || 'Unknown Artist';
  const artistId = primaryArtistObj.id || '';

  return {
    id: item.id,
    title: trimMetadata(item.name),
    artist: trimMetadata(primaryArtist),
    artistId: artistId,
    album: trimMetadata(item.album?.name || 'Unknown Album'),
    albumId: item.album?.id || '',
    duration: formatDuration(item.duration),
    coverUrl: coverUrl,
    previewUrl: previewUrl
  };
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query) return [];
  
  try {
    const url = `${API_BASE_URL}/search/songs?query=${encodeURIComponent(query)}`;
    logger.info('Fetching songs from JioSaavn API', { query, url });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const json = await response.json();
    const results = json.data?.results || json.data || [];
    
    const songs = results.map(mapApiSong);
    return uniqueById(songs);
  } catch (error: any) {
    logger.error('Error fetching from JioSaavn API', { error: error.message, query });
    return [];
  }
};

export const searchAlbums = async (query: string): Promise<any[]> => {
  if (!query) return [];
  try {
    const url = `${API_BASE_URL}/search/albums?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const json = await response.json();
    const results = json.data?.results || json.data || [];
    const albums = results.map((item: any) => ({
      id: item.id,
      title: trimMetadata(item.name),
      artistName: trimMetadata(item.artist || item.primaryArtists || 'Unknown Artist'),
      coverUrl: item.image?.[item.image.length - 1]?.url || item.image?.[0]?.url,
      releaseDate: item.year || ''
    }));
    return uniqueById(albums);
  } catch (error) {
    return [];
  }
};

export const searchArtists = async (query: string): Promise<any[]> => {
  if (!query) return [];
  try {
    const url = `${API_BASE_URL}/search/artists?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const json = await response.json();
    const results = json.data?.results || json.data || [];
    const artists = results.map((item: any) => ({
      id: item.id,
      name: trimMetadata(item.name),
      imageUrl: item.image?.[item.image.length - 1]?.url || item.image?.[0]?.url
    }));
    return uniqueById(artists);
  } catch (error) {
    return [];
  }
};

const uniqueById = <T extends { id: string }>(items: T[]): T[] => {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
};

export const getAlbumDetails = async (albumId: string): Promise<any> => {
  try {
    const url = `${API_BASE_URL}/albums?id=${albumId}`;
    logger.info('Fetching album details', { albumId, url });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
    
    const json = await response.json();
    const data = json.data;
    
    if (!data) return null;

    const songs = (data.songs || []).map(mapApiSong);

    return {
      id: data.id,
      title: trimMetadata(data.name),
      artistName: trimMetadata(data.artists?.primary?.[0]?.name || data.primaryArtists || 'Unknown Artist'),
      artistId: data.artists?.primary?.[0]?.id || '',
      releaseDate: data.year || 'Unknown Year',
      coverUrl: data.image?.[data.image.length - 1]?.url || data.image?.[0]?.url,
      songs: uniqueById(songs)
    };
  } catch (error: any) {
    logger.error('Error fetching album details', { error: error.message, albumId });
    return null;
  }
};

export const getArtistDetails = async (artistId: string): Promise<any> => {
  try {
    const url = `${API_BASE_URL}/artists?id=${artistId}`;
    logger.info('Fetching artist details', { artistId, url });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
    
    const json = await response.json();
    const data = json.data;
    
    if (!data) return null;

    const topSongs = (data.topSongs || []).map(mapApiSong);
    const topAlbums = (data.topAlbums || []).map((album: any) => ({
      id: album.id,
      title: trimMetadata(album.name),
      coverUrl: album.image?.[album.image.length - 1]?.url || album.image?.[0]?.url,
      releaseDate: album.year || ''
    }));

    return {
      id: data.id,
      name: trimMetadata(data.name),
      imageUrl: data.image?.[data.image.length - 1]?.url || data.image?.[0]?.url,
      bio: data.bio?.[0]?.text || 'No bio available.',
      followerCount: data.fanCount || data.followerCount,
      topSongs: uniqueById(topSongs),
      topAlbums: uniqueById(topAlbums)
    };
  } catch (error: any) {
    logger.error('Error fetching artist details', { error: error.message, artistId });
    return null;
  }
};

export const getLyrics = async (songId: string): Promise<string[]> => {
  try {
    const url = `${API_BASE_URL}/songs/lyrics?id=${songId}`;
    logger.info('Fetching lyrics from JioSaavn API', { songId, url });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const json = await response.json();
    if (json.status === 'SUCCESS' && json.data?.lyrics) {
      // Split lyrics by newline and filter out empty lines
      return json.data.lyrics.split('\n').filter((line: string) => line.trim() !== '');
    }
    
    return [];
  } catch (error: any) {
    logger.error('Error fetching lyrics', { error: error.message, songId });
    return [];
  }
};

export const getSyncedLyrics = async (title: string, artist: string): Promise<{text: string, time: number}[] | null> => {
  try {
    // Clean up title and artist for better search results
    const cleanTitle = title.replace(/\(.*\)|\[.*\]/g, '').trim();
    const cleanArtist = artist.split(',')[0].split('&')[0].trim();
    
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    logger.info('Fetching synced lyrics from LRCLIB', { url });
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0) {
      // Find the best match with synced lyrics
      const match = data.find((d: any) => d.syncedLyrics);
      if (match && match.syncedLyrics) {
        const lines = match.syncedLyrics.split('\n');
        const result: {text: string, time: number}[] = [];
        // Match LRC format: [mm:ss.xx] text
        const regex = /\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/;
        
        for (const line of lines) {
          const m = line.match(regex);
          if (m) {
            const mins = parseInt(m[1], 10);
            const secs = parseFloat(m[2]);
            const text = m[3].trim();
            if (text) {
              result.push({ time: mins * 60 + secs, text });
            }
          }
        }
        return result.length > 0 ? result : null;
      }
    }
  } catch (error: any) {
    logger.error('Error fetching synced lyrics', { error: error.message });
  }
  return null;
};

export const getSongSuggestions = async (songId: string): Promise<Song[]> => {
  try {
    const url = `${API_BASE_URL}/songs/${songId}/suggestions`;
    logger.info('Fetching song suggestions', { songId, url });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
    
    const json = await response.json();
    const results = json.data || [];
    
    const songs = results.map(mapApiSong);
    return uniqueById(songs);
  } catch (error: any) {
    logger.error('Error fetching song suggestions', { error: error.message, songId });
    return [];
  }
};

const formatDuration = (seconds: number | string): string => {
  const sec = typeof seconds === 'string' ? parseInt(seconds) : seconds;
  if (isNaN(sec)) return '0:00';
  const minutes = Math.floor(sec / 60);
  const remainingSeconds = sec % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};
