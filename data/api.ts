import Constants from 'expo-constants';
import type { CafePlace } from '@/data/places';
import type { Promo } from '@/data/promos';
import type { SessionFeedItem, SessionDetail, SessionParticipant } from '@/data/sessions';
import type { UserSummary, UserProfile } from '@/data/users';
import { getAuthToken, getAuthUser } from '@/data/auth';

const fallbackUrl = 'https://backend-deja-brew.onrender.com';
const localDevPort = '3000';

const extra =
  Constants.expoConfig?.extra ??
  (Constants.manifest as { extra?: Record<string, string> } | null)?.extra ??
  {};

const getExpoHost = () => {
  const constants = Constants as typeof Constants & {
    expoGoConfig?: { debuggerHost?: string } | null;
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } } | null;
    manifest?: { debuggerHost?: string } | null;
  };

  const hostUri =
    constants.expoConfig?.hostUri ??
    constants.expoGoConfig?.debuggerHost ??
    constants.manifest2?.extra?.expoClient?.hostUri ??
    constants.manifest?.debuggerHost ??
    '';

  if (!hostUri) return null;
  const host = hostUri.split(':')[0]?.trim();
  return host || null;
};

const resolveApiBaseUrl = () => {
  const configuredUrl = (extra.EXPO_API_BASE_URL as string | undefined)?.trim();
  if (configuredUrl) return configuredUrl;

  if (__DEV__) {
    const expoHost = getExpoHost();
    if (expoHost) return `http://${expoHost}:${localDevPort}`;
    return `http://localhost:${localDevPort}`;
  }

  return fallbackUrl;
};

export const API_BASE_URL = resolveApiBaseUrl();

export const buildApiUrl = (path: string) => {
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleaned}`;
};

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: Record<string, any>;
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  data?: any;
  path?: string;
  method?: string;

  constructor(message: string, status: number, data?: any, path?: string, method?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.path = path;
    this.method = method;
  }
}

export const apiRequest = async <T,>(
  path: string,
  options: ApiOptions = {}
): Promise<T> => {
  const method = options.method ?? 'GET';
  const timeoutMs = options.timeoutMs ?? 12000;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (options.auth) {
    const token = await getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(buildApiUrl(path), {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.message || `API ${res.status}`;
    throw new ApiError(message, res.status, data, path, method);
  }
  return data as T;
};

const apiGet = async <T,>(path: string, auth = false): Promise<T> =>
  apiRequest<T>(path, { auth });

export const normalizePlace = (place: any): CafePlace => {
  const coords =
    place?.coords?.lat != null && place?.coords?.lng != null
      ? { latitude: place.coords.lat, longitude: place.coords.lng }
      : place?.coords?.latitude != null && place?.coords?.longitude != null
      ? { latitude: place.coords.latitude, longitude: place.coords.longitude }
      : undefined;

  return {
    id: String(place.placeId ?? place._id ?? place.id ?? place.name ?? ''),
    name: place.name ?? 'Cafe',
    address: place.address ?? '',
    district: place.district ?? 'Montréal',
    vibe: place.vibe ?? 'Warm, study-friendly',
    studyAtmosphere: place.studyAtmosphere ?? [],
    wifi: Boolean(place.wifi),
    outlets: Boolean(place.outlets),
    food: place.food ?? [],
    hours: place.hours ?? 'Not listed',
    tags: place.tags ?? [],
    coords,
    priceLevel: place.priceLevel ?? '$$',
    rating: place.ratingSummary?.avg ?? place.rating ?? 4.4,
    imageUrl: place.imageUrl ?? place.photoUrl ?? place.image ?? undefined,
    source: 'curated',
  };
};

export const normalizePromo = (promo: any, index: number): Promo => ({
  id: Number(promo.id ?? promo._id ?? promo.promoId ?? index + 1),
  title: promo.title ?? 'Promo',
  description: promo.description ?? '',
  cafe_id: String(promo.placeId ?? promo.cafe_id ?? ''),
  tag: promo.tag ?? 'Promo',
  promoStart: promo.promoStart ?? new Date().toISOString(),
  promoEnd: promo.promoEnd ?? new Date().toISOString(),
});

export const normalizeSession = (session: any): SessionFeedItem => {
  const rawCreator =
    session.createdBy ??
    session.creator ??
    session.user ??
    session.owner ??
    session.createdById ??
    session.creatorId ??
    session.userId ??
    session.ownerId;

  let createdBy = {
    _id: 'unknown',
    username: 'guest',
    displayName: 'Guest',
  };

  if (rawCreator && typeof rawCreator === 'object') {
    createdBy = {
      _id: String(rawCreator._id ?? rawCreator.id ?? ''),
      username: rawCreator.username ?? rawCreator.handle ?? 'user',
      displayName: rawCreator.displayName ?? rawCreator.name ?? 'User',
    };
  } else if (rawCreator != null) {
    createdBy = {
      _id: String(rawCreator),
      username: 'user',
      displayName: 'User',
    };
  }

  return {
    _id: String(session._id ?? session.id ?? ''),
    title: session.title ?? 'Study session',
    course: session.course ?? 'Study',
    vibe: session.vibe ?? 'Deep focus',
    timeSlot: session.timeSlot ?? 'Today',
    placeId: session.placeId ?? '',
    locationLabel:
      session.locationLabel ??
      session.location ??
      session.placeName ??
      session.place?.name ??
      session.placeId ??
      'Cafe',
    maxPeople: session.maxPeople ?? 4,
    participantsCount: session.participantsCount ?? session.acceptedCount ?? 1,
    acceptedCount: session.acceptedCount ?? 1,
    status: session.status ?? 'open',
    createdBy,
    isJoinedByMe: Boolean(
      session.isJoinedByMe ?? session.joinedByMe ?? session.isMember ?? false
    ),
    joinStatusByMe:
      session.joinStatusByMe ??
      session.joinStatus ??
      session.myStatus ??
      session.statusByMe ??
      'none',
  };
};

const normalizeParticipant = (participant: any): SessionParticipant => ({
  userId: String(
    participant?.userId ??
      participant?.user?._id ??
      participant?._id ??
      participant?.id ??
      ''
  ),
  displayName:
    participant?.displayName ??
    participant?.user?.displayName ??
    participant?.user?.name ??
    'Guest',
  username: participant?.username ?? participant?.user?.username ?? 'user',
  status: (participant?.status ?? participant?.state ?? 'pending') as SessionParticipant['status'],
});

export const normalizeSessionDetail = (session: any): SessionDetail => ({
  ...normalizeSession(session),
  notes: session?.notes ?? session?.description ?? '',
  participants: (
    session?.participants ??
    session?.attendees ??
    session?.members ??
    session?.requests ??
    session?.joinRequests ??
    session?.pendingParticipants ??
    session?.pendingRequests ??
    []
  )?.map(normalizeParticipant),
});

export const normalizeUserSummary = (user: any): UserSummary => ({
  _id: user?._id ?? user?.id ?? '',
  username: user?.username ?? 'user',
  displayName: user?.displayName ?? user?.name ?? 'User',
  avatarUrl: user?.avatarUrl ?? null,
});

const pickFirst = <T,>(...values: Array<T | null | undefined>) =>
  values.find((value) => value != null);

const extractCreator = (session: any) =>
  pickFirst(
    session?.createdBy,
    session?.creator,
    session?.user,
    session?.owner,
    session?.createdById,
    session?.creatorId,
    session?.userId,
    session?.ownerId
  );

const matchesUser = (session: any, user: UserProfile | null) => {
  if (!user) return false;
  const userId = String(user._id ?? '');
  const username = user.username ?? '';
  const creator = extractCreator(session);

  if (typeof creator === 'string') {
    return creator === userId || creator === username;
  }

  if (creator && typeof creator === 'object') {
    const creatorId = String(
      creator._id ??
        creator.id ??
        creator.userId ??
        creator.ownerId ??
        creator.creatorId ??
        ''
    );
    const creatorUsername = creator.username ?? creator.handle ?? '';
    if (creatorId && creatorId === userId) return true;
    if (creatorUsername && creatorUsername === username) return true;
  }

  const creatorId = pickFirst(
    session?.createdById,
    session?.creatorId,
    session?.userId,
    session?.ownerId
  );
  if (creatorId && String(creatorId) === userId) return true;

  return false;
};

const normalizeUserProfile = (user: any): UserProfile => ({
  _id: user?._id ?? user?.id ?? '',
  username: user?.username ?? 'user',
  displayName: user?.displayName ?? user?.name ?? 'User',
  avatarUrl: user?.avatarUrl ?? null,
  email: user?.email ?? '',
  bio: user?.bio ?? '',
  school: user?.school ?? '',
  preferences: {
    noise: user?.preferences?.noise ?? 'quiet',
    wifi: Boolean(user?.preferences?.wifi),
    outlets: Boolean(user?.preferences?.outlets),
    favoriteDistricts: user?.preferences?.favoriteDistricts ?? [],
    tags: user?.preferences?.tags ?? [],
  },
  stats: {
    sessionsCreated: user?.stats?.sessionsCreated ?? 0,
    sessionsJoined: user?.stats?.sessionsJoined ?? 0,
    reviewsCount: user?.stats?.reviewsCount ?? 0,
    likesGiven: user?.stats?.likesGiven ?? 0,
  },
  status: {
    isBanned: Boolean(user?.status?.isBanned),
    bannedReason: user?.status?.bannedReason ?? null,
  },
});

const extractRequestUser = (request: any) =>
  pickFirst(
    request?.fromUser,
    request?.from,
    request?.requester,
    request?.sender,
    request?.user,
    request?.byUser,
    request?.owner,
    request?.requestedBy
  );

const extractRequestUserId = (request: any) =>
  pickFirst(
    request?.fromUserId,
    request?.fromId,
    request?.requesterId,
    request?.senderId,
    request?.userId,
    request?.byUserId,
    request?.ownerId,
    request?.requestedById,
    request?.fromUser?._id,
    request?.fromUser?.id,
    request?.from?._id,
    request?.from?.id,
    request?.requester?._id,
    request?.requester?.id,
    request?.sender?._id,
    request?.sender?.id,
    request?.user?._id,
    request?.user?.id
  );

const normalizeFriendRequest = async (request: any) => {
  const id = String(pickFirst(request?._id, request?.id, request?.requestId) ?? '');
  const rawStatus = pickFirst(request?.status, request?.state, 'pending');
  const status = String(rawStatus ?? 'pending').toLowerCase();
  const fromUser = extractRequestUser(request);
  const fromUserId = extractRequestUserId(request);

  if (fromUser && (fromUser.displayName || fromUser.username || fromUser.name)) {
    return {
      ...request,
      _id: id,
      status,
      fromUserId: request?.fromUserId ?? fromUserId,
      fromUser,
    };
  }

  if (fromUserId) {
    try {
      const user = await fetchUserById(String(fromUserId));
      return {
        ...request,
        _id: id,
        status,
        fromUserId: String(fromUserId),
        fromUser: user,
      };
    } catch {
      // ignore enrichment failure
    }
  }

  return {
    ...request,
    _id: id,
    status,
    fromUserId: request?.fromUserId ?? fromUserId,
  };
};

export const fetchPlaces = async () => {
  const res = await apiGet<{ data: any[] }>('/api/places');
  return (res.data ?? []).map(normalizePlace);
};

export const fetchPlaceDetail = async (placeId: string) => {
  const res = await apiGet<{ data: { place: any } }>(`/api/places/${placeId}`);
  return normalizePlace(res.data?.place ?? res.data);
};

export const fetchPromos = async (placeId?: string) => {
  const query = placeId ? `?placeId=${encodeURIComponent(placeId)}` : '';
  const res = await apiGet<{ data: any[] }>(`/api/promos${query}`);
  return (res.data ?? []).map(normalizePromo);
};

export const fetchSessions = async () => {
  const res = await apiGet<any>('/api/sessions?public=true');
  const sessions = res?.data?.sessions ?? res?.data ?? res?.sessions ?? [];
  return (sessions ?? []).map(normalizeSession);
};

export const fetchMySessions = async () => {
  const me = await getAuthUser<UserProfile>();
  const res = await apiGet<any>('/api/sessions', true);
  const sessions = res?.data?.sessions ?? res?.data ?? res?.sessions ?? [];
  const mine = Array.isArray(sessions)
    ? sessions.filter((session) => matchesUser(session, me))
    : [];
  return mine.map(normalizeSession);
};

export const createSession = async (payload: Record<string, any>) => {
  const res = await apiRequest<any>('/api/sessions', {
    method: 'POST',
    auth: true,
    body: payload,
  });
  const session = res?.data?.session ?? res?.data ?? res?.session ?? res;
  return normalizeSession(session);
};

export const fetchSessionById = async (sessionId: string) => {
  const res = await apiRequest<any>(`/api/sessions/${sessionId}`, {
    auth: true,
  });
  const session = res?.data?.session ?? res?.data ?? res?.session ?? res;
  return normalizeSessionDetail(session);
};

export const joinSession = async (sessionId: string) =>
  apiRequest<any>(`/api/sessions/${sessionId}/join`, {
    method: 'POST',
    auth: true,
  });

export const leaveSession = async (sessionId: string) =>
  apiRequest<any>(`/api/sessions/${sessionId}/leave`, {
    method: 'POST',
    auth: true,
  });

export const acceptSessionParticipant = async (sessionId: string, userId: string) =>
  apiRequest<any>(`/api/sessions/${sessionId}/participants/${userId}/accept`, {
    method: 'POST',
    auth: true,
  });

export const declineSessionParticipant = async (sessionId: string, userId: string) =>
  apiRequest<any>(`/api/sessions/${sessionId}/participants/${userId}/decline`, {
    method: 'POST',
    auth: true,
  });

export const inviteSessionFriend = async (sessionId: string, friendId: string) =>
  apiRequest<any>(`/api/sessions/${sessionId}/invite/${friendId}`, {
    method: 'POST',
    auth: true,
  });

export const fetchNotifications = async () => {
  const res = await apiGet<any>('/api/notifications', true);
  return res?.data?.notifications ?? res?.data ?? res?.notifications ?? [];
};

export const markNotificationRead = async (notificationId: string) =>
  apiRequest(`/api/notifications/${notificationId}/read`, {
    method: 'POST',
    auth: true,
  });

export const markAllNotificationsRead = async () =>
  apiRequest('/api/notifications/read-all', {
    method: 'POST',
    auth: true,
  });

export const login = async (email: string, password: string) =>
  apiRequest<{ data: { token: string; user: UserProfile } }>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

export const register = async (payload: {
  email: string;
  password: string;
  username: string;
  displayName: string;
}) =>
  apiRequest<{ data: { token: string; user: UserProfile } }>(
    '/api/auth/register',
    {
      method: 'POST',
      body: payload,
    }
  );

export const fetchMe = async () => {
  const res = await apiRequest<{ data: { user: any } }>('/api/auth/me', {
    auth: true,
  });
  return { data: { user: normalizeUserProfile(res.data?.user ?? res.data) } };
};

export const updateMe = async (payload: Partial<UserProfile>) => {
  const res = await apiRequest<{ data: { user: any } }>('/api/auth/me', {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
  return { data: { user: normalizeUserProfile(res.data?.user ?? res.data) } };
};

export const searchUsers = async (query: string) => {
  const q = query.trim();
  if (!q) return [] as UserSummary[];
  const res = await apiRequest<any>(`/api/users/search?q=${encodeURIComponent(q)}`, {
    auth: true,
  });
  const users = res?.data?.users ?? res?.data ?? res?.users ?? [];
  return (users ?? []).map(normalizeUserSummary);
};

export const fetchUserById = async (userId: string) => {
  const res = await apiRequest<any>(`/api/users/${userId}`, { auth: true });
  const user = res?.data?.user ?? res?.data ?? res?.user ?? res;
  return normalizeUserProfile(user);
};

export const sendFriendRequest = async (toUserId: string) =>
  apiRequest(`/api/friends/request/${toUserId}`, {
    method: 'POST',
    auth: true,
  });

export const fetchFriends = async () => {
  const res = await apiGet<any>('/api/friends', true);
  const friends = res?.data?.friends ?? res?.data ?? res?.friends ?? [];
  return (friends ?? []).map(normalizeUserSummary);
};

export const fetchFriendRequests = async () => {
  const res = await apiGet<any>('/api/friends/requests', true);
  const requests = res?.data?.requests ?? res?.data ?? res?.requests ?? [];
  if (!Array.isArray(requests)) return [];
  return Promise.all(requests.map(normalizeFriendRequest));
};

export const acceptFriendRequest = async (requestId: string) =>
  apiRequest(`/api/friends/accept/${requestId}`, {
    method: 'POST',
    auth: true,
  });

export const declineFriendRequest = async (requestId: string) =>
  apiRequest(`/api/friends/decline/${requestId}`, {
    method: 'POST',
    auth: true,
  });
