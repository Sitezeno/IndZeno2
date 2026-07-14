/* ==========================================================================
   INDZENO — script.js
   Data layer (Supabase + local fallback) + all shared UI interactions.
   Every page includes this single file.
   ========================================================================== */

/* ---------------- 1. SUPABASE CLIENT ---------------- */
// Replace with your real project values before going live.
// Get them from: Supabase Dashboard → Project Settings → API
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-PUBLIC-ANON-KEY';

let supabase = null;
let SUPABASE_READY = false;

(function initSupabase(){
  try{
    if (window.supabase && SUPABASE_URL.indexOf('YOUR-PROJECT-REF') === -1) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      SUPABASE_READY = true;
    }
  }catch(e){ console.warn('[INDZENO] Supabase not configured, using local sample data.', e); }
})();

/* ---------------- 2. SAMPLE DATA (offline-first fallback) ---------------- */
const IMG = (seed, w=800, h=500) => `https://images.unsplash.com/${seed}?w=${w}&h=${h}&fit=crop&q=80`;

const CATEGORIES = ['AI','Politics','Movies','History','Biography','Technology','Influencers'];

const SAMPLE_ARTICLES = [
  {id:1,title:"India's AI Mission Enters Phase Two With ₹10,000 Cr Compute Push",category:"AI",author:"Ritika Sharma",created_at:"2026-07-12T08:30:00Z",image:IMG("photo-1677442136019-21780ecad995"),excerpt:"A new national compute grid aims to put sovereign GPU capacity within reach of every public university by 2027.",featured:true,trending:true,content:["The government's expanded AI mission moves from policy paper to procurement this week, with the first tranche of GPU clusters going live across four regional data hubs.","Officials say the goal is to cut the cost of training mid-sized models for public research teams by more than half, removing a major bottleneck that has pushed talent toward better-funded private labs.","Industry watchers note the timing lines up with a broader global race to build sovereign compute, as nations increasingly treat frontier-model infrastructure the way they once treated energy grids — a strategic asset, not just a line item."]},
  {id:2,title:"Parliament Passes Landmark Data Protection Amendment",category:"Politics",author:"Arjun Mehta",created_at:"2026-07-12T06:10:00Z",image:IMG("photo-1529107386315-e1a2ed48a620"),excerpt:"The amendment tightens consent rules for cross-border data transfers and creates a fast-track grievance body.",featured:true,content:["After eleven hours of debate, the amendment passed with cross-party support, marking the most significant change to the country's data law since it was first enacted.","The bill introduces a 30-day fast-track grievance redress mechanism and raises penalties for repeat violations by large platforms.","Civil society groups have offered a cautious welcome, while industry bodies are asking for a longer transition window before enforcement begins in earnest."]},
  {id:3,title:"Festival Season Box Office: Three Big Releases, One Surprise Hit",category:"Movies",author:"Neha Kapoor",created_at:"2026-07-11T14:20:00Z",image:IMG("photo-1489599849927-2ee91cede3ba"),excerpt:"A modestly budgeted indie drama has quietly outperformed two star-studded tentpoles on a per-screen basis.",trending:true,content:["Weekend collections show an unusual pattern: the smaller release is filling shows at a higher rate than either of its bigger-budget rivals, even with a fraction of the screen count.","Distributors are now weighing an expansion for the film's second week, a decision that could reshape how mid-budget dramas are marketed going forward.","Analysts point to word-of-mouth on social platforms as the deciding factor, rather than traditional pre-release marketing spend."]},
  {id:4,title:"The Forgotten Treaty That Redrew a Continent's Borders",category:"History",author:"Devika Rao",created_at:"2026-07-10T09:00:00Z",image:IMG("photo-1461360370896-922624d12aa1"),excerpt:"A century-old agreement, signed in a single afternoon, still shapes disputes that make headlines today.",content:["Historians revisiting the archives this year found new correspondence suggesting the treaty's borders were drawn with far less geographic care than official accounts long claimed.","The documents, newly digitized, show negotiators working from maps that were already a decade out of date at the time of signing.","Descendants of communities split by the resulting border have renewed calls for a formal historical review."]},
  {id:5,title:"Profile: The Engineer Who Turned a Garage Project Into a National Utility",category:"Biography",author:"Karan Malhotra",created_at:"2026-07-09T11:45:00Z",image:IMG("photo-1519085360753-af0119f7cbe7"),excerpt:"From a two-person team to infrastructure used by millions — the untold story behind the platform's early years.",content:["Long before the company became a household name, its founder was sketching the first version of the system on a whiteboard borrowed from a shuttered college lab.","Early employees describe a culture built on relentless iteration, with entire product directions scrapped and rebuilt within a single week.","Today, the founder rarely gives interviews, but colleagues say the same instincts that shaped the first prototype still guide the company's biggest decisions."]},
  {id:6,title:"On-Device Chips Are Quietly Making Cloud AI Optional",category:"Technology",author:"Ritika Sharma",created_at:"2026-07-09T07:15:00Z",image:IMG("photo-1518770660439-4636190af475"),excerpt:"New silicon lets flagship phones run capable language models entirely offline — no server round-trip required.",trending:true,content:["The latest generation of mobile chips dedicates nearly a third of its die to AI-specific circuitry, enabling assistants that work without a network connection.","For users, the practical benefit is speed: on-device responses arrive in a fraction of the time cloud calls take, with none of the privacy trade-offs of sending queries to a remote server.","Cloud providers aren't worried yet — the heaviest workloads still need data-center-scale compute — but the shift is already changing how app developers plan their AI features."]},
  {id:7,title:"The Creator Who Turned Farm Vlogs Into a Media Company",category:"Influencers",author:"Neha Kapoor",created_at:"2026-07-08T13:00:00Z",image:IMG("photo-1500648767791-00dcc994a43e"),excerpt:"What started as unscripted videos from a family farm now reaches an audience larger than most national broadcasters.",content:["The channel's rise wasn't engineered by an agency — it began with a single unscripted video that struck a nerve during a difficult harvest season.","Now backed by a small production team, the creator has resisted offers to relocate to the city, insisting the farm itself is part of the brand.","Marketers have taken notice: brand deals in the space have tripled year over year as audiences increasingly trust creators over traditional celebrity endorsements."]},
  {id:8,title:"Central Bank Holds Rates, Signals Caution on Inflation Path",category:"Politics",author:"Arjun Mehta",created_at:"2026-07-08T05:30:00Z",image:IMG("photo-1554224155-6726b3ff858f"),excerpt:"Policymakers voted 5-2 to hold, citing sticky services inflation despite cooling energy prices.",content:["The decision was closer than markets expected, with two committee members pushing for an immediate quarter-point cut.","In its statement, the bank flagged services inflation as the key risk to watch over the next two quarters.","Markets reacted modestly, with bond yields ticking up slightly as traders pushed back expectations for the first cut."]},
  {id:9,title:"How a Silent-Era Film Was Rescued From a Basement in Pune",category:"History",author:"Devika Rao",created_at:"2026-07-07T10:00:00Z",image:IMG("photo-1478720568477-152d9b164e26"),excerpt:"Archivists spent three years restoring 40 reels found by chance during a building renovation.",content:["The reels were discovered wrapped in newspaper dated 1931, tucked behind a false wall during routine renovation work.","Restoration required frame-by-frame chemical treatment, as several reels had begun to decompose into a flammable state.","The finished film premiered to a sold-out archive screening, the first public viewing in nearly a century."]},
  {id:10,title:"Streaming Platforms Quietly Cut Back on New Originals",category:"Movies",author:"Neha Kapoor",created_at:"2026-07-06T12:00:00Z",image:IMG("photo-1440404653325-ab127d49abc1"),excerpt:"Internal data shows a 20% drop in greenlit originals as platforms pivot toward licensed libraries.",content:["The pullback marks a reversal from the content-spending race of the past decade, as platforms prioritize profitability over subscriber growth alone.","Licensing older, proven titles is proving cheaper per hour watched than commissioning new originals, according to industry estimates.","Writers' guilds have raised concern about the long-term impact on new talent pipelines."]},
  {id:11,title:"Inside the Lab Teaching Robots to Understand 'Why'",category:"AI",author:"Karan Malhotra",created_at:"2026-07-05T09:20:00Z",image:IMG("photo-1485827404703-89b55fcc595e"),excerpt:"Causal reasoning models are moving from academic papers to warehouse floors.",content:["Unlike pattern-matching systems, the lab's models are trained to build explicit cause-and-effect chains before acting.","Early pilots in warehouse robotics show a marked drop in costly misdiagnosed equipment faults.","Researchers caution the approach is computationally expensive and won't replace pattern-based models everywhere — but for high-stakes decisions, the trade-off may be worth it."]},
  {id:12,title:"The Architect Behind Three Generations of Public Libraries",category:"Biography",author:"Devika Rao",created_at:"2026-07-04T08:00:00Z",image:IMG("photo-1524995997946-a1c2e315a42f"),excerpt:"A quiet career spent designing spaces meant to be used, not admired.",content:["Colleagues describe a designer who insisted on sitting in unfinished buildings for hours to test how light moved through a room.","Her libraries share a signature feature: reading nooks angled toward the morning sun rather than the street view.","At 81, she still visits construction sites weekly, tape measure in hand."]},
];

const MARKET_DATA = [
  {sym:'SENSEX',val:'81,204.5',chg:'+0.62%',up:true},
  {sym:'NIFTY 50',val:'24,712.1',chg:'+0.48%',up:true},
  {sym:'USD/INR',val:'83.41',chg:'-0.12%',up:false},
  {sym:'GOLD',val:'₹71,340',chg:'+0.21%',up:true},
];
const CRYPTO_DATA = [
  {sym:'BTC',val:'$71,204',chg:'+2.4%',up:true},
  {sym:'ETH',val:'$4,012',chg:'+1.1%',up:true},
  {sym:'SOL',val:'$212.5',chg:'-1.8%',up:false},
  {sym:'BNB',val:'$684.2',chg:'+0.6%',up:true},
];
const AUTHORS = [
  {name:'Ritika Sharma',beat:'AI & Technology',img:IMG('photo-1494790108377-be9c29b29330',200,200)},
  {name:'Arjun Mehta',beat:'Politics',img:IMG('photo-1500648767791-00dcc994a43e',200,200)},
  {name:'Neha Kapoor',beat:'Movies & Culture',img:IMG('photo-1517841905240-472988babdf9',200,200)},
  {name:'Devika Rao',beat:'History & Biography',img:IMG('photo-1438761681033-6461ffad8d80',200,200)},
];

function timeAgo(iso){
  const diff = (Date.now() - new Date(iso).getTime())/1000;
  if(diff<3600) return Math.max(1,Math.floor(diff/60))+'m ago';
  if(diff<86400) return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}
function fmtDate(iso){
  return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}

/* ---------------- 3. DATA ACCESS LAYER ---------------- */
async function fetchArticles({category=null,limit=50}={}){
  if(SUPABASE_READY){
    try{
      let q = supabase.from('news_articles').select('*').order('created_at',{ascending:false}).limit(limit);
      if(category) q = q.eq('category',category);
      const {data,error} = await q;
      if(error) throw error;
      return data;
    }catch(e){ console.warn('[INDZENO] Supabase fetch failed, falling back to sample data.', e); }
  }
  let rows = [...SAMPLE_ARTICLES];
  if(category) rows = rows.filter(a=>a.category.toLowerCase()===category.toLowerCase());
  return rows.slice(0,limit);
}
async function fetchArticleById(id){
  if(SUPABASE_READY){
    try{
      const {data,error} = await supabase.from('news_articles').select('*').eq('id',id).single();
      if(error) throw error;
      return data;
    }catch(e){ console.warn('[INDZENO] Supabase fetch failed.', e); }
  }
  return SAMPLE_ARTICLES.find(a=>String(a.id)===String(id)) || SAMPLE_ARTICLES[0];
}
function subscribeRealtime(onInsert){
  if(!SUPABASE_READY) return;
  supabase.channel('news_articles_changes')
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'news_articles'}, payload=>onInsert(payload.new))
    .subscribe();
}

/* ---------------- 4. BOOKMARKS + THEME (localStorage) ---------------- */
const Bookmarks = {
  key:'indzeno_bookmarks',
  all(){ try{return JSON.parse(localStorage.getItem(this.key))||[];}catch(e){return [];} },
  has(id){ return this.all().includes(String(id)); },
  toggle(id){
    id=String(id);
    let list = this.all();
    if(list.includes(id)) list = list.filter(x=>x!==id); else list.push(id);
    localStorage.setItem(this.key, JSON.stringify(list));
    return list.includes(id);
  }
};
function initTheme(){
  const saved = localStorage.getItem('indzeno_theme');
  if(saved==='dark') document.documentElement.setAttribute('data-theme','dark');
  document.querySelectorAll('.theme-toggle').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const isDark = document.documentElement.getAttribute('data-theme')==='dark';
      if(isDark){ document.documentElement.removeAttribute('data-theme'); localStorage.setItem('indzeno_theme','light'); }
      else{ document.documentElement.setAttribute('data-theme','dark'); localStorage.setItem('indzeno_theme','dark'); }
    });
  });
}

/* ---------------- 5. CARD RENDERING ---------------- */
function cardHTML(a){
  const bm = Bookmarks.has(a.id) ? 'bookmarked' : '';
  return `
  <article class="card reveal">
    <a href="article.html?id=${a.id}" class="card-media">
      <img src="${a.image}" alt="${a.title}" loading="lazy">
      <span class="card-cat">${a.category}</span>
    </a>
    <div class="card-body">
      <h3><a href="article.html?id=${a.id}">${a.title}</a></h3>
      <p class="card-excerpt">${a.excerpt}</p>
      <div class="card-foot">
        <span>${a.author} · ${timeAgo(a.created_at)}</span>
        <span class="card-actions">
          <button class="bm-btn ${bm}" data-id="${a.id}" aria-label="Bookmark">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>
          </button>
          <button class="share-btn" data-id="${a.id}" aria-label="Share">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5"/></svg>
          </button>
        </span>
      </div>
    </div>
  </article>`;
}
function pickRowHTML(a,i){
  return `
  <a class="pick-row reveal" href="article.html?id=${a.id}">
    <span class="pick-num">${String(i+1).padStart(2,'0')}</span>
    <span class="pick-thumb"><img src="${a.image}" alt="${a.title}" loading="lazy"></span>
    <span class="pick-body">
      <span class="eyebrow">${a.category}</span>
      <h4>${a.title}</h4>
    </span>
  </a>`;
}
function bindCardActions(root=document){
  root.querySelectorAll('.bm-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      const on = Bookmarks.toggle(btn.dataset.id);
      btn.classList.toggle('bookmarked',on);
      showToast(on?'Saved to bookmarks':'Removed from bookmarks');
    });
  });
  root.querySelectorAll('.share-btn').forEach(btn=>{
    btn.addEventListener('click', async e=>{
      e.preventDefault();
      const url = `${location.origin}${location.pathname.replace(/[^/]*$/,'')}article.html?id=${btn.dataset.id}`;
      try{
        if(navigator.share){ await navigator.share({title:'INDZENO', url}); }
        else{ await navigator.clipboard.writeText(url); showToast('Link copied'); }
      }catch(e){}
    });
  });
}

async function renderRail(containerId, category, limit=8){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = Array(3).fill('<div class="card"><div class="skel" style="aspect-ratio:16/10"></div><div class="card-body"><div class="skel" style="height:14px;width:80%;margin-bottom:8px"></div><div class="skel" style="height:14px;width:50%"></div></div></div>').join('');
  const rows = await fetchArticles({category, limit});
  el.innerHTML = rows.map(cardHTML).join('') || '<p style="padding:20px;color:var(--muted)">No stories yet.</p>';
  bindCardActions(el);
  initReveal();
}
async function renderGrid(containerId, category, limit=50){
  const el = document.getElementById(containerId);
  if(!el) return;
  const rows = await fetchArticles({category, limit});
  el.innerHTML = rows.map(cardHTML).join('') || '<p style="padding:20px;color:var(--muted)">No stories yet.</p>';
  bindCardActions(el);
  initReveal();
}
async function renderPicks(containerId, limit=5){
  const el = document.getElementById(containerId);
  if(!el) return;
  const rows = (await fetchArticles({limit:20})).slice(0,limit);
  el.innerHTML = rows.map(pickRowHTML).join('');
  initReveal();
}
async function renderLive(containerId, limit=6){
  const el = document.getElementById(containerId);
  if(!el) return;
  const rows = await fetchArticles({limit});
  el.innerHTML = rows.map(a=>`
    <div class="live-item reveal">
      <span class="time">${new Date(a.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
      <p>${a.excerpt}</p>
    </div>`).join('');
  initReveal();
}
function renderVideos(containerId){
  const el = document.getElementById(containerId);
  if(!el) return;
  const vids = SAMPLE_ARTICLES.slice(0,6).map((a,i)=>({...a,dur:`0:${20+i*5}`}));
  el.innerHTML = vids.map(v=>`
    <div class="video-card reveal">
      <img src="${v.image}" alt="${v.title}" loading="lazy">
      <span class="video-dur">${v.dur}</span>
      <div class="video-play"><span><svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"/></svg></span></div>
      <div class="video-info"><h4>${v.title}</h4></div>
    </div>`).join('');
  initReveal();
}
function renderAuthors(containerId){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = AUTHORS.map(a=>`
    <div class="author-card reveal">
      <div class="author-avatar"><img src="${a.img}" alt="${a.name}"></div>
      <h4>${a.name}</h4><p>${a.beat}</p>
    </div>`).join('');
  initReveal();
}
function renderMarket(containerId,data){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = data.map(d=>`
    <div class="ticker-card reveal">
      <div class="sym">${d.sym}</div>
      <div class="val">${d.val}</div>
      <div class="chg ${d.up?'up':'down'}">${d.chg}</div>
    </div>`).join('');
  initReveal();
}
function renderTopics(containerId){
  const el = document.getElementById(containerId);
  if(!el) return;
  const topics = ['Lok Sabha 2026','GPT-5 Era','Monsoon Session','IPL Auction','Climate Summit','Startup Funding','Cyber Law','Box Office','Space Missions','Union Budget'];
  el.innerHTML = topics.map(t=>`<a class="topic-chip" href="news.html?q=${encodeURIComponent(t)}">${t}</a>`).join('');
}

/* ---------------- 6. HERO SLIDER ---------------- */
function initHeroSlider(){
  const track = document.getElementById('heroTrack');
  if(!track) return;
  const featured = SAMPLE_ARTICLES.filter(a=>a.featured).length ? SAMPLE_ARTICLES.filter(a=>a.featured) : SAMPLE_ARTICLES.slice(0,3);
  track.innerHTML = featured.map(a=>`
    <a class="hero-slide" href="articl
