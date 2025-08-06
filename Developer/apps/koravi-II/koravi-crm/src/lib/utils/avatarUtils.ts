/**
 * Generates initials from a client's first and last name
 * @param firstName - The client's first name
 * @param lastName - The client's last name
 * @returns The initials (e.g., "JD" for "John Doe")
 */
export function getClientInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
}

/**
 * Generates a consistent background color for an avatar based on the client's name
 * Uses the theme's primary color for consistency
 * @param firstName - The client's first name
 * @param lastName - The client's last name
 * @returns A CSS class for the background color
 */
export function getAvatarBackgroundColor(firstName: string, lastName: string): string {
  // Use the theme's primary color for all avatars
  return 'bg-primary';
}