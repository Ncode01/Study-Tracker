// src/styles/cursorEffects.ts
import { useState, useEffect } from 'react';
import { moodPalettes } from './emotionalDesign';
import type { MoodType } from './emotionalDesign';

// Types of interactive elements for cursor states
export type InteractiveElementType = 'button' | 'link' | 'input' | 'draggable' | 'default';

// Create custom cursor effects based on element type and current mood
export const useContextualCursor = (mood: MoodType = 'focus') => {
  const [elementType, setElementType] = useState<InteractiveElementType>('default');
  const palette = moodPalettes[mood];
  
  // Create CSS for the custom cursor
  const getCursorCSS = () => {
    // Base styles shared by all cursor types
    const baseSize = 24;
    const baseStyles = `
      .custom-cursor {
        position: fixed;
        pointer-events: none;
        width: ${baseSize}px;
        height: ${baseSize}px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s, background-color 0.3s;
        z-index: 9999;
        mix-blend-mode: difference;
      }
    `;
    
    // Element-specific cursor styles
    const cursorStyles = {
      button: `
        .cursor-button {
          background-color: ${palette.accent}80;
          border: 2px solid ${palette.accent};
          transform: translate(-50%, -50%) scale(1.2);
          box-shadow: 0 0 10px ${palette.accent}50;
        }
      `,
      link: `
        .cursor-link {
          background-color: ${palette.primary}60;
          border: 2px solid ${palette.primary};
          width: ${baseSize * 1.1}px;
          height: ${baseSize * 1.1}px;
        }
      `,
      input: `
        .cursor-input {
          background-color: transparent;
          border: 2px solid ${palette.primary};
          width: 2px;
          height: ${baseSize * 1.5}px;
          border-radius: 1px;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `,
      draggable: `
        .cursor-draggable {
          background-color: ${palette.accent}30;
          border: 2px solid ${palette.accent};
          width: ${baseSize * 1.3}px;
          height: ${baseSize * 1.3}px;
          transform: translate(-50%, -50%) scale(1.2);
        }
      `,
      default: `
        .cursor-default {
          background-color: ${palette.secondary}40;
          border: 2px solid ${palette.secondary};
          width: ${baseSize}px;
          height: ${baseSize}px;
        }
      `
    };
    
    // Combine base styles with element-specific styles
    return `
      ${baseStyles}
      ${cursorStyles.button}
      ${cursorStyles.link}
      ${cursorStyles.input}
      ${cursorStyles.draggable}
      ${cursorStyles.default}
    `;
  };
  
  // Generate the style element for the cursor
  const generateCursorStyleElement = () => {
    const styleElement = document.createElement('style');
    styleElement.id = 'contextual-cursor-styles';
    styleElement.innerHTML = getCursorCSS();
    return styleElement;
  };
  
  // Setup cursor tracking and element detection
  useEffect(() => {
    // Add styles to document head
    const styleElement = generateCursorStyleElement();
    document.head.appendChild(styleElement);
    
    // Create cursor element
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor cursor-default';
    document.body.appendChild(cursor);
    
    // Track mouse movement
    const trackMouse = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    
    // Detect element type under cursor
    const detectElementType = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let type: InteractiveElementType = 'default';
      
      if (target.tagName === 'BUTTON' || target.role === 'button' || 
          target.classList.contains('chakra-button') || 
          target.closest('button')) {
        type = 'button';
      } else if (target.tagName === 'A' || target.closest('a')) {
        type = 'link';
      } else if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || 
                target.contentEditable === 'true') {
        type = 'input';
      } else if (target.getAttribute('draggable') === 'true' || 
                target.classList.contains('draggable')) {
        type = 'draggable';
      }
      
      // Update cursor class based on element type
      cursor.className = `custom-cursor cursor-${type}`;
      setElementType(type);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', trackMouse);
    document.addEventListener('mouseover', detectElementType);
    
    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', trackMouse);
      document.removeEventListener('mouseover', detectElementType);
      document.body.removeChild(cursor);
      document.head.removeChild(styleElement);
    };
  }, [mood]);
  
  return elementType;
};

// Hook for touch devices to provide subtle feedback
export const useTactileFeedback = (prefersReducedMotion: boolean = false) => {
  const provideFeedback = (intensity: 'light' | 'medium' | 'strong' = 'light') => {
    if (prefersReducedMotion) return;
    
    // Vibration patterns for different intensities
    const patterns = {
      light: [5],
      medium: [15, 10],
      strong: [25, 15, 25]
    };
    
    // Try to use vibration API if available
    if (navigator.vibrate) {
      navigator.vibrate(patterns[intensity]);
    }
  };
  
  return { provideFeedback };
};