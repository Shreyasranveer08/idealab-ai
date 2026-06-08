import { useState } from 'react';

export default function StartupLogo({ name, url, size = "md", className = "" }) {
  const [error, setError] = useState(false);
  
  let domain = "";
  try {
    if (url) {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = urlObj.hostname.replace('www.', '');
    }
  } catch (e) {
    // invalid url
  }

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl"
  };

  const colors = [
    "bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-rose-500", 
    "bg-orange-500", "bg-emerald-500", "bg-cyan-500", "bg-blue-500"
  ];
  
  // Deterministic color based on name
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const bgColor = colors[colorIndex];
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  // Use Clearbit logo API, fallback to letter if error
  // Wait, clearbit sometimes fails for unknown domains, fallback triggers onError
  if (!error && domain && !domain.includes('news.ycombinator.com') && !domain.includes('reddit.com')) {
    return (
      <img 
        src={`https://logo.clearbit.com/${domain}?size=128`} 
        alt={`${name} logo`}
        className={`${sizeClasses[size]} rounded-lg object-contain bg-white p-1 border border-white/10 ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  // Fallback to initial
  return (
    <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center text-white font-bold ${bgColor} shadow-lg ${className}`}>
      {initial}
    </div>
  );
}
