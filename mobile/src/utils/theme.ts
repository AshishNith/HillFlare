export const theme = {
    colors: {
        primary: '#8B5CF6',
        primaryDark: '#7C3AED',
        primaryLight: '#A78BFA',
        accent: '#F97316',
        accentLight: '#FB923C',

        // Warm zinc surfaces
        surface: '#09090B',
        surface2: '#131316',
        surface3: '#1C1C21',
        surface4: '#26262C',
        surface5: '#323239',

        text: '#FAFAFA',
        textMuted: '#A1A1AA',
        textSubtle: '#52525B',

        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#60A5FA',

        border: '#27272A',
        borderStrong: '#3F3F46',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, xxl: 20, full: 9999 },
    fontSize: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, xxxl: 36 },
    shadow: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
        },
        primary: {
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
        },
    },
};
