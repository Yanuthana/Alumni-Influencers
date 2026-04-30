export const toastConfig = {
  position: "top-right",
  reverseOrder: false,
  toastOptions: {
    success: {
      style: {
        background: '#005113',
        color: '#8ed889',
        border: '1px solid #005113',
      },
      iconTheme: {
        primary: '#8ed889',
        secondary: '#00390b',
      },
    },
    error: {
      style: {
        background: '#93000a',
        color: '#ffdad6',
        border: '1px solid #93000a',
      },
      iconTheme: {
        primary: '#ffdad6',
        secondary: '#93000a',
      },
    },
    style: {
      borderRadius: '12px',
      fontFamily: '"Manrope", sans-serif',
      fontSize: '14px',
      fontWeight: '600',
    }
  }
};
