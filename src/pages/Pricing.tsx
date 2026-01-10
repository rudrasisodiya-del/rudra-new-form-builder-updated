import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const Pricing = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const isAuthenticated = !!localStorage.getItem('token');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 Forms',
        '100 Submissions/month',
        'Basic form fields',
        'Email notifications',
        'CSV export',
        'Community support'
      ],
      cta: 'Get Started',
      highlighted: false,
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Pro',
      monthlyPrice: 29,
      yearlyPrice: 23,
      period: 'per month',
      description: 'For growing businesses',
      features: [
        'Unlimited Forms',
        '10,000 Submissions/month',
        'All form field types',
        'Webhooks & API',
        'Custom branding',
        'File uploads (100MB)',
        'Advanced analytics',
        'Integrations (Google, Slack, etc.)',
        'Priority email support',
        'Remove Pabbly branding'
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      color: 'from-indigo-600 to-cyan-500'
    },
    {
      name: 'Business',
      monthlyPrice: 99,
      yearlyPrice: 79,
      period: 'per month',
      description: 'For large organizations',
      features: [
        'Unlimited Forms',
        '100,000 Submissions/month',
        'Everything in Pro',
        'File uploads (1GB)',
        'Advanced workflows',
        'Custom domain',
        'SSO authentication',
        'Dedicated account manager',
        'SLA guarantee',
        'Phone support',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      highlighted: false,
      color: 'from-purple-600 to-pink-600'
    }
  ];

  const handleSelectPlan = (planName: string) => {
    if (!isAuthenticated) {
      navigate('/signup');
    } else if (planName === 'Business') {
      window.location.href = 'mailto:sales@pabbly.com?subject=Business Plan Inquiry';
    } else {
      alert(`Upgrading to ${planName} plan. Payment integration coming soon!`);
    }
  };

  const comparisonFeatures = [
    { name: 'Forms', free: '5', pro: 'Unlimited', business: 'Unlimited' },
    { name: 'Monthly Submissions', free: '100', pro: '10,000', business: '100,000' },
    { name: 'Form Fields', free: 'Basic', pro: 'All Types', business: 'All Types' },
    { name: 'Webhooks & API', free: false, pro: true, business: true },
    { name: 'Custom Branding', free: false, pro: true, business: true },
    { name: 'File Upload Size', free: '10MB', pro: '100MB', business: '1GB' },
    { name: 'Advanced Analytics', free: false, pro: true, business: true },
    { name: 'Integrations', free: false, pro: true, business: true },
    { name: 'Custom Domain', free: false, pro: false, business: true },
    { name: 'SSO Authentication', free: false, pro: false, business: true },
    { name: 'Dedicated Support', free: false, pro: 'Email', business: 'Phone & Email' },
    { name: 'SLA Guarantee', free: false, pro: false, business: true }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 px-6 py-4 backdrop-blur-lg transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-900/95 border-b border-gray-800'
          : 'bg-white/95 border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* Pabbly Logo */}
            <img
              src="/pabbly-logo.png"
              alt="Pabbly Logo"
              className="w-10 h-10 rounded-lg"
            />
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Pabbly Forms
            </div>
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
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className={`font-semibold transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-300 hover:text-cyan-400'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="relative px-6 py-2 rounded-lg font-semibold text-white overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 group-hover:from-indigo-700 group-hover:to-cyan-600 transition-all duration-300"></span>
                  <span className="relative">Sign Up</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="relative px-6 py-2 rounded-lg font-semibold text-white overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 group-hover:from-indigo-700 group-hover:to-cyan-600 transition-all duration-300"></span>
                <span className="relative">Go to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 mb-8">
          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            14-day free trial on all paid plans
          </span>
        </div>

        <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Simple, Transparent Pricing
        </h1>
        <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Choose the perfect plan for your needs. No hidden fees, no surprises.
        </p>

        {/* Billing Toggle */}
        <div className={`inline-flex items-center gap-4 p-1.5 rounded-xl transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 relative ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const displayPrice = plan.name === 'Free' ? '$0' : `$${price}`;

            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                  plan.highlighted
                    ? 'md:scale-105'
                    : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Border */}
                {plan.highlighted && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-20 blur-xl`}></div>
                )}
                <div className={`relative h-full ${
                  plan.highlighted
                    ? `bg-gradient-to-br ${plan.color} p-[2px]`
                    : isDarkMode
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                } rounded-3xl`}>
                  <div className={`h-full rounded-3xl ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                  } p-8`}>
                    {/* Popular Badge */}
                    {plan.highlighted && (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${plan.color} text-white text-sm font-semibold mb-6 shadow-lg`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        MOST POPULAR
                      </div>
                    )}

                    <h3 className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {plan.name}
                    </h3>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {plan.description}
                    </p>

                    <div className="my-8">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-6xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                          {displayPrice}
                        </span>
                        {plan.name !== 'Free' && (
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            /{billingCycle === 'monthly' ? 'month' : 'month'}
                          </span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && plan.name !== 'Free' && (
                        <p className="text-sm text-green-600 mt-2">
                          Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan.name)}
                      className={`w-full py-4 rounded-xl font-semibold mb-8 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                        plan.highlighted
                          ? `bg-gradient-to-r ${plan.color} text-white`
                          : isDarkMode
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {plan.cta}
                    </button>

                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <svg
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              plan.highlighted
                                ? 'text-cyan-500'
                                : 'text-green-500'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className={`text-4xl font-bold text-center mb-12 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Compare Plans
        </h2>
        <div className={`rounded-3xl overflow-hidden ${
          isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200 shadow-xl'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Features
                  </th>
                  <th className={`px-6 py-4 text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Free
                  </th>
                  <th className={`px-6 py-4 text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Pro
                  </th>
                  <th className={`px-6 py-4 text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Business
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <td className={`px-6 py-4 font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )
                      ) : (
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {feature.free}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? (
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )
                      ) : (
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {feature.pro}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.business === 'boolean' ? (
                        feature.business ? (
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )
                      ) : (
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {feature.business}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className={`text-4xl font-bold text-center mb-12 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              question: 'Can I change plans later?',
              answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.'
            },
            {
              question: 'What happens if I exceed my submission limit?',
              answer: 'Your forms will continue to work, but you\'ll be charged $10 per additional 1,000 submissions. We\'ll notify you before any overage charges.'
            },
            {
              question: 'Do you offer refunds?',
              answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.'
            },
            {
              question: 'Is there a free trial for paid plans?',
              answer: 'Yes, Pro and Business plans come with a 14-day free trial. No credit card required to start.'
            }
          ].map((faq, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl transition-all duration-300 hover:scale-102 ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700 hover:border-indigo-500'
                  : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-indigo-300'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {faq.question}
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Get Started?
          </h2>
          <p className={`text-xl mb-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join thousands of businesses using Pabbly Forms to collect data and grow their business.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="relative px-8 py-4 rounded-xl font-semibold text-lg text-white overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 group-hover:from-indigo-700 group-hover:to-cyan-600 transition-all duration-300"></span>
            <span className="relative flex items-center gap-2">
              Start Free Trial
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${
        isDarkMode
          ? 'bg-gray-900 border-gray-800'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* Pabbly Logo */}
                <img
                  src="/pabbly-logo.png"
                  alt="Pabbly Logo"
                  className="w-8 h-8 rounded-lg"
                />
                <h3 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Pabbly Forms
                </h3>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                The most powerful and easy-to-use form builder for modern teams.
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Product
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-indigo-600'}`}>Pricing</a></li>
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
    </div>
  );
};

export default Pricing;
