export const theme = {
    colors: {
        primary: '#7B2FFF',
        primaryDark: '#6020E0',
        primaryLight: '#9B5FFF',

        // Flat dark surfaces — no gradients
        surface: '#0A0A0A',
        surface2: '#111111',
        surface3: '#1A1A1A',
        surface4: '#222222',
        surface5: '#2A2A2A',

        text: '#FFFFFF',
        textMuted: '#777777',
        textSubtle: '#444444',

        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#60A5FA',

        // Very subtle borders
        border: 'rgba(255, 255, 255, 0.05)',
        borderStrong: 'rgba(255, 255, 255, 0.1)',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
    fontSize: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, xxxl: 36 },
    // No shadows — flat design
    shadow: {
        sm: {},
        md: {},
        primary: {},
    },
};
