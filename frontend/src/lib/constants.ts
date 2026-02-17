export const RESEARCH_DOMAINS = [
  'Computer Science',
  'Biology',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Social Sciences',
] as const;

export const READING_STAGES = [
  'Abstract Read',
  'Introduction Done',
  'Methodology Done',
  'Results Analyzed',
  'Fully Read',
  'Notes Completed',
] as const;

export const IMPACT_SCORES = [
  'High Impact',
  'Medium Impact',
  'Low Impact',
  'Unknown',
] as const;

export const DATE_FILTERS = [
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'all_time', label: 'All Time' },
] as const;

export type ResearchDomain = typeof RESEARCH_DOMAINS[number];
export type ReadingStage = typeof READING_STAGES[number];
export type ImpactScore = typeof IMPACT_SCORES[number];
export type DateFilter = typeof DATE_FILTERS[number]['value'];

export interface Paper {
  _id: string;
  title: string;
  firstAuthor: string;
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  citationCount: number;
  impactScore: ImpactScore;
  dateAdded: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
}
