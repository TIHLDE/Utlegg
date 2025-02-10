"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";


export default function Logout() {
    const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

    const handleLogout = async () => {
      setStatus("pending");

      await logout();
    };

    return (
      <Button
        variant="basic"
        size="icon"
        onClick={handleLogout}
      >
        {status === "pending"
            ? <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />
            : <LogOut className="h-[1.2rem] w-[1.2rem]" />
        }
      </Button>  
    );
};