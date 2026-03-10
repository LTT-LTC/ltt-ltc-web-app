"use client";
import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-400">
            {/* Top separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="py-8 sm:py-16">
                <div className="w-[92%] lg:w-[70%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-16">
                    {/* Column 1: CinemaHome Vietnam */}
                    <div>
                        <h4 className="text-white font-black uppercase text-sm border-b-2 border-primary pb-3 mb-6">LTCinema</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">Use Giftcode Card</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">Career Opportunities</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">Contact LTT</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">For Business Partners</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: Policy & Legal */}
                    <div>
                        <h4 className="text-white font-black uppercase text-sm border-b-2 border-primary pb-3 mb-6">Policy & Legal</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">Conditions of Website Use</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">Terms of Use</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">Payment Policy</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">Cinema Rules</Link></li>
                            <li><Link href="#" className="text-primary hover:text-primary/80 transition-colors">F.A.Q.</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Stay Connected */}
                    <div>
                        <h4 className="text-white font-black uppercase text-sm border-b-2 border-primary pb-3 mb-6">Stay Connected</h4>
                        <div className="flex gap-4 mb-8">
                            <Link href="#" className="size-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-all">
                                <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>
                            </Link>
                            <Link href="#" className="size-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-all">
                                <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
                            </Link>
                            <Link href="#" className="size-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-400 transition-all font-bold text-lg">Z</Link>
                        </div>
                        {/*<div className="border border-white/10 rounded-lg p-5">*/}
                        {/*    <p className="text-sm font-bold text-white mb-3">Subscribe to News</p>*/}
                        {/*    <div className="flex">*/}
                        {/*        <input type="email" placeholder="Email" className="bg-transparent border border-white/15 rounded-l-full py-2 px-4 text-sm focus:ring-1 focus:ring-primary outline-none flex-grow min-w-0" />*/}
                        {/*        <button className="bg-slate-600 text-white text-xs px-5 py-2 rounded-r-full font-bold whitespace-nowrap hover:bg-primary transition-colors">SEND</button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>

                    {/* Column 4: Customer Service */}
                    <div>
                        <h4 className="text-white font-black uppercase text-sm border-b-2 border-primary pb-3 mb-6">Customer Service</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">headset_mic</span>
                                <div>
                                    <p className="text-white font-bold">Hotline: 0123 456 789</p>
                                    <p className="text-xs opacity-75 mt-1">Available 8:00 - 22:00 (Daily)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">mail</span>
                                <div>
                                    <p className="text-white font-bold">Email support</p>
                                    <p className="text-xs opacity-75 mt-1">email@support.cinema.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">pin_drop</span>
                                <div>
                                    <p className="text-white font-bold">Corporate Office</p>
                                    <p className="text-xs opacity-75 mt-1">123 Cinematic Ave, District 1, HCMC</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="w-[92%] lg:w-[70%] mx-auto mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                        <p className="text-xs">&copy; 2026 LTT-LTCinema. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
