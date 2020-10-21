export interface ServerBackup {
    uuid: string;
    isSuccessful: boolean;
    name: string;
    ignoredFiles: string;
    checksum: string;
    bytes: number;
    createdAt: Date;
    completedAt: Date | null;
}

export interface ServerEggVariable {
    name: string;
    description: string;
    envVariable: string;
    defaultValue: string;
    serverValue: string;
    isEditable: boolean;
    rules: string[];
}
export interface FractalResponseData {
  object: string;
  attributes: {
      [k: string]: any;
      relationships?: Record<string, FractalResponseData | FractalResponseList>;
  };
}

export interface FractalResponseList {
  object: 'list';
  data: FractalResponseData[];
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationDataSet;
}
export interface PaginationDataSet {
  total: number;
  count: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
}
