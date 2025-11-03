import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { 
  FadeInView, 
  ScrollReveal, 
  StaggerChildren, 
  StaggerItem, 
  HoverScale, 
  HoverLift,
  MagneticButton,
  GlowingCard,
  ParallaxCard,
  Simple3DBackground
} from '../../components/animations';
import ButtonNeon from '../../components/ui/ButtonNeon';
import CardGlass from '../../components/ui/CardGlass';
import SplineBackground from '../../components/3d/SplineBackground';

const Landing = () => {
  return (
    <div className="min-h-screen relative">
      {/* Spline 3D Background with Blur Overlay */}
      <SplineBackground sceneUrl="https://my.spline.design/xyz" />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center space-y-8">
            {/* Animated Badge */}
            <FadeInView delay={0.2}>
              <div className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full border-2 border-blue-500/30 pulse-glow">
                <span className="gradient-text font-bold text-base">✨ Welcome to the Future of Learning</span>
              </div>
            </FadeInView>

            {/* Heading with 3D effect */}
            <FadeInView delay={0.4}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
                <span className="block text-gray-900 dark:text-white drop-shadow-lg">Exchange Skills,</span>
                <span className="block gradient-text mt-3 float">Grow Together</span>
              </h1>
            </FadeInView>

            {/* Subheading with glass effect */}
            <FadeInView delay={0.6}>
              <div className="max-w-3xl mx-auto glass-dark rounded-2xl p-6 neon-border">
                <p className="text-xl sm:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed">
                  Connect with people who want to learn what you know and teach what they master.
                  <span className="block mt-3 text-2xl font-bold gradient-text">No money, just skills.</span>
                </p>
              </div>
            </FadeInView>

            {/* CTA Buttons with neon glow */}
            <FadeInView delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                <MagneticButton strength={0.4}>
                  <ButtonNeon to={ROUTES.LOGIN} size="lg" color="blue" className="w-full sm:w-auto glow-indigo shadow-pulse">
                    Get Started Free →
                  </ButtonNeon>
                </MagneticButton>
                <MagneticButton strength={0.4}>
                  <ButtonNeon to={ROUTES.EXPLORE} size="lg" variant="outline" className="w-full sm:w-auto glow-purple">
                    Explore Skills ✨
                  </ButtonNeon>
                </MagneticButton>
              </div>
            </FadeInView>

            {/* Trust Indicators with glass cards */}
            <StaggerChildren staggerDelay={0.15} className="flex flex-wrap justify-center items-center gap-6 pt-12">
              <StaggerItem>
                <HoverLift>
                  <CardGlass padding="md" className="rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👥</span>
                      <div className="text-left">
                        <div className="text-2xl font-bold gradient-text">1,000+</div>
                        <div className="text-sm text-gray-800 dark:text-gray-400 font-semibold">Active Users</div>
                      </div>
                    </div>
                  </CardGlass>
                </HoverLift>
              </StaggerItem>
              <StaggerItem>
                <HoverLift>
                  <CardGlass padding="md" className="rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎓</span>
                      <div className="text-left">
                        <div className="text-2xl font-bold gradient-text">500+</div>
                        <div className="text-sm text-gray-800 dark:text-gray-400 font-semibold">Skills Exchanged</div>
                      </div>
                    </div>
                  </CardGlass>
                </HoverLift>
              </StaggerItem>
              <StaggerItem>
                <HoverLift>
                  <CardGlass padding="md" className="rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">⭐</span>
                      <div className="text-left">
                        <div className="text-2xl font-bold gradient-text">4.9/5</div>
                        <div className="text-sm text-gray-800 dark:text-gray-400 font-semibold">Rating</div>
                      </div>
                    </div>
                  </CardGlass>
                </HoverLift>
              </StaggerItem>
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                How It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                Three simple steps to start your futuristic learning journey
              </p>
            </div>
          </ScrollReveal>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <ScrollReveal delay={0.1}>
              <ParallaxCard intensity={10}>
                <GlowingCard glowColor="#3b82f6">
                  <div className="glass-dark p-8 rounded-3xl neon-border group card-3d">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-5xl mb-6 glow-blue float">
                      🎯
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">Find Your Match</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Discover people with complementary skills and interests. Our AI-powered matching system connects you with the perfect learning partners.
                    </p>
                  </div>
                </GlowingCard>
              </ParallaxCard>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal delay={0.2}>
              <ParallaxCard intensity={10}>
                <GlowingCard glowColor="#8b5cf6">
                  <div className="glass-dark p-8 rounded-3xl neon-border group card-3d">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl mb-6 glow-purple float" style={{animationDelay: '0.5s'}}>
                      💬
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">Connect & Learn</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Chat in real-time, schedule sessions, and exchange knowledge seamlessly. Built-in video calls and screen sharing make learning effortless.
                    </p>
                  </div>
                </GlowingCard>
              </ParallaxCard>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal delay={0.3}>
              <ParallaxCard intensity={10}>
                <GlowingCard glowColor="#6366f1">
                  <div className="glass-dark p-8 rounded-3xl neon-border group card-3d">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-5xl mb-6 glow-indigo float" style={{animationDelay: '1s'}}>
                      🚀
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">Level Up Together</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Track your progress, earn XP badges, and build your reputation. Gamified learning makes skill exchange fun and rewarding.
                    </p>
                  </div>
                </GlowingCard>
              </ParallaxCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Feature highlights */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
                Why Choose <span className="gradient-text">SkillSwap</span>?
              </h2>
              
              <div className="space-y-6">
                <div className="glass-dark p-6 rounded-2xl hover-lift border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <span className="text-2xl">🎨</span> Diverse Skills
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">From coding to cooking, photography to philosophy - exchange any skill imaginable.</p>
                </div>
                
                <div className="glass-dark p-6 rounded-2xl hover-lift border-l-4 border-purple-500">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <span className="text-2xl">🔒</span> Safe & Secure
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">Verified profiles, encrypted chats, and community-driven safety guidelines.</p>
                </div>
                
                <div className="glass-dark p-6 rounded-2xl hover-lift border-l-4 border-indigo-500">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <span className="text-2xl">🌍</span> Global Community
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">Connect with learners and teachers from around the world, anytime.</p>
                </div>
              </div>
            </div>

            {/* Right: Stats showcase */}
            <div className="glass-dark p-10 rounded-3xl neon-border">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl">
                  <div className="text-5xl font-black gradient-text mb-2">1000+</div>
                  <div className="text-gray-700 dark:text-gray-300 font-semibold">Active Users</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-transparent rounded-2xl">
                  <div className="text-5xl font-black gradient-text mb-2">500+</div>
                  <div className="text-gray-700 dark:text-gray-300 font-semibold">Skills Listed</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-2xl">
                  <div className="text-5xl font-black gradient-text mb-2">2000+</div>
                  <div className="text-gray-700 dark:text-gray-300 font-semibold">Exchanges</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-pink-500/20 to-transparent rounded-2xl">
                  <div className="text-5xl font-black gradient-text mb-2">4.9</div>
                  <div className="text-gray-700 dark:text-gray-300 font-semibold">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass-dark p-12 md:p-16 rounded-3xl neon-border text-center pulse-glow">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Ready to Start Your <span className="gradient-text">Learning Journey</span>?
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of learners exchanging skills in the most futuristic learning marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to={ROUTES.LOGIN}
                className="px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl hover-lift glow-blue"
              >
                Join Now - It's Free! 🚀
              </Link>
              <Link
                to={ROUTES.EXPLORE}
                className="px-12 py-6 glass text-white text-xl font-bold rounded-2xl hover-lift border-2 border-purple-500/50"
              >
                Browse Skills
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
