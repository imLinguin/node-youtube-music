import axios from 'axios';
import { MusicVideo } from './models';
import { parseSuggestionItem } from './parsers';
import context from './context';

export const parseGetSuggestionsBody = (body: {
  contents: {
    singleColumnMusicWatchNextResultsRenderer: {
      tabbedRenderer: {
        watchNextTabbedResultsRenderer: {
          tabs: {
            tabRenderer: {
              content: {
                musicQueueRenderer: {
                  content: { playlistPanelRenderer: { contents: [] } };
                };
              };
            };
          }[];
        };
      };
    };
  };
}): MusicVideo[] => {
  const {
    contents,
  } = body.contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer.watchNextTabbedResultsRenderer.tabs[0].tabRenderer.content.musicQueueRenderer.content.playlistPanelRenderer;

  const results: MusicVideo[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contents.forEach((content: any) => {
    try {
      const video = parseSuggestionItem(content);
      if (video) {
        results.push(video);
      }
    } catch (e) {
      console.error(e);
    }
  });
  return results;
};

export async function getSuggestions(videoId: string): Promise<MusicVideo[]> {
  const {data} = await axios({
    url:
      'https://music.youtube.com/youtubei/v1/next?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
    method:'POST',
    responseType:'json',
    data: {
      ...context.body,
      enablePersistentPlaylistPanel: true,
      isAudioOnly: true,
      params: 'mgMDCNgE',
      playerParams: 'igMDCNgE',
      tunerSettingValue: 'AUTOMIX_SETTING_NORMAL',
      videoId,
    },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      origin: 'https://music.youtube.com',
    },
  });
  try {
    return parseGetSuggestionsBody(data);
  } catch {
    return [];
  }
}
