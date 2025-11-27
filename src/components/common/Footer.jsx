import { Heart, Facebook, Instagram, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-primary-700 to-primary-800 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-display font-bold">
              {import.meta.env.VITE_APP_NAME || "Aadhav's ToyTown"}
            </h3>
            <p className="text-primary-100 text-sm">
              Bringing joy to children with the best toys and games. Quality products for endless fun!
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="text-primary-100 hover:text-white transition-colors duration-200"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products')}
                  className="text-primary-100 hover:text-white transition-colors duration-200"
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/cart')}
                  className="text-primary-100 hover:text-white transition-colors duration-200"
                >
                  Shopping Cart
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors duration-200">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors duration-200">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors duration-200">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors duration-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Policies</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors duration-200">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-primary-600 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-primary-100 text-sm">
            © {currentYear} {import.meta.env.VITE_APP_NAME || "Aadhav's ToyTown"}. All rights reserved.
          </p>
          <p className="text-primary-100 text-sm flex items-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-400 fill-current" /> for happy kids
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
