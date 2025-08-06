/**
 * Mock data generator for creating realistic discount records
 * Generates 100,000 rows for performance testing
 */

import { 
  type DiscountRecord, 
  Platform, 
  Region, 
  ImplementationStatus, 
  SalesEventStatus,
  CLIENT_OPTIONS 
} from '../types/discount';
import { formatDate, addDays } from './dateUtils';

// Discount name templates
const DISCOUNT_TEMPLATES = [
  'Summer Sale',
  'Black Friday',
  'Holiday Special',
  'Spring Break',
  'Back to School',
  'Valentine\'s Day',
  'Easter Sale',
  'Labor Day Weekend',
  'Halloween Horror',
  'Thanksgiving Deal',
  'Year End Clearance',
  'New Year Special',
  'Memorial Day',
  'Independence Day',
  'Winter Wonderland'
];

// Game genres for more realistic discount names
const GAME_GENRES = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Simulation',
  'Sports',
  'Racing',
  'Fighting',
  'Puzzle',
  'Indie'
];

/**
 * Generate a random date within the specified range
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a realistic discount name
 */
function generateDiscountName(): string {
  const template = randomChoice(DISCOUNT_TEMPLATES);
  const genre = randomChoice(GAME_GENRES);
  const percent = randomInt(10, 75);
  
  if (Math.random() < 0.3) {
    return `${template} - ${genre} Games`;
  } else if (Math.random() < 0.5) {
    return `${template} ${percent}% Off`;
  } else {
    return template;
  }
}

/**
 * Generate time in HH:MM format
 */
function generateTime(): string {
  const hour = randomInt(0, 23);
  const minute = randomInt(0, 59);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Generate a comment based on the status
 */
function generateComment(implementationStatus: ImplementationStatus, salesEventStatus: SalesEventStatus): string {
  const comments = [
    'Approved by management',
    'Waiting for final confirmation',
    'Technical implementation in progress',
    'Marketing campaign prepared',
    'Legal review completed',
    'Revenue impact assessment done',
    'Coordinating with platform team',
    'Customer support briefed',
    'Analytics tracking configured',
    ''
  ];
  
  if (implementationStatus === ImplementationStatus.FAILED) {
    return randomChoice([
      'Technical issues encountered',
      'Platform API limitations',
      'Approval process delayed',
      'Budget constraints',
      'Resource allocation conflict'
    ]);
  }
  
  if (salesEventStatus === SalesEventStatus.CANCELLED) {
    return randomChoice([
      'Market conditions changed',
      'Strategic decision to postpone',
      'Competitor action influenced timing',
      'Internal priority shift',
      'Platform policy change'
    ]);
  }
  
  return randomChoice(comments);
}

/**
 * Generate appropriate regions based on platform
 */
function getValidRegions(platform: Platform): Region[] {
  const allRegions = Object.values(Region);
  
  // Steam has limited regional support in this mock
  if (platform === Platform.STEAM) {
    return [Region.GLOBAL];
  }
  
  return allRegions;
}

/**
 * Generate a single discount record
 */
function generateDiscountRecord(index: number): DiscountRecord {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
  const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
  
  const startDate = randomDate(sixMonthsAgo, sixMonthsFromNow);
  const endDate = new Date(startDate.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000);
  
  const platform = randomChoice(Object.values(Platform));
  const validRegions = getValidRegions(platform);
  const region = randomChoice(validRegions);
  
  const client = randomChoice(CLIENT_OPTIONS);
  const clientId = `ORG_${client.replace(/[^A-Z]/g, '')}_${String(index).padStart(6, '0')}`;
  
  const implementationStatus = randomChoice(Object.values(ImplementationStatus));
  const salesEventStatus = randomChoice(Object.values(SalesEventStatus));
  
  return {
    clientId,
    client,
    platform,
    region,
    discount: generateDiscountName(),
    startDate: formatDate(startDate),
    startTime: generateTime(),
    endDate: formatDate(endDate),
    endTime: generateTime(),
    percent: randomInt(5, 75),
    deadline: formatDate(new Date(startDate.getTime() - randomInt(1, 14) * 24 * 60 * 60 * 1000)),
    implementationStatus,
    salesEventStatus,
    comments: generateComment(implementationStatus, salesEventStatus)
  };
}

/**
 * Generate array of discount records
 */
export function generateMockData(count: number = 100000): DiscountRecord[] {
  console.log(`Generating ${count} discount records...`);
  const startTime = performance.now();
  
  const records: DiscountRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    records.push(generateDiscountRecord(i));
    
    // Log progress for large datasets
    if (i > 0 && i % 10000 === 0) {
      console.log(`Generated ${i} records...`);
    }
  }
  
  const endTime = performance.now();
  console.log(`Generated ${count} records in ${(endTime - startTime).toFixed(2)}ms`);
  
  return records;
}

/**
 * Generate a smaller dataset for development/testing
 */
export function generateTestData(count: number = 1000): DiscountRecord[] {
  return generateMockData(count);
}