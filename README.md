# Quant Analyst v3

Screener técnico para acciones y ETF de Estados Unidos, desplegado como aplicación React estática en GitHub Pages.

Calcula EMA 9/21/50, RSI 14, MACD 12/26/9, ATR 14, ADX 14, estocástico 14 y volumen relativo. El score indica condiciones técnicas cumplidas: no es una probabilidad de éxito.

## Ejecutar y verificar

```bash
npm ci
npm start
npm test -- --watchAll=false
npm run build
```

Cada push a `main` ejecuta el workflow de GitHub Pages.
