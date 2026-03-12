import React from 'react'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

 function Contact() {

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [loading, setLoading] = useState(false);
    const sendtoFirestore = async (name, email, message) => {

        try{
          const docRef = await addDoc(collection(db, "contact"), {
      name: name,
      email: email,
      message: message,
      createdAt: serverTimestamp(),
    });

    console.log("Message stored with ID:", docRef.id);
    return true;  
        }catch(error){
            console.error("Error adding document:", error);
            return false;
        }
    }

    const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const success = await sendtoFirestore(name, email, message);

  if (success) {
    alert("Message sent successfully!");
    setName("");
    setEmail("");
    setMessage("");
  } else {
    alert("Failed to send message.");
  }
    setLoading(false);
};



  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Contact StudyMate</h1>

      <p className="mb-6 text-gray-600">
        Have a question, suggestion, or need help using StudyMate? 
        Our team is here to support you.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Your Name"
            className="w-full border p-3 rounded focus:outline-blue-500"
            required
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Your Email"
            className="w-full border p-3 rounded focus:outline-blue-500"
            required
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your Message"
            rows="5"
            className="w-full border p-3 rounded focus:outline-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-6 py-3 rounded transition duration-200`}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Contact Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Other Ways to Reach Us</h2>
          <p><strong>Email:</strong> support@studymate.com</p>
          
          <div className="text-gray-700">
            <p className="font-semibold">Student & Academic Support</p>
            <p className="text-sm">Reach out for technical issues, account problems, or questions regarding study materials and resources.</p>
          </div>

          <p className="text-gray-500 italic text-sm">
            Our team usually responds within 24–48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact
