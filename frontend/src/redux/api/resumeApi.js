import { apiSlice } from './apiSlice';

export const resumeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadResume: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/resume/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Resume'],
    }),
    getResumes: builder.query({
      query: () => "/resume/",
      providesTags: ["Resume"],
    }),
    deleteResume: builder.mutation({
      query: (id) => ({
        url: `/resume/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Resume"],
    }),
    activateResume: builder.mutation({
      query: (id) => ({
        url: `/resume/${id}/activate`,
        method: "PUT",
      }),
      invalidatesTags: ["Resume"],
    }),
  }),
});

export const { 
  useUploadResumeMutation, 
  useGetResumesQuery,
  useDeleteResumeMutation,
  useActivateResumeMutation
} = resumeApi;
