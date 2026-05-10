export interface EventType {
  id: string;
  title: string;
  category: string[];

  latitude: number;
  longitude: number;

  venue: string;
  date: string;
  time: string;
  duration: string;
  description: string;

  networkingScore: number;
  technicalScore: number;

  organizer: string;
  url: string;
  image: string;
}
