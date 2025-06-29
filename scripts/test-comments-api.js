#!/usr/bin/env node

/**
 * Comments API Test Script
 * 
 * This script tests the comments API endpoint to validate the 500 error fix.
 * Run this after configuring environment variables in .env.local
 * 
 * Usage: node scripts/test-comments-api.js
 */

const http = require('http');

const TEST_BLOG_POST_ID = '5b9bab71-c041-4450-a532-d94eb9cc006f';
const API_URL = `http://localhost:3000/api/comments?blogPostId=${TEST_BLOG_POST_ID}`;

console.log('🧪 Testing Comments API...');
console.log(`📍 Testing URL: ${API_URL}`);
console.log('');

// Check if development server is running
function testServer() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/comments?blogPostId=${TEST_BLOG_POST_ID}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    console.log('');

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Response received:');
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n🎉 SUCCESS: Comments API is working!');
          console.log(`📈 Found ${jsonData.comments?.length || 0} comments`);
        } else {
          console.log('\n❌ ERROR: API returned error response');
          if (jsonData.error?.includes('Database connection not available')) {
            console.log('🔧 FIX: Configure environment variables in .env.local');
          } else if (jsonData.error?.includes('Comments table not found')) {
            console.log('🔧 FIX: Run supabase/comments_schema.sql in Supabase');
          }
        }
      } catch (e) {
        console.log('❌ Failed to parse JSON response:');
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
    if (e.code === 'ECONNREFUSED') {
      console.log('🔧 FIX: Start the development server with "npm run dev"');
    }
  });

  req.end();
}

// Environment variable check
function checkEnvironment() {
  console.log('🔍 Checking environment configuration...');
  
  const envFile = '.env.local';
  const fs = require('fs');
  
  if (!fs.existsSync(envFile)) {
    console.log(`❌ ${envFile} not found`);
    console.log('🔧 FIX: Create .env.local with Supabase credentials');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const hasUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && 
                 !envContent.includes('your_supabase_project_url_here');
  const hasKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=') && 
                 !envContent.includes('your_supabase_service_role_key_here');
  
  console.log(`📄 ${envFile} exists: ✅`);
  console.log(`🌐 NEXT_PUBLIC_SUPABASE_URL configured: ${hasUrl ? '✅' : '❌'}`);
  console.log(`🔑 SUPABASE_SERVICE_ROLE_KEY configured: ${hasKey ? '✅' : '❌'}`);
  console.log('');
  
  if (!hasUrl || !hasKey) {
    console.log('🔧 FIX: Replace placeholder values in .env.local with actual Supabase credentials');
    return false;
  }
  
  return true;
}

// Main test execution
function main() {
  console.log('🚀 Comments API Debug Test');
  console.log('===========================');
  console.log('');
  
  if (!checkEnvironment()) {
    process.exit(1);
  }
  
  console.log('⏳ Testing API endpoint...');
  testServer();
}

main(); 