/** Curated automotive photography (Unsplash) for listings & page heroes. */
export const CAR_IMAGES = [
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1626668011687-8a114cf5a34c?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1525609004556-c46c40d4f174?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=500&fit=crop&q=80',
] as const;

export const PAGE_HERO_IMAGES = {
  about:
    'https://images.unsplash.com/photo-1485291571159-772bcfc10da5?w=1600&h=600&fit=crop&q=80',
  contact:
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=600&fit=crop&q=80',
  auth:
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=1600&fit=crop&q=80',
  rental:
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=500&fit=crop&q=80',
  sell:
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1600&h=500&fit=crop&q=80',
} as const;

export const TEAM_PORTRAITS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80',
] as const;

export function getCarImageById(id: string, primaryImage?: string | null): string {
  if (primaryImage) return primaryImage;
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CAR_IMAGES[hash % CAR_IMAGES.length];
}

export function getCarImageByIndex(index: number): string {
  return CAR_IMAGES[index % CAR_IMAGES.length];
}
