# Portfolio Backtester

An interactive web app for simulating and analyzing stock portfolio strategies using real historical market data. Users can select custom portfolios, adjust allocations, and view performance metrics.

Built with a **FastAPI** backend (containerized with Docker) and a **Next.js** frontend, the app is deployed to the cloud and optimized for speed and usability.

🔗 **Live Site**: [cheery-tiramisu-028ceb.netlify.app](https://cheery-tiramisu-028ceb.netlify.app)

## ⚙️ Features

- **Custom Portfolio Backtesting**  
  Select from a list of **S&P 500 companies**, assign weightings, and simulate performance over time.

- **Optimized Data Loading**  
  Replaced slow CSV files with **Pickle**-based storage, massively reducing data load times.

- **Backend Analytics Engine**  
  Uses **Pandas** and **NumPy** for efficient computation and metric generation.

- **Dockerized Backend**  
  FastAPI is fully containerized with **Docker**, enabling smooth and portable cloud deployment.

- **Fully Deployed to the Cloud**  
  - **Backend**: Azure App Service (Dockerized FastAPI)  
  - **Frontend**: Netlify (Next.js React app)

---

## 🛠 Tech Stack

| Layer        | Tech Stack                        |
|--------------|-----------------------------------|
| Frontend     | Next.js, React                    |
| Backend      | FastAPI (Python), Docker          |
| Data Tools   | Pandas, NumPy                     |
| Hosting      | Netlify, Microsoft Azure          |

---

## Future Plans
- Support for multiple portfolio comparisons
- Add ETF selections
- Graphs showing sub-component performance (per stock)
- Discounted Cash Flow (DCF) valuation page
- Monte Carlo simulation page
- Interactive chatbot to describe portfolio styles
- User accounts with saved portfolios

---
