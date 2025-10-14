
export const cipherEmail = (email: string | undefined): string => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email; // invalid email safeguard

  // Hide part of local (show only first 2 chars)
  const visibleLocal = local.slice(0, 2);
  const hiddenLocal = local.length > 2 ? "**" : "*";

  // Process domain
  const lastDotIndex = domain.lastIndexOf(".");
  if (lastDotIndex === -1) return `${visibleLocal}${hiddenLocal}@**`;

  const tld = domain.slice(lastDotIndex); // .com, .org, etc.
  return `${visibleLocal}${hiddenLocal}@**${tld}`;
};

export const cypherPhone = (phone: string | undefined): string => {
  if (!phone) return "";
  const visiblePart = phone.slice(0, 3);
  return `${visiblePart}****`;
};

export const maskString = (str: string | undefined, visibleStart = 2, visibleEnd = 2): string => {
  if (!str) return "";
  if (str.length <= visibleStart + visibleEnd) return str; // If string is too short, return as is

  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const maskedLength = str.length - (visibleStart + visibleEnd);
  const masked = "*".repeat(maskedLength);

  return `${start}${masked}${end}`;
};

/**
 * Obfuscate names for GDPR compliance
 * Example: John Doe -> J*** D***
 */
export const obfuscateName = (name: string | undefined): string => {
  if (!name) return "***";
  
  return name.split(' ').map(part => {
    if (part.length <= 1) {
      return "***";
    }
    return part.substring(0, 1) + "***";
  }).join(' ');
};

/**
 * Obfuscate user ID for GDPR compliance
 * Example: user_12345 -> ***45
 */
export const obfuscateUserId = (id: string | undefined): string => {
  if (!id) return "***";
  
  if (id.length <= 4) {
    return "***";
  }
  
  const end = id.substring(id.length - 2);
  return `***${end}`;
};

/**
 * Generic text obfuscation for sensitive data
 */
export const obfuscateText = (text: string | undefined, showFirst = 1): string => {
  if (!text) return "***";
  
  if (text.length <= showFirst + 2) {
    return "***";
  }
  
  return text.substring(0, showFirst) + "***";
};

/**
 * Obfuscate IP address for GDPR compliance
 * Example: 192.168.1.100 -> 192.168.***.***
 */
export const obfuscateIpAddress = (ip: string | undefined): string => {
  if (!ip) return "***";
  
  const parts = ip.split('.');
  if (parts.length === 4) {
    // IPv4 - hide last two octets
    return `${parts[0]}.${parts[1]}.***.***`;
  } else if (ip.includes(':')) {
    // IPv6 - hide most of it
    const ipv6Parts = ip.split(':');
    if (ipv6Parts.length >= 2) {
      return `${ipv6Parts[0]}:${ipv6Parts[1]}:***:***:***:***:***:***`;
    }
  }
  
  // Fallback
  return obfuscateText(ip, 3);
};