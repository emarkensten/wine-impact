// Approximate road distances from various countries to Sweden (Stockholm) in km
const DISTANCES_TO_SWEDEN: Record<string, number> = {
  // Nordics
  'Sverige': 0,
  'Sweden': 0,
  'Norge': 500,
  'Norway': 500,
  'Danmark': 600,
  'Denmark': 600,
  'Finland': 500,
  'Island': 3000, // Via ferry/air
  'Iceland': 3000,

  // Western Europe
  'Frankrike': 1800,
  'France': 1800,
  'Tyskland': 1200,
  'Germany': 1200,
  'Belgien': 1400,
  'Belgium': 1400,
  'Nederländerna': 1300,
  'Netherlands': 1300,
  'Luxemburg': 1500,
  'Luxembourg': 1500,
  'Schweiz': 1800,
  'Switzerland': 1800,
  'Österrike': 1600,
  'Austria': 1600,

  // Southern Europe
  'Italien': 2200,
  'Italy': 2200,
  'Spanien': 2800,
  'Spain': 2800,
  'Portugal': 3200,
  'Greece': 3000,
  'Grekland': 3000,

  // Eastern Europe
  'Polen': 900,
  'Poland': 900,
  'Tjeckien': 1200,
  'Czech Republic': 1200,
  'Ungern': 1500,
  'Hungary': 1500,
  'Rumänien': 2000,
  'Romania': 2000,
  'Bulgarien': 2200,
  'Bulgaria': 2200,
  'Slovenien': 1700,
  'Slovenia': 1700,
  'Kroatien': 1900,
  'Croatia': 1900,

  // UK & Ireland
  'Storbritannien': 1800,
  'United Kingdom': 1800,
  'UK': 1800,
  'England': 1800,
  'Skottland': 2000,
  'Scotland': 2000,
  'Irland': 2200,
  'Ireland': 2200,

  // Americas
  'USA': 8000,
  'United States': 8000,
  'Kanada': 7500,
  'Canada': 7500,
  'Mexiko': 10000,
  'Mexico': 10000,
  'Argentina': 12000,
  'Chile': 13000,
  'Brasilien': 10000,
  'Brazil': 10000,

  // Africa
  'Sydafrika': 11000,
  'South Africa': 11000,
  'Marocko': 4000,
  'Morocco': 4000,

  // Asia & Oceania
  'Australien': 15000,
  'Australia': 15000,
  'Nya Zeeland': 18000,
  'New Zealand': 18000,
  'Japan': 9000,
  'Kina': 8000,
  'China': 8000,
  'Indien': 7000,
  'India': 7000,

  // Middle East
  'Israel': 4000,
  'Libanon': 4000,
  'Lebanon': 4000,
  'Turkiet': 3000,
  'Turkey': 3000,

  // Fallback for unknown
  'Unknown': 2000,
  'Okänt': 2000,
};

export function getDistanceFromSweden(country: string): number {
  // Try exact match first
  if (DISTANCES_TO_SWEDEN[country] !== undefined) {
    return DISTANCES_TO_SWEDEN[country];
  }

  // Try case-insensitive match
  const lowerCountry = country.toLowerCase();
  for (const [key, value] of Object.entries(DISTANCES_TO_SWEDEN)) {
    if (key.toLowerCase() === lowerCountry) {
      return value;
    }
  }

  // Default distance for unknown countries
  return 2000;
}

export function getCountryList(): string[] {
  return Object.keys(DISTANCES_TO_SWEDEN).filter(
    (c) => !['Unknown', 'Okänt'].includes(c)
  );
}
