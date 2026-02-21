// components/datatable/types.ts
export type DataTableColumn<T> = {
  key: string;
  header: string;
  searchable?: boolean;
  render?: (row: T) => React.ReactNode;
};
