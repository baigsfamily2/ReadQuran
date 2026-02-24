const API_BASE = "https://api.alquran.cloud/v1";
let allSurahs = [];

if (document.getElementById("surah-list")) {
  loadSurahList();
  document.getElementById("search").addEventListener("input", filterSurahs);
}

if (document.getElementById("ayahs")) {
  loadSurah();
}

async function loadSurahList() {
  const res = await fetch(`${API_BASE}/surah`);
  const data = await res.json();
  allSurahs = data.data;
  renderSurahs(allSurahs);
}

function renderSurahs(list) {
  const container = document.getElementById("surah-list");
  container.innerHTML = "";
  list.forEach(surah => {
    const div = document.createElement("div");
    div.className = "surah-card";
    div.innerHTML = `<strong>${surah.number}. ${surah.englishName}</strong><br>
      <small>${surah.englishNameTranslation}</small>`;
    div.onclick = () => {
      window.location.href = `surah.html?number=${surah.number}`;
    };
    container.appendChild(div);
  });
}

function filterSurahs(e) {
  const term = e.target.value.toLowerCase();
  const filtered = allSurahs.filter(s =>
    s.englishName.toLowerCase().includes(term)
  );
  renderSurahs(filtered);
}

async function loadSurah() {
  const params = new URLSearchParams(window.location.search);
  const number = params.get("number");

  const [arabicRes, transRes, engRes] = await Promise.all([
    fetch(`${API_BASE}/surah/${number}`),
    fetch(`${API_BASE}/surah/${number}/en.transliteration`),
    fetch(`${API_BASE}/surah/${number}/en.sahih`)      // English translation
  ]);

  const arabic = await arabicRes.json();
  const translit = await transRes.json();
  const translation = await engRes.json();

  document.getElementById("surah-title").innerText =
    `${arabic.data.englishName} (${arabic.data.name})`;

  const container = document.getElementById("ayahs");
  container.innerHTML = "";

  arabic.data.ayahs.forEach((ayah, index) => {
    const div = document.createElement("div");
    div.className = "ayah";
    div.innerHTML = `
      <div class="arabic">${ayah.text}</div>
      <div class="transliteration">${translit.data.ayahs[index].text}</div>
      <div class="translation">${translation.data.ayahs[index].text}</div>
    `;
    container.appendChild(div);
  });

  const translitCheck = document.getElementById("toggleTranslit");
  const transCheck = document.getElementById("toggleTranslation");

  function updateVisibility() {
    document.querySelectorAll(".transliteration").forEach(el => {
      el.style.display = translitCheck.checked ? "block" : "none";
    });
    document.querySelectorAll(".translation").forEach(el => {
      el.style.display = transCheck.checked ? "block" : "none";
    });
  }

  // Set initial visibility
  updateVisibility();

  translitCheck.addEventListener("change", updateVisibility);
  transCheck.addEventListener("change", updateVisibility);
}