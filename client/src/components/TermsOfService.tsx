import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing and using the Career Intelligence Portal website and mobile application (the "Service"), you accept and agree 
              to be bound by and comply with these Terms and Conditions. If you do not agree to abide by the above, please do not use 
              this Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Career Intelligence 
              Portal for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and 
              under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on Service</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Disclaimer</h2>
            <p>
              The materials on Career Intelligence Portal are provided on an 'as is' basis. Career Intelligence Portal makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties 
              or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other 
              violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Limitations</h2>
            <p>
              In no event shall Career Intelligence Portal or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the 
              materials on Career Intelligence Portal, even if Career Intelligence Portal or an authorized representative has been 
              notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Career Intelligence Portal could include technical, typographical, or photographic errors. 
              Career Intelligence Portal does not warrant that any of the materials on its website are accurate, complete, or current. 
              Career Intelligence Portal may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Links</h2>
            <p>
              Career Intelligence Portal has not reviewed all of the sites linked to its website and is not responsible for the contents 
              of any such linked site. The inclusion of any link does not imply endorsement by Career Intelligence Portal of the site. Use 
              of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Modifications</h2>
            <p>
              Career Intelligence Portal may revise these Terms and Conditions for its website at any time without notice. By using this 
              website you are agreeing to be bound by the then current version of these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">8. Governing Law</h2>
            <p>
              These Terms and Conditions and any separate agreements we may enter into to further clarify your use of the Service are 
              governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction 
              of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">9. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintain the confidentiality of your account information</li>
              <li>Provide accurate and complete information during registration</li>
              <li>Not engage in fraudulent or illegal activities</li>
              <li>Not harass or abuse other users</li>
              <li>Not post illegal, threatening, defamatory, or misleading content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at: terms@careerportal.com
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

export default TermsOfService;
