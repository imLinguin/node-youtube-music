import axios from 'axios';
import context from './context';
import { AlbumPreview } from './models';
import { parseAlbumItem } from './parsers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseSearchAlbumsBody = (body: any): AlbumPreview[] => {
  const {
    contents,
  } = body.contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].musicShelfRenderer;

  const results: AlbumPreview[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contents.forEach((content: any) => {
    try {
      const album = parseAlbumItem(content);
      if (album) {
        results.push(album);
      }
    } catch (err) {
      console.error(err);
    }
  });
  return results;
};

export async function searchAlbums(query: string): Promise<AlbumPreview[]> {
  const {data} = await axios({
    url:
      'https://music.youtube.com/youtubei/v1/search?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
    method: 'POST',
    responseType: 'json',
    data: {
      ...context.body,
      params: 'EgWKAQIYAWoKEAkQAxAEEAUQCg%3D%3D',
      query,
    },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      origin: 'https://music.youtube.com',
    },
  });
  try {
    return parseSearchAlbumsBody(data);
  } catch (e) {
    console.error(e);
    return [];
  }
}
