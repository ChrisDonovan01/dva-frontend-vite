// Current Capabilities Survey Questions
// Assesses health system's technical infrastructure, data maturity, and monetization readiness

export const CAPABILITIES_SURVEY_SECTIONS = [
  {
    id: 'technology_infrastructure',
    title: 'Technology Infrastructure',
    description: 'Assess your current technical foundation and scalability'
  },
  {
    id: 'data_maturity_governance',
    title: 'Data Maturity & Governance',
    description: 'Evaluate your data management and governance practices'
  },
  {
    id: 'data_use_monetization',
    title: 'Data Use & Monetization',
    description: 'Understand your current data utilization and revenue opportunities'
  },
  {
    id: 'interoperability_investment',
    title: 'Interoperability & Investment',
    description: 'Review system connectivity and technology investment priorities'
  },
  {
    id: 'emerging_capabilities',
    title: 'Emerging Capabilities',
    description: 'Explore future technology considerations and strategic planning'
  }
];

export const CAPABILITIES_SURVEY_QUESTIONS = [
  // Section 1: Technology Infrastructure
  {
    id: 'infrastructure_scalability',
    section_id: 'technology_infrastructure',
    question_text: 'How would you describe your current data infrastructure\'s ability to scale for future initiatives?',
    response_type: 'radio',
    options: [
      'Robust and scalable for enterprise-level growth',
      'Scalable with minor upgrades',
      'Sufficient for current needs but not future-ready',
      'Struggling to meet current demands',
      'In need of major upgrades'
    ],
    required: true
  },
  {
    id: 'core_technologies',
    section_id: 'technology_infrastructure',
    question_text: 'What core technologies are currently implemented in your health system?',
    response_type: 'checkbox',
    options: [
      // Storage
      'Cloud data warehouses (e.g., Snowflake, BigQuery)',
      'On-premise data centers',
      'Hybrid cloud storage solutions',
      'Data lakes for unstructured data',
      // Analytics
      'Business intelligence platforms',
      'Advanced analytics and machine learning',
      'Real-time data processing',
      'Predictive modeling capabilities',
      // Interoperability
      'FHIR-compliant systems',
      'HL7 message processing',
      'API management platforms',
      'Electronic health record integration',
      // Digital Care
      'Telehealth platforms',
      'Patient portals and engagement tools',
      'Mobile health applications',
      'Remote patient monitoring'
    ],
    required: true
  },

  // Section 2: Data Maturity & Governance
  {
    id: 'data_maturity_level',
    section_id: 'data_maturity_governance',
    question_text: 'How would you rate your current data maturity level?',
    response_type: 'likert',
    scale: {
      min: 1,
      max: 4,
      labels: {
        1: 'Basic - Limited data capabilities',
        2: 'Developing - Growing data infrastructure',
        3: 'Advanced - Sophisticated data operations',
        4: 'Expert - Industry-leading data maturity'
      }
    },
    required: true
  },
  {
    id: 'storage_model',
    section_id: 'data_maturity_governance',
    question_text: 'How would you describe your data storage model?',
    response_type: 'radio',
    options: [
      'Fully cloud-native with modern architecture',
      'Primarily cloud-based with some on-premise',
      'Hybrid model with balanced cloud/on-premise',
      'Primarily on-premise with some cloud',
      'Fully on-premise traditional infrastructure'
    ],
    required: true
  },
  {
    id: 'data_quality_rating',
    section_id: 'data_maturity_governance',
    question_text: 'How would you rate your data quality (completeness, accuracy, timeliness)?',
    response_type: 'likert',
    scale: {
      min: 1,
      max: 5,
      labels: {
        1: 'Poor - Significant quality issues',
        2: 'Fair - Some quality concerns',
        3: 'Good - Generally reliable data',
        4: 'Very Good - High-quality data',
        5: 'Excellent - Best-in-class data quality'
      }
    },
    required: true
  },
  {
    id: 'governance_framework_status',
    section_id: 'data_maturity_governance',
    question_text: 'Do you have a formal data governance framework in place?',
    response_type: 'radio',
    options: [
      'Yes, comprehensive framework with active oversight',
      'Yes, basic framework with limited enforcement',
      'Partially implemented, work in progress',
      'Planning to implement in the next 12 months',
      'No formal framework currently'
    ],
    required: true
  },
  {
    id: 'governance_challenges',
    section_id: 'data_maturity_governance',
    question_text: 'What are your biggest data governance challenges?',
    response_type: 'checkbox',
    options: [
      'Data privacy and security compliance',
      'Data quality and standardization',
      'Access control and permissions management',
      'Data lineage and documentation',
      'Cross-departmental data sharing policies',
      'Regulatory compliance (HIPAA, etc.)',
      'Data retention and archival policies',
      'Vendor data management agreements'
    ],
    required: true
  },

  // Section 3: Data Use & Monetization
  {
    id: 'current_data_uses',
    section_id: 'data_use_monetization',
    question_text: 'How is data currently used in your organization?',
    response_type: 'checkbox',
    options: [
      'Clinical decision support and alerts',
      'Population health management',
      'Operational efficiency and cost reduction',
      'Quality improvement initiatives',
      'Research and clinical trials',
      'Financial and revenue cycle optimization',
      'Patient engagement and satisfaction',
      'Predictive analytics for risk stratification',
      'Benchmarking and performance measurement',
      'Regulatory reporting and compliance'
    ],
    required: true
  },
  {
    id: 'monetization_stage',
    section_id: 'data_use_monetization',
    question_text: 'Has your health system explored any form of data monetization?',
    response_type: 'radio',
    options: [
      'Yes, actively generating revenue from data',
      'Yes, pilot programs underway',
      'Exploring opportunities but not implemented',
      'Interested but no concrete plans',
      'Not currently considering data monetization'
    ],
    required: true
  },
  {
    id: 'monetization_opportunities',
    section_id: 'data_use_monetization',
    question_text: 'Which data monetization opportunities have you considered?',
    response_type: 'checkbox',
    options: [
      'Pharmaceutical research partnerships',
      'Medical device and technology collaborations',
      'Health insurance and actuarial services',
      'Public health and government contracts',
      'Academic research collaborations',
      'Data licensing to other healthcare organizations',
      'Consulting services based on data insights',
      'Software and analytics product development'
    ],
    required: false
  },

  // Section 4: Interoperability & Investment
  {
    id: 'interoperability_rating',
    section_id: 'interoperability_investment',
    question_text: 'How interoperable are your systems with external partners?',
    response_type: 'radio',
    options: [
      'Highly interoperable with seamless data exchange',
      'Good interoperability with most partners',
      'Moderate interoperability, some limitations',
      'Limited interoperability, significant barriers',
      'Minimal interoperability, mostly siloed systems'
    ],
    required: true
  },
  {
    id: 'interoperability_blockers',
    section_id: 'interoperability_investment',
    question_text: 'What challenges block interoperability today?',
    response_type: 'checkbox',
    options: [
      'Technical standards and protocol differences',
      'Data format and structure inconsistencies',
      'Security and privacy concerns',
      'Vendor lock-in and proprietary systems',
      'Lack of financial incentives for sharing',
      'Regulatory and legal barriers',
      'Organizational and cultural resistance',
      'Resource constraints and competing priorities'
    ],
    required: true
  },
  {
    id: 'investment_priorities',
    section_id: 'interoperability_investment',
    question_text: 'Which technologies are you prioritizing investment in over the next 12–24 months?',
    response_type: 'checkbox',
    options: [
      'Cloud infrastructure and migration',
      'Advanced analytics and AI/ML platforms',
      'Cybersecurity and data protection',
      'Interoperability and API development',
      'Patient engagement technologies',
      'Clinical decision support systems',
      'Data governance and quality tools',
      'Business intelligence and reporting',
      'Telehealth and remote care platforms',
      'Internet of Things (IoT) and connected devices'
    ],
    required: true
  },

  // Section 5: Emerging Capabilities
  {
    id: 'future_capabilities_text',
    section_id: 'emerging_capabilities',
    question_text: 'What emerging technologies or capabilities are you considering to better leverage your data?',
    response_type: 'textarea',
    placeholder: 'Describe any emerging technologies, innovative approaches, or future capabilities you\'re considering...',
    required: false,
    max_length: 1000
  }
];

// Helper functions
export const getCapabilitiesQuestionsBySection = (sectionId) => {
  return CAPABILITIES_SURVEY_QUESTIONS.filter(q => q.section_id === sectionId);
};

export const getTotalCapabilitiesQuestions = () => {
  return CAPABILITIES_SURVEY_QUESTIONS.length;
};

export const getCapabilitiesSectionByIndex = (index) => {
  return CAPABILITIES_SURVEY_SECTIONS[index] || null;
};

export const getCapabilitiesQuestionById = (questionId) => {
  return CAPABILITIES_SURVEY_QUESTIONS.find(q => q.id === questionId);
};
