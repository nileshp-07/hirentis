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
  }),
});

export const { useUploadResumeMutation, useGetLatestResumeQuery } = resumeApi;
