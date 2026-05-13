import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'
import { Link } from "react-router-dom";
import { Leaf, Phone, MapPin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5EAD7] pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#4D7C0F] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#4D7C0F]/20">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#1A2E05]">AgriLink</span>
            </Link>
            <p className="text-[#5B6D44] text-sm leading-relaxed">
              Empowering Filipino farmers through AI-driven harvest prediction and direct market connection. Reducing waste, increasing income.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#F1F4E8] rounded-full flex items-center justify-center text-[#4D7C0F] hover:bg-[#4D7C0F] hover:text-white transition-all">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#F1F4E8] rounded-full flex items-center justify-center text-[#4D7C0F] hover:bg-[#4D7C0F] hover:text-white transition-all">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#F1F4E8] rounded-full flex items-center justify-center text-[#4D7C0F] hover:bg-[#4D7C0F] hover:text-white transition-all">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#1A2E05] mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-[#5B6D44]">
              <li><Link to="/" className="hover:text-[#4D7C0F] transition-colors">Home</Link></li>
              <li><Link to="/buyer" className="hover:text-[#4D7C0F] transition-colors">Marketplace</Link></li>
              <li><Link to="/map" className="hover:text-[#4D7C0F] transition-colors">Farmer Map</Link></li>
              <li><Link to="/login" className="hover:text-[#4D7C0F] transition-colors">Join AgriLink</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1A2E05] mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-[#5B6D44]">
              <li><a href="#" className="hover:text-[#4D7C0F] transition-colors">Farmer Guides</a></li>
              <li><a href="#" className="hover:text-[#4D7C0F] transition-colors">Market Trends</a></li>
              <li><a href="#" className="hover:text-[#4D7C0F] transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-[#4D7C0F] transition-colors">AI Forecast Beta</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1A2E05] mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-[#5B6D44]">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#4D7C0F]" />
                hello@agrilink.ph
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#4D7C0F]" />
                +63 (02) 8123-4567
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#4D7C0F]" />
                BGC, Taguig City, Philippines
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#F1F4E8] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#5B6D44] font-medium">
          <p>© 2026 AgriLink Philippines. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#4D7C0F]">Privacy Policy</a>
            <a href="#" className="hover:text-[#4D7C0F]">Terms of Service</a>
            <a href="#" className="hover:text-[#4D7C0F]">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}



