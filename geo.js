const R_EARTH = 6371, rad = x => x * Math.PI / 180;
const hav = (a, b) => { const dl = rad(b[0]-a[0]), dn = rad(b[1]-a[1]);
  const h = Math.sin(dl/2)**2 + Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dn/2)**2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(h)); };
const geom = id => ROUTES[id].path || ROUTES[id].stops.map(s => [s[1], s[2]]);
function cum(id) { const p = geom(id), c = [0];
  for (let i = 1; i < p.length; i++) c.push(c[i-1] + hav(p[i-1], p[i])); return c; }
// km travelled along the route for a GPS point (nearest point on polyline)
function along(id, lat, lng) { const p = geom(id), c = cum(id); let best = 1e9, pos = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const [ay, ax] = p[i], [by, bx] = p[i+1], dx = bx-ax, dy = by-ay;
    let t = ((lng-ax)*dx + (lat-ay)*dy) / (dx*dx + dy*dy || 1); t = Math.max(0, Math.min(1, t));
    const d = hav([lat, lng], [ay + t*dy, ax + t*dx]);
    if (d < best) { best = d; pos = c[i] + t*(c[i+1]-c[i]); } }
  return pos; }
function pointAt(id, km) { const p = geom(id), c = cum(id); km = Math.max(0, Math.min(c[c.length-1], km));
  for (let i = 0; i < p.length - 1; i++) if (km <= c[i+1]) { const t = (km-c[i])/(c[i+1]-c[i] || 1);
    return [p[i][0] + t*(p[i+1][0]-p[i][0]), p[i][1] + t*(p[i+1][1]-p[i][1])]; }
  return p[p.length-1]; }
