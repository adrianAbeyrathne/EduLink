import React from 'react';
import Nav from '../Components/Nav/Nav';

function AboutPage() {
  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">About EduLink</h1>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6 text-lg">
                EduLink is a revolutionary peer learning platform designed specifically for university students 
                who want to collaborate, share knowledge, and excel in their academic journey.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                We believe that learning is most effective when students work together. Our platform connects 
                students across different courses and year levels, fostering a collaborative environment where 
                knowledge sharing leads to academic success.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>• Study group creation and management</li>
                <li>• Course resource sharing</li>
                <li>• Live tutoring sessions</li>
                <li>• Discussion forums</li>
                <li>• Academic progress tracking</li>
                <li>• Peer-to-peer learning opportunities</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h2>
              <p className="text-gray-600">
                Whether you're looking for study partners, need help with coursework, or want to share your 
                knowledge with others, EduLink provides the tools and community you need to succeed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;