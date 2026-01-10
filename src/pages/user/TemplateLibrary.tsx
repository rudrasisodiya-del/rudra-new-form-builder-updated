import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/layout/UserLayout';

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  fields: string[];
  previewImage?: string;
}

const TemplateLibrary = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [layoutType, setLayoutType] = useState('Classic');

  // Helper function to get category-specific image
  const getCategoryImage = (category: string, index: number): string => {
    const imageMap: Record<string, string[]> = {
      'Registration Forms': [
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400'
      ],
      'Order Forms': [
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
        'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'
      ],
      'Event Registration Forms': [
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'
      ],
      'Payment Forms': [
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
        'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400',
        'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400'
      ],
      'Application Forms': [
        'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400'
      ],
      'Booking Forms': [
        'https://images.unsplash.com/photo-1488998427799-e3362cec87c3?w=400',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400'
      ],
      'Survey Templates': [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        'https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=400'
      ],
      'Contact Forms': [
        'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
        'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=400'
      ],
      'Consent Forms': [
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
        'https://images.unsplash.com/photo-1507537362848-9c7e70b7b5c1?w=400'
      ],
      'RSVP Forms': [
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
        'https://images.unsplash.com/photo-1519167758481-83f29da8c686?w=400',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400'
      ],
      'Appointment Forms': [
        'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400',
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400'
      ],
      'Feedback Forms': [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400'
      ]
    };

    const images = imageMap[category] || imageMap['Registration Forms'];
    return images[index % images.length];
  };

  // Generate 150+ templates
  const templates: Template[] = [
    // Registration Forms (30 templates)
    ...Array.from({ length: 30 }, (_, i) => ({
      id: `reg-${i + 1}`,
      title: i === 0 ? 'New Customer Registration Form' : `Registration Form ${i + 1}`,
      category: 'Registration Forms',
      description: 'Collect customer registration information',
      fields: ['Full Name', 'Email', 'Phone', 'Address'],
      previewImage: getCategoryImage('Registration Forms', i)
    })),

    // Order Forms (25 templates)
    ...Array.from({ length: 25 }, (_, i) => ({
      id: `order-${i + 1}`,
      title: i === 0 ? 'Product Order Form' : `Order Form ${i + 1}`,
      category: 'Order Forms',
      description: 'Complete order form with product selection',
      fields: ['Product Selection', 'Quantity', 'Shipping Address', 'Payment'],
      previewImage: getCategoryImage('Order Forms', i)
    })),

    // Event Registration (20 templates)
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `event-${i + 1}`,
      title: i === 0 ? 'Appointment Request Form' : `Event Registration ${i + 1}`,
      category: 'Event Registration Forms',
      description: 'Register attendees for events',
      fields: ['Name', 'Email', 'Event Selection', 'Number of Tickets'],
      previewImage: getCategoryImage('Event Registration Forms', i)
    })),

    // Payment Forms (15 templates)
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `payment-${i + 1}`,
      title: `Payment Form ${i + 1}`,
      category: 'Payment Forms',
      description: 'Accept payments online',
      fields: ['Billing Information', 'Card Details', 'Amount'],
      previewImage: getCategoryImage('Payment Forms', i)
    })),

    // Application Forms (15 templates)
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `app-${i + 1}`,
      title: `Application Form ${i + 1}`,
      category: 'Application Forms',
      description: 'Job or program application',
      fields: ['Personal Info', 'Qualifications', 'Resume Upload'],
      previewImage: getCategoryImage('Application Forms', i)
    })),

    // Booking Forms (12 templates)
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `booking-${i + 1}`,
      title: `Booking Form ${i + 1}`,
      category: 'Booking Forms',
      description: 'Book appointments or reservations',
      fields: ['Service Selection', 'Date & Time', 'Contact Info'],
      previewImage: getCategoryImage('Booking Forms', i)
    })),

    // Survey Templates (10 templates)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `survey-${i + 1}`,
      title: i === 0 ? 'Customer Satisfaction Survey' : `Survey Template ${i + 1}`,
      category: 'Survey Templates',
      description: 'Gather feedback and insights',
      fields: ['Rating Questions', 'Multiple Choice', 'Comments'],
      previewImage: getCategoryImage('Survey Templates', i)
    })),

    // Contact Forms (10 templates)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `contact-${i + 1}`,
      title: `Contact Form ${i + 1}`,
      category: 'Contact Forms',
      description: 'Simple contact form',
      fields: ['Name', 'Email', 'Subject', 'Message'],
      previewImage: getCategoryImage('Contact Forms', i)
    })),

    // Consent Forms (8 templates)
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `consent-${i + 1}`,
      title: `Consent Form ${i + 1}`,
      category: 'Consent Forms',
      description: 'Get consent and agreements',
      fields: ['Participant Info', 'Terms', 'Signature'],
      previewImage: getCategoryImage('Consent Forms', i)
    })),

    // RSVP Forms (5 templates)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `rsvp-${i + 1}`,
      title: `RSVP Form ${i + 1}`,
      category: 'RSVP Forms',
      description: 'Event RSVP tracking',
      fields: ['Name', 'Attending', 'Number of Guests'],
      previewImage: getCategoryImage('RSVP Forms', i)
    })),

    // Appointment Forms (5 templates)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `appointment-${i + 1}`,
      title: `Appointment Form ${i + 1}`,
      category: 'Appointment Forms',
      description: 'Schedule appointments',
      fields: ['Contact Info', 'Preferred Date', 'Service Type'],
      previewImage: getCategoryImage('Appointment Forms', i)
    })),

    // Feedback Forms (5 templates)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `feedback-${i + 1}`,
      title: `Feedback Form ${i + 1}`,
      category: 'Feedback Forms',
      description: 'Collect customer feedback',
      fields: ['Rating', 'Comments', 'Suggestions'],
      previewImage: getCategoryImage('Feedback Forms', i)
    }))
  ];

  const categories = [
    { name: 'All', count: templates.length },
    { name: 'Order Forms', count: templates.filter(t => t.category === 'Order Forms').length },
    { name: 'Registration Forms', count: templates.filter(t => t.category === 'Registration Forms').length },
    { name: 'Event Registration Forms', count: templates.filter(t => t.category === 'Event Registration Forms').length },
    { name: 'Payment Forms', count: templates.filter(t => t.category === 'Payment Forms').length },
    { name: 'Application Forms', count: templates.filter(t => t.category === 'Application Forms').length },
    { name: 'Booking Forms', count: templates.filter(t => t.category === 'Booking Forms').length },
    { name: 'Survey Templates', count: templates.filter(t => t.category === 'Survey Templates').length },
    { name: 'Contact Forms', count: templates.filter(t => t.category === 'Contact Forms').length },
    { name: 'Consent Forms', count: templates.filter(t => t.category === 'Consent Forms').length },
    { name: 'RSVP Forms', count: templates.filter(t => t.category === 'RSVP Forms').length },
    { name: 'Appointment Forms', count: templates.filter(t => t.category === 'Appointment Forms').length },
    { name: 'Feedback Forms', count: templates.filter(t => t.category === 'Feedback Forms').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (templateId: string) => {
    // Navigate to form builder with template data
    navigate(`/dashboard/forms/builder?template=${templateId}`);
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-6 py-6 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/dashboard/forms/create')}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                onClick={() => navigate('/dashboard/forms')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-2">
              Choose a template
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore 10,000+ ready-made templates to create a form in minutes or{' '}
              <button
                onClick={() => navigate('/dashboard/forms/builder')}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
              >
                create form from scratch
              </button>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar - Modern Filters */}
            <aside className="w-80 flex-shrink-0">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 sticky top-28 border border-gray-200 dark:border-gray-700">
                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white transition-all"
                  >
                    <option>Popular</option>
                    <option>Newest</option>
                    <option>Most Used</option>
                    <option>A-Z</option>
                  </select>
                </div>

                {/* Form Layout */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Form Layout</label>
                  <select
                    value={layoutType}
                    onChange={(e) => setLayoutType(e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white transition-all"
                  >
                    <option>Classic</option>
                    <option>Card</option>
                    <option>Modern</option>
                  </select>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Categories</label>
                  <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-200 ${
                          selectedCategory === category.name
                            ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedCategory === category.name
                            ? 'bg-white/20'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {category.count.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content - Templates Grid */}
            <main className="flex-1">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in all templates"
                    className="w-full pl-14 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white text-lg transition-all"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Showing <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredTemplates.length}</span> templates
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                </p>
              </div>

              {/* Templates Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Template Preview Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={template.previewImage}
                        alt={template.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-lg">
                        {template.category.split(' ')[0]}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{template.description}</p>

                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-indigo-500/30"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results - Beautiful Empty State */}
              {filteredTemplates.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 mb-6">
                    <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No templates found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Clear filters
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default TemplateLibrary;
