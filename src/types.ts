export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
}

export interface Character {
  id: string;
  ownerId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  hp: number;
  maxHp: number;
  equipment: string[];
  spells: string[];
  notes: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  gmId: string;
  name: string;
  description: string;
  worldNotes: string;
  createdAt: string;
}
