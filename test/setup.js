/**
 * Test Setup File
 * This file is run before all tests to configure the test environment
 */

import 'dotenv/config';

// Set NODE_ENV to test for test environment
process.env.NODE_ENV = 'test';

// Ensure we have a DATABASE_URL for tests
if (!process.env.DATABASE_URL) {
  // Use a test database URL or the same as development for now
  // In a real-world scenario, you'd want a separate test database
  console.warn('No DATABASE_URL found in environment, using development database for tests');
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
}
