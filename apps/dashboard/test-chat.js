// Simple test to verify the chat API works
const testChat = async () => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello, can you help me?' }
        ],
        timezone: 'UTC',
        localTime: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      console.log('Received:', chunk);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// This is just a test file - run it in browser console when the app is running
console.log('Chat API test ready. Call testChat() to test.');