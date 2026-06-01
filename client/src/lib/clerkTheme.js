
export const getClerkAppearance = (theme = 'dark') => {
  const isDark = theme === 'dark';

  return {
    variables: {
      colorPrimary: isDark ? '#ffffff' : '#111111',
      colorBackground: isDark ? '#141414' : '#ffffff',
      colorInputBackground: isDark ? '#262626' : '#ffffff',
      colorInputText: isDark ? '#ffffff' : '#111111',
      colorText: isDark ? '#ffffff' : '#111111',
      colorTextSecondary: isDark ? '#a3a3a3' : '#555555',
      colorDanger: isDark ? '#ef4444' : '#dc2626',
      colorSuccess: isDark ? '#10b981' : '#059669',
      borderRadius: '8px',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      fontSize: '14px',
    },
    elements: {
      cardBox: {
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
      },
      card: {
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        padding: 0,
        width: '100%',
        maxWidth: '100%',
      },
      rootBox: {
        width: '100%',
        maxWidth: '100%',
      },
      main: {
        width: '100%',
      },
      form: {
        width: '100%',
      },
      footer: {
        background: 'transparent',
        border: 'none',
      },
      headerTitle: {
        display: 'none',
      },
      headerSubtitle: {
        display: 'none',
      },
      socialButtonsBlockButton: {
        background: isDark ? '#262626' : '#ffffff',
        border: isDark ? '1.5px solid rgba(255, 255, 255, 0.75)' : '2px solid rgba(40, 30, 25, 0.25)',
        boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.04)',
        color: isDark ? '#ffffff' : '#111111',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '14px 20px !important',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
        '&:hover': {
          background: isDark ? 'rgba(255, 255, 255, 0.08) !important' : '#f9fafb !important',
          borderColor: isDark ? '#ffffff !important' : 'rgba(0, 0, 0, 0.24) !important',
          boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4) !important' : '0 4px 8px rgba(0, 0, 0, 0.08) !important',
        },
      },
      socialButtonsBlockButtonText: {
        fontWeight: '500',
        color: isDark ? '#ffffff' : '#111111',
      },
      dividerLine: {
        background: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(40, 30, 25, 0.25)',
      },
      dividerText: {
        color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#555555',
        fontSize: '10px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },
      formFieldLabel: {
        color: isDark ? '#ffffff' : '#333333',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
      formFieldInput: {
        background: isDark ? '#262626' : '#ffffff',
        border: isDark ? '1.5px solid rgba(255, 255, 255, 0.75)' : '2px solid rgba(40, 30, 25, 0.25)',
        boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.5)' : 'inset 0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: '8px',
        color: isDark ? '#ffffff' : '#111111',
        fontSize: '14px',
        padding: '16.5px 16px !important',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
        '&::placeholder': {
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
        },
        '&:hover': {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.9) !important' : '#111111 !important',
          background: isDark ? '#2d2d2d !important' : '#f9fafb !important',
        },
        '&:focus': {
          borderColor: isDark ? '#ffffff' : '#111111',
          boxShadow: isDark 
            ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.2)' 
            : 'inset 0 1px 3px rgba(0,0,0,0.06), 0 0 0 2px rgba(0,0,0,0.08)',
          outline: 'none',
        },
      },
      formFieldInputCode: {
        background: isDark ? '#262626 !important' : '#ffffff !important',
        border: isDark ? '1.5px solid rgba(255, 255, 255, 0.75) !important' : '2px solid rgba(40, 30, 25, 0.25) !important',
        color: isDark ? '#ffffff !important' : '#111111 !important',
        fontSize: '20px !important',
        fontWeight: '600 !important',
        textAlign: 'center !important',
        '&:focus': {
          borderColor: isDark ? '#ffffff !important' : '#111111 !important',
        },
      },
      otpCodeFieldInput: {
        background: isDark ? '#262626 !important' : '#ffffff !important',
        border: isDark ? '1.5px solid rgba(255, 255, 255, 0.75) !important' : '2px solid rgba(40, 30, 25, 0.25) !important',
        color: isDark ? '#ffffff !important' : '#111111 !important',
        fontSize: '20px !important',
        fontWeight: '600 !important',
        textAlign: 'center !important',
        '&:focus': {
          borderColor: isDark ? '#ffffff !important' : '#111111 !important',
        },
      },
      formFieldInputShowPasswordButton: {
        color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)',
        '&:hover': {
          color: isDark ? '#ffffff' : '#111111',
        },
      },
      formFieldInputShowPasswordIcon: {
        color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)',
      },
      formButtonPrimary: {
        background: isDark 
          ? 'linear-gradient(135deg, #e5e5e5 0%, #ffffff 100%)' 
          : 'linear-gradient(135deg, #000000 0%, #111111 100%)',
        border: isDark ? '1px solid #ffffff' : '1px solid #111111',
        color: isDark ? '#000000' : '#ffffff',
        boxShadow: isDark ? '0 4px 16px rgba(255, 255, 255, 0.12)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        padding: '14px 20px !important',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
        '&:hover': {
          background: isDark 
            ? 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%) !important' 
            : 'linear-gradient(135deg, #111111 0%, #333333 100%) !important',
          borderColor: isDark ? '#ffffff !important' : '#333333 !important',
          boxShadow: isDark ? '0 6px 24px rgba(255, 255, 255, 0.2) !important' : '0 6px 16px rgba(0, 0, 0, 0.22) !important',
          transform: 'translateY(-1px) !important',
        },
      },
      footerActionText: {
        color: isDark ? '#d4d4d4' : '#555555',
      },
      footerAction: {
        color: isDark ? '#d4d4d4' : '#555555',
        fontSize: '12px',
      },
      footerActionLink: {
        color: isDark ? '#ffffff' : '#111111',
        fontWeight: '600',
        '&:hover': {
          color: isDark ? '#a3a3a3' : '#333333',
        },
      },
      identityPreviewText: {
        color: isDark ? '#ffffff' : '#111111',
      },
      formFieldErrorText: {
        color: isDark ? '#ef4444 !important' : '#dc2626 !important',
        fontSize: '12px !important',
      },
      formFieldErrorIcon: {
        color: isDark ? '#ef4444 !important' : '#dc2626 !important',
      },
      formFieldWarningText: {
        color: isDark ? '#fbbf24 !important' : '#b45309 !important',
        fontSize: '12px !important',
      },
      formFieldWarningIcon: {
        color: isDark ? '#fbbf24 !important' : '#d97706 !important',
      },
      formFieldSuccessText: {
        color: isDark ? '#34d399 !important' : '#059669 !important',
        fontSize: '12px !important',
      },
      formFieldSuccessIcon: {
        color: isDark ? '#34d399 !important' : '#059669 !important',
      },
      alertText: {
        fontSize: '13px !important',
        color: isDark ? '#ffffff !important' : '#111111 !important',
      },
    },
  };
};
