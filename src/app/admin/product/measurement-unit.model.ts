export interface MeasurementUnit {
  id: number;
  suspended: boolean;
  deleted: boolean;
  creationDate: string;
  lastModifiedDate: string;
  creatorId: number;
  version: number;
  localeName: string;
  enName: string;
  description: string;
}
