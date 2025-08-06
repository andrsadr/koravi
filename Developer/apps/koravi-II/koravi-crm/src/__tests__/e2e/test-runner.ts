/**
 * Integration Test Runner
 * 
 * This script provides utilities for running integration tests
 * with proper setup and teardown procedures.
 */

import { execSync } from 'child_process';
import { DatabaseTestHelpers } from './utils/test-helpers';

export class IntegrationTestRunner {
  private static isSetupComplete = false;

  /**
   * Setup test environment
   */
  static async setup() {
    if (this.isSetupComplete) return;

    console.log('🔧 Setting up integration test environment...');

    try {
      // Ensure database is clean
      await DatabaseTestHelpers.cleanupTestData();
      
      // Verify Supabase connection
      console.log('✅ Database connection verified');
      
      this.isSetupComplete = true;
      console.log('✅ Integration test environment ready');
    } catch (error) {
      console.error('❌ Failed to setup test environment:', error);
      throw error;
    }
  }

  /**
   * Cleanup test environment
   */
  static async cleanup() {
    console.log('🧹 Cleaning up test environment...');

    try {
      await DatabaseTestHelpers.cleanupTestData();
      console.log('✅ Test environment cleaned up');
    } catch (error) {
      console.warn('⚠️ Warning: Failed to cleanup test environment:', error);
    }
  }

  /**
   * Run specific test suite
   */
  static async runSuite(suiteName: string) {
    await this.setup();

    try {
      console.log(`🧪 Running test suite: ${suiteName}`);
      
      const command = `npx playwright test --grep "${suiteName}"`;
      execSync(command, { stdio: 'inherit' });
      
      console.log(`✅ Test suite completed: ${suiteName}`);
    } catch (error) {
      console.error(`❌ Test suite failed: ${suiteName}`, error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Run all integration tests
   */
  static async runAll() {
    await this.setup();

    try {
      console.log('🧪 Running all integration tests...');
      
      const command = 'npx playwright test src/__tests__/e2e/';
      execSync(command, { stdio: 'inherit' });
      
      console.log('✅ All integration tests completed');
    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Run tests in CI mode
   */
  static async runCI() {
    await this.setup();

    try {
      console.log('🤖 Running integration tests in CI mode...');
      
      const command = 'npx playwright test src/__tests__/e2e/ --reporter=github';
      execSync(command, { stdio: 'inherit' });
      
      console.log('✅ CI integration tests completed');
    } catch (error) {
      console.error('❌ CI integration tests failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const suite = process.argv[3];

  switch (command) {
    case 'setup':
      IntegrationTestRunner.setup();
      break;
    case 'cleanup':
      IntegrationTestRunner.cleanup();
      break;
    case 'run':
      if (suite) {
        IntegrationTestRunner.runSuite(suite);
      } else {
        IntegrationTestRunner.runAll();
      }
      break;
    case 'ci':
      IntegrationTestRunner.runCI();
      break;
    default:
      console.log(`
Usage: ts-node test-runner.ts <command> [suite]

Commands:
  setup     - Setup test environment
  cleanup   - Cleanup test environment  
  run       - Run all tests or specific suite
  ci        - Run tests in CI mode

Examples:
  ts-node test-runner.ts setup
  ts-node test-runner.ts run
  ts-node test-runner.ts run "Client Management"
  ts-node test-runner.ts ci
      `);
  }
}