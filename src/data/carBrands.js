// Marques + modèles + couleurs signature + catégorie par modèle (pour auto-remplissage)
// L'utilisateur peut toujours taper librement.

export const BRAND_COLORS = {
  'Renault':    '#FFCC33',
  'Peugeot':    '#0064C8',
  'Dacia':      '#005F27',
  'Hyundai':    '#002C5F',
  'Kia':        '#BB162B',
  'Volkswagen': '#001E50',
  'Toyota':     '#EB0A1E',
  'Citroën':    '#A41C25',
  'Fiat':       '#B30714',
  'Skoda':      '#4BA82E',
  'Seat':       '#E20020',
  'Mercedes':   '#000000',
  'BMW':        '#0066B1',
  'Audi':       '#BB0A30',
  'Nissan':     '#C3002F',
  'Suzuki':     '#1F3F92',
  'Chevrolet':  '#D1AC68',
  'Ford':       '#003478',
  'Opel':       '#F7FF14',
  'Mitsubishi': '#E60012',
  'Honda':      '#CC0000',
  'Mazda':      '#101010',
  'Geely':      '#003B7A',
  'Chery':      '#C8102E',
  'JAC':        '#005BAA',
  'Mahindra':   '#E10A1C',
  'Tata':       '#486AAB',
  'Isuzu':      '#C8102E',
  'Land Rover': '#005A2B',
  'Jeep':       '#3C3C3B',
  'Mini':       '#000000',
  'Lexus':      '#1A1A1A',
  'Volvo':      '#1F4E8F',
};

// Format : 'Marque' : { 'Modèle' : 'Catégorie' }
// Catégories : Citadine, Berline, SUV, Premium, Économique, Utilitaire
export const CAR_MODELS = {
  'Renault': {
    'Clio': 'Citadine', 'Symbol': 'Berline', 'Mégane': 'Berline', 'Captur': 'SUV',
    'Kadjar': 'SUV', 'Koleos': 'SUV', 'Talisman': 'Premium', 'Trafic': 'Utilitaire',
    'Master': 'Utilitaire', 'Express': 'Utilitaire', 'Kangoo': 'Utilitaire',
    'Twingo': 'Citadine', 'Latitude': 'Premium',
  },
  'Peugeot': {
    '208': 'Citadine', '301': 'Berline', '308': 'Berline', '3008': 'SUV', '5008': 'SUV',
    '2008': 'SUV', '407': 'Premium', '508': 'Premium', '301 SW': 'Berline',
    'Partner': 'Utilitaire', 'Boxer': 'Utilitaire', 'Rifter': 'Utilitaire',
    'Expert': 'Utilitaire', 'Traveller': 'Utilitaire',
  },
  'Dacia': {
    'Logan': 'Économique', 'Sandero': 'Économique', 'Duster': 'SUV', 'Lodgy': 'SUV',
    'Dokker': 'Utilitaire', 'Stepway': 'Citadine', 'Spring': 'Citadine', 'Jogger': 'SUV',
  },
  'Hyundai': {
    'i10': 'Citadine', 'i20': 'Citadine', 'i30': 'Berline', 'Accent': 'Berline',
    'Elantra': 'Berline', 'Sonata': 'Premium', 'Tucson': 'SUV', 'Santa Fe': 'SUV',
    'Creta': 'SUV', 'Kona': 'SUV', 'Bayon': 'SUV', 'H1': 'Utilitaire',
    'Grand i10': 'Citadine', 'Verna': 'Berline',
  },
  'Kia': {
    'Picanto': 'Citadine', 'Rio': 'Citadine', 'Cerato': 'Berline', 'K5': 'Premium',
    'Optima': 'Premium', 'Sportage': 'SUV', 'Sorento': 'SUV', 'Seltos': 'SUV',
    'Stonic': 'SUV', 'Soul': 'SUV', 'Carens': 'SUV', 'Bongo': 'Utilitaire',
  },
  'Volkswagen': {
    'Polo': 'Citadine', 'Golf': 'Berline', 'Passat': 'Premium', 'Jetta': 'Berline',
    'Tiguan': 'SUV', 'Touareg': 'Premium', 'Touran': 'SUV', 'T-Roc': 'SUV',
    'T-Cross': 'SUV', 'Caddy': 'Utilitaire', 'Transporter': 'Utilitaire',
    'Crafter': 'Utilitaire', 'Amarok': 'Utilitaire',
  },
  'Toyota': {
    'Yaris': 'Citadine', 'Corolla': 'Berline', 'Camry': 'Premium', 'Avensis': 'Premium',
    'RAV4': 'SUV', 'Land Cruiser': 'Premium', 'Hilux': 'Utilitaire', 'Fortuner': 'SUV',
    'Hiace': 'Utilitaire', 'Prado': 'SUV', 'C-HR': 'SUV', 'Aygo': 'Citadine', 'Auris': 'Berline',
  },
  'Citroën': {
    'C3': 'Citadine', 'C4': 'Berline', 'C5 Aircross': 'SUV', 'C-Elysée': 'Berline',
    'Berlingo': 'Utilitaire', 'Jumper': 'Utilitaire', 'Jumpy': 'Utilitaire',
    'Nemo': 'Utilitaire', 'DS3': 'Citadine', 'DS4': 'Premium', 'DS5': 'Premium', 'C1': 'Citadine',
  },
  'Fiat': {
    '500': 'Citadine', 'Panda': 'Citadine', 'Tipo': 'Berline', 'Doblo': 'Utilitaire',
    '500X': 'SUV', '500L': 'SUV', 'Punto': 'Citadine', 'Bravo': 'Berline',
    'Ducato': 'Utilitaire', 'Fiorino': 'Utilitaire', 'Linea': 'Berline',
  },
  'Skoda': {
    'Fabia': 'Citadine', 'Octavia': 'Berline', 'Superb': 'Premium', 'Rapid': 'Berline',
    'Kodiaq': 'SUV', 'Karoq': 'SUV', 'Scala': 'Berline', 'Kamiq': 'SUV',
  },
  'Seat': {
    'Ibiza': 'Citadine', 'Leon': 'Berline', 'Toledo': 'Berline', 'Arona': 'SUV',
    'Ateca': 'SUV', 'Tarraco': 'SUV', 'Alhambra': 'SUV',
  },
  'Mercedes': {
    'Classe A': 'Premium', 'Classe B': 'Premium', 'Classe C': 'Premium', 'Classe E': 'Premium',
    'Classe S': 'Premium', 'CLA': 'Premium', 'CLS': 'Premium', 'GLA': 'Premium', 'GLC': 'Premium',
    'GLE': 'Premium', 'GLS': 'Premium', 'Vito': 'Utilitaire', 'Sprinter': 'Utilitaire', 'Citan': 'Utilitaire',
  },
  'BMW': {
    'Série 1': 'Premium', 'Série 2': 'Premium', 'Série 3': 'Premium', 'Série 4': 'Premium',
    'Série 5': 'Premium', 'Série 7': 'Premium', 'X1': 'Premium', 'X2': 'Premium',
    'X3': 'Premium', 'X4': 'Premium', 'X5': 'Premium', 'X6': 'Premium', 'X7': 'Premium', 'Z4': 'Premium',
  },
  'Audi': {
    'A1': 'Premium', 'A3': 'Premium', 'A4': 'Premium', 'A5': 'Premium', 'A6': 'Premium',
    'A7': 'Premium', 'A8': 'Premium', 'Q2': 'Premium', 'Q3': 'Premium', 'Q5': 'Premium',
    'Q7': 'Premium', 'Q8': 'Premium',
  },
  'Nissan': {
    'Micra': 'Citadine', 'Sunny': 'Berline', 'Sentra': 'Berline', 'Almera': 'Berline',
    'Qashqai': 'SUV', 'X-Trail': 'SUV', 'Juke': 'SUV', 'Note': 'Citadine',
    'Navara': 'Utilitaire', 'Patrol': 'Premium', 'Pathfinder': 'SUV', 'Murano': 'SUV',
  },
  'Suzuki': {
    'Alto': 'Citadine', 'Celerio': 'Citadine', 'Swift': 'Citadine', 'Baleno': 'Berline',
    'Vitara': 'SUV', 'Jimny': 'SUV', 'S-Cross': 'SUV', 'Maruti': 'Économique',
  },
  'Chevrolet': {
    'Spark': 'Citadine', 'Aveo': 'Citadine', 'Cruze': 'Berline', 'Captiva': 'SUV',
    'Trax': 'SUV', 'Optra': 'Berline', 'Sail': 'Économique',
  },
  'Ford': {
    'Fiesta': 'Citadine', 'Focus': 'Berline', 'Fusion': 'Berline', 'Mondeo': 'Premium',
    'Kuga': 'SUV', 'Edge': 'SUV', 'EcoSport': 'SUV', 'Ranger': 'Utilitaire',
    'Transit': 'Utilitaire', 'Tourneo': 'Utilitaire',
  },
  'Opel': {
    'Corsa': 'Citadine', 'Astra': 'Berline', 'Insignia': 'Premium', 'Mokka': 'SUV',
    'Crossland': 'SUV', 'Grandland': 'SUV', 'Combo': 'Utilitaire', 'Vivaro': 'Utilitaire',
  },
  'Mitsubishi': {
    'Mirage': 'Citadine', 'Lancer': 'Berline', 'ASX': 'SUV', 'Outlander': 'SUV',
    'Eclipse Cross': 'SUV', 'Pajero': 'SUV', 'L200': 'Utilitaire',
  },
  'Honda':      { 'Jazz': 'Citadine', 'Civic': 'Berline', 'Accord': 'Premium', 'CR-V': 'SUV', 'HR-V': 'SUV', 'Pilot': 'SUV' },
  'Mazda':      { '2': 'Citadine', '3': 'Berline', '6': 'Premium', 'CX-3': 'SUV', 'CX-5': 'SUV', 'CX-30': 'SUV', 'CX-9': 'SUV' },
  'Geely':      { 'Emgrand': 'Berline', 'Coolray': 'SUV', 'Atlas': 'SUV', 'Tugella': 'SUV', 'Boyue': 'SUV', 'Azkarra': 'SUV', 'Okavango': 'SUV' },
  'Chery':      { 'Tiggo 2': 'SUV', 'Tiggo 3': 'SUV', 'Tiggo 4': 'SUV', 'Tiggo 7': 'SUV', 'Tiggo 8': 'SUV', 'Arrizo 5': 'Berline', 'QQ': 'Citadine' },
  'JAC':        { 'S2': 'SUV', 'S3': 'SUV', 'S5': 'SUV', 'S7': 'SUV', 'T6': 'Utilitaire', 'T8': 'Utilitaire', 'iEV7S': 'SUV' },
  'Mahindra':   { 'XUV300': 'SUV', 'XUV500': 'SUV', 'XUV700': 'SUV', 'Scorpio': 'SUV', 'Bolero': 'SUV', 'Thar': 'SUV' },
  'Tata':       { 'Indica': 'Citadine', 'Indigo': 'Berline', 'Nano': 'Citadine', 'Tiago': 'Citadine', 'Tigor': 'Berline', 'Nexon': 'SUV' },
  'Isuzu':      { 'D-Max': 'Utilitaire', 'MU-X': 'SUV', 'NPR': 'Utilitaire' },
  'Land Rover': { 'Defender': 'Premium', 'Discovery': 'Premium', 'Discovery Sport': 'Premium', 'Range Rover': 'Premium', 'Range Rover Sport': 'Premium', 'Range Rover Evoque': 'Premium', 'Range Rover Velar': 'Premium' },
  'Jeep':       { 'Renegade': 'SUV', 'Compass': 'SUV', 'Cherokee': 'SUV', 'Grand Cherokee': 'Premium', 'Wrangler': 'SUV' },
  'Mini':       { 'Cooper': 'Premium', 'Cooper S': 'Premium', 'Countryman': 'Premium', 'Clubman': 'Premium', 'Paceman': 'Premium' },
  'Lexus':      { 'IS': 'Premium', 'ES': 'Premium', 'GS': 'Premium', 'LS': 'Premium', 'NX': 'Premium', 'RX': 'Premium', 'GX': 'Premium', 'LX': 'Premium', 'UX': 'Premium' },
  'Volvo':      { 'XC40': 'Premium', 'XC60': 'Premium', 'XC90': 'Premium', 'S60': 'Premium', 'S90': 'Premium', 'V40': 'Premium', 'V60': 'Premium', 'V90': 'Premium' },
};

// Compatibilité avec ancien code
export const CAR_BRANDS = Object.fromEntries(
  Object.entries(CAR_MODELS).map(([brand, models]) => [brand, Object.keys(models)])
);

export const BRAND_LIST = Object.keys(CAR_MODELS).sort();

// Helpers
export const getModelCategory = (brand, model) => CAR_MODELS[brand]?.[model] || null;
export const getBrandColor    = (brand)        => BRAND_COLORS[brand] || '#6b7280';
