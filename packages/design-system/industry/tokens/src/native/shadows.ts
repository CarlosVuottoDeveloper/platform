export interface DropShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowRadius: number;
  shadowOpacity: number;
  elevation: number;
}

export const shadow: Record<'sm' | 'md' | 'lg', DropShadow> = {
  sm: {
    shadowColor: '#02040D',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.4,
    elevation: 2,
  },
  md: {
    shadowColor: '#02040D',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    shadowOpacity: 0.45,
    elevation: 6,
  },
  lg: {
    shadowColor: '#02040D',
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 44,
    shadowOpacity: 0.55,
    elevation: 18,
  },
};
