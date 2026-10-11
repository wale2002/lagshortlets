export type Purpose = 'Shortlet'|'Sale'|'Annual rental';
export type Stay = {
  id:string; slug:string; title:string; zone:string; area:string; type:string;
  beds:number; baths:number; guests:number; nightly:number|null; monthly:number|null;
  images:string[]; amenities:string[]; collections:string[]; description:string;
  rules:string[]; minimumNights:number; publishedAt:string; availability:string; demo:boolean; enquiryOnly?:boolean; purpose?:Purpose; plotSizes?:number[];
};
export const zones = [
  {id:'island-core',name:'Island Core',number:'01',areas:['Victoria Island','Ikoyi','Oniru'],caption:'City energy. A waterfront outlook.',description:'For a stay centred around Victoria Island, Ikoyi, or Oniru. Explore spaces for work trips, city weekends, and time by the water.',image:'atlantic',tags:'EXECUTIVE · WATERFRONT · CENTRAL'},
  {id:'lekki-corridor',name:'Lekki Corridor',number:'02',areas:['Lekki Phase 1','Ikate','Chevron','Ajah','Lekki','Ikota','Sangotedo','Ibeju Lekki','Epe'],caption:'More room to make yourself at home.',description:'Discover Lekki Phase 1, Ikate, Chevron, and Ajah. Compare family spaces, relaxed weekend homes, and longer-stay options.',image:'pool',tags:'LIFESTYLE · FAMILY · WEEKEND'},
  {id:'mainland',name:'Mainland',number:'03',areas:['Ikeja','Maryland','Yaba','Ikorodu','Opebi','Oregun','Magodo','Ogba','Surulere','Amuwo Odofin','Festac','Agidingbi','Gbagada'],caption:'Everyday Lagos, within reach.',description:'Explore Ikeja, Maryland, Yaba, and Ikorodu for business visits, short stays, and monthly living. Ask our team about journey times for your particular itinerary.',image:'studio',tags:'BUSINESS · AIRPORT · MONTHLY'},
];
const base={type:'Apartment',baths:2,guests:4,minimumNights:2,publishedAt:'2026-10-10',availability:'Confirm first',demo:true,rules:['No parties or events','No smoking indoors','Check-in and cancellation terms will be confirmed with your quote'],amenities:['Reliable power','Wi-Fi','Kitchen','Security','Parking']};
export const demoStays:Stay[]=[
  {...base,id:'demo-atlantic',slug:'the-atlantic-residence',title:'The Atlantic Residence',zone:'island-core',area:'Victoria Island',beds:2,nightly:125000,monthly:2800000,images:['atlantic','bedroom','kitchen'],collections:['LAG Select','Executive','Waterfront'],amenities:[...base.amenities,'Workspace','Balcony','Waterfront'],description:'A light-filled city retreat, imagined for slow mornings and purposeful days. An open living area, a quiet place to work, and space to settle in. This is an illustrative listing; all specifications and rates are sample content.'},
  {...base,id:'demo-palm',slug:'palm-house',title:'Palm House',zone:'lekki-corridor',area:'Lekki Phase 1',beds:3,baths:3,guests:6,nightly:185000,monthly:3900000,type:'House',images:['palm','pool','bedroom'],collections:['Pool Stays','Family'],amenities:[...base.amenities,'Pool','Family suitable','Balcony'],description:'An easygoing home with room for the whole family. The sample layout pairs generous shared spaces with a private outdoor setting. Illustrative photography and rates; this is not verified inventory.'},
  {...base,id:'demo-studio',slug:'the-courtyard-studio',title:'The Courtyard Studio',zone:'mainland',area:'Ikeja',beds:1,baths:1,guests:2,nightly:65000,monthly:1450000,type:'Studio',images:['studio','kitchen','bedroom'],collections:['Executive','LAG Select'],amenities:[...base.amenities,'Workspace','Housekeeping'],description:'A compact, considered base for a longer chapter in Lagos. This example brings a workspace, kitchen, and comfortable living space together. Sample listing, pending real property verification.'},
  {...base,id:'demo-ikoyi',slug:'the-ikoyi-edit',title:'The Ikoyi Edit',zone:'island-core',area:'Ikoyi',beds:2,nightly:145000,monthly:3200000,images:['hero','bedroom','atlantic'],collections:['LAG Select','Executive'],amenities:[...base.amenities,'Gym','Elevator','Workspace'],description:'A warm, understated apartment concept with natural finishes and a generous living space. Created to demonstrate the LAG catalogue experience; the property, amenities, and prices are illustrative.'},
  {...base,id:'demo-sunday',slug:'sunday-at-ikate',title:'Sunday at Ikate',zone:'lekki-corridor',area:'Ikate',beds:2,nightly:95000,monthly:2100000,images:['pool','palm','kitchen'],collections:['Pool Stays','Family'],amenities:[...base.amenities,'Pool','Balcony'],description:'A weekend-minded stay concept with an outdoor pool and room to unwind. An illustrative listing only; actual inventory will be reviewed before public release.'},
  {...base,id:'demo-maryland',slug:'maryland-mews',title:'Maryland Mews',zone:'mainland',area:'Maryland',beds:2,nightly:null,monthly:null,images:['kitchen','studio','hero'],collections:['Family','Executive'],amenities:[...base.amenities,'Family suitable','Workspace'],description:'A practical, welcoming monthly-stay concept for life between places. Request a quote to discuss duration and requirements. This listing is sample content and has no confirmed availability.'},
];
// Unknown capacity is a request to confirm, never a promised occupancy limit.
export function guestRequestLimit(s:Stay){return s.guests>0?s.guests:s.enquiryOnly?30:0;}
export function acceptsGuestCount(s:Stay,count:number){return Number.isInteger(count)&&count>=1&&count<=guestRequestLimit(s);}
export function purposeOf(s:Stay):Purpose{return s.purpose||'Shortlet';}
export function bedroomLabel(s:Stay){return s.type==='Land'?'Land / plots':s.type==='Commercial'?'Commercial space':s.type==='Studio'&&s.beds===0?'Studio':s.beds>0?s.beds+' '+(s.beds===1?'bedroom':'bedrooms'):'Bedrooms to confirm';}
export const money=(n:number)=>'₦'+new Intl.NumberFormat('en-NG').format(n);
export const photo=(name:string)=>name.startsWith('https://')||name.startsWith('/')?name:'/images/'+name+'.jpg';
export const whatsapp='2348085732615';
export function whatsappUrl(s?:Stay,checkin='',checkout='',guests=2,message=''){
  const body=['Hello LAG Shortlets, I would like to enquire about '+(s?s.title+' in '+s.area:'a stay in Lagos')+'.',s&&purposeOf(s)!=='Shortlet'?'Interest: '+purposeOf(s):checkin&&'Check-in: '+checkin,(!s||purposeOf(s)==='Shortlet')&&checkout&&'Check-out: '+checkout,(!s||purposeOf(s)==='Shortlet')&&'Guests: '+guests,message,'Please confirm availability and a full quote.'].filter(Boolean).join('\n');
  return 'https://wa.me/'+whatsapp+'?text='+encodeURIComponent(body);
}
