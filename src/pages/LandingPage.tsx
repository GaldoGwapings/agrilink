import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sprout, TrendingUp, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils"
import Navbar from '../components/Navbar' 

export default function LandingPage({ user, isLoggedInFarmer }: { user?: any, isLoggedInFarmer?: boolean }) {
  const features = [
    {
      title: "Smart Harvest Forecasting",
      description: "Notify buyers weeks before your harvest. Reduce post-harvest wastage and get better prices.",
      icon: Sprout,
      color: "bg-[#ECFCCB] text-[#4D7C0F]"
    },
    {
      title: "Direct Market Connector",
      description: "Skip the middlemen. Connect directly with bulk buyers, exporters, and logistics providers.",
      icon: TrendingUp,
      color: "bg-[#FEF9C3] text-[#A16207]"
    },
    {
      title: "Marketplace Tapping",
      description: "Quickly browse and filter through various harvest categories to find exactly what you need.",
      icon: ShieldCheck,
      color: "bg-[#DCFCE7] text-[#15803D]"
    }
  ];

  const categories = [
    { name: "Vegetables", count: "250+ Listings", icon: "🥦", color: "bg-[#DCFCE7]" },
    { name: "Fruits", count: "180+ Listings", icon: "🍎", color: "bg-[#FFEDD5]" },
    { name: "Grains & Rice", count: "140+ Listings", icon: "🌾", color: "bg-[#FEF9C3]" },
    { name: "Root Crops", count: "95+ Listings", icon: "🥔", color: "bg-[#F3E8FF]" },
    { name: "Spices", count: "60+ Listings", icon: "🌶️", color: "bg-[#FEE2E2]" },
    { name: "Poultry & Eggs", count: "45+ Listings", icon: "🥚", color: "bg-[#ECFCCB]" },
  ];

  const isFarmer = isLoggedInFarmer || user?.role === 'farmer';

  return (
    <>
      <Navbar user={user} />

      <div className="max-w-8xl mx-auto px-4 lg:px-7">

        {/* Hero Section */}
        <section className="relative min-h-[45vh] flex items-center rounded-[48px] overflow-hidden my-6 border border-[#E5EAD7]">
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2664&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-[#1A2E05]/60 md:bg-gradient-to-r md:from-[#1A2E05]/90 md:to-[#1A2E05]/20 z-[1]" />

          {/* Decorative Leaves */}
          <div className="absolute right-0 top-0 bottom-0 w-[50%] z-[2] pointer-events-none overflow-hidden">
            <svg
              viewBox="0 0 560 430"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full opacity-40"
              preserveAspectRatio="xMaxYMid slice"
            >
              {/* Large monstera-style leaf — top right */}
              <g transform="translate(400, 20)">
                <path d="M60,0 C80,40 95,90 80,140 C65,190 30,210 0,220 C-10,180 -5,130 10,90 C25,50 45,20 60,0Z" fill="none" stroke="#7ec84a" strokeWidth="1.8" opacity="0.9"/>
                <line x1="60" y1="0" x2="0" y2="220" stroke="#5a9e30" strokeWidth="2" opacity="0.8"/>
                <path d="M50,40 Q20,55 8,62" stroke="#7ec84a" strokeWidth="1.2" fill="none" opacity="0.7"/>
                <path d="M40,75 Q10,90 0,98" stroke="#7ec84a" strokeWidth="1.2" fill="none" opacity="0.7"/>
                <path d="M28,115 Q4,128 -2,135" stroke="#7ec84a" strokeWidth="1.2" fill="none" opacity="0.7"/>
                <path d="M18,155 Q2,165 -2,170" stroke="#7ec84a" strokeWidth="1" fill="none" opacity="0.6"/>
                <path d="M68,35 Q82,48 86,56" stroke="#7ec84a" strokeWidth="1.2" fill="none" opacity="0.7"/>
                <path d="M60,70 Q75,82 78,90" stroke="#7ec84a" strokeWidth="1.2" fill="none" opacity="0.7"/>
                <path d="M48,108 Q62,118 64,125" stroke="#7ec84a" strokeWidth="1.2" fill="none" opacity="0.7"/>
              </g>

              {/* Slim elongated leaf — center right */}
              <g transform="translate(470, 100) rotate(-20)">
                <path d="M0,0 C18,30 22,80 15,130 C10,160 2,175 0,180 C-2,175 -10,160 -15,130 C-22,80 -18,30 0,0Z" fill="none" stroke="#6ab83a" strokeWidth="1.6" opacity="0.85"/>
                <line x1="0" y1="0" x2="0" y2="180" stroke="#4a8e25" strokeWidth="1.8" opacity="0.7"/>
                <path d="M0,35 Q-14,42 -18,46" stroke="#6ab83a" strokeWidth="1" fill="none" opacity="0.6"/>
                <path d="M0,60 Q-16,68 -20,72" stroke="#6ab83a" strokeWidth="1" fill="none" opacity="0.6"/>
                <path d="M0,90 Q-14,97 -17,101" stroke="#6ab83a" strokeWidth="1" fill="none" opacity="0.6"/>
                <path d="M0,35 Q14,42 18,46" stroke="#6ab83a" strokeWidth="1" fill="none" opacity="0.6"/>
                <path d="M0,60 Q16,68 20,72" stroke="#6ab83a" strokeWidth="1" fill="none" opacity="0.6"/>
                <path d="M0,90 Q14,97 17,101" stroke="#6ab83a" strokeWidth="1" fill="none" opacity="0.6"/>
              </g>

              {/* Thin pointed leaf — far right bottom */}
              <g transform="translate(530, 280) rotate(-35)">
                <path d="M0,0 C12,25 14,65 8,105 C4,125 0,135 0,140 C0,135 -4,125 -8,105 C-14,65 -12,25 0,0Z" fill="none" stroke="#7ec84a" strokeWidth="1.4" opacity="0.8"/>
                <line x1="0" y1="0" x2="0" y2="140" stroke="#5a9e30" strokeWidth="1.5" opacity="0.65"/>
                <path d="M0,30 Q-10,36 -12,39" stroke="#7ec84a" strokeWidth="0.9" fill="none" opacity="0.6"/>
                <path d="M0,55 Q-10,61 -12,64" stroke="#7ec84a" strokeWidth="0.9" fill="none" opacity="0.6"/>
                <path d="M0,80 Q-8,85 -10,88" stroke="#7ec84a" strokeWidth="0.9" fill="none" opacity="0.5"/>
                <path d="M0,30 Q10,36 12,39" stroke="#7ec84a" strokeWidth="0.9" fill="none" opacity="0.6"/>
                <path d="M0,55 Q10,61 12,64" stroke="#7ec84a" strokeWidth="0.9" fill="none" opacity="0.6"/>
                <path d="M0,80 Q8,85 10,88" stroke="#7ec84a" strokeWidth="0.9" fill="none" opacity="0.5"/>
              </g>

              {/* Small accent leaf — upper mid */}
              <g transform="translate(350, 60) rotate(15)">
                <path d="M0,0 C20,20 28,55 22,88 C16,110 6,122 0,125 C-6,122 -16,110 -22,88 C-28,55 -20,20 0,0Z" fill="none" stroke="#6ab83a" strokeWidth="1.4" opacity="0.7"/>
                <line x1="0" y1="0" x2="0" y2="125" stroke="#4a8e25" strokeWidth="1.5" opacity="0.6"/>
                <path d="M0,28 Q-16,36 -20,40" stroke="#7ec84a" strokeWidth="1" fill="none" opacity="0.55"/>
                <path d="M0,55 Q-18,63 -22,67" stroke="#7ec84a" strokeWidth="1" fill="none" opacity="0.55"/>
                <path d="M0,80 Q-14,87 -17,90" stroke="#7ec84a" strokeWidth="0.9" fill="none" opacity="0.5"/>
                <path d="M0,28 Q16,36 20,40" stroke="#7ec84a" strokeWidth="1" fill="none" opacity="0.55"/>
                <path d="M0,55 Q18,63 22,67" stroke="#7ec84a" strokeWidth="1" fill="none" opacity="0.55"/>
                <path d="M0,80 Q14,87 17,90" stroke="#7ec84a" strokeWidth="0.9" fill="none" opacity="0.5"/>
              </g>
            </svg>
          </div>

          {/* Hero Content */}
          <div className="w-full px-14 py-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFCCB]/90 backdrop-blur-sm border border-[#D9E1C2] text-[#365314] text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4D7C0F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4D7C0F]"></span>
                </span>
                Empowering Filipino Farmers
              </div>

              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1] text-white">
                Connecting the <span className="text-[#ECFCCB]">Field</span> to the <span className="text-[#FEF9C3]">Market</span>
              </h1>

              <p className="text-lg text-white/90 max-w-lg leading-relaxed font-medium">
                AgriLink is an AI-powered platform designed to eliminate food waste by predicting harvests and connecting Filipino farmers with buyers in advance.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/login" className="px-10 py-4 bg-[#4D7C0F] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-[#4D7C0F]/40 hover:bg-[#3F6212] hover:-translate-y-1 transition-all flex items-center gap-3">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-extrabold text-[#1A2E05]">How AgriLink Works</h2>
            <p className="text-[#5B6D44] max-w-2xl mx-auto">
              Our platform bridges the gap between the field and the market through technology and data-driven insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[32px] bg-white border border-[#E5EAD7] hover:shadow-xl transition-shadow group"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.color)}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-[#1A2E05]">{feature.title}</h3>
                <p className="text-[#5B6D44] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Browse by Category Section */}
        {!isFarmer && (
          <section className="py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold text-[#1A2E05]">Browse by Category</h2>
                <p className="text-[#5B6D44] max-w-xl text-lg">
                  Explore a wide variety of fresh harvests directly from verified local farms across the Philippines.
                </p>
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 text-[#4D7C0F] font-black uppercase tracking-widest text-xs hover:gap-3 transition-all">
                View All Categories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group cursor-pointer"
                >
                  <div className={cn(
                    "aspect-square rounded-[32px] p-6 flex flex-col items-center justify-center text-center space-y-4 border border-transparent hover:border-[#E5EAD7] transition-all hover:shadow-xl hover:-translate-y-2",
                    cat.color
                  )}>
                    <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                    <div>
                      <h3 className="font-black text-[#1A2E05] text-sm">{cat.name}</h3>
                      <p className="text-[10px] font-bold text-[#5B6D44] uppercase tracking-wider">{cat.count}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="contact" className="py-24 border-t border-[#E5EAD7]">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                <h2 className="text-5xl font-black text-[#1A2E05] tracking-tight">Get in Touch</h2>
                <p className="text-lg text-[#5B6D44] leading-relaxed">
                  Have questions about predicting your harvest or connecting with buyers? Our team is here to help you grow.
                </p>
              </div>
              <div className="space-y-8">
                <div className="flex gap-5 items-start">
                  <div className="w-11 h-11 bg-[#ECFCCB] rounded-2xl flex items-center justify-center text-[#4D7C0F] shrink-0">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#5B6D44] uppercase tracking-[0.2em] mb-1">Email</span>
                    <span className="text-xl font-black text-[#1A2E05]">support@agrilink.ph</span>
                  </div>
                </div>
                <div className="flex gap-5 items-start">
                  <div className="w-11 h-11 bg-[#FEF9C3] rounded-2xl flex items-center justify-center text-[#A16207] shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#5B6D44] uppercase tracking-[0.2em] mb-1">Socials</span>
                    <span className="text-xl font-black text-[#1A2E05]">@agrilink.ph</span>
                  </div>
                </div>
                <div className="flex gap-5 items-start">
                  <div className="w-11 h-11 bg-[#DCFCE7] rounded-2xl flex items-center justify-center text-[#15803D] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#5B6D44] uppercase tracking-[0.2em] mb-1">Location</span>
                    <span className="text-xl font-black text-[#1A2E05]">Cagayan de Oro City, Philippines</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="max-w-xl ml-auto bg-white rounded-[40px] p-8 lg:p-10 border border-[#E5EAD7] shadow-2xl shadow-[#1A2E05]/5 space-y-6">
                <h3 className="text-xl font-black text-[#1A2E05]">Send us a message</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest m1-1">Full Name</label>
                      <input type="text" placeholder="Juan Dela Cruz" className="w-full px-6 py-4 bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all text-[#1A2E05] text-sm font-medium"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest m1-1">Email Address</label>
                      <input type="email" placeholder="juan@email.com" className="w-full px-6 py-4 bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all text-[#1A2E05] text-sm font-medium"/>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest m1-1">Subject</label>
                    <select className="w-full px-6 py-4 bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all text-[#1A2E05] text-sm font-medium appearance-none">
                      <option>General Inquiry</option>
                      <option>Farmer Support</option>
                      <option>Buyer Partnership</option>
                      <option>Logistics Integration</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest ml-1">Message</label>
                    <textarea placeholder="How can we help you?" rows={3} className="w-full px-6 py-4 bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all text-[#1A2E05] text-sm font-medium resize-none"></textarea>
                  </div>
                  <button type="submit" className="w-full py-4 bg-[#4D7C0F] text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-[#3F6212] transition-all shadow-xl shadow-[#4D7C0F]/20 flex items-center justify-center gap-2">
                    Send Message <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="bg-[#4D7C0F] rounded-[48px] p-12 lg:p-24 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-24 opacity-10 pointer-events-none">
              <Sprout className="w-64 h-64 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
              Ready to reduce post-harvest waste and increase your income?
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login" className="px-10 py-5 bg-white text-[#4D7C0F] rounded-2xl font-bold text-lg hover:scale-105 transition-transform">
                Start for Free
              </Link>
              <a href="#contact" className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors">
                Contact Support
              </a>
            </div>
          </section>
        )}

      </div>
    </>
  );
}