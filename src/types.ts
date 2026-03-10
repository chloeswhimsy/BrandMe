export interface UserProfile {
  questionnaireAnswers: Record<string, string>;
  uploadedDocs: {
    values?: string;
    strength?: string;
    leadership?: string;
  };
  jobFunction: string;
  industry: string;
  resumeText: string;
  linkedinUrl: string;
  personalNuance?: string;
}

export interface InspirationSnippet {
  name: string;
  role: string;
  summarySentence: string;
}

export interface InspirationData {
  snippets: InspirationSnippet[];
  keywords: { text: string; size: number }[];
}

export interface BrandStyleContent {
  styleName: string;
  exampleSnippet: string;
  distinction: string;
  oneSentenceSummary: string;
  longSummary: string;
  strengths: string[];
  values: string[];
  keywords: string[];
}

export interface PersonalBrandResult {
  styles: BrandStyleContent[];
}
