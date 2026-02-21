import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Briefcase, Target } from "lucide-react";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--text-primary)] overflow-x-hidden font-['Nunito']">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0C2D6B] transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-[#60A5FA] rounded-lg flex items-center justify-center font-bold text-[#0C2D6B]">
                                LN
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-white">
                                Launch<span className="text-[#60A5FA]">Nepal</span>
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/login"
                                className="text-sm font-medium px-6 py-2 border-[1.5px] border-white/25 rounded-full text-white/80 hover:text-white transition-all"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/login"
                                className="bg-[#60A5FA] text-[#0C2D6B] px-6 py-2 rounded-full font-extrabold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-br from-[#F8F7F4] via-[#F8F7F4] to-[#EEF5FF]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-[rgba(22,163,74,0.1)] border border-[rgba(22,163,74,0.25)] text-[#16A34A] text-xs font-extrabold uppercase tracking-wider mb-6 inline-block">
                            AI-Powered Ecosystem
                        </span>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-[#1A1814]">
                            Connecting the <span className="text-[#1B4FD8]">Next Generation</span> <br />
                            of Nepali Innovation
                        </h1>

                        <p className="text-xl text-[#6B6560] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            LaunchNepal uses advanced hybrid matching to bridge the gap between visionary founders,
                            top-tier talent, and strategic investors.
                        </p>

                        <Link to="/login" className="premium-button btn-primary px-10 py-4 text-lg">
                            Join Us
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Role Cards */}
            <section id="features" className="py-24 bg-[var(--primary)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-[#1A1814]">
                            Built for the Entire Ecosystem
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Founders */}
                        <div className="glass-card p-8 bg-white border-[#E5E1D8] rounded-[14px] hover:border-[#1B4FD8]/30 transition-all">
                            <div className="w-12 h-12 bg-[#EEF5FF] rounded-[12px] flex items-center justify-center mb-6">
                                <TrendingUp className="text-[#1B4FD8]" size={24} />
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 text-[#1A1814]">
                                For Founders
                            </h3>
                            <p className="text-[#6B6560] text-sm mb-6 leading-relaxed">
                                Build your dream team and secure capital with AI-powered discovery that understands your vision.
                            </p>
                        </div>

                        {/* Talent */}
                        <div className="glass-card p-8 bg-white border-[#E5E1D8] rounded-[14px] hover:border-[#16A34A]/30 transition-all">
                            <div className="w-12 h-12 bg-[#F0FDF4] rounded-[12px] flex items-center justify-center mb-6">
                                <Briefcase className="text-[#16A34A]" size={24} />
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 text-[#1A1814]">
                                For Talent
                            </h3>
                            <p className="text-[#6B6560] text-sm mb-6 leading-relaxed">
                                Skip the resume black hole. Get matched directly with startups that value your specific skill set.
                            </p>
                        </div>

                        {/* Investors */}
                        <div className="glass-card p-8 bg-white border-[#E5E1D8] rounded-[14px] hover:border-[#D97706]/30 transition-all">
                            <div className="w-12 h-12 bg-[#FEF9EE] rounded-[12px] flex items-center justify-center mb-6">
                                <Target className="text-[#D97706]" size={24} />
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 text-[#1A1814]">
                                For Investors
                            </h3>
                            <p className="text-[#6B6560] text-sm mb-6 leading-relaxed">
                                Source high-potential startups using quantitative metrics and qualitative thesis matching.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-[#6B6560] text-sm font-semibold">
                    <p>© 2026 LaunchNepal. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;