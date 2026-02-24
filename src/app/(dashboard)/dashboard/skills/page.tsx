'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Download, Trash2, Package, RefreshCw, Github, FolderOpen, HardDrive } from 'lucide-react';

interface LocalSkill {
  name: string;
  version: string;
  description?: string;
  author?: string;
  triggers?: string[];
}

interface MarketplaceSkill {
  name: string;
  description?: string;
  category: string;
  path?: string;
}

export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState<'local' | 'marketplace'>('local');
  const [localSkills, setLocalSkills] = useState<LocalSkill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSkills, setAvailableSkills] = useState<MarketplaceSkill[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLocalSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      if (!res.ok) {
        console.warn('Local skills API returned error:', res.status);
        setLocalSkills([]);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.skills)) {
        setLocalSkills(data.skills);
      } else {
        setLocalSkills([]);
      }
    } catch (error) {
      console.error('Failed to load local skills:', error);
      setLocalSkills([]);
    }
  };

  const fetchAvailableSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills/marketplace/available');
      const data = await res.json();
      if (data.success) {
        setAvailableSkills(data.skills);
        toast.success(`Loaded ${data.count} skills from Anthropic`);
      }
    } catch (error: any) {
      toast.error('Failed to load marketplace skills');
    } finally {
      setLoading(false);
    }
  };

  const installSkill = async (skill: MarketplaceSkill) => {
    try {
      const res = await fetch('/api/skills/marketplace/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: skill.name, skillPath: skill.path }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Skill "${skill.name}" installed to local storage!`);
        // Refresh available skills to update status
        fetchAvailableSkills();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error('Failed to install skill');
    }
  };

  useEffect(() => {
    fetchLocalSkills();
  }, []);

  const filteredLocal = (localSkills || []).filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const filteredAvailable = (availableSkills || []).filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Skills</h2>
          <p className="text-muted-foreground">Manage and install Claude Skills</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Github className="w-5 h-5" />
          <span>anthropics/skills</span>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'local'
              ? 'border-blue-500 text-blue-600 font-semibold'
              : 'border-transparent text-gray-600'
          }`}
        >
          <HardDrive className="w-4 h-4 inline mr-2" />
          Local Skills ({localSkills.length})
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'marketplace'
              ? 'border-blue-500 text-blue-600 font-semibold'
              : 'border-transparent text-gray-600'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Marketplace
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {activeTab === 'marketplace' && (
          <button
            onClick={fetchAvailableSkills}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {activeTab === 'local' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocal.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No local skills found. Skills are loaded from workspace.
            </div>
          ) : (
            filteredLocal.map((skill) => (
              <div key={skill.name} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{skill.name}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">v{skill.version}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{skill.description || 'No description'}</p>
                {skill.author && (
                  <p className="text-xs text-gray-500 mt-2">by {skill.author}</p>
                )}
                {skill.triggers && skill.triggers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {skill.triggers.slice(0, 3).map((trigger) => (
                      <span key={trigger} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                        {trigger}
                      </span>
                    ))}
                    {skill.triggers.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                        +{skill.triggers.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">Loading skills...</div>
          ) : filteredAvailable.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Click "Refresh" to load skills from Anthropic repository
            </div>
          ) : (
            filteredAvailable.map((skill, idx) => (
              <div key={idx} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{skill.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{skill.category}</span>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {skill.description || 'No description'}
                </p>
                <button
                  onClick={() => installSkill(skill)}
                  className="mt-4 w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
