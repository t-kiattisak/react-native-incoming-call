# Custom React Native UI

`react-native-incoming-call` allows you to completely customize the full-screen overlay by embedding your own React Native component inside the native Android Activity. 

This is done by registering a component with the React Native `AppRegistry` and passing its registered name to the `mainComponent` field inside options.

---

## 1. Create your Custom Screen Component

Design the React Native view that will serve as the incoming call screen. The component will receive initialization parameters from the native intent as direct React props.

Create `CustomCallScreen.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { answer, decline } from 'react-native-incoming-call';

interface CustomCallScreenProps {
  uuid: string;
  name: string;
  avatar?: string;
  info?: string;
  payload?: string; // Serialized JSON string of the payload object
}

export default function CustomCallScreen(props: CustomCallScreenProps) {
  const parsedPayload = props.payload ? JSON.parse(props.payload) : {};

  const handleAnswer = () => {
    answer(props.uuid, props.payload);
  };

  const handleDecline = () => {
    decline(props.uuid, props.payload);
  };

  return (
    <View style={styles.container}>
      {props.avatar && (
        <Image source={{ uri: props.avatar }} style={styles.avatar} />
      )}
      <Text style={styles.title}>{props.name}</Text>
      <Text style={styles.subtitle}>{props.info || 'Incoming Call...'}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
          <Text style={styles.buttonText}>Answer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    marginTop: 8,
    marginBottom: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  declineButton: {
    backgroundColor: '#FF5E5E',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  answerButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
```

---

## 2. Register the Component

You must register this component globally in your entry point file (usually `index.js` or `App.tsx` at the root of your project) so that the Android native system can resolve it.

```typescript
import { AppRegistry } from 'react-native';
import App from './App';
import CustomCallScreen from './CustomCallScreen';

// Register the main application
AppRegistry.registerComponent('main', () => App);

// Register the custom call overlay component
AppRegistry.registerComponent('MyCustomCallUI', () => CustomCallScreen);
```

---

## 3. Trigger the Call with the Custom UI Name

When invoking `show`, pass the exact registered component string as the `mainComponent` option:

```typescript
import { show } from 'react-native-incoming-call';

show(
  uuid,
  avatarUrl,
  15000, // Timeout after 15s
  {
    channelId: 'incoming_call_channel',
    channelName: 'Incoming Calls',
    notificationIcon: 'ic_launcher',
    notificationTitle: 'Kiattisak Jomram',
    notificationBody: 'Incoming video call...',
    answerText: 'Accept Call',
    declineText: 'Decline',
    // Specify the custom component name registered in AppRegistry
    mainComponent: 'MyCustomCallUI', 
    isVideo: true,
    payload: {
      callType: 'video',
    }
  }
);
```

When the notification displays, Android will spin up a fullscreen activity and mount your `MyCustomCallUI` component inside it, passing all caller parameters and custom payloads directly as component props.
