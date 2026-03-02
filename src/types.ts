export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  duration: string;
  coverUrl: string;
  previewUrl?: string;
  lyrics?: string[];
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  bio: string;
  genres: string[];
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  releaseDate: string;
  coverUrl: string;
  songs: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  coverUrl?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  avatarUrl: string;
  listeningHistory: { song: Song; playedAt: string }[];
  topArtists: string[];
}
