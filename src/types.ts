export type Screen = 'home' | 'engage' | 'schedule' | 'explore' | 'team_details';

export interface Team {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
  principal?: string;
  base?: string;
  powerUnit?: string;
}

export interface Message {
  id: string;
  user: string;
  handle: string;
  time: string;
  text: string;
  avatar?: string;
  isMe?: boolean;
  isMod?: boolean;
  initials?: string;
}

export interface Driver {
  pos: string;
  name: string;
  country: string;
  birthplace: string;
  team: string;
  points: number;
  wins: number;
  avatar: string;
  number: string;
  color: string;
}

export interface EventCard {
  id: string;
  lap: number;
  title: string;
  description: string;
  type: 'pit' | 'warning' | 'overtake' | 'radio';
  image?: string;
  stat?: string;
  impact?: string;
  posGained?: string;
  insight?: string;
}
