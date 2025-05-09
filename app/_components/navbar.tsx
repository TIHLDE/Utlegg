import Logout from "./logout";
import Logo from "./logo";
import Link from "next/link";


interface NavbarProps {
    isAuthenticated: boolean;
};

export default function Navbar({
    isAuthenticated,
}: NavbarProps) {

    return (
        <header className="flex items-center justify-between py-4 px-2 md:px-6">
            <div className="flex items-center space-x-8">
                <Link
                    className="flex items-center space-x-0.5"
                    href="/"
                >
                    <Logo className="w-10 h-10 md:w-12 md:h-12 text-blue-950 dark:text-white" />
                    <h1 className="text-xl md:text-2xl font-bold">
                        Søknad
                    </h1>
                </Link>

                <div className="flex items-center space-x-2">
                    <Link
                        href="/utlegg"
                    >
                        Utlegg
                    </Link>
                    <Link
                        href="/soknad"
                    >
                        Søknad
                    </Link>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {isAuthenticated && <Logout />}
            </div>
        </header>
    );
};