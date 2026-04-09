/**
 * PitStop F1 — Circuit Database
 * Contains stylized SVG paths and metadata for all 24 F1 calendar tracks.
 * ViewBox for all paths should be treated as "0 0 550 500".
 */

export interface CircuitData {
  id: string; // OpenF1 circuit_short_name or standard slug
  name: string;
  country: string;
  lengthKm: number;
  svgPath: string;
  gridBox: string; // For the tooltip
}

// ── Default Placeholder Track (Oval)
const PLACEHOLDER_PATH = "M 100,250 C 100,100 450,100 450,250 C 450,400 100,400 100,250 Z";

export const TRACKS: Record<string, CircuitData> = {
  // 1. Bahrain
  bahrain: {
    id: "bahrain",
    name: "Bahrain International Circuit",
    country: "Bahrain",
    lengthKm: 5.412,
    svgPath: "M 250,50 L 350,50 C 400,50 450,100 450,150 L 450,250 C 450,300 400,350 350,350 L 250,350 L 200,450 C 180,480 120,480 100,450 C 80,420 100,350 150,300 C 120,300 80,280 80,250 C 80,200 120,200 150,200 L 200,100 C 210,80 230,50 250,50 Z",
    gridBox: "0 0 550 500",
  },
  // 2. Saudi Arabia
  jeddah: {
    id: "jeddah",
    name: "Jeddah Corniche Circuit",
    country: "Saudi Arabia",
    lengthKm: 6.174,
    svgPath: "M 350,50 L 350,450 C 350,480 300,480 300,450 L 300,100 C 300,80 250,80 250,100 L 250,400 C 250,450 200,450 200,400 L 200,50 C 200,20 350,20 350,50 Z",
    gridBox: "0 0 550 500",
  },
  // 3. Australia
  melbourne: {
    id: "melbourne",
    name: "Albert Park Circuit",
    country: "Australia",
    lengthKm: 5.278,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 4. Japan
  suzuka: {
    id: "suzuka",
    name: "Suzuka International Racing Course",
    country: "Japan",
    lengthKm: 5.807,
    svgPath: "M 100,100 C 150,100 200,100 250,150 L 400,300 C 450,350 450,400 400,450 C 350,500 300,500 250,450 L 100,250 Z M 150,200 L 350,200 C 400,200 450,150 450,100 C 450,50 400,20 350,20 L 200,20 C 150,20 100,50 100,100 Z",
    gridBox: "0 0 550 500",
  },
  // 5. China
  shanghai: {
    id: "shanghai",
    name: "Shanghai International Circuit",
    country: "China",
    lengthKm: 5.451,
    svgPath: "M 200,400 L 200,100 C 200,50 350,50 350,100 C 350,150 250,150 250,200 L 450,200 C 500,200 500,400 450,400 L 100,400 C 50,400 50,250 100,250 Z",
    gridBox: "0 0 550 500",
  },
  // 6. Miami
  miami: {
    id: "miami",
    name: "Miami International Autodrome",
    country: "United States",
    lengthKm: 5.412,
    svgPath: "M 350,350 L 450,300 C 500,280 500,220 450,200 L 200,100 C 150,80 100,80 100,150 C 100,200 150,220 200,250 L 300,300 L 300,400 C 300,450 250,450 250,400 L 200,300 C 150,250 100,250 100,350 Z",
    gridBox: "0 0 550 500",
  },
  // 7. Emilia Romagna
  imola: {
    id: "imola",
    name: "Autodromo Enzo e Dino Ferrari",
    country: "Italy",
    lengthKm: 4.909,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 8. Monaco
  monaco: {
    id: "monaco",
    name: "Circuit de Monaco",
    country: "Monaco",
    lengthKm: 3.337,
    svgPath: "M 400,250 C 450,250 450,200 400,200 L 200,50 C 150,20 50,20 50,100 C 50,150 100,150 150,200 L 250,250 L 150,300 C 100,350 100,450 200,450 C 300,450 300,350 400,350 Z",
    gridBox: "0 0 550 500",
  },
  // 9. Canada
  montreal: {
    id: "montreal",
    name: "Circuit Gilles-Villeneuve",
    country: "Canada",
    lengthKm: 4.361,
    svgPath: "M 100,400 L 400,100 C 450,50 480,50 450,100 L 350,200 L 450,250 C 500,280 500,350 450,400 L 150,450 C 100,480 50,450 100,400 Z",
    gridBox: "0 0 550 500",
  },
  // 10. Spain
  barcelona: {
    id: "barcelona",
    name: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    lengthKm: 4.657,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 11. Austria
  spielberg: {
    id: "spielberg",
    name: "Red Bull Ring",
    country: "Austria",
    lengthKm: 4.318,
    svgPath: "M 250,400 C 150,400 100,350 150,300 L 300,100 C 350,50 450,50 450,100 C 450,150 350,200 350,250 L 400,300 C 450,350 400,400 350,400 Z",
    gridBox: "0 0 550 500",
  },
  // 12. Great Britain
  silverstone: {
    id: "silverstone",
    name: "Silverstone Circuit",
    country: "Great Britain",
    lengthKm: 5.891,
    svgPath: "M 150,400 L 150,200 L 100,150 C 50,100 100,50 150,50 L 400,200 C 450,250 480,300 400,350 L 300,400 C 250,450 150,450 150,400 Z",
    gridBox: "0 0 550 500",
  },
  // 13. Hungary
  budapest: {
    id: "budapest",
    name: "Hungaroring",
    country: "Hungary",
    lengthKm: 4.381,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 14. Belgium
  spa: {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    country: "Belgium",
    lengthKm: 7.004,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 15. Netherlands
  zandvoort: {
    id: "zandvoort",
    name: "Circuit Zandvoort",
    country: "Netherlands",
    lengthKm: 4.259,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 16. Italy
  monza: {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    country: "Italy",
    lengthKm: 5.793,
    svgPath: "M 100,400 L 250,200 L 250,100 C 250,50 300,50 350,100 L 450,300 C 500,350 450,450 400,450 L 150,450 Z",
    gridBox: "0 0 550 500",
  },
  // 17. Azerbaijan
  baku: {
    id: "baku",
    name: "Baku City Circuit",
    country: "Azerbaijan",
    lengthKm: 6.003,
    svgPath: "M 200,450 L 450,450 C 480,450 480,400 450,400 L 300,400 L 300,300 L 450,300 C 480,300 480,250 450,250 L 300,250 L 300,100 C 300,50 200,50 200,100 Z",
    gridBox: "0 0 550 500",
  },
  // 18. Singapore
  singapore: {
    id: "singapore",
    name: "Marina Bay Street Circuit",
    country: "Singapore",
    lengthKm: 4.94,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 19. United States (Austin)
  austin: {
    id: "austin",
    name: "Circuit of The Americas",
    country: "United States",
    lengthKm: 5.513,
    svgPath: "M 50,300 C 50,250 100,200 150,250 L 250,350 L 350,200 L 350,100 C 350,50 450,50 450,150 L 450,400 C 450,450 350,500 250,450 Z",
    gridBox: "0 0 550 500",
  },
  // 20. Mexico
  mexico: {
    id: "mexico",
    name: "Autódromo Hermanos Rodríguez",
    country: "Mexico",
    lengthKm: 4.304,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 21. Brazil
  interlagos: {
    id: "interlagos",
    name: "Autódromo José Carlos Pace",
    country: "Brazil",
    lengthKm: 4.309,
    svgPath: "M 150,100 C 50,100 50,250 150,300 L 300,450 C 350,500 450,450 450,350 L 450,200 C 450,100 350,100 300,200 L 250,250 Z",
    gridBox: "0 0 550 500",
  },
  // 22. Las Vegas
  vegas: {
    id: "vegas",
    name: "Las Vegas Strip Circuit",
    country: "United States",
    lengthKm: 6.201,
    svgPath: "M 200,450 L 400,450 C 450,450 450,400 400,400 L 250,400 L 250,100 C 250,50 200,50 200,100 Z",
    gridBox: "0 0 550 500",
  },
  // 23. Qatar
  losail: {
    id: "losail",
    name: "Lusail International Circuit",
    country: "Qatar",
    lengthKm: 5.419,
    svgPath: PLACEHOLDER_PATH,
    gridBox: "0 0 550 500",
  },
  // 24. Abu Dhabi
  abu_dhabi: {
    id: "abu_dhabi",
    name: "Yas Marina Circuit",
    country: "United Arab Emirates",
    lengthKm: 5.281,
    svgPath: `
      M 420,80 
      C 440,80 460,85 470,100 
      L 480,130 
      C 485,145 480,160 470,170 
      L 430,220 
      C 420,235 410,240 395,240 
      L 350,235 
      C 335,235 320,240 310,250 
      L 280,290 
      C 270,305 260,320 260,340 
      L 265,380 
      C 265,395 260,410 250,420 
      L 220,445 
      C 205,455 185,460 170,455 
      L 130,430 
      C 115,425 105,415 100,400 
      L 90,350 
      C 85,335 85,315 90,300 
      L 110,260 
      C 120,240 135,225 155,215 
      L 200,195 
      C 215,190 225,180 230,165 
      L 240,130 
      C 245,115 255,100 270,90 
      L 320,65 
      C 340,55 365,55 385,65 
      L 420,80 Z
    `,
    gridBox: "0 0 550 500",
  }
};

export const DEFAULT_CIRCUIT = TRACKS["abu_dhabi"];

/**
 * Normalizes OpenF1 Meeting locations to our internal map.
 */
export function getCircuitByMeetingLocation(meetingName: string): CircuitData {
  const norm = meetingName.toLowerCase();
  if (norm.includes("miami")) return TRACKS["miami"];
  if (norm.includes("montreal") || norm.includes("canada")) return TRACKS["montreal"];
  if (norm.includes("abu dhabi") || norm.includes("yas marina")) return TRACKS["abu_dhabi"];
  if (norm.includes("bahrain")) return TRACKS["bahrain"];
  if (norm.includes("jeddah") || norm.includes("saudi")) return TRACKS["jeddah"];
  if (norm.includes("melbourne") || norm.includes("australia")) return TRACKS["melbourne"];
  if (norm.includes("suzuka") || norm.includes("japan")) return TRACKS["suzuka"];
  if (norm.includes("shanghai") || norm.includes("china")) return TRACKS["shanghai"];
  if (norm.includes("imola") || norm.includes("emilia")) return TRACKS["imola"];
  if (norm.includes("monaco")) return TRACKS["monaco"];
  if (norm.includes("barcelona") || norm.includes("spain") || norm.includes("madrid")) return TRACKS["barcelona"];
  if (norm.includes("spielberg") || norm.includes("austria")) return TRACKS["spielberg"];
  if (norm.includes("silverstone") || norm.includes("britain") || norm.includes("uk")) return TRACKS["silverstone"];
  if (norm.includes("budapest") || norm.includes("hungary")) return TRACKS["budapest"];
  if (norm.includes("spa") || norm.includes("belgium")) return TRACKS["spa"];
  if (norm.includes("zandvoort") || norm.includes("netherlands") || norm.includes("dutch")) return TRACKS["zandvoort"];
  if (norm.includes("monza") || norm.includes("italy")) return TRACKS["monza"];
  if (norm.includes("baku") || norm.includes("azerbaijan")) return TRACKS["baku"];
  if (norm.includes("singapore")) return TRACKS["singapore"];
  if (norm.includes("austin") || norm.includes("united states") || norm.includes("cota") || norm.includes("us")) return TRACKS["austin"];
  if (norm.includes("mexico")) return TRACKS["mexico"];
  if (norm.includes("interlagos") || norm.includes("brazil") || norm.includes("sao paulo")) return TRACKS["interlagos"];
  if (norm.includes("las vegas") || norm.includes("vegas")) return TRACKS["vegas"];
  if (norm.includes("losail") || norm.includes("lusail") || norm.includes("qatar")) return TRACKS["losail"];
  
  return DEFAULT_CIRCUIT;
}
