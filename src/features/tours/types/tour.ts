export interface Tour {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: 'Dễ' | 'Trung bình' | 'Khó' | 'Khám phá';
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  badge?: string;
  slug: string;
  category: string;
  location: string;
  maxParticipants: number;
  highlights: string[];
  includes: string[];
  excludes?: string[];
  schedule?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface TourCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface TourFilter {
  category?: string;
  level?: string;
  priceRange?: [number, number];
  duration?: string;
  sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
