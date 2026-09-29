// Each goodie has its own authoring fields, keepsake, and recipient action.
export const ITEM_TYPES = {
  song: {name:'Song',object:'vinyl',title:'Song title',body:'Why this song?',url:'Song link',requiredLink:true,action:'Listen to this song ↗',hint:'A record with the song and artist you picked.',fields:[['artist','Artist','text',80],['album','Album (optional)','text',80]]},
  playlist: {name:'Playlist',object:'cassette',title:'Playlist name',body:'When to listen',url:'Playlist link',requiredLink:true,action:'Open the playlist ↗',hint:'A mixtape with your own track list.',fields:[['curator','Made by','text',80],['tracks','A few tracks — one per line','textarea',240]]},
  map: {name:'A place',object:'postcard',title:'Place name',body:'What we’ll do here',url:'Map link (optional)',action:'Get directions ↗',hint:'A postcard to a place you want to share.',fields:[['address','Address or location','text',160]]},
  ticket: {name:'An invitation',object:'ticket',title:'What are we doing?',body:'A little more about the plan',url:'Booking or RSVP link (optional)',action:'Open the invitation link ↗',hint:'A keepsake ticket with a date and meeting place.',fields:[['date','Date','date',10],['time','Time, including time zone','text',60],['venue','Where to meet','text',120]]},
  book: {name:'Book',object:'book',title:'Book title',body:'Why you might love it',url:'Book link (optional)',action:'Find this book ↗',hint:'A book jacket with a personal recommendation.',fields:[['author','Author','text',80],['quote','A favorite short line (optional)','textarea',160]]},
  movie: {name:'Movie',object:'film',title:'Movie title',body:'Our movie-night plan',url:'Trailer or watch link (optional)',action:'Watch / view trailer ↗',hint:'A movie-night pass with the details that matter.',fields:[['director','Director (optional)','text',80],['year','Release year (optional)','text',4],['watch','Where to watch','text',100]]},
  article: {name:'Article',object:'article',title:'Article headline',body:'What made me save it',url:'Article link',requiredLink:true,action:'Read the article ↗',hint:'A small reading clipping, picked for them.',fields:[['publication','Publication','text',80],['minutes','Reading time in minutes','number',3]]},
  note: {name:'A little note',object:'envelope',title:'Open when…',body:'Your secret note',hint:'An envelope with a message inside. No link needed.',fields:[]},
};
export function recipientLink(item){
  const raw=item.url||(item.type==='map'&&item.details?.address?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.details.address)}`:null);
  if(!raw)return null;try{const url=new URL(raw);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
export function detailSummary(item){
  const d=item.details||{};
  switch(item.type){
    case 'song':return d.artist||'A song, picked for you';
    case 'playlist':return d.curator?`A mixtape by ${d.curator}`:'Your personal mixtape';
    case 'map':return d.address||'Somewhere worth going';
    case 'ticket':return [d.date,d.time,d.venue].filter(Boolean).join(' · ')||'One lovely plan';
    case 'book':return d.author?`by ${d.author}`:'For your bookshelf';
    case 'movie':return [d.year,d.watch].filter(Boolean).join(' · ')||'For our next movie night';
    case 'article':return [d.publication,d.minutes?`${d.minutes} min read`:''].filter(Boolean).join(' · ')||'A little reading for later';
    default:return 'A message just for you';
  }
}
