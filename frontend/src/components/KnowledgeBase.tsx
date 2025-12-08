import React, { useState } from 'react';
import { BookOpen, FileText, Search, Filter } from 'lucide-react';

interface KnowledgeBase {
  id: string;
  title: string;
  category: string;
  content: string;
  views: number;
  helpful: number;
}

const KnowledgeBaseComponent: React.FC = () => {
  const [articles] = useState<KnowledgeBase[]>([
    {
      id: '1',
      title: 'Emergency Response Procedures',
      category: 'Procedures',
      content: 'Step-by-step guide for emergency response coordination...',
      views: 234,
      helpful: 189,
    },
    {
      id: '2',
      title: 'Volunteer Training Requirements',
      category: 'Training',
      content: 'Essential training requirements for emergency volunteers...',
      views: 156,
      helpful: 142,
    },
    {
      id: '3',
      title: 'Communication Protocols',
      category: 'Protocols',
      content: 'Standard communication guidelines for emergency operations...',
      views: 198,
      helpful: 171,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filtered = articles.filter(
    (article) =>
      (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === '' || article.category === selectedCategory)
  );

  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <BookOpen className="text-purple-600" />
        Knowledge Base
      </h2>

      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((article) => (
            <div key={article.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <FileText className="text-purple-600" size={20} />
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{article.content}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>📖 {article.views} views</span>
                    <span>👍 {article.helpful} found helpful</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded whitespace-nowrap">
                  {article.category}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No articles found</div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseComponent;
