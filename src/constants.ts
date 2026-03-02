import { Song, Artist, Album } from './types';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: '4:03',
    coverUrl: 'https://picsum.photos/seed/m83/400/400',
    lyrics: [
      "Waiting in a car",
      "Waiting for a ride in the dark",
      "The night city grows",
      "Look at the horizon glow",
      "Waiting in a car",
      "Waiting for a ride in the dark",
      "The night city grows",
      "Look at the horizon glow",
      "Waiting in a car",
      "Waiting for a ride in the dark"
    ]
  },
  {
    id: '2',
    title: 'Starboy',
    artist: 'The Weeknd',
    album: 'Starboy',
    duration: '3:50',
    coverUrl: 'https://picsum.photos/seed/weeknd/400/400',
    lyrics: [
      "I'm tryna put you in the worst mood, ah",
      "P1 cleaner than your church shoes, ah",
      "Milli point two just to hurt you, ah",
      "All red Lamb' just to tease you, ah",
      "None of these toys on lease too, ah",
      "Made your whole year in a week too, ah",
      "Main bitch out of your league too, ah",
      "Side bitch out of your league too, ah"
    ]
  },
  {
    id: '3',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    coverUrl: 'https://picsum.photos/seed/blinding/400/400',
    lyrics: [
      "I've been on my own for long enough",
      "Maybe you can show me how to love, maybe",
      "I'm going through withdrawals",
      "You don't even have to do too much",
      "You can turn me on with just a touch, baby"
    ]
  },
  {
    id: '4',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: '3:23',
    coverUrl: 'https://picsum.photos/seed/dua/400/400'
  },
  {
    id: '5',
    title: 'Heat Waves',
    artist: 'Glass Animals',
    album: 'Dreamland',
    duration: '3:58',
    coverUrl: 'https://picsum.photos/seed/glass/400/400'
  }
];

export const MOCK_ARTISTS: Artist[] = [
  {
    id: 'a1',
    name: 'The Weeknd',
    imageUrl: 'https://picsum.photos/seed/weeknd-artist/400/400',
    bio: 'Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer-songwriter and record producer.',
    genres: ['R&B', 'Pop']
  },
  {
    id: 'a2',
    name: 'M83',
    imageUrl: 'https://picsum.photos/seed/m83-artist/400/400',
    bio: 'M83 is a French electronic music project formed in Antibes in 1999.',
    genres: ['Electronic', 'Synth-pop']
  }
];

export const MOCK_ALBUMS: Album[] = [
  {
    id: 'alb1',
    title: 'Starboy',
    artistId: 'a1',
    artistName: 'The Weeknd',
    releaseDate: '2016',
    coverUrl: 'https://picsum.photos/seed/weeknd/400/400',
    songs: [MOCK_SONGS[1]]
  },
  {
    id: 'alb2',
    title: 'Hurry Up, We\'re Dreaming',
    artistId: 'a2',
    artistName: 'M83',
    releaseDate: '2011',
    coverUrl: 'https://picsum.photos/seed/m83/400/400',
    songs: [MOCK_SONGS[0]]
  }
];
