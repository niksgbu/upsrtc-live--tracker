firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.database(), $ = id => document.getElementById(id);
const map = L.map('map').setView([26.85, 80.95], 8);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
let layer = L.layerGroup().addTo(map), markers = {}, buses = {}, offset = 0, stopKm = [];
for (const k in ROUTES) $('route').add(new Option(ROUTES[k].name, k));
db.ref('.info/serverTimeOffset').on('value', s => offset = s.val() || 0);

function drawRoute() {
  const r = $('route').value, R = ROUTES[r];
  layer.clearLayers();
  const line = L.polyline(geom(r), { color: '#667085', weight: 5 }).addTo(layer);
  R.stops.forEach(s => L.circleMarker([s[1], s[2]], { radius: 6, color: '#14181f', fillColor: '#fff', fillOpacity: 1 })
    .bindTooltip(s[0], { permanent: true, direction: 'right', offset: [6, 0] }).addTo(layer));
  map.fitBounds(line.getBounds(), { padding: [30, 30] });
  $('stop').innerHTML = ''; R.stops.forEach((s, i) => $('stop').add(new Option(s[0], i)));
  $('stop').value = R.stops.length - 1;
  stopKm = R.stops.map(s => along(r, s[1], s[2]));
}
function render() {
  const r = $('route').value, si = +$('stop').value, now = Date.now() + offset, live = {};
  Object.entries(buses).forEach(([uid, b]) => { if (b.routeId === r && now - b.ts < 90000) live[uid] = b; });
  for (const uid in markers) if (!live[uid]) { map.removeLayer(markers[uid]); delete markers[uid]; }
  let html = '';
  for (const uid in live) {
    const b = live[uid], pos = [b.lat, b.lng];
    const icon = L.divIcon({ className: '', html: `<div class="busicon">🚌 ${b.busNo}</div>`, iconSize: null });
    if (markers[uid]) markers[uid].setLatLng(pos); else markers[uid] = L.marker(pos, { icon }).addTo(map);
    const d = stopKm[si] - along(r, b.lat, b.lng), mins = d / Math.max(b.speed, 25) * 60;
    const eta = d < 0.3 ? 'Passed / at stop' : mins < 1 ? 'Arriving' : Math.round(mins) + ' min';
    html += `<div class="bus"><div><b>${b.busNo}</b> <span class="pill">LIVE</span>
      <div class="note">${d > 0 ? d.toFixed(1) + ' km to ' + ROUTES[r].stops[si][0] : '—'} · ${b.speed} km/h · ${Math.round((now - b.ts) / 1000)}s ago</div></div>
      <div class="eta">${eta}</div></div>`;
  }
  $('list').innerHTML = html || 'No live bus on this route right now.';
}
$('route').onchange = () => { drawRoute(); render(); }; $('stop').onchange = render;
db.ref('buses').on('value', s => { buses = s.val() || {}; render(); });
setInterval(render, 1000);   // keeps "x seconds ago" fresh and drops stale buses
drawRoute();
