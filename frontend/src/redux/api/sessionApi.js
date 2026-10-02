import { apiSlice } from './apiSlice';

// Every session mutation returns the full session, so the cached session is
// replaced with the response instead of being refetched.
const cacheSession = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(sessionApi.util.upsertQueryData('getSession', data.id, data));
  } catch {
    // Errors are handled by the component that triggered the mutation
  }
};

export const sessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startSession: builder.mutation({
      query: (interviewId) => ({
        url: `/interviews/${interviewId}/sessions`,
        method: 'POST',
      }),
      onQueryStarted: cacheSession,
    }),
    getSession: builder.query({
      query: (sessionId) => `/sessions/${sessionId}`,
      providesTags: (result, error, sessionId) => [
        { type: 'Session', id: sessionId },
      ],
    }),
    submitAnswer: builder.mutation({
      query: ({ sessionId, questionId, ...body }) => ({
        url: `/sessions/${sessionId}/questions/${questionId}/answer`,
        method: 'POST',
        body,
      }),
      onQueryStarted: cacheSession,
    }),
    abandonSession: builder.mutation({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}/abandon`,
        method: 'POST',
      }),
      onQueryStarted: cacheSession,
    }),
    getSessionReport: builder.query({
      query: (sessionId) => `/sessions/${sessionId}/report`,
    }),
  }),
});

export const {
  useStartSessionMutation,
  useGetSessionQuery,
  useSubmitAnswerMutation,
  useAbandonSessionMutation,
  useGetSessionReportQuery,
} = sessionApi;
