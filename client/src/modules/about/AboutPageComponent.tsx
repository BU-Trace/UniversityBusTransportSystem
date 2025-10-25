import Header from "@/components/Header";

const AboutPageComponent: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start">
            {/* hero */}
            {/* Use shared Header component */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* Header is a client component with props to customize content */}
            <Header
            title="Smarter University Transport "
            subtitle="Real-time tracking, dynamic scheduling and instant notifications — all in one place."
            imageSrc="/static/loginpagebanner.png"
            primaryText="Explore Features"
            primaryHref="#features"
            secondaryText="Contact Us"
            secondaryHref="#contact"
            />
            {/* main content */}
            <main className="max-w-7xl w-full px-6  py-12 ">
                <section id="features" className="bg-white rounded-3xl   p-6 md:p-10 mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Why UBTS?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                UBTS makes campus transportation predictable, safe and efficient. From
                                live driver tracking to automated route adjustments, we save time and
                                reduce waiting.
                            </p>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="text-red-600 font-bold">•</span>
                                    <span>Live tracking and ETA for every stop</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-600 font-bold">•</span>
                                    <span>Automatic schedule updates based on traffic</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-600 font-bold">•</span>
                                    <span>Role-based access for students, drivers and admins</span>
                                </li>
                            </ul>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Live Bus Tracking</h3>
                                <p className="text-gray-600 text-sm">View vehicle locations in real-time and share ETAs with students.</p>
                            </div>
                            <div className="p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Dynamic Scheduling</h3>
                                <p className="text-gray-600 text-sm">Routes update automatically when delays or detours occur.</p>
                            </div>
                            <div className="p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Notifications</h3>
                                <p className="text-gray-600 text-sm">Instant alerts for students about delays, arrivals and changes.</p>
                            </div>
                            <div className="p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Secure Access</h3>
                                <p className="text-gray-600 text-sm">Role-based authentication and permissions keep your campus safe.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Complex grid view system */}
                <section className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Campus Dashboard (Grid View)</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-fr">
                        <div className="lg:col-span-2 row-span-2 bg-white rounded-2xl shadow p-6 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">Live Map</h4>
                            <p className="text-gray-600 text-sm">Interactive map showing all active vehicles and routes.</p>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">Next Arrivals</h4>
                            <p className="text-gray-600 text-sm">Upcoming arrivals for selected stops.</p>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">Driver Status</h4>
                            <p className="text-gray-600 text-sm">Vehicle assignments and driver availability overview.</p>
                        </div>

                        <div className="lg:col-span-1 bg-white rounded-2xl shadow p-4 hover:bg-red-50 hover:shadow-lg transition-colors duration-200">
                            <h5 className="font-semibold text-sm text-gray-900 mb-1">Active Routes</h5>
                            <div className="text-3xl font-bold text-red-600">28</div>
                        </div>
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow p-4 hover:bg-red-50 hover:shadow-lg transition-colors duration-200">
                            <h5 className="font-semibold text-sm text-gray-900 mb-1">Vehicles</h5>
                            <div className="text-3xl font-bold text-red-600">62</div>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 hover:bg-red-50 hover:shadow-lg transition-colors duration-200">
                            <h5 className="font-semibold text-sm text-gray-900 mb-1">On-time Rate</h5>
                            <div className="text-3xl font-bold text-red-600">92%</div>
                        </div>
                    </div>
                </section>

                {/* Bottom cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Secure Login System</h3>
                        <p className="text-gray-600 text-sm">UBTS ensures secure authentication for students and staff with role-based access.</p>
                    </div>
                    <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Optimized for Performance</h3>
                        <p className="text-gray-600 text-sm">The system runs smoothly on all modern devices, keeping the user experience fast and seamless.</p>
                    </div>
                    <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-transform duration-200">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">24/7 Accessibility</h3>
                        <p className="text-gray-600 text-sm">Access bus details anytime, anywhere — ensuring reliable information at your fingertips.</p>
                    </div>
                </section>

                {/* CTA strip */}
                <section className="mt-12 bg-red-600 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="text-xl font-bold">Ready to improve campus mobility?</h4>
                        <p className="text-sm opacity-90">Start a free trial or book a demo with our team.</p>
                    </div>
                    <div className="flex gap-3">
                        <a href="#" className="bg-white text-red-600 px-4 py-2 rounded-md font-semibold hover:scale-105 transform transition-transform duration-150">Start Free Trial</a>
                        <a href="#contact" className="border border-white/30 px-4 py-2 rounded-md hover:bg-white/10 transition-colors duration-150">Book Demo</a>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPageComponent;
