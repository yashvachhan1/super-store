"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

type CartItem = {
    id: string;
    title: string;
    price: number;
    quantity: number;
    color: string;
    size: string;
    img: string;
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string, size?: string, color?: string) => void;
    updateQuantity: (id: string, delta: number, size?: string, color?: string) => void;
    isDrawerOpen: boolean;
    setIsDrawerOpen: (open: boolean) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Sync from Firestore on Login
    useEffect(() => {
        if (!user) {
            setCart([]);
            return;
        }

        const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists() && snap.data().cart) {
                setCart(snap.data().cart);
            }
        });

        return () => unsub();
    }, [user]);

    // Helper to update Firestore
    const syncToFirestore = async (newCart: CartItem[]) => {
        if (!user) return;
        try {
            await setDoc(doc(db, "users", user.uid), { cart: newCart }, { merge: true });
        } catch (error) {
            console.error("Cart sync error:", error);
        }
    };

    const addToCart = (item: CartItem) => {
        const newCart = (() => {
            const existing = cart.find((i) => i.id === item.id && i.size === item.size && i.color === item.color);
            if (existing) {
                return cart.map((i) =>
                    i.id === item.id && i.size === item.size && i.color === item.color
                        ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                        : i
                );
            }
            return [...cart, { ...item, quantity: item.quantity || 1 }];
        })();

        setCart(newCart);
        syncToFirestore(newCart);
        setIsDrawerOpen(true);
    };

    const removeFromCart = (id: string, size?: string, color?: string) => {
        const newCart = cart.filter((i) => !(i.id === id && i.size === (size || i.size) && i.color === (color || i.color)));
        setCart(newCart);
        syncToFirestore(newCart);
    };

    const updateQuantity = (id: string, delta: number, size?: string, color?: string) => {
        const newCart = cart.map((i) =>
            (i.id === id && i.size === (size || i.size) && i.color === (color || i.color))
                ? { ...i, quantity: Math.max(1, i.quantity + delta) }
                : i
        );
        setCart(newCart);
        syncToFirestore(newCart);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, isDrawerOpen, setIsDrawerOpen, isMenuOpen, setIsMenuOpen }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
