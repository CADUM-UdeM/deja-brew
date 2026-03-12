/** Always returns 'light' - app is forced to light theme for consistent tab bar on iOS 26+ */
export function useColorScheme(): 'light' | 'dark' | null {
  return 'light';
}
