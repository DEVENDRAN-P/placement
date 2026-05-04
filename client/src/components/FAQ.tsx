import React, { useState } from 'react';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: 'General',
      question: 'What is Career Portal?',
      answer: 'Career Portal is an AI-powered placement platform that connects students with colleges and recruiters. It helps students showcase their skills, track their placement journey, and get matched with relevant job opportunities.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer: 'Click on the Register button, fill in your details, select your role (Student, College, or Recruiter), and verify your email address. Your account will be activated immediately after email verification.'
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'I forgot my password. How can I reset it?',
      answer: 'On the login page, click "Forgot Password" and enter your email. You\'ll receive a password reset link. Click the link and create a new password.'
    },
    {
      id: 4,
      category: 'Student Features',
      question: 'How do I complete my profile?',
      answer: 'Go to your Profile page and fill in your academic information, skills, projects, certifications, and coding profiles. A complete profile increases your visibility to recruiters.'
    },
    {
      id: 5,
      category: 'Student Features',
      question: 'How do I link my coding profiles?',
      answer: 'Visit the Coding Profiles page from your dashboard or profile menu. Enter your LeetCode, CodeChef, or Codeforces usernames and click "Link & Fetch Stats". Your stats will be automatically fetched and displayed.'
    },
    {
      id: 6,
      category: 'Student Features',
      question: 'What is the Placement Readiness Score?',
      answer: 'Your Placement Readiness Score reflects how complete and competitive your profile is. It considers your academic performance, skills, projects, coding proficiency, and other factors. A higher score means better placement chances.'
    },
    {
      id: 7,
      category: 'Student Features',
      question: 'How does AI Career Prediction work?',
      answer: 'Our AI analyzes your profile, skills, coding performance, and academic metrics to predict your placement probability. It considers industry trends and recruiter preferences to give you an accurate prediction.'
    },
    {
      id: 8,
      category: 'Placements',
      question: 'How do I apply for a placement?',
      answer: 'Browse the Placements section, view job details, and click "Apply". Ensure your profile is complete before applying. Recruiters will review your application and may shortlist you for interviews.'
    },
    {
      id: 9,
      category: 'Placements',
      question: 'Can I withdraw my application?',
      answer: 'Yes, you can withdraw your application anytime from the "My Applications" section. Once withdrawn, you won\'t be considered for that position.'
    },
    {
      id: 10,
      category: 'Interview Preparation',
      question: 'What interview resources are available?',
      answer: 'We offer coding patterns, interview tips, mock interviews, and preparation resources for different company types. Access them from the Interview Prep section in your dashboard.'
    },
    {
      id: 11,
      category: 'Interview Preparation',
      question: 'Can I take mock interviews?',
      answer: 'Yes! Our platform provides mock interviews for different interview types (Technical, HR, Behavioral). You can practice and receive feedback to improve your interview skills.'
    },
    {
      id: 12,
      category: 'Technical',
      question: 'What browsers are supported?',
      answer: 'Career Portal works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, use the latest version of your browser.'
    },
    {
      id: 13,
      category: 'Technical',
      question: 'Is my data secure?',
      answer: 'Yes, your data is encrypted and stored securely on our servers. We use industry-standard security practices and comply with data protection regulations.'
    },
    {
      id: 14,
      category: 'Billing & Pricing',
      question: 'Is Career Portal free?',
      answer: 'Yes, Career Portal is completely free for students. Some premium features for colleges and recruiters may be available separately.'
    },
    {
      id: 15,
      category: 'Billing & Pricing',
      question: 'Do you offer premium features?',
      answer: 'We offer standard features free for all users. Premium features for recruiters and colleges may be available. Contact our sales team for details.'
    }
  ];

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  const filteredFaqs = selectedCategory === 'All' ? faqs : faqs.filter(faq => faq.category === selectedCategory);

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-slate-900">Frequently Asked Questions</h1>
          <p className="mt-4 text-xl text-slate-600">Find answers to common questions about Career Portal</p>
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full px-8 py-6 text-left hover:bg-slate-50 transition flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-600 mb-1">{faq.category}</p>
                  <p className="text-lg font-semibold text-slate-900">{faq.question}</p>
                </div>
                <div className={`w-6 h-6 text-slate-400 flex-shrink-0 ml-4 transition ${expandedId === faq.id ? 'transform rotate-180' : ''}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </button>

              {expandedId === faq.id && (
                <div className="px-8 py-6 border-t border-slate-200 bg-slate-50">
                  <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-lg mb-8 opacity-90">Our support team is here to help you succeed!</p>
          <a
            href="/contact"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 transition"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
