// Time-related constants and functions

// Get current Unix timestamp
const timeNow = () => {
  return Math.floor(Date.now() / 1000);
};

// Get timestamp for one day ago
const oneDayAgo = timeNow() - (24 * 60 * 60); // 86400 seconds = 1 day

// Get timestamp for one week ago
const oneWeekAgo = timeNow() - (7 * 24 * 60 * 60);

// Get timestamp for one month ago (30 days)
const oneMonthAgo = timeNow() - (30 * 24 * 60 * 60);

// Format timestamp to readable date
const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toISOString();
};

// Check if timestamp is today
const isToday = (timestamp) => {
  const today = new Date();
  const date = new Date(timestamp * 1000);
  return today.toDateString() === date.toDateString();
};

module.exports = {
  timeNow,
  oneDayAgo,
  oneWeekAgo,
  oneMonthAgo,
  formatDate,
  isToday
}; 