import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sprout, TrendingUp, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage({ user }: { user?: any }) {
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

  const isFarmer = user?.role === 'farmer';

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center rounded-[48px] overflow-hidden my-6 border border-[#E5EAD7]">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2664&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-[#1A2E05]/60 md:bg-gradient-to-r md:from-[#1A2E05]/90 md:to-[#1A2E05]/20 z-[1]" />

        <div className="container mx-auto px-12 py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFCCB]/90 backdrop-blur-sm border border-[#D9E1C2] text-[#365314] text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4D7C0F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4D7C0F]"></span>
              </span>
              Empowering Filipino Farmers
            </div>
            
            <h1 className="text-5xl lg:text-8xl font-black tracking-tight leading-[1] text-white">
              Connecting the <span className="text-[#ECFCCB]">Field</span> to the <span className="text-[#FEF9C3]">Market</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-lg leading-relaxed font-medium">
              AgriLink is an AI-powered platform designed to eliminate food waste by predicting harvests and connecting Filipino farmers with buyers in advance.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/login" className="px-10 py-5 bg-[#4D7C0F] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-[#4D7C0F]/40 hover:bg-[#3F6212] hover:-translate-y-1 transition-all flex items-center gap-3">
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
              <p className="text-[#5B6D44] leading-relaxed">
                {feature.description}
              </p>
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
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
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
                    <span className="text-xl font-black text-[#1A2E05]">Bukidnon, Philippines</span>
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
                      <label className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest ml-4">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Juan Dela Cruz"
                        className="w-full px-6 py-4 bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all text-[#1A2E05] text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest ml-4">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="juan@email.com"
                        className="w-full px-6 py-4 bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all text-[#1A2E05] text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest ml-4">Subject</label>
                    <select className="w-full px-6 py-4 bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all text-[#1A2E05] text-sm font-medium appearance-none">
                      <option>General Inquiry</option>
                      <option>Farmer Support</option>
                      <option>Buyer Partnership</option>
                      <option>Logistics Integration</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#5B6D44] uppercase tracking-widest ml-4">Message</label>
                    <textarea 
                      placeholder="How can we help you?"
                      rows={3}
                      className="w-full px-6 py-4 bg-[#FDFCF8] border border-[#E5EAD7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4D7C0F] transition-all text-[#1A2E05] text-sm font-medium resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-[#4D7C0F] text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-[#3F6212] transition-all shadow-xl shadow-[#4D7C0F]/20 flex items-center justify-center gap-2"
                  >
                    Send Message
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
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
  );
}


