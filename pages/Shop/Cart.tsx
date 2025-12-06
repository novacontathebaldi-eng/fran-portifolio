import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProjects } from '../../context/ProjectContext';

export const Cart: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
    const { settings, currentUser } = useProjects();

    // Redirect if shop is disabled
    React.useEffect(() => {
        if (!settings.enableShop) {
            navigate('/', { replace: true });
        }
    }, [settings.enableShop, navigate]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const handleCheckout = () => {
        if (!currentUser) {
            navigate('/auth?redirect=/checkout');
        } else {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-6 py-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                            Seu carrinho está vazio
                        </h1>
                        <p className="text-gray-500 mb-8">
                            Adicione produtos à sua sacola para continuar.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-accent hover:text-black transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Continuar Comprando
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">
                            Carrinho de Compras
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                        </p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpar Carrinho
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item, index) => (
                            <motion.div
                                key={item.product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4"
                            >
                                {/* Product Image */}
                                <Link
                                    to={`/shop/product/${item.product.id}`}
                                    className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100"
                                >
                                    {item.product.images && item.product.images[0] ? (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                </Link>

                                {/* Product Info */}
                                <div className="flex-grow flex flex-col justify-between">
                                    <div>
                                        <Link
                                            to={`/shop/product/${item.product.id}`}
                                            className="font-serif text-lg font-bold text-gray-900 hover:text-accent transition"
                                        >
                                            {item.product.title}
                                        </Link>
                                        <p className="text-gray-500 text-sm mt-1">
                                            {formatPrice(item.product.price)} cada
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-100 transition"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 font-medium min-w-[40px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.product.stock}
                                                className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Item Total & Remove */}
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-lg">
                                                {formatPrice(item.product.price * item.quantity)}
                                            </span>
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24"
                        >
                            <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Frete</span>
                                    <span className="text-green-600">A calcular</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-accent hover:text-black transition flex items-center justify-center gap-2"
                            >
                                <span>Finalizar Pedido</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            {!currentUser && (
                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Você precisará fazer login para finalizar a compra.
                                </p>
                            )}

                            <Link
                                to="/shop"
                                className="block text-center text-gray-600 hover:text-black mt-4 text-sm"
                            >
                                ← Continuar Comprando
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
