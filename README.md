# ☁️ CloudFrost

Welcome to **CloudFrost**, your go-to platform for free subdomains and easy DNS management!  
We believe in a stress-free experience for anyone looking to establish an online presence.  
Feel free to explore, contribute, and help make CloudFrost even better!

## 🌟 Key Features
- **Free Subdomains**  
- **Google OAuth Integration** for quick sign-in  
- **DNS Management** supporting up to 6 NS records  
- **Contact Form & Logging** via Webhooks for easy support  
- **Open Source** with a commitment to community growth  

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express**: A fast, unopinionated web framework for Node.js.
- **Mongoose**: Easy database interactions with mongodb.
- **EJS**: Templating engine for rendering dynamic views.
- **express-rate-limit**: Middleware for rate limiting requests.
- **passportjs**: Easy and seamless authentication.

## 🚀 Getting Started
1. **Clone this Repository**  
   ```bash
   git clone https://github.com/KartikJain14/CloudFrost.git
   cd CloudFrost

2. **Install Dependencies**
    ```bash
    npm install

3. **Configure Environment**
    - Make a copy of `.env.example` and rename it to `.env`.
    - Update values like MongoDB URI, Cloudflare & Google Credentials, Webhook (to recieve form requests), etc.

4. **Run in Development**
    ```bash
    npm run dev
    ```
    Access the project at `http://localhost:3000`.

## 🤝 Contributing
We love contributions from the community! Check out these steps:
1. **Fork this repo** and create a branch named after your feature or fix.
2. **Implement your changes**, keeping our coding style and best practices in mind.
3. **Submit a pull request**, describing your updates in detail.
4. Engage in the review process and address any feedback.

### Contribution Ideas
- **Documentation** improvements
- **Refactoring** existing code
- **Bug Fixes** or new tests
- **Feature Requests** that enhance the user experience

## 📦 Deployment
We recommend services like Vercel, Netlify, or Heroku. Pick your favorite, configure environment variables (e.g., `MONGO_URI`), and deploy!

## 🙏 Thank You
Thank you for checking out **CloudFrost**! Whether you’re opening an issue, submitting a PR, or just exploring, we appreciate your support.

## 📃 License
Project is under the ISC License. Feel free to use it, modify it, and share it with others to keep the open-source spirit alive! 