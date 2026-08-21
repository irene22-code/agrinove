import { Link } from 'react-router-dom';
import { Leaf, Facebook, Twitter, Instagram, Linkedin, CreditCard, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold text-white tracking-tight">AgroNavo</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              Your direct marketplace connecting verified local farmers with buyers for fresh, authentic, and sustainable agricultural produce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Marketplace & Tools</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Marketplace</Link></li>
              <li><Link to="/market-prices" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Market Prices</Link></li>
              <li><Link to="/plant-health" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Plant Health & Pests</Link></li>
              <li><Link to="/crop-calendar" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Crop Calendar</Link></li>
              <li><Link to="/weather" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Weather Intelligence</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-slate-400 hover:text-green-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/seller/register" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Sell on AgroNavo</Link></li>
              <li><Link to="/buyer/register" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Join as Buyer</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal & Support</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/returns" className="text-sm text-slate-400 hover:text-green-400 transition-colors">Return & Refund</Link></li>
              <li><Link to="/faq" className="text-sm text-slate-400 hover:text-green-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Secure Shopping</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400"><CreditCard className="h-4 w-4" /> Secure Payment Methods</li>
              <li className="flex items-center gap-2 text-sm text-slate-400"><ShieldCheck className="h-4 w-4" /> Buyer Protection</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold">VISA</div>
              <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold">MC</div>
              <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold">PAY</div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} AgroNavo. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex gap-4 text-sm text-slate-500">
            <span>Powered by ndanga irene</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
