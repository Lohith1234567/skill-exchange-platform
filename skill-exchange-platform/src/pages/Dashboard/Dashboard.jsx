import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts';
import { addRating, getUserStats, completeExchange } from '../../services/firebaseService';
import RatingModal from '../../components/modals/RatingModal';
import { GlowingCard, ParallaxCard, Simple3DBackground } from '../../components/animations';
import CardGlass from '../../components/ui/CardGlass';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExchanges: 0,
    activeExchanges: 0,
    hoursLearned: 48,
    hoursTaught: 52,
    currentXP: 0,
    nextLevelXP: 1000,
    currentLevel: 1,
    streak: 12,
  });
  
  const [loading, setLoading] = useState(true);
  const [completingExchange, setCompletingExchange] = useState(null);
  
  // SEO: Update document title
  useEffect(() => {
    document.title = 'Dashboard - Your Learning Journey | SkillSwap';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = 'Track your skill exchange progress, view your statistics, manage active matches, and level up your learning journey on SkillSwap.';
    }
  }, []);

  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    exchange: null,
  });

  const [ratedExchanges, setRatedExchanges] = useState(new Set());

  // Fetch real user stats from Firestore
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const userStats = await getUserStats(user.uid);
        
        if (userStats) {
          setStats({
            totalExchanges: userStats.totalExchanges || 0,
            activeExchanges: userStats.activeExchanges || 0,
            hoursLearned: 48, // Mock for now
            hoursTaught: 52,   // Mock for now
            currentXP: userStats.xp || 0,
            nextLevelXP: 1000,
            currentLevel: userStats.level || 1,
            streak: 12,        // Mock for now
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [user?.uid]);

  const exchanges = [
    {
      id: 1,
      partnerId: 'user123',
      partner: 'Sarah Johnson',
      teaching: 'React',
      learning: 'Python',
      progress: 100,
      xpGained: 450,
      status: 'completed',
    },
    {
      id: 2,
      partnerId: 'user456',
      partner: 'Mike Chen',
      teaching: 'JavaScript',
      learning: 'Web Design',
      progress: 40,
      xpGained: 280,
      status: 'active',
    },
    {
      id: 3,
      partnerId: 'user789',
      partner: 'Emily Rodriguez',
      teaching: 'CSS',
      learning: 'UI/UX Design',
      progress: 100,
      xpGained: 520,
      status: 'completed',
    },
  ];

  const handleOpenRatingModal = (exchange) => {
    setRatingModal({
      isOpen: true,
      exchange,
    });
  };

  const handleCloseRatingModal = () => {
    setRatingModal({
      isOpen: false,
      exchange: null,
    });
  };

  const handleSubmitRating = async (rating, comment) => {
    if (!ratingModal.exchange || !user?.uid) {
      throw new Error('Missing user or exchange data');
    }

    try {
      await addRating(
        ratingModal.exchange.partnerId,
        user.uid,
        rating,
        ratingModal.exchange.id,
        comment
      );
      
      // Mark this exchange as rated
      setRatedExchanges((prev) => new Set([...prev, ratingModal.exchange.id]));
      
      // Show success notification (you could add a toast here)
      console.log('Rating submitted successfully!');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      // Re-throw with user-friendly message
      if (error.message.includes('does not exist')) {
        throw new Error('Cannot rate demo users. This feature works with real exchanges from the Explore page.');
      }
      throw error;
    }
  };

  const handleCompleteExchange = async (exchangeId) => {
    if (!exchangeId) return;
    
    try {
      setCompletingExchange(exchangeId);
      const result = await completeExchange(exchangeId);
      
      console.log('Exchange completed! XP awarded:', result.xpAwarded);
      
      // Reload stats to show updated XP
      const userStats = await getUserStats(user.uid);
      if (userStats) {
        setStats((prev) => ({
          ...prev,
          totalExchanges: userStats.totalExchanges || prev.totalExchanges,
          activeExchanges: userStats.activeExchanges || prev.activeExchanges,
          currentXP: userStats.xp || prev.currentXP,
          currentLevel: userStats.level || prev.currentLevel,
        }));
      }
      
      // Show level up notification if user leveled up
      if (result.user1Result?.leveledUp || result.user2Result?.leveledUp) {
        console.log('🎉 Level up!');
        // You could show a modal or toast here
      }
    } catch (error) {
      console.error('Error completing exchange:', error);
      alert(error.message || 'Failed to complete exchange');
    } finally {
      setCompletingExchange(null);
    }
  };

  const recentActivity = [
    {
      id: 1,
      type: 'session',
      message: 'Completed React session with Sarah Johnson',
      xp: '+50 XP',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'match',
      message: 'New match: Mike Chen wants to exchange JavaScript',
      xp: '+25 XP',
      time: '5 hours ago',
    },
    {
      id: 3,
      type: 'achievement',
      message: 'Unlocked "Consistent Learner" badge',
      xp: '+100 XP',
      time: '1 day ago',
    },
    {
      id: 4,
      type: 'session',
      message: 'Scheduled Python session for tomorrow',
      xp: null,
      time: '1 day ago',
    },
  ];

  // Weekly Activity Chart Data
  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours Learned',
        data: [3, 5, 4, 6, 7, 5, 8],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Hours Taught',
        data: [4, 6, 3, 7, 8, 6, 9],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Skills Distribution Chart Data
  const skillsDistributionData = {
    labels: ['React', 'Python', 'JavaScript', 'UI/UX', 'CSS', 'Other'],
    datasets: [
      {
        label: 'Skills',
        data: [30, 25, 20, 15, 7, 3],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Monthly XP Progress Data
  const monthlyXPData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'XP Earned',
        data: [650, 820, 750, 1030],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
    ],
  };

  const xpProgress = (stats.currentXP / stats.nextLevelXP) * 100;
  const xpToNext = stats.nextLevelXP - stats.currentXP;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span className="text-lg">Loading your stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 relative">
      {/* 3D Background */}
      <Simple3DBackground />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with futuristic design */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-gray-950 dark:text-white mb-3 drop-shadow-sm">
                Dashboard <span className="gradient-text">⚡</span>
              </h1>
              <p className="text-xl text-gray-800 dark:text-gray-300 font-semibold">Track your skill exchange journey in real-time</p>
            </div>
            <div className="glass-dark px-8 py-6 rounded-2xl neon-border">
              <p className="text-sm text-gray-800 dark:text-gray-300 mb-2 font-bold">Current Streak</p>
              <p className="text-4xl font-black gradient-text flex items-center gap-3">
                🔥 {stats.streak}
                <span className="text-xl text-gray-800 dark:text-gray-300 font-black">days</span>
              </p>
            </div>
          </div>
        </div>

        {/* XP Progress Card with 3D glassmorphism */}
        <div className="glass-dark rounded-3xl shadow-2xl p-10 mb-12 neon-border hover-lift pulse-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-800 dark:text-gray-300 text-lg font-bold">Your Level</p>
                <h2 className="text-6xl font-black gradient-text mt-2">Level {stats.currentLevel}</h2>
              </div>
              <div className="text-right glass px-6 py-4 rounded-2xl">
                <p className="text-gray-800 dark:text-gray-300 text-sm font-bold">Total XP</p>
                <h3 className="text-4xl font-black text-gray-950 dark:text-white mt-1">{stats.currentXP.toLocaleString()}</h3>
              </div>
            </div>

            {/* XP Progress Bar with glow */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-black text-gray-950 dark:text-white">Progress to Level {stats.currentLevel + 1}</span>
                <span className="text-base font-black gradient-text">{xpToNext.toLocaleString()} XP to go</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-800/50 rounded-full h-6 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 h-6 rounded-full transition-all duration-500 glow-blue"
                    style={{ width: `${xpProgress}%`, backgroundSize: '200% 100%', animation: 'gradientShift 3s ease infinite' }}
                  >
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-white drop-shadow-lg">
                    {Math.round(xpProgress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Stats with glassmorphism */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="glass px-6 py-4 rounded-xl text-center hover-lift">
                <p className="text-4xl font-black gradient-text">{stats.totalExchanges}</p>
                <p className="text-sm text-gray-800 dark:text-gray-300 mt-2 font-bold">Total Matches</p>
              </div>
              <div className="glass px-6 py-4 rounded-xl text-center hover-lift">
                <p className="text-4xl font-black gradient-text">{stats.hoursLearned}</p>
                <p className="text-sm text-gray-800 dark:text-gray-300 mt-2 font-bold">Hours Learned</p>
              </div>
              <div className="glass px-6 py-4 rounded-xl text-center hover-lift">
                <p className="text-4xl font-black gradient-text">{stats.hoursTaught}</p>
                <p className="text-sm text-gray-800 dark:text-gray-300 mt-2 font-bold">Hours Taught</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid with 3D cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ParallaxCard intensity={8}>
            <GlowingCard glowColor="#3b82f6">
              <div className="glass-dark rounded-2xl p-8 neon-border card-3d transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800 dark:text-gray-300 text-sm font-bold">Total Exchanges</p>
                    <p className="text-5xl font-black gradient-text mt-3">{stats.totalExchanges}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center glow-blue float">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            </GlowingCard>
          </ParallaxCard>

          <ParallaxCard intensity={8}>
            <GlowingCard glowColor="#10b981">
              <div className="glass-dark rounded-2xl p-8 neon-border card-3d transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800 dark:text-gray-300 text-sm font-bold">Active Exchanges</p>
                    <p className="text-5xl font-black gradient-text mt-3">{stats.activeExchanges}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center glow-purple float" style={{animationDelay: '0.5s'}}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </GlowingCard>
          </ParallaxCard>

          <ParallaxCard intensity={8}>
            <GlowingCard glowColor="#8b5cf6">
              <div className="glass-dark rounded-2xl p-8 neon-border card-3d transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800 dark:text-gray-300 text-sm font-bold">Hours Learned</p>
                    <p className="text-5xl font-black gradient-text mt-3">{stats.hoursLearned}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center glow-purple float" style={{animationDelay: '1s'}}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>
            </GlowingCard>
          </ParallaxCard>

          <ParallaxCard intensity={8}>
            <GlowingCard glowColor="#f97316">
              <div className="glass-dark rounded-2xl p-8 neon-border card-3d transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800 dark:text-gray-300 text-sm font-bold">Hours Taught</p>
                    <p className="text-5xl font-black gradient-text mt-3">{stats.hoursTaught}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center glow-indigo float" style={{animationDelay: '1.5s'}}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </GlowingCard>
          </ParallaxCard>
        </div>

        {/* Charts Section with glassmorphism */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Weekly Activity Chart */}
          <div className="glass-dark rounded-3xl p-8 neon-border hover-lift">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 gradient-text">Weekly Activity</h2>
            <Line
              data={weeklyActivityData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#e5e7eb', font: { size: 12, weight: 'bold' } }
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.15)' },
                    ticks: { color: '#e5e7eb', font: { size: 12, weight: 'bold' } },
                    title: {
                      display: true,
                      text: 'Hours',
                      color: '#e5e7eb',
                      font: { size: 13, weight: 'bold' }
                    },
                  },
                  x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#e5e7eb', font: { size: 12, weight: 'bold' } }
                  }
                },
              }}
            />
          </div>

          {/* Skills Distribution */}
          <div className="glass-dark rounded-3xl p-8 neon-border hover-lift">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 gradient-text">Skills Distribution</h2>
            <div className="max-w-xs mx-auto">
              <Doughnut
                data={skillsDistributionData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#e5e7eb', font: { size: 12, weight: 'bold' } }
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Monthly XP Progress */}
          <CardGlass padding="lg" className="rounded-3xl hover-lift lg:col-span-2">
            <h2 className="text-2xl font-black text-gray-950 dark:text-white mb-6 gradient-text drop-shadow-sm">Monthly XP Progress</h2>
            <Bar
              data={monthlyXPData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.15)' },
                    ticks: { color: '#e5e7eb', font: { size: 12, weight: 'bold' } },
                    title: {
                      display: true,
                      text: 'XP',
                      color: '#e5e7eb',
                      font: { size: 13, weight: 'bold' }
                    },
                  },
                  x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#e5e7eb', font: { size: 12, weight: 'bold' } }
                  }
                },
              }}
            />
          </CardGlass>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Exchanges */}
          <div className="lg:col-span-2">
            <CardGlass padding="lg" className="rounded-3xl">
              <h2 className="text-2xl font-black text-gray-950 dark:text-white mb-6 gradient-text drop-shadow-sm">Active Exchanges</h2>
              <div className="space-y-4">
                {exchanges.map((exchange) => (
                  <div key={exchange.id} className="glass p-6 rounded-2xl hover-lift border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg glow-blue">
                          {exchange.partner.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-950 dark:text-white text-lg">{exchange.partner}</h3>
                          <p className="text-sm text-gray-800 dark:text-gray-300 mt-1 font-medium">
                            Teaching: <span className="gradient-text font-bold">{exchange.teaching}</span> •
                            Learning: <span className="gradient-text font-bold">{exchange.learning}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-4 py-2 glass text-green-400 rounded-xl text-sm font-bold border border-green-500/30">
                          {exchange.status}
                        </span>
                        <p className="text-sm gradient-text font-black mt-2">+{exchange.xpGained} XP</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex-1 bg-gray-800/50 rounded-full h-4 overflow-hidden border border-white/10">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 glow-blue"
                          style={{ width: `${exchange.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-base font-black text-gray-950 dark:text-white">{exchange.progress}%</span>
                    </div>

                    {/* Complete Exchange Button for Active Exchanges */}
                    {exchange.status === 'active' && exchange.progress >= 90 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => handleCompleteExchange(exchange.id)}
                          disabled={completingExchange === exchange.id}
                          className="w-full btn-neon glow-emerald disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #22c55e)' }}
                        >
                          {completingExchange === exchange.id ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                              </svg>
                              Completing...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Complete Exchange (+50 XP)
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Rate Partner Button for Completed Exchanges */}
                    {exchange.status === 'completed' && !ratedExchanges.has(exchange.id) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleOpenRatingModal(exchange)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-orange-500 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Rate {exchange.partner.split(' ')[0]}
                        </button>
                      </div>
                    )}

                    {/* Already Rated Message */}
                    {exchange.status === 'completed' && ratedExchanges.has(exchange.id) && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-bold">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Rating submitted
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardGlass>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <CardGlass padding="lg" className="rounded-3xl">
              <h2 className="text-2xl font-black text-gray-950 dark:text-white mb-6 gradient-text drop-shadow-sm">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4 p-4 glass rounded-xl hover-lift">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'session' ? 'bg-green-500 glow-purple' : 
                      activity.type === 'match' ? 'bg-blue-500 glow-blue' : 'bg-yellow-500 glow-indigo'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-950 dark:text-white font-bold flex-1">{activity.message}</p>
                        {activity.xp && (
                          <span className="text-xs font-black gradient-text whitespace-nowrap ml-2">
                            {activity.xp}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-400 mt-2 font-medium">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardGlass>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={handleCloseRatingModal}
        partnerName={ratingModal.exchange?.partner || ''}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
};

export default Dashboard;
