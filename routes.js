// Edit/add routes. stops = [name, lat, lng]. Optional `path` = [[lat,lng],...] road geometry
// (add many points along the highway for an accurate line and ETA). SAMPLE DATA - replace with real UPSRTC data.
const ROUTES = {
  lko_knp: {
    name: "Lucknow → Kanpur",
    stops: [
      ["Alambagh Bus Stand", 26.8070, 80.9040],
      ["Banthara", 26.7050, 80.7830],
      ["Unnao", 26.5393, 80.4878],
      ["Jhakarkati, Kanpur", 26.4640, 80.3430]
    ]
  },
  knp_pry: {
    name: "Kanpur → Prayagraj",
    stops: [
      ["Jhakarkati, Kanpur", 26.4640, 80.3430],
      ["Fatehpur", 25.9300, 80.8130],
      ["Prayagraj Civil Lines", 25.4530, 81.8350]
    ]
  }
};
