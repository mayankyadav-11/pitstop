import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import Home from './components/Home';
import Engage from './components/Engage';
import Explore from './components/Explore';
import Schedule from './components/Schedule';
import TeamDetailsPage from './components/TeamDetailsPage';
import { Screen, Team } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [globalSelectedTeam, setGlobalSelectedTeam] = useState<Team | null>(null);

  const handleTeamSelect = (team: Team) => {
    setGlobalSelectedTeam(team);
    setActiveScreen('team_details');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <Home key="home" />;
      case 'engage':
        return <Engage key="engage" />;
      case 'explore':
        return <Explore key="explore" />;
      case 'schedule':
        return <Schedule key="schedule" />;
      case 'team_details':
        return <TeamDetailsPage key="team_details" team={globalSelectedTeam!} onBack={() => setActiveScreen('home')} />;
      default:
        return <Home key="home" />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setActiveScreen={setActiveScreen} onTeamSelect={handleTeamSelect}>
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </Layout>
  );
}
