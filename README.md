# UPSRTC Live Bus Tracker

Two small web apps (installable on a phone via "Add to Home screen"):

| App | Folder | Who uses it |
|-----|--------|-------------|
| **Driver app** | `driver/` | Driver logs in, picks route + bus number, taps *Start trip*. Phone GPS is sent every 3 s. |
| **Passenger app** | `passenger/` | Passenger picks route + stop and sees live buses on an OpenStreetMap map with ETA. |

Stack: plain HTML/JS · Firebase Realtime Database + Auth · Leaflet/OpenStreetMap · hosted free on GitHub Pages (HTTPS, required for GPS).

## Setup (about 15 minutes)

1. **Firebase project** → https://console.firebase.google.com → *Add project*.
2. **Realtime Database** → Create database → then *Rules* tab → paste `database.rules.json` → Publish.
3. **Authentication** → Sign-in method → enable **Email/Password**. Then *Settings → User actions* → turn OFF "Enable create (sign-up)" so nobody can self-register.
4. **Create driver accounts**: Authentication → Users → *Add user* (one email + password per driver).
5. **Web app config**: Project settings → *Your apps* → `</>` Web → copy the config into `firebase-config.js`.
6. **Your routes**: edit `routes.js` (stops, and optional `path` points along the road for accurate line/ETA).
7. **Test locally**: run `python3 -m http.server 8000` in this folder, open `http://localhost:8000/` (GPS works on localhost).
   Use *Test with simulated GPS* in the driver app and watch the bus move in the passenger app.
8. **Publish**: push to GitHub → repo *Settings → Pages* → deploy from `main` / root.
   Apps will be at `https://<user>.github.io/<repo>/driver.html` and `/passenger.html`.

## Real-life notes
- Driver must keep the app open with the screen on (browsers pause GPS in background). The app requests a screen wake-lock.
- If a phone loses internet, its bus disappears automatically (`onDisconnect`). Passengers also ignore data older than 90 s.
- Each driver can only write to their own record (`buses/<uid>`), enforced by the database rules.
- ETA = remaining route distance ÷ current speed (min 25 km/h). It ignores traffic and halts.
- Firebase free tier is enough for a college pilot. Use a **mobile data plan** on driver phones.

## Next steps
- Wrap both apps as native Android apps (Capacitor) for reliable background GPS.
- Admin panel to manage routes/buses in the database instead of `routes.js`.
- Push notification / SMS when bus is N minutes away; trip history; crowd levels.
