import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import Home from './components/Home';
import Engage from './components/Engage';
import Explore from './components/Explore';
import Schedule from './components/Schedule';
import TeamDetailsPage from './components/TeamDetailsPage';
import ShopTab from './components/ShopTab';
import Login from './components/Login';
import { Screen, Team } from './types';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [globalSelectedTeam, setGlobalSelectedTeam] = useState<Team | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTeamSelect = (team: Team) => {
    setGlobalSelectedTeam(team);
    setActiveScreen('team_details');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <Home key="home" />;
      case 'engage':
        return <Engage key="engage" user={user} />;
      case 'explore':
        return <Explore key="explore" />;
      case 'schedule':
        return <Schedule key="schedule" />;
      case 'team_details':
        return <TeamDetailsPage key="team_details" team={globalSelectedTeam!} onBack={() => setActiveScreen('home')} />;
      case 'shop':
        return <ShopTab key="shop" />;
      case 'login':
        return <Login key="login" onBack={() => setActiveScreen('home')} />;
      default:
        return <Home key="home" />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setActiveScreen={setActiveScreen} onTeamSelect={handleTeamSelect} user={user}>
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </Layout>
  );
}
