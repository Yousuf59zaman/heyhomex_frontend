export default defineNuxtPlugin(() => {
  // Ensure dark mode is never enabled
  if (import.meta.client) {
    // Remove dark class if it exists
    document.documentElement.classList.remove('dark');
    
    // Prevent dark class from being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
});
