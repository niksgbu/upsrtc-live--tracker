firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth(), db = firebase.database(), $ = id => document.getElementById(id);
for (const k in ROUTES) $('route').add(new Option(ROUTES[k].name, k));

auth.onAuthStateChanged(u => {
  $('login').hidden = !!u; $('trip').hidden = !u;
  if (u) { $('who').textContent = u.email; $('busNo').value = localStorage.busNo || $('busNo').value; }
});
$('loginForm').onsubmit = async e => { e.preventDefault(); $('lerr').textContent = '';
  try { await auth.signInWithEmailAndPassword($('email').value, $('pw').value); }
  catch (err) { $('lerr').textContent = 'Login failed: ' + err.message; } };
$('logout').onclick = () => { stop(); auth.signOut(); };

let watchId = null, simTimer = null, wakeLock = null, lastSend = 0, ref = null;
const setStatus = t => $('status').textContent = t;
const ui = on => { ['start', 'sim'].forEach(i => $(i).hidden = on); $('stop').hidden = !on; };

function send(lat, lng, speedKmh, heading) {
  ref.set({ busNo: $('busNo').value.trim().toUpperCase(), routeId: $('route').value,
    lat, lng, speed: Math.round(speedKmh || 0), heading: heading || 0,
    ts: firebase.database.ServerValue.TIMESTAMP })
    .then(() => setStatus(`✓ Sharing · ${lat.toFixed(5)}, ${lng.toFixed(5)} · ${Math.round(speedKmh || 0)} km/h`))
    .catch(e => setStatus('Upload failed: ' + e.message));
}
async function begin() {
  if (!$('busNo').value.trim()) return setStatus('Enter bus number.');
  localStorage.busNo = $('busNo').value;
  ref = db.ref('buses/' + auth.currentUser.uid);
  ref.onDisconnect().remove();           // bus disappears automatically if phone goes offline
  ui(true);
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (e) {}
}
$('start').onclick = async () => {
  if (!navigator.geolocation) return setStatus('GPS not supported.');
  await begin(); setStatus('Waiting for GPS…');
  watchId = navigator.geolocation.watchPosition(p => {
    if (Date.now() - lastSend < 3000) return; lastSend = Date.now();
    send(p.coords.latitude, p.coords.longitude, (p.coords.speed || 0) * 3.6, p.coords.heading);
  }, e => { setStatus('GPS error: ' + e.message); stop(); },
  { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
};
$('sim').onclick = async () => {
  await begin(); const r = $('route').value, total = cum(r).pop(); let km = 0;
  simTimer = setInterval(() => { km = (km + 0.4) % total; const [la, ln] = pointAt(r, km); send(la, ln, 45); }, 1500);
};
function stop() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  clearInterval(simTimer); watchId = simTimer = null;
  if (ref) { ref.onDisconnect().cancel(); ref.remove(); ref = null; }
  wakeLock?.release?.(); wakeLock = null; ui(false); setStatus('Trip ended.');
}
$('stop').onclick = stop;
document.addEventListener('visibilitychange', async () => {   // re-acquire screen lock when returning
  if (document.visibilityState === 'visible' && ref && !wakeLock) try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (e) {} });
