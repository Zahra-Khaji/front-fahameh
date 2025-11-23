// src/components/UserAvatar.jsx
import React from 'react';
import { useUser } from '../../hooks/useUser';

function UserAvatar() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center gap-x-2 text-secondary-600">
        <div className="w-7 h-7 rounded-full bg-gray-300 animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-x-2 text-secondary-600">
        <img
          className="w-7 h-7 rounded-full object-cover object-center"
          src="/user.jpg"
          alt="user-account"
        />
        <span>میهمان</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2 text-secondary-600">
      <img
        className="w-7 h-7 rounded-full object-cover object-center border border-gray-300"
        src="/user.jpg"
        alt={`account-${user.username}`}
      />
<div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-2">
  <span className="text-sm font-medium leading-none">
    {user.name || user.username || 'کاربر'}
  </span>
  {user.role && (
    <span className="text-xs text-gray-500 mt-0.5 sm:mt-0">
      ({user.role === 'admin' && 'ادمین'}
      {user.role === 'inspector' && 'بازرس'}
      {user.role === 'operator' && 'اپراتور'}
      {!['admin', 'inspector', 'operator'].includes(user.role) && user.role})
    </span>
  )}
</div>
    </div>
  );
}

export default UserAvatar;