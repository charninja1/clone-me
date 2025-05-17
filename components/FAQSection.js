import React, { useState } from 'react';
import { Card } from './ui';

const faqs = [
  {
    question: "How does CloneMe learn my writing style?",
    answer: "CloneMe analyzes your existing emails to understand your unique voice, tone, and language patterns. The more you use it and provide feedback, the better it becomes at mimicking your style."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption to protect your data. Your emails and personal information are never shared with third parties, and you have full control over your data."
  },
  {
    question: "Can I create multiple voices?",
    answer: "Yes! You can create different voices for various contexts - professional emails, casual messages, academic writing, and more. Each voice can be trained separately."
  },
  {
    question: "What if the AI doesn't sound like me?",
    answer: "Our AI improves with every interaction. You can provide feedback on generated emails, and the system will learn from your corrections. Most users see significant improvement within 5-10 uses."
  },
  {
    question: "Can I use CloneMe with my existing email client?",
    answer: "Currently, CloneMe works as a web application. You can copy generated emails to any email client. We're working on direct integrations with popular email services."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start."
  },
  {
    question: "How many emails can I generate?",
    answer: "It depends on your plan. The Starter plan includes 50 emails per month, Professional offers unlimited emails, and Enterprise includes custom limits."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 bg-surface-50 dark:bg-surface-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fadeInDown">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-surface-600 dark:text-surface-400">
            Everything you need to know about CloneMe
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className={`animate-fadeInUp transition-all cursor-pointer duration-200 hover:shadow-lg hover:scale-[1.02] transform`}
              style={{animationDelay: `${index * 0.1}s`}}
              onClick={() => toggleFAQ(index)}
            >
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium pr-8">{faq.question}</h3>
                  <div className={`transform transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-5 h-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className={`mt-4 text-surface-600 dark:text-surface-400 transition-all duration-200 ${
                  openIndex === index ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  {faq.answer}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            Still have questions?
          </p>
          <a
            href="#"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  );
}