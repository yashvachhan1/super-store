"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

type WishlistItem = {
    id: string;
    title: string;
    price: number;
    img: string;
    cat: string;
};

type WishlistContextType = {
    wishlist: WishlistItem[];
    toggleWishlist: (item: WishlistItem) => void;
    isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    // Sync from Firestore on Login
    useEffect(() => {
        if (!user) {
            setWishlist([]);
            return;
        }

        const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists() && snap.data().wishlist) {
                setWishlist(snap.data().wishlist);
            }
        });

        return () => unsub();
    }, [user]);

    // Helper to update Firestore
    const syncToFirestore = async (newWishlist: WishlistItem[]) => {
        if (!user) return;
        try {
            await setDoc(doc(db, "users", user.uid), { wishlist: newWishlist }, { merge: true });
        } catch (error) {
            console.error("Wishlist sync error:", error);
        }
    };

    const toggleWishlist = (item: WishlistItem) => {
        const newWishlist = (() => {
            const exists = wishlist.find((i) => i.id === item.id);
            if (exists) {
                return wishlist.filter((i) => i.id !== item.id);
            }
            return [...wishlist, item];
        })();

        setWishlist(newWishlist);
        syncToFirestore(newWishlist);
    };

    const isInWishlist = (id: string) => wishlist.some((i) => i.id === id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
