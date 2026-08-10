const NOTES = {
  1: [
    '[Open with the life-first lens. Do not begin with rates or products.]',
    '"A move-up conversation is not one transaction. It is the sale, the next purchase, and the financing between them."',
    '"Today I will show you how to coordinate those decisions as one move."'
  ],
  2: [
    '[Let the question finish typing. Pause before speaking.]',
    '"The first question is not, What is the rate? The first question is, What are we trying to make possible?"',
    'Ask the room for one reason a past client needed the next home.'
  ],
  3: [
    '[Reveal one life change at a time.]',
    'Connect each category to a real client conversation: space, location, timing, and financial position.',
    '"The mortgage did not create the need to move. Life did."'
  ],
  4: [
    '"My job is to connect the full decision before I recommend a loan."',
    'Emphasize that there is no single answer for every homeowner.',
    '"Better questions give the agent, the client, and the lending team a plan they can execute together."'
  ],
  5: [
    '[Reveal Audit, Engineer, and Execute.]',
    '"Audit is the whole picture. Engineer is the comparison. Execute is the coordinated move."',
    'Keep returning to the life goal as the filter for every step.',
    '[Sources] Borrow Smart Repay Smart, 2020 edition, seven-step framework, PDF pp. 132-205.'
  ],
  6: [
    '"Some homeowners assume the sale has to happen first. Sometimes that is right. It is not the only sequence worth testing."',
    '[Reveal the Fed research.]',
    'State the scope accurately: moves among mortgage holders from 2021 to 2022.',
    '[Sources] Federal Reserve FEDS 2024-088, revised May 2025.'
  ],
  7: [
    '[Reveal each sequence.]',
    'For each option, name the benefit and the responsibility that comes with it.',
    '"The better sequence is the one that creates the right balance of certainty, cost, and flexibility for this client."'
  ],
  8: [
    'Validate the value of a low rate before expanding the conversation.',
    '"The full decision includes what staying costs, what moving costs, and what each path makes possible."',
    '[Reveal the closing line.]'
  ],
  9: [
    '[Reveal the six parts of the full decision.]',
    'Connect the monthly payment, accessible liquidity, complete balance sheet, protection, full PITIA, and time horizon.',
    '"We are not ignoring the rate. We are putting it in context."',
    '[Sources] Borrow Smart Repay Smart, 2020 edition, Product through Protection, PDF pp. 132-199.'
  ],
  10: [
    '"The largest down payment can feel safest because it creates the smallest loan."',
    '"But safety can also mean reserves, lower expensive debt, and room for the move to change."',
    '[Reveal the optimal versus maximum line.]'
  ],
  11: [
    '[Reveal each job the equity may need to do.]',
    'The point is not to keep cash for its own sake. The point is to assign the equity intentionally inside or outside the house.',
    'Ask: "What else has to work after closing?"',
    '[Sources] Borrow Smart Repay Smart, 2020 edition, Amount, PDF pp. 161-173.'
  ],
  12: [
    '[Walk through the example as scenario inputs, not a promise or appraisal.]',
    '"Gross equity is not automatically the down payment. First we add selling costs, the life goal, reserves, debts, and timing."',
    'Keep the distinction between value estimate and appraised value clear.'
  ],
  13: [
    '[Reveal the comparison one row at a time.]',
    '"This is not a recommendation to borrow more. It is a demonstration that the down payment changes both payment and liquidity."',
    'Remind the room that taxes, insurance, HOA, closing costs, and investment outcomes are excluded.'
  ],
  14: [
    '[Reveal the four execution steps.]',
    '"The structure becomes useful only when the contracts, financing, and backup path can move together."',
    'Ask the agents which handoff causes the most stress in their current process.'
  ],
  15: [
    '"Credits can change the payment, but the credit has a cost and the structure has rules."',
    '[Reveal both illustrative payments, then the decision checklist.]',
    'Do not present the lower illustrative rate as free, guaranteed, or available to every borrower.',
    '[Sources] Fannie Mae Selling Guide B3-4.1-02, Interested Party Contributions.'
  ],
  16: [
    '[Slow down. This is a brand anchor.]',
    '"A mortgage should create options, not pressure."',
    '"If the plan only works when every date, price, and appraisal is perfect, the plan is not finished."'
  ],
  17: [
    'Tell this as a personal example, not a performance promise.',
    'The move from Playa del Rey to El Segundo came first. The financing was built around that move.',
    'Be explicit that 15 days is personal history, not a guaranteed closing timeline.'
  ],
  18: [
    '[Reveal the seven questions in order.]',
    'The questions translate product, payment, availability, amount, management, protection, and discipline into a life-first conversation.',
    '"Then we can compare responsible loan structures using the client\'s real numbers and give the plan a next action."',
    '[Sources] Borrow Smart Repay Smart, 2020 edition, seven-step framework, PDF pp. 132-205.'
  ],
  19: [
    '"Closing is not the end of the strategy. It is when the homeowner begins living with it."',
    '[Reveal the app QR and preview.]',
    'Explain that the NEO Experience keeps the homeowner aware of the position and the next decision.'
  ],
  20: [
    '[Reveal Track, Review, Assign, and Ask.]',
    '"The loan is temporary. The strategy lasts."',
    'Connect ongoing review to changes in value, equity, rates, expenses, income, and goals. Give monthly savings a deliberate destination.',
    '[Sources] Borrow Smart Repay Smart, 2020 edition, Management and Discipline, PDF pp. 175-205.'
  ],
  21: [
    'Invite agents to bring one real homeowner scenario to a strategy call.',
    '"We will use the client\'s timeline and numbers to make the tradeoffs visible."',
    'Pause long enough for the room to scan the code.'
  ],
  22: [
    '[Resolve the opening question.]',
    '"Start with the life. Then coordinate the sale, the next purchase, and the financing around it."',
    '"Better questions. Better decisions."'
  ],
  23: [
    'Invite specific questions about current move-up clients, not general rate predictions.',
    'Useful prompts: timing, equity access, reserves, overlap, contingencies, and payment guardrails.',
    'Close every answer by returning to the life the client is trying to build.'
  ]
};

const params = new URLSearchParams(location.search);
const IS_PRESENTER = params.get('presenter') === '1';
const stage = document.getElementById('stage');
const slides = [...document.querySelectorAll('.slide')];
const counter = document.getElementById('counter');
const bar = document.getElementById('bar');
const muteBtn = document.getElementById('muteBtn');
let cur = 0;
let started = false;
let musicOn = false;
let lobbyAudio = null;
let typeTimer = null;
let touchStartX = null;

function fit(){
  if(IS_PRESENTER) return;
  const scale = Math.min(innerWidth / 1280, innerHeight / 720);
  stage.style.transform = `scale(${scale})`;
}
addEventListener('resize', fit);
fit();

function updateUrl(){
  if(IS_PRESENTER || cur === 0) return;
  const nextUrl = new URL(location.href);
  nextUrl.searchParams.set('slide', String(cur));
  history.replaceState(null, '', nextUrl);
}

function show(index, fromBack = false){
  const previousIndex = cur;
  cur = Math.max(0, Math.min(slides.length - 1, index));
  const goingBack = cur < previousIndex;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === cur);
    if(slideIndex !== cur) slide.classList.remove('back');
  });
  const active = slides[cur];
  active.classList.remove('back');
  void active.offsetWidth;
  if(goingBack) active.classList.add('back');
  counter.textContent = cur === 0 ? 'Lobby' : `${cur} / ${slides.length - 1}`;
  bar.style.width = cur === 0 ? '0' : `${cur / (slides.length - 1) * 100}%`;
  active.querySelectorAll('.frag').forEach(fragment => fragment.classList.toggle('on', fromBack));
  if(active.id === 'problemSlide') runTypewriter();
  if(cur !== 0 && musicOn) fadeMusicOut(1.4);
  else if(cur === 0 && started && !musicOn) setMusic(true);
  updateUrl();
}

function fragments(){
  return [...slides[cur].querySelectorAll('.frag')];
}

function next(){
  if(cur === 0){
    show(1);
    return;
  }
  const pending = fragments().filter(fragment => !fragment.classList.contains('on'));
  if(pending.length){
    pending[0].classList.add('on');
    announce();
    return;
  }
  show(cur + 1);
}

function prev(){
  const visible = fragments().filter(fragment => fragment.classList.contains('on'));
  if(visible.length){
    visible[visible.length - 1].classList.remove('on');
    announce();
    return;
  }
  show(cur - 1, true);
}

function toggleFullscreen(){
  if(document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
}

stage.addEventListener('click', event => {
  if(event.target.closest('button,a') || cur === 0) return;
  const rect = stage.getBoundingClientRect();
  if((event.clientX - rect.left) / rect.width < .3) prev();
  else next();
});

stage.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].clientX;
}, {passive:true});
stage.addEventListener('touchend', event => {
  if(touchStartX === null) return;
  const distance = event.changedTouches[0].clientX - touchStartX;
  if(Math.abs(distance) > 45) distance < 0 ? next() : prev();
  touchStartX = null;
}, {passive:true});

document.getElementById('fsBtn').addEventListener('click', toggleFullscreen);

addEventListener('keydown', event => {
  if(IS_PRESENTER) return;
  const key = event.key.toLowerCase();
  if(event.key === 'ArrowRight' || event.key === ' ' || event.key === 'PageDown'){
    event.preventDefault();
    next();
  }else if(event.key === 'ArrowLeft' || event.key === 'PageUp'){
    event.preventDefault();
    prev();
  }else if(event.key === 'Home'){
    event.preventDefault();
    show(1);
  }else if(event.key === 'End'){
    event.preventDefault();
    show(slides.length - 1, true);
  }else if(key === 'f') toggleFullscreen();
  else if(key === 'm') toggleMusic();
  else if(key === 'l') show(0);
});

const TYPE_SEGMENTS = [
  {text:'What are we trying', className:''},
  {text:' to make possible?', className:'b'}
];
function runTypewriter(){
  const output = document.getElementById('typeOut');
  clearInterval(typeTimer);
  output.innerHTML = '';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    output.innerHTML = TYPE_SEGMENTS.map(segment => `<span class="${segment.className}">${segment.text}</span>`).join('');
    return;
  }
  let segmentIndex = 0;
  let characterIndex = 0;
  const spans = TYPE_SEGMENTS.map(segment => {
    const span = document.createElement('span');
    span.className = segment.className;
    output.appendChild(span);
    return span;
  });
  typeTimer = setInterval(() => {
    if(segmentIndex >= TYPE_SEGMENTS.length){
      clearInterval(typeTimer);
      return;
    }
    spans[segmentIndex].textContent += TYPE_SEGMENTS[segmentIndex].text[characterIndex++];
    if(characterIndex >= TYPE_SEGMENTS[segmentIndex].text.length){
      segmentIndex += 1;
      characterIndex = 0;
    }
  }, 42);
}

const TIME_ZONE = 'America/Los_Angeles';
function pacificWallToEpoch(year, month, day, hour, minute){
  let guess = Date.UTC(year, month - 1, day, hour, minute);
  for(let pass = 0; pass < 3; pass += 1){
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone:TIME_ZONE, year:'numeric', month:'numeric', day:'numeric',
      hour:'numeric', minute:'numeric', hourCycle:'h23'
    }).formatToParts(guess).map(part => [part.type, part.value]));
    const actual = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
    const wanted = Date.UTC(year, month - 1, day, hour, minute);
    if(actual === wanted) break;
    guess += wanted - actual;
  }
  return guess;
}

let target = null;
let manualMinutes = null;
if(params.get('start')){
  const match = params.get('start').match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if(match) target = pacificWallToEpoch(+match[1], +match[2], +match[3], +match[4], +match[5]);
}
if(!target && params.get('mins') !== null) manualMinutes = Math.max(0, parseFloat(params.get('mins')));
if(!target && manualMinutes === null) manualMinutes = 5;

const whenLabel = document.getElementById('whenLabel');
if(target){
  whenLabel.textContent = new Intl.DateTimeFormat('en-US', {
    timeZone:TIME_ZONE, weekday:'long', month:'long', day:'numeric',
    hour:'numeric', minute:'2-digit', timeZoneName:'short'
  }).format(target);
}else{
  whenLabel.textContent = manualMinutes === 0 ? 'Ready when you are' : `Starting in ${manualMinutes} minute${manualMinutes === 1 ? '' : 's'}`;
}

const clock = document.getElementById('clock');
const arc = document.querySelector('#ring .arc');
const circumference = 2 * Math.PI * 172;
arc.style.strokeDasharray = circumference;
let tick = null;
let totalSpan = null;

function formatTime(seconds){
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor(safe % 3600 / 60);
  const remaining = safe % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2,'0')}:${String(remaining).padStart(2,'0')}`
    : `${minutes}:${String(remaining).padStart(2,'0')}`;
}

function startCountdown(){
  if(manualMinutes !== null && !target) target = Date.now() + manualMinutes * 60000;
  totalSpan = Math.max(1, target - Date.now());
  const update = () => {
    const remaining = target - Date.now();
    clock.textContent = formatTime(remaining / 1000);
    clock.style.fontSize = remaining >= 3600000 ? '68px' : '92px';
    arc.style.strokeDashoffset = circumference * (1 - Math.max(0, Math.min(1, remaining / totalSpan)));
    if(remaining <= 0){
      clearInterval(tick);
      fadeMusicOut(3);
      setTimeout(() => show(1), 800);
    }
  };
  update();
  tick = setInterval(update, 1000);
}

const requestedTrack = params.get('track');
const tracks = requestedTrack ? [requestedTrack] : ['lobby.mp3', 'lobby.m4a'];
function tryTrack(source){
  return new Promise(resolve => {
    const audio = new Audio();
    audio.src = source;
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    let settled = false;
    const finish = value => {
      if(settled) return;
      settled = true;
      resolve(value);
    };
    audio.addEventListener('canplaythrough', () => finish(audio), {once:true});
    audio.addEventListener('error', () => finish(null), {once:true});
    setTimeout(() => finish(null), 2500);
  });
}

async function initializeMusic(){
  if(lobbyAudio) return true;
  for(const track of tracks){
    const audio = await tryTrack(track);
    if(audio){
      lobbyAudio = audio;
      return true;
    }
  }
  return false;
}

function rampAudio(targetVolume, seconds){
  if(!lobbyAudio) return;
  const startVolume = lobbyAudio.volume;
  const steps = Math.max(1, Math.round(seconds * 30));
  let step = 0;
  clearInterval(lobbyAudio._ramp);
  if(targetVolume > 0 && lobbyAudio.paused) lobbyAudio.play().catch(() => {});
  lobbyAudio._ramp = setInterval(() => {
    step += 1;
    lobbyAudio.volume = Math.max(0, Math.min(1, startVolume + (targetVolume - startVolume) * (step / steps)));
    if(step >= steps){
      clearInterval(lobbyAudio._ramp);
      if(targetVolume === 0) lobbyAudio.pause();
    }
  }, seconds * 1000 / steps);
}

function setMusic(on){
  musicOn = on && !!lobbyAudio;
  muteBtn.textContent = `Music: ${musicOn ? 'on' : 'off'}`;
  if(lobbyAudio) rampAudio(musicOn ? .55 : 0, 1.2);
}

async function toggleMusic(){
  if(!lobbyAudio) await initializeMusic();
  setMusic(!musicOn);
}

function fadeMusicOut(seconds){
  if(!musicOn) return;
  rampAudio(0, seconds);
  musicOn = false;
  muteBtn.textContent = 'Music: off';
}
muteBtn.addEventListener('click', toggleMusic);

const channel = 'BroadcastChannel' in window ? new BroadcastChannel('move-up-method-deck') : null;
let announce = () => {
  if(channel) channel.postMessage({type:'state', cur});
  try{
    localStorage.setItem('move-up-method-state', JSON.stringify({cur, time:Date.now()}));
  }catch(error){}
};

const originalShow = show;
show = function(index, fromBack = false){
  originalShow(index, fromBack);
  announce();
};

function slideTitle(index){
  if(index <= 0) return 'Lobby: countdown';
  if(index >= slides.length) return 'End of deck';
  if(slides[index].dataset.title) return slides[index].dataset.title;
  const heading = slides[index].querySelector('h1,h2');
  if(!heading) return `Slide ${index}`;
  const headingCopy = heading.cloneNode(true);
  headingCopy.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith(' '));
  return headingCopy.textContent.trim().replace(/\s+/g, ' ').slice(0, 72);
}

function appendNotes(container, notes){
  container.replaceChildren();
  if(!notes){
    const empty = document.createElement('p');
    empty.className = 'cue';
    empty.textContent = 'No notes for this slide.';
    container.appendChild(empty);
    return;
  }
  notes.forEach(note => {
    const paragraph = document.createElement('p');
    paragraph.className = /^\[.*\]$/.test(note) ? 'cue' : '';
    paragraph.textContent = note;
    container.appendChild(paragraph);
  });
}

function renderPresenter(index){
  document.getElementById('pvNow').textContent = index === 0
    ? 'Lobby: countdown'
    : `Slide ${index} / ${slides.length - 1}: ${slideTitle(index)}`;
  document.getElementById('pvNext').textContent = `Next: ${slideTitle(index + 1)}`;
  appendNotes(document.getElementById('pvNotes'), NOTES[index]);
}

if(IS_PRESENTER){
  document.body.classList.add('presenter');
  document.title = 'Presenter | The move-up method.';
  let presenterCurrent = 0;
  const timerStart = Date.now();
  renderPresenter(0);
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - timerStart) / 1000);
    document.getElementById('pvClock').textContent = `Elapsed ${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  }, 1000);
  const receiveState = state => {
    if(state && typeof state.cur === 'number' && state.cur !== presenterCurrent){
      presenterCurrent = state.cur;
      renderPresenter(presenterCurrent);
    }
  };
  if(channel) channel.onmessage = event => {
    if(event.data.type === 'state') receiveState(event.data);
  };
  else addEventListener('storage', event => {
    if(event.key === 'move-up-method-state') receiveState(JSON.parse(event.newValue || '{}'));
  });
  const navigate = direction => {
    if(channel) channel.postMessage({type:'nav', direction});
    try{
      localStorage.setItem('move-up-method-nav', JSON.stringify({direction, time:Date.now()}));
    }catch(error){}
  };
  document.getElementById('pvPrev').addEventListener('click', () => navigate(-1));
  document.getElementById('pvNextBtn').addEventListener('click', () => navigate(1));
  addEventListener('keydown', event => {
    if(event.key === 'ArrowRight' || event.key === ' ') navigate(1);
    if(event.key === 'ArrowLeft') navigate(-1);
  }, true);
}else{
  const receiveNavigation = direction => direction > 0 ? next() : prev();
  if(channel) channel.onmessage = event => {
    if(event.data.type === 'nav') receiveNavigation(event.data.direction);
  };
  else addEventListener('storage', event => {
    if(event.key === 'move-up-method-nav'){
      const message = JSON.parse(event.newValue || '{}');
      if(typeof message.direction === 'number') receiveNavigation(message.direction);
    }
  });

  const openPresenter = () => {
    const presenterUrl = new URL(location.href);
    presenterUrl.searchParams.set('presenter', '1');
    open(presenterUrl, 'move-up-method-presenter', 'width=780,height=640');
    setTimeout(announce, 600);
  };
  document.getElementById('notesBtn').addEventListener('click', openPresenter);
  addEventListener('keydown', event => {
    if(event.key.toLowerCase() === 'n') openPresenter();
  });

  let pipWindow = null;
  function renderPictureInPicture(){
    if(!pipWindow || pipWindow.closed) return;
    const documentRef = pipWindow.document;
    documentRef.getElementById('pipNow').textContent = `${cur === 0 ? 'Lobby' : `Slide ${cur} / ${slides.length - 1}`}: ${slideTitle(cur)}`;
    appendNotes(documentRef.getElementById('pipNotes'), NOTES[cur]);
  }

  async function openPictureInPicture(){
    if(!('documentPictureInPicture' in window)){
      openPresenter();
      return;
    }
    if(pipWindow && !pipWindow.closed){
      pipWindow.close();
      pipWindow = null;
      return;
    }
    pipWindow = await documentPictureInPicture.requestWindow({width:460, height:580});
    pipWindow.document.body.innerHTML = '<div id="pipNow"></div><div id="pipNotes"></div><div class="pip-controls"><button id="pipPrev">← Prev</button><button id="pipNext">Next →</button></div>';
    const style = pipWindow.document.createElement('style');
    style.textContent = 'body{background:#071C33;color:#E3F4FD;font-family:Montserrat,system-ui,sans-serif;padding:16px;font-size:14.5px;line-height:1.6}#pipNow{font-weight:800;font-size:15px;margin-bottom:10px;color:#5BCBF5}#pipNotes{overflow-y:auto;max-height:calc(100vh - 130px)}#pipNotes p{margin:0 0 10px}#pipNotes p.cue{color:#8A95A3;font-style:italic;font-size:13px}.pip-controls{display:flex;gap:8px;margin-top:12px}.pip-controls button{flex:1;padding:10px;border-radius:8px;border:1px solid #124066;background:#0D3050;color:#fff;font-size:14px;cursor:pointer}';
    pipWindow.document.head.appendChild(style);
    pipWindow.document.getElementById('pipPrev').addEventListener('click', prev);
    pipWindow.document.getElementById('pipNext').addEventListener('click', next);
    pipWindow.addEventListener('pagehide', () => { pipWindow = null; });
    renderPictureInPicture();
  }

  document.getElementById('pipBtn').addEventListener('click', openPictureInPicture);
  addEventListener('keydown', event => {
    if(event.key.toLowerCase() === 'p') openPictureInPicture();
  });
  const baseAnnounce = announce;
  announce = function(){
    baseAnnounce();
    renderPictureInPicture();
  };
}

document.getElementById('enterBtn').addEventListener('click', async () => {
  document.getElementById('gate').style.display = 'none';
  started = true;
  if(manualMinutes === 0 && !target){
    show(1);
    return;
  }
  startCountdown();
  await initializeMusic();
  setMusic(true);
});

const requestedSlide = Number.parseInt(params.get('slide') || '0', 10);
if(IS_PRESENTER) show(0);
else if(Number.isFinite(requestedSlide) && requestedSlide > 0){
  document.getElementById('gate').style.display = 'none';
  started = true;
  show(Math.min(requestedSlide, slides.length - 1));
}else show(0);
