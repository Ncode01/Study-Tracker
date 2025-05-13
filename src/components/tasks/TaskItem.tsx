// src/components/tasks/TaskItem.tsx
import React, { useState } from 'react';
import type { Task } from '../../types';
import { 
  Box, 
  Text, 
  Flex, 
  Badge, 
  IconButton, 
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { FaCheck, FaTrash, FaRegClock } from 'react-icons/fa';
import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  subjectColor?: string;
}

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export const TaskItem: React.FC<TaskItemProps> = ({ task, subjectColor = 'blue.400' }) => {
  const [isHovering, setIsHovering] = useState(false);
  const toggleTask = useAppStore(state => state.toggleTask);
  // Removed deleteTask since it doesn't exist in the store yet
  const subjects = useAppStore(state => state.subjects);
  
  const subject = subjects.find(s => s.id === task.subjectId);
  const subjectName = subject?.name || 'Unknown Subject';
  
  const bgColor = useColorModeValue('gray.700', 'gray.800');
  const borderColor = useColorModeValue('gray.600', 'gray.700');
  const textColor = useColorModeValue('white', 'gray.100');
  
  const handleToggle = () => {
    toggleTask(task.id);
    
    // Trigger completion effect if task is being completed
    if (!task.completed) {
      triggerCompletionEffect();
    }
  };
  
  // Simplified delete handler that just logs for now
  const handleDelete = () => {
    console.log('Delete task requested:', task.id);
    // We'll implement this functionality later
    // For now, we'll just give user feedback
    alert(`Task "${task.description}" would be deleted (functionality coming soon)`);
  };
  
  // Task completion particle effect
  const triggerCompletionEffect = () => {
    // Create canvas for particle effect
    const canvas = document.createElement('canvas');
    const container = document.getElementById('task-container');
    if (!container) return;
    
    canvas.width = 200;
    canvas.height = 100;
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '100';
    
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Particle configuration
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; }[] = [];
    const particleCount = 30;
    const colors = ['#FFD700', '#FF8C00', '#9370DB', subject?.color || '#4299E1'];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1
      });
    }
    
    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let complete = true;
      
      // Update and draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        
        if (p.alpha > 0) {
          complete = false;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      });
      
      if (complete) {
        cancelAnimationFrame(animationFrame);
        container.removeChild(canvas);
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
  };
  
  // Enhanced item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
    completed: { opacity: 0.6, scale: 0.98 }
  };
  
  // Custom checkbox animation variants
  const checkboxVariants = {
    unchecked: { 
      background: 'rgba(0,0,0,0.2)',
      border: '2px solid rgba(255,255,255,0.2)',
      boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.2), inset -2px -2px 6px rgba(255,255,255,0.1)'
    },
    checked: { 
      background: `${subjectColor}`,
      border: `2px solid ${subjectColor}`,
      boxShadow: `0 0 10px ${subjectColor}80`
    },
    hover: {
      scale: 1.1,
      boxShadow: `0 0 12px ${subjectColor}90`
    }
  };
  
  // Checkmark icon variants
  const checkmarkVariants = {
    checked: { opacity: 1, scale: 1, rotate: 0 },
    unchecked: { opacity: 0, scale: 0, rotate: -45 }
  };

  return (
    <MotionBox
      id="task-container"
      layout
      variants={itemVariants}
      initial="hidden"
      animate={task.completed ? ["visible", "completed"] : "visible"}
      exit="exit"
      p={5}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      mb={3}
      boxShadow="8px 8px 16px #1c1c1c, -8px -8px 16px #383838"
      _hover={{ 
        transform: "translate3d(0, -5px, 10px)", 
        boxShadow: "12px 12px 24px #131313, -12px -12px 24px #414141" 
      }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      style={{ transformStyle: 'preserve-3d' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      position="relative"
      overflow="hidden"
    >
      {/* Background gradient overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity={0.05}
        background={`linear-gradient(135deg, ${subject?.color || subjectColor} 0%, rgba(0,0,0,0.1) 100%)`}
        pointerEvents="none"
        transition="opacity 0.3s"
        _hover={{ opacity: 0.1 }}
      />
      
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" flex="1">
          {/* Custom Animated Checkbox */}
          <MotionFlex
            alignItems="center"
            justifyContent="center"
            width="26px"
            height="26px"
            borderRadius="md"
            mr={4}
            cursor="pointer"
            onClick={handleToggle}
            variants={checkboxVariants}
            animate={task.completed ? "checked" : "unchecked"}
            whileHover="hover"
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          >
            <MotionBox
              variants={checkmarkVariants}
              animate={task.completed ? "checked" : "unchecked"}
              transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1], delay: task.completed ? 0 : 0.1 }}
            >
              <FaCheck color="white" size={14} />
            </MotionBox>
          </MotionFlex>
          
          <Box>
            <Text 
              fontSize="clamp(1rem, 1.5vw, 1.1rem)" 
              fontWeight="medium" 
              color={textColor}
              textDecoration={task.completed ? 'line-through' : 'none'}
              opacity={task.completed ? 0.75 : 1}
              transition="all 0.3s"
            >
              {task.description}
            </Text>
            
            <Flex mt={1} alignItems="center">
              <Badge 
                colorScheme={subject?.color.split('.')[0]} 
                variant="subtle" 
                mr={2}
                borderRadius="full"
                px={2}
                boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                transition="transform 0.3s, box-shadow 0.3s"
                _hover={{
                  transform: "scale(1.05)",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.15)"
                }}
              >
                {subjectName}
              </Badge>
              
              <Badge 
                colorScheme={task.priority} 
                variant="subtle"
                borderRadius="full"
                px={2}
                boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                transition="transform 0.3s, box-shadow 0.3s"
                _hover={{
                  transform: "scale(1.05)",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.15)"
                }}
              >
                {task.priority}
              </Badge>
              
              {task.dueDate && (
                <Flex 
                  alignItems="center" 
                  ml={2} 
                  fontSize="xs" 
                  color="gray.400"
                >
                  <FaRegClock style={{ marginRight: '4px' }} />
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
              transition={{ duration: 0.2 }}
            >
              <Tooltip label="Delete task" hasArrow placement="top">
                <IconButton
                  icon={<FaTrash />}
                  aria-label="Delete task"
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={handleDelete}
                  opacity={0.7}
                  _hover={{ opacity: 1, transform: "scale(1.1)" }}
                  transition="all 0.3s"
                />
              </Tooltip>
            </MotionBox>
          )}
        </AnimatePresence>
      </Flex>
    </MotionBox>
  );
};