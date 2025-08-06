/**
 * TypeScript interfaces for the Discount Management System
 * These define the data structures used throughout the application
 */

export interface DiscountRecord {
  // Core database fields
  clientId: string; // Organization Id
  client: string;
  platform: Platform;
  region: Region;
  discount: string;
  startDate: string; // yyyy-mm-dd format
  startTime: string;
  endDate: string; // yyyy-mm-dd format
  endTime: string;
  percent: number;
  deadline: string; // yyyy-mm-dd format
  implementationStatus: ImplementationStatus;
  salesEventStatus: SalesEventStatus;
  comments: string;
  
  // Computed fields (UI only, not stored in database)
  month?: string; // Name of the month when discount starts
  length?: number; // Number of days between start and end date
}

export enum Platform {
  STEAM = 'Steam',
  EPIC = 'Epic Games Store',
  GOG = 'GOG',
  XBOX = 'Xbox',
  PLAYSTATION = 'PlayStation',
  NINTENDO = 'Nintendo Switch',
  MOBILE = 'Mobile'
}

export enum Region {
  GLOBAL = 'Global',
  NORTH_AMERICA = 'North America',
  EUROPE = 'Europe',
  ASIA_PACIFIC = 'Asia Pacific',
  LATIN_AMERICA = 'Latin America',
  MIDDLE_EAST_AFRICA = 'Middle East & Africa'
}

export enum ImplementationStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled'
}

export enum SalesEventStatus {
  PLANNED = 'Planned',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

// Interface for bulk update operations
export interface BulkUpdateData {
  discountName?: string;
  discountPercent?: number;
  startDate?: string;
  endDate?: string;
}

// Interface for filter state
export interface FilterState {
  [key: string]: string[] | null;
}

// Interface for grid configuration
export interface GridConfig {
  pagination: boolean;
  paginationPageSize: number;
  rowSelection: 'single' | 'multiple';
  suppressRowClickSelection: boolean;
  animateRows: boolean;
  enableRangeSelection: boolean;
  enableCellTextSelection: boolean;
  ensureDomOrder: boolean;
  suppressColumnVirtualisation: boolean;
  suppressRowVirtualisation: boolean;
}

// Predefined client options
export const CLIENT_OPTIONS = [
  'Activision',
  'Electronic Arts',
  'Ubisoft',
  'Take-Two Interactive',
  'Bandai Namco',
  'Square Enix',
  'SEGA',
  'Capcom',
  'Konami',
  'Epic Games',
  'Valve Corporation',
  'CD Projekt',
  'Bethesda Game Studios',
  '2K Games',
  'Warner Bros. Games'
];

// Platform-Region constraints
export const PLATFORM_REGION_CONSTRAINTS: Record<Platform, Region[]> = {
  [Platform.STEAM]: [Region.GLOBAL, Region.NORTH_AMERICA, Region.EUROPE, Region.ASIA_PACIFIC],
  [Platform.EPIC]: [Region.GLOBAL],
  [Platform.GOG]: [Region.GLOBAL, Region.NORTH_AMERICA, Region.EUROPE],
  [Platform.XBOX]: [Region.GLOBAL, Region.NORTH_AMERICA, Region.EUROPE, Region.ASIA_PACIFIC],
  [Platform.PLAYSTATION]: [Region.GLOBAL, Region.NORTH_AMERICA, Region.EUROPE, Region.ASIA_PACIFIC],
  [Platform.NINTENDO]: [Region.GLOBAL, Region.NORTH_AMERICA, Region.EUROPE, Region.ASIA_PACIFIC],
  [Platform.MOBILE]: [Region.GLOBAL, Region.NORTH_AMERICA, Region.EUROPE, Region.ASIA_PACIFIC, Region.LATIN_AMERICA, Region.MIDDLE_EAST_AFRICA]
};