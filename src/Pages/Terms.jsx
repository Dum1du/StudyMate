import React from 'react'

function Terms() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

      <p className="text-gray-600 mb-6">
        These Terms and Conditions govern your use of the StudyMate platform.
        By accessing or using StudyMate, you agree to follow these terms.
        If you do not agree with any part of these terms, please do not use
        the platform.
      </p>

      {/* 1 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Purpose of StudyMate</h2>
        <p className="text-gray-600">
          StudyMate is an academic resource-sharing platform that allows
          students to upload, share, and access study materials such as
          lecture notes, summaries, past papers, tutorials, and study guides.
          The platform is intended strictly for educational purposes.
        </p>
      </section>

      {/* 2 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. User Accounts</h2>
        <p className="text-gray-600">
          Users may be required to create an account to access certain
          features of StudyMate. You are responsible for maintaining the
          confidentiality of your account information and for all activities
          that occur under your account.
        </p>
      </section>

      {/* 3 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Uploading Content</h2>
        <p className="text-gray-600">
          Users may upload study-related materials to support collaborative
          learning. By uploading content, you confirm that you have the right
          to share the material and that it does not violate copyright laws
          or academic regulations.
        </p>
      </section>

      {/* 4 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Acceptable Use</h2>
        <p className="text-gray-600">
          Users must use StudyMate responsibly and respectfully. The platform
          must not be used for illegal, harmful, or unethical activities.
        </p>

        <ul className="list-disc ml-6 text-gray-600 mt-2">
          <li>Uploading non-academic or irrelevant content</li>
          <li>Uploading malicious files or harmful software</li>
          <li>Sharing copyrighted materials without permission</li>
          <li>Harassing or abusing other users</li>
        </ul>
      </section>

      {/* 5 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
        <p className="text-gray-600">
          All content uploaded by users remains the intellectual property
          of the original creators. StudyMate does not claim ownership of
          user-submitted materials but reserves the right to remove content
          that violates platform rules or legal regulations.
        </p>
      </section>

      {/* 6 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Content Moderation</h2>
        <p className="text-gray-600">
          StudyMate reserves the right to review, remove, or restrict access
          to any content that violates these Terms and Conditions or is
          considered inappropriate for the platform.
        </p>
      </section>

      {/* 7 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. Limitation of Liability</h2>
        <p className="text-gray-600">
          StudyMate is provided for educational purposes only. While we
          strive to maintain accurate and helpful content, we are not
          responsible for any inaccuracies or misuse of the materials
          available on the platform.
        </p>
      </section>

      {/* 8 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">8. Service Availability</h2>
        <p className="text-gray-600">
          We aim to ensure that StudyMate remains accessible and reliable.
          However, temporary interruptions may occur due to maintenance,
          technical issues, or system upgrades.
        </p>
      </section>

      {/* 9 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">9. Privacy</h2>
        <p className="text-gray-600">
          Your personal information will be handled in accordance with our
          Privacy Policy. We are committed to protecting user data and
          maintaining a secure platform environment.
        </p>
      </section>

      {/* 10 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
        <p className="text-gray-600">
          StudyMate may update these Terms and Conditions from time to time.
          Users will be notified of significant changes, and continued use
          of the platform indicates acceptance of the revised terms.
        </p>
      </section>

      {/* 11 */}
      <section>
        <h2 className="text-xl font-semibold mb-2">11. Contact Information</h2>
        <p className="text-gray-600">
          If you have any questions about these Terms and Conditions, please
          contact us through the StudyMate Contact page.
        </p>
      </section>
    </div>
  );
}

export default Terms
