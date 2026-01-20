import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-terminal-bg flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        {/* Logo/Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-bloomberg-amber mb-2">
            MYFINTRACK
          </h1>
          <div className="text-muted-foreground text-sm tracking-widest uppercase">
            Personal Finance Terminal
          </div>
        </div>

        {/* Tagline */}
        <p className="text-lg text-foreground/80 mb-12">
          Bloomberg-style personal finance management with CFP best practices.
          Track goals, analyze spending, and build wealth.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-6 py-3 bg-bloomberg-amber text-black font-semibold rounded hover:bg-bloomberg-amber/90 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-bloomberg-amber text-bloomberg-amber font-semibold rounded hover:bg-bloomberg-amber/10 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <FeatureCard
            title="Goal Tracking"
            description="SMART goals with milestones and projections"
            icon="🎯"
          />
          <FeatureCard
            title="Account Sync"
            description="Automatic bank linking via Plaid"
            icon="🏦"
          />
          <FeatureCard
            title="Debt Strategy"
            description="Avalanche vs Snowball payoff planning"
            icon="📉"
          />
          <FeatureCard
            title="Projections"
            description="Monte Carlo simulations & TVM"
            icon="📈"
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-xs text-muted-foreground">
          <span className="text-bloomberg-green">●</span> System Online |{' '}
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-bloomberg-amber font-semibold text-sm mb-1">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
