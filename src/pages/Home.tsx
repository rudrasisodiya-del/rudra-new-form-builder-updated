import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

const Home = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Easy Form Builder',
      description: 'Drag-and-drop interface to create forms in minutes',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Powerful Features',
      description: 'Webhooks, API keys, integrations, and more',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Advanced Analytics',
      description: 'Track submissions, views, and conversion rates',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Enterprise Security',
      description: 'Bank-level encryption and data protection',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      title: 'Cloud Storage',
      description: 'Secure cloud storage with automatic backups',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Team Collaboration',
      description: 'Work together with real-time collaboration',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      content: 'This form builder has transformed how we collect customer data. The analytics features are outstanding!',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      company: 'StartupXYZ',
      content: 'Integration with our existing tools was seamless. Best decision we made this year.',
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Lead',
      company: 'Global Services',
      content: 'The automation capabilities saved us countless hours. Highly recommended for any business.',
      avatar: 'ER'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'
    }`}>
      {/* Navbar */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isDarkMode
            ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 shadow-lg'
            : 'bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Pabbly Logo */}
              <img
                src="/pabbly-logo.png"
                alt="Pabbly Logo"
                className="w-10 h-10 rounded-lg"
              />
              <h1 className={`text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent`}>
                Pabbly Forms
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <Link
                to="/login"
                className={`font-medium transition-colors duration-300 ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-cyan-400'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="relative px-6 py-2 rounded-lg font-semibold text-white overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 group-hover:from-indigo-700 group-hover:to-cyan-600 transition-all duration-300"></span>
                <span className="relative">Sign Up Free</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 mb-8 animate-bounce-slow">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Now with AI-powered form generation
              </span>
            </div>

            <h1 className={`text-5xl md:text-7xl font-bold mb-6 animate-slide-up ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Powerful Form Builder
              </span>
              <br />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Made Simple
              </span>
            </h1>

            <p className={`text-xl md:text-2xl mb-10 max-w-3xl mx-auto animate-slide-up ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`} style={{ animationDelay: '0.1s' }}>
              Create beautiful forms, collect data, and automate your workflows with the most intuitive form builder on the market
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/signup"
                className="relative px-8 py-4 rounded-xl font-semibold text-lg text-white overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 group-hover:from-indigo-700 group-hover:to-cyan-600 transition-all duration-300"></span>
                <span className="relative flex items-center gap-2">
                  Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/pricing"
                className={`px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  isDarkMode
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-indigo-500'
                    : 'border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-indigo-600'
                }`}
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Everything you need to succeed
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Powerful features to help you build, manage, and grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer ${
                  isDarkMode
                    ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-lg hover:shadow-2xl'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-white transform group-hover:rotate-6 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Loved by thousands of users
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl transition-all duration-500 hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-lg hover:shadow-2xl'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.name}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  "{testimonial.content}"
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to get started?
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join thousands of businesses using our form builder to collect data and grow
          </p>
          <Link
            to="/signup"
            className="inline-block relative px-8 py-4 rounded-xl font-semibold text-lg text-white overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 group-hover:from-indigo-700 group-hover:to-cyan-600 transition-all duration-300"></span>
            <span className="relative flex items-center gap-2">
              Start Building for Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${
        isDarkMode
          ? 'bg-gray-900 border-gray-800'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-4">
                Pabbly Forms
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                The most powerful and easy-to-use form builder for modern teams.
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Product
              </h4>
              <ul className="space-y-2">
                <li><Link to="/pricing" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Pricing</Link></li>
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Features</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Company
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>About</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Blog</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Support
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Help Center</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Contact</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Status</a></li>
              </ul>
            </div>
          </div>
          <div className={`pt-8 border-t text-center text-sm ${
            isDarkMode
              ? 'border-gray-800 text-gray-400'
              : 'border-gray-200 text-gray-600'
          }`}>
            <p>&copy; 2026 Pabbly Forms. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
