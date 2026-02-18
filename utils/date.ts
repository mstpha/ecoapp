/**
 * Format date to readable string
 * Example: "15 Feb 2025"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format date with time
 * Example: "15 Feb 2025, 10:30 AM"
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const dateOptions: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  };
  
  const dateStr = date.toLocaleDateString('en-US', dateOptions);
  const timeStr = date.toLocaleTimeString('en-US', timeOptions);
  
  return `${dateStr}, ${timeStr}`;
}

/**
 * Format time only
 * Example: "10:30 AM"
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleTimeString('en-US', options);
}

/**
 * Get relative time string
 * Example: "in 2 days", "yesterday", "in 3 hours"
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 7) {
    return formatDate(dateString);
  } else if (diffDays > 1) {
    return `in ${diffDays} days`;
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else if (diffDays === 0) {
    if (diffHours > 0) {
      return `in ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else if (diffMinutes > 0) {
      return `in ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`;
    } else {
      return 'now';
    }
  } else if (diffDays === -1) {
    return 'yesterday';
  } else {
    return `${Math.abs(diffDays)} days ago`;
  }
}

/**
 * Check if date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Format duration in hours
 * Example: "2 hours", "30 minutes"
 */
export function formatDuration(hours: number): string {
  if (hours >= 1) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    const minutes = hours * 60;
    return `${minutes} minutes`;
  }
}