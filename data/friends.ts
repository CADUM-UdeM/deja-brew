import { USER_SUMMARIES } from './users';

export type FriendRequest = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
};

export const FRIENDS = [
  USER_SUMMARIES.find((user) => user.username === 'sara7'),
  USER_SUMMARIES.find((user) => user.username === 'nora.studies'),
].filter(Boolean);

export const FRIEND_REQUESTS: FriendRequest[] = [
  {
    _id: 'fr_001',
    fromUserId: USER_SUMMARIES.find((user) => user.username === 'sara7')?._id || 'u_sara',
    toUserId: USER_SUMMARIES.find((user) => user.username === 'studylover')?._id || 'u_lea',
    status: 'pending',
    createdAt: '2025-01-10T12:00:00Z',
  },
];
