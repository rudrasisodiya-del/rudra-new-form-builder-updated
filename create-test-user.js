// Script to create a test user for PabblyForm Builder
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...\n');

    const userData = {
      email: 'test@pabblyform.com',
      password: 'Test@123456',
      name: 'Test User',
      company: 'Pabbly'
    };

    const response = await axios.post(`${API_URL}/auth/register`, userData);

    console.log('✅ Test user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Password:', userData.password);
    console.log('👤 Name:', userData.name);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Access the application at:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend API: http://localhost:5000\n');

  } catch (error) {
    if (error.response) {
      if (error.response.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('ℹ️  Test user already exists!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: test@pabblyform.com');
        console.log('🔑 Password: Test@123456');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🌐 Access the application at:');
        console.log('   Frontend: http://localhost:5173\n');
      } else {
        console.error('❌ Error:', error.response.data.message || error.message);
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error: Backend server is not running!');
      console.error('   Please start the backend server first:');
      console.error('   cd server && npm run dev\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run the function
createTestUser();
