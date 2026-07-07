export const THEME_STORAGE_KEY = 'woodroute.theme';

export const resolveInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light';
};

export const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('app-dark', isDark);
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    return isDark;
};
