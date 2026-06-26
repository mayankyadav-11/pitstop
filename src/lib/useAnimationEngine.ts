/**
 * PitStop — 60fps Driver Animation Engine
 * ========================================
 * Interpolates driver coordinates between Socket.IO updates (every ~4s).
 * Uses requestAnimationFrame and cosine easing to keep movement buttery smooth.
 */

import { useEffect, useRef, useState } from "react";
import { CarPosition } from "./useLiveTrack";

interface AnimationState {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  startTime: number;
  duration: number;
}

export function useAnimationEngine(rawPositions: CarPosition[], pollIntervalMs = 4000) {
  const [animatedPositions, setAnimatedPositions] = useState<CarPosition[]>(rawPositions);
  
  // Track animation state for each driver
  const statesRef = useRef<Map<string, AnimationState>>(new Map());
  
  // Track last raw positions length/set to handle driver list changes
  const prevPositionsRef = useRef<CarPosition[]>([]);
  
  // Track timestamp of last update
  const lastUpdateRef = useRef<number>(Date.now());

  // Update targets when new raw positions arrive
  useEffect(() => {
    const now = Date.now();
    // Dynamically calculate the step duration based on actual arrival time
    const elapsedSinceLastUpdate = now - lastUpdateRef.current;
    const duration = elapsedSinceLastUpdate > 1000 && elapsedSinceLastUpdate < 10000 
      ? elapsedSinceLastUpdate 
      : pollIntervalMs;
    
    lastUpdateRef.current = now;

    const newStates = new Map<string, AnimationState>();
    const currentStates = statesRef.current;

    rawPositions.forEach((car) => {
      const existing = currentStates.get(car.number);
      
      let startX = car.x;
      let startY = car.y;

      if (existing) {
        // Find current animated position to start from, preventing jumps
        const elapsed = now - existing.startTime;
        const t = Math.min(1, elapsed / existing.duration);
        const ease = (1 - Math.cos(t * Math.PI)) / 2; // Cosine easing
        startX = existing.startX + (existing.targetX - existing.startX) * ease;
        startY = existing.startY + (existing.targetY - existing.startY) * ease;
      }

      newStates.set(car.number, {
        startX,
        startY,
        targetX: car.x,
        targetY: car.y,
        startTime: now,
        duration,
      });
    });

    statesRef.current = newStates;
    prevPositionsRef.current = rawPositions;
  }, [rawPositions, pollIntervalMs]);

  // requestAnimationFrame Loop
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const now = Date.now();
      const currentStates = statesRef.current;

      let changed = false;

      const nextPositions = prevPositionsRef.current.map((car) => {
        const state = currentStates.get(car.number);
        if (!state) return car;

        const elapsed = now - state.startTime;
        const t = Math.min(1, elapsed / state.duration);
        const ease = (1 - Math.cos(t * Math.PI)) / 2;

        const nextX = state.startX + (state.targetX - state.startX) * ease;
        const nextY = state.startY + (state.targetY - state.startY) * ease;

        // Only update if coords actually shifted
        if (Math.abs(nextX - car.x) > 0.01 || Math.abs(nextY - car.y) > 0.01) {
          changed = true;
        }

        return {
          ...car,
          x: nextX,
          y: nextY,
        };
      });

      if (changed || nextPositions.length !== animatedPositions.length) {
        setAnimatedPositions(nextPositions);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [animatedPositions.length]);

  return animatedPositions;
}
