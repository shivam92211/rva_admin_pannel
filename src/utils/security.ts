
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