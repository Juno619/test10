/* =========================================================
   冰箱大作战 v2.0 — 像素RPG版 交互脚本
   ========================================================= */

/* ── 全局状态 ── */
const STATE = {
  score: 1280,
  level: 2,
  title: '剩菜学徒',
  chapter: 1,
  ingredients: [],
  selectedRecipe: null,
  currentStep: 0,
  isPlaying: false,
  speechRate: 0.9,
  badges: [],
  history: [],
  hasShared: false,
  hasDailyClaimed: false,
  speechSynthesis: window.speechSynthesis,
  utterance: null
};

/* ── 徽章数据 ── */
const ALL_BADGES = [
  { id: 'first_scan',    icon: '📷', name: '初次扫描',       desc: '第一次上传剩菜照片', earned: false },
  { id: 'dark_cook',     icon: '🌚', name: '暗黑初尝试',     desc: '第一次尝试暗黑料理', earned: false },
  { id: 'streak3',       icon: '🔥', name: '连续三天清冰箱', desc: '连续3天完成任务',    earned: true  },
  { id: 'doctor',        icon: '🎓', name: '剩菜博士',        desc: '完成50道食谱',        earned: false },
  { id: 'share_hero',    icon: '📸', name: '分享英雄',        desc: '第一次分享成就',     earned: false },
  { id: 'zero_waste',    icon: '♻️', name: '零浪费先锋',     desc: '累计节约1000g',      earned: true  },
  { id: 'dark_master',   icon: '🌑', name: '暗黑厨神',        desc: '完成10道暗黑料理',   earned: false },
  { id: 'fridge_god',    icon: '🏆', name: '冰箱守护神',      desc: '达到最高等级',        earned: false },
];

/* ── 食谱数据 ── */
const DEMO_INGREDIENTS = [
  { emoji: '🍚', name: '剩米饭', amount: '1.5碗', urgency: 'high' },
  { emoji: '🥚', name: '鸡蛋',   amount: 'x2',    urgency: 'medium' },
  { emoji: '🍅', name: '半颗番茄', amount: '1份', urgency: 'high' },
  { emoji: '🥩', name: '午餐肉', amount: '半听',  urgency: 'medium' },
];

const DEMO_RECIPES = [
  {
    id: 'practical',
    tag: '实用改造',
    tagClass: 'tag-practical',
    tagEmoji: '🥗',
    name: '番茄滑蛋午餐肉炒饭',
    sub: '黄金救场方案，脆底逆袭！',
    extra: '只需黑胡椒粉，没有也行',
    stars: 2,
    time: '15分钟',
    saveGrams: 380,
    dark: false,
    steps: [
      '番茄切碎，小火炒出汁，作为整锅炒饭的湿润底味。',
      '鸡蛋打散后半凝固盛出，避免翻炒过老。',
      '午餐肉切丁，煎出边缘焦香，加入米饭翻炒散开。',
      '倒回鸡蛋和番茄汁，快速翻匀，黑胡椒收尾即可出锅。',
    ]
  },
  {
    id: 'creative',
    tag: '创意融合 B',
    tagClass: 'tag-creative',
    tagEmoji: '🎨',
    name: '剩饭肉肉饭团披萨',
    sub: '脑洞大开，中西混搭奇袭！',
    extra: '需要一片芝士碎（可省略）',
    stars: 3,
    time: '20分钟',
    saveGrams: 350,
    dark: false,
    steps: [
      '米饭加蛋液揉匀，在平底锅铺成圆饼，中火压实煎黄。',
      '午餐肉切薄片摆放在米饭饼上，撒上番茄丁。',
      '铺上芝士碎（或省略），加盖焗至芝士融化。',
      '切块、装盘，撒点黑胡椒，朋友圈打开等着夸！',
    ]
  },
  {
    id: 'dark',
    tag: '🌚 暗黑料理（慎入）',
    tagClass: 'tag-dark',
    tagEmoji: '🌑',
    name: '深夜剩菜醒脑大乱炖',
    sub: '剩菜酸奶番茄特饮——食用后精神值+100',
    extra: '需要一勺酸奶（关键）',
    stars: 5,
    time: '5分钟',
    saveGrams: 420,
    dark: true,
    darkDesc: '精神值 +100，但味觉值 -50。理论上可食用，实际后果本AI概不负责。',
    steps: [
      '将剩米饭放入碗中，加入番茄块和午餐肉碎。',
      '关键步骤：倒入一勺酸奶！是的，你没看错。',
      '撒上任意调料（建议不要放太多），搅拌均匀。',
      '加热30秒或直接冷食（冷食派觉醒）。深呼吸，出发！',
    ]
  }
];

/* ── 排行榜 ── */
const LEADERBOARD = {
  week: [
    { rank: 1, avatar: '👨‍🍳', name: '暗黑大师傅', score: 8880 },
    { rank: 2, avatar: '👩‍🍳', name: '剩菜博士Li', score: 7240 },
    { rank: 3, avatar: '🧑‍🍳', name: '冰箱守护神', score: 5960 },
    { rank: 4, avatar: '🍳', name: '清冰箱选手', score: 3120 },
    { rank: 5, avatar: '🥘', name: '你（游客厨师）', score: STATE.score },
  ],
  friends: [
    { rank: 1, avatar: '🐱', name: '小花的厨房', score: 3880 },
    { rank: 2, avatar: '🐶', name: '旺财爱吃饭', score: 2560 },
    { rank: 3, avatar: '🐼', name: '你（游客厨师）', score: STATE.score },
  ]
};

/* ══════════════════════════════
   初始化
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initBadges();
  initLeaderboard('week');
  initFileInput();
  initSpeedRange();
  initCompareInput();
  drawShareCanvas();

  // 延迟3秒显示剩菜幽灵彩蛋（模拟3天未使用）
  setTimeout(() => {
    const ghost = document.getElementById('leftoverGhost');
    if (ghost) ghost.style.display = 'block';
  }, 5000);
});

/* ── 文件上传 ── */
function initFileInput() {
  const input = document.getElementById('fileInput');
  if (!input) return;
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = document.getElementById('previewImage');
      const placeholder = document.getElementById('cameraPlaceholder');
      img.src = evt.target.result;
      img.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
      startAiScan();
    };
    reader.readAsDataURL(file);
  });
}

/* ── AI扫描流程 ── */
function startAiScan() {
  const loading = document.getElementById('aiLoading');
  if (loading) loading.style.display = 'block';

  const msgs = [
    'AI 大厨正在瞪大眼珠识别食材...',
    '正在分析成分结构，计算紧急度...',
    '识别完成！整理结构化报告中...'
  ];
  let i = 0;
  const textEl = document.getElementById('aiLoadingText');
  const interval = setInterval(() => {
    if (textEl && msgs[i]) textEl.textContent = msgs[i++];
    if (i >= msgs.length) {
      clearInterval(interval);
      setTimeout(() => {
        if (loading) loading.style.display = 'none';
        showIngredientResults(DEMO_INGREDIENTS);
        addScore(50, '扫描食材');
      }, 800);
    }
  }, 1000);
}

/* ── 演示数据入口 ── */
function useDemoData() {
  const placeholder = document.getElementById('cameraPlaceholder');
  const img = document.getElementById('previewImage');

  // 显示占位符图（emoji方式）
  if (placeholder) {
    placeholder.innerHTML = '<div style="font-size:3rem">🥡🥚🍅🥩</div><p class="camera-text">演示食材已加载</p>';
  }

  startAiScan();
}

/* ── 展示食材标签 ── */
function showIngredientResults(ingredients) {
  STATE.ingredients = [...ingredients];
  const tagsEl = document.getElementById('ingredientTags');
  const resultEl = document.getElementById('ingredientResult');
  if (!tagsEl || !resultEl) return;

  tagsEl.innerHTML = '';
  ingredients.forEach((ing, idx) => {
    tagsEl.appendChild(createIngredientTag(ing, idx));
  });

  resultEl.style.display = 'block';
  awardBadge('first_scan');
}

function createIngredientTag(ing, idx) {
  const tag = document.createElement('div');
  tag.className = 'ingredient-tag' + (ing.urgency === 'high' ? ' tag-urgent' : '');
  tag.style.animationDelay = (idx * 0.08) + 's';
  tag.innerHTML = `
    <span>${ing.emoji} ${ing.name} ${ing.amount}</span>
    <span class="tag-remove" onclick="removeIngredient(${idx})">✕</span>
  `;
  return tag;
}

function removeIngredient(idx) {
  STATE.ingredients.splice(idx, 1);
  showIngredientResults(STATE.ingredients);
}

function addIngredient() {
  const name = prompt('添加食材名称：');
  if (name) {
    STATE.ingredients.push({ emoji: '🥄', name: name.trim(), amount: '适量', urgency: 'low' });
    showIngredientResults(STATE.ingredients);
  }
}

/* ── 开始生成食谱 ── */
function startRecipeGeneration() {
  STATE.chapter++;
  const chapterEl = document.getElementById('chapterNum');
  if (chapterEl) chapterEl.textContent = STATE.chapter;

  const recipeSection = document.getElementById('recipeSection');
  if (recipeSection) {
    recipeSection.style.display = 'block';
    setTimeout(() => recipeSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  renderRecipeCards();
  addScore(100, '生成食谱');
}

/* ── 渲染食谱卡 ── */
function renderRecipeCards() {
  const grid = document.getElementById('recipeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  DEMO_RECIPES.forEach(recipe => grid.appendChild(createRecipeCard(recipe)));
}

function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card' + (recipe.dark ? ' dark-recipe' : '');

  const stars = Array.from({length: 5}, (_, i) =>
    `<span class="star${i < recipe.stars ? '' : ' empty'}">★</span>`
  ).join('');

  card.innerHTML = `
    <div class="recipe-card-top">
      <span class="recipe-tag-badge ${recipe.tagClass}">${recipe.tagEmoji} ${recipe.tag}</span>
      <div class="recipe-name">${recipe.name}</div>
      <div class="recipe-sub">${recipe.sub}</div>
    </div>
    <div class="recipe-card-body">
      <div class="recipe-meta-row">
        <span class="recipe-meta-item"><span class="star-rating">${stars}</span></span>
        <span class="recipe-meta-item">⏱️ ${recipe.time}</span>
      </div>
      <div class="recipe-extra-need">🛒 ${recipe.extra}</div>
      <div class="recipe-save-label">♻️ 预计拯救 ${recipe.saveGrams}g 浪费</div>
      ${recipe.dark ? `<div class="dark-desc">💬 ${recipe.darkDesc}</div>` : ''}
    </div>
    <div class="recipe-card-footer">
      <button class="pixel-btn secondary-btn" onclick="selectRecipe('${recipe.id}', 'voice')">🎧 语音开战</button>
      <button class="pixel-btn primary-btn" onclick="selectRecipe('${recipe.id}', 'steps')">📖 图文步骤</button>
    </div>
  `;
  return card;
}

/* ── 选择食谱 ── */
function selectRecipe(recipeId, mode) {
  const recipe = DEMO_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return;
  STATE.selectedRecipe = recipe;
  STATE.currentStep = 0;
  STATE.isPlaying = false;

  if (recipe.dark) awardBadge('dark_cook');

  const voiceSection = document.getElementById('voiceSection');
  voiceSection.style.display = 'block';

  // 更新语音模块标题
  const titleEl = document.getElementById('voiceRecipeTitle');
  if (titleEl) titleEl.textContent = `当前挑战：${recipe.name}`;

  updateStepDisplay();
  buildStepDots();

  // 滚动到语音区
  setTimeout(() => voiceSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

  // 如果直接选图文步骤，展开步骤列表（这里在voice区内统一展示）
  addScore(50, '选择食谱');
}

/* ── 步骤显示 ── */
function updateStepDisplay() {
  const recipe = STATE.selectedRecipe;
  if (!recipe) return;
  const step = recipe.steps[STATE.currentStep];
  const stepText = document.getElementById('currentStepText');
  const stepBadge = document.getElementById('stepNumBadge');
  if (stepText) stepText.textContent = step;
  if (stepBadge) stepBadge.textContent = `步骤 ${STATE.currentStep + 1} / ${recipe.steps.length}`;
  updateDots();
}

function buildStepDots() {
  const recipe = STATE.selectedRecipe;
  if (!recipe) return;
  const dotsEl = document.getElementById('stepDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = recipe.steps.map((_, i) =>
    `<div class="step-dot${i === STATE.currentStep ? ' current' : ''}"></div>`
  ).join('');
}

function updateDots() {
  const dots = document.querySelectorAll('.step-dot');
  dots.forEach((dot, i) => {
    dot.className = 'step-dot';
    if (i < STATE.currentStep)  dot.classList.add('done');
    if (i === STATE.currentStep) dot.classList.add('current');
  });
}

/* ── 播放控制 ── */
function togglePlay() {
  if (STATE.isPlaying) {
    pauseVoice();
  } else {
    playCurrentStep();
  }
}

function playCurrentStep() {
  const recipe = STATE.selectedRecipe;
  if (!recipe) return;
  const step = recipe.steps[STATE.currentStep];

  STATE.isPlaying = true;
  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.textContent = '⏸';

  if (!STATE.speechSynthesis) return;
  STATE.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(step);
  utter.lang = 'zh-CN';
  utter.rate = STATE.speechRate;
  utter.pitch = 0.8;

  utter.onend = () => {
    STATE.isPlaying = false;
    const pb = document.getElementById('playBtn');
    if (pb) pb.textContent = '▶';

    // 自动前进到下一步
    if (STATE.currentStep < recipe.steps.length - 1) {
      STATE.currentStep++;
      updateStepDisplay();
      updateDots();
    } else {
      // 所有步骤完成，显示胜利彩蛋
      showVictory();
    }
  };

  STATE.utterance = utter;
  STATE.speechSynthesis.speak(utter);
}

function pauseVoice() {
  STATE.isPlaying = false;
  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.textContent = '▶';
  if (STATE.speechSynthesis) STATE.speechSynthesis.pause();
}

function nextStep() {
  const recipe = STATE.selectedRecipe;
  if (!recipe) return;
  if (STATE.speechSynthesis) STATE.speechSynthesis.cancel();
  STATE.isPlaying = false;
  const pb = document.getElementById('playBtn');
  if (pb) pb.textContent = '▶';
  if (STATE.currentStep < recipe.steps.length - 1) {
    STATE.currentStep++;
    updateStepDisplay();
  }
}

function prevStep() {
  if (STATE.speechSynthesis) STATE.speechSynthesis.cancel();
  STATE.isPlaying = false;
  const pb = document.getElementById('playBtn');
  if (pb) pb.textContent = '▶';
  if (STATE.currentStep > 0) {
    STATE.currentStep--;
    updateStepDisplay();
  }
}

function repeatStep() {
  if (STATE.speechSynthesis) STATE.speechSynthesis.cancel();
  STATE.isPlaying = false;
  playCurrentStep();
}

/* ── 语速 ── */
function initSpeedRange() {
  const range = document.getElementById('speedRange');
  const label = document.getElementById('speedLabel');
  if (!range) return;
  range.addEventListener('input', () => {
    STATE.speechRate = parseFloat(range.value);
    if (label) label.textContent = STATE.speechRate.toFixed(1) + 'x';
  });
}

/* ── 胜利彩蛋 ── */
function showVictory() {
  const egg = document.getElementById('victoryEgg');
  if (egg) egg.style.display = 'block';
  addScore(200, '完成全部步骤');

  // 播放胜利音效（用音调序列模拟）
  playVictorySound();
}

function playVictorySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }, i * 150);
    });
  } catch(e) { /* 无音频上下文时静默失败 */ }
}

/* ── 成品对比 ── */
function showCompareSection() {
  const sec = document.getElementById('compareSection');
  if (sec) {
    sec.style.display = 'block';
    setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

function initCompareInput() {
  const input = document.getElementById('compareFileInput');
  if (!input) return;
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = document.getElementById('compareImage');
      if (img) {
        img.src = evt.target.result;
        img.style.display = 'block';
      }
      setTimeout(showVerdict, 800);
    };
    reader.readAsDataURL(file);
  });
}

function showVerdict() {
  const recipe = STATE.selectedRecipe;
  const savedGrams = recipe ? recipe.saveGrams : 350;
  const isDark = recipe && recipe.dark;

  // 随机生成相似度
  const similarity = isDark ? Math.floor(Math.random() * 30 + 60) : Math.floor(Math.random() * 40 + 55);

  let verdictText, verdictColor;
  if (isDark) {
    verdictText = '你竟真的做了……这份勇气值得一块奖牌！';
    verdictColor = '#FFB3D9';
  } else if (similarity >= 85) {
    verdictText = '神还原（' + similarity + '%）："大师，请收下我的膝盖！"';
    verdictColor = '#6bcb4a';
  } else if (similarity >= 60) {
    verdictText = '灵魂还在，只是肉体走失了一点点 🌚（' + similarity + '%）';
    verdictColor = '#FFE87C';
  } else {
    verdictText = '灵魂还在，只是肉体走失了 🌚（' + similarity + '%）';
    verdictColor = '#00FFD0';
  }

  const verdictArea = document.getElementById('verdictArea');
  const verdictFill = document.getElementById('verdictFill');
  const verdictTextEl = document.getElementById('verdictText');
  const verdictSub = document.getElementById('verdictSub');
  const savedGramsEl = document.getElementById('savedGrams');
  const earnedScoreEl = document.getElementById('earnedScore');

  if (verdictArea)   verdictArea.style.display = 'flex';
  if (verdictFill)   { setTimeout(() => verdictFill.style.width = similarity + '%', 200); }
  if (verdictTextEl) { verdictTextEl.textContent = verdictText; verdictTextEl.style.color = verdictColor; }
  if (savedGramsEl)  savedGramsEl.textContent = savedGrams + 'g';
  if (earnedScoreEl) earnedScoreEl.textContent = savedGrams;

  addScore(savedGrams, '拯救浪费');
  drawShareCanvas();
}

/* ── 积分系统 ── */
function addScore(points, reason) {
  STATE.score += points;
  const scoreEl = document.getElementById('scoreDisplay');
  if (scoreEl) {
    scoreEl.textContent = STATE.score;
    scoreEl.style.color = '#00FFD0';
    setTimeout(() => scoreEl.style.color = 'var(--yellow)', 400);
  }

  updateExpBar();

  // 检查升级：每3000分升级一次
  const newLevel = Math.floor(STATE.score / 3000) + 1;
  if (newLevel > STATE.level) {
    STATE.level = newLevel;
    triggerLevelUp();
  }
}

function updateExpBar() {
  const max = (Math.floor(STATE.score / 3000) + 1) * 3000;
  const min = Math.floor(STATE.score / 3000) * 3000;
  const pct = ((STATE.score - min) / (max - min)) * 100;
  const fill = document.getElementById('expFill');
  const num  = document.getElementById('expNum');
  if (fill) fill.style.width = pct + '%';
  if (num)  num.textContent = STATE.score + ' / ' + max;
}

/* ── 升级弹窗 ── */
const TITLES = ['剩菜学徒', '暗黑厨师', '冰箱斗士', '剩菜博士', '暗黑厨神', '冰箱守护神'];

function triggerLevelUp() {
  const oldTitle = STATE.title;
  STATE.title = TITLES[Math.min(STATE.level, TITLES.length - 1)];

  const overlay = document.getElementById('levelUpOverlay');
  const titleEl = document.getElementById('levelUpTitle');
  const playerTitle = document.getElementById('playerTitle');

  if (titleEl) titleEl.textContent = oldTitle + ' → ' + STATE.title;
  if (playerTitle) playerTitle.textContent = STATE.title;
  if (overlay) {
    overlay.style.display = 'flex';
    setTimeout(() => overlay.style.display = 'none', 3000);
  }

  if (STATE.title === '冰箱守护神') awardBadge('fridge_god');
}

/* ── 徽章系统 ── */
function awardBadge(id) {
  const badge = ALL_BADGES.find(b => b.id === id);
  if (!badge || badge.earned) return;
  badge.earned = true;
  STATE.badges.push(badge);
  initBadges();
  showToast('🏅 获得新徽章：' + badge.name);
}

function initBadges() {
  const badgeRow = document.getElementById('badgeRow');
  const badgeGrid = document.getElementById('badgeGrid');

  [badgeRow, badgeGrid].forEach(el => {
    if (!el) return;
    el.innerHTML = '';
    ALL_BADGES.slice(0, el === badgeRow ? 6 : ALL_BADGES.length).forEach(badge => {
      const item = document.createElement('div');
      item.className = 'badge-item';
      item.innerHTML = `
        <div class="badge-icon ${badge.earned ? 'earned' : 'locked'}">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
      `;
      el.appendChild(item);
    });
  });
}

/* ── 排行榜 ── */
function initLeaderboard(tab) {
  const list = document.getElementById('lbList');
  if (!list) return;
  const data = LEADERBOARD[tab] || LEADERBOARD.week;
  list.innerHTML = data.map(row => `
    <div class="lb-row">
      <span class="lb-rank ${row.rank <= 3 ? 'top' : ''}">${row.rank <= 3 ? ['🥇','🥈','🥉'][row.rank-1] : row.rank}</span>
      <span class="lb-avatar">${row.avatar}</span>
      <span class="lb-name">${row.name}</span>
      <span class="lb-score">⭐ ${row.score}</span>
    </div>
  `).join('');
}

function switchLB(tab) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  initLeaderboard(tab);
}

/* ── 成就卡片绘制 ── */
function drawShareCanvas() {
  const canvas = document.getElementById('achievementCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // 背景
  ctx.fillStyle = '#0e0c08';
  ctx.fillRect(0, 0, W, H);

  // 像素网格纹理
  ctx.strokeStyle = 'rgba(255,232,124,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // 木质边框
  ctx.strokeStyle = '#5c3a1e';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, W-8, H-8);
  ctx.strokeStyle = '#a67c52';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, W-20, H-20);

  // 标题
  ctx.fillStyle = '#FFE87C';
  ctx.font = 'bold 28px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00FFD0';
  ctx.shadowBlur = 8;
  ctx.fillText('🍽️ 冰箱大作战 · 英雄时刻', W/2, 54);
  ctx.shadowBlur = 0;

  // 分隔线
  ctx.strokeStyle = '#5c3a1e';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(20, 68); ctx.lineTo(W-20, 68); ctx.stroke();

  // 食谱名
  const recipeName = STATE.selectedRecipe ? STATE.selectedRecipe.name : '暂无食谱';
  ctx.fillStyle = '#efe9db';
  ctx.font = 'bold 20px "Noto Sans SC", sans-serif';
  ctx.fillText(recipeName, W/2, 100);

  // 积分
  ctx.fillStyle = '#00FFD0';
  ctx.font = 'bold 16px "Noto Sans SC", sans-serif';
  ctx.fillText(`⭐ 剩菜能量：${STATE.score}`, W/2, 130);

  // 徽章
  const earned = ALL_BADGES.filter(b => b.earned);
  ctx.font = '28px serif';
  earned.slice(0, 8).forEach((b, i) => {
    ctx.fillText(b.icon, 60 + i * 65, 180);
  });

  // 底部标语
  ctx.fillStyle = '#a89870';
  ctx.font = '13px "Noto Sans SC", sans-serif';
  ctx.fillText('把清空冰箱的每一天，变成一场值得纪念的冒险 · 冰箱大作战 v2.0', W/2, H - 20);
}

function generateShareCard() {
  drawShareCanvas();
  showToast('炫耀卡已生成！右键保存图片');
}

/* ── 分享 ── */
function shareToSocial(platform) {
  if (!STATE.hasShared) {
    addScore(STATE.score, '首次分享双倍积分');
    STATE.hasShared = true;
    awardBadge('share_hero');
    showToast('🎉 首次分享，积分翻倍！');
  }

  const platformNames = { wechat: '微信', xiaohongshu: '小红书' };
  showToast(`即将分享到 ${platformNames[platform] || platform}（功能需App集成）`);
}

/* ── 每日奖励 ── */
function claimDailyReward() {
  if (STATE.hasDailyClaimed) { showToast('今日已领取，明天再来！'); return; }
  STATE.hasDailyClaimed = true;
  addScore(500, '日清奖励宝箱');
  showToast('🎁 日清奖励宝箱开启！获得 +500 剩菜能量');
}

/* ── 随机暗黑挑战 ── */
const RANDOM_CHALLENGES = [
  '香蕉皮奥利奥汤：滚烫的创造力',
  '隔夜薯片咖啡拿铁：早起的勇者',
  '西瓜皮炒方便面：环保主义者的午餐',
  '剩饺子配可乐冻：跨次元混搭',
  '番茄皮酸奶奶昔：维生素炸弹（？）',
];

function randomDarkChallenge() {
  const challenge = RANDOM_CHALLENGES[Math.floor(Math.random() * RANDOM_CHALLENGES.length)];
  showToast(`🎲 今日暗黑挑战：${challenge}`, 5000);
}

/* ── 徽章弹窗 ── */
function openBadgeWall() {
  initBadges();
  const modal = document.getElementById('badgeModal');
  if (modal) modal.style.display = 'flex';
}

function closeBadgeWall() {
  const modal = document.getElementById('badgeModal');
  if (modal) modal.style.display = 'none';
}

/* ── 菜谱本弹窗 ── */
function openRecipeBook(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('recipeBookModal');
  const list = document.getElementById('recipeBookList');
  if (!modal || !list) return;

  // 模拟历史数据
  const history = STATE.selectedRecipe ? [STATE.selectedRecipe] : [];
  const allHistory = [
    { icon: '🍳', name: '番茄滑蛋午餐肉炒饭', date: '2026-06-13' },
    { icon: '🌚', name: '深夜剩菜醒脑大乱炖', date: '2026-06-10' },
    { icon: '🎨', name: '剩饭肉肉饭团披萨', date: '2026-06-08' },
    ...history.map(r => ({ icon: '🍽️', name: r.name, date: '今天' }))
  ];

  list.innerHTML = allHistory.map(item => `
    <div class="rb-item">
      <span class="rb-icon">${item.icon}</span>
      <div>
        <div class="rb-name">${item.name}</div>
        <div class="rb-date">${item.date}</div>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted);padding:16px">暂无历史记录，快去完成第一道食谱！</p>';

  modal.style.display = 'flex';
}

/* ── 设置弹窗 ── */
function openSettings(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'flex';
}

function saveSettings() {
  const nickInput = document.getElementById('nickInput');
  if (nickInput && nickInput.value) {
    const nameEl = document.getElementById('playerName');
    if (nameEl) nameEl.textContent = nickInput.value;
  }
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'none';
  showToast('✅ 设置已保存');
}

/* ── 游客模式 ── */
function toggleGuestMode() {
  showToast('游客模式迁移功能需App集成，敬请期待！');
}

/* ── 底部导航 ── */
function setNav(el, page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

/* ── 剩菜幽灵 ── */
function dismissGhost() {
  const ghost = document.getElementById('leftoverGhost');
  if (ghost) ghost.style.display = 'none';
  document.getElementById('scanSection').scrollIntoView({ behavior: 'smooth' });
}

/* ── Toast通知 ── */
let toastTimeout = null;
function showToast(msg, duration = 3000) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: #1a1612;
      border: 2px solid #FFE87C;
      box-shadow: 4px 4px 0 #000;
      color: #f5ead8;
      font-family: "Noto Sans SC", sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 10px 20px;
      z-index: 5000;
      white-space: nowrap;
      max-width: 90vw;
      white-space: normal;
      text-align: center;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.style.display = 'none', 300);
  }, duration);
}

/* ── 点击模态框背景关闭 ── */
document.addEventListener('click', (e) => {
  const modals = ['badgeModal', 'recipeBookModal', 'settingsModal'];
  modals.forEach(id => {
    const el = document.getElementById(id);
    if (el && e.target === el) el.style.display = 'none';
  });
  const levelUp = document.getElementById('levelUpOverlay');
  if (levelUp && e.target === levelUp) levelUp.style.display = 'none';
});
