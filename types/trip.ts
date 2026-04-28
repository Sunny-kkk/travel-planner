export interface TripNote {
  id: string
  authorAvatar: string
  authorName: string
  content: string
  thumbnail: string
}

export interface TripCard {
  id: string
  time: string
  endTime?: string
  placeName: string
  type: '景点' | '美食' | '酒店' | '购物' | '交通'
  tags: string[]
  notes: TripNote[]
  address?: string
  openTime?: string
  tips?: string
  memo?: string
  lat?: number
  lng?: number
}

export interface TransitInfo {
  mode: '步行' | '公交' | '地铁' | '自驾' | '骑行' | '打车'
  duration: string
  distance?: string
  strategy?: string
}

export interface DayTrip {
  day: number
  cards: TripCard[]
  transits: Record<string, TransitInfo>
}

export interface TripData {
  id: string
  title: string
  days: DayTrip[]
}