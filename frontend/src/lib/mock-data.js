export const initialResumes = [
  {
    id: '1',
    name: 'resume_frontend_v3.pdf',
    uploadDate: 'May 22, 2026',
    active: true,
    parsedData: {
      skills: ['React', 'Node', 'MongoDB', 'Docker', 'TypeScript', 'GraphQL'],
      experience: '2 Years',
      experienceAreas: [
        'Frontend Development',
        'Backend APIs',
        'Cloud Deployment',
      ],
      projects: [
        {
          title: 'AI Chatbot',
          desc: 'LLM-based assistant using RAG architecture.',
        },
        {
          title: 'Ecommerce Platform',
          desc: 'Full stack MERN application with Stripe.',
        },
        {
          title: 'Portfolio Builder',
          desc: 'Drag-and-drop portfolio generator.',
        },
      ],
    },
  },
  {
    id: '2',
    name: 'resume_fullstack_v1.pdf',
    uploadDate: 'May 10, 2026',
    active: false,
    parsedData: null,
  },
  {
    id: '3',
    name: 'resume_backend_v2.pdf',
    uploadDate: 'Apr 28, 2026',
    active: false,
    parsedData: null,
  },
];
