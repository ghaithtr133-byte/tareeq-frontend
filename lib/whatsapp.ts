const approvedWhatsappNumber = "963992277142";

/** The public business contact channel; callers may add a contextual prompt. */
export function createWhatsappUrl(message?: string) {
  const baseUrl = `https://wa.me/${approvedWhatsappNumber}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}
