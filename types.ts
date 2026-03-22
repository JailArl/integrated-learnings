
export interface RoadmapSection {
  title: string;
  content: string[]; // Array of paragraphs or bullet points
  type?: 'text' | 'list' | 'warning' | 'info';
}

export interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
  sections: RoadmapSection[];
}

export interface ServiceBlock {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface PricingTier {
  category: string;
  rates: {
    level: string;
    pt: string;
    ft: string;
    moe: string;
  }[];
}
