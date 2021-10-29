import { search, SearchType } from '../src';

const main = () => search('DJOKO', SearchType.music);

main().then((results) => console.log(results));
