import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Introduction</h2>
            <p>
              Career Intelligence Portal ("we," "us," or "our") operates the Career Intelligence Portal website and mobile application. 
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service 
              and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            
            <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">2.1 Personal Data</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>First name and last name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Educational information</li>
              <li>Professional experience</li>
              <li>Coding platform profiles (LeetCode, CodeChef, Codeforces)</li>
              <li>Resume and portfolio links</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">2.2 Usage Data</h3>
            <p>
              We may also collect information how the Service is accessed and used ("Usage Data"). This may include information such as 
              your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that 
              you visit, the time and date of your visit, the time spent on those pages, and other diagnostic data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Use of Data</h2>
            <p>Career Intelligence Portal uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain the Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer care and support</li>
              <li>To gather analysis or valuable information so that we can improve the Service</li>
              <li>To monitor the usage of the Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Security of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of 
              electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we 
              cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Coding Platform Data</h2>
            <p>
              When you link your coding platform profiles (LeetCode, CodeChef, Codeforces), we access and store your public profile 
              information including coding statistics, ratings, and problem-solving records. This data is used to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Build your complete profile for recruiters</li>
              <li>Analyze your competitive programming skills</li>
              <li>Match you with relevant job opportunities</li>
              <li>Provide AI-powered recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: privacy@careerportal.com
            </p>
          </section>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
