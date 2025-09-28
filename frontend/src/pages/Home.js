// Home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import {
  UsersIcon,
  BookIcon,
  MessageSquareIcon,
  CalendarIcon,
  CpuIcon,
  ActivityIcon,
  DatabaseIcon,
  ArrowRightIcon,
} from 'lucide-react';

const Home = () => {
  // Animation effect for elements with data-aos attribute
  useEffect(() => {
    // This is a placeholder for the AOS animation library
    // In a real implementation, we would use the AOS library
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 pt-24 pb-32 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[150px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
              <div>
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Learn Together,</span>
                  <span className="block">Grow Together</span>
                </h1>
                <p className="mt-3 text-base text-indigo-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  A peer learning platform designed for university students to
                  collaborate, share knowledge, and excel in their studies.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        to="/signup"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <a
                        href="#features"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white overflow-hidden rounded-lg">
                  <img
                    className="w-full"
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                    alt="Students learning together"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to learn together
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              EduLink provides all the tools you need to collaborate effectively
              with your classmates.
            </p>
          </div>
          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <UsersIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Study Groups
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Create or join study groups with your peers to work on
                  assignments, prepare for exams, and discuss course materials.
                </p>
              </div>
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <BookIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Course Resources
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Access shared notes, past papers, and other valuable resources
                  uploaded by your peers and professors.
                </p>
              </div>
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <MessageSquareIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Discussion Forums
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Ask questions, get answers, and engage in meaningful
                  discussions about your coursework.
                </p>
              </div>
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Study Planner
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Organize your study schedule, set reminders for assignments,
                  and track your academic progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Courses */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Courses
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Popular First & Second Year Courses
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Explore courses commonly taken by first and second year students.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Course Card 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                    <CpuIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Introduction to Computer Science
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">CS101</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  Fundamentals of programming, algorithms, and computer systems.
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
                    1st Year
                  </span>
                  <Link
                    to="/courses/cs101"
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    View Resources →
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                    <ActivityIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Calculus I & II
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">MATH101/102</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  Differential and integral calculus with applications to
                  science and engineering.
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
                    1st Year
                  </span>
                  <Link
                    to="/courses/math101"
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    View Resources →
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                    <DatabaseIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Data Structures & Algorithms
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">CS201</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  Fundamental data structures and algorithm analysis techniques.
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
                    2nd Year
                  </span>
                  <Link
                    to="/courses/cs201"
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    View Resources →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View All Courses
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Testimonials
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What students are saying
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="Sarah Johnson"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Sarah Johnson
                  </h3>
                  <p className="text-indigo-600">Computer Science, 2nd Year</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "EduLink helped me find study partners for my algorithms course.
                The shared resources and discussion forums were invaluable
                during exam season!"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src="https://randomuser.me/api/portraits/men/45.jpg"
                    alt="Michael Chen"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Michael Chen
                  </h3>
                  <p className="text-indigo-600">Engineering, 1st Year</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "As a first-year student, I was struggling with calculus. The
                study group I joined through EduLink made all the difference in
                understanding the material."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src="https://randomuser.me/api/portraits/women/68.jpg"
                    alt="Priya Patel"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Priya Patel
                  </h3>
                  <p className="text-indigo-600">Mathematics, 2nd Year</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "The ability to share and access notes from previous years has
                been a game-changer for my studies. EduLink connects students in
                such a meaningful way."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-indigo-200">
              Start collaborating with your peers today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 bg-opacity-60 hover:bg-opacity-70"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
