import React from 'react';
import Nav from '../Components/Nav/Nav';

const steps = [
  { title: 'Complete Your Profile', description: 'Add your personal details and preferences.' },
  { title: 'Explore Features', description: 'Take a quick tour of EduLink’s best tools.' },
  { title: 'Connect With Others', description: 'Find peers, join groups, and start collaborating.' },
  { title: 'Set Your Learning Goals', description: 'Define what you want to achieve and track your progress.' },
];

const OnboardingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-2xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8 text-indigo-700">Welcome to EduLink!</h1>
        <ul className="space-y-6">
          {steps.map((step, idx) => (
            <li key={idx} className="bg-white rounded-xl shadow p-6 flex items-start gap-4">
              <span className="text-indigo-600 font-bold text-2xl">{idx + 1}</span>
              <div>
                <h2 className="text-xl font-semibold mb-1">{step.title}</h2>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <a href="/dashboard" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
