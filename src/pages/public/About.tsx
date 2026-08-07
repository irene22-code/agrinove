export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8">About AgroMart</h1>
      <div className="prose prose-emerald prose-lg max-w-none text-slate-600">
        <p className="lead text-xl">
          AgroMart was founded with a simple yet powerful mission: to bridge the gap between hard-working farmers and conscious consumers.
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Our Vision</h2>
        <p>
          We envision a world where agricultural supply chains are transparent, farmers are fairly compensated for their labor, and consumers have easy access to fresh, healthy, and sustainably grown produce. By eliminating unnecessary middlemen, we create a win-win situation for both ends of the marketplace.
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">How It Works</h2>
        <p>
          Our platform empowers farmers to set up their own digital storefronts. We verify every seller to ensure authenticity. Buyers can browse through diverse categories of produce, interact directly with sellers through our built-in messaging system, and make informed purchasing decisions based on transparent reviews and ratings.
        </p>
      </div>
    </div>
  );
}
