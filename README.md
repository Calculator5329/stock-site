# 📊 Portfolio Backtester

An interactive web app that lets you simulate and analyze stock portfolio strategies using real historical data. Built with a **FastAPI** backend and **Next.js** frontend, the app lets users test allocations, tweak settings, and view backtest results and portfolio metrics.

🔗 **Live Site**: [cheery-tiramisu-028ceb.netlify.app](https://cheery-tiramisu-028ceb.netlify.app)

---

## Features

- **Backtest Custom Portfolios**  
  Choose your stocks, allocation percentages, and see how your portfolio would have performed over time.

- **High-Performance Backend**  
  Historical data was initially stored as CSVs, but is now optimized using **Pickle** files, which gave a huge speed boost for data loading and computation.

- **Powerful Data Analysis**  
  The backend uses **Pandas** and **NumPy** to process the large datasets efficiently.

- **Dockerized Backend**  
  The FastAPI backend is fully containerized with **Docker** for reproducibility and easy deployment.

- **Cloud Deployed**  
  - **Backend**: Dockerized FastAPI on **Microsoft Azure App Service**  
  - **Frontend**: Hosted with **Netlify**

---

## Tech Stack

| Layer        | Tech Stack                        |
|--------------|-----------------------------------|
| Frontend     | Next.js, React                    |
| Backend      | FastAPI (Python), Docker          |
| Data Handling| Pandas, NumPy                     |
| Deployment   | Azure App Service, Netlify        |

---

## Future PLans

- Add multiple portfolios
- Add ETFs
- Add portfolio sub-component performance graphs
- Add a DCF page
- Add a Monte Carlo Analysis page
- Interactive chatbot for portfolio descriptions
- User accounts and saved portfolios


