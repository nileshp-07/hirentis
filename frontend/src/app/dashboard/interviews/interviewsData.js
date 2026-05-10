export const interviewRecords = [
  {
    id: 'int-001',
    title: 'Senior Frontend Engineer',
    type: 'Technical Round',
    status: 'in_progress',
    date: 'Oct 24, 2026',
    duration: '45 mins',
    totalQuestions: 12,
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    id: 'int-002',
    title: 'Node.js Backend Developer',
    type: 'System Design',
    status: 'scheduled',
    date: 'Oct 26, 2026',
    duration: '60 mins',
    totalQuestions: 8,
    techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Kafka'],
  },
  {
    id: 'int-003',
    title: 'Full Stack Developer',
    type: 'Behavioral',
    status: 'pending',
    date: 'Oct 28, 2026',
    duration: '30 mins',
    totalQuestions: 15,
    techStack: ['Soft Skills', 'Leadership', 'Communication'],
  },
  {
    id: 'int-004',
    title: 'React Developer Role',
    type: 'Technical Round',
    status: 'completed',
    completedAt: 'Oct 20, 2026',
    score: 8.5,
    techStack: ['Redux', 'Testing Library', 'Vite'],
  },
  {
    id: 'int-005',
    title: 'Python Engineer',
    type: 'Algorithm Round',
    status: 'completed',
    completedAt: 'Oct 18, 2026',
    score: 7.2,
    techStack: ['Python', 'FastAPI', 'Pandas'],
  },
];

export const resumeOptions = [
  {
    id: 'res-001',
    name: 'Software Engineer - Frontend.pdf',
    active: true,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    experience: '3 years of experience in building modern web applications',
    areas: [
      'Frontend Architecture',
      'UI Components',
      'Performance Optimization',
    ],
    projects: [
      {
        title: 'Dashboard UI Kit',
        description:
          'Standardized component library used across 12 internal projects.',
      },
      {
        title: 'Real-time Analytics',
        description:
          'Connected WebSockets to D3 visualizations for live user tracking.',
      },
    ],
  },
  {
    id: 'res-002',
    name: 'Fullstack Developer Resume.docx',
    active: false,
    skills: ['Node.js', 'PostgreSQL', 'React', 'Docker'],
    experience: '5 years building end-to-end distributed systems',
    areas: ['Backend API', 'DevOps', 'Database Design'],
    projects: [
      {
        title: 'API Gateway',
        description:
          'Implemented a central proxy for microservices with rate limiting.',
      },
      {
        title: 'Payment Orchestrator',
        description:
          'Unified multiple payment gateways into a single secure API.',
      },
    ],
  },
];

export const getInterviewById = (id) =>
  interviewRecords.find((i) => i.id === id);
export const getResumeById = (id) => resumeOptions.find((r) => r.id === id);
