export const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

export const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
};

export const isThisWeek = (date) => {
    const today = new Date();
    const firstDay = getStartOfWeek(today);
    return date >= firstDay;
};

export const isThisMonth = (date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export const isThisYear = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear();
};
