import got from 'got';
import {
  parseAlbumItem,
  parseArtistSearchResult,
  parsePlaylistItem,
  parseMusicItem,
} from './parsers';
import { searchArtists } from './searchArtists';
import { searchAlbums } from './searchAlbums';
import { searchMusics } from './searchMusics';
import { searchPlaylists } from './searchPlaylists';
import context from './context';
import { SearchType, PageType } from './models';

export async function handleMultiTypeSearch(query: string) {
  const res:any = await got.post('https://music.youtube.com/youtubei/v1/search?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',{
    json: {
      ...context.body,
      query,
    },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept-Language': 'en',
      origin: 'https://music.youtube.com',
    },
  });

  try {
    const response = JSON.parse(res.body)
    const {
      contents,
    } = response.contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer;

    const array: any[] = [];
    contents.forEach((shelf: any) => {
      if (shelf.musicShelfRenderer) {
        shelf.musicShelfRenderer.contents.forEach((element: any) => {
          if (element.musicResponsiveListItemRenderer?.navigationEndpoint) {
            // Album, Artist or Playlist
            switch (
              element.musicResponsiveListItemRenderer?.navigationEndpoint
                .browseEndpoint.browseEndpointContextSupportedConfigs
                .browseEndpointContextMusicConfig.pageType
            ) {
              case PageType.album:
                array.push(parseAlbumItem(element));
                break;
              case PageType.artist:
                array.push(parseArtistSearchResult(element));
                break;
              case PageType.playlist:
                array.push(parsePlaylistItem(element, false));
                break;
              default:
                break;
            }
          } else {
            // Video
            array.push(parseMusicItem(element));
          }
        });
      }
    });
    return array;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function search(query: string, type?: SearchType) {
  switch (type) {
    case SearchType.album:
      return searchAlbums(query);
    case SearchType.artist:
      return searchArtists(query);
    case SearchType.music:
      return searchMusics(query);
    case SearchType.playlist:
      return searchPlaylists(query);
    default:
      return handleMultiTypeSearch(query);
  }
}
