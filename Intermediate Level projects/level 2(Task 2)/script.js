const searchInput = document.getElementById('search');
const unitsSelect = document.getElementById('units');
const apikeyInput = document.getElementById('apikey');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');


let controller = null;
const cache = new Map();

function setStatus(text, cls){
  statusEl.textContent = text || '';
  statusEl.className = cls ? `status ${cls}` : 'status';
}

function renderWeather(data, source){
  resultsEl.innerHTML = '';
  if(!data){
    resultsEl.innerHTML = '<li class="empty">No data</li>';
    return;
  }
  const li = document.createElement('li');
  li.className = 'repo';
  const desc = data.description || data.weather || '';
  const temp = data.temp != null ? `${data.temp}°` : '—';
  const feels = data.feels_like != null ? `${data.feels_like}°` : null;
  li.innerHTML = `
    <div class="title">${escapeHtml(data.location)}</div>
    <div class="meta">
      <div><strong>Temperature:</strong> ${escapeHtml(temp)}</div>
      <div><strong>Condition:</strong> ${escapeHtml(desc)}</div>
      <div><strong>Humidity:</strong> ${data.humidity != null ? data.humidity + '%' : '—'}</div>
      <div><strong>Wind:</strong> ${data.wind || '—'}</div>
      ${feels ? `<div><strong>Feels like:</strong> ${escapeHtml(feels)}</div>` : ''}
      <div style="color:var(--muted);font-size:12px;margin-top:6px">Source: ${escapeHtml(source)}</div>
    </div>`;
  resultsEl.appendChild(li);
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[ch]);
}

async function fetchWeatherOpenWeather(city, key, units, signal){
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(key)}&units=${units}`;
  const res = await fetch(url, {signal});
  if(!res.ok) throw new Error(`OpenWeather HTTP ${res.status}`);
  const j = await res.json();
  return {
    location: `${j.name}, ${j.sys && j.sys.country ? j.sys.country : ''}`.trim(),
    temp: j.main && j.main.temp != null ? j.main.temp : null,
    feels_like: j.main && j.main.feels_like != null ? j.main.feels_like : null,
    humidity: j.main && j.main.humidity != null ? j.main.humidity : null,
    wind: j.wind ? `${j.wind.speed} ${unitsSelect.value === 'metric' ? 'm/s' : 'mph'}` : null,
    description: j.weather && j.weather[0] && j.weather[0].description ? j.weather[0].description : ''
  };
}

async function fetchWeatherWttr(city, units, signal){
  // wttr.in returns temp_C and temp_F in current_condition[0]
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
  const res = await fetch(url, {signal});
  if(!res.ok) throw new Error(`wttr.in HTTP ${res.status}`);
  const j = await res.json();
  const cur = j.current_condition && j.current_condition[0] ? j.current_condition[0] : {};
  const temp = units === 'metric' ? cur.temp_C : cur.temp_F;
  const feels = units === 'metric' ? cur.FeelsLikeC : cur.FeelsLikeF;
  return {
    location: j.nearest_area && j.nearest_area[0] && j.nearest_area[0].areaName ? `${j.nearest_area[0].areaName[0].value}` : city,
    temp: temp != null ? Number(temp) : null,
    feels_like: feels != null ? Number(feels) : null,
    humidity: cur.humidity != null ? cur.humidity : null,
    wind: cur.windspeedKmph ? `${cur.windspeedKmph} km/h` : null,
    description: cur.weatherDesc && cur.weatherDesc[0] && cur.weatherDesc[0].value ? cur.weatherDesc[0].value : ''
  };
}

async function fetchWeather(city, key, units){
  const q = city.trim();
  if(!q) return null;
  const cacheKey = `${q}||${key||''}||${units}`;
  if(cache.has(cacheKey)) return cache.get(cacheKey);

  if(controller){ controller.abort(); }
  controller = new AbortController();
  const signal = controller.signal;
  setStatus('Loading…');
  try{
    let data, source;
    if(key){
      data = await fetchWeatherOpenWeather(q, key, units, signal);
      source = 'OpenWeather';
    }else{
      data = await fetchWeatherWttr(q, units, signal);
      source = 'wttr.in';
    }
    cache.set(cacheKey, {data, source});
    setStatus('');
    return {data, source};
  }catch(err){
    if(err.name === 'AbortError') return null;
    setStatus(err.message, 'error');
    return {data: null, source: 'error'};
  }finally{
    controller = null;
  }
}

function debounce(fn, wait){
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

const doSearch = async () => {
  setStatus('');
  const q = searchInput.value;
  const units = unitsSelect.value;
  const key = apikeyInput.value.trim();
  if(!q.trim()){
    resultsEl.innerHTML = '';
    setStatus('Type a city to lookup weather.');
    return;
  }
  const res = await fetchWeather(q, key || null, units);
  if(res === null) return; // aborted
  if(res.data) renderWeather(res.data, res.source);
  else if(res.source === 'error') resultsEl.innerHTML = '<li class="empty">Error fetching data.</li>';
};

const debouncedSearch = debounce(doSearch, 500);

searchInput.addEventListener('input', debouncedSearch);
unitsSelect.addEventListener('change', debouncedSearch);

// Load saved API key from localStorage
try{
  const saved = localStorage.getItem('owm_apikey');
  if(saved){
    apikeyInput.value = saved;
  }
}catch(e){ /* ignore localStorage errors */ }

apikeyInput.addEventListener('input', debounce(() => {
  try{ localStorage.setItem('owm_apikey', apikeyInput.value.trim()); }catch(e){}
  cache.clear();
  debouncedSearch();
}, 300));

setStatus('Type a city to lookup weather.');
