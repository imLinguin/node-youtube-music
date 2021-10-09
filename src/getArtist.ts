import axios from 'axios';
import context from './context';
import { Artist } from './models';
import { parseArtistData } from './parsers';

// eslint-disable-next-line import/prefer-default-export
export async function getArtist(
  artistId: string,
  options?: {
    lang: string;
    country: string;
  }
): Promise<Artist> {
  const { data } = await axios({
    url:
      'https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
    data: { ...context.body, browseId: artistId },
    method:'post',
    responseType:'json',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept-Language': options?.lang ?? 'en',
      origin: 'https://music.youtube.com',
    },
  });

  try {
    return parseArtistData(data, artistId);
  } catch (e) {
    console.error(e);
    return {};
  }
}
