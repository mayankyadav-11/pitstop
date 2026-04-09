import { Driver, EventCard, Message } from "./types";

export const MESSAGES: Message[] = [
  {
    id: '1',
    user: 'TurboMax',
    handle: '@TurboMax',
    time: '14:02',
    text: "Looking at the sector times, he has to box now or he'll lose the position to Perez.",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAP3U96kH2N7N7OwDyKqhRXrb9Bc9n36JHC-4pDZcyH21j_fgOp_Nt6kpNptx3hWIoGHWh2itWSOHPCUUn7-ZhOJXrYNWgUscEUinrjXspxhWBqTrEKY32nBaMJar0SjiXr-wSTbCKsZ4tik4cMmx3Bqo1jB8Ybc_cXMFmOpK0LZzinH7V-UrPbPGW_gersfc5bC1r3ZcDne7Xd6BqPCmxUdZ6tNqchc7JkQJ2UEnOOAdWQbq2RtLeLSyeKe3wUf34xq2Qq8pgrCIE'
  },
  {
    id: '2',
    user: 'S_Kimi',
    handle: '@S_Kimi',
    time: '14:03',
    text: "If they stay out, they're gambling on a safety car. High risk move.",
    initials: 'SK'
  },
  {
    id: '3',
    user: 'PitCrew_88',
    handle: '@PitCrew_88',
    time: '14:05',
    text: "The gap is closing! 0.8s per lap faster on the fresh hards.",
    isMe: true
  },
  {
    id: '4',
    user: 'AeroGirl',
    handle: '@AeroGirl',
    time: '14:06',
    text: "YELLOW FLAG in Sector 2! This might change everything.",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvlgf9nzuQnjNlwjBo5vez7DTHIIJnU5RcFu8mhGuaG7i8wo9l56w57OPRwxker1KVUnV-RrM6PI2tDO8koM80cLF65Nk4RUQfAPzAjmcsozTVo6E3grOrEv7Jw7vGAO-sX3vr4QM_cUJdv8bnn05odoDw5hIuVUDXA0tVBlB38C7ezboMNCuhVSeexoUbyIHrGVFxnvV_ADJ8h6alzEhc3VEwdRwi0TLPvgNYjkQu7hCZO-xfOkEeU16QPhPWD-aLKSxCr_GTe0g',
    isMod: true
  }
];

export const DRIVERS: Driver[] = [
  { pos: '01', name: 'MAX VERSTAPPEN', country: 'Netherlands', birthplace: 'Hasselt, Belgium', team: 'Red Bull Racing', points: 295, wins: 8, avatar: '/drivers/max verstappen.jpeg', number: '01', color: '#3671C6' },
  { pos: '02', name: 'LANDO NORRIS', country: 'United Kingdom', birthplace: 'Bristol, England', team: 'McLaren', points: 240, wins: 3, avatar: '/drivers/lando norris.jpeg', number: '04', color: '#FF8000' },
  { pos: '03', name: 'CHARLES LECLERC', country: 'Monaco', birthplace: 'Monte Carlo, Monaco', team: 'Ferrari', points: 210, wins: 2, avatar: '/drivers/charles leclerc.jpeg', number: '16', color: '#E80020' },
  { pos: '04', name: 'OSCAR PIASTRI', country: 'Australia', birthplace: 'Melbourne, Australia', team: 'McLaren', points: 195, wins: 1, avatar: '/drivers/oscar piastri.webp', number: '81', color: '#FF8000' },
  { pos: '05', name: 'LEWIS HAMILTON', country: 'United Kingdom', birthplace: 'Stevenage, England', team: 'Ferrari', points: 175, wins: 1, avatar: '/drivers/lewis hamilton.jpeg', number: '44', color: '#E80020' },
  { pos: '06', name: 'GEORGE RUSSELL', country: 'United Kingdom', birthplace: 'King\'s Lynn, England', team: 'Mercedes-AMG', points: 150, wins: 1, avatar: '/drivers/george russell.jpeg', number: '63', color: '#00D2BE' },
  { pos: '07', name: 'CARLOS SAINZ JR.', country: 'Spain', birthplace: 'Madrid, Spain', team: 'Williams', points: 110, wins: 0, avatar: '/drivers/carlos sainz.jpeg', number: '55', color: '#005AFF' },
  { pos: '08', name: 'FERNANDO ALONSO', country: 'Spain', birthplace: 'Oviedo, Spain', team: 'Aston Martin', points: 88, wins: 0, avatar: '/drivers/fernando alonso.jpeg', number: '14', color: '#006F62' },
  { pos: '09', name: 'ALEX ALBON', country: 'Thailand', birthplace: 'London, England', team: 'Williams', points: 45, wins: 0, avatar: '/drivers/alex albon.jpeg', number: '23', color: '#005AFF' },
  { pos: '10', name: 'ANDREA KIMI ANTONELLI', country: 'Italy', birthplace: 'Bologna, Italy', team: 'Mercedes-AMG', points: 42, wins: 0, avatar: '/drivers/kimi antonelli.jpeg', number: '12', color: '#00D2BE' },
  { pos: '11', name: 'PIERRE GASLY', country: 'France', birthplace: 'Rouen, France', team: 'Alpine', points: 35, wins: 0, avatar: '/drivers/pierre gasly.jpeg', number: '10', color: '#0090FF' },
  { pos: '12', name: 'LIAM LAWSON', country: 'New Zealand', birthplace: 'Hastings, New Zealand', team: 'Racing Bulls', points: 28, wins: 0, avatar: '/drivers/liam lawson.jpeg', number: '30', color: '#6692FF' },
  { pos: '13', name: 'ESTEBAN OCON', country: 'France', birthplace: 'Évreux, France', team: 'Haas F1 Team', points: 25, wins: 0, avatar: '/drivers/esteban ocon.jpeg', number: '31', color: '#FFFFFF' },
  { pos: '14', name: 'SERGIO PÉREZ', country: 'Mexico', birthplace: 'Guadalajara, Mexico', team: 'Cadillac Racing', points: 22, wins: 0, avatar: '/drivers/sergio perez.webp', number: '11', color: '#C5B358' },
  { pos: '15', name: 'OLIVER BEARMAN', country: 'United Kingdom', birthplace: 'Chelmsford, England', team: 'Haas F1 Team', points: 18, wins: 0, avatar: '/drivers/ollie bearman.jpeg', number: '87', color: '#FFFFFF' },
  { pos: '16', name: 'FRANCO COLAPINTO', country: 'Argentina', birthplace: 'Pilar, Argentina', team: 'Alpine', points: 12, wins: 0, avatar: '/drivers/franco colapinto.jpeg', number: '43', color: '#0090FF' },
  { pos: '17', name: 'NICO HÜLKENBERG', country: 'Germany', birthplace: 'Emmerich, Germany', team: 'Audi', points: 10, wins: 0, avatar: '/drivers/nico hulkenberg.jpeg', number: '27', color: '#F50537' },
  { pos: '18', name: 'LANCE STROLL', country: 'Canada', birthplace: 'Montreal, Canada', team: 'Aston Martin', points: 8, wins: 0, avatar: '/drivers/lance stroll.jpeg', number: '18', color: '#006F62' },
  { pos: '19', name: 'VALTTERI BOTTAS', country: 'Finland', birthplace: 'Nastola, Finland', team: 'Cadillac Racing', points: 5, wins: 0, avatar: '/drivers/valtteri bottas.jpeg', number: '77', color: '#C5B358' },
  { pos: '20', name: 'GABRIEL BORTOLETO', country: 'Brazil', birthplace: 'São Paulo, Brazil', team: 'Audi', points: 4, wins: 0, avatar: '/drivers/gabriel bortoleto.jpeg', number: '05', color: '#F50537' },
  { pos: '21', name: 'ISACK HADJAR', country: 'France', birthplace: 'Paris, France', team: 'Red Bull Racing', points: 3, wins: 0, avatar: '/drivers/isack hadjar.jpeg', number: '20', color: '#3671C6' },
  { pos: '22', name: 'ARVID LINDBLAD', country: 'United Kingdom', birthplace: 'London, England', team: 'Racing Bulls', points: 0, wins: 0, avatar: '/drivers/arvid lindblad.jpeg', number: '25', color: '#6692FF' }
];

export const EVENTS: EventCard[] = [
  {
    id: '1',
    lap: 18,
    title: 'HAM PITS',
    description: 'Lewis Hamilton makes a strategic pit stop for Medium tires to cover the undercut from Verstappen. Mercedes crew executes a flawless change in record time.',
    type: 'pit',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC53udIidudgihVKITUJhu04ZIMUjP4r7wTynDyPB8bIsICQjs8ScbDQJunbQHH8Mao0N1KBWBe-K4LgFM5_LNMz3C21HtcNSdqcUKQf6etDxEE87kQjTV3wcn38lKHHAhA6KMvEhODf7xKVMD6oJE9rI3HBvvRLPVJHtMah-mJkL4I03VDhiR_dtllUckm8JKwEDCjU8VgxnirilixxHYdZSZL7iecHjXRqrXkZvcE9SGU8hjD9d8PndTKXBqsPXwlJ5__D_auYK0',
    stat: '2.4s STOP',
    insight: 'Mercedes data showed Verstappen gaining 0.4s per lap. Pitting now prevents Verstappen from passing on the out-lap.'
  },
  {
    id: '2',
    lap: 19,
    title: 'YELLOW SECTOR 2',
    description: 'Stroll goes wide at Turn 8, kicking up gravel onto the racing line. Race Control has deployed a localized yellow flag while debris is cleared.',
    type: 'warning',
    impact: 'LOW',
    insight: 'Drivers must slow down in Sector 2. Expect lap times to drop by 0.5-1.0s until the track is clear.'
  },
  {
    id: '3',
    lap: 20,
    title: 'LEC OVERTAKE',
    description: "Charles Leclerc dives down the inside of Perez at the hairpin using DRS. Ferrari's pace on the hards looks superior in this stint.",
    type: 'overtake',
    posGained: '+1 POS',
    insight: 'Ferrari changed their setup overnight for better tire degradation. The hards are now operating in their ideal temperature window.'
  },
  {
    id: '4',
    lap: 16,
    title: 'RADIO CHECK',
    description: '"Box this lap, box for hards. Confirm tires." Verstappen acknowledges and confirms his entry into the pit lane.',
    type: 'radio'
  }
];
