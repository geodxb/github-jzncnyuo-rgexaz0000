// Dummy placeholder - translation features removed
export const useLanguage = () => {
  return {
    language: 'en',
    setLanguage: () => {},
    t: (key: string) => key
  };
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};