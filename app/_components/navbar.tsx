import Logout from "./logout";
import Logo from "./logo";
import Link from "next/link";

interface NavbarProps {
  isAuthenticated: boolean;
}

export default function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="grid grid-cols-3 items-center py-4 px-2 md:px-6">
      <Link
        href="/"
        className="flex items-center space-x-0.5 hover:opacity-80 transition-opacity"
      >
        <Logo className="w-10 h-10 md:w-12 md:h-12 text-blue-950 dark:text-white" />
        <h1 className="text-xl md:text-2xl font-bold">Utlegg</h1>
      </Link>

      <nav className="flex items-center justify-center gap-4 md:gap-6">
        {isAuthenticated && (
          <>
            <Link
              href="/utlegg"
              className="text-sm md:text-base hover:opacity-80 transition-opacity font-medium"
            >
              Send utlegg
            </Link>
            <Link
              href="/soknad-om-stotte"
              className="text-sm md:text-base hover:opacity-80 transition-opacity font-medium"
            >
              Søk støtte
            </Link>
            <Link
              href="/idrettslag-stotte"
              className="text-sm md:text-base hover:opacity-80 transition-opacity font-medium"
            >
              Støtte til idrettslag
            </Link>
            <Link
              href="/sak-til-hs"
              className="text-sm md:text-base hover:opacity-80 transition-opacity font-medium"
            >
              Send inn sak til HS
            </Link>
          </>
        )}
      </nav>

      <div className="flex items-center justify-end space-x-2">
        {/* <ThemeToggle /> */}
        {isAuthenticated && <Logout />}
      </div>
    </header>
  );
}
