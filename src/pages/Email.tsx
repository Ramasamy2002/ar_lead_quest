import React, { useState, useEffect } from 'react';
import { Mail, Users, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Contact {
  _id: string;
  name: string;
  email: string;
}

function Email() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [emailStatus, setEmailStatus] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { token } = useAuth();

  // AI Generation form states
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, [token]);

  const handleEmailSelection = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === contacts.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(contacts.map(contact => contact.email));
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmails.length === 0) {
      setEmailStatus('Please select at least one recipient');
      setTimeout(() => setEmailStatus(''), 3000);
      return;
    }

    try {
      await axios.post(
        'http://localhost:3000/api/data/send-email',
        { 
          subject, 
          message,
          emails: selectedEmails // Update backend to use this field
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmailStatus('Emails sent successfully!');
      setSubject('');
      setMessage('');
      setTimeout(() => setEmailStatus(''), 3000);
    } catch (error) {
      setEmailStatus('Error sending emails');
      setTimeout(() => setEmailStatus(''), 3000);
    }
  };

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await axios.post(
        'http://localhost:3000/api/data/generate-content',
        { topic, tone, length },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.content);
      setEmailStatus('Content generated successfully!');
      setTimeout(() => setEmailStatus(''), 3000);
    } catch (error) {
      setEmailStatus('Error generating content');
      setTimeout(() => setEmailStatus(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center justify-center mb-8">
              <Mail className="h-12 w-12 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Send Email to Contacts
            </h1>

            {emailStatus && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  emailStatus.includes('Error') || emailStatus.includes('Please select')
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-green-100 text-green-700 border border-green-300'
                }`}
              >
                {emailStatus}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    {selectedEmails.length} of {contacts.length} Recipients Selected
                  </span>
                </div>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {selectedEmails.length === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center space-x-3 mb-2 hover:bg-gray-100 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      id={`contact-${contact._id}`}
                      checked={selectedEmails.includes(contact.email)}
                      onChange={() => handleEmailSelection(contact.email)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`contact-${contact._id}`}
                      className="text-sm text-gray-600 flex-grow cursor-pointer"
                    >
                      {contact.name} ({contact.email})
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Content Generation Form */}
            <div className="mb-8 p-6 border border-indigo-100 rounded-lg bg-indigo-50">
              <div className="flex items-center mb-4">
                <Wand2 className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-indigo-900">
                  Generate Email Content with AI
                </h2>
              </div>
              <form onSubmit={handleGenerateContent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter the email topic"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length
                    </label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors ${
                    isGenerating ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? 'Generating...' : 'Generate Content'}
                </button>
              </form>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email subject"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your message or generate with AI"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
              >
                Send Email
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Email;