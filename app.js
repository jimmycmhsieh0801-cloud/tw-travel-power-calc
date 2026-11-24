/**
 * 行動電源 Wh 登機換算與出國 GaN 快充瓦數配對核心邏輯
 */

function calculateWh(mah, voltage = 3.7) {
  const safeMah = Math.max(0, Number(mah) || 0);
  const safeV = Math.max(0, Number(voltage) || 3.7);
  const wh = (safeMah * safeV) / 1000;

  let status = "ok";
  let verdict = "可手提登機（免事前申請）";
  let detail = "符合 ≤ 100Wh 標準，嚴禁託運，建議每人隨身攜帶不超過 2 顆。";

  if (wh <= 0) {
    status = "invalid";
    verdict = "請輸入有效容量";
    detail = "請輸入行動電源標示的 mAh 與電芯電壓（多為 3.7V）。";
  } else if (wh > 160) {
    status = "banned";
    verdict = "全面禁止登機與託運";
    detail = "超過 160Wh 法規上限，無法帶上任何客機，請勿攜帶至機場以免遭沒收。";
  } else if (wh > 100) {
    status = "approval";
    verdict = "須事先向航空公司報備同意（限 2 顆）";
    detail = "介於 101Wh～160Wh 之間，必須事前聯絡航空公司取得許可，且每人最多 2 顆。";
  }

  return {
    wh: Math.round(wh * 10) / 10,
    status,
    verdict,
    detail
  };
}

function recommendChargerWatts(devices) {
  const weights = {
    phone: 25,
    tablet: 30,
    ultrabook: 65,
    pro_laptop: 100,
    powerbank: 30,
    watch_earbuds: 10
  };
  let total = 0;
  for (const key of devices) {
    total += weights[key] || 0;
  }

  let recommendedTier = "30W 輕巧快充";
  if (total === 0) {
    recommendedTier = "請至少勾選 1 項設備";
  } else if (total <= 30) {
    recommendedTier = "30W～45W 雙孔 GaN 快充";
  } else if (total <= 65) {
    recommendedTier = "65W 2C1A / 3孔 GaN 氮化鎵快充";
  } else if (total <= 100) {
    recommendedTier = "100W 3C1A 多孔 GaN 氮化鎵快充";
  } else {
    recommendedTier = "140W+ 高功率多孔 GaN 桌面快充";
  }

  return {
    totalWatts: total,
    recommendedTier
  };
}

if (typeof document !== "undefined") {
  const mahInput = document.getElementById("mahInput");
  const voltageInput = document.getElementById("voltageInput");
  const whValueEl = document.getElementById("whValue");
  const whVerdictEl = document.getElementById("whVerdict");
  const whDetailEl = document.getElementById("whDetail");

  function renderWh() {
    const res = calculateWh(mahInput.value, voltageInput.value);
    whValueEl.textContent = `${res.wh} Wh`;
    whVerdictEl.textContent = res.verdict;
    whDetailEl.textContent = res.detail;
    whVerdictEl.className = "value " + (res.status === "ok" ? "good" : res.status === "approval" ? "warn" : "danger");
  }

  function renderCharger() {
    const checked = [...document.querySelectorAll(".device-check:checked")].map((el) => el.value);
    const res = recommendChargerWatts(checked);
    document.getElementById("totalWattsEl").textContent = `${res.totalWatts} W`;
    document.getElementById("chargerTierEl").textContent = res.recommendedTier;
  }

  function renderGears() {
    const grid = document.getElementById("gearGrid");
    if (!grid || typeof AFFILIATE_GEARS === "undefined") return;
    grid.innerHTML = AFFILIATE_GEARS.map(
      (g) => `
      <div class="gear-card">
        <div>
          <span class="gear-tag">${g.tag}</span>
          <h3>${g.title}</h3>
          <p>${g.desc}</p>
        </div>
        <a class="cta-btn" href="${g.url}" target="_blank" rel="noopener noreferrer nofollow">${g.cta} →</a>
      </div>`
    ).join("");
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.tab;
      document.getElementById("tab-wh").classList.toggle("hidden", target !== "wh");
      document.getElementById("tab-charger").classList.toggle("hidden", target !== "charger");
    });
  });

  document.querySelectorAll("#mahPresets .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      mahInput.value = chip.dataset.mah;
      renderWh();
    });
  });

  [mahInput, voltageInput].forEach((el) => el.addEventListener("input", renderWh));
  document.querySelectorAll(".device-check").forEach((el) => el.addEventListener("change", renderCharger));

  renderWh();
  renderCharger();
  renderGears();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateWh, recommendChargerWatts };
}
