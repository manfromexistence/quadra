export const setupAnalytics = async () => {
  return {
    track: (options: { event: string } & Record<string, unknown>) => {
      // OpenPanel tracking disabled
    },
  };
};
