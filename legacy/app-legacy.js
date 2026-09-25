(function () {
  const PASS = 80;
  const root = document.documentElement.dataset.siteRoot || '';
  const manifestFile = document.documentElement.dataset.manifest || 'data/manifest.json';
  const base = root || (function () {
    // Support GitHub project pages /day5-practice/ and local root.
    const path = location.pathname.replace(/\/index\.html?$/, '/');
    if (path.endsWith('/')) return path;
    return path.replace(/[^/]+$/, '');
  })();

  const els = {
    home: document.getElementById('view-home'),
    level: document.getElementById('view-level'),
    quiz: document.getElementById('view-quiz'),
    levelGrid: document.getElementById('level-grid'),
    levelTitle: document.getElementById('level-title'),
    levelLead: document.getElementById('level-lead'),
    assessList: document.getElementById('assess-list'),
    quizTitle: document.getElementById('quiz-title'),
    quizMeta: document.getElementById('quiz-meta'),
    backLevel: document.getElementById('back-level'),
    resultBack: document.getElementById('result-back'),
    progress: document.getElementById('progress'),
    qnum: document.getElementById('qnum'),
    qtext: document.getElementById('qtext'),
    promptPic: document.getElementById('prompt-pic'),
    choices: document.getElementById('choices'),
    why: document.getElementById('why'),
    stage: document.getElementById('stage'),
    result: document.getElementById('result'),
    scoreline: document.getElementById('scoreline'),
    passline: document.getElementById('passline'),
    chart: document.getElementById('chart'),
    review: document.getElementById('review'),
    replay: document.getElementById('replay'),
    speakBtn: document.getElementById('speakBtn'),
  };

  let manifest = null;
  let currentLevel = null;
  let currentAssess = null;
  let quizData = null;
  let qi = 0;
  let answers = [];
  let audio = null;

  function asset(p) { return base + p.replace(/^\//, ''); }
  function levelAssetDir(kind) {
    const p = currentLevel && currentLevel.asset_prefix;
    if (p && p[kind]) return p[kind];
    return kind === 'pictures' ? 'pictures' : 'audio';
  }
  function storageKey(levelId, assessId) {
    return 'mrj-day5-' + levelId + '-' + assessId;
  }
  function loadHistory(levelId, assessId) {
    try { return JSON.parse(localStorage.getItem(storageKey(levelId, assessId)) || '{"attempts":[]}'); }
    catch (e) { return { attempts: [] }; }
  }
  function saveHistory(levelId, assessId, h) {
    localStorage.setItem(storageKey(levelId, assessId), JSON.stringify(h));
  }
  function bestPct(levelId, assessId) {
    const h = loadHistory(levelId, assessId);
    if (!h.attempts.length) return null;
    return Math.max.apply(null, h.attempts.map(a => a.pct));
  }
  function passedCount(level) {
    let n = 0;
    level.assessments.forEach(a => {
      const b = bestPct(level.id, a.id);
      if (b != null && b >= PASS) n++;
    });
    return n;
  }

  function show(view) {
    els.home.classList.toggle('hidden', view !== 'home');
    els.level.classList.toggle('hidden', view !== 'level');
    els.quiz.classList.toggle('hidden', view !== 'quiz');
  }

  function parseHash() {
    const h = (location.hash || '#/').replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    return { levelId: parts[0] || null, assessId: parts[1] || null };
  }

  async function ensureManifest() {
    if (manifest) return manifest;
    const res = await fetch(asset(manifestFile));
    manifest = await res.json();
    return manifest;
  }

  function renderHome() {
    show('home');
    els.levelGrid.innerHTML = '';
    manifest.levels.forEach(level => {
      const passed = passedCount(level);
      const art = document.createElement('article');
      art.className = 'card';
      art.innerHTML =
        '<h2>' + level.label + '</h2>' +
        '<p class="meta">' + level.assessments.length + ' tests · ' + passed + '/' + level.assessments.length + ' passed</p>' +
        '<a class="btn" href="#/' + level.id + '">Open</a>';
      els.levelGrid.appendChild(art);
    });
  }

  function renderLevel(levelId) {
    const level = manifest.levels.find(l => l.id === levelId);
    if (!level) { location.hash = '#/'; return; }
    currentLevel = level;
    show('level');
    els.levelTitle.textContent = level.label;
    els.levelLead.textContent = '8 units + 2 midterms + final. Need ' + PASS + '% to pass.';
    els.assessList.innerHTML = '';
    level.assessments.forEach(a => {
      const best = bestPct(level.id, a.id);
      const status = best == null ? 'Not tried' : (best >= PASS ? ('Passed · best ' + best + '%') : ('Best ' + best + '% · need ' + PASS + '%'));
      const art = document.createElement('article');
      art.className = 'card toc-item';
      art.innerHTML =
        '<div><h2>' + escapeHtml(a.title) + '</h2>' +
        '<p class="meta">' + a.count + ' questions · ' + status + '</p></div>' +
        '<a class="btn" href="#/' + level.id + '/' + a.id + '">Start</a>';
      els.assessList.appendChild(art);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function isPictureChoice(choice) {
    // pic_* (Basic) + int* (e.g. int3c_*) + i2*/i3* (e.g. i3b_g1) intermediate ids
    if (typeof choice !== 'string') return false;
    if (choice.indexOf('pic_') === 0 || choice.indexOf('int') === 0) return true;
    return /^i[23][abc]?_/.test(choice);
  }

  function stopAudio() {
    try { if (audio) { audio.pause(); audio = null; } } catch (e) {}
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function playAudio(audioId, fallbackText) {
    stopAudio();
    if (audioId) {
      audio = new Audio(asset(levelAssetDir('audio') + '/' + audioId + '.mp3'));
      audio.play().catch(() => speakText(fallbackText || ''));
      return;
    }
    speakText(fallbackText || '');
  }

  function speakText(text) {
    if (!text || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  function currentQ() { return quizData.questions[qi]; }
  // Optional speak_text: the line to speak (TTS fallback) when prompt_text is only an on-screen instruction.
  function spokenText(q) { return Object.prototype.hasOwnProperty.call(q, 'speak_text') ? q.speak_text : q.prompt_text; }

  function renderQ() {
    const q = currentQ();
    const total = quizData.questions.length;
    els.progress.style.width = ((qi / total) * 100) + '%';
    els.qnum.textContent = 'Question ' + (qi + 1) + ' of ' + total;
    els.qtext.textContent = q.prompt_text || '';
    els.why.classList.add('hidden');
    els.why.textContent = '';

    const imgs = q.image_ids || [];
    const picChoices = (q.choices || []).every(isPictureChoice);
    if (!picChoices && imgs.length === 1) {
      els.promptPic.src = asset(levelAssetDir('pictures') + '/' + imgs[0] + '.png');
      els.promptPic.classList.remove('hidden');
      els.promptPic.onerror = function () { els.promptPic.classList.add('hidden'); };
    } else {
      els.promptPic.classList.add('hidden');
      els.promptPic.removeAttribute('src');
    }

    els.choices.className = 'choices' + (picChoices ? ' pics' : '');
    els.choices.innerHTML = '';
    const letters = 'ABCD';
    (q.choices || []).forEach((choice, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (picChoices) {
        b.className = 'pic-choice';
        const img = document.createElement('img');
        img.className = 'choice-pic';
        img.alt = choice;
        img.src = asset(levelAssetDir('pictures') + '/' + choice + '.png');
        img.onerror = function () { img.replaceWith(document.createTextNode(choice)); };
        b.appendChild(img);
      } else {
        b.className = 'choice';
        b.innerHTML = '<span class="letter">' + letters[idx] + '</span><span>' + escapeHtml(choice) + '</span>';
      }
      b.addEventListener('click', () => pick(choice, b));
      els.choices.appendChild(b);
    });

    playAudio(q.audio_id, spokenText(q));
  }

  function pick(choice, btn) {
    const q = currentQ();
    const ok = choice === q.correct;
    [...els.choices.children].forEach(c => { c.disabled = true; });
    btn.classList.add(ok ? 'correct' : 'wrong');
    if (!ok) {
      [...els.choices.children].forEach(c => {
        // mark correct if we can match by text content / alt
      });
      const tip = (q.why_wrong && q.why_wrong[choice]) || ('Right answer: ' + q.correct);
      els.why.textContent = tip;
      els.why.classList.remove('hidden');
    }
    answers.push({ i: qi, choice: choice, ok: ok, correct: q.correct, tip: (q.why_wrong && q.why_wrong[choice]) || null, prompt: q.prompt_text });
    setTimeout(() => {
      qi++;
      if (qi >= quizData.questions.length) finish();
      else renderQ();
    }, ok ? 350 : 900);
  }

  function finish() {
    stopAudio();
    const score = answers.filter(a => a.ok).length;
    const total = quizData.questions.length;
    const pct = Math.round(100 * score / total);
    const hist = loadHistory(currentLevel.id, currentAssess.id);
    hist.attempts.push({ t: Date.now(), score: score, total: total, pct: pct });
    saveHistory(currentLevel.id, currentAssess.id, hist);

    els.stage.classList.add('hidden');
    els.result.classList.remove('hidden');
    els.scoreline.textContent = score + ' / ' + total + ' (' + pct + '%)';
    if (pct >= PASS) {
      els.passline.innerHTML = '<span class="pass">Passed</span> · need ' + PASS + '%';
      els.replay.textContent = 'Practice again';
    } else {
      els.passline.innerHTML = '<span class="fail">Not yet</span> · need ' + PASS + '% to pass';
      els.replay.textContent = 'Try again (need ' + PASS + '%)';
    }

    els.chart.innerHTML = '';
    hist.attempts.slice(-12).forEach((a, idx) => {
      const d = document.createElement('div');
      d.className = 'bar';
      d.style.height = Math.max(8, a.pct) + '%';
      d.innerHTML = '<span>' + a.pct + '%</span>';
      d.title = 'Attempt ' + (idx + 1);
      els.chart.appendChild(d);
    });

    els.review.innerHTML = '';
    answers.forEach(a => {
      const li = document.createElement('li');
      if (a.ok) {
        li.innerHTML = '<span class="good">✓</span> Q' + (a.i + 1) + ': correct';
      } else {
        li.innerHTML = '<span class="bad">✗</span> Q' + (a.i + 1) + ': you chose <strong>' + escapeHtml(String(a.choice)) +
          '</strong>. Correct: <strong>' + escapeHtml(String(a.correct)) + '</strong>' +
          (a.tip ? (' — ' + escapeHtml(a.tip)) : '');
      }
      els.review.appendChild(li);
    });
  }

  async function startQuiz(levelId, assessId) {
    const level = manifest.levels.find(l => l.id === levelId);
    if (!level) { location.hash = '#/'; return; }
    const assess = level.assessments.find(a => a.id === assessId);
    if (!assess) { location.hash = '#/' + levelId; return; }
    currentLevel = level;
    currentAssess = assess;
    show('quiz');
    els.quizTitle.textContent = assess.title;
    els.quizMeta.textContent = assess.count + ' questions · pass at ' + PASS + '%';
    els.backLevel.href = '#/' + levelId;
    els.resultBack.href = '#/' + levelId;
    els.stage.classList.remove('hidden');
    els.result.classList.add('hidden');
    qi = 0; answers = [];
    const res = await fetch(asset(assess.path));
    quizData = await res.json();
    renderQ();
  }

  els.replay.addEventListener('click', () => {
    els.stage.classList.remove('hidden');
    els.result.classList.add('hidden');
    qi = 0; answers = [];
    renderQ();
  });
  els.speakBtn.addEventListener('click', () => {
    const q = currentQ();
    if (q) playAudio(q.audio_id, spokenText(q));
  });

  async function route() {
    await ensureManifest();
    const { levelId, assessId } = parseHash();
    stopAudio();
    if (!levelId) renderHome();
    else if (!assessId) renderLevel(levelId);
    else startQuiz(levelId, assessId);
  }

  window.addEventListener('hashchange', route);
  route().catch(err => {
    document.body.insertAdjacentHTML('beforeend', '<p class="wrap" style="color:#fb7185">Failed to load: ' + escapeHtml(String(err)) + '</p>');
  });
})();
