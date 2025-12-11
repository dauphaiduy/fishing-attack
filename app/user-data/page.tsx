'use client';

import { useState, useEffect } from 'react';

interface UserData {
  browser: string;
  os: string;
  language: string;
  timezone: string;
  screenResolution: string;
  viewport: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  ip?: string;
  userAgent: string;
  referrer: string;
  onlineStatus: boolean;
  cookiesEnabled: boolean;
  deviceMemory?: number;
  hardwareConcurrency: number;
}

export default function UserDataPage() {
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({
    mousePosition: { x: 0, y: 0 },
    scrollPosition: 0,
    timeOnPage: 0,
    clicks: 0,
    keyPresses: 0
  });

  useEffect(() => {
    const collectUserData = async () => {
      const data: Partial<UserData> = {};

      // Basic browser information
      data.userAgent = navigator.userAgent;
      data.language = navigator.language;
      data.onlineStatus = navigator.onLine;
      data.cookiesEnabled = navigator.cookieEnabled;
      data.hardwareConcurrency = navigator.hardwareConcurrency;

      // Screen information
      data.screenResolution = `${screen.width}x${screen.height}`;
      data.viewport = `${window.innerWidth}x${window.innerHeight}`;

      // Timezone
      data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Referrer
      data.referrer = document.referrer || 'Direct';

      // Device memory (if supported)
      if ('deviceMemory' in navigator) {
        data.deviceMemory = (navigator as unknown as { deviceMemory: number }).deviceMemory;
      }

      // Browser detection
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Chrome')) data.browser = 'Chrome';
      else if (userAgent.includes('Firefox')) data.browser = 'Firefox';
      else if (userAgent.includes('Safari')) data.browser = 'Safari';
      else if (userAgent.includes('Edge')) data.browser = 'Edge';
      else data.browser = 'Unknown';

      // OS detection
      if (userAgent.includes('Windows')) data.os = 'Windows';
      else if (userAgent.includes('Mac')) data.os = 'macOS';
      else if (userAgent.includes('Linux')) data.os = 'Linux';
      else if (userAgent.includes('Android')) data.os = 'Android';
      else if (userAgent.includes('iOS')) data.os = 'iOS';
      else data.os = 'Unknown';

      // Get IP address from external API
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        data.ip = ipData.ip;
      } catch (error) {
        console.error('Failed to get IP:', error);
      }

      // Get location (requires user permission)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            data.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setUserData({ ...data });
          },
          (error) => {
            console.log('Location access denied or failed:', error);
            setUserData(data);
          }
        );
      }

      setUserData(data);
      setLoading(false);
    };

    collectUserData();

    // Live interaction tracking
    const startTime = Date.now();
    
    const updateMousePosition = (e: MouseEvent) => {
      setLiveData(prev => ({ 
        ...prev, 
        mousePosition: { x: e.clientX, y: e.clientY }
      }));
    };

    const updateScrollPosition = () => {
      setLiveData(prev => ({ 
        ...prev, 
        scrollPosition: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
      }));
    };

    const handleClick = () => {
      setLiveData(prev => ({ ...prev, clicks: prev.clicks + 1 }));
    };

    const handleKeyPress = () => {
      setLiveData(prev => ({ ...prev, keyPresses: prev.keyPresses + 1 }));
    };

    // Time counter
    const timeInterval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      setLiveData(prev => ({ ...prev, timeOnPage: timeSpent }));
    }, 1000);

    // Add event listeners
    document.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('scroll', updateScrollPosition);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      clearInterval(timeInterval);
      document.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('scroll', updateScrollPosition);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const downloadDataAsFile = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Collecting user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-600">
          🎣 User Data Collection Demo
        </h1>

        {/* Live Interaction Data */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-700 mb-4">🔴 Live Tracking Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {liveData.mousePosition.x}, {liveData.mousePosition.y}
              </div>
              <div className="text-sm text-red-800">Mouse Position</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{liveData.scrollPosition}%</div>
              <div className="text-sm text-red-800">Page Scrolled</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{liveData.timeOnPage}s</div>
              <div className="text-sm text-red-800">Time on Page</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{liveData.clicks}</div>
              <div className="text-sm text-red-800">Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{liveData.keyPresses}</div>
              <div className="text-sm text-red-800">Key Presses</div>
            </div>
          </div>
        </div>

        {/* Data Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(userData).length}</div>
            <div className="text-sm text-blue-800">Data Points Collected</div>
          </div>
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{userData.browser || 'Unknown'}</div>
            <div className="text-sm text-green-800">Browser</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{userData.os || 'Unknown'}</div>
            <div className="text-sm text-purple-800">Operating System</div>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {userData.location ? '📍 Yes' : '❌ No'}
            </div>
            <div className="text-sm text-orange-800">Location Access</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Collected Data Details:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(userData).map(([key, value]) => (
              <div key={key} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <strong className="block text-sm uppercase text-gray-600 mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </strong>
                <div className="text-sm bg-gray-100 p-2 rounded font-mono">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </div>
              </div>
            ))}
          </div>

          {/* <div className="mt-6 space-y-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(userData, null, 2));
                alert('Data copied to clipboard!');
              }}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              📋 Copy Data to Clipboard
            </button>
            
            <button
              onClick={downloadDataAsFile}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              💾 Download Data as JSON File
            </button>

            <button
              onClick={() => {
                console.log('Collected User Data:', userData);
                alert('Data logged to browser console (F12 to view)');
              }}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition-colors"
            >
              🔍 Log Data to Console
            </button>
          </div> */}
        </div>

        <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <h3 className="text-lg font-semibold text-yellow-800">⚠️ Privacy Notice</h3>
          <p className="text-yellow-700 mt-2">
            This page demonstrates various ways to collect user data for educational purposes. 
            In real applications, always:
          </p>
          <ul className="list-disc ml-6 mt-2 text-yellow-700">
            <li>Get explicit user consent before collecting data</li>
            <li>Clearly explain what data you&apos;re collecting and why</li>
            <li>Follow GDPR, CCPA, and other privacy regulations</li>
            <li>Secure user data properly</li>
            <li>Provide users with control over their data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
