import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Filter, Search, Grid, List, Plus, Check } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useCart } from '../../context/CartContext';
import { ShopProduct } from '../../types';
import { LoadingScreen } from '../../components/loading';

// Session storage keys for state preservation
const SHOP_STATE_KEY = 'shop_state';

export const Shop: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { shopProducts, fetchShopProducts, settings, isLoadingData, subscribeToShopProducts } = useProjects();
    const { addToCart, cartCount } = useCart();
    const containerRef = useRef<HTMLDivElement>(null);

    // Restore state from session storage or use defaults
    const getSavedState = () => {
        try {
            const saved = sessionStorage.getItem(SHOP_STATE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            if ((import.meta as any).env.DEV) console.warn('Erro ao restaurar state:', e);
        }
        return { category: 'all', search: '', viewMode: 'grid', scrollY: 0 };
    };

    const savedState = getSavedState();
    const [selectedCategory, setSelectedCategory] = useState<string>(savedState.category);
    const [searchQuery, setSearchQuery] = useState(savedState.search);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(savedState.viewMode);

    // Visual feedback for add to cart
    const [addedProductId, setAddedProductId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

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

    // Subscribe to realtime updates
    useEffect(() => {
        if (subscribeToShopProducts) {
            const unsubscribe = subscribeToShopProducts();
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [subscribeToShopProducts]);

    // Save state to session storage when it changes
    useEffect(() => {
        const state = {
            category: selectedCategory,
            search: searchQuery,
            viewMode: viewMode,
            scrollY: window.scrollY
        };
        sessionStorage.setItem(SHOP_STATE_KEY, JSON.stringify(state));
    }, [selectedCategory, searchQuery, viewMode]);

    // Restore scroll position after products load
    useEffect(() => {
        if (!loading && savedState.scrollY > 0) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                window.scrollTo(0, savedState.scrollY);
            }, 100);
        }
    }, [loading]);

    // Save scroll position before navigating away
    useEffect(() => {
        const handleBeforeUnload = () => {
            const state = {
                category: selectedCategory,
                search: searchQuery,
                viewMode: viewMode,
                scrollY: window.scrollY
            };
            sessionStorage.setItem(SHOP_STATE_KEY, JSON.stringify(state));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [selectedCategory, searchQuery, viewMode]);

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

    const handleAddToCart = useCallback((product: ShopProduct, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock > 0) {
            addToCart(product, 1);

            // Visual feedback
            setAddedProductId(product.id);
            setToastMessage(`${product.title} adicionado ao carrinho!`);
            setShowToast(true);

            // Reset after animation
            setTimeout(() => {
                setAddedProductId(null);
            }, 1500);

            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        }
    }, [addToCart]);

    // Save scroll before navigating to product
    const handleProductClick = useCallback(() => {
        const state = {
            category: selectedCategory,
            search: searchQuery,
            viewMode: viewMode,
            scrollY: window.scrollY
        };
        sessionStorage.setItem(SHOP_STATE_KEY, JSON.stringify(state));
    }, [selectedCategory, searchQuery, viewMode]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    if (loading || isLoadingData) {
        return <LoadingScreen message="Carregando produtos..." />;
    }

    return (
        <div className="min-h-screen bg-white" ref={containerRef}>
            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="fixed top-24 left-1/2 z-50 bg-black text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3"
                    >
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="font-medium">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section - Premium Style with Background Image */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        <h1 className="text-4xl md:text-6xl font-serif mb-4">
                            <span className="italic">Curadoria</span> & Design
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Produtos selecionados com o mesmo cuidado e atenção aos detalhes que
                            aplicamos em nossos projetos de arquitetura.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filter Bar - Style like Cultura page */}
            <section className="sticky top-[72px] bg-white border-b border-gray-100 z-30">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left: Filter Button + Categories */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-black transition shrink-0">
                                <Filter className="w-4 h-4" />
                                <span>Filtrar</span>
                            </button>

                            {/* Ordering placeholder - matches Cultura style */}
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 shrink-0">
                                <span>Ordenar:</span>
                                <span className="font-medium text-black">Mais recentes</span>
                            </div>

                            {/* Category Pills */}
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition shrink-0 ${selectedCategory === cat
                                        ? 'bg-black text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat === 'all' ? 'Todos' : cat}
                                </button>
                            ))}
                        </div>

                        {/* Right: Search + View Mode + Cart */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 lg:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar produtos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-black transition"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 transition ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Cart Link */}
                            <Link
                                to="/cart"
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-full hover:bg-accent hover:text-black transition text-sm"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span className="hidden sm:inline">Carrinho</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cartCount}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="container mx-auto px-6 py-12">
                {/* Results Count */}
                <p className="text-sm text-gray-500 mb-6">
                    Mostrando {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
                </p>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <h2 className="text-2xl font-serif text-gray-800 mb-2">Nenhum produto encontrado</h2>
                        <p className="text-gray-500">Tente ajustar os filtros ou volte mais tarde.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
                                    onClick={handleProductClick}
                                    className="group block"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative mb-4">
                                        {product.images && product.images[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-16 h-16 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Overlay on Hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                        {/* Quick Add Button with Feedback */}
                                        {product.stock > 0 && (
                                            <motion.button
                                                onClick={(e) => handleAddToCart(product, e)}
                                                className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 ${addedProductId === product.id
                                                    ? 'bg-green-500 text-white scale-110'
                                                    : 'bg-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:bg-black hover:text-white'
                                                    }`}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <AnimatePresence mode="wait">
                                                    {addedProductId === product.id ? (
                                                        <motion.div
                                                            key="check"
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            exit={{ scale: 0 }}
                                                            transition={{ type: 'spring', stiffness: 300 }}
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="plus"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            exit={{ scale: 0 }}
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.button>
                                        )}

                                        {/* Out of Stock Badge */}
                                        {product.stock === 0 && (
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-black text-white px-3 py-1 text-xs font-medium">
                                                    Esgotado
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div>
                                        {product.category && (
                                            <span className="text-xs text-gray-400 uppercase tracking-widest">
                                                {product.category}
                                            </span>
                                        )}
                                        <h3 className="font-serif text-lg mt-1 group-hover:text-accent transition-colors">
                                            {product.title}
                                        </h3>
                                        <p className="text-gray-900 font-medium mt-2">
                                            {formatPrice(product.price)}
                                        </p>
                                        {product.stock > 0 && product.stock <= 5 && (
                                            <p className="text-xs text-orange-600 mt-1">
                                                Apenas {product.stock} em estoque
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    // List View
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Link
                                    to={`/shop/product/${product.id}`}
                                    onClick={handleProductClick}
                                    className="group flex gap-6 p-4 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow"
                                >
                                    {/* Image */}
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        {product.category && (
                                            <span className="text-xs text-gray-400 uppercase tracking-widest">
                                                {product.category}
                                            </span>
                                        )}
                                        <h3 className="font-serif text-xl group-hover:text-accent transition-colors">
                                            {product.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="flex flex-col items-end justify-center gap-2">
                                        <span className="text-xl font-medium">{formatPrice(product.price)}</span>
                                        {product.stock > 0 ? (
                                            <button
                                                onClick={(e) => handleAddToCart(product, e)}
                                                className={`px-4 py-2 text-sm rounded-full transition flex items-center gap-2 ${addedProductId === product.id
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-black text-white hover:bg-accent hover:text-black'
                                                    }`}
                                            >
                                                {addedProductId === product.id ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Adicionado!
                                                    </>
                                                ) : (
                                                    'Adicionar'
                                                )}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Esgotado</span>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>
        </div>
    );
};
