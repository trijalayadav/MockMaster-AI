"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function Header() {
    const path = usePathname();
    const router = useRouter();

    useEffect(() => {
        console.log(path);
    }, [path]);

    const navigateTo = (route) => {
        router.push(route);
    };

    return (
        <div className='flex p-4 items-center justify-between bg-secondary shadow-md'>
            <Image
                src={"/logo.svg"}
                width={160}
                height={100}
                alt='logo'
                className='cursor-pointer'
                onClick={() => navigateTo('/dashboard')}
            />

            <ul className='hidden md:flex gap-6'>
                <li
                    onClick={() => navigateTo('/dashboard')}
                    className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path === '/dashboard' ? 'text-primary font-bold' : ''
                        }`}
                >
                    Dashboard
                </li>
                {/* <li
                    onClick={() => navigateTo('/upgrade')}
                    className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path === '/dashboard/upgrade' ? 'text-primary font-bold' : ''
                        }`}
                >
                    Upgrade
                </li> */}
                <li
                    onClick={() => navigateTo('/how')}
                    className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path === '/dashboard/how' ? 'text-primary font-bold' : ''
                        }`}
                >
                    How it works?
                </li>
            </ul>

            <UserButton />
        </div>
    )
}

export default Header