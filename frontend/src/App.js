import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3051';

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2025-11-01');
  const [filteredTag, setFilteredTag] = useState('');
  const [filteredRating, setFilteredRating] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dates`);
      if (response.data.length > 0 && !selectedDate) {
        setSelectedDate(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
    }
  };

  useEffect(() => {
    fetchDates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, filteredTag, filteredRating]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/articles/${selectedDate}`);
      let filtered = response.data;
      
      if (filteredTag) {
        filtered = filtered.filter(article => 
          article.tags.includes(filteredTag)
        );
      }
      
      if (filteredRating) {
        filtered = filtered.filter(article => 
          article.rating === parseInt(filteredRating)
        );
      }
      
      setArticles(filtered);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (articleId, newRating) => {
    try {
      const response = await axios.put(`${API_URL}/api/articles/${articleId}/rating`, {
        rating: newRating
      });
      
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === articleId ? response.data : article
        )
      );
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const allTags = [...new Set(articles.flatMap(article => article.tags))].sort();

  return (
    <div className="min-h-screen bg-beige-50">
      <header className="bg-brown-950 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Explorateur d'articles Self Daily</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date selector */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-transparent"
              />
            </div>

            {/* Tag filter */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-2">
                Rechercher par tag
              </label>
              <select
                value={filteredTag}
                onChange={(e) => setFilteredTag(e.target.value)}
                className="w-full px-4 py-2 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-transparent"
              >
                <option value="">Tous les tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Rating filter */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-2">
                Rechercher par notation
              </label>
              <select
                value={filteredRating}
                onChange={(e) => setFilteredRating(e.target.value)}
                className="w-full px-4 py-2 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-transparent"
              >
                <option value="">Toutes les notes</option>
                <option value="1">⭐ 1 étoile</option>
                <option value="2">⭐⭐ 2 étoiles</option>
                <option value="3">⭐⭐⭐ 3 étoiles</option>
                <option value="4">⭐⭐⭐⭐ 4 étoiles</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 étoiles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date display */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-brown-800">
            {formatDate(selectedDate)}
            {!loading && articles.length > 0 && (
              <span className="ml-3 text-lg font-normal text-brown-600">
                ({articles.length} article{articles.length > 1 ? 's' : ''})
              </span>
            )}
          </h2>
        </div>

        {/* Articles grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
            <p className="mt-4 text-brown-700">Chargement des articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brown-700 text-lg">Aucun article trouvé pour cette date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onRatingChange={handleRatingChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ArticleCard({ article, onRatingChange }) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (rating) => {
    // Toggle logic: if clicking the same rating, set to 0
    const newRating = article.rating === rating ? 0 : rating;
    onRatingChange(article.id, newRating);
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Card content */}
      <div className="p-6">
        <h3 className="mb-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brown-900 font-semibold text-lg hover:text-brown-700 hover:underline"
          >
            {article.title}
          </a>
        </h3>
        
        <p className="text-brown-700 text-sm mb-4 leading-relaxed">
          {article.summary_fr}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-beige-200 text-brown-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Rating stars */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              type="button"
              onClick={() => handleStarClick(rating)}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-2xl focus:outline-none transition-all duration-150"
              aria-label={`${rating} étoile${rating > 1 ? 's' : ''}`}
            >
              {rating <= (hoveredRating || article.rating) ? (
                <span className="text-yellow-500">⭐</span>
              ) : (
                <span className="text-gray-300">☆</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export default App;

