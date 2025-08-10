# Idea Trade Pro

A modern React application for trading idea management and journaling. Built with React, Vite, Tailwind CSS, and Framer Motion.

## Features

- **Account & Risk Management**: Configure balance, risk percentage, and trading pair settings
- **Idea Builder**: Create and save trading ideas with entry, stop loss, and take profit levels
- **Position Sizing Calculator**: Automatic lot size calculation based on risk parameters
- **News Guard**: Track high-impact news events and avoid trading during volatile periods
- **Trading Journal**: View and filter all saved trading ideas
- **CSV Export**: Export your trading journal to CSV format
- **Local Storage**: All data is saved locally in your browser

## Live Demo

Visit the live application: [Idea Trade Pro](https://your-username.github.io/Ideatrade-v1/)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/Ideatrade-v1.git
cd Ideatrade-v1
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
```

## Deployment

This project is configured for automatic deployment to GitHub Pages. The deployment workflow will:

1. Build the project when you push to the `main` branch
2. Deploy the built files to GitHub Pages
3. Make your app available at `https://your-username.github.io/Ideatrade-v1/`

### Manual Deployment Steps

1. Create a new repository on GitHub named `Ideatrade-v1`
2. Push your code to the repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/Ideatrade-v1.git
git push -u origin main
```

3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

4. The GitHub Actions workflow will automatically build and deploy your app.

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **GitHub Actions** - CI/CD pipeline
- **GitHub Pages** - Hosting

## License

MIT License
