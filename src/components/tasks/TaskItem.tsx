// src/components/tasks/TaskItem.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { Task } from '../../types';
import { 
  Box, 
  Text, 
  Flex, 
  Badge, 
  IconButton, 
  Tooltip
} from '@chakra-ui/react';
import { FaTrash, FaRegClock, FaTag } from 'react-icons/fa';
import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { AnimatedCheckmark } from '../ui';
import { useAdaptiveTheme } from '../../styles/emotionalDesign';

interface TaskItemProps {
  task: Task;
}

const MotionBox = motion(Box);

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [isHovering, setIsHovering] = useState(false);
  const toggleTask = useAppStore(state => state.toggleTask);
  const subjects = useAppStore(state => state.subjects);
  const streakData = useAppStore(state => state.streakData || { currentStreak: 0 });
  
  // Get subject info
  const subject = subjects.find(s => s.id === task.subjectId);
  const subjectName = subject?.name || 'Unknown Subject';
  
  // Refs for advanced animations
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiCanvas = useRef<HTMLCanvasElement | null>(null);
  const controls = useAnimation();
  
  // Get adaptive theme for mood-based styling
  const { mood, palette } = useAdaptiveTheme(
    0, // No duration for task items
    streakData.currentStreak,
    false
  );
  
  // UI Colors based on theme - IMPROVED CONTRAST
  const bgColor = 'rgba(45, 55, 72, 0.8)'; // Darker, more opaque background
  const textColor = 'white';
  const borderColor = subject?.color || palette.accent;
  
  // Detect device capabilities
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  const handleToggle = () => {
    toggleTask(task.id);
    
    // Trigger completion effect if task is being completed
    if (!task.completed) {
      triggerCompletionEffect();
      
      // Trigger haptic feedback if supported
      if (navigator.vibrate && !prefersReducedMotion) {
        navigator.vibrate([15, 30, 15]);
      }
      
      // Animate container on completion
      controls.start({
        scale: [1, 1.02, 0.98],
        transition: { duration: 0.4, ease: "easeInOut" }
      });
    }
  };
  
  // Handle task deletion
  const handleDelete = () => {
    console.log('Delete task requested:', task.id);
    // We'll implement this functionality later
    // For now, we'll just give user feedback
    alert(`Task "${task.description}" would be deleted (functionality coming soon)`);
  };
  
  // Enhanced particle effect for task completion
  const triggerCompletionEffect = () => {
    if (prefersReducedMotion) return;
    
    // Create canvas for confetti effect
    if (!containerRef.current) return;
    
    // Create canvas if it doesn't exist
    if (!confettiCanvas.current) {
      const canvas = document.createElement('canvas');
      canvas.width = containerRef.current.offsetWidth;
      canvas.height = containerRef.current.offsetHeight;
      canvas.style.position = 'absolute';
      canvas.style.pointerEvents = 'none';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '100';
      
      confettiCanvas.current = canvas;
      containerRef.current.appendChild(canvas);
    }
    
    const ctx = confettiCanvas.current.getContext('2d');
    if (!ctx) return;
    
    // Particle configuration
    const particles: { 
      x: number; 
      y: number; 
      vx: number; 
      vy: number; 
      size: number; 
      color: string; 
      alpha: number;
      rotation: number;
      rotationSpeed: number;
      shape: 'circle' | 'square' | 'triangle';
    }[] = [];
    
    const particleCount = 40; // More particles for a richer effect
    const colors = [
      palette.primary, 
      palette.secondary, 
      palette.accent, 
      subject?.color || '#4299E1'
    ];
    
    const shapes = ['circle', 'square', 'triangle'] as const;
    
    // Create particles with more variety
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: confettiCanvas.current.width / 3 + Math.random() * (confettiCanvas.current.width / 3),
        y: confettiCanvas.current.height / 3 + Math.random() * (confettiCanvas.current.height / 3),
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 2, // Bias upward for confetti-like motion
        size: Math.random() * 8 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
    
    // Draw a shape based on the particle type
    const drawShape = (ctx: CanvasRenderingContext2D, p: typeof particles[0]) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      
      switch(p.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, p.size);
          ctx.lineTo(-p.size, p.size);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    };
    
    // Animation loop with physics
    let animationFrame: number;
    const gravity = 0.1;
    const friction = 0.99;
    
    const animate = () => {
      ctx.clearRect(0, 0, confettiCanvas.current!.width, confettiCanvas.current!.height);
      
      let complete = true;
      
      // Update and draw particles with more realistic physics
      particles.forEach(p => {
        // Apply gravity and friction
        p.vy += gravity;
        p.vx *= friction;
        p.vy *= friction;
        
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.01;
        p.rotation += p.rotationSpeed;
        
        if (p.alpha > 0) {
          complete = false;
          drawShape(ctx, p);
        }
      });
      
      if (complete) {
        cancelAnimationFrame(animationFrame);
        if (containerRef.current && confettiCanvas.current) {
          containerRef.current.removeChild(confettiCanvas.current);
          confettiCanvas.current = null;
        }
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
  };
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (confettiCanvas.current && containerRef.current) {
        containerRef.current.removeChild(confettiCanvas.current);
      }
    };
  }, []);

  return (
    <Box ref={containerRef} position="relative" mb={4}>
      {/* REGULAR BOX COMPONENT INSTEAD OF SMART HOVER CARD FOR STABILITY */}
      <Box
        p={4}
        bg={bgColor}
        backdropFilter="blur(10px)"
        borderWidth="2px"
        borderColor={`${borderColor}40`}
        boxShadow={`0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px ${borderColor}30`}
        borderRadius="lg"
        transition="all 0.3s"
        _hover={{
          borderColor: `${borderColor}60`,
          transform: "translateY(-2px)",
          boxShadow: `0 6px 16px rgba(0,0,0,0.4), 0 0 0 2px ${borderColor}40`
        }}
        position="relative"
        overflow="hidden"
        className="task-item"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Background gradient overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity={0.1}
          background={`radial-gradient(circle at 15% 15%, ${subject?.color || palette.accent}80 0%, transparent 70%)`}
          pointerEvents="none"
          transition="opacity 0.3s"
          _hover={{ opacity: 0.15 }}
          zIndex={0}
        />
        
        <Flex alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
          <Flex alignItems="center" flex="1">
            {/* Animated Checkmark Component */}
            <Box
              onClick={handleToggle}
              cursor="pointer"
              mr={4}
              p={1}
              borderRadius="md"
              transition="all 0.2s"
              _hover={{ bg: `${palette.primary}20` }}
              role="checkbox"
              aria-checked={task.completed}
            >
              <AnimatedCheckmark 
                isChecked={task.completed}
                mood={mood}
                color={subject?.color || palette.accent}
                size={28}
                strokeWidth={3}
              />
            </Box>
            
            <Box>
              <Text 
                fontSize="md" 
                fontWeight="500" 
                color={textColor}
                textDecoration={task.completed ? 'line-through' : 'none'}
                opacity={task.completed ? 0.7 : 1}
                transition="all 0.3s"
                letterSpacing="0.01em"
              >
                {task.description}
              </Text>
              
              <Flex mt={2} alignItems="center" flexWrap="wrap" gap={2}>
                <Badge 
                  bg={`${subject?.color || palette.primary}30`}
                  color={subject?.color || palette.primary}
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                  boxShadow={`0 2px 5px ${subject?.color || palette.primary}20`}
                >
                  <FaTag size={10} style={{ marginRight: '4px' }} />
                  {subjectName}
                </Badge>
                
                <Badge 
                  bg={`${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'}20`}
                  color={task.priority === 'high' ? 'red.300' : task.priority === 'medium' ? 'orange.300' : 'blue.300'}
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="xs"
                  textTransform="capitalize"
                  boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                >
                  {task.priority}
                </Badge>
                
                {task.dueDate && (
                  <Flex 
                    alignItems="center" 
                    fontSize="xs" 
                    color={new Date(task.dueDate) < new Date() ? "red.300" : "gray.400"}
                    bg={new Date(task.dueDate) < new Date() ? "red.900" : "gray.700"}
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                  >
                    <FaRegClock size={10} style={{ marginRight: '4px' }} />
                    {format(new Date(task.dueDate), 'MMM d')}
                  </Flex>
                )}
              </Flex>
            </Box>
          </Flex>
          
          <AnimatePresence>
            {(task.completed || isHovering) && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
              >
                <Tooltip label="Delete task" hasArrow placement="top">
                  <IconButton
                    icon={<FaTrash size={14} />}
                    aria-label="Delete task"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={handleDelete}
                    opacity={0.7}
                    borderRadius="full"
                    _hover={{ 
                      opacity: 1, 
                      bg: "rgba(229, 62, 62, 0.2)"
                    }}
                  />
                </Tooltip>
              </MotionBox>
            )}
          </AnimatePresence>
        </Flex>
      </Box>
    </Box>
  );
};