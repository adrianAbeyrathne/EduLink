// Help.jsx
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import {
  SearchIcon,
  BookOpenIcon,
  MessageCircleIcon,
  FileTextIcon,
  HelpCircleIcon,
} from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: <BookOpenIcon className="h-6 w-6" />,
      articles: [
        { id: 1, title: 'How to create an account', views: 1243 },
        { id: 2, title: 'Setting up your profile', views: 982 },
        { id: 3, title: 'Navigating the dashboard', views: 1576 },
      ],
    },
    {
      id: 'sessions',
      name: 'Sessions',
      icon: <MessageCircleIcon className="h-6 w-6" />,
      articles: [
        { id: 4, title: 'Joining a study session', views: 834 },
        { id: 5, title: 'Creating a new session', views: 621 },
        { id: 6, title: 'Session etiquette guidelines', views: 412 },
      ],
    },
    {
      id: 'resources',
      name: 'Resources',
      icon: <FileTextIcon className="h-6 w-6" />,
      articles: [
        { id: 7, title: 'Uploading study materials', views: 723 },
        { id: 8, title: 'Finding course resources', views: 891 },
        { id: 9, title: 'Sharing notes with peers', views: 567 },
      ],
    },
    {
      id: 'faqs',
      name: 'FAQs',
      icon: <HelpCircleIcon className="h-6 w-6" />,
      articles: [
        { id: 10, title: 'Account verification process', views: 432 },
        { id: 11, title: 'Password reset instructions', views: 1243 },
        { id: 12, title: 'Contact support team', views: 321 },
      ],
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How can we help you?
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Search our knowledge base or browse categories below
            </p>
            <div className="mt-8 max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="sm:flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search for articles, tutorials, and FAQs..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <button
                    type="submit"
                    className="block w-full py-3 px-4 rounded-md shadow bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Browse Help Categories
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                        {category.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {category.articles.length} articles
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      {category.articles.map((article) => (
                        <a
                          key={article.id}
                          href={`#article-${article.id}`}
                          className="block hover:bg-gray-50 p-2 -mx-2 rounded"
                        >
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-indigo-600">
                              {article.title}
                            </p>
                            <span className="text-xs text-gray-500">
                              {article.views} views
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                    <div className="mt-6">
                      <a
                        href={`#category-${category.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View all articles →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 bg-indigo-50 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white sm:h-16 sm:w-16">
                  <MessageCircleIcon className="h-8 w-8" />
                </div>
                <div className="ml-4 text-center sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Can't find what you're looking for?
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Our support team is here to help. Contact us directly.
                  </p>
                </div>
              </div>
              <div className="mt-6 sm:flex sm:items-center sm:justify-center">
                <div className="mt-4 sm:mt-0 sm:ml-3">
                  <a
                    href="#contact-support"
                    className="block w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Help;
