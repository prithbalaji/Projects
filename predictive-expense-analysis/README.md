# Predictive Expense Analysis

A lightweight personal budgeting demo for entering expense items, viewing category totals, and exploring a simple forward projection in a chart.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/predictive-expense-analysis/>.

## Features

- Add expenses with a name, amount, and category.
- Review totals, remaining amount against the demo budget, and a projected total.
- Change the chart horizon to explore the forecast view.
- Example expense records are loaded when no saved records exist.
- Data is stored locally in browser `localStorage` under `expenses`.

## Forecast caveat

This is an illustrative front-end prototype, not a financial forecasting model. Its projection uses a simple fixed assumption and is not trained on historical data. Do not use it as financial advice or rely on it for real budgeting decisions without validating the calculations. Browser storage is not encrypted or synced, so avoid entering sensitive financial information on shared devices.
