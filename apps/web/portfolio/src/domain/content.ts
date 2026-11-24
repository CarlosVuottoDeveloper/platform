export interface Project {
  id: string;
  name: string;
  category: string;
  summary: string;
  url: string;
  image: string;
}

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface Experience {
  company: string;
  period: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: `#${string}`;
}
