import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const getAuthToken = async () => {
  try {
    if (typeof window !== 'undefined' && window.Clerk?.session) {
      return await window.Clerk.session.getToken();
    }
  } catch (error) {
    console.error('Error fetching Clerk token:', error);
  }
  return null;
};

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: async (headers) => {
    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Resume', 'User', 'Interview', 'Session', 'Profile'],
  endpoints: () => ({}),
});
