/**
 * Phone number validation and formatting service
 * This service centralizes all phone number operations to ensure consistency
 * between client and server validations.
 */

// Importing libraries for phone validation
// Note: We use direct implementation without requiring external libraries
// for maximum server performance and fewer dependencies

// Country dial codes mapping
const COUNTRY_DIAL_CODES = {
  'AF': '+93', 'AL': '+355', 'DZ': '+213', 'AS': '+1684', 'AD': '+376', 'AO': '+244', 'AI': '+1264',
  'AG': '+1268', 'AR': '+54', 'AM': '+374', 'AW': '+297', 'AU': '+61', 'AT': '+43', 'AZ': '+994',
  'BS': '+1242', 'BH': '+973', 'BD': '+880', 'BB': '+1246', 'BY': '+375', 'BE': '+32', 'BZ': '+501',
  'BJ': '+229', 'BM': '+1441', 'BT': '+975', 'BO': '+591', 'BA': '+387', 'BW': '+267', 'BR': '+55',
  'BN': '+673', 'BG': '+359', 'BF': '+226', 'BI': '+257', 'KH': '+855', 'CM': '+237', 'CA': '+1',
  'CV': '+238', 'KY': '+1345', 'CF': '+236', 'TD': '+235', 'CL': '+56', 'CN': '+86', 'CO': '+57',
  'KM': '+269', 'CG': '+242', 'CD': '+243', 'CK': '+682', 'CR': '+506', 'CI': '+225', 'HR': '+385',
  'CU': '+53', 'CY': '+357', 'CZ': '+420', 'DK': '+45', 'DJ': '+253', 'DM': '+1767', 'DO': '+1809',
  'EC': '+593', 'EG': '+20', 'SV': '+503', 'GQ': '+240', 'ER': '+291', 'EE': '+372', 'ET': '+251',
  'FO': '+298', 'FJ': '+679', 'FI': '+358', 'FR': '+33', 'GF': '+594', 'PF': '+689', 'GA': '+241',
  'GM': '+220', 'GE': '+995', 'DE': '+49', 'GH': '+233', 'GI': '+350', 'GR': '+30', 'GL': '+299',
  'GD': '+1473', 'GP': '+590', 'GU': '+1671', 'GT': '+502', 'GN': '+224', 'GW': '+245', 'GY': '+592',
  'HT': '+509', 'HN': '+504', 'HK': '+852', 'HU': '+36', 'IS': '+354', 'IN': '+91', 'ID': '+62',
  'IR': '+98', 'IQ': '+964', 'IE': '+353', 'IL': '+972', 'IT': '+39', 'JM': '+1876', 'JP': '+81',
  'JO': '+962', 'KZ': '+7', 'KE': '+254', 'KI': '+686', 'KP': '+850', 'KR': '+82', 'KW': '+965',
  'KG': '+996', 'LA': '+856', 'LV': '+371', 'LB': '+961', 'LS': '+266', 'LR': '+231', 'LY': '+218',
  'LI': '+423', 'LT': '+370', 'LU': '+352', 'MO': '+853', 'MK': '+389', 'MG': '+261', 'MW': '+265',
  'MY': '+60', 'MV': '+960', 'ML': '+223', 'MT': '+356', 'MH': '+692', 'MQ': '+596', 'MR': '+222',
  'MU': '+230', 'YT': '+262', 'MX': '+52', 'FM': '+691', 'MD': '+373', 'MC': '+377', 'MN': '+976',
  'ME': '+382', 'MS': '+1664', 'MA': '+212', 'MZ': '+258', 'MM': '+95', 'NA': '+264', 'NR': '+674',
  'NP': '+977', 'NL': '+31', 'NC': '+687', 'NZ': '+64', 'NI': '+505', 'NE': '+227', 'NG': '+234',
  'NU': '+683', 'NF': '+672', 'MP': '+1670', 'NO': '+47', 'OM': '+968', 'PK': '+92', 'PW': '+680',
  'PS': '+970', 'PA': '+507', 'PG': '+675', 'PY': '+595', 'PE': '+51', 'PH': '+63', 'PL': '+48',
  'PT': '+351', 'PR': '+1', 'QA': '+974', 'RO': '+40', 'RU': '+7', 'RW': '+250', 'KN': '+1869',
  'LC': '+1758', 'VC': '+1784', 'WS': '+685', 'SM': '+378', 'ST': '+239', 'SA': '+966', 'SN': '+221',
  'RS': '+381', 'SC': '+248', 'SL': '+232', 'SG': '+65', 'SK': '+421', 'SI': '+386', 'SB': '+677',
  'SO': '+252', 'ZA': '+27', 'SS': '+211', 'ES': '+34', 'LK': '+94', 'SD': '+249', 'SR': '+597',
  'SZ': '+268', 'SE': '+46', 'CH': '+41', 'SY': '+963', 'TW': '+886', 'TJ': '+992', 'TZ': '+255',
  'TH': '+66', 'TL': '+670', 'TG': '+228', 'TK': '+690', 'TO': '+676', 'TT': '+1868', 'TN': '+216',
  'TR': '+90', 'TM': '+993', 'TC': '+1649', 'TV': '+688', 'UG': '+256', 'UA': '+380', 'AE': '+971',
  'GB': '+44', 'US': '+1', 'UY': '+598', 'UZ': '+998', 'VU': '+678', 'VE': '+58', 'VN': '+84',
  'VG': '+1284', 'VI': '+1340', 'YE': '+967', 'ZM': '+260', 'ZW': '+263'
};

// Example phone formats by country
const PHONE_EXAMPLES = {
  'US': '(201) 555-0123',
  'GB': '07700 900123',
  'CA': '(204) 555-0123',
  'AU': '0412 345 678',
  'NZ': '021 123 4567',
  'IN': '99999 12345',
  'DE': '0171 1234567',
  'FR': '06 12 34 56 78',
  'IT': '312 345 6789',
  'ES': '612 34 56 78',
  'JP': '090-1234-5678',
  'CN': '131 2345 6789',
  'RU': '+7 912 345 67 89',
  'BR': '(11) 91234-5678',
  'MX': '044 55 1234 5678',
  'ZA': '071 123 4567',
};

// Country metadata for display
const COUNTRY_NAMES = {
  'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
  'NZ': 'New Zealand', 'IN': 'India', 'DE': 'Germany', 'FR': 'France', 'IT': 'Italy',
  'ES': 'Spain', 'JP': 'Japan', 'CN': 'China', 'RU': 'Russia', 'BR': 'Brazil',
  'MX': 'Mexico', 'ZA': 'South Africa', 'SG': 'Singapore', 'KR': 'South Korea',
  'ID': 'Indonesia', 'PH': 'Philippines', 'TH': 'Thailand', 'MY': 'Malaysia',
  'AE': 'United Arab Emirates', 'SA': 'Saudi Arabia', 'IL': 'Israel', 'TR': 'Turkey',
  'CH': 'Switzerland', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
  'PL': 'Poland', 'NL': 'Netherlands', 'BE': 'Belgium', 'AT': 'Austria'
  // Add more as needed
};

/**
 * Basic server-side phone number validation
 * @param {string} phoneNumber - Phone number to validate
 * @param {string} countryCode - ISO country code (e.g., 'US', 'GB')
 * @returns {boolean} - Whether the phone number is valid
 */
function validatePhoneNumber(phoneNumber, countryCode) {
  if (!phoneNumber || !countryCode) return false;

  // Clean the phone number (remove all non-digits)
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  
  // Get country dial code
  const dialCode = COUNTRY_DIAL_CODES[countryCode];
  if (!dialCode) return false;
  
  // Basic validation patterns by country
  const patterns = {
    'US': /^1?\d{10}$/, // US: +1 XXX XXX XXXX (10 digits)
    'CA': /^1?\d{10}$/, // Canada: +1 XXX XXX XXXX (10 digits)
    'GB': /^(7\d{9}|[12]\d{9,10})$/, // UK: +44 XXXX XXXXXX
    'AU': /^(4\d{8}|[2378]\d{8})$/, // Australia: +61 XXX XXX XXX
    'IN': /^[6789]\d{9}$/, // India: +91 XXXXX XXXXX
    // Default pattern (at least 7 digits, max 15)
    'DEFAULT': /^\d{7,15}$/
  };
  
  // Get the pattern for the country, or use default
  const pattern = patterns[countryCode] || patterns.DEFAULT;
  
  // Match against the pattern
  return pattern.test(cleanedNumber);
}

/**
 * Format phone number to E.164 format for storage and communication
 * @param {string} phoneNumber - Phone number to format
 * @param {string} countryCode - ISO country code
 * @returns {string} - E.164 formatted number or original if formatting fails
 */
function formatPhoneE164(phoneNumber, countryCode) {
  if (!phoneNumber || !countryCode) return phoneNumber;
  
  try {
    // Clean the number
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Get dial code
    const dialCode = COUNTRY_DIAL_CODES[countryCode];
    if (!dialCode) return phoneNumber;
    
    // Check if already has country code
    const codeDigits = dialCode.replace(/\+/g, '');
    if (cleaned.startsWith(codeDigits)) {
      return '+' + cleaned;
    } else {
      return dialCode + cleaned;
    }
  } catch (error) {
    console.error("E.164 formatting error:", error);
    return phoneNumber;
  }
}

/**
 * Format phone number for display in national format
 * @param {string} phoneNumber - Phone number to format
 * @param {string} countryCode - ISO country code
 * @returns {string} - Formatted phone number for display
 */
function formatPhoneForDisplay(phoneNumber, countryCode) {
  if (!phoneNumber || !countryCode) return phoneNumber;
  
  // Clean the phone number (remove all non-digits)
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Simple formatting patterns for common countries
  const formatters = {
    'US': (num) => {
      // Format: (XXX) XXX-XXXX
      const match = num.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
      return num;
    },
    'GB': (num) => {
      // UK format varies by number type
      if (num.length === 10) {
        // Mobile: XXXX XXX XXX
        return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
      }
      return num;
    },
    'AU': (num) => {
      // Australia: XXXX XXX XXX
      const match = num.match(/^(\d{4})(\d{3})(\d{3})$/);
      if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`;
      }
      return num;
    },
    'IN': (num) => {
      // India: XXXXX XXXXX
      const match = num.match(/^(\d{5})(\d{5})$/);
      if (match) {
        return `${match[1]} ${match[2]}`;
      }
      return num;
    }
  };
  
  // Get formatter for country or use default (no formatting)
  const formatter = formatters[countryCode] || ((num) => num);
  
  // Apply the formatter
  return formatter(cleaned);
}

/**
 * Get example phone format for a country
 * @param {string} countryCode - ISO country code
 * @returns {string} - Example phone format for display
 */
function getPhoneExample(countryCode) {
  return PHONE_EXAMPLES[countryCode] || 
    `${COUNTRY_DIAL_CODES[countryCode] || '+XX'} XXX XXX XXXX`;
}

/**
 * Get all country options with dial code and flag emoji
 * @returns {Array} - Array of country objects with code, name, dialCode
 */
function getCountryOptions() {
  return Object.keys(COUNTRY_DIAL_CODES).map(code => {
    return {
      code,
      name: COUNTRY_NAMES[code] || code,
      dialCode: COUNTRY_DIAL_CODES[code]
    };
  });
}

/**
 * Get common countries first, then all other countries
 * @returns {Array} - Sorted array of country objects with popular countries first
 */
function getSortedCountryOptions() {
  const popularCountryCodes = [
    'AU', 'US', 'GB', 'CA', 'NZ', 'IN', 'SG', 'DE', 'FR', 'JP'
  ];
  
  const countries = getCountryOptions();
  const popularCountries = countries.filter(c => popularCountryCodes.includes(c.code));
  const otherCountries = countries.filter(c => !popularCountryCodes.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return [...popularCountries, ...otherCountries];
}

/**
 * Get flag emoji for a country
 * @param {string} countryCode - ISO country code
 * @returns {string} - Flag emoji or empty string if not found
 */
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  
  try {
    // Convert to regional indicator symbols
    const offset = 127397; // Regional Indicator Symbol Letter A (127462) - 'A'.charCodeAt(0) (65)
    const firstLetter = countryCode.charCodeAt(0);
    const secondLetter = countryCode.charCodeAt(1);
    
    return String.fromCodePoint(firstLetter + offset, secondLetter + offset);
  } catch (error) {
    console.error("Error rendering flag:", error);
    return '';
  }
}

module.exports = {
  validatePhoneNumber,
  formatPhoneE164,
  formatPhoneForDisplay,
  getPhoneExample,
  getCountryOptions,
  getSortedCountryOptions,
  getFlagEmoji,
  COUNTRY_DIAL_CODES,
  COUNTRY_NAMES
};