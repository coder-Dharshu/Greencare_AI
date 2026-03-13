import { useEffect, useRef, useState } from 'react';
import { Plant } from '../types';

export function getPlantStatus(plant: Plant) {
  const last = new Date(plant.lastWatered);
  const next = new Date(last);
  next.setDate(last.getDate() + plant.waterScheduleDays);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  next.setHours(0,0,0,0);

  const diffTime = next.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'overdue', days: Math.abs(diffDays) };
  if (diffDays === 0) return { status: 'due', days: 0 };
  return { status: 'ok', days: diffDays };
}

export function useWateringNotifications(plants: Plant[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  // Keep track of which timestamps we've already notified about for each plant
  // Key: plantId, Value: lastWatered timestamp string
  const notifiedMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => setPermission(perm));
    }
  }, []);

  useEffect(() => {
    if (permission !== 'granted' || plants.length === 0) return;

    const checkWateringNeeds = () => {
      const needsWatering: Plant[] = [];

      plants.forEach(plant => {
        const { status } = getPlantStatus(plant);
        
        if (status === 'due' || status === 'overdue') {
          // Check if we've already notified for this specific watering cycle
          const lastNotifiedTimestamp = notifiedMap.current.get(plant.id);
          
          if (lastNotifiedTimestamp !== plant.lastWatered) {
            needsWatering.push(plant);
          }
        }
      });

      if (needsWatering.length > 0) {
        const plantNames = needsWatering.map(p => p.name).join(', ');
        const isMultiple = needsWatering.length > 1;
        
        const title = isMultiple ? 'Plants need water!' : `${needsWatering[0].name} needs water!`;
        const body = isMultiple 
          ? `It's time to water: ${plantNames}` 
          : `It's time to water your ${needsWatering[0].species}`;

        new Notification(title, {
          body,
          icon: '/favicon.ico', // Fallback icon
          badge: '/favicon.ico',
        });

        // Mark these plants as notified for their current lastWatered timestamp
        needsWatering.forEach(plant => {
          notifiedMap.current.set(plant.id, plant.lastWatered);
        });
      }
    };

    // Check immediately, then every 60 seconds
    checkWateringNeeds();
    const intervalId = setInterval(checkWateringNeeds, 60000);

    return () => clearInterval(intervalId);
  }, [plants, permission]);

  // Return the permission status so UI can prompt if needed
  return { permission };
}
