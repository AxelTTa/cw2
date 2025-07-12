// API configuration for web and mobile
export const getApiUrl = (endpoint) => {
  // Check if running in Capacitor (mobile app)
  const isCapacitor = typeof window !== 'undefined' && window.Capacitor;
  
  if (isCapacitor) {
    // For mobile app, use your deployed Vercel URL
    // Replace this with your actual deployed URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-app.vercel.app';
    return `${baseUrl}/api${endpoint}`;
  } else {
    // For web app, use relative URLs
    return `/api${endpoint}`;
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response.json();
};