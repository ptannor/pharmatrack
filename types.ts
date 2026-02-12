
export interface ManufacturingSite {
  siteName: string;
  location: string;
  type: string; // e.g., "API Manufacturing", "Finished Dosage Form", "Packaging"
  feiNumber: string;
  inspectionStatus: 'Acceptable' | 'Needs Improvement' | 'Critical' | 'Unknown';
  lastInspectionDate: string;
  interestingFacts: string[];
  capacityEstimate: string;
  coordinates?: { lat: number; lng: number };
}

export interface DrugInfo {
  name: string;
  manufacturer: string;
  approvalDate: string;
  drugClass: string;
  sites: ManufacturingSite[];
  sources: { title: string; uri: string }[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
