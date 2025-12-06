import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Filter, Search, Loader2 } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useCart } from '../../context/CartContext';
import { ShopProduct } from '../../types';

export const Shop: React.FC = () => {
    const navigate = useNavigate();
    const { shopProducts, fetchShopProducts, settings, isLoadingData } = useProjects();
    const { addToCart, cartCount } = useCart();

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Redirect if shop is disabled
    useEffect(() => {
        if (!isLoadingData && !settings.enableShop) {
            navigate('/', { replace: true });
        }
    }, [settings.enableShop, isLoadingData, navigate]);

    // Fetch products on mount with timeout protection
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const loadProducts = async () => {
            try {
                await fetchShopProducts();
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            } finally {
                setLoading(false);
            }
        };

        // Safety timeout - ensure loading ends after 5 seconds max
        timeoutId = setTimeout(() => {
            if (loading) {
                console.warn('[Shop] Timeout: Forçando fim do loading');
                setLoading(false);
            }
        }, 5000);

        loadProducts();

        return () => clearTimeout(timeoutId);
    }, []);

    // Get only active products
    const activeProducts = shopProducts.filter(p => p.status === 'active');

    // Get unique categories
    const categories = ['all', ...new Set(activeProducts.map(p => p.category).filter(Boolean))];

    // Filter products
    const filteredProducts = activeProducts.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (product: ShopProduct, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock > 0) {
            addToCart(product, 1);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    if (loading || isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-[#1a1a1a] text-white pt-32 pb-16">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                            Loja
                        </h1>
                        <p className="text-gray-400 max-w-xl">
                            Produtos selecionados com o mesmo cuidado e atenção aos detalhes que aplicamos em nossos projetos de arquitetura.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cat === 'all' ? 'Todos' : cat}
                            </button>
                        ))}
                    </div>

                    {/* Cart Link */}
                    <Link
                        to="/cart"
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-bold rounded-full hover:bg-accent/80 transition"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Carrinho ({cartCount})</span>
                    </Link>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-serif text-gray-600 mb-2">Nenhum produto encontrado</h2>
                        <p className="text-gray-400">Tente ajustar os filtros ou volte mais tarde.</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/shop/product/${product.id}`}
                                    className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square overflow-hidden bg-gray-100 relative">
                                        {product.images && product.images[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-16 h-16 text-gray-300" />
                                            </div>
                                        )}
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">
                                                    Esgotado
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        {product.category && (
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">
                                                {product.category}
                                            </span>
                                        )}
                                        <h3 className="font-serif text-lg font-bold text-gray-900 mt-1 group-hover:text-accent transition-colors">
                                            {product.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xl font-bold text-black">
                                                {formatPrice(product.price)}
                                            </span>
                                            <button
                                                onClick={(e) => handleAddToCart(product, e)}
                                                disabled={product.stock === 0}
                                                className={`p-2 rounded-full transition ${product.stock > 0
                                                    ? 'bg-black text-white hover:bg-accent hover:text-black'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                            </button>
                                        </div>
                                        {product.stock > 0 && product.stock <= 5 && (
                                            <p className="text-xs text-red-500 mt-2">
                                                Apenas {product.stock} em estoque
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};
