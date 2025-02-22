export const logger = {
  error: (error: Error, context?: Record<string, unknown>) => {
    console.error({
      timestamp: new Date().toISOString(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    });
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.log({
      timestamp: new Date().toISOString(),
      message,
      data
    });
  }
};
