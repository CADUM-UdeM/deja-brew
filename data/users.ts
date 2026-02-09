export type UserPreferences = {
  noise: 'quiet' | 'medium' | 'lively';
  wifi: boolean;
  outlets: boolean;
  favoriteDistricts: string[];
  tags: string[];
};

export type UserStats = {
  sessionsCreated: number;
  sessionsJoined: number;
  reviewsCount: number;
  likesGiven: number;
};

export type UserSummary = {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type UserProfile = UserSummary & {
  email: string;
  bio: string;
  school: string;
  preferences: UserPreferences;
  stats: UserStats;
  status: {
    isBanned: boolean;
    bannedReason: string | null;
  };
};

export const CURRENT_USER_ID = 'u_lea';

export const USERS: UserProfile[] = [
  {
    _id: 'u_lea',
    email: 'lea@email.com',
    username: 'studylover',
    displayName: 'Deja Brew guest',
    avatarUrl: null,
    bio: 'Love calm cafes and long sessions',
    school: 'UdeM',
    preferences: {
      noise: 'quiet',
      wifi: true,
      outlets: true,
      favoriteDistricts: ['Downtown / QDS', 'Saint-Henri'],
      tags: ['Aesthetic', 'Coworking'],
    },
    stats: {
      sessionsCreated: 0,
      sessionsJoined: 0,
      reviewsCount: 0,
      likesGiven: 0,
    },
    status: {
      isBanned: false,
      bannedReason: null,
    },
  },
  {
    _id: 'u_sara',
    email: 'sara@email.com',
    username: 'sara7',
    displayName: 'Sara',
    avatarUrl: null,
    bio: 'Project crunches, coffee, and cozy corners.',
    school: 'Concordia',
    preferences: {
      noise: 'medium',
      wifi: true,
      outlets: true,
      favoriteDistricts: ['Downtown / Concordia'],
      tags: ['Group work', 'Late night'],
    },
    stats: {
      sessionsCreated: 4,
      sessionsJoined: 8,
      reviewsCount: 3,
      likesGiven: 12,
    },
    status: {
      isBanned: false,
      bannedReason: null,
    },
  },
  {
    _id: 'u_nora',
    email: 'nora@email.com',
    username: 'nora.studies',
    displayName: 'Nora',
    avatarUrl: null,
    bio: 'Quiet spots and matcha lattes.',
    school: 'McGill',
    preferences: {
      noise: 'quiet',
      wifi: true,
      outlets: false,
      favoriteDistricts: ['Old Montreal'],
      tags: ['Calm weekdays', 'Solo study'],
    },
    stats: {
      sessionsCreated: 2,
      sessionsJoined: 3,
      reviewsCount: 5,
      likesGiven: 7,
    },
    status: {
      isBanned: false,
      bannedReason: null,
    },
  },
];

export const USER_SUMMARIES: UserSummary[] = USERS.map((user) => ({
  _id: user._id,
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
}));

export const getUserById = (id?: string) =>
  USERS.find((user) => user._id === id);

export const searchUsers = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return USER_SUMMARIES;

  return USER_SUMMARIES.filter((user) =>
    `${user.username} ${user.displayName}`.toLowerCase().includes(q)
  );
};
