import React, { useState } from 'react';
import { Search, Loader2, Sun, Droplet, Dog, Home, MapPin, X, Navigation, Filter, ChevronDown, ChevronUp, ExternalLink, Plus, Check } from 'lucide-react';
import { getPlantRecommendations } from '../services/api';
import { Plant, PlantRecommendation, RecommendationRequest } from '../types';

interface SelectionCardProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  title: string;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
  active,
  onClick,
  icon: Icon,
  title
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 ${active
      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-100 transform scale-[1.02]'
      : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-emerald-200'
      }`}
  >
    <Icon className={`w-8 h-8 mb-3 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
    <span className="text-sm font-bold">{title}</span>
  </button>
);

type SortOption = 'default' | 'difficulty' | 'light' | 'water' | 'name';

interface RecommendationEngineProps {
  onAddPlant: (plant: Plant) => void;
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ onAddPlant }) => {
  const [preferences, setPreferences] = useState<RecommendationRequest>({
    location: '',
    environment: 'indoor',
    lightLevel: 'medium',
    maintenance: 'medium',
    petSafe: false,
    notes: ''
  });
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);
  const [plantImages, setPlantImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [addedPlants, setAddedPlants] = useState<Set<string>>(new Set());

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          const address = data.address;
          // Construct a location string focusing on City/Region + Country
          const city = address.city || address.town || address.village || address.state_district;
          const state = address.state;
          const country = address.country;

          const locationParts = [city, state, country].filter(Boolean);
          const locationString = locationParts.join(', ');

          setPreferences(prev => ({ ...prev, location: locationString }));
        } catch (err) {
          console.error("Geocoding error:", err);
          setError("Could not retrieve address details. Please try again.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to retrieve location. Please allow location access.");
        setIsLocating(false);
      }
    );
  };

  // Helper to generate AI image URLs as fallback
  const getAiPlantImage = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const encodedName = encodeURIComponent(name);
    return `https://image.pollinations.ai/prompt/photorealistic%20close%20up%20shot%20of%20${encodedName}%20plant%20in%20a%20beautiful%20pot%20indoor%20soft%20lighting?width=600&height=400&nologo=true&seed=${seed}`;
  };

  // Function to fetch real images from Wikipedia (proxy for search)
  const fetchPlantImages = async (plants: PlantRecommendation[]) => {
    const images: Record<string, string> = {};

    await Promise.all(plants.map(async (plant) => {
      let imageUrl = getAiPlantImage(plant.name); // Default fallback

      try {
        // Try fetching from Wikipedia using Scientific Name (most accurate)
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(plant.scientificName)}&pithumbsize=600&origin=*&redirects=1`;
        const response = await fetch(wikiUrl);
        const data = await response.json();
        const pages = data.query?.pages;

        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            imageUrl = pages[pageId].thumbnail.source;
          } else {
            // If scientific name fails, try Common Name
            const commonUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(plant.name)}&pithumbsize=600&origin=*&redirects=1`;
            const commonRes = await fetch(commonUrl);
            const commonData = await commonRes.json();
            const commonPages = commonData.query?.pages;
            if (commonPages) {
              const commonPageId = Object.keys(commonPages)[0];
              if (commonPageId !== '-1' && commonPages[commonPageId].thumbnail) {
                imageUrl = commonPages[commonPageId].thumbnail.source;
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch wiki image", error);
      }

      images[plant.name] = imageUrl;
    }));

    setPlantImages(images);
  };

  const handleSearch = async () => {
    console.log('Search triggered. Current location:', preferences.location);
    console.log('Location length:', preferences.location.length);
    console.log('Location trimmed:', preferences.location.trim());
    console.log('Preferences object:', preferences);

    if (!preferences.location.trim()) {
      setError(`Please detect your location first. Current value: "${preferences.location}"`);
      return;
    }
    setLoading(true);
    setError(null);
    setExpandedIndex(null); // Reset expansion on new search
    setPlantImages({}); // Clear old images
    setAddedPlants(new Set()); // Reset added status

    try {
      const results = await getPlantRecommendations(preferences);
      setRecommendations(results);
      // Fetch images after getting the plant list
      await fetchPlantImages(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  const addToGarden = (plant: PlantRecommendation, imageUrl: string) => {
    // Estimate water days
    const waterText = plant.waterNeeds.toLowerCase();
    let days = 7;
    if (waterText.includes('daily') || waterText.includes('every day')) days = 1;
    else if (waterText.includes('2-3') || waterText.includes('2 to 3')) days = 2;
    else if (waterText.includes('3-4') || waterText.includes('3 to 4')) days = 3;
    else if (waterText.includes('week')) days = 7;
    else if (waterText.includes('month')) days = 30;

    const newPlant: Plant = {
      id: crypto.randomUUID(),
      name: plant.name,
      species: plant.scientificName,
      location: preferences.environment === 'indoor' ? 'Indoor' : 'Balcony',
      waterScheduleDays: days,
      lastWatered: new Date().toISOString(),
      imageUrl: imageUrl,
      notes: `Difficulty: ${plant.difficulty}. Light: ${plant.lightNeeds}. Water: ${plant.waterNeeds}`
    };

    onAddPlant(newPlant);
    setAddedPlants(prev => new Set(prev).add(plant.name));
  };

  const getLevelValue = (text: string): number => {
    const t = text.toLowerCase();
    if (t.includes('low') || t.includes('easy')) return 1;
    if (t.includes('medium') || t.includes('moderate')) return 2;
    if (t.includes('high') || t.includes('hard') || t.includes('difficult') || t.includes('bright')) return 3;
    return 2; // default
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'difficulty':
        return getLevelValue(a.difficulty) - getLevelValue(b.difficulty);
      case 'light':
        return getLevelValue(a.lightNeeds) - getLevelValue(b.lightNeeds);
      case 'water':
        return getLevelValue(a.waterNeeds) - getLevelValue(b.waterNeeds);
      default:
        return 0;
    }
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="py-8 space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-800 tracking-tight mb-4">Find Your Perfect Plant</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">Let our AI botanist match you with plants that thrive in your Indian balcony garden.</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">

        {/* Location Section */}
        <div className="mb-10">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 ml-1">
            <MapPin className="w-4 h-4" /> Location
          </label>

          {!preferences.location ? (
            <button
              onClick={handleAutoDetect}
              disabled={isLocating}
              className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-emerald-500">
                {isLocating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Navigation className="w-8 h-8" />}
              </div>
              <span className="font-bold text-xl mb-1">
                {isLocating ? "Detecting location..." : "Auto-Detect My Location"}
              </span>
              <span className="text-sm opacity-70 font-medium">
                Click to automatically find your city for climate-specific advice
              </span>
            </button>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center justify-between animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Selected Location</p>
                  <p className="text-2xl font-bold text-slate-800">{preferences.location}</p>
                </div>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, location: '' })}
                className="p-3 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-all shadow-sm hover:shadow-md"
                title="Remove location"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Environment</label>
            <div className="grid grid-cols-2 gap-4">
              <SelectionCard
                active={preferences.environment === 'indoor'}
                onClick={() => setPreferences({ ...preferences, environment: 'indoor' })}
                icon={Home}
                title="Indoor Balcony"
              />
              <SelectionCard
                active={preferences.environment === 'outdoor'}
                onClick={() => setPreferences({ ...preferences, environment: 'outdoor' })}
                icon={Sun}
                title="Open Terrace"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Light Level</label>
            <div className="grid grid-cols-3 gap-4">
              {['low', 'medium', 'high'].map((level) => (
                <SelectionCard
                  key={level}
                  active={preferences.lightLevel === level}
                  onClick={() => setPreferences({ ...preferences, lightLevel: level as any })}
                  icon={Sun}
                  title={level.charAt(0).toUpperCase() + level.slice(1)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Care Level</label>
            <div className="grid grid-cols-3 gap-4">
              {['low', 'medium', 'high'].map((level) => (
                <SelectionCard
                  key={level}
                  active={preferences.maintenance === level}
                  onClick={() => setPreferences({ ...preferences, maintenance: level as any })}
                  icon={Droplet}
                  title={level.charAt(0).toUpperCase() + level.slice(1)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Safety</label>
            <button
              onClick={() => setPreferences({ ...preferences, petSafe: !preferences.petSafe })}
              className={`w-full h-[108px] flex items-center justify-between p-6 rounded-3xl border transition-all ${preferences.petSafe
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md'
                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center space-x-5">
                <Dog className={`w-8 h-8 ${preferences.petSafe ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="font-bold text-lg">Pet Friendly</span>
              </div>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${preferences.petSafe ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                }`}>
                {preferences.petSafe && <div className="w-3 h-3 bg-white rounded-full" />}
              </div>
            </button>
          </div>
        </div>

        <div className="mt-10">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1 mb-4 block">Special Requests</label>
          <textarea
            className="w-full bg-slate-50 border-0 rounded-3xl p-6 text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-medium placeholder:text-slate-400 text-lg"
            rows={2}
            placeholder="e.g. I want flowering plants, or plants for a north-facing balcony..."
            value={preferences.notes}
            onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full mt-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 px-6 rounded-full shadow-lg hover:shadow-emerald-200 transition-all active:scale-[0.99] flex items-center justify-center space-x-3 text-lg"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Search className="w-6 h-6" />
          )}
          <span>{loading ? 'Curating your balcony garden...' : 'Find My Perfect Plants'}</span>
        </button>
      </div>

      {error && (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* Results Grid */}
      {recommendations.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-8">

          {/* Sorting Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-2">
            <h3 className="text-xl font-bold text-slate-800">
              Recommended Plants <span className="text-slate-400 text-sm font-normal ml-2">({recommendations.length})</span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                <Filter className="w-4 h-4" /> Sort by:
              </span>
              <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => setSortOption('default')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortOption === 'default' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Best Match
                </button>
                <button
                  onClick={() => setSortOption('difficulty')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortOption === 'difficulty' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Difficulty
                </button>
                <button
                  onClick={() => setSortOption('light')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortOption === 'light' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Light
                </button>
                <button
                  onClick={() => setSortOption('water')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortOption === 'water' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Water
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRecommendations.map((plant, index) => {
              const isExpanded = expandedIndex === index;
              const imageUrl = plantImages[plant.name] || getAiPlantImage(plant.name);

              return (
                <div key={index} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden relative">

                  {/* Image Section */}
                  <div className="h-56 w-full relative bg-slate-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-600 uppercase tracking-wide border border-slate-100 shadow-sm">
                      {plant.difficulty} Care
                    </div>
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-90"></div>

                    {/* Title overlaid on image */}
                    <div className="absolute bottom-0 left-0 p-5 w-full">
                      <h3 className="font-bold text-2xl text-white mb-0.5 leading-tight">{plant.name}</h3>
                      <p className="text-sm text-emerald-100 italic font-medium opacity-90 truncate">{plant.scientificName}</p>
                    </div>

                    {/* Google Search Link Button */}
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(plant.name + ' plant care india')}&tbm=isch`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 left-4 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                      title="Search on Google Images"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-1">

                    {/* Collapsible Content */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                        {plant.description}
                      </p>

                      <div className="space-y-4 bg-slate-50 p-4 rounded-xl mb-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Care Requirements</h4>

                        <div className="flex items-start space-x-3 text-sm">
                          <Sun className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-semibold text-slate-700 mb-0.5">Sunlight Needs</span>
                            <span className="text-slate-600 leading-snug">{plant.lightNeeds}</span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 text-sm">
                          <Droplet className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-semibold text-slate-700 mb-0.5">Watering Frequency</span>
                            <span className="text-slate-600 leading-snug">{plant.waterNeeds}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Toggle and Add Buttons */}
                    <div className="mt-auto pt-4 flex gap-3">
                      <button
                        onClick={() => toggleExpand(index)}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                      >
                        <span>{isExpanded ? 'Less' : 'Details'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => addToGarden(plant, imageUrl)}
                        disabled={addedPlants.has(plant.name)}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all shadow-sm ${addedPlants.has(plant.name)
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-200'
                          }`}
                      >
                        {addedPlants.has(plant.name) ? (
                          <>
                            <Check className="w-4 h-4" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};