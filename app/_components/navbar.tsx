import { ThemeToggle } from "@/components/theme-toggle";
import Logout from "./logout";


interface NavbarProps {
    isAuthenticated: boolean;
};

export default function Navbar({
    isAuthenticated,
}: NavbarProps) {
    return (
        <header className="flex items-center justify-between py-4 px-6">
            <h1 className="text-2xl font-bold">
                TIHLDE Utlegg
            </h1>

            <div className="flex items-center space-x-2">
                <ThemeToggle />
                {isAuthenticated && <Logout />}
            </div>
        </header>
    );
};