# Nutlogger Native
Built with React Native, Nutlogger Native utilizes camera vision to help users identify the nutrition information in their day to day diets.

![Watch The Video](https://media.giphy.com/media/9AIBaPKJRgorXJ5Rjn/giphy.gif)

## Set Up Guide
1. Clone this repository
2. Clone the [Nutserver Repository](https://github.com/callmekungfu/nutserver)
3. Get the necessary API keys from [Google Console](https://console.cloud.google.com/apis/credentials), and [Nutritionix](https://www.nutritionix.com/business/api). (Both are free for limited users)
4. Install Expo-cli with `npm i -g expo-cli`
5. Install all dependencies by running `npm install` in this repository and the nutserver repository
6. Run `npm start` inside this repository and the nutserver repository

*Note: please create a `.env` file inside the nutserver directory with the following config*
```
    GOOGLE_API_KEY="ADD YOUR GOOGLE VISION API KEY"
    NUTRITION_APP_ID="ADD YOUR NUTRITIONIX APP ID"
    NUTRITION_API_KEY="ADD YOUR NUTRITIONIX KEY"
```

# Technologies Used Directly
- React
- React Native
- Expo Framework & Service