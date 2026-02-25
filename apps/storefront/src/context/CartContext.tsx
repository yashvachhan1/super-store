"use client";

import React, { createContext, useContext, useState } from 'react';

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
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id && i.size === item.size && i.color === item.color);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id && i.size === item.size && i.color === item.color
                        ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                        : i
                );
            }
            return [...prev, { ...item, quantity: item.quantity || 1 }];
        });
        setIsDrawerOpen(true); // Open drawer on add
    };

    const removeFromCart = (id: string, size?: string, color?: string) => {
        setCart((prev) => prev.filter((i) => !(i.id === id && i.size === (size || i.size) && i.color === (color || i.color))));
    };

    const updateQuantity = (id: string, delta: number, size?: string, color?: string) => {
        setCart((prev) =>
            prev.map((i) =>
                (i.id === id && i.size === (size || i.size) && i.color === (color || i.color))
                    ? { ...i, quantity: Math.max(1, i.quantity + delta) }
                    : i
            )
        );
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
