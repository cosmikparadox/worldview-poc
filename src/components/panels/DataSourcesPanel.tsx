import { useState, useMemo } from "react";
import { DATA_SOURCE_CATALOG, CATEGORIES } from "../../config/dataSources";
import type { DataSourceConfig } from "../../config/dataSources";
import { useLayerStore } from "../../stores/useLayerStore";
import type { LayerId } from "../../stores/useLayerStore";
import { useDataSourceStore } from "../../stores/useDataSourceStore";

function StatusBadge({ config }: { config: DataSourceConfig }) {
  const feeds = useDataSourceStore((s) => s.feeds);
  const feed = config.layerId ? feeds[config.layerId] : null;

  if (config.status === "requires-key") {
    return <span className="ds-badge ds-badge-key">KEY REQUIRED</span>;
  }
  if (config.status === "available") {
    return <span className="ds-badge ds-badge-available">AVAILABLE</span>;
  }
  if (feed?.status === "success") {
    return <span className="ds-badge ds-badge-live">LIVE · {feed.count}</span>;
  }
  if (feed?.status === "loading") {
    return <span className="ds-badge ds-badge-loading">LOADING</span>;
  }
  if (feed?.status === "error") {
    return <span className="ds-badge ds-badge-error" title={feed.error || ""}>{feed.error?.slice(0, 20) || "ERROR"}</span>;
  }
  return <span className="ds-badge ds-badge-idle">IDLE</span>;
}

function timeSince(date: Date | null): string {
  if (!date) return "";
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

function SourceCard({ config }: { config: DataSourceConfig }) {
  const [expanded, setExpanded] = useState(false);
  const layers = useLayerStore((s) => s.layers);
  const toggle = useLayerStore((s) => s.toggle);
  const feeds = useDataSourceStore((s) => s.feeds);
  const feed = config.layerId ? feeds[config.layerId] : null;
  const isActive = config.layerId ? layers[config.layerId as LayerId] : false;
  const catColor = CATEGORIES.find((c) => c.id === config.category)?.color || "#888";

  return (
    <div className={`ds-card ${expanded ? "ds-card-expanded" : ""}`}>
      <div className="ds-card-header" onClick={() => setExpanded((v) => !v)}>
        <div className="ds-card-left">
          <span className="ds-dot" style={{ background: catColor }} />
          <div>
            <div className="ds-card-name">{config.name}</div>
            <div className="ds-card-provider">{config.provider}</div>
          </div>
        </div>
        <div className="ds-card-right">
          <StatusBadge config={config} />
          {config.layerId && config.status === "active" && (
            <button
              className={`ds-toggle ${isActive ? "ds-toggle-on" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                toggle(config.layerId as LayerId);
              }}
            >
              <span className="ds-toggle-knob" />
            </button>
          )}
          <span className={`ds-chevron ${expanded ? "ds-chevron-open" : ""}`}>&#9662;</span>
        </div>
      </div>
      {expanded && (
        <div className="ds-card-body">
          <p className="ds-desc">{config.description}</p>
          <div className="ds-meta-grid">
            <div className="ds-meta-item">
              <span className="ds-meta-label">Endpoint</span>
              <span className="ds-meta-value">{config.endpoint}</span>
            </div>
            <div className="ds-meta-item">
              <span className="ds-meta-label">Interval</span>
              <span className="ds-meta-value">{config.interval}</span>
            </div>
            <div className="ds-meta-item">
              <span className="ds-meta-label">Records</span>
              <span className="ds-meta-value">{config.recordType}</span>
            </div>
            {feed?.lastUpdated && (
              <div className="ds-meta-item">
                <span className="ds-meta-label">Last fetch</span>
                <span className="ds-meta-value">{timeSince(feed.lastUpdated)}</span>
              </div>
            )}
            {feed?.count != null && feed.count > 0 && (
              <div className="ds-meta-item">
                <span className="ds-meta-label">Items</span>
                <span className="ds-meta-value ds-meta-count">{feed.count.toLocaleString()}</span>
              </div>
            )}
            {feed?.error && (
              <div className="ds-meta-item ds-meta-error">
                <span className="ds-meta-label">Error</span>
                <span className="ds-meta-value">{feed.error}</span>
              </div>
            )}
          </div>
          {config.docs && (
            <a className="ds-docs-link" href={config.docs} target="_blank" rel="noopener noreferrer">
              View API docs &#8599;
            </a>
          )}
          {config.requiresKey && (
            <div className="ds-key-notice">
              Set <code>{config.keyEnvVar}</code> in your .env to activate this source.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DataSourcesPanel() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let results = DATA_SOURCE_CATALOG;
    if (filterCat) {
      results = results.filter((s) => s.category === filterCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [search, filterCat]);

  const activeCount = DATA_SOURCE_CATALOG.filter((s) => s.status === "active").length;
  const totalCount = DATA_SOURCE_CATALOG.length;

  return (
    <div className="ds-panel">
      <div className="ds-search-wrap">
        <input
          className="ds-search"
          type="text"
          placeholder="Search data sources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="ds-search-clear" onClick={() => setSearch("")}>
            &times;
          </button>
        )}
      </div>

      <div className="ds-cat-pills">
        <button
          className={`ds-cat-pill ${filterCat === null ? "ds-cat-active" : ""}`}
          onClick={() => setFilterCat(null)}
        >
          All ({totalCount})
        </button>
        {CATEGORIES.map((cat) => {
          const count = DATA_SOURCE_CATALOG.filter((s) => s.category === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`ds-cat-pill ${filterCat === cat.id ? "ds-cat-active" : ""}`}
              style={{ "--cat-color": cat.color } as React.CSSProperties}
              onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="ds-summary">
        <span>{activeCount} active</span>
        <span className="ds-summary-sep">/</span>
        <span>{totalCount} total sources</span>
      </div>

      <div className="ds-list">
        {filtered.map((config) => (
          <SourceCard key={config.id} config={config} />
        ))}
        {filtered.length === 0 && (
          <div className="ds-empty">No data sources match your search.</div>
        )}
      </div>
    </div>
  );
}
