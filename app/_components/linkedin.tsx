import { Button } from "@/components/ui/button";
import { LinkedinIcon } from "lucide-react";


export default function LinkedinNavigation() {
    return (
        <Button
            asChild
            variant="action"
            size="icon"
        >
            <a
                rel="noreferrer noopener"
                target="_blank"
                href="https://www.linkedin.com/in/mads-kristian-nylund-b9871921b/"
            >
                <LinkedinIcon className="w-6 h-6" />    
            </a>
        </Button>
    );
};