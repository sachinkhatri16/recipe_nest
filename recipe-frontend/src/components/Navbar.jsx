import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChefHat, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Recipes", to: "/recipes" },
  { label: "Chefs", to: "/chefs" },
  { label: "About", to: "/about" },
];

export default function Navbar({ activeItem = "Home" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClasses = (label, mobile = false) => {
    const isActive = label === activeItem;

    return [
      "inline-flex items-center justify-center font-medium transition-colors duration-200",
      mobile ? "w-full rounded-xl px-4 py-3 text-base" : "rounded-full px-4 py-2 text-sm",
      isActive
        ? "bg-emerald-50 text-emerald-700"
        : "text-slate-500 hover:text-slate-900",
    ].join(" ");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex min-h-20 items-center justify-between gap-3">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <ChefHat className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[1.95rem]">
                Recipe<span className="text-emerald-600">Nest</span>
              </p>
              <p className="hidden text-xs font-medium text-slate-400 sm:block">
                Simple meals, better planning
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} className={linkClasses(link.label)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="#signin"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Sign In
            </a>
            <a
              href="#join"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Join Free
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:text-slate-900 lg:hidden"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <div
          className={[
            "grid overflow-hidden transition-all duration-300 lg:hidden",
            isMenuOpen ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <div className="border-t border-slate-200 py-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={linkClasses(link.label, true)}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <a
                  href="#signin"
                  className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="#join"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
