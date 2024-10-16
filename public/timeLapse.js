
const  timePassed = (fromDate) => {
    const now = new Date();
    const past = new Date(fromDate);

    // Difference in milliseconds
    const diffMs = now - past;

    // Helper constants
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerWeek = msPerDay * 7;
    const msPerMonth = msPerDay * 30.44; // Approximate average month
    const msPerYear = msPerDay * 365.25; // Leap year aware

    // Calculate differences
    const years = Math.floor(diffMs / msPerYear);
    const months = Math.floor(diffMs / msPerMonth);
    const weeks = Math.floor(diffMs / msPerWeek);
    const days = Math.floor(diffMs / msPerDay);
    const hours = Math.floor(diffMs / msPerHour);

    // Determine the most appropriate time unit
    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    // else if (weeks > 0) {
    //     return `${weeks} week${weeks > 1 ? 's' : ''}`;
    // }
    else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return 'Less than an hour ago';
    }
}
