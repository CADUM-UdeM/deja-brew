import { PLACES } from './places';
import { USER_SUMMARIES } from './users';

export type SessionFeedItem = {
  _id: string;
  title: string;
  course: string;
  vibe: 'Deep focus' | 'Chill & chat' | 'Revision' | 'Project work';
  timeSlot: string;
  placeId: string;
  locationLabel: string;
  maxPeople: number;
  participantsCount: number;
  acceptedCount: number;
  status: 'open' | 'full' | 'cancelled' | 'ended';
  createdBy: {
    _id: string;
    username: string;
    displayName: string;
  };
  isJoinedByMe: boolean;
  joinStatusByMe: 'none' | 'pending' | 'accepted';
};

export type SessionParticipant = {
  userId: string;
  displayName: string;
  username: string;
  status: 'pending' | 'accepted' | 'declined' | 'left';
};

export type SessionDetail = SessionFeedItem & {
  notes: string;
  participants: SessionParticipant[];
};

const placeLabel = (placeId: string) => {
  const place = PLACES.find((p) => p.id === placeId);
  if (!place) return 'Unknown cafe';
  return `${place.name} · ${place.district}`;
};

const getUser = (username: string) =>
  USER_SUMMARIES.find((user) => user.username === username) ?? USER_SUMMARIES[0];

export const SESSIONS: SessionDetail[] = [
  {
    _id: 's_001',
    title: 'Exam cram',
    course: 'IFT2015',
    vibe: 'Deep focus',
    timeSlot: 'Tonight',
    placeId: 'accio',
    locationLabel: placeLabel('accio'),
    maxPeople: 4,
    participantsCount: 2,
    acceptedCount: 2,
    status: 'open',
    createdBy: getUser('sara7'),
    isJoinedByMe: false,
    joinStatusByMe: 'none',
    notes: 'Bring chargers and notes for chapters 3-5.',
    participants: [
      {
        userId: getUser('sara7')._id,
        displayName: getUser('sara7').displayName,
        username: getUser('sara7').username,
        status: 'accepted',
      },
      {
        userId: getUser('nora.studies')._id,
        displayName: getUser('nora.studies').displayName,
        username: getUser('nora.studies').username,
        status: 'accepted',
      },
    ],
  },
  {
    _id: 's_002',
    title: 'Project sprint',
    course: 'IFT3355',
    vibe: 'Project work',
    timeSlot: 'Weekend',
    placeId: 'savsav',
    locationLabel: placeLabel('savsav'),
    maxPeople: 3,
    participantsCount: 3,
    acceptedCount: 3,
    status: 'full',
    createdBy: getUser('studylover'),
    isJoinedByMe: true,
    joinStatusByMe: 'accepted',
    notes: 'Working on the UI polish, bring your laptop.',
    participants: [
      {
        userId: getUser('studylover')._id,
        displayName: getUser('studylover').displayName,
        username: getUser('studylover').username,
        status: 'accepted',
      },
      {
        userId: getUser('sara7')._id,
        displayName: getUser('sara7').displayName,
        username: getUser('sara7').username,
        status: 'accepted',
      },
      {
        userId: getUser('nora.studies')._id,
        displayName: getUser('nora.studies').displayName,
        username: getUser('nora.studies').username,
        status: 'accepted',
      },
    ],
  },
  {
    _id: 's_003',
    title: 'Chill review',
    course: 'Linear Algebra',
    vibe: 'Chill & chat',
    timeSlot: 'This afternoon',
    placeId: 'constance',
    locationLabel: placeLabel('constance'),
    maxPeople: 5,
    participantsCount: 1,
    acceptedCount: 1,
    status: 'open',
    createdBy: getUser('nora.studies'),
    isJoinedByMe: false,
    joinStatusByMe: 'pending',
    notes: 'We will review assignments 6-7 together.',
    participants: [
      {
        userId: getUser('nora.studies')._id,
        displayName: getUser('nora.studies').displayName,
        username: getUser('nora.studies').username,
        status: 'accepted',
      },
      {
        userId: getUser('studylover')._id,
        displayName: getUser('studylover').displayName,
        username: getUser('studylover').username,
        status: 'pending',
      },
    ],
  },
];

export const SESSION_FEED: SessionFeedItem[] = SESSIONS.map((session) => ({
  _id: session._id,
  title: session.title,
  course: session.course,
  vibe: session.vibe,
  timeSlot: session.timeSlot,
  placeId: session.placeId,
  locationLabel: session.locationLabel,
  maxPeople: session.maxPeople,
  participantsCount: session.participantsCount,
  acceptedCount: session.acceptedCount,
  status: session.status,
  createdBy: session.createdBy,
  isJoinedByMe: session.isJoinedByMe,
  joinStatusByMe: session.joinStatusByMe,
}));

export const getSessionById = (id?: string) =>
  SESSIONS.find((session) => session._id === id);
