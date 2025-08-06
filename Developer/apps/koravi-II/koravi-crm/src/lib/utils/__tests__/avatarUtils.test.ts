import { getClientInitials, getAvatarBackgroundColor } from '../avatarUtils';

describe('avatarUtils', () => {
  describe('getClientInitials', () => {
    it('returns correct initials for normal names', () => {
      expect(getClientInitials('John', 'Doe')).toBe('JD');
      expect(getClientInitials('Jane', 'Smith')).toBe('JS');
    });

    it('handles single character names', () => {
      expect(getClientInitials('A', 'B')).toBe('AB');
    });

    it('handles empty names gracefully', () => {
      expect(getClientInitials('', 'Doe')).toBe('D');
      expect(getClientInitials('John', '')).toBe('J');
      expect(getClientInitials('', '')).toBe('');
    });

    it('converts to uppercase', () => {
      expect(getClientInitials('john', 'doe')).toBe('JD');
      expect(getClientInitials('JANE', 'SMITH')).toBe('JS');
    });
  });

  describe('getAvatarBackgroundColor', () => {
    it('returns a valid CSS class', () => {
      const color = getAvatarBackgroundColor('John', 'Doe');
      expect(color).toMatch(/^bg-\w+-500$/);
    });

    it('returns consistent colors for the same name', () => {
      const color1 = getAvatarBackgroundColor('John', 'Doe');
      const color2 = getAvatarBackgroundColor('John', 'Doe');
      expect(color1).toBe(color2);
    });

    it('returns different colors for different names', () => {
      const color1 = getAvatarBackgroundColor('John', 'Doe');
      const color2 = getAvatarBackgroundColor('Jane', 'Smith');
      // Note: This might occasionally fail due to hash collisions, but very unlikely
      expect(color1).not.toBe(color2);
    });

    it('handles case insensitivity consistently', () => {
      const color1 = getAvatarBackgroundColor('John', 'Doe');
      const color2 = getAvatarBackgroundColor('JOHN', 'DOE');
      expect(color1).toBe(color2);
    });
  });
});