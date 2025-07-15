// Set up the click handler for #h80h element
setupBubbleClick("h80h");

// Function to create the bubble element
function createBubbleElement(isReady = true) {
  // Get the h80h element to position relative to it
  const h80hElement = document.getElementById("h80h");
  
  // Get the bounding rectangle of the h80h element
  const rect = h80hElement.getBoundingClientRect();
  
  // Create the paragraph element
  const bubbleElement = document.createElement('p');
  bubbleElement.className = 'bubble_2';
  bubbleElement.innerHTML = `h80-h <svg width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: top;">
    <path fill="#2656C9" d="M9 2a8 8 0 0 1 7.934 6.965l2.25 3.539c.148.233.118.58-.225.728L17 14.07V17a2 2 0 0 1-2 2h-1.999L13 22H4v-3.694c0-1.18-.436-2.297-1.244-3.305A8 8 0 0 1 9 2m12.154 16.102l-1.665-1.11A8.96 8.96 0 0 0 21 12a8.96 8.96 0 0 0-1.51-4.993l1.664-1.11A10.95 10.95 0 0 1 23 12c0 2.258-.68 4.356-1.846 6.102"/>
  </svg> : hedi-huang`;
  
  // Calculate position relative to h80h element
  // You can adjust these offset values as needed
  const offsetX = 10; // horizontal offset from the right edge of h80h
  const offsetY = -10; // vertical offset from the top of h80h (negative = above)
  
  // Apply inline styles (converted from TSX style object)
  const styles = {
    position: 'absolute', // Changed from 'fixed' to 'absolute'
    top: `${rect.top + window.scrollY + offsetY}px`, // Position relative to h80h
    left: `${rect.right + offsetX}px`, // Position to the right of h80h
    zIndex: '10001',
    textAlign: 'center',
    lineHeight: '1.15',
    margin: '0',
    backgroundColor: '#fff',
    border: '1.5px solid #666',
    fontFamily: 'sans-serif',
    fontSize: '14.5px',
    fontWeight: '400',
    width: '100px',
    borderRadius: '50px',
    padding: '8px 6px 8px 6px',
    color: '#555',
    opacity: isReady ? '1' : '0',
    transition: isReady ? 'opacity 0.1s ease-in' : 'none'
  };
  
  // Apply all styles to the element
  Object.assign(bubbleElement.style, styles);
  
  return bubbleElement;
}

// Function to add the CSS for pseudo-elements (since they can't be applied inline)
function addBubbleCSS() {
  // Check if the style already exists to avoid duplicates
  if (document.getElementById('bubble_2-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'bubble_2-styles';
  style.textContent = `
    p.bubble_2:before,
    p.bubble_2:after {
      content: ' ';
      position: absolute;
      width: 0;
      height: 0;
    }
    p.bubble_2:before,
    p.bubble_2:after {
      left: 5px;
      bottom: -3px;
      transform: translateY(-50%);
      width: 7px;
      height: 7px;
      background-color: #fff;
      border: 1.5px solid #666;
      -webkit-border-radius: 28px;
      -moz-border-radius: 28px;
      border-radius: 32px;
    }
    p.bubble_2:after {
      width: 4px;
      height: 4px;
      left: 2px;
      bottom: -4px;
      transform: translateY(-50%);
      -webkit-border-radius: 18px;
      -moz-border-radius: 18px;
      border-radius: 18px;
    }
  `;
  
  document.head.appendChild(style);
}

// Responsive version that updates position on window resize/scroll
function createResponsiveBubbleElement(isReady = true) {
  const bubbleElement = createBubbleElement(isReady);
  
  if (!bubbleElement) return null;
  
  // Function to update position
  function updatePosition() {
    const h80hElement = document.getElementById("h80h");
    if (!h80hElement) return;
    
    const rect = h80hElement.getBoundingClientRect();
    const offsetX = 10;
    const offsetY = -10;
    
    bubbleElement.style.top = `${rect.top + window.scrollY + offsetY}px`;
    bubbleElement.style.left = `${rect.right + offsetX}px`;
  }
  
  // Store the update function on the element for later cleanup
  bubbleElement.updatePosition = updatePosition;
  
  // Update position on scroll and resize
  window.addEventListener('scroll', updatePosition);
  window.addEventListener('resize', updatePosition);
  
  return bubbleElement;
}

// Function to show bubble
function showBubble() {
  // Add the CSS styles first
  addBubbleCSS();
  
  // Create and add the responsive bubble element
  const bubble = createResponsiveBubbleElement(true);
  if (bubble) {
    document.body.appendChild(bubble);
  }
  
  return bubble; // Return reference in case you need to manipulate it later
}

// Show bubble for 3 seconds when clicking #h80h
function setupBubbleClick(triggerElementId) {
  const triggerElement = document.getElementById(triggerElementId);
  
  triggerElement.addEventListener('click', function() {
    const bubble = showBubble();
    
    // Hide bubble after 3 seconds
    setTimeout(function() {
      if (bubble && bubble.parentNode) {
        // Remove event listeners to prevent memory leaks
        window.removeEventListener('scroll', bubble.updatePosition);
        window.removeEventListener('resize', bubble.updatePosition);
        bubble.parentNode.removeChild(bubble);
      }
    }, 5000);
  });
}