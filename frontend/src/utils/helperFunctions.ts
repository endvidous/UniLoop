// Helper function to format votes
export const formatNumber = (num: number) => {
  if (num < 1000) {
    return num.toString();
  }
  if (num < 1000000) {
    // Divide by 1000 and show one decimal if needed
    const formatted = (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0);
    return `${formatted}k`;
  }
  if (num < 1000000000) {
    const formatted = (num / 1000000).toFixed(num % 1000000 !== 0 ? 1 : 0);
    return `${formatted}M`;
  }
  const formatted = (num / 1000000000).toFixed(num % 1000000000 !== 0 ? 1 : 0);
  return `${formatted}B`;
};

export const capFL = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

//Date format helper
export const formatDate = (date: Date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date"; // Handle invalid date inputs
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-GB", options);
};
