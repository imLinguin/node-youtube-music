import axios from 'axios';
import { MusicVideo } from './models';
import { parseMusicItem } from './parsers';
import context from './context';

export const parseSearchMusicsBody = (body: {
  contents: any;
}): MusicVideo[] => {
  const {
    contents,
  } = body.contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].musicShelfRenderer;

  const results: MusicVideo[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contents.forEach((content: any) => {
    try {
      const song = parseMusicItem(content);
      if (song) {
        results.push(song);
      }
    } catch (e) {
      console.error(e);
    }
  });
  return results;
};

export async function searchMusics(query: string): Promise<MusicVideo[]> {
  const {data} = await axios({
    url:
      'https://music.youtube.com/youtubei/v1/search?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
    method:'POST',
    responseType:'json',
    data: {
      ...context.body,
      params: 'EgWKAQIIAWoKEAoQCRADEAQQBQ%3D%3D',
      query,
    },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      origin: 'https://music.youtube.com',
    },
  });
  try {
    return parseSearchMusicsBody(data);
  } catch {
    return [];
  }
}
