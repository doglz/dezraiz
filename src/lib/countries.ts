// Static country dataset for the custom phone country selector.
//
// Each entry has:
//   - iso2  : ISO 3166-1 alpha-2 code (used by libphonenumber-js)
//   - namePt: localized Portuguese name (search uses this + nameEn)
//   - nameEn: English name (so EN searches also work)
//
// The dialing code (DDI) is resolved dynamically via libphonenumber-js
// `getCountryCallingCode(iso2)` to keep this file small and consistent.
//
// Flags are emoji generated from the ISO2 (Regional Indicator letters).

import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";

export interface Country {
  iso2: CountryCode;
  namePt: string;
  nameEn: string;
}

// Featured (top of the list) — brasileiros mais comuns no exterior.
const FEATURED_ISO2: CountryCode[] = [
  "BR",
  "US",
  "PT",
  "ES",
  "GB",
  "CA",
  "DE",
  "JP",
  "IE",
  "IT",
];

// Sorted alphabetically by Portuguese name when consumed.
// (List trimmed for readability — covers the world; libphonenumber-js
// validates the ISO2 against its metadata so unknown ones are skipped.)
const COUNTRIES: Country[] = [
  { iso2: "AF", namePt: "Afeganistão", nameEn: "Afghanistan" },
  { iso2: "ZA", namePt: "África do Sul", nameEn: "South Africa" },
  { iso2: "AL", namePt: "Albânia", nameEn: "Albania" },
  { iso2: "DE", namePt: "Alemanha", nameEn: "Germany" },
  { iso2: "AD", namePt: "Andorra", nameEn: "Andorra" },
  { iso2: "AO", namePt: "Angola", nameEn: "Angola" },
  { iso2: "AI", namePt: "Anguilla", nameEn: "Anguilla" },
  { iso2: "AG", namePt: "Antígua e Barbuda", nameEn: "Antigua and Barbuda" },
  { iso2: "SA", namePt: "Arábia Saudita", nameEn: "Saudi Arabia" },
  { iso2: "DZ", namePt: "Argélia", nameEn: "Algeria" },
  { iso2: "AR", namePt: "Argentina", nameEn: "Argentina" },
  { iso2: "AM", namePt: "Armênia", nameEn: "Armenia" },
  { iso2: "AW", namePt: "Aruba", nameEn: "Aruba" },
  { iso2: "AU", namePt: "Austrália", nameEn: "Australia" },
  { iso2: "AT", namePt: "Áustria", nameEn: "Austria" },
  { iso2: "AZ", namePt: "Azerbaijão", nameEn: "Azerbaijan" },
  { iso2: "BS", namePt: "Bahamas", nameEn: "Bahamas" },
  { iso2: "BH", namePt: "Bahrein", nameEn: "Bahrain" },
  { iso2: "BD", namePt: "Bangladesh", nameEn: "Bangladesh" },
  { iso2: "BB", namePt: "Barbados", nameEn: "Barbados" },
  { iso2: "BE", namePt: "Bélgica", nameEn: "Belgium" },
  { iso2: "BZ", namePt: "Belize", nameEn: "Belize" },
  { iso2: "BJ", namePt: "Benin", nameEn: "Benin" },
  { iso2: "BM", namePt: "Bermudas", nameEn: "Bermuda" },
  { iso2: "BY", namePt: "Bielorrússia", nameEn: "Belarus" },
  { iso2: "BO", namePt: "Bolívia", nameEn: "Bolivia" },
  { iso2: "BA", namePt: "Bósnia e Herzegovina", nameEn: "Bosnia and Herzegovina" },
  { iso2: "BW", namePt: "Botsuana", nameEn: "Botswana" },
  { iso2: "BR", namePt: "Brasil", nameEn: "Brazil" },
  { iso2: "BN", namePt: "Brunei", nameEn: "Brunei" },
  { iso2: "BG", namePt: "Bulgária", nameEn: "Bulgaria" },
  { iso2: "BF", namePt: "Burkina Faso", nameEn: "Burkina Faso" },
  { iso2: "BI", namePt: "Burundi", nameEn: "Burundi" },
  { iso2: "BT", namePt: "Butão", nameEn: "Bhutan" },
  { iso2: "CV", namePt: "Cabo Verde", nameEn: "Cape Verde" },
  { iso2: "KH", namePt: "Camboja", nameEn: "Cambodia" },
  { iso2: "CM", namePt: "Camarões", nameEn: "Cameroon" },
  { iso2: "CA", namePt: "Canadá", nameEn: "Canada" },
  { iso2: "QA", namePt: "Catar", nameEn: "Qatar" },
  { iso2: "KZ", namePt: "Cazaquistão", nameEn: "Kazakhstan" },
  { iso2: "TD", namePt: "Chade", nameEn: "Chad" },
  { iso2: "CL", namePt: "Chile", nameEn: "Chile" },
  { iso2: "CN", namePt: "China", nameEn: "China" },
  { iso2: "CY", namePt: "Chipre", nameEn: "Cyprus" },
  { iso2: "CO", namePt: "Colômbia", nameEn: "Colombia" },
  { iso2: "KM", namePt: "Comores", nameEn: "Comoros" },
  { iso2: "CG", namePt: "Congo", nameEn: "Congo" },
  { iso2: "CD", namePt: "Congo (RDC)", nameEn: "Democratic Republic of the Congo" },
  { iso2: "KP", namePt: "Coreia do Norte", nameEn: "North Korea" },
  { iso2: "KR", namePt: "Coreia do Sul", nameEn: "South Korea" },
  { iso2: "CI", namePt: "Costa do Marfim", nameEn: "Côte d'Ivoire" },
  { iso2: "CR", namePt: "Costa Rica", nameEn: "Costa Rica" },
  { iso2: "HR", namePt: "Croácia", nameEn: "Croatia" },
  { iso2: "CU", namePt: "Cuba", nameEn: "Cuba" },
  { iso2: "CW", namePt: "Curaçao", nameEn: "Curaçao" },
  { iso2: "DK", namePt: "Dinamarca", nameEn: "Denmark" },
  { iso2: "DJ", namePt: "Djibouti", nameEn: "Djibouti" },
  { iso2: "DM", namePt: "Dominica", nameEn: "Dominica" },
  { iso2: "EG", namePt: "Egito", nameEn: "Egypt" },
  { iso2: "SV", namePt: "El Salvador", nameEn: "El Salvador" },
  { iso2: "AE", namePt: "Emirados Árabes Unidos", nameEn: "United Arab Emirates" },
  { iso2: "EC", namePt: "Equador", nameEn: "Ecuador" },
  { iso2: "ER", namePt: "Eritreia", nameEn: "Eritrea" },
  { iso2: "SK", namePt: "Eslováquia", nameEn: "Slovakia" },
  { iso2: "SI", namePt: "Eslovênia", nameEn: "Slovenia" },
  { iso2: "ES", namePt: "Espanha", nameEn: "Spain" },
  { iso2: "US", namePt: "Estados Unidos", nameEn: "United States" },
  { iso2: "EE", namePt: "Estônia", nameEn: "Estonia" },
  { iso2: "ET", namePt: "Etiópia", nameEn: "Ethiopia" },
  { iso2: "FJ", namePt: "Fiji", nameEn: "Fiji" },
  { iso2: "PH", namePt: "Filipinas", nameEn: "Philippines" },
  { iso2: "FI", namePt: "Finlândia", nameEn: "Finland" },
  { iso2: "FR", namePt: "França", nameEn: "France" },
  { iso2: "GA", namePt: "Gabão", nameEn: "Gabon" },
  { iso2: "GM", namePt: "Gâmbia", nameEn: "Gambia" },
  { iso2: "GH", namePt: "Gana", nameEn: "Ghana" },
  { iso2: "GE", namePt: "Geórgia", nameEn: "Georgia" },
  { iso2: "GI", namePt: "Gibraltar", nameEn: "Gibraltar" },
  { iso2: "GD", namePt: "Granada", nameEn: "Grenada" },
  { iso2: "GR", namePt: "Grécia", nameEn: "Greece" },
  { iso2: "GL", namePt: "Groenlândia", nameEn: "Greenland" },
  { iso2: "GP", namePt: "Guadalupe", nameEn: "Guadeloupe" },
  { iso2: "GU", namePt: "Guam", nameEn: "Guam" },
  { iso2: "GT", namePt: "Guatemala", nameEn: "Guatemala" },
  { iso2: "GG", namePt: "Guernsey", nameEn: "Guernsey" },
  { iso2: "GY", namePt: "Guiana", nameEn: "Guyana" },
  { iso2: "GF", namePt: "Guiana Francesa", nameEn: "French Guiana" },
  { iso2: "GN", namePt: "Guiné", nameEn: "Guinea" },
  { iso2: "GQ", namePt: "Guiné Equatorial", nameEn: "Equatorial Guinea" },
  { iso2: "GW", namePt: "Guiné-Bissau", nameEn: "Guinea-Bissau" },
  { iso2: "HT", namePt: "Haiti", nameEn: "Haiti" },
  { iso2: "NL", namePt: "Holanda", nameEn: "Netherlands" },
  { iso2: "HN", namePt: "Honduras", nameEn: "Honduras" },
  { iso2: "HK", namePt: "Hong Kong", nameEn: "Hong Kong" },
  { iso2: "HU", namePt: "Hungria", nameEn: "Hungary" },
  { iso2: "YE", namePt: "Iêmen", nameEn: "Yemen" },
  { iso2: "IM", namePt: "Ilha de Man", nameEn: "Isle of Man" },
  { iso2: "CX", namePt: "Ilha Christmas", nameEn: "Christmas Island" },
  { iso2: "KY", namePt: "Ilhas Cayman", nameEn: "Cayman Islands" },
  { iso2: "CC", namePt: "Ilhas Cocos", nameEn: "Cocos Islands" },
  { iso2: "CK", namePt: "Ilhas Cook", nameEn: "Cook Islands" },
  { iso2: "FO", namePt: "Ilhas Faroé", nameEn: "Faroe Islands" },
  { iso2: "FK", namePt: "Ilhas Malvinas", nameEn: "Falkland Islands" },
  { iso2: "MP", namePt: "Ilhas Marianas do Norte", nameEn: "Northern Mariana Islands" },
  { iso2: "MH", namePt: "Ilhas Marshall", nameEn: "Marshall Islands" },
  { iso2: "SB", namePt: "Ilhas Salomão", nameEn: "Solomon Islands" },
  { iso2: "TC", namePt: "Ilhas Turks e Caicos", nameEn: "Turks and Caicos Islands" },
  { iso2: "VI", namePt: "Ilhas Virgens Americanas", nameEn: "U.S. Virgin Islands" },
  { iso2: "VG", namePt: "Ilhas Virgens Britânicas", nameEn: "British Virgin Islands" },
  { iso2: "IN", namePt: "Índia", nameEn: "India" },
  { iso2: "ID", namePt: "Indonésia", nameEn: "Indonesia" },
  { iso2: "IR", namePt: "Irã", nameEn: "Iran" },
  { iso2: "IQ", namePt: "Iraque", nameEn: "Iraq" },
  { iso2: "IE", namePt: "Irlanda", nameEn: "Ireland" },
  { iso2: "IS", namePt: "Islândia", nameEn: "Iceland" },
  { iso2: "IL", namePt: "Israel", nameEn: "Israel" },
  { iso2: "IT", namePt: "Itália", nameEn: "Italy" },
  { iso2: "JM", namePt: "Jamaica", nameEn: "Jamaica" },
  { iso2: "JP", namePt: "Japão", nameEn: "Japan" },
  { iso2: "JE", namePt: "Jersey", nameEn: "Jersey" },
  { iso2: "JO", namePt: "Jordânia", nameEn: "Jordan" },
  { iso2: "KW", namePt: "Kuwait", nameEn: "Kuwait" },
  { iso2: "LA", namePt: "Laos", nameEn: "Laos" },
  { iso2: "LS", namePt: "Lesoto", nameEn: "Lesotho" },
  { iso2: "LV", namePt: "Letônia", nameEn: "Latvia" },
  { iso2: "LB", namePt: "Líbano", nameEn: "Lebanon" },
  { iso2: "LR", namePt: "Libéria", nameEn: "Liberia" },
  { iso2: "LY", namePt: "Líbia", nameEn: "Libya" },
  { iso2: "LI", namePt: "Liechtenstein", nameEn: "Liechtenstein" },
  { iso2: "LT", namePt: "Lituânia", nameEn: "Lithuania" },
  { iso2: "LU", namePt: "Luxemburgo", nameEn: "Luxembourg" },
  { iso2: "MO", namePt: "Macau", nameEn: "Macau" },
  { iso2: "MK", namePt: "Macedônia do Norte", nameEn: "North Macedonia" },
  { iso2: "MG", namePt: "Madagascar", nameEn: "Madagascar" },
  { iso2: "MY", namePt: "Malásia", nameEn: "Malaysia" },
  { iso2: "MW", namePt: "Malawi", nameEn: "Malawi" },
  { iso2: "MV", namePt: "Maldivas", nameEn: "Maldives" },
  { iso2: "ML", namePt: "Mali", nameEn: "Mali" },
  { iso2: "MT", namePt: "Malta", nameEn: "Malta" },
  { iso2: "MA", namePt: "Marrocos", nameEn: "Morocco" },
  { iso2: "MQ", namePt: "Martinica", nameEn: "Martinique" },
  { iso2: "MU", namePt: "Maurício", nameEn: "Mauritius" },
  { iso2: "MR", namePt: "Mauritânia", nameEn: "Mauritania" },
  { iso2: "YT", namePt: "Mayotte", nameEn: "Mayotte" },
  { iso2: "MX", namePt: "México", nameEn: "Mexico" },
  { iso2: "MM", namePt: "Mianmar", nameEn: "Myanmar" },
  { iso2: "FM", namePt: "Micronésia", nameEn: "Micronesia" },
  { iso2: "MZ", namePt: "Moçambique", nameEn: "Mozambique" },
  { iso2: "MD", namePt: "Moldávia", nameEn: "Moldova" },
  { iso2: "MC", namePt: "Mônaco", nameEn: "Monaco" },
  { iso2: "MN", namePt: "Mongólia", nameEn: "Mongolia" },
  { iso2: "ME", namePt: "Montenegro", nameEn: "Montenegro" },
  { iso2: "MS", namePt: "Montserrat", nameEn: "Montserrat" },
  { iso2: "NA", namePt: "Namíbia", nameEn: "Namibia" },
  { iso2: "NR", namePt: "Nauru", nameEn: "Nauru" },
  { iso2: "NP", namePt: "Nepal", nameEn: "Nepal" },
  { iso2: "NI", namePt: "Nicarágua", nameEn: "Nicaragua" },
  { iso2: "NE", namePt: "Níger", nameEn: "Niger" },
  { iso2: "NG", namePt: "Nigéria", nameEn: "Nigeria" },
  { iso2: "NU", namePt: "Niue", nameEn: "Niue" },
  { iso2: "NO", namePt: "Noruega", nameEn: "Norway" },
  { iso2: "NC", namePt: "Nova Caledônia", nameEn: "New Caledonia" },
  { iso2: "NZ", namePt: "Nova Zelândia", nameEn: "New Zealand" },
  { iso2: "OM", namePt: "Omã", nameEn: "Oman" },
  { iso2: "NL", namePt: "Países Baixos", nameEn: "Netherlands" },
  { iso2: "PW", namePt: "Palau", nameEn: "Palau" },
  { iso2: "PA", namePt: "Panamá", nameEn: "Panama" },
  { iso2: "PG", namePt: "Papua-Nova Guiné", nameEn: "Papua New Guinea" },
  { iso2: "PK", namePt: "Paquistão", nameEn: "Pakistan" },
  { iso2: "PY", namePt: "Paraguai", nameEn: "Paraguay" },
  { iso2: "PE", namePt: "Peru", nameEn: "Peru" },
  { iso2: "PF", namePt: "Polinésia Francesa", nameEn: "French Polynesia" },
  { iso2: "PL", namePt: "Polônia", nameEn: "Poland" },
  { iso2: "PR", namePt: "Porto Rico", nameEn: "Puerto Rico" },
  { iso2: "PT", namePt: "Portugal", nameEn: "Portugal" },
  { iso2: "KE", namePt: "Quênia", nameEn: "Kenya" },
  { iso2: "KG", namePt: "Quirguistão", nameEn: "Kyrgyzstan" },
  { iso2: "KI", namePt: "Quiribati", nameEn: "Kiribati" },
  { iso2: "GB", namePt: "Reino Unido", nameEn: "United Kingdom" },
  { iso2: "CF", namePt: "República Centro-Africana", nameEn: "Central African Republic" },
  { iso2: "DO", namePt: "República Dominicana", nameEn: "Dominican Republic" },
  { iso2: "CZ", namePt: "República Tcheca", nameEn: "Czech Republic" },
  { iso2: "RE", namePt: "Reunião", nameEn: "Réunion" },
  { iso2: "RO", namePt: "Romênia", nameEn: "Romania" },
  { iso2: "RW", namePt: "Ruanda", nameEn: "Rwanda" },
  { iso2: "RU", namePt: "Rússia", nameEn: "Russia" },
  { iso2: "EH", namePt: "Saara Ocidental", nameEn: "Western Sahara" },
  { iso2: "PM", namePt: "Saint-Pierre e Miquelon", nameEn: "Saint Pierre and Miquelon" },
  { iso2: "WS", namePt: "Samoa", nameEn: "Samoa" },
  { iso2: "AS", namePt: "Samoa Americana", nameEn: "American Samoa" },
  { iso2: "SM", namePt: "San Marino", nameEn: "San Marino" },
  { iso2: "SH", namePt: "Santa Helena", nameEn: "Saint Helena" },
  { iso2: "LC", namePt: "Santa Lúcia", nameEn: "Saint Lucia" },
  { iso2: "BL", namePt: "São Bartolomeu", nameEn: "Saint Barthélemy" },
  { iso2: "KN", namePt: "São Cristóvão e Nevis", nameEn: "Saint Kitts and Nevis" },
  { iso2: "MF", namePt: "São Martinho (FR)", nameEn: "Saint Martin" },
  { iso2: "SX", namePt: "São Martinho (NL)", nameEn: "Sint Maarten" },
  { iso2: "ST", namePt: "São Tomé e Príncipe", nameEn: "São Tomé and Príncipe" },
  { iso2: "VC", namePt: "São Vicente e Granadinas", nameEn: "Saint Vincent and the Grenadines" },
  { iso2: "SN", namePt: "Senegal", nameEn: "Senegal" },
  { iso2: "SL", namePt: "Serra Leoa", nameEn: "Sierra Leone" },
  { iso2: "RS", namePt: "Sérvia", nameEn: "Serbia" },
  { iso2: "SC", namePt: "Seychelles", nameEn: "Seychelles" },
  { iso2: "SG", namePt: "Singapura", nameEn: "Singapore" },
  { iso2: "SY", namePt: "Síria", nameEn: "Syria" },
  { iso2: "SO", namePt: "Somália", nameEn: "Somalia" },
  { iso2: "LK", namePt: "Sri Lanka", nameEn: "Sri Lanka" },
  { iso2: "SZ", namePt: "Suazilândia", nameEn: "Eswatini" },
  { iso2: "SD", namePt: "Sudão", nameEn: "Sudan" },
  { iso2: "SS", namePt: "Sudão do Sul", nameEn: "South Sudan" },
  { iso2: "SE", namePt: "Suécia", nameEn: "Sweden" },
  { iso2: "CH", namePt: "Suíça", nameEn: "Switzerland" },
  { iso2: "SR", namePt: "Suriname", nameEn: "Suriname" },
  { iso2: "TJ", namePt: "Tadjiquistão", nameEn: "Tajikistan" },
  { iso2: "TH", namePt: "Tailândia", nameEn: "Thailand" },
  { iso2: "TW", namePt: "Taiwan", nameEn: "Taiwan" },
  { iso2: "TZ", namePt: "Tanzânia", nameEn: "Tanzania" },
  { iso2: "TL", namePt: "Timor-Leste", nameEn: "Timor-Leste" },
  { iso2: "TG", namePt: "Togo", nameEn: "Togo" },
  { iso2: "TK", namePt: "Tokelau", nameEn: "Tokelau" },
  { iso2: "TO", namePt: "Tonga", nameEn: "Tonga" },
  { iso2: "TT", namePt: "Trinidad e Tobago", nameEn: "Trinidad and Tobago" },
  { iso2: "TN", namePt: "Tunísia", nameEn: "Tunisia" },
  { iso2: "TM", namePt: "Turcomenistão", nameEn: "Turkmenistan" },
  { iso2: "TR", namePt: "Turquia", nameEn: "Turkey" },
  { iso2: "TV", namePt: "Tuvalu", nameEn: "Tuvalu" },
  { iso2: "UA", namePt: "Ucrânia", nameEn: "Ukraine" },
  { iso2: "UG", namePt: "Uganda", nameEn: "Uganda" },
  { iso2: "UY", namePt: "Uruguai", nameEn: "Uruguay" },
  { iso2: "UZ", namePt: "Uzbequistão", nameEn: "Uzbekistan" },
  { iso2: "VU", namePt: "Vanuatu", nameEn: "Vanuatu" },
  { iso2: "VA", namePt: "Vaticano", nameEn: "Vatican City" },
  { iso2: "VE", namePt: "Venezuela", nameEn: "Venezuela" },
  { iso2: "VN", namePt: "Vietnã", nameEn: "Vietnam" },
  { iso2: "ZM", namePt: "Zâmbia", nameEn: "Zambia" },
  { iso2: "ZW", namePt: "Zimbábue", nameEn: "Zimbabwe" },
];

// De-duplicate (NL appears twice intentionally as Holanda/Países Baixos —
// keep only the first to avoid duplicate keys downstream).
const seen = new Set<string>();
export const COUNTRIES_UNIQUE: Country[] = COUNTRIES.filter((c) => {
  if (seen.has(c.iso2)) return false;
  seen.add(c.iso2);
  return true;
});

export function flagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return "🌍";
  const A = 0x1f1e6;
  const cc = iso2.toUpperCase();
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65, A + cc.charCodeAt(1) - 65);
}

/** Calling code (DDI) without "+" — falls back to "" for unknown codes. */
export function callingCode(iso2: CountryCode): string {
  try {
    return getCountryCallingCode(iso2);
  } catch {
    return "";
  }
}


const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Search countries by PT name, EN name, or DDI digits.
 * Ranks "starts with" matches first, then substring matches.
 */
export function searchCountries(query: string): Country[] {
  const q = norm(query);
  if (!q) return COUNTRIES_UNIQUE;

  const startsWith: Country[] = [];
  const includes: Country[] = [];

  for (const c of COUNTRIES_UNIQUE) {
    const pt = norm(c.namePt);
    const en = norm(c.nameEn);
    const code = callingCode(c.iso2);

    if (pt.startsWith(q) || en.startsWith(q) || code.startsWith(q)) {
      startsWith.push(c);
    } else if (pt.includes(q) || en.includes(q) || code.includes(q)) {
      includes.push(c);
    }
  }

  return [...startsWith, ...includes];
}

export const FEATURED_COUNTRIES: Country[] = FEATURED_ISO2.map(
  (iso2) => COUNTRIES_UNIQUE.find((c) => c.iso2 === iso2)!,
).filter(Boolean);
