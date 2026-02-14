/**
 * API Endpoints Test Script
 * Author: Giuseppe Bosi
 * 
 * Tests all backend API endpoints using MCP tools
 * Run this script after starting the backend server
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4001';

/**
 * Test helper function to make HTTP requests
 * This will be used with MCP tools to make actual requests
 */
async function testEndpoint(method, endpoint, body = null, expectedStatus = 200) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n[TEST] ${method} ${endpoint}`);
  
  try {
    // This will be replaced with actual MCP HTTP request
    // For now, we document what needs to be tested
    return {
      method,
      url,
      body,
      expectedStatus,
    };
  } catch (error) {
    console.error(`[FAIL] ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Test suite for all API endpoints
 */
const testSuite = {
  // Test GET /api/info
  testInfoEndpoint: async () => {
    console.log('\n=== Testing GET /api/info ===');
    const test = await testEndpoint('GET', '/api/info');
    
    // Expected response structure:
    // {
    //   item_id: string | null,
    //   access_token: string | null,
    //   environment: string,
    //   products: string[]
    // }
    
    return {
      name: 'GET /api/info',
      description: 'Should return connection status and configuration',
      test,
      expectedFields: ['item_id', 'access_token', 'environment', 'products'],
    };
  },

  // Test POST /api/create_link_token
  testCreateLinkToken: async () => {
    console.log('\n=== Testing POST /api/create_link_token ===');
    const test = await testEndpoint('POST', '/api/create_link_token', null, 200);
    
    // Expected response structure:
    // {
    //   link_token: string,
    //   expiration: string,
    //   request_id: string
    // }
    
    return {
      name: 'POST /api/create_link_token',
      description: 'Should create a Plaid Link token',
      test,
      expectedFields: ['link_token', 'expiration', 'request_id'],
    };
  },

  // Test POST /api/set_access_token (without token - should fail)
  testSetAccessTokenWithoutToken: async () => {
    console.log('\n=== Testing POST /api/set_access_token (without token) ===');
    const test = await testEndpoint('POST', '/api/set_access_token', {}, 400);
    
    return {
      name: 'POST /api/set_access_token (error case)',
      description: 'Should return 400 when public_token is missing',
      test,
      expectedStatus: 400,
    };
  },

  // Test GET /api/transactions_last_7_days (without access token - should fail)
  testTransactionsWithoutToken: async () => {
    console.log('\n=== Testing GET /api/transactions_last_7_days (without token) ===');
    const test = await testEndpoint('GET', '/api/transactions_last_7_days', null, 400);
    
    return {
      name: 'GET /api/transactions_last_7_days (error case)',
      description: 'Should return 400 when access token is not set',
      test,
      expectedStatus: 400,
    };
  },

  // Test GET /api/transactions_get_last_7_days (without access token - should fail)
  testTransactionsGetWithoutToken: async () => {
    console.log('\n=== Testing GET /api/transactions_get_last_7_days (without token) ===');
    const test = await testEndpoint('GET', '/api/transactions_get_last_7_days', null, 400);
    
    return {
      name: 'GET /api/transactions_get_last_7_days (error case)',
      description: 'Should return 400 when access token is not set',
      test,
      expectedStatus: 400,
    };
  },
};

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('========================================');
  console.log('API Endpoints Test Suite');
  console.log('Author: Giuseppe Bosi');
  console.log('========================================');
  console.log(`Testing API at: ${API_BASE_URL}`);
  console.log('\nNote: This script defines test cases.');
  console.log('Use MCP tools to execute actual HTTP requests.');
  console.log('========================================\n');

  const results = [];
  
  for (const [testName, testFn] of Object.entries(testSuite)) {
    try {
      const result = await testFn();
      results.push({ ...result, status: 'defined' });
      console.log(`[OK] Test defined: ${result.name}`);
    } catch (error) {
      results.push({ 
        name: testName, 
        status: 'error', 
        error: error.message 
      });
      console.error(`[ERROR] ${testName}:`, error.message);
    }
  }

  console.log('\n========================================');
  console.log('Test Summary:');
  console.log(`Total tests: ${results.length}`);
  console.log(`Defined: ${results.filter(r => r.status === 'defined').length}`);
  console.log(`Errors: ${results.filter(r => r.status === 'error').length}`);
  console.log('========================================\n');

  return results;
}

// Export for use with MCP
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testSuite, runAllTests, testEndpoint };
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
