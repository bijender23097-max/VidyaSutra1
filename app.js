(() => {
  'use strict';

  const auth = window.VidyaSutraAuth || window.SkillSwapAuth;
  const currentUser = auth ? auth.getSession() : null;

  const accountStorageSuffix = currentUser && currentUser.email
    ? encodeURIComponent(String(currentUser.email).toLowerCase())
    : null;

  const STORAGE_KEY = accountStorageSuffix
    ? `vidyasutra-campus-v1:${accountStorageSuffix}`
    : 'vidyasutra-campus-v1';
  const LEGACY_KEY = accountStorageSuffix
    ? `skillswap-campus-demo-v1:${accountStorageSuffix}`
    : 'skillswap-campus-demo-v1';

  const sessionSkillList = (value, fallback) => {
    const list = String(value || '').split(',').map(item => item.trim()).filter(Boolean);
    return list.length ? list : fallback;
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const safeParse = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
  const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const initials = (name) => String(name || 'Student').trim().split(/\s+/).slice(0,2).map(part => part[0] || '').join('').toUpperCase();

  // Warm HopeRise-aligned avatar palettes
  const colors = [
    ['#E5F6E6','#217D26'], ['#EED4AC','#5A4434'], ['#F4EBDD','#0D0B09'],
    ['#FDECE9','#9E2A1F'], ['#E6EFEA','#1F5C42'], ['#F5E6C8','#6E4B1F']
  ];
  const colorFor = (index) => colors[Math.abs(index) % colors.length];

  // Set live formatted date
  const dateEl = $('#currentDateLabel');
  if (dateEl) {
    dateEl.textContent = new Intl.DateTimeFormat('en-IN', {
      weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
    }).format(new Date()).toUpperCase();
  }

  const defaultMentors = [
    {id:'m1',name:'Ishita Rao',year:'3rd year · CSE',city:'North Campus',bio:'Makes complex Git workflows and open-source PRs feel effortless.',teach:['Git & GitHub','Python','Open Source'],skills:{'Git & GitHub':{rating:4.9,reviews:32},'Python':{rating:4.6,reviews:18},'Open Source':{rating:4.7,reviews:12}},sessions:42,learners:26,verified:true,available:'Weekday evenings',initials:'IR'},
    {id:'m2',name:'Kabir Mehta',year:'2nd year · IT',city:'Central Campus',bio:'Cybersecurity enthusiast who explains Linux and network defense safely.',teach:['Ethical Hacking','Linux','Networking'],skills:{'Ethical Hacking':{rating:4.9,reviews:27},'Linux':{rating:4.8,reviews:20},'Networking':{rating:4.5,reviews:10}},sessions:36,learners:22,verified:true,available:'Weekends',initials:'KM'},
    {id:'m3',name:'Meera Nair',year:'3rd year · AI & ML',city:'North Campus',bio:'Builds RAG and LLM prototypes and explains the math behind them.',teach:['LLMs','Python','Machine Learning'],skills:{'LLMs':{rating:4.9,reviews:25},'Python':{rating:4.8,reviews:30},'Machine Learning':{rating:4.7,reviews:19}},sessions:49,learners:31,verified:true,available:'Weekday evenings',initials:'MN'},
    {id:'m4',name:'Dev Patel',year:'2nd year · CSE',city:'East Campus',bio:'Designs clean interfaces in Figma and gives actionable portfolio critiques.',teach:['UI/UX Design','Figma','HTML & CSS'],skills:{'UI/UX Design':{rating:4.9,reviews:24},'Figma':{rating:4.8,reviews:20},'HTML & CSS':{rating:4.5,reviews:15}},sessions:33,learners:18,verified:true,available:'Flexible',initials:'DP'},
    {id:'m5',name:'Ananya Singh',year:'4th year · CSE',city:'Central Campus',bio:'Patient C++ and DSA mentor; we learn by dry-running patterns together.',teach:['Python','DSA','Git & GitHub'],skills:{'Python':{rating:4.7,reviews:41},'DSA':{rating:4.9,reviews:36},'Git & GitHub':{rating:4.6,reviews:28}},sessions:63,learners:40,verified:true,available:'Weekends',initials:'AS'},
    {id:'m6',name:'Rohan Verma',year:'3rd year · Cybersecurity',city:'West Campus',bio:'Documents CTF walkthroughs and Linux privilege escalation labs.',teach:['Ethical Hacking','Linux','Git & GitHub'],skills:{'Ethical Hacking':{rating:4.6,reviews:16},'Linux':{rating:4.7,reviews:22},'Git & GitHub':{rating:4.5,reviews:17}},sessions:28,learners:17,verified:true,available:'After 5 PM',initials:'RV'}
  ];

  const defaultCommunity = [
    {id:'p1',name:'Arjun Malhotra',initials:'AM',color:0,time:'18 min ago',topic:'Code help',title:'My test case passes locally, but fails on hidden judge inputs — what should I check?',body:'I am solving an array sum problem. Sample tests pass, but large inputs fail. Could it be integer overflow?\n```cpp\nint sum = 0;\nfor (int i = 0; i < n; i++) sum += arr[i];\n```',likes:7,replies:1,solved:false,liked:false,lastReply:{name:'Ananya Singh',body:'Use long long for sum! 32-bit signed int overflows around 2 × 10^9.'}},
    {id:'p2',name:'Priya Sharma',initials:'PS',color:1,time:'52 min ago',topic:'Career & learning',title:'How did you plan your first month of learning Git and GitHub?',body:'I know add, commit, and push, but interactive rebase and merge conflicts still confuse me.',likes:12,replies:3,solved:true,liked:false},
    {id:'p3',name:'Zoya Ali',initials:'ZA',color:2,time:'2 hours ago',topic:'Project feedback',title:'What makes you trust a peer mentor profile on Vidyasutra?',body:'Skill-specific ratings, GitHub repositories, or verified completed sessions?',likes:9,replies:2,solved:false,liked:false}
  ];

  const defaultRequests = [
    {id:'r1',direction:'sent',mentorId:'m1',mentorName:'Ishita Rao',mentorInitials:'IR',skill:'Git & GitHub',offerType:'swap',offer:'Python basics',mode:'offline',place:'Central Library Reading Hall',message:'Hi Ishita! I want to get confident with branches and resolving merge conflicts. Happy to share Python automation tips in return.',status:'accepted',created:'Today'},
    {id:'r2',direction:'received',mentorId:'self',mentorName:'Neha Kapoor',mentorInitials:'NK',skill:'HTML & CSS',offerType:'swap',offer:'Git branching workflow',mode:'online',place:'Whiteboard Room',message:'Hi! Could you help me debug my CSS Grid layout for 30 minutes?',status:'pending',created:'Today'}
  ];

  const defaultProfile = {
    name: currentUser?.fullName || 'Aarav Kumar',
    bio: 'Vidyasutra Campus member · Curious builder · Ready to share and learn',
    github: currentUser?.github || 'https://github.com',
    linkedin: currentUser?.linkedin || '',
    teach: currentUser ? sessionSkillList(currentUser.teachSkills, ['Git & GitHub','Python','HTML & CSS']) : ['Git & GitHub','Python','HTML & CSS'],
    learn: currentUser ? sessionSkillList(currentUser.learnSkills, ['LLMs','Ethical Hacking','UI/UX Design']) : ['LLMs','Ethical Hacking','UI/UX Design'],
    skillRatings: {'Git & GitHub':{rating:4.8,reviews:8},'Python':{rating:4.7,reviews:5},'HTML & CSS':{rating:4.9,reviews:6}},
    sessions: 12,
    learners: 9
  };

  let state = safeParse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY), null);
  if (!state || !state.mentors || !state.profile) {
    state = {mentors:defaultMentors, community:defaultCommunity, requests:defaultRequests, profile:defaultProfile, completion:{}, savedMentors:[], likedPosts:[]};
  } else {
    state.profile = {...defaultProfile, ...(state.profile || {}), name: currentUser?.fullName || state.profile.name};
    state.savedMentors = state.savedMentors || [];
    state.likedPosts = state.likedPosts || [];
    state.completion = state.completion || {};
  }

  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  };
  save();

  let currentView = 'discover';
  let activeSkill = 'All skills';
  let activeQuery = '';
  let activeRequestTab = 'sent';
  let activeCommunityFilter = 'all';
  let toastTimer = null;

  function notify(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function goToView(name) {
    if (!$('#' + name + 'View')) return;
    currentView = name;
    $$('.view').forEach(view => view.classList.toggle('active', view.dataset.viewPanel === name));
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));
    const navName = ({discover:'Find a mentor',roadmap:'Learning roadmaps',community:'Community',requests:'My requests',profile:'My profile',session:'Whiteboard room'})[name] || 'Workspace';
    $('#crumbCurrent').textContent = navName;
    $('#sidebar').classList.remove('open');
    if (name === 'profile') renderProfile();
    if (name === 'requests') renderRequests();
    if (name === 'community') renderCommunity();
    if (name === 'session') requestAnimationFrame(renderBoards);
    window.scrollTo({top:0, behavior:'smooth'});
  }

  document.addEventListener('click', (event) => {
    const navButton = event.target.closest('[data-view]');
    if (navButton) { goToView(navButton.dataset.view); return; }
    const navLink = event.target.closest('[data-view-link]');
    if (navLink) { event.preventDefault(); goToView(navLink.dataset.viewLink); }
  });

  $('#mobileMenu')?.addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#helpButton')?.addEventListener('click', () => $('#helpPopover').classList.toggle('hidden'));
  $('#closeHelp')?.addEventListener('click', () => $('#helpPopover').classList.add('hidden'));

  // Mentor Filtering & Rating Calculation
  function skillMatch(mentor, skill) {
    if (!skill || skill === 'All skills') return true;
    const sought = normalize(skill);
    return mentor.teach.some(s => normalize(s).includes(sought) || sought.includes(normalize(s)));
  }

  function ratingFor(mentor, skill) {
    if (skill && skill !== 'All skills') {
      const actual = mentor.teach.find(s => normalize(s).includes(normalize(skill)) || normalize(skill).includes(normalize(s)));
      if (actual && mentor.skills[actual]) return {name:actual, ...mentor.skills[actual]};
    }
    const entries = Object.entries(mentor.skills || {});
    if (!entries.length) return {name:mentor.teach[0] || 'Skill', rating:null, reviews:0};
    const best = entries.sort((a,b) => b[1].rating - a[1].rating)[0];
    return {name:best[0], ...best[1]};
  }

  function renderMentors() {
    const sortBy = $('#sortSelect').value;
    const query = normalize(activeQuery);
    let list = state.mentors.filter(mentor => skillMatch(mentor, activeSkill));
    if (query) {
      list = list.filter(mentor =>
        skillMatch(mentor, query) ||
        normalize(mentor.name).includes(query) ||
        normalize(mentor.bio).includes(query)
      );
    }
    list.sort((a,b) => {
      const ra = ratingFor(a, activeSkill);
      const rb = ratingFor(b, activeSkill);
      if (sortBy === 'reviews') return (rb.reviews || 0) - (ra.reviews || 0);
      if (sortBy === 'sessions') return (b.sessions || 0) - (a.sessions || 0);
      return (rb.rating || 0) - (ra.rating || 0);
    });

    $('#mentorGrid').innerHTML = list.map((mentor, idx) => {
      const [bg,fg] = colorFor(idx);
      const score = ratingFor(mentor, activeSkill);
      const saved = state.savedMentors.includes(mentor.id);
      return `<article class="mentor-card">
        <div class="mentor-card-top">
          <div class="mentor-avatar" style="background:${bg};color:${fg}">${escapeHTML(mentor.initials || initials(mentor.name))}</div>
          <div class="mentor-main">
            <div class="mentor-name-line"><strong>${escapeHTML(mentor.name)}</strong>${mentor.verified ? '<span class="verified-dot" title="Verified Student">✓</span>' : ''}</div>
            <div class="mentor-location">${escapeHTML(mentor.year)} · ${escapeHTML(mentor.city)}</div>
          </div>
          <button class="bookmark-btn ${saved?'saved':''}" data-save-mentor="${escapeHTML(mentor.id)}" aria-label="Save mentor">${saved?'♥':'♡'}</button>
        </div>
        <div class="skill-rating-row">
          <div class="skill-rating-label"><small>SKILL RATING</small><strong>${escapeHTML(score.name)}</strong></div>
          <div class="rating-number">${score.rating == null ? 'New' : `<span>★</span>${score.rating.toFixed(1)}`}</div>
        </div>
        <p class="mentor-description">${escapeHTML(mentor.bio)}</p>
        <div class="skill-tags">
          ${mentor.teach.map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`).join('')}
        </div>
        <div class="mentor-card-footer">
          <div class="mentor-proof"><strong>${score.reviews || 0} skill reviews</strong><span>${mentor.sessions || 0} sessions completed</span></div>
          <button class="request-mentor-btn" data-request-mentor="${escapeHTML(mentor.id)}" data-skill="${escapeHTML(score.name)}">Request <span>↗</span></button>
        </div>
      </article>`;
    }).join('');

    $('#resultsSummary').innerHTML = list.length ? `Showing <strong>${list.length} ${list.length === 1 ? 'mentor' : 'mentors'}</strong>` : 'No matching mentors';
    $('#emptyMentors').classList.toggle('hidden', list.length > 0);
    $('#mentorGrid').classList.toggle('hidden', list.length === 0);
    $('#communityCount').textContent = state.community.length;
    $('#requestCount').textContent = state.requests.length;
  }

  function searchSkill(value) {
    activeQuery = String(value || '').trim();
    activeSkill = activeQuery || 'All skills';
    $$('#skillFilters [data-skill]').forEach(btn =>
      btn.classList.toggle('active', normalize(btn.dataset.skill) === normalize(activeSkill) || (activeSkill === 'All skills' && btn.dataset.skill === 'All skills'))
    );
    $('#skillSearch').value = activeQuery;
    renderMentors();
  }

  // Live instant search as you type + submit handler
  $('#skillSearch')?.addEventListener('input', (e) => searchSkill(e.target.value));
  $('#searchForm')?.addEventListener('submit', (e) => { e.preventDefault(); searchSkill($('#skillSearch').value); });
  $('#skillFilters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-skill]');
    if (btn) searchSkill(btn.dataset.skill === 'All skills' ? '' : btn.dataset.skill);
  });
  $('#sortSelect')?.addEventListener('change', renderMentors);
  $('#viewAllMentors')?.addEventListener('click', () => searchSkill(''));
  $('#resetSearch')?.addEventListener('click', () => searchSkill(''));

  $('#mentorGrid')?.addEventListener('click', (event) => {
    const saveBtn = event.target.closest('[data-save-mentor]');
    if (saveBtn) {
      const id = saveBtn.dataset.saveMentor;
      state.savedMentors = state.savedMentors.includes(id)
        ? state.savedMentors.filter(item => item !== id)
        : [...state.savedMentors, id];
      save(); renderMentors();
      notify(state.savedMentors.includes(id) ? 'Mentor saved to shortlist.' : 'Removed from shortlist.');
      return;
    }
    const reqBtn = event.target.closest('[data-request-mentor]');
    if (reqBtn) openRequestModal(reqBtn.dataset.requestMentor, reqBtn.dataset.skill);
  });

  // Request Modal Logic
  function openRequestModal(mentorId, skill) {
    const mentor = state.mentors.find(m => m.id === mentorId);
    if (!mentor) return;
    $('#requestMentorId').value = mentor.id;
    $('#requestSkill').value = skill && skill !== 'All skills' ? skill : mentor.teach[0];
    $('#offerSkill').value = state.profile.teach[0] || 'Python basics';
    $('#requestMessage').value = `Hi ${mentor.name.split(' ')[0]}! I'd love to learn ${$('#requestSkill').value} with you on Vidyasutra.`;
    const score = ratingFor(mentor, skill);
    $('#chosenMentor').innerHTML = `
      <div class="mentor-avatar">${escapeHTML(mentor.initials)}</div>
      <div><strong>${escapeHTML(mentor.name)}</strong><div style="font-size:12px;color:var(--muted)">${escapeHTML(mentor.year)} · ${escapeHTML(score.name)}</div></div>
      <div class="chosen-rating">★ ${score.rating ? score.rating.toFixed(1) : 'New'}</div>`;
    $('#requestModal').classList.remove('hidden');
    updateRequestFields();
  }

  function closeRequestModal() { $('#requestModal').classList.add('hidden'); }
  $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeRequestModal));

  function updateRequestFields() {
    const offerType = $('input[name="offerType"]:checked')?.value || 'swap';
    const mode = $('input[name="learnMode"]:checked')?.value || 'offline';
    $('#swapDetails').classList.toggle('hidden', offerType !== 'swap');
    $('#treatDetails').classList.toggle('hidden', offerType !== 'treat');
    $('#paidDetails').classList.toggle('hidden', offerType !== 'paid');
    $('#offlineDetails').classList.toggle('hidden', mode !== 'offline');
  }
  $$('input[name="offerType"], input[name="learnMode"]').forEach(el => el.addEventListener('change', updateRequestFields));
  $$('[data-meetup]').forEach(btn => btn.addEventListener('click', () => { $('#meetupPlace').value = btn.dataset.meetup; }));
  $('#openMapSearch')?.addEventListener('click', () => {
    const place = $('#meetupPlace').value.trim() || 'Campus Library';
    window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place), '_blank', 'noopener');
  });

  $('#requestForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const mentor = state.mentors.find(m => m.id === $('#requestMentorId').value);
    if (!mentor) return;
    const offerType = $('input[name="offerType"]:checked').value;
    const mode = $('input[name="learnMode"]:checked').value;
    const offer = offerType === 'swap' ? $('#offerSkill').value.trim()
      : offerType === 'treat' ? $('#treatText').value.trim()
      : `₹${$('#paidAmount').value || 200} · ${$('#paidDuration').value}`;
    if (!offer) return notify('Please fill in your exchange offer details.');

    state.requests.unshift({
      id: 'r' + Date.now(),
      direction: 'sent',
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorInitials: mentor.initials,
      skill: $('#requestSkill').value.trim(),
      offerType,
      offer,
      mode,
      place: mode === 'online' ? 'Online · Whiteboard Room' : $('#meetupPlace').value.trim(),
      message: $('#requestMessage').value.trim(),
      status: 'pending',
      created: 'Just now'
    });
    save(); closeRequestModal(); renderRequests(); renderMentors();
    notify('Learning request sent!');
    goToView('requests');
  });

  // Roadmaps
  const roadmaps = {
    llms: {title:'Large Language Models (LLMs)',intro:'Go from Python basics to building a working Retrieval-Augmented Generation (RAG) app.',level:'Beginner → Builder',steps:[
      {title:'Solidify Python & APIs',detail:'Practice JSON handling, virtual environments, and HTTP requests.',practice:'Fetch data from a public REST endpoint.',time:'1 week',skill:'Python'},
      {title:'Embeddings & Tokenization',detail:'Understand how text becomes tokens and high-dimensional vectors.',practice:'Compare cosine similarity between two sentences.',time:'1 week',skill:'LLMs'},
      {title:'Prompt Engineering & Structured Output',detail:'Design system prompts with reliable JSON schemas and guardrails.',practice:'Build a campus study-note summarizer.',time:'1 week',skill:'LLMs'},
      {title:'Build a Mini RAG Pipeline',detail:'Chunk PDF notes, index embeddings, and generate cited answers.',practice:'Create a Q&A bot for your semester syllabus.',time:'2 weeks',skill:'LLMs'}
    ]},
    python: {title:'Python Programming',intro:'Build a clean foundation for scripting, backend APIs, and AI.',level:'Beginner path',steps:[
      {title:'Variables, Control Flow & Loops',detail:'Master conditions, list comprehensions, and loop bounds.',practice:'Build a CLI expense tracker.',time:'4 days',skill:'Python'},
      {title:'Functions, Modules & File I/O',detail:'Structure reusable functions and read/write JSON & CSV files.',practice:'Create a persistent contact manager.',time:'1 week',skill:'Python'},
      {title:'Git Version Control & Publishing',detail:'Push your Python scripts to a documented GitHub repository.',practice:'Publish your first repo with a clean README.',time:'3 days',skill:'Git & GitHub'}
    ]}
  };

  function getRoadmap(skill) {
    const q = normalize(skill);
    if (q.includes('llm') || q.includes('ai')) return roadmaps.llms;
    if (q.includes('python')) return roadmaps.python;
    const title = String(skill || 'Skill').trim();
    return {title, intro:`A structured peer-learning path for mastering ${title}.`, level:'Custom Path', steps:[
      {title:`Core Fundamentals of ${title}`,detail:'Learn the core mental models and setup environment.',practice:`Build a "Hello World" demo in ${title}.`,time:'1 week',skill:title},
      {title:'Guided Practice & Debugging',detail:'Work through 3 small exercises and review edge cases with a peer mentor.',practice:'Review your code with a Vidyasutra mentor.',time:'1 week',skill:title},
      {title:'Capstone Mini-Project',detail:'Combine concepts into a deployable project for your GitHub portfolio.',practice:'Ship and document your project.',time:'2 weeks',skill:title}
    ]};
  }

  function renderRoadmap(skill = $('#roadmapSkill')?.value || 'LLMs') {
    const roadmap = getRoadmap(skill);
    const key = normalize(roadmap.title);
    const done = state.completion[key] || [];
    const percent = Math.round((done.length / roadmap.steps.length) * 100);
    $('#roadmapMeta').innerHTML = `<span class="meta-pill">✳ ${escapeHTML(roadmap.level)}</span><span class="meta-pill">◎ ${roadmap.steps.length} milestones</span>`;
    $('#roadmapResults').innerHTML = `
      <div class="roadmap-header">
        <div><div class="eyebrow">ACTIVE ROADMAP</div><h2 style="margin:4px 0;">${escapeHTML(roadmap.title)}</h2><p style="margin:0;color:var(--muted);font-size:14px;">${escapeHTML(roadmap.intro)}</p></div>
        <div class="roadmap-progress">
          <div class="progress-copy"><span>Progress</span><strong>${done.length}/${roadmap.steps.length} (${percent}%)</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
        </div>
      </div>
      <div class="roadmap-timeline">
        ${roadmap.steps.map((step, idx) => {
          const isDone = done.includes(idx);
          return `<article class="roadmap-step ${isDone?'completed':''}">
            <div class="step-number">${isDone?'✓':idx+1}</div>
            <div class="roadmap-step-card">
              <div class="step-card-top">
                <div class="step-card-copy"><h3>${escapeHTML(step.title)}</h3><p>${escapeHTML(step.detail)}</p></div>
                <span class="step-chip">${escapeHTML(step.time)}</span>
                <input type="checkbox" data-roadmap-done="${idx}" ${isDone?'checked':''} aria-label="Mark step complete" />
              </div>
              <div class="step-detail-row">
                <span>✳ Practice: ${escapeHTML(step.practice)}</span>
                <button type="button" data-find-step-skill="${escapeHTML(step.skill)}">Find ${escapeHTML(step.skill)} mentor ↗</button>
              </div>
            </div>
          </article>`;
        }).join('')}
      </div>`;
  }

  $('#roadmapForm')?.addEventListener('submit', (e) => { e.preventDefault(); renderRoadmap($('#roadmapSkill').value); });
  $('#roadmapResults')?.addEventListener('change', (e) => {
    const checkbox = e.target.closest('[data-roadmap-done]');
    if (!checkbox) return;
    const roadmap = getRoadmap($('#roadmapSkill').value);
    const key = normalize(roadmap.title);
    const idx = Number(checkbox.dataset.roadmapDone);
    const current = state.completion[key] || [];
    state.completion[key] = checkbox.checked ? [...new Set([...current, idx])] : current.filter(i => i !== idx);
    save(); renderRoadmap($('#roadmapSkill').value);
  });
  $('#roadmapResults')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-find-step-skill]');
    if (btn) { goToView('discover'); searchSkill(btn.dataset.findStepSkill); }
  });
  renderRoadmap('LLMs');

  // Community (with Inline Reply Drawer & Mark as Solved)
  function renderCommunity() {
    const topic = $('#communityTopic').value;
    let posts = [...state.community];
    if (topic !== 'all') posts = posts.filter(p => p.topic === topic);
    if (activeCommunityFilter === 'unanswered') posts = posts.filter(p => !p.solved);

    $('#communityList').innerHTML = posts.map((post, i) => {
      const [bg,fg] = colorFor(post.color ?? i);
      const liked = state.likedPosts.includes(post.id);
      const codeMatch = /```(?:\w+)?\n?([\s\S]*?)```/.exec(post.body || '');
      const cleanBody = String(post.body || '').replace(/```[\s\S]*?```/g, '').trim();
      return `<article class="community-post">
        <div class="post-head">
          <div class="post-avatar" style="background:${bg};color:${fg}">${escapeHTML(post.initials || initials(post.name))}</div>
          <div class="post-person"><strong>${escapeHTML(post.name)}</strong><small>${escapeHTML(post.time)} · Vidyasutra</small></div>
          <span class="topic-label">${escapeHTML(post.topic)}</span>
        </div>
        <h3 class="post-title">${escapeHTML(post.title)}</h3>
        ${cleanBody ? `<p class="post-body">${escapeHTML(cleanBody)}</p>` : ''}
        ${codeMatch ? `<pre class="post-code">${escapeHTML(codeMatch[1].trim())}</pre>` : ''}
        ${post.lastReply ? `<div class="latest-reply"><strong>↳ ${escapeHTML(post.lastReply.name)}:</strong> ${escapeHTML(post.lastReply.body)}</div>` : ''}
        <div class="post-footer">
          <button class="post-action ${liked?'liked':''}" data-like-post="${escapeHTML(post.id)}">♥ ${Number(post.likes || 0)} Helpful</button>
          <button class="post-action" data-toggle-reply="${escapeHTML(post.id)}">↩ ${Number(post.replies || 0)} Reply</button>
          <button class="post-action" data-solve-post="${escapeHTML(post.id)}">${post.solved ? '✓ Solved' : 'Mark Solved'}</button>
          <span class="post-status">${post.solved ? '✓ Answered' : 'Open discussion'}</span>
        </div>
        <form class="reply-box hidden" id="replyBox-${escapeHTML(post.id)}" data-submit-reply="${escapeHTML(post.id)}">
          <input type="text" placeholder="Write a helpful reply…" required maxlength="400" />
          <button type="submit" class="button-primary">Reply</button>
        </form>
      </article>`;
    }).join('') || '<div class="empty-state">No discussions match this filter yet.</div>';

    $('#postTotal').textContent = state.community.length;
    $('#communityCount').textContent = state.community.length;
  }

  $('#communityTopic')?.addEventListener('change', renderCommunity);
  $$('.community-tab').forEach(btn => btn.addEventListener('click', () => {
    activeCommunityFilter = btn.dataset.communityFilter;
    $$('.community-tab').forEach(b => b.classList.toggle('active', b === btn));
    renderCommunity();
  }));

  $('#postForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const body = $('#postText').value.trim();
    if (body.length < 10) return notify('Please write a clear question (at least 10 characters).');
    const title = body.split(/[.!?\n]/)[0].slice(0, 95) || 'Community question';
    state.community.unshift({
      id: 'p' + Date.now(),
      name: state.profile.name,
      initials: initials(state.profile.name),
      color: 0,
      time: 'Just now',
      topic: /code|bug|error|cpp|python|loop/i.test(body) ? 'Code help' : 'Career & learning',
      title,
      body,
      likes: 0,
      replies: 0,
      solved: false
    });
    save(); $('#postText').value = ''; renderCommunity();
    notify('Question posted to Vidyasutra community!');
  });

  $('#communityList')?.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('[data-like-post]');
    if (likeBtn) {
      const post = state.community.find(p => p.id === likeBtn.dataset.likePost);
      if (!post) return;
      if (state.likedPosts.includes(post.id)) {
        state.likedPosts = state.likedPosts.filter(id => id !== post.id);
        post.likes = Math.max(0, (post.likes || 0) - 1);
      } else {
        state.likedPosts.push(post.id);
        post.likes = (post.likes || 0) + 1;
      }
      save(); renderCommunity(); return;
    }
    const replyToggle = e.target.closest('[data-toggle-reply]');
    if (replyToggle) {
      const box = $('#replyBox-' + replyToggle.dataset.toggleReply);
      box?.classList.toggle('hidden');
      box?.querySelector('input')?.focus();
      return;
    }
    const solveBtn = e.target.closest('[data-solve-post]');
    if (solveBtn) {
      const post = state.community.find(p => p.id === solveBtn.dataset.solvePost);
      if (post) { post.solved = !post.solved; save(); renderCommunity(); }
    }
  });

  $('#communityList')?.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-submit-reply]');
    if (!form) return;
    e.preventDefault();
    const post = state.community.find(p => p.id === form.dataset.submitReply);
    const input = form.querySelector('input');
    if (post && input && input.value.trim()) {
      post.replies = (post.replies || 0) + 1;
      post.lastReply = {name: state.profile.name, body: input.value.trim()};
      save(); renderCommunity();
      notify('Reply posted!');
    }
  });

  // Requests & Session Completion Rating Engine
  function renderRequests() {
    const list = state.requests.filter(r => r.direction === activeRequestTab);
    $('#requestList').innerHTML = list.map((req, idx) => {
      const [bg,fg] = colorFor(idx);
      const isReceived = req.direction === 'received';
      const statusClass = `status-${req.status}`;
      let actions = '';
      if (isReceived && req.status === 'pending') {
        actions = `<div class="request-card-actions">
          <button class="button-outline" data-request-decision="declined" data-request-id="${escapeHTML(req.id)}">Decline</button>
          <button class="button-accept" data-request-decision="accepted" data-request-id="${escapeHTML(req.id)}">Accept request ✓</button>
        </div>`;
      } else if (req.status === 'accepted') {
        actions = `<div class="request-card-actions">
          <button class="button-quiet" data-open-session>Open Whiteboard Room ↗</button>
          <button class="button-primary" data-complete-request="${escapeHTML(req.id)}">Complete &amp; Rate 5★</button>
        </div>`;
      } else if (req.status === 'pending' && !isReceived) {
        actions = `<div class="request-card-actions"><button class="button-quiet" data-cancel-request="${escapeHTML(req.id)}">Cancel request</button></div>`;
      }

      return `<article class="request-card">
        <div class="avatar" style="background:${bg};color:${fg}">${escapeHTML(req.mentorInitials || initials(req.mentorName))}</div>
        <div class="request-card-main">
          <div class="request-card-top">
            <div class="request-person">
              <h3>${escapeHTML(isReceived ? req.mentorName : `To ${req.mentorName}`)}</h3>
              <p>${escapeHTML(req.created)}</p>
            </div>
            <span class="status-pill ${statusClass}">${escapeHTML(req.status)}</span>
          </div>
          <div class="request-subject">${escapeHTML(req.skill)}</div>
          <p class="request-message">“${escapeHTML(req.message)}”</p>
          <div class="request-detail-chips">
            <span>⇄ ${escapeHTML(req.offer)}</span>
            <span>⌖ ${escapeHTML(req.place)}</span>
          </div>
          ${actions}
        </div>
      </article>`;
    }).join('') || `<div class="empty-state">No ${activeRequestTab} requests yet.</div>`;

    $('#sentCount').textContent = state.requests.filter(r => r.direction === 'sent').length;
    $('#receivedCount').textContent = state.requests.filter(r => r.direction === 'received').length;
    $('#requestCount').textContent = state.requests.length;
  }

  $$('.request-tab').forEach(btn => btn.addEventListener('click', () => {
    activeRequestTab = btn.dataset.requestTab;
    $$('.request-tab').forEach(b => b.classList.toggle('active', b === btn));
    renderRequests();
  }));

  $('#requestList')?.addEventListener('click', (e) => {
    const decision = e.target.closest('[data-request-decision]');
    if (decision) {
      const req = state.requests.find(r => r.id === decision.dataset.requestId);
      if (req) { req.status = decision.dataset.requestDecision; save(); renderRequests(); notify(`Request ${req.status}.`); }
      return;
    }
    const completeBtn = e.target.closest('[data-complete-request]');
    if (completeBtn) {
      const req = state.requests.find(r => r.id === completeBtn.dataset.completeRequest);
      if (req) {
        req.status = 'completed';
        const mentor = state.mentors.find(m => m.id === req.mentorId);
        if (mentor) {
          mentor.sessions = (mentor.sessions || 0) + 1;
          const skillEntry = mentor.skills[req.skill] || {rating: 4.8, reviews: 1};
          const totalScore = skillEntry.rating * skillEntry.reviews + 5.0;
          skillEntry.reviews += 1;
          skillEntry.rating = Number((totalScore / skillEntry.reviews).toFixed(1));
          mentor.skills[req.skill] = skillEntry;
        }
        state.profile.sessions = (state.profile.sessions || 0) + 1;
        save(); renderRequests(); renderMentors(); renderProfile();
        notify('Session marked complete & 5★ rating recorded!');
      }
      return;
    }
    const cancelBtn = e.target.closest('[data-cancel-request]');
    if (cancelBtn) {
      state.requests = state.requests.filter(r => r.id !== cancelBtn.dataset.cancelRequest);
      save(); renderRequests(); notify('Request cancelled.');
      return;
    }
    if (e.target.closest('[data-open-session]')) goToView('session');
  });

  // Profile Rendering (with dynamic overall rating calculation)
  function renderProfile() {
    const p = state.profile;
    $('#sidebarName').textContent = p.name;
    $$('.top-avatar, .avatar-me').forEach(el => el.textContent = initials(p.name));
    $('#profileInitials').textContent = initials(p.name);
    $('#profileNameDisplay').textContent = p.name;
    $('#profileBioDisplay').textContent = p.bio;
    $('#profileName').value = p.name;
    $('#profileBio').value = p.bio;
    $('#githubUrl').value = p.github || '';
    $('#linkedinUrl').value = p.linkedin || '';
    $('#teachSkills').value = p.teach.join(', ');
    $('#learnSkills').value = p.learn.join(', ');
    $('#sessionsTaught').textContent = p.sessions || 0;
    $('#learnersHelped').textContent = p.learners || 0;
    $('#teachCount').textContent = p.teach.length;
    $('#learnCountDisplay').textContent = p.learn.length;

    const ratingEntries = Object.values(p.skillRatings || {});
    const avg = ratingEntries.length
      ? (ratingEntries.reduce((sum, item) => sum + item.rating, 0) / ratingEntries.length).toFixed(1) + '★'
      : 'New';
    $('#overallRatingDisplay').textContent = avg;

    $('#ownSkillList').innerHTML = p.teach.map((skill, i) => {
      const r = p.skillRatings?.[skill];
      return `<div class="own-skill-row">
        <span class="skill-mini-icon">${['⌘','⌁','✳','◇'][i%4]}</span>
        <div class="own-skill-copy"><strong>${escapeHTML(skill)}</strong><small>${r ? `${r.reviews} peer reviews` : 'Ready to teach'}</small></div>
        <div class="own-skill-rating">${r ? `★ ${r.rating.toFixed(1)}` : 'New'}</div>
      </div>`;
    }).join('');

    $('#learnSkillList').innerHTML = p.learn.map(skill =>
      `<div class="learn-skill-row"><span>${escapeHTML(skill)}</span><button class="text-button" data-profile-roadmap="${escapeHTML(skill)}">Roadmap ↗</button></div>`
    ).join('');

    const links = [];
    if (p.github) links.push(`<a class="button-light" href="${escapeHTML(p.github)}" target="_blank" rel="noopener">↗ GitHub</a>`);
    if (p.linkedin) links.push(`<a class="button-light" href="${escapeHTML(p.linkedin)}" target="_blank" rel="noopener">↗ LinkedIn</a>`);
    $('#profileLinks').innerHTML = links.join(' ') || '<span style="font-size:13px;color:var(--muted);">Add links via Edit profile</span>';
  }

  $('#editProfileButton')?.addEventListener('click', () => $('#profileForm').classList.toggle('hidden'));
  $('#cancelProfile')?.addEventListener('click', () => $('#profileForm').classList.add('hidden'));
  $('#profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const split = (val) => [...new Set(val.split(',').map(s => s.trim()).filter(Boolean))];
    state.profile.name = $('#profileName').value.trim() || state.profile.name;
    state.profile.bio = $('#profileBio').value.trim();
    state.profile.github = $('#githubUrl').value.trim();
    state.profile.linkedin = $('#linkedinUrl').value.trim();
    state.profile.teach = split($('#teachSkills').value);
    state.profile.learn = split($('#learnSkills').value);
    save(); $('#profileForm').classList.add('hidden'); renderProfile();
    notify('Profile updated!');
  });

  $('#learnSkillList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-profile-roadmap]');
    if (btn) { $('#roadmapSkill').value = btn.dataset.profileRoadmap; goToView('roadmap'); renderRoadmap(btn.dataset.profileRoadmap); }
  });

  // Synced Whiteboard with BroadcastChannel (real-time multi-tab sync) + Undo
  const boards = [$('#boardOne'), $('#boardTwo')];
  let strokes = [];
  let currentStroke = null;
  let drawingColor = '#0D0B09';
  let erasing = false;
  const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('vidyasutra-whiteboard') : null;

  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data && Array.isArray(event.data.strokes)) {
        strokes = event.data.strokes;
        renderBoards();
      }
    };
  }

  function broadcastStrokes() {
    syncChannel?.postMessage({ strokes });
  }

  function setupCanvas(canvas) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#FFFEFA';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(stroke => {
      if (!stroke.points.length) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      const first = stroke.points[0];
      ctx.moveTo(first.x * rect.width, first.y * rect.height);
      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        ctx.lineTo(pt.x * rect.width, pt.y * rect.height);
      }
      ctx.stroke();
    });
  }

  function renderBoards() { boards.forEach(setupCanvas); }
  window.addEventListener('resize', () => { if (currentView === 'session') renderBoards(); });

  function getPoint(e, canvas) {
    const r = canvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) };
  }

  boards.forEach(canvas => {
    if (!canvas) return;
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture?.(e.pointerId);
      currentStroke = { color: erasing ? '#FFFEFA' : drawingColor, size: erasing ? 18 : 3, points: [getPoint(e, canvas)] };
      strokes.push(currentStroke);
      renderBoards();
      broadcastStrokes();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!currentStroke) return;
      currentStroke.points.push(getPoint(e, canvas));
      renderBoards();
      broadcastStrokes();
    });
    const stop = () => { currentStroke = null; };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
  });

  $$('[data-board-color]').forEach(btn => btn.addEventListener('click', () => {
    drawingColor = btn.dataset.boardColor;
    erasing = false;
    $$('[data-board-color]').forEach(b => b.classList.toggle('active', b === btn));
    $('#eraserButton')?.classList.remove('active');
  }));

  $('#eraserButton')?.addEventListener('click', () => {
    erasing = !erasing;
    $('#eraserButton').classList.toggle('active', erasing);
  });

  $('#undoBoard')?.addEventListener('click', () => {
    strokes.pop();
    renderBoards();
    broadcastStrokes();
  });

  $('#clearBoards')?.addEventListener('click', () => {
    strokes = [];
    renderBoards();
    broadcastStrokes();
    notify('Whiteboards cleared.');
  });

  // Initial Boot
  renderMentors();
  renderProfile();
  renderCommunity();
  renderRequests();
})();