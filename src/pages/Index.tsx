import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic2, Sparkles, Users, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2C0E4A] via-[#121212] to-[#1a0a2e]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Hero Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://assets-gen.codenut.dev/images/1762228357_5e31782d.png" 
            alt="Karaoke Stage"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Your Stage,
              </span>
              <br />
              <span className="text-white">Your Sound.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Step into the spotlight. Sing your heart out. Share your performances on the blockchain forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/karaoke">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg font-bold rounded-full shadow-lg shadow-primary/50"
                >
                  <Mic2 className="w-5 h-5 mr-2" />
                  Start Singing
                </Button>
              </Link>
              <Link to="/library">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 py-6 text-lg font-bold rounded-full backdrop-blur-sm"
                >
                  Browse Songs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Why SingCity?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              The future of karaoke is here. Powered by blockchain technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-8 backdrop-blur-sm hover:border-primary/40 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Blockchain Powered</h3>
              <p className="text-white/70 leading-relaxed">
                Store your performances permanently on IRYS blockchain. Your voice, your legacy, forever preserved.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-2xl p-8 backdrop-blur-sm hover:border-accent/40 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Social & Fun</h3>
              <p className="text-white/70 leading-relaxed">
                Share your performances, discover new talent, and connect with a global community of music lovers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-8 backdrop-blur-sm hover:border-primary/40 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Compete & Win</h3>
              <p className="text-white/70 leading-relaxed">
                Climb the leaderboards, earn rewards, and showcase your talent to the world. Everyone's a star here.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 rounded-3xl p-12 backdrop-blur-sm"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Ready to Shine?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of singers already making their mark on the blockchain.
            </p>
            <Link to="/karaoke">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-10 py-6 text-lg font-bold rounded-full shadow-lg shadow-primary/50"
              >
                <Mic2 className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-white/50">
          <p>&copy; 2025 SingCity. Powered by IRYS Blockchain.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
