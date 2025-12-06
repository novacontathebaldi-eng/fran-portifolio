import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { CartItem, ShopProduct } from '../types';

const CART_STORAGE_KEY = 'fran_siller_cart';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: ShopProduct, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isInCart: (productId: string) => boolean;
    getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize cart from localStorage
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading cart from localStorage:', e);
            return [];
        }
    });

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (e) {
            console.error('Error saving cart to localStorage:', e);
        }
    }, [cartItems]);

    // Add product to cart
    const addToCart = useCallback((product: ShopProduct, quantity: number = 1) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(item => item.product.id === product.id);

            if (existingIndex >= 0) {
                // Update quantity if already in cart
                const updated = [...prev];
                const newQuantity = updated[existingIndex].quantity + quantity;
                // Don't exceed stock
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: Math.min(newQuantity, product.stock)
                };
                return updated;
            } else {
                // Add new item
                return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
            }
        });
    }, []);

    // Remove product from cart
    const removeFromCart = useCallback((productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    // Update quantity for a product
    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prev => prev.map(item => {
            if (item.product.id === productId) {
                return {
                    ...item,
                    quantity: Math.min(quantity, item.product.stock)
                };
            }
            return item;
        }));
    }, [removeFromCart]);

    // Clear entire cart
    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Check if product is in cart
    const isInCart = useCallback((productId: string): boolean => {
        return cartItems.some(item => item.product.id === productId);
    }, [cartItems]);

    // Get quantity of a specific product in cart
    const getItemQuantity = useCallback((productId: string): number => {
        const item = cartItems.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    }, [cartItems]);

    // Computed values
    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }, [cartItems]);

    const cartCount = useMemo(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    const value: CartContextType = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isInCart,
        getItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
