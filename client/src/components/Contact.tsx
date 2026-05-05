import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Send email via backend API
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBaseUrl}/contact/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else if (response.status === 503) {
        // Service unavailable
        setError('Our email service is temporarily offline. Your message has been received and we will respond soon.');
      } else {
        const data = await response.json();
        setError(data.message || 'Unable to send message. Please try again or email support@careerportal.com');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Network error. Please check your connection and try again, or email us at support@careerportal.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-slate-900">Get in Touch</h1>
          <p className="mt-4 text-xl text-slate-600">We'd love to hear from you. Send us a message!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Email */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Email</h3>
              <div className="space-y-2 text-slate-600 text-sm">
                <p><strong>Support:</strong> <a href="mailto:support.careerportal2026@gmail.com" className="hover:text-blue-600">support.careerportal2026@gmail.com</a></p>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Phone</h3>
              <div className="space-y-2 text-slate-600 text-sm">
                <p><a href="tel:+917418227907" className="hover:text-green-600">+91 7418227907</a></p>
              </div>
            </div>


          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-green-900 font-semibold text-sm">Message sent successfully!</p>
                    <p className="text-green-700 text-xs">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="recruitment">Recruitment Services</option>
                    <option value="college">College Registration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Please tell us how we can help..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Mini Section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Quick Answers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">How do I create an account?</h3>
              <p className="text-slate-600 text-sm">Visit the registration page and fill in your details. Select your role (Student, College, or Recruiter) and verify your email.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Is Career Portal free to use?</h3>
              <p className="text-slate-600 text-sm">Yes! Career Portal is completely free for students. Premium features may be available for colleges and recruiters.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">How do I apply for a placement?</h3>
              <p className="text-slate-600 text-sm">Browse available positions in the Placements section and click "Apply". You'll need to complete your profile first.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I update my profile?</h3>
              <p className="text-slate-600 text-sm">Yes! You can update your profile anytime from your dashboard. Changes are reflected immediately.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
