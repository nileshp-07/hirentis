import { apiSlice } from './apiSlice';

export const interviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInterviews: builder.query({
      query: () => "/interviews/",
      providesTags: ["Interview"],
    }),
    getInterview: builder.query({
      query: (id) => `/interviews/${id}`,
      providesTags: (result, error, id) => [{ type: 'Interview', id }],
    }),
    createInterview: builder.mutation({
      query: (body) => ({
        url: "/interviews/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Interview"],
    }),
    updateInterview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/interviews/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["Interview", { type: 'Interview', id }],
    }),
    deleteInterview: builder.mutation({
      query: (id) => ({
        url: `/interviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Interview"],
    }),
  }),
});

export const { 
  useGetInterviewsQuery, 
  useGetInterviewQuery,
  useCreateInterviewMutation,
  useUpdateInterviewMutation,
  useDeleteInterviewMutation
} = interviewApi;
