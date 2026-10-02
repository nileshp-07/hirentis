export const reportData = {
  interview: {
    title: 'Senior Backend Interview',
    role: 'Backend Engineer',
    date: 'Sep 28, 2026',
    durationSeconds: 464,
    status: 'COMPLETED',
  },
  scores: {
    overall: 7.8,
    technical: 7.5,
    communication: 8.2,
    problemSolving: 7.0,
    confidence: 7.4,
  },
  skillRadar: [
    { skill: 'Technical', score: 7.5 },
    { skill: 'Communication', score: 8.2 },
    { skill: 'Problem solving', score: 7.0 },
    { skill: 'Confidence', score: 7.4 },
  ],
  topicScores: [
    { topic: 'Caching with Redis', score: 8.0 },
    { topic: 'REST API design', score: 7.0 },
    { topic: 'PostgreSQL indexing', score: 6.0 },
    { topic: 'Scaling APIs', score: 9.0 },
  ],
  questions: [
    {
      id: 'q1',
      number: 1,
      isFollowup: false,
      topic: 'Caching with Redis',
      difficulty: 'MEDIUM',
      text: 'Explain how caching works in web applications.',
      answer:
        'Caching stores frequently accessed data closer to the user to reduce latency. In web apps we have browser caching with Cache-Control and ETag, CDN caching for static assets, and server-side caching with Redis for database queries.',
      score: 7.0,
      strengths: [
        'Clear explanation of browser caching',
        'Good understanding of CDN layers',
      ],
      weaknesses: ['No mention of cache invalidation strategies'],
      improvements: [
        'Discuss cache strategies like LRU and TTL',
        'Mention edge caching and stale-while-revalidate',
      ],
      feedback:
        'You covered the layers of caching clearly. Next time, explain how you keep the cache consistent when data changes.',
    },
    {
      id: 'q2',
      number: 1,
      isFollowup: true,
      topic: 'Caching with Redis',
      difficulty: 'MEDIUM',
      text: 'How would you handle cache invalidation in a real-time application?',
      answer:
        'I would use event-driven invalidation where changes publish events to invalidate specific cache keys, combined with short TTLs.',
      score: 8.0,
      strengths: ['Accurate explanation of event-driven invalidation'],
      weaknesses: ['Did not cover race conditions between writes'],
      improvements: ['Mention cache stampede and how to prevent it'],
      feedback:
        'A solid answer that named a concrete strategy. Adding failure cases would make it stronger.',
    },
    {
      id: 'q3',
      number: 2,
      isFollowup: false,
      topic: 'REST API design',
      difficulty: 'EASY',
      text: 'What makes an API RESTful?',
      answer:
        'It is stateless and uses HTTP methods like GET and POST on resources, with proper status codes.',
      score: 7.0,
      strengths: ['Correct on statelessness and HTTP verbs'],
      weaknesses: ['No mention of resource representation or versioning'],
      improvements: [
        'Explain how you version an API and shape error responses',
      ],
      feedback:
        'You covered the core principles. Mention versioning and error shapes to show production experience.',
    },
    {
      id: 'q4',
      number: 3,
      isFollowup: false,
      topic: 'PostgreSQL indexing',
      difficulty: 'HARD',
      text: 'How would you decide which columns to index in PostgreSQL?',
      answer: 'I add indexes on the columns used in WHERE clauses.',
      score: 6.0,
      strengths: ['Identified WHERE clauses as the starting point'],
      weaknesses: [
        'No mention of composite indexes',
        'Did not discuss the write cost of indexes',
      ],
      improvements: [
        'Use EXPLAIN ANALYZE to justify an index',
        'Explain when a composite index beats two single-column indexes',
      ],
      feedback:
        'The basics were right but thin. Show how you measure before adding an index, and what it costs on writes.',
    },
    {
      id: 'q5',
      number: 4,
      isFollowup: false,
      topic: 'Scaling APIs',
      difficulty: 'HARD',
      text: 'Describe your approach to error handling in production.',
      answer:
        'A multi-layered approach: structured error responses from the API, centralised logging with request context, alerts on error-rate spikes, and graceful degradation with fallback responses rather than failures.',
      score: 9.0,
      strengths: [
        'Comprehensive strategy across layers',
        'Mentioned structured logging and alerting',
      ],
      weaknesses: ['Could have covered retry patterns in more depth'],
      improvements: ['Add circuit breakers and backoff strategies'],
      feedback:
        'An excellent, well-structured answer grounded in real practice.',
    },
  ],
  strengths: [
    'Clear communication style',
    'Strong caching and API fundamentals',
    'Structured, logical answers',
  ],
  weaknesses: [
    'Database tuning depth',
    'Edge case consideration',
    'Trade-off reasoning',
  ],
  suggestions: [
    'Practice explaining trade-offs whenever you name a technique',
    'Use EXPLAIN ANALYZE to back up database decisions',
    'Cover failure cases: retries, stampedes and race conditions',
  ],
  aiSummary:
    'You show strong backend fundamentals and explain ideas clearly, particularly around caching and error handling. To reach the next level, go deeper on database tuning and get into the habit of naming the trade-offs behind each decision you describe.',
  transcript: [
    {
      role: 'ai',
      text: 'Welcome. Can you explain how caching works in web applications?',
      time: '0:00',
    },
    {
      role: 'user',
      text: 'Caching stores frequently accessed data closer to the user to reduce latency. In web apps we have browser caching with Cache-Control and ETag, CDN caching for static assets, and server-side caching with Redis for database queries.',
      time: '0:45',
    },
    {
      role: 'ai',
      text: 'How would you handle cache invalidation in a real-time application?',
      time: '1:02',
    },
    {
      role: 'user',
      text: 'I would use event-driven invalidation where changes publish events to invalidate specific cache keys, combined with short TTLs.',
      time: '1:55',
    },
    {
      role: 'ai',
      text: "Thanks. Let's move on to REST. What makes an API RESTful?",
      time: '2:10',
    },
    {
      role: 'user',
      text: 'It is stateless and uses HTTP methods like GET and POST on resources, with proper status codes.',
      time: '3:15',
    },
    {
      role: 'ai',
      text: 'How would you decide which columns to index in PostgreSQL?',
      time: '3:30',
    },
    {
      role: 'user',
      text: 'I add indexes on the columns used in WHERE clauses.',
      time: '4:25',
    },
    {
      role: 'ai',
      text: 'Last question. Describe your approach to error handling in production.',
      time: '4:40',
    },
    {
      role: 'user',
      text: 'A multi-layered approach: structured error responses from the API, centralised logging with request context, alerts on error-rate spikes, and graceful degradation with fallback responses rather than failures.',
      time: '6:20',
    },
    {
      role: 'ai',
      text: 'Thank you. That concludes the interview; your report is being prepared.',
      time: '7:44',
    },
  ],
};
