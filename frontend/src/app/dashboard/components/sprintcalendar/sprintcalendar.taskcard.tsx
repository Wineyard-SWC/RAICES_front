import { useState, useEffect } from 'react';

// Interface for user data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
}

// Interface for Workinguser
interface Workinguser {
  users:[string,string]
}

interface Props {
  title: string
  type: string
  time: string
  borderColor: string
  bgColor?: string
  textColor?: string
  assignee?: Workinguser[]
  points?: number
}

const CalendarTaskCard = ({ title, type, time, borderColor, bgColor, textColor, assignee, points }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Only process if we have an assignee array and it's not empty
    if (assignee && assignee.length > 0) {
      // Get the first assignee (in case there are multiple)
      const firstAssignee = assignee[0];
      
      // Use the name from the Workinguser object directly
      setUserName(firstAssignee.users[1]);
      
      // Optional: Cache the full user data if not already cached
      const cachedUsers = localStorage.getItem('cached_users');
      const users: Record<string, User> = cachedUsers ? JSON.parse(cachedUsers) : {};
      
      // Check if we already have this user cached
      if (!users[firstAssignee.users[0]]) {
        // Fetch the user data from the API for additional details
        fetch(`${API_URL}/users/${firstAssignee.users[0]}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('User not found');
            }
            return response.json();
          })
          .then(userData => {
            // Cache the user data for future use
            users[firstAssignee.users[0]] = userData;
            localStorage.setItem('cached_users', JSON.stringify(users));
          })
          .catch(error => {
            console.error('Error fetching user:', error);
            // If there's an error, we already have the name from the Workinguser object
          });
      }
    } else {
      // If no assignee, clear the userName
      setUserName('');
    }
  }, [assignee, API_URL]);

  return (
    <div 
      className={`mb-2 ${bgColor || 'bg-white'} rounded-lg shadow-sm p-2 border-l-4 ${borderColor} relative`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 shadow-md">
          {points || type.split(' ')[0]} story points
        </div>
      )}
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold">{title}</span>
        <span className="text-xs text-black px-1 rounded">{type}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${textColor || 'text-gray-500'}`}>{time}</span>
        <div className="flex items-center">
          {assignee && assignee.length > 0 && (
            <span className="text-xs text-gray-500 mr-1">{userName}</span>
          )}
          <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
            <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTaskCard;