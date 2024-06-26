export class SharedProps {
  id?: number;
  suspended?: boolean;
  deleted?: boolean;
  creationDate?: string;
  lastModifiedDate?: string;
  creatorId?: number;
  version?: number;
}

export class Base extends SharedProps {
  localeName: string = "";
  enName: string = "";
}
