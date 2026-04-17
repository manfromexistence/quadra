async function testTRPCAPI() {
  const baseUrl = "http://localhost:3001/api/trpc";
  
  console.log("Testing tRPC API endpoints...\n");
  
  // Test 1: team.current
  console.log("1. Testing team.current...");
  try {
    const response = await fetch(`${baseUrl}/team.current`);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  
  console.log("\n2. Testing user.me...");
  try {
    const response = await fetch(`${baseUrl}/user.me`);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  
  console.log("\n3. Testing overview.summary...");
  try {
    const response = await fetch(`${baseUrl}/overview.summary`);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testTRPCAPI();
