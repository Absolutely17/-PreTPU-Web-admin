export interface MenuItem {
  name: string;
  url?: string;
  children?: MenuItem[];
  active?: boolean;
}
