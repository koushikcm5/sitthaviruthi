// Global font styles for consistent typography across the app

export const fonts = {
  // Headlines/Titles - Josefin Sans
  heading: {
    regular: 'JosefinSans-Regular',
    medium: 'JosefinSans-Medium',
    bold: 'JosefinSans-Bold',
  },
  // Body Text - Work Sans
  body: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium',
    bold: 'WorkSans-Bold',
  },
};

// Helper function to get font family
export const getFontFamily = (type = 'body', weight = 'regular') => {
  return fonts[type]?.[weight] || fonts.body.regular;
};
