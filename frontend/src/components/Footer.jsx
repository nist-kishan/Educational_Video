import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200';
  const textClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const headingClass = isDark ? 'text-white' : 'text-gray-900';
  const iconBgClass = isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' }
  ];

  const footerSections = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Security', 'Roadmap']
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Press']
    },
    {
      title: 'Resources',
      links: ['Documentation', 'API', 'Community', 'Support']
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Cookies', 'License']
    }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`border-t ${bgClass} mt-20`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                EV
              </div>
              <span className={`text-lg font-bold ${headingClass}`}>EduVid</span>
            </div>
            <p className={`text-sm ${textClass} mb-4`}>
              Empowering learners worldwide with quality education and interactive learning experiences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-colors ${iconBgClass} hover:text-blue-500 cursor-pointer`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <motion.div key={section.title} variants={itemVariants}>
              <h3 className={`text-sm font-semibold ${headingClass} mb-4`}>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 5 }}
                      className={`text-sm ${textClass} hover:text-blue-500 transition-colors cursor-pointer`}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Info */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} pt-8 mb-8`}
        >
          <h3 className={`text-sm font-semibold ${headingClass} mb-4`}>Get in Touch</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div variants={itemVariants} className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className={`text-xs ${textClass}`}>Email</p>
                <p className={`text-sm font-medium ${headingClass}`}>support@eduvid.com</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-500" />
              <div>
                <p className={`text-xs ${textClass}`}>Phone</p>
                <p className={`text-sm font-medium ${headingClass}`}>+1 (555) 123-4567</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <p className={`text-xs ${textClass}`}>Location</p>
                <p className={`text-sm font-medium ${headingClass}`}>San Francisco, CA</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} pt-8 flex flex-col md:flex-row justify-between items-center`}
        >
          <p className={`text-sm ${textClass}`}>
            &copy; 2024 EduVid. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className={`text-sm ${textClass} hover:text-blue-500 transition-colors cursor-pointer`}>
              Privacy Policy
            </a>
            <a href="#" className={`text-sm ${textClass} hover:text-blue-500 transition-colors cursor-pointer`}>
              Terms of Service
            </a>
            <a href="#" className={`text-sm ${textClass} hover:text-blue-500 transition-colors cursor-pointer`}>
              Cookie Settings
            </a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
