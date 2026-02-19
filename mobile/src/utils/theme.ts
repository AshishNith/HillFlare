export const theme = {
    colors: {
        // Primary glassmorphism gradient colors
        primary: '#8B5CF6', // Purple
        primaryDark: '#7C3AED',
        primaryLight: '#A78BFA',
        
        secondary: '#EC4899', // Pink
        secondaryDark: '#DB2777',
        secondaryLight: '#F9A8D4',
        
        accent: '#F97316', // Orange
        accentLight: '#FB923C',
        accentDark: '#EA580C',

        // Glassmorphism background system
        background: {
            primary: '#0B0B0F', // Very dark base
            secondary: '#1A1A1E', // Slightly lighter
            tertiary: '#2A2A30', // For elevated elements
        },

        // Glass surface colors
        glass: {
            light: 'rgba(255, 255, 255, 0.1)',
            medium: 'rgba(255, 255, 255, 0.15)',
            dark: 'rgba(255, 255, 255, 0.05)',
            border: 'rgba(255, 255, 255, 0.2)',
            borderStrong: 'rgba(255, 255, 255, 0.3)',
        },

        // Text colors for dark theme
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.9)',
            muted: 'rgba(255, 255, 255, 0.7)',
            subtle: 'rgba(255, 255, 255, 0.5)',
            placeholder: 'rgba(255, 255, 255, 0.4)',
        },

        // Status colors
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#FBBF24',
        info: '#60A5FA',

        // Neon accent variations
        neon: {
            purple: '#8B5CF6',
            pink: '#EC4899',
            blue: '#3B82F6',
            green: '#22C55E',
            yellow: '#FBBF24',
            orange: '#F97316',
        },
    },

    gradients: {
        primary: ['#8B5CF6', '#EC4899'],
        secondary: ['#EC4899', '#F97316'],
        tertiary: ['#8B5CF6', '#EC4899', '#F97316'],
        background: ['#0B0B0F', '#1A1A1E', '#2A2A30'],
        overlay: ['transparent', 'rgba(0, 0, 0, 0.7)'],
    },

    spacing: { 
        xs: 4, 
        sm: 8, 
        md: 16, 
        lg: 24, 
        xl: 32, 
        xxl: 48,
        xxxl: 64,
    },

    borderRadius: { 
        sm: 8, 
        md: 12, 
        lg: 16, 
        xl: 20, 
        xxl: 24, 
        full: 9999,
    },

    fontSize: { 
        xs: 10, 
        sm: 12, 
        md: 14, 
        base: 16,
        lg: 18, 
        xl: 20, 
        xxl: 24,
        xxxl: 28,
        display: 36,
    },

    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },

    shadow: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
        },
        neon: {
            purple: {
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 6,
            },
            pink: {
                shadowColor: '#EC4899',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 6,
            },
        },
    },

    animation: {
        duration: {
            fast: 150,
            normal: 300,
            slow: 500,
        },
        easing: {
            easeInOut: 'ease-in-out',
            easeOut: 'ease-out',
            spring: 'spring',
        },
    },
};
