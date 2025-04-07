import React from 'react';
import { User, Book, Code } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 mt-12 bg-gray-900">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h1 className="text-5xl font-bold tracking-tight flex items-center justify-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-6">About Us</h1>
          <p className="text-xl text-gray-300 max-w-5xl flex items-center justify-center leading-relaxed">
            Welcome to our fitness app! Our mission is to empower individuals to achieve their fitness goals with personalized workouts, nutrition tracking, and progress monitoring.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent bottom-0 h-24"></div>
      </div>

      {/* Company Overview */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We believe in the power of consistency, and we're here to support you every step of the way on your fitness journey. Our app is designed to adapt to your specific needs and help you track your progress effectively.
          </p>
          
          <h3 className="text-2xl font-semibold mb-4 text-white">Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border border-gray-600 hover:border-indigo-500 transition-all">
              <div className="w-12 h-12 rounded-full bg-indigo-500 bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-indigo-400 text-xl font-bold">01</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Health</h4>
              <p className="text-gray-400 mt-2">Prioritizing wellbeing in every feature we design.</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border border-gray-600 hover:border-purple-500 transition-all">
              <div className="w-12 h-12 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-purple-400 text-xl font-bold">02</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Dedication</h4>
              <p className="text-gray-400 mt-2">Committed to helping you build lasting habits.</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border border-gray-600 hover:border-blue-500 transition-all">
              <div className="w-12 h-12 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-blue-400 text-xl font-bold">03</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Empowerment</h4>
              <p className="text-gray-400 mt-2">Providing tools for self-improvement and growth.</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl border border-gray-600 hover:border-teal-500 transition-all">
              <div className="w-12 h-12 rounded-full bg-teal-500 bg-opacity-20 flex items-center justify-center mb-4">
                <span className="text-teal-400 text-xl font-bold">04</span>
              </div>
              <h4 className="text-lg font-semibold text-white">Community</h4>
              <p className="text-gray-400 mt-2">Building connections that motivate and inspire.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center text-white">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl transform transition-all hover:-translate-y-2">
            <div className="h-64 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10 bottom-0"></div>
              <img src="/api/placeholder/400/320" alt="John Doe" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 relative -mt-8 z-20">
              <div className="w-16 h-16 rounded-full bg-indigo-600 border-4 border-gray-800 flex items-center justify-center mb-4">
                <User size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">John Doe</h3>
              <p className="text-indigo-400 font-medium mb-4">Certified Fitness Coach</p>
              <p className="text-gray-400">John specializes in strength training and functional fitness, with a focus on proper form and technique.</p>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl transform transition-all hover:-translate-y-2">
            <div className="h-64 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10 bottom-0"></div>
              <img src="/api/placeholder/400/320" alt="Jane Smith" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 relative -mt-8 z-20">
              <div className="w-16 h-16 rounded-full bg-purple-600 border-4 border-gray-800 flex items-center justify-center mb-4">
                <Book size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Jane Smith</h3>
              <p className="text-purple-400 font-medium mb-4">Certified Nutritionist</p>
              <p className="text-gray-400">Jane helps clients develop sustainable, healthy eating habits to fuel their bodies and minds.</p>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl transform transition-all hover:-translate-y-2">
            <div className="h-64 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10 bottom-0"></div>
              <img src="/api/placeholder/400/320" alt="Alex Johnson" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 relative -mt-8 z-20">
              <div className="w-16 h-16 rounded-full bg-blue-600 border-4 border-gray-800 flex items-center justify-center mb-4">
                <Code size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Alex Johnson</h3>
              <p className="text-blue-400 font-medium mb-4">Lead Developer</p>
              <p className="text-gray-400">Alex brings years of experience to create seamless, engaging fitness app experiences.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Section */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-white">Legal Information</h2>
          <p className="text-gray-300 mb-6">
            We value your privacy and are committed to keeping your data safe. Please review our policies to understand how we handle your information.
          </p>
          {/* <div className="flex space-x-4">
            <a 
              href="/privacy-policy" 
              className="px-6 py-3 bg-indigo-600 bg-opacity-20 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-opacity-30 transition-all font-medium"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms-of-service" 
              className="px-6 py-3 bg-purple-600 bg-opacity-20 border border-purple-500 text-purple-300 rounded-lg hover:bg-opacity-30 transition-all font-medium"
            >
              Terms of Service
            </a>
          </div> */}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
            <p className="text-gray-500">© 2025 Fitness App. All rights reserved.</p>
            <div className="flex space-x-4">
              {/* Fixed social links with proper URLs instead of "#" */}
              <a href="https://instagram.com/fitnessapp" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com/fitnessapp" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;