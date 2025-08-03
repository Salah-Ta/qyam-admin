import React, { useState, useCallback, useMemo, memo } from 'react';
import { BellIcon, CheckIcon } from 'lucide-react';
import { useFetcher } from '@remix-run/react';
import { Avatar, AvatarFallback, AvatarImage } from './UI-dashbord/avatar';

interface Message {
  id: string;
  content: string;
  sentAt: Date | string;
  isRead: boolean;
  fromUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface NotificationDropdownProps {
  messages: Message[];
  unreadCount: number;
}

// Memoized notification item component
const NotificationItem = memo(({ 
  message, 
  onMarkAsRead, 
  timeAgo 
}: { 
  message: Message; 
  onMarkAsRead: (id: string) => void;
  timeAgo: string;
}) => {
  const handleMarkAsRead = useCallback(() => {
    onMarkAsRead(message.id);
  }, [message.id, onMarkAsRead]);

  const handleNotificationClick = useCallback(() => {
    if (!message.isRead) {
      onMarkAsRead(message.id);
    }
  }, [message.id, message.isRead, onMarkAsRead]);

  return (
    <div
      onClick={handleNotificationClick}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
        !message.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start gap-3 [direction:rtl]">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage 
            src={message.fromUser?.avatar} 
            alt={message.fromUser?.name} 
          />
          <AvatarFallback className="text-xs">
            {message.fromUser?.name?.charAt(0) || 'M'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {message.fromUser?.name || 'مشرف تربوي'}
            </p>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
            {message.content}
          </p>
          {!message.isRead && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-600 font-medium">جديد</span>
              </div>
              <button
                type="button"
                onClick={handleMarkAsRead}
                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                title="تحديد كمقروء"
              >
                <CheckIcon className="w-3 h-3" />
                تم القراءة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

// Memoized empty state component
const EmptyState = memo(({ messagesLength, unreadCount }: { messagesLength: number; unreadCount: number }) => (
  <div className="p-8 text-center text-gray-500 [direction:rtl]">
    <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
    <p className="text-sm">لا توجد إشعارات</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

export default function NotificationDropdown({ 
  messages = [], 
  unreadCount = 0 
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [optimisticUnreadCount, setOptimisticUnreadCount] = useState(0);
  const fetcher = useFetcher();

  // Update optimistic state when props change
  React.useEffect(() => {
    setOptimisticMessages(messages);
    setOptimisticUnreadCount(unreadCount);
  }, [messages, unreadCount]);

  // Memoized time formatting function
  const formatTimeAgo = useCallback((date: Date | string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  }, []);

  // Memoized messages with time calculations using optimistic state
  const messagesWithTime = useMemo(() => 
    optimisticMessages.map(message => ({
      ...message,
      timeAgo: formatTimeAgo(message.sentAt)
    }))
  , [optimisticMessages, formatTimeAgo]);

  // Optimized handlers
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMarkAsRead = useCallback((messageId: string) => {
    // Optimistic update - immediately update UI
    setOptimisticMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
    
    // Update unread count optimistically
    setOptimisticUnreadCount(prev => Math.max(0, prev - 1));
    
    // Submit to server
    const formData = new FormData();
    formData.append('action', 'markAsRead');
    formData.append('messageId', messageId);
    
    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/notifications'
    });
  }, [fetcher]);

  const handleMarkAllAsRead = useCallback(() => {
    // Optimistic update - mark all messages as read immediately
    setOptimisticMessages(prev => 
      prev.map(msg => ({ ...msg, isRead: true }))
    );
    
    // Set unread count to 0 optimistically
    setOptimisticUnreadCount(0);
    
    // Submit to server
    const formData = new FormData();
    formData.append('action', 'markAllAsRead');
    
    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/notifications'
    });
  }, [fetcher]);

  // Close dropdown when clicking outside
  const handleOutsideClick = useCallback((event: React.MouseEvent) => {
    if (isOpen && event.target === event.currentTarget) {
      setIsOpen(false);
    }
  }, [isOpen]);

  // Memoized badge display using optimistic state
  const badgeContent = useMemo(() => {
    if (optimisticUnreadCount <= 0) return null;
    return optimisticUnreadCount > 99 ? '99+' : optimisticUnreadCount;
  }, [optimisticUnreadCount]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={handleOutsideClick}
        />
      )}
      
      <div className="relative">
        {/* Bell Icon Button */}
        <button
          type="button"
          onClick={toggleDropdown}
          className={`relative flex w-10 items-center justify-center p-2 rounded-md overflow-hidden hover:bg-gray-100 transition-colors ${
            isOpen ? 'bg-gray-100' : ''
          }`}
          aria-label="إشعارات"
          aria-expanded={isOpen}
        >
          <BellIcon className="w-5 h-5" />
          {badgeContent && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-h-5 min-w-5 h-5 w-auto px-1 flex items-center justify-center font-medium">
              {badgeContent}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 [direction:rtl]">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <BellIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">الإشعارات</h3>
                    {optimisticUnreadCount > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {optimisticUnreadCount} رسالة جديدة
                      </p>
                    )}
                  </div>
                </div>
                {optimisticUnreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-all duration-200 [direction:rtl]"
                    disabled={fetcher.state === 'submitting'}
                  >
                    قراءة الكل
                  </button>
                )}
              </div>
            </div>

            {/* Messages List */}
            <div className="max-h-80 overflow-y-auto">
              {messagesWithTime.length === 0 ? (
                <EmptyState messagesLength={optimisticMessages.length} unreadCount={optimisticUnreadCount} />
              ) : (
                messagesWithTime.map((message) => (
                  <NotificationItem
                    key={message.id}
                    message={message}
                    onMarkAsRead={handleMarkAsRead}
                    timeAgo={message.timeAgo}
                  />
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
}