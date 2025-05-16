export function initDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-checkbox');
  
  // Check local storage for user preference
  const savedDarkMode = localStorage.getItem('darkMode');
  
  // Only apply dark mode if explicitly saved as 'true'
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark');
    darkModeToggle.checked = true;
  } else {
    // Make sure we're in light mode
    document.body.classList.remove('dark');
    document.documentElement.classList.remove('dark');
    darkModeToggle.checked = false;
  }
  
  // Set up toggle functionality
  darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
      // Enable dark mode
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      // Disable dark mode
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    
    // Redraw canvas to update any UI elements
    if (window.app && typeof window.app.redraw === 'function') {
      window.app.redraw();
    }
  });
}