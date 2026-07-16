import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useIncomingCall } from 'rn-incoming-call-nitro';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'danger';
}

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'danger' = 'info') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [{ timestamp: timeStr, message, type }, ...prev]);
  };

  const { isActive, callUUID, show, dismiss, backToApp } = useIncomingCall({
    onAnswer: (payload) => {
      addLog(`📞 Call Answered! UUID: ${payload.callUUID}`, 'success');
      Alert.alert(
        'Call Answered',
        `UUID: ${payload.callUUID}\nPayload: ${JSON.stringify(payload.payload)}`
      );
      // Bring the app back to foreground (optional)
      backToApp();
    },
    onEndCall: (payload) => {
      addLog(`❌ Call Ended/Declined (Action: ${payload.endAction})`, 'danger');
      Alert.alert('Call Declined', `UUID: ${payload.callUUID}\nAction: ${payload.endAction}`);
    },
  });

  useEffect(() => {
    addLog('IncomingCall module initialized using custom hooks', 'info');

    const requestPermissions = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (!hasPermission) {
          addLog('Requesting notification permission...', 'info');
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            addLog('Notification permission granted', 'success');
          } else {
            addLog('Notification permission denied', 'danger');
          }
        }
      }
    };
    requestPermissions();
  }, []);

  const triggerIncomingCall = () => {
    const uuid = Math.random().toString(36).substring(2, 9);
    addLog(`Triggering incoming call... (UUID: ${uuid})`, 'info');

    show(
      uuid,
      'https://i.pravatar.cc/300', // Beautiful random avatar url
      15000, // Timeout after 15 seconds
      {
        channelId: 'incoming_call_channel',
        channelName: 'Incoming Calls',
        notificationIcon: 'ic_launcher', // fallback to app icon
        notificationTitle: 'Kiattisak Jomram',
        notificationBody: 'Incoming video call...',
        answerText: 'Accept Call',
        declineText: 'Decline',
        isVideo: true,
        notificationColor: 'colorAccent', // refers to colors.xml resource
        payload: {
          callerId: 'user_kiattisak_123',
          chatRoom: 'room_call_abc',
        },
      }
    );
  };

  const cancelCall = () => {
    addLog('Manually dismissing notification', 'info');
    dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incoming Call</Text>
        <Text style={styles.headerSubtitle}>Nitro Module Interactive Test App</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trigger Controls</Text>
        <Text style={styles.cardDesc}>
          Simulate a background fullscreen incoming call on Android. Test triggers, sounds, timeouts, and callbacks.
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Hook State:</Text>
          <Text
            style={[
              styles.statusText,
              isActive ? styles.statusActive : styles.statusInactive,
            ]}
          >
            {isActive ? `📞 ACTIVE (UUID: ${callUUID})` : '💤 INACTIVE'}
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={triggerIncomingCall}>
          <Text style={styles.primaryButtonText}>Show Incoming Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={cancelCall}>
          <Text style={styles.secondaryButtonText}>Dismiss Notification</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.logCard]}>
        <View style={styles.logHeader}>
          <Text style={styles.cardTitle}>Live Event Logs</Text>
          <TouchableOpacity onPress={() => setLogs([])}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyLog}>
            <Text style={styles.emptyLogText}>No events logged yet. Trigger a call to start testing.</Text>
          </View>
        ) : (
          <ScrollView style={styles.logList} contentContainerStyle={{ paddingBottom: 10 }}>
            {logs.map((log, idx) => (
              <View key={idx} style={styles.logEntry}>
                <Text style={styles.logTime}>{log.timestamp}</Text>
                <Text
                  style={[
                    styles.logMsg,
                    log.type === 'success' && styles.logSuccess,
                    log.type === 'danger' && styles.logDanger,
                  ]}
                >
                  {log.message}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1017',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#808290',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#161722',
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#232536',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#808290',
    lineHeight: 20,
    marginBottom: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1D2A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D2F44',
  },
  statusLabel: {
    fontSize: 14,
    color: '#808290',
    marginRight: 8,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusActive: {
    color: '#4CAF50',
  },
  statusInactive: {
    color: '#808290',
  },
  primaryButton: {
    backgroundColor: '#6A1B9A',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F4156',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1D2DC',
  },
  logCard: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    color: '#8A4FFF',
    fontWeight: '600',
  },
  emptyLog: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLogText: {
    fontSize: 14,
    color: '#5C5D6E',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  logList: {
    flex: 1,
  },
  logEntry: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#202232',
  },
  logTime: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#5C5D6E',
    marginRight: 12,
    alignSelf: 'center',
  },
  logMsg: {
    fontSize: 13,
    color: '#D1D2DC',
    flex: 1,
  },
  logSuccess: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  logDanger: {
    color: '#F44336',
    fontWeight: '600',
  },
});

