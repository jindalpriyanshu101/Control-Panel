'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Server, Shield, Zap, Globe, Users, Database, Star, Award, Clock, HeadphonesIcon } from 'lucide-react'
import { useState } from 'react'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="relative z-50 px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ElementiX Hosting
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#support" className="text-gray-300 hover:text-white transition-colors duration-200">Support</a>
            <Link 
              href="/auth/signin" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className={`w-full h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
              <div className={`w-full h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-full h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
            </div>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 bg-opacity-95 backdrop-blur-lg border-t border-gray-700">
            <div className="flex flex-col space-y-4 p-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-200">Pricing</a>
              <a href="#support" className="text-gray-300 hover:text-white transition-colors duration-200">Support</a>
              <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors duration-200">Sign In</Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl text-center">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-full px-6 py-2 mb-8">
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">Trusted by 10,000+ Developers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Next-Generation
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Cloud Hosting
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience lightning-fast web hosting powered by cutting-edge technology. 
              Deploy, scale, and manage your applications with ElementiX's enterprise-grade infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/auth/signup" 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-xl"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#features" 
                className="border border-cyan-500/50 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-200 backdrop-blur-sm"
              >
                Explore Features
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {[
                { number: "99.9%", label: "Uptime" },
                { number: "50ms", label: "Response Time" },
                { number: "24/7", label: "Support" },
                { number: "30+", label: "Data Centers" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl animate-pulse delay-150"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features for Modern Applications
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to build, deploy, and scale your applications with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Performance",
                description: "SSD storage, CDN integration, and optimized servers for maximum speed.",
                gradient: "from-yellow-400 to-orange-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Security",
                description: "Advanced DDoS protection, SSL certificates, and security monitoring.",
                gradient: "from-green-400 to-emerald-500"
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Global Infrastructure",
                description: "30+ data centers worldwide for optimal performance everywhere.",
                gradient: "from-blue-400 to-cyan-500"
              },
              {
                icon: <Database className="w-8 h-8" />,
                title: "Database Management",
                description: "One-click MySQL, PostgreSQL, and MongoDB deployment.",
                gradient: "from-purple-400 to-pink-500"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Team Collaboration",
                description: "Multi-user access with role-based permissions and project sharing.",
                gradient: "from-cyan-400 to-blue-500"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Instant Deployment",
                description: "Deploy your applications in seconds with our automated pipeline.",
                gradient: "from-indigo-400 to-purple-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect plan for your needs. All plans include our core features with 30-day money-back guarantee.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$9.99",
                description: "Perfect for personal projects and small websites",
                features: [
                  "1 Website",
                  "10GB SSD Storage",
                  "100GB Bandwidth",
                  "Free SSL Certificate",
                  "24/7 Email Support",
                  "1-Click WordPress Install"
                ],
                gradient: "from-cyan-500 to-blue-600",
                popular: false
              },
              {
                name: "Professional",
                price: "$24.99",
                description: "Ideal for growing businesses and developers",
                features: [
                  "10 Websites",
                  "100GB SSD Storage",
                  "Unlimited Bandwidth",
                  "Free SSL Certificates",
                  "Priority Support",
                  "Database Management",
                  "Advanced Analytics",
                  "Team Collaboration"
                ],
                gradient: "from-purple-500 to-pink-600",
                popular: true
              },
              {
                name: "Enterprise",
                price: "$99.99",
                description: "For large-scale applications and enterprises",
                features: [
                  "Unlimited Websites",
                  "1TB SSD Storage",
                  "Unlimited Bandwidth",
                  "Advanced Security Suite",
                  "24/7 Phone Support",
                  "Full API Access",
                  "Custom Integrations",
                  "Dedicated Account Manager"
                ],
                gradient: "from-orange-500 to-red-600",
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border ${plan.popular ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20' : 'border-slate-700/50'} hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  <p className="text-gray-300">{plan.description}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/auth/signup" 
                  className={`w-full bg-gradient-to-r ${plan.gradient} text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 text-center block transform hover:scale-105 shadow-lg`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-20 px-6 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-full px-6 py-2 mb-8">
            <HeadphonesIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">24/7 Expert Support</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            We're Here to Help You Succeed
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Our team of hosting experts is available around the clock to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@elementix.com" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
              Contact Support
            </a>
            <a href="#" className="border border-cyan-500/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-cyan-500/10 transition-all duration-200">
              Knowledge Base
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Launch Your Project?
          </h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and businesses who trust ElementiX Hosting for their mission-critical applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center justify-center space-x-2 shadow-xl"
            >
              <span>Start Your Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#pricing" 
              className="border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-colors duration-200"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ElementiX Hosting
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering developers and businesses with next-generation cloud hosting solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">GitHub</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Discord</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Web Hosting</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Cloud Servers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Database Hosting</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">CDN</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Status Page</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2024 ElementiX Hosting. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
