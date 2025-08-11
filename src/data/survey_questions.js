// Strategy Survey Questions Data Structure
// 12 questions across 5 sections for organizational strategy assessment

export const SURVEY_SECTIONS = [
  {
    id: 'strategic_priorities',
    title: 'Strategic Priorities',
    description: 'Understanding your organization\'s key strategic focus areas'
  },
  {
    id: 'data_maturity',
    title: 'Data Maturity',
    description: 'Assessing your current data capabilities and infrastructure'
  },
  {
    id: 'analytics_goals',
    title: 'Analytics Goals',
    description: 'Defining your analytics objectives and success metrics'
  },
  {
    id: 'resource_allocation',
    title: 'Resource Allocation',
    description: 'Understanding your investment priorities and constraints'
  },
  {
    id: 'implementation_readiness',
    title: 'Implementation Readiness',
    description: 'Evaluating organizational readiness for data initiatives'
  }
];

export const SURVEY_QUESTIONS = [
  // Section 1: Strategic Priorities (3 questions)
  {
    id: 'Q1',
    section: 'strategic_priorities',
    question_text: 'What is your organization\'s top strategic priority for the next 2 years?',
    response_type: 'radio',
    options: [
      'Improve operational efficiency',
      'Enhance patient outcomes',
      'Reduce costs and waste',
      'Drive revenue growth',
      'Strengthen competitive position',
      'Other'
    ],
    required: true
  },
  {
    id: 'Q2',
    section: 'strategic_priorities',
    question_text: 'How important is data-driven decision making to your strategic goals?',
    response_type: 'slider',
    min: 1,
    max: 10,
    labels: { 1: 'Not Important', 10: 'Critical' },
    required: true
  },
  {
    id: 'Q3',
    section: 'strategic_priorities',
    question_text: 'Which business areas would benefit most from improved analytics? (Select all that apply)',
    response_type: 'checkbox',
    options: [
      'Clinical Operations',
      'Financial Management',
      'Quality & Safety',
      'Population Health',
      'Supply Chain',
      'Human Resources',
      'Marketing & Growth'
    ],
    required: true
  },

  // Section 2: Data Maturity (2 questions)
  {
    id: 'Q4',
    section: 'data_maturity',
    question_text: 'How would you rate your organization\'s current data analytics maturity?',
    response_type: 'radio',
    options: [
      'Basic - Limited data collection and reporting',
      'Developing - Some analytics capabilities in place',
      'Intermediate - Regular analytics and insights generation',
      'Advanced - Sophisticated analytics and predictive modeling',
      'Leading - AI/ML integration and real-time insights'
    ],
    required: true
  },
  {
    id: 'Q5',
    section: 'data_maturity',
    question_text: 'What percentage of your key decisions are currently supported by data analytics?',
    response_type: 'slider',
    min: 0,
    max: 100,
    step: 10,
    labels: { 0: '0%', 100: '100%' },
    required: true
  },

  // Section 3: Analytics Goals (3 questions)
  {
    id: 'Q6',
    section: 'analytics_goals',
    question_text: 'What is your primary analytics objective?',
    response_type: 'radio',
    options: [
      'Improve clinical outcomes',
      'Reduce operational costs',
      'Enhance patient experience',
      'Increase revenue',
      'Ensure regulatory compliance',
      'Support strategic planning'
    ],
    required: true
  },
  {
    id: 'Q7',
    section: 'analytics_goals',
    question_text: 'How do you currently measure analytics success?',
    response_type: 'checkbox',
    options: [
      'ROI and cost savings',
      'Clinical quality metrics',
      'Operational efficiency gains',
      'User adoption rates',
      'Decision-making speed',
      'Predictive accuracy',
      'We don\'t currently measure success'
    ],
    required: true
  },
  {
    id: 'Q8',
    section: 'analytics_goals',
    question_text: 'What is your target timeline for achieving significant analytics impact?',
    response_type: 'radio',
    options: [
      '3-6 months',
      '6-12 months',
      '1-2 years',
      '2-3 years',
      '3+ years'
    ],
    required: true
  },

  // Section 4: Resource Allocation (2 questions)
  {
    id: 'Q9',
    section: 'resource_allocation',
    question_text: 'What is your anticipated annual budget for data and analytics initiatives?',
    response_type: 'radio',
    options: [
      'Less than $100K',
      '$100K - $500K',
      '$500K - $1M',
      '$1M - $5M',
      '$5M - $10M',
      'More than $10M',
      'Not yet determined'
    ],
    required: true
  },
  {
    id: 'Q10',
    section: 'resource_allocation',
    question_text: 'How would you prioritize resource allocation across these areas?',
    response_type: 'ranking',
    options: [
      'Technology infrastructure',
      'Analytics talent and training',
      'Data governance and quality',
      'External consulting and services',
      'Software and platform licenses'
    ],
    required: true
  },

  // Section 5: Implementation Readiness (2 questions)
  {
    id: 'Q11',
    section: 'implementation_readiness',
    question_text: 'What is your biggest challenge in implementing data analytics initiatives?',
    response_type: 'radio',
    options: [
      'Lack of technical expertise',
      'Data quality and integration issues',
      'Limited budget and resources',
      'Organizational resistance to change',
      'Regulatory and compliance concerns',
      'Unclear ROI and business case'
    ],
    required: true
  },
  {
    id: 'Q12',
    section: 'implementation_readiness',
    question_text: 'How ready is your organization for a comprehensive data strategy implementation?',
    response_type: 'slider',
    min: 1,
    max: 10,
    labels: { 1: 'Not Ready', 10: 'Fully Ready' },
    required: true
  }
];

// Helper functions
export const getQuestionsBySection = (sectionId) => {
  return SURVEY_QUESTIONS.filter(q => q.section === sectionId);
};

export const getSectionById = (sectionId) => {
  return SURVEY_SECTIONS.find(s => s.id === sectionId);
};

export const getTotalQuestions = () => SURVEY_QUESTIONS.length;

export const getQuestionById = (questionId) => {
  return SURVEY_QUESTIONS.find(q => q.id === questionId);
};
