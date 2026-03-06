import * as React from "react"
import Link from "next/link"
import { Search, ArrowRight, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV_LINKS = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Temp Share", href: "/temp-share" },
    { name: "Shortlinks", href: "/shortlinks" },
    { name: "Frames", href: "/frames" },
    { name: "API", href: "/api" },
]

export function Navbar() {
    return (
        <nav className="flex w-full sticky top-0 items-center justify-between py-4 px-8 bg-foreground/5  rounded-full text-foreground">
            <Link href="/" className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center  bg-foreground text-background">
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">HTMLify</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 rounded-full bg-muted/40 px-6 py-2.5">
                {NAV_LINKS.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className={`text-sm font-medium transition-colors hover:text-foreground ${index === 0 ? "text-foreground hover:opacity-80" : "text-muted-foreground"
                            }`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-muted/30 px-3 py-1.5 focus-within:ring-1 focus-within:ring-ring">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Type here"
                        className="w-32 sm:w-40 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                </div>

                <div className="hidden md:block">
                    <Button className="h-9 rounded-full px-5 text-sm font-medium">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 border-none outline-none">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 flex flex-col gap-1 p-2">
                            {NAV_LINKS.map((link, index) => (
                                <DropdownMenuItem key={index} asChild>
                                    <Link
                                        href={link.href}
                                        className={`cursor-pointer font-medium ${index === 0 ? "" : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                            <div className="my-1 h-px bg-muted" />
                            <DropdownMenuItem asChild>
                                <Button className="w-full justify-start rounded-md px-2 mt-1">
                                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}
