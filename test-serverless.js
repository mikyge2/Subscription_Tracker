import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test the basic test endpoint
const testBasicEndpoint = async () => {
  console.log('🧪 Testing basic endpoint...');
  
  try {
    const { default: handler } = await import('./api/test.js');
    
    const mockReq = { method: 'GET', headers: {} };
    const mockRes = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
      setHeader() {},
      end() {}
    };
    
    await handler(mockReq, mockRes);
    
    console.log('✅ Basic endpoint test passed');
    console.log('Status:', mockRes.statusCode);
    console.log('Response:', mockRes.body);
    
  } catch (error) {
    console.error('❌ Basic endpoint test failed:', error.message);
  }
};

// Test the root API endpoint
const testRootEndpoint = async () => {
  console.log('\n🧪 Testing root API endpoint...');
  
  try {
    const { default: handler } = await import('./api/index.js');
    
    const mockReq = { method: 'GET', headers: {} };
    const mockRes = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
      setHeader() {},
      end() {}
    };
    
    await handler(mockReq, mockRes);
    
    console.log('✅ Root API endpoint test passed');
    console.log('Status:', mockRes.statusCode);
    console.log('Endpoints available:', Object.keys(mockRes.body.endpoints || {}));
    
  } catch (error) {
    console.error('❌ Root API endpoint test failed:', error.message);
  }
};

// Test sign-up endpoint
const testSignUpEndpoint = async () => {
  console.log('\n🧪 Testing sign-up endpoint...');
  
  try {
    const { default: handler } = await import('./api/auth/sign-up.js');
    
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    const mockReq = { 
      method: 'POST', 
      headers: {},
      body: testUser
    };
    
    const mockRes = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
      setHeader() {},
      end() {}
    };
    
    await handler(mockReq, mockRes);
    
    if (mockRes.statusCode === 201) {
      console.log('✅ Sign-up endpoint test passed');
      console.log('Status:', mockRes.statusCode);
      console.log('Success:', mockRes.body.success);
    } else {
      console.log('⚠️ Sign-up endpoint returned status:', mockRes.statusCode);
      console.log('Message:', mockRes.body.message);
    }
    
  } catch (error) {
    console.error('❌ Sign-up endpoint test failed:', error.message);
  }
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting serverless function tests...\n');
  
  await testBasicEndpoint();
  await testRootEndpoint();
  await testSignUpEndpoint();
  
  console.log('\n✨ All tests completed!');
};

runTests();