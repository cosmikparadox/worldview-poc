import { useCommodities } from "../../hooks/useCommodities";
import type { CommodityPrice } from "../../hooks/useCommodities";

function PriceRow({ c }: { c: CommodityPrice }) {
  const isPositive = c.change >= 0;
  return (
    <div className="cm-row">
      <div className="cm-left">
        <div className="cm-name">{c.name}</div>
        <div className="cm-unit">{c.unit}</div>
      </div>
      <div className="cm-price">
        <span className="cm-value">${c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className={`cm-change ${isPositive ? "cm-up" : "cm-down"}`}>
          {isPositive ? "+" : ""}{c.change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export function CommodityPanel() {
  const { data } = useCommodities();

  if (data.length === 0) return null;

  return (
    <div className="cm-panel">
      <div className="cm-header">
        <span className="cm-icon">$</span>
        <span className="cm-title">COMMODITIES</span>
      </div>
      {data.map((c) => (
        <PriceRow key={c.symbol} c={c} />
      ))}
    </div>
  );
}
