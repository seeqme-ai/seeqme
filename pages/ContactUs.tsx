import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { contactService } from '@/services/apiService';

const ContactUs = () => {
  const { user, isAuthenticated } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; subject?: string; message?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; subject?: string; message?: string } = {};
    if (!email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid.';
    if (!subject) newErrors.subject = 'Subject is required.';
    if (!message) newErrors.message = 'Message is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }
    setIsSending(true);
    try {
      await contactService.sendContactForm(email, subject, message);
      toast.success('Your message has been sent!');
      setSubject('');
      setMessage('');
      if (!isAuthenticated) {
        setEmail('');
      }
      setErrors({}); // Clear errors on success
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send message. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-teal-500 selection:text-slate-950">
      <Helmet>
        <title>Contact Us - SeeqMe AI</title>
        <meta name="description" content="Have questions or feedback for SeeqMe AI? Contact our support team for assistance with your portfolios, features, or any inquiries." />
        <meta property="og:title" content="Contact Us - SeeqMe AI" />
        <meta property="og:description" content="Have questions or feedback for SeeqMe AI? Contact our support team for assistance with your portfolios, features, or any inquiries." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://seeqme.com/contact-us" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-center mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            Have a question or feedback? We'd love to hear from you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
                  placeholder="you@example.com"
                  required
                  disabled={isAuthenticated}
                  className={`mt-2 ${errors.email ? 'border-red-500' : 'border-gray-700  placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setErrors({ ...errors, subject: undefined }); }}
                  placeholder="e.g., Feedback on templates"
                  required
                  className={`mt-2 ${errors.subject ? 'border-red-500' : 'border-gray-700  placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"'} `}
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>
              <div>
                <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors({ ...errors, message: undefined }); }}
                  placeholder="Your message here..."
                  required
                  rows={8}
                  className={`mt-2 w-full p-4 bg-transparent border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow ${errors.message ? 'border-red-500' : 'border-border'}`}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSending} className="min-w-[150px] bg-teal-500 text-white">
                {isSending ? (
                  <Loader className="animate-spin" />
                ) : (
                  <>
                    Send Message <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(ContactUs);
