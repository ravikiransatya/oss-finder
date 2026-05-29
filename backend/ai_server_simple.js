const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.AI_PORT || 8001

app.use(cors())
app.use(express.json())

// Mock AI responses for demo
const mockResponses = {
  setup: "Let's set up your project! I'll help you create the basic structure and configuration files.\n\nFirst, let me create a package.json file:",
  structure: "Great! Now let's create the file structure for your project. I'll generate the main directories and files:",
  code: "Perfect! Let's implement the core functionality. I'll write the main application code:",
  features: "Excellent progress! Now let's add some advanced features to make your project stand out:",
  deployment: "Almost done! Let's prepare your project for deployment with proper configuration:"
}

const mockFiles = {
  'package.json': `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "Generated project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}`,
  'index.js': `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`,
  'README.md': `# My Project

A generated project with basic setup.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`
`
}

// AI Chat endpoint with Server-Sent Events
app.get('/api/ai/chat', (req, res) => {
  const { message, project } = req.query
  
  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  // Simulate AI thinking delay
  setTimeout(() => {
    let responseText = ""
    let filesToGenerate = {}
    
    const lowerMessage = message.toLowerCase()
    const projectData = project ? JSON.parse(project) : {}
    const projectTitle = projectData.title || "Your Project"
    
    if (lowerMessage.includes('setup') || lowerMessage.includes('start') || lowerMessage.includes('architecture')) {
      responseText = `🚀 Perfect! Let's set up the architecture for "${projectTitle}". I'll create a modern React Native project structure with all the essential components.\n\nHere's what I'm building for you:\n\n📱 **Mobile App Architecture:**\n• Cross-platform React Native setup\n• Navigation system with React Navigation\n• State management with Redux Toolkit\n• Authentication flow\n• Push notification setup\n• Offline data storage\n\nLet me generate the core files:`
      
      filesToGenerate = {
        'package.json': generateMobilePackageJson(projectTitle),
        'App.js': generateMobileApp(projectTitle),
        'src/navigation/AppNavigator.js': generateNavigation(),
        'src/screens/HomeScreen.js': generateHomeScreen(projectTitle),
        'src/components/Header.js': generateMobileHeader(projectTitle)
      }
    } else if (lowerMessage.includes('structure') || lowerMessage.includes('folder') || lowerMessage.includes('organize')) {
      responseText = `📁 Great! Let's organize the file structure for "${projectTitle}". I'll create a scalable folder structure that follows React Native best practices.\n\n**Project Structure:**\n\n\`\`\`\nsrc/\n├── components/     # Reusable UI components\n├── screens/        # App screens\n├── navigation/     # Navigation setup\n├── services/       # API calls & external services\n├── store/          # Redux store & slices\n├── utils/          # Helper functions\n└── assets/         # Images, fonts, etc.\n\`\`\`\n\nCreating essential components:`
      
      filesToGenerate = {
        'src/components/Button.js': generateMobileButton(),
        'src/components/Input.js': generateMobileInput(),
        'src/screens/LoginScreen.js': generateLoginScreen(),
        'src/services/api.js': generateApiService(),
        'src/store/store.js': generateReduxStore()
      }
    } else if (lowerMessage.includes('auth') || lowerMessage.includes('login') || lowerMessage.includes('user')) {
      responseText = `🔐 Excellent! Let's implement a complete authentication system for "${projectTitle}". I'll create secure login/register flows with JWT tokens and biometric authentication.\n\n**Authentication Features:**\n• Email/Password login\n• Social login (Google, Apple)\n• Biometric authentication\n• JWT token management\n• Secure storage\n• Auto-login on app restart\n\nBuilding auth system:`
      
      filesToGenerate = {
        'src/screens/AuthScreen.js': generateAuthScreen(),
        'src/services/authService.js': generateMobileAuthService(),
        'src/store/authSlice.js': generateAuthSlice(),
        'src/components/BiometricAuth.js': generateBiometricAuth(),
        'src/utils/secureStorage.js': generateSecureStorage()
      }
    } else if (lowerMessage.includes('notification') || lowerMessage.includes('push')) {
      responseText = `🔔 Perfect! Let's implement push notifications for "${projectTitle}". I'll set up Firebase Cloud Messaging with local notifications and background handling.\n\n**Notification Features:**\n• Firebase Cloud Messaging\n• Local notifications\n• Background notification handling\n• Notification permissions\n• Custom notification sounds\n• Deep linking from notifications\n\nSetting up notifications:`
      
      filesToGenerate = {
        'src/services/notificationService.js': generateNotificationService(),
        'src/utils/pushNotifications.js': generatePushNotifications(),
        'firebase.json': generateFirebaseConfig(),
        'src/components/NotificationPermission.js': generateNotificationPermission()
      }
    } else {
      responseText = `💡 I understand you want help with: "${message}"\n\nI'm your intelligent development assistant for "${projectTitle}". Here's what I can help you build:\n\n🏗️ **Architecture & Setup**\n• Project structure and configuration\n• Navigation and routing setup\n• State management implementation\n\n⚡ **Core Features**\n• User authentication & security\n• Push notifications & messaging\n• Offline data storage & sync\n• Camera integration & media handling\n\n🎨 **UI & UX**\n• Responsive component library\n• Custom animations & transitions\n• Theme system & dark mode\n\n🚀 **Advanced Features**\n• Real-time updates & WebSockets\n• Background tasks & scheduling\n• Performance optimization\n• App store deployment\n\nWhat specific feature would you like me to implement first?`
    }

    // Send response in chunks to simulate streaming
    const words = responseText.split(' ')
    let wordIndex = 0
    
    const sendWord = () => {
      if (wordIndex < words.length) {
        const word = words[wordIndex] + (wordIndex < words.length - 1 ? ' ' : '')
        res.write(`data: ${JSON.stringify({ type: 'content', content: word })}\n\n`)
        wordIndex++
        setTimeout(sendWord, 30) // Faster typing speed
      } else {
        // Send files after text is complete
        setTimeout(() => {
          Object.entries(filesToGenerate).forEach(([filename, content]) => {
            res.write(`data: ${JSON.stringify({ type: 'file', filename, content })}\n\n`)
          })
          
          // Send completion signal
          res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          res.end()
        }, 500)
      }
    }
    
    sendWord()
  }, 800)
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'AI Server running', port: PORT })
})

app.listen(PORT, () => {
  console.log(`🤖 AI Server running on port ${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
})

// Mobile-specific code generation functions
function generateMobilePackageJson(projectTitle) {
  const projectName = projectTitle.toLowerCase().replace(/\s+/g, '')
  return `{
  "name": "${projectName}",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "react-native-async-storage": "^1.19.5",
    "react-native-push-notification": "^8.1.1",
    "@react-native-firebase/app": "^18.6.1",
    "@react-native-firebase/messaging": "^18.6.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "metro-react-native-babel-preset": "0.76.8",
    "jest": "^29.2.1"
  }
}`
}

function generateMobileApp(projectTitle) {
  return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
};

export default App;`
}

function generateNavigation() {
  return `import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;`
}

function generateHomeScreen(projectTitle) {
  return `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="${projectTitle}" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to ${projectTitle}</Text>
        <Text style={styles.subtitle}>Your mobile app is ready!</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  button: { backgroundColor: '#6200EE', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default HomeScreen;`
}

function generateMobileHeader(projectTitle) {
  return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({ title }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});

export default Header;`
}

function generateMobileButton() {
  return `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default Button;`
}

function generateMobileInput() {
  return `import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const Input = ({ placeholder, value, onChangeText, secureTextEntry, style }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#999"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginVertical: 5
  }
});

export default Input;`
}

function generateLoginScreen() {
  return `import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Add login logic here
    Alert.alert('Success', 'Login successful!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <Button
        title="Sign In"
        onPress={handleLogin}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: { marginBottom: 15 },
  button: { marginTop: 20 }
});

export default LoginScreen;`
}

function generateApiService() {
  return `const API_BASE_URL = 'https://your-api.com/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = \`\${API_BASE_URL}\${endpoint}\`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
}

export default new ApiService();`
}

function generateReduxStore() {
  return `import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;`
}

function generateAuthScreen() {
  return `import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import BiometricAuth from '../components/BiometricAuth';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = () => {
    // Authentication logic here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {!isLogin && (
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}
      
      <Button
        title={isLogin ? 'Sign In' : 'Sign Up'}
        onPress={handleAuth}
      />
      
      <BiometricAuth />
      
      <View style={styles.switchContainer}>
        <Text>{isLogin ? "Don't have an account?" : "Already have an account?"}</Text>
        <Switch
          value={!isLogin}
          onValueChange={() => setIsLogin(!isLogin)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  switchContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }
});

export default AuthScreen;`
}

function generateMobileAuthService() {
  return `import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

class AuthService {
  constructor() {
    this.initializeGoogleSignIn();
  }

  initializeGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: 'your-web-client-id',
      offlineAccess: true
    });
  }

  async login(email, password) {
    try {
      // API call to login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async googleSignIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return userInfo;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    await AsyncStorage.multiRemove(['authToken', 'user']);
    await GoogleSignin.signOut();
  }

  async getStoredToken() {
    return await AsyncStorage.getItem('authToken');
  }
}

export default new AuthService();`
}

function generateAuthSlice() {
  return `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../services/authService';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(email, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;`
}

function generateBiometricAuth() {
  return `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TouchID from 'react-native-touch-id';

const BiometricAuth = ({ onSuccess }) => {
  const handleBiometricAuth = () => {
    const optionalConfigObject = {
      title: 'Authentication Required',
      imageColor: '#e00606',
      imageErrorColor: '#ff0000',
      sensorDescription: 'Touch sensor',
      sensorErrorDescription: 'Failed',
      cancelText: 'Cancel',
      fallbackLabel: 'Show Passcode',
      unifiedErrors: false,
      passcodeFallback: false
    };

    TouchID.authenticate('Authenticate to access your account', optionalConfigObject)
      .then(success => {
        Alert.alert('Authentication Successful');
        onSuccess && onSuccess();
      })
      .catch(error => {
        Alert.alert('Authentication Failed', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleBiometricAuth}>
        <Text style={styles.buttonText}>Use Biometric Authentication</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 20 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default BiometricAuth;`
}

function generateSecureStorage() {
  return `import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SecureStorage {
  async setItem(key, value) {
    try {
      if (Platform.OS === 'ios') {
        // Use Keychain on iOS
        return await NativeModules.RNKeychainManager.setInternetCredentials(key, key, value);
      } else {
        // Use encrypted storage on Android
        return await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      throw error;
    }
  }

  async getItem(key) {
    try {
      if (Platform.OS === 'ios') {
        const credentials = await NativeModules.RNKeychainManager.getInternetCredentials(key);
        return credentials ? credentials.password : null;
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      if (Platform.OS === 'ios') {
        return await NativeModules.RNKeychainManager.resetInternetCredentials(key);
      } else {
        return await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
      throw error;
    }
  }
}

export default new SecureStorage();`
}

function generateNotificationService() {
  return `import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannels();
  }

  configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  createDefaultChannels() {
    PushNotification.createChannel(
      {
        channelId: 'default-channel',
        channelName: 'Default Channel',
        channelDescription: 'A default channel for notifications',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(\`createChannel returned '\${created}'\`)
    );
  }

  async requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return true;
    }
    return false;
  }

  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  showLocalNotification(title, message, data = {}) {
    PushNotification.localNotification({
      channelId: 'default-channel',
      title,
      message,
      userInfo: data,
      playSound: true,
      soundName: 'default',
    });
  }
}

export default new NotificationService();`
}

function generatePushNotifications() {
  return `import messaging from '@react-native-firebase/messaging';
import NotificationService from '../services/notificationService';

class PushNotifications {
  async initialize() {
    // Request permission
    const hasPermission = await NotificationService.requestPermission();
    
    if (hasPermission) {
      // Get FCM token
      const token = await NotificationService.getFCMToken();
      
      // Send token to your server
      if (token) {
        await this.sendTokenToServer(token);
      }
      
      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        await this.sendTokenToServer(newToken);
      });
      
      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message:', remoteMessage);
        
        if (remoteMessage.notification) {
          NotificationService.showLocalNotification(
            remoteMessage.notification.title,
            remoteMessage.notification.body,
            remoteMessage.data
          );
        }
      });
      
      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message:', remoteMessage);
      });
    }
  }

  async sendTokenToServer(token) {
    try {
      // Send token to your backend server
      await fetch('/api/notifications/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }
}

export default new PushNotifications();`
}

function generateFirebaseConfig() {
  return `{
  "react-native": {
    "android_app_id": "your-android-app-id",
    "ios_app_id": "your-ios-app-id"
  },
  "project_info": {
    "project_number": "your-project-number",
    "project_id": "your-project-id"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "your-app-id",
        "android_client_info": {
          "package_name": "com.yourapp.package"
        }
      },
      "oauth_client": [
        {
          "client_id": "your-client-id",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "your-api-key"
        }
      ]
    }
  ]
}`
}

function generateNotificationPermission() {
  return `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const NotificationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      setPermissionStatus(result);
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      setPermissionStatus(result);
      
      if (result === RESULTS.GRANTED) {
        Alert.alert('Success', 'Notification permission granted!');
      } else {
        Alert.alert('Permission Denied', 'Notification permission was denied.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  if (permissionStatus === RESULTS.GRANTED) {
    return null; // Don't show if permission is already granted
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Notifications</Text>
      <Text style={styles.description}>
        Get notified about important updates and messages
      </Text>
      <TouchableOpacity style={styles.button} onPress={requestNotificationPermission}>
        <Text style={styles.buttonText}>Allow Notifications</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10, margin: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 14, color: '#666', marginBottom: 15 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default NotificationPermission;`
}