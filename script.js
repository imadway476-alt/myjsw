const ROBUX_ICON = "https://images.rbxcdn.com/e854eb7b2951ac03edba9a2681032bba.ico";

const loadingMessages = ["Validating username and package...", "Creating secure session...", "Preparing instruction page...", "Almost ready..."];

const names = ["PioBlx", "RobloxKing", "NoobMaster69", "Builderman", "GamerGirl99", "ShadowHunter", "EpicLoot", "Vortex", "Zenix", "Krystal"];
const amounts = ["1,700", "4,500", "10,000", "22,500", "11,000", "24,000"];

const faqs = [
  {
    q: "What happens after I select a package?",
    a: "After you choose a package, a short preparation screen appears and then your package summary opens with general next-step instructions.",
  },
  { q: "Do I need to stay on the page?", a: "Yes. Keep the same tab open while the next step loads so your session stays active." },
  {
    q: "Why is my selected amount shown again?",
    a: "The instruction page repeats the selected amount so the session feels clear and easy to verify before you continue.",
  },
];

const mainPackages = [
  { amount: "400", price: "Select" },
  { amount: "800", price: "Select" },
  { amount: "1,700", price: "Select", isPopular: true },
  { amount: "4,500", price: "Select" },
  { amount: "10,000", price: "Select" },
  { amount: "22,500", price: "Select" },
];

const bonusPackages = [
  { amount: "24,000", bonus: "1,500", price: "Select" },
  { amount: "11,000", bonus: "1,000", price: "Select", isPopular: true },
  { amount: "5,250", bonus: "750", price: "Select" },
  { amount: "2,000", bonus: "300", price: "Select" },
];

let countdowns = Array(4)
  .fill(0)
  .map(() => randInt(180, 300));
let liveUsers = 8432;
let selectedPackageAmount = "1,700";

const bonusGrid = document.getElementById("bonusGrid");
const mainGrid = document.getElementById("mainGrid");
const liveUsersEl = document.getElementById("liveUsers");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");
const loadingBar = document.getElementById("loadingBar");
const loadingPercent = document.getElementById("loadingPercent");
const etaText = document.getElementById("etaText");
const sessionId = document.getElementById("sessionId");
const statusConnection = document.getElementById("statusConnection");
const statusVerification = document.getElementById("statusVerification");
const statusTransaction = document.getElementById("statusTransaction");
const statusFinalize = document.getElementById("statusFinalize");
const instructionOverlay = document.getElementById("instructionOverlay");
const unlockBtn = document.getElementById("unlockBtn");
const claimToast = document.getElementById("claimToast");
const claimName = document.getElementById("claimName");
const claimAmount = document.getElementById("claimAmount");
const claimTime = document.getElementById("claimTime");

const selectedAmountLabel = document.getElementById("selectedAmountLabel");
const selectedAmountHero = document.getElementById("selectedAmountHero");
const selectedAmountCard = document.getElementById("selectedAmountCard");
const selectedSession = document.getElementById("selectedSession");
const selectedIcon = document.getElementById("selectedIcon");
const selectedCardIcon = document.getElementById("selectedCardIcon");

const usernameInput = document.getElementById("usernameInput");
const usernameApplyBtn = document.getElementById("usernameApplyBtn");
const usernamePreview = document.getElementById("usernamePreview");
const usernameShell = document.getElementById("usernameShell");
const usernameTip = document.getElementById("usernameTip");
const usernameEditBtn = document.getElementById("usernameEditBtn");
const usernameLockedBadge = document.getElementById("usernameLockedBadge");
const bonusSection = document.getElementById("bonusSection");
const processingUsername = document.getElementById("processingUsername");
const processingUserTag = document.getElementById("processingUserTag");
const statusUsername = document.getElementById("statusUsername");
const selectedUsername = document.getElementById("selectedUsername");
const selectedUsernameInline = document.getElementById("selectedUsernameInline");

let currentUsername = "Guest Session";
let isUsernameConnected = false;

["robuxIcon1", "robuxIcon2", "robuxIcon3", "selectedIcon", "selectedCardIcon"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.src = ROBUX_ICON;
});

syncUsernameUI();

if (usernameApplyBtn) usernameApplyBtn.addEventListener("click", commitUsername);
if (usernameEditBtn) usernameEditBtn.addEventListener("click", unlockUsernameEdit);
if (usernameInput) {
  usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitUsername();
    }
  });
  usernameInput.addEventListener("input", () => {
    const previewValue = sanitizeUsername(usernameInput.value);
    if (usernamePreview) usernamePreview.textContent = previewValue;
  });
}

(function renderFaq() {
  const faqRoot = document.getElementById("faq");
  faqs.forEach((item) => {
    const wrap = document.createElement("div");
    wrap.className = "faq-item";

    const btn = document.createElement("button");
    btn.className = "faq-q";
    btn.type = "button";
    btn.innerHTML = `<span>${escapeHtml(item.q)}</span><span class="chev">▼</span>`;

    const ans = document.createElement("div");
    ans.className = "faq-a";
    ans.textContent = item.a;

    btn.addEventListener("click", () => {
      [...faqRoot.querySelectorAll(".faq-item")].forEach((x) => {
        if (x !== wrap) x.classList.remove("open");
      });
      wrap.classList.toggle("open");
    });

    wrap.appendChild(btn);
    wrap.appendChild(ans);
    faqRoot.appendChild(wrap);
  });
})();

function makePackageCard(pkg, idx, isBonus) {
  const card = document.createElement("div");
  card.className = "pkg";

  const hasCountdown = isBonus === true;
  const countdown = hasCountdown ? countdowns[idx] : null;
  const ended = hasCountdown && countdown <= 0;

  if (pkg.isPopular && !ended) card.classList.add("popular");
  if (ended) card.classList.add("disabled");

  if (pkg.isPopular && !ended) {
    const best = document.createElement("div");
    best.className = "best";
    best.textContent = "Best Value";
    card.appendChild(best);
  }

  if (hasCountdown) {
    const ends = document.createElement("div");
    ends.className = "ends" + (ended ? " ended" : "");
    ends.dataset.idx = String(idx);
    ends.textContent = ended ? "ENDED" : `Ends in ${formatTime(countdown)}`;
    card.appendChild(ends);
  }

  const icon = document.createElement("img");
  icon.src = ROBUX_ICON;
  icon.alt = "Reward";
  card.appendChild(icon);

  const h3 = document.createElement("h3");
  h3.textContent = pkg.amount;
  card.appendChild(h3);

  const sub = document.createElement("div");
  sub.className = "sub";
  sub.textContent = "Reward Credits";
  card.appendChild(sub);

  if (pkg.bonus) {
    const bonus = document.createElement("div");
    bonus.className = "bonus";
    bonus.innerHTML = `<span>+${escapeHtml(pkg.bonus)} Bonus</span>`;
    card.appendChild(bonus);
  }

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.type = "button";
  cta.textContent = ended ? "Expired" : pkg.price;
  card.appendChild(cta);

  const handleSelect = (event) => {
    if (event) event.stopPropagation();
    if (ended) return;
    if (!isUsernameConnected) {
      if (usernameInput) usernameInput.focus();
      const card = document.querySelector(".username-card");
      if (card) {
        card.animate([
          { transform: "translateX(0)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" }
        ], { duration: 240, easing: "ease-out" });
      }
      return;
    }
    selectedPackageAmount = pkg.amount;
    startLoadingThenShowInstructions();
  };

  card.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON" && !ended) handleSelect(e);
  });

  cta.addEventListener("click", handleSelect);

  return card;
}

function renderPackages() {
  bonusPackages.forEach((pkg, idx) => bonusGrid.appendChild(makePackageCard(pkg, idx, true)));
  mainPackages.forEach((pkg) => mainGrid.appendChild(makePackageCard(pkg, 0, false)));
}

renderPackages();
updatePackageLockState();

setInterval(() => {
  const change = randInt(-10, 9);
  let next = liveUsers + change;
  if (next < 7000) next = 7000 + Math.abs(change);
  if (next > 12000) next = 12000 - Math.abs(change);
  liveUsers = next;
  liveUsersEl.textContent = liveUsers.toLocaleString();
}, 3000);

setInterval(() => {
  countdowns = countdowns.map((t) => (t > 0 ? t - 1 : 0));
  document.querySelectorAll(".ends[data-idx]").forEach((el) => {
    const i = Number(el.dataset.idx);
    const t = countdowns[i];
    if (t <= 0) {
      el.classList.add("ended");
      el.textContent = "ENDED";
      const card = el.closest(".pkg");
      if (card) {
        card.classList.add("disabled");
        const cta = card.querySelector(".cta");
        if (cta) cta.textContent = "Expired";
      }
    } else {
      el.textContent = `Ends in ${formatTime(t)}`;
    }
  });
}, 1000);

setInterval(generateClaim, 10000);

let toastTimer = null;
function generateClaim() {
  const randomName = names[randInt(0, names.length - 1)];
  const randomAmount = amounts[randInt(0, amounts.length - 1)];
  claimName.textContent = randomName;
  claimAmount.textContent = `${randomAmount} selected`;
  claimTime.textContent = "2 sec ago";
  claimToast.classList.remove("hidden");
  requestAnimationFrame(() => claimToast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    claimToast.classList.remove("show");
    setTimeout(() => claimToast.classList.add("hidden"), 220);
  }, 5000);
}

let isLoading = false;
let dynamicProgressInterval = null;
let currentSessionId = "SID-000000";

function randomSessionId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "SID-";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function setStatus(el, state, text) {
  el.className = `status-value ${state}`;
  el.textContent = text;
}

function sanitizeUsername(value) {
  const cleaned = String(value || "")
    .replace(/[^a-zA-Z0-9 _.-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
  return cleaned || "Guest Session";
}

function syncUsernameUI() {
  const safeName = sanitizeUsername(currentUsername);
  currentUsername = safeName;
  if (usernameInput && document.activeElement !== usernameInput) usernameInput.value = safeName === "Guest Session" ? "" : safeName;
  if (usernamePreview) usernamePreview.textContent = safeName;
  if (processingUsername) processingUsername.textContent = safeName;
  if (processingUserTag) processingUserTag.textContent = safeName;
  if (selectedUsername) selectedUsername.textContent = safeName;
  if (selectedUsernameInline) selectedUsernameInline.textContent = safeName;
  const card = document.querySelector(".username-card");
  if (card) card.classList.toggle("is-connected", isUsernameConnected);
  if (usernameShell) usernameShell.classList.toggle("is-locked", isUsernameConnected);
  if (usernameInput) usernameInput.readOnly = isUsernameConnected;
  if (usernameLockedBadge) usernameLockedBadge.classList.toggle("hidden", !isUsernameConnected);
  if (usernameApplyBtn) {
    usernameApplyBtn.textContent = isUsernameConnected ? "CONNECTED" : "CONNECT";
    usernameApplyBtn.classList.toggle("connected", isUsernameConnected);
    usernameApplyBtn.disabled = isUsernameConnected;
  }
  if (usernameEditBtn) usernameEditBtn.classList.toggle("hidden", !isUsernameConnected);
  if (usernameTip) {
    usernameTip.textContent = isUsernameConnected
      ? "Username locked to this session. Use Enter Again only if you need to correct it."
      : "Best results: use the exact username you want linked to this session.";
  }
  const statusEl = document.querySelector(".username-status");
  if (statusEl) statusEl.innerHTML = `<span class="status-dot"></span><strong id="usernamePreview">${escapeHtml(safeName)}</strong> ${isUsernameConnected ? "securely connected" : "ready to connect"}`;
  updatePackageLockState();
}

function scrollToBonusSection() {
  if (!bonusSection) return;
  setTimeout(() => {
    bonusSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 160);
}

function unlockUsernameEdit() {
  isUsernameConnected = false;
  syncUsernameUI();
  if (usernameInput) {
    usernameInput.focus();
    usernameInput.select();
  }
}

function commitUsername() {
  const nextName = sanitizeUsername(usernameInput ? usernameInput.value : currentUsername);
  currentUsername = nextName;
  isUsernameConnected = currentUsername !== "Guest Session";
  syncUsernameUI();
  if (isUsernameConnected) scrollToBonusSection();
}

function updatePackageLockState() {
  document.querySelectorAll(".pkg").forEach((card) => {
    card.classList.toggle("requires-connect", !isUsernameConnected && !card.classList.contains("disabled"));
  });
}

function setSelectedUI() {
  selectedAmountLabel.textContent = selectedPackageAmount;
  selectedAmountHero.textContent = selectedPackageAmount;
  selectedAmountCard.textContent = selectedPackageAmount;
  selectedSession.textContent = currentSessionId;
  if (selectedUsername) selectedUsername.textContent = currentUsername;
  if (selectedUsernameInline) selectedUsernameInline.textContent = currentUsername;
}

function startLoadingThenShowInstructions() {
  if (isLoading || !instructionOverlay.classList.contains("hidden")) return;

  if (!isUsernameConnected) {
    commitUsername();
    if (!isUsernameConnected) return;
  }
  isLoading = true;
  currentSessionId = randomSessionId();
  sessionId.textContent = currentSessionId;
  if (processingUsername) processingUsername.textContent = `@${currentUsername}`;
  if (processingUserTag) processingUserTag.textContent = `@${currentUsername}`;
  if (statusUsername) setStatus(statusUsername, "live", `@${currentUsername}`);

  loadingOverlay.classList.remove("hidden");
  setStatus(statusUsername, "live", "Connected");
  setStatus(statusConnection, "live", "Starting");
  setStatus(statusVerification, "waiting", "Waiting");
  setStatus(statusTransaction, "waiting", "Waiting");
  setStatus(statusFinalize, "waiting", "Waiting");

  let visualProgress = 3;
  setLoadingUI(visualProgress);

  if (dynamicProgressInterval) clearInterval(dynamicProgressInterval);
  dynamicProgressInterval = setInterval(() => {
    if (visualProgress < 96) {
      visualProgress += 5.5 * Math.random();
      setLoadingUI(Math.min(96, visualProgress));
    }
  }, 180);

  const stageConfigs = [
    { text: `Checking username match for @${currentUsername}`, statusEl: statusConnection, live: "Checking", done: "Ready", holdMin: 18, holdMax: 28 },
    { text: `Creating secure session for @${currentUsername}`, statusEl: statusVerification, live: "Creating", done: "Active", holdMin: 36, holdMax: 50 },
    { text: `Preparing package route for @${currentUsername}`, statusEl: statusTransaction, live: "Preparing", done: "Loaded", holdMin: 60, holdMax: 76 },
    { text: `Finalizing connected session for @${currentUsername}`, statusEl: statusFinalize, live: "Finishing", done: "Done", holdMin: 82, holdMax: 95 },
  ];

  let stageIndex = 0;
  (function runStage() {
    const stage = stageConfigs[stageIndex];
    loadingText.textContent = stage.text;
    if (stage.statusEl) setStatus(stage.statusEl, "live", stage.live);

    setTimeout(
      () => {
        if (stage.statusEl) setStatus(stage.statusEl, "done", stage.done);
        const forced = stage.holdMin + Math.random() * (stage.holdMax - stage.holdMin);
        setLoadingUI(Math.max(forced, parseFloat(loadingBar.style.width) || 0));
        stageIndex += 1;

        if (stageIndex < stageConfigs.length) {
          runStage();
        } else {
          clearInterval(dynamicProgressInterval);
          setStatus(statusUsername, "done", `@${currentUsername} verified`);
          setLoadingUI(100);
          etaText.textContent = "ETA 00:00";
          setSelectedUI();
          setTimeout(() => {
            loadingOverlay.classList.add("hidden");
            isLoading = false;
            instructionOverlay.classList.remove("hidden");
          }, 500);
        }
      },
      850 + Math.floor(650 * Math.random()),
    );
  })();
}

function setLoadingUI(percent) {
  const pct = Math.max(0, Math.min(100, percent));
  loadingBar.style.width = `${pct}%`;
  loadingPercent.textContent = `${Math.floor(pct)}%`;
  const remaining = Math.max(0, Math.ceil((100 - pct) / 18));
  etaText.textContent = `ETA 00:0${Math.min(9, remaining)}`;
}

// ---- Trigger YOUR new Adbluemedia locker ----
unlockBtn.addEventListener("click", () => {
  instructionOverlay.classList.add("hidden");

  document.querySelectorAll('script[data-adblue]').forEach(s => s.remove());

  const config = document.createElement('script');
  config.setAttribute('data-adblue', '1');
  config.textContent = 'var GnnzN_NQe_oXFwgc={"it":4595313,"key":"046fc"};';
  document.body.appendChild(config);

  const s = document.createElement('script');
  s.setAttribute('data-adblue', '1');
  s.src = 'https://d1qt1z4ccvak33.cloudfront.net/237737b.js';
  s.onload = () => {
    if (typeof _qW === 'function') _qW();
  };
  document.body.appendChild(s);
});

function formatTime(seconds) {
  if (!seconds || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escapeHtml(str) {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
