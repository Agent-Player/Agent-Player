import React, { useState, useEffect } from 'react';
import { marketplaceService } from '../../services';
import type { MarketplaceItem, MarketplaceCategory } from '../../types/marketplace';
import './Marketplace.css';

interface MarketplaceDashboardProps {
  className?: string;
}

export const MarketplaceDashboard: React.FC<MarketplaceDashboardProps> = ({
  className = ''
}) => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData, featuredData] = await Promise.all([
        marketplaceService.getItems({ limit: 50 }),
        marketplaceService.getCategories(),
        marketplaceService.getFeaturedItems(6)
      ]);
      
      setItems(itemsData.data.items);
      setCategories(categoriesData.data);
      setFeaturedItems(featuredData.data);
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const searchResult = await marketplaceService.search({
        query: searchTerm,
        category_id: selectedCategory || undefined,
        item_type: itemTypeFilter === 'all' ? undefined : itemTypeFilter,
        sort_by: sortBy,
        limit: 50
      });
      
      setItems(searchResult.data.items);
    } catch (error) {
      console.error('Failed to search marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm || selectedCategory || itemTypeFilter !== 'all' || sortBy !== 'popularity') {
      const timeoutId = setTimeout(handleSearch, 300);
      return () => clearTimeout(timeoutId);
    } else {
      loadData();
    }
  }, [searchTerm, selectedCategory, itemTypeFilter, sortBy]);

  const handlePurchase = async (itemId: number) => {
    try {
      const purchase = await marketplaceService.purchaseItem(itemId);
      console.log('Purchase successful:', purchase);
      // Show success notification or redirect to purchase confirmation
      alert('Purchase successful! The item has been added to your library.');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const handleViewDetails = (itemId: number) => {
    window.location.href = `/marketplace/item/${itemId}`;
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return `${currency} ${price.toFixed(2)}`;
  };

  if (loading && items.length === 0) {
    return (
      <div className={`marketplace-dashboard ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`marketplace-dashboard ${className}`}>
      {/* Header */}
      <div className="marketplace-header">
        <div className="header-content">
          <h1>AI Marketplace</h1>
          <p>Discover and purchase AI agents, templates, and workflows</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => window.location.href = '/marketplace/sell'}
        >
          <i className="icon-upload"></i>
          Sell Your Items
        </button>
      </div>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="featured-section">
          <h2>Featured Items</h2>
          <div className="featured-grid">
            {featuredItems.map(item => (
              <div key={item.id} className="featured-card">
                <div className="item-image">
                  {item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.title} />
                  ) : (
                    <div className="placeholder-image">
                      <i className={`icon-${item.item_type}`}></i>
                    </div>
                  )}
                  <div className="item-type-badge">
                    {item.item_type}
                  </div>
                </div>
                <div className="item-content">
                  <h4>{item.title}</h4>
                  <p>{item.description.substring(0, 100)}...</p>
                  <div className="item-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`icon-star ${i < Math.round(item.rating_average) ? 'filled' : ''}`}
                        ></i>
                      ))}
                    </div>
                    <span>({item.rating_count})</span>
                  </div>
                  <div className="item-price">
                    {formatPrice(item.price, item.currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <div className="marketplace-filters">
        <div className="search-section">
          <div className="search-box">
            <i className="icon-search"></i>
            <input
              type="text"
              placeholder="Search agents, templates, workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.item_count})
              </option>
            ))}
          </select>
          
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            className="type-filter"
          >
            <option value="all">All Types</option>
            <option value="agent">Agents</option>
            <option value="template">Templates</option>
            <option value="workflow">Workflows</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-filter"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="marketplace-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <i className="icon-marketplace-empty"></i>
            <h3>No items found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="marketplace-item-card">
              <div className="item-image">
                {item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} />
                ) : (
                  <div className="placeholder-image">
                    <i className={`icon-${item.item_type}`}></i>
                  </div>
                )}
                <div className="item-badges">
                  <span className={`type-badge type-${item.item_type}`}>
                    {item.item_type}
                  </span>
                  {item.is_trending && (
                    <span className="trending-badge">Trending</span>
                  )}
                </div>
              </div>
              
              <div className="item-content">
                <h4>{item.title}</h4>
                <p className="item-description">
                  {item.description.length > 120 
                    ? `${item.description.substring(0, 120)}...`
                    : item.description
                  }
                </p>
                
                <div className="item-seller">
                  <i className="icon-user"></i>
                  <span>{item.seller_name || 'Anonymous'}</span>
                </div>
                
                <div className="item-tags">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="more-tags">+{item.tags.length - 3}</span>
                  )}
                </div>
                
                <div className="item-stats">
                  <div className="rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`icon-star ${i < Math.round(item.rating_average) ? 'filled' : ''}`}
                        ></i>
                      ))}
                    </div>
                    <span>({item.rating_count})</span>
                  </div>
                  <div className="downloads">
                    <i className="icon-download"></i>
                    <span>{item.downloads}</span>
                  </div>
                </div>
                
                <div className="item-footer">
                  <div className="price">
                    {formatPrice(item.price, item.currency)}
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleViewDetails(item.id)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handlePurchase(item.id)}
                    >
                      {item.price === 0 ? 'Get Free' : 'Purchase'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {loading && items.length > 0 && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}; 