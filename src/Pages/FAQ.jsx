import React, { useState } from "react";
import Navbar from "../NavigationBar";

const faqs = [
  {
    question: "What is StudyMate?",
    answer:
      "StudyMate is an online learning platform that helps students collaborate, share resources, and discuss academic topics together.",
  },
  {
    question: "How can I join a discussion?",
    answer:
      "Go to the 'Discussions' section, browse available study groups, and click 'Join Discussion' to participate.",
  },
  {
    question: "Can I share my notes or resources?",
    answer:
      "Yes! In the 'Upload Resources' tab, you can upload and share your study materials with others in the community.",
  },
  {
    question: "Is StudyMate free to use?",
    answer:
      "Absolutely! StudyMate is free for all students. You just need to sign up with your OUSL email to get started.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can reach us through the 'Contact Us' form in the footer or email us at support@studymate.com.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-semibold text-center mb-10 text-indigo-600">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl shadow-sm bg-white"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
              >
                <span className="font-medium text-lg">{faq.question}</span>
                <span className="text-indigo-500 text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 transition-all duration-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
