import React, { useState, useEffect, useRef } from "react";

// ==================== CONSTANTES ====================
const COLORS = {
  bg: "#0a0e1a",
  surface: "#0f1629",
  surfaceAlt: "#141c35",
  border: "#1e2d5a",
  borderBright: "#2a3f7a",
  accent: "#00d4ff",
  accentGlow: "#00a8cc",
  buy: "#00e676",
  buyDim: "#00c853",
  sell: "#ff5252",
  sellDim: "#d32f2f",
  text: "#e0e8ff",
  textDim: "#6b7db3",
  textMuted: "#3d4f80",
  gold: "#ffd54f",
  purple: "#b39ddb",
};

// ==================== COMPONENTES UI ====================
const ProbBar = ({ value }) => {
  const color = value >= 85 ? COLORS.buy : value >= 75 ? COLORS.accent : COLORS.gold;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#1e2d5a", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease", boxShadow: `0 0 8px ${color}` }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 44, fontFamily: "monospace" }}>{value.toFixed(1)}%</span>
    </div>
  );
};

const Badge = ({ children, color, bg }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, color, background: bg, letterSpacing: "0.5px", fontFamily: "monospace" }}>
    {children}
  </span>
);

const IndicatorPill = ({ label, value, ok }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 4, background: ok ? "rgba(0,230,118,0.08)" : "rgba(255,82,82,0.08)", border: `1px solid ${ok ? "rgba(0,230,118,0.2)" : "rgba(255,82,82,0.2)"}` }}>
    <span style={{ fontSize: 9, color: ok ? COLORS.buy : COLORS.sell }}>{"●"}</span>
    <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "monospace" }}>{label}:</span>
    <span style={{ fontSize: 11, color: ok ? COLORS.buy : COLORS.sell, fontWeight: 600, fontFamily: "monospace" }}>{value}</span>
  </div>
);

const SignalCard = ({ signal, index }) => {
  const [expanded, setExpanded] = useState(false);
  const isBuy = signal.direction === "COMPRA";
  const dirColor = isBuy ? COLORS.buy : COLORS.sell;
  const dirBg = isBuy ? "rgba(0,230,118,0.08)" : "rgba(255,82,82,0.08)";

  const fmtPrice = (p) => {
    if (!p) return "—";
    const n = parseFloat(p);
    if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (n >= 1) return n.toFixed(4);
    return n.toFixed(6);
  };

  return (
    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderBright}
      onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>

      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${dirColor}22`, border: `1px solid ${dirColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: dirColor, fontFamily: "monospace" }}>
          #{signal.rank}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, letterSpacing: "0.5px" }}>{signal.ticker}</span>
            <Badge color={dirColor} bg={dirBg}>{signal.direction}</Badge>
            <Badge color={COLORS.textDim} bg="rgba(255,255,255,0.04)">{signal.asset_type}</Badge>
            {signal.sector && <Badge color={COLORS.purple} bg="rgba(179,157,219,0.08)">{signal.sector}</Badge>}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 3, fontFamily: "monospace" }}>Score {signal.score} · ADX {signal.indicators?.adx?.toFixed(1)} · VolRel {signal.indicators?.vol_relative?.toFixed(2)}x</div>
        </div>
        <div style={{ textAlign: "right", minWidth: 120 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>PROB. ÉXITO</div>
          <ProbBar value={signal.prob_success} />
        </div>
        <div style={{ color: COLORS.textDim, fontSize: 14, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</div>
      </div>

      <div style={{ padding: "10px 18px", background: "rgba(0,212,255,0.03)", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { label: "ENTRADA", value: fmtPrice(signal.entry_price), color: COLORS.accent },
          { label: "STOP LOSS", value: fmtPrice(signal.stop_loss), color: COLORS.sell },
          { label: "TP1", value: fmtPrice(signal.take_profit_1), color: COLORS.buy },
          { label: "TP2", value: fmtPrice(signal.take_profit_2), color: COLORS.buyDim },
          { label: "R/R TP1", value: `1:${signal.risk_reward_tp1?.toFixed(2)}`, color: COLORS.gold },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "1px", fontFamily: "monospace" }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
          </div>
        ))}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "1px", fontFamily: "monospace" }}>ZONA ENTRADA</div>
          <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: "monospace" }}>{fmtPrice(signal.entry_zone_low)} – {fmtPrice(signal.entry_zone_high)}</div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "1px", fontFamily: "monospace", marginBottom: 8 }}>INDICADORES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {signal.indicators && <>
                <IndicatorPill label="RSI" value={`${signal.indicators.rsi?.toFixed(1)} ↑`} ok={isBuy ? signal.indicators.rsi < 35 : signal.indicators.rsi > 65} />
                <IndicatorPill label="MACD" value={signal.indicators.macd_signal} ok={isBuy ? signal.indicators.macd_signal === "alcista" : signal.indicators.macd_signal === "bajista"} />
                <IndicatorPill label="BB" value={signal.indicators.bb_position?.slice(0, 12)} ok={true} />
                <IndicatorPill label="EMA" value={signal.indicators.ema_order} ok={isBuy ? signal.indicators.ema_order?.includes(">") : signal.indicators.ema_order?.includes("<")} />
                <IndicatorPill label="STOCH K/D" value={`${signal.indicators.stoch_k?.toFixed(0)}/${signal.indicators.stoch_d?.toFixed(0)}`} ok={isBuy ? signal.indicators.stoch_k < 20 : signal.indicators.stoch_k > 80} />
                <IndicatorPill label="ATR" value={fmtPrice(signal.atr)} ok={true} />
              </>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "1px", fontFamily: "monospace", marginBottom: 6 }}>CONDICIONES ✓</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {signal.conditions_met?.map(c => (
                  <span key={c} style={{ padding: "2px 6px", borderRadius: 3, background: "rgba(0,230,118,0.12)", color: COLORS.buy, fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>{c}</span>
                ))}
              </div>
            </div>
            {signal.conditions_failed?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "1px", fontFamily: "monospace", marginBottom: 6 }}>CONDICIONES ✗</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {signal.conditions_failed?.map(c => (
                    <span key={c} style={{ padding: "2px 6px", borderRadius: 3, background: "rgba(255,82,82,0.12)", color: COLORS.sell, fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {signal.key_catalyst && (
            <div style={{ padding: "8px 12px", background: "rgba(0,212,255,0.04)", borderRadius: 6, borderLeft: `2px solid ${COLORS.accent}`, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "monospace" }}>CATALIZADOR: </span>
              <span style={{ fontSize: 12, color: COLORS.text }}>{signal.key_catalyst}</span>
            </div>
          )}
          {signal.risk_note && (
            <div style={{ padding: "8px 12px", background: "rgba(255,213,79,0.04)", borderRadius: 6, borderLeft: `2px solid ${COLORS.gold}` }}>
              <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "monospace" }}>⚠ RIESGO: </span>
              <span style={{ fontSize: 12, color: COLORS.gold }}>{signal.risk_note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LogLine = ({ text, type }) => {
  const colors = { info: COLORS.textDim, success: COLORS.buy, warn: COLORS.gold, error: COLORS.sell, accent: COLORS.accent };
  return (
    <div style={{ fontFamily: "monospace", fontSize: 11, color: colors[type] || COLORS.textDim, padding: "1px 0", lineHeight: 1.6 }}>
      <span style={{ color: COLORS.textMuted }}>[{new Date().toISOString().slice(11, 19)}]</span> {text}
    </div>
  );
};

// ==================== GENERADOR DE DATOS SIMULADOS ====================
const generateMockData = () => {
  const tickers = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AVGO", "ORCL", "AMD", "BTCUSDT", "ETHUSDT", "SOLUSDT", "EURUSD", "GBPUSD", "USDJPY"];
  const assetTypes = ["Acción", "Acción", "Acción", "Acción", "Acción", "Acción", "Acción", "Acción", "Acción", "Acción", "Cripto", "Cripto", "Cripto", "Forex", "Forex", "Forex"];
  const sectors = ["Tecnología", "Tecnología", "Semiconductores", "Internet", "Comercio", "Redes", "Automotriz", "Semiconductores", "Software", "Semiconductores", "Cripto", "Cripto", "Cripto", "EURUSD", "GBPUSD", "USDJPY"];

  const numSignals = Math.floor(Math.random() * 5) + 2; // entre 2 y 6 señales
  const signals = [];
  const excluded = [];

  for (let i = 0; i < numSignals; i++) {
    const idx = Math.floor(Math.random() * tickers.length);
    const isBuy = Math.random() > 0.5;
    const conditionsMet = ["C1", "C2", "C3", "C4", "C5", "C6"].slice(0, Math.floor(Math.random() * 2) + 5); // al menos 5
    const conditionsFailed = ["C1", "C2", "C3", "C4", "C5", "C6"].filter(c => !conditionsMet.includes(c));

    const rsi = isBuy ? 25 + Math.random() * 10 : 65 + Math.random() * 10;
    const adx = 30 + Math.random() * 20;
    const volRel = 1.3 + Math.random() * 1.2;
    const probBase = (conditionsMet.length / 6) * 60;
    const probAdx = (adx / 50) * 20;
    const probVol = (volRel / 2) * 20;
    const prob = Math.min(probBase + probAdx + probVol, 100);

    const price = 10 + Math.random() * 500;
    const atr = price * (0.005 + Math.random() * 0.02);
    const stop = isBuy ? price - atr * 1.5 : price + atr * 1.5;
    const tp1 = isBuy ? price + atr * 2.5 : price - atr * 2.5;
    const tp2 = isBuy ? price + atr * 4.0 : price - atr * 4.0;

    signals.push({
      rank: i + 1,
      ticker: tickers[idx],
      asset_type: assetTypes[idx],
      sector: sectors[idx],
      direction: isBuy ? "COMPRA" : "VENTA",
      prob_success: prob,
      entry_price: price,
      entry_zone_low: price * 0.995,
      entry_zone_high: price * 1.005,
      stop_loss: stop,
      take_profit_1: tp1,
      take_profit_2: tp2,
      risk_reward_tp1: (Math.abs(tp1 - price) / Math.abs(stop - price)),
      atr: atr,
      score: `${Math.floor(Math.random() * 3) + 7}/10`,
      indicators: {
        rsi: rsi,
        rsi_trend: isBuy ? "subiendo" : "bajando",
        macd_signal: isBuy ? "alcista" : "bajista",
        macd_histogram: isBuy ? "positivo_creciente" : "negativo_creciente",
        bb_position: isBuy ? "cerca de banda inferior" : "cerca de banda superior",
        ema_order: isBuy ? "9>21>50" : "9<21<50",
        adx: adx,
        vol_relative: volRel,
        stoch_k: isBuy ? 10 + Math.random() * 20 : 70 + Math.random() * 20,
        stoch_d: isBuy ? 10 + Math.random() * 20 : 70 + Math.random() * 20,
        stoch_signal: isBuy ? "cruce_alcista" : "cruce_bajista"
      },
      conditions_met: conditionsMet,
      conditions_failed: conditionsFailed,
      key_catalyst: isBuy ? "Fuerte volumen y ruptura de resistencia" : "Sobrecompra y divergencia bajista",
      risk_note: "Alta volatilidad en el corto plazo"
    });
  }

  // Generar algunos near-misses
  for (let i = 0; i < 3; i++) {
    excluded.push({
      ticker: tickers[(i + 3) % tickers.length],
      reason: "ADX por debajo de 30",
      conditions_met: 4,
      adx: 22 + Math.random() * 7
    });
  }

  return {
    screening_timestamp: new Date().toISOString(),
    market_context: "Mercado con tendencia alcista en tecnológicas, volatilidad moderada en criptomonedas. El dólar se mantiene fuerte ante pares mayores.",
    total_analyzed: 300,
    total_passed_filters: signals.length,
    signals: signals.sort((a, b) => b.prob_success - a.prob_success),
    excluded_near_misses: excluded,
    disclaimer: "señales simuladas para análisis educativo únicamente"
  };
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function QuantAnalyst() {
  const [phase, setPhase] = useState("idle");
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [rawResponse, setRawResponse] = useState("");
  const [activeTab, setActiveTab] = useState("signals");
  const logsRef = useRef(null);

  const addLog = (text, type = "info") => setLogs(l => [...l, { text, type, id: Date.now() + Math.random() }]);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  const runScreening = () => {
    setPhase("scanning");
    setLogs([]);
    setResult(null);
    setRawResponse("");

    const logSteps = [
      ["🔌 Iniciando AI Quant Analyst v2.0...", "accent"],
      ["📡 Conectando a fuentes de mercado en tiempo real...", "info"],
      ["📊 Cargando universo: 200 acciones + 50 forex + 50 cripto...", "info"],
      ["⚙️  Calculando RSI(14) para todos los activos...", "info"],
      ["⚙️  Calculando MACD(12,26,9) + histograma...", "info"],
      ["⚙️  Calculando Bollinger Bands(20,2)...", "info"],
      ["⚙️  Calculando EMA 9 / EMA 21 / EMA 50...", "info"],
      ["⚙️  Calculando ADX(14) — filtro crítico ≥30...", "warn"],
      ["⚙️  Calculando Volumen Relativo vs media 20P — filtro crítico ≥1.3...", "warn"],
      ["⚙️  Calculando Estocástico(14,3)...", "info"],
      ["⚙️  Calculando ATR(14) para stops y targets...", "info"],
      ["⚙️  Calculando OBV y funding rates...", "info"],
      ["🔍 Aplicando filtros estrictos: ADX≥30 + VolRel≥1.3 + 5/6 condiciones...", "warn"],
      ["📐 Calculando Probabilidad de Éxito para activos filtrados...", "info"],
      ["🏆 Generando ranking final (mínimo 70% prob. éxito)...", "success"],
    ];

    let delay = 0;
    const runLogs = async () => {
      for (const [text, type] of logSteps) {
        await new Promise(r => setTimeout(r, delay));
        addLog(text, type);
        delay = 350 + Math.random() * 300;
      }
      await new Promise(r => setTimeout(r, 800));
      const mockData = generateMockData();
      setResult(mockData);
      setRawResponse(JSON.stringify(mockData, null, 2));
      if (mockData.signals.length > 0) {
        addLog(`🎯 ${mockData.signals.length} señal(es) con ≥70% prob. éxito encontrada(s) de ${mockData.total_analyzed} analizados`, "success");
        mockData.signals.forEach(s => {
          addLog(`   → #${s.rank} ${s.ticker} (${s.direction}) | Prob: ${s.prob_success?.toFixed(1)}% | Score: ${s.score}`, "accent");
        });
      } else {
        addLog("⚠️  No se encontraron activos con alta probabilidad de éxito", "warn");
      }
      setPhase("done");
    };

    runLogs();
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.accent}44)`, border: `1px solid ${COLORS.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "0.5px", color: COLORS.text }}>AI QUANT ANALYST</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "2px", fontFamily: "monospace" }}>AUTONOMOUS MARKET SCREENER v2.0 (SIMULADO)</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>
            {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })} {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} UTC
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: phase === "scanning" ? "rgba(0,212,255,0.1)" : phase === "done" ? "rgba(0,230,118,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${phase === "scanning" ? COLORS.accent + "44" : phase === "done" ? COLORS.buy + "44" : COLORS.border}` }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: phase === "scanning" ? COLORS.accent : phase === "done" ? COLORS.buy : COLORS.textMuted, display: "inline-block", animation: phase === "scanning" ? "pulse 1s infinite" : "none" }} />
            <span style={{ fontSize: 10, color: phase === "scanning" ? COLORS.accent : phase === "done" ? COLORS.buy : COLORS.textMuted, fontFamily: "monospace", fontWeight: 700 }}>
              {phase === "idle" ? "STANDBY" : phase === "scanning" ? "SCANNING" : phase === "done" ? "COMPLETE" : "ERROR"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "UNIVERSO", value: "300+", sub: "activos" },
            { label: "CLASES", value: "3", sub: "acciones · forex · cripto" },
            { label: "INDICADORES", value: "10", sub: "por activo" },
            { label: "FILTRO ADX", value: "≥30", sub: "tendencia fuerte" },
            { label: "CONDICIONES", value: "5/6", sub: "mínimo requerido" },
            { label: "PROB. MÍN.", value: "70%", sub: "para listarse" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ flex: "1 1 120px", padding: "10px 14px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
              <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "1.5px", fontFamily: "monospace" }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.accent, fontFamily: "monospace", lineHeight: 1.2 }}>{value}</div>
              <div style={{ fontSize: 10, color: COLORS.textDim }}>{sub}</div>
            </div>
          ))}
        </div>

        <button
          onClick={runScreening}
          disabled={phase === "scanning"}
          style={{
            width: "100%", padding: "16px", borderRadius: 10, border: `1px solid ${COLORS.accent}44`,
            background: phase === "scanning" ? "rgba(0,212,255,0.05)" : `linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,168,204,0.1))`,
            color: phase === "scanning" ? COLORS.textDim : COLORS.accent,
            fontSize: 15, fontWeight: 800, letterSpacing: "1px", cursor: phase === "scanning" ? "not-allowed" : "pointer",
            marginBottom: 20, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
          }}>
          {phase === "scanning" ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
              ANALIZANDO MERCADO...
            </>
          ) : (
            <>⚡ EJECUTAR SCREENING COMPLETO</>
          )}
        </button>

        {logs.length > 0 && (
          <div style={{ background: "#050810", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, maxHeight: 220, overflowY: "auto" }} ref={logsRef}>
            <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "2px", fontFamily: "monospace", marginBottom: 8 }}>TERMINAL OUTPUT</div>
            {logs.map(l => <LogLine key={l.id} text={l.text} type={l.type} />)}
            {phase === "scanning" && <div style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.accent }}>▋</div>}
          </div>
        )}

        {result && (
          <div>
            {result.market_context && (
              <div style={{ padding: "12px 16px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, marginBottom: 16, borderLeft: `3px solid ${COLORS.accent}` }}>
                <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: "2px", fontFamily: "monospace", marginBottom: 6 }}>CONTEXTO DE MERCADO</div>
                <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{result.market_context}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 16, fontSize: 11, color: COLORS.textDim, fontFamily: "monospace" }}>
                  <span>📊 Analizados: <b style={{ color: COLORS.text }}>{result.total_analyzed}</b></span>
                  <span>✅ Pasaron filtros: <b style={{ color: result.total_passed_filters > 0 ? COLORS.buy : COLORS.sell }}>{result.total_passed_filters}</b></span>
                  <span>🎯 Señales ≥70%: <b style={{ color: COLORS.accent }}>{result.signals?.length || 0}</b></span>
                </div>
              </div>
            )}

            {(result.signals?.length > 0 || result.excluded_near_misses?.length > 0) && (
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[{ id: "signals", label: `🎯 SEÑALES (${result.signals?.length || 0})` },
                  { id: "near", label: `📉 CERCA DEL CORTE (${result.excluded_near_misses?.length || 0})` },
                  { id: "raw", label: "🔧 JSON RAW" }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${activeTab === tab.id ? COLORS.accent : COLORS.border}`, background: activeTab === tab.id ? "rgba(0,212,255,0.1)" : COLORS.surface, color: activeTab === tab.id ? COLORS.accent : COLORS.textDim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {result.signals?.length === 0 && result.message && (
              <div style={{ padding: 32, textAlign: "center", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.gold, marginBottom: 8 }}>Sin señales de alta probabilidad</div>
                <div style={{ fontSize: 13, color: COLORS.textDim }}>{result.message}</div>
              </div>
            )}

            {activeTab === "signals" && result.signals?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.signals.map((s, i) => <SignalCard key={s.ticker + i} signal={s} index={i} />)}
              </div>
            )}

            {activeTab === "near" && (
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
                {result.excluded_near_misses?.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "monospace" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        {["TICKER", "CONDICIONES ✓", "ADX", "RAZÓN EXCLUSIÓN"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9, color: COLORS.textMuted, letterSpacing: "1.5px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.excluded_near_misses.map((nm, i) => (
                        <tr key={nm.ticker + i} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
                          <td style={{ padding: "9px 14px", fontWeight: 700, color: COLORS.text }}>{nm.ticker}</td>
                          <td style={{ padding: "9px 14px", color: COLORS.gold }}>{nm.conditions_met}/6</td>
                          <td style={{ padding: "9px 14px", color: nm.adx >= 30 ? COLORS.buy : COLORS.sell }}>{nm.adx}</td>
                          <td style={{ padding: "9px 14px", color: COLORS.textDim, fontSize: 11 }}>{nm.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: 24, textAlign: "center", color: COLORS.textDim, fontSize: 12 }}>Sin datos de activos cercanos al corte</div>
                )}
              </div>
            )}

            {activeTab === "raw" && (
              <div style={{ background: "#050810", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, maxHeight: 400, overflowY: "auto" }}>
                <pre style={{ margin: 0, fontSize: 10, color: COLORS.textDim, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{rawResponse}</pre>
              </div>
            )}

            {result.disclaimer && (
              <div style={{ marginTop: 16, padding: "8px 14px", background: "rgba(255,213,79,0.04)", border: `1px solid rgba(255,213,79,0.15)`, borderRadius: 6, fontSize: 10, color: COLORS.gold, fontFamily: "monospace" }}>
                ⚠️ {result.disclaimer}
              </div>
            )}
          </div>
        )}

        {phase === "idle" && (
          <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.4 }}>📡</div>
            <div>Presiona <b style={{ color: COLORS.accent }}>EJECUTAR SCREENING</b> para iniciar el análisis simulado del mercado</div>
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>Filtrará ~300 activos y entregará señales ficticias con ≥70% de probabilidad de éxito</div>
          </div>
        )}

        {phase === "error" && !result && (
          <div style={{ padding: 24, textAlign: "center", background: "rgba(255,82,82,0.06)", border: `1px solid rgba(255,82,82,0.2)`, borderRadius: 10 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>❌</div>
            <div style={{ color: COLORS.sell, fontWeight: 700, marginBottom: 8 }}>Error en el análisis</div>
            <div style={{ color: COLORS.textDim, fontSize: 12 }}>Revisa la consola o intenta nuevamente</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2d5a; border-radius: 2px; }
      `}</style>
    </div>
  );
}
