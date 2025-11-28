"use client";

import * as React from "react";
import { Play, ShoppingCart, CreditCard } from "lucide-react";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92";

type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
};

type WatchProviders = {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
};

interface MovieWatchProvidersProps {
  watchProviders?: WatchProviders;
}

export default function MovieWatchProviders({ watchProviders }: MovieWatchProvidersProps) {
  if (!watchProviders || (!watchProviders.flatrate && !watchProviders.rent && !watchProviders.buy)) {
    return null;
  }

  const hasAnyProviders = 
    (watchProviders.flatrate && watchProviders.flatrate.length > 0) ||
    (watchProviders.rent && watchProviders.rent.length > 0) ||
    (watchProviders.buy && watchProviders.buy.length > 0);

  if (!hasAnyProviders) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Where to Watch</h3>
      
      {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Play className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-medium text-neutral-300">Stream</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {watchProviders.flatrate.map((provider) => (
              <div
                key={provider.provider_id}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 border border-white/10 transition-colors"
                title={provider.provider_name}
              >
                {provider.logo_path ? (
                  <img
                    src={`${IMAGE_BASE_URL}${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="h-6 w-auto object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-xs text-neutral-300">${provider.provider_name}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-xs text-neutral-300">{provider.provider_name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {watchProviders.rent && watchProviders.rent.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-medium text-neutral-300">Rent</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {watchProviders.rent.map((provider) => (
              <div
                key={provider.provider_id}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 border border-white/10 transition-colors"
                title={provider.provider_name}
              >
                {provider.logo_path ? (
                  <img
                    src={`${IMAGE_BASE_URL}${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="h-6 w-auto object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-xs text-neutral-300">${provider.provider_name}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-xs text-neutral-300">{provider.provider_name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {watchProviders.buy && watchProviders.buy.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-medium text-neutral-300">Buy</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {watchProviders.buy.map((provider) => (
              <div
                key={provider.provider_id}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 border border-white/10 transition-colors"
                title={provider.provider_name}
              >
                {provider.logo_path ? (
                  <img
                    src={`${IMAGE_BASE_URL}${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="h-6 w-auto object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-xs text-neutral-300">${provider.provider_name}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-xs text-neutral-300">{provider.provider_name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}







