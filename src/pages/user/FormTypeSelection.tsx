import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/layout/UserLayout';
import { useTheme } from '../../context/ThemeContext';

const FormTypeSelection = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const formTypes = [
    {
      id: 'ai',
      title: 'AI Form Generator',
      description: 'Describe your form and let AI build it for you',
      icon: '🤖',
      gradient: 'from-violet-600 to-fuchsia-600',
      iconBg: 'from-violet-200 to-fuchsia-200',
      action: () => navigate('/dashboard/forms/ai-generator'),
      badge: 'NEW'
    },
    {
      id: 'scratch',
      title: 'Start from scratch',
      description: 'A blank slate is all you need',
      icon: '➕',
      gradient: 'from-indigo-500 to-purple-600',
      iconBg: 'from-indigo-200 to-purple-200',
      action: () => navigate('/dashboard/forms/builder')
    },
    {
      id: 'template',
      title: 'Use template',
      description: 'Choose from 10,000+ premade forms',
      icon: '📋',
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'from-orange-200 to-red-200',
      action: () => navigate('/dashboard/forms/templates')
    },
    {
      id: 'payment',
      title: 'Payment Forms',
      description: 'Sell products, subscriptions, and collect donations',
      icon: '💰',
      gradient: 'from-slate-700 to-slate-900',
      iconBg: 'from-green-300 to-emerald-400',
      action: () => navigate('/dashboard/forms/payment')
    },
    {
      id: 'pdf',
      title: 'Smart PDF Form',
      description: 'Convert your PDF form to an online form',
      icon: '📄',
      gradient: 'from-blue-600 to-cyan-600',
      iconBg: 'from-blue-200 to-cyan-200',
      action: () => navigate('/dashboard/forms/pdf-converter')
    },
    {
      id: 'esign',
      title: 'E-sign forms',
      description: 'Collect e-signatures with online forms',
      icon: '✍️',
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'from-green-200 to-emerald-200',
      action: () => navigate('/dashboard/forms/esign')
    },
    {
      id: 'import',
      title: 'Import form',
      description: 'Convert an existing form in seconds',
      icon: '⬇️',
      gradient: 'from-sky-400 to-blue-600',
      iconBg: 'from-sky-200 to-blue-200',
      action: () => navigate('/dashboard/forms/import')
    }
  ];

  return (
    <UserLayout>
      <div className={`min-h-screen py-12 px-6 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-indigo-50'
      }`}>
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 mb-6 shadow-2xl animate-bounce-slow">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-4">
              Create a Form
            </h1>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Start collecting data with powerful forms that use conditional logic,
              <br />
              accept payments, generate reports, and automate workflows.
            </p>
          </div>

          {/* Form Type Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formTypes.map((type, index) => (
              <button
                key={type.id}
                onClick={type.action}
                className={`group relative backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 transform hover:-translate-y-2 hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-800/80 border-gray-700 hover:border-indigo-500'
                    : 'bg-white/80 border-gray-200 hover:border-indigo-400'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* NEW Badge */}
                {type.badge && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    {type.badge}
                  </div>
                )}

                {/* Gradient Background */}
                <div className={`bg-gradient-to-br ${type.gradient} p-10 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className={`relative bg-gradient-to-br ${type.iconBg} w-28 h-28 rounded-3xl flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    {type.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                  <h3 className={`text-2xl font-bold mb-3 transition-colors ${
                    isDarkMode
                      ? 'text-white group-hover:text-indigo-400'
                      : 'text-gray-900 group-hover:text-indigo-600'
                  }`}>
                    {type.title}
                  </h3>
                  <p className={`text-base leading-relaxed ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                </div>

                {/* Hover Effect Arrow */}
                <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className={`inline-flex items-center gap-4 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-lg border ${
              isDarkMode
                ? 'bg-gray-800/80 border-gray-700'
                : 'bg-white/80 border-gray-200'
            }`}>
              <svg className={`w-6 h-6 ${
                isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Need help?{' '}
                <a href="#" className={`font-semibold transition-colors ${
                  isDarkMode
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : 'text-indigo-600 hover:text-indigo-700'
                }`}>
                  Check out our getting started guide
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default FormTypeSelection;
