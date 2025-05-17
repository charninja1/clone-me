import { useState, useEffect } from 'react';
import { Button, Card, ThemeToggle } from '../components';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import InteractivePlayground from '../components/InteractivePlayground';
import FAQSection from '../components/FAQSection';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication and redirect to dashboard if logged in
  useEffect(() => {
    // Skip auth check if Firebase is not available
    if (!auth) {
      setIsLoading(false);
      return;
    }
    
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          router.push('/dashboard');
        }
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Auth error:', error);
      setIsLoading(false);
    }
  }, [router]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-surface-600">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: '🎯',
      title: 'Perfect Voice Match',
      description: 'AI that learns your unique writing style and personality',
    },
    {
      icon: '🕵️',
      title: 'Undetectable as AI',
      description: 'Emails so human-like, they pass all AI detection tests',
    },
    {
      icon: '⚡',
      title: 'Instant Generation',
      description: 'Create professional emails in seconds, not minutes',
    },
    {
      icon: '🔄',
      title: 'Continuous Learning',
      description: 'Improves with every email through your feedback',
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Your data stays secure and never shared',
    },
    {
      icon: '✨',
      title: 'Multiple Voices',
      description: 'Create different voices for work, school, and personal',
    },
    {
      icon: '📈',
      title: 'Save Hours Weekly',
      description: 'Reduce email writing time by 80% or more',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechCorp',
      content: 'CloneMe saves me 5+ hours every week. My emails sound exactly like me, but better.',
      avatar: '👩‍💼',
    },
    {
      name: 'Michael Davis',
      role: 'Sales Manager',
      company: 'Growth Inc',
      content: 'Game changer for client communication. I can respond professionally in seconds.',
      avatar: '👨‍💼',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student',
      company: 'Stanford University',
      content: 'Perfect for academic emails. It captures my voice while being appropriately formal.',
      avatar: '👩‍🎓',
    },
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      features: [
        '50 emails per month',
        '2 voice profiles',
        'Basic email templates',
        'Email history',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      features: [
        'Unlimited emails',
        '10 voice profiles',
        'Advanced AI training',
        'Priority support',
        'Team collaboration',
        'API access',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Unlimited everything',
        'Custom AI training',
        'SSO & security',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Header */}
      <header className="bg-white dark:bg-surface-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">CloneMe</span>
              <span className="text-sm text-surface-600 dark:text-surface-400">for Emails</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">Features</a>
              <a href="#how-it-works" className="text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">How it Works</a>
              <a href="#playground" className="text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">Try Demo</a>
              <a href="#pricing" className="text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">Pricing</a>
              <a href="#testimonials" className="text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-colors duration-200 hover:scale-105 transform">Testimonials</a>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle className="text-surface-600 dark:text-surface-400" />
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button variant="primary" onClick={() => router.push('/dashboard')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 text-center bg-gradient-to-b from-white to-surface-50 dark:from-surface-800 dark:to-surface-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-surface-900 dark:text-surface-100 animate-fadeInUp">
            Write Emails That Sound
            <span className="gradient-text-secondary"> Exactly Like You</span>
          </h1>
          <p className="text-xl text-surface-600 dark:text-surface-400 mb-8 max-w-2xl mx-auto animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            CloneMe learns your unique writing style and generates perfect emails in seconds. 
            Save hours every week while maintaining your authentic voice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-2 focus:ring-primary-500 transition-all hover:shadow-md hover:border-primary-400 focus:outline-none"
            />
            <Button 
              size="lg" 
              className="shadow-lg hover-lift bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg shadow-primary-500/30"
              onClick={() => router.push('/dashboard')}
            >
              Start Free Trial
            </Button>
          </div>
          <p className="text-sm text-surface-500">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-surface-900 dark:text-white">Why Choose CloneMe?</h2>
            <p className="text-lg text-surface-600 dark:text-surface-400">
              The most advanced AI email writer that actually sounds like you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-lift animate-fadeInUp bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-500 transition-all" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-4xl mb-4 animate-bounceIn w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto hover:scale-110 transition-transform" style={{animationDelay: `${index * 0.1 + 0.3}s`}}>{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-surface-900 dark:text-white">{feature.title}</h3>
                <p className="text-surface-600 dark:text-surface-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-surface-100 dark:bg-surface-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fadeInDown">
            <h2 className="text-3xl font-bold mb-4 text-surface-900 dark:text-white">How It Works</h2>
            <p className="text-lg text-surface-600 dark:text-surface-400">
              Get started in minutes and see results immediately
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-slideInLeft">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary-300 dark:border-primary-700" style={{animationDelay: '0.2s'}}>
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Voice</h3>
              <p className="text-surface-600 dark:text-surface-400">
                Upload sample emails or write a few examples to train your AI voice
              </p>
            </div>
            <div className="text-center animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary-300 dark:border-primary-700" style={{animationDelay: '0.4s'}}>
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Emails</h3>
              <p className="text-surface-600 dark:text-surface-400">
                Tell CloneMe what you want to say, and it writes it in your voice
              </p>
            </div>
            <div className="text-center animate-slideInRight" style={{animationDelay: '0.4s'}}>
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary-300 dark:border-primary-700" style={{animationDelay: '0.6s'}}>
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Improve Over Time</h3>
              <p className="text-surface-600 dark:text-surface-400">
                Provide feedback to make your AI voice more accurate with each use
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Playground */}
      <InteractivePlayground />

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fadeInDown">
            <h2 className="text-3xl font-bold mb-4 text-surface-900 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-lg text-surface-600 dark:text-surface-400">
              Choose the plan that fits your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <Card 
                key={index} 
                className={`text-center ${plan.highlighted ? 'ring-2 ring-primary-500 shadow-xl bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-surface-800'} hover-lift transition-all border hover:shadow-lg`}
                style={{animationDelay: `${index * 0.15}s`}}
              >
                {plan.highlighted && (
                  <div className="bg-primary-600 text-white text-sm py-1 px-4 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">
                  {plan.price}
                  <span className="text-lg text-surface-600 dark:text-surface-400">{plan.period}</span>
                </div>
                <ul className="text-left my-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-primary-600 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-surface-100 dark:bg-surface-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fadeInDown">
            <h2 className="text-3xl font-bold mb-4 text-surface-900 dark:text-white">Loved by Thousands</h2>
            <p className="text-lg text-surface-600 dark:text-surface-400">
              See what our users have to say
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-lift animate-slideInUp bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-500 transition-all" style={{animationDelay: `${index * 0.15}s`}}>
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-surface-700 dark:text-surface-300 italic">
                  "{testimonial.content}"
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Email Writing?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of professionals saving hours every week
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="shadow-lg hover-lift bg-white hover:bg-surface-100 text-primary-600 transition-all duration-300"
            onClick={() => router.push('/dashboard')}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-800 dark:bg-surface-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary-400">CloneMe</h3>
              <p className="text-surface-400">
                AI-powered email writing that sounds exactly like you.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-surface-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-surface-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-surface-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-surface-700 text-center text-surface-400">
            <p>&copy; 2024 CloneMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}