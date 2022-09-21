import axios from 'axios';
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
  const response: any = await axios({
    url:
      'https://music.youtube.com/youtubei/v1/search?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
    method: 'POST',
    responseType: 'json',
    data: {
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
    const {
      contents,
    } = response.data.contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer;
    const array: any[] = [];
    contents.forEach((shelf: any) => {
      if (shelf.musicShelfRenderer) {
        shelf.musicShelfRenderer.contents.forEach((element: any) => {
          if (element.musicResponsiveListItemRenderer?.navigationEndpoint) {
            // Album, Artist or Playlist
            const navigationEndpoint =
              element.musicResponsiveListItemRenderer?.navigationEndpoint;

            const pageType = navigationEndpoint.watchEndpoint
              ? navigationEndpoint.watchEndpoint
                  .watchEndpointMusicSupportedConfigs.watchEndpointMusicConfig
                  .musicVideoType
              : navigationEndpoint.browseEndpoint
                  .browseEndpointContextSupportedConfigs
                  .browseEndpointContextMusicConfig.pageType;

            switch (pageType) {
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
                array.push(parseMusicItem(element));
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
