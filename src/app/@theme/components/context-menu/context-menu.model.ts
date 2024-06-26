export interface ContextMenu {
  title: string;
  path?: string;
  icon: string;
  hasClickAction?: boolean;
  isRelative?: boolean;
  data?: any;
  role: string;
  actionMethod?: Function
}
